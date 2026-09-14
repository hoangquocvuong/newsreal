# HoangVuongTech SYSTEM SEO CONTRACT V1 — FINAL

Release target: V20.9.22.0

## Index contract
- Public marketing homepage, template category pages and active template detail pages: index,follow.
- Demo/showroom previews, trial, checkout, activation, admin, control-center, renewal, reset-password, favorites and API routes: excluded from organic index.
- Unknown template detail URLs return HTTP 404 + noindex.

## Canonical contract
- One canonical URL per public marketing page.
- Template details use /templates/{category}/{seo_slug}/.
- Legacy demo URLs remain redirects/noindex and never compete with sales pages.

## Metadata contract
- Unique title + description for homepage, each template category and each template detail.
- Open Graph + Twitter Card on indexable marketplace pages.
- Public client-site SEO settings remain tenant-specific.

## Structured data contract
- Homepage: Organization + WebSite + Service.
- Template category: CollectionPage + BreadcrumbList.
- Template detail: Product + Offer + BreadcrumbList.
- Product price must come from catalog data; schema must never invent reviews/ratings.

## Crawl contract
- robots.txt allows public content and blocks private/transactional namespaces.
- sitemap.xml contains homepage, template categories and active template SEO details only.
- lastmod is emitted only when a real template updated_at date exists.

## Content/layout safety
SEO metadata is a platform layer. It must not change V17.2 layout identity, demo/full-sample behavior, client no-content skeleton, trial conversion, voucher CTA, checkout or template routing contracts.
