/* Aartyz Theme JS */
/**
 * Aartyz — WooCommerce storefront
 * ====================================================
 * Product browsing reads the public WooCommerce catalogue through server.py.
 * Products and commerce facts come from WooCommerce; no demo catalogue is used.
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
//  LIVE PRODUCT CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS = [];
let catalogueState = 'loading';
const STORE_CATEGORIES = [];
let activeCollectionId = null;
let catalogueRebuilding = false;
let productRouteRequest = 0;
const EDITS = {
  'block-print-edit': {path:'/edits/hand-block-printed-sarees/', title:'Hand block printed sarees', description:'Wooden blocks are pressed by hand to build the print, one impression at a time.', ids:['42805']},
  'handpainted-edit': {path:'/edits/hand-painted-sarees/', title:'Hand-painted sarees', description:'Explore sarees with motifs painted by hand.', ids:['40547']},
  'festive-edit': {path:'/edits/diwali-26/', title:'Diwali ’26 edit', description:'A small selection of sarees and separates for festive gatherings.', ids:['42805','40547','43302']},
};
const EDITORIAL_PATHS = {
  visit:'/visit/', gifting:'/corporate-gifting/', quote:'/bulk-quote/',
  'made-to-order':'/made-to-order/', 'shopping-help':'/shopping-help/',
  'from-instagram':'/from-instagram/', about:'/about-us/', ecoprints:'/eco-printing/',
};
let activeEdit = null;
const directProducts = new Map();
const productById = id => PRODUCTS.find(p => p.id === String(id)) || directProducts.get(String(id));
const whatsapp = message => 'https://wa.me/919422866082?text=' + encodeURIComponent(message);
function pageDestination(page) {
  return EDITS[page]?.path || EDITORIAL_PATHS[page] || (page === 'home' ? '/' : '/#page-' + page);
}
function openEdit(key, options) {
  const edit = EDITS[key];
  activeEdit = key;
  document.getElementById('edit-title').textContent = edit.title;
  document.getElementById('edit-description').textContent = edit.description;
  const grid = document.getElementById('edit-products');
  grid.textContent = 'Loading the pieces…';
  go('edit', options);
  const paint = () => {
    if (activeEdit !== key || _currentPage !== 'edit') return;
    const items = edit.ids.map(id => PRODUCTS.find(p => p.id === id) || directProducts.get(id)).filter(p => p?.inStock && p.purchasable && p.price !== null);
    grid.innerHTML = items.length ? items.map(cardHTML).join('') : '<p>No pieces are available in this edit right now.</p>';
    syncWishlistButtons();
  };
  if (catalogueState === 'ready') paint();
  else Promise.allSettled(edit.ids.map(async id => {
    if (!directProducts.has(id)) {
      const item = await WooCatalog.loadProduct(id);
      directProducts.set(item.id, item);
    }
  })).then(results => {
    if (activeEdit !== key || _currentPage !== 'edit') return;
    if (results.every(result => result.status === 'rejected') && catalogueState !== 'ready') {
      const retry = document.createElement('button');
      retry.type = 'button'; retry.textContent = 'Try again';
      retry.onclick = () => openEdit(key, {historyMode:'none'});
      grid.replaceChildren('We couldn’t load this edit. ', retry);
    } else paint();
  });
  return true;
}

// Maps page id → default filter constraints applied automatically on open
const PAGE_DEFAULTS = {
  shop:              {},
  women:             { category: 'women' },
  men:               { category: 'men' },
  decor:             { category: 'home_decor' },
  gifting:           { category: 'gifting' },
  newarrivals:       { sort:'newest' },
  collection:        {},
  sale:              { sale: true },
  'w-sarees':        { category:'women',     subcategory:'sarees'          },
  'w-coords':        { category:'women',     subcategory:'coords'          },
  'w-onepiecedress': { category:'women',     subcategory:'one_piece_dress' },
  'w-topsshirts':    { category:'women',     subcategory:'tops_shirts'     },
  'w-kurtis':        { category:'women',     subcategory:'kurtis'          },
  'w-palazzo':       { category:'women',     subcategory:'palazzo_lowers'  },
  'w-dupatta':       { category:'women',     subcategory:'dupatta'         },
  'w-skirts':        { category:'women',     subcategory:'cotton_skirts'   },
  'w-dressmaterial': { category:'women',     subcategory:'dress_material'  },
  'w-blouse':        { category:'women',     subcategory:'blouse'          },
  'm-shirts':        { category:'men',       subcategory:'shirts'          },
  'm-blockprint':    { category:'men',       subcategory:'block_print_shirts'},
  'm-kalamkari':     { category:'men',       subcategory:'kalamkari_shirts'},
  'm-blazers':       { category:'men',       subcategory:'ethnic_blazers'  },
  'm-jackets':       { category:'men',       subcategory:'modi_jackets'    },
  'd-bedsheets':     { category:'home_decor',subcategory:'bedsheets'       },
  'd-pillow':        { category:'home_decor',subcategory:'pillow_covers'   },
  'd-cushion':       { category:'home_decor',subcategory:'cushion_covers'  },
  'd-dining':        { category:'home_decor',subcategory:'dining_covers'   },
  'd-tablemats':     { category:'home_decor',subcategory:'table_mats'      },
  'd-curtains':      { category:'home_decor',subcategory:'curtains'        },
  'd-runners':       { category:'home_decor',subcategory:'runners'         },
  'g-minipouch':     { category:'gifting',   subcategory:'mini_pouch'      },
  'g-planter':       { category:'gifting',   subcategory:'planter_covers'  },
  'g-coasters':      { category:'gifting',   subcategory:'fabric_coasters' },
  'g-giftcard':      { category:'gifting',   subcategory:'gift_card'       },
  ecoprints:         { category:'eco_prints'                              },
};

// Main filter + sort function — pure, no side-effects
function queryProducts(params = {}) {
  let products = PRODUCTS;
  // Legacy page routes are layout choices; their data still comes from WooCommerce.
  if (params.category) products = products.filter(p => p.categories.includes(params.category));
  if (params.subcategory) products = products.filter(p => p.subcategories.some(s => s.includes(params.subcategory)));
  if (params.gender) products = products.filter(p => p.gender === params.gender);
  return WooCatalog.filter(products, params);
}

// ─────────────────────────────────────────────────────────────────────────────
//  READ UI STATE FROM A PRODUCT PAGE ELEMENT
// ─────────────────────────────────────────────────────────────────────────────
const SORT_MAP = {
  'newest first':      'newest',
  'price: low → high': 'price_low',
  'price: high → low': 'price_high',
};

function buildParamsFromUI(pageEl, pageId) {
  const params = { ...PAGE_DEFAULTS[pageId], attributeFilters:{} };
  if (pageId === 'collection') params.categoryId = activeCollectionId;
  pageEl.querySelectorAll('.filter-option input:checked').forEach(input => {
    if (input.dataset.categoryId) (params.categoryIds ||= []).push(Number(input.dataset.categoryId));
    else if (input.dataset.attribute) (params.attributeFilters[input.dataset.attribute] ||= []).push(input.value);
  });
  const min = pageEl.querySelector('[data-price-min]'), max = pageEl.querySelector('[data-price-max]');
  if (min && min.value !== '') params.priceMin = Number(min.value);
  if (max && max.value !== '') params.priceMax = Number(max.value);
  const sort = pageEl.querySelector('.ps-sort, .sort-box');
  if (sort && SORT_MAP[sort.value.trim().toLowerCase()]) params.sort = SORT_MAP[sort.value.trim().toLowerCase()];
  return params;
}

// ─────────────────────────────────────────────────────────────────────────────
//  RENDER ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function renderAndUpdate(pageEl, pageId, limit = 24) {
  const grid    = pageEl.querySelector('.prod-grid');
  const countEl = pageEl.querySelector('.ps-count, .shop-count-text');
  if (!grid) return;
  if (catalogueState !== 'ready') {
    renderCatalogueStatus(grid);
    if (countEl) countEl.textContent = catalogueState === 'loading' ? 'Loading products…' : 'Products unavailable';
    return;
  }

  const params   = buildParamsFromUI(pageEl, pageId);
  const products = queryProducts(params);

  // Update count
  if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

  // Render active-filter badge on sidebar title
  _updateFilterBadge(pageEl, params, pageId);

  // Render grid
  if (!products.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--muted)">
        <div style="font-size:48px;margin-bottom:16px">🔍</div>
        <h3 style="font-family:var(--ff-display);font-size:22px;color:var(--earth);margin-bottom:8px">No products found</h3>
        <p style="font-size:14px;margin-bottom:24px">Try adjusting or clearing your filters.</p>
        <button onclick="clearFilters(this)"
          style="background:var(--saffron);color:#fff;border:none;
                 padding:12px 28px;font-size:13px;letter-spacing:.08em;
                 text-transform:uppercase;cursor:pointer;font-family:var(--ff-body)">
          Clear Filters
        </button>
      </div>`;
    return;
  }

  grid.innerHTML = products.slice(0, limit).map(cardHTML).join('');
  syncWishlistButtons();
  if (products.length > limit) {
    const more = document.createElement('button');
    more.className = 'catalogue-more';
    more.type = 'button';
    more.textContent = 'Show more products';
    more.onclick = () => renderAndUpdate(pageEl, pageId, limit + 24);
    grid.appendChild(more);
  }

  // Stagger-reveal newly injected cards
  grid.querySelectorAll('.prod-card').forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition= `opacity .4s ease ${i * 35}ms, transform .4s ease ${i * 35}ms`;
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

function cardHTML(p) {
  return WooCatalog.card(p);
}

// ─────────────────────────────────────────────────────────────────────────────
//  FILTER PAGE INITIALISER  (called once per page open)
// ─────────────────────────────────────────────────────────────────────────────
function initPageFilters(pageEl, pageId) {
  if (pageEl.dataset.filtersBound) { renderAndUpdate(pageEl, pageId); return; }
  pageEl.dataset.filtersBound = 'true';

  // Wire sort select
  const sortSel = pageEl.querySelector('.ps-sort, .sort-box');
  if (sortSel)
    sortSel.addEventListener('change', () => renderAndUpdate(pageEl, pageId));

  // Wire filter tabs
  pageEl.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      this.closest('.filter-tabs').querySelectorAll('.filter-tab')
        .forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      renderAndUpdate(pageEl, pageId);
    });
  });

  // Initial render
  renderAndUpdate(pageEl, pageId);
}

// ─────────────────────────────────────────────────────────────────────────────
//  ACTIVE FILTER BADGE
// ─────────────────────────────────────────────────────────────────────────────
function _updateFilterBadge(pageEl, params, pageId) {
  const titleEl = pageEl.querySelector('.sidebar-title, .ps-sidebar .sidebar-title');
  if (!titleEl) return;
  titleEl.querySelectorAll('._fbadge').forEach(b => b.remove());

  const defaults = PAGE_DEFAULTS[pageId] || {};
  const extras   = Object.keys(params).filter(k =>
    k !== 'attributeFilters' &&
    !['sort','limit','page'].includes(k) && !(k in defaults)
  ).length + Object.values(params.attributeFilters || {}).filter(values => values.length).length;

  if (extras > 0) {
    const span = document.createElement('span');
    span.className  = '_fbadge';
    span.textContent= extras;
    span.style.cssText = `
      display:inline-flex;align-items:center;justify-content:center;
      width:18px;height:18px;border-radius:50%;
      background:var(--saffron);color:#fff;
      font-size:10px;font-weight:700;margin-left:8px;vertical-align:middle;`;
    titleEl.appendChild(span);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLEAR FILTERS
// ─────────────────────────────────────────────────────────────────────────────
function clearFilters(triggerEl) {
  const pageEl = triggerEl
    ? triggerEl.closest('.aartyz-page')
    : document.getElementById('page-' + _currentPage);
  if (!pageEl) return;

  pageEl.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => cb.checked = false);
  pageEl.querySelectorAll('[data-price-min], [data-price-max]').forEach(input => { input.value = ''; });

  const sortSel = pageEl.querySelector('.ps-sort, .sort-box');
  if (sortSel) sortSel.selectedIndex = 0;

  pageEl.querySelectorAll('.filter-tab').forEach((t, i) =>
    t.classList.toggle('active', i === 0)
  );

  renderAndUpdate(pageEl, _currentPage);
}

// ─────────────────────────────────────────────────────────────────────────────
//  INJECT "CLEAR" BUTTON INTO EVERY SIDEBAR TITLE (once on load)
// ─────────────────────────────────────────────────────────────────────────────
function injectClearButtons() {
  document.querySelectorAll('.ps-sidebar .sidebar-title, .sidebar .sidebar-title').forEach(title => {
    if (title.querySelector('._cbtn')) return;
    const btn = document.createElement('button');
    btn.className   = '_cbtn';
    btn.textContent = 'Clear';
    btn.style.cssText = `
      float:right;background:none;border:none;
      font-size:11px;color:var(--saffron);letter-spacing:.06em;
      text-transform:uppercase;cursor:pointer;font-family:var(--ff-body);
      padding:0;margin-top:2px;`;
    btn.addEventListener('click', () => clearFilters(btn));
    title.appendChild(btn);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  NAV / ROUTING / EXISTING FUNCTIONS (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () =>
  nav.classList.toggle('scrolled', window.scrollY > 60)
);

const headerItems = [...nav.querySelectorAll('.nav-item')];
const compactHeader = window.matchMedia('(max-width: 1360px)');
function setHeaderMenu(active) {
  headerItems.forEach(item => {
    const open = item === active;
    item.classList.toggle('is-open', open);
    item.querySelector('.nav-toggle').setAttribute('aria-expanded', String(open));
    item.querySelector('.mega-menu').inert = !open;
  });
}
headerItems.forEach(item => {
  const toggle = item.querySelector('.nav-toggle');
  item.addEventListener('pointerenter', event => {
    if (!compactHeader.matches && event.pointerType === 'mouse') setHeaderMenu(item);
  });
  item.addEventListener('pointerleave', () => {
    if (!item.contains(document.activeElement)) setHeaderMenu(null);
  });
  toggle.addEventListener('click', () => setHeaderMenu(item.classList.contains('is-open') ? null : item));
  toggle.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    setHeaderMenu(item);
    requestAnimationFrame(() => {
      if (item.classList.contains('is-open')) item.querySelector('.mega-menu a').focus();
    });
  });
  item.addEventListener('focusout', event => {
    if (!item.contains(event.relatedTarget)) setHeaderMenu(null);
  });
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) setHeaderMenu(null);
});
document.addEventListener('click', event => {
  if (!nav.contains(event.target)) setHeaderMenu(null);
});

const mobileMenu = document.getElementById('mobMenu');
const mobileBackdrop = document.getElementById('mobBackdrop');
const mobileTrigger = nav.querySelector('.hamburger');
const menuBackground = new Map();
function openMob() {
  if (mobileMenu.classList.contains('open')) return;
  setHeaderMenu(null);
  mobileMenu.inert = false;
  mobileMenu.setAttribute('aria-hidden', 'false');
  mobileMenu.classList.add('open');
  mobileBackdrop.classList.add('open');
  document.body.classList.add('menu-open');
  mobileTrigger.setAttribute('aria-expanded', 'true');
  mobileMenu.querySelector('.mob-close').focus();
  [...document.body.children].forEach(element => {
    if (element === mobileMenu || element === mobileBackdrop || ['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName)) return;
    menuBackground.set(element, element.inert);
    element.inert = true;
  });
}
function closeMob() {
  const wasOpen = mobileMenu.classList.contains('open');
  mobileMenu.classList.remove('open');
  mobileBackdrop.classList.remove('open');
  document.body.classList.remove('menu-open');
  mobileTrigger.setAttribute('aria-expanded', 'false');
  menuBackground.forEach((inert, element) => { element.inert = inert; });
  menuBackground.clear();
  if (wasOpen && compactHeader.matches) mobileTrigger.focus();
  mobileMenu.inert = true;
  mobileMenu.setAttribute('aria-hidden', 'true');
}
mobileBackdrop.addEventListener('click', closeMob);
mobileMenu.addEventListener('click', event => {
  if (event.target.closest('a')) closeMob();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (mobileMenu.classList.contains('open')) closeMob();
    else {
      const item = nav.querySelector('.nav-item.is-open');
      if (item) { setHeaderMenu(null); item.querySelector('.nav-toggle').focus(); }
    }
  }
  if (event.key === 'Tab' && mobileMenu.classList.contains('open')) {
    const focusable = [...mobileMenu.querySelectorAll('button, a, summary')].filter(el => el.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
compactHeader.addEventListener('change', () => { setHeaderMenu(null); closeMob(); });

const ANIMATE_CLASSES = '.feat-item,.testi-card,.p-step,.cat-tile,.value-item,.gift-perk,.bundle-card,.care-item,.mto-step';

const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  }),
  { threshold: 0.1 }
);

document.querySelectorAll(ANIMATE_CLASSES).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .65s ease, transform .65s ease';
  observer.observe(el);
});

let _currentPage = null;

let restoringLocation = false;
let lastHandledLocation = '';
const collectionFilterStates = new Map();
const pageFilterStates = new Map();
function routeHash(page) {
  if (page === 'home') return '';
  if (page === 'product' && currentProduct) return '#product-' + currentProduct.id;
  if (page === 'collection' && activeCollectionId) return '#collection-' + activeCollectionId;
  return '#page-' + page;
}
function commitRoute(page, mode) {
  if (mode === 'none') return;
  const path = page === 'product' && currentProduct ? WooCatalog.productPath(currentProduct) :
    page === 'edit' && activeEdit ? EDITS[activeEdit].path : EDITORIAL_PATHS[page];
  const url = (path || '/') + location.search + (path ? '' : routeHash(page));
  if (url !== location.pathname + location.search + location.hash) {
    window.history[mode === 'replace' ? 'replaceState' : 'pushState']({page}, '', url);
  }
  lastHandledLocation = location.href;
}
function rememberCollectionFilters() {
  if (_currentPage !== 'collection' || !activeCollectionId || catalogueRebuilding || catalogueState !== 'ready') return;
  const page = document.getElementById('page-collection');
  collectionFilterStates.set(activeCollectionId, captureFilters(page));
}
function captureFilters(page) {
  return {
    checked:[...page.querySelectorAll('.filter-option input:checked')].map(input => ({attribute:input.dataset.attribute, categoryId:input.dataset.categoryId, value:input.value})),
    min:page.querySelector('[data-price-min]')?.value || '', max:page.querySelector('[data-price-max]')?.value || '', sort:page.querySelector('.ps-sort').value
  };
}
function restoreCollectionFilters(page, saved) {
  if (!saved) return;
  page.querySelectorAll('.filter-option input').forEach(input => { input.checked = saved.checked.some(value => value.attribute === input.dataset.attribute && value.categoryId === input.dataset.categoryId && value.value === input.value); });
  const min = page.querySelector('[data-price-min]'), max = page.querySelector('[data-price-max]');
  if (min) min.value = saved.min; if (max) max.value = saved.max;
  page.querySelector('.ps-sort').value = saved.sort;
}
function go(page, options = {}) {
  if (EDITS[page]) return openEdit(page, options);
  if (page !== 'product-loading') productRouteRequest++;
  const pageTitle = page === 'product' ? currentProduct?.name : page === 'edit' ? EDITS[activeEdit]?.title :
    document.querySelector('#page-' + page + ' h1')?.textContent.trim();
  document.title = page !== 'home' && pageTitle ? pageTitle + ' | ARTYZ' : 'ARTYZ — Hand Block Printed Indian Textiles';
  if (page === 'order-confirmed') { showToast('Payment confirmation is not available here yet. Your cart is saved.'); page = 'cart'; }
  const target = document.getElementById('page-' + page);
  if (!target) { showToast('That page is unavailable.'); return false; }
  if (page !== 'collection') rememberCollectionFilters();
  closeMob(); setHeaderMenu(null);
  _currentPage = page;
  document.querySelectorAll('.aartyz-page').forEach(p => { p.style.setProperty('display', 'none', 'important'); p.classList.remove('active'); });
  target.style.setProperty('display', 'block', 'important'); target.classList.add('active');
  target.querySelectorAll(ANIMATE_CLASSES).forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(30px)'; el.style.transition = 'opacity .65s ease, transform .65s ease'; observer.observe(el); });
  window.scrollTo({top:0, behavior:'instant'});
  if (PAGE_DEFAULTS[page] !== undefined) initPageFilters(target, page);
  if (page === 'cart') { renderCart(); refreshCart(); }
  if (page === 'checkout') { renderCheckout(); loadCheckoutConfig(); refreshCart(); }
  if (page === 'wishlist') renderWishlist();
  if (page === 'search') searchProducts(document.getElementById('search-input-page').value);
  commitRoute(page, options.historyMode || (restoringLocation ? 'none' : 'push'));
  return true;
}
function restoreLocation(force = false) {
  if (!force && lastHandledLocation === location.href) return;
  lastHandledLocation = location.href;
  restoringLocation = true;
  try {
    const product = location.hash.match(/^#product-(\d+)$/) || location.pathname.match(/^\/products\/(\d+)\/?$/);
    const slug = location.pathname.match(/^\/product\/([a-z0-9%-]+)\/?$/i);
    const collection = location.hash.match(/^#collection-(\d+)$/);
    if (product || slug) {
      const key = product ? product[1] : slug[1];
      const known = product ? PRODUCTS.find(item => item.id === key) || directProducts.get(key) :
        PRODUCTS.find(item => WooCatalog.productPath(item).replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) || directProducts.get(key);
      if (known) openProduct(known.id, {historyMode:'none', product:known});
      else openDirectProduct(key, Boolean(slug));
      return;
    }
    if (collection) {
      if (catalogueState === 'ready') goCollection(collection[1], {historyMode:'none'});
      return;
    }
    const route = [...Object.entries(EDITORIAL_PATHS), ...Object.entries(EDITS).map(([key, edit]) => [key, edit.path])]
      .find(([, path]) => path.replace(/\/$/, '') === location.pathname.replace(/\/$/, ''))?.[0];
    const page = location.hash.match(/^#page-([\w-]+)$/)?.[1] || route || 'home';
    go(page, {historyMode:'none'});
    if (page === 'from-instagram' && /^#reel-(city-saree|blue-set|table-linen)$/.test(location.hash)) {
      requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'}));
    }
  } finally { restoringLocation = false; }
}
async function openDirectProduct(key, bySlug) {
  const request = ++productRouteRequest;
  const status = document.getElementById('product-link-status');
  const retry = document.getElementById('product-link-retry');
  status.textContent = 'Opening this piece…'; retry.hidden = true;
  go('product-loading', {historyMode:'none'});
  try {
    const item = await WooCatalog.loadProduct(key, bySlug);
    directProducts.set(item.id, item);
    if (bySlug) directProducts.set(key, item);
    if (request === productRouteRequest) openProduct(item.id, {historyMode:'none', product:item});
  } catch (error) {
    if (request !== productRouteRequest) return;
    status.textContent = error.status === 404 ? 'This piece is no longer available.' : 'We couldn’t load this piece. Please try again.';
    retry.hidden = error.status === 404;
  }
}
function plainClick(event) { return !event || !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && (!event.button || event.button === 0); }
function bindCollectionLink(link, category) {
  link.href = '#collection-' + category.id; link.dataset.categoryId = category.id;
  link.onclick = event => { if (!plainClick(event)) return; event.preventDefault(); goCollection(category.id); };
}
function wirePageLinks() {
  document.querySelectorAll('a[onclick]').forEach(link => {
    const route = link.dataset.route || link.getAttribute('onclick')?.match(/^(?:event.preventDefault\(\);)?go\('([^']+)'\)$/)?.[1];
    if (!route || (!EDITS[route] && !document.getElementById('page-' + route))) return;
    link.href = pageDestination(route);
    link.onclick = event => { if (!plainClick(event)) return; event.preventDefault(); go(route); };
  });
}
function openFounder() { go('about'); requestAnimationFrame(() => document.getElementById('founder').scrollIntoView({behavior:'smooth', block:'start'})); }


// Jump to the Eco Prints page with one Category filter pre-selected
function goEcoSub(label) {
  const key = label.toLowerCase().replace('eco ', 'eco_');
  const category = STORE_CATEGORIES.find(c => c.key === key);
  if (category) goCollection(category.id); else go('ecoprints');
}


function setSubcat(el) {
  el.closest('.subcat-inner')?.querySelectorAll('.subcat-pill')
    .forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function toggleWish(e, btn) {
  if(e) e.stopPropagation();
  const on = btn.textContent === '♥';
  btn.textContent = on ? '♡' : '♥';
  btn.style.color = on ? '' : 'var(--saffron)';
}

// ── SEARCH (nav search inputs) ───────────────────────────────────────────────
function initSearchInputs() {
  document.querySelectorAll('input[type="search"], .nav-search-input, .search-input').forEach(input => {
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = input.value.trim();
        if (q.length < 2) return;
        // Navigate to shop page and filter inline
        go('shop');
        const shopPage = document.getElementById('page-shop');
        if (!shopPage) return;
        const grid = shopPage.querySelector('.prod-grid');
        const countEl = shopPage.querySelector('.ps-count, .shop-count-text');
        if (!grid) return;
        const results = queryProducts({ search: q });
        if (countEl) countEl.textContent = `${results.length} products`;
        grid.innerHTML = results.map(cardHTML).join('');
        syncWishlistButtons();
      }, 300);
    });
  });
}
// ── INIT ─────────────────────────────────────────────────────────────────────
function aartyzBoot() {
  document.getElementById('copyright-year').textContent = new Date().getFullYear();
  var hash = window.location.hash;
  var startPage = 'home';
  if (hash && hash.indexOf('#page-') === 0) {
    var hid = hash.replace('#page-', '');
    if (document.getElementById('page-' + hid)) startPage = hid;
  }
  if (startPage === 'order-confirmed') startPage = 'cart';

  var target = document.getElementById('page-' + startPage);
  if (target) {
    // Mark active BEFORE enabling spa-mode (atomic - no blank frame)
    // Hide all pages first
    document.querySelectorAll('.aartyz-page').forEach(function(p) {
      p.style.setProperty('display', 'none', 'important');
      p.classList.remove('active');
    });
    // Show target with inline style
    target.style.setProperty('display', 'block', 'important');
    target.classList.add('active');
    _currentPage = startPage;
    if (typeof PAGE_DEFAULTS !== 'undefined' && PAGE_DEFAULTS[startPage] !== undefined) {
      try { initPageFilters(target, startPage); } catch(e) {}
    }
  }

  try { injectClearButtons(); } catch(e) {}
  try { initSearchInputs(); } catch(e) {}

  wirePageLinks();
  window.addEventListener('hashchange', () => restoreLocation());
  window.addEventListener('popstate', () => restoreLocation());
}

// Run immediately — JS loads in footer so DOM is already ready
aartyzBoot();



// ─────────────────────────────────────────────────────────────────────────────
//  WOOCOMMERCE GUEST CART
// ─────────────────────────────────────────────────────────────────────────────
let cart = [];
let wishlist = [];
let currentProduct = null;
let productChoices = {};
let productVariations = [];
let selectedVariation = null;
let variationStatus = 'idle';
let productOptionRequest = 0;
let guestCartStorage;
try { guestCartStorage = window.localStorage; } catch (_) { guestCartStorage = null; }
try {
  const saved = JSON.parse(guestCartStorage?.getItem('aartyz.wishlist') || '[]');
  if (Array.isArray(saved)) wishlist = saved.filter(id => typeof id === 'string' && /^\d+$/.test(id)).map(id => ({id}));
} catch (_) { /* Wishlist storage is optional. */ }
const liveCart = WooCart.create({ storage: guestCartStorage, onChange: state => {
  cart = state.data?.items || [];
  renderCart();
  renderCheckout();
  updateCartBadge();
  updatePurchaseControls();
} });

