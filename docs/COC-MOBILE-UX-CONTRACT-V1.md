# CoC Mobile UX Contract V1

## Goals
- Preserve the V20.8.4 community sharing architecture.
- Hero Hall artwork must use responsive high-resolution sources without upscaling/cropping.
- Filter changes update only the archive DOM and automatically focus the result block.
- Desktop navigation is concise and task-oriented; mobile uses a five-item bottom navigation.
- Buy Me a Coffee donate CTA is always reachable without blocking content.
- Touch targets should be at least ~40-44 px for primary mobile actions.

## Menu
Desktop: Home, Browse Bases, TH, BH, CH, News, Saved, Donate.
Mobile: Home, Bases, Saved, More, Donate. More exposes secondary destinations.

## Result focus
All filter links use History API. After DOM replacement the viewport scrolls to `#base-results`, not back to the top of the filter panel.

## Donate
Canonical support URL: https://buymeacoffee.com/cocbase
