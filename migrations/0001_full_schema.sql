PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  preset TEXT NOT NULL DEFAULT 'newsreal',
  accent TEXT NOT NULL DEFAULT '#1463ff',
  phone TEXT DEFAULT '',
  zalo TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(site_id,email),
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'property',
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  image TEXT DEFAULT '',
  price TEXT DEFAULT '',
  area TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  author_id INTEGER,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "transaction" TEXT DEFAULT '',
  property_type TEXT DEFAULT '',
  unit_price TEXT DEFAULT '',
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  direction TEXT DEFAULT '',
  legal TEXT DEFAULT '',
  furniture TEXT DEFAULT '',
  province TEXT DEFAULT '',
  district TEXT DEFAULT '',
  ward TEXT DEFAULT '',
  gallery TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  verified INTEGER NOT NULL DEFAULT 0,
  listing_code TEXT DEFAULT '',
  frontage TEXT DEFAULT '',
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  post_id INTEGER,
  path TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_site ON posts(site_id,id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_site_status ON posts(site_id,status,id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_property ON posts(site_id,type,"transaction",property_type);
CREATE INDEX IF NOT EXISTS idx_posts_listing_code ON posts(site_id,listing_code);
CREATE INDEX IF NOT EXISTS idx_pageviews_site_time ON pageviews(site_id,created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);


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

CREATE TABLE IF NOT EXISTS service_subscriptions (
 site_id INTEGER PRIMARY KEY,
 plan_name TEXT DEFAULT 'Gói website trọn gói',
 sale_price INTEGER NOT NULL DEFAULT 0,
 internal_cost INTEGER NOT NULL DEFAULT 0,
 payment_status TEXT NOT NULL DEFAULT 'unpaid',
 service_status TEXT NOT NULL DEFAULT 'setup',
 started_at TEXT,
 expires_at TEXT,
 domain_status TEXT NOT NULL DEFAULT 'not_configured',
 domain_registered_at TEXT,
 domain_expires_at TEXT,
 auto_renew INTEGER NOT NULL DEFAULT 1,
 registrar TEXT DEFAULT 'Cloudflare',
 note TEXT DEFAULT '',
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
