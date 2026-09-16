# HoangVuongTech V20.9.27.54 — Template SEO Landing Contract

- Every active template must have complete SEO landing metadata before Master can save it.
- Duplicate SEO slugs are rejected and D1 gets a unique partial index.
- Migration 0061 backfills missing SEO metadata for existing active catalog templates only.
- Template detail landing pages now include visible FAQ, richer SEO copy, internal links and FAQPage JSON-LD in addition to Product/Offer/Breadcrumb schema.
- Sitemap continues to discover every active template with an SEO slug.
- New regression V35 prevents releases that drop these contracts.
- Customer/Trial data is not touched by this migration.
