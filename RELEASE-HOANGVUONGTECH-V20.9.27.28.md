# HoangVuongTech V20.9.27.28 — Global Pricing & Sale Contract

- Master Control `template_catalog.price` is the authoritative base/original annual price.
- Removed the manual 500K voucher interaction from the marketplace.
- Added Master-controlled `sale_price`, `sale_start`, `sale_end` campaign fields.
- Marketplace automatically shows SALE price, struck-through original price, saving, and live countdown while campaign is active.
- Checkout calculates the active sale server-side; customers do not need to click/apply anything.
- When sale expires, checkout and marketplace automatically return to the base price.
- Renewal always uses the current Master base price, never the first-sale price.
- Added D1 migration `0051_global_template_pricing_sale.sql` and pricing regression checks.
