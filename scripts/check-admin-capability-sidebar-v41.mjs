import fs from 'node:fs';
const js=fs.readFileSync('public/assets/admin.js','utf8');
const html=fs.readFileSync('public/admin.html','utf8');
const checks=[
 ['sidebar has stable mount',/id="adminSidebar"/.test(html)],
 ['central menu specs',/const ADMIN_MENU_SPECS=/.test(js)],
 ['central capability profile',/function adminCapabilityProfile\(\)/.test(js)],
 ['sidebar rebuilt from allow-list',/side\.replaceChildren\(frag\)/.test(js)],
 ['commerce capability isolated',/if\(commerce\)return \{kind:'commerce',modules:\['overview','products','orders','commerceSettings'/.test(js)],
 ['service capability excludes commerce',/if\(service\)return \{kind:'service',modules:\['overview','newpost','posts','samples','stats','leads','service','support','settings','password'\]/.test(js)],
 ['route capability guard',/if\(!assertAdminCapability\(n\)\)/.test(js)],
 ['trial resolver untouched by registry',!/nr_trial[^\n]{0,80}ADMIN_MENU_SPECS/.test(js)]
];
for(const [name,ok] of checks){console.log(ok?'OK  ':'FAIL',name);if(!ok)process.exitCode=1}
if(process.exitCode)process.exit(process.exitCode);console.log('Admin Capability Sidebar V41: PASS');
