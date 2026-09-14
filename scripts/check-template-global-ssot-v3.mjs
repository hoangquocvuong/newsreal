import fs from 'node:fs';
import {GLOBAL_TEMPLATE_KEYS,globalTemplateMeta,templateUsageGuide} from '../functions/_shared/template-contracts.js';
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const html=fs.readFileSync('public/admin.html','utf8');
const fail=(m)=>{console.error('GLOBAL SSOT V3 FAIL:',m);process.exit(1)};
if(GLOBAL_TEMPLATE_KEYS.length<21)fail('global registry is incomplete');
for(const key of GLOBAL_TEMPLATE_KEYS){
 const meta=globalTemplateMeta(key);if(!meta||meta.contract_version!=='template-global-ssot-v3')fail(`${key}: missing global meta`);
 if(!api.includes(`'${key}':{`)&&!api.includes(`'${key}': {`))fail(`${key}: missing default structure`);
 const guide=templateUsageGuide(key,{sections:[{key:'hero',type:'section',title:'Hero',bind_required:0},{key:'cat-1',type:'category',title:'Mẫu',category:'Mẫu',slots:6,bind_required:1}]},{categories:['Mẫu']});
 if(!guide.sections?.length||guide.geometry_locked!==1)fail(`${key}: guide generator invalid`);
}
if(!api.includes('for(const k of GLOBAL_TEMPLATE_KEYS)'))fail('catalog structure sync is not global');
if(!api.includes('content_profile.usage_guide=templateUsageGuide'))fail('/api/me does not expose generated guide');
if(!html.includes('data-tab="guide"')||!html.includes('templateUsageGuide'))fail('Admin guide tab missing');
if(!admin.includes('renderTemplateUsageGuide'))fail('Admin guide renderer missing');
if(!admin.includes('Sơ đồ trang chủ & vị trí đăng bài'))fail('Admin diagram missing');
console.log(`Global Template SSOT V3: PASS (${GLOBAL_TEMPLATE_KEYS.length} templates)`);
