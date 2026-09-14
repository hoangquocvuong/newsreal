NEWSREAL Renewal Cron

Chạy 1 lần/ngày. Worker gọi POST /api/system/renewal-reminders.
Cần cùng CRON_SECRET với Pages project.
Biến NEWSREAL_REMINDER_URL mặc định: https://newsreal.pages.dev/api/system/renewal-reminders
Cron gợi ý: 0 1 * * * (08:00 Việt Nam).
