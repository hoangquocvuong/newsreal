# V20.9.27.29 — Global Sale Campaign
- Master Control is the single source of truth for each template base price.
- Removed per-template sale price/start/end controls.
- Added one global SALE campaign: enabled, discount amount, start, end.
- Marketplace and server-side checkout automatically compute sale = base price - global discount while campaign is active.
- Renewal always uses current template base price and never uses sale discount.
- Added migration 0054_global_sale_campaign.sql.
- Global Pricing Contract V2 regression checks.
