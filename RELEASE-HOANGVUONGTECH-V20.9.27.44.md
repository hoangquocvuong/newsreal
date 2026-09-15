# HoangVuongTech V20.9.27.44 — Universal Commerce Foundation

- Chuyển `dich-vu-5` từ showroom Laptop thành template Cửa hàng Online / E-commerce tổng quát.
- Laptop chỉ còn là sample catalog; Commerce Engine dùng Product / Category / Attribute / Variant, không hard-code ngành hàng.
- D1: categories, products, orders, coupons, settings.
- Storefront: tìm kiếm, lọc danh mục, sort, chi tiết nhanh, tồn kho, giỏ hàng local, checkout.
- Thanh toán theo từng tenant: COD, chuyển khoản/VietQR, tại cửa hàng, capability online provider. Tách hoàn toàn payment mua template HoangVuongTech.
- Admin: Sản phẩm, Đơn hàng, Thanh toán & vận chuyển; vẫn giữ Khách cần tư vấn và bài viết/cẩm nang.
- Checkout kiểm tra giá/tồn kho từ D1 phía server, không tin giá gửi từ trình duyệt.
- Giá template: 5.000.000đ/năm.
- Migration: `0057_universal_commerce_foundation.sql`.
