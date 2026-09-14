NEWSREAL ACTIVATION CONTRACT V2 — V17.9

Mục tiêu: website thật và website dùng thử dùng cùng một quy trình sở hữu tài khoản.

1. Sau khi website/Trial được tạo, hệ thống KHÔNG cấp mật khẩu tạm thời cho khách.
2. Khách nhận link kích hoạt dùng một lần.
3. Màn kích hoạt luôn yêu cầu/xác nhận:
   - Email đăng nhập Trang quản trị.
   - Mật khẩu do khách tự đặt (>= 8 ký tự).
   - Nhập lại mật khẩu.
4. Email này là email đăng nhập và email dùng cho quy trình quên/đặt lại mật khẩu.
5. Trial 24 giờ ở trạng thái pending_activation cho tới khi khách kích hoạt.
6. Đồng hồ 24 giờ chỉ bắt đầu tại thời điểm kích hoạt thành công.
7. Trial kích hoạt xong dùng đúng Trang quản trị và auth contract của website thật.
8. Khi Trial chuyển thành website trả phí, giữ nguyên email, mật khẩu, bài viết và tenant data; chỉ thay lifecycle/subscription/domain theo quy trình chuyển đổi.
9. Không hiển thị hoặc gửi mật khẩu tạm thời qua UI/email.
10. Password reset phải hoạt động cho cả custom-domain tenant và trial tenant.


## Direct handover after activation
- Production and Trial use the same post-activation handover flow.
- After email/password setup succeeds, the customer is redirected directly to Trang quản trị with a one-time handover token.
- The admin client consumes that token, creates the authenticated session, removes only the `handover` parameter, and preserves Trial context (`tenant`, `nr_trial`, `template`).
- The customer MUST NOT be asked to log in again immediately after activation.

V18.2 hardening: handover-login returns a session token as well as Set-Cookie. Trang quản trị stores the token before first authenticated boot, preventing trial tenant context/cookie races.
