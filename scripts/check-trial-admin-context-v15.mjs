import fs from 'node:fs';
const site=fs.readFileSync('public/assets/site.js','utf8');
const worker=fs.readFileSync('functions/[[path]].js','utf8');
function ok(v,msg){if(!v){console.error('FAIL',msg);process.exit(1)}console.log('OK',msg)}
const m=site.match(/function sxAdminNewPostUrl\(key=''\)\{([\s\S]*?)\n\}/);
ok(m,'service templates expose one Admin URL helper');
const body=m[1];
ok(body.includes("window.NR_TRIAL_TOKEN&&typeof nrDemoAdminUrl==='function')return nrDemoAdminUrl(key,'newpost')"),'service +Đăng bài delegates Trial context to canonical Admin URL builder');
ok(body.includes("cur.get('tenant')||window.NR_TRIAL_TENANT||''"),'tenant falls back to server-resolved Trial tenant');
ok(body.includes("cur.get('nr_trial')||window.NR_TRIAL_TOKEN||''"),'trial token falls back to server-resolved Trial token');
ok(worker.includes("if(window.NR_TRIAL_TENANT)q.set('tenant',window.NR_TRIAL_TENANT)"),'server-injected canonical Admin builder preserves tenant');
ok(worker.includes("q.set('nr_trial',window.NR_TRIAL_TOKEN)"),'server-injected canonical Admin builder preserves trial token');
console.log('Trial Admin Context Contract V15: PASS');
