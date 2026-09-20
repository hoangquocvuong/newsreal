# Commerce Fresh Storefront V17

V17 replaces the inherited Commerce visual layer with a new marketplace-style storefront while keeping the existing commerce API, tenant isolation, cart and checkout contracts.

- New bright marketplace visual system (`market17`), not the V15/V16 hero layout.
- Desktop: category rail + primary campaign banner + secondary promotion cards.
- Product discovery: category menu, category pills, search, sorting and 8-item pagination.
- Mobile: compact header/search, horizontal navigation and 2-column product grid.
- Cart and checkout remain connected to the existing commerce order API.
- `universal_commerce_5` still enters exactly one `renderCommerceStore()` path, so Demo/Trial/Live share the same storefront code.
- Cache key bumped to `commerce-v17-new`.
