# HoangVuongTech V20.9.27.4 — TEMPLATE PLATFORM SYNC

## Root cause
The five professional templates (2 personal blogs, 2 corporate templates, EV charging service) are rendered by the dedicated `proDemoHtml()` hard route, while legacy templates pass through the shared `demoInject()` showroom shell. Because these were two renderer paths, shared platform affordances could drift: favicon, quick publish action, preview chrome, etc.

## Fixes
- Added `proPlatformContract(html,demo)` to enforce shared platform features on every professional demo.
- All five professional demos now always include the default HoangVuongTech favicon (`/favicons/favicon-16x16.png`).
- All five professional demos keep PC / Tablet / Mobile preview controls.
- Added quick publish action in professional template headers:
  - Blog / Corporate: `＋ Đăng bài`
  - EV service: `+ Đăng nội dung`
- Added matching quick-publish action to the real customer renderer (`renderShowcaseTemplate`) with tenant/trial query context preserved.
- HoangVuongTech sales chat remains excluded from client template/demo output.
- Bumped public `style.css` and `site.js` cache keys to `20.9.27.4` so browsers receive the synchronized renderer/CSS.
- Professional demo build header bumped to `20.9.27.4`.

## Admin contact settings verified
Client Admin already contains editable public website information:
- Website name
- Phone
- Zalo
- Public contact email
- Facebook
These are separate from the login email and are loaded by the professional customer renderer.

## Regression checks
`npm run check` PASS.
Runtime checks now assert, for all five professional demos:
- correct dedicated renderer
- default favicon present
- quick publish action present
- PC/Tablet/Mobile preview toolbar present
- no HoangVuongTech sales chat leakage
- no legacy NEWSREAL/BDS shell leakage
