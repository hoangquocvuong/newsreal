# HoangVuongTech V20.9.27.32 — Payment + Sample Handover Hardening

- Renewal payment now fails closed unless the site's template has a valid current `template_catalog.price`; removed the legacy `service_promotions.renewal_price / 1,999,000` fallback from payment creation.
- Direct template checkout and Trial conversion continue to share Global Sale pricing; renewal remains the Master base price.
- Added persistent sample tombstones. When a customer deletes an editable sample post, future sample-pack repair/version upgrades skip that sample key instead of recreating it.
- Existing sample repair continues to update only technical sample identity and does not overwrite customer-edited title/content/category.
- Added migration `0055_sample_handover_tombstones.sql` and regression contract `check-payment-sample-handover-v13.mjs`.
