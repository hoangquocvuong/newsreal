CREATE TABLE IF NOT EXISTS renewal_history(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  old_expires_at TEXT NOT NULL,
  new_expires_at TEXT NOT NULL,
  term_months INTEGER NOT NULL DEFAULT 12,
  amount INTEGER NOT NULL DEFAULT 0,
  order_code TEXT DEFAULT '',
  paid_at TEXT,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_renewal_history_site ON renewal_history(site_id,id);
