import fs from 'node:fs';
const site=fs.readFileSync('public/assets/site.js','utf8');
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const html=fs.readFileSync('public/admin.html','utf8');
const fn=fs.readFileSync('functions/[[path]].js','utf8');
const checks=[
 ['one commerce demo renderer',fn.includes("demo==='dich-vu-5'")&&fn.includes('exact same client storefront')],
 ['professional guard excludes commerce',fn.includes("PRO_DEMO_KEYS.has(demo)&&demo!=='dich-vu-5'")],
 ['commerce V15 css',site.includes("st.id='comV15Css'")],
 ['professional trust strip',site.includes('com-trustbar')],
 ['8 products per page',site.includes('const COM_PAGE_SIZE=8')],
 ['related products',site.includes('Sản phẩm liên quan')],
 ['mobile two columns',site.includes('grid-template-columns:repeat(2,minmax(0,1fr))')],
 ['checkout mobile scroll',site.includes('padding-bottom:max(80px,env(safe-area-inset-bottom))')],
 ['voucher input removed',!site.includes('placeholder="Mã giảm giá / voucher"')],
 ['admin quick product form',html.includes('commerce-quick-card')&&html.includes('Sản phẩm chung')],
 ['advanced schema collapsed',html.includes('<details class="commerce-admin-card commerce-advanced">')],
 ['admin category timeout fallback',admin.includes("new Error('timeout')")&&admin.includes('Form đăng nhanh vẫn hoạt động bình thường')],
 ['admin submit busy feedback',admin.includes('Đang đăng sản phẩm...')]
];
let bad=0;for(const [n,ok] of checks){console.log(ok?'PASS':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce Rebuild V53: PASS');
