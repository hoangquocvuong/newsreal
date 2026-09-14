# HoangVuongTech V20.9.27.11

## Simulation anchor hotfix
- Fix Có bài mẫu / Không bài mẫu retaining `#contact` (or any other fragment) during reload.
- Both legacy/service simulation and professional simulation now clear the URL hash before switching sample state.
- Prevents the browser from automatically scrolling to Contact after every toggle.
- Adds regression coverage in the template contract test.
