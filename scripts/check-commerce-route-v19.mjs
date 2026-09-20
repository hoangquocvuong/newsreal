import fs from 'node:fs';
const s=fs.readFileSync('functions/[[path]].js','utf8');
const tests=[
 ['route dispatch',s.includes("c.kind==='laptop-store')html=commerceDemoHome(c,p,demo)")],
 ['new storefront marker',s.includes('LUMI<em>SHOP</em>')&&s.includes('n19-mainhero')],
 ['new hero copy',s.includes('Mua sắm đơn giản.')],
 ['old NOVASHOP removed from home renderer',!s.slice(s.indexOf('function commerceDemoHome'),s.indexOf('\nfunction ',s.indexOf('function commerceDemoHome')+20)).includes('NOVASHOP')],
 ['old Smartphone hero removed from home renderer',!s.slice(s.indexOf('function commerceDemoHome'),s.indexOf('\nfunction ',s.indexOf('function commerceDemoHome')+20)).includes('Smartphone Pro 5G')]
];
let bad=0;for(const [n,ok] of tests){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce Route V19: PASS');
