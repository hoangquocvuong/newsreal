# Universal Content Contract V11

Mọi template hiện tại và template bổ sung sau này phải nhận cùng một `nrNormalizeContentPost()` trước khi render.

Nguồn dữ liệu có thể là showroom sample, bài mẫu đã seed vào D1 hoặc bài khách tự đăng, nhưng renderer chỉ được đọc record đã chuẩn hóa. `extra_json` được flatten vào record mà không ghi đè cột D1, đồng thời `_nr` cung cấp ảnh, excerpt, giá hiển thị, CTA và trạng thái sample chuẩn.

Admin dùng chung bảng nội dung cho cả bài thật và Tin mẫu. Mỗi hàng bắt buộc có ba thao tác `Xem / Sửa / Xóa`. `Xem` đi qua `/xem-bai?id=...` để backend chọn route chi tiết phù hợp và giữ context `nr_trial`/`tenant`.

Với template Lân Sư Rồng, card showroom, sample trong trial và bài khách đăng đều dùng cùng card contract: badge giá, nút liên hệ, nút `Giá tiền`, vùng giá mở rộng và link `Xem chi tiết gói →`.
