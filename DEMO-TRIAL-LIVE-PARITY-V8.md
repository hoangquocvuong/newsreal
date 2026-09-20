# V8 — Demo / Trial / Live parity

- Demo continues to render the canonical template blueprint.
- Trial and handed-over/live sites install/repair the same editable sample pack from that blueprint.
- Existing sample edits are preserved; repair only restores technical sample identity.
- Deleted samples are protected by `site_sample_tombstones` and are never recreated by backfill.
- Customer posts are ordered before sample posts on the public site.
- Sample pack version is 7 so existing tenants are repaired once after deployment.
- Trial tenant resolver / `nr_trial` mapping is unchanged.
