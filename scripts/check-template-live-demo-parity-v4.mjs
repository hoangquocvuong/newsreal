import fs from 'node:fs';
const site=fs.readFileSync(new URL('../public/assets/site.js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../functions/[[path]].js',import.meta.url),'utf8');
const contracts=fs.readFileSync(new URL('../functions/_shared/template-contracts.js',import.meta.url),'utf8');
const must=[
 ['lion live uses same package heading', site.includes('Chọn đội hình theo quy mô sự kiện')],
 ['lion live package has excerpt', site.includes('ld-pack-excerpt')],
 ['lion live price reveal matches demo', site.includes('ld-pack-price')&&site.includes('Giá tiền')],
 ['lion live detail CTA matches demo', site.includes('Xem chi tiết gói →')],
 ['lion live extended heading matches demo', site.includes('MỞ RỘNG CHƯƠNG TRÌNH')],
 ['global registry remains present', contracts.includes('GLOBAL_TEMPLATE_KEYS')],
 ['showroom lion renderer remains present', worker.includes('function lionDemoHome')]
];
let bad=0;for(const [n,ok] of must){console.log(`${ok?'OK':'FAIL'} ${n}`);if(!ok)bad++}if(bad)process.exit(1);console.log('Live/demo parity V4: PASS');
