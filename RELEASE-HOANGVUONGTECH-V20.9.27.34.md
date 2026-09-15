# HoangVuongTech V20.9.27.34 — Trial Admin Context Contract

Fixes service-template Trial CTAs such as `+ Đăng bài` opening Admin without the resolved tenant context when the public Trial URL only contains `nr_trial`.

- `sxAdminNewPostUrl()` now delegates Trial links to the canonical `nrDemoAdminUrl()` builder.
- Fallback construction also uses server-injected `NR_TRIAL_TENANT` and `NR_TRIAL_TOKEN`, not only visible query parameters.
- `tenant`, `nr_trial`, `template`, and destination `tab` are preserved together.
- Prevents Admin from falling back to the generic/unactivated NEWSREAL context with 0 posts.
- Adds `check-trial-admin-context-v15.mjs` regression coverage.

No D1 migration is required.
