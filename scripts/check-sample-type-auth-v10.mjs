import fs from 'node:fs';
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const activate=fs.readFileSync('public/assets/activate.js','utf8');
const site=fs.readFileSync('public/assets/site.js','utf8');
function ok(c,m){if(!c){console.error('FAIL',m);process.exit(1)}console.log('OK',m)}
ok(api.includes("const currentVersion=8"),'sample pack repair version 8');
ok(api.includes("const professionalType=String(contract.persistedType||'news')"),'professional sample type canonical');
ok(api.includes("UPDATE posts SET type=?,is_sample=1"),'existing sample technical identity repaired');
ok(admin.includes("const rows=(await fetchAdminPosts()).filter(isSamplePost);"),'Tin mẫu is not hidden by template type filter');
ok(admin.includes("const nrAdminTokenKey='nr_client_token:'+nrAdminSessionScope"),'Admin token is tenant/trial scoped');
ok(admin.includes("if(Number(err?.status||0)===401)"),'only real 401 shows login screen');
ok(activate.includes("localStorage.setItem('nr_client_token:'+scope,d.token)"),'activation stores scoped Admin session');
ok(site.includes("category==='Gói múa lân').slice(0,6)"),'Lion package slots match 6-card homepage contract');
ok(site.includes("category==='Múa rồng').slice(0,3)"),'Lion dragon section keeps real post priority within 3 slots');
console.log('Sample type + Admin auth V10: PASS');
