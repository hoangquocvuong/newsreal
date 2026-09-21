import fs from 'node:fs';
const s=fs.readFileSync('public/assets/admin.js','utf8');
const checks=[
 ['fallback categories synchronous',/comPaintLocalCategories\(\);/],
 ['nine defaults',/Công nghệ.*Điện thoại.*Thời trang.*Mỹ phẩm.*Gia dụng.*Nội thất.*Phụ kiện.*Thể thao.*Khác/],
 ['category paints before API',/async function loadCommerceCategories\(\).*comPaintCategories\(comMergeCategories\(\[\]\),prev\);try/s],
 ['products do not await categories',/async function loadCommerceProducts\(\).*comPaintLocalCategories\(\).*loadCommerceCategories\(\);try/s],
 ['product timeout',/Không tải được sản phẩm\. Bấm Tải lại/],
 ['product retry',/loadCommerceProducts\(\)/],
 ['simple admin CSS',/commerceSimpleV29Style/],
 ['responsive one column',/@media\(max-width:760px\)/]
];
let ok=true;for(const [n,re] of checks){const pass=re.test(s);console.log((pass?'PASS ':'FAIL ')+n);if(!pass)ok=false}if(!ok)process.exit(1);console.log('Commerce Admin Init V29: PASS');
