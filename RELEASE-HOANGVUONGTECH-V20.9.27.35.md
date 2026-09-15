# HoangVuongTech V20.9.27.35 — Canonical Admin Context Contract

- Normalizes every local `/admin` link inside demo/trial pages through one canonical context builder.
- Trial Admin links always carry `tenant`, `nr_trial`, and template identity while preserving `tab` and other query parameters.
- Covers static BĐS links, legacy template JS, professional template quick-publish links, and links inserted after initial render via MutationObserver.
- Prevents `+ Đăng bài`, `+ Đăng tin`, footer Admin links, and future template CTAs from opening a context-less NEWSREAL Admin.
- Adds regression contract V16. No D1 migration is required.
