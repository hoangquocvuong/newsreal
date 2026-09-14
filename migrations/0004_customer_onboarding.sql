-- NewsReal V7.9 customer onboarding
-- Không bắt buộc chạy thủ công: API Control Center tự CREATE TABLE IF NOT EXISTS.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customer_profiles (
  site_id INTEGER PRIMARY KEY,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  company TEXT DEFAULT '',
  tax_code TEXT DEFAULT '',
  address TEXT DEFAULT '',
  province TEXT DEFAULT '',
  district TEXT DEFAULT '',
  order_code TEXT DEFAULT '',
  internal_note TEXT DEFAULT '',
  activated_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_activation_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activation_hash ON site_activation_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer_profiles(email);
