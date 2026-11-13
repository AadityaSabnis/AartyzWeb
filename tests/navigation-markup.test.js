const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');

test('homepage collection cards declare distinct category routes instead of linking every card to Shop',()=>{
  const home=html.slice(html.indexOf('id="page-home"'),html.indexOf('<!-- FEATURES'));
  const cards=[...home.matchAll(/<a\b[^>]*class="cat-tile"[^>]*data-route="([^"]+)"[^>]*>/g)];
  assert.deepEqual(cards.map(m=>m[1]),['women','men','decor','gifting']);
  assert.ok(cards.every(m=>/href="#page-/.test(m[0])));
});

test('Search submits through a form and contact form opens a draft instead of faking delivery',()=>{
  assert.ok(/<form[^>]+id="search-form"[^>]+onsubmit=/.test(html), "Search form must submit");
  assert.ok(/<form[^>]+id="contact-form"[^>]+onsubmit=/.test(html), "Contact form must prepare a draft");
  assert.ok(!/alert\('Thank you/.test(html), "Do not fake delivery confirmation");
});
