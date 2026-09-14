# HoangVuongTech V20.9.26.4

- Sales consultation chat belongs only to HoangVuongTech marketplace/marketing pages.
- No tenant/client website chat integration.
- Visitor chat keeps context: source URL, page title and template being viewed.
- Master Control adds two-way chat inbox with New / Consulting / Won / Lost / Closed status.
- 5-second polling while Master is open; unread badge and reply history.
- New D1 migration: `0051_sales_chat.sql`; runtime also self-ensures tables for safe deployment.
- Based on V20.9.26.2 to avoid the mistaken tenant chat implementation from V20.9.26.3.
