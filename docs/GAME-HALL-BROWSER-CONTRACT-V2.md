# Game Hall Browser Contract V2 — V20.8.2

- Homepage is a Hall-level chooser only; it never renders individual base posts.
- Town Hall levels: TH2–TH18. Builder Hall: BH2–BH10. Clan Capital: CH1–CH10.
- Hall artwork uses `object-fit: contain`; no crop is allowed.
- Clicking a Hall opens the Free archive with that group/level selected. Premium opens the same level in Premium mode.
- Archive state is URL-driven: `th|bh|ch`, `type`, `year`, `sort`.
- Archive filters include group, level, type, year, sort, and Free/Premium mode.
- Listing cards show base image/title/taxonomy only. Vote/view/download are reserved for the base detail page.
- Detail pages retain vote/view/download and Copy/Premium CTA.
- `structure_profile` V2 locks homepage chooser counts to 17/9/10.
