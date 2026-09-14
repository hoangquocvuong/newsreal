-- V19.8 automatic checkout/payment workflow
ALTER TABLE sales_leads ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE sales_leads ADD COLUMN payment_order_code TEXT NOT NULL DEFAULT '';
ALTER TABLE sales_leads ADD COLUMN paid_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE sales_leads ADD COLUMN paid_at TEXT;

CREATE TABLE IF NOT EXISTS purchase_payments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  order_code TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL DEFAULT 0,
  paid_amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT NOT NULL DEFAULT 'bank_qr',
  transfer_ref TEXT DEFAULT '',
  transfer_content TEXT DEFAULT '',
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(lead_id) REFERENCES sales_leads(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_purchase_payments_lead ON purchase_payments(lead_id,id DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_payments_status ON purchase_payments(status,created_at);
