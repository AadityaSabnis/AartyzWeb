import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const store = new URL(process.env.AARTYZ_STORE_URL ?? 'https://aartyz.in');
if (store.protocol !== 'https:' || store.href !== store.origin + '/') {
  throw new Error('AARTYZ_STORE_URL must be an HTTPS origin.');
}
const storefront = process.env.AARTYZ_PUBLIC_ORIGIN
  ? new URL(process.env.AARTYZ_PUBLIC_ORIGIN) : null;
if (storefront && (storefront.protocol !== 'https:' || storefront.href !== storefront.origin + '/')) {
  throw new Error('AARTYZ_PUBLIC_ORIGIN must be an HTTPS origin.');
}
const checkoutEnabled = process.env.AARTYZ_CHECKOUT_ENABLED === '1';
if (checkoutEnabled && (!storefront || !process.env.AARTYZ_STORE_URL || storefront.origin === store.origin)) {
  throw new Error('Checkout requires explicit, separate storefront and WooCommerce HTTPS origins.');
}

const shopPages = new Set([
  '/visit', '/corporate-gifting', '/bulk-quote', '/made-to-order', '/shopping-help',
  '/from-instagram', '/about-us', '/eco-printing', '/edits/hand-block-printed-sarees',
  '/edits/hand-painted-sarees', '/edits/diwali-26',
]);
const types = { html: 'text/html', css: 'text/css', js: 'text/javascript',
  jpg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml' };
const files = new Set([
  '/index.html', '/style.css', '/script.js', '/woo-catalog.js', '/woo-cart.js',
  '/woo-checkout.js', '/product-placeholder.svg', '/assets/aartyz-logo.png',
  '/assets/workshop-eco.jpg', '/assets/workshop-artisan.jpg', '/assets/workshop-founder.jpg',
  '/assets/banner-indian-craft.jpg', '/assets/banner-slow-made.jpg',
  '/assets/banner-block-print-sarees.jpg', '/assets/banner-handpainted-sarees.jpg',
  '/assets/banner-new-arrivals.jpg',
]);
const queryFields = new Set(['per_page', 'page', 'orderby', 'order', '_fields', 'type', 'parent', 'slug']);
const cartFields = {
  'add-item': ['id', 'quantity', 'variation'],
  'update-item': ['key', 'quantity'],
  'remove-item': ['key'],
  'apply-coupon': ['code'],
  'remove-coupon': ['code'],
  'update-customer': ['billing_address', 'shipping_address'],
  'select-shipping-rate': ['package_id', 'rate_id'],
};
const addressFields = ['first_name', 'last_name', 'address_1', 'address_2',
  'city', 'state', 'postcode', 'country', 'email', 'phone'];

const matches = (value, pattern) => typeof value === 'string' && pattern.test(value);
const onlyFields = (value, fields) => value && typeof value === 'object'
  && !Array.isArray(value) && Object.keys(value).every(key => fields.includes(key));

function validAddress(address, billing) {
  return onlyFields(address, addressFields)
    && Object.values(address).every(value => typeof value === 'string' && value.length <= 250)
    && ['first_name', 'last_name', 'address_1', 'city', 'state'].every(field => address[field]?.trim())
    && address.country === 'IN' && matches(address.postcode, /^[1-9][0-9]{5}$/)
    && (!billing || (matches(address.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      && matches(address.phone, /^[+0-9 ()-]{8,20}$/)));
}

function validCartBody(action, body) {
  if (!onlyFields(body, cartFields[action])) return false;
  switch (action) {
    case 'add-item':
      return Number.isSafeInteger(body.id) && body.id > 0 && quantity(body.quantity)
        && (!Object.hasOwn(body, 'variation') || (Array.isArray(body.variation)
          && body.variation.length <= 20 && body.variation.every(item =>
            onlyFields(item, ['attribute', 'value'])
            && [item.attribute, item.value].every(value => typeof value === 'string' && value.length > 0 && value.length <= 200))));
    case 'update-item':
      return matches(body.key, /^[a-zA-Z0-9_-]{1,128}$/) && quantity(body.quantity);
    case 'remove-item':
      return matches(body.key, /^[a-zA-Z0-9_-]{1,128}$/);
    case 'apply-coupon':
    case 'remove-coupon':
      return typeof body.code === 'string' && body.code.trim().length > 0 && body.code.trim().length <= 100;
    case 'update-customer':
      return validAddress(body.billing_address, true) && validAddress(body.shipping_address, false);
    case 'select-shipping-rate':
      return Number.isSafeInteger(body.package_id) && body.package_id >= 0
        && matches(body.rate_id, /^[A-Za-z0-9_:.-]{1,150}$/);
  }
}

function quantity(value) {
  return Number.isInteger(value) && value >= 1 && value <= 9999;
}

function validCheckout(body) {
  return onlyFields(body, ['billing_address', 'shipping_address', 'payment_method', 'expected_total'])
    && validAddress(body.billing_address, true) && validAddress(body.shipping_address, false)
    && body.payment_method === 'payubiz' && matches(body.expected_total, /^[0-9]{1,12}$/);
}

function json(response, status, data, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
    ...headers,
  });
  response.end(JSON.stringify(data));
}

async function readBody(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 8192) throw new Error('Invalid request size');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function storeRequest(resource, { params, token, body, cart = false }) {
  const url = new URL('/wp-json/wc/store/v1/' + resource, store);
  if (params) url.search = params.toString();
  if (cart) url.searchParams.set('_aartyz_request', randomUUID());
  const headers = { Accept: 'application/json', 'Cache-Control': 'no-cache, no-store' };
  if (token) headers['Cart-Token'] = token;
  if (body) headers['Content-Type'] = 'application/json';

  const upstream = await fetch(url, {
    headers, method: body ? 'POST' : 'GET', body: body && JSON.stringify(body),
    redirect: 'error', signal: AbortSignal.timeout(25000),
  });
  return { upstream, data: await upstream.json() };
}

