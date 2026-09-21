# V54 — Demo / Trial / Live Full Content Parity

- Retires the old empty/skeleton-first delivery rule for normal template handover.
- Public Demo, new Trial and customer Live use the same template blueprint/sample library.
- Property templates now include editable market/news sample posts sized from the template `news` section slots, so the BDS news grid is populated instead of being completed with skeleton cards.
- Sample-pack version is bumped to 9 so existing Trial/Live sites created by older versions are repaired automatically on the next `/api/site` read.
- Existing customer edits are preserved. Deleted samples remain deleted through `site_sample_tombstones` and are never resurrected by the repair.
- Trial/tenant resolver is unchanged.
