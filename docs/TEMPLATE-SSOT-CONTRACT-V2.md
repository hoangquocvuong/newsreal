# HoangVuongTech Template SSOT Contract V2

## Mục tiêu
Mỗi professional template chỉ có **một nguồn sự thật** cho ba bề mặt phải luôn đồng bộ:

1. Giao diện demo có bài mẫu.
2. Giao diện khách hàng không có bài mẫu (skeleton 1:1).
3. Trang quản trị Admin (taxonomy + field có thể chỉnh sửa).

Registry chuẩn nằm tại:

`functions/_shared/template-contracts.js`

## Contract bắt buộc
Mỗi template professional phải khai báo trong registry:

- `version`
- `preset`
- `content_type`
- `hero.selector`
- `hero.mode`
- `hero.fields`
- `hero.image_fields`
- `simulation.content_selectors`
- `sections`
- `editor.categories`
- `editor.custom_fields`

`contract_version` được xuất thành `template-ssot-v2`.

## Luồng dữ liệu

`template-contracts.js`
→ `defaultTemplateStructure()` / D1 `structure_profile`
→ Admin đọc `settings_schema` + editor profile
→ Website khách đọc `structure_profile`
→ Demo client simulation đọc `professionalSimulationContract()`

Không được tạo danh sách category hoặc selector Hero độc lập ở một file khác.

## Quy tắc Hero

- Field Hero có trong contract phải tồn tại trong `settings_schema`.
- Runtime website khách lấy default từ chính `settings_schema`, không hard-code một default khác.
- Slider N ảnh phải có đúng N `image_fields` trong contract.
- Empty mode không được hiển thị ảnh/text demo; chỉ skeleton hóa đúng geometry hiện tại.

## Quy tắc bài viết / section

- Category trong `editor.categories` phải khớp 1:1 với các `section.type=category`.
- `slots`, số cột và geometry là metadata của section contract.
- Empty mode giữ nguyên card/section và chỉ thay payload bằng skeleton.
- Website thật lấy bài từ DB/Admin; demo sample không được trở thành dữ liệu cố định trên website khách.

## Khi thêm template mới

1. Thêm **một entry** vào `functions/_shared/template-contracts.js`.
2. Viết renderer/CSS riêng cho thẩm mỹ của template.
3. Thêm `settings_schema` cho các field được contract khai báo.
4. Không tạo taxonomy Admin riêng ngoài contract.
5. Không tạo danh sách selector Hero/card riêng trong simulation.
6. Chạy `npm run check`.

`check-template-ssot-v2.mjs` sẽ fail nếu taxonomy/layout lệch nhau, Hero thiếu field Admin, selector bị hard-code lại hoặc slider không đúng contract.
