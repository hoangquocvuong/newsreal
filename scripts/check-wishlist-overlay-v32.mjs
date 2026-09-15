import fs from 'node:fs';
const worker=fs.readFileSync('functions/[[path]].js','utf8');
const checks=[
 ['wishlist is fixed overlay',worker.includes('.ec-wish{position:fixed;inset:0')&&worker.includes('.ec-wish.open{display:flex}')],
 ['wishlist is above storefront/footer',worker.includes('z-index:110')],
 ['wishlist panel has bounded viewport scroll',worker.includes('max-height:calc(100vh - 100px)')],
 ['wishlist closes on backdrop',worker.includes("e.target.id==='ecWish'")],
 ['wishlist closes with Escape',worker.includes("e.key==='Escape'")],
 ['mobile wishlist is fullscreen',worker.includes('.ec-wish{padding:0;align-items:stretch}')],
 ['commerce lead copy is generic',worker.includes('Sản phẩm quan tâm, số lượng, ngân sách hoặc yêu cầu khác...')&&!worker.includes('Nhu cầu: văn phòng, gaming, đồ họa, ngân sách...')],
 ['commerce lead category is generic',worker.includes('value="Sản phẩm"')],
];
let ok=true;for(const [n,v] of checks){console.log(v?'OK':'FAIL',n);if(!v)ok=false}if(!ok)process.exit(1);console.log('Wishlist Overlay & Commerce Cleanup Contract V32: PASS');
