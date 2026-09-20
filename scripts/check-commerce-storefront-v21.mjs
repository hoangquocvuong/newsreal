import fs from 'node:fs';
const s=fs.readFileSync('public/assets/site.js','utf8');
const checks=[
 ['new commerce namespace',s.includes('class="commerce21"')],
 ['full viewport breakout',s.includes('margin-left:calc(50% - 50vw)')],
 ['1280 desktop shell',s.includes('width:min(1280px,calc(100% - 48px))')],
 ['new hero copy',s.includes('Sản phẩm tốt. Giá hợp lý. Mua thật dễ.')],
 ['mobile two columns',s.includes('grid-template-columns:repeat(2,minmax(0,1fr))')],
 ['old shop18 removed',!s.includes('shop18')],
 ['old s18 namespace removed',!s.includes('s18-')],
];
let bad=0;for(const [n,ok] of checks){console.log(ok?'OK ':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce Storefront V21: PASS');
