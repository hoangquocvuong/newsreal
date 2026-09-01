import fs from 'node:fs';
const site=fs.readFileSync('public/assets/site.js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const required=[
  ['site exact target','nrEnforceSlotHost'],
  ['site contract audit','NR_TEMPLATE_CONTRACT_REPORT'],
  ['site service binding','data-structure-key="internet"'],
  ['backend universal contract','universal-layout-v1'],
  ['backend exact slots',"slot_contract:'exact'"],
  ['VNPT split host','.vnpt-pack-list']
];
let failed=0;
for(const [name,needle] of required){
  const haystack=name.startsWith('backend')?api:site;
  const ok=haystack.includes(needle)||(name.includes('VNPT')&&(api.includes(needle)||site.includes(needle)));
  console.log(`${ok?'OK':'FAIL'}  ${name}`);
  if(!ok)failed++;
}
for(const key of ['dich-vu-1','dich-vu-2','dich-vu-3']){
  const ok=api.includes(`'${key}'`);
  console.log(`${ok?'OK':'FAIL'}  profile ${key}`);
  if(!ok)failed++;
}
if(/designedRows\*cols/.test(site)){
  console.log('FAIL  legacy computed slot target still present');
  failed++;
}else console.log('OK  no computed slot target');
if(failed){
  console.error(`Template contract failed: ${failed}`);
  process.exit(1);
}
console.log('Template contract smoke: PASS');
