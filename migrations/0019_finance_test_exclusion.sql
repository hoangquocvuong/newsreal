ALTER TABLE service_subscriptions ADD COLUMN finance_excluded INTEGER NOT NULL DEFAULT 0;
-- Runtime code also applies this safely with ALTER TABLE try/catch.
