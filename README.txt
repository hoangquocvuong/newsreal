NEWSREAL V8.9.0 — Finance CRM Bundle
- Client Support Center
- Financial dashboard and transaction ledger
- Customer transaction timeline
- Renewal/domain guard preserved
- Test reset transactions are voided, not counted as revenue

NEWSREAL V8.8.17 - LEGACY RENEWAL CYCLE REPAIR

NEWSREAL V8.8.10 — MASTER RESET HANDOVER

- Master-only "Reset bàn giao" for already handed-over sites.
- Revokes client sessions, activation tokens and handover-login tokens.
- Clears activated_at so a fresh activation link can be generated.
- Preserves domain, DNS/SSL, customer profile, content, service dates and settings.
- Intended for controlled re-handover/testing/recovery; client admin never sees this action.

NEWSREAL V5 FULL REAL ESTATE

Đây là bản FULL, không phải patch.

TRÌNH TỰ CÀI:
1. Giải nén ZIP.
2. Mở migrations/0002_realestate_v5.sql, copy TOÀN BỘ SQL và chạy trong Cloudflare D1 Console đúng 1 lần.
3. Sau khi SQL báo thành công, upload toàn bộ file/folder trong ZIP lên ROOT repo GitHub `newsreal` và Commit.
4. Chờ Cloudflare deploy xanh.
5. Không xóa D1 hiện tại. Dữ liệu cũ được giữ nguyên.

V5 có:
- Trang chủ BĐS hoàn chỉnh
- Trang danh sách /listings
- Bộ lọc từ khóa / giao dịch / loại BĐS / tỉnh / quận / phòng ngủ
- Trang chi tiết /property?id=
- Gallery ảnh
- Lưu tin yêu thích /favorites
- Mua bán / cho thuê
- Loại BĐS
- Giá / diện tích / đơn giá / mặt tiền
- PN / WC / tầng
- Hướng / pháp lý / nội thất
- Tỉnh / quận / phường
- Mã tin
- Tin nổi bật
- Tin xác minh
- Người liên hệ / gọi điện / Zalo
- Chia sẻ Facebook / copy link
- Tin tức
- Quản trị tiếng Việt
- Đăng / sửa / xóa / bản nháp
- Thống kê
- Cài đặt site
- Đổi mật khẩu
- Responsive

LƯU Ý:
File migration THỰC SỰ đã nằm trong ZIP: migrations/0002_realestate_v5.sql


V5.1 FIX: SQLite coi TRANSACTION là từ khóa. Migration/API đã quote cột "transaction" để tránh SQLITE_ERROR.


NEWSREAL V6 - UPLOAD ẢNH TỪ MÁY
1. Tạo R2 bucket tên: newsreal-images
2. Pages > Settings > Bindings: R2 bucket binding, Variable name: IMAGES, chọn bucket newsreal-images.
3. Nếu project quản lý binding bằng wrangler.toml thì file V6 đã có [[r2_buckets]] binding IMAGES.
4. Admin hỗ trợ chọn nhiều JPG/PNG/WEBP, tối đa 8MB/ảnh, preview, xóa và chọn ảnh đại diện.
5. D1 chỉ lưu URL; file ảnh nằm trong R2.


V6.1 VALIDATION:
- Nút Đăng tin / Lưu bản nháp đổi theo trạng thái.
- Trường bắt buộc có dấu *.
- Nếu thiếu dữ liệu: hiện hộp lỗi tiếng Việt, đánh đỏ từng trường, tự cuộn và focus vào lỗi đầu tiên.
- BĐS yêu cầu tối thiểu: tiêu đề, giá, diện tích, tỉnh, quận, địa chỉ, người liên hệ, điện thoại, ít nhất 1 ảnh, mô tả.
- API cũng kiểm tra lại dữ liệu để tránh gửi form lỗi.


V6.2 HOMEPAGE REDESIGN:
- Trang chủ được thiết kế lại theo mẫu newsreal-homepage-demo do người dùng cung cấp.
- Hero lớn chuyển thành slider tự động 5 giây, có nút trái/phải và dots.
- Ảnh trong card bất động sản dùng mini slider nếu tin có nhiều ảnh, không còn cố định một ảnh.
- Card gọn 4 cột desktop để giảm chiếm diện tích.
- Có tin đáng chú ý, thanh tìm kiếm nhiều bộ lọc, khu vực nổi bật, BĐS nổi bật, tin tức và CTA.
- Dữ liệu lấy động từ D1/API hiện tại; không hardcode tin demo.


