# CoC Portal Menu Runtime Contract V1

V20.8.6 rebuilds the Game navigation from the original CocBasePro interaction model.

## Primary navigation
`#mobile-nav` is the only primary portal navigation. Desktop renders it as a fixed left rail; mobile renders it as a fixed bottom bar. It contains Home, News, Find Source, Donate, Saved and More.

## Popup ownership
- `#mobile-more-sheet`: owns only the More category launcher.
- `#simple-popup`: owns News, Find Source, Saved and secondary informational tools.
- `#cbp-support-popup`: owns the donation/community support experience.

Only one popup surface may be open at a time. Opening More suppresses the primary nav, exactly as the legacy runtime did. Secondary actions from More close the sheet first and open their destination on the next two animation frames to avoid overlapping layers. Escape closes all popup surfaces.

## Background visibility
The original CocBasePro background artwork is applied directly to `body.theme-game-clash`. Game root wrappers must remain transparent. Full-width sections may not use an opaque background that hides the artwork; legibility is provided by translucent inner `.coc-wrap` panels.

## Compatibility
Filter transitions remain History API + DOM-only updates. Bookmark/stats/detail contracts are unchanged.
