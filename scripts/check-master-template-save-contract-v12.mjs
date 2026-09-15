import fs from 'node:fs';
const master=fs.readFileSync('public/assets/master.js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['Master existing-template save is non-blocking', master.includes('!geometryLocked&&!isExisting')],
 ['Master structure normalizer infers category', master.includes('const inferredCategory=String(x?.category')],
 ['API existing-template save is non-blocking', api.includes('!legacyGeometryLocked&&!existingTemplate')],
 ['API structure normalizer infers category', api.includes('const inferredCategory=String(x?.category')],
 ['API still validates brand-new active templates', api.includes("Template mới chưa đạt chuẩn để đưa vào Kho template.")],
 ['Global pricing renewal remains base price', api.includes('const renewal=price; // GLOBAL PRICING CONTRACT')]
];
let bad=0;for(const [name,ok] of checks){console.log(ok?'OK ':'FAIL',name);if(!ok)bad++}if(bad)process.exit(1);console.log('Master Template Save Contract V12: PASS');