V6.3:
- Fix nhãn hero chồng tiêu đề.
- Hero slider chạy theo toàn bộ ảnh gallery của tin; 1 bài có nhiều ảnh vẫn chuyển được.
- Nút prev/next/dots hoạt động độc lập, tự chạy 4.5 giây.
- Bỏ khu vực, tin tức trống và CTA cuối trang.
- Thay bằng 3 chuyên mục: Nhà đất bán, Nhà đất cho thuê, Tin nổi bật.


V6.4 HOMEPAGE:
- 5 chuyên mục chính: Bán căn hộ chung cư, Bán nhà đất, Cho thuê nhà, Kho xưởng & mặt bằng, Đất nền & đất dự án.
- Thêm 1 mục Tin thị trường & kiến thức.
- Có khối danh mục nhanh ở đầu trang tương tự cổng BĐS lớn nhưng rút gọn, không quá nhiều link.
- Card và ảnh chuyển sang góc vuông, bỏ border-radius theo yêu cầu.


V7 ROLE SEPARATION
- /master: khu quản trị tổng riêng cho chủ hệ thống. Đăng nhập bằng MASTER_KEY; session riêng nr_master_session.
- Master xem tổng website, site đang hoạt động, bài đăng, lượt xem, lượt xem hôm nay và bảng từng khách; có khóa/mở website.
- /admin: chỉ là Client Admin của từng website; dữ liệu luôn bị giới hạn theo site_id.
- Nút Đăng tin frontend chuyển tới /admin?tab=newpost. Nếu Client Admin còn session thì vào thẳng form; chưa login thì login, sau login tự mở form.
- Master session và Client Admin session hoàn toàn tách biệt.
- Không cần migration SQL mới.


V7.1 HOTFIX
- Client Admin auth now has Bearer-token fallback in addition to HttpOnly cookie, fixing cases where clicking Đăng tin reopened login despite a valid prior login.
- All frontend Đăng tin buttons route to /admin?tab=newpost; after login the requested tab opens automatically.
- Property detail uses a real multi-image slider with prev/next, image counter, and thumbnail navigation.
- Homepage JS is cache-busted on deploy so old slider code is not reused by browser/CDN.
- All property/news/sidebar cards and images are forced square (border-radius:0).
- No SQL migration required.


V7.2 CRITICAL ADMIN FIX
- Root cause fixed: HTML id="status" collided with browser window.status. That JS error occurred before the post submit handler and before boot(), so clicking Đăng tin fell back to native form GET and navigated to /admin?, showing login again.
- Replaced window-dependent status access with explicit postStatus = document.getElementById('status').
- All admin forms use onsubmit="return false" as a hard safety net against accidental native navigation.
- Submit/login/settings/password handlers use addEventListener.
- R2 upload now sends the same Bearer fallback token as other admin API calls.
- No SQL migration required.


V7.3
- Trang chủ bỏ slider; chỉ dùng 1 ảnh đại diện nổi bật.
- Hero và toàn bộ card/slider dùng góc vuông, bỏ border-radius.
- Slider chỉ giữ ở trang chi tiết bài đăng.
- Trang chi tiết có bài liên quan, nhiều nút chia sẻ: copy link, Facebook, Zalo, Telegram, Email.
- Mã tin tự sinh ở API, admin không cần nhập thủ công.
- Không cần migration SQL mới.


V7.4 RICH CARDS + DEMO CONTENT
- Card bất động sản trên trang chủ, trang danh sách và Tin đã lưu hiển thị nhiều dữ liệu hơn: giá, đơn giá, diện tích, phòng ngủ, WC, số tầng, mặt tiền, hướng, pháp lý, vị trí, mã tin, xác minh, lượt xem.
- Desktop ưu tiên 3 card/hàng để đủ chỗ đọc nhanh; mobile tự về 1 cột.
- Giữ card/ảnh góc vuông.
- Có 15 bài mẫu hoàn chỉnh: 12 bất động sản + 3 bài tin tức; phủ đủ căn hộ, nhà đất, cho thuê, kho xưởng/mặt bằng và đất nền.
- migrations/0003_seed_demo_content.sql: chạy 1 lần trên D1 hiện tại để tạo 15 bài mẫu. Có chống trùng bằng listing_code.
- migrations/0001_full_schema.sql: schema đầy đủ cho D1 mới khi triển khai website cho khách hàng mới.
- Không cần upload lại ảnh mẫu lên R2; bài mẫu dùng URL ảnh ngoài. Khi bàn giao thật có thể thay dần bằng ảnh của khách.


