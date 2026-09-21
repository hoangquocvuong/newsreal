import fs from 'node:fs';
const s=fs.readFileSync('public/assets/site.js','utf8');
const checks=[
 ['estate news follows structure slots',/nrStructureSlots\(site,key,'news',count\)/],
 ['estate news renders contract slots',/data-contract-slot="1" href/],
 ['property sections fallback to real property pool',/const all=\(SITE_DATA\?\.posts\|\|\[\]\)\.filter\(x=>x&&x\.type==='property'/],
 ['property fill deduplicates real records',/const seen=new Set\(\),list=\[\]/],
 ['legacy skeleton function not used by estate section',/function estateCoreSection[\s\S]*?for\(const x of \[\.\.\.preferred,\.\.\.all\]\)/]
];
let ok=true;for(const [name,re] of checks){const pass=re.test(s);console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)ok=false}
if(!ok)process.exit(1);console.log('No Homepage Skeleton V55: PASS');
