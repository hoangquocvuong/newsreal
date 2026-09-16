-- V20.9.27.54 · Template SEO Landing Contract
-- Marketplace metadata only. Never touches sites, trials, posts, products, orders or tenant settings.
UPDATE template_catalog SET
  seo_title=CASE WHEN trim(coalesce(seo_title,''))='' THEN 'Template website ' || name || ' – Giao diện chuyên nghiệp' ELSE seo_title END,
  seo_slug=CASE WHEN trim(coalesce(seo_slug,''))='' THEN 'template-' || lower(replace(replace(template_key,'_','-'),' ','-')) ELSE seo_slug END,
  primary_keyword=CASE WHEN trim(coalesce(primary_keyword,''))='' THEN 'template website ' || lower(name) ELSE primary_keyword END,
  secondary_keywords=CASE WHEN trim(coalesce(secondary_keywords,''))='' THEN 'mẫu website ' || lower(name) || ', giao diện website ' || lower(name) || ', website ' || lower(name) ELSE secondary_keywords END,
  meta_description=CASE WHEN trim(coalesce(meta_description,''))='' THEN 'Khám phá template website ' || name || ' với giao diện responsive, trang quản trị nội dung và cấu trúc phù hợp để phát triển SEO.' ELSE meta_description END,
  internal_anchor=CASE WHEN trim(coalesce(internal_anchor,''))='' THEN 'template website ' || lower(name) ELSE internal_anchor END
WHERE is_active=1;

-- Resolve any pre-existing duplicate marketplace slugs without touching tenant data.
UPDATE template_catalog
SET seo_slug=seo_slug || '-' || lower(replace(template_key,'_','-'))
WHERE trim(coalesce(seo_slug,''))<>''
  AND rowid NOT IN (SELECT min(rowid) FROM template_catalog WHERE trim(coalesce(seo_slug,''))<>'' GROUP BY seo_slug);

CREATE UNIQUE INDEX IF NOT EXISTS idx_template_catalog_seo_slug_unique
ON template_catalog(seo_slug)
WHERE trim(coalesce(seo_slug,''))<>'';