V7.5 ADMIN DEMO SEED
- Không cần chạy 0003_seed_demo_content.sql bằng D1 Console nữa.
- Client Admin có nút 'Tạo 15 bài mẫu' ngay trong trang quản trị.
- API /api/seed-demo dùng D1 prepared statements, tạo từng bài an toàn và tự bỏ qua bài đã tồn tại theo listing_code.
- Phù hợp cho quy trình bàn giao website cho khách mới: tạo DB/schema xong, đăng nhập admin và bấm 1 nút để có dữ liệu demo.


V7.6 PROFESSIONAL CLIENT ADMIN
- Demo seed tăng từ 15 lên 30 bài mẫu.
- Khối tạo dữ liệu mẫu có chú thích rõ: chỉ để thử giao diện, mọi thông tin đều sửa/xóa được.
- Admin UI thiết kế lại chuyên nghiệp: topbar, sidebar, KPI, CTA, form grouping, typography và bảng quản lý.
- Khi chọn Tin tức, tự ẩn các trường chỉ dành cho bất động sản (giá, diện tích, hình thức, loại BĐS, phòng, tầng, hướng, pháp lý, vị trí, liên hệ...).
- Khi đổi lại Bất động sản, các trường hiển thị trở lại.
- Tin tức chỉ giữ các trường cần thiết: tiêu đề, hình ảnh, chuyên mục, nội dung, nổi bật/xác minh và trạng thái.


V7.7 MASTER DEMO CONTROL + BRANDING
- Chuyển hoàn toàn quyền tạo/xóa 30 bài mẫu sang /master (Super Admin).
- Client Admin không còn nút hay API quyền tạo dữ liệu demo.
- Super Admin nhìn được số bài demo của từng site, có nút + Demo và Xóa demo.
- Xóa demo chỉ xóa bài có listing_code DEMO-*; bài thật của khách không bị ảnh hưởng.
- Tên website vẫn tùy chỉnh trong Client Admin, nhưng header được CSS thành wordmark có biểu tượng nhà, accent line và typography chuyên nghiệp thay vì text thô.
- Không cần migration SQL mới.


V7.8 PRODUCTION ADMIN + NEWS DETAIL
- Chuyên mục trong Admin chuyển thành danh sách chọn sẵn. BĐS bán/cho thuê và Tin tức có bộ chuyên mục riêng.
- Bài công khai sắp xếp mới nhất trước (id DESC), không để bài cũ nổi bật đẩy bài mới xuống dưới.
- Giao diện người dùng bỏ chữ “Demo” khỏi tên website hiển thị; Super Admin dùng thuật ngữ “Dữ liệu mẫu/Bài mẫu”.
- Trang chi tiết Tin tức có layout riêng: ẩn toàn bộ giá/diện tích/phòng/pháp lý/liên hệ của BĐS; sidebar có Tin mới nhất, Chuyên mục, Được quan tâm; cuối bài có bài liên quan và chia sẻ.
- Trang chi tiết BĐS giữ nguyên slider, thông số, liên hệ, bài liên quan.
- Không cần migration SQL mới.


V7.8.1 MASTER ROUTE HOTFIX
- Sửa ERR_TOO_MANY_REDIRECTS tại /master.
- Bỏ rewrite /master -> /master.html.
- Master Admin được phục vụ trực tiếp từ public/master/index.html.
- URL chuẩn mới: /master/
- Khi truy cập /master, Cloudflare Pages chỉ canonicalize một lần sang /master/ (nếu cần), không tạo vòng lặp.
- Không cần SQL migration.


V7.8.2 SUPER ADMIN ROUTE FIX
- Bỏ hoàn toàn đường dẫn /master vì domain đang có redirect loop bên ngoài asset source.
- Super Admin chuyển sang đường dẫn mới, độc lập: /control-center/
- Không dùng _redirects và không dùng master.html.
- Đây là static directory route public/control-center/index.html nên không phụ thuộc redirect cũ của /master.
- Không cần SQL migration.


