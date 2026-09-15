# V20.9.27.31 — D1 Template Persistence Contract Fix

- Fixed Master template save SQLite error: `30 values for 29 columns`.
- `template_catalog` UPSERT now has 29 target columns: 28 bound placeholders plus `CURRENT_TIMESTAMP`.
- Added regression guard asserting column / placeholder / bind arity.
- Preserves V29 global pricing/global sale and V30 legacy-safe template normalization.
