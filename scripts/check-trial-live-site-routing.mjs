import fs from 'node:fs';
import {GLOBAL_TEMPLATE_KEYS} from '../functions/_shared/template-contracts.js';

const s=fs.readFileSync('functions/[[path]].js','utf8');
const checks=[
 ['global template registry imported', "import {GLOBAL_TEMPLATE_KEYS,professionalSimulationContract,globalTemplateMeta}"],
 ['global demo key set built from SSOT', 'const GLOBAL_TEMPLATE_DEMO_KEYS=new Set(GLOBAL_TEMPLATE_KEYS);'],
 ['global trial token parsed once before showroom routing', "const trialToken=String(u.searchParams.get('nr_trial')||'').trim();"],
 ['all registered templates share global demo guard', 'const globalDemo=isGlobalTemplateDemo(demo);'],
 ['professional showroom hard route excludes every real trial', 'if(marketHost&&hardProDemo&&!trialToken){'],
 ['professional secondary showroom guard excludes every real trial', 'if(marketHost&&PRO_DEMO_KEYS.has(demo)&&!trialToken){'],
 ['product showroom excludes every real trial', "const publicProductShowroom=marketHost&&demo==='san-pham-1'&&!trialToken;"],
 ['trial tenant resolves from token for all global templates', 'if(marketHost&&trialToken&&globalDemo){'],
 ['trial token resolves the real site id', "SELECT * FROM sites WHERE id=? AND status='active'"],
 ['public sample tenant is only allowed without trial token', 'if(!site && marketHost && globalDemo && !trialToken){'],
 ['invalid trial can never fall back to showroom samples', 'Không tìm thấy website dùng thử'],
 ['inactive trial site can never fall back to showroom samples', 'Website dùng thử chưa sẵn sàng'],
 ['trial site boot carries the real trial token to API fetches', "window.NR_TRIAL_TOKEN=${JSON.stringify(trialCtx?.trial_token||'')}"],
 ['trial API transport uses X-NR-Trial', "h.set('X-NR-Trial',window.NR_TRIAL_TOKEN);"],
 ['legacy news redirect preserves trial query string', "return Response.redirect('https://hoangvuongtech.com'+target+u.search,301);"],
];
let bad=false;
for(const [name,needle] of checks){
 if(!s.includes(needle)){console.error('FAIL trial live '+name);bad=true}
 else console.log('OK trial live '+name);
}
if(GLOBAL_TEMPLATE_KEYS.length!==21){console.error('FAIL trial live expected 21 global templates, got '+GLOBAL_TEMPLATE_KEYS.length);bad=true}
else console.log('OK trial live registry covers 21 templates');
for(const key of GLOBAL_TEMPLATE_KEYS){
 if(!key||typeof key!=='string'){console.error('FAIL invalid template key',key);bad=true}
}
if(bad)process.exit(1);
console.log(`Trial live website routing GLOBAL: PASS (${GLOBAL_TEMPLATE_KEYS.length} templates)`);