V7.9 CUSTOMER ONBOARDING / WEBSITE FACTORY
- Control Center có nút “Tạo website khách hàng”.
- Super Admin nhập tên website, domain, email Admin, thông tin khách ban đầu, mã đơn hàng và ghi chú nội bộ.
- Hệ thống tạo tenant + tài khoản Admin khóa tạm + hồ sơ khách + link kích hoạt 14 ngày.
- Khách mở /activate/?token=... và tự nhập họ tên, điện thoại, email, công ty, MST, địa chỉ, tỉnh/quận và tự đặt mật khẩu Admin.
- Sau kích hoạt, toàn bộ hồ sơ khách được lưu vào customer_profiles và hiển thị lại trong Control Center.
- Control Center có trạng thái: Chờ khách / Đã kích hoạt / Chưa tạo link và nút xem hồ sơ, tạo lại link.
- Link kích hoạt cũ bị vô hiệu khi tạo link mới.
- Trên pages.dev có thể test từng tenant bằng ?tenant=domain trước khi custom domain được gắn.
- Custom domain hiện được ghi nhận trong hệ thống nhưng việc attach DNS/Cloudflare Custom Domain vẫn là bước cấu hình riêng; chưa tự mua hoặc tự bind domain qua API.
- API tự tạo bảng onboarding nếu chưa có, nên không bắt buộc chạy SQL thủ công.


V7.9.1 MASTER LOGIN HOTFIX
- Master login dùng cả HttpOnly cookie và Bearer token fallback.
- Khắc phục trường hợp trình duyệt/Cloudflare không giữ cookie Master như mong đợi.
- Nếu login thành công nhưng Overview lỗi, màn hình sẽ hiện lỗi cụ thể thay vì im lặng.
- MASTER_KEY vẫn lấy từ Cloudflare environment/wrangler.toml.


V7.9.2 MASTER JS ORDER HOTFIX
- Tìm ra lỗi gốc khiến nút Đăng nhập Master không phản hồi.
- master.js trước đây được load trước các modal/DOM phía cuối trang, nên JavaScript dừng tại biến openCreateSite/createSiteModal chưa tồn tại.
- Di chuyển master.js xuống cuối body sau toàn bộ DOM.
- Không dùng implicit global theo id; khai báo document.getElementById rõ ràng.
- Thêm hiển thị lỗi JavaScript ngay trên màn hình nếu giao diện Control Center lỗi.
- Không cần SQL migration.


V8 MANAGED WEBSITE SERVICE
- Control Center chuyển sang mô hình dịch vụ website trọn gói theo năm.
- Mỗi khách có gói dịch vụ, giá bán/năm, chi phí nội bộ, lợi nhuận dự kiến, thanh toán, ngày bắt đầu/hết hạn.
- Quản lý trạng thái domain: chưa cấu hình, chờ DNS, hoạt động, hết hạn; ngày mua/hết hạn domain và theo dõi gia hạn.
- Khi tạo khách mới có thể nhập ngay giá gói và chi phí nội bộ.
- Nút Quản lý mở cả hồ sơ khách + thông tin dịch vụ.
- Khách Admin không nhìn thấy giá vốn/chi phí/lợi nhuận.
- Cloudflare Registrar API chưa bật trong source này: bước mua domain thật sẽ được nối sau bằng API token/permissions, tránh hard-code secret.
- API tự CREATE TABLE service_subscriptions nếu chưa có; không bắt buộc chạy migration thủ công.


V8.1 AUTO ORDER CODE
- Mã đơn hàng không còn nhập thủ công.
- Khi Super Admin tạo website, hệ thống tự sinh mã dạng NR-YYYY-0001, NR-YYYY-0002...
- Mã được lưu trong customer_profiles và trả về ngay sau khi tạo website.
- Control Center hiển thị mã vừa tạo trong hộp kết quả.
- Không cần migration SQL.


V8.2 DOMAIN MANAGEMENT
- Form tạo website có nút Kiểm tra tên miền.
- Nếu có CF_ACCOUNT_ID + CF_REGISTRAR_TOKEN, backend gọi Cloudflare Registrar POST /domain-check để lấy availability + giá đăng ký/gia hạn thật.
- Nếu chưa cấu hình API, hệ thống vẫn cho lưu domain thủ công và hiển thị cảnh báo rõ.
- Hồ sơ từng khách trong Control Center có module Quản lý tên miền riêng: kiểm tra, đổi domain, cập nhật trạng thái DNS/domain.
- Chưa có nút mua domain thật trong V8.2. Đây là bước an toàn trước khi bật giao dịch.
- Secrets cần thêm sau trong Cloudflare environment: CF_ACCOUNT_ID và CF_REGISTRAR_TOKEN (Registrar permissions). Không hard-code token vào source.


