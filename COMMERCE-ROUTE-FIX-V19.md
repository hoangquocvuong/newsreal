# Commerce Route Fix V19

This patch intentionally modifies the actual server-side demo renderer in `functions/[[path]].js`.
It does not replace that large file from an older snapshot. Run the patch script against the current repository so unrelated newer changes are preserved.

The route `/demo/ban-hang/cua-hang-online/` dispatches `c.kind === 'laptop-store'` to `commerceDemoHome(...)`. V19 replaces that function with the new clean-slate storefront.
