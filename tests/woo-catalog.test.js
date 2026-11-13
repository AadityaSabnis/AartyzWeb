const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalize, card, priceText, load } = require('../woo-catalog.js');
const categories = [
  { id: 152, slug: 'women', parent: 0 },
  { id: 357, slug: 'tops-and-shirts', parent: 152 },
  { id: 150, slug: 'men', parent: 0 },
  { id: 624, slug: 'block-print-shirts', parent: 150 }
];
const top = {
  id: 42613, name: 'Sage Blue Floral Top', type: 'variable',
  permalink: 'https://aartyz.in/product/womens-hand-block-printed-cotton-top/',
  categories: [{ id: 357, name: 'Tops and shirts', slug: 'tops-and-shirts' }],
  prices: { currency_code: 'INR', currency_minor_unit: 2, price: '105000', regular_price: '105000',
    price_range: { min_amount: '105000', max_amount: '125000' } },
  price_html: '<span>₹1,050 – ₹1,250</span>', is_purchasable: true, is_in_stock: true,
  attributes: [{ name: 'size', terms: [{ name: 'S' }, { name: 'M' }] }]
};

test('maps child-only categories through ancestry and uses currency minor units', () => {
  const p = normalize(top, categories, 0);
  assert.deepEqual(p.categories, ['women']);
  assert.deepEqual(p.subcategories, ['tops_shirts']);
  assert.equal(p.gender, 'women');
  assert.equal(p.price, 1050);
  assert.equal(p.priceMax, 1250);
  assert.deepEqual(p.size, ['S', 'M']);
  assert.equal(priceText(p), '₹1,050 – ₹1,250');
  assert.match(card(p), /href="\/product\/womens-hand-block-printed-cotton-top\/"/);
  assert.match(card(p), /openProduct\(this.dataset.productId\)/);
  assert.doesNotMatch(card(p), /addToCart|href="https:\/\/aartyz.in/);
});

test('missing WooCommerce prices never become free products; explicit free prices remain valid', () => {
  const p = normalize({ ...top, prices: { price: '0' }, price_html: '', is_purchasable: false }, categories, 0);
  assert.equal(p.price, null);
  assert.equal(priceText(p), 'Price unavailable');
  assert.doesNotMatch(card(p), /₹0/);
  assert.equal(normalize({ ...top, prices: { price: '0' }, price_html: '₹0' }, categories, 0).price, 0);
});

test('entity-encoded titles display as text without enabling injected HTML', () => {
  const p = normalize({ ...top, name: 'Women&#8217;s &amp; &lt;script&gt;' }, categories, 0);
  assert.equal(p.name, 'Women’s & <script>');
  assert.match(card(p), /Women’s &amp; &lt;script&gt;/);
  assert.doesNotMatch(card(p), /<script>/);
});

test('remote text cannot inject markup and unsafe image/link URLs are rejected', () => {
  const p = normalize({ ...top, name: '<img src=x onerror=alert(1)>',
    permalink: 'javascript:alert(1)', images: [{ src: 'javascript:alert(2)' }],
    categories: [{ id: 357, name: '<script>alert(3)</script>' }], is_in_stock: false }, categories, 0);
  const html = card(p);
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;script/);
  assert.match(html, /Sold out/);
  assert.match(html, /product-placeholder.svg/);
  assert.doesNotMatch(html, /javascript:|<script>|src="x"/);
});

test('loads every product and taxonomy page, deduplicates IDs, and fails on an incomplete catalogue', async () => {
  const calls = [];
  const fetcher = async url => {
    calls.push(url);
    const page = Number(new URL(url, 'https://preview.test').searchParams.get('page'));
    const taxonomy = url.includes('products/categories');
    return { ok: true, headers: new Headers({ 'X-WP-TotalPages': '2' }),
      json: async () => taxonomy ? (page === 1 ? categories.slice(0, 1) : categories.slice(1))
        : page === 1 ? [top] : [top, { ...top, id: 99 }] };
  };
  const products = await load('/api/catalog/', fetcher);
  assert.equal(products.length, 2);
  assert.deepEqual(products[0].categories, ['women']);
  assert.equal(calls.length, 4);
  await assert.rejects(load('/api/catalog/', async () => ({ ok: false, status: 502 })), /502/);
  await assert.rejects(load('/api/catalog/', async url => {
    if (url.includes('page=2')) throw new Error('Disconnected');
    return fetcher(url);
  }), /Disconnected/);
});