V8.3 DOMAIN PURCHASE AUTOMATION
- Super Admin có thể mua domain thật từ module Quản lý tên miền của từng website.
- Hệ thống bắt buộc POST /domain-check lại ngay trước giao dịch.
- Nếu giá thay đổi so với giá đã xem, giao dịch bị dừng và yêu cầu kiểm tra lại.
- Premium domain bị chặn, không gửi lệnh mua tự động.
- Modal xác nhận yêu cầu nhập lại chính xác domain + confirm lần cuối.
- Có tùy chọn auto-renew; khi bật sẽ gửi auto_renew=true tới Cloudflare.
- Sau đăng ký thành công, lưu domain, ngày đăng ký, ngày hết hạn và trạng thái vào service_subscriptions.
- Nếu Cloudflare trả 202/pending, Control Center có nút kiểm tra trạng thái đăng ký.
- Dùng account default registrant contact của Cloudflare; không gửi PII của khách tới Registrar.
- Điều kiện sử dụng thật: CF_ACCOUNT_ID + CF_REGISTRAR_TOKEN, billing profile hợp lệ, default registrant contact đã thiết lập và Domain Registration Agreement đã chấp nhận trên Cloudflare.
- Giao dịch đăng ký thành công là billable/non-refundable.


V8.7 ONE-CLICK HANDOVER
- Master nhập toàn bộ thông tin khách; khách không còn nhập form dữ liệu.
- Sau khi mua domain, nút Đã mua domain · Tiếp tục tự đọc registry metadata, lưu ngày đăng ký/hết hạn/registrar, tự attach domain vào Cloudflare Pages và để Pages tự provision SSL.
- Cần thêm Secret CF_PAGES_TOKEN có quyền Cloudflare Pages Edit; CF_ACCOUNT_ID giữ như hiện tại. CF_PAGES_PROJECT mặc định newsreal.
- Khi domain xong, hệ thống tự tạo link kích hoạt 14 ngày.
- Khách mở link và chỉ bấm 1 nút Kích hoạt & vào quản trị.
- Hệ thống tạo magic handover token 30 phút để đăng nhập lần đầu trên custom domain, sau đó session kéo dài 30 ngày.

V8.8.7 - Activation Gate
- Activation link is no longer created when a site is first created.
- Domain purchase/completion no longer creates or exposes activation links while DNS/SSL is pending.
- Master "Link kích hoạt" is disabled until domain_status=active.
- regenerate-activation is protected server-side and rechecks Cloudflare Pages before issuing a handover token.
- Existing activation GET/POST checks remain in place as a second protection layer.


V8.8.8
- Fix Control Center domain watcher ReferenceError: dmDomainStatus -> dmStatus.
- Domain/SSL Active status can now render and finish the handover gate correctly.


V8.8.9 SECURE HANDOVER
- Khách tự đặt mật khẩu quản trị ngay khi nhận website.
- Link kích hoạt dùng một lần; sau bàn giao Master không thể tạo lại link kích hoạt.
- Xóa session cũ khi bàn giao và dùng handover token 30 phút để tự đăng nhập domain riêng.
- Control Center hiển thị Đã bàn giao và khóa nút Link kích hoạt.


V8.8.11 — PROMOTION + RENEWAL REMINDERS
- Khuyến mãi theo số tháng: mặc định website mới 12 tháng + tặng 2 tháng; Master có thể đổi.
- Theo dõi phản hồi gia hạn: yes/no, không auto-renew.
- Email reminder qua Resend ở mốc 30/14/7/3/1 ngày; chống gửi trùng theo kỳ hạn.
- Cần Pages secrets: RESEND_API_KEY, CRON_SECRET. Biến MAIL_FROM nên là email/domain đã xác minh trên Resend.
- PUBLIC_APP_URL tùy chọn, khuyến nghị https://newsreal.pages.dev.
- workers/renewal-cron.js là Worker cron gọi job mỗi ngày.

V8.8.12
- Bỏ khuyến mãi cộng tháng. Chu kỳ website/domain vẫn 12 tháng.
- Khuyến mãi theo tiền: giá niêm yết, giảm lần đầu, giá lần đầu, giá gia hạn.
- Client Admin có mục Dịch vụ & gia hạn: gói, domain, thanh toán, ngày hết hạn, ưu đãi, giá gia hạn.
- Khách có thể bấm Yêu cầu gia hạn ngay trong Admin.
- Control Center nhận trạng thái "Khách muốn gia hạn".
- Nếu cấu hình MASTER_NOTIFY_EMAIL + RESEND_API_KEY + MAIL_FROM, Master nhận email ngay khi khách yêu cầu gia hạn.


V8.8.13 — CLIENT SERVICE PANEL FIX
- service-info đọc dữ liệu theo từng bảng, tương thích site cũ và tránh JOIN lỗi làm panel treo.
- Client Admin có timeout 12 giây, báo lỗi rõ ràng và nút Thử lại.
- Cache-bust admin assets.


