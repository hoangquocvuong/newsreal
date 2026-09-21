# V56 — All Estate Homepage Real Content

- Fixes the shared `Dự án & khu vực nổi bật` renderer so its item count follows each BĐS template structure profile instead of being hard-capped at six.
- Fills project/area slots from real project/location metadata, then real listing titles if a profile needs more unique slots.
- Removes placeholder padding from compact sale/rent rows and fills them from the real property pool.
- Adds a final shared property-section guard: an under-filled legacy BĐS slot host reuses real rendered property slots instead of creating `Chưa có tin đăng` skeletons.
- Applies through shared estate renderers/contracts, not a one-off patch for Mẫu 3.
- Does not change tenant/Trial resolution, post storage, or Commerce.
