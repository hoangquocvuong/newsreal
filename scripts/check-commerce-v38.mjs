import fs from 'node:fs';
const h=fs.readFileSync('public/admin.html','utf8');
const checks=[
 ['v38 cache',h.includes('/assets/admin.js?v=20260921-v38')],
 ['direct V38 button',h.includes('onclick="return window.commerceV38Publish(event)"')],
 ['no not-ready alert',!h.includes('Trang quản trị chưa tải xong')],
 ['native form blocked',h.includes('id="commerceProductForm" onsubmit="return false"')],
 ['single pipeline',h.includes('id="commerce-v38-single-pipeline"')],
 ['context preserved',h.includes("for(const k of ['tenant','nr_trial','template'])")],
 ['own upload input',h.includes('oldFiles.replaceWith(clone)')],
 ['cover selection',h.includes('⭐ Ảnh đại diện') && h.includes('data-v38-cover')],
 ['no legacy slider UI',!h.includes('Đưa sản phẩm lên Slider nổi bật')],
 ['publish API',h.includes("jsonApi('/commerce/products'")],
 ['hide form after success',h.includes("card.style.display='none'")],
];
let bad=0;for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++}
if(bad)process.exit(1);console.log('Commerce Admin Single Pipeline V38: PASS');