V8.8.14 — RENEWAL ALERT UX
- Client Admin: “Ngày hết hạn domain” -> “Ngày hết hạn”.
- Control Center: banner cảnh báo nổi bật khi khách yêu cầu gia hạn, có số lượng và nút mở nhanh hồ sơ khách.

V8.8.15 - Renewal payment workflow
- Khi khách xác nhận muốn gia hạn, Master có nút "Gửi hướng dẫn thanh toán".
- Email thanh toán gồm giá gia hạn, VietinBank, chủ TK HOÀNG QUỐC VƯƠNG, STK 0389986287, QR và nội dung CK theo mã đơn.
- Theo dõi trạng thái: khách yêu cầu -> đã gửi thanh toán -> đã thanh toán -> đã gia hạn.
- Không tự động trừ tiền / không tự động gia hạn domain.


V8.8.16 COMPLETE RENEWAL CYCLE
- Hoàn tất gia hạn chỉ sau khi đã đánh dấu thanh toán.
- Tự cộng term_months (mặc định 12 tháng) vào ngày hết hạn dịch vụ; không thay đổi ngày hết hạn domain.
- Chống bấm gia hạn hai lần cho cùng chu kỳ.
- Lưu renewal_history.
- Gửi email xác nhận gia hạn thành công.
- Client Admin đồng bộ trạng thái thành “Gia hạn thành công” và hiển thị ngày hết hạn mới.
- Master banner bỏ khách đã hoàn tất khỏi danh sách yêu cầu chờ xử lý.

V8.8.18: Renewal domain guard - Cloudflare Registrar shortcut, RDAP expiry recheck, block service completion until domain expiry covers the new service cycle, PUBLIC_APP_URL-ready email links.

V8.8.19 - Renewal Test Reset + Domain Guard UI
- Adds Master-only test reset for the latest completed renewal cycle.
- Safely rolls service expiry back to renewal_history.old_expires_at.
- Returns renewal stage to paid without changing domain expiry.
- Deletes only the latest matching renewal_history row.
- Shows domain renewal guard buttons again after reset for end-to-end testing.


V8.9.1 - Finance Expenses + Filters
- Global operating expense ledger for domain, Cloudflare/infrastructure, Resend/email, ads, software/API and other costs.
- Costs are included in actual-profit KPI.
- Website search/filter by keyword, status, renewal state, expiry <=30 days and payment state.
- Transaction ledger search/filter by customer/site/domain/order code and transaction kind.
- Domain transaction cost remains auto-seeded from service internal_cost when available; registrar/Cloudflare bills that cannot be reliably fetched must be recorded as operating expenses.


V8.9.2 HOTFIX
- Expense actions use direct UI handlers so Add/Delete/Retry work reliably.
- Expense load errors are shown instead of hanging at 'Dang tai'.
- Website and ledger filters use direct input/change handlers.
- Ledger search now includes customer email and phone.
- Finance/expense endpoints defensively ensure D1 schema.


V9.0.3: archive card spacing synced with homepage, fixed mobile public menu, richer property discovery + up to 9 smart related listings.


V9.1.0 SEO & Social Share:
- URL đẹp: /mua-ban/<tieu-de>-p<ID>, /cho-thue/<tieu-de>-p<ID>, /tin-tuc/<tieu-de>-p<ID>.
- Chuyen muc: /mua-ban/, /cho-thue/, /bat-dong-san/.
- 301 URL cu /property?id=... va /listings?transaction=... sang URL SEO.
- Open Graph/Twitter Card dong theo tung website va bai viet de chia se Zalo/Facebook co anh dai dien.
- Canonical + description dong tren edge Cloudflare Pages Function.


NEWSREAL V9.2.0 - MARKETING LANDING
====================================
Mục tiêu:
- hoangvuongtech.com/ = landing page bán NEWSREAL.
- app.hoangvuongtech.com/ = hệ thống NEWSREAL / Control Center như hiện tại.
- batdongsan2027.org.uk/ = website demo khách hàng.

Sau khi deploy:
1. Cloudflare Pages > newsreal > Custom domains.
2. Add custom domain: hoangvuongtech.com
3. Giữ nguyên app.hoangvuongtech.com.
4. Khi apex Active + SSL enabled, mở https://hoangvuongtech.com/
5. Nút Xem demo dẫn tới https://batdongsan2027.org.uk/
6. Nút tư vấn dẫn tới Zalo 0389986287.

Landing không thay đổi DB, API, Client Admin hay Control Center.


