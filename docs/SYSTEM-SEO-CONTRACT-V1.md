# SYSTEM SEO CONTRACT V1 — HoangVuongTech / NEWSREAL

Baseline: V20.9.20.9. First implementation: V20.9.21.0.

## Contract
- HoangVuongTech homepage targets the whole website platform, not one vertical.
- Public SEO landing pages and template detail pages use one canonical URL, unique title/description, index/follow, Open Graph and Twitter metadata.
- Template detail pages are generated from template_catalog SEO fields; no hard-coded price/schema divergence.
- /sitemap.xml is generated from public category URLs plus every active template with seo_slug.
- Demo, trial, admin, activation, renewal and checkout flows must not compete with public sales/SEO pages. Demo pages are noindex; private flows remain excluded from crawling/indexing.
- Customer websites retain their template structure. Public posts/pages get canonical metadata from their real URL/content; trial/demo mode remains noindex.
- Structured data must reflect visible, real data. Homepage uses Organization + WebSite + Service; sellable template detail uses Product/Offer.
- New template categories must inherit this contract instead of adding one-off SEO markup.

## Release gate
1. No duplicate meta description/canonical in rendered public HTML.
2. Homepage canonical is https://hoangvuongtech.com/.
3. /templates/<category>/<seo_slug>/ resolves to an indexable detail page.
4. Active template SEO detail URLs appear in sitemap.xml.
5. /demo/* contains noindex.
6. Admin/trial/payment routes never enter sitemap.xml.
7. Existing V17.2/template layout and voucher/checkout flows remain unchanged.
