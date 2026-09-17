# V20.9.27.57 — Cross-Tenant CRUD Safety

Security hardening release built on V56.

- Keeps all customer-owned ID mutations scoped by `site_id`.
- Coupon usage update now requires both coupon id and current site id.
- Commerce product/category joins require matching tenant identity.
- Product create/update rejects a category id owned by another tenant.
- Adds regression contract V38 so these boundaries cannot silently regress.
- No D1 migration required.
