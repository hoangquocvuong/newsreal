# HoangVuongTech V20.9.25.2

Hotfix production for new Blog / Corporate / EV service demos.

- Fixed Cloudflare Worker 1101 on new demo routes caused by JavaScript TDZ: `isBlogDemo`, `isCorpDemo`, and `isEvDemo` were referenced before declaration inside `demoInject()`.
- Added correct browser titles for Blog cá nhân, Doanh nghiệp and EV charging demos.
- Added regression contract checks for declaration order, all five new demo routes and all five preview PNG assets.
- Template contract smoke: PASS.
