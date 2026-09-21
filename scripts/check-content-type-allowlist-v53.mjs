import fs from 'node:fs';
const js=fs.readFileSync('public/assets/admin.js','utf8');
const html=fs.readFileSync('public/admin.html','utf8');
const checks=[
 ['property detector covers all BDS templates',/\^mau-\[1-5\]\$/.test(js)],
 ['property allowlist is BDS plus news',js.includes("if(isPropertyTemplate())return ['property','news']")],
 ['specialized templates are isolated',js.includes("if(isGameTemplate())return ['game']")&&js.includes("if(isServiceTemplate())return ['service']")&&js.includes("if(isNewsTemplate())return ['news']")],
 ['picker rebuilt from allowlist',js.includes('postType.innerHTML=allowed.map')],
 ['picker hidden for single family',js.includes("picker?.classList.toggle('hidden',allowed.length<=1)")],
 ['property news uses editorial categories',js.includes("postType?.value==='news'&&!isNewsTemplate()?BUILTIN_CONTENT_PROFILES.news")],
 ['type change rerenders adaptive fields',js.includes("postType.addEventListener('change',()=>{updateContentTypeUI();renderProfileFields({})})")],
 ['cache bumped v53',html.includes('/assets/admin.js?v=20260921-v53')],
 ['trial resolver not introduced',!js.includes('resolveTrialTenant')]
];
let ok=true;for(const [name,pass] of checks){console.log((pass?'PASS ':'FAIL ')+name);if(!pass)ok=false}if(!ok)process.exit(1);console.log('Universal Content Type Allow-list V53: PASS');
