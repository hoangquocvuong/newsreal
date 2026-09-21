# Commerce Category Decoupling V28

- Product form always has useful default categories even when category GET is unavailable.
- Custom categories are immediately usable and cached locally.
- Product publish sends category_name as canonical fallback.
- API resolves/creates category atomically during product creation, so publishing no longer depends on a successful category reload.
- GET categories is lightweight and no longer performs schema/bootstrap DDL before reading.
