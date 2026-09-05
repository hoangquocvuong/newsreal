# NEWSREAL V20.9.24 — D1 Efficiency Foundation

Purpose: stop unnecessary D1 schema/index work on normal public/API requests without changing template UI, trial/payment flows, or content contracts.

Changes:
- Public `siteFor()` no longer executes `CREATE TABLE` + repeated `ALTER TABLE` on every request.
- API `siteFor()` no longer calls `ensureSitePublicSettings()` on every lookup.
- Removed `ensureTrialTables()` and `ensurePerformanceIndexes()` from the normal authenticated/public site API hot path.
- Removed repeated `ALTER TABLE posts ...` / `CREATE INDEX ...` before post CRUD.
- Settings save no longer performs schema migration work at runtime.
- Global daily pageview count now uses a range predicate instead of `date(created_at)=date('now')`.
- Added migration `0048_d1_efficiency_foundation.sql` with lookup/range indexes used by production queries.

This is phase 1. It intentionally does NOT redesign master/trial dashboards yet; pagination/aggregate caching can follow after production usage is measured.
