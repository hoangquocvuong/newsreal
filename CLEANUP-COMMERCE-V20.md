# Commerce cleanup V20

- Fixes the real routing conflict: the early `hardProDemo` branch was intercepting `dich-vu-5` before the later unified Commerce client-renderer branch could run.
- `dich-vu-5` now bypasses the legacy professional server renderer and reaches the shared `INDEX_HTML + demoInject()` path used by the client Commerce renderer.
- Keeps Trial resolver untouched.
- Removes obsolete Commerce patch notes V13-V19 and their one-off regression/apply scripts.
- Updates runtime regression tests to assert that the public Commerce demo no longer leaks NOVASHOP / Smartphone Pro 5G server HTML.
- Preserves existing unrelated local changes from the supplied 2026-09-20 13:07:30 source archive.
