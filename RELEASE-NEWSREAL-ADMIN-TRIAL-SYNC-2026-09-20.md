# NEWSREAL Admin + Trial Sync Fix — 2026-09-20

Bản vá tập trung duy nhất vào đồng bộ Trial/Admin/template trên snapshot V54.

- `nr_trial` là định danh tenant ưu tiên cho mọi API trong Admin Trial; tenant cũ trên URL/browser không được phép chuyển Admin sang website khác.
- API resolve site trực tiếp từ `website_trials.trial_token`; token Trial không hợp lệ fail closed.
- Template thực tế từ `/api/me`/site thắng tham số `?template=` trên URL, tránh giao diện Admin bị ép sang template khác.
- Mỗi lần Admin boot sẽ reset toàn bộ menu theo capability của template.
- Menu Sản phẩm / Đơn hàng / Thanh toán & vận chuyển chỉ xuất hiện với template bán hàng `dich-vu-5`.
- Template Múa Lân `dich-vu-6` chỉ bật workflow dịch vụ + Khách cần tư vấn, không lẫn menu bán hàng.
- Placeholder/nhãn Múa Lân được tách khỏi FPT/service generic.
- Không có migration D1 mới.
- Full `npm run check` PASS, gồm regression `Admin Trial + Template Isolation V40`.