async function proxy(response, resource, options = {}) {
  try {
    const { upstream, data } = await storeRequest(resource, options);
    const out = {};
    if (options.cart) {
      out.Vary = 'Cart-Token';
      const nextToken = upstream.headers.get('Cart-Token');
      if (matches(nextToken, /^[A-Za-z0-9._-]{1,4096}$/)) out['Cart-Token'] = nextToken;
    } else {
      const id = resource.match(/^products\/([1-9][0-9]{0,9})$/)?.[1];
      if (!upstream.ok || (id ? String(data?.id) !== id : !Array.isArray(data))) {
        if (id && upstream.status === 404) return json(response, 404, { error: 'Product not found.' });
        throw new Error('Unexpected WooCommerce catalogue response');
      }
      for (const name of ['X-WP-Total', 'X-WP-TotalPages']) {
        const value = upstream.headers.get(name);
        if (matches(value, /^[0-9]+$/)) out[name] = value;
      }
    }
    return json(response, upstream.status, data, out);
  } catch {
    return json(response, 502, { message: 'The WooCommerce store is temporarily unavailable.' });
  }
}

async function checkoutOrder(response, token, body) {
  const { expected_total: expectedTotal, ...order } = body;
  const { upstream, data } = await storeRequest('cart', { token, cart: true });
  if (!upstream.ok || !data?.items?.length || data.totals?.currency_code !== 'INR'
    || data.totals.total_price !== expectedTotal || !data.payment_methods?.includes('payubiz')) {
    return json(response, 409, { message: 'Your cart or payment options changed. Review checkout again.' });
  }
  return proxy(response, 'checkout', { token, body: order, cart: true });
}

async function route(request, response) {
  const url = new URL(request.url, 'http://localhost');
  const path = url.pathname;
  const page = path.replace(/\/$/, '');
  const read = request.method === 'GET' || request.method === 'HEAD';

  if (request.method === 'GET' && path === '/api/store/config') {
    return json(response, 200, { checkout_enabled: checkoutEnabled, store_url: store.origin });
  }
  if (request.method === 'GET' && /^\/api\/catalog\/products(?:\/categories|\/[1-9][0-9]{0,9})?$/.test(path)) {
    const params = new URLSearchParams([...url.searchParams].filter(([key]) => queryFields.has(key)));
    return proxy(response, path.slice('/api/catalog/'.length), { params });
  }
  const checkout = request.method === 'POST' && path === '/api/store/checkout' && !url.search;
  if (checkout && !checkoutEnabled) {
    return json(response, 503, { message: 'Payment submission is unavailable on this storefront.' });
  }
  const action = path.startsWith('/api/store/cart/') ? path.slice('/api/store/cart/'.length) : null;
  const cartWrite = request.method === 'POST' && Object.hasOwn(cartFields, action) && !url.search;
  if ((request.method === 'GET' && path === '/api/store/cart') || cartWrite || checkout) {
    const origin = request.headers.origin;
    if (request.headers['sec-fetch-site'] === 'cross-site' || (origin && origin !== storefront?.origin)) {
      return json(response, 403, { message: 'Cross-origin cart requests are not allowed.' });
    }
    const token = request.headers['cart-token'];
    if (token !== undefined && !matches(token, /^[A-Za-z0-9._-]{1,4096}$/)) {
      return json(response, 400, { message: 'Invalid guest cart session.' });
    }
    if (!cartWrite && !checkout) return proxy(response, 'cart', { token, cart: true });
    if (!token) return json(response, 401, { message: 'Load your guest cart before making changes.' });
    if (request.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json'
      || Number(request.headers['content-length']) > 8192) {
      return json(response, 400, { message: 'Invalid cart request.' });
    }
    let body;
    try { body = await readBody(request); } catch {
      return json(response, 400, { message: 'Invalid cart request.' });
    }
    if (!(checkout ? validCheckout(body) : validCartBody(action, body))) {
      return json(response, 400, { message: 'Invalid cart request.' });
    }
    if (checkout) return checkoutOrder(response, token, body);
    return proxy(response, 'cart/' + action, { token, body, cart: true });
  }

  if (read && page === '/gift-accessories') {
    response.writeHead(308, { Location: '/corporate-gifting/' + url.search }).end();
    return;
  }
  const productPage = /^\/(?:product\/[a-zA-Z0-9%-]{1,200}|products\/[1-9][0-9]{0,9})\/?$/.test(path);
  const file = path === '/' || shopPages.has(page) || productPage ? '/index.html' : path;
  if (!read || !files.has(file)) return json(response, 404, { message: 'Page not found.' });
  const data = await readFile(new URL('.' + file, import.meta.url));
  response.writeHead(200, {
    'Content-Type': types[file.split('.').at(-1)],
    'Content-Length': data.length,
    'Cache-Control': 'no-cache',
  });
  response.end(request.method === 'HEAD' ? undefined : data);
}

createServer((request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('X-Robots-Tag', 'noindex');
  route(request, response).catch(() => {
    if (!response.headersSent) json(response, 500, { message: 'The storefront is temporarily unavailable.' });
    else response.end();
  });
}).listen(Number(process.env.PORT ?? 8768), process.env.AARTYZ_BIND ?? '0.0.0.0');
