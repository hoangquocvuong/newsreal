import fs from 'node:fs';
const s=fs.readFileSync('public/assets/site.js','utf8');
const checks=[
 ['project strip reads structure slots',/estateCoreProjectStrip[\s\S]*nrStructureSlots\(site,key,'projects'/],
 ['project strip no hard six cap',!/estateCoreProjectStrip[\s\S]{0,400}slice\(0,6\)/.test(s)],
 ['project slots are explicit real slots',/estate-project-grid[\s\S]*data-contract-slot=\\?"1\\?"/],
 ['project fallback uses real listing title',/If a profile asks for more area slots[\s\S]*x\.title/],
 ['fixed rows fill from real property pool',/estateCoreFixedRows[\s\S]*SITE_DATA\?\.posts[\s\S]*x\.type==='property'/],
 ['fixed rows no placeholder padding',!/estateCoreFixedRows[\s\S]{0,700}estateCorePlaceholderCard/.test(s)],
 ['generic property underfill clones real slot',/includes\('property'\)&&real\.length[\s\S]*cloneNode\(true\)/],
 ['all estate 3-5 use shared project strip',/mau-3[\s\S]*estateCoreProjectStrip\(key,props\)[\s\S]*mau-4[\s\S]*estateCoreProjectStrip\(key,props\)[\s\S]*mau-5[\s\S]*estateCoreProjectStrip\(key,props\)/],
 ['estate sections retain V55 real-pool fill',/function estateCoreSection[\s\S]*preferred[\s\S]*SITE_DATA\?\.posts/],
 ['estate news retains real news fill',/function estateCoreNews[\s\S]*x\.type==='news'/]
];
let bad=0;for(const [name,test] of checks){const ok=typeof test==='boolean'?test:test.test(s);console.log((ok?'PASS ':'FAIL ')+name);if(!ok)bad++}
if(bad)process.exit(1);console.log('All Estate Homepage Real Content V56: PASS');
