-- NEWSREAL V17.6 - Trial Abuse Guard V1
ALTER TABLE website_trials ADD COLUMN source_ip_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE website_trials ADD COLUMN user_agent_hash TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_trials_ip_created ON website_trials(source_ip_hash,created_at);