async function refreshCart() {
  if (liveCart.busy) return;
  try { await liveCart.read(); } catch (_) { /* The cart shows an actionable error. */ }
}

async function cartOperation(action, body, successMessage) {
  try {
    await liveCart.mutate(action, body);
    if (successMessage) showToast(successMessage);
    return true;
  } catch (error) {
    showToast(WooCatalog.text(error.message).replace(/<[^>]*>/g, ''));
    return false;
  }
}

async function addToCart(product, qty) {
  if (!product || liveCart.busy) return;
  if (product.id !== currentProduct?.id) { openProduct(product.id); return; }
  const item = product.type === 'variable' ? selectedVariation : product;
  if (!item || !item.inStock || !item.purchasable || !['simple', 'variable'].includes(product.type)) {
    showToast('Choose an available option first.');
    return;
  }
  const input = document.getElementById('prod-qty');
  if (!input.reportValidity()) return;
  qty = qty ?? Number(input.value);
  if (!Number.isInteger(qty) || qty < 1) return;
  const variation = product.type === 'variable' ? product.optionAttributes.map(attribute => ({
    attribute: attribute.key, value: productChoices[attribute.key]
  })) : [];
  await cartOperation('add-item', { id: Number(item.id), quantity: qty, variation }, 'Added to your cart ✓');
}

