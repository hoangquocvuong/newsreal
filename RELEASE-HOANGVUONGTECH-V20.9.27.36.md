# V20.9.27.36 — Customer Website Appearance Settings

- Adds customer-editable Hero image/title/description/CTA fields to the professional template settings contract.
- Admin Client can upload Hero media using the existing tenant R2 image upload endpoint and preview it before saving.
- FPT (`dich-vu-1`) renders customer Hero settings, while empty settings preserve the original template/demo defaults.
- Master/template defaults remain independent; customer settings are persisted per site in `site_public_settings.settings_json`.
- No D1 migration required.
