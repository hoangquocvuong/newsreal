-- V20.6.0 Service Commerce & Lead Contract
CREATE TABLE IF NOT EXISTS service_leads(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 site_id INTEGER NOT NULL,
 customer_name TEXT NOT NULL DEFAULT '',
 phone TEXT NOT NULL DEFAULT '',
 province TEXT NOT NULL DEFAULT '',
 district TEXT NOT NULL DEFAULT '',
 need TEXT NOT NULL DEFAULT '',
 package_title TEXT NOT NULL DEFAULT '',
 package_category TEXT NOT NULL DEFAULT '',
 source_url TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'new',
 note TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_service_leads_site_status ON service_leads(site_id,status,created_at DESC);
