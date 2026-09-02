# CoC Original UI Port Contract V1

V20.8.7 ports the user-owned CocBasePro theme presentation into NEWSREAL without Blogger template language.

- Original CSS declarations are preserved in `public/assets/coc-original.css` and loaded only by the Clash of Clans renderer.
- Compatible original JavaScript runtime blocks are preserved in `public/assets/coc-original-runtime.js`.
- A source-preservation copy of the compatible extracted blocks is kept in `public/assets/coc-original-runtime-source.js` for parity work.
- Blogger template tags (`b:*`, `data:*`, `expr:*`, widget/includable language) are not used by the runtime page renderer.
- Homepage DOM keeps the original `app-content`, `grid`, `card`, `thumb`, `card-title`, `card-actions`, `free-link`, `premium-link`, `mobile-nav`, `mobile-more-sheet`, `simple-popup`, and `cbp-support-popup` contracts.
- Internal URLs are translated to NEWSREAL routes; visual behavior and client-side interactions remain local runtime concerns.
