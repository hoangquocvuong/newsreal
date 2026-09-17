# HoangVuongTech V20.9.27.55 — Tenant Isolation Safety Contract

## Mục tiêu
Khóa an toàn multi-tenant trước khi có khách thật: tenant A không được đọc/sửa/xóa dữ liệu tenant B.

## Thay đổi
- API và web runtime trên shared host không còn fallback nguy hiểm sang website active đầu tiên.
- Shared/local preview chỉ được chọn tenant mặc định khi có binding `DEFAULT_TENANT_DOMAIN` rõ ràng.
- Web runtime hỗ trợ tenant resolution nhất quán qua `X-Tenant` / `?tenant=` / hostname.
- Giữ session authentication gắn đồng thời `token + site_id`.
- Thêm regression `check-tenant-isolation-v36.mjs` kiểm tra scope cho posts, Commerce, service leads, game stats, Trial và session.
- Contract V53 về không ghi đè dữ liệu Customer/Trial tiếp tục là baseline bắt buộc.

## D1
Không có migration.
