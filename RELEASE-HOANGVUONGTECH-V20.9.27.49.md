# HoangVuongTech V20.9.27.49 — Small Business Commerce UX

## Mục tiêu
Tối ưu Universal Commerce cho chủ shop nhỏ/hộ kinh doanh/người bán online: thao tác đơn giản, ít cấu hình, khách mua nhanh.

## Sửa lỗi chính
- Demo Product Detail và Storefront dùng chung `nr_commerce_demo_cart`; sản phẩm thêm từ trang chi tiết không còn biến mất khi quay lại cửa hàng.
- Badge giỏ hàng đếm tổng số lượng và hydrate dữ liệu cart từ mọi route.
- Trang chi tiết có thanh điều hướng Cửa hàng + Giỏ hàng ngay trên trang, không cần quay lại homepage.
- Giỏ hàng/checkout desktop compact hơn, tận dụng 2 cột, bỏ horizontal scrolling và giảm nhu cầu cuộn dọc.
- Customer storefront có compact Commerce Header trên Product Detail và cart count đồng bộ.
- Giữ flow đơn giản cho shop nhỏ: sản phẩm -> giỏ/mua ngay -> thông tin nhận hàng -> COD/VietQR/chuyển khoản -> đơn hàng Admin.

## Contract
- `scripts/check-small-business-commerce-v30.mjs`
- `Small Business Commerce UX Contract V30: PASS`

## Database
Không có migration D1 mới.
