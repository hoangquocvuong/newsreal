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

// D1 persistence arity regression: template_catalog has 29 columns including
// updated_at=CURRENT_TIMESTAMP, therefore exactly 28 placeholders/bind values.
for (const [label,src] of [['API', api]]) {
  const m=src.match(/INSERT INTO template_catalog\s*\(([\s\S]*?)\)\s*VALUES\(([\s\S]*?)\)\s*ON CONFLICT\(template_key\)[\s\S]*?\.bind\(([^;]*?)\)\.run\(\)/);
  if(!m){console.log('FAIL',`${label} template_catalog UPSERT not found`);process.exit(1)}
  const columns=m[1].split(',').map(x=>x.trim()).filter(Boolean);
  const placeholders=(m[2].match(/\?/g)||[]).length;
  const bindValues=m[3].split(',').map(x=>x.trim()).filter(Boolean).length;
  if(columns.length!==29 || placeholders!==28 || bindValues!==28){console.log('FAIL',`${label} D1 template persistence arity mismatch: columns=${columns.length}, placeholders=${placeholders}, binds=${bindValues}`);process.exit(1)}
  console.log('OK ',`${label} D1 template persistence arity 29 columns / 28 binds`);
}
