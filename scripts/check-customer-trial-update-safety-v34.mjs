import fs from 'node:fs';
import path from 'node:path';

const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const migrationsDir='migrations';
const protectedTables=[
  'posts','site_public_settings','commerce_categories','commerce_products','commerce_orders',
  'commerce_coupons','commerce_settings','site_sample_tombstones','website_trials'
];
function ok(cond,msg){if(!cond){console.error('FAIL',msg);process.exitCode=1}else console.log('OK',msg)}
function fnBody(name){
  const start=api.indexOf(`async function ${name}(`); if(start<0)return '';
  let brace=api.indexOf('{',start), depth=0;
  for(let i=brace;i<api.length;i++){if(api[i]==='{')depth++; else if(api[i]==='}'&&--depth===0)return api.slice(start,i+1)}
  return '';
}
const catalog=fnBody('ensureTemplateCatalog');
const identity=fnBody('ensureSiteTemplateIdentity');
ok(api.includes('CUSTOMER/TRIAL UPDATE IMMUTABILITY CONTRACT'),'source declares customer/trial update immutability contract');
ok(catalog.length>0,'template catalog ensure function found');
for(const t of protectedTables){
  const destructive=new RegExp(`(?:UPDATE|DELETE\\s+FROM|INSERT\\s+(?:OR\\s+\\w+\\s+)?INTO)\\s+${t}\\b`,'i');
  ok(!destructive.test(catalog),`template catalog ensure does not mutate tenant table ${t}`);
}
ok(/UPDATE\s+sites\s+SET\s+template_key=/i.test(identity),'site identity repair only fills template identity');
ok(/WHERE\s+coalesce\(template_key,'?'?'?\)=''|WHERE\s+coalesce\(template_key,''\)=''/i.test(identity),'site identity repair is guarded to missing template_key');
ok(!/SET\s+(?!template_key)[a-z_]+\s*=/i.test(identity),'site identity repair does not rewrite tenant settings');

// From V53 onward, migrations are schema/catalog-only for tenant data. Tenant rows may be
// changed only by explicit request handlers/lifecycle code, never merely because source deployed.
const files=fs.readdirSync(migrationsDir).filter(x=>/^\d+_.*\.sql$/.test(x)).sort();
for(const file of files){
  const n=Number(file.match(/^(\d+)/)?.[1]||0); if(n<61)continue;
  const sql=fs.readFileSync(path.join(migrationsDir,file),'utf8');
  for(const t of protectedTables){
    const bad=new RegExp(`(?:DELETE\\s+FROM|UPDATE)\\s+${t}\\b`,'i');
    ok(!bad.test(sql),`${file} does not rewrite existing tenant rows in ${t}`);
  }
}

ok(api.includes('site_sample_tombstones'),'sample tombstones remain part of runtime');
ok(/is_sample/i.test(api) && /sample_key/i.test(api),'sample identity remains explicit');
ok(/website_trials/i.test(api) && /trial_token/i.test(api),'trial remains tenant/token scoped');
ok(/real before samples|is_sample ASC|coalesce\(is_sample,0\) ASC/i.test(api),'customer content priority contract remains present');

if(process.exitCode) process.exit(process.exitCode);
console.log('Customer/Trial Update Safety Contract V34: PASS');
