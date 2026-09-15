# V20.9.27.37 — Universal Hero Editing Contract

- Admin Client now derives Hero editing fields from the template structure contract instead of a hard-coded template list.
- Any static Hero section (`content_source: none`, `bind_required: 0`, or `hero_editable: 1`) receives the shared Hero settings schema at runtime, including existing D1 template profiles.
- The same normalized schema is used for GET `/me` and PUT `/settings`, preventing UI/save contract drift.
- FPT, Lân Sư Rồng and showcase/professional Hero image renderers consume the per-site `hero_image` override while retaining their template defaults.
- Customer settings remain site-scoped; template/demo defaults are not overwritten.
- No D1 migration is required.
