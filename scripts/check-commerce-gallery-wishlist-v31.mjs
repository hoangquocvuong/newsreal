import fs from 'node:fs';
const worker=fs.readFileSync('functions/[[path]].js','utf8');
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const html=fs.readFileSync('public/admin.html','utf8');
const checks=[
 ['duplicate category showcase removed',!worker.includes('Bán gì cũng được')],
 ['customer account removed from commerce header',!worker.includes('👤 Tài khoản')],
 ['wishlist has persistent storage',worker.includes("nr_commerce_demo_wishlist")],
 ['wishlist header opens real list',worker.includes("id=\"ecWishBtn\"")&&worker.includes("id=\"ecWishItems\"")],
 ['product gallery has thumbnails',worker.includes('pd-thumbs')&&worker.includes('data-gallery')],
 ['product gallery has zoom lightbox',worker.includes('pdLight')&&worker.includes('cursor:zoom-in')],
 ['product gallery supports previous next',worker.includes('pdLightPrev')&&worker.includes('pdLightNext')&&worker.includes("ArrowLeft")&&worker.includes("ArrowRight")],
 ['Admin supports multi-image upload',html.includes('commerceGalleryFiles')&&html.includes('multiple')&&admin.includes('commerceGalleryImages')],
 ['Admin can choose gallery cover',admin.includes('data-com-cover')],
];
let bad=0;for(const [n,ok] of checks){console.log(ok?'OK':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Product Gallery + Wishlist Contract V31: PASS');
