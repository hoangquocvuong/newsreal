# Commerce Gallery Restore V41

Fix root cause: API returns saved secondary images in `gallery_json`, but V40 Edit read `gallery`. V41 parses `gallery_json`, restores cover + every gallery image into edit state, and the existing API PUT persists `gallery_json` again when saving.
