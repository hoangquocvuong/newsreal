# Content View Contract V11

## Rule
Every template, current or future, must normalize content into one canonical view shape before any renderer runs. The data source may be showroom sample data, seeded editable sample rows in D1, or customer-created posts; the renderer contract does not change.

Canonical browser fields are produced by `nrNormalizeContentRecord()` / `nrPostView()`:
- title, category, image, content
- price
- cta_label
- secondary_label
- detail_label
- detail_url
- extra
- is_sample

`SITE_DATA.posts` is normalized once in the universal boot before template dispatch, so all current templates receive the same aliases and URL/context rules.

## Service card defaults
Service templates use these fallback semantics unless their data overrides them:
- primary CTA: `Liên hệ báo giá`
- secondary CTA: `Giá tiền`
- detail CTA: `Xem chi tiết gói →`

Trial detail URLs preserve `tenant` and `nr_trial` context.

## Server-side sample persistence
`buildTemplatePreviewBlueprint()` normalizes every generated sample row before it can be seeded into D1. Existing sample rows are repaired by merging missing canonical metadata while preserving values the customer already edited.

## New template requirement
A new renderer must consume normalized posts from `SITE_DATA.posts`. Do not add a separate demo/live post mapper. If a template needs new custom fields, store them in `extra_json`; the universal normalizer exposes that object through the canonical `extra` field.

## Regression
`scripts/check-content-view-contract-v11.mjs` fails if the universal normalization step, canonical CTA/detail fields, sample normalization, or Lion card parity hooks are removed.
