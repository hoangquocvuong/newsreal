-- V20.9.27.32 — preserve customer sample deletions across sample-pack upgrades.
CREATE TABLE IF NOT EXISTS site_sample_tombstones (
  site_id INTEGER NOT NULL,
  sample_key TEXT NOT NULL,
  deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(site_id, sample_key),
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_site_sample_tombstones_site ON site_sample_tombstones(site_id);
