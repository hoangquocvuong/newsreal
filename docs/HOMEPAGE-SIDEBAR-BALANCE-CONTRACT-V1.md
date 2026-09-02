# Homepage Sidebar Balance Contract V1

Applies to homepage layouts that contain a sidebar.

- The latest/news feed must never finish visibly above the sidebar on desktop.
- `sections[].slots` is the guaranteed minimum.
- A latest section may opt into `slot_contract: sidebar-balanced`.
- The renderer supplies reserve real posts; the universal geometry pass measures the sidebar and keeps only the extra complete rows required to meet its height.
- Extra rows are capped by `homepage_sidebar_balance.max_extra_rows`.
- Showroom, trial and client use the same rule. If real content is insufficient, structure placeholders preserve the visual frame.
- Tablet/mobile keep the declared base slot contract and normal document flow.
