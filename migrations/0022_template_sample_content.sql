-- V13.1: template-aware sample content
ALTER TABLE posts ADD COLUMN is_sample INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN sample_key TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_posts_site_sample ON posts(site_id,is_sample);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_site_sample_key ON posts(site_id,sample_key) WHERE sample_key<>'';
