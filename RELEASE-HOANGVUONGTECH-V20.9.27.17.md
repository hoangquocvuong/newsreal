# HoangVuongTech V20.9.27.17 — GLOBAL TRIAL LIVE SITE FIX

## Mục tiêu
Sửa triệt để cùng một lỗi cho toàn bộ template: khi khách đang ở website dùng thử và bấm **Xem website**, hệ thống phải render đúng tenant trial và đúng các bài khách đã đăng; tuyệt đối không rơi về showroom có dữ liệu mẫu.

## Phạm vi
Áp dụng theo `GLOBAL_TEMPLATE_KEYS` cho toàn bộ 21 template hiện tại:
- 5 mẫu BĐS
- 4 mẫu tin tức
- 6 mẫu dịch vụ
- 2 mẫu blog cá nhân
- 2 mẫu doanh nghiệp
- Product/Affiliate
- Clash of Clans

## Contract mới
- `nr_trial` được đọc trước mọi showroom shortcut.
- Public showroom chỉ được dùng khi **không có** `nr_trial`.
- Mọi template đã đăng ký Global SSOT đều resolve `website_trials -> site_id -> sites` từ token.
- Nếu token trial không hợp lệ/chưa kích hoạt/site chưa sẵn sàng: trả lỗi rõ ràng, **không fallback** sang tenant demo.
- API phía frontend luôn mang `X-NR-Trial`, do đó `/api/site`, bài viết, settings và dữ liệu khác đều thuộc đúng trial tenant.
- Route legacy Tin tức giữ nguyên query string để không làm rơi `nr_trial` khi redirect.

## Regression
`scripts/check-trial-live-site-routing.mjs` kiểm tra contract global và xác nhận registry có đủ 21 template.
