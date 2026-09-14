# Template Global SSOT V3

Từ V20.9.27.14, mọi template marketplace phải đăng ký trong `GLOBAL_TEMPLATE_KEYS` và `globalMeta` tại `functions/_shared/template-contracts.js`.

## Một nguồn sự thật

Mỗi mẫu dùng cùng một cấu trúc để phục vụ 4 mục tiêu:

1. renderer/layout website;
2. giả lập Có bài mẫu / Không bài mẫu (không bài giữ geometry 1:1 bằng skeleton);
3. form/quy tắc đăng nội dung trong Client Admin;
4. tài liệu "Hướng dẫn mẫu này" trong Admin.

Không thêm template mới nếu chưa có Global Contract. `npm run check` sẽ fail nếu template không được đăng ký hoặc Admin guide không tồn tại.

## Hướng dẫn sử dụng tự sinh

`templateUsageGuide(templateKey, structure, editor)` không chứa sơ đồ viết tay. Nó đọc chính `structure_profile` và `editor_profile` đang được website/Admin dùng để sinh:

- thứ tự các section trên trang chủ;
- section nào chỉnh trong Cài đặt website;
- section nào lấy bài đăng;
- chuyên mục chính xác cần chọn;
- số slot và số cột PC/Tablet/Mobile;
- checklist trước khi xuất bản;
- ghi chú website trắng vẫn giữ layout 1:1.

Vì tài liệu lấy cùng dữ liệu runtime nên nếu đổi section/chuyên mục, tài liệu Admin đổi theo và không cần sửa tay.

## Quy trình thêm template mới

1. Đăng ký key + tên + family trong Global Contract.
2. Khai báo `defaultTemplateStructure()` gồm toàn bộ section đúng thứ tự giao diện.
3. Với section bài viết, khai báo `bind_required=1`, `content_source`, `category`, `slots` và số cột.
4. Khai báo editor fields/category. Category phải khớp section contract.
5. Nếu Hero chỉnh được, khai báo settings/schema phù hợp với đúng nội dung ngoài frontend.
6. Kiểm tra Có bài / Không bài / Admin / website thật ở PC, Tablet, Mobile.
7. Chạy `npm run check`; không release nếu Global SSOT test fail.