function removeFromCart(key) {
  if (!liveCart.busy) return cartOperation('remove-item', { key }, 'Item removed');
}

function updateCartQty(key, quantity) {
  if (!liveCart.busy) return cartOperation('update-item', { key, quantity });
}

function updateCartBadge() {
  const count = liveCart.data?.items_count || 0;
  const dot = document.getElementById('cartDot');
  if (dot) {
    dot.classList.toggle('show', count > 0);
    dot.textContent = count > 0 ? count : '';
  }
}

function renderCart() {
  const items = document.getElementById('cart-items');
  const empty = document.getElementById('cart-empty');
  const summary = document.getElementById('cart-summary');
  if (!items) return;
  const data = liveCart.data;
  const error = document.getElementById('cart-error');
  const status = document.getElementById('cart-status');
  const messages = [liveCart.error, ...(data?.errors || []).map(item => item.message)].filter(Boolean);
  error.textContent = messages.map(message => WooCatalog.text(message).replace(/<[^>]*>/g, '')).join(' ');
  error.hidden = messages.length === 0;
  document.getElementById('cart-retry').hidden = !messages.length;
  status.textContent = liveCart.busy ? 'Updating your cart…' :
    liveCart.sessionReset ? 'Your previous cart session expired. A new guest cart has been opened.' : '';
  items.setAttribute('aria-busy', String(liveCart.busy));
  empty.style.display = data && !cart.length ? 'block' : 'none';
  summary.style.display = data && cart.length ? 'block' : 'none';
  items.replaceChildren();
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    const image = document.createElement('img');
    image.src = WooCatalog.safeURL(item.images?.[0]?.src, 'product-placeholder.svg');
    image.alt = WooCatalog.text(item.name);
    image.onerror = function() { this.onerror = null; this.src = 'product-placeholder.svg'; };
    const info = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = WooCatalog.text(item.name);
    const options = document.createElement('p');
    options.textContent = (item.variation || []).map(attribute =>
      WooCatalog.text(attribute.attribute) + ': ' + WooCatalog.text(attribute.value)).join(' · ');
    const controls = document.createElement('div');
    controls.className = 'cart-quantity';
    const limits = item.quantity_limits || { minimum: 1, maximum: 9999, multiple_of: 1, editable: true };
    const down = document.createElement('button');
    down.type = 'button';
    down.textContent = '−';
    down.setAttribute('aria-label', 'Decrease quantity of ' + WooCatalog.text(item.name));
    down.disabled = liveCart.busy || !limits.editable || item.quantity <= limits.minimum;
    down.onclick = () => updateCartQty(item.key, Math.max(limits.minimum, item.quantity - limits.multiple_of));
    const quantity = document.createElement('span');
    quantity.textContent = item.quantity;
    const up = document.createElement('button');
    up.type = 'button';
    up.textContent = '+';
    up.setAttribute('aria-label', 'Increase quantity of ' + WooCatalog.text(item.name));
    up.disabled = liveCart.busy || !limits.editable || item.quantity + limits.multiple_of > limits.maximum;
    up.onclick = () => updateCartQty(item.key, item.quantity + limits.multiple_of);
    controls.append(down, quantity, up);
    info.append(title, options, controls);
    const right = document.createElement('div');
    const price = document.createElement('p');
    price.textContent = WooCart.format(item.totals.line_total, item.totals);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.disabled = liveCart.busy;
    remove.onclick = () => removeFromCart(item.key);
    right.append(price, remove);
    row.append(image, info, right);
    items.appendChild(row);
  });
  if (data) {
    const totals = data.totals;
    const fields = { 'cart-subtotal': 'total_items', 'cart-shipping': 'total_shipping',
      'cart-discount': 'total_discount', 'cart-tax': 'total_tax', 'cart-fees': 'total_fees', 'cart-total': 'total_price' };
    Object.entries(fields).forEach(([id, field]) => {
      document.getElementById(id).textContent = WooCart.format(totals[field], totals);
    });
    const coupons = document.getElementById('cart-coupons');
    coupons.replaceChildren();
    (data.coupons || []).forEach(coupon => {
      const button = document.createElement('button');
      button.type = 'button';
      button.disabled = liveCart.busy;
      button.textContent = 'Remove coupon: ' + coupon.code;
      button.onclick = () => cartOperation('remove-coupon', { code: coupon.code });
      coupons.appendChild(button);
    });
  }
  document.querySelectorAll('[data-cart-control]').forEach(button => { button.disabled = liveCart.busy; });
}

