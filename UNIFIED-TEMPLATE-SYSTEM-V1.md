# Unified Template System V1

- One shared template profile registry: `public/assets/template-system.js`.
- Demo, Trial and Live resolve the same template capability identity for UI/rendering.
- Trial/tenant ownership resolution is untouched; the registry never reads or changes trial tokens/site IDs.
- Admin sidebar is allow-listed per profile. Unsupported modules are never shown.
- Admin CTA, content type, editor labels and placeholders follow the selected profile.
- Commerce, Internet service, Lion Dance, News/Blog, Corporate, Product, Game and Estate have independent profiles.
- Public runtime exposes the same resolved profile through `data-template-profile` so layout/CSS/JS can share one identity contract.
- V40 regression test now verifies the capability registry and trial isolation boundary.
