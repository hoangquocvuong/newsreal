-- NEWSREAL V20.9.1 — CoC production stats + per-template settings
ALTER TABLE site_public_settings ADD COLUMN settings_json TEXT NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS game_base_stats(
  site_id INTEGER NOT NULL, slug TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 0,
  vote_sum INTEGER NOT NULL DEFAULT 0, vote_count INTEGER NOT NULL DEFAULT 0, downloads INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(site_id,slug),
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS game_base_votes(
  site_id INTEGER NOT NULL, slug TEXT NOT NULL, voter_key TEXT NOT NULL, vote INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(site_id,slug,voter_key),
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_game_stats_site_updated ON game_base_stats(site_id,updated_at DESC);

-- Seed existing imported CoC view counters without resetting them.
INSERT OR IGNORE INTO game_base_stats(site_id,slug,views)
SELECT pi.site_id,pi.slug,coalesce(p.views,0) FROM publisher_imports pi JOIN posts p ON p.id=pi.post_id;
