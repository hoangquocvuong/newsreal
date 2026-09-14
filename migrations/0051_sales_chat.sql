-- V20.9.26.4 HoangVuongTech-owned sales consultation chat
CREATE TABLE IF NOT EXISTS sales_chat_threads (
 id INTEGER PRIMARY KEY AUTOINCREMENT, public_token TEXT NOT NULL UNIQUE, customer_name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', source_url TEXT NOT NULL DEFAULT '', source_title TEXT NOT NULL DEFAULT '', template_key TEXT NOT NULL DEFAULT '', template_name TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new', last_sender TEXT NOT NULL DEFAULT 'customer', unread_master INTEGER NOT NULL DEFAULT 0, unread_customer INTEGER NOT NULL DEFAULT 0, last_message_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sales_chat_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, thread_id INTEGER NOT NULL, sender TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_sales_chat_threads_status ON sales_chat_threads(status,last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_chat_messages_thread ON sales_chat_messages(thread_id,id);
