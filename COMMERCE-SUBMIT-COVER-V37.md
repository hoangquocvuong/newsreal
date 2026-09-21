# Commerce V37 — submit lock + cover image

- Native Commerce form submission is blocked at HTML level.
- Publish is a `type=button` and calls the Commerce publisher directly, so browser GET cannot replace `tenant` / `nr_trial` with product fields.
- Multi-image preview lets the merchant explicitly choose the cover image or remove an image.
- Chosen cover is stored as `image_url`; remaining images are stored as gallery.
- Admin asset cache bumped to V37.
