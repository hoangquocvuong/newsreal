-- NEWSREAL V8.9.1 - operating expenses
CREATE TABLE IF NOT EXISTS operating_expenses(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  recurring TEXT NOT NULL DEFAULT 'none',
  expense_date TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_date ON operating_expenses(expense_date,id);
