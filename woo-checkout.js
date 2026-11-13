(function(root) {
  'use strict';
  function address(values) {
    const shipping = {};
    for (const field of ['first_name','last_name','address_1','address_2','city','state','postcode']) {
      shipping[field] = String(values[field] || '').trim();
    }
    shipping.country = 'IN';
    return { shipping_address: shipping, billing_address: { ...shipping,
      email: String(values.email || '').trim(), phone: String(values.phone || '').trim() } };
  }
  function fingerprint(cart) {
    return JSON.stringify({ items: cart.items.map(i=>[i.key,i.quantity]), totals: cart.totals,
      rates: (cart.shipping_rates || []).map(p=>[p.package_id,p.shipping_rates.filter(r=>r.selected).map(r=>r.rate_id)]) });
  }
  function redirect(value, storeURL) {
    try {
      const target = new URL(value);
      const store = new URL(storeURL);
      if (target.protocol !== 'https:' || target.username || target.password) return null;
      return target.origin === store.origin || target.hostname === 'payu.in' || target.hostname.endsWith('.payu.in') ? target.href : null;
    } catch (_) { return null; }
  }
  const api = { address, fingerprint, redirect };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.WooCheckout=api;
})(typeof window !== 'undefined' ? window : globalThis);