NEWSREAL V9.2.2 - REFINED HOME ICON
====================================
- Thay icon Home ký tự cũ bằng SVG nét mảnh.
- Bo góc nhẹ, gradient xanh, bóng mềm.
- Đồng bộ header desktop + mobile + footer public.
- SVG inline qua CSS, không cần file ảnh, luôn nét trên Retina.
- Không thay API / DB / Master / Client Admin / renewal.


NEWSREAL V9.3.0 - PASSWORD RECOVERY FLOW
=========================================
Client:
- /admin có nút "Quên mật khẩu?"
- Nhập email quản trị -> Resend gửi link reset.
- Link /reset-password/?token=... có hiệu lực 30 phút.
- Token one-time, lưu dạng SHA-256 trong D1.
- Đặt mật khẩu mới tối thiểu 8 ký tự.
- Đổi thành công sẽ thu hồi toàn bộ session cũ của tài khoản.

Master:
- Quản lý khách -> "Gửi link đặt lại mật khẩu".
- Gửi thẳng tới email Admin khách hàng.
- Không cần reset bàn giao và không làm mất dữ liệu website.

Bảo mật:
- Không gửi mật khẩu cũ qua email.
- Public forgot-password trả phản hồi chung để tránh dò email.
- Mỗi yêu cầu mới vô hiệu hóa reset link cũ.
- Reset token hết hạn sau 30 phút và dùng một lần.


NEWSREAL V9.3.3 - PUBLIC THEME TOGGLE VISIBLE FIX
=================================================
Root cause V9.3.2:
- Cloudflare SEO Function served embedded HTML constants.
- Embedded homepage/listings/property did NOT load /assets/theme.js.
- Static files had theme.js, but real customer domain used the edge-rendered version.
=> Therefore no Light/Dark button appeared.

Fixed:
- Inject theme.js into every edge-rendered public template.
- Toggle is placed in header actions / before hamburger.
- Desktop shows: ☾ Tối / ☀ Sáng.
- Mobile shows compact moon/sun icon.
- Fallback floating toggle if a future template has a different header.
- Dark mode contrast refined for cards, text, filters, header and footer.
- Client Admin remains without the public theme toggle.


NEWSREAL V9.3.4 - CONTACT EMAIL PERSISTENCE FIX
================================================
- Bỏ hoàn toàn Light/Dark mode.
- Email ở Client Admin > Cài đặt website được lưu vào site_public_settings.
- Refresh/reload không làm mất email.
- Sau khi Lưu, Client Admin đọc lại /api/me để kiểm tra dữ liệu thật trong D1.
- /api/site trả email công khai nên footer và trang chi tiết tự cập nhật.
- Vẫn mirror sang sites.email để tương thích bản cũ.
- Migration 0013_site_public_settings.sql; backend cũng tự tạo bảng.


NEWSREAL V9.3.5 - MASTER CONTACT SYNC
=====================================
Luồng mới:
1. Master tạo website và nhập thông tin khách.
2. SĐT / Zalo / Email công khai / Facebook được lưu ngay vào website.
   - Điện thoại công khai mặc định = SĐT khách.
   - Zalo mặc định = SĐT khách.
   - Email công khai mặc định = Email Admin khách.
3. Client Admin nhận sẵn toàn bộ thông tin trong Cài đặt website.
4. Mặc định các trường ở chế độ chỉ xem.
5. Khách bấm "Chỉnh sửa" mới có thể thay đổi, sau đó Lưu hoặc Hủy.
6. Website cũ cũng tự fallback từ customer_profiles / email Admin nếu trước đây chưa có dữ liệu public.

Không thay email đăng nhập khi khách sửa email liên hệ công khai.


NEWSREAL V9.4.0 - COMMERCIAL THEME 2
====================================
Mỗi website chỉ dùng 1 mẫu giao diện được Master kích hoạt.
Client Admin không có quyền đổi theme.

Mẫu 1: newsreal
- Giao diện hiện tại, thiên tin tức + BĐS.

Mẫu 2: estate_green
- Code thật, không phải ảnh.
- Navy + xanh lá.
- Hero lớn.
- Search box nổi trên hero.
- Card BĐS dạng portal chuyên nghiệp.
- Listings, chi tiết, footer đồng bộ.
- Responsive desktop / tablet / mobile.
- Giữ nguyên toàn bộ dữ liệu, bài đăng, SEO URL và Client Admin.

Master:
- Chọn mẫu ngay khi tạo website.
- Hoặc Quản lý khách > Mẫu giao diện > Kích hoạt mẫu.


NEWSREAL V9.4.1 - THEME 2 PORTAL REBUILD
========================================
Theme 2 homepage is now separately rendered in code, not just recolored Theme 1.

