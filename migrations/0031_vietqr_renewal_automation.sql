-- V20.0.1.1 VietQR + automated renewal payment
ALTER TABLE service_promotions ADD COLUMN renewal_selected_months INTEGER NOT NULL DEFAULT 12;
ALTER TABLE service_promotions ADD COLUMN renewal_order_code TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS renewal_payments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  order_code TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  years INTEGER NOT NULL DEFAULT 1,
  amount INTEGER NOT NULL DEFAULT 0,
  paid_amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL DEFAULT 'vietqr',
  transfer_ref TEXT DEFAULT '',
  transfer_content TEXT DEFAULT '',
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_renewal_payments_site ON renewal_payments(site_id,id DESC);
CREATE INDEX IF NOT EXISTS idx_renewal_payments_status ON renewal_payments(status,created_at);
