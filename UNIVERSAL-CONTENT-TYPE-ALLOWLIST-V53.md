# Universal Content Type Allow-list V53

Fixes content-family leakage in Admin without changing Trial/tenant resolution.

- Property templates (`mau-1`..`mau-5`): only `Bất động sản` and `Tin tức`.
- News/blog/corporate: only editorial News.
- Service templates: only Service; category semantic modes decide commercial/editorial/event fields.
- Game: only Game.
- Product/Commerce: only Product.
- A template may explicitly declare `allowed_content_types` for future controlled exceptions.

This separates two concepts: template-level allowed content families and category-level adaptive field schema.
