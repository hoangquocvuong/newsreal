import fs from 'node:fs';
const js=fs.readFileSync(new URL('../public/assets/admin.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../public/admin.html',import.meta.url),'utf8');
const checks=[
 ['lion category schema exists',/function lionCategoryFields\(category=''/],
 ['news category simple',/c==='tin hoạt động'\|\|c==='kiến thức & phong tục'\)return \[\]/],
 ['event has date',/event_date.*Ngày tổ chức/],
 ['event has location',/event_location.*Địa điểm/],
 ['lion renderer hook',/isLionAdminTemplate\(\)\?lionCategoryFields/],
 ['category change rerenders lion',/isTelecomAdminTemplate\(\)\|\|isLionAdminTemplate\(\)/],
 ['cache bust v12',/admin\.js\?v=20260920-v12/]
];
let bad=0;for(const [name,re] of checks){const ok=re.test(name==='cache bust v12'?html:js);console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)bad++}
if(bad)process.exit(1);console.log('Lion Adaptive Editor V50: PASS');
