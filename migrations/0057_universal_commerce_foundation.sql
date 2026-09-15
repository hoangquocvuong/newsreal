CREATE TABLE IF NOT EXISTS commerce_categories (
 id INTEGER PRIMARY KEY AUTOINCREMENT, site_id INTEGER NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,
 is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(site_id,slug)
);
CREATE TABLE IF NOT EXISTS commerce_products (
 id INTEGER PRIMARY KEY AUTOINCREMENT, site_id INTEGER NOT NULL, category_id INTEGER, name TEXT NOT NULL, slug TEXT NOT NULL,
 sku TEXT NOT NULL DEFAULT '', short_description TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '', gallery_json TEXT NOT NULL DEFAULT '[]',
 price INTEGER NOT NULL DEFAULT 0, compare_at_price INTEGER NOT NULL DEFAULT 0, cost_price INTEGER NOT NULL DEFAULT 0, stock_qty INTEGER NOT NULL DEFAULT 0,
 stock_status TEXT NOT NULL DEFAULT 'in_stock', attributes_json TEXT NOT NULL DEFAULT '{}', variants_json TEXT NOT NULL DEFAULT '[]', badge TEXT NOT NULL DEFAULT '',
 is_featured INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1, is_sample INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(site_id,slug)
);
CREATE TABLE IF NOT EXISTS commerce_orders (
 id INTEGER PRIMARY KEY AUTOINCREMENT, site_id INTEGER NOT NULL, order_code TEXT NOT NULL UNIQUE, customer_name TEXT NOT NULL, phone TEXT NOT NULL,
 email TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', province TEXT NOT NULL DEFAULT '', district TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '',
 subtotal INTEGER NOT NULL DEFAULT 0, discount_amount INTEGER NOT NULL DEFAULT 0, shipping_fee INTEGER NOT NULL DEFAULT 0, total_amount INTEGER NOT NULL DEFAULT 0,
 payment_method TEXT NOT NULL DEFAULT 'cod', payment_status TEXT NOT NULL DEFAULT 'unpaid', order_status TEXT NOT NULL DEFAULT 'new',
 items_json TEXT NOT NULL DEFAULT '[]', coupon_code TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS commerce_coupons (
 id INTEGER PRIMARY KEY AUTOINCREMENT, site_id INTEGER NOT NULL, code TEXT NOT NULL, discount_type TEXT NOT NULL DEFAULT 'fixed', discount_value INTEGER NOT NULL DEFAULT 0,
 min_order INTEGER NOT NULL DEFAULT 0, max_uses INTEGER NOT NULL DEFAULT 0, used_count INTEGER NOT NULL DEFAULT 0, starts_at TEXT NOT NULL DEFAULT '', ends_at TEXT NOT NULL DEFAULT '',
 is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(site_id,code)
);
CREATE TABLE IF NOT EXISTS commerce_settings (
 site_id INTEGER PRIMARY KEY, currency TEXT NOT NULL DEFAULT 'VND', cod_enabled INTEGER NOT NULL DEFAULT 1, bank_enabled INTEGER NOT NULL DEFAULT 1,
 store_pickup_enabled INTEGER NOT NULL DEFAULT 1, online_enabled INTEGER NOT NULL DEFAULT 0, bank_name TEXT NOT NULL DEFAULT '', bank_account TEXT NOT NULL DEFAULT '',
 bank_holder TEXT NOT NULL DEFAULT '', bank_qr_url TEXT NOT NULL DEFAULT '', shipping_flat_fee INTEGER NOT NULL DEFAULT 0, free_shipping_from INTEGER NOT NULL DEFAULT 0,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_commerce_products_site_active ON commerce_products(site_id,is_active,category_id,id DESC);
CREATE INDEX IF NOT EXISTS idx_commerce_orders_site_status ON commerce_orders(site_id,order_status,id DESC);
UPDATE template_catalog SET name='Cửa hàng Online · E-commerce', price=5000000, renewal_price=5000000,
 badge='E-COMMERCE', description='Website bán hàng tổng quát: sản phẩm, danh mục, tìm kiếm, giỏ hàng, checkout, thanh toán, đơn hàng và quản trị.',
 features='Sản phẩm & danh mục\nThuộc tính & biến thể\nGiỏ hàng & checkout\nCOD / chuyển khoản / tại cửa hàng\nĐơn hàng & tồn kho\nMã giảm giá & vận chuyển\nHộp yêu cầu tư vấn', updated_at=CURRENT_TIMESTAMP
WHERE template_key='dich-vu-5';
