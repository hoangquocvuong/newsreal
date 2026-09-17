import fs from 'node:fs';
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
let bad=0;
function ok(name,cond){console.log((cond?'OK  ':'FAIL')+' '+name);if(!cond)bad++}
console.log('V20.9.27.57 Cross-Tenant CRUD Safety');
ok('CRUD safety marker',api.includes('V20.9.27.57 CROSS-TENANT CRUD SAFETY'));
ok('product update is site scoped',/UPDATE commerce_products SET[\s\S]{0,900}WHERE id=\? AND site_id=\?/.test(api));
ok('product delete is site scoped',api.includes('DELETE FROM commerce_products WHERE id=? AND site_id=?'));
ok('category update is site scoped',/UPDATE commerce_categories SET[\s\S]{0,700}WHERE id=\? AND site_id=\?/.test(api));
ok('category delete is site scoped',api.includes('DELETE FROM commerce_categories WHERE id=? AND site_id=?'));
ok('order update is site scoped',/UPDATE commerce_orders SET[\s\S]{0,400}WHERE id=\? AND site_id=\?/.test(api));
ok('service lead update is site scoped',/UPDATE service_leads SET[\s\S]{0,400}WHERE id=\? AND site_id=\?/.test(api));
ok('post update is site scoped',/UPDATE posts SET[\s\S]{0,1500}WHERE id=\? AND site_id=\?/.test(api));
ok('post delete is site scoped',api.includes('DELETE FROM posts WHERE id=? AND site_id=?'));
ok('coupon usage mutation is site scoped',api.includes('UPDATE commerce_coupons SET used_count=used_count+1 WHERE id=? AND site_id=?'));
ok('public product/category join is tenant scoped',api.includes('LEFT JOIN commerce_categories c ON c.id=p.category_id AND c.site_id=p.site_id WHERE ${where}'));
ok('admin product/category join is tenant scoped',api.includes('LEFT JOIN commerce_categories c ON c.id=p.category_id AND c.site_id=p.site_id WHERE p.site_id=?'));
const owned=(api.match(/SELECT id FROM commerce_categories WHERE id=\? AND site_id=\? LIMIT 1/g)||[]).length;
ok('product category assignment validates tenant ownership for create/update',owned>=2);
ok('foreign tenant category assignment fails closed',api.includes("return json({error:'Danh mục không thuộc website này'},400)"));
// Guard the known dangerous mutation shape: ID-only writes on tenant-owned commerce/content tables.
const tenantTables=['commerce_products','commerce_categories','commerce_orders','commerce_coupons','service_leads'];
for(const t of tenantTables){
 const re=new RegExp('(?:UPDATE '+t+' SET|DELETE FROM '+t+')[^\\n]{0,1400}WHERE id=\\?([^\\n]{0,180})','g');
 for(const m of api.matchAll(re)) ok(`${t} ID mutation carries site_id`,/site_id=\?/.test(m[1]));
}
if(bad){console.error(`Cross-Tenant CRUD Safety V38: FAIL (${bad})`);process.exit(1)}
console.log('Cross-Tenant CRUD Safety V38: PASS');
