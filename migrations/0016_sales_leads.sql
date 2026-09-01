CREATE TABLE IF NOT EXISTS sales_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL DEFAULT 'template_form',
  status TEXT NOT NULL DEFAULT 'new',
  template_key TEXT NOT NULL DEFAULT '',
  template_name TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  renewal_price INTEGER NOT NULL DEFAULT 0,
  customer_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  site_name TEXT NOT NULL DEFAULT '',
  requested_domain TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  master_note TEXT NOT NULL DEFAULT '',
  converted_site_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_leads_status ON sales_leads(status, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_leads_phone ON sales_leads(phone);
CREATE INDEX IF NOT EXISTS idx_sales_leads_email ON sales_leads(email);
