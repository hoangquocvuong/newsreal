# HoangVuongTech V20.9.27.2 — Verified Payment Success

## Mục tiêu
Hoàn thiện trải nghiệm ngay sau khi khách thanh toán website thành công.

## Thay đổi
- Thêm trang `/thanh-toan-thanh-cong/` dành riêng cho thanh toán website mới và chuyển đổi Trial → website chính thức.
- payOS `returnUrl` của cả hai luồng được chuyển về trang xác nhận mới kèm `order_code` + token đọc trạng thái.
- Trang xác nhận KHÔNG tin query `status=PAID` của trình duyệt; trang gọi `/api/payment-status` và chỉ hiện dấu ✓ khi backend đã ghi nhận `paid`.
- Nếu webhook payOS tới chậm, trang tự kiểm tra lại mỗi 3 giây; không yêu cầu khách thanh toán lại.
- Nội dung sau thanh toán thống nhất:
  - Website đang được khởi tạo và cấu hình.
  - Thời gian hoàn tất dự kiến khoảng 30–60 phút.
  - `Link kích hoạt sẽ được gửi tới email đã đăng ký sau khi hoàn tất.`
- Không liệt kê sai các mục như "link quản trị / tài khoản / hướng dẫn sử dụng".
- Đồng bộ cùng thông điệp trên popup checkout, Trial checkout và email xác nhận thanh toán.
- Trang xác nhận đặt `noindex,nofollow`.

## Kiểm tra
`npm run check` PASS toàn bộ runtime + template contract.
Có regression check riêng: `OK  Verified payment success page + 30–60 minute expectation`.
