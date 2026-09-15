# V20.9.27.25 — Trial detail route hotfix

- Fix `/xem-bai?id=...&nr_trial=...` for service/blog/corporate trial templates.
- Detail redirect now keeps the selected template demo prefix instead of redirecting to marketplace `/`.
- Trial internal links now preserve both `nr_trial` and the current template prefix, preventing Home/Back links from escaping to the HoangVuongTech marketing homepage.
- Site/post ownership validation remains `post.id + site_id + published` before redirect.
- `npm run check`: PASS.
