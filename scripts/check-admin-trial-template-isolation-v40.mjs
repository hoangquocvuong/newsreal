import fs from 'node:fs';
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const profiles=fs.readFileSync('public/assets/template-system.js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const html=fs.readFileSync('public/admin.html','utf8');
const checks=[
 ['Admin API forwards nr_trial', /if\(trialParam\)q\.set\('nr_trial',trialParam\)/.test(admin)],
 ['API resolves site from trial token first', /JOIN website_trials wt ON wt\.site_id=s\.id WHERE wt\.trial_token=\?/.test(api)],
 ['invalid trial token fails closed', /if\(!s\)return null;/.test(api)],
 ['server site identity wins over template URL', /return CLIENT_TEMPLATE_KEY\|\|requested/.test(admin)],
 ['unified template registry loads before Admin', html.indexOf('template-system.js')>=0&&html.indexOf('template-system.js')<html.indexOf('admin.js')],
 ['Admin menus use allow-list profile contract', /const allowed=new Set\(profile\?\.menus/.test(admin)&&/menu-btn\[data-tab\]/.test(admin)],
 ['commerce profile owns commerce menus only', /commerce:\{[^}]*menus:\['overview','commerce-products','commerce-orders','commerce-settings','serviceleads'/s.test(profiles)],
 ['lion profile has service editor and lead inbox', /lion:\{[^}]*menus:\['overview','newpost','posts','samples','stats','serviceleads'/s.test(profiles)&&/Gói 2 đầu lân khai trương/.test(profiles)],
 ['internet profile cannot inherit commerce modules', /internet:\{[^}]*menus:\['overview','newpost','posts','samples','stats','serviceleads','service'/s.test(profiles)],
 ['template registry never resolves tenant or trial ownership', !/website_trials|trial_token|site_id\s*=/.test(profiles)]
];
let bad=0;console.log('Admin Trial + Template Isolation V40');for(const [n,ok] of checks){console.log(ok?'OK  ':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Admin Trial + Template Isolation V40: PASS');
