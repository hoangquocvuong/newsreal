# HoangVuongTech V20.9.27.38 — Effective Hero + Slider Contract

- Customer Admin uses plain-language “phần đầu Trang chủ” labels and contextual help instead of requiring customers to understand the term Hero.
- Existing Hero text defaults are pre-filled from the template contract; FPT now shows the exact current title, description and CTA labels before the customer edits anything.
- Universal Hero definitions upgrade legacy settings schemas instead of being skipped by old `hero_*` fields.
- Templates declaring a slider/gallery Hero receive a multi-image editor with preview, upload, delete and reorder controls.
- Slider image arrays are validated and stored per customer website.
- Lân Sư Rồng consumes customer slider overrides and editable title/description/CTA values while retaining template/sample fallbacks.
- No D1 migration is required.
