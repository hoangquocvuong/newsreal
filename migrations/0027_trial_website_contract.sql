-- NEWSREAL V17.3 — Trial Website Contract V1
CREATE TABLE IF NOT EXISTS website_trials(
 id INTEGER PRIMARY KEY AUTOINCREMENT, trial_token TEXT NOT NULL UNIQUE, site_id INTEGER NOT NULL UNIQUE, lead_id INTEGER NOT NULL, template_key TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active', started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at TEXT NOT NULL, grace_expires_at TEXT NOT NULL, last_seen_at TEXT, admin_login_count INTEGER NOT NULL DEFAULT 0, post_create_count INTEGER NOT NULL DEFAULT 0, conversion_request_at TEXT, converted_site_id INTEGER, master_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE, FOREIGN KEY(lead_id) REFERENCES sales_leads(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS idx_trials_status_expiry ON website_trials(status,expires_at);
CREATE INDEX IF NOT EXISTS idx_trials_lead ON website_trials(lead_id);
CREATE TABLE IF NOT EXISTS trial_events(id INTEGER PRIMARY KEY AUTOINCREMENT,trial_id INTEGER NOT NULL,lead_id INTEGER,event_type TEXT NOT NULL,event_data TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(trial_id) REFERENCES website_trials(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS idx_trial_events_trial ON trial_events(trial_id,id);

-- Trial lead enrichment fields are also ensured defensively at runtime.
ALTER TABLE sales_leads ADD COLUMN lead_kind TEXT NOT NULL DEFAULT 'inquiry';
ALTER TABLE sales_leads ADD COLUMN trial_id INTEGER;
ALTER TABLE sales_leads ADD COLUMN last_activity_at TEXT;
ALTER TABLE sales_leads ADD COLUMN care_status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE sales_leads ADD COLUMN zalo TEXT NOT NULL DEFAULT '';
ALTER TABLE sales_leads ADD COLUMN company TEXT NOT NULL DEFAULT '';
ALTER TABLE sales_leads ADD COLUMN trial_source_url TEXT NOT NULL DEFAULT '';
