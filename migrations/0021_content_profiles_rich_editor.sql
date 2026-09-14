ALTER TABLE template_catalog ADD COLUMN editor_profile TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN extra_json TEXT NOT NULL DEFAULT '{}';
