import fs from 'node:fs';
import {GLOBAL_TEMPLATE_KEYS,globalTemplateMeta} from '../functions/_shared/template-contracts.js';
function fail(x){console.error('GLOBAL SSOT FAIL:',x);process.exit(1)}
if(GLOBAL_TEMPLATE_KEYS.length!==21)fail('expected 21 registered templates, got '+GLOBAL_TEMPLATE_KEYS.length);
for(const key of GLOBAL_TEMPLATE_KEYS){const meta=globalTemplateMeta(key);if(!meta)fail('missing global meta '+key)}
const html=fs.readFileSync(new URL('../public/admin.html',import.meta.url),'utf8');
const admin=fs.readFileSync(new URL('../public/assets/admin.js',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
if(html.includes('data-tab="guide"')||html.includes('Hướng dẫn mẫu này'))fail('legacy Admin guide UI still present');
if(admin.includes('renderTemplateUsageGuide')||admin.includes('renderPostTemplateGuide'))fail('legacy guide renderers still present');
if(api.includes('content_profile.usage_guide='))fail('API still emits legacy usage guide');
console.log('Global Template SSOT V3: PASS ('+GLOBAL_TEMPLATE_KEYS.length+' templates)');
console.log('Admin guide cleanup: PASS');
