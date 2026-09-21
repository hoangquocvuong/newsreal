import fs from 'node:fs';
const admin=fs.readFileSync('public/admin.html','utf8');
const js=fs.readFileSync('public/assets/admin.js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['no legacy inline submit interception',!admin.includes('onsubmit="return window.commerceV34Submit(event)"')],
 ['simple options wording',admin.includes('Sản phẩm có nhiều lựa chọn?')&&admin.includes('＋ Thêm màu / kích thước')],
 ['technical variant button hidden',admin.includes('id="commerceGenerateVariants" hidden')],
 ['gallery uploads through tenant upload API',js.includes("fetch(tenantUrl('/upload')")&&js.includes('commerceGalleryImages.push(d.url)')],
 ['publish hides editor and moves to product list',js.includes("card.style.display='none'")&&js.includes("commerceProductsPanel')?.scrollIntoView")],
 ['admin product edit exists',js.includes('function commerceEditProduct')&&js.includes('Lưu thay đổi')],
 ['category rename and delete exist',js.includes('commerceRenameCategory')&&js.includes('commerceRemoveCategory')],
 ['server protects nonempty category delete',api.includes('Danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước khi xóa.')],
 ['cache v36',admin.includes('/assets/admin.js?v=20260921-v36')]
];
for(const [n,ok] of checks){if(!ok)throw new Error('FAIL '+n);console.log('PASS '+n)}
console.log('Commerce Admin Management V36: PASS');
