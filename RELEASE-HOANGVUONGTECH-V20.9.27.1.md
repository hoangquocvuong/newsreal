# HoangVuongTech V20.9.27.1

## Master Control tab hotfix

- Fixes the browser freeze on `/control-center/` introduced in V20.9.27.0.
- Root cause: the sales-chat badge `MutationObserver` watched the entire document and rewrote the badge text on every mutation, which could recursively trigger itself and lock the browser.
- Tab navigation now initializes only after the authenticated Master dashboard is visible.
- Adds a one-time initialization guard so tab listeners cannot be bound repeatedly.
- The sales-chat badge observer now watches only `#salesChatUnread` and writes to the tab badge only when the value/state actually changes.
- Login screen no longer initializes the tab system.
- Keeps the 9-tab Master Control layout from V20.9.27.0.
- Adds regression checks to prevent whole-document chat badge observers and login-time tab initialization from returning.

Validation: `npm run check` PASS.
