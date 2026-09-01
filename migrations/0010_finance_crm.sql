-- NEWSREAL V8.9.0 - finance ledger / CRM
CREATE TABLE IF NOT EXISTS financial_transactions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  kind TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'paid',
  amount INTEGER NOT NULL DEFAULT 0,
  cost INTEGER NOT NULL DEFAULT 0,
  order_code TEXT DEFAULT '',
  memo TEXT DEFAULT '',
  cycle_start TEXT,
  cycle_end TEXT,
  paid_at TEXT,
  unique_key TEXT NOT NULL UNIQUE,
  note TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_fin_tx_site ON financial_transactions(site_id,id);
CREATE INDEX IF NOT EXISTS idx_fin_tx_paid ON financial_transactions(status,paid_at);
