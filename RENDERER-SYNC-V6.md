# Renderer Sync V6

- Normalizes Admin posts before public rendering.
- Category remains the single mapping from Admin content to homepage sections.
- Telecom cards now render category-aware fields from the V5 dynamic schema.
- Telecom detail modal uses the same category-aware data instead of a generic field list.
- CTA, price, image, excerpt and extra_json use the shared normalized content contract.
- Demo/Trial/Live keep the same renderer path; no trial/tenant resolver changes.
- Regression check: scripts/check-renderer-sync-v44.mjs.
