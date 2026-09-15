# HoangVuongTech V20.9.27.39 — Universal Card Visibility Contract

- Fixes Viettel Internet package cards whose image/text/CTA/price were clipped in the desktop grid.
- Desktop Viettel Internet grid is 3 columns; tablet 2; mobile 1.
- Information-bearing artwork uses `object-fit: contain` so text embedded in package artwork remains visible.
- Critical card copy, CTA and price are allowed to wrap and may not be ellipsized or clipped.
- Adds `check-universal-card-visibility-v20.mjs` regression coverage.
- No D1 migration is required.