function applyCoupon() {
  const code = document.getElementById('coupon-input').value.trim();
  if (!code || liveCart.busy) return;
  return cartOperation('apply-coupon', { code }, 'Coupon applied');
}

function placeOrder() {
  showToast('Checkout and payment are not connected yet. Your cart has been kept.');
  go('cart');
}

// ─────────────────────────────────────────────────────────────────────────────
//  WISHLIST
// ─────────────────────────────────────────────────────────────────────────────
function addToWishlist(product) {
  const exists = wishlist.find(p => p.id === product.id);
  if (!exists) {
    wishlist.push(product);
    persistWishlist();
    showToast('Saved to wishlist ♡');
    renderWishlist();
  } else {
    showToast('Already in wishlist');
  }
}

function removeFromWishlist(id) {
  wishlist = wishlist.filter(p => p.id !== id);
  persistWishlist();
  renderWishlist();
}
function persistWishlist() {
  try { guestCartStorage?.setItem('aartyz.wishlist', JSON.stringify(wishlist.map(p => p.id))); } catch (_) {}
  syncWishlistButtons();
}
function toggleWishlistById(id) {
  const product = productById(id); if (!product) return;
  if (wishlist.some(p => p.id === product.id)) removeFromWishlist(product.id);
  else addToWishlist(product);
}
function toggleProductWishlist() { if (currentProduct) toggleWishlistById(currentProduct.id); }
function syncWishlistButtons() {
  document.querySelectorAll('[data-wishlist-id]').forEach(button => {
    const saved = wishlist.some(p => p.id === button.dataset.wishlistId);
    button.setAttribute('aria-pressed', String(saved));
    const product = productById(button.dataset.wishlistId);
    button.setAttribute('aria-label', (saved ? 'Remove ' : 'Save ') + (product?.name || 'product') + (saved ? ' from wishlist' : ' to wishlist'));
  });
  const button = document.getElementById('prod-save');
  if (button && currentProduct) {
    const saved = wishlist.some(p => p.id === currentProduct.id);
    button.setAttribute('aria-pressed', String(saved)); button.textContent = saved ? 'Saved to wishlist — remove' : 'Save to wishlist';
  }
}

function renderWishlist() {
  const grid    = document.getElementById('wishlist-grid');
  const emptyEl = document.getElementById('wishlist-empty');
  if (!grid) return;
  if (wishlist.length === 0) {
    grid.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  const products = wishlist.map(saved => productById(saved.id)).filter(Boolean);
  if (emptyEl) emptyEl.style.display = products.length ? 'none' : 'block';
  grid.replaceChildren();
  products.forEach(product => {
    const wrapper = document.createElement('div'); wrapper.innerHTML = WooCatalog.card(product);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'wishlist-remove'; remove.textContent = 'Remove from wishlist';
    remove.onclick = () => removeFromWishlist(product.id); wrapper.append(remove); grid.append(wrapper);
  });
  syncWishlistButtons();
}

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCT DETAIL PAGE
// ─────────────────────────────────────────────────────────────────────────────
function primaryProductCategory(product) {
  const ids = product.assignedCategoryIds?.length ? product.assignedCategoryIds : product.categoryIds;
  function depth(category) {
    let count = 0, current = category; const seen = new Set();
    while (current?.parent && !seen.has(current.id)) { seen.add(current.id); count++; current = STORE_CATEGORIES.find(c => c.id === current.parent); }
    return count;
  }
  return STORE_CATEGORIES.filter(c => ids.includes(c.id)).sort((a,b) => depth(b) - depth(a))[0];
}
function internalStoreRoute(value) {
  try {
    const url = new URL(value), sample = PRODUCTS.find(p => p.permalink)?.permalink;
    const store = checkoutConfig?.store_url || sample; if (!store) return null;
    if (url.hostname.replace(/^www\./, '') !== new URL(store).hostname.replace(/^www\./, '')) return null;
    const product = PRODUCTS.find(p => p.permalink && new URL(p.permalink).pathname.replace(/\/$/, '') === url.pathname.replace(/\/$/, ''));
    if (product) return {hash:WooCatalog.productPath(product), open:() => openProduct(product.id)};
    if (url.pathname.startsWith('/product-category/')) {
      const slug = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop());
      const category = STORE_CATEGORIES.find(c => c.slug === slug);
      if (category) return {hash:'#collection-' + category.id, open:() => goCollection(category.id)};
    }
    return null;
  } catch (_) { return null; }
}
function prepareContactDraft() {
  const form = document.getElementById('contact-form'); if (!form.reportValidity()) return false;
  const fields = Object.fromEntries(new FormData(form));
  const body = [fields.message, '', 'Name: ' + [fields.first_name,fields.last_name].filter(Boolean).join(' '), 'Email: ' + fields.email, fields.phone ? 'Phone: ' + fields.phone : ''].filter(Boolean).join('\n');
  const href = 'mailto:aartyznagpur@gmail.com?subject=' + encodeURIComponent(fields.subject) + '&body=' + encodeURIComponent(body);
  document.getElementById('contact-draft-link').href = href;
  document.getElementById('contact-draft').hidden = false;
  return href;
}

