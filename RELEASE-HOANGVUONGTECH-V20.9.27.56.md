# V20.9.27.56 — Strict Tenant Boundary + Pricing Regression

- Custom domains ignore `X-Tenant` and `?tenant=` overrides and always resolve their own hostname.
- Tenant overrides remain available only on trusted shared preview hosts: localhost, `*.pages.dev`, and `app.hoangvuongtech.com`.
- `DEFAULT_TENANT_DOMAIN` fallback is restricted to those shared hosts.
- Customer renewal info and renewal completion now read the current annual base price from `template_catalog.price` and fail closed if it is missing.
- Added V37 behavioral/static regression coverage for cross-tenant host switching and renewal pricing.
- No D1 migration.
