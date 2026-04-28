/**
 * Aartyz — Frontend Script
 * ========================
 * Handles: routing, nav, cart, countdown, scroll reveal,
 *          AND live backend-connected filtering for all product pages.
 *
 * Backend: http://127.0.0.1:8000  (FastAPI)
 * Docs:    http://127.0.0.1:8000/docs
 */

'use strict';

// ─────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:8000';

// Maps page-id → default API params sent automatically on page open
// (the sidebar checkboxes then refine further)
const PAGE_DEFAULTS = {
  'shop':              {},
  'newarrivals':       { new_arrival: 'true' },
  'sale':              { sale: 'true' },

  // Women
  'w-sarees':          { category: 'women', subcategory: 'sarees' },
  'w-coords':          { category: 'women', subcategory: 'coords' },
  'w-onepiecedress':   { category: 'women', subcategory: 'one_piece_dress' },
  'w-topsshirts':      { category: 'women', subcategory: 'tops_shirts' },
  'w-kurtis':          { category: 'women', subcategory: 'kurtis' },
  'w-palazzo':         { category: 'women', subcategory: 'palazzo_lowers' },
  'w-dupatta':         { category: 'women', subcategory: 'dupatta' },
  'w-skirts':          { category: 'women', subcategory: 'cotton_skirts' },
  'w-dressmaterial':   { category: 'women', subcategory: 'dress_material' },
  'w-blouse':          { category: 'women', subcategory: 'blouse' },

  // Men
  'm-shirts':          { category: 'men', subcategory: 'shirts' },
  'm-blockprint':      { category: 'men', subcategory: 'block_print_shirts' },
  'm-kalamkari':       { category: 'men', subcategory: 'kalamkari_shirts' },
  'm-blazers':         { category: 'men', subcategory: 'ethnic_blazers' },
  'm-jackets':         { category: 'men', subcategory: 'modi_jackets' },

  // Home Decor
  'd-bedsheets':       { category: 'home_decor', subcategory: 'bedsheets' },
  'd-pillow':          { category: 'home_decor', subcategory: 'pillow_covers' },
  'd-cushion':         { category: 'home_decor', subcategory: 'cushion_covers' },
  'd-dining':          { category: 'home_decor', subcategory: 'dining_covers' },
  'd-tablemats':       { category: 'home_decor', subcategory: 'table_mats' },
  'd-curtains':        { category: 'home_decor', subcategory: 'curtains' },
  'd-runners':         { category: 'home_decor', subcategory: 'runners' },

  // Gifting
  'g-minipouch':       { category: 'gifting', subcategory: 'mini_pouch' },
  'g-planter':         { category: 'gifting', subcategory: 'planter_covers' },
  'g-coasters':        { category: 'gifting', subcategory: 'fabric_coasters' },
};

// Maps human-readable filter group titles → API param key
const GROUP_TITLE_MAP = {
  'fabric':      'fabric',
  'color':       'color',
  'size':        'size',
  'gender':      'gender',
  'occasion':    null,   // not a backend param — used for search fallback
  'print':       'search',
  'type':        'search',
  'style':       null,
  'length':      null,
  'seating':     null,
  'pack':        null,
  'includes':    null,
  'min. order':  null,
};

