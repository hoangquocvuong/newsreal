# CoC Renderer Recovery Contract V1

Contract: `game-renderer-symbol-complete-v1`

The public Clash of Clans showroom must be able to render its homepage from the local Game package even when tenant/API enrichment is unavailable.

Regression fixed in V20.9.5: `renderGameClash1()` referenced `nrGameLevelCards()` after that helper had been removed during a later refactor. The route booted correctly, then threw before the Hall grids were created, causing the emergency recovery screen.

Required invariants:

- `nrGameLevelCards(group,prefix)` must exist before the Game renderer is invoked.
- TH/BH/CH homepage grids are produced from `GAME_LEVELS` and `GAME_CLASH_LEVEL_ART`.
- Demo post rendering prefers `SITE_DATA.posts` created by the local Game boot package; the compiled sample array is only fallback data.
- A Game demo must never cross-fallback into a real-estate renderer.
- Missing optional stats/settings/hero skin data may degrade only that optional feature, never the core Game homepage.
