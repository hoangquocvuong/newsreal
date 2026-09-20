import fs from 'node:fs';
const s=fs.readFileSync('public/assets/site.js','utf8');
const i=fs.readFileSync('public/index.html','utf8');
const checks=[
 ['new market renderer',s.includes('class="market17"')],
 ['new category sidebar',s.includes('Danh mục mua sắm')&&s.includes('m17CategoryMenu')],
 ['new storefront search',s.includes('Bạn đang tìm sản phẩm gì?')],
 ['catalog remains 8 per page',s.includes('const COM_PAGE_SIZE=8')],
 ['mobile two-column grid',s.includes('grid-template-columns:repeat(2,minmax(0,1fr))')],
 ['cart checkout retained',s.includes('Thông tin nhận hàng')&&s.includes('Xác nhận đặt hàng')],
 ['single commerce renderer route',s.includes("if(preset==='universal_commerce_5'){renderCommerceStore(site);return}")],
 ['fresh cache key',i.includes('commerce-v17-new')],
 ['legacy hero not invoked by renderer',!s.slice(s.indexOf('async function renderCommerceStore'),s.indexOf('function renderShowcaseTemplate')).includes('comRenderFeaturedHero(')]
];
for(const [n,ok] of checks){if(!ok){console.error('FAIL:',n);process.exit(1)}}
console.log('Commerce Fresh Storefront V55: PASS');
