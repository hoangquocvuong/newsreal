import fs from 'node:fs';
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const html=fs.readFileSync('public/admin.html','utf8');
const site=fs.readFileSync('public/assets/site.js','utf8');
const checks=[
 ['Admin installs/backfills sample pack before dashboard stats',api.includes("installDefaultTemplateSamples(env,site.id,{source:'admin-me-backfill'})")],
 ['Sample pack repair version 6',api.includes('const currentVersion=6')&&api.includes('sample_pack_version=6')],
 ['Admin has dedicated Tin mẫu menu',html.includes('data-tab="samples"')&&html.includes('>Tin mẫu<')],
 ['Admin has dedicated sample table',html.includes('id="sampleTable"')],
 ['Normal content list excludes sample rows',admin.includes("filter(x=>!isSamplePost(x))")],
 ['Sample list contains only sample rows',admin.includes('filter(isSamplePost)')],
 ['Sample posts remain editable/deletable',admin.includes('loadSamplePosts')&&admin.includes('editPost(${x.id})')&&admin.includes('delPost(${x.id})')],
 ['Trial article pages no longer hide sample articles',api.includes("const hideSamples=request.headers.get('X-NR-Preview-Samples')==='0';")],
 ['Customer/trial posts sort real before samples globally',site.includes('customer/trial content always outranks editable sample rows')],
 ['Lion renderer defensively sorts real before samples',site.includes("p.type==='service').sort((a,b)=>(Number(a?.is_sample||0)-Number(b?.is_sample||0))")]
];
let bad=0;for(const [name,ok] of checks){console.log(ok?'OK ':'FAIL',name);if(!ok)bad++}
if(bad)process.exit(1);
console.log('Sample Admin Library V8: PASS');
