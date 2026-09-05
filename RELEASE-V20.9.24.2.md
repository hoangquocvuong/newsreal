# NEWSREAL V20.9.24.2 — Runtime DDL + Trial Hot-path Cleanup

Mục tiêu: giảm D1 read/write phát sinh từ request thường, không thay đổi UI, template contract, payment flow hay trial business flow.

## Thay đổi

- Bỏ `ensureTemplateCatalog()` khỏi toàn bộ request runtime còn lại. Template catalogue giờ chỉ được đọc/ghi trực tiếp trên schema đã có từ migrations.
- Showroom/demo blueprint không còn chạy CREATE/ALTER/seed/update catalogue khi khách mở demo.
- Trial create, checkout, template inquiry, publisher, Master template actions và seed demo không còn chạy template/schema bootstrap lặp lại.
- Bỏ runtime `ALTER TABLE sites` trong template identity repair.
- Bỏ `ensureSampleColumns()` khỏi seed/clear demo; schema sample đã thuộc migration history.
- Bỏ `ensureGameStatsTables()` khỏi public game stats GET/POST; schema game stats đã có từ migration 0040.
- Bỏ `ensureCustomerTables()` khỏi các GET nóng: renewal info, activation status/view, Admin Client service-info.
- Trial `trial_seen` và generic `api_write` được throttle: tối đa một event / 10 phút; `last_seen_at` và lead activity chỉ update tối đa mỗi 5 phút.
- Xóa DELETE dọn bài mẫu khỏi mọi request trial. Cleanup chuyển thành migration một lần.

## Migration 0049

- Dọn một lần các bài sample/demo còn sót trong tenant trial.
- Thêm index `idx_trial_events_trial_type_created(trial_id,event_type,created_at DESC)` phục vụ heartbeat throttling.

## Không thay đổi

- Không đổi frontend/UI.
- Không đổi cấu trúc template/showroom.
- Không đổi trial 24h, activation, conversion, payment, renewal contract.
- Không đổi `wrangler.toml`.

## Kiểm tra

- `node --check functions/api/[[path]].js` PASS.
- Không còn runtime caller `await ensureTemplateCatalog(env)`.
