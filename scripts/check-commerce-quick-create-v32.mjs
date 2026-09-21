import fs from 'node:fs';
const h=fs.readFileSync('public/admin.html','utf8'),j=fs.readFileSync('public/assets/admin.js','utf8');
const checks=[
 ['v32 cache',h.includes('/assets/admin.js?v=20260921-v32')],
 ['inline category box',h.includes('commerceQuickCategoryBox')&&h.includes('commerceQuickCategorySave')],
 ['no prompt quick add',!j.includes("prompt('Tên danh mục mới")],
 ['local category immediate',j.includes("comPaintCategories(comMergeCategories(COM_ADMIN_CATEGORIES), 'name:'+name)")],
 ['simple option rows',h.includes('commerceSimpleOptionRows')&&j.includes('comSimpleOptionGroups')],
 ['variant generator',j.includes('comGenerateSimpleVariants')&&j.includes('Các lựa chọn bán (')]
];
let ok=true; for(const [n,v] of checks){console.log((v?'PASS ':'FAIL ')+n);if(!v)ok=false} if(!ok)process.exit(1);console.log('Commerce Quick Create V32: PASS');
