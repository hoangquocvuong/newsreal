-- V20.9.24 D1 Efficiency Foundation
-- Runtime schema checks were removed from public/API hot paths. These indexes
-- support the remaining production lookups and range scans.
CREATE INDEX IF NOT EXISTS idx_sites_domain_lower_status
  ON sites(lower(domain), status);
CREATE INDEX IF NOT EXISTS idx_pageviews_created
  ON pageviews(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_leads_email_lower_created
  ON sales_leads(lower(email), created_at);
CREATE INDEX IF NOT EXISTS idx_users_site_role_id
  ON users(site_id, role, id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_site_expiry
  ON sessions(token, site_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_posts_site_status_type_category_id
  ON posts(site_id, status, type, category, id DESC);
CREATE INDEX IF NOT EXISTS idx_website_trials_site
  ON website_trials(site_id);
CREATE INDEX IF NOT EXISTS idx_trial_events_trial_id
  ON trial_events(trial_id, id);
