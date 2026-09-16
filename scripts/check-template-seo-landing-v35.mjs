import fs from 'node:fs';
const runtime=fs.readFileSync('functions/[[path]].js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const migration=fs.readFileSync('migrations/0061_template_seo_landing_backfill.sql','utf8');
const pkg=fs.readFileSync('package.json','utf8');
const checks=[
 ['active template SEO fields',api.includes("Template đang bật phải có đầy đủ SEO Landing Page.")&&['seo_title','seo_slug','primary_keyword','secondary_keywords','meta_description','internal_anchor'].every(x=>api.includes(x))],
 ['duplicate SEO slug rejected',api.includes('SEO slug đã được template khác sử dụng.')],
 ['canonical template detail route',runtime.includes('/templates/${esc(t?.category||\'game\')}/${esc(slug)}/')],
 ['template sitemap discovery',runtime.includes('if(cat&&slug&&t?.is_active!==0)urls.push')],
 ['Product schema',runtime.includes("'@type':'Product'")],
 ['Breadcrumb schema',runtime.includes("'@type':'BreadcrumbList'")],
 ['FAQ schema',runtime.includes("'@type':'FAQPage'")],
 ['FAQ visible content',runtime.includes('Câu hỏi thường gặp')],
 ['SEO internal links',runtime.includes('template-detail-related')],
 ['legacy active SEO backfill',migration.includes('WHERE is_active=1')&&migration.includes('seo_slug=CASE WHEN')],
 ['unique SEO slug DB index',migration.includes('idx_template_catalog_seo_slug_unique')],
 ['migration tenant-safe',!/(UPDATE|DELETE FROM)\s+(sites|website_trials|posts|commerce_products|commerce_orders|site_public_settings|site_sample_tombstones)\b/i.test(migration)],
 ['V35 wired into npm check',pkg.includes('check-template-seo-landing-v35.mjs')]
];
let bad=0;for(const [n,ok] of checks){console.log(ok?'OK  '+n:'FAIL '+n);if(!ok)bad++}if(bad)process.exit(1);console.log('Template SEO Landing Contract V35: PASS');
