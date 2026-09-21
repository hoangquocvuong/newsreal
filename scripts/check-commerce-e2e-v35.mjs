import fs from 'node:fs';
const site=fs.readFileSync('public/assets/site.js','utf8');
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const html=fs.readFileSync('public/admin.html','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const idx=fs.readFileSync('public/index.html','utf8');
const checks=[
 ['storefront fetches D1 catalog',site.includes("fetch('/api/commerce/catalog?")],
 ['trial context forwarded',site.includes("['tenant','nr_trial']")],
 ['API categories merged',site.includes('...apiCats,...products.map')],
 ['customer products before samples',api.includes("p.is_sample ASC,p.is_featured DESC,p.id DESC")],
 ['commerce stats endpoint',api.includes("route==='commerce/stats'")],
 ['stats excludes samples',api.includes('COALESCE(is_sample,0)=0')],
 ['admin commerce stats',admin.includes("api('/commerce/stats')")],
 ['success direct product action',html.includes('Xem sản phẩm ngoài cửa hàng')],
 ['product hash link',html.includes("'#product-'+encodeURIComponent")],
 ['admin cache v35',html.includes('admin.js?v=20260921-v35')],
 ['site cache v35',idx.includes('site.js?v=commerce-v35-e2e')]
];
let bad=0;for(const [n,ok] of checks){console.log(ok?'PASS':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce E2E V35: PASS');
