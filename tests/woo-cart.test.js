const { test } = require('node:test');
const assert = require('node:assert/strict');
const WooCart = require('../woo-cart');
const WooCatalog = require('../woo-catalog');

const emptyCart = () => ({ items: [], items_count: 0, coupons: [],
  totals: { total_items: '0', total_price: '0', total_shipping: null, currency_code: 'INR', currency_minor_unit: 2 } });
const reply = (data, token = 'guest.a', status = 200) => ({ ok: status < 400, status,
  headers: new Headers(token ? { 'Cart-Token': token } : {}), json: async () => data });
function storage() {
  const entries = new Map();
  return { getItem: key => entries.get(key), setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
}

test('selects the exact size variation, rejects missing selections, and disables unpriced sizes', () => {
  const parent = WooCatalog.normalize({ id: 42613, type: 'variable',
    attributes: [{ name: 'size', taxonomy: 'pa_size', has_variations: true,
      terms: [{ name: 'XL', slug: 'size-xl' }, { name: 'M', slug: 'size-m' }] }],
    variations: [{ id: 43214, attributes: [{ name: 'size', value: 'size-xl' }] },
      { id: 43212, attributes: [{ name: 'size', value: 'size-m' }] }] }, [], 0);
  const variants = [
    { id: '43214', price: 1050, purchasable: true, inStock: true },
    { id: '43212', price: null, purchasable: false, inStock: true }
  ];
  assert.equal(WooCart.findVariation(parent, variants, {}), undefined);
  assert.equal(WooCart.findVariation(parent, variants, { pa_size: 'size-xl' }).id, '43214');
  assert.equal(WooCart.optionAvailable(parent, variants, {}, 'pa_size', 'size-m'), false);
  assert.equal(WooCart.optionAvailable(parent, variants, {}, 'pa_size', 'size-xl'), true);
  assert.equal(WooCart.optionAvailable(parent, [{ ...variants[0], inStock: false }], {}, 'pa_size', 'size-xl'), false);
});

test('matches multiple attributes and wildcard variations without guessing a missing option', () => {
  const parent = { optionAttributes: [{ name: 'size', key: 'pa_size' }, { name: 'Colour', key: 'pa_colour' }],
    variationOptions: [{ id: 1, attributes: [{ name: 'size', value: '' }, { name: 'Colour', value: 'blue' }] }] };
  const variant = { id: 1, purchasable: true, inStock: true };
  assert.equal(WooCart.findVariation(parent, [variant], { pa_size: 's' }), undefined);
  assert.equal(WooCart.findVariation(parent, [variant], { pa_size: 's', pa_colour: 'blue' }), variant);
  assert.equal(WooCart.optionAvailable(parent, [variant], { pa_colour: 'red' }, 'pa_size', 's'), false);
});

test('serializes writes, rotates guest tokens, and restores server cart through browser storage', async () => {
  const saved = storage(), calls = [];
  const data = emptyCart();
  let latest = 'guest.initial';
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    assert.equal(options.cache, 'no-store');
    if (options.method === 'POST') {
      assert.equal(options.headers['Cart-Token'], latest);
      data.items_count += 1;
      latest = 'guest.' + data.items_count;
      data.totals.total_price = String(data.items_count * 105000);
    }
    return reply(structuredClone(data), latest);
  };
  const client = WooCart.create({ fetcher, storage: saved });
  const first = client.mutate('add-item', { id: 43214, quantity: 1 });
  const second = client.mutate('add-item', { id: 43211, quantity: 1 });
  await Promise.all([first, second]);
  assert.equal(client.data.items_count, 2);
  assert.equal(client.data.totals.total_price, '210000');
  assert.equal(calls.filter(c => c.options.method === 'POST').length, 2);
  assert.equal(client.busy, false);
  const reloaded = WooCart.create({ fetcher, storage: saved });
  await reloaded.read();
  assert.equal(calls.at(-1).options.headers['Cart-Token'], latest);
  assert.equal(reloaded.data.items_count, 2);
});

test('failed mutation is not retried and a re-read reconciles any successful upstream write', async () => {
  let writes = 0, reads = 0;
  const data = emptyCart();
  const client = WooCart.create({ fetcher: async (_url, options) => {
    if (options.method === 'POST') { writes++; data.items_count = 1; throw new Error('Connection lost'); }
    reads++;
    return reply(structuredClone(data));
  } });
  await assert.rejects(client.mutate('add-item', { id: 1, quantity: 1 }), /Connection lost/);
  assert.equal(writes, 1);
  assert.equal(reads, 2);
  assert.equal(client.data.items_count, 1);
  assert.equal(client.error, 'Connection lost');
  assert.equal(client.busy, false);
});

test('expired session is replaced only on a read; different clients do not share guest tokens', async () => {
  const saved = storage(); saved.setItem('aartyz.woocommerce.guest-cart', 'expired');
  const calls = [];
  const client = WooCart.create({ storage: saved, fetcher: async (_url, options) => {
    calls.push(options.headers['Cart-Token']);
    return options.headers['Cart-Token'] === 'expired' ? reply({ message: 'Expired' }, null, 401) : reply(emptyCart(), 'new.session');
  } });
  await client.read();
  assert.deepEqual(calls, ['expired', undefined]);
  assert.equal(client.sessionReset, true);
  const other = WooCart.create({ storage: storage(), fetcher: async (_url, options) => {
    assert.equal(options.headers['Cart-Token'], undefined);
    return reply(emptyCart(), 'other.session');
  } });
  await other.read();
});

test('coupon errors preserve authoritative totals, and uncalculated shipping is not free', async () => {
  const data = emptyCart(); data.totals.total_price = '105000';
  const client = WooCart.create({ fetcher: async (_url, options) => options.method === 'POST'
    ? reply({ message: 'Coupon does not exist' }, null, 400) : reply(data) });
  await assert.rejects(client.mutate('apply-coupon', { code: 'invalid' }), /Coupon does not exist/);
  assert.equal(client.data.totals.total_price, '105000');
  assert.equal(WooCart.format(null, data.totals), 'Calculated at checkout');
  assert.equal(WooCart.format('105000', data.totals), '₹1,050.00');
});