// Price range label → [min, max] (null = no bound)
const PRICE_RANGES = [
  { label: /under\s*₹?\s*1[,.]?000/i,   min: null, max: 1000 },
  { label: /850.*1[,.]?200/i,            min: 850,  max: 1200 },
  { label: /1[,.]?000.*1[,.]?500/i,      min: 1000, max: 1500 },
  { label: /1[,.]?200.*1[,.]?500/i,      min: 1200, max: 1500 },
  { label: /1[,.]?000.*2[,.]?000/i,      min: 1000, max: 2000 },
  { label: /1[,.]?300.*1[,.]?700/i,      min: 1300, max: 1700 },
  { label: /1[,.]?500.*2[,.]?500/i,      min: 1500, max: 2500 },
  { label: /1[,.]?500.*3[,.]?000/i,      min: 1500, max: 3000 },
  { label: /1[,.]?800.*2[,.]?500/i,      min: 1800, max: 2500 },
  { label: /2[,.]?000.*3[,.]?000/i,      min: 2000, max: 3000 },
  { label: /2[,.]?000.*3[,.]?500/i,      min: 2000, max: 3500 },
  { label: /2[,.]?500.*4[,.]?000/i,      min: 2500, max: 4000 },
  { label: /above\s*₹?\s*1[,.]?500/i,   min: 1500, max: null },
  { label: /above\s*₹?\s*2[,.]?500/i,   min: 2500, max: null },
  { label: /above\s*₹?\s*3[,.]?000/i,   min: 3000, max: null },
  { label: /above\s*₹?\s*3[,.]?500/i,   min: 3500, max: null },
  { label: /above\s*₹?\s*4[,.]?000/i,   min: 4000, max: null },
  { label: /850.*1[,.]?200/i,            min: 850,  max: 1200 },
  { label: /under\s*₹?\s*800/i,         min: null, max: 800  },
  { label: /under\s*₹?\s*600/i,         min: null, max: 600  },
  { label: /under\s*₹?\s*500/i,         min: null, max: 500  },
  { label: /under\s*₹?\s*400/i,         min: null, max: 400  },
  { label: /under\s*₹?\s*250/i,         min: null, max: 250  },
  { label: /under\s*₹?\s*200/i,         min: null, max: 200  },
  { label: /500.*1[,.]?200/i,            min: 500,  max: 1200 },
  { label: /600.*1[,.]?200/i,            min: 600,  max: 1200 },
  { label: /700.*1[,.]?500/i,            min: 700,  max: 1500 },
  { label: /800.*1[,.]?500/i,            min: 800,  max: 1500 },
  { label: /250.*500/i,                  min: 250,  max: 500  },
  { label: /200.*400/i,                  min: 200,  max: 400  },
  { label: /400.*700/i,                  min: 400,  max: 700  },
  { label: /1[,.]?200.*1[,.]?700/i,      min: 1200, max: 1700 },
  { label: /2[,.]?000.*3[,.]?500/i,      min: 2000, max: 3500 },
  { label: /1[,.]?500.*2[,.]?000/i,      min: 1500, max: 2000 },
];

// Sort dropdown option text → API sort value
const SORT_MAP = {
  'newest first':       'newest',
  'price: low → high':  'price_low',
  'price: high → low':  'price_high',
  'best selling':       'popular',
  'best sellers':       'popular',
};

// ─────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────
let _currentPage = null;   // active page id (e.g. 'w-sarees')
let _fetchController = null;

// ─────────────────────────────────────────
//  NAV SCROLL
// ─────────────────────────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ─────────────────────────────────────────
//  MOBILE MENU
// ─────────────────────────────────────────
function openMob() { document.getElementById('mobMenu').classList.add('open'); }
function closeMob() { document.getElementById('mobMenu').classList.remove('open'); }

// ─────────────────────────────────────────
//  SCROLL REVEAL
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
//  PAGE ROUTING
// ─────────────────────────────────────────
function go(page) {
  _currentPage = page;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (!target) return;

  target.classList.add('active');

  // Animate non-product static elements
  target.querySelectorAll(ANIMATE_CLASSES).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity .65s ease, transform .65s ease';
    setTimeout(() => observer.observe(el), 50);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // If this page has backend-connected filters, init them
  if (PAGE_DEFAULTS[page] !== undefined) {
    _initPageFilters(target, page);
  }
}

// ─────────────────────────────────────────
//  FILTER INIT  (called each time a product page is opened)
// ─────────────────────────────────────────
function _initPageFilters(pageEl, pageId) {
  // Reset all checkboxes
  pageEl.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  // Wire up checkboxes
  pageEl.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => _fetchAndRender(pageEl, pageId));
  });

  // Wire up sort dropdown (ps-sort or sort-box)
  const sortSel = pageEl.querySelector('.ps-sort, .sort-box');
  if (sortSel) {
    sortSel.addEventListener('change', () => _fetchAndRender(pageEl, pageId));
  }

  // Wire up filter-tabs (quick gender/category pills — home new arrivals section)
  pageEl.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      this.closest('.filter-tabs').querySelectorAll('.filter-tab')
        .forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      _fetchAndRender(pageEl, pageId);
    });
  });

  // Initial load — fetch with default params
  _fetchAndRender(pageEl, pageId);
}

