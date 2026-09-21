import fs from 'node:fs';
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['category timeout increased',admin.includes('20000')],
 ['create requires server confirmation',admin.includes("!created?.ok||!created?.category?.id")],
 ['new category selected by id',admin.includes('Number(x.id)===Number(created.category.id)')],
 ['no false success before reload',admin.includes("if(!c)throw new Error('Đã lưu nhưng chưa đọc lại được danh mục. Bấm Tải lại.')")],
 ['auth checked before category bootstrap',api.includes("if(route==='commerce/categories'){\n if(!user)return json({error:'Chưa đăng nhập'},401);await commerceEnsureAdminCategories()")],
 ['default categories active only',api.includes('WHERE site_id=? AND is_active=1 ORDER BY sort_order,id')],
 ['category create idempotent',api.includes('INSERT OR IGNORE INTO commerce_categories(site_id,name,slug,description,fields_schema_json,sort_order,is_active)')],
 ['created category returned',api.includes("return json({ok:true,id:category.id,category})")],
];
let bad=0;for(const [n,ok] of checks){console.log(ok?'PASS':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce Category Reliability V27: PASS');
