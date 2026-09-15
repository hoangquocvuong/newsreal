# V20.9.27.33 — Customer Pricing Single Source Fix

- Fixes Client Admin `Dịch vụ & gia hạn` showing legacy 1.999.000đ.
- Customer-facing list price and renewal price now come from the site's current `template_catalog.price` in Master Control.
- First-payment display is recalculated from the same global sale campaign used by checkout.
- `service_promotions` pricing fields remain historical snapshots only; they no longer override customer-facing current pricing.
- If a template has no valid Master price, the service pricing endpoint fails closed instead of displaying a hard-coded fallback.
- No database migration is required.