// ─────────────────────────────────────────
//  BUILD QUERY PARAMS FROM UI STATE
// ─────────────────────────────────────────
function _buildParams(pageEl, pageId) {
  const params = { ...PAGE_DEFAULTS[pageId] };

  // ── Sidebar checkboxes ──────────────────────────────────────────────
  pageEl.querySelectorAll('.filter-group').forEach(group => {
    const titleEl = group.querySelector('.filter-group-title');
    if (!titleEl) return;
    const title = titleEl.textContent.trim().toLowerCase();
    const apiKey = GROUP_TITLE_MAP[title];

    group.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      const label = cb.closest('label')?.querySelector('.filter-option-label')?.textContent?.trim() || '';

      // ── Price group ─────────────────────────────────────────────────
      if (title === 'price') {
        for (const range of PRICE_RANGES) {
          if (range.label.test(label)) {
            if (range.min !== null) params.price_min = range.min;
            if (range.max !== null) params.price_max = range.max;
            break;
          }
        }
        return;
      }

      // ── Fabric / Color / Gender ─────────────────────────────────────
      if (apiKey && apiKey !== 'search') {
        params[apiKey] = label.toLowerCase();
        return;
      }

      // ── Print / Type → search fallback ──────────────────────────────
      if (apiKey === 'search') {
        params.search = label.toLowerCase();
        return;
      }
    });
  });

  // ── Filter tabs (gender quick-select) ──────────────────────────────
  const activeTab = pageEl.querySelector('.filter-tab.active');
  if (activeTab) {
    const tabText = activeTab.textContent.trim().toLowerCase();
    if (tabText === "women's") params.gender = 'women';
    else if (tabText === "men's") params.gender = 'men';
    else if (tabText === 'decor') params.category = 'home_decor';
    // 'All' → remove gender override if set by tab
    else if (tabText === 'all' && PAGE_DEFAULTS[pageId].gender === undefined) {
      delete params.gender;
      delete params.category;
    }
  }

  // ── Sort dropdown ───────────────────────────────────────────────────
  const sortSel = pageEl.querySelector('.ps-sort, .sort-box');
  if (sortSel) {
    const sortText = sortSel.value.trim().toLowerCase();
    const apiSort = SORT_MAP[sortText];
    if (apiSort) params.sort = apiSort;
  }

  return params;
}

