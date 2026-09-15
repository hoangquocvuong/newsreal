# V20.9.27.47 — Universal Product Detail + Dynamic Category Schema

- Checkout demo/customer storefront is now a large centered modal; desktop uses two columns and mobile uses full screen.
- Product “Xem chi tiết” uses a dedicated `/san-pham/<slug>/` page instead of a small detail modal.
- Product detail includes gallery, price, SKU, stock, variants, description, specifications, trust/policy and related products.
- Commerce categories now own `fields_schema_json`.
- Admin can define fields per category with text/number/select/multiselect/boolean/color/size/date, required/filterable/variant flags.
- Product form automatically renders fields from the selected category; no manual JSON required.
- Migration 0060 adds category schema storage and starter schemas for Technology, Fashion and Beauty.
- Contract V28 added.
