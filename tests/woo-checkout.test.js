const {test}=require('node:test');
const assert=require('node:assert/strict');
const checkout=require('../woo-checkout');
const WooCart=require('../woo-cart');
test('billing and delivery use explicit address fields; client prices cannot enter the payload',()=>{
  const result=checkout.address({first_name:' Test ',postcode:'440025',email:'test@example.com',phone:'0000000000',price:1});
  assert.equal(result.shipping_address.first_name,'Test');
  assert.equal(result.shipping_address.country,'IN');
  assert.equal(result.billing_address.email,'test@example.com');
  assert.equal(result.shipping_address.email,undefined);
  assert.equal(result.billing_address.price,undefined);
});
test('a change to items, totals or selected shipping invalidates the reviewed quote',()=>{
  const cart={items:[{key:'a',quantity:1}],totals:{total_price:'10000'},shipping_rates:[]};
  const signature=checkout.fingerprint(cart);
  assert.notEqual(signature,checkout.fingerprint({...cart,items:[{key:'a',quantity:2}]}));
  assert.notEqual(signature,checkout.fingerprint({...cart,totals:{total_price:'11000'}}));
  assert.notEqual(signature,checkout.fingerprint({...cart,shipping_rates:[{package_id:0,shipping_rates:[{selected:true,rate_id:'flat_rate:1'}]}]}));
});
test('payment redirects are limited to HTTPS store and PayU destinations',()=>{
  for(const value of ['javascript:alert(1)','https://evil.example','https://payu.in.evil.example','https://user:pass@secure.payu.in','http://aartyz.in']) assert.equal(checkout.redirect(value,'https://aartyz.in'),null);
  assert.equal(checkout.redirect('https://secure.payu.in/_payment','https://aartyz.in'),'https://secure.payu.in/_payment');
  assert.ok(checkout.redirect('https://aartyz.in/checkout/order-pay/1','https://aartyz.in'));
});
test('checkout submission uses the guest session once and never retries or clears the cart on failure',async()=>{
  let writes=0;
  const client=WooCart.create({fetcher:async(url,options)=>{
    if(url.endsWith('/checkout')) {writes++;throw new Error('Connection lost');}
    return {ok:true,headers:new Headers({'Cart-Token':'guest.session'}),json:async()=>({items:[{id:1}],totals:{total_price:'10000'}})};
  }});
  await client.read();
  await assert.rejects(client.checkout({payment_method:'payubiz'}),/Connection lost/);
  assert.equal(writes,1);assert.equal(client.data.items.length,1);
});
