-- NEWSREAL V18.4 - favicon + immutable service activation records
ALTER TABLE sites ADD COLUMN favicon_url TEXT DEFAULT '';
CREATE TABLE IF NOT EXISTS service_documents(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 site_id INTEGER NOT NULL,
 document_type TEXT NOT NULL DEFAULT 'activation_confirmation',
 document_code TEXT NOT NULL UNIQUE,
 document_version TEXT NOT NULL DEFAULT '1.0',
 customer_email TEXT DEFAULT '',
 content_html TEXT NOT NULL,
 sent_customer_at TEXT,
 sent_master_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_service_documents_site ON service_documents(site_id,id DESC);
