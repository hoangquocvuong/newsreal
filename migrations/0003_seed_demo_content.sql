-- NewsReal V7.4 demo content
-- Chạy 1 lần trên D1 hiện tại. Mặc định chèn vào website có id nhỏ nhất (site đầu tiên).
-- Các câu INSERT có kiểm tra listing_code nên chạy lại cũng không tạo trùng.
PRAGMA foreign_keys = ON;

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Căn hộ 2 phòng ngủ view hồ tại Vinhomes Ocean Park','Bán căn hộ chung cư','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=82','4,25 tỷ','72 m²','Khu đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội','0903 668 899','Căn hộ 2 phòng ngủ thiết kế hiện đại, ban công rộng, view thoáng về hồ trung tâm. Diện tích 72 m², phòng khách liên thông bếp, 2 WC, nhiều ánh sáng tự nhiên.

Tiện ích: bể bơi, công viên, trường học, siêu thị, khu thể thao và bãi đỗ xe. Phù hợp gia đình trẻ hoặc đầu tư cho thuê.

Pháp lý rõ ràng, sổ hồng lâu dài. Nội thất bàn giao đầy đủ, có thể vào ở ngay.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'sale','Chung cư','59 triệu/m²',2,2,1,'Đông Nam','Sổ hồng lâu dài','Full nội thất','Hà Nội','Gia Lâm','Đa Tốn','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=82','Nguyễn Minh Anh',1,1,'DEMO-CH-001','',126
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-CH-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Bán căn hộ 3 phòng ngủ trung tâm Cầu Giấy, nội thất đẹp','Bán căn hộ chung cư','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=82','6,8 tỷ','108 m²','Đường Trần Thái Tông, Cầu Giấy, Hà Nội','0988 123 456','Căn hộ 3 phòng ngủ tại khu vực trung tâm Cầu Giấy, diện tích sử dụng 108 m². Phòng khách rộng, bếp riêng, ban công thoáng, các phòng ngủ đều có cửa sổ.

Khu dân cư văn minh, gần trường học, văn phòng, trung tâm thương mại và tuyến metro. Chủ nhà để lại phần lớn nội thất cao cấp.

Sổ hồng chính chủ, hỗ trợ xem nhà linh hoạt.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'sale','Chung cư','63 triệu/m²',3,2,1,'Nam','Sổ hồng','Nội thất cao cấp','Hà Nội','Cầu Giấy','Dịch Vọng','https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=82','Trần Quốc Huy',0,1,'DEMO-CH-002','',88
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-CH-002');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Nhà phố 5 tầng mặt phố Lê Chân, Hải Phòng, kinh doanh tốt','Bán nhà đất','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82','9,6 tỷ','86 m²','Lê Chân, Hải Phòng','0389 986 2876','Nhà phố 5 tầng nằm trên tuyến đường kinh doanh sầm uất tại quận Lê Chân. Mặt tiền 5,2 m, diện tích 86 m², thiết kế phù hợp vừa ở vừa kinh doanh.

Công năng gồm phòng khách, bếp, 5 phòng ngủ, 5 WC, phòng thờ và sân phơi. Khu vực đông dân, giao thông thuận tiện.

Sổ đỏ chính chủ, pháp lý rõ ràng, có thể giao dịch ngay.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'sale','Nhà phố','112 triệu/m²',5,5,5,'Đông Bắc','Sổ đỏ','Cơ bản','Hải Phòng','Lê Chân','Dư Hàng','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=82','Vương Hoàng',1,1,'DEMO-NP-001','5,2 m',204
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-NP-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Biệt thự song lập khu đô thị Vinhomes Riverside, hoàn thiện đẹp','Bán nhà đất','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=82','29 tỷ','180 m²','Long Biên, Hà Nội','0912 555 888','Biệt thự song lập 3 tầng, diện tích đất 180 m², không gian xanh bao quanh. Thiết kế 4 phòng ngủ, phòng sinh hoạt chung và khu bếp rộng.

