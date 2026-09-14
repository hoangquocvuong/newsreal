# HoangVuongTech V20.9.27.12

## Hero/Admin parity — Lân Sư Rồng
- Trang quản trị giữ đúng thứ tự nội dung đang xuất hiện trên Hero: dòng nhỏ, tiêu đề, mô tả, 3 ảnh slider, 2 CTA và 4 ô thống kê.
- Mặc định của các trường Hero khớp trực tiếp với showroom demo để khách biết chính xác sửa nội dung nào sẽ đổi vị trí nào.
- Hero website khách hỗ trợ 3 ảnh slider độc lập (`hero_image_url`, `hero_image_url_2`, `hero_image_url_3`) và tự chuyển ảnh + dots.
- Người dùng có thể xóa riêng từng URL ảnh; hệ thống chỉ dùng demo mặc định khi key chưa từng được cấu hình, không tự khôi phục sau khi khách chủ động xóa.
- Bổ sung `hero_badge`, ô thống kê Hero số 4 và nhãn tương ứng.
- Giữ nguyên contract Có bài mẫu / Không bài mẫu: chế độ Không bài mẫu vẫn mask Hero thành skeleton 1:1.
- Build/cache nâng lên 20.9.27.12.

## Kiểm tra
`npm run check` PASS toàn bộ, có regression cho 3 ảnh slider, nội dung Hero mặc định, dots và schema Admin.
