import fs from 'node:fs';
const site=fs.readFileSync('public/assets/site.js','utf8');
const admin=fs.readFileSync('public/admin.html','utf8');
const checks=[
 ['homepage featured showcase',site.includes('Sản phẩm nổi bật')],
 ['homepage new showcase',site.includes('Mới lên kệ')],
 ['category showcase',site.includes('categoryShowcases')],
 ['catalog pagination 8',site.includes('PAGE=8')],
 ['cart retained',site.includes('v24CartBtn')&&site.includes('openCart')],
 ['wishlist retained',site.includes('v24WishBtn')&&site.includes('openWish')],
 ['balanced detail',site.includes('v25-summary')&&site.includes('v25-tabpanel')],
 ['related products',site.includes('Sản phẩm liên quan')],
 ['admin create category',admin.includes('commerceQuickAddCategory')],
 ['admin category manager',admin.includes('commerce-v46-category-manager')],
 ['admin delete category',admin.includes("method:'DELETE'")&&admin.includes('data-cat-delete')],
 ['admin edit category',admin.includes("method:'PUT'")&&admin.includes('data-cat-edit')]
];
let bad=0;for(const [n,ok] of checks){console.log(ok?'PASS':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce Final Storefront V46: PASS');
