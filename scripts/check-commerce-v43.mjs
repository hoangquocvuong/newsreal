import fs from 'node:fs';
const s=fs.readFileSync('public/admin.html','utf8');
const checks=[
 ['reset owner exists', /commerceV43ResetProductForm=function/],
 ['reset clears private images', /images=\[\];[\s\S]{0,220}cover\.value=''/],
 ['reset clears current image grid', /oldGrid\.innerHTML=''/],
 ['reset hides current images', /oldWrap\.classList\.add\('hidden'\)/],
 ['reset clears file input', /filesInput\.value=''/],
 ['add another uses reset owner', /v38AddAnother[\s\S]{0,220}commerceV43ResetProductForm/],
 ['capture handler uses reset owner', /#v38AddAnother,#v35AddAnother[\s\S]{0,350}commerceV43ResetProductForm/],
 ['bad cross-closure reset removed', s=>!s.includes('f.reset(); syncOld([])')],
];
let bad=0;for(const [n,r] of checks){const ok=typeof r==='function'?r(s):r.test(s);console.log(ok?'PASS':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce image reset V43: PASS');