// Rebuild store copy with a small set of semantic elements; never insert remote HTML.
function productRichContent(html) {
  const source = new DOMParser().parseFromString(html || '', 'text/html');
  source.querySelectorAll('script, style, iframe, object, embed, svg, math, form, template, noscript').forEach(el => el.remove());
  const result = document.createElement('div');
  result.className = 'product-rich-content';
  const allowed = new Set(['P', 'DIV', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'BR', 'DL', 'DT', 'DD', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'BLOCKQUOTE']);
  function copy(node, parent) {
    if (node.nodeType === Node.TEXT_NODE) { parent.append(document.createTextNode(node.textContent)); return; }
    if (node.nodeType !== Node.ELEMENT_NODE || node.tagName === 'IMG') return;
    let tag = /^H[1-6]$/.test(node.tagName) ? 'H3' : node.tagName;
    if (tag === 'A') {
      const url = WooCatalog.safeURL(node.getAttribute('href'));
      if (url) {
        const link = document.createElement('a');
        link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        if (/^https?:\/\//i.test(node.textContent.trim())) link.textContent = 'Read source';
        else node.childNodes.forEach(child => copy(child, link));
        const internal = internalStoreRoute(url);
        if (internal) { link.href = internal.hash; link.removeAttribute('target'); link.removeAttribute('rel'); link.onclick = event => { if (!plainClick(event)) return; event.preventDefault(); internal.open(); }; }
        parent.append(link); return;
      }
    } else if (allowed.has(tag) || tag === 'H3') {
      const element = document.createElement(tag.toLowerCase());
      node.childNodes.forEach(child => copy(child, element));
      parent.append(element); return;
    }
    node.childNodes.forEach(child => copy(child, parent));
  }
  source.body.childNodes.forEach(node => copy(node, result));
  [...result.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()).forEach(node => {
    const paragraph = document.createElement('p'); paragraph.textContent = node.textContent.trim(); node.replaceWith(paragraph);
  });
  result.querySelectorAll('li').forEach(li => {
    if (li.firstChild?.nodeType === Node.TEXT_NODE) li.firstChild.textContent = li.firstChild.textContent.replace(/^\s*[✔✓✅•]+\s*/, '');
  });
  result.querySelectorAll('p').forEach(p => {
    const text = p.textContent.trim();
    if (!text) { p.remove(); return; }
    if (text.length < 70 && ((p.children.length === 1 && /^(STRONG|B)$/.test(p.firstElementChild.tagName) && text === p.firstElementChild.textContent.trim()) || /^(product description|product highlights|key features|features? & details|perfect for)$/i.test(text))) {
      const heading = document.createElement('h3'); heading.textContent = text; p.replaceWith(heading);
    }
  });
  return result;
}
function productFact(text) {
  const match = text.trim().match(/^(.{2,38}?)(?:\s+[–—-]\s+|:\s+)(.+)$/);
  if (!match || !/^(?:fabric|material|technique|base colou?r|print(?: colou?r)?|colou?r|size|saree(?: & print| length)?|length|width|border|blouse piece|occasion|country of origin|quantity|dimensions|closure|lining|sleeve|fit|neck|pattern|contents|care|wash care|shipping|dispatch|returns?)(?:\s+\w+)?$/i.test(match[1])) return null;
  return [match[1].trim(), match[2].trim()];
}
function renderProductContent(product) {
  const short = productRichContent(product.shortDescription);
  const full = productRichContent(product.description);
  const primary = short.textContent.trim() ? short : full;
  const separateFull = full.textContent.replace(/\s+/g, ' ').trim() !== short.textContent.replace(/\s+/g, ' ').trim();
  const overview = document.getElementById('prod-description');
  const sections = document.getElementById('prod-content-sections');
  overview.replaceChildren(); sections.replaceChildren();
  const paragraphs = [...primary.querySelectorAll('p')];
  // Product copy takes priority over the general history repeated on the old site.
  const introduction = paragraphs.find(p => p.textContent.trim().length > 60 && !productFact(p.textContent) &&
    !/^(disclaimer|wash care|care|shipping|return|for custom|please visit|colors? on screen|for some products)/i.test(p.textContent.trim()) &&
    !/^(block printing is|printing designs onto|aartyz has a unique manufacturing)/i.test(p.textContent.trim()));
  if (introduction) {
    const text = introduction.textContent.replace(/\s+/g, ' ').trim();
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
    let summary = sentences[0];
    if (sentences[1] && summary.length + sentences[1].length < 299) summary += ' ' + sentences[1];
    if (summary.length > 300) summary = summary.slice(0, 297).replace(/\s+\S*$/, '') + '…';
    const p = document.createElement('p'); p.textContent = summary; overview.append(p);
  }
  const facts = new Map();
  const factNodes = primary === short && separateFull ? [...full.querySelectorAll('p, li'), ...primary.querySelectorAll('p, li')] : [...primary.querySelectorAll('p, li')];
  factNodes.forEach(el => {
    const fact = productFact(el.textContent);
    if (fact && fact[1].length <= 180) facts.set(fact[0].toLowerCase(), fact);
  });
  if (product.fabric && ![...facts.keys()].some(key => /fabric|material/.test(key))) facts.set('fabric', ['Fabric', product.fabric]);
  if (product.color && ![...facts.keys()].some(key => /colou?r/.test(key))) facts.set('colour', ['Colour', product.color]);
  if (facts.size) {
    const priority = /^(fabric|material|technique|size|dimensions|care|wash care|shipping(?: info)?|dispatch|returns?(?: policy)?)$/i;
    const list = document.createElement('dl'); list.className = 'product-highlights';
    [...facts.values()].sort((a,b) => Number(priority.test(b[0])) - Number(priority.test(a[0]))).slice(0, 7).forEach(([label, value]) => {
      const row = document.createElement('div'), title = document.createElement('dt'), detail = document.createElement('dd');
      title.textContent = label; detail.textContent = value; row.append(title, detail); list.append(row);
    });
    overview.append(list);
  }
  overview.hidden = !overview.childNodes.length;
  primary.querySelectorAll('p').forEach(paragraph => {
    const fact = productFact(paragraph.textContent);
    if (!fact) return;
    let list = paragraph.previousElementSibling;
    if (!list?.classList.contains('product-specs')) {
      list = document.createElement('dl'); list.className = 'product-specs'; paragraph.before(list);
    }
    const row = document.createElement('div'), label = document.createElement('dt'), value = document.createElement('dd');
    label.textContent = fact[0]; value.textContent = fact[1]; row.append(label, value); list.append(row); paragraph.remove();
  });
  function section(title, content) {
    if (!content.textContent.trim()) return;
    const details = document.createElement('details'), summary = document.createElement('summary');
    summary.textContent = title; details.append(summary, content); sections.append(details);
  }
  section('Product details', primary);
  if (primary === short && separateFull) section('More about this piece & its craft', full);
}

function openProduct(idOrName, options = {}) {
  const p = options.product || productById(idOrName) ||
    PRODUCTS.find(product => product.name === idOrName);
  if (!p) { showToast('This product is no longer available.'); return false; }
  productOptionRequest++;
  currentProduct = p;
  document.getElementById('prod-title').textContent = p.name;
  const mainImage = document.getElementById('prod-img');
  mainImage.src = p.image;
  mainImage.alt = p.name;
  mainImage.onerror = function() { this.onerror = null; this.src = 'product-placeholder.svg'; };
  document.getElementById('prod-cat-label').textContent = p.categoryLabel;
  document.getElementById('prod-breadcrumb-name').textContent = p.name;
  const categoryLink = document.getElementById('prod-breadcrumb-cat');
  const category = primaryProductCategory(p);
  categoryLink.textContent = category?.name || 'Shop';
  if (category) bindCollectionLink(categoryLink, category);
  else { delete categoryLink.dataset.categoryId; categoryLink.href = '/#page-shop'; categoryLink.onclick = event => { event.preventDefault(); go('shop'); }; }
  const badge = document.getElementById('prod-sale-badge');
  badge.style.display = p.sale ? 'block' : 'none';
  document.getElementById('prod-price').textContent = WooCatalog.priceText(p);
  document.getElementById('prod-enquiry').href = whatsapp('Hi ARTYZ, I’d like to ask about ' + p.name + ' (SKU ' + (p.sku || p.id) + ').');

  renderProductContent(p);

  const gallery = document.getElementById('prod-gallery');
  gallery.replaceChildren();
  p.images.forEach((image, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'View photograph ' + (index + 1));
    const thumbnail = document.createElement('img');
    thumbnail.src = image;
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    thumbnail.onerror = function() { this.onerror = null; this.src = 'product-placeholder.svg'; };
    button.appendChild(thumbnail);
    button.onclick = () => {
      mainImage.src = image;
      gallery.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    };
    button.setAttribute('aria-pressed', String(index === 0));
    gallery.appendChild(button);
  });

  productChoices = {};
  productVariations = [];
  selectedVariation = null;
  variationStatus = p.type === 'variable' ? 'loading' : 'ready';
  document.getElementById('prod-qty').value = 1;
  renderProductOptions();
  if (p.type === 'variable') loadProductOptions(p);

  const meta = document.getElementById('prod-meta-info');
  meta.replaceChildren();
  const attributes = { SKU: p.sku || p.id, Availability: p.inStock ? 'In stock' : 'Out of stock' };
  if (p.fabric) attributes.Fabric = p.fabric;
  if (p.color) attributes.Colour = p.color;
  Object.entries(attributes).forEach(([label, value]) => {
    const row = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = label + ': ';
    row.append(title, document.createTextNode(value));
    meta.appendChild(row);
  });
  updatePurchaseControls();

  updateProductContext(p);
  go('product', options);
}
function updateProductContext(p) {
  const category = primaryProductCategory(p);
  if (category) {
    const link = document.getElementById('prod-breadcrumb-cat');
    link.textContent = category.name;
    bindCollectionLink(link, category);
  }
  const categories = p.assignedCategoryIds?.length ? p.assignedCategoryIds : p.categoryIds;
  const related = PRODUCTS.filter(product => product.id !== p.id &&
    product.categoryIds.some(id => categories.includes(id))).slice(0, 4);
  const grid = document.getElementById('prod-related');
  grid.parentElement.hidden = !related.length;
  grid.innerHTML = related.map(cardHTML).join('');
  syncWishlistButtons();
}

