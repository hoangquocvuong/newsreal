# Commerce Admin Init V29

- Render 9 default Commerce categories synchronously before any API request.
- Remote categories enrich the dropdown in background and no longer block publishing UI.
- Product list loads independently from category API and has a 7-second timeout + retry action.
- Inject a compact responsive form layout to fix label/input spacing without changing tenant/trial routing.