Vị trí gần công viên, hồ điều hòa và hệ thống trường học quốc tế. Nội thất hoàn thiện đồng bộ, phù hợp gia đình ở lâu dài.

Pháp lý sổ đỏ lâu dài, chủ nhà thiện chí giao dịch.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'sale','Biệt thự','161 triệu/m²',4,5,3,'Tây Bắc','Sổ đỏ lâu dài','Full nội thất','Hà Nội','Long Biên','Phúc Lợi','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=82','Phạm Thu Trang',1,1,'DEMO-BT-001','10 m',173
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-BT-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Cho thuê căn hộ 2 phòng ngủ Masteri Waterfront, đầy đủ nội thất','Cho thuê nhà','https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=82','17 triệu/tháng','68 m²','Ocean Park, Gia Lâm, Hà Nội','0966 222 399','Cho thuê căn hộ 2 phòng ngủ, diện tích 68 m², full nội thất. Căn hộ sạch đẹp, ban công thoáng, có máy giặt, tủ lạnh, điều hòa và giường tủ đầy đủ.

Tòa nhà có lễ tân, an ninh 24/7, bể bơi và phòng gym. Phù hợp gia đình hoặc chuyên gia thuê dài hạn.

Giá thuê 17 triệu/tháng, ưu tiên hợp đồng từ 12 tháng.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'rent','Chung cư','250 nghìn/m²/tháng',2,2,1,'Đông','Hợp đồng chính chủ','Full nội thất','Hà Nội','Gia Lâm','Đa Tốn','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=82','Lê Hải Yến',1,1,'DEMO-RENT-001','',95
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-RENT-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Cho thuê nhà nguyên căn 4 tầng quận 7, phù hợp văn phòng','Cho thuê nhà','https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=82','32 triệu/tháng','96 m²','Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh','0938 555 119','Nhà nguyên căn 4 tầng, mặt tiền rộng 6 m, khu vực thuận tiện mở văn phòng hoặc trung tâm đào tạo. Diện tích 96 m², đường ô tô đỗ cửa.

Không gian gồm tầng trệt rộng, 5 phòng, 5 WC, sân thượng. Khu vực an ninh, gần nhiều tiện ích.

Giá thuê 32 triệu/tháng, có thương lượng cho khách thuê lâu dài.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'rent','Nhà phố','333 nghìn/m²/tháng',5,5,4,'Nam','Hợp đồng thuê','Cơ bản','TP. Hồ Chí Minh','Quận 7','Tân Phong','https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=82','Đỗ Thanh Tùng',0,1,'DEMO-RENT-002','6 m',61
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-RENT-002');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Kho xưởng 1.200 m² tại An Dương, xe container ra vào thuận tiện','Kho xưởng & mặt bằng','https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=82','78 triệu/tháng','1.200 m²','KCN An Dương, Hải Phòng','0904 818 686','Kho xưởng diện tích 1.200 m², nền bê tông chịu lực, trần cao, hệ thống điện 3 pha. Sân bãi rộng, container 40 feet ra vào thuận tiện.

Vị trí gần trục giao thông chính và cảng Hải Phòng. Phù hợp kho logistics, sản xuất nhẹ hoặc trung chuyển hàng hóa.

Hợp đồng thuê minh bạch, có thể bàn giao nhanh.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'rent','Kho xưởng','65 nghìn/m²/tháng',0,2,1,'Tây','Hợp đồng thuê rõ ràng','Hệ thống điện 3 pha','Hải Phòng','An Dương','Lê Thiện','https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=82','Nguyễn Văn Nam',1,1,'DEMO-KX-001','30 m',142
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-KX-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Mặt bằng kinh doanh góc 2 mặt tiền trung tâm Đà Nẵng','Kho xưởng & mặt bằng','https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82','65 triệu/tháng','220 m²','Hải Châu, Đà Nẵng','0905 991 228','Mặt bằng góc 2 mặt tiền, tổng diện tích sử dụng 220 m², phù hợp showroom, nhà hàng, văn phòng giao dịch hoặc cửa hàng thương hiệu.

