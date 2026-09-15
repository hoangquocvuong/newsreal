# V20.9.27.48 — Commerce Interaction + Variant Matrix

- Fixed Add to cart and Buy now on dedicated demo product pages.
- Product detail variant selection now updates SKU, price, stock and optional variant image.
- Customer product detail recreates the shared cart/checkout shell after route rendering, fixing dead CTA buttons.
- Cart lines preserve variant identity, SKU, image, price and quantity.
- Checkout validates variant existence, server-side variant price and variant stock before creating an order.
- Admin category schema variant fields can generate a Cartesian variant matrix with per-variant SKU, price, stock and image.
- Product API sanitizes variant payloads before persistence.
