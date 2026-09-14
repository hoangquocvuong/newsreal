# CoC Mobile-first UX Contract V2 — V20.9.0

## Navigation
On viewport widths <= 820px the fixed bottom navigation is forbidden. The mobile header must expose the brand, supported primary CTAs, and one hamburger toggle. The hamburger opens a compact top dropdown and must not use a full-screen overlay. Only routes/actions backed by the NEWSREAL runtime are allowed.

## Filter experience
The full five-row filter control must not remain permanently expanded on small screens. Mobile shows a compact active-filter summary and opens the controls in a bounded drawer (target <= 76vh) with its own vertical scroll. Reset and View Results remain visible at the drawer footer. Any filter change updates the URL with History API and scrolls to the result toolbar.

## Remembered Hall
The most recent group/level/type/year/sort is stored in `NR_COC_LAST_FILTER_V1`. Browse Bases may reopen that preference locally without requiring an account, database, or Firebase.

## Saved feedback
Saved remains `NR_COC_SAVED_V1` local-first. Every successful add must immediately update the bookmark state and show `Base đã được lưu`. Every removal must show `Base đã được bỏ khỏi Saved`. Toast feedback must be non-modal, screen-reader announced, and auto-dismiss.

## Mobile detail CTA
The detail page exposes a persistent mobile Copy Base dock. It must not suppress the article description and must leave sufficient bottom spacing so content is not obscured.

## Performance
None of navigation, filtering, remembered preferences, Saved state, or Saved feedback requires Firebase. Base content renders before optional statistics.
