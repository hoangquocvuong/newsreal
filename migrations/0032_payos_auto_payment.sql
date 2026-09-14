-- NEWSREAL V20.1 — payOS automatic payment metadata
ALTER TABLE purchase_payments ADD COLUMN provider_order_code INTEGER;
ALTER TABLE purchase_payments ADD COLUMN payment_link_id TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_payments ADD COLUMN checkout_url TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_payments ADD COLUMN qr_code TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_payments_provider_order ON purchase_payments(provider_order_code) WHERE provider_order_code IS NOT NULL;

ALTER TABLE renewal_payments ADD COLUMN provider_order_code INTEGER;
ALTER TABLE renewal_payments ADD COLUMN payment_link_id TEXT NOT NULL DEFAULT '';
ALTER TABLE renewal_payments ADD COLUMN checkout_url TEXT NOT NULL DEFAULT '';
ALTER TABLE renewal_payments ADD COLUMN qr_code TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_renewal_payments_provider_order ON renewal_payments(provider_order_code) WHERE provider_order_code IS NOT NULL;
