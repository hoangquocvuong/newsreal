# Universal Adaptive Editor V51

A single Admin rule now decides which fields belong to a category across templates.

- `news` / editorial categories: simple article editor; commerce price/spec/CTA fields are hidden.
- `property`: keeps real-estate price, area, location and property specifications.
- `service`: commercial categories keep service price/spec fields; editorial categories such as Tin tức, Tin hoạt động, Kiến thức, Cẩm nang and Hướng dẫn automatically become simple articles.
- `product`: keeps product schema.
- `game`: keeps game taxonomy schema.
- Existing Telecom and Lion Dance specialized field definitions are retained, but are selected through the shared category-mode contract.
- Future templates can declare `editor_profile.category_modes` to explicitly mark a category as `editorial`, `commercial`, `property`, `product`, `game`, or `event` without adding template-specific UI code.
- Trial/tenant resolver is not changed.
