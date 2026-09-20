import fs from 'node:fs';
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['Admin API forwards nr_trial', /if\(trialParam\)q\.set\('nr_trial',trialParam\)/.test(admin)],
 ['API resolves site from trial token first', /JOIN website_trials wt ON wt\.site_id=s\.id WHERE wt\.trial_token=\?/.test(api)],
 ['invalid trial token fails closed', /if\(!s\)return null;/.test(api)],
 ['server site identity wins over template URL', /return CLIENT_TEMPLATE_KEY\|\|requested/.test(admin)],
 ['Admin capability contract is server-derived', /content_profile\.admin_capabilities=deriveAdminCapabilities/.test(api)],
 ['Admin applies capability visibility on every boot', /function applyAdminCapabilities\(\)/.test(admin)&&/applyAdminCapabilities\(\)/.test(admin)],
 ['commerce menu is not bound to one template key', !/serviceKey==='dich-vu-5'.*menuCommerceProducts/s.test(admin)],
 ['lead menu is capability driven', /menuServiceLeads:!!cap\.leads/.test(admin)]
];
let bad=0;console.log('Admin Trial + Template Isolation V40');for(const [n,ok] of checks){console.log(ok?'OK  ':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Admin Trial + Template Isolation V40: PASS');
