# HoangVuongTech V20.9.27.24 — Global Trial Article + Admin Editor Context Fix

## Global trial/article routing
- `nr_trial` is now resolved on every marketplace route, including `/xem-bai`, not only `/demo/...` paths.
- Trial token resolves `website_trials -> site_id -> sites.template_key/preset` before article lookup.
- Invalid/expired trial context returns a trial 404 and is never allowed to fall back to the shared NEWSREAL/BĐS tenant.
- `/xem-bai?id=...&nr_trial=...` remains site-scoped (`id + site_id + published`) before redirecting to the template-specific detail renderer.

## Global Admin editor context
- Added canonical editor states: `create`, `edit_post`, `edit_sample`.
- Editing a Tin mẫu keeps the Tin mẫu sidebar item active while the shared editor is visible.
- Editing a customer-created post keeps Quản lý nội dung active.
- Clicking the create/new-post menu always resets stale editing ID, form data, rich content and uploaded image state.
- Submit labels continue to follow create/update mode and template type.

## Post-save UX
- Successful create closes the editor and returns to the normal content list.
- Successful normal edit closes the editor and returns to the normal content list.
- Successful Tin mẫu edit closes the editor and returns to Tin mẫu.
- A global success toast confirms the completed action after the editor closes.

## Verification
- Full `npm run check` contract suite passes.
