# HoangVuongTech V20.9.27.21 — ONE RENDERER / THREE DATA MODES

- Global rule retained for 21 templates.
- Migrated all 6 professional showroom routes away from their separate server HTML renderer.
- Showroom sample content is now transported as `NR_LOCAL_SHOWROOM_PACKAGE` and rendered by the exact same client renderer as trial/live customer content.
- Empty simulation remains a data/display mode over the same renderer instead of a separate template implementation.
- Professional article URLs preserve demo/trial context.
- Added `scripts/check-one-renderer-v6.mjs` regression guard.
- All `npm run check` tests pass.
