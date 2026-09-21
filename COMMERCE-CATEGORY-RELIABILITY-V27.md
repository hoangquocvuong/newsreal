# Commerce Category Reliability V27

- Fixes Trial Admin category loading timeout and false-success category creation.
- Default Commerce categories are bootstrapped server-side for the resolved tenant/trial.
- Creating a category is idempotent and returns the persisted category object.
- Admin only shows success after the API confirms persistence and the category can be read back.
- Newly created category is automatically selected in the product form.
- No tenant/trial resolver changes.
