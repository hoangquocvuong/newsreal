-- V8 Managed Service. API cũng tự tạo bảng này.
CREATE TABLE IF NOT EXISTS service_subscriptions (
 site_id INTEGER PRIMARY KEY, plan_name TEXT DEFAULT 'Gói website trọn gói',
 sale_price INTEGER NOT NULL DEFAULT 0, internal_cost INTEGER NOT NULL DEFAULT 0,
 payment_status TEXT NOT NULL DEFAULT 'unpaid', service_status TEXT NOT NULL DEFAULT 'setup',
 started_at TEXT, expires_at TEXT, domain_status TEXT NOT NULL DEFAULT 'not_configured',
 domain_registered_at TEXT, domain_expires_at TEXT, auto_renew INTEGER NOT NULL DEFAULT 1,
 registrar TEXT DEFAULT 'Cloudflare', note TEXT DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);