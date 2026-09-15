ALTER TABLE commerce_orders ADD COLUMN ward TEXT NOT NULL DEFAULT '';
ALTER TABLE commerce_orders ADD COLUMN shipping_method TEXT NOT NULL DEFAULT 'standard';
CREATE INDEX IF NOT EXISTS idx_commerce_orders_lookup ON commerce_orders(site_id,order_code,phone);
