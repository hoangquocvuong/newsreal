# NEWSREAL Universal Template Layout Contract V1

- `structure_profile` is the single source of truth for homepage section order, exact slot count and responsive columns.
- Every content-bearing section must expose `data-structure-key` and a slot host (`data-contract-grid="1"`, `grid_selector`, or `slot_hosts`).
- `slots` is exact. CSS/computed columns may never change the number of homepage slots.
- Showroom fills the slots with sample content. Trial/client fills the same slots with tenant content and structural empty slots.
- Extra tenant content remains in archives/detail routes; the homepage only renders the declared slot count.
- Custom split layouts use `slot_hosts`; the sum of host slots must equal the section `slots`.
- A release must pass `npm run check:templates`.
