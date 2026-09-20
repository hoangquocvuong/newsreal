import fs from 'node:fs';
const s=fs.readFileSync('public/assets/site.js','utf8');
const checks=[
 ['V24 renderer', 'data-commerce-v24="true"'],['pagination size','const cats=[\'Tất cả\',...new Set(products.map(x=>x.cat).filter(Boolean))],PAGE=8'],['pagination UI','id="v24Pages"'],['wishlist persistence',"WISH='nr-commerce-v24-wish'"],['cart persistence',"CART='nr-commerce-v24-cart'"],['cart drawer','id="v24Overlay"'],['checkout COD','Thanh toán khi nhận hàng (COD)'],['VietQR','Chuyển khoản / VietQR'],['product detail','id="v24Detail"'],['related products','Sản phẩm liên quan'],['mobile 2 columns','.v24-grid{grid-template-columns:repeat(2,1fr)}'],['16 demo products',"'demo-16','Balo City Pack'"]];
let ok=true;for(const [n,v] of checks){const hit=s.includes(v);console.log(hit?'PASS':'FAIL',n);if(!hit)ok=false}if(!ok)process.exit(1);console.log('Commerce V2 Upgrade V24: PASS');
