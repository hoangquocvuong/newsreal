# HoangVuongTech V20.9.26.9

## Đồng bộ chế độ "Xem như khách hàng" cho 5 template mới

- Blog cá nhân mẫu 1, mẫu 2
- Doanh nghiệp mẫu 1, mẫu 2
- Dịch vụ điểm sạc xe điện

### Giả lập khách hàng
Các template mới giờ dùng cùng contract với template cũ:
- `nr_client=1&nr_samples=1`: Có bài mẫu
- `nr_client=1&nr_samples=0`: Không bài mẫu

Thanh **GIẢ LẬP KHÁCH HÀNG** có hai nút chuyển chế độ và nút thoát giả lập.

### Empty layout 1:1
Ở chế độ Không bài mẫu, renderer vẫn giữ nguyên DOM/chiều cao/cột/section/card của giao diện có bài mẫu. Chỉ payload bài viết được che bằng skeleton placeholder. Vì vậy bố cục không co lại, mất cột hoặc đổi cấu trúc.

### Điều hướng
Các link nội bộ giữ `nr_client` và `nr_samples` khi chuyển trang trong chế độ giả lập.

### Regression tests
- Runtime 5 professional demos
- PC / Tablet / Mobile preview
- EV map/API-ready
- Professional article route
- Professional client simulation EMPTY 1:1
- Professional client simulation WITH SAMPLES
- Template contract smoke PASS
