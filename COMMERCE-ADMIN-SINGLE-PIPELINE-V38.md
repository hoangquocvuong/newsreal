# Commerce Admin Single Pipeline V38
- Removes the false "Admin not ready" publish dependency.
- Commerce publish is self-contained and preserves tenant/nr_trial.
- Owns the product image input to prevent duplicate stale listeners.
- Multiple image upload with explicit cover selection.
- Removes legacy featured-slider field from quick product form.
- On success hides the creation form and moves to product management.