async function loadProductOptions(product) {
  const request = ++productOptionRequest;
  variationStatus = 'loading';
  renderProductOptions();
  updatePurchaseControls();
  try {
    const rows = await WooCart.variations(product.id);
    if (currentProduct?.id !== product.id || request !== productOptionRequest) return;
    productVariations = rows.map(row => WooCatalog.normalize(row, [], 100));
    variationStatus = 'ready';
  } catch (_) {
    if (currentProduct?.id !== product.id || request !== productOptionRequest) return;
    variationStatus = 'error';
  }
  renderProductOptions();
  updatePurchaseControls();
}
function resetProductChoices() {
  if (liveCart.busy || variationStatus !== 'ready') return;
  productChoices = {}; selectedVariation = null;
  document.getElementById('prod-qty').value = 1;
  renderProductOptions(); updatePurchaseControls();
}

function renderProductOptions() {
  const container = document.getElementById('prod-sizes');
  container.replaceChildren();
  const product = currentProduct;
  document.getElementById('prod-size-section').style.display = product?.type === 'variable' ? 'block' : 'none';
  if (product?.type !== 'variable') return;
  if (variationStatus === 'loading') { container.textContent = 'Checking available sizes…'; return; }
  if (variationStatus === 'error') {
    container.textContent = 'Size availability could not be loaded. ';
    const retry = document.createElement('button');
    retry.type = 'button'; retry.textContent = 'Try again';
    retry.onclick = () => loadProductOptions(product);
    container.appendChild(retry);
    return;
  }
  product.optionAttributes.forEach(attribute => {
    const group = document.createElement('fieldset');
    group.className = 'product-options';
    const legend = document.createElement('legend');
    legend.textContent = attribute.name;
    group.appendChild(legend);
    attribute.terms.forEach(term => {
      const button = document.createElement('button');
      const available = WooCart.optionAvailable(product, productVariations, productChoices, attribute.key, term.value);
      button.type = 'button';
      button.textContent = term.name;
      button.dataset.available = String(available);
      button.disabled = liveCart.busy || !available;
      button.title = available ? term.name : term.name + ' — unavailable';
      button.setAttribute('aria-label', button.title);
      button.setAttribute('aria-pressed', String(productChoices[attribute.key] === term.value));
      button.onclick = () => {
        productChoices[attribute.key] = term.value;
        selectedVariation = WooCart.findVariation(product, productVariations, productChoices) || null;
        document.getElementById('prod-qty').value = 1;
        renderProductOptions();
        updatePurchaseControls();
      };
      group.appendChild(button);
    });
    container.appendChild(group);
  });
}

function updatePurchaseControls() {
  if (!currentProduct) return;
  const product = currentProduct;
  const item = product.type === 'variable' ? selectedVariation : product;
  const supported = ['simple', 'variable'].includes(product.type);
  const button = document.getElementById('prod-buy-link');
  document.getElementById('prod-reset-options').disabled = liveCart.busy || variationStatus !== 'ready';
  button.disabled = liveCart.busy || !supported || !item?.inStock || !item?.purchasable || variationStatus !== 'ready';
  button.textContent = liveCart.busy ? 'Updating cart…' : 'Add to cart →';
  document.getElementById('prod-price').textContent = WooCatalog.priceText(item || product);
  const limits = item?.quantityLimits || product.quantityLimits;
  const quantity = document.getElementById('prod-qty');
  quantity.min = limits.minimum;
  quantity.max = limits.maximum;
  quantity.step = limits.multiple_of;
  if (Number(quantity.value) < limits.minimum) quantity.value = limits.minimum;
  quantity.disabled = button.disabled;
  document.querySelectorAll('.product-quantity button').forEach(control => { control.disabled = button.disabled; });
  document.querySelectorAll('.product-options button').forEach(control => {
    control.disabled = liveCart.busy || control.dataset.available === 'false';
  });
  document.getElementById('prod-purchase-note').textContent = !supported ? 'This product requires a specialist purchase flow, which is not connected yet.' :
    variationStatus === 'loading' ? 'Checking current options with WooCommerce…' :
    variationStatus === 'error' ? 'Please retry loading the options before adding this product.' :
    product.type === 'variable' && !item ? 'Choose an available option. Unavailable options cannot be purchased.' :
    !item?.inStock ? 'This option is currently out of stock.' :
    !item?.purchasable ? 'Online purchasing is not available for this item.' : 'Prices and availability are checked by WooCommerce when you add to cart.';
}

function changeProductQty(delta) {
  const input = document.getElementById('prod-qty');
  if (!input || input.disabled) return;
  const value = Number(input.value) || Number(input.min);
  input.value = Math.max(Number(input.min), Math.min(Number(input.max), value + delta * Number(input.step)));
}

