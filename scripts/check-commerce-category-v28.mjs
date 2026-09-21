import fs from 'node:fs';
const a=fs.readFileSync('public/assets/admin.js','utf8');const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
['fallback categories',a.includes('COMMERCE_FALLBACK_CATEGORY_NAMES')],
['local custom categories',a.includes('nr_commerce_custom_categories')],
['category name payload',a.includes('b.category_name=selectedCategoryName')],
['server resolves category name',api.includes('resolvedCategoryId')&&api.includes('categoryName')],
['product rejects missing category',api.includes("if(!resolvedCategoryId)return json({error:'Vui lòng chọn danh mục'}")],
['GET category no schema bootstrap dependency',api.includes("if(request.method==='GET'){try{const {results=[]}=await env.DB.prepare(`SELECT * FROM commerce_categories")],
];let ok=true;for(const [n,v] of checks){console.log((v?'PASS ':'FAIL ')+n);if(!v)ok=false}if(!ok)process.exit(1);console.log('Commerce Category Decoupling V28: PASS');
