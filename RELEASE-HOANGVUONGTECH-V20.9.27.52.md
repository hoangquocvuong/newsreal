# V20.9.27.52 — Product Hero Slider

- Replaced generic Commerce marketing hero with a featured-product slider.
- Demo slider uses real catalog products with image, badge, price, old price, detail CTA and add-to-cart CTA.
- Previous / Next / dots / 5-second auto rotation; responsive mobile layout.
- Removed the duplicated FLASH SALE / COD side boxes from the hero.
- Customer storefront builds the hero from `commerce_products.is_featured` so product edits automatically update the slider.
- Admin product form now exposes a simple `Đưa sản phẩm lên Slider nổi bật` checkbox.
- Added Product Hero Slider Contract V33 and updated obsolete compatibility assertions.
- No D1 migration required: `commerce_products.is_featured` already exists.
