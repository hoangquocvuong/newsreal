import fs from 'node:fs';
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const checks=[
 ['server derives Admin capabilities from structure',api.includes('function deriveAdminCapabilities(structure={},editorProfile={})')],
 ['API exposes derived capabilities',api.includes('content_profile.admin_capabilities=deriveAdminCapabilities(categoryStructure,content_profile)')],
 ['commerce comes from template contract/data',api.includes('!!sp.commerce_contract')&&api.includes('sp.admin_modules')],
 ['lead inbox comes from template contract/data',api.includes('!!sp.lead_contract')&&api.includes('sp.admin_modules')],
 ['Admin consumes capability contract',admin.includes('admin-capabilities-v[12]')],
 ['Admin menu visibility is capability driven',admin.includes('if(commerce.products)modules.push')&&admin.includes('if(commerce.orders)modules.push')&&admin.includes('if(commerce.payment_shipping)modules.push')],
 ['Admin no longer keys commerce menu to dich-vu-5',!admin.includes("if(serviceKey==='dich-vu-5'){['menuCommerceProducts'")],
 ['unsupported deep-link fails closed',admin.includes('const allowed=new Set')&&admin.includes('!allowed.has(wanted)')]
];
console.log('Universal Dynamic Admin Capability Contract V41');
let bad=0;for(const [n,ok] of checks){console.log((ok?'OK  ':'FAIL ')+n);if(!ok)bad++}if(bad)process.exit(1);console.log('Universal Dynamic Admin Capability Contract V41: PASS');
