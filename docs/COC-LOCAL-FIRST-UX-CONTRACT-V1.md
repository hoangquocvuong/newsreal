# CoC Local-first UX Contract V1

## Navigation
The Game / Clash of Clans template must not advertise destinations that do not have backend support. Desktop navigation is limited to Home, Browse Bases, Town Hall, Builder Hall, Clan Capital, Saved and Donate. Mobile navigation is Home, Bases, Saved, More and Donate; More may expose Town Hall, Builder Hall, Clan Capital, About and Privacy.

## Donate
The primary Donate CTA uses the existing Buy Me a Coffee destination from the legacy CoCBasePro theme. Header Admin and Donate buttons must have matching control height and visual weight. The persistent floating Donate control is a small circular coffee button and must not occupy meaningful content area on mobile.

## Hero showcase
The homepage hero visual is not tied to a Hall building. It may display a recent Clash of Clans Hero Skin. The runtime uses the legacy hero-skins JSON source, selects a skin from the latest available year, rotates the selection daily, caches it locally, and falls back gracefully if the remote source is unavailable. Images render with contain behavior and must never be cropped.

## Saved Bases
Saved Bases is local-first. Bookmarking stores only lightweight base metadata in localStorage under `NR_COC_SAVED_V1`. No sign-in and no Firebase connection is required. Saved state must synchronize immediately across archive cards, related cards, detail pages, and the Saved sheet in the same browser.

## Stats
Stats are non-blocking UI. Showroom/demo may use deterministic seeded values so the template is visually complete. Production must not require stats to render base cards or Copy Base links. The intended production architecture is one batched Cloudflare stats request per visible result set, with counters cached/aggregated before persistent writes. Direct per-card Firebase listeners are outside this contract.

## Mobile
Mobile detail pages keep the image, stats row, Saved control, Copy Base CTA and a readable description. The floating Donate button must stay above the mobile navigation safe area and must not cover content.
