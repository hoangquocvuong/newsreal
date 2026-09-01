ALTER TABLE sites ADD COLUMN template_key TEXT NOT NULL DEFAULT '';
-- Runtime code performs this safely and backfills legacy sites from preset.
