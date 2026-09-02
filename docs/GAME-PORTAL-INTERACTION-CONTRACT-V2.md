# Game Portal Interaction Contract V2

## Navigation
The Game template uses popup navigation rather than full-page navigation for tool/community destinations. Home remains a normal route. News, Find Source, Donate, Saved and More open a shared accessible popup layer. More presents the legacy portal destinations in a compact 3-column grid and may open nested portal content without a document reload.

## Archive card contract
Every base card in `/bases` exposes exactly four utility metrics/actions beneath the taxonomy tags: Vote, View, Download and Bookmark. These controls must not trigger card navigation. Filtering remains asynchronous: query-state changes update History API and replace only the base browser region.

## Detail contract
Immediately below the base image, detail pages expose the same Vote, View, Download and Bookmark row. The direct Copy Base Link remains the primary action. Mobile keeps a concise description/body visible for content and SEO parity; related bases may remain desktop-first to keep the mobile page compact.

## Bookmark persistence
Showroom uses `localStorage` key `coc_saved_bases_v1` for immediate no-login interaction. Client/production adapters can bind the same UI contract to account/Firebase/backend storage without changing markup semantics.

## Background contract
The Game portal restores the legacy CocBasePro full-viewport artwork using the original image reference with a dark overlay. Content surfaces may use translucent backgrounds for readability but may not replace the global portal artwork with the generic NEWSREAL/BĐS background.
