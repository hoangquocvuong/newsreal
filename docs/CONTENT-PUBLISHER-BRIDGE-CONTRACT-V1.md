# Content Publisher Bridge Contract V1

## Goal
Allow the existing CoCBasePro VPS import pipeline to publish normalized Clash of Clans base records directly into a Cloudflare/D1 tenant without Blogger being the canonical content store.

## Security
- Cloudflare secret: `CONTENT_PUBLISHER_SECRET`
- VPS secret with the same value.
- Requests must send `Authorization: Bearer <secret>` (or `X-Publisher-Token`).
- Never expose this token in browser JavaScript.

## Endpoints

### GET `/api/publisher/health`
Authenticated capability check.

### GET `/api/publisher/check?tenant=<domain>&external_key=<key>`
Idempotency/duplicate lookup before publish.

### POST `/api/publisher/base`
Creates or updates one Game/Clash base.

Required identity fields:
- `tenant_domain`
- `title`
- one stable identity: `external_key`, `base_id`, `baseLink`, or `source_url`

Accepted CoCBase pipeline fields include:
- `sourceUrl` / `source_url`
- `slugKey` / `slug`
- `group` / `game_group`
- `level` / `game_level`
- `type`, `baseType`, or `game_purpose`
- `style` / `game_style`
- `defense` / `game_defense`
- `baseLink` / `copy_link`
- `premiumLink` / `premium_link`
- `processedImageUrl`, `imageUrl`, `image`
- `originalImageUrl`
- `description` / `content`

## Idempotency
`publisher_imports(site_id, external_key)` is unique. Publishing the same base again updates the same post instead of creating another post.

A stable SEO slug is also unique per tenant. Conflicting slugs receive an 8-character deterministic suffix.

## Route contract
Production Game posts are returned by `/api/site` with:

`/base/<slug>.html`

This is the same article route shape used by the Game showroom, so showroom/trial/client route contracts stay aligned.

## Safe migration sequence
1. Keep Blogger publisher enabled.
2. Enable Cloudflare bridge in mirror mode on the VPS.
3. For every imported base, publish to Blogger and Cloudflare.
4. Compare counts, slugs, images, copy links, Free/Premium classification and article rendering.
5. Only after parity is confirmed, switch canonical publishing to Cloudflare.
6. Keep Blogger as temporary fallback until redirects/canonical SEO migration is complete.

## VPS adapter
Reference implementation:

`integrations/cocbase-vps-cloudflare-adapter.js`

Environment example (values are deployment secrets, not source-code constants):

- `COCBASE_CLOUDFLARE_PUBLISH_URL=https://<cloudflare-project-or-api-domain>`
- `COCBASE_TENANT_DOMAIN=<target-domain>`
- `CONTENT_PUBLISHER_SECRET=<secret>`
