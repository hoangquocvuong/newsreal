# V20.9.27.26 — Trial Detail + Hero + Sample Parity

- Professional trial article URLs `/demo/.../bai-viet/<slug>/?id=...&nr_trial=...` now boot the tenant/template shell instead of falling through to legacy NEWSREAL/BDS.
- Article ownership is validated by both `post.id` and `site_id`; no cross-tenant fallback.
- Lân Sư Rồng trial hero now uses a rotating multi-image slider sourced from the tenant's actual post/gallery images, matching showroom behavior.
- Sample pack repair version bumped to V5. Existing trials self-heal missing/incorrect professional sample rows on the next public site API load without overwriting edited content.
- Homepage continues to prioritize customer-created posts before editable samples.
