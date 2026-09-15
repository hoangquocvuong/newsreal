import fs from 'node:fs';
const worker=fs.readFileSync('functions/[[path]].js','utf8');
const site=fs.readFileSync('public/assets/site.js','utf8');
function ok(cond,msg){if(!cond){console.error('FAIL',msg);process.exit(1)}console.log('OK',msg)}
ok(worker.includes('window.nrCanonicalAdminHref=function(raw)'), 'global canonical Admin URL normalizer exists');
ok(worker.includes("q.set('tenant',window.NR_TRIAL_TENANT)"), 'canonical Admin URL carries Trial tenant');
ok(worker.includes("q.set('nr_trial',window.NR_TRIAL_TOKEN)"), 'canonical Admin URL carries Trial token');
ok(worker.includes("u.searchParams.get('template')||window.NR_DEMO_THEME"), 'canonical Admin URL preserves/infers template');
ok(worker.includes("u.searchParams.get('tab')||''"), 'canonical Admin URL preserves destination tab');
ok(worker.includes('new MutationObserver(muts=>'), 'late-rendered Admin links are normalized too');
ok(worker.includes("u.pathname!=='/admin'"), 'normalizer is scoped to Admin links');
ok(worker.includes("const adminHref='/admin?tab=newpost&template='"), 'professional renderer legacy quick-link is covered by canonical normalization');
ok(site.includes("'/admin?tab=newpost'"), 'legacy/static template Admin links remain compatible and are covered at runtime');
console.log('Canonical Admin Context Contract V16: PASS');
