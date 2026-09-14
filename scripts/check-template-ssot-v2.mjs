import fs from 'node:fs';
import {PROFESSIONAL_TEMPLATE_KEYS,professionalTemplateContract,professionalEditorProfile} from '../functions/_shared/template-contracts.js';

const api=fs.readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const worker=fs.readFileSync(new URL('../functions/[[path]].js',import.meta.url),'utf8');
const site=fs.readFileSync(new URL('../public/assets/site.js',import.meta.url),'utf8');
function ok(cond,msg){if(!cond)throw new Error('SSOT V2 FAIL: '+msg);console.log('OK ssot',msg)}

ok(PROFESSIONAL_TEMPLATE_KEYS.length===6,'all 6 professional templates registered');
for(const key of PROFESSIONAL_TEMPLATE_KEYS){
 const c=professionalTemplateContract(key),ep=professionalEditorProfile(key);
 ok(!!c,`${key} contract exists`);
 ok(c.contract_version==='template-ssot-v2',`${key} contract version`);
 ok(Array.isArray(c.sections)&&c.sections.length>=8,`${key} section blueprint`);
 ok(new Set(c.sections.map(x=>x.key)).size===c.sections.length,`${key} unique section keys`);
 ok(c.hero&&c.hero.selector&&Array.isArray(c.hero.fields)&&c.hero.fields.length>=7,`${key} hero blueprint`);
 const cats=c.sections.filter(x=>x.type==='category').map(x=>x.category);
 ok(JSON.stringify(cats)===JSON.stringify(ep.categories),`${key} Admin taxonomy == layout taxonomy`);
 for(const f of c.hero.fields)ok(api.includes(`key:'${f}'`)||api.includes(`key:\"${f}\"`),`${key} Admin schema owns hero field ${f}`);
}
const lion=professionalTemplateContract('dich-vu-6');
ok(lion.hero.mode==='slider'&&lion.hero.slides===3&&lion.hero.image_fields.length===3,'lion Hero 3-slide contract');
ok(api.includes('const ssot=professionalTemplateContract(key)'),'API structure derives from shared contract');
ok(api.includes('professionalEditorProfile(key)'),'Admin editor derives from shared contract');
ok(worker.includes('professionalSimulationContract(demo)'),'demo simulation derives from shared contract');
ok(worker.includes('window.NR_TEMPLATE_CONTRACT'),'demo empty-state reads shared contract metadata');
ok(!worker.includes("document.querySelectorAll('.mag-hero,.cr-hero,.enterprise-hero,.ind-hero,.ev-hero,.lion-hero')"),'no hard-coded professional Hero registry in simulation');
ok(site.includes('function sxSchemaDefault(')&&site.includes('function sxHeroContract('),'customer renderer reads structure/settings contract');
ok(site.includes("heroImageFields=(Array.isArray(heroContract.image_fields)"),'lion slider count derives from Hero contract');
console.log('Template SSOT V2: PASS');
