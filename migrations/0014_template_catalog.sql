CREATE TABLE IF NOT EXISTS template_catalog (
  template_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'bat-dong-san',
  preset TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  renewal_price INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO template_catalog(template_key,name,category,preset,price,renewal_price,is_active,sort_order)
VALUES
('mau-1','Mẫu 1 · Tin tức & BĐS','bat-dong-san','newsreal',1499000,1999000,1,1),
('mau-2','Mẫu 2 · BĐS hiện đại','bat-dong-san','estate_green',1799000,2299000,1,2);
