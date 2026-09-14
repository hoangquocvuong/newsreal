# V20.9.27.22 — SAMPLE-FIRST HANDOVER / NO SKELETON MODE

## Quy ước mới
- Bỏ chế độ khách hàng `Có bài mẫu / Không bài mẫu` và skeleton 1:1.
- Website Trial và website bàn giao mới luôn được cài sẵn bộ bài mẫu của template.
- Bài mẫu là bài thật trong D1: khách có thể sửa hoặc xóa trong Admin.
- Xóa bài mẫu không làm hệ thống tự cài lại.
- Template professional dùng chung corpus nội dung mẫu giữa showroom và gói mẫu bàn giao.

## Fix Xem website / bài mới
- API public không còn ẩn `is_sample` đối với Trial.
- Bài thật của khách luôn được ưu tiên trước bài mẫu: `ORDER BY is_sample ASC, id DESC`.
- Vì vậy bài vừa đăng đúng chuyên mục sẽ xuất hiện ở slot trang chủ trước các bài mẫu cùng chuyên mục.
- Trial cũ tạo theo rule rỗng được backfill bộ mẫu đúng một lần.

## Provisioning
- Trial mới: tự cài sample package.
- Website khách mới: tự cài sample package.
- Trial chuyển thành website thật: giữ nguyên dữ liệu và sample package.
- Có state marker `site_template_state` để tránh tự sinh lại mẫu sau khi khách xóa.

## Shared sample data
- `functions/_shared/pro-sample-data.js` là nguồn nội dung mẫu chung cho 6 professional templates.
- Lân Sư Rồng giữ đủ bài mẫu showroom, gồm gói 2–7 đầu lân, múa rồng, trống hội, sự kiện, tin hoạt động, kiến thức.

## Regression
- `npm run check` PASS.
- Thêm `scripts/check-sample-first-handover.mjs`.
- Có migration an toàn `0053_sample_first_handover.sql`; runtime cũng tự bảo đảm bảng state tồn tại.