Khu vực trung tâm Hải Châu, lưu lượng người qua lại cao, dễ nhận diện thương hiệu. Có khu để xe và hệ thống điện nước riêng.

Chủ nhà hỗ trợ thời gian setup.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'rent','Mặt bằng','295 nghìn/m²/tháng',0,2,2,'Đông Nam','Hợp đồng thuê','Mặt bằng trống','Đà Nẵng','Hải Châu','Hải Châu 1','https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82','Hoàng Đức Long',0,1,'DEMO-MB-001','12 m',77
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-MB-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Đất nền 100 m² khu đô thị Bắc Sông Cấm, vị trí đẹp','Đất nền & đất dự án','https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=82','3,9 tỷ','100 m²','Thủy Nguyên, Hải Phòng','0915 771 338','Lô đất nền 100 m² tại khu đô thị Bắc Sông Cấm, mặt tiền 5 m, đường nội khu rộng. Khu vực đang phát triển mạnh, hạ tầng đồng bộ.

Phù hợp xây nhà ở hoặc đầu tư trung hạn. Gần trung tâm hành chính mới và các tuyến giao thông lớn.

Sổ đỏ riêng, sang tên nhanh.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'sale','Đất','39 triệu/m²',0,0,0,'Nam','Sổ đỏ','','Hải Phòng','Thủy Nguyên','Tân Dương','https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82','Bùi Mạnh Cường',1,1,'DEMO-DAT-001','5 m',154
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-DAT-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Đất biệt thự 200 m² ven sông Hội An, Quảng Nam','Đất nền & đất dự án','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82','7,5 tỷ','200 m²','Cẩm Hà, Hội An, Quảng Nam','0977 334 556','Lô đất 200 m² phù hợp xây biệt thự nghỉ dưỡng, nằm gần sông và khu phố cổ Hội An. Không gian yên tĩnh, đường vào thuận tiện.

Mặt tiền 10 m, khu dân cư hiện hữu. Thích hợp xây villa hoặc khai thác lưu trú.

Sổ đỏ riêng, thông tin quy hoạch rõ ràng.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'sale','Đất','37,5 triệu/m²',0,0,0,'Đông','Sổ đỏ','','Quảng Nam','Hội An','Cẩm Hà','https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=82','Đặng Hoàng Sơn',0,1,'DEMO-DAT-002','10 m',69
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-DAT-002');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Shophouse 5 tầng khu đô thị mới, trục đường thương mại sầm uất','Bán nhà đất','https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82','18,5 tỷ','105 m²','Hạ Long, Quảng Ninh','0911 202 668','Shophouse 5 tầng trên trục thương mại chính, mặt tiền 7 m. Tầng 1-2 phù hợp kinh doanh, các tầng trên có thể làm văn phòng hoặc lưu trú.

Khu vực đông khách du lịch, kết nối thuận tiện với trung tâm Bãi Cháy. Có chỗ đỗ xe và vỉa hè rộng.

Sổ đỏ chính chủ, hỗ trợ vay ngân hàng.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'sale','Shophouse','176 triệu/m²',4,6,5,'Đông Nam','Sổ đỏ','Hoàn thiện cơ bản','Quảng Ninh','Hạ Long','Bãi Cháy','https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=82','Vũ Đức Hải',1,1,'DEMO-SH-001','7 m',111
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-SH-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'property','Nhà vườn 160 m² tại Đà Lạt, không gian xanh, đường ô tô','Bán nhà đất','https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=82','8,2 tỷ','160 m²','Phường 10, Đà Lạt, Lâm Đồng','0932 667 099','Nhà vườn 2 tầng, diện tích đất 160 m², có sân vườn và khoảng xanh xung quanh. Đường ô tô tiếp cận thuận tiện.

