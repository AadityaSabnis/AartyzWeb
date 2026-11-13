/* Public WooCommerce catalogue adapter. No admin credentials are used. */
(function (root) {
  'use strict';

  const SUBCATEGORIES = {
    sarees: 'sarees', 'co-ord-sets': 'coords', 'one-piece-dress': 'one_piece_dress',
    'tops-and-shirts': 'tops_shirts', 'kurtis-2': 'kurtis', 'kurti-sets': 'kurtis',
    'front-cut-kurtis': 'kurtis', 'palazzo-and-lowers': 'palazzo_lowers',
    'hand-block-printed-trousers-and-pants-for-women-artyz': 'palazzo_lowers',
    dupatta: 'dupatta', 'cotton-skirts': 'cotton_skirts', 'skirts-wrap-arounds': 'cotton_skirts',
    'dress-material': 'dress_material', blouses: 'blouse', 'designer-blouse-piece': 'blouse',
    shirts: 'shirts', 'block-print-shirt': 'block_print_shirts', 'block-print-shirts': 'block_print_shirts',
    'kalamkari-shirts': 'kalamkari_shirts', 'ethnic-blazers-new': 'ethnic_blazers',
    'ethnic-blazers': 'ethnic_blazers', 'modi-jackets-vest-coats': 'modi_jackets',
    bedsheets: 'bedsheets', 'pillow-covers': 'pillow_covers',
    'https-aartyz-com-product-category-home-decor-pillow_covers': 'pillow_covers',
    'cushion-covers': 'cushion_covers', 'dining-table-covers': 'dining_covers',
    'table-mats-runner': 'table_mats', 'table-mats': 'table_mats', curtains: 'curtains',
    runners: 'runners', 'min-pouch': 'mini_pouch', 'mini-pouch': 'mini_pouch',
    'planter-cover': 'planter_covers', 'planter-covers': 'planter_covers',
    'fabric-coasters': 'fabric_coasters', 'gift-card': 'gift_card',
    'eco-printed-fabric': 'eco_fabric', 'eco-print-shirts': 'eco_apparel'
  };
  const ROOTS = { women: 'women', men: 'men', 'home-decor': 'home_decor',
    'return-gifts-accessories': 'gifting', gifting: 'gifting', 'gift-card': 'gifting',
    'eco-prints': 'eco_prints' };
  const FIELDS = 'id,name,permalink,sku,type,description,short_description,prices,price_html,images,categories,tags,attributes,variations,add_to_cart,is_purchasable,is_in_stock,on_sale';
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // WooCommerce may return entity-encoded titles. Decode to text, then escape at rendering.
  function text(value) {
    return String(value ?? '').replace(/&#(x[\da-f]+|\d+);|&(amp|quot|apos|lt|gt|nbsp);/gi, (match, code, name) => {
      if (code) {
        const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
        return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
      }
      return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }[name.toLowerCase()];
    });
  }

  function safeURL(value, fallback = '') {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password ? url.href : fallback;
    } catch (_) { return fallback; }
  }

  function normalize(product, categories, rank) {
    const byId = new Map(categories.map(c => [c.id, c]));
    const terms = new Map();
    for (const assigned of product.categories || []) {
      let term = byId.get(assigned.id) || assigned;
      const visited = new Set();
      while (term && !visited.has(term.id)) {
        visited.add(term.id);
        terms.set(term.id, term);
        term = byId.get(term.parent);
      }
    }
    const slugs = [...terms.values()].map(c => c.slug);
    const groups = [...new Set(slugs.map(s => ROOTS[s]).filter(Boolean))];
    if (slugs.some(s => s === 'eco-printed-fabric' || s === 'eco-print-shirts')) groups.push('eco_prints');
    const subcategories = [...new Set(slugs.map(s => SUBCATEGORIES[s]).filter(Boolean))];
    if (groups.includes('eco_prints')) {
      if (subcategories.includes('sarees')) subcategories.push('eco_sarees');
      if (groups.includes('home_decor')) subcategories.push('eco_home');
      if (groups.includes('men') || groups.includes('women')) subcategories.push('eco_apparel');
    }
    const attribute = pattern => (product.attributes || []).filter(a => pattern.test(a.name || a.taxonomy || ''))
      .flatMap(a => (a.terms || []).map(t => text(t.name)));
    const prices = product.prices || {};
    const unit = 10 ** (prices.currency_minor_unit ?? 2);
    const amount = value => value !== '' && value != null && Number.isFinite(Number(value)) ? Number(value) / unit : null;
    // WooCommerce returns "0" even for missing prices; price_html distinguishes an entered free price.
    const hasPrice = Boolean(product.price_html) && amount(prices.price) !== null;
    const price = hasPrice ? amount(prices.price) : null;
    return {
      id: String(product.id), type: product.type, name: text(product.name) || 'Untitled product', sku: product.sku,
      optionAttributes: (product.attributes || []).filter(a => a.has_variations).map(a => ({
        name: text(a.name), key: a.taxonomy || a.name,
        terms: (a.terms || []).map(t => ({ name: text(t.name), value: a.taxonomy ? t.slug : text(t.name) }))
      })),
      variationOptions: product.variations || [],
      quantityLimits: { minimum: product.add_to_cart?.minimum ?? 1,
        maximum: product.add_to_cart?.maximum ?? 9999, multiple_of: product.add_to_cart?.multiple_of ?? 1 },
      permalink: safeURL(product.permalink), category: groups[0] || 'shop', categories: groups,
      categoryIds: [...terms.keys()].map(Number),
      assignedCategoryIds: (product.categories || []).map(c => Number(c.id)),
      filterAttributes: (product.attributes || []).filter(a => a.terms?.length).map(a => ({
        key: a.taxonomy || a.name, name: text(a.name), values: [...new Set(a.terms.map(t => text(t.name)))]
      })),
      subcategory: subcategories[0] || (product.categories?.[0]?.slug || ''), subcategories,
      categoryLabel: (product.categories || []).map(c => text(c.name)).join(' · '),
      gender: groups.includes('women') ? 'women' : groups.includes('men') ? 'men' : null,
      fabric: attribute(/fabric|material/i).join(', ').toLowerCase(),
      color: attribute(/colou?r/i).join(', ').toLowerCase(), size: attribute(/size/i),
      price, originalPrice: hasPrice ? amount(prices.regular_price) : null,
      priceMax: hasPrice && prices.price_range ? amount(prices.price_range.max_amount) : price,
      currency: prices.currency_code || 'INR', sale: product.on_sale === true,
      inStock: product.is_in_stock === true, purchasable: product.is_purchasable === true,
      rank, source: 'woocommerce',
      image: safeURL(product.images?.[0]?.src, 'product-placeholder.svg'),
      images: (product.images || []).map(image => safeURL(image.src)).filter(Boolean),
      description: product.description || '', shortDescription: product.short_description || '',
      tags: (product.tags || []).map(t => text(t.name))
    };
  }

  function priceText(product) {
    if (product.price === null) return 'Price unavailable';
    const format = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: product.currency,
      maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(value);
    return product.priceMax > product.price ? `${format(product.price)} – ${format(product.priceMax)}` : format(product.price);
  }

  function productPath(product) {
    const original = safeURL(product.permalink);
    if (original) {
      const path = new URL(original).pathname;
      if (/^\/product\/[a-z0-9%-]+\/?$/i.test(path)) return path.replace(/\/?$/, '/');
    }
    return '/products/' + encodeURIComponent(product.id) + '/';
  }

  async function loadProduct(key, bySlug = false, base = '/api/catalog/', fetcher = fetch) {
    const value = encodeURIComponent(key);
    const resource = bySlug ? 'products?per_page=1&slug=' + value : 'products/' + value;
    const response = await fetcher(base + resource, {credentials:'omit', signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw Object.assign(new Error('Product unavailable'), {status:response.status});
    const payload = await response.json();
    const item = bySlug ? payload[0] : payload;
    if (!item?.id) throw Object.assign(new Error('Product not found'), {status:404});
    return normalize(item, [], 0);
  }

  function card(product) {
    const e = escapeHTML;
    const badge = !product.inStock ? 'Sold out' : product.sale ? 'Sale' : '';
    const original = product.sale && product.originalPrice > product.price && product.priceMax === product.price
      ? `<span class="prod-original">${e(new Intl.NumberFormat('en-IN', { style: 'currency', currency: product.currency }).format(product.originalPrice))}</span>` : '';
    return `<div class="catalogue-card-shell"><a class="prod-card-wrap" href="${e(productPath(product))}" data-product-id="${e(product.id)}" onclick="if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();openProduct(this.dataset.productId)" style="display:block;text-decoration:none;color:inherit">
      <div class="prod-card" data-id="${e(product.id)}">
        <div class="prod-img-wrap">
          <img src="${e(product.image)}" alt="${e(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='product-placeholder.svg'">
          ${badge ? `<div class="prod-badge ${product.sale && product.inStock ? 'badge-sale' : 'badge-new'}">${badge}</div>` : ''}
          <div class="prod-img-hover"><span class="prod-add-btn">View details →</span></div>
        </div>
        <div class="prod-meta"><div class="prod-cat" title="${e(product.categoryLabel)}">${e(product.categoryLabel)}</div>
          <div class="prod-name" title="${e(product.name)}">${e(product.name)}</div>
          <div class="prod-price-row">${original}<span class="prod-price">${e(priceText(product))}</span></div>
        </div>
      </div></a><button type="button" class="prod-save-toggle" data-wishlist-id="${e(product.id)}" onclick="toggleWishlistById(this.dataset.wishlistId)" aria-pressed="false" aria-label="Save ${e(product.name)} to wishlist"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button></div>`;
  }

  function filter(products, params = {}) {
    const selectedCategories = params.categoryIds || (params.categoryId ? [params.categoryId] : []);
    const query = (params.search || '').toLowerCase();
    const results = products.filter(p =>
      (!selectedCategories.length || selectedCategories.some(id => (p.categoryIds || []).includes(Number(id)))) &&
      (!params.sale || p.sale) &&
      (params.priceMin == null || (p.priceMax ?? p.price) !== null && (p.priceMax ?? p.price) >= params.priceMin) &&
      (params.priceMax == null || p.price !== null && p.price <= params.priceMax) &&
      (!query || [p.name, p.categoryLabel, p.fabric, p.color, ...(p.tags || []),
        ...(p.filterAttributes || []).flatMap(a => a.values)].join(' ').toLowerCase().includes(query)) &&
      Object.entries(params.attributeFilters || {}).every(([key, values]) => !values.length ||
        (p.filterAttributes || []).some(a => a.key === key && a.values.some(value => values.some(v => v.toLowerCase() === value.toLowerCase()))))
    );
    if (params.sort === 'price_low') results.sort((a,b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (params.sort === 'price_high') results.sort((a,b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    else if (params.sort === 'name') results.sort((a,b) => a.name.localeCompare(b.name));
    else results.sort((a,b) => a.rank - b.rank);
    return results;
  }

  function facets(products, categories, parent = 0) {
    const attributes = new Map();
    products.forEach(p => (p.filterAttributes || []).forEach(a => {
      if (!attributes.has(a.key)) attributes.set(a.key, { key:a.key, name:a.name, terms:new Map() });
      const terms = attributes.get(a.key).terms;
      new Set(a.values).forEach(value => terms.set(value, (terms.get(value) || 0) + 1));
    }));
    const prices = products.filter(p => p.price !== null).flatMap(p => [p.price, p.priceMax ?? p.price]);
    return {
      categories: categories.filter(c => c.parent === Number(parent)).map(c => ({ ...c,
        count: products.filter(p => (p.categoryIds || []).includes(c.id)).length })).filter(c => c.count),
      attributes: [...attributes.values()].map(a => ({ ...a,
        terms:[...a.terms].map(([value,count]) => ({ value,count })).sort((a,b) => a.value.localeCompare(b.value)) })),
      price: prices.length ? { min:Math.min(...prices), max:Math.max(...prices) } : null
    };
  }

  async function loadStore(base = '/api/catalog/', fetcher = fetch) {
    async function page(resource, number, extra = '') {
      const response = await fetcher(`${base}${resource}?per_page=100&page=${number}${extra}`, {
        credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(30000)
      });
      if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('The store did not return a product list.');
      return { data, pages: Number(response.headers.get('X-WP-TotalPages')) || 1 };
    }
    const productOptions = `&orderby=date&order=desc&_fields=${FIELDS}`;
    const [firstProducts, firstCategories] = await Promise.all([
      page('products', 1, productOptions), page('products/categories', 1)
    ]);
    async function remaining(resource, first, extra = '') {
      const result = first.data.slice();
      for (let start = 2; start <= first.pages; start += 3) {
        const batch = await Promise.all(Array.from({ length: Math.min(3, first.pages - start + 1) },
          (_, i) => page(resource, start + i, extra)));
        batch.forEach(p => result.push(...p.data));
      }
      return result;
    }
    const [products, categories] = await Promise.all([
      remaining('products', firstProducts, productOptions), remaining('products/categories', firstCategories)
    ]);
    const unique = [...new Map(products.map(p => [p.id, p])).values()];
    return { products:unique.map((p, rank) => normalize(p, categories, rank)),
      categories:categories.map(c => ({ id:Number(c.id), parent:Number(c.parent || 0),
        name:text(c.name), slug:c.slug, group:ROOTS[c.slug], key:SUBCATEGORIES[c.slug],
        description:c.description || '', image:safeURL(c.image?.src) })) };
  }

  async function load(base = '/api/catalog/', fetcher = fetch) { return (await loadStore(base, fetcher)).products; }

  const api = { normalize, priceText, card, filter, facets, load, loadStore, loadProduct, productPath, escapeHTML, text, safeURL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WooCatalog = api;
})(typeof window !== 'undefined' ? window : globalThis);