function toggleAcc(head) {
  const body = head.nextElementSibling;
  const isOpen = body.style.display === 'block';
  // Close all in same container
  head.closest('div').parentElement.querySelectorAll('button + div').forEach(b => b.style.display = 'none');
  head.closest('div').parentElement.querySelectorAll('button span').forEach(s => s.textContent = '+');
  if (!isOpen) {
    body.style.display = 'block';
    head.querySelector('span').textContent = '−';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SEARCH PAGE
// ─────────────────────────────────────────────────────────────────────────────
function searchProducts(query) {
  const resultsEl = document.getElementById('search-results');
  const countEl   = document.getElementById('search-count');
  if (!resultsEl) return;
  if (!query || query.length < 2) {
    resultsEl.innerHTML = '';
    if (countEl) countEl.textContent = '';
    return;
  }
  if (catalogueState !== 'ready') { renderCatalogueStatus(resultsEl); if (countEl) countEl.textContent = 'Products unavailable while the collection loads.'; return; }
  const results = queryProducts({search:query});
  if (countEl) countEl.textContent = results.length + ' product' + (results.length !== 1 ? 's' : '') + ' found';
  resultsEl.innerHTML = results.map(p => cardHTML(p)).join('');
  syncWishlistButtons();
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
function showToast(message) {
  let toast = document.getElementById('aartyz-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'aartyz-toast';
    toast.style.cssText = `
      position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);
      background:var(--earth);color:#fff;padding:14px 28px;font-family:var(--ff-body);
      font-size:13px;letter-spacing:.05em;z-index:9999;opacity:0;
      transition:all .3s ease;pointer-events:none;white-space:nowrap;`;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}

// ─────────────────────────────────────────────────────────────────────────────
//  WIRE UP NAV ICONS to new pages
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Search icon
  var searchBtns = document.querySelectorAll('.nav-icon[title="Search"]');
  searchBtns.forEach(function(btn) {
    btn.onclick = function() { go('search'); };
  });
  // Wishlist icon
  var wishBtns = document.querySelectorAll('.nav-icon[title="Wishlist"]');
  wishBtns.forEach(function(btn) {
    btn.onclick = function() { renderWishlist(); go('wishlist'); };
  });
  // Cart icon
  var cartBtns = document.querySelectorAll('.nav-icon[title="Cart"]');
  cartBtns.forEach(function(btn) {
    btn.onclick = function() { renderCart(); go('cart'); };
  });
});


// Public catalogue lifecycle: no silent fallback to invented products.
function renderCatalogueStatus(grid) {
  grid.setAttribute('aria-busy', catalogueState === 'loading' ? 'true' : 'false');
  grid.innerHTML = '<div class="catalogue-message" role="status">' +
    (catalogueState === 'loading' ? 'Loading the collection…' :
      'We couldn’t load the collection. <button type="button" onclick="loadWooCatalogue()">Try again</button>') + '</div>';
}

async function loadWooCatalogue() {
  if (loadWooCatalogue.pending) return;
  rememberCollectionFilters();
  if (catalogueState === 'ready') document.querySelectorAll('.aartyz-page').forEach(page => {
    const id = page.id.replace('page-', '');
    if (PAGE_DEFAULTS[id] !== undefined && id !== 'collection' && page.querySelector('.ps-sort, .sort-box')) pageFilterStates.set(id, captureFilters(page));
  });
  catalogueRebuilding = true;
  loadWooCatalogue.pending = true;
  catalogueState = 'loading';
  const banner = document.getElementById('catalogue-status');
  function refresh() {
    if (catalogueState !== 'ready') {
      const message = catalogueState === 'loading' ? 'Loading collections…' : 'Collections unavailable. Use the catalogue retry button to try again.';
      document.querySelectorAll('#mainNav .mega-links, #mobile-collections').forEach(el => { el.textContent = message; });
      document.querySelectorAll('.cat-sub').forEach(el => { el.textContent = catalogueState === 'loading' ? 'Loading products…' : 'Products unavailable'; });
    }
    document.querySelectorAll('.aartyz-page').forEach(page => {
      const id = page.id.replace('page-', '');
      if (PAGE_DEFAULTS[id] !== undefined) {
        if (catalogueState !== 'ready') buildLiveFilters(page, id);
        renderAndUpdate(page, id);
      }
    });
    document.querySelectorAll('.prod-grid').forEach(grid => grid.setAttribute('aria-busy', catalogueState === 'loading' ? 'true' : 'false'));
    const search = document.getElementById('search-input-page');
    if (search?.value.trim().length >= 2) searchProducts(search.value);
  }
  refresh();
  try {
    const store = await WooCatalog.loadStore();
    const products = store.products;
    STORE_CATEGORIES.splice(0, STORE_CATEGORIES.length, ...store.categories);
    PRODUCTS.splice(0, PRODUCTS.length, ...products);
    catalogueState = 'ready';
    updateCatalogueLabels();
    if (banner) banner.textContent = 'Browse the collection, choose your options and review your order here.';
    // A direct product request is independent of the background catalogue.
    if (_currentPage === 'product' && currentProduct) updateProductContext(currentProduct);
    else if (_currentPage === 'collection' && activeCollectionId) goCollection(activeCollectionId, {historyMode:'none'});
    else if (_currentPage !== 'product-loading') restoreLocation(true);
  } catch (error) {
    catalogueState = 'error';
    if (banner) banner.textContent = 'The collection is temporarily unavailable.';
    console.error('WooCommerce catalogue:', error);
  } finally {
    catalogueRebuilding = false;
    loadWooCatalogue.pending = false;
    refresh();
  }
}

function liveCategoryForPage(pageId) {
  const defaults = PAGE_DEFAULTS[pageId];
  if (!defaults) return null;
  if (defaults.categoryId) return STORE_CATEGORIES.find(c => c.id === defaults.categoryId);
  if (defaults.subcategory) return STORE_CATEGORIES.filter(c => c.key === defaults.subcategory).sort((a,b) => liveCategoryCount(b.id) - liveCategoryCount(a.id))[0];
  if (defaults.category) return STORE_CATEGORIES.filter(c => c.group === defaults.category)
    .sort((a,b) => liveCategoryCount(b.id) - liveCategoryCount(a.id))[0];
  return null;
}
function liveCategoryCount(id) { return PRODUCTS.filter(p => p.categoryIds.includes(id)).length; }
function collectionLink(category) {
  const a = document.createElement('a'); a.className = 'mega-link'; a.href = '#collection-' + category.id;
  const text = document.createElement('span'), name = document.createElement('span'), count = document.createElement('span');
  name.className = 'ml-label'; name.textContent = category.name;
  count.className = 'ml-sub'; count.textContent = liveCategoryCount(category.id) + ' products';
  text.append(name, count); a.append(text);
  bindCollectionLink(a, category);
  return a;
}
function buildLiveNavigation() {
  const active = STORE_CATEGORIES.filter(c => liveCategoryCount(c.id));
  const descendants = parent => active.filter(c => c.parent === parent);
  function menuLinks(parent, target, depth = 0) {
    if (depth > STORE_CATEGORIES.length) return;
    descendants(parent).forEach(category => { target.append(collectionLink(category)); menuLinks(category.id, target, depth + 1); });
  }
  headerItems.forEach(item => {
    const trigger = item.querySelector('.nav-link');
    const route = trigger.dataset.legacyPage || trigger.getAttribute('onclick')?.match(/go\('([^']+)'\)/)?.[1];
    if (route) trigger.dataset.legacyPage = route;
    const category = liveCategoryForPage(route);
    const target = item.querySelector('.mega-links'); target.replaceChildren();
    item.hidden = !category || !liveCategoryCount(category.id);
    if (!category) return;
    const headingLink = item.querySelector('.mega-heading a');
    trigger.textContent = route === 'gifting' ? 'Corporate' : category.name;
    if (route === 'gifting') {
      headingLink.textContent = 'View corporate gifting →';
    } else {
      bindCollectionLink(trigger, category);
      bindCollectionLink(headingLink, category);
      item.querySelector('.mega-heading > span').textContent = category.name;
    }
    item.querySelector('.nav-toggle').setAttribute('aria-label', 'Toggle ' + category.name + ' categories');
    menuLinks(category.id, target);
    if (!target.children.length) target.append(collectionLink(category));
  });
  const mobile = document.getElementById('mobile-collections'); mobile.replaceChildren(); mobile.setAttribute('aria-busy', 'false');
  active.filter(c => !c.parent).forEach(category => {
    const details = document.createElement('details'), summary = document.createElement('summary');
    details.className = 'mob-category'; summary.textContent = category.name; details.append(summary);
    const all = collectionLink(category); all.className = 'mob-view-all'; all.textContent = 'Shop all ' + category.name + ' →'; details.append(all);
    const children = document.createElement('div'); children.className = 'mob-category-links'; menuLinks(category.id, children);
    details.append(children); mobile.append(details);
  });
}
function buildLiveFilters(pageEl, pageId) {
  const sidebar = pageEl.querySelector('.ps-sidebar, .sidebar'); if (!sidebar) return;
  let target = sidebar.querySelector('.live-filters');
  if (!target) { target = document.createElement('div'); target.className = 'live-filters'; sidebar.append(target); }
  target.replaceChildren();
  if (catalogueState !== 'ready') { target.textContent = catalogueState === 'loading' ? 'Loading filters…' : 'Filters unavailable'; return; }
  const defaults = PAGE_DEFAULTS[pageId] || {};
  const base = queryProducts(defaults), scope = liveCategoryForPage(pageId);
  const facets = WooCatalog.facets(base, STORE_CATEGORIES, scope?.id || 0);
  function group(title) {
    const box = document.createElement('fieldset'); box.className = 'filter-group';
    const heading = document.createElement('legend'); heading.className = 'filter-group-title'; heading.textContent = title; box.append(heading); target.append(box); return box;
  }
  function option(box, value, count, data) {
    const label = document.createElement('label'), input = document.createElement('input'), name = document.createElement('span'), total = document.createElement('span');
    label.className = 'filter-option'; input.type = 'checkbox'; input.value = value; Object.assign(input.dataset, data);
    name.className = 'filter-option-label'; name.textContent = value;
    total.className = 'filter-option-count'; total.textContent = count;
    label.append(input, name, total); box.append(label);
  }
  if (facets.categories.length) {
    const box = group('Category'); facets.categories.forEach(c => option(box, c.name, c.count, {categoryId:c.id}));
  }
  facets.attributes.forEach(attribute => {
    const box = group(attribute.name); attribute.terms.forEach(term => option(box, term.value, term.count, {attribute:attribute.key}));
  });
  if (facets.price && facets.price.min !== facets.price.max) {
    const box = group('Price'), currency = base.find(p => p.price !== null)?.currency;
    const format = value => new Intl.NumberFormat('en-IN', {style:'currency', currency}).format(value);
    const range = document.createElement('p'); range.className = 'filter-price-range'; range.textContent = format(facets.price.min) + ' – ' + format(facets.price.max); box.append(range);
    ['Minimum', 'Maximum'].forEach((name, i) => {
      const label = document.createElement('label'), input = document.createElement('input');
      label.className = 'filter-price-field'; label.textContent = name;
      input.type = 'number'; input.min = 0; input.step = 'any'; input.inputMode = 'decimal'; input.placeholder = String(i ? facets.price.max : facets.price.min);
      input.setAttribute(i ? 'data-price-max' : 'data-price-min', ''); label.append(input); box.append(label);
    });
  }
  target.onchange = () => renderAndUpdate(pageEl, pageId);
  if (pageId !== 'collection') restoreCollectionFilters(pageEl, pageFilterStates.get(pageId));
}
function goCollection(id, options = {}) {
  rememberCollectionFilters();
  const category = STORE_CATEGORIES.find(c => c.id === Number(id));
  if (!category) { go('shop'); return; }
  activeCollectionId = category.id; PAGE_DEFAULTS.collection = { categoryId:category.id };
  document.getElementById('collection-title').textContent = category.name;
  const page = document.getElementById('page-collection');
  const image = category.image || PRODUCTS.find(p => p.categoryIds.includes(category.id) && p.image !== 'product-placeholder.svg')?.image;
  page.querySelector('.shop-banner').style.backgroundImage = image ? 'url("' + image.replace(/"/g, '%22') + '")' : 'none';
  buildLiveFilters(page, 'collection');
  restoreCollectionFilters(page, collectionFilterStates.get(category.id));
  go('collection', options);
}

function updateCatalogueLabels() {
  buildLiveNavigation();
  document.querySelectorAll('.cat-tile').forEach(tile => {
    const route = tile.dataset.route || tile.getAttribute('onclick')?.match(/go\('([^']+)'\)/)?.[1];
    if (!PAGE_DEFAULTS[route]) return;
    const category = liveCategoryForPage(route);
    const products = queryProducts(category ? {categoryId:category.id} : PAGE_DEFAULTS[route]);
    if (category && route !== 'gifting') bindCollectionLink(tile, category);
    const sub = tile.querySelector('.cat-sub'); if (sub) sub.textContent = products.length + ' products';
    const image = tile.querySelector('img');
    if (image) { image.src = category?.image || products.find(p => p.image !== 'product-placeholder.svg')?.image || 'product-placeholder.svg'; image.onerror = () => { image.onerror = null; image.src = 'product-placeholder.svg'; }; }
    const title = tile.querySelector('.cat-name'); if (title && category && route !== 'gifting') title.textContent = category.name;
  });
  document.querySelectorAll('.aartyz-page').forEach(page => {
    const id = page.id.replace('page-', ''), defaults = PAGE_DEFAULTS[id]; if (!defaults) return;
    const products = queryProducts(defaults), category = liveCategoryForPage(id);
    page.querySelectorAll('.hero-desc').forEach(label => { label.textContent = products.length + ' products in this collection.'; });
    const hero = page.querySelector('.section-hero-img, .shop-banner');
    const image = category?.image || products.find(p => p.image !== 'product-placeholder.svg')?.image;
    if (hero) hero.style.backgroundImage = image ? 'url("' + image.replace(/"/g, '%22') + '")' : 'none';
    buildLiveFilters(page, id);
  });
  const copyright = document.getElementById('copyright-year'); if (copyright) copyright.textContent = new Date().getFullYear();
  renderWishlist();
}



let checkoutConfig = null;
let reviewedAddress = '';
let reviewedQuote = '';
let checkoutSubmitted = false;
const checkoutForm = document.getElementById('checkout-form');
function checkoutAddress() { return WooCheckout.address(Object.fromEntries(new FormData(checkoutForm))); }
checkoutForm.addEventListener('input', () => {
  reviewedAddress = ''; reviewedQuote = '';
  document.getElementById('checkout-address-status').textContent = 'Save your changes to update delivery and totals.';
  renderCheckout();
});
async function loadCheckoutConfig() {
  try {
    const response = await fetch('/api/store/config', {cache:'no-store'});
    if (!response.ok) throw new Error();
    checkoutConfig = await response.json();
  } catch (_) { checkoutConfig = {checkout_enabled:false}; }
  renderCheckout();
}
async function reviewCheckout() {
  if (!checkoutForm.reportValidity() || liveCart.busy || checkoutSubmitted) return;
  reviewedAddress = ''; reviewedQuote = '';
  const address = checkoutAddress();
  if (await cartOperation('update-customer', address)) {
    if (JSON.stringify(checkoutAddress()) === JSON.stringify(address)) {
      reviewedAddress = JSON.stringify(address);
      reviewedQuote = WooCheckout.fingerprint(liveCart.data);
      document.getElementById('checkout-address-status').textContent = 'Address saved. Review delivery and the updated total.';
    }
  }
  renderCheckout();
}
async function selectCheckoutRate(packageId, rateId) {
  if (liveCart.busy || checkoutSubmitted) return;
  const address = reviewedAddress;
  reviewedQuote = '';
  if (await cartOperation('select-shipping-rate', {package_id:packageId,rate_id:rateId})) {
    if (address && reviewedAddress === address) reviewedQuote = WooCheckout.fingerprint(liveCart.data);
  }
  renderCheckout();
}
function checkoutReady() {
  const data = liveCart.data;
  return data && data.items.length && !liveCart.busy && !checkoutSubmitted && !liveCart.error &&
    !data.errors?.length && reviewedAddress === JSON.stringify(checkoutAddress()) &&
    reviewedQuote === WooCheckout.fingerprint(data) && data.payment_methods?.includes('payubiz') &&
    (!data.needs_shipping || (data.shipping_rates?.length && data.shipping_rates.every(p=>p.shipping_rates.some(r=>r.selected))));
}
function renderCheckout() {
  const data = liveCart.data;
  const items = document.getElementById('checkout-items');
  if (!items) return;
  items.replaceChildren();
  document.getElementById('checkout-error').textContent = liveCart.error || (data?.errors || []).map(e=>e.message).join(' ');
  document.getElementById('checkout-review').disabled = liveCart.busy || checkoutSubmitted || !data?.items.length;
  if (data) {
    data.items.forEach(item=>{
      const line=document.createElement('p');
      line.textContent=WooCatalog.text(item.name)+' × '+item.quantity+' — '+WooCart.format(item.totals.line_total,item.totals);
      items.appendChild(line);
    });
    if(!data.items.length) items.textContent='Your cart is empty. Add a product before checking out.';
    const rates=document.getElementById('checkout-rates');rates.replaceChildren();
    if (!reviewedAddress) rates.textContent='Save your delivery address to see available methods.';
    else if (!data.needs_shipping) rates.textContent='No shipping required.';
    else if (!data.shipping_rates?.length) rates.textContent='No delivery method is available for this address.';
    else data.shipping_rates.forEach(pack=>{
      const group=document.createElement('fieldset');
      const legend=document.createElement('legend');legend.textContent=pack.name || 'Delivery';group.appendChild(legend);
      if(!pack.shipping_rates.length) {const note=document.createElement('p');note.textContent='No delivery method available.';group.appendChild(note);}
      pack.shipping_rates.forEach(rate=>{
        const label=document.createElement('label'),radio=document.createElement('input');
        radio.type='radio';radio.name='shipping-'+pack.package_id;radio.checked=rate.selected;
        radio.disabled=liveCart.busy || checkoutSubmitted;
        radio.onchange=()=>selectCheckoutRate(pack.package_id,rate.rate_id);
        label.append(radio,document.createTextNode(rate.name+' — '+WooCart.format(rate.price,rate)));
        group.appendChild(label);
      });rates.appendChild(group);
    });
    const totals=document.getElementById('checkout-totals');totals.replaceChildren();
    Object.entries({Subtotal:'total_items',Discount:'total_discount',Shipping:'total_shipping',Tax:'total_tax',Fees:'total_fees',Total:'total_price'}).forEach(([label,key])=>{
      const row=document.createElement('p');row.textContent=label+': '+WooCart.format(data.totals[key],data.totals);totals.appendChild(row);
    });
  }
  const paymentAvailable=data?.payment_methods?.includes('payubiz');
  document.getElementById('checkout-payment-status').textContent=!checkoutConfig ? 'Checking payment availability…' :
    !checkoutConfig.checkout_enabled ? 'PayU submission is disabled while we verify the payment integration in a test environment. You can review your delivery and totals; no order will be placed.' :
    !paymentAvailable ? 'PayU is not available for this cart.' : 'Pay securely through PayU. Placing the order opens the payment page; payment is not complete until confirmed by the gateway.';
  const pay=document.getElementById('checkout-pay');
  pay.disabled=!checkoutConfig?.checkout_enabled || !checkoutReady();
  pay.textContent=checkoutSubmitted ? 'Order submission in progress — do not retry' : 'Place order and continue to PayU →';
}
async function submitCheckout() {
  if (!checkoutConfig?.checkout_enabled || !checkoutReady() || !checkoutForm.reportValidity()) return;
  checkoutSubmitted=true;renderCheckout();
  const status=document.getElementById('checkout-submit-status');
  status.textContent='Submitting your order. Please keep this page open.';
  try {
    const result=await liveCart.checkout({...checkoutAddress(),payment_method:'payubiz',expected_total:liveCart.data.totals.total_price});
    const target=WooCheckout.redirect(result.payment_result?.redirect_url,checkoutConfig.store_url);
    if(!target) throw new Error('The order may have been created, but no supported payment redirect was returned.');
    status.textContent='Opening the payment page. Payment has not yet been confirmed.';
    window.location.assign(target);
  } catch(error) {
    status.textContent=error.message+' Please check with the store before submitting again. Your cart has not been cleared by this page.';
  }
}
loadCheckoutConfig();

refreshCart();

// These are local copies of the original site's banner artwork, with custom-site routes.
const homepageCampaigns = [
  { image:'block-print-sarees', page:'block-print-edit', title:'Timeless craft. Modern elegance.', cta:'Explore sarees',
    alt:'Timeless craft, modern elegance — hand block printed sarees crafted by skilled artisans.' },
  { image:'handpainted-sarees', page:'handpainted-edit', title:'Every brushstroke becomes art.', cta:'Explore sarees',
    alt:'Handpainted sarees — a model wearing a pink saree with handpainted motifs.' },
  { image:'new-arrivals', page:'newarrivals', title:'Small batches. Distinctive pieces.', cta:'See new arrivals',
    alt:'New arrivals — two women wearing printed co-ord sets against a sage green background.' },
  { image:'slow-made', page:'shop', title:'Crafted slowly. Made to be treasured.', cta:'Explore the collection',
    alt:'Crafted slowly, produced thoughtfully, made to be treasured — printed cloth and wooden printing blocks.' },
  { image:'indian-craft', page:'about', title:'Rooted in Indian craft.', cta:'Discover our craft',
    alt:'Handcrafted textiles and lifestyle products rooted in Indian craft, conscious design and sustainable innovation.' }
];
let activeCampaign = 0;
function showCampaign(index) {
  const campaign = homepageCampaigns[index];
  if (!campaign) return;
  activeCampaign = index;
  const image = document.getElementById('campaign-image');
  image.src = 'assets/banner-' + campaign.image + '.jpg';
  image.alt = campaign.alt;
  document.getElementById('campaign-image-link').setAttribute('aria-label', campaign.cta);
  document.getElementById('campaign-image-link').href = pageDestination(campaign.page);
  document.getElementById('campaign-caption').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(homepageCampaigns.length).padStart(2, '0') + ' — ' + campaign.title;
  const cta = document.getElementById('campaign-cta');
  cta.href = pageDestination(campaign.page);
  cta.replaceChildren(document.createTextNode(campaign.cta + ' '));
  const arrow = document.createElement('span'); arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true'); cta.append(arrow);
  document.querySelectorAll('[data-campaign]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.campaign) === index)));
}
function openCampaign() { go(homepageCampaigns[activeCampaign].page); }
document.querySelectorAll('[data-campaign]').forEach(button => button.addEventListener('click', () => showCampaign(Number(button.dataset.campaign))));

showCampaign(0);
document.querySelectorAll('.brief-form').forEach(form => form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = [...new FormData(form)].filter(([, value]) => value.trim()).map(([name,value]) => name + ': ' + value.trim());
  window.location.assign(whatsapp(['Hi ARTYZ, I have a ' + form.dataset.brief.toLowerCase() + ' enquiry.', ...fields].join('\n')));
}));
document.querySelectorAll('[data-reel-enquiry]').forEach(link => {
  link.href = whatsapp('Hi ARTYZ, is the piece from this Reel available? ' + link.dataset.reelEnquiry);
});
restoreLocation(true);
loadWooCatalogue();
