/* Guest cart only: WooCommerce owns prices, stock checks, coupons and totals. */
(function (root) {
  'use strict';
  function format(amount, currency) {
    if (amount === null || amount === undefined) return 'Calculated at checkout';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency.currency_code || 'INR' })
      .format(Number(amount) / 10 ** (currency.currency_minor_unit ?? 2));
  }

  function matches(product, variation, selected) {
    const mapping = product.variationOptions.find(v => Number(v.id) === Number(variation.id));
    if (!mapping) return false;
    return product.optionAttributes.every(attribute => {
      const specification = mapping.attributes.find(a => a.name === attribute.name || a.name === attribute.key);
      // Empty attribute value means any term (WooCommerce wildcard variation).
      return selected[attribute.key] && specification &&
        (!specification.value || specification.value === selected[attribute.key]);
    });
  }

  function findVariation(product, variations, selected) {
    return variations.find(variation => matches(product, variation, selected) && variation.purchasable && variation.inStock) ||
      variations.find(variation => matches(product, variation, selected));
  }

  function optionAvailable(product, variations, selected, key, value) {
    const choices = { ...selected, [key]: value };
    return variations.some(variation => {
      if (!variation.purchasable || !variation.inStock) return false;
      const mapping = product.variationOptions.find(v => Number(v.id) === Number(variation.id));
      return mapping && product.optionAttributes.every(attribute => {
        if (!choices[attribute.key]) return true;
        const specification = mapping.attributes.find(a => a.name === attribute.name || a.name === attribute.key);
        return specification && (!specification.value || specification.value === choices[attribute.key]);
      });
    });
  }

  function create({ fetcher = fetch, storage = null, onChange = () => {} } = {}) {
    const storageKey = 'aartyz.woocommerce.guest-cart';
    let token = '';
    try { token = storage?.getItem(storageKey) || ''; } catch (_) { /* Private browsing may deny storage. */ }
    let queue = Promise.resolve();
    let pending = 0;
    const client = { data: null, error: '', busy: false, sessionReset: false };
    function saveToken(value) {
      token = value;
      try { if (token) storage?.setItem(storageKey, token); else storage?.removeItem(storageKey); } catch (_) {}
    }
    function notify() { client.busy = pending > 0; onChange(client); }
    async function request(action = '', body) {
      const response = await fetcher('/api/store/cart' + (action ? '/' + action : ''), {
        method: body === undefined ? 'GET' : 'POST', credentials: 'omit', cache: 'no-store',
        headers: { ...(token ? { 'Cart-Token': token } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30000)
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.data?.cart) client.data = data.data.cart;
        const error = new Error(data.message || data.error || 'The cart could not be updated.');
        error.status = response.status;
        throw error;
      }
      if (!Array.isArray(data.items) || !data.totals) throw new Error('Unexpected cart response.');
      const nextToken = response.headers.get('Cart-Token');
      if (nextToken) saveToken(nextToken);
      if (!token) throw new Error('WooCommerce did not provide a guest cart session.');
      client.data = data;
      return data;
    }
    function enqueue(work) {
      pending++;
      notify();
      const result = queue.then(async () => {
        client.error = '';
        try { return await work(); }
        catch (error) { client.error = error.message; throw error; }
        finally { pending--; notify(); }
      });
      queue = result.catch(() => {});
      return result;
    }
    client.read = () => enqueue(async () => {
      try { return await request(); }
      catch (error) {
        if (error.status !== 401 && error.status !== 403) throw error;
        saveToken('');
        client.sessionReset = true;
        client.data = null;
        return request();
      }
    });
    client.mutate = (action, body) => enqueue(async () => {
      if (!token) await request();
      try { return await request(action, body); }
      catch (error) {
        // A network failure may follow a successful write. Re-read; never replay the mutation.
        try { await request(); } catch (_) {}
        throw error;
      }
    });
    client.checkout = body => enqueue(async () => {
      if (!token) throw new Error('Your cart session is missing. Reload the cart before checking out.');
      const response = await fetcher('/api/store/checkout', {
        method:'POST', credentials:'omit', cache:'no-store',
        headers:{'Content-Type':'application/json','Cart-Token':token},
        body:JSON.stringify(body), signal:AbortSignal.timeout(30000)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Order submission could not be confirmed.');
      return data;
    });
    return client;
  }

  async function variations(productId, fetcher = fetch) {
    const result = [];
    let pages = 1;
    for (let page = 1; page <= pages; page++) {
      const response = await fetcher(`/api/catalog/products?type=variation&parent=${Number(productId)}&per_page=100&page=${page}`, {
        credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(30000)
      });
      if (!response.ok) throw new Error('Size availability could not be loaded. Please try again.');
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Unexpected variation response.');
      pages = Number(response.headers.get('X-WP-TotalPages')) || 1;
      result.push(...rows);
    }
    return result;
  }
  const api = { create, format, matches, findVariation, optionAvailable, variations };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WooCart = api;
})(typeof window !== 'undefined' ? window : globalThis);
