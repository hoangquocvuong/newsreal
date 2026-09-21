import fs from 'node:fs';
const s=fs.readFileSync(new URL('../public/assets/site.js', import.meta.url),'utf8');
const checks=[
 ['cart drawer above product detail',s.includes('z-index:2147483600')],
 ['add cart confirmation',s.includes('✓ Đã thêm vào giỏ')],
 ['buy now opens checkout',s.includes("openCart();checkout()")],
 ['simple product description',s.includes('Mô tả sản phẩm')],
 ['legacy specs removed from commerce detail',!s.slice(s.indexOf('function renderCommerceStore')).includes('Thông số & thuộc tính')],
 ['legacy variants removed from commerce detail',!s.slice(s.indexOf('function renderCommerceStore')).includes('data-v25-variant')],
 ['related products kept',s.includes('Sản phẩm liên quan')],
 ['gallery kept',s.includes('data-v25-thumb')]
];
let bad=0; for(const [n,ok] of checks){console.log(ok?'PASS':'FAIL',n); if(!ok)bad++;} if(bad)process.exit(1); console.log('Commerce Product Detail/Cart V45: PASS');
