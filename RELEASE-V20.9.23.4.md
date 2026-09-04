# V20.9.23.4 — Product/Affiliate Absolute Showroom Fix

- Public `/demo/san-pham/mau-1/` no longer resolves through the shared BĐS demo tenant.
- Product showroom returns the injected template shell directly for home, filters and product-detail URLs.
- Hard anti-cross-template guard: public Product/Affiliate demo cannot fall back to NEWSREAL/BĐS.
- Marketplace preview uses a real rendered Product/Affiliate screenshot in WebP (`san-pham-1-preview-real.webp`).
- Existing 1:1 structure/card/detail contracts remain unchanged.
