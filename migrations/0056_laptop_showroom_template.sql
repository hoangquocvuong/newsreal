-- V20.9.27.42: replace obsolete EV demo with Laptop showroom.
UPDATE template_catalog SET
 name='Dịch vụ · Cửa hàng Laptop',
 preset='service_laptop_store_5',
 price=3000000,
 renewal_price=3000000,
 image_url='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=86',
 demo_url='/demo/dich-vu/cua-hang-laptop/',
 badge='CỬA HÀNG LAPTOP',
 description='Website trưng bày laptop chuyên nghiệp với danh mục, cấu hình, giá, cẩm nang và hộp yêu cầu tư vấn.',
 features='Danh mục laptop rõ ràng\nCard cấu hình & giá đầy đủ\nẢnh chụp laptop thực tế\nHộp yêu cầu tư vấn trong Admin',
 accent='blue',
 seo_title='Template website cửa hàng laptop – Sản phẩm, giá & tư vấn',
 seo_slug='website-cua-hang-laptop',
 primary_keyword='template website cửa hàng laptop',
 secondary_keywords='website bán laptop, website trưng bày laptop, cửa hàng máy tính, laptop gaming, laptop văn phòng',
 meta_description='Template website cửa hàng laptop chuyên nghiệp với sản phẩm, cấu hình, giá, ảnh thực tế, cẩm nang và form tư vấn kết nối Admin.',
 internal_anchor='template website cửa hàng laptop',
 structure_profile='',
 updated_at=CURRENT_TIMESTAMP
WHERE template_key='dich-vu-5';
