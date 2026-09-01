ALTER TABLE service_promotions ADD COLUMN renewal_stage TEXT NOT NULL DEFAULT 'none';
ALTER TABLE service_promotions ADD COLUMN renewal_payment_sent_at TEXT;
ALTER TABLE service_promotions ADD COLUMN renewal_paid_at TEXT;
ALTER TABLE service_promotions ADD COLUMN renewal_completed_at TEXT;
