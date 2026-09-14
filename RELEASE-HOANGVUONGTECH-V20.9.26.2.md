# HoangVuongTech V20.9.26.2

## Khôi phục xem demo theo thiết bị
- Thanh xem thử cố định trở lại trên toàn bộ 5 demo chuyên nghiệp.
- Có PC, Máy tính bảng 820px, Điện thoại 390px, Kho mẫu, Chọn mẫu này.
- Tablet/Mobile chạy trong iframe với viewport thật để media query của template hoạt động đúng.
- Trang con/bài viết vẫn giữ thanh xem theo thiết bị.

## Template điểm sạc xe điện
- Thêm bản đồ tương tác Leaflet + OpenStreetMap.
- Marker, popup, danh sách trạm, số cổng còn trống, tổng cổng, công suất, giờ hoạt động.
- Demo mặc định sử dụng dữ liệu mẫu và ghi rõ trạng thái.
- Sẵn sàng kết nối endpoint JSON được cấp quyền bằng HVT_EV_API_ENDPOINT / hvt-ev-api-endpoint.
- Khi API lỗi hoặc chưa cấu hình, tự động fallback về dữ liệu mẫu, không làm hỏng giao diện.
- Admin template có thêm trường API trạng thái điểm sạc, ghi chú nguồn dữ liệu, tâm bản đồ và zoom.
- Không tích hợp/scrape API riêng tư của VinFast/V-Green; chỉ dùng API do đơn vị vận hành cấp quyền.
- SEO marketplace đổi sang nhóm từ khóa chung “website trạm sạc xe điện”, vẫn giữ VinFast/V-Green ở secondary keywords.

## Sửa lỗi dữ liệu ảnh
- Khôi phục các URL Unsplash bị sai `auto=định dạng` về `auto=format`.

## Kiểm tra
- `npm run check`: PASS
- Runtime 5 professional demo: PASS
- PC/Tablet/Mobile preview toolbar: PASS
- EV map + authorized API-ready fallback: PASS
- Template contract smoke: PASS

Build header: `X-HVT-Demo-Build: 20.9.26.2`
