-- NEWSREAL V20.9.24.3 — final hot-path lookup index.
-- Preserves the existing publisher domain normalization semantics while making
-- lower(replace(domain,'www.','')) lookups indexable instead of scanning sites.

CREATE INDEX IF NOT EXISTS idx_sites_domain_normalized_status
ON sites(lower(replace(domain,'www.','')), status);
