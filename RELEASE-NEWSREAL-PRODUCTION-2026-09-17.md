# NEWSREAL Production Baseline — 2026-09-17

Consolidated production candidate based on V20.9.27.57.

## Security hardening
- Keeps V53 customer/trial immutability, V55/V56 tenant boundary and V57 cross-tenant CRUD protections.
- Passwords now use PBKDF2-SHA256 (210,000 iterations, random 16-byte salt). Existing legacy SHA-256 accounts remain compatible and are upgraded automatically after a successful login.
- Login, forgot-password and activation abuse controls backed by D1 `auth_rate_limits`.
- Payment webhook secrets are accepted only in headers, never URL query strings. payOS signed webhook verification remains unchanged.
- `/api/image` only serves R2 keys owned by the resolved tenant.
- Logout/password mutations are tenant scoped.

## Required deployment step
Run `npx wrangler d1 migrations apply newsreal-db --remote` before/with deployment so migration `0062_production_auth_security.sql` exists.

## Validation
Run `npm run check`. Production Security Baseline V39 must PASS.
