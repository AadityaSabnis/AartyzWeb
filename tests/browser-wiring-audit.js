(async function auditStorefrontWiring() {
  const checks = [], failures = [];
  function check(name, ok, details) { checks.push({name,ok:!!ok,...(details ? {details}: {})}); if (!ok) throw new Error(name + (details ? ': ' + JSON.stringify(details) : '')); }
  const wait = async (condition, name, ms=5000) => {const end=Date.now()+ms;while(!condition()){if(Date.now()>end)throw new Error('Timed out: '+name);await new Promise(r=>setTimeout(r,20));}};
  if (catalogueState !== 'ready') return {status:catalogueState};
  const wishlistBefore = wishlist.slice();
  try {
    go('home');
    const homeTiles = [...document.querySelectorAll('#page-home .cats-mosaic .cat-tile[data-category-id]')];
    document.querySelector('#page-home .cat-tile[data-route=gifting]').click();
    check('Corporate homepage tile opens enquiry landing', _currentPage==='gifting');
    go('home');
    const homeResults = [];
    for (const tile of homeTiles) {
      const id = Number(tile.dataset.categoryId), expected = PRODUCTS.filter(p=>p.categoryIds.includes(id)).length;
      tile.click();
      const visible = [...document.querySelectorAll('#page-collection .prod-card')].map(el=>PRODUCTS.find(p=>p.id===el.dataset.id));
      homeResults.push({route:tile.dataset.route,id,expected,count:document.querySelector('#page-collection .ps-count').textContent});
      check('Homepage '+tile.dataset.route, id && activeCollectionId===id && _currentPage==='collection' && expected>0 && visible.every(p=>p.categoryIds.includes(id)) && document.querySelector('#page-collection .ps-count').textContent===expected+' product'+(expected===1?'':'s'));
      go('home');
    }
    check('Homepage categories stay distinct', new Set(homeResults.map(r=>r.id)).size===homeTiles.length,homeResults);
    const categoryLinks=[...document.querySelectorAll('a[data-category-id]')];
    for(const link of categoryLinks){const id=Number(link.dataset.categoryId);link.click();const expected=PRODUCTS.filter(p=>p.categoryIds.includes(id)).length;check('Category link '+id,activeCollectionId===id&&_currentPage==='collection'&&Number(document.querySelector('#page-collection .ps-count').textContent.split(' ')[0])===expected);}
    for(const tile of [...document.querySelectorAll('.cat-tile[data-category-id]')]){tile.click();check('Collection tile '+tile.dataset.route,_currentPage==='collection'&&activeCollectionId===Number(tile.dataset.categoryId));}
    for(const item of headerItems){const link=item.querySelector('.nav-link');if(item.hidden)continue;link.click();check('Header '+link.textContent, link.dataset.legacyPage === 'gifting' ? _currentPage === 'gifting' : _currentPage==='collection'&&activeCollectionId===Number(link.dataset.categoryId));}
    for(let i=0;i<homepageCampaigns.length;i++){go('home');document.querySelector('[data-campaign="'+i+'"]').click();document.querySelector('#campaign-cta').click();const route=homepageCampaigns[i].page;check('Banner '+i,EDITS[route] ? _currentPage==='edit'&&activeEdit===route : _currentPage===route);}
    go('search');const input=document.getElementById('search-input-page');input.value='cotton';document.getElementById('search-form').requestSubmit();check('Search submit',document.querySelectorAll('#search-results .prod-card').length>0&&document.getElementById('search-count').textContent.includes('found'));
    const firstResult=document.querySelector('#search-results a[data-product-id]');firstResult.click();check('Search result opens its product',_currentPage==='product'&&currentProduct.id===firstResult.dataset.productId);
    const fabricCategory=STORE_CATEGORIES.find(c=>c.slug==='fabric');const fabric=PRODUCTS.find(p=>p.categoryIds.includes(fabricCategory.id));openProduct(fabric.id);
    const breadcrumb=document.getElementById('prod-breadcrumb-cat');const breadcrumbId=Number(breadcrumb.dataset.categoryId);breadcrumb.click();check('Product breadcrumb uses actual category',_currentPage==='collection'&&activeCollectionId===breadcrumbId&&fabric.categoryIds.includes(breadcrumbId));
    openProduct(fabric.id);check('Related products use taxonomy',document.querySelectorAll('#prod-related .prod-card').length>0);
    go('newarrivals');const cardSave=document.querySelector('#page-newarrivals [data-wishlist-id]');const savedId=cardSave.dataset.wishlistId;
    if(wishlist.some(p=>p.id===savedId))removeFromWishlist(savedId);cardSave.click();go('wishlist');check('Card save reaches wishlist',wishlist.some(p=>p.id===savedId)&&!!document.querySelector('#wishlist-grid a[data-product-id="'+savedId+'"]'));
    openProduct(savedId);document.getElementById('prod-save').click();check('Product save can remove',!wishlist.some(p=>p.id===savedId));document.getElementById('prod-save').click();check('Product save can add',wishlist.some(p=>p.id===savedId));
    const decoded=JSON.parse(guestCartStorage?.getItem('aartyz.wishlist')||'[]');check('Wishlist IDs persist',decoded.includes(savedId));
    goCollection(Number(homeTiles[0].dataset.categoryId));const page=document.getElementById('page-collection'), facet=page.querySelector('.filter-option input');facet.checked=true;facet.dispatchEvent(new Event('change',{bubbles:true}));const filtered=page.querySelector('.ps-count').textContent;const productLink=page.querySelector('a[data-product-id]');productLink.click();
    history.back();await wait(()=>_currentPage==='collection'&&location.hash.startsWith('#collection-'),'Back to collection');check('Back preserves category filters',page.querySelector('.ps-count').textContent===filtered&&page.querySelectorAll('.filter-option input:checked').length>0);
    history.forward();await wait(()=>_currentPage==='product'&&location.pathname===WooCatalog.productPath(currentProduct),'Forward to product');check('Forward restores product',currentProduct.id===productLink.dataset.productId);
    const oldPage=_currentPage;go('route-that-does-not-exist');check('Invalid routes do not corrupt state',_currentPage===oldPage);
    const hrefs=[...document.querySelectorAll('footer .soc-btn,#page-contact .soc-btn')].map(e=>e.href);check('Social links have real destinations',hrefs.length===8&&hrefs.every(h=>/^https:\/\//.test(h)));
    const terms=[...document.querySelectorAll('footer a')].find(a=>/Terms/.test(a.textContent));terms.click();check('Terms points to shopping help',_currentPage==='shopping-help'&&!!document.querySelector('#page-shopping-help a[href="https://aartyz.in/terms-conditions/"]'));
    const tracking=[...document.querySelectorAll('footer a')].find(a=>a.textContent==='Track Order');tracking.click();check('Track Order opens tracking support',_currentPage==='track'&&!!document.querySelector('#page-track a[href="https://aartyz.in/track-order/"]'));
    go('contact');const form=document.getElementById('contact-form');Object.entries({first_name:'Wiring',last_name:'Audit',email:'audit@example.com',phone:'0000000000',message:'Draft only — do not send.'}).forEach(([key,value])=>form.elements[key].value=value);form.requestSubmit();check('Contact prepares a draft without claiming delivery',!document.getElementById('contact-draft').hidden&&document.getElementById('contact-draft-link').href.startsWith('mailto:aartyznagpur@gmail.com?')&&document.getElementById('contact-draft').textContent.includes('No message has been sent'));
    const internal=productRichContent('<p><a href="'+PRODUCTS[0].permalink+'">View product</a></p>');check('Store product links stay custom',internal.querySelector('a').getAttribute('href')===WooCatalog.productPath(PRODUCTS[0])&&!internal.querySelector('a').hasAttribute('target'));
    // Force a catalogue completion without another upstream read, using this exact live snapshot.
    goCollection(Number(homeTiles[0].dataset.categoryId));let selected=page.querySelector('.filter-option input');selected.checked=true;selected.dispatchEvent(new Event('change',{bubbles:true}));const beforeReload=page.querySelector('.ps-count').textContent;
    const loader=WooCatalog.loadStore,snapshot={products:PRODUCTS.slice(),categories:STORE_CATEGORIES.slice()};
    try{WooCatalog.loadStore=async()=>snapshot;await loadWooCatalogue();check('Catalogue retry preserves collection filters',page.querySelector('.ps-count').textContent===beforeReload&&page.querySelectorAll('.filter-option input:checked').length>0,{expected:beforeReload,actual:page.querySelector('.ps-count').textContent,checked:page.querySelectorAll('.filter-option input:checked').length,active:_currentPage,state:catalogueState});}finally{WooCatalog.loadStore=loader;}
    // A same-product older request must not overwrite its newer result.
    const parent=PRODUCTS.find(p=>p.type==='variable');const originalVariations=WooCart.variations;const pending=[];
    try{
      WooCart.variations=()=>new Promise(resolve=>pending.push(resolve));openProduct(parent.id);openProduct(parent.id);
      pending[1]([{id:999902,type:'variation',name:'Newer response'}]);await new Promise(r=>setTimeout(r,0));pending[0]([{id:999901,type:'variation',name:'Older response'}]);await new Promise(r=>setTimeout(r,0));check('Latest variation request wins',productVariations[0]?.id==='999902');
      productChoices={audit:'selected'};selectedVariation={id:'audit'};variationStatus='ready';document.getElementById('prod-reset-options').click();check('Clear choices resets selection',Object.keys(productChoices).length===0&&selectedVariation===null);
    }finally{WooCart.variations=originalVariations;}
    go('home');
    return {status:'passed',checks:checks.length,categoryLinks:categoryLinks.length,tiles:document.querySelectorAll('.cat-tile').length,home:homeResults};
  }catch(error){failures.push({message:error.message,last:checks.at(-1)});return {status:'failed',passed:checks.filter(c=>c.ok).length,failures};}
  finally{wishlist=wishlistBefore;persistWishlist();go('home');}
})
