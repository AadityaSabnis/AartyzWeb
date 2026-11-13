(async function auditShoppingControls() {
  if(!window.__cartMock)throw new Error('Install browser-cart-mock.js before loading the storefront.');
  if(catalogueState!=='ready')return {status:catalogueState};
  const checks=[];const check=(name,ok)=>{checks.push({name,ok:!!ok});if(!ok)throw new Error(name);};
  async function wait(condition,name){const end=Date.now()+5000;while(!condition()){if(Date.now()>end)throw new Error('Timed out '+name);await new Promise(r=>setTimeout(r,20));}}
  try{
    await wait(()=>!liveCart.busy,'initial cart');
    const product=PRODUCTS.find(p=>p.type==='simple'&&p.inStock&&p.purchasable&&p.price!==null&&p.quantityLimits.minimum===1&&p.quantityLimits.maximum>=3);
    openProduct(product.id);document.getElementById('prod-buy-link').click();await wait(()=>!liveCart.busy&&liveCart.data.items.length===1,'add');
    check('Product Add to cart uses its Woo ID',__cartMock.calls.some(c=>c.action==='add-item'&&c.body.id===Number(product.id)));
    document.querySelector('.product-view-cart').click();await wait(()=>!liveCart.busy,'view cart read');check('View cart opens custom cart',_currentPage==='cart'&&document.querySelectorAll('.cart-item').length===1);
    document.querySelector('.cart-quantity button[aria-label^="Increase"]').click();await wait(()=>!liveCart.busy&&liveCart.data.items[0].quantity===2,'increase');check('Quantity increase reaches API',__cartMock.calls.some(c=>c.action==='update-item'&&c.body.quantity===2));
    document.querySelector('.cart-quantity button[aria-label^="Decrease"]').click();await wait(()=>!liveCart.busy&&liveCart.data.items[0].quantity===1,'decrease');check('Quantity decrease reaches API',__cartMock.calls.some(c=>c.action==='update-item'&&c.body.quantity===1));
    document.getElementById('coupon-input').value='AUDIT10';document.querySelector('[onclick="applyCoupon()"]').click();await wait(()=>!liveCart.busy&&liveCart.data.coupons.length===1,'coupon');check('Coupon action renders server discount',document.getElementById('cart-discount').textContent.includes('100'));
    document.querySelector('#cart-coupons button').click();await wait(()=>!liveCart.busy&&!liveCart.data.coupons.length,'remove coupon');check('Coupon removal reaches API',__cartMock.calls.some(c=>c.action==='remove-coupon'));
    document.querySelector('#cart-summary [onclick="go(\'checkout\')"]').click();await wait(()=>!liveCart.busy,'checkout cart read');check('Proceed opens custom checkout',_currentPage==='checkout');
    const form=document.getElementById('checkout-form');Object.entries({first_name:'Wiring',last_name:'Audit',email:'audit@example.com',phone:'0000000000',address_1:'Test address',address_2:'',city:'Nagpur',postcode:'440025',state:'MH'}).forEach(([key,value])=>form.elements[key].value=value);
    form.dispatchEvent(new Event('input',{bubbles:true}));form.requestSubmit();await wait(()=>!liveCart.busy&&reviewedAddress,'delivery review');check('Address review reaches API',__cartMock.calls.some(c=>c.action==='update-customer'));check('Delivery rates render',document.querySelectorAll('#checkout-rates input[type=radio]').length===2);
    const express=[...document.querySelectorAll('#checkout-rates input')][1];express.checked=true;express.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>!liveCart.busy&&liveCart.data.shipping_rates[0].shipping_rates[1].selected,'rate selection');check('Rate selection reaches API',__cartMock.calls.some(c=>c.action==='select-shipping-rate'&&c.body.rate_id==='flat_rate:2'));
    form.elements.city.value='Changed city';form.elements.city.dispatchEvent(new Event('input',{bubbles:true}));check('Address edits invalidate reviewed quote',reviewedAddress===''&&reviewedQuote==='');
    check('Payment remains disabled',document.getElementById('checkout-pay').disabled&&!checkoutConfig.checkout_enabled);document.getElementById('checkout-pay').click();check('No order or payment requested',!__cartMock.calls.some(c=>c.action==='checkout')&&!__cartMock.blocked.length);
    go('cart');await wait(()=>!liveCart.busy,'cart return');[...document.querySelectorAll('.cart-item button')].find(b=>b.textContent==='Remove').click();await wait(()=>!liveCart.busy&&!liveCart.data.items.length,'remove');check('Remove empties cart',document.getElementById('cart-empty').style.display==='block');
    check('Every mutation stayed inside mock',__cartMock.calls.filter(c=>c.method==='POST').length===8&&!__cartMock.blocked.length);
    return {status:'passed',checks:checks.length,mutations:__cartMock.calls.filter(c=>c.method==='POST').map(c=>c.action),realWrites:0};
  }catch(error){return {status:'failed',checks,reason:error.message};}
})
