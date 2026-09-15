import fs from 'node:fs';
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const worker=fs.readFileSync('functions/[[path]].js','utf8');
const site=fs.readFileSync('public/assets/site.js','utf8');
const checks=[
 ['sample repair version 5',api.includes('const currentVersion=5')&&api.includes('sample_pack_version=5')],
 ['trial template key repairs site identity',api.includes('SELECT coalesce(template_key,\'\') template_key FROM website_trials WHERE site_id=?')&&api.includes('effectiveTemplateKey')],
 ['professional blueprint uses resolved catalog key',api.includes('const resolvedKey=String(t?.template_key||key||\'\').trim()')&&api.includes('professionalDemoData(resolvedKey)')],
 ['empty professional blueprint is not marked installed',api.includes("reason:'empty-blueprint'")],
 ['hard professional showroom never hijacks trial',worker.includes("if(marketHost&&hardProDemo&&!u.searchParams.get('nr_trial'))")],
 ['secondary professional showroom never hijacks trial',worker.includes("if(marketHost&&PRO_DEMO_KEYS.has(demo)&&!u.searchParams.get('nr_trial'))")],
 ['trial posts sorted real before samples even on demo pathname',site.includes("if((!demoTemplateKey||window.NR_TRIAL_TOKEN)&&Array.isArray(SITE_DATA?.posts))")]
];
let ok=true;for(const [n,v] of checks){console.log(v?'OK  ':'FAIL',n);if(!v)ok=false}if(!ok)process.exit(1);console.log('New professional sample/trial V9: PASS');