test('category membership and facets follow WooCommerce data, including newly added categories and attributes', () => {
  const { facets, filter } = require('../woo-catalog.js');
  const products = [normalize(top, categories, 0), normalize({ ...top, id:77,
    categories:[{id:999,name:'New collection',slug:'new-collection'}],
    attributes:[{name:'Finish',taxonomy:'pa_finish',terms:[{name:'Matte'}]}] },
    [...categories,{id:999,parent:152,slug:'new-collection'}],1)];
  assert.deepEqual(products[1].categoryIds, [999,152]);
  const result = facets(products,[{id:357,parent:152,name:'Tops'},{id:999,parent:152,name:'New collection',count:999}],152);
  assert.deepEqual(result.categories.map(c=>[c.id,c.count]),[[357,1],[999,1]]);
  assert.deepEqual(result.attributes.find(a=>a.key==='pa_finish').terms,[{value:'Matte',count:1}]);
  assert.deepEqual(filter(products,{categoryId:999}).map(p=>p.id),['77']);
});

test('facet values are OR within a group and AND between groups; clearing them restores the collection', () => {
  const { filter } = require('../woo-catalog.js');
  const fixture = (id,size,color)=>normalize({...top,id,attributes:[
    {name:'Size',taxonomy:'pa_size',terms:[{name:size}]},
    {name:'Colour',taxonomy:'pa_colour',terms:[{name:color}]}]},categories,id);
  const products=[fixture(1,'S','Blue'),fixture(2,'M','Blue'),fixture(3,'L','Red')];
  assert.deepEqual(filter(products,{attributeFilters:{pa_size:['S','M'],pa_colour:['blue']}}).map(p=>p.id),['1','2']);
  assert.equal(filter(products,{attributeFilters:{pa_size:[],pa_colour:[]}}).length,3);
});

test('price filters intersect actual variation ranges and exclude unpriced items', () => {
  const { filter } = require('../woo-catalog.js');
  const products=[normalize(top,categories,0),normalize({...top,id:2,price_html:''},categories,1)];
  assert.deepEqual(filter(products,{priceMin:1200,priceMax:1300}).map(p=>p.id),['42613']);
  assert.equal(filter(products,{priceMin:1300}).length,0);
  assert.equal(filter(products,{}).length,2);
});

test('newest ordering includes the full catalogue without a fabricated new-arrival cutoff', () => {
  const { filter } = require('../woo-catalog.js');
  const products=Array.from({length:30},(_,i)=>normalize({...top,id:i+1},categories,i)).reverse();
  const results=filter(products,{sort:'newest'});
  assert.equal(results.length,30);
  assert.equal(results[0].id,'1');
  assert.equal(results[29].id,'30');
  assert.equal('newArrival' in results[0],false);
});

test('loads category metadata for navigation without trusting embedded markup or unsafe image URLs', async () => {
  const {loadStore} = require('../woo-catalog.js');
  const store = await loadStore('/api/catalog/',async url=>({ok:true,headers:new Headers(),json:async()=>
    url.includes('products/categories') ? [...categories,{id:999,parent:152,name:'Fabric &amp; Craft',slug:'new-collection',image:{src:'javascript:bad()'}}] : [top]}));
  assert.equal(store.products.length,1);
  assert.equal(store.categories.find(c=>c.id===999).name,'Fabric & Craft');
  assert.equal(store.categories.find(c=>c.id===999).image,'');
  assert.equal(store.categories.find(c=>c.id===999).parent,152);
  assert.equal(store.categories.find(c=>c.id===357).key,'tops_shirts');
});

test('opens a product by ID or legacy slug without requesting the full catalogue', async () => {
  const requests = [];
  const payload = {id:42805,name:'Indigo border saree',permalink:'https://aartyz.in/product/temple-border-saree/'};
  const fetcher = async url => {
    requests.push(url);
    return {ok:true,json:async () => url.includes('?') ? [payload] : payload};
  };
  const {loadProduct, productPath} = require('../woo-catalog.js');
  assert.equal(productPath(await loadProduct('42805', false, '/api/catalog/', fetcher)), '/product/temple-border-saree/');
  assert.equal((await loadProduct('temple-border-saree', true, '/api/catalog/', fetcher)).id, '42805');
  assert.deepEqual(requests, ['/api/catalog/products/42805','/api/catalog/products?per_page=1&slug=temple-border-saree']);
  await assert.rejects(loadProduct('missing', true, '/api/catalog/', async () => ({ok:true,json:async()=>[]})), {status:404});
});
