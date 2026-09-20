# V7 Trial Content Parity

- Service renderer now reads `SITE_DATA.posts` returned by `/api/site`; the obsolete `window.NR_POSTS` source was never populated.
- Customer-created posts sort before sample posts.
- Trial and handed-over sites keep editable/deletable sample posts from the same template blueprint.
- Sample pack version bumped to 6 so existing trials are backfilled with missing canonical sample rows without resurrecting deleted samples (tombstones remain honored).
- Trial tenant resolver and `nr_trial` mapping are unchanged.
