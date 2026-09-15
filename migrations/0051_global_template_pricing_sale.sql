-- V20.9.27.28 — Master Control is the single source of truth for commercial pricing.
ALTER TABLE template_catalog ADD COLUMN sale_price INTEGER NOT NULL DEFAULT 0;
ALTER TABLE template_catalog ADD COLUMN sale_start TEXT NOT NULL DEFAULT '';
ALTER TABLE template_catalog ADD COLUMN sale_end TEXT NOT NULL DEFAULT '';

-- Renewal is always the current Master base price. Existing rows are normalized now.
UPDATE template_catalog SET renewal_price = price WHERE renewal_price <> price;
