# Commerce Admin Cache V30

Root cause found in the current deployed source: `public/assets/admin.js` had been changed through V29, but `public/admin.html` still loaded `/assets/admin.js?v=20260920-v16`. Browsers/CDN could therefore keep executing the older Commerce Admin initializer.

V30 bumps the asset version and also renders the nine default Commerce categories directly in HTML. The product form no longer depends on JavaScript/API execution just to show its initial category choices.
