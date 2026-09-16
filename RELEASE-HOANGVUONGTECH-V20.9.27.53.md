# HoangVuongTech V20.9.27.53 — Customer/Trial Update Safety Contract

This release locks source-update safety as a regression-tested contract.

## Rule
Shared runtime/template code may be upgraded, but deployment must not reset or overwrite tenant-owned data for activated websites or active trials. Protected tenant state includes posts, public settings, commerce categories/products/orders/coupons/settings, sample tombstones and trial records.

Template catalog defaults may evolve. Existing site template identity may only be repaired when `template_key` is missing. Sample deletion remains tombstoned and real customer content remains higher priority than samples.

## Migration rule from 0061 onward
Migrations may add schema and update global/template catalog metadata, but must not `UPDATE` or `DELETE` existing protected tenant rows merely as part of a source release. Tenant data changes must come from explicit user actions or explicit lifecycle operations.

## Regression
`scripts/check-customer-trial-update-safety-v34.mjs` is included in `npm run check`.

No D1 migration is required for V53.
