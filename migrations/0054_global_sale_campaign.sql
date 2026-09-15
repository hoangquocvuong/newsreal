CREATE TABLE IF NOT EXISTS global_sale_campaign (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  enabled INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER NOT NULL DEFAULT 500000,
  sale_start TEXT NOT NULL DEFAULT '',
  sale_end TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO global_sale_campaign(id,enabled,discount_amount,sale_start,sale_end) VALUES(1,0,500000,'','');
