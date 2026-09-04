# SYSTEM SEO CONTRACT V1 — PHASE 2

- Client Admin owns website SEO title, description, social image and indexing switch.
- Empty SEO title/description safely fall back to template/site defaults.
- Customer homepage canonical remains its own origin.
- Trial/demo URLs remain noindex regardless of client SEO preference.
- seo_index=0 emits noindex,follow on the public homepage.
- SEO values are stored separately from template layout settings so template schema changes cannot erase SEO.
- Existing layout, trial, checkout, voucher and content contracts remain unchanged.
