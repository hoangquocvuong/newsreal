# HoangVuongTech V20.9.27.13 — TEMPLATE SSOT V2

## Mục tiêu
Chấm dứt vòng lặp fix giữa layout demo, chế độ Không bài mẫu và Admin bằng một Template Contract dùng chung.

## Thay đổi chính
- Thêm `functions/_shared/template-contracts.js` làm registry chung cho 6 professional templates.
- Đồng bộ taxonomy layout ↔ Admin từ cùng contract.
- Đồng bộ Hero metadata, slider image fields và empty simulation từ cùng contract.
- Demo simulation không còn hard-code danh sách selector Hero của 6 template.
- Website khách đọc default Hero từ chính `structure_profile.settings_schema` mà Admin đang dùng.
- Slider Lân Sư Rồng lấy số field ảnh từ `hero.image_fields` trong contract.
- Tăng version structure để D1 tự refresh professional template profiles hiện có.
- Thêm `scripts/check-template-ssot-v2.mjs` và đưa vào `npm run check`.
- Contract docs: `docs/TEMPLATE-SSOT-CONTRACT-V2.md`.

## Professional templates đã migrate
- Blog cá nhân 1
- Blog cá nhân 2
- Doanh nghiệp 1
- Doanh nghiệp 2
- Dịch vụ điểm sạc EV
- Lân Sư Rồng

## Kiểm thử
`npm run check` PASS toàn bộ runtime/template checks + SSOT V2 regression.
