import fs from 'node:fs';
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const web=fs.readFileSync('functions/[[path]].js','utf8');
function ok(cond,msg){if(!cond){console.error('FAIL '+msg);process.exitCode=1}else console.log('OK  '+msg)}
console.log('V20.9.27.56 Strict Tenant Boundary + Pricing Regression');
ok(api.includes('V20.9.27.56 STRICT TENANT BOUNDARY'),'API strict tenant boundary marker');
ok(web.includes('V20.9.27.56 STRICT TENANT BOUNDARY'),'web strict tenant boundary marker');
ok(api.includes("if(!sharedTenantHost(actual))return actual"),'API ignores tenant override on custom domains');
ok(web.includes("if(!siteSharedTenantHost(actual))return actual"),'web ignores tenant override on custom domains');
ok(api.includes("h==='localhost'||h.endsWith('.pages.dev')||h==='app.hoangvuongtech.com'"),'API override allowlist is shared-host only');
ok(web.includes("h==='localhost'||h.endsWith('.pages.dev')||h==='app.hoangvuongtech.com'"),'web override allowlist is shared-host only');
ok(api.includes('if(!s&&sharedTenantHost(actualHost(req))&&env.DEFAULT_TENANT_DOMAIN)'),'API default tenant is shared-host only');
ok(web.includes('if(!s&&siteSharedTenantHost(siteActualHost(req))&&env.DEFAULT_TENANT_DOMAIN)'),'web default tenant is shared-host only');
const info=api.slice(api.indexOf("if(route==='renewal/info'"),api.indexOf("if(route==='renewal/respond'"));
ok(info.includes('tc.price renewal_price'),'renewal info uses Master template price');
ok(!/sp\.renewal_price|1999000/.test(info),'renewal info has no legacy/hard-coded renewal fallback');
ok(info.includes("Giá gia hạn chưa được cấu hình trong Kho mẫu"),'renewal info fails closed without Master price');
const complete=api.slice(api.indexOf('async function completeRenewal'),api.indexOf('async function sendRenewalReminder'));
ok(complete.includes('tc.price renewal_price'),'renewal completion uses Master template price');
ok(complete.includes('LEFT JOIN template_catalog tc ON tc.template_key=s.template_key'),'renewal completion joins template catalog');
ok(complete.includes("Giá gia hạn chưa được cấu hình trong Kho mẫu"),'renewal completion fails closed without Master price');
// Behavioral regression for the boundary rule, independent of Worker/D1.
function resolve(url,header=''){const u=new URL(url),actual=u.hostname.replace(/^www\./,'').toLowerCase(),shared=actual==='localhost'||actual.endsWith('.pages.dev')||actual==='app.hoangvuongtech.com';return shared?(header||u.searchParams.get('tenant')||actual).replace(/^www\./,'').toLowerCase():actual}
ok(resolve('https://shop-a.vn/?tenant=shop-b.vn','shop-b.vn')==='shop-a.vn','custom domain cannot be switched to tenant B');
ok(resolve('https://newsreal.pages.dev/?tenant=shop-b.vn')==='shop-b.vn','shared preview may select explicit tenant');
ok(resolve('https://app.hoangvuongtech.com/','shop-b.vn')==='shop-b.vn','trusted shared app may use X-Tenant');
if(process.exitCode)process.exit(process.exitCode);console.log('Strict Tenant Boundary + Pricing Regression V37: PASS');
