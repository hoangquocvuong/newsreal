import fs from 'node:fs';
const s=fs.readFileSync('public/assets/site.js','utf8');
const a=s.indexOf('async function renderCommerceStore('),b=s.indexOf('\n\nfunction renderShowcaseTemplate(',a),r=s.slice(a,b);
const checks=[['reset marker',r.includes('data-commerce-reset="true"')],['old V21 namespace not rendered',!r.includes('commerce21')&&!r.includes('c21-')],['old shop18 namespace not rendered',!r.includes('shop18')&&!r.includes('s18-')],['old hero not rendered',!r.includes('Sản phẩm tốt. Giá hợp lý. Mua thật dễ.')],['backend detail remains connected',r.includes("fetch(comApi('catalog'))")&&r.includes('comRenderProductDetail')]];
let f=0;for(const [n,v] of checks){console.log((v?'OK  ':'FAIL ')+n);if(!v)f++}if(f)process.exit(1);console.log('Commerce Reset V22: PASS');
