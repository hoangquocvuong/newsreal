# V20.9.27.23 — SAMPLE ADMIN LIBRARY + REAL POST PRIORITY

- Admin `/me` now installs/backfills the selected template sample pack before dashboard stats render.
- Existing V20.9.27.22 trials are repaired once via sample pack version 2.
- Added a dedicated **Tin mẫu** Admin section. Sample content is separated from customer-created content but remains editable/deletable.
- `Quản lý nội dung` now shows only customer-created posts.
- Trial article detail no longer hides sample articles.
- Public customer/trial data is explicitly sorted with real posts before sample posts; Lion template also enforces the same priority inside its renderer.
- New regression: `check-sample-admin-library-v8.mjs`.
