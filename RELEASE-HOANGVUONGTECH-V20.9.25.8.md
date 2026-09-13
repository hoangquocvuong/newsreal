# HoangVuongTech V20.9.25.8

Clean production source hotfix.

- Removed the obsolete duplicate professional-demo renderer that declared `proDemoHtml()` twice and prevented the Worker module from importing.
- Kept only the V20.9.25.7 rich real-photo / multi-category renderer.
- Added an ESM runtime import test plus direct HTTP smoke tests for all five professional demos and an article route.
- Bumped the demo build header to `20.9.25.8`.
- Removed repository/cache/release-history junk from the distribution archive.
