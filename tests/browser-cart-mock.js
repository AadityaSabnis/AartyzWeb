/* Install before the storefront script in an isolated browser context.
   Every cart write is answered locally; checkout and all other writes are blocked. */
(() => {
  const originalFetch = window.fetch.bind(window), records = new Map();
  const currency = {currency_code:'INR', currency_minor_unit:2, currency_symbol:'₹', currency_prefix:'₹', currency_suffix:'', currency_decimal_separator:'.', currency_thousand_separator:','};
  const cart = {items:[],items_count:0,coupons:[],errors:[],needs_shipping:true,payment_methods:['payubiz'],shipping_rates:[],totals:{}};
  let addressed = false, rate = 'flat_rate:1', coupon = false;
  const audit = window.__cartMock = {calls:[],blocked:[],cart};
  function calculate() {
    let subtotal = 0;
    cart.items.forEach(item => { const total = Number(item.prices.price)*item.quantity;subtotal += total;item.totals={...currency,line_total:String(total),line_subtotal:String(total)}; });
    const discount = coupon ? Math.min(10000,subtotal) : 0, shipping = addressed && cart.items.length ? (rate==='flat_rate:2' ? 15000 : 10000) : null;
    cart.items_count = cart.items.reduce((n,item)=>n+item.quantity,0);
    cart.totals={...currency,total_items:String(subtotal),total_discount:String(discount),total_shipping:shipping===null?null:String(shipping),total_tax:'0',total_fees:'0',total_price:String(subtotal-discount+(shipping||0))};
    cart.coupons=coupon?[{code:'AUDIT10',totals:{...currency,total_discount:String(discount)}}]:[];
    cart.shipping_rates=addressed&&cart.items.length?[{package_id:0,name:'Delivery',shipping_rates:[
      {...currency,rate_id:'flat_rate:1',name:'Standard test delivery',price:'10000',selected:rate==='flat_rate:1'},
      {...currency,rate_id:'flat_rate:2',name:'Express test delivery',price:'15000',selected:rate==='flat_rate:2'}]}]:[];
    return cart;
  }
  const response = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cart-Token':'isolated.mock.wiring'}});
  window.fetch = async (value, options={}) => {
    const url = new URL(typeof value==='string'?value:value.url,location.href), method=options.method||'GET';
    if (url.pathname==='/api/store/config') return response({checkout_enabled:false,store_url:'https://aartyz.in'});
    if (url.pathname.startsWith('/api/store/cart')) {
      const body=options.body?JSON.parse(options.body):null, action=url.pathname.split('/').pop();audit.calls.push({method,action,body});
      if(method==='POST') {
        if(action==='add-item') {
          const product=records.get(Number(body.id));if(!product)throw new Error('Mock missing catalogue record');
          cart.items.push({key:'mock-'+body.id,id:body.id,name:product.name,quantity:body.quantity,variation:body.variation||[],images:product.images||[],prices:product.prices,quantity_limits:{minimum:1,maximum:999,multiple_of:1,editable:true},totals:{}});
        } else if(action==='update-item') cart.items.find(item=>item.key===body.key).quantity=body.quantity;
        else if(action==='remove-item') cart.items=cart.items.filter(item=>item.key!==body.key);
        else if(action==='apply-coupon') {if(body.code!=='AUDIT10')return response({message:'Invalid audit coupon'},400);coupon=true;}
        else if(action==='remove-coupon') coupon=false;
        else if(action==='update-customer') {addressed=true;cart.billing_address=body.billing_address;cart.shipping_address=body.shipping_address;}
        else if(action==='select-shipping-rate') rate=body.rate_id;
        else {audit.blocked.push(action);throw new Error('Unmocked write blocked');}
      }
      return response(calculate());
    }
    if(method!=='GET'){audit.blocked.push(url.href);throw new Error('All non-cart writes are blocked in this audit');}
    const result=await originalFetch(value,options);
    if(url.pathname==='/api/catalog/products'&&result.ok){const rows=await result.clone().json();rows.forEach(product=>records.set(Number(product.id),product));}
    return result;
  };
})();