Key differences:
- Hero always uses a property image, not a news article.
- Fixed portal headline: "Tìm kiếm bất động sản phù hợp nhu cầu của bạn".
- Wide 4-part property search panel over hero.
- 5 benefit/service blocks under hero.
- 5-column featured-property cards like professional real-estate portals.
- Quick property categories.
- Latest listings grid.
- Market/news cards.
- Dark navy bottom service strip + phone CTA.
- Responsive tablet/mobile layout.
- Existing data, SEO URLs, admin and APIs remain shared.


NEWSREAL V9.4.2 - THEME 2 RICH HOME + CAROUSEL
==============================================
- Featured property area is now a real carousel:
  arrows, dots, autoplay every 4.3s, pause on hover/touch, responsive 5/3/2/1 cards.
- Expanded Theme 2 homepage so it no longer feels sparse:
  * Featured properties (up to 12)
  * Quick needs/categories
  * Mua bán nổi bật (6)
  * Cho thuê (6)
  * Nhà đất Hải Phòng / local fallback (6)
  * Tin đăng mới nhất (8)
  * Tin tức & thị trường (up to 6)
  * Bottom service/phone strip
- Theme 1 remains unchanged.


NEWSREAL V9.4.3 - ACCURATE FILTER FIX
=====================================
Fixed Theme 2 hero -> listings filtering:
- transaction exact
- property type exact
- province/district normalized (Vietnamese accents/prefixes supported)
- bedroom condition
- REAL price range filtering by parsing price strings such as:
  9,6 tỷ / 4,6 tỷ / 58 triệu/tháng / 17 triệu/tháng
- Sale price ranges: <2b, 2-5b, 5-10b, >10b
- Rent price ranges: <10m, 10-20m, 20-50m, >50m
- Listings page now exposes the selected "Khoảng giá" instead of unused Giá từ/Giá đến fields.
- Theme 2 search routes directly to /mua-ban/ or /cho-thue/.
- Old price_range values (2-5, 5-10, etc.) remain backward compatible.

Example:
Mua bán + Nhà phố + Hải Phòng + 2-5 tỷ
will NOT return a 9.6 tỷ property anymore.


NEWSREAL V9.5.0 - DEMO CENTER
/demo/ = showroom
/demo/mau-1/ = Template 1
/demo/mau-2/ = Template 2
Demo does not change D1 preset; both templates share the same tenant data.

NEWSREAL V9.5.1 - PROFESSIONAL TEMPLATE SHOWROOM
================================================
- /demo/ rebuilt as a commercial template showroom.
- Real screenshots are used for Template 1 and Template 2 previews.
- Each theme card has badge, description, features, View Demo and Choose Theme.
- Added responsive trust badges and comparison CTA.
- Demo toolbar reduced in height when browsing individual templates.
- Mobile showroom layout optimized.

NEWSREAL V9.6.0 - TEMPLATE MARKETPLACE
======================================
Permanent showroom architecture:
- /templates/ and /templates/bat-dong-san/ -> Template Marketplace
- /demo/bat-dong-san/mau-1/ -> Real Estate Template 1
- /demo/bat-dong-san/mau-2/ -> Real Estate Template 2
- old /demo/ redirects to /templates/bat-dong-san/
- old /demo/mau-1/ and /demo/mau-2/ remain compatible
- prepared categories: News, E-commerce, Landing Page, Services
- marketplace keeps the V9.5.1 visual design
- demo data/backend remain shared; no duplicate tenant data required

Deployment plan:
Use this build on the HoangVuongTech-facing Pages project/domain.
Keep batdongsan2027.org.uk available during migration until the new routes are verified.

NEWSREAL V9.6.1 - DOMAIN SEPARATION
===================================
- HoangVuongTech is now the permanent template marketplace host.
- Customer/test domains redirect /templates and /demo to HoangVuongTech.
- Marketplace visual design remains unchanged.
- Demo pages are noindex,follow.
- Marketplace category page has a canonical URL.
- Tenant/customer root sites are untouched.
\n\nV13.1 TEMPLATE SAMPLE CONTENT\n- Bài mẫu được chọn theo template_key/category; Tin tức không nhận bài BĐS.\n- posts.is_sample + sample_key chống trùng và cho phép xóa sạch bài mẫu mà không ảnh hưởng bài khách.\n- Tin tức Mẫu 1 có 18 bài mẫu/9 chuyên mục; BĐS dùng riêng bộ property.\n- Fallback chỉ trong đúng nhóm nội dung, không fallback chéo ngành.\n