import fs from 'node:fs';
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['Admin API forwards nr_trial', /if\(trialParam\)q\.set\('nr_trial',trialParam\)/.test(admin)],
 ['API resolves site from trial token first', /FROM website_trials wt[\s\S]*WHERE wt\.trial_token=\?/.test(api)&&/s\.template_key=String\(trial\.template_key/.test(api)],
 ['invalid trial token fails closed', /if\(!s\)return null;/.test(api)],
 ['server site identity wins over template URL', /return CLIENT_TEMPLATE_KEY\|\|requested/.test(admin)],
 ['optional menus reset on every template boot', /menuCommerceProducts','menuCommerceOrders','menuCommerceSettings/.test(admin)&&/classList\.add\('hidden'\)/.test(admin)],
 ['commerce menus only enabled for dich-vu-5', /serviceKey==='dich-vu-5'/.test(admin)],
 ['lion only enables lead inbox', /serviceKey==='dich-vu-6'.*menuServiceLeads/s.test(admin)],
 ['lion has own editor copy', /Gói 2 đầu lân khai trương/.test(admin)]
];
let bad=0;console.log('Admin Trial + Template Isolation V40');for(const [n,ok] of checks){console.log(ok?'OK  ':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Admin Trial + Template Isolation V40: PASS');
