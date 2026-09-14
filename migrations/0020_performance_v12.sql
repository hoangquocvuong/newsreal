CREATE INDEX IF NOT EXISTS idx_sites_domain_status ON sites(domain,status);
CREATE INDEX IF NOT EXISTS idx_posts_public_latest ON posts(site_id,status,id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_public_type_latest ON posts(site_id,status,type,id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_public_category ON posts(site_id,status,category,id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_public_views ON posts(site_id,status,views DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_pageviews_site_created ON pageviews(site_id,created_at);
CREATE INDEX IF NOT EXISTS idx_pageviews_site_post ON pageviews(site_id,post_id,created_at);
