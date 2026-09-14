-- V20.9.27.22 — sample-first handover state.
CREATE TABLE IF NOT EXISTS site_template_state(
  site_id INTEGER PRIMARY KEY,
  sample_pack_installed_at TEXT,
  sample_pack_template_key TEXT NOT NULL DEFAULT '',
  sample_pack_version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
