import fs from 'node:fs';
const html=fs.readFileSync('public/admin.html','utf8'),js=fs.readFileSync('public/assets/admin.js','utf8'),css=fs.readFileSync('public/assets/style.css','utf8'),api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['SKU field is readonly',/id="commerceProductSku"[^>]*readonly/.test(html)],
 ['SKU auto preview exists',js.includes('commerceSkuPreview')],
 ['server auto SKU fallback exists',api.includes('commerceAutoSku(name)')],
 ['empty commerce categories auto seed',api.includes('commerceEnsureAdminCategories')],
 ['menu labels stay one line',css.includes('white-space:nowrap')&&css.includes('text-overflow:ellipsis')],
 ['category explains homepage sync',html.includes('ngoài trang chủ')]
];
let bad=0;for(const [n,ok] of checks){console.log(ok?'OK  ':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Admin Commerce UX V42: PASS');
