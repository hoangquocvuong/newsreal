CREATE TABLE IF NOT EXISTS service_promotions (
  site_id INTEGER PRIMARY KEY,
  term_months INTEGER NOT NULL DEFAULT 12,
  bonus_months INTEGER NOT NULL DEFAULT 0,
  promotion_name TEXT DEFAULT '',
  renewal_status TEXT NOT NULL DEFAULT 'none',
  renewal_notified_at TEXT,
  renewal_decision_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS renewal_response_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT,site_id INTEGER NOT NULL,token_hash TEXT NOT NULL UNIQUE,expires_at TEXT NOT NULL,used_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS renewal_reminder_log (id INTEGER PRIMARY KEY AUTOINCREMENT,site_id INTEGER NOT NULL,service_expires_at TEXT NOT NULL,reminder_key TEXT NOT NULL,email TEXT DEFAULT '',sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(site_id,service_expires_at,reminder_key),FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS idx_renewal_token_hash ON renewal_response_tokens(token_hash);
