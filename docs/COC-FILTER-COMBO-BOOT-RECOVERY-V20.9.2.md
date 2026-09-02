# V20.9.2 CoC Filter Combo + Boot Recovery

- Public `/api/site` boot no longer hard-depends on optional personalization schema.
- If `site_public_settings` is unavailable during/after deploy, site boot falls back to core site data instead of rendering the wrong template shell.
- CoC filter selections are cumulative across Level + Type/Purpose + Year + Sort.
- On mobile, selecting a criterion keeps the filter drawer open; only `Xem … bases` closes the drawer and scrolls to results.
- Desktop filter updates instantly without jumping to results.
- Donate header/floating/footer surfaces use one blue color with no hover transformation.
- Floating coffee icon is flex-centered.
