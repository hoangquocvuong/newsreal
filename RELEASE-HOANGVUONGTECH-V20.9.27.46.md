# V20.9.27.46 — Commerce Checkout Production UX

- Upgraded cart quantity controls and line totals.
- Checkout now captures full recipient address: province/city, district, ward, street address.
- Added shipping method selection and clearer payment/checkout sections.
- Added voucher field and professional order summary in the public storefront/demo.
- Order success now returns a real order code and tells customers how to retain it for tracking.
- Added public tenant-scoped order tracking API (`commerce/order-track`) requiring order code + phone.
- D1 migration 0059 persists ward and shipping_method and adds lookup index.
- Demo no longer displays the old “will be saved when activated” placeholder; it simulates a complete order confirmation.
- Existing COD/bank/VietQR/store/online-provider capability remains tenant-owned and isolated from HoangVuongTech template payments.
- All regression contracts PASS, including Commerce Checkout Production UX V27.
