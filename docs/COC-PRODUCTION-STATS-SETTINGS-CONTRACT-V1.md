# CoC Production Stats + Template Settings Contract V1 — V20.9.1

## Production stats
- Frontend does not connect to Firebase.
- GET `/api/game/stats?slugs=...` batches up to 60 base slugs in one D1 query.
- POST `/api/game/stats/action` records `view`, `download`, or `vote`.
- Detail views are locally deduplicated once per base/day before a write is sent.
- Votes are one mutable 1–5 rating per anonymous browser client id and base.
- Saved remains localStorage-first and creates no database traffic.
- Demo/showroom keeps deterministic seeded stats and does not write production counters.

## Template personalization
- `structure_profile.settings_schema` is the authoritative list of customer-editable settings for a template.
- Admin Client renders these settings dynamically; future templates add fields to the schema instead of hard-coding a new admin form.
- Values are stored per tenant in `site_public_settings.settings_json`.
- Game V1 exposes donate URL, About page title/content, Terms title/content, and footer text.
- URL fields are validated server-side and free text is rendered escaped on public pages.
