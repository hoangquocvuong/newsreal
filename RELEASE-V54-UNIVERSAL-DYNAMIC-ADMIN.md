# V54 Universal Dynamic Admin Contract

- Admin modules are derived from the resolved template `structure_profile` + `editor_profile`, not template IDs.
- `/api/me` exposes `content_profile.admin_capabilities`.
- Commerce menus are enabled only when the template data declares a commerce contract/content/section.
- Lead inbox is enabled only when the template data declares a lead contract/contact section.
- Unsupported Admin deep-links fail closed to Overview.
- Trial token/site identity remains authoritative over URL template hints.
- Future templates can gain Admin modules by declaring the corresponding structure contract without editing Admin menu code.
- No D1 migration required.