Thiết kế 4 phòng ngủ, phòng khách rộng, bếp mở và ban công. Khí hậu mát mẻ, phù hợp ở nghỉ dưỡng hoặc khai thác homestay.

Pháp lý sổ riêng, hiện trạng sử dụng ổn định.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'sale','Nhà phố','51 triệu/m²',4,3,2,'Tây Nam','Sổ riêng','Nội thất gỗ','Lâm Đồng','Đà Lạt','Phường 10','https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=82,https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=82','Nguyễn Thảo Vy',0,1,'DEMO-NV-001','8 m',84
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-NV-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'news','Thị trường căn hộ 2026: người mua ưu tiên pháp lý và tiện ích thật','Thị trường','https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82','','','','','Thị trường căn hộ đang chuyển từ tâm lý mua theo kỳ vọng sang đánh giá kỹ hơn về pháp lý, tiến độ và chất lượng tiện ích thực tế.

Người mua ở thực quan tâm nhiều tới khả năng kết nối giao thông, trường học, chi phí vận hành và uy tín của đơn vị quản lý. Với nhà đầu tư, tỷ suất cho thuê và thanh khoản thứ cấp trở thành tiêu chí quan trọng hơn các chương trình ưu đãi ngắn hạn.

Khi lựa chọn dự án, người mua nên kiểm tra hồ sơ pháp lý, tiến độ xây dựng và tham khảo mức giá giao dịch thực tế trong cùng khu vực.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'','','',NULL,NULL,NULL,'','','','Hà Nội','','','https://images.unsplash.com/photo-1565402170291-8491f14678db?auto=format&fit=crop&w=1200&q=82','Ban biên tập',1,1,'DEMO-NEWS-001','',231
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-NEWS-001');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'news','5 bước kiểm tra pháp lý trước khi đặt cọc mua nhà đất','Kiến thức','https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82','','','','','Trước khi đặt cọc, người mua nên kiểm tra giấy chứng nhận quyền sử dụng đất, đối chiếu thông tin chủ sở hữu và xác minh tình trạng thế chấp.

Tiếp theo là kiểm tra quy hoạch, hiện trạng sử dụng, lối đi và các hạn chế giao dịch nếu có. Hợp đồng đặt cọc cần nêu rõ số tiền, thời hạn, trách nhiệm của các bên và điều kiện hoàn trả.

Với tài sản giá trị lớn, nên thực hiện giao dịch qua ngân hàng và sử dụng tư vấn pháp lý khi cần thiết.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'','','',NULL,NULL,NULL,'','','','','','','https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=82','Ban biên tập',0,1,'DEMO-NEWS-002','',187
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-NEWS-002');

INSERT INTO posts (site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views)
SELECT (SELECT id FROM sites ORDER BY id LIMIT 1),'news','Kinh nghiệm định giá nhà phố: 4 yếu tố quyết định mức giá thực tế','Kinh nghiệm','https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=82','','','','','Giá nhà phố không chỉ phụ thuộc diện tích. Vị trí, chiều rộng mặt tiền, chất lượng đường tiếp cận và khả năng khai thác kinh doanh có thể tạo chênh lệch lớn giữa hai tài sản gần nhau.

Người bán nên so sánh các giao dịch thực tế trong bán kính gần, điều chỉnh theo tình trạng pháp lý và chất lượng công trình. Người mua cần tách giá trị đất và giá trị nhà để đánh giá hợp lý hơn.

Một mức giá chào bán cao không đồng nghĩa với giá giao dịch cuối cùng, vì vậy dữ liệu so sánh và khả năng thương lượng vẫn rất quan trọng.','published',(SELECT id FROM users WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND role='admin' ORDER BY id LIMIT 1),'','','',NULL,NULL,NULL,'','','','','','','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=82','Ban biên tập',0,1,'DEMO-NEWS-003','',145
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE site_id=(SELECT id FROM sites ORDER BY id LIMIT 1) AND listing_code='DEMO-NEWS-003');
