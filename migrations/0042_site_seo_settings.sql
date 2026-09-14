ALTER TABLE site_public_settings ADD COLUMN seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE site_public_settings ADD COLUMN seo_description TEXT NOT NULL DEFAULT '';
ALTER TABLE site_public_settings ADD COLUMN seo_og_image TEXT NOT NULL DEFAULT '';
ALTER TABLE site_public_settings ADD COLUMN seo_index INTEGER NOT NULL DEFAULT 1;
