# HoangVuongTech V20.9.27.14 — Global Template SSOT V3 + Admin Guide

## Mục tiêu
- Áp dụng contract chung cho toàn bộ 21 template marketplace hiện có.
- Một cấu trúc dùng chung cho layout/runtime, Admin taxonomy, empty-mode geometry và tài liệu hướng dẫn.
- Thêm tab `Hướng dẫn mẫu này` trong Client Admin, tự sinh từ đúng `structure_profile` + `editor_profile` đang chạy.

## Global registry
- BĐS: mau-1 → mau-5
- Tin tức: tin-tuc-1 → tin-tuc-4
- Dịch vụ: dich-vu-1 → dich-vu-6
- Blog cá nhân: blog-ca-nhan-1 → blog-ca-nhan-2
- Doanh nghiệp: doanh-nghiep-1 → doanh-nghiep-2
- Sản phẩm: san-pham-1
- Game: game-1

## Admin guide
Mỗi site có hướng dẫn riêng theo mẫu:
- sơ đồ trang chủ đúng thứ tự section;
- mỗi section chỉ rõ chỉnh ở Cài đặt website hay đăng bài;
- chuyên mục chính xác để bài vào đúng khối;
- số slot + cột PC/Tablet/Mobile;
- hướng dẫn BĐS theo loại giao dịch;
- checklist trước khi đăng;
- nhắc contract website trắng giữ layout 1:1 bằng skeleton.

Guide không viết tay: được sinh từ structure/editor runtime nên đổi layout/chuyên mục thì guide tự đổi theo.

## Regression
`npm run check` bao gồm `check-template-global-ssot-v3.mjs` và fail nếu:
- một template catalog không có Global Contract;
- thiếu default structure;
- API không đồng bộ toàn bộ GLOBAL_TEMPLATE_KEYS;
- `/api/me` không trả usage guide;
- Client Admin thiếu tab/sơ đồ hướng dẫn.
