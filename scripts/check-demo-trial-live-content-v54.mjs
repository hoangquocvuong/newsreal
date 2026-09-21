import fs from 'node:fs';
const s=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['sample pack version 9',/const currentVersion=9/],
 ['state writes version 9',/sample_pack_version=9/],
 ['property news section detected',/const newsSection=sections\.find/],
 ['property news uses real records',/type:'news',title,category:newsCats/],
 ['property news quantity follows structure slots',/newsNeed=Math\.max\(0,Number\(newsSection\?\.slots\|\|0\)\)/],
 ['same blueprint seeds customer site',/const blueprint=await buildTemplatePreviewBlueprint\(env,site\.template_key,site\)/],
 ['demo uses same blueprint',/const blueprint=await buildTemplatePreviewBlueprint\(env,previewTemplate,site\)/],
 ['trial live backfill enabled',/installDefaultTemplateSamples\(env,site\.id,\{source:__siteTrial\?'trial-backfill':'live-handover-backfill'\}\)/],
 ['deleted samples protected',/site_sample_tombstones WHERE site_id=\? AND sample_key=\?/],
 ['legacy skeleton simulation disabled',/const templateSimulation=false/]
];
let bad=0; for(const [n,re] of checks){const ok=re.test(s);console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++;} if(bad)process.exit(1); console.log('Demo Trial Live Content Parity V54: PASS');
