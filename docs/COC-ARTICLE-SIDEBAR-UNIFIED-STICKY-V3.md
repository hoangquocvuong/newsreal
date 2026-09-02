# CoC Article Sidebar — Unified Sticky V3

Desktop article sidebar is a single sticky unit. The wrapper `.coc-detail-side` owns sticky positioning; every direct child remains static. This prevents Information, Quick Guide and Copy Base Link from overlapping or scrolling independently.

Order is fixed: Base Information → Quick Guide → Base Link. No nested sidebar scroll is allowed.

Desktop article stats use a four-column grid so Vote, View, Download and Saved share the same height and baseline. Mobile behavior is unchanged and continues to use the article bottom action dock.
