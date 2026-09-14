# Template One Renderer / Three Data Modes V6

From V20.9.27.21, showroom, empty simulation and live/trial must render through the same client renderer for a template.

## Modes
- sample: sample package -> shared renderer
- empty: same sample package + empty/skeleton mode -> shared renderer
- live: D1 tenant data -> shared renderer

Professional showroom routes no longer execute the legacy server HTML renderer. The server only transports the sample data package and boots the same `public/assets/site.js` renderer used by customer/trial sites.

All 21 template keys remain under GLOBAL_TEMPLATE_KEYS. Legacy BDS/news/service/product/game templates already use the shared client boot; the 6 professional templates are now migrated to the same architecture.

## Release guard
`scripts/check-one-renderer-v6.mjs` fails if professional showroom routes call `proDemoHtml()` again or if the client boot stops consuming the shared showroom package.
