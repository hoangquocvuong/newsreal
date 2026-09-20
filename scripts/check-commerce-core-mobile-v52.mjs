import fs from 'node:fs';
const site=fs.readFileSync('public/assets/site.js','utf8');
const worker=fs.readFileSync('functions/[[path]].js','utf8');
const checks=[
 ['product card renderer defined',site.includes('function comProductCards(')],
 ['8 products per page',site.includes('const COM_PAGE_SIZE=8')],
 ['pagination UI',site.includes('function comPagination(')&&site.includes('function comGoPage(')],
 ['related products',site.includes('Sản phẩm liên quan')],
 ['mobile two-column grid',site.includes('grid-template-columns:repeat(2,minmax(0,1fr))')],
 ['mobile checkout scroll',site.includes('height:100dvh')&&site.includes('overflow-y:auto!important')],
 ['discovery block replaces promo',site.includes('Khám phá nhanh')],
 ['demo promo voucher removed',!worker.includes('Voucher WELCOME10')&&worker.includes('Khám phá sản phẩm dễ hơn')],
];
let bad=0;for(const [n,ok] of checks){console.log(ok?'PASS':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce Core + Mobile V52: PASS');
