# CoC Portal UX Contract V4

## Purpose
The Clash of Clans template is a free community base-sharing portal. It does not use Free/Premium product separation.

## Homepage
- Homepage is Hall-first: Town Hall, Builder Hall and Clan Capital level cards.
- Main navigation keeps the original portal destinations and every item must resolve to a real route or anchored section.
- Hero Hall artwork must use `object-fit: contain`; no crop is allowed.
- Hero uses the high-resolution Hall image variant.
- CoC footer is template-specific and must never fall back to real-estate footer content.

## Archive
- Hall/type/year/sort filters update only the base browser DOM.
- History API keeps shareable URLs and back/forward behavior without full page reload.

## Detail
- Desktop: image, taxonomy/title, view/vote/download, SEO body, Copy Base Link, related bases and CoC footer.
- Mobile: image, view/vote/download and Copy Base Link only. Related/SEO/footer content is hidden to preserve the compact legacy behavior.

## Related bases
Related bases prefer the same Hall level, then same group, then same purpose.

## Release gate
A Game template cannot enter the catalog unless the universal template tests and CoC-specific menu/related/footer/hero checks pass.
