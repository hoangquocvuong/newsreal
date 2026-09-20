# Commerce Reset V22

- Removes the V21 Commerce homepage from the active storefront renderer.
- `/demo/ban-hang/cua-hang-online/` now renders an intentional clean reset screen, so no legacy Commerce homepage can leak into the next redesign.
- Keeps Commerce API/Admin/data and the existing product-detail backend connection intact.
- `APPLY-COMMERCE-RESET-V22.bat` removes the two V21 presentation-only files after extraction.
- This is a reset milestone, not the replacement storefront.
