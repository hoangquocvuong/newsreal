import fs from 'node:fs';
const h=fs.readFileSync('public/admin.html','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['v34 cache',h.includes('admin.js?v=20260921-v34')],
 ['submit hard guard',h.includes('onsubmit="return window.commerceV34Submit(event)"')],
 ['prevent default',h.includes('stopImmediatePropagation')],
 ['category persists through API',h.includes("apiCall('/commerce/categories',{method:'POST'")],
 ['category requires server id',h.includes("!c.id")],
 ['category reload GET',h.includes("apiCall('/commerce/categories')")],
 ['product posts via API',h.includes("apiCall('/commerce/products',{method:'POST'")],
 ['trial params preserved',h.includes("['tenant','nr_trial','template']")],
 ['backend returns category',api.includes('return json({ok:true,id:category.id,category})')],
 ['backend resolves category name',api.includes("const categoryName=String(b.category_name||'').trim()")]
];
let bad=0;for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce Persistence V34: PASS');
