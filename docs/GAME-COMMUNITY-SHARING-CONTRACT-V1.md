# Game Community Sharing Contract V1 — V20.8.3

`game-1` is a community sharing website, not a base shop. Every published base is directly copyable; the Game contract has no Free/Premium mode, access tier, or premium link.

## Home
- Home is a Hall browser only: TH2–TH18, BH2–BH10, CH1–CH10.
- Hall artwork uses `object-fit: contain` so the full building is visible.
- One Hall click opens `/bases?<group>=<level>`.
- No vote/view/download counters appear on Hall cards or archive cards.

## Base archive
- Canonical archive route is `/bases`.
- Legacy `/free-bases` and `/premium-bases` are accepted only as compatibility aliases and are normalized to `/bases` in the client.
- Filters: group, level, group-specific type/district, year and sort.
- Filter links keep real URLs for SEO/fallback, but normal interaction uses History API + DOM replacement so only the base result area is updated.
- TH types: War, Farming, Hybrid, Trophy, Legend, CWL, Troll.
- Builder Hall uses builder-defense intents.
- Clan Capital uses district taxonomy.

## Detail page
- Desktop may show SEO description, taxonomy and contextual copy-link card.
- Mobile is intentionally compact: base image, vote/view/download, and Copy Base Link only.
- All copy links are direct community links. There is no premium CTA.

## Navigation
The Clash template keeps the legacy CoCBasePro navigation vocabulary: Home, News, Find Source, Donate, Saved, More. More contains Town Hall, Builder Hall, Capital Hall, Events, Rankings, Hero Skins, About, Privacy, Android App and iOS App destinations.

## Isolation
The parent NEWSREAL real-estate header/footer must not leak into `theme-game-clash`. The Game renderer owns its header/footer and article presentation.

## Showroom data
The showroom uses a curated subset of real legacy Atom feed entries for title, image, labels and Clash of Clans copy link. Trial/client remain tenant-data driven and must not inherit showroom records.