// ─────────────────────────────────────────
//  FETCH → RENDER
// ─────────────────────────────────────────
async function _fetchAndRender(pageEl, pageId) {
  // Cancel any in-flight request
  if (_fetchController) _fetchController.abort();
  _fetchController = new AbortController();

  const grid = pageEl.querySelector('.prod-grid');
  if (!grid) return;

  // ── Loading state ───────────────────────────────────────────────────
  _setGridLoading(grid);

  const params = _buildParams(pageEl, pageId);
  const qs = new URLSearchParams(params).toString();
  const url = `${API_BASE}/products?${qs}&limit=48`;

  try {
    const res = await fetch(url, {
      signal: _fetchController.signal,
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const products = json.data || [];
    const total    = json.meta?.total ?? products.length;

    // ── Update product count ────────────────────────────────────────
    const countEl = pageEl.querySelector('.ps-count, .shop-count-text');
    if (countEl) {
      countEl.textContent = `${total} product${total !== 1 ? 's' : ''}`;
    }

    // ── Render cards ────────────────────────────────────────────────
    _renderCards(grid, products);

    // ── Update active filter badge on sidebar title ─────────────────
    _updateFilterBadge(pageEl, params);

  } catch (err) {
    if (err.name === 'AbortError') return; // user changed filter quickly
    _setGridError(grid, err);
  }
}

// ─────────────────────────────────────────
//  CARD HTML BUILDER
// ─────────────────────────────────────────
function _renderCards(grid, products) {
  if (!products.length) {
    grid.innerHTML = `
      <div class="no-results" style="
        grid-column:1/-1;text-align:center;padding:80px 20px;
        color:var(--muted);font-family:var(--ff-body)">
        <div style="font-size:48px;margin-bottom:16px">🔍</div>
        <h3 style="font-family:var(--ff-display);font-size:22px;
                   color:var(--earth);margin-bottom:8px">No products found</h3>
        <p style="font-size:14px;margin-bottom:24px">
          Try adjusting or clearing your filters.</p>
        <button onclick="_clearFilters(this)"
          style="background:var(--saffron);color:#fff;border:none;
                 padding:12px 28px;font-size:13px;letter-spacing:.08em;
                 text-transform:uppercase;cursor:pointer">
          Clear Filters
        </button>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => _cardHTML(p)).join('');

  // Re-apply scroll animation to newly injected cards
  grid.querySelectorAll('.prod-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity .45s ease ${i * 40}ms, transform .45s ease ${i * 40}ms`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

function _cardHTML(p) {
  const isOnSale = p.sale && p.original_price > p.price;
  const isNew    = p.new_arrival;

  const badge = isOnSale
    ? `<div class="prod-badge badge-sale">Sale</div>`
    : isNew
      ? `<div class="prod-badge badge-new">New</div>`
      : '';

  const priceHTML = isOnSale
    ? `<span class="prod-original">₹${p.original_price.toLocaleString('en-IN')}</span>
       <span class="prod-sale">₹${p.price.toLocaleString('en-IN')}</span>`
    : `<span class="prod-price">₹${p.price.toLocaleString('en-IN')}</span>`;

  const subcatLabel = (p.subcategory || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return `
    <div class="prod-card" data-id="${p.id}">
      <div class="prod-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy"
             onerror="this.src='https://aartyz.in/wp-content/uploads/2025/05/logo1-3-300x300.png'">
        ${badge}
        <button class="prod-wish" onclick="toggleWish(this)" aria-label="Wishlist">♡</button>
        <div class="prod-img-hover">
          <button class="prod-add-btn" onclick="addCart()">Add to Cart</button>
        </div>
      </div>
      <div class="prod-meta">
        <div class="prod-cat">${_capitalize(p.category)} · ${subcatLabel}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-price-row">${priceHTML}</div>
      </div>
    </div>`;
}

function _capitalize(str) {
  return (str || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─────────────────────────────────────────
//  LOADING & ERROR STATES
// ─────────────────────────────────────────
function _setGridLoading(grid) {
  grid.innerHTML = Array.from({ length: 8 }).map(() => `
    <div class="prod-card prod-card--skeleton">
      <div class="prod-img-wrap" style="
        background:linear-gradient(90deg,#f0e8dc 25%,#f8f0e8 50%,#f0e8dc 75%);
        background-size:200% 100%;
        animation:shimmer 1.4s infinite;
        aspect-ratio:3/4;"></div>
      <div class="prod-meta" style="padding:12px 0">
        <div style="height:10px;width:60%;background:#f0e8dc;border-radius:4px;margin-bottom:8px"></div>
        <div style="height:14px;width:85%;background:#f0e8dc;border-radius:4px;margin-bottom:8px"></div>
        <div style="height:12px;width:40%;background:#f0e8dc;border-radius:4px"></div>
      </div>
    </div>`).join('');

  // Inject shimmer keyframes once
  if (!document.getElementById('_shimmer_style')) {
    const s = document.createElement('style');
    s.id = '_shimmer_style';
    s.textContent = `@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
    document.head.appendChild(s);
  }
}

function _setGridError(grid, err) {
  console.error('[Aartyz API]', err);
  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)">
      <div style="font-size:36px;margin-bottom:12px">⚠️</div>
      <p style="font-size:14px">Could not load products. Make sure the backend is running at<br>
        <code style="background:#f0e8dc;padding:2px 6px;border-radius:3px">${API_BASE}</code></p>
    </div>`;
}

// ─────────────────────────────────────────
//  ACTIVE FILTER BADGE
// ─────────────────────────────────────────
function _updateFilterBadge(pageEl, params) {
  const sidebarTitle = pageEl.querySelector('.sidebar-title');
  if (!sidebarTitle) return;

  const defaults = PAGE_DEFAULTS[_currentPage] || {};
  const activeCount = Object.keys(params).filter(k =>
    !['sort', 'limit', 'page'].includes(k) && !(k in defaults)
  ).length;

  // Remove old badge
  sidebarTitle.querySelectorAll('._filter-badge').forEach(b => b.remove());

  if (activeCount > 0) {
    const badge = document.createElement('span');
    badge.className = '_filter-badge';
    badge.textContent = activeCount;
    badge.style.cssText = `
      display:inline-flex;align-items:center;justify-content:center;
      width:18px;height:18px;border-radius:50%;
      background:var(--saffron);color:#fff;
      font-size:10px;font-weight:700;margin-left:8px;`;
    sidebarTitle.appendChild(badge);
  }
}

// ─────────────────────────────────────────
//  CLEAR FILTERS
// ─────────────────────────────────────────
function _clearFilters(triggerEl) {
  const pageEl = triggerEl
    ? triggerEl.closest('.page')
    : document.getElementById('page-' + _currentPage);

  if (!pageEl) return;

  // Uncheck all boxes
  pageEl.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  // Reset sort
  const sortSel = pageEl.querySelector('.ps-sort, .sort-box');
  if (sortSel) sortSel.selectedIndex = 0;

  // Reset filter-tabs to "All"
  pageEl.querySelectorAll('.filter-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === 0);
  });

  _fetchAndRender(pageEl, _currentPage);
}

// Make clearFilters globally available for "Clear Filters" buttons in HTML
window.clearFilters = _clearFilters;

// ─────────────────────────────────────────
//  ADD "CLEAR FILTERS" BUTTON to all sidebars (once on load)
// ─────────────────────────────────────────
function _injectClearButtons() {
  document.querySelectorAll('.ps-sidebar .sidebar-title, .sidebar .sidebar-title').forEach(title => {
    if (title.querySelector('._clear-btn')) return;
    const btn = document.createElement('button');
    btn.className = '_clear-btn';
    btn.textContent = 'Clear';
    btn.style.cssText = `
      float:right;background:none;border:none;
      font-size:11px;color:var(--saffron);letter-spacing:.06em;
      text-transform:uppercase;cursor:pointer;font-family:var(--ff-body);
      padding:0;margin-top:2px;opacity:.8;`;
    btn.addEventListener('click', () => _clearFilters(btn));
    title.appendChild(btn);
  });
}

// ─────────────────────────────────────────
//  FILTER TABS (static, non-product-page uses)
// ─────────────────────────────────────────
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    this.closest('.filter-tabs')
      ?.querySelectorAll('.filter-tab')
      .forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

// ─────────────────────────────────────────
//  SUBCATEGORY PILLS
// ─────────────────────────────────────────
function setSubcat(el) {
  el.closest('.subcat-inner')?.querySelectorAll('.subcat-pill')
    .forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

// ─────────────────────────────────────────
//  WISHLIST TOGGLE
// ─────────────────────────────────────────
function toggleWish(btn) {
  const active = btn.textContent === '♥';
  btn.textContent = active ? '♡' : '♥';
  btn.style.color  = active ? '' : 'var(--saffron)';
}

// ─────────────────────────────────────────
//  CART
// ─────────────────────────────────────────
let cartCount = 0;
function addCart() {
  cartCount++;
  const dot = document.getElementById('cartDot');
  if (!dot) return;
  dot.classList.add('show');
  dot.style.transform = 'scale(1.6)';
  setTimeout(() => (dot.style.transform = 'scale(1)'), 200);
}

// ─────────────────────────────────────────
//  SALE COUNTDOWN
// ─────────────────────────────────────────
function runCountdown() {
  const end = new Date();
  end.setHours(end.getHours() + 8, end.getMinutes() + 24, end.getSeconds() + 15);
  setInterval(() => {
    const diff = Math.max(0, end - new Date());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    const hEl = document.getElementById('cd-h');
    const mEl = document.getElementById('cd-m');
    const sEl = document.getElementById('cd-s');
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
  }, 1000);
}
runCountdown();

// ─────────────────────────────────────────
//  SEARCH BAR INTEGRATION
//  Wire up any nav/page search inputs to go to shop page and fetch
// ─────────────────────────────────────────
function _initSearchInputs() {
  document.querySelectorAll('input[type="search"], .nav-search-input, .search-input').forEach(input => {
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = input.value.trim();
        if (q.length < 2) return;
        go('shop');
        const shopPage = document.getElementById('page-shop');
        if (!shopPage) return;
        const params = { search: q };
        const qs = new URLSearchParams(params).toString();
        const grid = shopPage.querySelector('.prod-grid');
        if (grid) {
          _setGridLoading(grid);
          fetch(`${API_BASE}/products?${qs}&limit=48`)
            .then(r => r.json())
            .then(json => _renderCards(grid, json.data || []))
            .catch(err => _setGridError(grid, err));
        }
      }, 350);
    });
  });
}

// ─────────────────────────────────────────
//  INIT ON DOM READY
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  _injectClearButtons();
  _initSearchInputs();

  // If the home page is active on load, nothing product-related to do
  // Product pages init themselves when go() is called
});