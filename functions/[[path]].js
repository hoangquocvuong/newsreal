const INDEX_HTML="<!doctype html>\n<html lang=\"vi\" class=\"nr-template-booting\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<style id=\"nrTemplateBootStyle\">html.nr-template-booting{background:#fff}html.nr-template-booting body{visibility:hidden!important}html.nr-template-booting::before{content:\"\";position:fixed;inset:0;background:#fff;z-index:2147483646}html.nr-template-booting::after{content:\"\";position:fixed;left:50%;top:50%;width:30px;height:30px;margin:-15px 0 0 -15px;border:3px solid #e2e8f0;border-top-color:#1463ff;border-radius:50%;animation:nrTemplateBootSpin .75s linear infinite;z-index:2147483647}@keyframes nrTemplateBootSpin{to{transform:rotate(360deg)}}html.nr-template-booting.nr-template-boot-timeout::after{content:\"Không tải được giao diện. Vui lòng tải lại trang.\";width:min(420px,calc(100vw - 40px));height:auto;margin:0;transform:translate(-50%,-50%);border:0;border-radius:12px;animation:none;text-align:center;color:#334155;font:700 15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}</style>\n<script>window.__NR_BOOT_TIMEOUT__=setTimeout(function(){var r=document.documentElement;if(r.classList.contains('nr-template-booting'))r.classList.add('nr-template-boot-timeout')},12000);</script>\n<title>NewsReal</title>\n<meta name=\"description\" content=\"Cổng thông tin bất động sản và tin tức thị trường\">\n<link rel=\"stylesheet\" href=\"/assets/style.css?v=20.1.0\">\n\n<meta name=\"description\" content=\"Cổng thông tin bất động sản, nhà đất bán, cho thuê và tin tức thị trường.\">\n<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:title\" content=\"Bất động sản\">\n<meta property=\"og:description\" content=\"Tin đăng bất động sản, mua bán, cho thuê và tin tức thị trường.\">\n<meta property=\"og:image\" content=\"\">\n<meta property=\"og:url\" content=\"\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n<link rel=\"canonical\" href=\"\">\n  <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicons/favicon-16x16.png\">\n  <meta name=\"msapplication-TileColor\" content=\"#ffffff\">\n  <meta name=\"theme-color\" content=\"#ffffff\">\n</head>\n<body>\n<div class=\"topbar\"><div class=\"wrap\"><span id=\"topLeft\">Tin tức & bất động sản</span><span id=\"topContact\">Hotline: — · Zalo: —</span></div></div>\n\n<header class=\"header\">\n  <div class=\"wrap\">\n    <a class=\"logo\" href=\"/\"><span id=\"brandLeft\">NEWS</span><b id=\"brandRight\">REAL</b></a>\n    <nav class=\"nav\">\n      <a href=\"/\">Trang chủ</a>\n      <a href=\"/bat-dong-san/\">Bất động sản</a>\n      <a href=\"/mua/\">Mua</a>\n      <a href=\"/ban/\">Bán</a>\n      <a href=\"/cho-thue/\">Cho thuê</a>\n      <details class=\"property-taxonomy-menu\"><summary>Loại BĐS</summary><div class=\"property-taxonomy-dropdown\"><a href=\"/bat-dong-san/?property_type=Chung%20cư\">Căn hộ / Chung cư</a><a href=\"/bat-dong-san/?property_type=Nhà%20riêng\">Nhà riêng</a><a href=\"/bat-dong-san/?property_type=Nhà%20phố\">Nhà mặt phố</a><a href=\"/bat-dong-san/?property_type=Biệt%20thự\">Biệt thự / Liền kề</a><a href=\"/bat-dong-san/?property_type=Shophouse\">Shophouse / Nhà phố thương mại</a><a href=\"/bat-dong-san/?property_type=Đất\">Đất nền / Đất dự án</a><a href=\"/bat-dong-san/?property_type=Đất%20thổ%20cư\">Đất thổ cư</a><a href=\"/bat-dong-san/?property_type=Trang%20trại\">Đất nông nghiệp / Trang trại</a><a href=\"/bat-dong-san/?property_type=Văn%20phòng\">Văn phòng</a><a href=\"/bat-dong-san/?property_type=Mặt%20bằng%20kinh%20doanh\">Mặt bằng kinh doanh</a><a href=\"/bat-dong-san/?property_type=Kho%20xưởng\">Kho / Nhà xưởng</a><a href=\"/bat-dong-san/?property_type=Bất%20động%20sản%20công%20nghiệp\">Bất động sản công nghiệp</a><a href=\"/bat-dong-san/?property_type=Khách%20sạn%20%2F%20Resort\">Khách sạn / Resort / Nghỉ dưỡng</a><a href=\"/bat-dong-san/?property_type=Officetel\">Officetel / Căn hộ dịch vụ</a><a href=\"/bat-dong-san/?property_type=Khác\">Bất động sản khác</a></div></details>\n      <a href=\"#news\">Tin tức</a>\n    </nav>\n    <div class=\"actions\">\n      <a class=\"btn soft\" href=\"/favorites\">♥ Tin đã lưu</a>\n      <a class=\"btn primary\" href=\"/admin?tab=newpost\">+ Đăng tin</a>\n      <button id=\"mobileMenuBtn\" class=\"btn soft mobile-menu\">☰</button>\n    </div>\n  </div>\n</header>\n\n<main>\n<section class=\"hero-home\"><div class=\"wrap\">\n  <div class=\"hero-grid\">\n    <div id=\"heroSlider\" class=\"hero-slider\">\n      <div id=\"heroSlides\"></div>\n      \n    </div>\n    <div>\n      <div class=\"side-title\"><span>TIN ĐÁNG CHÚ Ý</span><a href=\"#news\">Xem tất cả →</a></div>\n      <div id=\"sideStack\" class=\"side-stack\"></div>\n    </div>\n  </div>\n\n  <div class=\"searchbox\">\n    <div class=\"tabs\">\n      <button class=\"tab active\" data-transaction=\"buy\">Mua</button>\n      <button class=\"tab\" data-transaction=\"sale\">Bán</button>\n      <button class=\"tab\" data-transaction=\"rent\">Cho thuê</button>\n      <button class=\"tab\" data-transaction=\"\">Tất cả</button>\n    </div>\n    <div class=\"filters\">\n      <input id=\"searchQ\" class=\"input\" placeholder=\"Nhập từ khóa, dự án, khu vực...\">\n      <select id=\"searchType\" class=\"select\"><option value=\"\">Loại bất động sản</option><option value=\"Chung cư\">Căn hộ / Chung cư</option><option value=\"Nhà riêng\">Nhà riêng</option><option value=\"Nhà phố\">Nhà mặt phố</option><option value=\"Biệt thự\">Biệt thự / Liền kề</option><option value=\"Shophouse\">Shophouse / Nhà phố thương mại</option><option value=\"Đất\">Đất nền / Đất dự án</option><option value=\"Đất thổ cư\">Đất thổ cư</option><option value=\"Trang trại\">Đất nông nghiệp / Trang trại</option><option value=\"Văn phòng\">Văn phòng</option><option value=\"Mặt bằng kinh doanh\">Mặt bằng kinh doanh</option><option value=\"Kho xưởng\">Kho / Nhà xưởng</option><option value=\"Bất động sản công nghiệp\">Bất động sản công nghiệp</option><option value=\"Khách sạn / Resort\">Khách sạn / Resort / Nghỉ dưỡng</option><option value=\"Officetel\">Officetel / Căn hộ dịch vụ</option><option value=\"Khác\">Bất động sản khác</option></select>\n      <select id=\"searchProvince\" class=\"select\"><option value=\"\">Tỉnh / Thành phố</option></select>\n      <select id=\"searchDistrict\" class=\"select\"><option value=\"\">Quận / Huyện</option></select>\n      <select id=\"searchPrice\" class=\"select\">\n        <option value=\"\">Khoảng giá</option>\n        <option value=\"duoi-2\">Dưới 2 tỷ</option>\n        <option value=\"2-5\">2 - 5 tỷ</option>\n        <option value=\"5-10\">5 - 10 tỷ</option>\n        <option value=\"tren-10\">Trên 10 tỷ</option>\n      </select>\n      <button class=\"btn primary\" id=\"searchBtn\">Tìm kiếm</button>\n    </div>\n  </div>\n</div></section>\n\n<section class=\"section\"><div class=\"wrap\">\n  <div class=\"section-head\">\n    <div><small class=\"section-kicker\">BẤT ĐỘNG SẢN</small><h2>Tin đăng mới nhất</h2><p>Tin đăng mới, trình bày gọn để người xem so sánh nhanh.</p></div>\n    <a href=\"/bat-dong-san/\">Xem tất cả →</a>\n  </div>\n  <div id=\"propertyCards\" class=\"cards\"></div>\n</div></section>\n\n\n<section class=\"section category-links-section\"><div class=\"wrap\">\n  <div class=\"section-head\">\n    <div><small class=\"section-kicker\">DANH MỤC NHÀ ĐẤT</small><h2>Tìm nhanh theo nhu cầu</h2><p>Các nhóm phổ biến, đủ dùng nhưng không quá rối.</p></div>\n  </div>\n  <div class=\"category-link-grid\">\n    <a href=\"/ban/?property_type=Chung%20cư\"><b>Bán căn hộ chung cư</b><span>Căn hộ, studio, duplex</span></a>\n    <a href=\"/ban/?property_type=Nhà%20phố\"><b>Bán nhà đất</b><span>Nhà phố, nhà riêng, biệt thự</span></a>\n    <a href=\"/cho-thue/\"><b>Cho thuê nhà</b><span>Nhà ở, căn hộ, phòng</span></a>\n    <a href=\"/listings?property_type=Kho xưởng\"><b>Kho xưởng & mặt bằng</b><span>Kho, xưởng, văn phòng, cửa hàng</span></a>\n    <a href=\"/listings?property_type=Đất\"><b>Đất nền & đất dự án</b><span>Đất ở, đất nền, đất đầu tư</span></a>\n  </div>\n</div></section>\n\n<section class=\"section category-section\" id=\"categories\"><div class=\"wrap\">\n  <div class=\"category-block square-block\">\n    <div class=\"category-heading\">\n      <div><span class=\"category-icon\">🏢</span><div><small>CHUYÊN MỤC 01</small><h3>Bán căn hộ chung cư</h3></div></div>\n      <a href=\"/ban/?property_type=Chung%20cư\">Xem tất cả →</a>\n    </div>\n    <div id=\"apartmentCards\" class=\"cards\"></div>\n  </div>\n\n  <div class=\"category-block square-block\">\n    <div class=\"category-heading\">\n      <div><span class=\"category-icon\">🏠</span><div><small>CHUYÊN MỤC 02</small><h3>Bán nhà đất</h3></div></div>\n      <a href=\"/ban/\">Xem tất cả →</a>\n    </div>\n    <div id=\"saleCards\" class=\"cards\"></div>\n  </div>\n\n  <div class=\"category-block square-block\">\n    <div class=\"category-heading\">\n      <div><span class=\"category-icon\">🔑</span><div><small>CHUYÊN MỤC 03</small><h3>Cho thuê nhà</h3></div></div>\n      <a href=\"/cho-thue/\">Xem tất cả →</a>\n    </div>\n    <div id=\"rentCards\" class=\"cards\"></div>\n  </div>\n\n  <div class=\"category-block square-block\">\n    <div class=\"category-heading\">\n      <div><span class=\"category-icon\">🏭</span><div><small>CHUYÊN MỤC 04</small><h3>Kho xưởng & mặt bằng</h3></div></div>\n      <a href=\"/listings?property_type=Kho xưởng\">Xem tất cả →</a>\n    </div>\n    <div id=\"warehouseCards\" class=\"cards\"></div>\n  </div>\n\n  <div class=\"category-block square-block\">\n    <div class=\"category-heading\">\n      <div><span class=\"category-icon\">🌿</span><div><small>CHUYÊN MỤC 05</small><h3>Đất nền & đất dự án</h3></div></div>\n      <a href=\"/listings?property_type=Đất\">Xem tất cả →</a>\n    </div>\n    <div id=\"landCards\" class=\"cards\"></div>\n  </div>\n</div></section>\n\n<section class=\"section news-home-section\" id=\"news\"><div class=\"wrap\">\n  <div class=\"section-head\">\n    <div><small class=\"section-kicker\">TIN TỨC</small><h2>Tin thị trường & kiến thức</h2><p>Thông tin hỗ trợ người mua, người bán và nhà đầu tư.</p></div>\n  </div>\n  <div class=\"news-grid\">\n    <div id=\"newsLead\"></div>\n    <div id=\"newsList\" class=\"news-list\"></div>\n  </div>\n</div></section>\n</main>\n\n<footer class=\"footer public-footer\"><div class=\"wrap public-footer-grid\">\n  <div class=\"footer-about\"><div class=\"brand footer-logo\"><span data-footer-brand>NEWSREAL</span></div><p class=\"footer-desc\">Kênh thông tin bất động sản, mua bán và cho thuê với nội dung rõ ràng, dễ tìm kiếm và thuận tiện liên hệ.</p><div class=\"footer-contact-list\"><a data-footer-phone href=\"#\">☎ Hotline: —</a><a data-footer-zalo href=\"#\" target=\"_blank\" rel=\"noopener\">💬 Zalo: —</a><a data-footer-email href=\"#\">✉ Email: —</a></div></div>\n  <div><h4>Bất động sản</h4><a href=\"/mua/\">Cần mua</a><a href=\"/ban/\">Nhà đất bán</a><a href=\"/cho-thue/\">Nhà đất cho thuê</a><a href=\"/listings?property_type=Chung%20cư\">Căn hộ / Chung cư</a><a href=\"/listings?property_type=Đất\">Đất nền / Đất dự án</a></div>\n  <div><h4>Khám phá</h4><a href=\"/\">Trang chủ</a><a href=\"/#news\">Tin tức thị trường</a><a href=\"/favorites\">Tin đã lưu</a><a href=\"/admin?tab=newpost\">Đăng tin bất động sản</a></div>\n  <div><h4>Thông tin & hỗ trợ</h4><p class=\"footer-note\">Cần tư vấn đăng tin hoặc tìm bất động sản phù hợp? Liên hệ trực tiếp để được hỗ trợ.</p><a href=\"/admin\">Quản trị website</a><a href=\"https://www.facebook.com/groups/batdongsanhaiphong2021\" target=\"_blank\" rel=\"noopener\">Cộng đồng Facebook ↗</a></div>\n</div><div class=\"footer-bottom\"><div class=\"wrap\"><span>© 2026 <b data-footer-brand>NEWSREAL</b>. Nội dung thuộc website.</span><span>Powered by NEWSREAL · HOÀNG VƯƠNG TECH</span></div></div></footer>\n\n<script src=\"/assets/site.js?v=20.4.2\"></script>\n</body>\n</html>";
const LISTINGS_HTML="<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Danh sách bất động sản</title><link rel=\"stylesheet\" href=\"/assets/style.css?v=1788174900\">\n<meta name=\"description\" content=\"Cổng thông tin bất động sản, nhà đất bán, cho thuê và tin tức thị trường.\">\n<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:title\" content=\"Bất động sản\">\n<meta property=\"og:description\" content=\"Tin đăng bất động sản, mua bán, cho thuê và tin tức thị trường.\">\n<meta property=\"og:image\" content=\"\">\n<meta property=\"og:url\" content=\"\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n<link rel=\"canonical\" href=\"\">\n  <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicons/favicon-16x16.png\">\n  <meta name=\"msapplication-TileColor\" content=\"#ffffff\">\n  <meta name=\"theme-color\" content=\"#ffffff\">\n</head><body>\n<div class=\"top-strip\"><div class=\"wrap\"><span>Bất động sản</span><span id=\"topContact\">Hotline: —</span></div></div>\n<header class=\"header\"><div class=\"wrap nav\"><a class=\"brand\" href=\"/\"><b id=\"brandName\">NEWSREAL</b></a><nav id=\"mainNav\"><a href=\"/\">Trang chủ</a><a href=\"/mua/\">Mua</a><a href=\"/ban/\">Bán</a><a href=\"/cho-thue/\">Cho thuê</a><details class=\"property-taxonomy-menu\"><summary>Loại BĐS</summary><div class=\"property-taxonomy-dropdown\"><a href=\"/bat-dong-san/?property_type=Chung%20c%C6%B0\">Căn hộ / Chung cư</a><a href=\"/bat-dong-san/?property_type=Nh%C3%A0%20ri%C3%AAng\">Nhà riêng</a><a href=\"/bat-dong-san/?property_type=Nh%C3%A0%20tr%E1%BB%8D\">Nhà trọ / Phòng trọ</a><a href=\"/bat-dong-san/?property_type=Nh%C3%A0%20ph%E1%BB%91\">Nhà mặt phố</a><a href=\"/bat-dong-san/?property_type=Bi%E1%BB%87t%20th%E1%BB%B1\">Biệt thự / Liền kề</a><a href=\"/bat-dong-san/?property_type=Shophouse\">Shophouse / Nhà phố thương mại</a><a href=\"/bat-dong-san/?property_type=%C4%90%E1%BA%A5t\">Đất nền / Đất dự án</a><a href=\"/bat-dong-san/?property_type=%C4%90%E1%BA%A5t%20th%E1%BB%95%20c%C6%B0\">Đất thổ cư</a><a href=\"/bat-dong-san/?property_type=Trang%20tr%E1%BA%A1i\">Đất nông nghiệp / Trang trại</a><a href=\"/bat-dong-san/?property_type=V%C4%83n%20ph%C3%B2ng\">Văn phòng</a><a href=\"/bat-dong-san/?property_type=M%E1%BA%B7t%20b%E1%BA%B1ng%20kinh%20doanh\">Mặt bằng kinh doanh</a><a href=\"/bat-dong-san/?property_type=Kho%20x%C6%B0%E1%BB%9Fng\">Kho / Nhà xưởng</a><a href=\"/bat-dong-san/?property_type=B%E1%BA%A5t%20%C4%91%E1%BB%99ng%20s%E1%BA%A3n%20c%C3%B4ng%20nghi%E1%BB%87p\">Bất động sản công nghiệp</a><a href=\"/bat-dong-san/?property_type=Kh%C3%A1ch%20s%E1%BA%A1n%20/%20Resort\">Khách sạn / Resort / Nghỉ dưỡng</a><a href=\"/bat-dong-san/?property_type=Officetel\">Officetel / Căn hộ dịch vụ</a><a href=\"/bat-dong-san/?property_type=Kh%C3%A1c\">Bất động sản khác</a></div></details><a href=\"/favorites\">Tin đã lưu</a></nav><a class=\"btn header-post-btn\" href=\"/admin?tab=newpost\">+ Đăng tin</a><button id=\"menuToggle\" class=\"menu-toggle\" aria-label=\"Mở menu\">☰</button></div></header>\n<main class=\"section listings-page\"><div class=\"wrap\"><div class=\"breadcrumb\"><a href=\"/\">Trang chủ</a> / Danh sách bất động sản</div>\n<div class=\"section-head listings-title\"><div><span class=\"eyebrow\">BẤT ĐỘNG SẢN</span><h2 id=\"listTitle\">Danh sách tin</h2><p id=\"resultCount\"></p></div><button id=\"filterToggle\" class=\"btn ghost filter-toggle\">☷ Bộ lọc</button></div>\n<section id=\"filterPanel\" class=\"panel listing-filter-panel\"><div class=\"filters listing-filters\">\n<input id=\"fq\" placeholder=\"Từ khóa, dự án, khu vực\">\n<select id=\"ftransaction\"><option value=\"\">Mua / Bán / Cho thuê</option><option value=\"buy\">Mua</option><option value=\"sale\">Bán</option><option value=\"rent\">Cho thuê</option></select>\n<select id=\"ftype\"><option value=\"\">Loại BĐS</option><option value=\"Chung cư\">Căn hộ / Chung cư</option><option value=\"Nhà riêng\">Nhà riêng</option><option value=\"Nhà phố\">Nhà mặt phố</option><option value=\"Biệt thự\">Biệt thự / Liền kề</option><option value=\"Shophouse\">Shophouse / Nhà phố thương mại</option><option value=\"Đất\">Đất nền / Đất dự án</option><option value=\"Đất thổ cư\">Đất thổ cư</option><option value=\"Trang trại\">Đất nông nghiệp / Trang trại</option><option value=\"Văn phòng\">Văn phòng</option><option value=\"Mặt bằng kinh doanh\">Mặt bằng kinh doanh</option><option value=\"Kho xưởng\">Kho / Nhà xưởng</option><option value=\"Bất động sản công nghiệp\">Bất động sản công nghiệp</option><option value=\"Khách sạn / Resort\">Khách sạn / Resort / Nghỉ dưỡng</option><option value=\"Officetel\">Officetel / Căn hộ dịch vụ</option><option value=\"Khác\">Bất động sản khác</option></select>\n<input id=\"fprovince\" placeholder=\"Tỉnh/Thành phố\"><input id=\"fdistrict\" placeholder=\"Quận/Huyện\">\n<select id=\"fprice\"><option value=\"\">Khoảng giá</option></select>\n<select id=\"fbed\"><option value=\"\">Phòng ngủ</option><option value=\"1\">1+</option><option value=\"2\">2+</option><option value=\"3\">3+</option><option value=\"4\">4+</option></select>\n<button class=\"btn\" onclick=\"applyFilters()\">Áp dụng</button><button class=\"btn ghost\" onclick=\"resetFilters()\">Xóa lọc</button>\n</div></section>\n<div id=\"listingGrid\" class=\"listing-grid listing-grid-wide\"></div></div></main>\n<footer class=\"footer public-footer\"><div class=\"wrap public-footer-grid\">\n  <div class=\"footer-about\"><div class=\"brand footer-logo\"><span data-footer-brand>NEWSREAL</span></div><p class=\"footer-desc\">Kênh thông tin bất động sản, mua bán và cho thuê với nội dung rõ ràng, dễ tìm kiếm và thuận tiện liên hệ.</p><div class=\"footer-contact-list\"><a data-footer-phone href=\"#\">☎ Hotline: —</a><a data-footer-zalo href=\"#\" target=\"_blank\" rel=\"noopener\">💬 Zalo: —</a><a data-footer-email href=\"#\">✉ Email: —</a></div></div>\n  <div><h4>Bất động sản</h4><a href=\"/mua/\">Cần mua</a><a href=\"/ban/\">Nhà đất bán</a><a href=\"/cho-thue/\">Nhà đất cho thuê</a><a href=\"/listings?property_type=Chung%20cư\">Căn hộ / Chung cư</a><a href=\"/listings?property_type=Đất\">Đất nền / Đất dự án</a></div>\n  <div><h4>Khám phá</h4><a href=\"/\">Trang chủ</a><a href=\"/#news\">Tin tức thị trường</a><a href=\"/favorites\">Tin đã lưu</a><a href=\"/admin?tab=newpost\">Đăng tin bất động sản</a></div>\n  <div><h4>Thông tin & hỗ trợ</h4><p class=\"footer-note\">Cần tư vấn đăng tin hoặc tìm bất động sản phù hợp? Liên hệ trực tiếp để được hỗ trợ.</p><a href=\"/admin\">Quản trị website</a><a href=\"https://www.facebook.com/groups/batdongsanhaiphong2021\" target=\"_blank\" rel=\"noopener\">Cộng đồng Facebook ↗</a></div>\n</div><div class=\"footer-bottom\"><div class=\"wrap\"><span>© 2026 <b data-footer-brand>NEWSREAL</b>. Nội dung thuộc website.</span><span>Powered by NEWSREAL · HOÀNG VƯƠNG TECH</span></div></div></footer>\n<script src=\"/assets/listings.js?v=1788135100\"></script></body></html>";
const PROPERTY_HTML="<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Chi tiết bài viết</title><link rel=\"stylesheet\" href=\"/assets/style.css?v=1788174900\">\n<meta name=\"description\" content=\"Cổng thông tin bất động sản, nhà đất bán, cho thuê và tin tức thị trường.\">\n<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:title\" content=\"Bất động sản\">\n<meta property=\"og:description\" content=\"Tin đăng bất động sản, mua bán, cho thuê và tin tức thị trường.\">\n<meta property=\"og:image\" content=\"\">\n<meta property=\"og:url\" content=\"\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n<link rel=\"canonical\" href=\"\">\n  <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicons/favicon-16x16.png\">\n  <meta name=\"msapplication-TileColor\" content=\"#ffffff\">\n  <meta name=\"theme-color\" content=\"#ffffff\">\n</head><body>\n<div class=\"top-strip\"><div class=\"wrap\"><span id=\"detailTypeLabel\">Chi tiết bài viết</span><span id=\"topContact\">Hotline: —</span></div></div>\n<header class=\"header\"><div class=\"wrap nav\"><a class=\"brand\" href=\"/\"><b id=\"brandName\">NEWSREAL</b></a><nav id=\"detailNav\"><a href=\"/\">Trang chủ</a><a href=\"/mua/\">Mua</a><a href=\"/ban/\">Bán</a><a href=\"/cho-thue/\">Cho thuê</a><details class=\"property-taxonomy-menu\"><summary>Loại BĐS</summary><div class=\"property-taxonomy-dropdown\"><a href=\"/bat-dong-san/?property_type=Chung%20c%C6%B0\">Căn hộ / Chung cư</a><a href=\"/bat-dong-san/?property_type=Nh%C3%A0%20ri%C3%AAng\">Nhà riêng</a><a href=\"/bat-dong-san/?property_type=Nh%C3%A0%20tr%E1%BB%8D\">Nhà trọ / Phòng trọ</a><a href=\"/bat-dong-san/?property_type=Nh%C3%A0%20ph%E1%BB%91\">Nhà mặt phố</a><a href=\"/bat-dong-san/?property_type=Bi%E1%BB%87t%20th%E1%BB%B1\">Biệt thự / Liền kề</a><a href=\"/bat-dong-san/?property_type=Shophouse\">Shophouse / Nhà phố thương mại</a><a href=\"/bat-dong-san/?property_type=%C4%90%E1%BA%A5t\">Đất nền / Đất dự án</a><a href=\"/bat-dong-san/?property_type=%C4%90%E1%BA%A5t%20th%E1%BB%95%20c%C6%B0\">Đất thổ cư</a><a href=\"/bat-dong-san/?property_type=Trang%20tr%E1%BA%A1i\">Đất nông nghiệp / Trang trại</a><a href=\"/bat-dong-san/?property_type=V%C4%83n%20ph%C3%B2ng\">Văn phòng</a><a href=\"/bat-dong-san/?property_type=M%E1%BA%B7t%20b%E1%BA%B1ng%20kinh%20doanh\">Mặt bằng kinh doanh</a><a href=\"/bat-dong-san/?property_type=Kho%20x%C6%B0%E1%BB%9Fng\">Kho / Nhà xưởng</a><a href=\"/bat-dong-san/?property_type=B%E1%BA%A5t%20%C4%91%E1%BB%99ng%20s%E1%BA%A3n%20c%C3%B4ng%20nghi%E1%BB%87p\">Bất động sản công nghiệp</a><a href=\"/bat-dong-san/?property_type=Kh%C3%A1ch%20s%E1%BA%A1n%20/%20Resort\">Khách sạn / Resort / Nghỉ dưỡng</a><a href=\"/bat-dong-san/?property_type=Officetel\">Officetel / Căn hộ dịch vụ</a><a href=\"/bat-dong-san/?property_type=Kh%C3%A1c\">Bất động sản khác</a></div></details><a href=\"/favorites\">Tin đã lưu</a></nav><a class=\"btn header-post-btn\" href=\"/admin?tab=newpost\">+ Đăng tin</a><button id=\"detailMenuToggle\" class=\"menu-toggle\">☰</button></div></header>\n<main class=\"property-page\"><div class=\"wrap\"><div class=\"breadcrumb\"><a href=\"/\">Trang chủ</a> / <a id=\"breadcrumbSection\" href=\"/bat-dong-san/\">Bất động sản</a> / <span id=\"crumb\">Chi tiết</span></div><div id=\"propertyRoot\">Đang tải...</div></div></main>\n<footer class=\"footer public-footer\"><div class=\"wrap public-footer-grid\">\n  <div class=\"footer-about\"><div class=\"brand footer-logo\"><span data-footer-brand>NEWSREAL</span></div><p class=\"footer-desc\">Kênh thông tin bất động sản, mua bán và cho thuê với nội dung rõ ràng, dễ tìm kiếm và thuận tiện liên hệ.</p><div class=\"footer-contact-list\"><a data-footer-phone href=\"#\">☎ Hotline: —</a><a data-footer-zalo href=\"#\" target=\"_blank\" rel=\"noopener\">💬 Zalo: —</a><a data-footer-email href=\"#\">✉ Email: —</a></div></div>\n  <div><h4>Bất động sản</h4><a href=\"/mua/\">Cần mua</a><a href=\"/ban/\">Nhà đất bán</a><a href=\"/cho-thue/\">Nhà đất cho thuê</a><a href=\"/listings?property_type=Chung%20cư\">Căn hộ / Chung cư</a><a href=\"/listings?property_type=Đất\">Đất nền / Đất dự án</a></div>\n  <div><h4>Khám phá</h4><a href=\"/\">Trang chủ</a><a href=\"/#news\">Tin tức thị trường</a><a href=\"/favorites\">Tin đã lưu</a><a href=\"/admin?tab=newpost\">Đăng tin bất động sản</a></div>\n  <div><h4>Thông tin & hỗ trợ</h4><p class=\"footer-note\">Cần tư vấn đăng tin hoặc tìm bất động sản phù hợp? Liên hệ trực tiếp để được hỗ trợ.</p><a href=\"/admin\">Quản trị website</a><a href=\"https://www.facebook.com/groups/batdongsanhaiphong2021\" target=\"_blank\" rel=\"noopener\">Cộng đồng Facebook ↗</a></div>\n</div><div class=\"footer-bottom\"><div class=\"wrap\"><span>© 2026 <b data-footer-brand>NEWSREAL</b>. Nội dung thuộc website.</span><span>Powered by NEWSREAL · HOÀNG VƯƠNG TECH</span></div></div></footer>\n<script src=\"/assets/property.js?v=1788135100\"></script></body></html>";
const FAVORITES_HTML="<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Tin đã lưu</title><meta name=\"robots\" content=\"noindex,follow\"><link rel=\"stylesheet\" href=\"/assets/style.css?v=1788174900\">  <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"/favicons/favicon-16x16.png\">\n  <meta name=\"msapplication-TileColor\" content=\"#ffffff\">\n  <meta name=\"theme-color\" content=\"#ffffff\">\n</head><body>\n<header class=\"header\"><div class=\"wrap nav\"><a class=\"brand\" href=\"/\"><b id=\"brandName\">NEWSREAL</b></a><nav id=\"favoritesNav\"><a href=\"/\">Trang chủ</a><a href=\"/bat-dong-san/\">Bất động sản</a><a href=\"/mua/\">Mua</a><a href=\"/ban/\">Bán</a><a href=\"/cho-thue/\">Cho thuê</a></nav><button id=\"favoritesMenuToggle\" class=\"menu-toggle\" aria-label=\"Mở menu\">☰</button></div></header>\n<main class=\"section\"><div class=\"wrap\"><div class=\"section-head\"><div><span class=\"eyebrow\">YÊU THÍCH</span><h2>Tin đã lưu</h2><p>Các bất động sản bạn đã lưu trên trình duyệt này.</p></div></div><div id=\"favGrid\" class=\"listing-grid\"></div></div></main>\n<footer class=\"footer public-footer\"><div class=\"wrap public-footer-grid\">\n  <div class=\"footer-about\"><div class=\"brand footer-logo\"><span data-footer-brand>NEWSREAL</span></div><p class=\"footer-desc\">Kênh thông tin bất động sản, mua bán và cho thuê với nội dung rõ ràng, dễ tìm kiếm và thuận tiện liên hệ.</p><div class=\"footer-contact-list\"><a data-footer-phone href=\"#\">☎ Hotline: —</a><a data-footer-zalo href=\"#\" target=\"_blank\" rel=\"noopener\">💬 Zalo: —</a><a data-footer-email href=\"#\">✉ Email: —</a></div></div>\n  <div><h4>Bất động sản</h4><a href=\"/mua/\">Cần mua</a><a href=\"/ban/\">Nhà đất bán</a><a href=\"/cho-thue/\">Nhà đất cho thuê</a><a href=\"/listings?property_type=Chung%20cư\">Căn hộ / Chung cư</a><a href=\"/listings?property_type=Đất\">Đất nền / Đất dự án</a></div>\n  <div><h4>Khám phá</h4><a href=\"/\">Trang chủ</a><a href=\"/#news\">Tin tức thị trường</a><details class=\"property-taxonomy-menu\"><summary>Loại BĐS</summary><div class=\"property-taxonomy-dropdown\"><a href=\"/bat-dong-san/?property_type=Chung%20c%C6%B0\">Căn hộ / Chung cư</a><a href=\"/bat-dong-san/?property_type=Nh%C3%A0%20ri%C3%AAng\">Nhà riêng</a><a href=\"/bat-dong-san/?property_type=Nh%C3%A0%20tr%E1%BB%8D\">Nhà trọ / Phòng trọ</a><a href=\"/bat-dong-san/?property_type=Nh%C3%A0%20ph%E1%BB%91\">Nhà mặt phố</a><a href=\"/bat-dong-san/?property_type=Bi%E1%BB%87t%20th%E1%BB%B1\">Biệt thự / Liền kề</a><a href=\"/bat-dong-san/?property_type=Shophouse\">Shophouse / Nhà phố thương mại</a><a href=\"/bat-dong-san/?property_type=%C4%90%E1%BA%A5t\">Đất nền / Đất dự án</a><a href=\"/bat-dong-san/?property_type=%C4%90%E1%BA%A5t%20th%E1%BB%95%20c%C6%B0\">Đất thổ cư</a><a href=\"/bat-dong-san/?property_type=Trang%20tr%E1%BA%A1i\">Đất nông nghiệp / Trang trại</a><a href=\"/bat-dong-san/?property_type=V%C4%83n%20ph%C3%B2ng\">Văn phòng</a><a href=\"/bat-dong-san/?property_type=M%E1%BA%B7t%20b%E1%BA%B1ng%20kinh%20doanh\">Mặt bằng kinh doanh</a><a href=\"/bat-dong-san/?property_type=Kho%20x%C6%B0%E1%BB%9Fng\">Kho / Nhà xưởng</a><a href=\"/bat-dong-san/?property_type=B%E1%BA%A5t%20%C4%91%E1%BB%99ng%20s%E1%BA%A3n%20c%C3%B4ng%20nghi%E1%BB%87p\">Bất động sản công nghiệp</a><a href=\"/bat-dong-san/?property_type=Kh%C3%A1ch%20s%E1%BA%A1n%20/%20Resort\">Khách sạn / Resort / Nghỉ dưỡng</a><a href=\"/bat-dong-san/?property_type=Officetel\">Officetel / Căn hộ dịch vụ</a><a href=\"/bat-dong-san/?property_type=Kh%C3%A1c\">Bất động sản khác</a></div></details><a href=\"/favorites\">Tin đã lưu</a><a href=\"/admin?tab=newpost\">Đăng tin bất động sản</a></div>\n  <div><h4>Thông tin & hỗ trợ</h4><p class=\"footer-note\">Cần tư vấn đăng tin hoặc tìm bất động sản phù hợp? Liên hệ trực tiếp để được hỗ trợ.</p><a href=\"/admin\">Quản trị website</a><a href=\"https://www.facebook.com/groups/batdongsanhaiphong2021\" target=\"_blank\" rel=\"noopener\">Cộng đồng Facebook ↗</a></div>\n</div><div class=\"footer-bottom\"><div class=\"wrap\"><span>© 2026 <b data-footer-brand>NEWSREAL</b>. Nội dung thuộc website.</span><span>Powered by NEWSREAL · HOÀNG VƯƠNG TECH</span></div></div></footer>\n<script src=\"/assets/favorites.js?v=1788135100\"></script></body></html>";
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function stripHtml(v=''){return String(v||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}
function slugify(v=''){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'tin-bat-dong-san'}
function siteHost(req){return new URL(req.url).hostname.replace(/^www\./,'').toLowerCase()}
async function siteFor(env,req){const h=siteHost(req);let s=await env.DB.prepare(`SELECT * FROM sites WHERE lower(domain)=? AND status='active'`).bind(h).first();if(!s&&(h==='localhost'||h.endsWith('.pages.dev')||h==='app.hoangvuongtech.com'))s=await env.DB.prepare(`SELECT * FROM sites WHERE status='active' ORDER BY id LIMIT 1`).first();return s}
function postUrl(base,p){const cat=p.type==='news'?'tin-tuc':(p.transaction==='rent'?'cho-thue':(p.transaction==='buy'?'mua':(p.transaction==='sale'?'ban':'bat-dong-san')));return `${base}/${cat}/${slugify(p.title)}-p${p.id}`}
function metaTags({title,description,image,url,type='website'}){return `
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="${esc(type)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image||'')}">
<meta property="og:image:secure_url" content="${esc(image||'')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="NEWSREAL">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image||'')}">
<link rel="canonical" href="${esc(url)}">
`}
function inject(html,meta){
 return html
  .replace(/<title>[\s\S]*?<\/title>/i,'')
  .replace(/<meta name="description"[^>]*>/ig,'')
  .replace(/<meta property="og:[^"]+"[^>]*>/ig,'')
  .replace(/<meta name="twitter:[^"]+"[^>]*>/ig,'')
  .replace(/<link rel="canonical"[^>]*>/ig,'')
  .replace('</head>',meta+'</head>');
}
function htmlResponse(body,status=200){return new Response(body,{status,headers:{'Content-Type':'text/html; charset=UTF-8','Cache-Control':'public, max-age=60'}})}
function htmlNoCache(body,status=200){
 return new Response(body,{status,headers:{
  'Content-Type':'text/html; charset=UTF-8',
  'Cache-Control':'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma':'no-cache',
  'Expires':'0',
  'CDN-Cache-Control':'no-store',
  'Cloudflare-CDN-Cache-Control':'no-store'
 }});
}

function themedHtml(html,preset){
 const cls=preset==='newsreal'?'theme-estate-default':preset==='estate_green'?'theme-estate-green':preset==='estate_luxe_3'?'theme-estate-luxe':preset==='estate_minimal_4'?'theme-estate-minimal':preset==='estate_urban_5'?'theme-estate-urban':preset==='news_portal_1'?'theme-news-portal':preset==='service_fpt_1'?'theme-service-fpt':preset==='service_vnpt_2'?'theme-service-vnpt':preset==='service_viettel_3'?'theme-service-viettel':preset==='service_camera_store_4'?'theme-service-camera-store':preset==='game_clash_1'?'theme-game-clash':'';
 return cls?html.replace('<body>',`<body class="${cls}">`):html;
}

const TEMPLATE_MARKET_HOSTS=new Set(['hoangvuongtech.com','www.hoangvuongtech.com']);
const TRIAL_LAUNCH_HOSTS=new Set(['hoangvuongtech.com','www.hoangvuongtech.com','app.hoangvuongtech.com']);
function isTemplateMarketHost(host){return TEMPLATE_MARKET_HOSTS.has(String(host||'').toLowerCase())}
function marketOriginFor(host){
 return isTemplateMarketHost(host)?'':'https://hoangvuongtech.com';
}
function demoThemeFromPath(path){
 if(path==='/templates'||path==='/templates/'||path.startsWith('/templates/'))return 'marketplace';
 if(path==='/demo'||path==='/demo/')return 'legacy-center';
 const legacyEstate=path.match(/^\/demo\/(mau-[1-5])(?:\/|$)/i);
 if(legacyEstate)return legacyEstate[1].toLowerCase();
 const estate=path.match(/^\/demo\/bat-dong-san\/(mau-[1-5])(?:\/|$)/i);
 if(estate)return estate[1].toLowerCase();
 const news=path.match(/^\/demo\/tin-tuc\/mau-([1-4])(?:\/|$)/i);
 if(news)return 'tin-tuc-'+news[1];
 const service=path.match(/^\/demo\/dich-vu\/mau-([1-9]\d*)(?:\/|$)/i);
 if(service)return 'dich-vu-'+service[1];
 const game=path.match(/^\/demo\/game\/clash-of-clans(?:\/|$)/i);
 if(game)return 'game-1';
 return '';
}
function demoPrefixForPath(path,demo){
 if(!demo||demo==='marketplace'||demo==='legacy-center')return '';
 if(/^tin-tuc-[1-4]$/.test(demo))return '/demo/tin-tuc/mau-'+demo.split('-').pop();
 if(/^dich-vu-\d+$/.test(demo))return '/demo/dich-vu/mau-'+demo.split('-').pop();
 if(demo==='game-1')return '/demo/game/clash-of-clans';
 if(/^mau-[1-5]$/.test(demo))return '/demo/bat-dong-san/'+demo;
 return '';
}
function stripDemoPath(path,demo){
 if(!demo||demo==='marketplace'||demo==='legacy-center')return path;
 let sourcePrefix=demoPrefixForPath(path,demo);
 if(/^mau-[1-5]$/.test(demo)&&path.startsWith('/demo/'+demo))sourcePrefix='/demo/'+demo;
 const rest=path.slice(sourcePrefix.length);
 return rest||'/';
}
function demoInject(html,demo,trialCtx=null){
 if(!demo||demo==='center')return html;
 html=html.replace(/\/assets\/style\.css\?v=[^\"'&<]+/g,'/assets/style.css?v=20.9.13').replace(/\/assets\/site\.js\?v=[^\"'&<]+/g,'/assets/site.js?v=20.9.13');
 const preset=demo==='mau-1'?'newsreal':demo==='mau-2'?'estate_green':demo==='mau-3'?'estate_luxe_3':demo==='mau-4'?'estate_minimal_4':demo==='mau-5'?'estate_urban_5':demo==='tin-tuc-1'?'news_portal_1':demo==='tin-tuc-2'?'news_paper_2':demo==='tin-tuc-3'?'news_magazine_3':demo==='tin-tuc-4'?'news_minimal_4':demo==='dich-vu-1'?'service_fpt_1':demo==='dich-vu-2'?'service_vnpt_2':demo==='dich-vu-3'?'service_viettel_3':demo==='dich-vu-4'?'service_camera_store_4':demo==='game-1'?'game_clash_1':'';
 let out=themedHtml(html,preset);
 const currentPath=typeof rawPath!=='undefined'?rawPath:'';
 const prefix=demoPrefixForPath(currentPath,demo);
 const boot=`<meta name="robots" content="noindex,follow"><meta name="newsreal-demo-build" content="20.9.13"><script>window.NR_DEMO_THEME=${JSON.stringify(demo)};window.NR_DEMO_PREFIX=${JSON.stringify(prefix)};window.NR_TRIAL_TOKEN=${JSON.stringify(trialCtx?.trial_token||'')};window.NR_TRIAL_TENANT=${JSON.stringify(trialCtx?.domain||'')};window.NR_DEMO_TENANT=window.NR_TRIAL_TENANT||'batdongsan2027.org.uk';
window.nrTrialUrl=function(raw){
 if(!window.NR_TRIAL_TOKEN||!raw||typeof raw!=='string'||raw==='#'||/^mailto:|^tel:|^javascript:/i.test(raw))return raw;
 try{const x=new URL(raw,location.origin);if(x.origin!==location.origin)return raw;if(x.pathname.startsWith('/api/')||x.pathname.startsWith('/assets/')||x.pathname.startsWith('/admin')||x.pathname.startsWith('/control-center'))return raw;x.searchParams.set('nr_trial',window.NR_TRIAL_TOKEN);return x.pathname+x.search+x.hash}catch(e){return raw}
};
window.nrDemoAdminUrl=function(templateKey,tab){
 const key=String(templateKey||window.NR_DEMO_THEME||'').trim();
 if(window.NR_TRIAL_TOKEN){const q=new URLSearchParams();if(window.NR_TRIAL_TENANT)q.set('tenant',window.NR_TRIAL_TENANT);q.set('nr_trial',window.NR_TRIAL_TOKEN);if(key)q.set('template',key);if(tab)q.set('tab',tab);return '/admin?'+q.toString()}
 const q=new URLSearchParams();if(key)q.set('template',key);if(tab)q.set('tab',tab);return 'https://batdongsan2027.org.uk/admin'+(q.toString()?'?'+q.toString():'')
};
window.NR_ESTATE_CORE={
 'mau-1':{brand:'BẤT ĐỘNG SẢN',cls:'theme-estate-default'},
 'mau-2':{brand:'BẤT ĐỘNG SẢN',cls:'theme-estate-green'},
 'mau-3':{brand:'LIVING ESTATE',cls:'theme-estate-luxe'},
 'mau-4':{brand:'NHÀ ĐẸP',cls:'theme-estate-minimal'},
 'mau-5':{brand:'URBAN HOME',cls:'theme-estate-urban'}
};
window.NR_DEMO_TITLE_LABELS={
 'mau-1':'BĐS Mẫu 1','mau-2':'BĐS Mẫu 2','mau-3':'BĐS Mẫu 3','mau-4':'BĐS Mẫu 4','mau-5':'BĐS Mẫu 5',
 'tin-tuc-1':'Tin tức Mẫu 1','tin-tuc-2':'Tin tức Mẫu 2','tin-tuc-3':'Tin tức Mẫu 3','tin-tuc-4':'Tin tức Mẫu 4',
 'dich-vu-1':'FPT','dich-vu-2':'VNPT','dich-vu-3':'Viettel','dich-vu-4':'Camera Store','game-1':'Clash of Clans · Base Portal'
};
window.nrApplyDemoTitle=function(){
 const key=String(window.NR_DEMO_THEME||''),base=window.NR_DEMO_TITLE_LABELS[key];
 if(!base)return;
 const prefix=String(window.NR_DEMO_PREFIX||''),path=location.pathname;
 let rel=prefix&&path.startsWith(prefix)?path.slice(prefix.length):path;
 rel=rel||'/';
 // Article pages own their title (headline + template). Do not overwrite them here.
 if(/\\.html$/i.test(rel)||/\\-p\\d+\\/?$/i.test(rel))return;
 const q=new URLSearchParams(location.search);
 const category=q.get('category');
 let page='';
 if(category&&/^tin-tuc-/.test(key))page=category;
 else if(/^\\/mua-ban\\/?/i.test(rel))page='Nhà đất bán';
 else if(/^\\/cho-thue\\/?/i.test(rel))page='Nhà đất cho thuê';
 else if(/^\\/bat-dong-san\\/?/i.test(rel))page='Bất động sản';
 else if(/^\\/favorites\\/?/i.test(rel))page='Tin đã lưu';
 document.title=(page?page+' | ':'')+base+' · Demo | HoangVuongTech';
};
document.addEventListener('DOMContentLoaded',()=>window.nrApplyDemoTitle&&window.nrApplyDemoTitle());
window.nrEstateDemoUrl=function(path){
 if(!window.NR_DEMO_PREFIX||!path||typeof path!=='string')return path;
 if(/^https?:|^mailto:|^tel:|^javascript:/i.test(path))return path;
 if(path.startsWith('/api/')||path.startsWith('/assets/')||path.startsWith('/admin')||path.startsWith('/control-center')||path.startsWith('/activate')||path.startsWith('/renewal')||path.startsWith('/reset-password')||path.startsWith('/templates/')||path.startsWith('/demo/'))return path;
 if(path==='#')return '#';
 const out=path.startsWith('/')?window.NR_DEMO_PREFIX+path:path;
 if(window.NR_TRIAL_TOKEN&&window.nrTrialUrl)return window.nrTrialUrl(out);
 return window.NR_CLIENT_SIM&&window.nrClientSimUrl?window.nrClientSimUrl(out):out;
};
window.nrApplyEstateDemoShell=function(){
 const key=String(window.NR_DEMO_THEME||'');
 const cfg=window.NR_ESTATE_CORE&&window.NR_ESTATE_CORE[key];
 if(!cfg)return;
 document.body.dataset.estateDemo=key;
 ['theme-estate-default','theme-estate-green','theme-estate-luxe','theme-estate-minimal','theme-estate-urban'].forEach(c=>document.body.classList.toggle(c,c===cfg.cls));

 document.querySelectorAll('#brandLeft,#brandName,[data-estate-brand]').forEach(el=>el.textContent=cfg.brand);
 document.querySelectorAll('.header a.logo,.header a.brand,header a.logo,header a.brand,a[data-brand-link]').forEach(a=>{a.setAttribute('href',window.nrEstateDemoUrl('/'));a.onclick=null});

 const propertyTypes=[
  ['Căn hộ / Chung cư','Chung cư'],['Nhà riêng','Nhà riêng'],['Nhà trọ / Phòng trọ','Nhà trọ'],['Nhà mặt phố','Nhà phố'],['Biệt thự / Liền kề','Biệt thự'],
  ['Shophouse / Nhà phố thương mại','Shophouse'],['Đất nền / Đất dự án','Đất'],['Đất thổ cư','Đất thổ cư'],['Đất nông nghiệp / Trang trại','Trang trại'],
  ['Văn phòng','Văn phòng'],['Mặt bằng kinh doanh','Mặt bằng kinh doanh'],['Kho / Nhà xưởng','Kho xưởng'],['BĐS công nghiệp','Bất động sản công nghiệp'],
  ['Khách sạn / Resort / Nghỉ dưỡng','Khách sạn / Resort'],['Officetel / Căn hộ dịch vụ','Officetel'],['Bất động sản khác','Khác']
 ];
 const typeMenu='<details class="property-taxonomy-menu"><summary>Loại BĐS</summary><div class="property-taxonomy-dropdown">'+propertyTypes.map(([label,value])=>'<a href="'+window.nrEstateDemoUrl('/bat-dong-san/?property_type='+encodeURIComponent(value))+'">'+label+'</a>').join('')+'</div></details>';
 const navHtml=[['Trang chủ','/'],['Bất động sản','/bat-dong-san/'],['Mua','/mua/'],['Bán','/ban/'],['Cho thuê','/cho-thue/']].map(([label,url])=>'<a href="'+window.nrEstateDemoUrl(url)+'">'+label+'</a>').join('')+typeMenu+'<a href="'+window.nrEstateDemoUrl('/#news')+'">Tin tức</a>';

 document.querySelectorAll('.header nav.nav,#mainNav,#detailNav,#favoritesNav').forEach(nav=>nav.innerHTML=navHtml);

 const admin=window.nrDemoAdminUrl?window.nrDemoAdminUrl(key,'newpost'):'https://batdongsan2027.org.uk/admin?tab=newpost&template='+encodeURIComponent(key);
 document.querySelectorAll('.header-post-btn').forEach(a=>{a.href=admin;a.target='_blank';a.rel='noopener';a.textContent='+ Đăng tin'});
 document.querySelectorAll('.header .actions').forEach(actions=>{
   if(actions.querySelector('[data-nr-estate-core-actions]'))return;
   actions.innerHTML='<span data-nr-estate-core-actions style="display:contents"><a class="btn soft" href="'+window.nrEstateDemoUrl('/favorites')+'">♥ Tin đã lưu</a><a class="btn primary" href="'+admin+'" target="_blank" rel="noopener">+ Đăng tin</a><button id="mobileMenuBtn" class="btn soft mobile-menu">☰</button></span>';
 });

 // Rewrite ALL local links generated later by page-specific JS.
 const fixLinks=()=>{
  document.querySelectorAll('a[href]').forEach(a=>{
   if(a.dataset.demoExternal==='1')return;
   let h=a.getAttribute('href')||'';
   if(!h||h==='#'||h.startsWith(window.NR_DEMO_PREFIX+'/')||h===window.NR_DEMO_PREFIX+'/')return;
   if(h==='#estate-categories'||h==='/#estate-categories'||h==='#categories')h='/#categories';
   if(h==='#estate-news'||h==='/#estate-news'||h==='#news')h='/#news';
   const fixed=window.nrEstateDemoUrl(h);
   if(fixed!==h)a.setAttribute('href',fixed);
  });
 };
 fixLinks();

 // Keep brand/nav/routes stable even after listings/property/favorites JS renders.
 if(!window.__nrEstateShellObserver){
   window.__nrEstateShellObserver=new MutationObserver(()=>{
     fixLinks();
     document.querySelectorAll('#brandLeft,#brandName,[data-estate-brand]').forEach(el=>{if(el.textContent!==cfg.brand)el.textContent=cfg.brand});
   });
   window.__nrEstateShellObserver.observe(document.body,{childList:true,subtree:true});
 }
};
document.addEventListener('DOMContentLoaded',()=>{if(/^mau-[1-5]$/.test(String(window.NR_DEMO_THEME||'')))window.nrApplyEstateDemoShell()});
const __nrQ=new URLSearchParams(location.search);
window.NR_CLIENT_SIM=__nrQ.get('nr_client')==='1';
window.NR_CLIENT_SAMPLES=__nrQ.get('nr_samples')==='1';
window.nrClientSimUrl=function(raw){
 if(!window.NR_CLIENT_SIM||!raw||typeof raw!=='string'||raw==='#'||/^mailto:|^tel:|^javascript:/i.test(raw))return raw;
 try{
   const u=new URL(raw,location.origin);
   if(u.origin!==location.origin)return raw;
   if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/assets/')||u.pathname.startsWith('/admin')||u.pathname.startsWith('/control-center'))return raw;
   u.searchParams.set('nr_client','1');
   u.searchParams.set('nr_samples',window.NR_CLIENT_SAMPLES?'1':'0');
   return u.pathname+u.search+u.hash;
 }catch(e){return raw}
};
const __nrFetch=window.fetch.bind(window);window.fetch=(input,init={})=>{try{
 const raw=typeof input==='string'?input:(input&&input.url)||'';
 if(raw.startsWith('/api/')){
   const h=new Headers(init.headers||{});
   h.set('X-Tenant',window.NR_DEMO_TENANT);
   if(window.NR_TRIAL_TOKEN){
     h.set('X-NR-Trial',window.NR_TRIAL_TOKEN);
   }else if(window.NR_CLIENT_SIM){
     // Client simulation is the customer handover view. Default is always EMPTY.
     h.set('X-NR-Preview-Samples',window.NR_CLIENT_SAMPLES?'1':'0');
     h.set('X-NR-Template-Simulation','1');
     h.set('X-NR-Template-Key',String(window.NR_DEMO_THEME||''));
   }else if(window.NR_DEMO_THEME){
     // Public template demo is a sales showroom: always render the template sample package.
     // Never depend on whatever posts happen to exist in the shared demo tenant DB.
     h.set('X-NR-Template-Demo','1');
     h.set('X-NR-Template-Key',String(window.NR_DEMO_THEME||''));
   }
   return __nrFetch(input,{...init,headers:h})
 }
}catch(e){}return __nrFetch(input,init)};
document.addEventListener('DOMContentLoaded',()=>{if(!/^mau-[1-5]$/.test(String(window.NR_DEMO_THEME||'')))document.querySelectorAll('header a.logo,header a.brand,.header a.logo,.header a.brand,a[data-brand-link]').forEach(a=>{a.setAttribute('href','#');a.addEventListener('click',e=>e.preventDefault())})});
document.addEventListener('DOMContentLoaded',()=>{
 if(!window.NR_CLIENT_SIM)return;
 document.body.classList.add('nr-client-simulation');
 const bar=document.createElement('div');bar.className='nr-client-simbar';
 const mode=window.NR_CLIENT_SAMPLES?'with':'empty';
 bar.innerHTML='<div class="nr-sim-brand"><b>GIẢ LẬP KHÁCH HÀNG</b><span>Preview đúng dữ liệu của template · không ghi vào site khách</span></div>'+
 '<div class="nr-sim-state"><span>Nội dung:</span>'+
 '<button type="button" data-sim-samples="1" class="'+(mode==='with'?'active':'')+'">Có bài mẫu</button>'+
 '<button type="button" data-sim-samples="0" class="'+(mode==='empty'?'active':'')+'">Không bài mẫu</button></div>'+
 '<div class="nr-sim-actions"><button type="button" data-sim-close>Thoát giả lập</button></div>';
 document.body.prepend(bar);
 bar.querySelectorAll('[data-sim-samples]').forEach(btn=>btn.onclick=()=>{
   const u=new URL(location.href);u.searchParams.set('nr_client','1');u.searchParams.set('nr_samples',btn.dataset.simSamples);location.href=u.toString();
 });
 bar.querySelector('[data-sim-close]').onclick=()=>{const u=new URL(location.href);u.searchParams.delete('nr_client');u.searchParams.delete('nr_samples');location.href=u.toString()};
 const keepSim=()=>{
   document.querySelectorAll('a[href]').forEach(a=>{
     if(a.closest('.nr-client-simbar'))return;
     const h=a.getAttribute('href')||'';
     const fixed=window.nrClientSimUrl(h);
     if(fixed!==h)a.setAttribute('href',fixed);
   });
 };
 keepSim();
 if(!window.__nrClientSimObserver){
   window.__nrClientSimObserver=new MutationObserver(keepSim);
   window.__nrClientSimObserver.observe(document.body,{childList:true,subtree:true});
 }
});

document.addEventListener('DOMContentLoaded',()=>{
 if(!window.NR_TRIAL_TOKEN)return;
 const keepTrial=()=>document.querySelectorAll('a[href]').forEach(a=>{if(a.closest('.nr-trial-bar')||a.closest('.nr-trial-expired-modal'))return;const h=a.getAttribute('href')||'';const f=window.nrTrialUrl?window.nrTrialUrl(h):h;if(f!==h)a.setAttribute('href',f)});
 keepTrial();if(!window.__nrTrialObserver){window.__nrTrialObserver=new MutationObserver(keepTrial);window.__nrTrialObserver.observe(document.body,{childList:true,subtree:true})}
});

document.addEventListener('DOMContentLoaded',()=>{
 const btn=document.querySelector('[data-start-trial]');if(!btn||window.NR_TRIAL_TOKEN)return;
 // Legacy in-demo CTA, if a future template still exposes it, follows the same V17.9 activation contract.
 btn.onclick=async()=>{location.href='/templates/'};
});

document.addEventListener('DOMContentLoaded',()=>{
 if(!window.NR_TRIAL_TOKEN)return;
 document.body.classList.add('nr-trial-mode');
 const bar=document.createElement('div');bar.className='nr-trial-bar';
 const trialLabel=(window.NR_DEMO_THEME||'website').replace(/^tin-tuc-/i,'Tin tức Mẫu ').replace(/^mau-/i,'BĐS Mẫu ');
 bar.innerHTML='<div class="nr-trial-info"><span class="nr-trial-badge">DÙNG THỬ MIỄN PHÍ</span><div class="nr-trial-context"><b id="nrTrialTemplateLabel">'+trialLabel+'</b><small>Website thử nghiệm riêng của bạn</small></div></div><div class="nr-trial-time"><small>Còn lại</small><strong id="nrTrialCountdown"><span>--</span><i>:</i><span>--</span><i>:</i><span>--</span></strong></div><div class="nr-trial-actions"><a id="nrTrialAdmin" class="nr-trial-admin" href="#"><span>⚙</span> Trang quản trị</a><button id="nrTrialBuy" class="nr-trial-buy" type="button">Đăng ký sử dụng</button></div>';
 document.body.prepend(bar);
 const statusUrl='/api/trial/status?token='+encodeURIComponent(window.NR_TRIAL_TOKEN)+'&path='+encodeURIComponent(location.pathname);
 let expiryMs=0,expiredShown=false;
 function paintClock(){const el=document.getElementById('nrTrialCountdown');if(!el||!expiryMs)return;const left=Math.max(0,Math.floor((expiryMs-Date.now())/1000));const h=Math.floor(left/3600),mi=Math.floor((left%3600)/60),s=left%60;el.innerHTML='<span>'+String(h).padStart(2,'0')+'</span><i>:</i><span>'+String(mi).padStart(2,'0')+'</span><i>:</i><span>'+String(s).padStart(2,'0')+'</span>';if(left<=0&&!expiredShown){expiredShown=true;showExpired({expired:true})}}
 let trialCommercial={price:0,renewal_price:0,name:''};
 const moneyVN=n=>Number(n||0)>0?new Intl.NumberFormat('vi-VN').format(Number(n))+'đ':'Liên hệ';
 const sync=async()=>{try{const r=await fetch(statusUrl,{cache:'no-store'}),d=await r.json(),tr=d.trial||{},tpl=d.template||{};trialCommercial={price:Number(tpl.price||0),renewal_price:Number(tpl.renewal_price||0),name:tpl.name||''};expiryMs=Date.parse(String(tr.expires_at||'').replace(' ','T')+'Z')||Date.now()+Math.max(0,Number(tr.remaining_seconds||0))*1000;document.getElementById('nrTrialAdmin').href='/admin?tenant='+encodeURIComponent(tr.tenant||window.NR_TRIAL_TENANT)+'&nr_trial='+encodeURIComponent(window.NR_TRIAL_TOKEN)+'&template='+encodeURIComponent(tr.template_key||window.NR_DEMO_THEME);const tl=document.getElementById('nrTrialTemplateLabel');if(tl)tl.textContent=tpl.name||trialLabel;paintClock();if(tr.expired){expiredShown=true;showExpired(tr)}}catch(e){}};
 function showExpired(tr){if(document.querySelector('.nr-trial-expired-modal'))return;document.body.classList.add('nr-trial-expired');const p=trialCommercial.price;const priceLine=p?'<div class="nr-trial-expired-price"><small>GÓI WEBSITE NÀY</small><strong>'+moneyVN(p)+' <em>/ năm đầu</em></strong></div>':'';const x=document.createElement('div');x.className='nr-trial-expired-modal';x.innerHTML='<div class="nr-trial-expired-card"><div class="nr-trial-expired-icon">⌛</div><small>DÙNG THỬ ĐÃ KẾT THÚC</small><h2>Bạn muốn tiếp tục với giao diện này?</h2>'+priceLine+'<p>Đăng ký để tiếp tục sử dụng. <b>Tất cả bài viết bạn đã đăng sẽ được giữ nguyên.</b></p><button data-trial-register>Đăng ký gói website này</button><a href="/templates/">Xem giao diện khác</a></div>';document.body.appendChild(x);x.querySelector('[data-trial-register]').onclick=buy;}
 async function buy(){try{const d=await (await fetch('/api/trial/convert-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:window.NR_TRIAL_TOKEN})})).json();location.href=d.checkout_url||('/trial-checkout/?token='+encodeURIComponent(window.NR_TRIAL_TOKEN))}catch(e){location.href='/trial-checkout/?token='+encodeURIComponent(window.NR_TRIAL_TOKEN)}}
 document.getElementById('nrTrialBuy').onclick=buy;sync();setInterval(paintClock,1000);setInterval(sync,60000);
});
document.addEventListener('DOMContentLoaded',()=>{
 const q=new URLSearchParams(location.search);
 const framed=q.get('nr_frame')==='1';
 if(framed){
   document.body.classList.add('nr-demo-framed');
   return;
 }
 const buttons=[...document.querySelectorAll('[data-demo-device]')];
 let stage=null,frame=null;
 function cleanFrameUrl(){
   const u=new URL(location.href);
   u.searchParams.set('nr_frame','1');
   return u.toString();
 }
 function closeStage(){
   if(stage){stage.remove();stage=null;frame=null}
   document.body.classList.remove('nr-device-open');
 }
 function setMode(mode){
   buttons.forEach(b=>b.classList.toggle('active',b.dataset.demoDevice===mode));
   if(mode==='desktop'){closeStage();try{sessionStorage.setItem('nr_demo_device','desktop')}catch(e){};return}
   closeStage();
   stage=document.createElement('div');stage.className='nr-device-stage nr-device-'+mode;
   const label=document.createElement('div');label.className='nr-device-label';label.textContent=mode==='tablet'?'Máy tính bảng · 820px':'Điện thoại · 390px';
   frame=document.createElement('iframe');frame.className='nr-device-frame';frame.src=cleanFrameUrl();frame.title='Xem trước giao diện '+mode;
   stage.append(label,frame);document.body.appendChild(stage);document.body.classList.add('nr-device-open');
   try{sessionStorage.setItem('nr_demo_device',mode)}catch(e){}
 }
 buttons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.demoDevice)));
 // Always open demo normally on a fresh page/reload.
 // Mobile/Tablet are explicit preview modes only.
 setMode('desktop');
});
</script>`;
 const newsNum=/^tin-tuc-([1-4])$/.exec(demo)?.[1]||'';
 const serviceNum=/^dich-vu-(\d+)$/.exec(demo)?.[1]||'';
 const isGameDemo=demo==='game-1';
 const newsNames={'1':'Tin tức Mẫu 1 · Tạp chí hiện đại','2':'Tin tức Mẫu 2 · Báo điện tử','3':'Tin tức Mẫu 3 · Magazine hiện đại','4':'Tin tức Mẫu 4 · Minimal SEO'};
 const estateNames={'mau-1':'Mẫu 1 · Tin tức & BĐS','mau-2':'Mẫu 2 · BĐS hiện đại','mau-3':'Mẫu 3 · BĐS Luxury','mau-4':'Mẫu 4 · BĐS Minimal','mau-5':'Mẫu 5 · BĐS Urban'};
 const serviceNames={'1':'FPT','2':'VNPT','3':'Viettel','4':'Camera Store'};
 const demoLabel=isGameDemo?'Template website Clash of Clans · Base Portal':(newsNum?newsNames[newsNum]:(serviceNum?(serviceNames[serviceNum]||`Dịch vụ Mẫu ${serviceNum}`):(estateNames[demo]||'Mẫu bất động sản')));
 const isNewsDemo=!!newsNum;
 const isServiceDemo=!!serviceNum;
 // V16.9 — Demo browser title must follow the selected template, never the
 // underlying BĐS tenant used as the shared showroom data source.
 const relativeDemoPath=prefix&&currentPath.startsWith(prefix)?(currentPath.slice(prefix.length)||'/'):currentPath;
 const isDemoArticle=/\.html$/i.test(relativeDemoPath)||/\-p\d+\/?$/i.test(relativeDemoPath);
 if(!isDemoArticle){
   const tabTitle=isGameDemo?'Template website Clash of Clans · Demo | HoangVuongTech':isNewsDemo?`Tin tức Mẫu ${newsNum} · Demo | HoangVuongTech`:isServiceDemo?`Dịch vụ Mẫu ${serviceNum} · Demo | HoangVuongTech`:`BĐS ${demo==='mau-1'?'Mẫu 1':demo==='mau-2'?'Mẫu 2':demo==='mau-3'?'Mẫu 3':demo==='mau-4'?'Mẫu 4':'Mẫu 5'} · Demo | HoangVuongTech`;
   out=out.replace(/<title>[\s\S]*?<\/title>/i,`<title>${tabTitle}</title>`);
 }
 const bar=`<div class="nr-demo-bar"><div class="nr-demo-inner"><b>ĐANG XEM ${isGameDemo?'GAME · CLASH OF CLANS':isNewsDemo?'TIN TỨC · MẪU '+newsNum:isServiceDemo?'DỊCH VỤ · MẪU '+serviceNum:'BẤT ĐỘNG SẢN · '+(demo==='mau-1'?'MẪU 1':demo==='mau-2'?'MẪU 2':demo==='mau-3'?'MẪU 3':demo==='mau-4'?'MẪU 4':'MẪU 5')}</b><span>Chọn giao diện phù hợp với bạn</span><div class="nr-demo-actions"><div class="nr-demo-devices" aria-label="Xem trên thiết bị"><button type="button" class="active" data-demo-device="desktop" title="Xem trên PC">▰ <span>PC</span></button><button type="button" data-demo-device="tablet" title="Xem trên máy tính bảng">▯ <span>Tablet</span></button><button type="button" data-demo-device="mobile" title="Xem trên điện thoại">▯ <span>Mobile</span></button></div><a href="${isGameDemo?'/templates/game/':isNewsDemo?'/templates/tin-tuc/':isServiceDemo?'/templates/dich-vu/':'/templates/bat-dong-san/'}">Kho mẫu</a><a class="nr-demo-cta" data-demo-external="1" href="https://hoangvuongtech.com/?template=${encodeURIComponent(demo)}&name=${encodeURIComponent(demoLabel)}#dang-ky" target="_blank" rel="noopener">Chọn mẫu này</a></div></div></div>`;
 return out.replace('</head>',boot+'</head>').replace(/<body([^>]*)>/i,`<body$1>${bar}`);
}

const TEMPLATE_CATALOG_DEFAULTS=[
 {template_key:'mau-1',name:'Mẫu 1 · Tin tức & BĐS',category:'bat-dong-san',preset:'newsreal',price:1499000,renewal_price:1999000,is_active:1,sort_order:1,image_url:'/assets/demo/mau-1-preview.png',demo_url:'/demo/bat-dong-san/mau-1/',badge:'NHIỀU NỘI DUNG',description:'Phong cách cổng thông tin bất động sản, phù hợp website có nhiều tin tức, chuyên mục và bài đăng.',features:'Trang chủ nhiều chuyên mục\nTin tức + bất động sản\nPhù hợp SEO nội dung',accent:'blue',seo_title:'Template website bất động sản & tin tức – Cổng thông tin SEO',seo_slug:'bat-dong-san-tin-tuc-portal',primary_keyword:'template website bất động sản',secondary_keywords:'mẫu website bất động sản, website tin tức bất động sản, giao diện website nhà đất',meta_description:'Mẫu website bất động sản kết hợp tin tức, nhiều chuyên mục, trang bài chi tiết và cấu trúc nội dung phù hợp xây dựng SEO dài hạn.',internal_anchor:'template website bất động sản'},
 {template_key:'dich-vu-1',name:'FPT',category:'dich-vu',preset:'service_fpt_1',price:1499000,renewal_price:1999000,is_active:1,sort_order:1,image_url:'/assets/demo/dich-vu-1-preview.png',demo_url:'/demo/dich-vu/mau-1/',badge:'FPT',description:'Website dịch vụ FPT với Internet, FPT Play, Camera AI, combo và luồng tư vấn.',features:'Internet FPT\nFPT Play\nCamera AI\nCombo & CTA tư vấn',accent:'orange',seo_title:'Template website FPT – Internet, FPT Play, Camera & Combo',seo_slug:'website-dich-vu-fpt',primary_keyword:'template website FPT',secondary_keywords:'mẫu website internet FPT, website FPT Play, landing page dịch vụ FPT',meta_description:'Template website dịch vụ FPT với Internet, FPT Play, Camera AI, combo và CTA tư vấn rõ ràng, phù hợp đại lý và nhân viên kinh doanh FPT.',internal_anchor:'template website FPT'},
 {template_key:'dich-vu-2',name:'VNPT',category:'dich-vu',preset:'service_vnpt_2',price:1499000,renewal_price:1999000,is_active:1,sort_order:2,image_url:'/assets/demo/dich-vu-2-preview.png',demo_url:'/demo/dich-vu/mau-2/',badge:'VNPT',description:'Website VNPT Home với Home Internet, MyTV, Home Cam và combo gia đình.',features:'Home Internet\nMyTV\nHome Cam\nCombo gia đình',accent:'blue',seo_title:'Template website VNPT – Home Internet, MyTV & Home Cam',seo_slug:'website-dich-vu-vnpt',primary_keyword:'template website VNPT',secondary_keywords:'mẫu website VNPT, website MyTV, landing page Home Internet VNPT',meta_description:'Template website VNPT với Home Internet, MyTV, Home Cam, combo gia đình và CTA tư vấn, phù hợp đại lý và nhân viên kinh doanh VNPT.',internal_anchor:'template website VNPT'},
 {template_key:'dich-vu-3',name:'Viettel',category:'dich-vu',preset:'service_viettel_3',price:1499000,renewal_price:1999000,is_active:1,sort_order:3,image_url:'/assets/demo/dich-vu-3-preview.png',demo_url:'/demo/dich-vu/mau-3/',badge:'VIETTEL',description:'Website Viettel với Internet Wi-Fi 6, TV360, Camera và combo trọn gói.',features:'Internet Viettel\nTV360\nCamera Cloud\nCombo trọn gói',accent:'red',seo_title:'Template website Viettel – Internet, TV360 & Camera',seo_slug:'website-dich-vu-viettel',primary_keyword:'template website Viettel',secondary_keywords:'mẫu website Viettel, website TV360, landing page internet Viettel',meta_description:'Template website Viettel với Internet Wi-Fi, TV360, Camera Cloud, combo và CTA đăng ký, phù hợp đại lý và nhân viên kinh doanh Viettel.',internal_anchor:'template website Viettel'},
 {template_key:'dich-vu-4',name:'Camera Store',category:'dich-vu',preset:'service_camera_store_4',price:1499000,renewal_price:1999000,is_active:1,sort_order:4,image_url:'/assets/demo/dich-vu-4-preview.png',demo_url:'/demo/dich-vu/mau-4/',badge:'CAMERA',description:'Website trưng bày và tư vấn camera đa thương hiệu với sản phẩm, giá, thông số, khuyến mãi và form lead.',features:'Camera trong nhà\nCamera ngoài trời\nCamera AI quay quét\nCamera IP / bộ giám sát',accent:'green',seo_title:'Template website bán Camera – Catalog sản phẩm & tư vấn',seo_slug:'website-camera',primary_keyword:'template website camera',secondary_keywords:'mẫu website camera, website bán camera, catalog camera an ninh',meta_description:'Template website camera đa thương hiệu với catalog sản phẩm, giá, thông số, khuyến mãi, trang chi tiết và form tư vấn khách hàng.',internal_anchor:'template website camera'},
 {template_key:'game-1',name:'Template website Clash of Clans · Base Portal',category:'game',preset:'game_clash_1',price:1699000,renewal_price:2199000,is_active:1,sort_order:1,image_url:'/assets/demo/game-clash-1-preview.png',demo_url:'/demo/game/clash-of-clans/',badge:'CLASH OF CLANS',description:'Mẫu website game chia sẻ base Clash of Clans cho cộng đồng với TH/BH/CH, bộ lọc nhanh và trang chi tiết base.',features:'Town Hall TH2–TH18\nBuilder Hall BH2–BH10\nClan Capital CH1–CH10\nFast Filter + Copy Link',accent:'orange',seo_title:'Template website Clash of Clans – Chia sẻ base TH/BH/CH',seo_slug:'clash-of-clans-base',primary_keyword:'template website Clash of Clans',secondary_keywords:'mẫu website game, website chia sẻ base Clash of Clans, template game Clash of Clans',meta_description:'Template website Clash of Clans chuyên chia sẻ base Town Hall, Builder Hall và Clan Capital với bộ lọc nhanh, copy link và trang chi tiết tối ưu SEO.',internal_anchor:'template website Clash of Clans'},
 {template_key:'tin-tuc-1',name:'Tin tức Mẫu 1 · Tạp chí hiện đại',category:'tin-tuc',preset:'news_portal_1',price:1499000,renewal_price:1999000,is_active:1,sort_order:1,image_url:'/assets/demo/tin-tuc-1-preview-v2.png',demo_url:'/demo/tin-tuc/mau-1/',badge:'MỚI',description:'Giao diện tin tức hiện đại, tập trung bài nổi bật, dòng tin mới, chuyên mục và nội dung đọc nhiều.',features:'Trang chủ kiểu tạp chí\nTin nổi bật + đọc nhiều\nChuyên mục tự động theo bài viết\nTối ưu nội dung & mobile',accent:'red',seo_title:'Template website tin tức hiện đại – Tạp chí & cổng nội dung',seo_slug:'tin-tuc-tap-chi-hien-dai',primary_keyword:'template website tin tức',secondary_keywords:'mẫu website tin tức, giao diện báo điện tử, template tạp chí online',meta_description:'Template website tin tức hiện đại với bài nổi bật, tin mới, chuyên mục và nội dung đọc nhiều; phù hợp báo điện tử, tạp chí và site nội dung.',internal_anchor:'template website tin tức'},
 {template_key:'mau-2',name:'Mẫu 2 · BĐS hiện đại',category:'bat-dong-san',preset:'estate_green',price:1799000,renewal_price:2299000,is_active:1,sort_order:2,image_url:'/assets/demo/mau-2-preview.png',demo_url:'/demo/bat-dong-san/mau-2/',badge:'ĐỀ XUẤT',description:'Phong cách portal bất động sản hiện đại, hero tìm kiếm lớn và tập trung mạnh vào chuyển đổi khách hàng.',features:'Bộ lọc tìm kiếm nổi bật\nCard bất động sản hiện đại\nTối ưu trải nghiệm mobile',accent:'green',seo_title:'Template website bất động sản hiện đại – Tìm kiếm & chuyển đổi',seo_slug:'bat-dong-san-hien-dai',primary_keyword:'mẫu website bất động sản hiện đại',secondary_keywords:'template nhà đất, website môi giới bất động sản, giao diện website bất động sản',meta_description:'Template bất động sản hiện đại với hero tìm kiếm, card dự án và bố cục tối ưu trải nghiệm mobile, phù hợp môi giới và doanh nghiệp nhà đất.',internal_anchor:'mẫu website bất động sản hiện đại'}
];
function moneyVN(v){return Number(v||0).toLocaleString('vi-VN')+'đ'}
async function ensureMarketCatalog(env){
 try{
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS template_catalog(
    template_key TEXT PRIMARY KEY,name TEXT NOT NULL,category TEXT NOT NULL DEFAULT 'bat-dong-san',
    preset TEXT NOT NULL DEFAULT '',price INTEGER NOT NULL DEFAULT 0,renewal_price INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,sort_order INTEGER NOT NULL DEFAULT 0,image_url TEXT NOT NULL DEFAULT '',
    demo_url TEXT NOT NULL DEFAULT '',badge TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',
    features TEXT NOT NULL DEFAULT '',accent TEXT NOT NULL DEFAULT 'blue',seo_title TEXT NOT NULL DEFAULT '',seo_slug TEXT NOT NULL DEFAULT '',primary_keyword TEXT NOT NULL DEFAULT '',secondary_keywords TEXT NOT NULL DEFAULT '',meta_description TEXT NOT NULL DEFAULT '',internal_anchor TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  const alters=[
   `ALTER TABLE template_catalog ADD COLUMN image_url TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN demo_url TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN badge TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN features TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN accent TEXT NOT NULL DEFAULT 'blue'`,
   `ALTER TABLE template_catalog ADD COLUMN seo_title TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN seo_slug TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN primary_keyword TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN secondary_keywords TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN meta_description TEXT NOT NULL DEFAULT ''`,
   `ALTER TABLE template_catalog ADD COLUMN internal_anchor TEXT NOT NULL DEFAULT ''`
  ];
  for(const q of alters){try{await env.DB.prepare(q).run()}catch(e){}}
  for(const d of TEMPLATE_CATALOG_DEFAULTS){
   await env.DB.prepare(`INSERT OR IGNORE INTO template_catalog(template_key,name,category,preset,price,renewal_price,is_active,sort_order,image_url,demo_url,badge,description,features,accent)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(d.template_key,d.name,d.category,d.preset,d.price,d.renewal_price,1,d.sort_order,d.image_url,d.demo_url,d.badge,d.description,d.features,d.accent).run();
   await env.DB.prepare(`UPDATE template_catalog SET
    image_url=CASE WHEN coalesce(image_url,'')='' THEN ? ELSE image_url END,
    demo_url=CASE WHEN coalesce(demo_url,'')='' THEN ? ELSE demo_url END,
    badge=CASE WHEN coalesce(badge,'')='' THEN ? ELSE badge END,
    description=CASE WHEN coalesce(description,'')='' THEN ? ELSE description END,
    features=CASE WHEN coalesce(features,'')='' THEN ? ELSE features END,
    accent=CASE WHEN coalesce(accent,'')='' THEN ? ELSE accent END
    WHERE template_key=?`).bind(d.image_url,d.demo_url,d.badge,d.description,d.features,d.accent,d.template_key).run();
  }
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website bất động sản & tin tức – Cổng thông tin SEO',seo_slug='bat-dong-san-tin-tuc-portal',primary_keyword='template website bất động sản',secondary_keywords='mẫu website bất động sản, website tin tức bất động sản, giao diện website nhà đất',meta_description='Mẫu website bất động sản kết hợp tin tức, nhiều chuyên mục, trang bài chi tiết và cấu trúc nội dung phù hợp xây dựng SEO dài hạn.',internal_anchor='template website bất động sản' WHERE template_key='mau-1'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website bất động sản hiện đại – Tìm kiếm & chuyển đổi',seo_slug='bat-dong-san-hien-dai',primary_keyword='mẫu website bất động sản hiện đại',secondary_keywords='template nhà đất, website môi giới bất động sản, giao diện website bất động sản',meta_description='Template bất động sản hiện đại với hero tìm kiếm, card dự án và bố cục tối ưu trải nghiệm mobile, phù hợp môi giới và doanh nghiệp nhà đất.',internal_anchor='mẫu website bất động sản hiện đại' WHERE template_key='mau-2'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website bất động sản cao cấp – Luxury Real Estate',seo_slug='bat-dong-san-luxury',primary_keyword='template website bất động sản cao cấp',secondary_keywords='mẫu website luxury, website biệt thự cao cấp, giao diện bất động sản sang trọng',meta_description='Mẫu website bất động sản cao cấp phong cách luxury editorial, hình ảnh lớn và bố cục sang trọng cho biệt thự, dự án và môi giới cao cấp.',internal_anchor='template bất động sản cao cấp' WHERE template_key='mau-3'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website bất động sản tối giản – Nhanh, dễ xem, chuẩn SEO',seo_slug='bat-dong-san-minimal-seo',primary_keyword='template website bất động sản tối giản',secondary_keywords='mẫu website nhà đất tối giản, website bất động sản nhanh, giao diện bất động sản SEO',meta_description='Template bất động sản tối giản, tải nhanh, tập trung ảnh, giá và thông tin quan trọng; phù hợp website nhà đất cần trải nghiệm rõ ràng và SEO.',internal_anchor='template bất động sản tối giản' WHERE template_key='mau-4'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website bất động sản Urban – Mua bán & cho thuê',seo_slug='bat-dong-san-urban',primary_keyword='template website bất động sản mua bán cho thuê',secondary_keywords='mẫu website nhà đất urban, website mua bán nhà đất, website cho thuê bất động sản',meta_description='Mẫu website bất động sản Urban với khám phá khu vực, mua bán, cho thuê và CTA chuyển đổi rõ ràng cho môi giới và sàn nhà đất.',internal_anchor='template website mua bán nhà đất' WHERE template_key='mau-5'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website tin tức hiện đại – Tạp chí & cổng nội dung',seo_slug='tin-tuc-tap-chi-hien-dai',primary_keyword='template website tin tức',secondary_keywords='mẫu website tin tức, giao diện báo điện tử, template tạp chí online',meta_description='Template website tin tức hiện đại với bài nổi bật, tin mới, chuyên mục và nội dung đọc nhiều; phù hợp báo điện tử, tạp chí và site nội dung.',internal_anchor='template website tin tức' WHERE template_key='tin-tuc-1'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template báo điện tử – Website tin tức mật độ cao',seo_slug='bao-dien-tu',primary_keyword='template báo điện tử',secondary_keywords='mẫu báo điện tử, website tin tổng hợp, giao diện website tin tức',meta_description='Mẫu báo điện tử với headline lớn, danh sách cập nhật liên tục, chuyên mục và khu đọc nhiều, phù hợp website tin tổng hợp có mật độ nội dung cao.',internal_anchor='template báo điện tử' WHERE template_key='tin-tuc-2'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website tạp chí – Magazine hiện đại nhiều hình ảnh',seo_slug='tin-tuc-magazine',primary_keyword='template website tạp chí',secondary_keywords='mẫu magazine online, website lifestyle, template tin công nghệ',meta_description='Template tạp chí online với hero mosaic, Editor Pick, Trending và card hình ảnh hiện đại, phù hợp lifestyle, công nghệ và nội dung chuyên ngành.',internal_anchor='template website tạp chí' WHERE template_key='tin-tuc-3'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website tin tức chuẩn SEO – Minimal, nhẹ và nhanh',seo_slug='tin-tuc-minimal-seo',primary_keyword='template website tin tức chuẩn SEO',secondary_keywords='mẫu blog SEO, website tin tức nhẹ, template nội dung tốc độ cao',meta_description='Template tin tức tối giản ưu tiên tốc độ, typography dễ đọc và mật độ nội dung tốt, phù hợp blog chuyên ngành và chiến lược SEO nội dung.',internal_anchor='template tin tức chuẩn SEO' WHERE template_key='tin-tuc-4'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website FPT – Internet, FPT Play, Camera & Combo',seo_slug='website-dich-vu-fpt',primary_keyword='template website FPT',secondary_keywords='mẫu website internet FPT, website FPT Play, landing page dịch vụ FPT',meta_description='Template website dịch vụ FPT với Internet, FPT Play, Camera AI, combo và CTA tư vấn rõ ràng, phù hợp đại lý và nhân viên kinh doanh FPT.',internal_anchor='template website FPT' WHERE template_key='dich-vu-1'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website VNPT – Home Internet, MyTV & Home Cam',seo_slug='website-dich-vu-vnpt',primary_keyword='template website VNPT',secondary_keywords='mẫu website VNPT, website MyTV, landing page Home Internet VNPT',meta_description='Template website VNPT với Home Internet, MyTV, Home Cam, combo gia đình và CTA tư vấn, phù hợp đại lý và nhân viên kinh doanh VNPT.',internal_anchor='template website VNPT' WHERE template_key='dich-vu-2'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website Viettel – Internet, TV360 & Camera',seo_slug='website-dich-vu-viettel',primary_keyword='template website Viettel',secondary_keywords='mẫu website Viettel, website TV360, landing page internet Viettel',meta_description='Template website Viettel với Internet Wi-Fi, TV360, Camera Cloud, combo và CTA đăng ký, phù hợp đại lý và nhân viên kinh doanh Viettel.',internal_anchor='template website Viettel' WHERE template_key='dich-vu-3'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website bán Camera – Catalog sản phẩm & tư vấn',seo_slug='website-camera',primary_keyword='template website camera',secondary_keywords='mẫu website camera, website bán camera, catalog camera an ninh',meta_description='Template website camera đa thương hiệu với catalog sản phẩm, giá, thông số, khuyến mãi, trang chi tiết và form tư vấn khách hàng.',internal_anchor='template website camera' WHERE template_key='dich-vu-4'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET seo_title='Template website Clash of Clans – Chia sẻ base TH/BH/CH',seo_slug='clash-of-clans-base',primary_keyword='template website Clash of Clans',secondary_keywords='mẫu website game, website chia sẻ base Clash of Clans, template game Clash of Clans',meta_description='Template website Clash of Clans chuyên chia sẻ base Town Hall, Builder Hall và Clan Capital với bộ lọc nhanh, copy link và trang chi tiết tối ưu SEO.',internal_anchor='template website Clash of Clans' WHERE template_key='game-1'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET image_url='/assets/demo/game-clash-1-preview.png',updated_at=CURRENT_TIMESTAMP WHERE template_key='game-1'`).run()}catch(e){}
  const serviceRefresh=[['dich-vu-1','FPT','/assets/demo/dich-vu-1-preview.png'],['dich-vu-2','VNPT','/assets/demo/dich-vu-2-preview.png'],['dich-vu-3','Viettel','/assets/demo/dich-vu-3-preview.png'],['dich-vu-4','Camera Store','/assets/demo/dich-vu-4-preview.png']];
  for(const [k,n,img] of serviceRefresh){try{await env.DB.prepare(`UPDATE template_catalog SET name=?,image_url=?,updated_at=CURRENT_TIMESTAMP WHERE template_key=?`).bind(n,img,k).run()}catch(e){}}
 }catch(e){}
}
async function ensureNewsPreviewAsset(env){
 try{await env.DB.prepare(`UPDATE template_catalog SET image_url='/assets/demo/tin-tuc-1-preview-v2.png',demo_url='/demo/tin-tuc/mau-1/',updated_at=CURRENT_TIMESTAMP WHERE template_key='tin-tuc-1'`).run()}catch(e){}
}
async function loadTemplateCatalog(env,category=''){
 try{
  await ensureMarketCatalog(env);
  if(!category){
   const {results}=await env.DB.prepare(`SELECT template_key,name,category,preset,price,renewal_price,is_active,sort_order,
    image_url,demo_url,badge,description,features,accent,seo_title,seo_slug,primary_keyword,secondary_keywords,meta_description,internal_anchor FROM template_catalog
    WHERE is_active=1 ORDER BY category,sort_order,template_key`).all();
   return results||[];
  }
  const {results}=await env.DB.prepare(`SELECT template_key,name,category,preset,price,renewal_price,is_active,sort_order,
   image_url,demo_url,badge,description,features,accent,seo_title,seo_slug,primary_keyword,secondary_keywords,meta_description,internal_anchor FROM template_catalog
   WHERE category=? AND is_active=1 ORDER BY sort_order,template_key`).bind(category).all();
  return results||[];
 }catch(e){return category?TEMPLATE_CATALOG_DEFAULTS.filter(x=>x.category===category):TEMPLATE_CATALOG_DEFAULTS.filter(x=>x.is_active!==0)}
}
const CATEGORY_NAMES={
 'bat-dong-san':'Bất động sản','tin-tuc':'Tin tức','ban-hang':'Bán hàng','landing-page':'Landing Page','dich-vu':'Dịch vụ','game':'Game'
};
function marketCategoryFromPath(path){
 const m=String(path||'').match(/^\/templates\/([^/]+)/);
 return m?m[1]:'';
}
function templateSeoDetailHtml(t){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=String(t?.template_key||''),slug=String(t?.seo_slug||'').trim(),url=`https://hoangvuongtech.com/templates/${esc(t?.category||'game')}/${esc(slug)}/`,demo=t?.demo_url||'',title=t?.seo_title||t?.name||'Template website',desc=t?.meta_description||t?.description||'',keywords=[t?.primary_keyword,...String(t?.secondary_keywords||'').split(',')].map(x=>String(x||'').trim()).filter(Boolean);
 const features=String(t?.features||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
 return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | HoangVuongTech</title><meta name="description" content="${esc(desc)}"><meta name="keywords" content="${esc(keywords.join(', '))}"><link rel="canonical" href="${url}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="product"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://hoangvuongtech.com${esc(t?.image_url||'/assets/demo/game-clash-1-preview.png')}"><link rel="stylesheet" href="/assets/style.css?v=20.9.13"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product','name':title,'description':desc,'category':'Website Template','brand':{'@type':'Brand','name':'HoangVuongTech'},'url':url,'offers':{'@type':'Offer','priceCurrency':'VND','price':String(Number(t?.price||0)),'availability':'https://schema.org/InStock'}})}</script></head><body class="template-seo-detail"><header class="demo-showroom-header"><div class="demo-showroom-nav"><a class="demo-brand" href="/templates/"><b>HOANGVUONGTECH · TEMPLATES</b></a><div><a href="/templates/${esc(t?.category||'game')}/">Kho ${esc(CATEGORY_NAMES[t?.category]||'template')}</a><a class="demo-contact-btn" href="/#dang-ky">Tư vấn</a></div></div></header><main class="template-detail-wrap"><nav class="template-detail-crumb"><a href="/templates/">Kho giao diện</a> / <a href="/templates/${esc(t?.category||'game')}/">${esc(CATEGORY_NAMES[t?.category]||'Game')}</a> / ${esc(t?.name||title)}</nav><section class="template-detail-hero"><div><span>${esc(t?.badge||'TEMPLATE')}</span><h1>${esc(title)}</h1><p>${esc(desc)}</p><div class="market-keywords">${keywords.slice(0,4).map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="template-detail-actions">${demo?`<a class="primary" href="${esc(demo)}" target="_blank" rel="noopener">Xem demo trực tiếp</a>`:''}<a href="/?template=${encodeURIComponent(key)}&name=${encodeURIComponent(t?.name||key)}#dang-ky">Đăng ký mẫu này</a></div></div><img src="${esc(t?.image_url||'/assets/demo/game-clash-1-preview.png')}" alt="${esc(title)}"></section><section class="template-detail-grid"><article><h2>Giao diện được thiết kế cho đúng nhu cầu</h2><p>Template này tuân thủ Universal Layout Contract của HoangVuongTech: showroom có dữ liệu mẫu đầy đủ, còn trial/client giữ nguyên cấu trúc 1:1 và chỉ thay đổi payload nội dung.</p><div class="template-detail-features">${features.map(x=>`<span>✓ ${esc(x)}</span>`).join('')}</div><h2>SEO & cấu trúc nội dung</h2><p>Từ khóa chính: <b>${esc(t?.primary_keyword||'')}</b>. Cấu trúc category, archive, bài chi tiết và internal link được đồng bộ với Trang quản trị để hỗ trợ SEO dài hạn.</p></article><aside><small>GÓI WEBSITE TRỌN GÓI</small><strong>${moneyVN(Number(t?.renewal_price||t?.price||0))} / năm</strong><span>Đã gồm tên miền, hosting, giao diện và công cụ quản trị đăng bài.</span><hr><b>🎟 Voucher khách mới: giảm ${moneyVN(Math.max(0,Number(t?.renewal_price||0)-Number(t?.price||0))||500000)}</b></aside></section></main></body></html>`;
}
function demoCenterHtml(siteName,templates=[],category=''){
 const isRoot=!category;
 const catName=isRoot?'Tất cả giao diện':(CATEGORY_NAMES[category]||category);
 const categorySeo=category==='game'?{title:'Template website game – Clash of Clans & Game Portal',desc:'Kho template website game chuyên nghiệp. Xem mẫu website Clash of Clans, website chia sẻ base TH/BH/CH, bộ lọc nhanh và giao diện game tối ưu SEO.'}:category==='dich-vu'?{title:'Template website dịch vụ – Internet, Camera, Viễn thông',desc:'Kho template website dịch vụ chuyên nghiệp cho FPT, VNPT, Viettel, camera và các mô hình tư vấn dịch vụ.'}:category==='tin-tuc'?{title:'Template website tin tức – Báo điện tử, tạp chí & blog SEO',desc:'Kho template website tin tức, báo điện tử và tạp chí online với bố cục chuyên mục rõ ràng, tốc độ tốt và cấu trúc phù hợp SEO nội dung.'}:category==='bat-dong-san'?{title:'Template website bất động sản – Nhà đất, môi giới & dự án',desc:'Kho template website bất động sản chuyên nghiệp cho môi giới, sàn nhà đất và dự án với giao diện responsive, tìm kiếm và cấu trúc SEO.'}:null;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cards=templates.map((t,idx)=>{
   const key=String(t.template_key||'');
   const demo=t.demo_url||'';
   const image=t.image_url||'/assets/demo/mau-1-preview.png';
   const accent=['blue','green','orange','purple','red'].includes(t.accent)?t.accent:'blue';
   const choose=`/?template=${encodeURIComponent(key)}&name=${encodeURIComponent(t.name||key)}#dang-ky`;
   const first=Number(t.price||0), renewal=Number(t.renewal_price||0);
   const saving=renewal>first&&first>0?renewal-first:0;
   return `<article class="demo-pro-card ${accent}">
    <div class="demo-pro-shot">
     <img src="${esc(image)}" alt="${esc(t.name)}">
     ${t.badge?`<span class="demo-pro-badge">${esc(t.badge)}</span>`:''}<span class="demo-pro-number">${String(idx+1).padStart(2,'0')}</span>
     ${demo?`<div class="demo-pro-hover"><a href="${esc(demo)}" target="_blank" rel="noopener">Xem demo trực tiếp</a></div>`:''}
    </div>
    <div class="demo-pro-body commercial-card">
     <div class="demo-pro-title-row"><h2>${t.seo_slug?`<a class="market-title-link" href="/templates/${esc(t.category)}/${esc(t.seo_slug)}/">${esc(t.seo_title||t.name)}</a>`:esc(t.seo_title||t.name)}</h2><span>Website trọn gói</span></div>${t.description?`<p class="market-seo-desc">${esc(t.description)}</p>`:''}${t.primary_keyword?`<div class="market-keywords"><span>${esc(t.primary_keyword)}</span>${String(t.secondary_keywords||'').split(',').slice(0,2).map(x=>`<span>${esc(x.trim())}</span>`).join('')}</div>`:''}

     <div class="commercial-pricing commercial-pricing-simple" data-market-price data-list-price="${renewal}" data-voucher-price="${first}">
       <div class="commercial-price-main">
         <small>GIÁ WEBSITE TRỌN GÓI</small>
         <div class="commercial-price-line"><del data-market-list hidden>${renewal>0?moneyVN(renewal):''}</del><strong data-market-current>${renewal>0?moneyVN(renewal):first>0?moneyVN(first):'Liên hệ'}</strong><b>/ năm</b></div>
         <em data-market-voucher-status>Giá niêm yết hằng năm</em>
       </div>
     </div>

     <div class="commercial-gift-box">
       <div class="commercial-gift-title"><b>🎁 TẶNG KÈM TRỌN GÓI</b><span>Đã bao gồm</span></div>
       <div class="commercial-includes">
        <span><i>✓</i><b>Tên miền riêng miễn phí</b></span>
        <span><i>✓</i><b>Hosting miễn phí</b></span>
        <span><i>✓</i><b>Giao diện Website đã chọn</b></span>
        <span><i>✓</i><b>Công cụ quản trị đăng bài</b></span>
       </div>
       <button type="button" class="commercial-voucher" data-market-voucher>🎟 ÁP DỤNG NGAY VOUCHER GIẢM 500K</button>
       <small class="commercial-voucher-note">Áp dụng 1 lần cho khách hàng đăng ký mới.</small>
     </div>

     <div class="commercial-note">Không phải chỉ mua file template — đây là gói website hoàn chỉnh để đưa vào sử dụng.</div>

     <div class="demo-pro-actions">
       ${demo?`<a class="demo-view" href="${esc(demo)}" target="_blank" rel="noopener">Xem giao diện</a>`:`<span class="demo-view disabled">Demo đang cập nhật</span>`}
       <a class="demo-choose" href="${choose}" target="_blank" rel="noopener">Chọn mẫu này</a>
       <button type="button" class="demo-trial-start" data-trial-template="${esc(key)}" data-trial-name="${esc(t.name||key)}">Dùng thử miễn phí 1 ngày</button>
     </div>
    </div>
   </article>`;
 }).join('');
 const counts=templates.reduce((m,t)=>(m[t.category]=(m[t.category]||0)+1,m),{});
 const categoryLinks=Object.entries(CATEGORY_NAMES).map(([k,n])=>k===category
  ?`<a class="active" href="/templates/${k}/">${n} <b>${counts[k]||templates.length}</b></a>`
  :`<a href="/templates/${k}/">${n}${isRoot&&counts[k]?` <b>${counts[k]}</b>`:''}</a>`).join('');
 return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>${categorySeo?esc(categorySeo.title):(isRoot?'Kho giao diện website':esc(catName)+' - Kho giao diện website')} | HoangVuongTech</title>
 <meta name="description" content="${categorySeo?esc(categorySeo.desc):(isRoot?'Kho giao diện website HoangVuongTech: chọn nhóm giao diện rồi xem demo, giá năm đầu và chi phí gia hạn.':'Kho giao diện website '+esc(catName)+' trọn gói. Xem demo, giá năm đầu, chi phí gia hạn và chọn mẫu trực tiếp.')}">
 <link rel="canonical" href="https://hoangvuongtech.com/templates/${isRoot?'':esc(category)+'/'}">
 <meta property="og:title" content="${isRoot?'Kho giao diện website':esc(catName)+' - Kho giao diện'} | HoangVuongTech">
 <meta property="og:description" content="Xem demo và chi phí trọn gói của từng mẫu website.">
 <meta property="og:url" content="https://hoangvuongtech.com/templates/${isRoot?'':esc(category)+'/'}">
 <link rel="stylesheet" href="/assets/style.css?v=20.9.13">  <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="theme-color" content="#ffffff">
</head>
 <body class="demo-center-page demo-showroom-v2 template-marketplace">
  <header class="demo-showroom-header"><div class="demo-showroom-nav">
   <a class="demo-brand" href="/templates/"><span>⌂</span><b>HOANGVUONGTECH · TEMPLATES</b></a>
   <div><a href="/">Trang chính</a><a class="demo-contact-btn" href="/#dang-ky" target="_blank" rel="noopener">Tư vấn chọn mẫu</a></div>
  </div></header>
  <main class="demo-center">
   <section class="demo-center-head">
    <span class="demo-eyebrow">HOANGVUONGTECH · WEBSITE TRỌN GÓI</span>
    <h1>Chọn giao diện, xem rõ chi phí trước khi đăng ký</h1>
    <p>Mỗi mẫu hiển thị một mức giá theo năm, các hạng mục đã bao gồm và voucher dành cho khách đăng ký mới. Bạn có thể mở demo trong tab mới trước khi lựa chọn.</p>
    <nav class="template-categories">${categoryLinks}</nav>
    <div class="demo-mini-trust"><span>✓ Tên miền riêng</span><span>✓ Hosting miễn phí</span><span>✓ Quản trị dễ dùng</span><span>✓ Hỗ trợ bàn giao</span></div>
   </section>
   <section class="market-section-head"><div><span>${isRoot?'KHO GIAO DIỆN':'GIAO DIỆN '+esc(catName.toUpperCase())}</span><h2>${isRoot?'Chọn nhóm giao diện để bắt đầu':templates.length+' gói đang mở bán'}</h2></div><p>${isRoot?'Bạn có thể xem tất cả mẫu bên dưới hoặc chọn một nhóm để lọc đúng nhu cầu.':'Giá và quyền lợi được đồng bộ trực tiếp từ Master Control.'}</p></section>
   <section class="demo-pro-grid">${cards||`<div class="market-empty"><h3>Chưa có mẫu đang bán</h3><p>Danh mục này sẽ được cập nhật trong thời gian tới.</p></div>`}</section>
   <section class="demo-compare"><div><span>CẦN TƯ VẤN?</span><h3>Chưa biết mẫu nào phù hợp? Gửi nhu cầu, bên mình sẽ hỗ trợ chọn.</h3></div><a href="/#dang-ky" target="_blank" rel="noopener">Gửi yêu cầu tư vấn →</a></section>
   <script>
   (()=>{
     const escHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
     function closeTrial(){document.querySelector('.market-trial-modal')?.remove();document.body.classList.remove('market-trial-open')}
     function trialSiteSuggestion(key,name){
       key=String(key||'').toLowerCase();name=String(name||'').toLowerCase();
       if(key==='game-1'||key.startsWith('game-'))return 'Ví dụ: Clash Base Việt Nam';
       if(key==='dich-vu-1'||name.includes('fpt'))return 'Ví dụ: Internet FPT Hải Phòng';
       if(key==='dich-vu-2'||name.includes('vnpt'))return 'Ví dụ: Internet VNPT Hải Phòng';
       if(key==='dich-vu-3'||name.includes('viettel'))return 'Ví dụ: Internet Viettel Hải Phòng';
       if(key==='dich-vu-4'||name.includes('camera'))return 'Ví dụ: Camera An Ninh Hải Phòng';
       if(key.startsWith('tin-tuc-'))return 'Ví dụ: Tin Việt 24h';
       if(key.startsWith('mau-')||name.includes('bất động sản'))return 'Ví dụ: Bất động sản Hoàng Gia';
       return 'Ví dụ: Website Thương Hiệu Việt';
     }
     function openTrial(btn){
       const key=String(btn.dataset.trialTemplate||''),name=String(btn.dataset.trialName||key);
       if(!key)return;
       const siteSuggestion=trialSiteSuggestion(key,name);
       closeTrial();
       const modal=document.createElement('div');modal.className='market-trial-modal';
       modal.innerHTML='<div class="market-trial-card" role="dialog" aria-modal="true" aria-labelledby="marketTrialTitle">'+
        '<button type="button" class="market-trial-close" aria-label="Đóng">×</button>'+
        '<div class="market-trial-badge">DÙNG THỬ WEBSITE THỰC TẾ</div>'+
        '<h2 id="marketTrialTitle">Dùng thử miễn phí 1 ngày</h2>'+
        '<p class="market-trial-template">Giao diện: <b>'+escHtml(name)+'</b></p>'+
        '<p>Bạn được dùng website và Trang quản trị trong 24 giờ: đăng, sửa, xóa bài và trải nghiệm các tính năng như một khách hàng thật.</p>'+
        '<form class="market-trial-form">'+
          '<label>Họ tên<input name="name" autocomplete="name" required></label>'+
          '<label>Số điện thoại<input name="phone" inputmode="tel" autocomplete="tel" required></label>'+
          '<label>Email<input name="email" type="email" autocomplete="email" required></label>'+
          '<label>Zalo<input name="zalo" inputmode="tel" placeholder="Không bắt buộc"></label>'+
          '<label class="full">Tên website mong muốn *<input name="site_name" autocomplete="organization" required placeholder="'+escHtml(siteSuggestion)+'"><small class="market-trial-site-help">Gợi ý được điều chỉnh theo loại website đang xem. Bạn có thể nhập tên thương hiệu hoặc khu vực kinh doanh thực tế.</small></label>'+
          '<label>Công ty / thương hiệu<input name="company" autocomplete="organization"></label>'+
          '<label class="full">Nhu cầu / ghi chú<textarea name="note" rows="2" placeholder="Bạn muốn thử website cho nhu cầu nào?"></textarea></label>'+
          '<input class="market-trial-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="full market-trial-consent"><input name="contact_consent" type="checkbox" value="1"> <span>Tôi đồng ý để HoangVuongTech liên hệ hỗ trợ và tư vấn về website sau thời gian dùng thử.</span></label>'+
          '<div class="market-trial-msg full" aria-live="polite"></div>'+
          '<button class="market-trial-submit full" type="submit">Bắt đầu dùng thử miễn phí</button>'+
        '</form>'+
        '<div class="market-trial-foot">Không cần thanh toán · Thời hạn 24 giờ · Dữ liệu dùng thử tách riêng</div>'+
       '</div>';
       document.body.appendChild(modal);document.body.classList.add('market-trial-open');
       modal.querySelector('.market-trial-close').onclick=closeTrial;
       modal.addEventListener('click',e=>{if(e.target===modal)closeTrial()});
       const form=modal.querySelector('form');form.querySelector('input[name="name"]')?.focus();
       form.onsubmit=async e=>{
         e.preventDefault();
         const fd=new FormData(form),msg=modal.querySelector('.market-trial-msg'),submit=modal.querySelector('.market-trial-submit');
         submit.disabled=true;msg.className='market-trial-msg full';msg.textContent='Đang tạo website dùng thử…';
         try{
           const rr=await fetch('/api/trial/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
             template_key:key,name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email'),zalo:fd.get('zalo'),site_name:fd.get('site_name'),company:fd.get('company'),note:fd.get('note'),website:fd.get('website'),marketing_opt_in:fd.get('contact_consent')==='1',source_url:location.href
           })});
           const d=await rr.json().catch(()=>({}));
           if(!rr.ok){
             if(rr.status===409&&d.activation_url){
               msg.className='market-trial-msg full info';msg.innerHTML=escHtml(d.error||'Bạn đã đăng ký dùng thử giao diện này.')+' <a href="'+escHtml(d.activation_url)+'">Tiếp tục kích hoạt →</a>';submit.disabled=false;return;
             }
             if(rr.status===409&&d.trial_url){
               msg.className='market-trial-msg full info';msg.innerHTML=escHtml(d.error||'Bạn đã có website dùng thử gần đây.')+' <a href="'+escHtml(d.trial_url)+'">Mở lại website dùng thử →</a>';submit.disabled=false;return;
             }
             throw new Error(d.error||'Không tạo được website dùng thử');
           }
           modal.querySelector('.market-trial-card').innerHTML='<div class="market-trial-success">'+
             '<div class="market-trial-success-icon">✓</div><div class="market-trial-badge">SẴN SÀNG KÍCH HOẠT</div><h2>Hoàn tất kích hoạt website dùng thử</h2>'+ 
             '<p>Hãy xác nhận email và tự tạo mật khẩu Trang quản trị. <b>24 giờ dùng thử chỉ bắt đầu sau khi kích hoạt.</b></p>'+ 
             '<div class="market-trial-success-actions one"><a class="primary" href="'+escHtml(d.activation_url||'#')+'">Kích hoạt website dùng thử →</a></div>'+ 
             '<button type="button" class="market-trial-done">Đóng</button></div>';
           modal.querySelector('.market-trial-done').onclick=closeTrial;
         }catch(err){msg.className='market-trial-msg full error';msg.textContent=err.message||'Có lỗi xảy ra';submit.disabled=false}
       };
     }
     document.addEventListener('click',e=>{
       const voucher=e.target.closest('[data-market-voucher]');
       if(voucher){e.preventDefault();const card=voucher.closest('.commercial-card'),box=card?.querySelector('[data-market-price]');if(!box)return;const list=Number(box.dataset.listPrice||0),price=Number(box.dataset.voucherPrice||0)||Math.max(0,list-500000),fmt=n=>new Intl.NumberFormat('vi-VN').format(n)+'đ',del=box.querySelector('[data-market-list]'),cur=box.querySelector('[data-market-current]'),st=box.querySelector('[data-market-voucher-status]');if(del){del.hidden=false;del.textContent=fmt(list)}if(cur)cur.textContent=fmt(price);if(st)st.textContent='✓ Đã áp dụng voucher thành công';voucher.textContent='✓ ĐÃ ÁP DỤNG VOUCHER GIẢM 500K';voucher.disabled=true;card?.classList.add('voucher-applied');return;}
       const b=e.target.closest('.demo-trial-start');if(!b)return;e.preventDefault();openTrial(b)
     });
     document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTrial()});
   })();
   </script>
  </main>
 </body></html>`;
}

export async function onRequest(context){
 const {request,env}=context;if(request.method!=='GET'&&request.method!=='HEAD')return context.next();
 const u=new URL(request.url),rawPath=u.pathname.replace(/\/+$/,'')||'/';
 const demo=demoThemeFromPath(rawPath);
 let path=stripDemoPath(rawPath,demo);
 const host=u.hostname.replace(/^www\./,'').toLowerCase();
 const marketHost=isTemplateMarketHost(host);
 const trialLaunch=TRIAL_LAUNCH_HOSTS.has(host)?rawPath.match(/^\/trial\/([a-zA-Z0-9]+)(?:\/(admin))?\/?$/):null;
 if(trialLaunch){
   try{
     const tr=await env.DB.prepare(`SELECT wt.*,s.domain,tc.demo_url,tc.template_key FROM website_trials wt JOIN sites s ON s.id=wt.site_id LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.trial_token=? LIMIT 1`).bind(trialLaunch[1]).first();
     if(!tr)return htmlResponse('<h1>Trial không tồn tại</h1>',404);
     if(tr.status==='pending_activation')return htmlResponse('<main style="font-family:Arial,sans-serif;max-width:680px;margin:80px auto;padding:28px"><h1>Website dùng thử chưa được kích hoạt</h1><p>Hãy quay lại liên kết kích hoạt đã nhận để xác nhận email và tạo mật khẩu Trang quản trị. Thời gian 24 giờ chỉ bắt đầu sau khi kích hoạt.</p></main>',409);
     const expired=Date.parse(String(tr.expires_at).replace(' ','T')+'Z')<=Date.now()||tr.status==='expired';
     const publicOrigin='https://hoangvuongtech.com';
     if(trialLaunch[2]==='admin')return Response.redirect(publicOrigin+`/admin?tenant=${encodeURIComponent(tr.domain)}&nr_trial=${encodeURIComponent(tr.trial_token)}&template=${encodeURIComponent(tr.template_key)}`,302);
     const base=String(tr.demo_url||'/');return Response.redirect(publicOrigin+base+(base.includes('?')?'&':'?')+'nr_trial='+encodeURIComponent(tr.trial_token),302);
   }catch(e){return htmlResponse('<h1>Không thể mở website dùng thử</h1>',500)}
 }

 // ONE namespace for every BĐS demo. Old /demo/mau-N/... can never render directly.
 const legacyEstateMatch=rawPath.match(/^\/demo\/(mau-[1-5])(?:\/(.*))?$/i);
 if(marketHost&&legacyEstateMatch){
   const key=legacyEstateMatch[1].toLowerCase();
   const tail=String(legacyEstateMatch[2]||'').replace(/^\/+|\/+$/g,'');
   const canonical='/demo/bat-dong-san/'+key+'/'+(tail?tail+'/':'');
   return Response.redirect(u.origin+canonical+u.search,301);
 }

 if(marketHost && rawPath==='/robots.txt'){
   return new Response(`User-agent: *
Allow: /
Disallow: /control-center/
Disallow: /admin/
Disallow: /activate/
Disallow: /renewal/
Disallow: /demo/
Sitemap: https://hoangvuongtech.com/sitemap.xml
`,{headers:{'Content-Type':'text/plain; charset=UTF-8','Cache-Control':'public, max-age=3600'}});
 }
 if(marketHost && rawPath==='/sitemap.xml'){
   const now=new Date().toISOString().slice(0,10);
   const urls=[
    ['https://hoangvuongtech.com/','1.0'],
    ['https://hoangvuongtech.com/templates/','0.9'],
    ['https://hoangvuongtech.com/templates/bat-dong-san/','0.85'],
    ['https://hoangvuongtech.com/templates/tin-tuc/','0.85'],
    ['https://hoangvuongtech.com/templates/dich-vu/','0.85'],
    ['https://hoangvuongtech.com/templates/game/','0.85'],
    ['https://hoangvuongtech.com/templates/game/clash-of-clans-base/','0.90']
   ];
   const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(([loc,p])=>`<url><loc>${loc}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${p}</priority></url>`).join('')}</urlset>`;
   return new Response(xml,{headers:{'Content-Type':'application/xml; charset=UTF-8','Cache-Control':'public, max-age=3600'}});
 }

 if(!marketHost && (rawPath==='/templates'||rawPath.startsWith('/templates/')||rawPath==='/demo'||rawPath.startsWith('/demo/'))){
   let target=rawPath;
   if(rawPath==='/demo')target='/templates/bat-dong-san/';
   else if(/^\/demo\/mau-[1-5](?:\/|$)/.test(rawPath)){
     const legacy=rawPath.match(/^\/demo\/(mau-[1-5])/i)?.[1]||'mau-1';
     target=`/demo/bat-dong-san/${legacy}/`;
   }
   return Response.redirect('https://hoangvuongtech.com'+target+u.search,301);
 }

 if(marketHost && (rawPath==='/demo/tin-tuc-1'||rawPath.startsWith('/demo/tin-tuc-1/'))){
   const oldSlug=rawPath.replace(/^\/demo\/tin-tuc-1\/?/,'').replace(/^\/+|\/+$/g,'');
   const target=oldSlug?`/demo/tin-tuc/mau-1/${oldSlug}`:'/demo/tin-tuc/mau-1/';
   return Response.redirect('https://hoangvuongtech.com'+target,301);
 }
 if(marketHost && demo==='legacy-center'){
   return Response.redirect('https://hoangvuongtech.com/templates/',302);
 }
 if(marketHost && demo==='marketplace'){
   if(/^\/templates\/game\/clash-of-clans-base\/?$/i.test(rawPath)){const all=await loadTemplateCatalog(env,'game');const t=all.find(x=>x.template_key==='game-1');if(t)return htmlNoCache(templateSeoDetailHtml(t));}
   // V20.0.1: render both /templates and /templates/ directly. Do NOT redirect
   // between slash/no-slash because Cloudflare Pages may normalize the other
   // direction and create ERR_TOO_MANY_REDIRECTS.
   const category=marketCategoryFromPath(rawPath);
   if(category && !CATEGORY_NAMES[category])return Response.redirect('https://hoangvuongtech.com/templates/',302);
   const catalog=await loadTemplateCatalog(env,category);return htmlNoCache(demoCenterHtml('HoangVuongTech',catalog,category));
 }

 if(marketHost && rawPath==='/'){
   const r=await env.ASSETS.fetch(new URL('/marketing.html',u.origin));
   let body=await r.text();
   const seo=`<title>Thiết kế Website Bất Động Sản Trọn Gói | HoangVuongTech</title>
<meta name="description" content="HoangVuongTech cung cấp website bất động sản trọn gói cho môi giới, văn phòng nhà đất và doanh nghiệp nhỏ. Có tên miền, hosting, quản trị dễ dùng và giao diện chuyên nghiệp.">
<link rel="canonical" href="https://hoangvuongtech.com/">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="HoangVuongTech">
<meta property="og:title" content="Website Bất Động Sản Trọn Gói | HoangVuongTech">
<meta property="og:description" content="Website riêng cho môi giới và doanh nghiệp bất động sản: tên miền, hosting, giao diện, quản trị và hỗ trợ bàn giao.">
<meta property="og:url" content="https://hoangvuongtech.com/">
<meta property="og:image" content="https://hoangvuongtech.com/assets/marketing-demo.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Website Bất Động Sản Trọn Gói | HoangVuongTech">
<meta name="twitter:description" content="Website riêng cho môi giới và doanh nghiệp bất động sản, quản trị dễ dùng, tên miền và hosting trọn gói.">
<meta name="twitter:image" content="https://hoangvuongtech.com/assets/marketing-demo.webp">
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://hoangvuongtech.com/#organization","name":"HoangVuongTech","url":"https://hoangvuongtech.com/","email":"hoangquocvuong.hp89@gmail.com","telephone":"+84389986287"},{"@type":"WebSite","@id":"https://hoangvuongtech.com/#website","url":"https://hoangvuongtech.com/","name":"HoangVuongTech","publisher":{"@id":"https://hoangvuongtech.com/#organization"}},{"@type":"Service","name":"Website bất động sản trọn gói","provider":{"@id":"https://hoangvuongtech.com/#organization"},"areaServed":"VN","url":"https://hoangvuongtech.com/templates/bat-dong-san/"}]})}</script>`;
   body=body.replace(/<title>.*?<\/title>/is,'').replace('</head>',seo+'</head>');
   return new Response(body,{status:200,headers:{'Content-Type':'text/html; charset=UTF-8','Cache-Control':'public, max-age=300'}});
 }

 if(path.startsWith('/api')||path.startsWith('/assets')||path.startsWith('/admin')||path.startsWith('/control-center')||path.startsWith('/activate')||path.startsWith('/renewal'))return context.next();

 let site,trialCtx=null;
 const trialToken=String(u.searchParams.get('nr_trial')||'');
 if(marketHost&&trialToken&&(/^mau-[1-5]$/.test(demo)||/^tin-tuc-[1-4]$/.test(demo)||/^dich-vu-\d+$/.test(demo)||demo==='game-1')){
   try{trialCtx=await env.DB.prepare(`SELECT wt.*,s.domain,s.name,s.preset,s.template_key FROM website_trials wt JOIN sites s ON s.id=wt.site_id WHERE wt.trial_token=? LIMIT 1`).bind(trialToken).first()}catch(e){}
   if(trialCtx&&trialCtx.status!=='pending_activation'){
     const expired=Date.parse(String(trialCtx.expires_at).replace(' ','T')+'Z')<=Date.now()||trialCtx.status==='expired';
     if(expired)trialCtx.status='expired';
     site=await env.DB.prepare(`SELECT * FROM sites WHERE id=? AND status='active'`).bind(trialCtx.site_id).first();
   }
 }
 if(!site && marketHost && (/^mau-[1-5]$/.test(demo)||/^tin-tuc-[1-4]$/.test(demo)||/^dich-vu-\d+$/.test(demo)||demo==='game-1')){
   // Every marketplace demo uses the same isolated demo tenant unless nr_trial selects a real trial tenant.
   const demoReq=new Request('https://batdongsan2027.org.uk'+path+u.search,request);
   site=await siteFor(env,demoReq);
 }else if(!site){
   site=await siteFor(env,request);
 }
 if(!site)return context.next();
 const origin=u.origin,siteName=String(site.name||'Bất động sản').replace(/\s*Demo\s*$/i,'').trim();
 if(/^tin-tuc-[1-4]$/.test(demo) && /^\/[^/]+\.html$/i.test(path)){
   const n=demo.split('-').pop(),slug=path.slice(1,-5);
   const niceTitle=slug.split('-').filter(Boolean).map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(' ');
   const canonical=`${origin}/demo/tin-tuc/mau-${n}/${slug}.html`;
   const preview=n==='1'?'/assets/demo/tin-tuc-1-preview-v2.png':`/assets/demo/tin-tuc-${n}-preview.png`;
   let html=inject(INDEX_HTML,metaTags({
     title:`${niceTitle} | Tin tức Mẫu ${n}`,
     description:`Bài viết demo ${niceTitle} trên giao diện Tin tức Mẫu ${n} của HoangVuongTech.`,
     image:preview,url:canonical,type:'article'
   }));
   html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
   return htmlNoCache(demoInject(html,demo,trialCtx));
 }
 if((demo==='game-1'||site.preset==='game_clash_1') && (path==='/about'||path==='/terms')){
   const isTerms=path==='/terms';
   const title=isTerms?'Điều khoản sử dụng | COC Base Portal':'Thông tin | COC Base Portal';
   const description=isTerms?'Điều khoản sử dụng của COC Base Portal.':'Thông tin về COC Base Portal và thư viện base Clash of Clans cộng đồng.';
   let html=inject(INDEX_HTML,metaTags({title,description,image:'/assets/demo/game-clash-1-preview.png',url:demo?origin+rawPath:origin+path,type:'website'}));
   if(demo)html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
   return htmlNoCache(demo?demoInject(html,demo,trialCtx):themedHtml(html,'game_clash_1'));
 }
 if((demo==='game-1'||site.preset==='game_clash_1') && (path==='/bases'||path==='/free-bases'||path==='/premium-bases'||/^\/base\/[^/]+\.html$/i.test(path))){
   const article=/^\/base\/[^/]+\.html$/i.test(path);
   const slug=article?path.split('/').pop().replace(/\.html$/i,''):'';
   const nice=slug?slug.split('-').filter(Boolean).map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(' '):'';
   const title=article?`${nice} | Clash of Clans Base`:'Clash of Clans Base Layouts | Community Base Portal';
   const desc=article?`Chi tiết ${nice}: ảnh base, vote, view, download và copy link.`:'Clash of Clans community bases cho Town Hall, Builder Hall và Clan Capital với bộ lọc nhanh không tải lại toàn trang.';
   let html=inject(INDEX_HTML,metaTags({title,description:desc,image:'/assets/demo/game-clash-1-preview.png',url:demo?origin+rawPath:origin+path,type:article?'article':'website'}));
   if(demo)html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
   return htmlNoCache(demo?demoInject(html,demo,trialCtx):themedHtml(html,site.preset));
 }
 if(path==='/'){
   const hero=await env.DB.prepare(`SELECT * FROM posts WHERE site_id=? AND status='published' AND image<>'' ORDER BY featured DESC,id DESC LIMIT 1`).bind(site.id).first();
   const title=`${siteName} - Bất động sản & tin tức thị trường`,desc=`${siteName} - tin đăng bất động sản, nhà đất bán, cho thuê và thông tin thị trường mới nhất.`;
   {const html=inject(INDEX_HTML,metaTags({title,description:desc,image:hero?.image||'',url:demo&&demo!=='marketplace'&&demo!=='legacy-center'?origin+demoPrefixForPath(rawPath,demo)+'/':origin+'/'}));
    return demo?htmlNoCache(demoInject(html,demo,trialCtx)):htmlResponse(themedHtml(html,site.preset));
   }
 }
 if(path==='/favorites'){
   const title=`Tin đã lưu - ${siteName}`;
   const desc=`Danh sách bất động sản đã lưu trên trình duyệt của bạn tại ${siteName}.`;
   let html=inject(FAVORITES_HTML,metaTags({title,description:desc,image:'',url:origin+(demo?demoPrefixForPath(rawPath,demo):'')+'/favorites'}));
   // favorites is personal/browser-specific and must never be indexed.
   html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
   return htmlNoCache(demo?demoInject(html,demo,trialCtx):themedHtml(html,site.preset));
 }
 if(path==='/property'&&u.searchParams.get('id')){
   const p=await env.DB.prepare(`SELECT * FROM posts WHERE id=? AND site_id=? AND status='published'`).bind(+u.searchParams.get('id'),site.id).first();if(p){const dest=postUrl(origin,p).slice(origin.length);return Response.redirect(origin+(demo?demoPrefixForPath(rawPath,demo):'')+dest,301);}
 }
 if(path==='/listings'){
   const tx=u.searchParams.get('transaction')||'';u.searchParams.delete('transaction');const base=tx==='rent'?'/cho-thue/':tx==='buy'?'/mua/':tx==='sale'?'/ban/':'/bat-dong-san/';const qs=u.searchParams.toString();return Response.redirect(origin+(demo?demoPrefixForPath(rawPath,demo):'')+base+(qs?'?'+qs:''),301);
 }
 const m=path.match(/^\/(mua|ban|mua-ban|cho-thue|bat-dong-san|tin-tuc)\/([^/]+)-p(\d+)$/i);
 if(m){
   let p=await env.DB.prepare(`SELECT * FROM posts WHERE id=? AND site_id=? AND status='published'`).bind(+m[3],site.id).first();
   // V16.9 — Estate showroom uses virtual blueprint IDs (910000+). They are not
   // persisted in D1, so the demo detail route must still serve the property shell;
   // property.js resolves the virtual article from the demo /api/site package.
   if(!p && demo && /^mau-[1-5]$/.test(demo) && Number(m[3])>=910000){
     p={id:+m[3],title:String(m[2]||'Bất động sản demo').replace(/-/g,' '),type:'property',image:'',content:'',transaction:m[1].toLowerCase()==='cho-thue'?'rent':m[1].toLowerCase()==='mua'?'buy':'sale'};
   }
   if(!p)return htmlResponse('<h1>404 - Không tìm thấy bài viết</h1>',404);
   const canonical=postUrl(origin,p);if(!demo&&origin+path!==canonical)return Response.redirect(canonical,301);
   const loc=[p.district,p.province].filter(Boolean).join(', '),detail=[p.price,p.area,loc].filter(Boolean).join(' · ');
   const desc=(detail?detail+'. ':'')+(stripHtml(p.content).slice(0,150)||`Thông tin ${p.title} trên ${siteName}.`);
   {const html=inject(PROPERTY_HTML,metaTags({title:`${p.title} | ${siteName}`,description:desc,image:p.image||'',url:demo?origin+rawPath:canonical,type:'article'}));return htmlResponse(demo?demoInject(html,demo,trialCtx):themedHtml(html,site.preset));}
 }
 if(path==='/mua-ban'){const qs=u.searchParams.toString();return Response.redirect(origin+(demo?demoPrefixForPath(rawPath,demo):'')+'/ban/'+(qs?'?'+qs:''),301);}
 if(['/mua','/ban','/cho-thue','/bat-dong-san'].includes(path)){
   const tx=path==='/mua'?'buy':path==='/ban'?'sale':path==='/cho-thue'?'rent':'',label=tx==='buy'?'Bất động sản cần mua':tx==='sale'?'Nhà đất bán':tx==='rent'?'Bất động sản cho thuê':'Bất động sản';
   let hero;if(tx)hero=await env.DB.prepare(`SELECT image FROM posts WHERE site_id=? AND status='published' AND type='property' AND "transaction"=? AND image<>'' ORDER BY featured DESC,id DESC LIMIT 1`).bind(site.id,tx).first();else hero=await env.DB.prepare(`SELECT image FROM posts WHERE site_id=? AND status='published' AND type='property' AND image<>'' ORDER BY featured DESC,id DESC LIMIT 1`).bind(site.id).first();
   {const html=inject(LISTINGS_HTML,metaTags({title:`${label} | ${siteName}`,description:`${label} mới nhất trên ${siteName}. Tìm kiếm theo loại bất động sản, tỉnh thành, quận huyện và nhu cầu.`,image:hero?.image||'',url:demo?origin+rawPath+'/':origin+path+'/'}));return htmlResponse(demo?demoInject(html,demo,trialCtx):themedHtml(html,site.preset));}
 }
 return context.next();
}
