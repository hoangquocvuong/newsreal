ALTER TABLE service_promotions ADD COLUMN list_price INTEGER NOT NULL DEFAULT 1999000;
ALTER TABLE service_promotions ADD COLUMN first_discount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE service_promotions ADD COLUMN first_price INTEGER NOT NULL DEFAULT 1999000;
ALTER TABLE service_promotions ADD COLUMN renewal_price INTEGER NOT NULL DEFAULT 1999000;
ALTER TABLE service_promotions ADD COLUMN renewal_requested_at TEXT;
