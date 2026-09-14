-- NEWSREAL V20.9.24.2 — one-time cleanup + trial telemetry lookup index.
-- Runtime request handlers no longer execute this cleanup repeatedly.

DELETE FROM posts
WHERE site_id IN (SELECT site_id FROM website_trials)
  AND (
    coalesce(is_sample,0)=1
    OR coalesce(sample_key,'')<>''
    OR coalesce(listing_code,'') LIKE 'DEMO-%'
    OR coalesce(listing_code,'') LIKE 'SAMPLE-%'
  );

CREATE INDEX IF NOT EXISTS idx_trial_events_trial_type_created
ON trial_events(trial_id,event_type,created_at DESC);
