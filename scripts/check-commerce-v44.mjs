import fs from 'node:fs';
const admin=fs.readFileSync('public/admin.html','utf8');
const site=fs.readFileSync('public/assets/site.js','utf8');
const checks=[
 ['update success distinct',admin.includes("editId?'✓ Cập nhật sản phẩm thành công':'✓ Đã đăng sản phẩm thành công'")],
 ['update loading distinct',admin.includes("editId?'Đang cập nhật...':'Đang đăng sản phẩm...'")],
 ['view action exists',admin.includes('data-view="${Number(p.id)||0}"')],
 ['view preserves trial context',admin.includes("for(const k of ['nr_trial','tenant'])")&&admin.includes("u.hash='product-'")],
 ['edit delete preserved',admin.includes('data-edit="${Number(p.id)||0}"')&&admin.includes('data-del="${Number(p.id)||0}"')],
 ['detail above trial header',site.includes('z-index:2147483000')],
 ['detail back remains',site.includes('id="v24Back"')&&site.includes('← Tiếp tục mua sắm')],
 ['single detail scroller contract',site.includes('overscroll-behavior:contain') && site.includes('html.commerce-detail-open,body.commerce-detail-open{overflow:hidden!important')],
];
let bad=0; for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++} if(bad)process.exit(1); console.log('Commerce Admin/Detail V44: PASS');
