# Universal Schema Contract V52

V52 hardens V51 into one semantic category contract for all non-Commerce content editors.

- Category semantics are resolved centrally as editorial, commercial, property, product, game or event.
- API `editor_profile.category_modes` remains the first override for current and future templates.
- Built-in mixed templates have explicit safe defaults instead of relying only on category-name heuristics.
- Telecom package categories are commercial.
- Lion Dance package categories are commercial, completed events are event mode, and news/knowledge categories are editorial.
- Commerce guide/news categories are editorial.
- Editorial categories never receive price/package/CTA/specification fields inherited from a service template.
- Fixes a V51 edge case where Lion Dance editorial categories could still render service fields because the specialized renderer ran before the semantic mode was enforced.
- Trial/tenant routing is unchanged.
