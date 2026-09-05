# NEWSREAL V20.9.24.1 — Master + Trial D1 Query Optimization

Incremental patch on top of V20.9.24. No new migration and no wrangler.toml.

## D1 reductions
- Master overview: replaces per-site correlated post/view/demo/admin/activation/trial lookups with grouped CTEs and LEFT JOINs.
- Master global stats: combines site totals/active and post totals/views; reduces five aggregate requests to three batched reads.
- Trial dashboard: pre-aggregates trial event counts and real post counts once, then joins them to the 500-row dashboard result.
- Tenant stats: combines 7-day and 30-day pageview counts into one 30-day range scan and batches the three required reads.
- Master template catalogue GET: no longer runs ensureTemplateCatalog() schema/seed/update writes on every read.
- Admin /me boot: no longer runs ensureTemplateCatalog() schema/seed/update writes on every boot.
- Master overview GET: no longer runs runtime schema/seed ensure functions before reading the dashboard.

## Preserved contracts
- No UI/template/layout changes.
- No payment, trial conversion, renewal, or publishing contract changes.
- Response field names for Master overview, Master trials, and tenant stats are preserved.
- Runtime writer/upgrade ensure functions remain available on infrequent mutation flows; this patch only removes them from hot GET/read paths.

## Validation
- `node --check functions/api/[[path]].js` PASS.
- No D1 migration required for this release.
