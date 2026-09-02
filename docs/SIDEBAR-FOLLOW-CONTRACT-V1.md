# Universal Sidebar Follow Contract V1 — V20.7.6

- Applies to public homepage and article layouts that expose a sidebar.
- On desktop, the sidebar uses `position: sticky` and follows the taller main content column until the parent section ends.
- The page is the only scroll container: sidebar content must not create a separate inner-scroll runway.
- On tablet/mobile, sidebar returns to normal document flow.
- Contract is visual only; it does not change article/category data.
