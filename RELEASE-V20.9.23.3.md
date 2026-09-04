# V20.9.23.3 — Product/Affiliate Demo Route Fix

- Fixes `/demo/san-pham/mau-1/` falling through to the static NEWSREAL/BĐS shell.
- Adds `san-pham-1` to the same isolated showroom-tenant resolver used by other marketplace demos.
- Adds Product/Affiliate trial resolution to the same route contract.
- Keeps the Product/Affiliate showroom self-contained in `site.js`, so demo content/layout stays 1:1 with the commercial template contract.
- Versions the real rendered marketplace preview to `san-pham-1-preview-v2.png` and updates D1 via migration 0046.
