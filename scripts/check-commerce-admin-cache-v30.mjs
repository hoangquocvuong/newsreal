import fs from 'node:fs';
const h=fs.readFileSync('public/admin.html','utf8');
const j=fs.readFileSync('public/assets/admin.js','utf8');
const checks=[
 ['cache bumped',h.includes('/assets/admin.js?v=20260921-v30')],
 ['no loading category placeholder',!h.includes('<option value="0">Đang tải danh mục...</option>')],
 ['html has defaults',['Công nghệ','Điện thoại','Thời trang','Mỹ phẩm','Gia dụng','Nội thất','Phụ kiện','Thể thao','Khác'].every(x=>h.includes('data-name="'+x+'"'))],
 ['js has defaults',j.includes("COMMERCE_FALLBACK_CATEGORY_NAMES=['Công nghệ','Điện thoại','Thời trang','Mỹ phẩm','Gia dụng','Nội thất','Phụ kiện','Thể thao','Khác']")],
 ['js paints immediately',j.includes('comInstallSimpleAdminStyle();comPaintLocalCategories();')]
];
let bad=0; for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n); if(!ok)bad++} if(bad)process.exit(1); console.log('Commerce Admin Cache V30: PASS');
