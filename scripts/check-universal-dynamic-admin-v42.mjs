import fs from 'node:fs';
const html=fs.readFileSync('public/admin.html','utf8'), js=fs.readFileSync('public/assets/admin.js','utf8'), api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['optional commerce menus absent from static HTML',!html.includes('id="menuCommerceProducts"')&&!html.includes('id="menuCommerceOrders"')&&!html.includes('id="menuCommerceSettings"')],
 ['dynamic module mount exists',html.includes('id="dynamicAdminModules"')],
 ['cache bust updated',html.includes('20.9.27.54-dynamic-admin-2')],
 ['Admin builds commerce menus from capabilities',js.includes("if(commerce.products)modules.push")&&js.includes("if(commerce.orders)modules.push")&&js.includes("if(commerce.payment_shipping)modules.push")],
 ['API uses admin_modules declaration',api.includes("sp.admin_modules&&typeof sp.admin_modules==='object'")],
 ['generic section names cannot grant commerce',!api.includes("hasSection('products','catalog','shop','store')")],
 ['legacy commerce contract remains compatible',api.includes("!!sp.commerce_contract||type==='commerce'")],
 ['capability v2 accepted',js.includes("admin-capabilities-v[12]")],
];
let bad=0;console.log('Universal Dynamic Admin V42');for(const [n,ok] of checks){console.log(ok?'OK ':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Universal Dynamic Admin V42: PASS');
