# Commerce Rebuild V15

- Public Demo `dich-vu-5`, Trial and Live now boot the same `renderCommerceStore()` client storefront instead of maintaining a separate server-rendered demo homepage.
- Storefront visual system rebuilt for a real small-shop experience: sticky search/header, professional featured hero, trust strip, compact 4-column desktop / 2-column mobile catalog, 8-item pagination, discovery navigation, related products, and mobile-first cart/checkout.
- Removed the homepage voucher campaign and removed the voucher field from the customer checkout UI. Backend coupon compatibility is left intact for backward compatibility.
- Commerce Admin now opens with a simple product-first form. Category/schema configuration is collapsed under Advanced.
- Category loading has an 8-second fallback to `Sản phẩm chung`, so a category API problem no longer blocks adding a product.
- Product submit now validates name/price and shows a busy state so clicks have visible feedback.
- Trial resolver, nr_trial mapping, sample tombstones, and non-Commerce template contracts are unchanged.
