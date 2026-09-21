import fs from 'node:fs';
const h=fs.readFileSync('public/admin.html','utf8');
const checks=[
 ['cache v33',h.includes('/assets/admin.js?v=20260921-v33')],
 ['category click direct',h.includes('commerceV33OpenCategory(event)')],
 ['category save direct',h.includes('commerceV33SaveCategory(event)')],
 ['option add direct',h.includes('commerceV33AddOption(event)')],
 ['variant direct',h.includes('commerceV33GenerateVariants(event)')],
 ['local category persistence',h.includes('nr_commerce_custom_categories')],
 ['variant matrix output',h.includes('data-variant-row')]
];
let ok=true;for(const [n,v] of checks){console.log((v?'PASS ':'FAIL ')+n);if(!v)ok=false}if(!ok)process.exit(1);console.log('Commerce Click Hotfix V33: PASS');
