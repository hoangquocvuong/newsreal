-- NEWSREAL V20.8.1 — VPS -> Cloudflare Content Publisher Bridge V1
-- Idempotent external publishing index. Post content remains in the shared posts table.

CREATE TABLE IF NOT EXISTS publisher_imports(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  external_key TEXT NOT NULL,
  slug TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  payload_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(site_id,external_key),
  UNIQUE(site_id,slug),
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
  FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_publisher_imports_post ON publisher_imports(post_id);
