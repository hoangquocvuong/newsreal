# V20.9.27.30 — Universal Template Save Contract V2

- Existing templates can always be edited/saved from Master Control even if their legacy structure predates the current Universal Layout Contract.
- Structure validation remains strict for brand-new active templates before they enter the marketplace.
- Legacy category sections automatically infer a missing `category` from the section title when `content_source=category`.
- Locked geometry continues to be preserved byte-for-byte during commercial/SEO metadata edits.
- Validation diagnostics remain available, but no longer lock administrators out of existing templates.
- Global Pricing/Sale V29 is preserved: Master base price remains the source of truth and renewal remains the base price.
- Added regression check `check-master-template-save-contract-v12.mjs`.
