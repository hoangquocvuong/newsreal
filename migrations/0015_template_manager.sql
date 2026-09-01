CREATE TABLE IF NOT EXISTS template_catalog (
  template_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'bat-dong-san',
  preset TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  renewal_price INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  demo_url TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  features TEXT NOT NULL DEFAULT '',
  accent TEXT NOT NULL DEFAULT 'blue',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Existing databases may already have template_catalog from V10.
-- The application also performs safe ALTER TABLE checks at runtime.
