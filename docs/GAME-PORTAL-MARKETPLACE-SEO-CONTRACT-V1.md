# V20.8.0 — Game Portal & Marketplace SEO Contract V1

## Release gate
A Game template is not eligible for `/templates/` until it passes the same universal contracts as News, Real Estate and Service templates: isolated demo boot, exact structure slots, showroom/trial/client layout parity, route consistency, title-only cards where applicable, complete sample package, Admin taxonomy parity, no cross-template fallback flash, responsive rendering and contract smoke tests.

## Clash of Clans content contract
`game-1` uses `content_type=game` and the common engine. Admin fields: Game Group, Level, Purpose, Style, Defense, Access Tier, Copy Link, Premium Link and Year. Visible groups are Town Hall, Builder Hall and Clan Capital. Showroom sample payload fills all exact slots; trial/client with no content keeps the same empty-slot geometry.

## Routes
- `/demo/game/clash-of-clans/`
- `/demo/game/clash-of-clans/free-bases`
- `/demo/game/clash-of-clans/premium-bases`
- `/demo/game/clash-of-clans/base/<slug>.html`

## Marketplace SEO contract
Each sellable template may store `seo_title`, `seo_slug`, `primary_keyword`, `secondary_keywords`, `meta_description`, and `internal_anchor`. Marketplace cards expose natural commercial-intent keywords without keyword stuffing. Category landing pages receive category-specific title/description and important templates receive an indexable SEO detail landing page.

Clash of Clans target detail URL: `/templates/game/clash-of-clans-base/`.
