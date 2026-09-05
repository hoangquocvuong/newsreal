# V20.9.23.5 — Product/Affiliate Runtime + Real Preview Hard Fix

- Fixes the Product/Affiliate showroom runtime ReferenceError (`origin` used before initialization).
- `/demo/san-pham/mau-1/` now reaches the dedicated Product/Affiliate renderer instead of falling through to the static BDS shell.
- Marketplace Product/Affiliate preview keeps the real rendered screenshot asset and now has an embedded real-screenshot fallback if the static asset request fails.
- Restores marketplace root category ordering: BĐS → Tin tức → Bán hàng → Landing Page → Dịch vụ → Game.
- No D1 migration required.
- Product/Affiliate layout/card/detail contract remains unchanged.
