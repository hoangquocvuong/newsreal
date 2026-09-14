# Universal Template Boot Contract V1 (V20.7.5)

## Goal
Never paint one template while another template is still being resolved. The static `public/index.html` is a transport shell only.

## Contract
1. `html` starts with `nr-template-booting`.
2. While booting, the static body is hidden and only a neutral white loader can paint.
3. `/api/site`, template catalog, route normalization, selected renderer, structure geometry, sidebar contract and route contract finish before reveal.
4. `nrTemplateBootReady()` is called from the boot IIFE `finally` after two animation frames.
5. Showroom, trial and client homepage/archive/article routes use the same gate because they all pass through the same public shell.
6. A 12-second safety state keeps the wrong shell hidden and shows a neutral reload message instead of revealing the default BĐS markup.
7. Template render failures may reveal their own explicit error state, but never another template's fallback UI.

## Release check
`npm run check:templates` must verify both the universal layout contract and this boot gate.
