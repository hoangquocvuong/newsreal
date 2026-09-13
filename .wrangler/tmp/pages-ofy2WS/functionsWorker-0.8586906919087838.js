var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/[[path]].js
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } });
}
__name(json, "json");
function cookies(req) {
  return Object.fromEntries((req.headers.get("Cookie") || "").split(";").map((x) => x.trim()).filter(Boolean).map((x) => {
    const i = x.indexOf("=");
    return [x.slice(0, i), decodeURIComponent(x.slice(i + 1))];
  }));
}
__name(cookies, "cookies");
async function sha256(s) {
  const b = new TextEncoder().encode(s), h = await crypto.subtle.digest("SHA-256", b);
  return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
function nrSlug(v = "") {
  return String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);
}
__name(nrSlug, "nrSlug");
function publisherAuthorized(request, env) {
  const auth = String(request.headers.get("Authorization") || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : String(request.headers.get("X-Publisher-Token") || "").trim();
  return !!env.CONTENT_PUBLISHER_SECRET && token === String(env.CONTENT_PUBLISHER_SECRET);
}
__name(publisherAuthorized, "publisherAuthorized");
async function publisherSite(env, domain) {
  const h = String(domain || "").replace(/^https?:\/\//i, "").split("/")[0].replace(/^www\./, "").toLowerCase().trim();
  if (!h) return null;
  return env.DB.prepare(`SELECT * FROM sites WHERE lower(replace(domain,'www.',''))=? AND status='active' LIMIT 1`).bind(h).first();
}
__name(publisherSite, "publisherSite");
async function body(r) {
  try {
    return await r.json();
  } catch {
    return {};
  }
}
__name(body, "body");
function tok() {
  return crypto.randomUUID() + crypto.randomUUID();
}
__name(tok, "tok");
function host(req) {
  const u = new URL(req.url);
  return req.headers.get("X-Tenant") || u.searchParams.get("tenant") || u.hostname;
}
__name(host, "host");
function nrGameStatsPublic(row) {
  const count = Number(row?.vote_count || 0), sum = Number(row?.vote_sum || 0);
  return { views: Number(row?.views || 0), downloads: Number(row?.downloads || 0), vote_count: count, rating: count ? Number((sum / count).toFixed(1)) : 0 };
}
__name(nrGameStatsPublic, "nrGameStatsPublic");
async function siteFor(env, req) {
  const h = host(req).replace(/^www\./, "").toLowerCase();
  const baseSql = `SELECT s.*,
    coalesce(ps.contact_email,'') contact_email,
    coalesce(ps.settings_json,'{}') template_settings_json,
    coalesce(ps.seo_title,'') seo_title,
    coalesce(ps.seo_description,'') seo_description,
    coalesce(ps.seo_og_image,'') seo_og_image,
    coalesce(ps.seo_index,1) seo_index,
    coalesce(cp.phone,'') customer_phone,
    coalesce(cp.email,'') customer_email,
    coalesce((SELECT email FROM users u WHERE u.site_id=s.id AND u.role='admin' ORDER BY u.id LIMIT 1),'') admin_email
    FROM sites s
    LEFT JOIN site_public_settings ps ON ps.site_id=s.id
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id`;
  let s = await env.DB.prepare(baseSql + ` WHERE lower(s.domain)=? AND s.status='active'`).bind(h).first();
  if (!s && (h === "localhost" || h.endsWith(".pages.dev"))) s = await env.DB.prepare(baseSql + ` WHERE s.status='active' ORDER BY s.id LIMIT 1`).first();
  if (s) {
    s.phone = String(s.phone || s.customer_phone || "");
    s.zalo = String(s.zalo || s.customer_phone || "");
    s.email = String(s.contact_email || s.email || s.customer_email || s.admin_email || "");
    s.contact_email = s.email;
  }
  return s;
}
__name(siteFor, "siteFor");
async function userFor(env, req, site) {
  const auth = req.headers.get("Authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const t = bearer || cookies(req).nr_session;
  if (!t || !site) return null;
  return env.DB.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.site_id=? AND s.expires_at>datetime('now')`).bind(t, site.id).first();
}
__name(userFor, "userFor");
function publicCache(seconds = 60, stale = 300) {
  return { "Cache-Control": `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${stale}`, "CDN-Cache-Control": `public, max-age=${seconds}, stale-while-revalidate=${stale}` };
}
__name(publicCache, "publicCache");
async function stats(env, id) {
  const pv = await env.DB.prepare(`SELECT count(*) posts,coalesce(sum(views),0) views FROM posts WHERE site_id=? AND status='published'`).bind(id).first();
  const today = (await env.DB.prepare(`SELECT count(*) c FROM pageviews WHERE site_id=? AND created_at>=datetime('now','start of day')`).bind(id).first())?.c || 0;
  return { posts: Number(pv?.posts || 0), views: Number(pv?.views || 0), today: Number(today || 0) };
}
__name(stats, "stats");
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
__name(isoDate, "isoDate");
function addMonthsISO(start, months) {
  const raw = String(start || "").slice(0, 10);
  const base = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? /* @__PURE__ */ new Date(raw + "T12:00:00Z") : /* @__PURE__ */ new Date();
  const day = base.getUTCDate();
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + Number(months || 0), 1, 12));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 12)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return isoDate(d);
}
__name(addMonthsISO, "addMonthsISO");
function renewalYearsCovered(serviceExpiry, domainExpiry, maxYears = 10) {
  const start = String(serviceExpiry || "").slice(0, 10), end = String(domainExpiry || "").slice(0, 10);
  if (!start || !end || end <= start) return 0;
  let years = 0;
  for (let y = 1; y <= maxYears; y++) {
    if (addMonthsISO(start, y * 12) <= end) years = y;
    else break;
  }
  return years;
}
__name(renewalYearsCovered, "renewalYearsCovered");
function htmlEsc(v = "") {
  return String(v).replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c]);
}
__name(htmlEsc, "htmlEsc");
async function sendMail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) return { ok: false, configured: false, error: "Thi\u1EBFu RESEND_API_KEY" };
  const from = String(env.MAIL_FROM || "NEWSREAL <onboarding@resend.dev>").trim();
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, html }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, configured: true, error: d?.message || `Email API l\u1ED7i ${r.status}` };
  return { ok: true, configured: true, id: d?.id || "" };
}
__name(sendMail, "sendMail");
function fmtMoneyVN(v) {
  return Number(v || 0).toLocaleString("vi-VN") + "\u0111";
}
__name(fmtMoneyVN, "fmtMoneyVN");
async function createActivationServiceDocument(env, siteId, loginEmail) {
  const row = await env.DB.prepare(`SELECT s.id,s.name,s.domain,s.template_key,s.preset,cp.full_name,cp.phone,cp.company,
    ss.plan_name,ss.sale_price,ss.payment_status,ss.started_at,ss.expires_at,
    coalesce(sp.term_months,12) term_months,coalesce(sp.first_price,ss.sale_price,0) first_price,coalesce(sp.renewal_price,0) renewal_price,
    coalesce(tc.name,s.preset) template_name
    FROM sites s LEFT JOIN customer_profiles cp ON cp.site_id=s.id LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id LEFT JOIN template_catalog tc ON tc.template_key=s.template_key WHERE s.id=? LIMIT 1`).bind(siteId).first();
  if (!row) return null;
  const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replaceAll("-", "");
  const code = `NR-${stamp}-${String(siteId).padStart(5, "0")}`;
  const providerEmail = String(env.MASTER_NOTIFY_EMAIL || "hoangquocvuong.hp89@gmail.com").trim();
  const providerPhone = String(env.SUPPORT_PHONE || "0389986287").trim();
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${htmlEsc(code)}</title></head><body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:24px;color:#172033"><div style="max-width:760px;margin:auto;background:#fff;border:1px solid #dfe6ef;border-radius:16px;padding:32px"><div style="font-size:12px;font-weight:700;color:#1769ff">HOANGVUONGTECH \xB7 NEWSREAL</div><h1 style="margin:8px 0 4px">Bi\xEAn b\u1EA3n x\xE1c nh\u1EADn \u0111\u0103ng k\xFD & k\xEDch ho\u1EA1t d\u1ECBch v\u1EE5 website</h1><p style="color:#667085;margin-top:0">M\xE3 h\u1ED3 s\u01A1: <b>${htmlEsc(code)}</b> \xB7 Phi\xEAn b\u1EA3n 1.0</p><hr style="border:0;border-top:1px solid #e7ebf0"><h3>1. Th\xF4ng tin kh\xE1ch h\xE0ng</h3><p>H\u1ECD t\xEAn: <b>${htmlEsc(row.full_name || "")}</b><br>Email \u0111\u0103ng nh\u1EADp: <b>${htmlEsc(loginEmail || "")}</b><br>\u0110i\u1EC7n tho\u1EA1i: ${htmlEsc(row.phone || "")}<br>C\xF4ng ty/Th\u01B0\u01A1ng hi\u1EC7u: ${htmlEsc(row.company || "\u2014")}</p><h3>2. Th\xF4ng tin website</h3><p>Website: <b>${htmlEsc(row.name || "")}</b><br>Domain: <b>${htmlEsc(row.domain || "")}</b><br>Giao di\u1EC7n: <b>${htmlEsc(row.template_name || row.template_key || row.preset || "")}</b><br>G\xF3i d\u1ECBch v\u1EE5: <b>${htmlEsc(row.plan_name || "G\xF3i website tr\u1ECDn g\xF3i")}</b></p><h3>3. Chi ph\xED & th\u1EDDi h\u1EA1n</h3><p>Gi\xE1 n\u0103m \u0111\u1EA7u: <b>${fmtMoneyVN(row.first_price || row.sale_price)}</b><br>Gi\xE1 gia h\u1EA1n d\u1EF1 ki\u1EBFn: <b>${fmtMoneyVN(row.renewal_price)} / ${Number(row.term_months || 12)} th\xE1ng</b><br>Tr\u1EA1ng th\xE1i thanh to\xE1n: <b>${htmlEsc(row.payment_status || "unpaid")}</b><br>Th\u1EDDi h\u1EA1n d\u1ECBch v\u1EE5: ${htmlEsc(row.started_at || "")} \u2192 ${htmlEsc(row.expires_at || "")}</p><h3>4. Ph\u1EA1m vi cung c\u1EA5p</h3><p>HoangVuongTech cung c\u1EA5p website theo giao di\u1EC7n \u0111\xE3 ch\u1ECDn, Trang qu\u1EA3n tr\u1ECB n\u1ED9i dung, hosting trong th\u1EDDi h\u1EA1n g\xF3i v\xE0 h\u1ED7 tr\u1EE3 b\xE0n giao/v\u1EADn h\xE0nh theo th\xF4ng tin d\u1ECBch v\u1EE5 \u0111\xE3 \u0111\u0103ng k\xFD. T\xEAn mi\u1EC1n \u0111\u01B0\u1EE3c qu\u1EA3n l\xFD theo h\u1ED3 s\u01A1 d\u1ECBch v\u1EE5 th\u1EF1c t\u1EBF c\u1EE7a website.</p><h3>5. D\u1EEF li\u1EC7u & n\u1ED9i dung</h3><p>Kh\xE1ch h\xE0ng ch\u1ECBu tr\xE1ch nhi\u1EC7m \u0111\u1ED1i v\u1EDBi n\u1ED9i dung t\u1EF1 \u0111\u0103ng t\u1EA3i. D\u1EEF li\u1EC7u website \u0111\u01B0\u1EE3c duy tr\xEC trong th\u1EDDi gian d\u1ECBch v\u1EE5 c\xF2n hi\u1EC7u l\u1EF1c v\xE0 theo ch\xEDnh s\xE1ch sao l\u01B0u/v\u1EADn h\xE0nh c\u1EE7a h\u1EC7 th\u1ED1ng.</p><h3>6. Gia h\u1EA1n</h3><p>H\u1EC7 th\u1ED1ng kh\xF4ng t\u1EF1 \u0111\u1ED9ng tr\u1EEB ti\u1EC1n. Tr\u01B0\u1EDBc khi h\u1EBFt h\u1EA1n, kh\xE1ch h\xE0ng s\u1EBD \u0111\u01B0\u1EE3c th\xF4ng b\xE1o \u0111\u1EC3 x\xE1c nh\u1EADn nhu c\u1EA7u gia h\u1EA1n. M\u1EE9c gi\xE1 gia h\u1EA1n \xE1p d\u1EE5ng theo h\u1ED3 s\u01A1 d\u1ECBch v\u1EE5 ho\u1EB7c th\xF4ng b\xE1o t\u1EA1i th\u1EDDi \u0111i\u1EC3m gia h\u1EA1n.</p><h3>7. X\xE1c nh\u1EADn \u0111i\u1EC7n t\u1EED</h3><p>Bi\xEAn b\u1EA3n n\xE0y \u0111\u01B0\u1EE3c t\u1EA1o t\u1EF1 \u0111\u1ED9ng khi kh\xE1ch ho\xE0n t\u1EA5t k\xEDch ho\u1EA1t b\u1EB1ng email \u0111\u0103ng nh\u1EADp v\xE0 t\u1EF1 thi\u1EBFt l\u1EADp m\u1EADt kh\u1EA9u qu\u1EA3n tr\u1ECB. Th\u1EDDi \u0111i\u1EC3m t\u1EA1o: <b>${(/* @__PURE__ */ new Date()).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</b>.</p><div style="margin-top:28px;padding:16px;background:#f7faff;border-radius:10px"><b>HoangVuongTech</b><br>Email: ${htmlEsc(providerEmail)} \xB7 \u0110i\u1EC7n tho\u1EA1i: ${htmlEsc(providerPhone)}</div><p style="font-size:12px;color:#98a2b3;margin-top:18px">\u0110\xE2y l\xE0 b\u1EA3n ghi x\xE1c nh\u1EADn d\u1ECBch v\u1EE5 \u0111i\u1EC7n t\u1EED ph\u1EE5c v\u1EE5 qu\u1EA3n l\xFD h\u1ED3 s\u01A1 v\xE0 b\xE0n giao. N\u1EBFu d\xF9ng nh\u01B0 h\u1EE3p \u0111\u1ED3ng c\xF3 gi\xE1 tr\u1ECB ph\xE1p l\xFD \u0111\u1EA7y \u0111\u1EE7, n\xEAn \u0111\u01B0\u1EE3c r\xE0 so\xE1t \u0111i\u1EC1u kho\u1EA3n b\u1EDFi t\u01B0 v\u1EA5n ph\xE1p l\xFD tr\u01B0\u1EDBc khi ph\xE1t h\xE0nh ch\xEDnh th\u1EE9c.</p></div></body></html>`;
  let existing = await env.DB.prepare(`SELECT id,document_code FROM service_documents WHERE site_id=? AND document_type='activation_confirmation' ORDER BY id DESC LIMIT 1`).bind(siteId).first();
  let docId = existing?.id;
  if (!docId) {
    const ins = await env.DB.prepare(`INSERT INTO service_documents(site_id,document_type,document_code,customer_email,content_html) VALUES(?,?,?,?,?)`).bind(siteId, "activation_confirmation", code, loginEmail || "", html).run();
    docId = ins.meta?.last_row_id;
  } else return existing;
  const sentCustomer = loginEmail ? await sendMail(env, { to: loginEmail, subject: `HoangVuongTech: Bi\xEAn b\u1EA3n k\xEDch ho\u1EA1t website ${row.name || ""}`, html }) : { ok: false };
  const masterTo = String(env.MASTER_NOTIFY_EMAIL || "").trim();
  const sentMaster = masterTo ? await sendMail(env, { to: masterTo, subject: `NEWSREAL: L\u01B0u h\u1ED3 s\u01A1 k\xEDch ho\u1EA1t ${row.name || ""} \xB7 ${code}`, html }) : { ok: false };
  if (sentCustomer.ok) await env.DB.prepare(`UPDATE service_documents SET sent_customer_at=CURRENT_TIMESTAMP WHERE id=?`).bind(docId).run();
  if (sentMaster.ok) await env.DB.prepare(`UPDATE service_documents SET sent_master_at=CURRENT_TIMESTAMP WHERE id=?`).bind(docId).run();
  return { id: docId, document_code: code };
}
__name(createActivationServiceDocument, "createActivationServiceDocument");
async function renewalEmailForSite(env, row, origin, reminderKey = "manual") {
  const email = String(row.customer_email || row.admin_email || "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Kh\xE1ch h\xE0ng ch\u01B0a c\xF3 email" };
  const raw = activationToken(), hash = await sha256(raw);
  await env.DB.prepare(`INSERT INTO renewal_response_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+60 days'))`).bind(row.id, hash).run();
  const url = `${String(env.PUBLIC_APP_URL || origin).replace(/\/$/, "")}/renewal/?token=${encodeURIComponent(raw)}`;
  const days = Math.max(0, Math.ceil((/* @__PURE__ */ new Date(String(row.expires_at) + "T23:59:59Z") - /* @__PURE__ */ new Date()) / 864e5));
  const promo = row.renewal_price ? ` Gi\xE1 gia h\u1EA1n hi\u1EC7n t\u1EA1i: <b>${Number(row.renewal_price).toLocaleString("vi-VN")}\u0111 / ${Number(row.term_months || 12)} th\xE1ng</b>.` : "";
  const subject = days > 0 ? `NEWSREAL: Website ${row.name} c\xF2n ${days} ng\xE0y h\u1EBFt h\u1EA1n` : `NEWSREAL: D\u1ECBch v\u1EE5 website ${row.name} \u0111\u1EBFn h\u1EA1n gia h\u1EA1n`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#172033;line-height:1.6"><h2>Th\xF4ng b\xE1o gia h\u1EA1n website</h2><p>Xin ch\xE0o ${htmlEsc(row.customer_name || "Qu\xFD kh\xE1ch")},</p><p>D\u1ECBch v\u1EE5 website <b>${htmlEsc(row.name)}</b> (${htmlEsc(row.domain)}) s\u1EBD h\u1EBFt h\u1EA1n v\xE0o <b>${htmlEsc(row.expires_at || "")}</b>.${promo}</p><p>Vui l\xF2ng cho ch\xFAng t\xF4i bi\u1EBFt b\u1EA1n c\xF3 nhu c\u1EA7u gia h\u1EA1n hay kh\xF4ng:</p><p><a href="${htmlEsc(url)}" style="display:inline-block;background:#1769ff;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">X\xE1c nh\u1EADn nhu c\u1EA7u gia h\u1EA1n</a></p><p style="font-size:13px;color:#667085">NEWSREAL kh\xF4ng t\u1EF1 \u0111\u1ED9ng tr\u1EEB ti\u1EC1n hay t\u1EF1 gia h\u1EA1n. X\xE1c nh\u1EADn n\xE0y ch\u1EC9 gi\xFAp ch\xFAng t\xF4i li\xEAn h\u1EC7 v\xE0 x\u1EED l\xFD gia h\u1EA1n theo y\xEAu c\u1EA7u c\u1EE7a b\u1EA1n.</p></div>`;
  const sent = await sendMail(env, { to: email, subject, html });
  if (!sent.ok) {
    await env.DB.prepare(`DELETE FROM renewal_response_tokens WHERE token_hash=?`).bind(hash).run();
    return sent;
  }
  await env.DB.prepare(`UPDATE service_promotions SET renewal_notified_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(row.id).run();
  return { ...sent, email, url, days, reminder_key: reminderKey };
}
__name(renewalEmailForSite, "renewalEmailForSite");
function paymentConfig(env) {
  return {
    accountName: String(env.PAYMENT_ACCOUNT_NAME || "").trim(),
    accountNumber: String(env.PAYMENT_ACCOUNT_NUMBER || "").trim(),
    bankName: String(env.PAYMENT_BANK_NAME || "MB Bank").trim(),
    bankBin: String(env.PAYMENT_BANK_BIN || "970422").trim(),
    qrUrl: String(env.PAYMENT_QR_URL || "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgz5fwEwS1BbSbW-WmWFqiqFhReV0qlsQWYUZ8qyGf1H_VEUCJ8Z76cnkoB-KVgFEJOx5I6gIVQqErka-b2BJwbDhvus-HSU1tUInQo9k0KvL7W6pIK-b3A0xdP1s932nGayqtZhDZaYaMk9DMnsm5RVVolQBZLwvgo_jgvzj_K7OIoYmCQX0Dwml05Lrw/s600/1788226781520_1785267834312255039_4752939212946377740_4429932c514f4f8ae82fe2b847f711a5_cropped.jpg").trim()
  };
}
__name(paymentConfig, "paymentConfig");
function purchasePaymentQr(env, amount, memo) {
  const cfg = paymentConfig(env);
  if (cfg.qrUrl) return cfg.qrUrl;
  if (cfg.bankBin && cfg.accountNumber) {
    return `https://img.vietqr.io/image/${encodeURIComponent(cfg.bankBin)}-${encodeURIComponent(cfg.accountNumber)}-compact2.png`;
  }
  return "";
}
__name(purchasePaymentQr, "purchasePaymentQr");
function payosConfig(env) {
  return { clientId: String(env.PAYOS_CLIENT_ID || "").trim(), apiKey: String(env.PAYOS_API_KEY || "").trim(), checksumKey: String(env.PAYOS_CHECKSUM_KEY || "").trim() };
}
__name(payosConfig, "payosConfig");
function payosReady(env) {
  const c = payosConfig(env);
  return !!(c.clientId && c.apiKey && c.checksumKey);
}
__name(payosReady, "payosReady");
async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder(), key = await crypto.subtle.importKey("raw", enc.encode(String(secret || "")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(String(message || "")));
  return [...new Uint8Array(sig)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
__name(hmacSha256Hex, "hmacSha256Hex");
function payosValue(v) {
  if (v === null || v === void 0 || v === "undefined" || v === "null") return "";
  if (Array.isArray(v)) return JSON.stringify(v.map((x) => x && typeof x === "object" && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, k) => (o[k] = x[k], o), {}) : x));
  return String(v);
}
__name(payosValue, "payosValue");
function payosDataString(data) {
  return Object.keys(data || {}).filter((k) => data[k] !== void 0).sort().map((k) => `${k}=${payosValue(data[k])}`).join("&");
}
__name(payosDataString, "payosDataString");
async function payosSignData(checksumKey, data) {
  return hmacSha256Hex(checksumKey, payosDataString(data));
}
__name(payosSignData, "payosSignData");
function secureHexEqual(a, b) {
  a = String(a || "").toLowerCase();
  b = String(b || "").toLowerCase();
  if (a.length !== b.length || !a.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
__name(secureHexEqual, "secureHexEqual");
function payosProviderOrderCode() {
  return Date.now() * 100 + Math.floor(Math.random() * 100);
}
__name(payosProviderOrderCode, "payosProviderOrderCode");
async function payosCreatePayment(env, { amount, description, returnUrl, cancelUrl, buyerName = "", buyerEmail = "", buyerPhone = "" }) {
  const cfg = payosConfig(env);
  if (!payosReady(env)) throw new Error("payOS ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh trong Cloudflare Secrets");
  const orderCode = payosProviderOrderCode();
  const payload = { orderCode, amount: Math.max(1, Math.round(Number(amount || 0))), description: String(description || "HVTECH").slice(0, 25), cancelUrl, returnUrl };
  if (buyerName) payload.buyerName = String(buyerName).slice(0, 100);
  if (buyerEmail) payload.buyerEmail = String(buyerEmail).slice(0, 160);
  if (buyerPhone) payload.buyerPhone = String(buyerPhone).slice(0, 30);
  payload.signature = await payosSignData(cfg.checksumKey, { amount: payload.amount, cancelUrl: payload.cancelUrl, description: payload.description, orderCode: payload.orderCode, returnUrl: payload.returnUrl });
  const r = await fetch("https://api-merchant.payos.vn/v2/payment-requests", { method: "POST", headers: { "Content-Type": "application/json", "x-client-id": cfg.clientId, "x-api-key": cfg.apiKey }, body: JSON.stringify(payload) });
  const out = await r.json().catch(() => ({}));
  if (!r.ok || out.code !== "00" || !out.data) throw new Error(out.desc || out.message || `payOS HTTP ${r.status}`);
  return out.data;
}
__name(payosCreatePayment, "payosCreatePayment");
async function payosVerifyWebhook(env, payload) {
  const cfg = payosConfig(env), data = payload && payload.data && typeof payload.data === "object" ? payload.data : null, signature = String(payload?.signature || "");
  if (!cfg.checksumKey || !data || !signature) return false;
  return secureHexEqual(await payosSignData(cfg.checksumKey, data), signature);
}
__name(payosVerifyWebhook, "payosVerifyWebhook");
function purchaseOrderCode(leadId) {
  const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replaceAll("-", "");
  const tail = crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase();
  return `HV${stamp}-${String(leadId).padStart(5, "0")}-${tail}`;
}
__name(purchaseOrderCode, "purchaseOrderCode");
function renewalOrderCode(siteId) {
  const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replaceAll("-", "");
  const tail = crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase();
  return `GH${stamp}-${String(siteId).padStart(5, "0")}-${tail}`;
}
__name(renewalOrderCode, "renewalOrderCode");
async function createRenewalPayment(env, siteId, years = 1) {
  years = Math.max(1, Math.min(3, Number(years || 1)));
  const row = await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,
    ss.expires_at,coalesce(sp.renewal_price,1999000) renewal_price
    FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin'
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
  if (!row) throw new Error("Website kh\xF4ng t\u1ED3n t\u1EA1i");
  const amount = Math.max(0, Number(row.renewal_price || 0)) * years;
  if (amount <= 0) throw new Error("Ch\u01B0a c\xF3 gi\xE1 gia h\u1EA1n h\u1EE3p l\u1EC7");
  await env.DB.prepare(`UPDATE renewal_payments SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND status='pending'`).bind(siteId).run();
  const orderCode = renewalOrderCode(siteId), token = activationToken(), hash = await sha256(token);
  await env.DB.prepare(`INSERT INTO renewal_payments(site_id,order_code,token_hash,years,amount,status,provider)
    VALUES(?,?,?,?,?,'pending','vietqr')`).bind(siteId, orderCode, hash, years, amount).run();
  await env.DB.prepare(`INSERT INTO service_promotions(site_id,renewal_status,renewal_decision_at,renewal_requested_at,renewal_stage,renewal_selected_months,renewal_order_code,updated_at)
    VALUES(?,'yes',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'payment_pending',?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(site_id) DO UPDATE SET renewal_status='yes',renewal_decision_at=CURRENT_TIMESTAMP,renewal_requested_at=CURRENT_TIMESTAMP,
      renewal_stage='payment_pending',renewal_selected_months=excluded.renewal_selected_months,renewal_order_code=excluded.renewal_order_code,updated_at=CURRENT_TIMESTAMP`).bind(siteId, years * 12, orderCode).run();
  const cfg = paymentConfig(env), origin = String(env.PUBLIC_APP_URL || "https://hoangvuongtech.com").replace(/\/$/, "");
  let provider = "bank_qr", memo = orderCode, qrCode = "", checkoutUrl = "", paymentLinkId = "", providerOrderCode = null;
  let bankName = cfg.bankName, accountName = cfg.accountName, accountNumber = cfg.accountNumber, qrUrl = purchasePaymentQr(env, amount, memo);
  if (payosReady(env)) {
    const po = await payosCreatePayment(env, { amount, description: `GH${String(siteId).slice(-6)}`, returnUrl: `${origin}/renewal/?payment=success`, cancelUrl: `${origin}/renewal/?payment=cancel`, buyerName: row.customer_name || "", buyerEmail: row.customer_email || row.admin_email || "" });
    provider = "payos";
    providerOrderCode = Number(po.orderCode);
    paymentLinkId = String(po.paymentLinkId || "");
    checkoutUrl = String(po.checkoutUrl || "");
    qrCode = String(po.qrCode || "");
    memo = String(po.description || orderCode);
    bankName = "MB Bank / payOS";
    accountName = String(po.accountName || "");
    accountNumber = String(po.accountNumber || "");
    qrUrl = "";
    await env.DB.prepare(`UPDATE renewal_payments SET provider='payos',provider_order_code=?,payment_link_id=?,checkout_url=?,qr_code=?,updated_at=CURRENT_TIMESTAMP WHERE order_code=?`).bind(providerOrderCode, paymentLinkId, checkoutUrl, qrCode, orderCode).run();
  }
  return { row, order_code: orderCode, payment_token: token, years, months: years * 12, amount, memo, provider, provider_order_code: providerOrderCode, qr_code: qrCode, checkout_url: checkoutUrl, payment_link_id: paymentLinkId, qr_url: qrUrl, bank_name: bankName, account_name: accountName, account_number: accountNumber };
}
__name(createRenewalPayment, "createRenewalPayment");
async function notifyMasterRenewalPaid(env, row, payment) {
  const to = String(env.MASTER_NOTIFY_EMAIL || "").trim();
  if (!to) return { ok: false, configured: false };
  const amount = Number(payment.amount || 0).toLocaleString("vi-VN") + "\u0111";
  return sendMail(env, {
    to,
    subject: `NEWSREAL: GIA H\u1EA0N \u0110\xC3 THANH TO\xC1N - ${row.name}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Kh\xE1ch \u0111\xE3 thanh to\xE1n gia h\u1EA1n</h2>
    <p><b>${htmlEsc(row.customer_name || row.name)}</b> \u0111\xE3 thanh to\xE1n th\xE0nh c\xF4ng.</p>
    <p>Website: <b>${htmlEsc(row.name)}</b><br>Domain: <b>${htmlEsc(row.domain || "")}</b><br>
    M\xE3 thanh to\xE1n: <b>${htmlEsc(payment.order_code || "")}</b><br>Th\u1EDDi h\u1EA1n kh\xE1ch ch\u1ECDn: <b>${Number(payment.years || 1)} n\u0103m</b><br>
    S\u1ED1 ti\u1EC1n: <b>${amount}</b></p><p>V\xE0o Master Control \u0111\u1EC3 gia h\u1EA1n domain r\u1ED3i b\u1EA5m ki\u1EC3m tra l\u1EA1i domain. H\u1EC7 th\u1ED1ng s\u1EBD t\u1EF1 \u0111\u1ED3ng b\u1ED9 ng\xE0y h\u1EBFt h\u1EA1n website.</p></div>`
  });
}
__name(notifyMasterRenewalPaid, "notifyMasterRenewalPaid");
function paymentWebhookAuthorized(env, request) {
  const secret = String(env.VIETQR_WEBHOOK_TOKEN || env.PAYMENT_WEBHOOK_SECRET || "").trim();
  if (!secret) return false;
  const auth = String(request.headers.get("Authorization") || "").trim();
  const x = String(request.headers.get("X-Webhook-Secret") || request.headers.get("X-API-Key") || "").trim();
  let q = "";
  try {
    q = String(new URL(request.url).searchParams.get("token") || "").trim();
  } catch (e) {
  }
  return q === secret || x === secret || auth === secret || auth === `Bearer ${secret}` || auth === `Apikey ${secret}` || auth === `ApiKey ${secret}`;
}
__name(paymentWebhookAuthorized, "paymentWebhookAuthorized");
async function notifyInitialPayment(env, { lead, orderCode, amount }) {
  const customer = String(lead.email || "").trim().toLowerCase();
  const master = String(env.MASTER_NOTIFY_EMAIL || "hoangquocvuong.hp89@gmail.com").trim();
  const money = Number(amount || 0).toLocaleString("vi-VN") + "\u0111";
  const customerHtml = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.6;color:#172033"><h2>HoangVuongTech \u0111\xE3 nh\u1EADn thanh to\xE1n</h2><p>Xin ch\xE0o <b>${htmlEsc(lead.customer_name || "Qu\xFD kh\xE1ch")}</b>,</p><p>Ch\xFAng t\xF4i \u0111\xE3 ghi nh\u1EADn thanh to\xE1n <b>${money}</b> cho y\xEAu c\u1EA7u <b>${htmlEsc(orderCode)}</b>.</p><p>Qu\xFD kh\xE1ch vui l\xF2ng ch\u1EDD kho\u1EA3ng <b>30\u201360 ph\xFAt</b> \u0111\u1EC3 h\u1EC7 th\u1ED1ng setup website. Link k\xEDch ho\u1EA1t s\u1EBD \u0111\u01B0\u1EE3c g\u1EEDi t\u1EF1 \u0111\u1ED9ng t\u1EDBi ch\xEDnh \u0111\u1ECBa ch\u1EC9 email n\xE0y sau khi domain, DNS v\xE0 SSL ho\xE0n t\u1EA5t.</p></div>`;
  const masterHtml = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.6"><h2>Kh\xE1ch \u0111\xE3 thanh to\xE1n website</h2><p><b>${htmlEsc(lead.customer_name || "Kh\xE1ch h\xE0ng")}</b> \u0111\xE3 thanh to\xE1n <b>${money}</b>.</p><p>M\xE3 thanh to\xE1n: <b>${htmlEsc(orderCode)}</b><br>Giao di\u1EC7n: <b>${htmlEsc(lead.template_name || "")}</b><br>Email: <b>${htmlEsc(lead.email || "")}</b><br>T\xEAn website mong mu\u1ED1n: <b>${htmlEsc(lead.site_name || "")}</b></p><p>V\xE0o Master Control \u2192 H\u1ED9p y\xEAu c\u1EA7u v\xE0 b\u1EA5m <b>T\u1EA1o website</b>.</p></div>`;
  const sentCustomer = customer ? await sendMail(env, { to: customer, subject: `HoangVuongTech: \u0110\xE3 nh\u1EADn thanh to\xE1n ${orderCode}`, html: customerHtml }) : { ok: false };
  const sentMaster = master ? await sendMail(env, { to: master, subject: `NEWSREAL: \u0110\xE3 thanh to\xE1n ${orderCode} \xB7 ${lead.customer_name || ""}`, html: masterHtml }) : { ok: false };
  return { sent_customer: !!sentCustomer.ok, sent_master: !!sentMaster.ok };
}
__name(notifyInitialPayment, "notifyInitialPayment");
function paymentMemo(row) {
  const code = String(row.order_code || `NR-${row.id || ""}`).trim().replace(/\s+/g, " ");
  return `NEWSREAL GH ${code}`;
}
__name(paymentMemo, "paymentMemo");
async function renewalPaymentEmail(env, row) {
  const email = String(row.customer_email || row.admin_email || "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Kh\xE1ch h\xE0ng ch\u01B0a c\xF3 email" };
  if (String(row.renewal_status || "none") !== "yes") return { ok: false, error: "Kh\xE1ch ch\u01B0a x\xE1c nh\u1EADn mu\u1ED1n gia h\u1EA1n" };
  const cfg = paymentConfig(env), amount = Math.max(0, Number(row.renewal_price || 0)), term = Math.max(1, Number(row.term_months || 12));
  const memo = paymentMemo(row);
  const subject = `NEWSREAL: H\u01B0\u1EDBng d\u1EABn thanh to\xE1n gia h\u1EA1n - ${row.name}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033;line-height:1.6">
    <div style="padding:24px;border:1px solid #e6eaf0;border-radius:16px;background:#fff">
      <div style="font-size:12px;font-weight:700;color:#1769ff;letter-spacing:.08em">NEWSREAL by HO\xC0NG V\u01AF\u01A0NG</div>
      <h2 style="margin:8px 0 16px">H\u01B0\u1EDBng d\u1EABn thanh to\xE1n gia h\u1EA1n</h2>
      <p>Xin ch\xE0o <b>${htmlEsc(row.customer_name || "Qu\xFD kh\xE1ch")}</b>,</p>
      <p>NEWSREAL \u0111\xE3 ghi nh\u1EADn y\xEAu c\u1EA7u gia h\u1EA1n website c\u1EE7a b\u1EA1n. Th\xF4ng tin gia h\u1EA1n:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#667085">Website</td><td style="padding:8px 0;text-align:right"><b>${htmlEsc(row.name)}</b></td></tr>
        <tr><td style="padding:8px 0;color:#667085">Domain</td><td style="padding:8px 0;text-align:right"><b>${htmlEsc(row.domain)}</b></td></tr>
        <tr><td style="padding:8px 0;color:#667085">Ng\xE0y h\u1EBFt h\u1EA1n</td><td style="padding:8px 0;text-align:right"><b>${htmlEsc(row.expires_at || "\u2014")}</b></td></tr>
        <tr><td style="padding:8px 0;color:#667085">Th\u1EDDi h\u1EA1n gia h\u1EA1n</td><td style="padding:8px 0;text-align:right"><b>${term} th\xE1ng</b></td></tr>
        <tr><td style="padding:10px 0;color:#667085">S\u1ED1 ti\u1EC1n thanh to\xE1n</td><td style="padding:10px 0;text-align:right;font-size:20px;color:#1769ff"><b>${amount.toLocaleString("vi-VN")}\u0111</b></td></tr>
      </table>
      <div style="background:#f6f8fb;border-radius:12px;padding:16px;margin:18px 0">
        <div><b>Ng\xE2n h\xE0ng:</b> ${htmlEsc(cfg.bankName)}</div>
        <div><b>Ch\u1EE7 t\xE0i kho\u1EA3n:</b> ${htmlEsc(cfg.accountName)}</div>
        <div><b>S\u1ED1 t\xE0i kho\u1EA3n:</b> <span style="font-size:18px;font-weight:700">${htmlEsc(cfg.accountNumber)}</span></div>
        <div><b>N\u1ED9i dung chuy\u1EC3n kho\u1EA3n:</b> <span style="font-size:17px;font-weight:700;color:#1769ff">${htmlEsc(memo)}</span></div>
      </div>
      ${cfg.qrUrl ? `<div style="text-align:center;margin:20px 0"><div style="font-weight:700;margin-bottom:10px">Qu\xE9t QR \u0111\u1EC3 chuy\u1EC3n kho\u1EA3n</div><img src="${htmlEsc(cfg.qrUrl)}" alt="QR thanh to\xE1n" style="max-width:320px;width:100%;height:auto;border-radius:12px;border:1px solid #e6eaf0"></div>` : ""}
      <p>Sau khi nh\u1EADn \u0111\u01B0\u1EE3c thanh to\xE1n, b\u1ED9 ph\u1EADn qu\u1EA3n l\xFD s\u1EBD x\xE1c nh\u1EADn v\xE0 x\u1EED l\xFD gia h\u1EA1n d\u1ECBch v\u1EE5 cho b\u1EA1n.</p>
      <p style="font-size:13px;color:#667085">NEWSREAL kh\xF4ng t\u1EF1 \u0111\u1ED9ng tr\u1EEB ti\u1EC1n v\xE0 kh\xF4ng t\u1EF1 \u0111\u1ED9ng gia h\u1EA1n. Vui l\xF2ng ki\u1EC3m tra \u0111\xFAng s\u1ED1 ti\u1EC1n v\xE0 n\u1ED9i dung chuy\u1EC3n kho\u1EA3n tr\u01B0\u1EDBc khi thanh to\xE1n.</p>
    </div>
  </div>`;
  const sent = await sendMail(env, { to: email, subject, html });
  if (!sent.ok) return sent;
  await env.DB.prepare(`UPDATE service_promotions SET renewal_stage='payment_sent',renewal_payment_sent_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(row.id).run();
  return { ...sent, email, memo, amount };
}
__name(renewalPaymentEmail, "renewalPaymentEmail");
async function renewalCompletedEmail(env, row, newExpiry) {
  const email = String(row.customer_email || row.admin_email || "").trim().toLowerCase();
  if (!email) return { ok: false, configured: false, error: "Kh\xE1ch h\xE0ng ch\u01B0a c\xF3 email" };
  const term = Math.max(1, Number(row.renewal_selected_months || row.term_months || 12));
  const amount = Math.max(0, Number(row.renewal_price || 0)) * Math.max(1, Math.round(term / 12));
  const subject = `NEWSREAL: Gia h\u1EA1n d\u1ECBch v\u1EE5 th\xE0nh c\xF4ng - ${row.name}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033;line-height:1.6">
    <div style="padding:24px;border:1px solid #dfe7f2;border-radius:16px;background:#fff">
      <div style="font-size:12px;font-weight:700;color:#1769ff;letter-spacing:.08em">NEWSREAL by HO\xC0NG V\u01AF\u01A0NG</div>
      <h2 style="margin:8px 0 16px">Gia h\u1EA1n d\u1ECBch v\u1EE5 th\xE0nh c\xF4ng</h2>
      <p>Xin ch\xE0o <b>${htmlEsc(row.customer_name || "Qu\xFD kh\xE1ch")}</b>,</p>
      <p>NEWSREAL x\xE1c nh\u1EADn d\u1ECBch v\u1EE5 website <b>${htmlEsc(row.name)}</b> \u0111\xE3 \u0111\u01B0\u1EE3c gia h\u1EA1n th\xE0nh c\xF4ng.</p>
      <div style="background:#f6f8fb;border-radius:12px;padding:16px;margin:18px 0">
        <div><b>Domain:</b> ${htmlEsc(row.domain || "")}</div>
        <div><b>Th\u1EDDi h\u1EA1n gia h\u1EA1n:</b> ${term} th\xE1ng</div>
        <div><b>S\u1ED1 ti\u1EC1n \u0111\xE3 ghi nh\u1EADn:</b> ${amount.toLocaleString("vi-VN")}\u0111</div>
        <div><b>Ng\xE0y h\u1EBFt h\u1EA1n m\u1EDBi:</b> <span style="color:#1769ff;font-size:18px;font-weight:700">${htmlEsc(newExpiry)}</span></div>
      </div>
      <p>D\u1ECBch v\u1EE5 website ti\u1EBFp t\u1EE5c ho\u1EA1t \u0111\u1ED9ng b\xECnh th\u01B0\u1EDDng \u0111\u1EBFn ng\xE0y h\u1EBFt h\u1EA1n m\u1EDBi \u1EDF tr\xEAn.</p>
      <p style="font-size:13px;color:#667085">Ng\xE0y h\u1EBFt h\u1EA1n domain \u0111\u01B0\u1EE3c qu\u1EA3n l\xFD ri\xEAng v\xE0 ch\u1EC9 thay \u0111\u1ED5i sau khi domain th\u1EF1c t\u1EBF \u0111\u01B0\u1EE3c gia h\u1EA1n. NEWSREAL kh\xF4ng t\u1EF1 \u0111\u1ED9ng tr\u1EEB ti\u1EC1n.</p>
    </div>
  </div>`;
  return sendMail(env, { to: email, subject, html });
}
__name(renewalCompletedEmail, "renewalCompletedEmail");
async function completeRenewal(env, siteId) {
  const row = await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,cp.order_code,
      ss.expires_at,ss.domain_expires_at,ss.plan_name,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_selected_months,sp.term_months,12) renewal_selected_months,coalesce(sp.renewal_price,1999000) renewal_price,
      coalesce(sp.renewal_status,'none') renewal_status,coalesce(sp.renewal_stage,'none') renewal_stage
    FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin'
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id
    WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
  if (!row) return { ok: false, status: 404, error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" };
  if (String(row.renewal_stage || "none") === "renewed") return { ok: false, status: 409, error: "Chu k\u1EF3 gia h\u1EA1n n\xE0y \u0111\xE3 ho\xE0n t\u1EA5t, kh\xF4ng th\u1EC3 c\u1ED9ng th\xEAm l\u1EA7n n\u1EEFa" };
  if (String(row.renewal_stage || "none") !== "paid") return { ok: false, status: 400, error: "C\u1EA7n x\xE1c nh\u1EADn kh\xE1ch \u0111\xE3 thanh to\xE1n tr\u01B0\u1EDBc khi ho\xE0n t\u1EA5t gia h\u1EA1n" };
  if (!row.expires_at) return { ok: false, status: 400, error: "Ch\u01B0a c\xF3 ng\xE0y h\u1EBFt h\u1EA1n d\u1ECBch v\u1EE5" };
  const oldExpiry = String(row.expires_at).slice(0, 10);
  const minTerm = Math.max(1, Number(row.renewal_selected_months || row.term_months || 12));
  const domainExpiry = String(row.domain_expires_at || "").slice(0, 10);
  if (!domainExpiry) return { ok: false, status: 409, error: "Ch\u01B0a c\xF3 ng\xE0y h\u1EBFt h\u1EA1n domain. H\xE3y gia h\u1EA1n domain tr\xEAn Cloudflare r\u1ED3i b\u1EA5m Ki\u1EC3m tra l\u1EA1i domain." };
  const years = renewalYearsCovered(oldExpiry, domainExpiry);
  const term = years * 12;
  if (term < minTerm) {
    const requiredExpiry = addMonthsISO(oldExpiry, minTerm);
    return { ok: false, status: 409, error: `Domain ch\u01B0a \u0111\u01B0\u1EE3c gia h\u1EA1n \u0111\u1EE7 th\u1EDDi h\u1EA1n. Domain hi\u1EC7n h\u1EBFt h\u1EA1n ${domainExpiry}, c\u1EA7n t\u1ED1i thi\u1EC3u \u0111\u1EBFn ${requiredExpiry}. H\xE3y renew domain tr\xEAn Cloudflare r\u1ED3i b\u1EA5m Ki\u1EC3m tra l\u1EA1i domain.` };
  }
  const newExpiry = domainExpiry;
  const paidRow = await env.DB.prepare(`SELECT paid_amount,amount FROM renewal_payments WHERE site_id=? AND status='paid' ORDER BY id DESC LIMIT 1`).bind(siteId).first();
  const amount = Math.max(0, Number(paidRow?.paid_amount || paidRow?.amount || 0)) || Math.max(0, Number(row.renewal_price || 0)) * years;
  await env.DB.batch([
    env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(newExpiry, siteId),
    env.DB.prepare(`UPDATE service_promotions SET renewal_stage='renewed',renewal_completed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId),
    env.DB.prepare(`INSERT INTO renewal_history(site_id,old_expires_at,new_expires_at,term_months,amount,order_code,paid_at,completed_at)
      VALUES(?,?,?,?,?,?,coalesce((SELECT renewal_paid_at FROM service_promotions WHERE site_id=?),CURRENT_TIMESTAMP),CURRENT_TIMESTAMP)`).bind(siteId, oldExpiry, newExpiry, term, amount, String(row.order_code || ""), siteId),
    env.DB.prepare(`DELETE FROM renewal_response_tokens WHERE site_id=? AND used_at IS NULL`).bind(siteId),
    env.DB.prepare(`UPDATE financial_transactions SET amount=?,cycle_end=?,memo=?,updated_at=CURRENT_TIMESTAMP
      WHERE unique_key=?`).bind(amount, newExpiry, `Gia h\u1EA1n d\u1ECBch v\u1EE5 ${years} n\u0103m`, `renewal:${siteId}:${oldExpiry}`)
  ]);
  let persisted = await env.DB.prepare(`SELECT expires_at FROM service_subscriptions WHERE site_id=?`).bind(siteId).first();
  let persistedExpiry = String(persisted?.expires_at || "").slice(0, 10);
  if (persistedExpiry !== newExpiry) {
    await env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(newExpiry, siteId).run();
    persistedExpiry = newExpiry;
  }
  const mail = await renewalCompletedEmail(env, row, persistedExpiry);
  return { ok: true, stage: "renewed", old_expiry: oldExpiry, new_expiry: persistedExpiry, renewal_years: years, term_months: term, amount, email: String(row.customer_email || row.admin_email || ""), email_sent: !!mail.ok, email_error: mail.ok ? "" : mail.error || "" };
}
__name(completeRenewal, "completeRenewal");
async function syncCompletedRenewalExpiry(env, siteId) {
  const state = await env.DB.prepare(`
    SELECT ss.expires_at,
           coalesce(sp.renewal_stage,'none') renewal_stage,
           (SELECT max(rh.new_expires_at) FROM renewal_history rh WHERE rh.site_id=ss.site_id) history_expiry
    FROM service_subscriptions ss
    LEFT JOIN service_promotions sp ON sp.site_id=ss.site_id
    WHERE ss.site_id=? LIMIT 1`).bind(siteId).first();
  if (!state || String(state.renewal_stage || "none") !== "renewed") return { changed: false };
  const current = String(state.expires_at || "").slice(0, 10);
  const target = String(state.history_expiry || "").slice(0, 10);
  if (target && (!current || target > current)) {
    await env.DB.prepare(`UPDATE service_subscriptions
      SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP
      WHERE site_id=?`).bind(target, siteId).run();
    return { changed: true, old_expiry: current, new_expiry: target };
  }
  return { changed: false, old_expiry: current, new_expiry: current };
}
__name(syncCompletedRenewalExpiry, "syncCompletedRenewalExpiry");
function cleanDomain(v = "") {
  return String(v).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}
__name(cleanDomain, "cleanDomain");
function activationToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}
__name(activationToken, "activationToken");
async function issuePasswordReset(env, { site, user, origin }) {
  const raw = activationToken(), hash = await sha256(raw);
  await env.DB.prepare(`UPDATE password_reset_tokens SET used_at=datetime('now') WHERE site_id=? AND user_id=? AND used_at IS NULL`).bind(site.id, user.id).run();
  await env.DB.prepare(`INSERT INTO password_reset_tokens(site_id,user_id,token_hash,expires_at) VALUES(?,?,?,datetime('now','+30 minutes'))`).bind(site.id, user.id, hash).run();
  const base = String(origin || `https://${site.domain}`).replace(/\/$/, "");
  const url = `${base}/reset-password/?token=${encodeURIComponent(raw)}&tenant=${encodeURIComponent(site.domain || "")}`;
  const subject = `NEWSREAL: \u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u qu\u1EA3n tr\u1ECB - ${site.name}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#172033;line-height:1.65">
    <div style="padding:26px;border:1px solid #e5eaf2;border-radius:16px;background:#fff">
      <div style="font-size:12px;font-weight:800;color:#1769ff;letter-spacing:.08em">NEWSREAL \xB7 B\u1EA2O M\u1EACT T\xC0I KHO\u1EA2N</div>
      <h2 style="margin:8px 0 14px">\u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u qu\u1EA3n tr\u1ECB</h2>
      <p>Ch\xFAng t\xF4i nh\u1EADn \u0111\u01B0\u1EE3c y\xEAu c\u1EA7u \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u cho website <b>${htmlEsc(site.name)}</b>.</p>
      <p><a href="${htmlEsc(url)}" style="display:inline-block;background:#1769ff;color:#fff;text-decoration:none;padding:13px 20px;border-radius:9px;font-weight:bold">\u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u</a></p>
      <p style="font-size:13px;color:#667085">Li\xEAn k\u1EBFt ch\u1EC9 d\xF9ng \u0111\u01B0\u1EE3c m\u1ED9t l\u1EA7n v\xE0 h\u1EBFt h\u1EA1n sau <b>30 ph\xFAt</b>. N\u1EBFu b\u1EA1n kh\xF4ng y\xEAu c\u1EA7u \u0111\u1ED5i m\u1EADt kh\u1EA9u, h\xE3y b\u1ECF qua email n\xE0y.</p>
      <p style="font-size:13px;color:#667085">NEWSREAL kh\xF4ng g\u1EEDi ho\u1EB7c hi\u1EC3n th\u1ECB m\u1EADt kh\u1EA9u c\u0169 qua email.</p>
    </div>
  </div>`;
  const sent = await sendMail(env, { to: user.email, subject, html });
  if (!sent.ok) {
    await env.DB.prepare(`DELETE FROM password_reset_tokens WHERE token_hash=?`).bind(hash).run();
    return sent;
  }
  return { ...sent, url, email: user.email };
}
__name(issuePasswordReset, "issuePasswordReset");
function defaultTemplateStructure(key) {
  const sec = /* @__PURE__ */ __name((key2, type, title, extra = {}) => ({ key: key2, type, title, ...extra }), "sec");
  const cat = /* @__PURE__ */ __name((i, title, extra = {}) => sec("cat-" + i, "category", title, { category: title, slots: 8, desktop_columns: 4, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", ...extra }), "cat");
  const side = /* @__PURE__ */ __name((root, widgets = []) => ({ root_selector: root, widgets }), "side");
  const sw = /* @__PURE__ */ __name((key2, title, type, slots, selector = "") => ({ key: key2, title, type, slots, selector, empty_policy: "slots" }), "sw");
  const newsStd = { route_contract: "news-v2", card_contract: "title-only-v1", article_contract: "article-first-v1", article_sidebar: { enabled: 1, sticky: 1, internal_scroll: 0 }, homepage_top: { min_stories: 5 }, homepage_sidebar_balance: { enabled: 1, target_section: "latest", max_extra_rows: 3, tolerance_px: 32 } };
  const p = {
    "tin-tuc-1": { ...newsStd, version: 8, content_type: "news", geometry_locked: 1, sidebars: [side(".news-home-sidebar", [sw("popular", "\u0110\u1ECCC NHI\u1EC0U", "ranked", 6, ".news-side-box:nth-child(1)"), sw("categories", "CHUY\xCAN M\u1EE4C", "categories", 8, ".news-side-box:nth-child(2)"), sw("latest", "TIN M\u1EDAI", "latest", 5, ".news-side-box:nth-child(3)")])], sections: [sec("breaking", "breaking", "M\u1EDBi nh\u1EA5t"), sec("hero", "hero", "N\u1ED5i b\u1EADt", { slots: 3 }), sec("topics", "topics", "Chuy\xEAn m\u1EE5c"), sec("latest", "latest", "Tin m\u1EDBi nh\u1EA5t", { slots: 12, slot_contract: "sidebar-balanced", desktop_columns: 3, desktop_rows: 4, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), cat(1, "Kinh t\u1EBF", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), cat(2, "C\xF4ng ngh\u1EC7", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), cat(3, "Du l\u1ECBch", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), cat(4, "S\u1EE9c kh\u1ECFe", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), cat(5, "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), cat(6, "\u0110\u1EDDi s\u1ED1ng", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), sec("explore", "explore", "N\u1ED9i dung kh\xE1c", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("newsletter", "newsletter", "N\u1ED9i dung c\u1EE7a b\u1EA1n, th\u01B0\u01A1ng hi\u1EC7u c\u1EE7a b\u1EA1n")] },
    "tin-tuc-2": { ...newsStd, version: 8, content_type: "news", geometry_locked: 1, sidebars: [side(".np-home-sidebar", [sw("popular", "\u0110\u1ECCC NHI\u1EC0U", "ranked", 6, ".news-side-box:nth-child(1)"), sw("categories", "CHUY\xCAN M\u1EE4C", "categories", 8, ".news-side-box:nth-child(2)"), sw("latest", "TIN M\u1EDAI", "latest", 5, ".news-side-box:nth-child(3)")])], sections: [sec("ticker", "ticker", "Tin n\xF3ng"), sec("hero", "hero", "N\u1ED5i b\u1EADt", { slots: 3 }), sec("latest", "latest", "Tin m\u1EDBi nh\u1EA5t", { slots: 8, slot_contract: "sidebar-balanced", desktop_columns: 2, desktop_rows: 4, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), cat(1, "Kinh t\u1EBF", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), cat(2, "C\xF4ng ngh\u1EC7", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), cat(3, "Du l\u1ECBch", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), cat(4, "S\u1EE9c kh\u1ECFe", { slots: 12, desktop_columns: 4, desktop_rows: 3 }), cat(5, "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", { slots: 12, desktop_columns: 4, desktop_rows: 3 })] },
    "tin-tuc-3": { ...newsStd, version: 9, content_type: "news", geometry_locked: 1, sidebars: [], sections: [sec("editors-pick", "hero", "EDITOR'S PICK \xB7 C\xC2U CHUY\u1EC6N \u0110\xC1NG \u0110\u1ECCC", { slots: 5, desktop_columns: 3, desktop_rows: 2, tablet_columns: 2, mobile_columns: 1, column_mode: "computed", layout_variant: "mosaic-featured-1-plus-4", fill_policy: "natural" }), sec("trending", "trending", "Trending now", { slots: 12, desktop_columns: 6, desktop_rows: 2, tablet_columns: 3, mobile_columns: 2, fill_policy: "complete_rows" }), cat(1, "Kinh t\u1EBF", { slots: 10, desktop_columns: 5, desktop_rows: 2 }), cat(2, "C\xF4ng ngh\u1EC7", { slots: 10, desktop_columns: 5, desktop_rows: 2 }), cat(3, "Du l\u1ECBch", { slots: 10, desktop_columns: 5, desktop_rows: 2 }), cat(4, "S\u1EE9c kh\u1ECFe", { slots: 10, desktop_columns: 5, desktop_rows: 2 }), cat(5, "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", { slots: 10, desktop_columns: 5, desktop_rows: 2 }), sec("weekend", "special", "\u0110\u1ECDc ch\u1EADm, hi\u1EC3u s\xE2u h\u01A1n", { eyebrow: "WEEKEND READ", slots: 8, desktop_columns: 4, desktop_rows: 2, tablet_columns: 2, mobile_columns: 1, column_mode: "fixed", fill_policy: "complete_rows" })] },
    "tin-tuc-4": { ...newsStd, version: 8, content_type: "news", geometry_locked: 1, sidebars: [side("#doc-nhieu", [sw("popular", "\u0110\u1ECDc nhi\u1EC1u", "ranked", 6, "#doc-nhieu")])], sections: [sec("intro", "intro", "Tin t\u1EE9c r\xF5 r\xE0ng, t\u1ED1i gi\u1EA3n v\xE0 t\u1EADp trung v\xE0o n\u1ED9i dung."), sec("lead", "hero", "B\xE0i n\u1ED5i b\u1EADt", { slots: 1, desktop_columns: 1, desktop_rows: 1, fill_policy: "natural" }), sec("latest", "latest", "M\u1EDBi nh\u1EA5t", { slots: 8, desktop_columns: 4, desktop_rows: 2, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), cat(1, "Kinh t\u1EBF", { slots: 8, desktop_columns: 4, desktop_rows: 2 }), cat(2, "C\xF4ng ngh\u1EC7", { slots: 8, desktop_columns: 4, desktop_rows: 2 }), cat(3, "Du l\u1ECBch", { slots: 8, desktop_columns: 4, desktop_rows: 2 }), cat(4, "S\u1EE9c kh\u1ECFe", { slots: 8, desktop_columns: 4, desktop_rows: 2 }), cat(5, "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", { slots: 8, desktop_columns: 4, desktop_rows: 2 })] },
    "mau-1": { version: 5, content_type: "property", geometry_locked: 1, sidebars: [], sections: [sec("hero", "property_hero", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n"), sec("search", "property_search", "T\xECm ki\u1EBFm"), sec("latest", "property_list", "Tin \u0111\u0103ng m\u1EDBi nh\u1EA5t", { slots: 15, desktop_columns: 3, desktop_rows: 5, tablet_columns: 2, mobile_columns: 1, column_mode: "computed", fill_policy: "complete_rows", grid_selector: "#propertyCards" }), sec("needs", "property_categories", "T\xECm nhanh theo nhu c\u1EA7u"), sec("apartment", "property_list", "B\xE1n c\u0103n h\u1ED9 chung c\u01B0", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, column_mode: "computed", fill_policy: "complete_rows", grid_selector: "#apartmentCards" }), sec("sale", "property_list", "B\xE1n nh\xE0 \u0111\u1EA5t", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, column_mode: "computed", fill_policy: "complete_rows", grid_selector: "#saleCards" }), sec("rent", "property_list", "Cho thu\xEA nh\xE0", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, column_mode: "computed", fill_policy: "complete_rows", grid_selector: "#rentCards" }), sec("warehouse", "property_list", "Kho x\u01B0\u1EDFng & m\u1EB7t b\u1EB1ng", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, column_mode: "computed", fill_policy: "complete_rows", grid_selector: "#warehouseCards" }), sec("land", "property_list", "\u0110\u1EA5t n\u1EC1n & \u0111\u1EA5t d\u1EF1 \xE1n", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, column_mode: "computed", fill_policy: "complete_rows", grid_selector: "#landCards" }), sec("news", "news", "Tin th\u1ECB tr\u01B0\u1EDDng & ki\u1EBFn th\u1EE9c", { slots: 8, desktop_columns: 4, desktop_rows: 2, tablet_columns: 2, mobile_columns: 1, column_mode: "computed", fill_policy: "complete_rows" })] },
    "mau-2": { version: 5, content_type: "property", geometry_locked: 1, sidebars: [], sections: [sec("hero", "property_hero", "T\xECm ki\u1EBFm b\u1EA5t \u0111\u1ED9ng s\u1EA3n ph\xF9 h\u1EE3p nhu c\u1EA7u c\u1EE7a b\u1EA1n"), sec("benefits", "benefits", "L\u1EE3i \xEDch"), sec("featured", "property_list", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n n\u1ED5i b\u1EADt", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", grid_selector: "#t2Featured" }), sec("quick-categories", "property_categories", "Kh\xE1m ph\xE1 theo nhu c\u1EA7u"), sec("sale", "property_list", "Mua b\xE1n n\u1ED5i b\u1EADt", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", grid_selector: "#t2SaleGrid" }), sec("rent", "property_list", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n cho thu\xEA", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", grid_selector: "#t2RentGrid" }), sec("local", "property_list", "Nh\xE0 \u0111\u1EA5t theo khu v\u1EF1c", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", grid_selector: "#t2LocalGrid" }), sec("latest", "property_list", "Tin \u0111\u0103ng m\u1EDBi nh\u1EA5t", { slots: 16, desktop_columns: 4, desktop_rows: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", grid_selector: "#t2Latest" }), sec("news", "news", "Tin t\u1EE9c & th\u1ECB tr\u01B0\u1EDDng", { slots: 8, desktop_columns: 4, desktop_rows: 2, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", grid_selector: "#t2News" }), sec("bottom-benefits", "benefits", "H\u1ED7 tr\u1EE3")] },
    "mau-3": { version: 5, content_type: "property", geometry_locked: 1, sidebars: [], sections: [sec("hero", "property_hero", "Kh\xF4ng gian s\u1ED1ng \u0111\xE1ng gi\xE1 m\u1ED7i ng\xE0y"), sec("intro", "property_categories", "Danh m\u1EE5c b\u1EA5t \u0111\u1ED9ng s\u1EA3n"), sec("featured", "property_list", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n n\u1ED5i b\u1EADt", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("projects", "property_projects", "D\u1EF1 \xE1n", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("apartment", "property_list", "C\u0103n h\u1ED9 & chung c\u01B0", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("houses", "property_list", "Nh\xE0 ph\u1ED1 & bi\u1EC7t th\u1EF1", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("rent", "property_list", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n cho thu\xEA", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("land", "property_list", "\u0110\u1EA5t n\u1EC1n & c\u01A1 h\u1ED9i \u0111\u1EA7u t\u01B0", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("services", "services", "D\u1ECBch v\u1EE5"), sec("news", "news", "Tin t\u1EE9c", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" })] },
    "mau-4": { version: 5, content_type: "property", geometry_locked: 1, sidebars: [], sections: [sec("intro", "property_hero", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n r\xF5 r\xE0ng. Quy\u1EBFt \u0111\u1ECBnh d\u1EC5 d\xE0ng."), sec("search", "property_search", "T\xECm ki\u1EBFm"), sec("categories", "property_categories", "Danh m\u1EE5c"), sec("latest", "property_list", "Tin \u0111\u0103ng m\u1EDBi nh\u1EA5t", { slots: 16, desktop_columns: 4, desktop_rows: 4, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("sale", "property_list", "Nh\xE0 \u0111\u1EA5t \u0111ang b\xE1n", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("projects", "property_projects", "D\u1EF1 \xE1n", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("apartment", "property_list", "C\u0103n h\u1ED9 \u0111\u01B0\u1EE3c quan t\xE2m", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("house", "property_list", "Nh\xE0 ph\u1ED1 & bi\u1EC7t th\u1EF1", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("rent", "property_list", "Cho thu\xEA n\u1ED5i b\u1EADt", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("land", "property_list", "\u0110\u1EA5t n\u1EC1n & d\u1EF1 \xE1n", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("stats", "stats", "Th\u1ED1ng k\xEA"), sec("services", "services", "D\u1ECBch v\u1EE5"), sec("news", "news", "Tin t\u1EE9c", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" })] },
    "mau-5": { version: 5, content_type: "property", geometry_locked: 1, sidebars: [], sections: [sec("hero", "property_hero", "T\xECm \u0111\xFAng n\u01A1i. S\u1ED1ng \u0111\xFAng ch\u1EA5t."), sec("areas", "property_areas", "N\u01A1i b\u1EA1n mu\u1ED1n s\u1ED1ng", { slots: 8, desktop_columns: 4, desktop_rows: 2, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("featured", "property_list", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n n\u1ED5i b\u1EADt", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("projects", "property_projects", "D\u1EF1 \xE1n", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("latest", "property_list", "Nh\xE0 \u0111\u1EA5t m\u1EDBi l\xEAn", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("apartment", "property_list", "C\u0103n h\u1ED9 th\xE0nh th\u1ECB", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("sale-rent", "property_split", "Mua b\xE1n & Cho thu\xEA", { slots: 12, desktop_columns: 2, tablet_columns: 1, mobile_columns: 1, fill_policy: "complete_rows" }), sec("house", "property_list", "Nh\xE0 ph\u1ED1 & bi\u1EC7t th\u1EF1", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("land", "property_list", "\u0110\u1EA5t n\u1EC1n & d\u1EF1 \xE1n", { slots: 12, desktop_columns: 4, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" }), sec("services", "services", "D\u1ECBch v\u1EE5"), sec("news", "news", "Tin t\u1EE9c", { slots: 9, desktop_columns: 3, desktop_rows: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows" })] },
    "dich-vu-1": { version: 8, layout_contract: "universal-layout-v1", content_type: "service", geometry_locked: 1, sidebars: [], sections: [sec("hero", "section", "Gi\u1EA3i ph\xE1p FPT", { content_source: "none", bind_required: 0 }), sec("needs", "section", "Ch\u1ECDn theo nhu c\u1EA7u", { content_source: "none", bind_required: 0 }), sec("internet", "category", "Internet FPT", { category: "Internet FPT", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("tv", "category", "Truy\u1EC1n h\xECnh FPT", { category: "Truy\u1EC1n h\xECnh FPT", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("camera", "category", "Camera FPT", { category: "Camera FPT", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("combo", "category", "Combo FPT", { category: "Combo FPT", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("advice", "section", "C\u1EA9m nang d\u1ECBch v\u1EE5", { content_source: "none", bind_required: 0 }), sec("contact", "section", "\u0110\u0103ng k\xFD t\u01B0 v\u1EA5n", { content_source: "none", bind_required: 0 })] },
    "dich-vu-2": { version: 8, layout_contract: "universal-layout-v1", content_type: "service", geometry_locked: 1, sidebars: [], sections: [sec("hero", "section", "Gi\u1EA3i ph\xE1p VNPT", { content_source: "none", bind_required: 0 }), sec("needs", "section", "Ch\u1ECDn theo nhu c\u1EA7u", { content_source: "none", bind_required: 0 }), sec("internet", "category", "Internet VNPT", { category: "Internet VNPT", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1, slot_hosts: [{ selector: ".vnpt-feature-pack", slots: 1 }, { selector: ".vnpt-pack-list", slots: 5 }] }), sec("tv", "category", "Truy\u1EC1n h\xECnh MyTV", { category: "Truy\u1EC1n h\xECnh MyTV", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("camera", "category", "Camera VNPT", { category: "Camera VNPT", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("combo", "category", "Combo VNPT", { category: "Combo VNPT", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("advice", "section", "C\u1EA9m nang d\u1ECBch v\u1EE5", { content_source: "none", bind_required: 0 }), sec("contact", "section", "\u0110\u0103ng k\xFD t\u01B0 v\u1EA5n", { content_source: "none", bind_required: 0 })] },
    "dich-vu-3": { version: 8, layout_contract: "universal-layout-v1", content_type: "service", geometry_locked: 1, sidebars: [], sections: [sec("hero", "section", "Gi\u1EA3i ph\xE1p Viettel", { content_source: "none", bind_required: 0 }), sec("needs", "section", "Ch\u1ECDn theo nhu c\u1EA7u", { content_source: "none", bind_required: 0 }), sec("combo", "category", "Combo Viettel", { category: "Combo Viettel", slots: 6, desktop_columns: 2, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("internet", "category", "Internet Viettel", { category: "Internet Viettel", slots: 6, desktop_columns: 2, tablet_columns: 1, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("tv", "category", "Truy\u1EC1n h\xECnh TV360", { category: "Truy\u1EC1n h\xECnh TV360", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("camera", "category", "Camera Viettel", { category: "Camera Viettel", slots: 6, desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("advice", "section", "C\u1EA9m nang d\u1ECBch v\u1EE5", { content_source: "none", bind_required: 0 }), sec("contact", "section", "\u0110\u0103ng k\xFD t\u01B0 v\u1EA5n", { content_source: "none", bind_required: 0 })] },
    "dich-vu-4": { version: 9, layout_contract: "universal-layout-v1", content_type: "service", geometry_locked: 1, route_contract: "service-commerce-v2", card_contract: "camera-product-card-v1", article_contract: "service-detail-v2", lead_contract: "service-lead-v1", sidebars: [], sections: [sec("hero", "section", "Camera & gi\u1EA3i ph\xE1p an ninh", { content_source: "none", bind_required: 0 }), sec("brands", "section", "Th\u01B0\u01A1ng hi\u1EC7u n\u1ED5i b\u1EADt", { content_source: "none", bind_required: 0 }), sec("indoor", "category", "Camera Wi-Fi trong nh\xE0", { category: "Camera Wi-Fi trong nh\xE0", slots: 6, slot_contract: "exact", desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("outdoor", "category", "Camera ngo\xE0i tr\u1EDDi", { category: "Camera ngo\xE0i tr\u1EDDi", slots: 6, slot_contract: "exact", desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("ai", "category", "Camera AI quay qu\xE9t", { category: "Camera AI quay qu\xE9t", slots: 6, slot_contract: "exact", desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("pro", "category", "Camera IP & b\u1ED9 gi\xE1m s\xE1t", { category: "Camera IP & b\u1ED9 gi\xE1m s\xE1t", slots: 6, slot_contract: "exact", desktop_columns: 3, tablet_columns: 2, mobile_columns: 1, fill_policy: "complete_rows", bind_required: 1 }), sec("advice", "section", "C\u1EA9m nang camera", { content_source: "none", bind_required: 0 }), sec("contact", "section", "Nh\u1EADn t\u01B0 v\u1EA5n & b\xE1o gi\xE1", { content_source: "none", bind_required: 0 })] },
    "san-pham-1": { version: 1, layout_contract: "universal-layout-v1", content_type: "product", geometry_locked: 1, route_contract: "product-catalog-v1", card_contract: "product-title-price-v1", article_contract: "product-detail-v1", sidebars: [], settings_schema: [{ key: "product_cta_label", label: "Nh\xE3n n\xFAt mua h\xE0ng", type: "text", default: "Mua Ngay" }, { key: "product_affiliate_note", label: "Ghi ch\xFA affiliate", type: "textarea", default: "Website c\xF3 th\u1EC3 nh\u1EADn hoa h\u1ED3ng khi ng\u01B0\u1EDDi xem mua h\xE0ng qua li\xEAn k\u1EBFt gi\u1EDBi thi\u1EC7u." }], sections: [sec("hero", "section", "Product Store", { content_source: "none", bind_required: 0 }), sec("categories", "section", "Danh m\u1EE5c s\u1EA3n ph\u1EA9m", { content_source: "none", bind_required: 0 }), sec("featured", "category", "S\u1EA3n ph\u1EA9m n\u1ED5i b\u1EADt", { slots: 10, desktop_columns: 5, tablet_columns: 3, mobile_columns: 2, fill_policy: "complete_rows", bind_required: 1 }), sec("electronics", "category", "\u0110i\u1EC7n t\u1EED & C\xF4ng ngh\u1EC7", { category: "\u0110i\u1EC7n t\u1EED & C\xF4ng ngh\u1EC7", slots: 5, desktop_columns: 5, tablet_columns: 3, mobile_columns: 2, fill_policy: "complete_rows", bind_required: 1 }), sec("home", "category", "Nh\xE0 c\u1EEDa & \u0110\u1EDDi s\u1ED1ng", { category: "Nh\xE0 c\u1EEDa & \u0110\u1EDDi s\u1ED1ng", slots: 5, desktop_columns: 5, tablet_columns: 3, mobile_columns: 2, fill_policy: "complete_rows", bind_required: 1 }), sec("beauty", "category", "Th\u1EDDi trang & L\xE0m \u0111\u1EB9p", { category: "Th\u1EDDi trang & L\xE0m \u0111\u1EB9p", slots: 5, desktop_columns: 5, tablet_columns: 3, mobile_columns: 2, fill_policy: "complete_rows", bind_required: 1 }), sec("baby", "category", "M\u1EB9 & B\xE9", { category: "M\u1EB9 & B\xE9", slots: 5, desktop_columns: 5, tablet_columns: 3, mobile_columns: 2, fill_policy: "complete_rows", bind_required: 1 })] },
    "game-1": { version: 17, layout_contract: "universal-layout-v1", content_type: "game", geometry_locked: 1, route_contract: "game-community-base-v1", card_contract: "game-base-card-one-line-v6", article_contract: "game-base-detail-v7", article_sidebar_contract: "game-unified-sticky-sidebar-v3", navigation_contract: "game-mobile-hamburger-v2", saved_contract: "local-first-saved-toast-v2", filter_contract: "smart-progressive-filter-v4", pagination_contract: "game-results-pagination-v1", mobile_results_contract: "two-column-mobile-v1", related_contract: "same-group-level-visible-v2", boot_contract: "game-runtime-symbol-complete-v3", mobile_cta_contract: "sticky-copy-v1", preference_contract: "remember-hall-v1", stats_contract: "cloudflare-d1-batch-v1", settings_contract: "template-personalization-v1", hero_contract: "daily-hero-skin-rotation-v2", settings_schema: [{ key: "donate_url", label: "Link Donate / Buy Me a Coffee", type: "url", placeholder: "https://buymeacoffee.com/ten-cua-ban", default: "https://buymeacoffee.com/cocbase", help: "N\xFAt Donate tr\xEAn header, footer v\xE0 n\xFAt n\u1ED5i s\u1EBD d\xF9ng link n\xE0y." }, { key: "about_title", label: "Ti\xEAu \u0111\u1EC1 trang Th\xF4ng tin", type: "text", default: "About COC Base Portal" }, { key: "about_content", label: "N\u1ED9i dung trang Th\xF4ng tin", type: "textarea", default: "Th\u01B0 vi\u1EC7n base c\u1ED9ng \u0111\u1ED3ng d\xE0nh cho Town Hall, Builder Hall v\xE0 Clan Capital." }, { key: "terms_title", label: "Ti\xEAu \u0111\u1EC1 trang \u0110i\u1EC1u kho\u1EA3n", type: "text", default: "\u0110i\u1EC1u kho\u1EA3n s\u1EED d\u1EE5ng" }, { key: "terms_content", label: "N\u1ED9i dung \u0110i\u1EC1u kho\u1EA3n", type: "textarea", default: "Base \u0111\u01B0\u1EE3c chia s\u1EBB cho c\u1ED9ng \u0111\u1ED3ng. Ng\u01B0\u1EDDi d\xF9ng t\u1EF1 ch\u1ECBu tr\xE1ch nhi\u1EC7m khi s\u1EED d\u1EE5ng li\xEAn k\u1EBFt b\xEAn th\u1EE9 ba." }, { key: "footer_text", label: "Th\xF4ng tin ng\u1EAFn d\u01B0\u1EDBi Footer", type: "textarea", default: "Community Clash of Clans base sharing \xB7 Not affiliated with Supercell." }], sidebars: [], sections: [sec("hero", "section", "Clash of Clans Community Base Portal", { content_source: "none", bind_required: 0 }), sec("filters", "section", "B\u1ED9 l\u1ECDc Base", { content_source: "none", bind_required: 0 }), sec("town-hall", "category", "Town Hall", { category: "Town Hall", slots: 17, slot_contract: "exact", desktop_columns: 4, tablet_columns: 3, mobile_columns: 2, fill_policy: "complete_rows", bind_required: 1 }), sec("builder-hall", "category", "Builder Hall", { category: "Builder Hall", slots: 9, slot_contract: "exact", desktop_columns: 4, tablet_columns: 2, mobile_columns: 2, fill_policy: "complete_rows", bind_required: 1 }), sec("clan-capital", "category", "Clan Capital", { category: "Clan Capital", slots: 10, slot_contract: "exact", desktop_columns: 4, tablet_columns: 2, mobile_columns: 2, fill_policy: "complete_rows", bind_required: 1 })] }
  };
  return p[String(key || "")] || { version: 5, content_type: "generic", geometry_locked: 0, sidebars: [], sections: [] };
}
__name(defaultTemplateStructure, "defaultTemplateStructure");
function structureSectionDefaults(type = "section") {
  const t = String(type || "section");
  const staticTypes = /* @__PURE__ */ new Set(["section", "intro", "topics", "property_search", "property_categories", "benefits", "newsletter", "services", "stats"]);
  const sourceMap = { category: "category", latest: "latest", breaking: "latest", ticker: "latest", trending: "latest", hero: "featured", special: "featured", explore: "latest", property_list: "property", property_projects: "projects", property_split: "property", property_areas: "property", news: "news", property_hero: "featured" };
  const bindRequired = !staticTypes.has(t);
  return { bind_required: bindRequired ? 1 : 0, content_source: sourceMap[t] || (bindRequired ? "auto" : "none") };
}
__name(structureSectionDefaults, "structureSectionDefaults");
function normalizeStructureProfile(raw, key, contentType = "generic") {
  let p = {};
  try {
    p = raw && typeof raw === "object" ? raw : JSON.parse(String(raw || "{}"));
  } catch (e) {
    p = {};
  }
  if (!Array.isArray(p.sections) || !p.sections.length) p = defaultTemplateStructure(key);
  p.version = Math.max(4, Number(p.version || 1));
  p.content_type = String(p.content_type || contentType || "generic");
  p.layout_contract = String(p.layout_contract || "universal-layout-v1");
  if (p.content_type === "news") {
    p.route_contract = "news-v2";
    p.card_contract = "title-only-v1";
    p.article_contract = "article-first-v1";
    p.article_sidebar = { enabled: 1, sticky: 1, internal_scroll: 0, ...p.article_sidebar && typeof p.article_sidebar === "object" ? p.article_sidebar : {} };
    p.article_sidebar.enabled = 1;
    p.article_sidebar.sticky = 1;
    p.article_sidebar.internal_scroll = 0;
    p.homepage_sidebar_balance = { enabled: 1, target_section: "latest", max_extra_rows: 3, tolerance_px: 32, ...p.homepage_sidebar_balance && typeof p.homepage_sidebar_balance === "object" ? p.homepage_sidebar_balance : {} };
    p.homepage_sidebar_balance.enabled = Number(p.homepage_sidebar_balance.enabled || 0) ? 1 : 0;
  }
  p.geometry_locked = Number(p.geometry_locked || 0) ? 1 : 0;
  p.sidebars = (Array.isArray(p.sidebars) ? p.sidebars : []).slice(0, 8).map((sb, si) => ({
    root_selector: String(sb?.root_selector || "").slice(0, 180),
    widgets: (Array.isArray(sb?.widgets) ? sb.widgets : []).slice(0, 12).map((w, wi) => ({ key: String(w?.key || `widget-${wi + 1}`).slice(0, 80), title: String(w?.title || "").slice(0, 120), type: String(w?.type || "list").slice(0, 60), slots: Math.max(0, Math.min(30, Number(w?.slots || 0))), selector: String(w?.selector || "").slice(0, 180), empty_policy: ["slots", "message", "hide"].includes(String(w?.empty_policy || "")) ? String(w.empty_policy) : "slots" }))
  }));
  p.sections = (p.sections || []).slice(0, 80).map((x, i) => {
    const type = String(x?.type || "section").slice(0, 60), defs = structureSectionDefaults(type);
    const slots = Math.max(0, Math.min(60, Number(x?.slots || x?.limit || 0)));
    const desktop = Math.max(1, Math.min(6, Number(x?.desktop_columns || x?.columns || 1)));
    const slotHosts = (Array.isArray(x?.slot_hosts) ? x.slot_hosts : []).slice(0, 12).map((h) => ({ selector: String(h?.selector || "").slice(0, 180), slots: Math.max(0, Math.min(60, Number(h?.slots || 0))) })).filter((h) => h.selector && h.slots > 0);
    const exactSlots = slotHosts.length ? slotHosts.reduce((s, h) => s + h.slots, 0) : slots;
    return { key: String(x?.key || `section-${i + 1}`).slice(0, 80), type, title: String(x?.title || "").slice(0, 160), category: String(x?.category || "").slice(0, 120), eyebrow: String(x?.eyebrow || "").slice(0, 120), limit: Math.max(0, Math.min(60, Number(x?.limit || 0))), slots: exactSlots, slot_contract: p.content_type === "news" && String(x?.slot_contract || "") === "sidebar-balanced" ? "sidebar-balanced" : "exact", slot_hosts: slotHosts, layout_variant: String(x?.layout_variant || "").slice(0, 80), column_mode: ["computed", "fixed"].includes(String(x?.column_mode || "")) ? String(x.column_mode) : "fixed", desktop_columns: desktop, tablet_columns: Math.max(1, Math.min(4, Number(x?.tablet_columns || Math.min(2, desktop)))), mobile_columns: Math.max(1, Math.min(2, Number(x?.mobile_columns || 1))), fill_policy: ["complete_rows", "natural"].includes(String(x?.fill_policy || "")) ? String(x.fill_policy) : defs.bind_required ? "complete_rows" : "natural", grid_selector: String(x?.grid_selector || "").slice(0, 180), content_source: String(x?.content_source || defs.content_source).slice(0, 60), bind_required: x?.bind_required === false || Number(x?.bind_required) === 0 ? 0 : defs.bind_required, empty_policy: ["slots", "message", "hide"].includes(String(x?.empty_policy || "")) ? String(x.empty_policy) : defs.bind_required ? "slots" : "message" };
  });
  return p;
}
__name(normalizeStructureProfile, "normalizeStructureProfile");
function nrUniqueLabels(values = []) {
  const out = [], seen = /* @__PURE__ */ new Set();
  for (const v of values || []) {
    const x = String(v || "").trim();
    if (!x) continue;
    const k = x.toLocaleLowerCase("vi");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}
__name(nrUniqueLabels, "nrUniqueLabels");
var NR_NEWS_TAXONOMY_V1 = ["Kinh t\u1EBF", "C\xF4ng ngh\u1EC7", "Kinh doanh", "T\xE0i ch\xEDnh", "Th\u1EBF gi\u1EDBi", "X\xE3 h\u1ED9i", "Gi\xE1o d\u1EE5c", "S\u1EE9c kh\u1ECFe", "\u0110\u1EDDi s\u1ED1ng", "Du l\u1ECBch", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "Ph\xE1p lu\u1EADt", "V\u0103n h\xF3a", "Gi\u1EA3i tr\xED", "Th\u1EC3 thao", "Khoa h\u1ECDc", "Xe", "Nh\xE0 \u0111\u1EB9p"];
function templateCategoryContract(structure, editorProfile = {}, contentType = "generic") {
  const sp = structure && typeof structure === "object" ? structure : {};
  const ep = editorProfile && typeof editorProfile === "object" ? { ...editorProfile } : {};
  const sections = Array.isArray(sp.sections) ? sp.sections : [];
  const type = String(contentType || ep.content_type || sp.content_type || "generic").toLowerCase();
  if (type === "news") {
    const structural2 = nrUniqueLabels(sections.filter((sec) => String(sec?.type || "").toLowerCase() === "category" || String(sec?.content_source || "").toLowerCase() === "category").map((sec) => String(sec?.category || sec?.title || "").trim()));
    ep.content_type = "news";
    ep.id = String(ep.id || "news");
    ep.categories = nrUniqueLabels([...structural2 || [], ...Array.isArray(ep.categories) ? ep.categories : [], ...NR_NEWS_TAXONOMY_V1]);
    delete ep.categoriesByTransaction;
    ep.category_contract = "news-taxonomy-v1";
    return ep;
  }
  if (type === "property") {
    const current = ep.categoriesByTransaction && typeof ep.categoriesByTransaction === "object" ? ep.categoriesByTransaction : {};
    const buy = [], sale = [], rent = [];
    for (const sec of sections) {
      const st = String(sec?.type || "").toLowerCase();
      if (!["property_list", "property_projects", "property_split"].includes(st)) continue;
      const title = String(sec?.category || sec?.title || "").trim();
      if (!title) continue;
      const low = title.toLocaleLowerCase("vi");
      if (/thuê/.test(low)) rent.push(title);
      else if (/bán|mua|căn hộ|chung cư|nhà phố|biệt thự|đất|kho|xưởng|mặt bằng|shophouse|dự án/.test(low)) sale.push(title);
    }
    const buyLabel = /* @__PURE__ */ __name((v) => {
      const x = String(v || "").trim();
      if (!x) return "";
      if (/^bán\s+/i.test(x)) return x.replace(/^bán\s+/i, "Mua ");
      if (/^mua\s*bán\s*/i.test(x)) return x.replace(/^mua\s*bán\s*/i, "Mua ");
      return "Mua " + x.charAt(0).toLocaleLowerCase("vi") + x.slice(1);
    }, "buyLabel");
    buy.push(...sale.map(buyLabel).filter(Boolean));
    ep.content_type = "property";
    ep.id = String(ep.id || "property");
    ep.categoriesByTransaction = {
      buy: nrUniqueLabels([...buy, ...Array.isArray(current.buy) ? current.buy : []]),
      sale: nrUniqueLabels([...sale, ...Array.isArray(current.sale) ? current.sale : []]),
      rent: nrUniqueLabels([...rent, ...Array.isArray(current.rent) ? current.rent : []])
    };
    delete ep.categories;
    ep.category_contract = "template-structure-v1";
    return ep;
  }
  const structural = nrUniqueLabels(sections.filter((sec) => String(sec?.type || "").toLowerCase() === "category" || String(sec?.content_source || "").toLowerCase() === "category").map((sec) => String(sec?.category || sec?.title || "").trim()));
  if (structural.length) ep.categories = structural;
  else ep.categories = nrUniqueLabels(ep.categories || []);
  ep.category_contract = "template-structure-v1";
  return ep;
}
__name(templateCategoryContract, "templateCategoryContract");
function validateStructureProfile(p, { active = 0 } = {}) {
  const errors = [], warnings = [];
  const sections = Array.isArray(p?.sections) ? p.sections : [];
  if (!sections.length) errors.push("Template ch\u01B0a c\xF3 section n\xE0o trong structure_profile.");
  const keys = /* @__PURE__ */ new Set();
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i] || {}, label = sec.title || sec.key || `Section ${i + 1}`, key = String(sec.key || "").trim();
    if (!key) errors.push(`${label}: thi\u1EBFu key.`);
    else if (keys.has(key)) errors.push(`${label}: key "${key}" b\u1ECB tr\xF9ng.`);
    else keys.add(key);
    const bind = Number(sec.bind_required || 0) === 1;
    const slots = Math.max(0, Number(sec.slots || 0)), dc = Math.max(1, Number(sec.desktop_columns || 1)), tc = Math.max(1, Number(sec.tablet_columns || 1)), mc = Math.max(1, Number(sec.mobile_columns || 1));
    if (bind && slots < 1) errors.push(`${label}: section nh\u1EADn n\u1ED9i dung ph\u1EA3i c\xF3 slots > 0.`);
    if (bind && dc > slots && slots > 0) errors.push(`${label}: desktop_columns (${dc}) l\u1EDBn h\u01A1n slots (${slots}).`);
    if (bind && String(sec.fill_policy) === "complete_rows" && slots > 0 && slots % dc !== 0) errors.push(`${label}: slots (${slots}) ph\u1EA3i chia h\u1EBFt cho desktop_columns (${dc}) \u0111\u1EC3 lu\xF4n full h\xE0ng.`);
    if (bind && slots > 0 && tc > slots) warnings.push(`${label}: tablet_columns l\u1EDBn h\u01A1n slots.`);
    if (bind && slots > 0 && mc > slots) warnings.push(`${label}: mobile_columns l\u1EDBn h\u01A1n slots.`);
    if (String(sec.content_source) === "category" && !String(sec.category || "").trim()) errors.push(`${label}: content_source=category nh\u01B0ng ch\u01B0a khai b\xE1o category.`);
    if (bind && String(sec.empty_policy || "") === "hide") warnings.push(`${label}: empty_policy=hide s\u1EBD l\xE0m m\u1EA5t khung khi website ch\u01B0a c\xF3 b\xE0i.`);
  }
  for (const [si, sb] of (Array.isArray(p?.sidebars) ? p.sidebars : []).entries()) {
    if (!String(sb?.root_selector || "").trim()) errors.push(`Sidebar ${si + 1}: thi\u1EBFu root_selector.`);
    for (const [wi, w] of (Array.isArray(sb?.widgets) ? sb.widgets : []).entries()) {
      const label = w?.title || w?.key || `Widget ${wi + 1}`;
      if (!String(w?.key || "").trim()) errors.push(`Sidebar ${si + 1} / ${label}: thi\u1EBFu key.`);
      if (["ranked", "latest", "list"].includes(String(w?.type || "")) && Number(w?.slots || 0) < 1) errors.push(`Sidebar ${si + 1} / ${label}: widget n\u1ED9i dung ph\u1EA3i c\xF3 slots > 0.`);
    }
  }
  if (Number(p?.version || 0) < 4) errors.push("Structure schema ph\u1EA3i l\xE0 version 4 tr\u1EDF l\xEAn.");
  if (active && errors.length) warnings.push("Template \u0111ang b\u1EADt b\xE1n nh\u01B0ng structure ch\u01B0a \u0111\u1EA1t chu\u1EA9n.");
  return { ok: errors.length === 0, errors, warnings };
}
__name(validateStructureProfile, "validateStructureProfile");
async function masterOK(env, req) {
  if (!env.MASTER_KEY) return false;
  const auth = req.headers.get("Authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const t = bearer || cookies(req).nr_master_session || "";
  if (!t) return false;
  return t === await sha256("newsreal-master:" + env.MASTER_KEY);
}
__name(masterOK, "masterOK");
async function syncFinancialLedger(env) {
  await env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note)
    SELECT s.id,'initial','paid',coalesce(sp.first_price,ss.sale_price,0),coalesce(ss.internal_cost,0),coalesce(cp.order_code,''),
      'Thanh to\xE1n k\xEDch ho\u1EA1t l\u1EA7n \u0111\u1EA7u',ss.started_at,ss.expires_at,coalesce(ss.started_at,cp.activated_at,ss.updated_at,CURRENT_TIMESTAMP),'initial:'||s.id,'T\u1EF1 \u0111\u1ED3ng b\u1ED9 t\u1EEB tr\u1EA1ng th\xE1i d\u1ECBch v\u1EE5'
    FROM sites s JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    WHERE ss.payment_status='paid' AND coalesce(ss.finance_excluded,0)=0
      AND NOT EXISTS(SELECT 1 FROM financial_transactions ft WHERE ft.unique_key='initial:'||s.id)`).run();
  await env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note)
    SELECT rh.site_id,'renewal','paid',rh.amount,coalesce(ss.internal_cost,0),coalesce(rh.order_code,''),'Gia h\u1EA1n d\u1ECBch v\u1EE5',rh.old_expires_at,rh.new_expires_at,
      coalesce(rh.paid_at,rh.completed_at,rh.created_at),'renewal:'||rh.site_id||':'||rh.old_expires_at,'T\u1EF1 \u0111\u1ED3ng b\u1ED9 t\u1EEB l\u1ECBch s\u1EED gia h\u1EA1n'
    FROM renewal_history rh LEFT JOIN service_subscriptions ss ON ss.site_id=rh.site_id
    WHERE coalesce(ss.finance_excluded,0)=0
      AND NOT EXISTS(SELECT 1 FROM financial_transactions ft WHERE ft.unique_key='renewal:'||rh.site_id||':'||rh.old_expires_at)`).run();
}
__name(syncFinancialLedger, "syncFinancialLedger");
function trialPublicState(row) {
  if (!row) return null;
  const now = Date.now(), end = Date.parse(String(row.expires_at || "").replace(" ", "T") + "Z");
  const expired = Number.isFinite(end) && end <= now;
  return {
    id: Number(row.id),
    token: row.trial_token,
    template_key: row.template_key,
    status: expired && row.status === "active" ? "expired" : row.status,
    started_at: row.started_at,
    expires_at: row.expires_at,
    grace_expires_at: row.grace_expires_at,
    expired,
    remaining_seconds: expired ? 0 : Math.max(0, Math.floor((end - now) / 1e3)),
    site_id: Number(row.site_id),
    lead_id: Number(row.lead_id),
    tenant: row.domain || ""
  };
}
__name(trialPublicState, "trialPublicState");
async function trialByToken(env, token) {
  const row = await env.DB.prepare(`SELECT wt.*,s.domain,s.name,s.preset,s.template_key site_template_key,sl.customer_name,sl.phone,sl.email,sl.zalo,sl.company,sl.facebook,sl.site_name,sl.note,sl.marketing_opt_in,sl.template_name,
      tc.price template_price,tc.renewal_price template_renewal_price,tc.demo_url template_demo_url,tc.category template_category
    FROM website_trials wt JOIN sites s ON s.id=wt.site_id LEFT JOIN sales_leads sl ON sl.id=wt.lead_id LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.trial_token=? LIMIT 1`).bind(String(token || "")).first();
  if (!row) return null;
  const st = trialPublicState(row);
  if (st.expired && row.status === "active") {
    await env.DB.prepare(`UPDATE website_trials SET status='expired',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(row.id).run();
    row.status = "expired";
  }
  return row;
}
__name(trialByToken, "trialByToken");
async function trialEvent(env, trial, eventType, data = {}) {
  if (!trial) return;
  const lowValue = eventType === "trial_seen" || eventType === "api_write";
  const payload = JSON.stringify(data || {});
  if (lowValue) {
    try {
      await env.DB.prepare(`INSERT INTO trial_events(trial_id,lead_id,event_type,event_data)
      SELECT ?,?,?,? WHERE NOT EXISTS(
        SELECT 1 FROM trial_events
        WHERE trial_id=? AND event_type=? AND created_at>=datetime('now','-10 minutes')
        LIMIT 1
      )`).bind(trial.id, trial.lead_id, eventType, payload, trial.id, eventType).run();
    } catch (e) {
    }
    try {
      await env.DB.prepare(`UPDATE website_trials SET last_seen_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP
      WHERE id=? AND (last_seen_at IS NULL OR last_seen_at<datetime('now','-5 minutes'))`).bind(trial.id).run();
    } catch (e) {
    }
    try {
      await env.DB.prepare(`UPDATE sales_leads SET last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP
      WHERE id=? AND (last_activity_at IS NULL OR last_activity_at<datetime('now','-5 minutes'))`).bind(trial.lead_id).run();
    } catch (e) {
    }
    return;
  }
  try {
    await env.DB.prepare(`INSERT INTO trial_events(trial_id,lead_id,event_type,event_data) VALUES(?,?,?,?)`).bind(trial.id, trial.lead_id, eventType, payload).run();
  } catch (e) {
  }
  try {
    await env.DB.prepare(`UPDATE website_trials SET last_seen_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(trial.id).run();
  } catch (e) {
  }
  try {
    await env.DB.prepare(`UPDATE sales_leads SET last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(trial.lead_id).run();
  } catch (e) {
  }
}
__name(trialEvent, "trialEvent");
async function masterOverview(env) {
  const [siteAgg, postAgg, todayAgg] = await env.DB.batch([
    env.DB.prepare(`WITH trial_sites AS (SELECT DISTINCT site_id FROM website_trials)
      SELECT count(*) sites,
             coalesce(sum(CASE WHEN s.status='active' THEN 1 ELSE 0 END),0) active
      FROM sites s LEFT JOIN trial_sites t ON t.site_id=s.id
      WHERE t.site_id IS NULL`),
    env.DB.prepare(`SELECT count(*) posts,coalesce(sum(views),0) views FROM posts`),
    env.DB.prepare(`SELECT count(*) today FROM pageviews WHERE created_at>=datetime('now','start of day')`)
  ]);
  const sr = siteAgg?.results?.[0] || {}, pr = postAgg?.results?.[0] || {}, tr = todayAgg?.results?.[0] || {};
  return { sites: Number(sr.sites || 0), active: Number(sr.active || 0), posts: Number(pr.posts || 0), views: Number(pr.views || 0), today: Number(tr.today || 0) };
}
__name(masterOverview, "masterOverview");
var DEMO_CONTENT = [["property", "C\u0103n h\u1ED9 2 ph\xF2ng ng\u1EE7 view h\u1ED3 t\u1EA1i Vinhomes Ocean Park", "B\xE1n c\u0103n h\u1ED9 chung c\u01B0", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=82", "4,25 t\u1EF7", "72 m\xB2", "Khu \u0111\xF4 th\u1ECB Vinhomes Ocean Park, Gia L\xE2m, H\xE0 N\u1ED9i", "0903668899", "sale", "Chung c\u01B0", "59 tri\u1EC7u/m\xB2", 2, 2, 1, "\u0110\xF4ng Nam", "S\u1ED5 h\u1ED3ng l\xE2u d\xE0i", "Full n\u1ED9i th\u1EA5t", "H\xE0 N\u1ED9i", "Gia L\xE2m", "\u0110a T\u1ED1n", "Nguy\u1EC5n Minh Anh", 1, 1, "DEMO-CH-001", ""], ["property", "B\xE1n c\u0103n h\u1ED9 3 ph\xF2ng ng\u1EE7 trung t\xE2m C\u1EA7u Gi\u1EA5y, n\u1ED9i th\u1EA5t \u0111\u1EB9p", "B\xE1n c\u0103n h\u1ED9 chung c\u01B0", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=82", "6,8 t\u1EF7", "108 m\xB2", "\u0110\u01B0\u1EDDng Tr\u1EA7n Th\xE1i T\xF4ng, C\u1EA7u Gi\u1EA5y, H\xE0 N\u1ED9i", "0988123456", "sale", "Chung c\u01B0", "63 tri\u1EC7u/m\xB2", 3, 2, 1, "Nam", "S\u1ED5 h\u1ED3ng", "N\u1ED9i th\u1EA5t cao c\u1EA5p", "H\xE0 N\u1ED9i", "C\u1EA7u Gi\u1EA5y", "D\u1ECBch V\u1ECDng", "Tr\u1EA7n Qu\u1ED1c Huy", 0, 1, "DEMO-CH-002", ""], ["property", "Nh\xE0 ph\u1ED1 5 t\u1EA7ng m\u1EB7t ph\u1ED1 L\xEA Ch\xE2n, H\u1EA3i Ph\xF2ng, kinh doanh t\u1ED1t", "B\xE1n nh\xE0 \u0111\u1EA5t", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82", "9,6 t\u1EF7", "86 m\xB2", "L\xEA Ch\xE2n, H\u1EA3i Ph\xF2ng", "03899862876", "sale", "Nh\xE0 ph\u1ED1", "112 tri\u1EC7u/m\xB2", 5, 5, 5, "\u0110\xF4ng B\u1EAFc", "S\u1ED5 \u0111\u1ECF", "C\u01A1 b\u1EA3n", "H\u1EA3i Ph\xF2ng", "L\xEA Ch\xE2n", "D\u01B0 H\xE0ng", "V\u01B0\u01A1ng Ho\xE0ng", 1, 1, "DEMO-NP-001", "5,2 m"], ["property", "Bi\u1EC7t th\u1EF1 song l\u1EADp khu \u0111\xF4 th\u1ECB Vinhomes Riverside, ho\xE0n thi\u1EC7n \u0111\u1EB9p", "B\xE1n nh\xE0 \u0111\u1EA5t", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=82", "29 t\u1EF7", "180 m\xB2", "Long Bi\xEAn, H\xE0 N\u1ED9i", "0912555888", "sale", "Bi\u1EC7t th\u1EF1", "161 tri\u1EC7u/m\xB2", 4, 5, 3, "T\xE2y B\u1EAFc", "S\u1ED5 \u0111\u1ECF l\xE2u d\xE0i", "Full n\u1ED9i th\u1EA5t", "H\xE0 N\u1ED9i", "Long Bi\xEAn", "Ph\xFAc L\u1EE3i", "Ph\u1EA1m Thu Trang", 1, 1, "DEMO-BT-001", "10 m"], ["property", "Cho thu\xEA c\u0103n h\u1ED9 2 ph\xF2ng ng\u1EE7 Masteri Waterfront, \u0111\u1EA7y \u0111\u1EE7 n\u1ED9i th\u1EA5t", "Cho thu\xEA nh\xE0", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=82", "17 tri\u1EC7u/th\xE1ng", "68 m\xB2", "Ocean Park, Gia L\xE2m, H\xE0 N\u1ED9i", "0966222399", "rent", "Chung c\u01B0", "250 ngh\xECn/m\xB2/th\xE1ng", 2, 2, 1, "\u0110\xF4ng", "H\u1EE3p \u0111\u1ED3ng ch\xEDnh ch\u1EE7", "Full n\u1ED9i th\u1EA5t", "H\xE0 N\u1ED9i", "Gia L\xE2m", "\u0110a T\u1ED1n", "L\xEA H\u1EA3i Y\u1EBFn", 1, 1, "DEMO-RENT-001", ""], ["property", "Cho thu\xEA nh\xE0 nguy\xEAn c\u0103n 4 t\u1EA7ng qu\u1EADn 7, ph\xF9 h\u1EE3p v\u0103n ph\xF2ng", "Cho thu\xEA nh\xE0", "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=82", "32 tri\u1EC7u/th\xE1ng", "96 m\xB2", "Ph\xFA M\u1EF9 H\u01B0ng, Qu\u1EADn 7, TP. H\u1ED3 Ch\xED Minh", "0938555119", "rent", "Nh\xE0 ph\u1ED1", "333 ngh\xECn/m\xB2/th\xE1ng", 5, 5, 4, "Nam", "H\u1EE3p \u0111\u1ED3ng thu\xEA", "C\u01A1 b\u1EA3n", "TP. H\u1ED3 Ch\xED Minh", "Qu\u1EADn 7", "T\xE2n Phong", "\u0110\u1ED7 Thanh T\xF9ng", 0, 1, "DEMO-RENT-002", "6 m"], ["property", "Kho x\u01B0\u1EDFng 1.200 m\xB2 t\u1EA1i An D\u01B0\u01A1ng, xe container ra v\xE0o thu\u1EADn ti\u1EC7n", "Kho x\u01B0\u1EDFng & m\u1EB7t b\u1EB1ng", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=82", "78 tri\u1EC7u/th\xE1ng", "1.200 m\xB2", "KCN An D\u01B0\u01A1ng, H\u1EA3i Ph\xF2ng", "0904818686", "rent", "Kho x\u01B0\u1EDFng", "65 ngh\xECn/m\xB2/th\xE1ng", 0, 2, 1, "T\xE2y", "H\u1EE3p \u0111\u1ED3ng thu\xEA r\xF5 r\xE0ng", "\u0110i\u1EC7n 3 pha", "H\u1EA3i Ph\xF2ng", "An D\u01B0\u01A1ng", "L\xEA Thi\u1EC7n", "Nguy\u1EC5n V\u0103n Nam", 1, 1, "DEMO-KX-001", "30 m"], ["property", "M\u1EB7t b\u1EB1ng kinh doanh g\xF3c 2 m\u1EB7t ti\u1EC1n trung t\xE2m \u0110\xE0 N\u1EB5ng", "Kho x\u01B0\u1EDFng & m\u1EB7t b\u1EB1ng", "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82", "65 tri\u1EC7u/th\xE1ng", "220 m\xB2", "H\u1EA3i Ch\xE2u, \u0110\xE0 N\u1EB5ng", "0905991228", "rent", "M\u1EB7t b\u1EB1ng", "295 ngh\xECn/m\xB2/th\xE1ng", 0, 2, 2, "\u0110\xF4ng Nam", "H\u1EE3p \u0111\u1ED3ng thu\xEA", "M\u1EB7t b\u1EB1ng tr\u1ED1ng", "\u0110\xE0 N\u1EB5ng", "H\u1EA3i Ch\xE2u", "H\u1EA3i Ch\xE2u 1", "Ho\xE0ng \u0110\u1EE9c Long", 0, 1, "DEMO-MB-001", "12 m"], ["property", "\u0110\u1EA5t n\u1EC1n 100 m\xB2 khu \u0111\xF4 th\u1ECB B\u1EAFc S\xF4ng C\u1EA5m, v\u1ECB tr\xED \u0111\u1EB9p", "\u0110\u1EA5t n\u1EC1n & \u0111\u1EA5t d\u1EF1 \xE1n", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=82", "3,9 t\u1EF7", "100 m\xB2", "Th\u1EE7y Nguy\xEAn, H\u1EA3i Ph\xF2ng", "0915771338", "sale", "\u0110\u1EA5t", "39 tri\u1EC7u/m\xB2", 0, 0, 0, "Nam", "S\u1ED5 \u0111\u1ECF", "", "H\u1EA3i Ph\xF2ng", "Th\u1EE7y Nguy\xEAn", "T\xE2n D\u01B0\u01A1ng", "B\xF9i M\u1EA1nh C\u01B0\u1EDDng", 1, 1, "DEMO-DAT-001", "5 m"], ["property", "\u0110\u1EA5t bi\u1EC7t th\u1EF1 200 m\xB2 ven s\xF4ng H\u1ED9i An, Qu\u1EA3ng Nam", "\u0110\u1EA5t n\u1EC1n & \u0111\u1EA5t d\u1EF1 \xE1n", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82", "7,5 t\u1EF7", "200 m\xB2", "C\u1EA9m H\xE0, H\u1ED9i An, Qu\u1EA3ng Nam", "0977334556", "sale", "\u0110\u1EA5t", "37,5 tri\u1EC7u/m\xB2", 0, 0, 0, "\u0110\xF4ng", "S\u1ED5 \u0111\u1ECF", "", "Qu\u1EA3ng Nam", "H\u1ED9i An", "C\u1EA9m H\xE0", "\u0110\u1EB7ng Ho\xE0ng S\u01A1n", 0, 1, "DEMO-DAT-002", "10 m"], ["property", "Shophouse 5 t\u1EA7ng khu \u0111\xF4 th\u1ECB m\u1EDBi, tr\u1EE5c \u0111\u01B0\u1EDDng th\u01B0\u01A1ng m\u1EA1i s\u1EA7m u\u1EA5t", "B\xE1n nh\xE0 \u0111\u1EA5t", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82", "18,5 t\u1EF7", "105 m\xB2", "H\u1EA1 Long, Qu\u1EA3ng Ninh", "0911202668", "sale", "Shophouse", "176 tri\u1EC7u/m\xB2", 4, 6, 5, "\u0110\xF4ng Nam", "S\u1ED5 \u0111\u1ECF", "Ho\xE0n thi\u1EC7n c\u01A1 b\u1EA3n", "Qu\u1EA3ng Ninh", "H\u1EA1 Long", "B\xE3i Ch\xE1y", "V\u0169 \u0110\u1EE9c H\u1EA3i", 1, 1, "DEMO-SH-001", "7 m"], ["property", "Nh\xE0 v\u01B0\u1EDDn 160 m\xB2 t\u1EA1i \u0110\xE0 L\u1EA1t, kh\xF4ng gian xanh, \u0111\u01B0\u1EDDng \xF4 t\xF4", "B\xE1n nh\xE0 \u0111\u1EA5t", "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=82", "8,2 t\u1EF7", "160 m\xB2", "Ph\u01B0\u1EDDng 10, \u0110\xE0 L\u1EA1t, L\xE2m \u0110\u1ED3ng", "0932667099", "sale", "Nh\xE0 ph\u1ED1", "51 tri\u1EC7u/m\xB2", 4, 3, 2, "T\xE2y Nam", "S\u1ED5 ri\xEAng", "N\u1ED9i th\u1EA5t g\u1ED7", "L\xE2m \u0110\u1ED3ng", "\u0110\xE0 L\u1EA1t", "Ph\u01B0\u1EDDng 10", "Nguy\u1EC5n Th\u1EA3o Vy", 0, 1, "DEMO-NV-001", "8 m"], ["news", "Th\u1ECB tr\u01B0\u1EDDng c\u0103n h\u1ED9 2026: ng\u01B0\u1EDDi mua \u01B0u ti\xEAn ph\xE1p l\xFD v\xE0 ti\u1EC7n \xEDch th\u1EADt", "Th\u1ECB tr\u01B0\u1EDDng", "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "H\xE0 N\u1ED9i", "", "", "Ban bi\xEAn t\u1EADp", 1, 1, "DEMO-NEWS-001", ""], ["news", "5 b\u01B0\u1EDBc ki\u1EC3m tra ph\xE1p l\xFD tr\u01B0\u1EDBc khi \u0111\u1EB7t c\u1ECDc mua nh\xE0 \u0111\u1EA5t", "Ki\u1EBFn th\u1EE9c", "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Ban bi\xEAn t\u1EADp", 0, 1, "DEMO-NEWS-002", ""], ["news", "Kinh nghi\u1EC7m \u0111\u1ECBnh gi\xE1 nh\xE0 ph\u1ED1: 4 y\u1EBFu t\u1ED1 quy\u1EBFt \u0111\u1ECBnh m\u1EE9c gi\xE1 th\u1EF1c t\u1EBF", "Kinh nghi\u1EC7m", "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Ban bi\xEAn t\u1EADp", 0, 1, "DEMO-NEWS-003", ""], ["property", "C\u0103n h\u1ED9 1 ph\xF2ng ng\u1EE7 g\u1EA7n trung t\xE2m M\u1EF9 \u0110\xECnh, ph\xF9 h\u1EE3p \u0111\u1EA7u t\u01B0 cho thu\xEA", "B\xE1n c\u0103n h\u1ED9 chung c\u01B0", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=82", "3,15 t\u1EF7", "52 m\xB2", "M\u1EF9 \u0110\xECnh, Nam T\u1EEB Li\xEAm, H\xE0 N\u1ED9i", "0912333444", "sale", "Chung c\u01B0", "61 tri\u1EC7u/m\xB2", 1, 1, 1, "\u0110\xF4ng", "S\u1ED5 h\u1ED3ng", "\u0110\u1EA7y \u0111\u1EE7", "H\xE0 N\u1ED9i", "Nam T\u1EEB Li\xEAm", "M\u1EF9 \u0110\xECnh 1", "L\xEA Minh Qu\xE2n", 0, 1, "DEMO-CH-003", ""], ["property", "Penthouse 4 ph\xF2ng ng\u1EE7 view s\xF4ng S\xE0i G\xF2n, n\u1ED9i th\u1EA5t nh\u1EADp kh\u1EA9u", "B\xE1n c\u0103n h\u1ED9 chung c\u01B0", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=82", "22 t\u1EF7", "210 m\xB2", "Th\u1EA3o \u0110i\u1EC1n, TP. Th\u1EE7 \u0110\u1EE9c, TP. H\u1ED3 Ch\xED Minh", "0908999888", "sale", "Chung c\u01B0", "105 tri\u1EC7u/m\xB2", 4, 4, 1, "Nam", "S\u1ED5 h\u1ED3ng", "N\u1ED9i th\u1EA5t nh\u1EADp kh\u1EA9u", "TP. H\u1ED3 Ch\xED Minh", "TP. Th\u1EE7 \u0110\u1EE9c", "Th\u1EA3o \u0110i\u1EC1n", "Phan Ho\xE0ng Long", 1, 1, "DEMO-CH-004", ""], ["property", "Nh\xE0 ph\u1ED1 4 t\u1EA7ng \xF4 t\xF4 v\xE0o nh\xE0, trung t\xE2m Ninh Ki\u1EC1u C\u1EA7n Th\u01A1", "B\xE1n nh\xE0 \u0111\u1EA5t", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=82", "7,9 t\u1EF7", "92 m\xB2", "Ninh Ki\u1EC1u, C\u1EA7n Th\u01A1", "0939111222", "sale", "Nh\xE0 ph\u1ED1", "86 tri\u1EC7u/m\xB2", 4, 4, 4, "\u0110\xF4ng Nam", "S\u1ED5 \u0111\u1ECF", "C\u01A1 b\u1EA3n", "C\u1EA7n Th\u01A1", "Ninh Ki\u1EC1u", "An Kh\xE1nh", "Tr\u1ECBnh V\u0103n \u0110\u1EE9c", 0, 1, "DEMO-NP-002", "5 m"], ["property", "Nh\xE0 m\u1EB7t ti\u1EC1n 3 t\u1EA7ng g\u1EA7n bi\u1EC3n Nha Trang, ph\xF9 h\u1EE3p kinh doanh", "B\xE1n nh\xE0 \u0111\u1EA5t", "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=82", "13,2 t\u1EF7", "110 m\xB2", "L\u1ED9c Th\u1ECD, Nha Trang, Kh\xE1nh H\xF2a", "0905111777", "sale", "Nh\xE0 ph\u1ED1", "120 tri\u1EC7u/m\xB2", 5, 4, 3, "\u0110\xF4ng", "S\u1ED5 \u0111\u1ECF", "\u0110\u1EA7y \u0111\u1EE7", "Kh\xE1nh H\xF2a", "Nha Trang", "L\u1ED9c Th\u1ECD", "Ng\xF4 Minh H\u1EA3i", 1, 1, "DEMO-NP-003", "6 m"], ["property", "Cho thu\xEA c\u0103n h\u1ED9 studio cao c\u1EA5p B\xECnh Th\u1EA1nh, g\u1EA7n Landmark 81", "Cho thu\xEA nh\xE0", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=82", "11 tri\u1EC7u/th\xE1ng", "38 m\xB2", "B\xECnh Th\u1EA1nh, TP. H\u1ED3 Ch\xED Minh", "0968123123", "rent", "Chung c\u01B0", "289 ngh\xECn/m\xB2/th\xE1ng", 1, 1, 1, "T\xE2y B\u1EAFc", "H\u1EE3p \u0111\u1ED3ng thu\xEA", "Full n\u1ED9i th\u1EA5t", "TP. H\u1ED3 Ch\xED Minh", "B\xECnh Th\u1EA1nh", "Ph\u01B0\u1EDDng 22", "V\xF5 Thanh H\xE0", 0, 1, "DEMO-RENT-003", ""], ["property", "Cho thu\xEA bi\u1EC7t th\u1EF1 3 t\u1EA7ng khu \u0111\xF4 th\u1ECB Ciputra, c\xF3 s\xE2n v\u01B0\u1EDDn", "Cho thu\xEA nh\xE0", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=82", "58 tri\u1EC7u/th\xE1ng", "220 m\xB2", "Ciputra, T\xE2y H\u1ED3, H\xE0 N\u1ED9i", "0903222666", "rent", "Bi\u1EC7t th\u1EF1", "264 ngh\xECn/m\xB2/th\xE1ng", 5, 5, 3, "Nam", "H\u1EE3p \u0111\u1ED3ng ch\xEDnh ch\u1EE7", "Full n\u1ED9i th\u1EA5t", "H\xE0 N\u1ED9i", "T\xE2y H\u1ED3", "Ph\xFA Th\u01B0\u1EE3ng", "\u0110inh Thu H\u01B0\u01A1ng", 1, 1, "DEMO-RENT-004", "12 m"], ["property", "Kho logistics 2.500 m\xB2 g\u1EA7n cao t\u1ED1c H\xE0 N\u1ED9i - H\u1EA3i Ph\xF2ng", "Kho x\u01B0\u1EDFng & m\u1EB7t b\u1EB1ng", "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=82", "145 tri\u1EC7u/th\xE1ng", "2.500 m\xB2", "V\u0103n L\xE2m, H\u01B0ng Y\xEAn", "0981888777", "rent", "Kho x\u01B0\u1EDFng", "58 ngh\xECn/m\xB2/th\xE1ng", 0, 4, 1, "B\u1EAFc", "H\u1EE3p \u0111\u1ED3ng d\xE0i h\u1EA1n", "PCCC, \u0111i\u1EC7n 3 pha", "H\u01B0ng Y\xEAn", "V\u0103n L\xE2m", "T\xE2n Quang", "Ph\u1EA1m V\u0103n Th\u1EAFng", 1, 1, "DEMO-KX-002", "45 m"], ["property", "Cho thu\xEA v\u0103n ph\xF2ng 350 m\xB2 h\u1EA1ng B t\u1EA1i qu\u1EADn C\u1EA7u Gi\u1EA5y", "Kho x\u01B0\u1EDFng & m\u1EB7t b\u1EB1ng", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82", "92 tri\u1EC7u/th\xE1ng", "350 m\xB2", "Duy T\xE2n, C\u1EA7u Gi\u1EA5y, H\xE0 N\u1ED9i", "0977666555", "rent", "V\u0103n ph\xF2ng", "263 ngh\xECn/m\xB2/th\xE1ng", 0, 4, 1, "\u0110\xF4ng Nam", "H\u1EE3p \u0111\u1ED3ng thu\xEA", "Tr\u1EA7n s\xE0n, \u0111i\u1EC1u h\xF2a", "H\xE0 N\u1ED9i", "C\u1EA7u Gi\u1EA5y", "D\u1ECBch V\u1ECDng H\u1EADu", "B\xF9i Ng\u1ECDc Mai", 0, 1, "DEMO-VP-001", "18 m"], ["property", "\u0110\u1EA5t n\u1EC1n 125 m\xB2 g\u1EA7n bi\u1EC3n Ph\xFA Qu\u1ED1c, \u0111\u01B0\u1EDDng \xF4 t\xF4", "\u0110\u1EA5t n\u1EC1n & \u0111\u1EA5t d\u1EF1 \xE1n", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82", "4,6 t\u1EF7", "125 m\xB2", "D\u01B0\u01A1ng T\u01A1, Ph\xFA Qu\u1ED1c, Ki\xEAn Giang", "0917000111", "sale", "\u0110\u1EA5t", "36,8 tri\u1EC7u/m\xB2", 0, 0, 0, "T\xE2y Nam", "S\u1ED5 ri\xEAng", "", "Ki\xEAn Giang", "Ph\xFA Qu\u1ED1c", "D\u01B0\u01A1ng T\u01A1", "Ho\xE0ng Qu\u1ED1c B\u1EA3o", 1, 1, "DEMO-DAT-003", "5 m"], ["property", "\u0110\u1EA5t 150 m\xB2 khu d\xE2n c\u01B0 Bi\xEAn H\xF2a, \u0110\u1ED3ng Nai, s\u1ED5 ri\xEAng", "\u0110\u1EA5t n\u1EC1n & \u0111\u1EA5t d\u1EF1 \xE1n", "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=82", "5,1 t\u1EF7", "150 m\xB2", "Bi\xEAn H\xF2a, \u0110\u1ED3ng Nai", "0933444555", "sale", "\u0110\u1EA5t", "34 tri\u1EC7u/m\xB2", 0, 0, 0, "\u0110\xF4ng B\u1EAFc", "S\u1ED5 \u0111\u1ECF", "", "\u0110\u1ED3ng Nai", "Bi\xEAn H\xF2a", "Long B\xECnh", "Tr\u1EA7n \u0110\u1EE9c Kh\xE1nh", 0, 1, "DEMO-DAT-004", "7,5 m"], ["property", "Shophouse g\xF3c 2 m\u1EB7t ti\u1EC1n t\u1EA1i khu \u0111\xF4 th\u1ECB Ecopark", "B\xE1n nh\xE0 \u0111\u1EA5t", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82", "16,8 t\u1EF7", "118 m\xB2", "Ecopark, V\u0103n Giang, H\u01B0ng Y\xEAn", "0909888666", "sale", "Shophouse", "142 tri\u1EC7u/m\xB2", 3, 5, 4, "\u0110\xF4ng Nam", "S\u1ED5 \u0111\u1ECF", "Ho\xE0n thi\u1EC7n", "H\u01B0ng Y\xEAn", "V\u0103n Giang", "Xu\xE2n Quan", "Ph\u1EA1m Minh T\xFA", 1, 1, "DEMO-SH-002", "9 m"], ["property", "Bi\u1EC7t th\u1EF1 ngh\u1EC9 d\u01B0\u1EE1ng 300 m\xB2 ven bi\u1EC3n H\u1ED3 Tr\xE0m", "B\xE1n nh\xE0 \u0111\u1EA5t", "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=82", "24 t\u1EF7", "300 m\xB2", "H\u1ED3 Tr\xE0m, Xuy\xEAn M\u1ED9c, B\xE0 R\u1ECBa - V\u0169ng T\xE0u", "0918888999", "sale", "Bi\u1EC7t th\u1EF1", "80 tri\u1EC7u/m\xB2", 4, 5, 2, "\u0110\xF4ng", "S\u1ED5 l\xE2u d\xE0i", "Full n\u1ED9i th\u1EA5t", "B\xE0 R\u1ECBa - V\u0169ng T\xE0u", "Xuy\xEAn M\u1ED9c", "Ph\u01B0\u1EDBc Thu\u1EADn", "Nguy\u1EC5n Ho\xE0i Nam", 1, 1, "DEMO-BT-002", "15 m"], ["news", "Xu h\u01B0\u1EDBng ch\u1ECDn nh\xE0 g\u1EA7n metro: ti\u1EC7n \u0111i l\u1EA1i \u0111ang t\xE1c \u0111\u1ED9ng gi\xE1 b\u1EA5t \u0111\u1ED9ng s\u1EA3n", "Th\u1ECB tr\u01B0\u1EDDng", "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "TP. H\u1ED3 Ch\xED Minh", "", "", "Ban bi\xEAn t\u1EADp", 1, 1, "DEMO-NEWS-004", ""], ["news", "C\xE1ch \u0111\u1ECDc th\xF4ng tin tr\xEAn s\u1ED5 \u0111\u1ECF tr\u01B0\u1EDBc khi giao d\u1ECBch nh\xE0 \u0111\u1EA5t", "Ki\u1EBFn th\u1EE9c", "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Ban bi\xEAn t\u1EADp", 0, 1, "DEMO-NEWS-005", ""], ["news", "Nh\u1EEFng chi ph\xED ng\u01B0\u1EDDi mua nh\xE0 c\u1EA7n d\u1EF1 tr\xF9 ngo\xE0i gi\xE1 b\xE1n", "Kinh nghi\u1EC7m", "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Ban bi\xEAn t\u1EADp", 0, 1, "DEMO-NEWS-006", ""]];
var NEWS_SAMPLE_CONTENT = [["kinh-te-01", "Gi\xE1 v\xE0ng v\xE0 th\u1ECB tr\u01B0\u1EDDng t\xE0i ch\xEDnh h\xF4m nay c\xF3 g\xEC \u0111\xE1ng ch\xFA \xFD?", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-02", "Ng\u01B0\u1EDDi ti\xEAu d\xF9ng \u0111ang thay \u0111\u1ED5i c\xE1ch chi ti\xEAu nh\u01B0 th\u1EBF n\xE0o?", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-03", "D\xF2ng ti\u1EC1n c\xE1 nh\xE2n n\xEAn \u0111\u01B0\u1EE3c ph\xE2n b\u1ED5 ra sao trong giai \u0111o\u1EA1n nhi\u1EC1u bi\u1EBFn \u0111\u1ED9ng?", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-04", "Doanh nghi\u1EC7p nh\u1ECF t\u1ED1i \u01B0u chi ph\xED v\u1EADn h\xE0nh b\u1EB1ng nh\u1EEFng c\xE1ch n\xE0o?", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-05", "Xu h\u01B0\u1EDBng thanh to\xE1n kh\xF4ng ti\u1EC1n m\u1EB7t ti\u1EBFp t\u1EE5c m\u1EDF r\u1ED9ng \u1EDF c\xE1c \u0111\xF4 th\u1ECB", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-06", "Th\u1ECB tr\u01B0\u1EDDng b\xE1n l\u1EBB b\u01B0\u1EDBc v\xE0o m\xF9a c\u1EA1nh tranh tr\u1EA3i nghi\u1EC7m kh\xE1ch h\xE0ng", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-07", "L\xE3i su\u1EA5t v\xE0 s\u1EE9c mua \u0111ang t\xE1c \u0111\u1ED9ng th\u1EBF n\xE0o \u0111\u1EBFn k\u1EBF ho\u1EA1ch t\xE0i ch\xEDnh gia \u0111\xECnh?", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-08", "C\xE1c ng\xE0nh d\u1ECBch v\u1EE5 n\xE0o \u0111ang thu h\xFAt s\u1EF1 quan t\xE2m c\u1EE7a nh\xE0 \u0111\u1EA7u t\u01B0 nh\u1ECF?", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-09", "Ng\u01B0\u1EDDi tr\u1EBB \u01B0u ti\xEAn ti\u1EBFt ki\u1EC7m hay \u0111\u1EA7u t\u01B0 cho tr\u1EA3i nghi\u1EC7m?", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-10", "Kinh t\u1EBF s\u1ED1 t\u1EA1o th\xEAm c\u01A1 h\u1ED9i m\u1EDBi cho h\u1ED9 kinh doanh \u0111\u1ECBa ph\u01B0\u01A1ng", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-11", "Xu h\u01B0\u1EDBng mua s\u1EAFm th\xF4ng minh gi\xFAp ng\u01B0\u1EDDi d\xF9ng ki\u1EC3m so\xE1t ng\xE2n s\xE1ch t\u1ED1t h\u01A1n", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82"], ["kinh-te-12", "Nh\u1EEFng ch\u1EC9 s\u1ED1 t\xE0i ch\xEDnh c\xE1 nh\xE2n n\xEAn theo d\xF5i m\u1ED7i th\xE1ng", "Kinh t\u1EBF", "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-01", "AI \u0111ang thay \u0111\u1ED5i c\xE1ch doanh nghi\u1EC7p nh\u1ECF v\u1EADn h\xE0nh nh\u01B0 th\u1EBF n\xE0o?", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-02", "Nh\u1EEFng c\xF4ng c\u1EE5 s\u1ED1 gi\xFAp \u0111\u1ED9i nh\xF3m l\xE0m vi\u1EC7c hi\u1EC7u qu\u1EA3 h\u01A1n", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-03", "\u0110i\u1EC7n tho\u1EA1i m\u1EDBi t\u1EADp trung nhi\u1EC1u h\u01A1n v\xE0o pin v\xE0 kh\u1EA3 n\u0103ng x\u1EED l\xFD AI", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-04", "B\u1EA3o m\u1EADt d\u1EEF li\u1EC7u c\xE1 nh\xE2n tr\u1EDF th\xE0nh \u01B0u ti\xEAn khi l\xE0m vi\u1EC7c tr\u1EF1c tuy\u1EBFn", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-05", "\u1EE8ng d\u1EE5ng AI n\xE0o \u0111ang \u0111\u01B0\u1EE3c d\xF9ng nhi\u1EC1u trong c\xF4ng vi\u1EC7c v\u0103n ph\xF2ng?", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-06", "Xu h\u01B0\u1EDBng thi\u1EBFt b\u1ECB th\xF4ng minh k\u1EBFt n\u1ED1i li\u1EC1n m\u1EA1ch trong gia \u0111\xECnh", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-07", "Doanh nghi\u1EC7p chuy\u1EC3n sang t\u1EF1 \u0111\u1ED9ng h\xF3a c\xE1c t\xE1c v\u1EE5 l\u1EB7p l\u1EA1i", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-08", "Cloud v\xE0 c\xF4ng c\u1EE5 c\u1ED9ng t\xE1c \u0111ang thay \u0111\u1ED5i c\xE1ch l\xE0m vi\u1EC7c t\u1EEB xa", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-09", "Ng\u01B0\u1EDDi d\xF9ng quan t\xE2m nhi\u1EC1u h\u01A1n \u0111\u1EBFn quy\u1EC1n ri\xEAng t\u01B0 tr\xEAn \u1EE9ng d\u1EE5ng", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-10", "Nh\u1EEFng k\u1EF9 n\u0103ng c\xF4ng ngh\u1EC7 n\xEAn c\xF3 trong m\xF4i tr\u01B0\u1EDDng l\xE0m vi\u1EC7c m\u1EDBi", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-11", "C\xE1c n\u1EC1n t\u1EA3ng s\xE1ng t\u1EA1o n\u1ED9i dung b\u1ED5 sung ng\xE0y c\xE0ng nhi\u1EC1u t\xEDnh n\u0103ng AI", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82"], ["cong-nghe-12", "Thi\u1EBFt b\u1ECB \u0111eo th\xF4ng minh m\u1EDF r\u1ED9ng vai tr\xF2 trong \u0111\u1EDDi s\u1ED1ng h\u1EB1ng ng\xE0y", "C\xF4ng ngh\u1EC7", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82"], ["du-lich-01", "Nh\u1EEFng \u0111i\u1EC3m \u0111\u1EBFn \u0111\u01B0\u1EE3c t\xECm ki\u1EBFm nhi\u1EC1u cho k\u1EF3 ngh\u1EC9 ng\u1EAFn ng\xE0y", "Du l\u1ECBch", "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=82"], ["du-lich-02", "Kinh nghi\u1EC7m chu\u1EA9n b\u1ECB h\xE0nh l\xFD g\u1ECDn cho chuy\u1EBFn \u0111i cu\u1ED1i tu\u1EA7n", "Du l\u1ECBch", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82"], ["du-lich-03", "G\u1EE3i \xFD l\u1ECBch tr\xECnh hai ng\xE0y cho ng\u01B0\u1EDDi th\xEDch kh\xE1m ph\xE1 ch\u1EADm", "Du l\u1ECBch", "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=82"], ["du-lich-04", "Du l\u1ECBch t\u1EF1 t\xFAc: c\xE1ch c\xE2n \u0111\u1ED1i chi ph\xED m\xE0 v\u1EABn c\xF3 tr\u1EA3i nghi\u1EC7m t\u1ED1t", "Du l\u1ECBch", "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=1200&q=82"], ["du-lich-05", "Nh\u1EEFng cung \u0111\u01B0\u1EDDng ven bi\u1EC3n ph\xF9 h\u1EE3p cho chuy\u1EBFn \u0111i ng\u1EAFn", "Du l\u1ECBch", "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=82"], ["du-lich-06", "Xu h\u01B0\u1EDBng ngh\u1EC9 d\u01B0\u1EE1ng g\u1EA7n thi\xEAn nhi\xEAn \u0111\u01B0\u1EE3c nhi\u1EC1u gia \u0111\xECnh l\u1EF1a ch\u1ECDn", "Du l\u1ECBch", "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=82"], ["du-lich-07", "C\xE1c m\xF3n \u0103n \u0111\u1ECBa ph\u01B0\u01A1ng \u0111\xE1ng th\u1EED khi kh\xE1m ph\xE1 m\u1ED9t th\xE0nh ph\u1ED1 m\u1EDBi", "Du l\u1ECBch", "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=82"], ["du-lich-08", "Kinh nghi\u1EC7m ch\u1ECDn n\u01A1i l\u01B0u tr\xFA thu\u1EADn ti\u1EC7n cho nh\xF3m b\u1EA1n", "Du l\u1ECBch", "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=82"], ["du-lich-09", "\u0110i du l\u1ECBch m\xF9a th\u1EA5p \u0111i\u1EC3m c\xF3 nh\u1EEFng l\u1EE3i \xEDch g\xEC?", "Du l\u1ECBch", "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=82"], ["du-lich-10", "Checklist \u0111\u01A1n gi\u1EA3n tr\u01B0\u1EDBc khi b\u1EAFt \u0111\u1EA7u m\u1ED9t chuy\u1EBFn \u0111i d\xE0i ng\xE0y", "Du l\u1ECBch", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82"], ["du-lich-11", "Nh\u1EEFng tr\u1EA3i nghi\u1EC7m v\u0103n h\xF3a gi\xFAp chuy\u1EBFn \u0111i \u0111\xE1ng nh\u1EDB h\u01A1n", "Du l\u1ECBch", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=82"], ["du-lich-12", "C\xE1ch ch\u1EE5p \u1EA3nh du l\u1ECBch t\u1EF1 nhi\xEAn m\xE0 kh\xF4ng c\u1EA7n thi\u1EBFt b\u1ECB c\u1EA7u k\u1EF3", "Du l\u1ECBch", "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-01", "5 th\xF3i quen \u0111\u01A1n gi\u1EA3n gi\xFAp duy tr\xEC n\u0103ng l\u01B0\u1EE3ng trong ng\xE0y", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-02", "V\xEC sao gi\u1EA5c ng\u1EE7 \u0111\u1EC1u \u0111\u1EB7n quan tr\u1ECDng v\u1EDBi hi\u1EC7u su\u1EA5t l\xE0m vi\u1EC7c?", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-03", "\u0110i b\u1ED9 m\u1ED7i ng\xE0y mang l\u1EA1i nh\u1EEFng thay \u0111\u1ED5i t\xEDch c\u1EF1c n\xE0o?", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-04", "C\xE1ch x\xE2y d\u1EF1ng th\u1EDDi gian ngh\u1EC9 ng\u1EAFn h\u1EE3p l\xFD khi l\xE0m vi\u1EC7c t\u1EA1i b\xE0n", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-05", "B\u1EEFa s\xE1ng c\xE2n b\u1EB1ng n\xEAn c\xF3 nh\u1EEFng nh\xF3m th\u1EF1c ph\u1EA9m n\xE0o?", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-06", "Nh\u1EEFng d\u1EA5u hi\u1EC7u cho th\u1EA5y b\u1EA1n c\u1EA7n \u0111i\u1EC1u ch\u1EC9nh nh\u1ECBp sinh ho\u1EA1t", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-07", "Th\xF3i quen u\u1ED1ng \u0111\u1EE7 n\u01B0\u1EDBc d\u1EC5 duy tr\xEC h\u01A1n v\u1EDBi v\xE0i m\u1EB9o nh\u1ECF", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-08", "T\u1EADp luy\u1EC7n ng\u1EAFn nh\u01B0ng \u0111\u1EC1u \u0111\u1EB7n c\xF3 th\u1EC3 ph\xF9 h\u1EE3p v\u1EDBi ng\u01B0\u1EDDi b\u1EADn r\u1ED9n", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-09", "Kh\xF4ng gian l\xE0m vi\u1EC7c \u1EA3nh h\u01B0\u1EDFng th\u1EBF n\xE0o \u0111\u1EBFn s\u1EF1 t\u1EADp trung?", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-10", "C\xE1c c\xE1ch th\u01B0 gi\xE3n \u0111\u01A1n gi\u1EA3n sau m\u1ED9t ng\xE0y l\xE0m vi\u1EC7c d\xE0i", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-11", "\u0102n u\u1ED1ng \u0111\xFAng gi\u1EDD gi\xFAp duy tr\xEC n\u0103ng l\u01B0\u1EE3ng \u1ED5n \u0111\u1ECBnh h\u01A1n", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=82"], ["suc-khoe-12", "Th\xF3i quen v\u1EADn \u0111\u1ED9ng nh\u1EB9 gi\u1EEFa gi\u1EDD \u0111\u01B0\u1EE3c nhi\u1EC1u d\xE2n v\u0103n ph\xF2ng \xE1p d\u1EE5ng", "S\u1EE9c kh\u1ECFe", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-01", "Th\u1ECB tr\u01B0\u1EDDng c\u0103n h\u1ED9: ng\u01B0\u1EDDi mua quan t\xE2m nhi\u1EC1u h\u01A1n \u0111\u1EBFn gi\xE1 tr\u1ECB s\u1EED d\u1EE5ng th\u1EADt", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-02", "Nh\u1EEFng y\u1EBFu t\u1ED1 ng\u01B0\u1EDDi mua n\xEAn ki\u1EC3m tra tr\u01B0\u1EDBc khi ch\u1ECDn n\u01A1i an c\u01B0", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-03", "Kh\xF4ng gian s\u1ED1ng xanh tr\u1EDF th\xE0nh ti\xEAu ch\xED quan tr\u1ECDng c\u1EE7a nhi\u1EC1u gia \u0111\xECnh", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-04", "Ng\u01B0\u1EDDi mua nh\xE0 \u01B0u ti\xEAn k\u1EBFt n\u1ED1i giao th\xF4ng v\xE0 ti\u1EC7n \xEDch th\u1EF1c t\u1EBF", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-05", "C\u0103n h\u1ED9 di\u1EC7n t\xEDch v\u1EEBa ph\u1EA3i \u0111\u01B0\u1EE3c quan t\xE2m nh\u1EDD t\u1ED1i \u01B0u c\xF4ng n\u0103ng", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-06", "Nh\u1EEFng l\u01B0u \xFD khi so s\xE1nh gi\xE1 gi\u1EEFa c\xE1c d\u1EF1 \xE1n c\xF9ng khu v\u1EF1c", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-07", "Xu h\u01B0\u1EDBng t\xECm nh\xE0 g\u1EA7n n\u01A1i l\xE0m vi\u1EC7c ti\u1EBFp t\u1EE5c t\u0103ng \u1EDF \u0111\xF4 th\u1ECB l\u1EDBn", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-08", "Ph\xE1p l\xFD v\xE0 ti\u1EBFn \u0111\u1ED9 b\xE0n giao l\xE0 hai y\u1EBFu t\u1ED1 c\u1EA7n ki\u1EC3m tra k\u1EF9", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-09", "Nh\xE0 ph\u1ED1 v\xF9ng ven thu h\xFAt nh\xF3m kh\xE1ch t\xECm kh\xF4ng gian r\u1ED9ng h\u01A1n", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-10", "Ng\u01B0\u1EDDi thu\xEA nh\xE0 quan t\xE2m ng\xE0y c\xE0ng nhi\u1EC1u \u0111\u1EBFn ch\u1EA5t l\u01B0\u1EE3ng n\u1ED9i th\u1EA5t", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-11", "Khu \u0111\xF4 th\u1ECB t\xEDch h\u1EE3p ti\u1EC7n \xEDch \u0111ang thay \u0111\u1ED5i th\xF3i quen ch\u1ECDn n\u01A1i \u1EDF", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82"], ["bat-dong-san-12", "B\xE0i to\xE1n t\xE0i ch\xEDnh d\xE0i h\u1EA1n khi c\xE2n nh\u1EAFc mua c\u0103n nh\xE0 \u0111\u1EA7u ti\xEAn", "B\u1EA5t \u0111\u1ED9ng s\u1EA3n", "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82"], ["doi-song-01", "Xu h\u01B0\u1EDBng s\u1ED1ng t\u1ED1i gi\u1EA3n \u0111ang thay \u0111\u1ED5i c\xE1ch b\u1ED1 tr\xED kh\xF4ng gian gia \u0111\xECnh", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=82"], ["doi-song-02", "Thanh to\xE1n s\u1ED1 ng\xE0y c\xE0ng ph\u1ED5 bi\u1EBFn trong mua s\u1EAFm v\xE0 d\u1ECBch v\u1EE5", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=82"], ["doi-song-03", "Nh\u1EEFng th\xF3i quen nh\u1ECF gi\xFAp c\u0103n nh\xE0 lu\xF4n g\u1ECDn g\xE0ng h\u01A1n", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=82"], ["doi-song-04", "Cu\u1ED1i tu\u1EA7n ch\u1EADm r\xE3i: nh\u1EEFng ho\u1EA1t \u0111\u1ED9ng \u0111\u01A1n gi\u1EA3n \u0111\u1EC3 n\u1EA1p l\u1EA1i n\u0103ng l\u01B0\u1EE3ng", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=82"], ["doi-song-05", "C\xE1ch t\u1ED5 ch\u1EE9c g\xF3c l\xE0m vi\u1EC7c t\u1EA1i nh\xE0 v\u1EEBa g\u1ECDn v\u1EEBa d\u1EC5 t\u1EADp trung", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=82"], ["doi-song-06", "Ng\u01B0\u1EDDi tr\u1EBB \u0111ang \u01B0u ti\xEAn tr\u1EA3i nghi\u1EC7m n\xE0o trong cu\u1ED9c s\u1ED1ng \u0111\xF4 th\u1ECB?", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=82"], ["doi-song-07", "B\u1EEFa c\u01A1m gia \u0111\xECnh tr\u1EDF l\u1EA1i nh\u01B0 m\u1ED9t kho\u1EA3ng th\u1EDDi gian k\u1EBFt n\u1ED1i", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=82"], ["doi-song-08", "Nh\u1EEFng v\u1EADt d\u1EE5ng \u0111a n\u0103ng gi\xFAp ti\u1EBFt ki\u1EC7m di\u1EC7n t\xEDch c\u0103n h\u1ED9", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=82"], ["doi-song-09", "Th\xF3i quen ghi ch\xE9p gi\xFAp qu\u1EA3n l\xFD c\xF4ng vi\u1EC7c v\xE0 cu\u1ED9c s\u1ED1ng t\u1ED1t h\u01A1n", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82"], ["doi-song-10", "Kh\xF4ng gian xanh nh\u1ECF mang l\u1EA1i c\u1EA3m gi\xE1c d\u1EC5 ch\u1ECBu cho nh\xE0 \u1EDF", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82"], ["doi-song-11", "C\xE1ch s\u1EAFp x\u1EBFp l\u1ECBch c\xE1 nh\xE2n \u0111\u1EC3 c\xF3 th\xEAm th\u1EDDi gian cho s\u1EDF th\xEDch", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=82"], ["doi-song-12", "Xu h\u01B0\u1EDBng t\u1EF1 l\xE0m \u0111\u1ED3 trang tr\xED \u0111\u01A1n gi\u1EA3n t\u1EA1i nh\xE0", "\u0110\u1EDDi s\u1ED1ng", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82"]];
function sampleRichContent(title, category) {
  return `<p><strong>${title}</strong> l\xE0 b\xE0i vi\u1EBFt m\u1EABu thu\u1ED9c chuy\xEAn m\u1EE5c ${category}, \u0111\u01B0\u1EE3c chu\u1EA9n b\u1ECB \u0111\u1EC3 kh\xE1ch h\xE0ng xem \u0111\xFAng b\u1ED1 c\u1EE5c v\xE0 tr\u1EA3i nghi\u1EC7m c\u1EE7a giao di\u1EC7n tin t\u1EE9c.</p>
  <h2>N\u1ED9i dung n\u1ED5i b\u1EADt</h2><p>Ph\u1EA7n n\u1ED9i dung n\xE0y minh h\u1ECDa c\xE1ch tr\xECnh b\xE0y m\u1ED9t b\xE0i b\xE1o ho\xE0n ch\u1EC9nh v\u1EDBi \u0111o\u1EA1n v\u0103n, ti\xEAu \u0111\u1EC1 ph\u1EE5, h\xECnh \u1EA3nh v\xE0 li\xEAn k\u1EBFt. Khi nh\u1EADn website, kh\xE1ch h\xE0ng c\xF3 th\u1EC3 s\u1EEDa ho\u1EB7c x\xF3a to\xE0n b\u1ED9 b\xE0i m\u1EABu trong Client Admin.</p>
  <h2>Th\xF4ng tin tham kh\u1EA3o</h2><p>N\u1ED9i dung m\u1EABu kh\xF4ng \u0111\u1EA1i di\u1EC7n cho th\xF4ng tin th\u1EDDi s\u1EF1 th\u1EF1c t\u1EBF. Website th\u1EADt n\xEAn \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt b\u1EB1ng n\u1ED9i dung ri\xEAng c\u1EE7a th\u01B0\u01A1ng hi\u1EC7u \u0111\u1EC3 \u0111\u1EA1t hi\u1EC7u qu\u1EA3 SEO t\u1ED1t h\u01A1n.</p>`;
}
__name(sampleRichContent, "sampleRichContent");
async function seedDemoForSite(env, siteId, opts = {}) {
  const site = await env.DB.prepare(`SELECT id,name,coalesce(template_key,'') template_key,coalesce(preset,'') preset FROM sites WHERE id=?`).bind(siteId).first();
  if (!site) throw new Error("Website kh\xF4ng t\u1ED3n t\u1EA1i");
  const admin = await env.DB.prepare(`SELECT id FROM users WHERE site_id=? AND role='admin' ORDER BY id LIMIT 1`).bind(siteId).first();
  if (!admin) throw new Error("Website ch\u01B0a c\xF3 t\xE0i kho\u1EA3n Admin kh\xE1ch");
  const blueprint = await buildTemplatePreviewBlueprint(env, site.template_key, site);
  let rows = Array.isArray(blueprint?.posts) ? blueprint.posts : [];
  const requested = Math.max(0, Number(opts.limit || 0));
  if (requested > rows.length) rows = rows.slice(0, requested);
  let created = 0, skipped = 0;
  for (let i = 0; i < rows.length; i++) {
    const x = rows[i] || {};
    const sampleKey = String(x.sample_key || `${site.template_key || x.type || "sample"}:${i + 1}`);
    const listingCode = String(x.listing_code || `SAMPLE-${String(i + 1).padStart(3, "0")}`);
    const exists = await env.DB.prepare(`SELECT id FROM posts WHERE site_id=? AND (sample_key=? OR (listing_code<>'' AND listing_code=?)) LIMIT 1`).bind(siteId, sampleKey, listingCode).first();
    if (exists) {
      skipped++;
      continue;
    }
    if (String(x.type || "") === "news") {
      await env.DB.prepare(`INSERT INTO posts(site_id,type,title,category,image,content,status,author_id,featured,verified,listing_code,views,is_sample,sample_key,extra_json)
        VALUES(?,'news',?,?,?,?, 'published',?,?,?,?,?,1,?,'{}')`).bind(siteId, x.title || "", x.category || "Tin m\u1EDBi", x.image || "", x.content || sampleRichContent(x.title || "", x.category || "Tin m\u1EDBi"), admin.id, x.featured ? 1 : 0, x.verified ? 1 : 0, listingCode, Number(x.views || 120), sampleKey).run();
    } else {
      await env.DB.prepare(`INSERT INTO posts(
        site_id,type,title,category,image,price,area,address,phone,content,status,author_id,
        "transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,
        province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views,is_sample,sample_key,extra_json
      ) VALUES(?,?,?,?,?,?,?,?,?,?,'published',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,'{}')`).bind(
        siteId,
        x.type || "property",
        x.title || "",
        x.category || "",
        x.image || "",
        x.price || "",
        x.area || "",
        x.address || "",
        x.phone || "",
        x.content || "<p>B\xE0i m\u1EABu d\xF9ng \u0111\u1EC3 xem tr\u01B0\u1EDBc b\u1ED1 c\u1EE5c website.</p>",
        admin.id,
        x.transaction || "",
        x.property_type || "",
        x.unit_price || "",
        x.bedrooms || null,
        x.bathrooms || null,
        x.floors || null,
        x.direction || "",
        x.legal || "",
        x.furniture || "",
        x.province || "",
        x.district || "",
        x.ward || "",
        "",
        x.contact_name || "",
        x.featured ? 1 : 0,
        x.verified ? 1 : 0,
        listingCode,
        x.frontage || "",
        Number(x.views || 40),
        sampleKey
      ).run();
    }
    created++;
  }
  return { created, skipped, total: rows.length, profile: blueprint?.content_type || "generic", template_key: site.template_key || "", density: "structure-v5" };
}
__name(seedDemoForSite, "seedDemoForSite");
async function buildTemplatePreviewBlueprint(env, templateKey, site = {}) {
  const key = String(templateKey || site?.template_key || "").trim();
  let t = null;
  if (key) try {
    t = await env.DB.prepare(`SELECT template_key,category,preset,coalesce(sample_count,12) sample_count,editor_profile,structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(key).first();
  } catch (e) {
  }
  if (!t && site?.preset) try {
    t = await env.DB.prepare(`SELECT template_key,category,preset,coalesce(sample_count,12) sample_count,editor_profile,structure_profile FROM template_catalog WHERE preset=? ORDER BY sort_order,template_key LIMIT 1`).bind(site.preset).first();
  } catch (e) {
  }
  let ep = {};
  try {
    ep = t?.editor_profile ? JSON.parse(t.editor_profile) : {};
  } catch (e) {
    ep = {};
  }
  let sp = {};
  try {
    sp = t?.structure_profile ? JSON.parse(t.structure_profile) : defaultTemplateStructure(key || t?.template_key || "");
  } catch (e) {
    sp = defaultTemplateStructure(key || t?.template_key || "");
  }
  if (!sp || !Array.isArray(sp.sections)) sp = defaultTemplateStructure(key || t?.template_key || "") || { sections: [] };
  const category = String(t?.category || "").toLowerCase();
  const contentType = String(ep?.content_type || (category === "tin-tuc" ? "news" : category === "bat-dong-san" ? "property" : category === "san-pham" ? "product" : "generic")).toLowerCase();
  const limit = Math.max(1, Math.min(30, Number(t?.sample_count || 12)));
  let posts = [];
  if (contentType === "news") {
    let pushNews = function(base, cat, copyNo) {
      const src = base || NEWS_SAMPLE_CONTENT[rows.length % NEWS_SAMPLE_CONTENT.length];
      const stem = String(src?.[0] || `demo-${rows.length + 1}`);
      let k = copyNo > 1 ? `${stem}-full-${copyNo}` : stem;
      while (usedKeys.has(k)) k = `${k}-x`;
      usedKeys.add(k);
      const title0 = String(src?.[1] || `N\u1ED9i dung n\u1ED5i b\u1EADt ${rows.length + 1}`);
      const title = copyNo > 1 ? `${title0} \xB7 G\xF3c nh\xECn ${copyNo}` : title0;
      rows.push([k, title, cat || String(src?.[2] || "Tin m\u1EDBi"), String(src?.[3] || NEWS_SAMPLE_CONTENT[rows.length % NEWS_SAMPLE_CONTENT.length]?.[3] || "")]);
    };
    __name(pushNews, "pushNews");
    const sections = Array.isArray(sp?.sections) ? sp.sections : [];
    const categoryNeeds = /* @__PURE__ */ new Map();
    let generalNeed = limit;
    for (const sec of sections) {
      const slots = Math.max(0, Number(sec?.slots || 0));
      if (!slots) continue;
      const secType = String(sec?.type || "").toLowerCase();
      const catName = String(sec?.category || (secType === "category" ? sec?.title : "") || "").trim();
      if (catName) categoryNeeds.set(catName, Math.max(categoryNeeds.get(catName) || 0, slots));
      else generalNeed = Math.max(generalNeed, slots);
    }
    const sourceByCat = /* @__PURE__ */ new Map();
    for (const x of NEWS_SAMPLE_CONTENT) {
      const c = String(x[2] || "").trim();
      if (!sourceByCat.has(c)) sourceByCat.set(c, []);
      sourceByCat.get(c).push(x);
    }
    const wantedCats = categoryNeeds.size ? [...categoryNeeds.keys()] : (Array.isArray(ep?.categories) ? ep.categories : []).map((x) => String(x || "").trim()).filter(Boolean);
    const rows = [];
    const usedKeys = /* @__PURE__ */ new Set();
    for (const cat of wantedCats) {
      const need = Math.max(1, Number(categoryNeeds.get(cat) || 0));
      const pool = sourceByCat.get(cat) || [];
      for (let i = 0; i < need; i++) pushNews(pool[i % Math.max(1, pool.length)] || NEWS_SAMPLE_CONTENT[i % NEWS_SAMPLE_CONTENT.length], cat, Math.floor(i / Math.max(1, pool.length)) + 1);
    }
    let cursor = 0;
    while (rows.length < generalNeed) {
      const src = NEWS_SAMPLE_CONTENT[cursor % NEWS_SAMPLE_CONTENT.length];
      const cat = String(src?.[2] || wantedCats[cursor % Math.max(1, wantedCats.length)] || "Tin m\u1EDBi");
      pushNews(src, cat, Math.floor(cursor / NEWS_SAMPLE_CONTENT.length) + 2);
      cursor++;
    }
    if (!rows.length) {
      for (let i = 0; i < limit; i++) pushNews(NEWS_SAMPLE_CONTENT[i % NEWS_SAMPLE_CONTENT.length], String(NEWS_SAMPLE_CONTENT[i % NEWS_SAMPLE_CONTENT.length]?.[2] || "Tin m\u1EDBi"), Math.floor(i / NEWS_SAMPLE_CONTENT.length) + 1);
    }
    const newsDemoNum = String(key || t?.template_key || "").match(/^tin-tuc-(\d+)$/)?.[1] || "";
    const newsDemoBase = newsDemoNum ? `/demo/tin-tuc/mau-${newsDemoNum}` : "";
    const slugifyDemo = /* @__PURE__ */ __name((v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "tin-demo", "slugifyDemo");
    posts = rows.map((x, i) => ({
      id: 9e5 + i,
      type: "news",
      title: x[1],
      category: x[2],
      image: x[3],
      content: sampleRichContent(x[1], x[2]),
      status: "published",
      featured: i === 0 ? 1 : 0,
      verified: 1,
      listing_code: `SAMPLE-NEWS-${String(i + 1).padStart(3, "0")}`,
      views: 120 + i * 37,
      demo_url: newsDemoBase ? `${newsDemoBase}/${slugifyDemo(x[1])}.html` : "",
      is_sample: 1,
      sample_key: `${key || "news"}:${x[0]}`,
      __nr_blueprint: 1
    }));
  } else if (contentType === "product") {
    const cats = Array.isArray(ep?.categories) && ep.categories.length ? ep.categories : ["\u0110i\u1EC7n t\u1EED & C\xF4ng ngh\u1EC7", "Nh\xE0 c\u1EEDa & \u0110\u1EDDi s\u1ED1ng", "Th\u1EDDi trang & L\xE0m \u0111\u1EB9p", "M\u1EB9 & B\xE9", "Th\u1EC3 thao & Du l\u1ECBch", "Ph\u1EE5 ki\u1EC7n & Kh\xE1c"];
    const names = {
      "\u0110i\u1EC7n t\u1EED & C\xF4ng ngh\u1EC7": ["Tai nghe Bluetooth Pro", "Chu\u1ED9t kh\xF4ng d\xE2y Silent", "B\xE0n ph\xEDm c\u01A1 Compact", "S\u1EA1c nhanh GaN 65W", "Hub USB-C 8 in 1", "Loa Bluetooth Mini"],
      "Nh\xE0 c\u1EEDa & \u0110\u1EDDi s\u1ED1ng": ["M\xE1y h\xFAt b\u1EE5i c\u1EA7m tay", "\u0110\xE8n b\xE0n ch\u1ED1ng c\u1EADn", "M\xE1y xay mini", "B\xECnh gi\u1EEF nhi\u1EC7t 900ml", "Qu\u1EA1t tu\u1EA7n ho\xE0n mini", "K\u1EC7 \u0111\u1EC3 b\xE0n \u0111a n\u0103ng"],
      "Th\u1EDDi trang & L\xE0m \u0111\u1EB9p": ["M\xE1y s\u1EA5y t\xF3c Ion", "M\xE1y u\u1ED1n t\xF3c mini", "T\xFAi \u0111eo ch\xE9o Urban", "K\xEDnh ch\u1ED1ng UV", "M\xE1y r\u1EEDa m\u1EB7t Sonic", "\u0110\u1ED3ng h\u1ED3 th\u1EC3 thao"],
      "M\u1EB9 & B\xE9": ["\u0110\xE8n ng\u1EE7 c\u1EA3m bi\u1EBFn", "B\xECnh n\u01B0\u1EDBc tr\u1EBB em", "M\xE1y h\xE2m s\u1EEFa mini", "Camera tr\xF4ng b\xE9", "B\u1ED9 \u0111\u1ED3 ch\u01A1i l\u1EAFp r\xE1p", "G\u1ED1i ch\u1ED1ng tr\xE0o ng\u01B0\u1EE3c"],
      "Th\u1EC3 thao & Du l\u1ECBch": ["B\xECnh n\u01B0\u1EDBc th\u1EC3 thao", "T\xFAi du l\u1ECBch g\u1EA5p g\u1ECDn", "\u0110\u1ED3ng h\u1ED3 ch\u1EA1y b\u1ED9", "\u0110\xE8n pin d\xE3 ngo\u1EA1i", "G\u1EADy trekking carbon", "T\xFAi ch\u1ED1ng n\u01B0\u1EDBc"],
      "Ph\u1EE5 ki\u1EC7n & Kh\xE1c": ["C\xE1p s\u1EA1c b\u1ECDc d\xF9", "Gi\xE1 \u0111\u1EE1 \u0111i\u1EC7n tho\u1EA1i", "Pin d\u1EF1 ph\xF2ng 20K", "\u1ED4 c\u1EAFm th\xF4ng minh", "Webcam Full HD", "Th\u1EBB nh\u1EDB 128GB"]
    };
    const sections = Array.isArray(sp?.sections) ? sp.sections : [];
    const needs = /* @__PURE__ */ new Map();
    let totalNeed = limit;
    for (const sec of sections) {
      const slots = Math.max(0, Number(sec?.slots || 0));
      if (!slots) continue;
      const cat = String(sec?.category || "").trim();
      if (cat) needs.set(cat, Math.max(needs.get(cat) || 0, slots));
      totalNeed = Math.max(totalNeed, slots);
    }
    posts = [];
    let id = 94e4, idx = 0;
    const slug = /* @__PURE__ */ __name((v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""), "slug");
    for (const cat of cats) {
      const pool = names[cat] || ["S\u1EA3n ph\u1EA9m n\u1ED5i b\u1EADt"];
      const need = Math.max(1, Number(needs.get(cat) || 5));
      for (let i = 0; i < need; i++) {
        const title = pool[i % pool.length] + (i >= pool.length ? " " + (i + 1) : "");
        const price = 199e3 + idx * 173e3 % 42e5;
        const old = Math.round(price * 1.28 / 1e3) * 1e3;
        const image = `/assets/product-affiliate/product-${idx % 6 + 1}.svg`;
        const brand = ["Nova", "Aster", "MobiGear", "HomeLab", "UrbanX", "Kiddo"][idx % 6];
        const extra = { product_price: String(price), product_old_price: String(old), product_brand: brand, product_sku: "PA-" + String(idx + 1).padStart(4, "0"), product_affiliate_url: "#", product_badge: idx % 4 === 0 ? "B\xC1N CH\u1EA0Y" : idx % 4 === 1 ? "GI\u1EA2M GI\xC1" : "", product_rating: (4.6 + idx % 4 * 0.1).toFixed(1), product_sold: String(230 + idx * 91), product_promo: "\u01AFu \u0111\xE3i m\u1EABu d\xE0nh cho showroom. Ch\u1EE7 website t\u1EF1 ch\u1EC9nh gi\xE1, voucher v\xE0 link mua trong Trang qu\u1EA3n tr\u1ECB.", product_specs: "Th\u01B0\u01A1ng hi\u1EC7u: " + brand + "\nB\u1EA3o h\xE0nh: 12 th\xE1ng\nT\xECnh tr\u1EA1ng: M\u1EDBi" };
        posts.push({ id: id++, type: "product", title, category: cat, image, content: `<p>${title} l\xE0 n\u1ED9i dung m\u1EABu \u0111\u1EC3 tr\xECnh b\xE0y catalog th\u01B0\u01A1ng m\u1EA1i. Ch\u1EE7 website c\xF3 th\u1EC3 vi\u1EBFt review, h\u01B0\u1EDBng d\u1EABn ch\u1ECDn mua v\xE0 n\u1ED9i dung SEO trong Trang qu\u1EA3n tr\u1ECB.</p><h2>\u0110i\u1EC3m n\u1ED5i b\u1EADt</h2><p>Giao di\u1EC7n hi\u1EC3n th\u1ECB h\xECnh \u1EA3nh, gi\xE1, \u01B0u \u0111\xE3i, th\xF4ng s\u1ED1 v\xE0 li\xEAn k\u1EBFt mua h\xE0ng theo d\u1EEF li\u1EC7u do ch\u1EE7 website nh\u1EADp.</p>`, status: "published", featured: idx < 10 ? 1 : 0, verified: 1, listing_code: "PRODUCT-" + String(idx + 1).padStart(3, "0"), views: 320 + idx * 47, demo_url: `/demo/san-pham/mau-1/san-pham/${slug(title)}.html`, gallery: `/assets/product-affiliate/product-${(idx + 1) % 6 + 1}.svg, /assets/product-affiliate/product-${(idx + 2) % 6 + 1}.svg`, extra_json: JSON.stringify(extra), is_sample: 1, sample_key: `san-pham-1:${idx + 1}`, __nr_blueprint: 1 });
        idx++;
      }
    }
    while (posts.length < totalNeed) {
      const x = posts[posts.length % Math.max(1, posts.length)];
      if (!x) break;
      posts.push({ ...x, id: id++, title: x.title + " \xB7 L\u1EF1a ch\u1ECDn " + (posts.length + 1), sample_key: `san-pham-1:${posts.length + 1}` });
    }
  } else if (contentType === "game") {
    const groups = [["Town Hall", "town-hall", 12], ["Builder Hall", "builder-hall", 8], ["Clan Capital", "clan-capital", 8]];
    const imgs = {
      TH18: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3uXRRSSucOwlCPaoJSv4XPqTAR-s4SHVTJWpurkKLFH3cXyvohLv33sXpzq58mRiTZ7PR9aI-lJvSJKoCJcVpJimUrunFPbHAXoKxyIh8EzcdgrzJR7fipf6CUToq7ibCmUoiht-v74iHihZLCeoO7VTTYLDXODjTL1DmcSm2EaTb3yrm0BJi1nOP2rG7/s600/th18_coc.webp",
      TH17: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhJtm5GbeDyNy9urRtDBa9NcRpHmNhKqvqCHF46317xeKn6pp3YfycZH2g6vmaQnzzKiFG7D0D8ZgozccrJZ3DXeyc8pw_I9-bFzpDKxRjY64MkQSwTOeikJCvb0bDf1W0ewXUmoOC5YzSgySe0xC-7ReJ6PRSEOkliaBHx8NrXJHjWow-VbSTTsgEtlsU9/s400/th17_coc.jpg",
      TH16: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCdTCaRil9IY_W-rNX711VaHAhJNjjOtAXgOVP1encGhR8xMFphnPCGqG38HdjI9NckADJBNLdIIeyusee62Tws19DdZGJZZLDU5aypHG_iICQrGmRM7CdxxzsUojv2Xw7Pd1nFw1Qkh1mXbHEYcezZv9eEIHQGM2gMYNYACvM8GAcnm_xccqJ64FJ0I3U/s400/th16_min.jpg",
      BH10: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhebxJQQZOV6GRSR_hHw82twIMi35fdd6cpa8UPSNhQrjzLHY6do0xh258qQd08fT9-Xl6bmIdwDqDLfzMqS4L0D_o28_bs2G1YWfipFxUtPuXOXCldYenAPk91lV1cHD1MOwITfBradygsmJg8N6FJs1Gv6baKlu2hTkKJQBgZeBp52XrA1kGZMqTZ0aBn/s400/bh10_min.jpg",
      CH10: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj1JvIJLGPBJbMokfsAMHLojAaUuRSTqccAC4mSWjBatPVAwFh9y3vcHhiiReED2d4S9XpfjjuwtvFv4dO2G1aEgIaI4xm3qSxEkb7uNzoyoQziorJr2w2-SzOHx14ECOLgZnMIPlVRjI0FNYxMU7ELxrKTWnZwlUH6ughJvTDv3nWbDQbSvkbY93cK9LU/s400/capitall-hall-10.webp"
    };
    const purposes = ["War", "Farming", "Hybrid", "Trophy", "Legend", "CWL", "Troll"], styles = ["Compact", "Ring", "Box", "Diamond", "Spread"], defs = ["Anti 3 Star", "Anti 2 Star", "Anti Everything"];
    posts = [];
    let id = 93e4;
    for (const [group, secKey, fallback] of groups) {
      const sec = (sp.sections || []).find((x) => x.key === secKey);
      const need = Math.max(1, Number(sec?.slots || fallback)) * 2;
      for (let i = 0; i < need; i++) {
        const level = group === "Town Hall" ? ["TH18", "TH17", "TH16"][i % 3] : group === "Builder Hall" ? "BH10" : "CH10";
        const purpose = purposes[i % purposes.length], style = styles[i % styles.length], defense = defs[i % defs.length];
        {
          const title = `${level} ${purpose} Base Layout ${String(i + 1).padStart(2, "0")}`, slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          posts.push({ id: id++, type: "game", title, category: group, image: imgs[level] || imgs.TH18, content: `<p>${level} ${purpose} base m\u1EABu d\xE0nh cho showroom. N\u1ED9i dung chi\u1EBFn thu\u1EADt v\xE0 copy link c\xF3 th\u1EC3 ch\u1EC9nh trong Admin.</p><h2>Base overview</h2><p>Layout \u0111\u01B0\u1EE3c tr\xECnh b\xE0y v\u1EDBi level, purpose, style v\xE0 defense r\xF5 r\xE0ng \u0111\u1EC3 ng\u01B0\u1EDDi xem quy\u1EBFt \u0111\u1ECBnh nhanh tr\u01B0\u1EDBc khi copy base.</p>`, status: "published", featured: i === 0 ? 1 : 0, verified: 1, views: 850 + i * 113, rating: 4.6 + i % 4 * 0.1, downloads: 160 + i * 17, demo_url: `/demo/game/clash-of-clans/base/${slug}.html`, extra_json: JSON.stringify({ game_group: group, game_level: level, game_purpose: purpose, game_style: style, game_defense: defense, copy_link: "#", game_year: "2026" }), is_sample: 1, sample_key: `game-1:${group}:${i + 1}`, __nr_blueprint: 1 });
        }
      }
    }
  } else if (contentType === "property") {
    const propertyContent = "<p>B\xE0i m\u1EABu d\xF9ng l\xE0m khung b\u1ED1 c\u1EE5c xem tr\u01B0\u1EDBc.</p>";
    const sections = Array.isArray(sp?.sections) ? sp.sections : [];
    const baseRows = DEMO_CONTENT.filter((x) => x[0] === "property");
    const knownCats = [...new Set(baseRows.map((x) => String(x[2] || "").trim()).filter(Boolean))];
    const categoryNeeds = /* @__PURE__ */ new Map();
    let generalNeed = limit;
    let saleNeed = 0, rentNeed = 0;
    for (const sec of sections) {
      const slots = Math.max(0, Number(sec?.slots || 0));
      if (!slots) continue;
      const title = String(sec?.category || sec?.title || "").trim();
      const exact = knownCats.find((c) => c.toLowerCase() === title.toLowerCase());
      if (exact) categoryNeeds.set(exact, Math.max(categoryNeeds.get(exact) || 0, slots));
      generalNeed = Math.max(generalNeed, slots);
      const low = title.toLowerCase();
      if (/mua|bán/.test(low)) saleNeed = Math.max(saleNeed, slots);
      if (/thuê/.test(low)) rentNeed = Math.max(rentNeed, slots);
    }
    const rows = [];
    const copyRow = /* @__PURE__ */ __name((x, i, copyNo) => {
      const y = [...x];
      y[1] = copyNo > 1 ? `${x[1]} \xB7 L\u1EF1a ch\u1ECDn ${copyNo}` : x[1];
      y[23] = `${String(x[23] || "DEMO")}-FULL-${String(i + 1).padStart(3, "0")}`;
      return y;
    }, "copyRow");
    for (const cat of knownCats) {
      const pool = baseRows.filter((x) => String(x[2] || "") === cat);
      const need = Math.max(pool.length, Number(categoryNeeds.get(cat) || 0));
      for (let i = 0; i < need; i++) rows.push(copyRow(pool[i % pool.length], rows.length, Math.floor(i / pool.length) + 1));
    }
    const countTx = /* @__PURE__ */ __name((tx) => rows.filter((x) => String(x[8] || "") === tx).length, "countTx");
    let guard = 0;
    while (countTx("sale") < saleNeed && guard++ < 100) {
      const pool = baseRows.filter((x) => x[8] === "sale");
      rows.push(copyRow(pool[guard % pool.length], rows.length, Math.floor(guard / pool.length) + 2));
    }
    guard = 0;
    while (countTx("rent") < rentNeed && guard++ < 100) {
      const pool = baseRows.filter((x) => x[8] === "rent");
      rows.push(copyRow(pool[guard % pool.length], rows.length, Math.floor(guard / pool.length) + 2));
    }
    let cursor = 0;
    while (rows.length < generalNeed) {
      rows.push(copyRow(baseRows[cursor % baseRows.length], rows.length, Math.floor(cursor / baseRows.length) + 2));
      cursor++;
    }
    posts = rows.map((x, i) => {
      const [type, title, postCategory, image, price, area, address, phone, transaction, property_type, unit_price, bedrooms, bathrooms, floors, direction, legal, furniture, province, district, ward, contact_name, featured, verified, listing_code, frontage] = x;
      return { id: 91e4 + i, type, title, category: postCategory, image, price: price || "", area: area || "", address: address || "", phone: phone || "", content: propertyContent, status: "published", transaction: transaction || "", property_type: property_type || "", unit_price: unit_price || "", bedrooms: bedrooms || null, bathrooms: bathrooms || null, floors: floors || null, direction: direction || "", legal: legal || "", furniture: furniture || "", province: province || "", district: district || "", ward: ward || "", contact_name: contact_name || "", featured: featured ? 1 : 0, verified: verified ? 1 : 0, listing_code: listing_code || `SAMPLE-PROPERTY-${i + 1}`, frontage: frontage || "", views: 40 + i * 11, is_sample: 1, sample_key: `${key || "property"}:${listing_code || i + 1}`, __nr_blueprint: 1 };
    });
  } else {
    const sections = Array.isArray(sp?.sections) ? sp.sections : [];
    const categoryNeeds = /* @__PURE__ */ new Map();
    let totalNeed = limit;
    for (const sec of sections) {
      const slots = Math.max(0, Number(sec?.slots || 0));
      if (!slots) continue;
      const cat = String(sec?.category || (String(sec?.type || "").toLowerCase() === "category" ? sec?.title : "") || "").trim();
      if (cat) categoryNeeds.set(cat, Math.max(categoryNeeds.get(cat) || 0, slots));
      totalNeed = Math.max(totalNeed, slots);
    }
    const cats = categoryNeeds.size ? [...categoryNeeds.keys()] : Array.isArray(ep?.categories) ? ep.categories.map((x) => String(x || "").trim()).filter(Boolean) : [];
    const baseCats = cats.length ? cats : ["N\u1ED9i dung"];
    posts = [];
    for (const cat of baseCats) {
      const need = Math.max(1, Number(categoryNeeds.get(cat) || 0));
      for (let i2 = 0; i2 < need; i2++) posts.push({ id: 92e4 + posts.length, type: contentType === "generic" ? "news" : contentType, title: `${cat} \xB7 N\u1ED9i dung m\u1EABu ${String(i2 + 1).padStart(2, "0")}`, category: cat, image: "", content: "N\u1ED9i dung m\u1EABu d\xF9ng l\xE0m khung b\u1ED1 c\u1EE5c xem tr\u01B0\u1EDBc.", status: "published", featured: posts.length === 0 ? 1 : 0, verified: 1, listing_code: `SAMPLE-${String(posts.length + 1).padStart(3, "0")}`, views: 0, is_sample: 1, sample_key: `${key || "template"}:generic-${posts.length + 1}`, __nr_blueprint: 1 });
    }
    let i = 0;
    while (posts.length < totalNeed) {
      const cat = baseCats[i % baseCats.length];
      posts.push({ id: 92e4 + posts.length, type: contentType === "generic" ? "news" : contentType, title: `${cat} \xB7 N\u1ED9i dung m\u1EABu ${String(posts.length + 1).padStart(2, "0")}`, category: cat, image: "", content: "N\u1ED9i dung m\u1EABu d\xF9ng l\xE0m khung b\u1ED1 c\u1EE5c xem tr\u01B0\u1EDBc.", status: "published", featured: posts.length === 0 ? 1 : 0, verified: 1, listing_code: `SAMPLE-${String(posts.length + 1).padStart(3, "0")}`, views: 0, is_sample: 1, sample_key: `${key || "template"}:generic-${posts.length + 1}`, __nr_blueprint: 1 });
      i++;
    }
  }
  return { posts, content_type: contentType, template_key: key || String(t?.template_key || ""), editor_profile: ep };
}
__name(buildTemplatePreviewBlueprint, "buildTemplatePreviewBlueprint");
async function nextOrderCode(env) {
  const y = (/* @__PURE__ */ new Date()).getUTCFullYear();
  const prefix = `NR-${y}-`;
  const row = await env.DB.prepare(`
    SELECT order_code FROM customer_profiles
    WHERE order_code LIKE ?
    ORDER BY CAST(substr(order_code,9) AS INTEGER) DESC
    LIMIT 1
  `).bind(prefix + "%").first();
  let n = 1;
  if (row?.order_code) {
    const m = String(row.order_code).match(/NR-\d{4}-(\d+)$/);
    if (m) n = Number(m[1]) + 1;
  }
  return prefix + String(n).padStart(4, "0");
}
__name(nextOrderCode, "nextOrderCode");
function cfRegistrarConfigured(env) {
  return !!(env.CF_ACCOUNT_ID && env.CF_REGISTRAR_TOKEN);
}
__name(cfRegistrarConfigured, "cfRegistrarConfigured");
async function cfRegistrar(env, path, opts = {}) {
  if (!cfRegistrarConfigured(env)) throw new Error("Cloudflare Registrar ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh API");
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/registrar/${path}`, {
    ...opts,
    headers: {
      "Authorization": `Bearer ${env.CF_REGISTRAR_TOKEN}`,
      "Content-Type": "application/json",
      ...opts.headers || {}
    }
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.success === false) {
    const msg = d?.errors?.map((x) => x.message).filter(Boolean).join("; ") || `Cloudflare API l\u1ED7i ${r.status}`;
    throw new Error(msg);
  }
  return d.result ?? d;
}
__name(cfRegistrar, "cfRegistrar");
function normalizeDomain(v = "") {
  return String(v).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}
__name(normalizeDomain, "normalizeDomain");
function pagesToken(env) {
  return String(env.CF_PAGES_TOKEN || env.CLOUDFLARE_PAGES_TOKEN || env.CF_API_TOKEN || "").trim();
}
__name(pagesToken, "pagesToken");
function pagesProject(env) {
  return String(env.CF_PAGES_PROJECT || "newsreal").trim() || "newsreal";
}
__name(pagesProject, "pagesProject");
function pagesConfigured(env) {
  return !!(String(env.CF_ACCOUNT_ID || "").trim() && pagesToken(env));
}
__name(pagesConfigured, "pagesConfigured");
function pagesConfigProblem(env) {
  const missing = [];
  if (!String(env.CF_ACCOUNT_ID || "").trim()) missing.push("CF_ACCOUNT_ID");
  if (!pagesToken(env)) missing.push("CF_PAGES_TOKEN");
  return missing.join(" + ");
}
__name(pagesConfigProblem, "pagesConfigProblem");
async function cfPagesApi(env, path, opts = {}) {
  if (!pagesConfigured(env)) throw new Error("Ch\u01B0a c\u1EA5u h\xECnh CF_PAGES_TOKEN");
  const url = `https://api.cloudflare.com/client/v4/accounts/${String(env.CF_ACCOUNT_ID).trim()}/pages/projects/${encodeURIComponent(pagesProject(env))}/${path}`;
  const r = await fetch(url, { ...opts, headers: { "Authorization": `Bearer ${pagesToken(env)}`, "Content-Type": "application/json", ...opts.headers || {} } });
  const raw = await r.text();
  let d = {};
  try {
    d = raw ? JSON.parse(raw) : {};
  } catch {
  }
  if (!r.ok || d.success === false) {
    const msg = (d.errors || []).map((x) => x.message).filter(Boolean).join("; ") || `Cloudflare Pages API l\u1ED7i ${r.status}`;
    throw new Error(msg);
  }
  return d.result ?? d;
}
__name(cfPagesApi, "cfPagesApi");
async function attachPagesDomain(env, domain) {
  if (!pagesConfigured(env)) return { configured: false, status: "manual", error: (pagesConfigProblem(env) || "Pages config") + " ch\u01B0a c\xF3 trong runtime" };
  try {
    const result = await cfPagesApi(env, "domains", { method: "POST", body: JSON.stringify({ name: domain }) });
    return { configured: true, status: String(result?.status || "pending"), result };
  } catch (e) {
    try {
      const result = await cfPagesApi(env, `domains/${encodeURIComponent(domain)}`, { method: "GET" });
      return { configured: true, status: String(result?.status || "pending"), result, warning: e.message || String(e) };
    } catch {
    }
    return { configured: true, status: "error", error: e.message || String(e) };
  }
}
__name(attachPagesDomain, "attachPagesDomain");
async function getPagesDomainStatus(env, domain) {
  if (!pagesConfigured(env)) return { configured: false, status: "manual" };
  try {
    const result = await cfPagesApi(env, `domains/${encodeURIComponent(domain)}`, { method: "GET" });
    return { configured: true, status: String(result?.status || "pending"), result };
  } catch (e) {
    return { configured: true, status: "error", error: e.message || String(e) };
  }
}
__name(getPagesDomainStatus, "getPagesDomainStatus");
async function cfAccountApi(env, path, opts = {}) {
  const token = env.CF_DNS_TOKEN || env.CF_PAGES_TOKEN || env.CF_API_TOKEN || env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("Thi\u1EBFu CF_DNS_TOKEN/CF_PAGES_TOKEN");
  const r = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
    ...opts,
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", ...opts.headers || {} }
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error((j.errors || []).map((x) => x.message).join("; ") || `Cloudflare API ${r.status}`);
  return j.result;
}
__name(cfAccountApi, "cfAccountApi");
async function ensurePagesDns(env, domain) {
  try {
    const pages = await getPagesDomainStatus(env, domain);
    let zoneId = pages?.result?.zone_tag || pages?.result?.zone_id || "";
    let zoneSource = zoneId ? "pages" : "lookup";
    if (!zoneId) {
      const account = env.CF_ACCOUNT_ID;
      if (!account) return { ok: false, created: false, error: "Thi\u1EBFu CF_ACCOUNT_ID" };
      let zones = [];
      try {
        zones = await cfAccountApi(env, `zones?name=${encodeURIComponent(domain)}&account.id=${encodeURIComponent(account)}&status=active`);
      } catch (e) {
        return { ok: false, created: false, error: "Token DNS kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c Zone: " + (e.message || String(e)) };
      }
      const zone = Array.isArray(zones) ? zones[0] : null;
      if (!zone?.id) {
        return { ok: false, created: false, error: "Kh\xF4ng l\u1EA5y \u0111\u01B0\u1EE3c Zone ID. H\xE3y c\u1EA5p CF_DNS_TOKEN quy\u1EC1n Zone:Read + DNS:Edit" };
      }
      zoneId = zone.id;
    }
    const token = env.CF_DNS_TOKEN || env.CF_PAGES_TOKEN || env.CF_API_TOKEN || env.CLOUDFLARE_API_TOKEN;
    if (!token) return { ok: false, created: false, zone_id: zoneId, error: "Ch\u01B0a c\xF3 CF_DNS_TOKEN v\u1EDBi quy\u1EC1n DNS:Edit" };
    const target = `${env.CF_PAGES_PROJECT || "newsreal"}.pages.dev`;
    let existing = [];
    try {
      existing = await cfAccountApi(env, `zones/${zoneId}/dns_records?name=${encodeURIComponent(domain)}&type=CNAME`);
    } catch (e) {
      return { ok: false, created: false, zone_id: zoneId, error: "Kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c DNS record. CF_DNS_TOKEN c\u1EA7n Zone:DNS Read/Edit. " + (e.message || String(e)) };
    }
    if (Array.isArray(existing) && existing.length) {
      const rec = existing[0];
      if (String(rec.content || "").replace(/\.$/, "") === target) {
        return { ok: true, created: false, zone_id: zoneId, zone_source: zoneSource, target, record_id: rec.id };
      }
      return { ok: false, created: false, zone_id: zoneId, error: `Apex CNAME \u0111ang tr\u1ECF t\u1EDBi ${rec.content}, NEWSREAL kh\xF4ng t\u1EF1 ghi \u0111\xE8` };
    }
    try {
      const rec = await cfAccountApi(env, `zones/${zoneId}/dns_records`, {
        method: "POST",
        body: JSON.stringify({ type: "CNAME", name: domain, content: target, proxied: true, ttl: 1, comment: "NEWSREAL auto Pages DNS" })
      });
      return { ok: true, created: true, zone_id: zoneId, zone_source: zoneSource, target, record_id: rec?.id || "" };
    } catch (e) {
      return { ok: false, created: false, zone_id: zoneId, error: "Kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c DNS. CF_DNS_TOKEN c\u1EA7n Zone:DNS Edit. " + (e.message || String(e)) };
    }
  } catch (e) {
    return { ok: false, created: false, error: e.message || String(e) };
  }
}
__name(ensurePagesDns, "ensurePagesDns");
async function diagnoseDomain(env, domain) {
  const pages = await getPagesDomainStatus(env, domain);
  let dns = { ok: false, a: [], aaaa: [], error: "" };
  try {
    const [a4, a6] = await Promise.all([
      fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, { headers: { accept: "application/dns-json" } }).then((r2) => r2.json()),
      fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=AAAA`, { headers: { accept: "application/dns-json" } }).then((r2) => r2.json())
    ]);
    dns.a = (a4.Answer || []).filter((x) => x.type === 1).map((x) => x.data);
    dns.aaaa = (a6.Answer || []).filter((x) => x.type === 28).map((x) => x.data);
    dns.ok = dns.a.length > 0 || dns.aaaa.length > 0;
  } catch (e) {
    dns.error = e.message || String(e);
  }
  const r = pages.result || {};
  const validation = r.validation_data || {};
  const validationStatus = String(validation.status || validation.state || "").toLowerCase();
  const sslStatus = String(r.certificate_status || r.ssl_status || r.certificate?.status || "").toLowerCase();
  return {
    domain,
    pages_configured: pages.configured,
    pages_status: pages.status,
    pages_error: pages.error || "",
    dns,
    zone_status: String(r.zone_tag ? "connected" : "unknown"),
    validation_status: validationStatus || "pending",
    ssl_status: sslStatus || (pages.status === "active" ? "active" : "pending"),
    raw_stage: String(r.status || pages.status || "pending")
  };
}
__name(diagnoseDomain, "diagnoseDomain");
async function onRequest({ request, env }) {
  const u = new URL(request.url), route = u.pathname.replace(/^\/api\/?/, "");
  try {
    if (route === "publisher/health" && request.method === "GET") {
      if (!publisherAuthorized(request, env)) return json({ error: "Unauthorized" }, 401);
      return json({ ok: true, contract: "content-publisher-v1", content_types: ["game"], max_payload_bytes: 262144 });
    }
    if (route === "publisher/check" && request.method === "GET") {
      if (!publisherAuthorized(request, env)) return json({ error: "Unauthorized" }, 401);
      const tenant = String(u.searchParams.get("tenant") || u.searchParams.get("domain") || "").trim();
      const externalKey = String(u.searchParams.get("external_key") || "").trim();
      const slug = nrSlug(u.searchParams.get("slug") || "");
      const target = await publisherSite(env, tenant);
      if (!target) return json({ error: "Tenant kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c ch\u01B0a active" }, 404);
      let row = null;
      if (externalKey) row = await env.DB.prepare(`SELECT pi.*,p.title,p.status FROM publisher_imports pi JOIN posts p ON p.id=pi.post_id WHERE pi.site_id=? AND pi.external_key=? LIMIT 1`).bind(target.id, externalKey).first();
      else if (slug) row = await env.DB.prepare(`SELECT pi.*,p.title,p.status FROM publisher_imports pi JOIN posts p ON p.id=pi.post_id WHERE pi.site_id=? AND pi.slug=? LIMIT 1`).bind(target.id, slug).first();
      return json({ ok: true, exists: !!row, item: row ? { post_id: Number(row.post_id), external_key: row.external_key, slug: row.slug, title: row.title, status: row.status, url: `https://${target.domain}/base/${row.slug}.html`, updated_at: row.updated_at } : null });
    }
    if (route === "publisher/base" && request.method === "POST") {
      if (!publisherAuthorized(request, env)) return json({ error: "Unauthorized" }, 401);
      const b = await body(request);
      const tenant = String(b.tenant_domain || b.tenant || b.domain || "").trim();
      const target = await publisherSite(env, tenant);
      if (!target) return json({ error: "Tenant kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c ch\u01B0a active" }, 404);
      const templateKey = String(target.template_key || "");
      if (templateKey !== "game-1" && String(target.preset || "") !== "game_clash_1") return json({ error: "Publisher Base V1 ch\u1EC9 nh\u1EADn tenant Game / Clash of Clans" }, 409);
      const title = String(b.title || "").trim();
      if (!title) return json({ error: "Thi\u1EBFu title" }, 400);
      const sourceUrl = String(b.source_url || b.sourceUrl || "").trim();
      const copyLink = String(b.copy_link || b.baseLink || b.copyLink || "").trim();
      const externalKey = String(b.external_key || b.base_id || b.baseId || copyLink || sourceUrl || "").trim();
      if (!externalKey) return json({ error: "Thi\u1EBFu external_key/base_id/baseLink/source_url \u0111\u1EC3 ch\u1ED1ng tr\xF9ng" }, 400);
      let slug = nrSlug(b.slug || b.slug_key || b.slugKey || title);
      if (!slug) slug = "base-" + (await sha256(externalKey)).slice(0, 16);
      const group = String(b.game_group || b.group || b.category || "Town Hall").trim();
      const level = String(b.game_level || b.level || "").trim().toUpperCase();
      const purpose = String(b.game_purpose || b.purpose || b.type || b.baseType || "Base").trim();
      const style = String(b.game_style || b.style || "").trim();
      const defense = String(b.game_defense || b.defense || "").trim();
      const image = String(b.processed_image_url || b.processedImageUrl || b.image_url || b.imageUrl || b.image || "").trim();
      const year = String(b.game_year || b.year || (/* @__PURE__ */ new Date()).getUTCFullYear()).trim();
      const content = String(b.content || b.description || "").trim() || `<p>${title}</p>`;
      const extra = { game_group: group, game_level: level, game_purpose: purpose, game_style: style, game_defense: defense, copy_link: copyLink, game_year: year, slug, source_url: sourceUrl, external_key: externalKey, original_image_url: String(b.original_image_url || b.originalImageUrl || "").trim(), publisher: "vps", sharing_model: "community_free" };
      const payloadHash = await sha256(JSON.stringify({ title, sourceUrl, copyLink, group, level, purpose, style, defense, image, year, content, slug }));
      let imp = await env.DB.prepare(`SELECT * FROM publisher_imports WHERE site_id=? AND external_key=? LIMIT 1`).bind(target.id, externalKey).first();
      if (!imp) {
        const slugTaken = await env.DB.prepare(`SELECT id,external_key FROM publisher_imports WHERE site_id=? AND slug=? LIMIT 1`).bind(target.id, slug).first();
        if (slugTaken && String(slugTaken.external_key) !== externalKey) slug = `${slug}-${(await sha256(externalKey)).slice(0, 8)}`;
        extra.slug = slug;
        const r = await env.DB.prepare(`INSERT INTO posts(site_id,type,title,category,image,content,status,author_id,featured,verified,listing_code,views,is_sample,sample_key,extra_json) VALUES(?,?,?,?,?,?,'published',NULL,?,?,?,?,0,'',?)`).bind(target.id, "game", title, group, image, content, b.featured ? 1 : 0, 1, `COC-${(await sha256(externalKey)).slice(0, 12).toUpperCase()}`, Number(b.views || 0), JSON.stringify(extra)).run();
        const postId = Number(r.meta.last_row_id);
        await env.DB.prepare(`INSERT INTO publisher_imports(site_id,post_id,external_key,slug,source_url,payload_hash) VALUES(?,?,?,?,?,?)`).bind(target.id, postId, externalKey, slug, sourceUrl, payloadHash).run();
        try {
          await env.DB.prepare(`INSERT OR IGNORE INTO game_base_stats(site_id,slug,views) VALUES(?,?,?)`).bind(target.id, slug, Number(b.views || 0)).run();
        } catch (e) {
        }
        return json({ ok: true, created: true, updated: false, duplicate: false, post_id: postId, slug, url: `https://${target.domain}/base/${slug}.html` }, 201);
      }
      const current = await env.DB.prepare(`SELECT id,extra_json FROM posts WHERE id=? AND site_id=? LIMIT 1`).bind(imp.post_id, target.id).first();
      if (!current) return json({ error: "Publisher index tr\u1ECF t\u1EDBi post kh\xF4ng c\xF2n t\u1ED3n t\u1EA1i" }, 409);
      const merged = { ...(() => {
        try {
          return JSON.parse(current.extra_json || "{}");
        } catch {
          return {};
        }
      })(), ...extra, slug: imp.slug };
      await env.DB.prepare(`UPDATE posts SET type='game',title=?,category=?,image=?,content=?,status='published',featured=?,verified=1,extra_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND site_id=?`).bind(title, group, image, content, b.featured ? 1 : 0, JSON.stringify(merged), imp.post_id, target.id).run();
      await env.DB.prepare(`UPDATE publisher_imports SET source_url=?,payload_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(sourceUrl, payloadHash, imp.id).run();
      return json({ ok: true, created: false, updated: true, duplicate: imp.payload_hash === payloadHash, post_id: Number(imp.post_id), slug: imp.slug, url: `https://${target.domain}/base/${imp.slug}.html` });
    }
    if (route === "system/trial-maintenance" && request.method === "POST") {
      const auth = request.headers.get("Authorization") || "";
      if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) return json({ error: "Unauthorized" }, 401);
      const expired = (await env.DB.prepare(`UPDATE website_trials SET status='expired',updated_at=CURRENT_TIMESTAMP WHERE status='active' AND datetime(expires_at)<=datetime('now') RETURNING id`).all()).results || [];
      const due = (await env.DB.prepare(`SELECT wt.id,wt.site_id FROM website_trials wt WHERE wt.status='expired' AND datetime(wt.grace_expires_at)<=datetime('now')`).all()).results || [];
      let purged = 0;
      for (const x of due) {
        try {
          await env.DB.batch([env.DB.prepare(`DELETE FROM sessions WHERE site_id=?`).bind(x.site_id), env.DB.prepare(`DELETE FROM posts WHERE site_id=?`).bind(x.site_id), env.DB.prepare(`UPDATE sites SET status='inactive' WHERE id=?`).bind(x.site_id), env.DB.prepare(`UPDATE website_trials SET status='purged',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(x.id)]);
          purged++;
        } catch (e) {
        }
      }
      return json({ ok: true, expired: expired.length, purged });
    }
    if (route === "system/renewal-reminders" && request.method === "POST") {
      const auth = request.headers.get("Authorization") || "";
      if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) return json({ error: "Unauthorized" }, 401);
      const { results } = await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,ss.expires_at,
    coalesce(sp.term_months,12) term_months,coalesce(sp.bonus_months,0) bonus_months
    FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin' LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id
    WHERE s.status='active' AND ss.service_status IN ('active','ready') AND ss.expires_at IS NOT NULL AND date(ss.expires_at)>=date('now')
    AND julianday(ss.expires_at)-julianday(date('now'))<=30 ORDER BY ss.expires_at ASC`).all();
      const thresholds = [30, 14, 7, 3, 1], out = [];
      for (const row of results) {
        const days = Math.max(0, Math.ceil((/* @__PURE__ */ new Date(String(row.expires_at) + "T23:59:59Z") - /* @__PURE__ */ new Date()) / 864e5));
        const key = thresholds.find((x) => days <= x);
        if (!key) continue;
        const reminderKey = `d${key}`;
        const exists = await env.DB.prepare(`SELECT id FROM renewal_reminder_log WHERE site_id=? AND service_expires_at=? AND reminder_key=?`).bind(row.id, row.expires_at, reminderKey).first();
        if (exists) continue;
        const sent = await renewalEmailForSite(env, row, new URL(request.url).origin, reminderKey);
        if (sent.ok) {
          await env.DB.prepare(`INSERT OR IGNORE INTO renewal_reminder_log(site_id,service_expires_at,reminder_key,email) VALUES(?,?,?,?)`).bind(row.id, row.expires_at, reminderKey, sent.email).run();
          out.push({ site_id: row.id, ok: true, email: sent.email, days, reminder: reminderKey });
        } else out.push({ site_id: row.id, ok: false, error: sent.error || "Send failed" });
      }
      return json({ ok: true, checked: results.length, sent: out.filter((x) => x.ok).length, results: out });
    }
    if (route === "renewal/payment-status" && request.method === "GET") {
      const orderCode = String(u.searchParams.get("order_code") || "").trim(), token = String(u.searchParams.get("token") || "").trim();
      if (!orderCode || !token) return json({ error: "Thi\u1EBFu th\xF4ng tin thanh to\xE1n" }, 400);
      const hash = await sha256(token);
      const row = await env.DB.prepare(`SELECT status,amount,paid_amount,paid_at,order_code,years FROM renewal_payments WHERE order_code=? AND token_hash=? LIMIT 1`).bind(orderCode, hash).first();
      if (!row) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y giao d\u1ECBch" }, 404);
      return json({ ok: true, status: row.status, amount: Number(row.amount || 0), paid_amount: Number(row.paid_amount || 0), paid_at: row.paid_at || null, order_code: row.order_code, years: Number(row.years || 1) });
    }
    if (route === "renewal/info" && request.method === "GET") {
      const raw = String(u.searchParams.get("token") || "");
      if (!raw) return json({ error: "Thi\u1EBFu m\xE3 x\xE1c nh\u1EADn" }, 400);
      const hash = await sha256(raw);
      const row = await env.DB.prepare(`SELECT rt.id token_id,rt.expires_at,rt.used_at,s.id site_id,s.name,s.domain,ss.expires_at service_expires_at,cp.full_name,
    coalesce(sp.renewal_status,'none') renewal_status,coalesce(sp.renewal_price,1999000) renewal_price
    FROM renewal_response_tokens rt JOIN sites s ON s.id=rt.site_id LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE rt.token_hash=?`).bind(hash).first();
      if (!row) return json({ error: "Li\xEAn k\u1EBFt kh\xF4ng h\u1EE3p l\u1EC7" }, 404);
      if (/* @__PURE__ */ new Date(row.expires_at + "Z") <= /* @__PURE__ */ new Date()) return json({ error: "Li\xEAn k\u1EBFt \u0111\xE3 h\u1EBFt h\u1EA1n" }, 410);
      return json({ ok: true, site: { name: row.name, domain: row.domain }, customer_name: row.full_name || "", expires_at: row.service_expires_at || "", renewal_status: row.renewal_status, renewal_price: Number(row.renewal_price || 0), responded: !!row.used_at });
    }
    if (route === "renewal/respond" && request.method === "POST") {
      const b = await body(request), raw = String(b.token || ""), decision = String(b.decision || "");
      if (!raw || !["yes", "no"].includes(decision)) return json({ error: "Y\xEAu c\u1EA7u kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      const hash = await sha256(raw);
      const rt = await env.DB.prepare(`SELECT * FROM renewal_response_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>datetime('now')`).bind(hash).first();
      if (!rt) return json({ error: "Li\xEAn k\u1EBFt \u0111\xE3 h\u1EBFt h\u1EA1n ho\u1EB7c \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng" }, 410);
      if (decision === "yes") {
        try {
          const pay = await createRenewalPayment(env, rt.site_id, Number(b.years || 1));
          await env.DB.prepare(`UPDATE renewal_response_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?`).bind(rt.id).run();
          return json({ ok: true, decision, payment: { order_code: pay.order_code, payment_token: pay.payment_token, years: pay.years, amount: pay.amount, memo: pay.memo, provider: pay.provider, provider_order_code: pay.provider_order_code, qr_code: pay.qr_code, checkout_url: pay.checkout_url, payment_link_id: pay.payment_link_id, qr_url: pay.qr_url, bank_name: pay.bank_name, account_name: pay.account_name, account_number: pay.account_number } });
        } catch (e) {
          return json({ error: e.message || "Kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c thanh to\xE1n gia h\u1EA1n" }, 400);
        }
      }
      await env.DB.batch([
        env.DB.prepare(`UPDATE renewal_response_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?`).bind(rt.id),
        env.DB.prepare(`INSERT INTO service_promotions(site_id,renewal_status,renewal_decision_at,renewal_stage,updated_at) VALUES(?,'no',CURRENT_TIMESTAMP,'declined',CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET renewal_status='no',renewal_decision_at=CURRENT_TIMESTAMP,renewal_stage='declined',updated_at=CURRENT_TIMESTAMP`).bind(rt.site_id)
      ]);
      return json({ ok: true, decision });
    }
    if (route === "trial/create" && request.method === "POST") {
      const b = await body(request), name = String(b.name || "").trim(), phone = String(b.phone || "").trim(), email = String(b.email || "").trim().toLowerCase(), zalo = String(b.zalo || phone).trim(), siteName = String(b.site_name || "").trim();
      const templateKey = String(b.template_key || "").trim();
      if (!name || !phone || !email || !siteName || !templateKey) return json({ error: "Vui l\xF2ng nh\u1EADp h\u1ECD t\xEAn, s\u1ED1 \u0111i\u1EC7n tho\u1EA1i, email, t\xEAn website mong mu\u1ED1n v\xE0 ch\u1ECDn giao di\u1EC7n" }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Email kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      const tpl = await env.DB.prepare(`SELECT template_key,name,category,preset,price,renewal_price,accent FROM template_catalog WHERE template_key=? AND is_active=1 LIMIT 1`).bind(templateKey).first();
      if (!tpl) return json({ error: "Giao di\u1EC7n kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c \u0111\xE3 ng\u1EEBng cung c\u1EA5p" }, 404);
      const ipRaw = String(request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "").split(",")[0].trim();
      const uaRaw = String(request.headers.get("User-Agent") || "").slice(0, 500);
      const ipHash = ipRaw ? await sha256("trial-ip:" + ipRaw) : "";
      const uaHash = uaRaw ? await sha256("trial-ua:" + uaRaw) : "";
      if (String(b.website || "").trim()) return json({ error: "Y\xEAu c\u1EA7u kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      const identityBurst = await env.DB.prepare(`SELECT count(*) c FROM website_trials wt JOIN sales_leads sl ON sl.id=wt.lead_id WHERE (lower(sl.email)=? OR sl.phone=?) AND wt.created_at>=datetime('now','-30 days')`).bind(email, phone).first();
      if (Number(identityBurst?.c || 0) >= 3) return json({ error: "B\u1EA1n \u0111\xE3 s\u1EED d\u1EE5ng s\u1ED1 l\u01B0\u1EE3t d\xF9ng th\u1EED mi\u1EC5n ph\xED cho ph\xE9p trong th\u1EDDi gian g\u1EA7n \u0111\xE2y. Vui l\xF2ng li\xEAn h\u1EC7 HoangVuongTech n\u1EBFu c\u1EA7n th\xEAm th\u1EDDi gian tr\u1EA3i nghi\u1EC7m.", code: "TRIAL_IDENTITY_LIMIT" }, 429);
      if (ipHash) {
        const ipBurst = await env.DB.prepare(`SELECT count(*) c FROM website_trials WHERE source_ip_hash=? AND created_at>=datetime('now','-1 day')`).bind(ipHash).first();
        if (Number(ipBurst?.c || 0) >= 5) return json({ error: "\u0110\xE3 c\xF3 nhi\u1EC1u l\u01B0\u1EE3t d\xF9ng th\u1EED \u0111\u01B0\u1EE3c t\u1EA1o t\u1EEB k\u1EBFt n\u1ED1i n\xE0y. Vui l\xF2ng th\u1EED l\u1EA1i sau ho\u1EB7c li\xEAn h\u1EC7 HoangVuongTech.", code: "TRIAL_IP_LIMIT" }, 429);
      }
      const dup = await env.DB.prepare(`SELECT wt.id,wt.trial_token,wt.expires_at,wt.status,s.domain FROM website_trials wt JOIN sales_leads sl ON sl.id=wt.lead_id JOIN sites s ON s.id=wt.site_id
    WHERE wt.template_key=? AND (lower(sl.email)=? OR sl.phone=?) AND wt.created_at>=datetime('now','-7 days') ORDER BY wt.id DESC LIMIT 1`).bind(templateKey, email, phone).first();
      if (dup) {
        const st = trialPublicState(dup);
        if (String(dup.status || "") === "pending_activation") {
          const ar = activationToken(), ah = await sha256(ar);
          await env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=(SELECT site_id FROM website_trials WHERE id=?) AND used_at IS NULL`).bind(dup.id).run();
          await env.DB.prepare(`INSERT INTO site_activation_tokens(site_id,token_hash,expires_at) SELECT site_id,?,datetime('now','+2 days') FROM website_trials WHERE id=?`).bind(ah, dup.id).run();
          return json({ error: "B\u1EA1n \u0111\xE3 \u0111\u0103ng k\xFD d\xF9ng th\u1EED giao di\u1EC7n n\xE0y. H\xE3y ho\xE0n t\u1EA5t b\u01B0\u1EDBc k\xEDch ho\u1EA1t.", code: "TRIAL_PENDING_ACTIVATION", activation_url: `/activate/?token=${encodeURIComponent(ar)}&trial=1`, status: "pending_activation" }, 409);
        }
        return json({ error: "B\u1EA1n \u0111\xE3 \u0111\u0103ng k\xFD d\xF9ng th\u1EED giao di\u1EC7n n\xE0y trong 7 ng\xE0y g\u1EA7n \u0111\xE2y.", code: "TRIAL_RECENT_EXISTS", trial_url: `/trial/${dup.trial_token}/`, expires_at: dup.expires_at, status: st?.status }, 409);
      }
      const leadRun = await env.DB.prepare(`INSERT INTO sales_leads(source,status,lead_kind,care_status,template_key,template_name,price,renewal_price,customer_name,phone,email,zalo,company,trial_source_url,site_name,requested_domain,note,marketing_opt_in,last_activity_at)
    VALUES('trial','new','trial','new',?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`).bind(templateKey, tpl.name, Number(tpl.price || 0), Number(tpl.renewal_price || 0), name, phone, email, zalo, String(b.company || ""), String(b.source_url || ""), siteName, "", String(b.note || ""), b.marketing_opt_in ? 1 : 0).run();
      const leadId = Number(leadRun.meta.last_row_id), token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
      const tenant = `trial-${token.slice(0, 16)}.trial.hoangvuongtech.local`;
      const accentMap = { green: "#138a4b", orange: "#e87817", purple: "#7653d6", red: "#d74646", blue: "#1463ff", navy: "#0f2943", black: "#111827" };
      const siteRun = await env.DB.prepare(`INSERT INTO sites(name,domain,preset,template_key,accent,phone,zalo,facebook,email,status) VALUES(?,?,?,?,?,?,?,?,?,'active')`).bind(`${siteName} \xB7 Trial`, tenant, tpl.preset, templateKey, accentMap[String(tpl.accent || "blue")] || "#1463ff", phone, zalo, "", email).run();
      const siteId = Number(siteRun.meta.last_row_id);
      const placeholder = await sha256(activationToken());
      await env.DB.prepare(`INSERT INTO users(site_id,email,password_hash,role) VALUES(?,?,?,'admin')`).bind(siteId, email, placeholder).run();
      await env.DB.prepare(`INSERT INTO customer_profiles(site_id,full_name,phone,email,company,order_code,internal_note,activated_at,updated_at) VALUES(?,?,?,?,?,'','TRIAL WEBSITE',NULL,CURRENT_TIMESTAMP)`).bind(siteId, name, phone, email, String(b.company || "")).run();
      await env.DB.prepare(`INSERT INTO site_public_settings(site_id,contact_email,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(site_id) DO UPDATE SET contact_email=excluded.contact_email,updated_at=CURRENT_TIMESTAMP`).bind(siteId, email).run();
      const trialRun = await env.DB.prepare(`INSERT INTO website_trials(trial_token,site_id,lead_id,template_key,status,expires_at,grace_expires_at,source_ip_hash,user_agent_hash) VALUES(?,?,?,?,'pending_activation',datetime('now','+1 day'),datetime('now','+8 days'),?,?)`).bind(token, siteId, leadId, templateKey, ipHash, uaHash).run();
      const trialId = Number(trialRun.meta.last_row_id);
      await env.DB.prepare(`UPDATE sales_leads SET trial_id=? WHERE id=?`).bind(trialId, leadId).run();
      await env.DB.prepare(`INSERT INTO service_subscriptions(site_id,plan_name,sale_price,internal_cost,payment_status,service_status,started_at,expires_at,domain_status,registrar,note)
    VALUES(?,'D\xF9ng th\u1EED website 24 gi\u1EDD',0,0,'trial','pending_activation',date('now'),date('now','+1 day'),'trial','HoangVuongTech','Tenant d\xF9ng th\u1EED - kh\xF4ng t\xEDnh doanh thu')`).bind(siteId).run();
      try {
        await env.DB.prepare(`UPDATE service_subscriptions SET finance_excluded=1 WHERE site_id=?`).bind(siteId).run();
      } catch (e) {
      }
      const activationRaw = activationToken(), activationHash = await sha256(activationRaw);
      await env.DB.prepare(`INSERT INTO site_activation_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+2 days'))`).bind(siteId, activationHash).run();
      try {
        await env.DB.prepare(`DELETE FROM posts WHERE site_id=?`).bind(siteId).run();
      } catch (e) {
      }
      const tr = await trialByToken(env, token);
      await trialEvent(env, tr, "trial_created", { template_key: templateKey, activation_required: true });
      const demoBase = String(tpl.demo_url || (tpl.category === "ban-hang" && templateKey === "san-pham-1" ? "/demo/san-pham/mau-1/" : tpl.category === "game" && templateKey === "game-1" ? "/demo/game/clash-of-clans/" : `/demo/${tpl.category === "tin-tuc" ? "tin-tuc" : tpl.category === "dich-vu" ? "dich-vu" : "bat-dong-san"}/${templateKey.replace("tin-tuc-", "mau-").replace("dich-vu-", "mau-")}/`));
      return json({
        ok: true,
        trial_id: trialId,
        lead_id: leadId,
        token,
        tenant,
        status: "pending_activation",
        activation_url: `/activate/?token=${encodeURIComponent(activationRaw)}&trial=1`,
        trial_url: `/trial/${token}/`,
        website_url: `${demoBase}?nr_trial=${encodeURIComponent(token)}`,
        admin_email: email,
        template: { key: templateKey, name: tpl.name }
      });
    }
    if (route === "trial/status" && request.method === "GET") {
      const tr = await trialByToken(env, String(u.searchParams.get("token") || ""));
      if (!tr) return json({ error: "Trial kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      await trialEvent(env, tr, "trial_seen", { path: String(u.searchParams.get("path") || "") });
      const demoBase = String(tr.template_demo_url || (tr.template_category === "ban-hang" && tr.template_key === "san-pham-1" ? "/demo/san-pham/mau-1/" : tr.template_category === "game" && tr.template_key === "game-1" ? "/demo/game/clash-of-clans/" : `/demo/${tr.template_category === "tin-tuc" ? "tin-tuc" : tr.template_category === "dich-vu" ? "dich-vu" : "bat-dong-san"}/${String(tr.template_key || "").replace("tin-tuc-", "mau-").replace("dich-vu-", "mau-")}/`));
      const websiteUrl = demoBase + (demoBase.includes("?") ? "&" : "?") + "nr_trial=" + encodeURIComponent(tr.trial_token);
      return json({ ok: true, trial: trialPublicState(tr), customer: { name: tr.customer_name || "", email: tr.email || "", phone: tr.phone || "", zalo: tr.zalo || "", company: tr.company || "", facebook: tr.facebook || "", site_name: tr.site_name || "", note: tr.note || "", marketing_opt_in: Number(tr.marketing_opt_in || 0) }, template: { key: tr.template_key, name: tr.template_name || tr.template_key, price: Number(tr.template_price || 0), renewal_price: Number(tr.template_renewal_price || 0), demo_url: demoBase }, website_url: websiteUrl });
    }
    if (route === "trial/convert-request" && request.method === "POST") {
      const b = await body(request), tr = await trialByToken(env, String(b.token || ""));
      if (!tr) return json({ error: "Trial kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      await env.DB.batch([
        env.DB.prepare(`UPDATE website_trials SET conversion_request_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.id),
        env.DB.prepare(`UPDATE sales_leads SET status='contacted',care_status='interested',last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.lead_id)
      ]);
      await trialEvent(env, tr, "conversion_requested", {});
      return json({ ok: true, lead_id: tr.lead_id, checkout_url: `/trial-checkout/?token=${encodeURIComponent(tr.trial_token)}` });
    }
    if (route === "trial/direct-checkout" && request.method === "POST") {
      const b = await body(request), trialToken = String(b.token || "").trim();
      if (!trialToken) return json({ error: "Thi\u1EBFu m\xE3 website d\xF9ng th\u1EED" }, 400);
      const tr = await trialByToken(env, trialToken);
      if (!tr) return json({ error: "Website d\xF9ng th\u1EED kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const templateKey = String(tr.template_key || "").trim();
      const tpl = await env.DB.prepare(`SELECT template_key,name,price,renewal_price FROM template_catalog WHERE template_key=? AND is_active=1 LIMIT 1`).bind(templateKey).first();
      if (!tpl) return json({ error: "Giao di\u1EC7n c\u1EE7a website d\xF9ng th\u1EED kh\xF4ng c\xF2n m\u1EDF b\xE1n" }, 409);
      const name = String(tr.customer_name || "").trim(), phone = String(tr.phone || "").trim(), email = String(tr.email || "").trim().toLowerCase();
      const siteName = String(tr.site_name || "").trim(), note = String(tr.note || "").trim(), facebook = String(tr.facebook || "").trim();
      const marketingOptIn = Number(tr.marketing_opt_in || 0) === 1 ? 1 : 0;
      if (!name || !phone || !email || !siteName) return json({ error: "Website d\xF9ng th\u1EED ch\u01B0a \u0111\u1EE7 th\xF4ng tin k\xEDch ho\u1EA1t. Vui l\xF2ng li\xEAn h\u1EC7 h\u1ED7 tr\u1EE3." }, 409);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Email c\u1EE7a website d\xF9ng th\u1EED kh\xF4ng h\u1EE3p l\u1EC7" }, 409);
      const templateName = String(tpl.name || tr.template_name || templateKey).trim();
      const finalPrice = Math.max(0, Number(tpl.price || 0)), renewalPrice = Math.max(0, Number(tpl.renewal_price || 0));
      if (finalPrice <= 0) return json({ error: "Giao di\u1EC7n n\xE0y ch\u01B0a c\xF3 gi\xE1 thanh to\xE1n t\u1EF1 \u0111\u1ED9ng. Vui l\xF2ng li\xEAn h\u1EC7 h\u1ED7 tr\u1EE3." }, 409);
      const leadId = Number(tr.lead_id || 0);
      if (!leadId) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y h\u1ED3 s\u01A1 d\xF9ng th\u1EED" }, 409);
      await env.DB.batch([
        env.DB.prepare(`UPDATE sales_leads SET source='trial_conversion',status='payment_pending',care_status='interested',template_key=?,template_name=?,price=?,renewal_price=?,customer_name=?,phone=?,email=?,site_name=?,requested_domain='',note=?,facebook=?,marketing_opt_in=?,payment_status='pending',last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(templateKey, templateName, finalPrice, renewalPrice, name, phone, email, siteName, note, facebook, marketingOptIn, leadId),
        env.DB.prepare(`UPDATE website_trials SET conversion_request_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.id)
      ]);
      await env.DB.prepare(`UPDATE purchase_payments SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE lead_id=? AND status='pending'`).bind(leadId).run();
      const orderCode = purchaseOrderCode(leadId), token = activationToken(), tokenHash = await sha256(token);
      await env.DB.prepare(`INSERT INTO purchase_payments(lead_id,order_code,token_hash,amount,status,provider) VALUES(?,?,?,?,'pending','bank_qr')`).bind(leadId, orderCode, tokenHash, finalPrice).run();
      await env.DB.prepare(`UPDATE sales_leads SET payment_order_code=?,payment_status='pending',paid_amount=0,paid_at=NULL,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(orderCode, leadId).run();
      await trialEvent(env, tr, "payment_started", { lead_id: leadId, amount: finalPrice, direct_checkout: true });
      const listPrice = Math.max(finalPrice, renewalPrice || 0), discount = Math.max(0, listPrice - finalPrice);
      const cfg = paymentConfig(env), origin = String(env.PUBLIC_APP_URL || u.origin).replace(/\/$/, "");
      let provider = "bank_qr", memo = orderCode, qrCode = "", checkoutUrl = "", paymentLinkId = "", providerOrderCode = null;
      let bankName = cfg.bankName, accountName = cfg.accountName, accountNumber = cfg.accountNumber, qrUrl = purchasePaymentQr(env, finalPrice, memo);
      if (payosReady(env)) {
        const po = await payosCreatePayment(env, { amount: finalPrice, description: `HV${String(leadId).slice(-6)}`, returnUrl: `${origin}/?payment=success`, cancelUrl: `${origin}/?payment=cancel`, buyerName: name, buyerEmail: email, buyerPhone: phone });
        provider = "payos";
        providerOrderCode = Number(po.orderCode);
        paymentLinkId = String(po.paymentLinkId || "");
        checkoutUrl = String(po.checkoutUrl || "");
        qrCode = String(po.qrCode || "");
        memo = String(po.description || orderCode);
        bankName = "MB Bank / payOS";
        accountName = String(po.accountName || "");
        accountNumber = String(po.accountNumber || "");
        qrUrl = "";
        await env.DB.prepare(`UPDATE purchase_payments SET provider='payos',provider_order_code=?,payment_link_id=?,checkout_url=?,qr_code=?,updated_at=CURRENT_TIMESTAMP WHERE order_code=?`).bind(providerOrderCode, paymentLinkId, checkoutUrl, qrCode, orderCode).run();
      }
      return json({
        ok: true,
        lead_id: leadId,
        order_code: orderCode,
        payment_token: token,
        status: "pending",
        trial_token: trialToken,
        invoice: { template_name: templateName, list_price: listPrice, domain_price: 0, hosting_price: 0, discount, total: finalPrice, renewal_price: renewalPrice, site_name: siteName },
        payment: { provider, provider_order_code: providerOrderCode, amount: finalPrice, memo, qr_code: qrCode, checkout_url: checkoutUrl, payment_link_id: paymentLinkId, qr_url: qrUrl, bank_name: bankName, account_name: accountName, account_number: accountNumber }
      });
    }
    if (route === "template-inquiry" && request.method === "POST") {
      const b = await body(request);
      const name = String(b.name || "").trim(), phone = String(b.phone || "").trim();
      const email = String(b.email || "").trim().toLowerCase();
      const siteName = String(b.site_name || "").trim(), note = String(b.note || "").trim();
      const facebook = String(b.facebook || "").trim(), templateKey = String(b.template_key || "").trim();
      const marketingOptIn = b.marketing_opt_in === true || Number(b.marketing_opt_in) === 1 ? 1 : 0;
      if (!name || !phone || !email || !siteName) return json({ error: "Vui l\xF2ng nh\u1EADp h\u1ECD t\xEAn, s\u1ED1 \u0111i\u1EC7n tho\u1EA1i, email ch\xEDnh x\xE1c v\xE0 t\xEAn website mong mu\u1ED1n" }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Email kh\xF4ng h\u1EE3p l\u1EC7. \u0110\xE2y l\xE0 email d\xF9ng \u0111\u1EC3 nh\u1EADn link k\xEDch ho\u1EA1t website." }, 400);
      const tpl = templateKey ? await env.DB.prepare(`SELECT template_key,name,price,renewal_price FROM template_catalog WHERE template_key=? AND is_active=1 LIMIT 1`).bind(templateKey).first() : null;
      if (!tpl) return json({ error: "Vui l\xF2ng ch\u1ECDn m\u1ED9t giao di\u1EC7n \u0111ang m\u1EDF b\xE1n tr\u01B0\u1EDBc khi thanh to\xE1n" }, 400);
      const templateName = String(tpl.name || b.template_name || templateKey).trim();
      const finalPrice = Math.max(0, Number(tpl.price || 0)), renewalPrice = Math.max(0, Number(tpl.renewal_price || 0));
      if (finalPrice <= 0) return json({ error: "Giao di\u1EC7n n\xE0y ch\u01B0a c\xF3 gi\xE1 thanh to\xE1n t\u1EF1 \u0111\u1ED9ng. Vui l\xF2ng li\xEAn h\u1EC7 h\u1ED7 tr\u1EE3." }, 409);
      let leadId = 0;
      const trialToken = String(b.trial_token || "").trim();
      if (trialToken) {
        const tr = await trialByToken(env, trialToken);
        if (tr) {
          leadId = Number(tr.lead_id);
          await env.DB.batch([
            env.DB.prepare(`UPDATE sales_leads SET source='trial_conversion',status='payment_pending',care_status='interested',template_key=?,template_name=?,price=?,renewal_price=?,customer_name=?,phone=?,email=?,site_name=?,requested_domain='',note=?,facebook=?,marketing_opt_in=?,payment_status='pending',last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(templateKey, templateName, finalPrice, renewalPrice, name, phone, email, siteName, note, facebook, marketingOptIn, leadId),
            env.DB.prepare(`UPDATE website_trials SET conversion_request_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.id)
          ]);
          await trialEvent(env, tr, "payment_started", { lead_id: leadId, amount: finalPrice });
        }
      }
      if (!leadId) {
        const ins = await env.DB.prepare(`INSERT INTO sales_leads
      (source,status,template_key,template_name,price,renewal_price,customer_name,phone,email,site_name,requested_domain,note,facebook,marketing_opt_in,payment_status)
      VALUES('template_checkout','payment_pending',?,?,?,?,?,?,?,?,?,?,?,?,'pending')`).bind(templateKey, templateName, finalPrice, renewalPrice, name, phone, email, siteName, "", note, facebook, marketingOptIn).run();
        leadId = Number(ins.meta.last_row_id);
      }
      await env.DB.prepare(`UPDATE purchase_payments SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE lead_id=? AND status='pending'`).bind(leadId).run();
      const orderCode = purchaseOrderCode(leadId), token = activationToken(), tokenHash = await sha256(token);
      await env.DB.prepare(`INSERT INTO purchase_payments(lead_id,order_code,token_hash,amount,status,provider) VALUES(?,?,?,?,'pending','bank_qr')`).bind(leadId, orderCode, tokenHash, finalPrice).run();
      await env.DB.prepare(`UPDATE sales_leads SET payment_order_code=?,payment_status='pending',paid_amount=0,paid_at=NULL,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(orderCode, leadId).run();
      const listPrice = Math.max(finalPrice, renewalPrice || 0), discount = Math.max(0, listPrice - finalPrice);
      const cfg = paymentConfig(env), origin = String(env.PUBLIC_APP_URL || u.origin).replace(/\/$/, "");
      let provider = "bank_qr", memo = orderCode, qrCode = "", checkoutUrl = "", paymentLinkId = "", providerOrderCode = null;
      let bankName = cfg.bankName, accountName = cfg.accountName, accountNumber = cfg.accountNumber, qrUrl = purchasePaymentQr(env, finalPrice, memo);
      if (payosReady(env)) {
        const po = await payosCreatePayment(env, { amount: finalPrice, description: `HV${String(leadId).slice(-6)}`, returnUrl: `${origin}/?payment=success`, cancelUrl: `${origin}/?payment=cancel`, buyerName: name, buyerEmail: email, buyerPhone: phone });
        provider = "payos";
        providerOrderCode = Number(po.orderCode);
        paymentLinkId = String(po.paymentLinkId || "");
        checkoutUrl = String(po.checkoutUrl || "");
        qrCode = String(po.qrCode || "");
        memo = String(po.description || orderCode);
        bankName = "MB Bank / payOS";
        accountName = String(po.accountName || "");
        accountNumber = String(po.accountNumber || "");
        qrUrl = "";
        await env.DB.prepare(`UPDATE purchase_payments SET provider='payos',provider_order_code=?,payment_link_id=?,checkout_url=?,qr_code=?,updated_at=CURRENT_TIMESTAMP WHERE order_code=?`).bind(providerOrderCode, paymentLinkId, checkoutUrl, qrCode, orderCode).run();
      }
      return json({
        ok: true,
        lead_id: leadId,
        order_code: orderCode,
        payment_token: token,
        status: "pending",
        invoice: { template_name: templateName, list_price: listPrice, domain_price: 0, hosting_price: 0, discount, total: finalPrice, renewal_price: renewalPrice },
        payment: { provider, provider_order_code: providerOrderCode, amount: finalPrice, memo, qr_code: qrCode, checkout_url: checkoutUrl, payment_link_id: paymentLinkId, qr_url: qrUrl, bank_name: bankName, account_name: accountName, account_number: accountNumber }
      });
    }
    if (route === "master/trials" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare(`WITH event_agg AS (
          SELECT trial_id,count(*) event_count FROM trial_events GROUP BY trial_id
        ), real_post_agg AS (
          SELECT site_id,count(*) real_post_count FROM posts WHERE coalesce(is_sample,0)=0 GROUP BY site_id
        )
        SELECT wt.*,s.name site_name,s.domain,s.preset,tc.demo_url,tc.category template_category,sl.customer_name,sl.phone,sl.email,coalesce(sl.zalo,'') zalo,coalesce(sl.company,'') company,sl.template_name,sl.status lead_status,coalesce(sl.care_status,'new') care_status,
          coalesce(ea.event_count,0) event_count,coalesce(rpa.real_post_count,0) real_post_count
        FROM website_trials wt JOIN sites s ON s.id=wt.site_id
        LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key
        LEFT JOIN sales_leads sl ON sl.id=wt.lead_id
        LEFT JOIN event_agg ea ON ea.trial_id=wt.id
        LEFT JOIN real_post_agg rpa ON rpa.site_id=wt.site_id
        ORDER BY wt.id DESC LIMIT 500`).all();
        for (const x of results || []) {
          if (x.status === "active" && Date.parse(String(x.expires_at).replace(" ", "T") + "Z") <= Date.now()) x.status = "expired";
        }
        const stats2 = await env.DB.prepare(`SELECT count(*) total,
        sum(CASE WHEN status='active' AND datetime(expires_at)>datetime('now') THEN 1 ELSE 0 END) active,
        sum(CASE WHEN status='expired' OR (status<>'pending_activation' AND datetime(expires_at)<=datetime('now')) THEN 1 ELSE 0 END) expired,
        sum(CASE WHEN conversion_request_at IS NOT NULL THEN 1 ELSE 0 END) interested,
        sum(CASE WHEN status='converted' THEN 1 ELSE 0 END) converted
        FROM website_trials`).first();
        return json({ ok: true, trials: results || [], stats: { total: Number(stats2?.total || 0), active: Number(stats2?.active || 0), expired: Number(stats2?.expired || 0), interested: Number(stats2?.interested || 0), converted: Number(stats2?.converted || 0) } }, 200, { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", "CDN-Cache-Control": "no-store" });
      } catch (e) {
        console.error("master/trials", e);
        return json({ error: "Kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c d\u1EEF li\u1EC7u kh\xE1ch d\xF9ng th\u1EED", detail: String(e?.message || e) }, 500, { "Cache-Control": "no-store" });
      }
    }
    if (route === "master/trial-access" && request.method === "POST") {
      const b = await body(request), id = Number(b.id);
      if (!id) return json({ error: "Thi\u1EBFu trial" }, 400);
      const tr = await env.DB.prepare(`SELECT wt.*,s.domain,tc.demo_url,tc.category template_category FROM website_trials wt JOIN sites s ON s.id=wt.site_id LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.id=? LIMIT 1`).bind(id).first();
      if (!tr) return json({ error: "Trial kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      if (tr.status === "pending_activation") return json({ error: "Kh\xE1ch ch\u01B0a ho\xE0n t\u1EA5t k\xEDch ho\u1EA1t Trial" }, 409);
      const publicOrigin = "https://hoangvuongtech.com";
      let base = String(tr.demo_url || "");
      if (!base) {
        const key = String(tr.template_key || "");
        base = key.startsWith("tin-tuc-") ? `/demo/tin-tuc/${key.replace("tin-tuc-", "mau-")}/` : `/demo/bat-dong-san/${key || "mau-1"}/`;
      }
      const website_url = publicOrigin + base + (base.includes("?") ? "&" : "?") + "nr_trial=" + encodeURIComponent(tr.trial_token);
      if (String(b.target || "website") !== "admin") return json({ ok: true, website_url });
      const magicRaw = tok(), magicHash = await sha256(magicRaw);
      await env.DB.prepare(`INSERT INTO handover_login_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+10 minutes'))`).bind(tr.site_id, magicHash).run();
      await trialEvent(env, tr, "master_open_admin", {});
      const admin_url = publicOrigin + `/admin?tenant=${encodeURIComponent(tr.domain)}&nr_trial=${encodeURIComponent(tr.trial_token)}&template=${encodeURIComponent(tr.template_key)}&handover=${encodeURIComponent(magicRaw)}`;
      return json({ ok: true, admin_url, website_url });
    }
    if (route === "master/trial-update" && request.method === "POST") {
      const b = await body(request), id = Number(b.id);
      if (!id) return json({ error: "Thi\u1EBFu trial" }, 400);
      const tr = await env.DB.prepare(`SELECT * FROM website_trials WHERE id=?`).bind(id).first();
      if (!tr) return json({ error: "Trial kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const action = String(b.action || "");
      if (action === "extend") {
        const hours = Math.max(1, Math.min(168, Number(b.hours || 24)));
        await env.DB.prepare(`UPDATE website_trials SET status='active',expires_at=datetime(CASE WHEN datetime(expires_at)>datetime('now') THEN expires_at ELSE datetime('now') END, '+'||?||' hours'),grace_expires_at=datetime(CASE WHEN datetime(expires_at)>datetime('now') THEN expires_at ELSE datetime('now') END, '+'||?||' hours','+7 days'),updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(hours, hours, id).run();
      } else if (action === "expire") await env.DB.prepare(`UPDATE website_trials SET status='expired',expires_at=datetime('now'),updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
      else if (action === "care") {
        const care = String(b.care_status || "new");
        await env.DB.prepare(`UPDATE sales_leads SET care_status=?,status=CASE WHEN ?='won' THEN 'won' WHEN ?='lost' THEN 'lost' WHEN ? IN ('contacted','interested') THEN 'contacted' ELSE status END,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(care, care, care, care, tr.lead_id).run();
      } else if (action === "note") {
        await env.DB.prepare(`UPDATE website_trials SET master_note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(String(b.note || ""), id).run();
      } else if (action === "converted") {
        await env.DB.batch([env.DB.prepare(`UPDATE website_trials SET status='converted',converted_site_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(Number(b.converted_site_id || 0) || null, id), env.DB.prepare(`UPDATE sales_leads SET status='won',care_status='won',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.lead_id)]);
      } else if (action === "delete") {
        const siteId = Number(tr.site_id || 0), leadId = Number(tr.lead_id || 0);
        try {
          await env.DB.prepare(`DELETE FROM trial_events WHERE trial_id=?`).bind(id).run();
        } catch (e) {
        }
        for (const [table, col] of [
          ["password_reset_tokens", "site_id"],
          ["handover_login_tokens", "site_id"],
          ["site_activation_tokens", "site_id"],
          ["financial_transactions", "site_id"],
          ["service_promotions", "site_id"],
          ["service_subscriptions", "site_id"],
          ["site_public_settings", "site_id"],
          ["customer_profiles", "site_id"],
          ["pageviews", "site_id"],
          ["sessions", "site_id"],
          ["posts", "site_id"],
          ["users", "site_id"]
        ]) {
          try {
            await env.DB.prepare(`DELETE FROM ${table} WHERE ${col}=?`).bind(siteId).run();
          } catch (e) {
          }
        }
        try {
          await env.DB.prepare(`DELETE FROM website_trials WHERE id=?`).bind(id).run();
        } catch (e) {
        }
        try {
          await env.DB.prepare(`DELETE FROM sales_leads WHERE id=? AND coalesce(lead_kind,'')='trial'`).bind(leadId).run();
        } catch (e) {
        }
        try {
          await env.DB.prepare(`DELETE FROM sites WHERE id=?`).bind(siteId).run();
        } catch (e) {
        }
        return json({ ok: true, deleted: true, id, site_id: siteId, lead_id: leadId });
      } else return json({ error: "Thao t\xE1c kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      const fresh = await env.DB.prepare(`SELECT * FROM website_trials WHERE id=?`).bind(id).first();
      await trialEvent(env, fresh, "master_" + action, b);
      return json({ ok: true, trial: fresh });
    }
    if (route === "master/create-site" && request.method === "POST") {
      const b = await body(request);
      const name = String(b.name || "").trim(), domain = cleanDomain(b.domain || ""), adminEmail = String(b.admin_email || "").trim().toLowerCase();
      if (!name || !domain || !adminEmail) return json({ error: "Thi\u1EBFu t\xEAn website, domain ho\u1EB7c email Admin kh\xE1ch" }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) return json({ error: "Email Admin kh\xE1ch kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      const requestedTemplateKey = String(b.template_key || "").trim();
      let templateRow = requestedTemplateKey ? await env.DB.prepare(`SELECT template_key,preset,name,accent,coalesce(sample_enabled,0) sample_enabled,coalesce(sample_count,12) sample_count FROM template_catalog WHERE template_key=? LIMIT 1`).bind(requestedTemplateKey).first() : null;
      const requestedPreset = String(b.theme_key || "").trim();
      if (!templateRow && requestedPreset) templateRow = await env.DB.prepare(`SELECT template_key,preset,name,accent,coalesce(sample_enabled,0) sample_enabled,coalesce(sample_count,12) sample_count FROM template_catalog WHERE preset=? AND is_active=1 ORDER BY sort_order LIMIT 1`).bind(requestedPreset).first();
      const themeKey = String(templateRow?.preset || requestedPreset || "newsreal").trim() || "newsreal";
      const customerPhone = String(b.customer_phone || "").trim();
      const publicPhone = String(b.public_phone || customerPhone).trim();
      const publicZalo = String(b.public_zalo || customerPhone).trim();
      const publicFacebook = String(b.public_facebook || "").trim();
      const publicEmail = String(b.public_email || adminEmail).trim().toLowerCase();
      if (publicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicEmail)) return json({ error: "Email li\xEAn h\u1EC7 c\xF4ng khai kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      const leadId = Number(b.lead_id || 0);
      let promoteTrial = null;
      if (leadId) {
        try {
          promoteTrial = await env.DB.prepare(`SELECT wt.id trial_id,wt.site_id,wt.trial_token,wt.template_key,wt.status,sl.source,sl.payment_status FROM website_trials wt JOIN sales_leads sl ON sl.id=wt.lead_id WHERE wt.lead_id=? AND sl.source='trial_conversion' LIMIT 1`).bind(leadId).first();
        } catch (e) {
        }
      }
      const promoteSiteId = Number(promoteTrial?.site_id || 0);
      if (await env.DB.prepare(`SELECT id FROM sites WHERE lower(domain)=? AND id<>?`).bind(domain, promoteSiteId || 0).first()) return json({ error: "Domain \u0111\xE3 t\u1ED3n t\u1EA1i trong h\u1EC7 th\u1ED1ng" }, 409);
      const accentMap = { green: "#138a4b", orange: "#e87817", purple: "#7653d6", red: "#d74646", blue: "#1463ff" };
      const accent = accentMap[String(templateRow?.accent || "blue")] || "#1463ff";
      const exactTemplateKey = String(templateRow?.template_key || requestedTemplateKey || promoteTrial?.template_key || "").trim();
      let siteId = promoteSiteId;
      if (siteId) {
        await env.DB.prepare(`UPDATE sites SET name=?,domain=?,preset=?,template_key=?,accent=?,phone=?,zalo=?,facebook=?,email=?,status='active' WHERE id=?`).bind(name, domain, themeKey, exactTemplateKey, accent, publicPhone, publicZalo, publicFacebook, publicEmail, siteId).run();
        await env.DB.prepare(`UPDATE users SET email=? WHERE site_id=? AND role='admin'`).bind(adminEmail, siteId).run();
      } else {
        const siteRun = await env.DB.prepare(`INSERT INTO sites(name,domain,preset,template_key,accent,phone,zalo,facebook,email,status) VALUES(?,?,?,?,?,?,?,?,?,'active')`).bind(name, domain, themeKey, exactTemplateKey, accent, publicPhone, publicZalo, publicFacebook, publicEmail).run();
        siteId = Number(siteRun.meta.last_row_id);
        const placeholder = await sha256(activationToken());
        await env.DB.prepare(`INSERT INTO users(site_id,email,password_hash,role) VALUES(?,?,?,'admin')`).bind(siteId, adminEmail, placeholder).run();
      }
      const orderCode = await nextOrderCode(env);
      await env.DB.prepare(`INSERT INTO customer_profiles(site_id,full_name,phone,email,company,order_code,internal_note,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET full_name=excluded.full_name,phone=excluded.phone,email=excluded.email,company=excluded.company,order_code=excluded.order_code,internal_note=excluded.internal_note,updated_at=CURRENT_TIMESTAMP`).bind(siteId, String(b.customer_name || "").trim(), String(b.customer_phone || "").trim(), adminEmail, String(b.company || "").trim(), orderCode, String(b.internal_note || "").trim()).run();
      await env.DB.prepare(`INSERT INTO site_public_settings(site_id,contact_email,updated_at) VALUES(?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET contact_email=excluded.contact_email,updated_at=CURRENT_TIMESTAMP`).bind(siteId, publicEmail).run();
      const termMonths = Math.max(1, Math.min(60, Number(b.term_months || 12)));
      const listPrice = Math.max(0, Number(b.list_price || 1999e3)), firstDiscount = Math.max(0, Number(b.first_discount || 0)), firstPrice = Math.max(0, Number(b.first_price ?? listPrice - firstDiscount)), renewalPrice = Math.max(0, Number(b.renewal_price || listPrice));
      const startedAt = isoDate(/* @__PURE__ */ new Date()), serviceExpires = addMonthsISO(startedAt, termMonths);
      try {
        await env.DB.prepare(`ALTER TABLE service_subscriptions ADD COLUMN paid_amount INTEGER NOT NULL DEFAULT 0`).run();
      } catch (e) {
      }
      const paymentStatus = String(b.payment_status || "unpaid");
      const salePrice = Number(b.sale_price || 0);
      const paidAmount = paymentStatus === "paid" ? salePrice : paymentStatus === "partial" ? Math.max(0, Math.min(salePrice, Number(b.paid_amount || 0))) : 0;
      await env.DB.prepare(`INSERT INTO service_subscriptions(site_id,plan_name,sale_price,internal_cost,payment_status,paid_amount,service_status,started_at,expires_at,domain_status,registrar,note,finance_excluded,updated_at)
      VALUES(?,?,?,?,?,?,'setup',?,?,?,'Cloudflare',?,0,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET plan_name=excluded.plan_name,sale_price=excluded.sale_price,internal_cost=excluded.internal_cost,payment_status=excluded.payment_status,paid_amount=excluded.paid_amount,service_status='setup',started_at=excluded.started_at,expires_at=excluded.expires_at,domain_status=excluded.domain_status,registrar='Cloudflare',note=excluded.note,finance_excluded=0,updated_at=CURRENT_TIMESTAMP`).bind(siteId, String(b.plan_name || "G\xF3i website tr\u1ECDn g\xF3i").trim(), salePrice, Number(b.internal_cost || 0), paymentStatus, paidAmount, startedAt, serviceExpires, String(b.domain_status || "not_configured"), String(b.service_note || "").trim()).run();
      await env.DB.prepare(`INSERT INTO service_promotions(site_id,term_months,bonus_months,promotion_name,list_price,first_discount,first_price,renewal_price) VALUES(?,?,0,?,?,?,?,?)
      ON CONFLICT(site_id) DO UPDATE SET term_months=excluded.term_months,bonus_months=0,promotion_name=excluded.promotion_name,list_price=excluded.list_price,first_discount=excluded.first_discount,first_price=excluded.first_price,renewal_price=excluded.renewal_price,updated_at=CURRENT_TIMESTAMP`).bind(siteId, termMonths, String(b.promotion_name || "\u01AFu \u0111\xE3i k\xEDch ho\u1EA1t l\u1EA7n \u0111\u1EA7u").trim(), listPrice, firstDiscount, firstPrice, renewalPrice).run();
      if (leadId) {
        await env.DB.prepare(`UPDATE sales_leads SET status='won',converted_site_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(siteId, leadId).run();
        try {
          await env.DB.prepare(`UPDATE website_trials SET status='converted',converted_site_id=?,updated_at=CURRENT_TIMESTAMP WHERE lead_id=?`).bind(siteId, leadId).run();
        } catch (e) {
        }
      }
      return json({ ok: true, site_id: siteId, order_code: orderCode, activation_ready: false, already_activated: !!promoteSiteId, trial_promoted: !!promoteSiteId, lead_id: leadId || null, sample_result: null });
    }
    if (route === "master/regenerate-activation" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const site2 = await env.DB.prepare(`SELECT s.id,s.domain,ss.domain_status FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id WHERE s.id=?`).bind(siteId).first();
      if (!site2) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const handover = await env.DB.prepare(`SELECT activated_at FROM customer_profiles WHERE site_id=?`).bind(siteId).first();
      if (handover?.activated_at) return json({ error: "Website \u0111\xE3 b\xE0n giao cho kh\xE1ch. Kh\xF4ng th\u1EC3 t\u1EA1o l\u1EA1i link k\xEDch ho\u1EA1t.", code: "ALREADY_HANDED_OVER" }, 409);
      if (site2.domain_status !== "active") return json({ error: "Ch\u01B0a th\u1EC3 t\u1EA1o link k\xEDch ho\u1EA1t: Domain + SSL ch\u01B0a ho\u1EA1t \u0111\u1ED9ng.", code: "DOMAIN_NOT_READY" }, 409);
      const pages = await getPagesDomainStatus(env, site2.domain);
      if (pages.status !== "active") {
        await env.DB.prepare(`UPDATE service_subscriptions SET domain_status='pending',service_status='setup',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId).run();
        return json({ error: "Ch\u01B0a th\u1EC3 t\u1EA1o link k\xEDch ho\u1EA1t: Cloudflare Pages/SSL ch\u01B0a Active.", code: "DOMAIN_NOT_READY", pages_status: pages.status, detail: pages.error || "" }, 409);
      }
      await env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(siteId).run();
      const raw = activationToken(), hash = await sha256(raw);
      await env.DB.prepare(`INSERT INTO site_activation_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+14 days'))`).bind(siteId, hash).run();
      return json({ ok: true, activation_token: raw, activation_path: `/activate/?token=${raw}` });
    }
    if (route === "master/send-activation-email" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const row = await env.DB.prepare(`SELECT s.id,s.name,s.domain,ss.domain_status,cp.full_name customer_name,coalesce(cp.email,u.email) customer_email,cp.activated_at
      FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN users u ON u.site_id=s.id AND u.role='admin' WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
      if (!row) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const email = String(row.customer_email || "").trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Email kh\xE1ch h\xE0ng ch\u01B0a h\u1EE3p l\u1EC7. H\xE3y c\u1EADp nh\u1EADt \u0111\xFAng email tr\u01B0\u1EDBc khi g\u1EEDi k\xEDch ho\u1EA1t." }, 409);
      if (row.activated_at) return json({ error: "Website \u0111\xE3 \u0111\u01B0\u1EE3c kh\xE1ch k\xEDch ho\u1EA1t" }, 409);
      if (row.domain_status !== "active") return json({ error: "Ch\u1EC9 g\u1EEDi link khi Domain + SSL \u0111\xE3 Active" }, 409);
      const pages = await getPagesDomainStatus(env, row.domain);
      if (pages.status !== "active") return json({ error: "Cloudflare Pages/SSL ch\u01B0a Active. Ch\u01B0a g\u1EEDi link k\xEDch ho\u1EA1t." }, 409);
      await env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(siteId).run();
      const raw = activationToken(), hash = await sha256(raw);
      await env.DB.prepare(`INSERT INTO site_activation_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+14 days'))`).bind(siteId, hash).run();
      const base = String(env.PUBLIC_APP_URL || "https://hoangvuongtech.com").replace(/\/$/, "");
      const activationUrl = `${base}/activate/?token=${encodeURIComponent(raw)}`;
      const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.6;color:#172033"><h2>Website c\u1EE7a b\u1EA1n \u0111\xE3 s\u1EB5n s\xE0ng</h2><p>Xin ch\xE0o <b>${htmlEsc(row.customer_name || "Qu\xFD kh\xE1ch")}</b>,</p><p>HoangVuongTech \u0111\xE3 ho\xE0n t\u1EA5t setup website <b>${htmlEsc(row.name)}</b>.</p><p>Domain: <b>${htmlEsc(row.domain)}</b><br>DNS: \u2713 C\xF3 b\u1EA3n ghi \xB7 Pages: active \xB7 X\xE1c th\u1EF1c: active \xB7 SSL: active</p><p><a href="${htmlEsc(activationUrl)}" style="display:inline-block;background:#1769ff;color:#fff;padding:13px 20px;border-radius:9px;text-decoration:none;font-weight:700">K\xEDch ho\u1EA1t website</a></p><p>Link c\xF3 hi\u1EC7u l\u1EF1c trong 14 ng\xE0y. T\u1EA1i b\u01B0\u1EDBc k\xEDch ho\u1EA1t, b\u1EA1n s\u1EBD x\xE1c nh\u1EADn email v\xE0 t\u1EF1 \u0111\u1EB7t m\u1EADt kh\u1EA9u Trang qu\u1EA3n tr\u1ECB.</p></div>`;
      const sent = await sendMail(env, { to: email, subject: `HoangVuongTech: Link k\xEDch ho\u1EA1t website ${row.name}`, html });
      if (!sent.ok) {
        await env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE token_hash=?`).bind(hash).run();
        return json({ error: sent.error || "Kh\xF4ng g\u1EEDi \u0111\u01B0\u1EE3c email k\xEDch ho\u1EA1t" }, 500);
      }
      return json({ ok: true, email, activation_url: activationUrl });
    }
    if (route === "master/reset-handover" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website c\u1EA7n reset b\xE0n giao" }, 400);
      const site2 = await env.DB.prepare(`SELECT s.id,s.domain,cp.activated_at,ss.domain_status
      FROM sites s LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id WHERE s.id=?`).bind(siteId).first();
      if (!site2) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      if (!site2.activated_at) return json({ error: "Website n\xE0y ch\u01B0a \u0111\u01B0\u1EE3c b\xE0n giao n\xEAn kh\xF4ng c\u1EA7n reset.", code: "NOT_HANDED_OVER" }, 409);
      await env.DB.batch([
        env.DB.prepare(`DELETE FROM sessions WHERE site_id=?`).bind(siteId),
        env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(siteId),
        env.DB.prepare(`UPDATE handover_login_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(siteId),
        env.DB.prepare(`UPDATE customer_profiles SET activated_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId),
        env.DB.prepare(`UPDATE service_subscriptions SET service_status=CASE WHEN domain_status='active' THEN 'ready' ELSE 'setup' END,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId)
      ]);
      return json({ ok: true, site_id: siteId, domain: site2.domain, domain_status: site2.domain_status || "not_configured", activation_ready: site2.domain_status === "active" });
    }
    if (route === "master/send-password-reset" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const row = await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.id user_id,u.email
      FROM sites s JOIN users u ON u.site_id=s.id AND u.role='admin'
      WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
      if (!row) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n Admin kh\xE1ch h\xE0ng" }, 404);
      const sent = await issuePasswordReset(env, {
        site: { id: row.id, name: row.name, domain: row.domain },
        user: { id: row.user_id, email: row.email },
        origin: `https://${row.domain}`
      });
      if (!sent.ok) return json({ error: sent.error || "Kh\xF4ng g\u1EEDi \u0111\u01B0\u1EE3c email \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u" }, 500);
      return json({ ok: true, email: sent.email });
    }
    if (route === "master/customer" && request.method === "GET") {
      const siteId = Number(u.searchParams.get("site_id"));
      await syncCompletedRenewalExpiry(env, siteId);
      const row = await env.DB.prepare(`SELECT s.id,s.name,s.domain,s.status,s.preset,s.template_key,s.accent,s.created_at,
      coalesce((SELECT tc.name FROM template_catalog tc WHERE tc.template_key=s.template_key LIMIT 1),
               (SELECT tc2.name FROM template_catalog tc2 WHERE tc2.preset=s.preset ORDER BY tc2.sort_order LIMIT 1),
               s.preset) template_name,
      u.email admin_email,cp.*,
      ss.plan_name,ss.sale_price,ss.internal_cost,ss.payment_status,coalesce(ss.paid_amount,0) paid_amount,coalesce(ss.finance_excluded,0) finance_excluded,ss.service_status,
      ss.started_at,ss.expires_at,ss.domain_status,ss.domain_registered_at,ss.domain_expires_at,
      ss.auto_renew,ss.registrar,ss.note service_note,ss.updated_at service_updated_at,
      coalesce(sp.term_months,12) term_months,coalesce(sp.promotion_name,'') promotion_name,coalesce(sp.list_price,1999000) list_price,coalesce(sp.first_discount,0) first_discount,coalesce(sp.first_price,ss.sale_price,1999000) first_price,coalesce(sp.renewal_price,1999000) renewal_price,
      coalesce(sp.renewal_status,'none') renewal_status,sp.renewal_notified_at,sp.renewal_decision_at,sp.renewal_requested_at,coalesce(sp.renewal_stage,'none') renewal_stage,sp.renewal_payment_sent_at,sp.renewal_paid_at,sp.renewal_completed_at,coalesce(sp.renewal_selected_months,sp.term_months,12) renewal_selected_months,coalesce(sp.renewal_order_code,'') renewal_order_code,
      (SELECT count(*) FROM renewal_history rh WHERE rh.site_id=s.id) renewal_history_count,
      (SELECT max(rh.new_expires_at) FROM renewal_history rh WHERE rh.site_id=s.id) renewal_history_expiry,
      (SELECT count(*) FROM posts p WHERE p.site_id=s.id AND (coalesce(p.is_sample,0)=1 OR p.listing_code LIKE 'DEMO-%' OR p.listing_code LIKE 'SAMPLE-%')) demo_posts
      FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin'
      LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
      LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
      if (!row) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y website" }, 404);
      return json({ customer: row });
    }
    if (route === "master/set-theme" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const templateKey = String(b.template_key || "").trim();
      const requestedPreset = String(b.theme_key || "").trim();
      let tpl = templateKey ? await env.DB.prepare(`SELECT template_key,name,preset,accent FROM template_catalog WHERE template_key=? LIMIT 1`).bind(templateKey).first() : null;
      if (!tpl && requestedPreset) tpl = await env.DB.prepare(`SELECT template_key,name,preset,accent FROM template_catalog WHERE preset=? ORDER BY is_active DESC,sort_order LIMIT 1`).bind(requestedPreset).first();
      if (!tpl) return json({ error: "M\u1EABu giao di\u1EC7n kh\xF4ng t\u1ED3n t\u1EA1i trong Template Manager" }, 400);
      const exists = await env.DB.prepare(`SELECT id FROM sites WHERE id=?`).bind(siteId).first();
      if (!exists) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const accentMap = { green: "#138a4b", orange: "#e87817", purple: "#7653d6", red: "#d74646", blue: "#1463ff" };
      const accent = accentMap[String(tpl.accent || "blue")] || "#1463ff";
      await env.DB.prepare(`UPDATE sites SET preset=?,template_key=?,accent=? WHERE id=?`).bind(tpl.preset, tpl.template_key, accent, siteId).run();
      return json({ ok: true, template_key: tpl.template_key, theme_key: tpl.preset, template_name: tpl.name });
    }
    if (route === "master/update-service" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const paymentStatus = String(b.payment_status || "unpaid");
      const salePrice = Math.max(0, Number(b.sale_price || 0));
      const paidAmount = paymentStatus === "paid" ? salePrice : paymentStatus === "partial" ? Math.max(0, Math.min(salePrice, Number(b.paid_amount || 0))) : 0;
      await env.DB.prepare(`INSERT INTO service_subscriptions(site_id,plan_name,sale_price,internal_cost,payment_status,paid_amount,service_status,started_at,expires_at,domain_status,domain_registered_at,domain_expires_at,auto_renew,registrar,note,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET plan_name=excluded.plan_name,sale_price=excluded.sale_price,internal_cost=excluded.internal_cost,
      payment_status=excluded.payment_status,paid_amount=excluded.paid_amount,service_status=excluded.service_status,started_at=excluded.started_at,expires_at=excluded.expires_at,
      domain_status=excluded.domain_status,domain_registered_at=excluded.domain_registered_at,domain_expires_at=excluded.domain_expires_at,
      auto_renew=excluded.auto_renew,registrar=excluded.registrar,note=excluded.note,updated_at=CURRENT_TIMESTAMP`).bind(
        siteId,
        String(b.plan_name || "G\xF3i website tr\u1ECDn g\xF3i"),
        salePrice,
        Number(b.internal_cost || 0),
        paymentStatus,
        paidAmount,
        String(b.service_status || "setup"),
        b.started_at || null,
        b.expires_at || null,
        String(b.domain_status || "not_configured"),
        b.domain_registered_at || null,
        b.domain_expires_at || null,
        0,
        String(b.registrar || "Cloudflare"),
        String(b.note || "")
      ).run();
      const termMonths = Math.max(1, Math.min(60, Number(b.term_months || 12))), listPrice = Math.max(0, Number(b.list_price || 1999e3)), firstDiscount = Math.max(0, Number(b.first_discount || 0)), firstPrice = Math.max(0, Number(b.first_price ?? listPrice - firstDiscount)), renewalPrice = Math.max(0, Number(b.renewal_price || listPrice));
      await env.DB.prepare(`INSERT INTO service_promotions(site_id,term_months,bonus_months,promotion_name,list_price,first_discount,first_price,renewal_price,updated_at) VALUES(?,?,0,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET term_months=excluded.term_months,bonus_months=0,promotion_name=excluded.promotion_name,list_price=excluded.list_price,first_discount=excluded.first_discount,first_price=excluded.first_price,renewal_price=excluded.renewal_price,updated_at=CURRENT_TIMESTAMP`).bind(siteId, termMonths, String(b.promotion_name || ""), listPrice, firstDiscount, firstPrice, renewalPrice).run();
      if (paymentStatus === "paid") await syncFinancialLedger(env);
      return json({ ok: true });
    }
    if (route === "master/domain-config" && request.method === "GET") {
      return json({ configured: cfRegistrarConfigured(env) });
    }
    if (route === "master/domain-search" && request.method === "GET") {
      const q = String(u.searchParams.get("q") || "").trim();
      if (!q) return json({ error: "Nh\u1EADp t\u1EEB kh\xF3a ho\u1EB7c t\xEAn mi\u1EC1n c\u1EA7n t\xECm" }, 400);
      if (!cfRegistrarConfigured(env)) return json({ configured: false, results: [] });
      const data = await cfRegistrar(env, `domain-search?q=${encodeURIComponent(q)}&limit=12`, { method: "GET" });
      return json({ configured: true, results: Array.isArray(data) ? data : data?.domains || data?.result || [] });
    }
    if (route === "master/domain-check" && request.method === "POST") {
      const b = await body(request), domain = normalizeDomain(b.domain || "");
      if (!domain) return json({ error: "Thi\u1EBFu t\xEAn mi\u1EC1n" }, 400);
      if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain))
        return json({ error: "T\xEAn mi\u1EC1n kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      const tld = domain.split(".").pop().toLowerCase();
      let base = "";
      try {
        const boot = await fetch("https://data.iana.org/rdap/dns.json", { headers: { "Accept": "application/json" } });
        if (boot.ok) {
          const data = await boot.json();
          for (const service of data.services || []) {
            const tlds = service?.[0] || [], urls = service?.[1] || [];
            if (tlds.map((x) => String(x).toLowerCase()).includes(tld) && urls.length) {
              base = String(urls[0]);
              break;
            }
          }
        }
      } catch {
      }
      if (!base) {
        const known = { com: "https://rdap.verisign.com/com/v1/", net: "https://rdap.verisign.com/net/v1/", org: "https://rdap.publicinterestregistry.org/rdap/" };
        base = known[tld] || "";
      }
      if (!base) return json({ error: `Ch\u01B0a h\u1ED7 tr\u1EE3 ki\u1EC3m tra \u0111u\xF4i .${tld}` }, 422);
      if (!base.endsWith("/")) base += "/";
      const r = await fetch(`${base}domain/${encodeURIComponent(domain)}`, {
        method: "GET",
        headers: { "Accept": "application/rdap+json, application/json", "User-Agent": "NEWSREAL-Domain-Check/1.0" }
      });
      if (r.status === 404) return json({ domain, registrable: true, reason: "available", source: "registry-rdap" });
      if (r.ok) return json({ domain, registrable: false, reason: "domain_unavailable", source: "registry-rdap" });
      if (r.status === 429) return json({ error: "H\u1EC7 th\u1ED1ng ki\u1EC3m tra t\xEAn mi\u1EC1n \u0111ang gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t. Vui l\xF2ng th\u1EED l\u1EA1i sau v\xE0i gi\xE2y." }, 503);
      return json({ error: `Kh\xF4ng ki\u1EC3m tra \u0111\u01B0\u1EE3c t\xEAn mi\u1EC1n l\xFAc n\xE0y (Registry RDAP ${r.status})` }, 502);
    }
    if (route === "master/domain-purchase" && request.method === "POST") {
      const b = await body(request);
      const siteId = Number(b.site_id), domain = normalizeDomain(b.domain || ""), confirmDomain = normalizeDomain(b.confirm_domain || "");
      if (!siteId || !domain) return json({ error: "Thi\u1EBFu website ho\u1EB7c t\xEAn mi\u1EC1n" }, 400);
      if (!cfRegistrarConfigured(env)) return json({ error: "Cloudflare Registrar API ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh" }, 503);
      if (!b.confirm_purchase || confirmDomain !== domain) return json({ error: "B\u1EA1n ph\u1EA3i x\xE1c nh\u1EADn ch\xEDnh x\xE1c t\xEAn mi\u1EC1n tr\u01B0\u1EDBc khi \u0111\u0103ng k\xFD" }, 400);
      const site2 = await env.DB.prepare(`SELECT id,name,domain FROM sites WHERE id=?`).bind(siteId).first();
      if (!site2) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const checked = await cfRegistrar(env, "domain-check", { method: "POST", body: JSON.stringify({ domains: [domain] }) });
      const rows = checked?.domains || [];
      const d = rows.find((v) => normalizeDomain(v.name || v.domain_name || "") === domain) || rows[0] || {};
      if (!d.registrable) return json({ error: `T\xEAn mi\u1EC1n kh\xF4ng c\xF2n kh\u1EA3 d\u1EE5ng: ${d.reason || "domain_unavailable"}`, domain, check: d }, 409);
      if (String(d.tier || "").toLowerCase() === "premium") return json({ error: "T\xEAn mi\u1EC1n premium ch\u01B0a \u0111\u01B0\u1EE3c Cloudflare Registrar API h\u1ED7 tr\u1EE3 \u0111\u0103ng k\xFD t\u1EF1 \u0111\u1ED9ng" }, 409);
      const pricing = d.pricing || {};
      const registrationCost = Number(pricing.registration_cost ?? pricing.registration ?? pricing.price ?? 0);
      const currency = String(pricing.currency || "USD");
      const expected = Number(b.expected_registration_cost || 0);
      if (expected > 0 && registrationCost > 0 && Math.abs(expected - registrationCost) > 1e-4) {
        return json({
          error: "Gi\xE1 t\xEAn mi\u1EC1n \u0111\xE3 thay \u0111\u1ED5i. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i tr\u01B0\u1EDBc khi mua.",
          price_changed: true,
          domain,
          registration_cost: registrationCost,
          currency,
          pricing
        }, 409);
      }
      const payload = { domain_name: domain, auto_renew: false };
      const reg = await cfRegistrar(env, "registrations", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const contextReg = reg?.context?.registration || reg?.registration || {};
      const state = reg?.state || contextReg?.status || "registration_pending";
      const completed = reg?.completed === true || state === "succeeded" || contextReg?.status === "active";
      const createdAt = contextReg?.created_at || reg?.created_at || (/* @__PURE__ */ new Date()).toISOString();
      const expiresAt = contextReg?.expires_at || reg?.expires_at || null;
      const domainStatus = completed ? "active" : "pending";
      await env.DB.batch([
        env.DB.prepare(`UPDATE sites SET domain=? WHERE id=?`).bind(domain, siteId),
        env.DB.prepare(`INSERT INTO service_subscriptions(site_id,domain_status,domain_registered_at,domain_expires_at,auto_renew,registrar,updated_at)
        VALUES(?,?,?,?,?,'Cloudflare',CURRENT_TIMESTAMP)
        ON CONFLICT(site_id) DO UPDATE SET domain_status=excluded.domain_status,domain_registered_at=excluded.domain_registered_at,
        domain_expires_at=excluded.domain_expires_at,auto_renew=excluded.auto_renew,registrar='Cloudflare',updated_at=CURRENT_TIMESTAMP`).bind(siteId, domainStatus, createdAt, expiresAt, b.auto_renew ? 1 : 0)
      ]);
      return json({
        ok: true,
        domain,
        state,
        completed,
        domain_status: domainStatus,
        registration_cost: registrationCost,
        currency,
        pricing,
        created_at: createdAt,
        expires_at: expiresAt,
        auto_renew: !!b.auto_renew,
        status_url: reg?.links?.self || "",
        resource_url: reg?.links?.resource || ""
      }, completed ? 201 : 202);
    }
    if (route === "master/domain-registration-status" && request.method === "GET") {
      const domain = normalizeDomain(u.searchParams.get("domain") || ""), siteId = Number(u.searchParams.get("site_id") || 0);
      if (!domain) return json({ error: "Thi\u1EBFu t\xEAn mi\u1EC1n" }, 400);
      if (!cfRegistrarConfigured(env)) return json({ error: "Cloudflare Registrar API ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh" }, 503);
      const status = await cfRegistrar(env, `registrations/${encodeURIComponent(domain)}/registration-status`, { method: "GET" });
      const contextReg = status?.context?.registration || status?.registration || {};
      const state = status?.state || contextReg?.status || "unknown";
      const completed = status?.completed === true || state === "succeeded" || contextReg?.status === "active";
      if (siteId) {
        await env.DB.prepare(`UPDATE service_subscriptions SET domain_status=?,domain_registered_at=coalesce(?,domain_registered_at),
        domain_expires_at=coalesce(?,domain_expires_at),updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(completed ? "active" : "pending", contextReg?.created_at || status?.created_at || null, contextReg?.expires_at || null, siteId).run();
      }
      return json({ ok: true, domain, state, completed, status });
    }
    if (route === "master/domain-complete" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id), domain = normalizeDomain(b.domain || "");
      if (!siteId || !domain) return json({ error: "Thi\u1EBFu website ho\u1EB7c t\xEAn mi\u1EC1n" }, 400);
      const site2 = await env.DB.prepare(`SELECT * FROM sites WHERE id=?`).bind(siteId).first();
      if (!site2) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const duplicate = await env.DB.prepare(`SELECT id,name FROM sites WHERE lower(domain)=lower(?) AND id<>?`).bind(domain, siteId).first();
      if (duplicate) return json({ error: `Domain ${domain} \u0111ang \u0111\u01B0\u1EE3c g\u1EAFn v\u1EDBi website kh\xE1c trong NEWSREAL` }, 409);
      const previousDomain = String(site2.domain || "");
      const info = await registryDomainInfo(domain);
      if (!info.ok || info.available) return json({ error: info.available ? "Registry ch\u01B0a th\u1EA5y domain \u0111\xE3 \u0111\u0103ng k\xFD. \u0110\u1EE3i v\xE0i ph\xFAt r\u1ED3i th\u1EED l\u1EA1i." : info.error || "Kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c domain" }, 409);
      const costs = { ".com": 28e4, ".net": 32e4, ".org": 3e5, ".info": 52e4, ".xyz": 35e4 };
      const cost = costs["." + domain.split(".").pop()] || 0;
      const registered = (info.registered_at || (/* @__PURE__ */ new Date()).toISOString()).slice(0, 10);
      const expires = info.expires_at ? String(info.expires_at).slice(0, 10) : null;
      const registrar = info.registrar || "Cloudflare";
      const pages = await attachPagesDomain(env, domain);
      const pageStatus = pages.status === "active" ? "active" : pages.status === "error" ? "error" : "pending";
      await env.DB.batch([
        env.DB.prepare(`UPDATE sites SET domain=? WHERE id=?`).bind(domain, siteId),
        env.DB.prepare(`INSERT INTO service_subscriptions(
        site_id,internal_cost,domain_status,domain_registered_at,domain_expires_at,auto_renew,registrar,
        service_status,started_at,expires_at,updated_at
      ) VALUES(?,?,?,?,?,1,?,'setup',date('now'),date('now','+1 year'),CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET
        internal_cost=CASE WHEN service_subscriptions.internal_cost>0 THEN service_subscriptions.internal_cost ELSE excluded.internal_cost END,
        domain_status=excluded.domain_status,
        domain_registered_at=excluded.domain_registered_at,
        domain_expires_at=excluded.domain_expires_at,
        auto_renew=0,
        registrar=excluded.registrar,
        service_status=CASE WHEN excluded.domain_status='active' THEN 'ready' ELSE 'setup' END,
        started_at=coalesce(service_subscriptions.started_at,date('now')),
        expires_at=coalesce(service_subscriptions.expires_at,date('now','+1 year')),
        updated_at=CURRENT_TIMESTAMP`).bind(siteId, cost, pageStatus, registered, expires, registrar)
      ]);
      const origin = new URL(request.url).origin;
      return json({
        ok: true,
        domain,
        registered_at: registered,
        expires_at: expires,
        registrar,
        internal_cost: cost,
        cost_source: "tld_estimate",
        pages_configured: pages.configured,
        pages_status: pageStatus,
        pages_error: pages.error || "",
        activation_url: null,
        activation_ready: pageStatus === "active",
        previous_domain: previousDomain,
        domain_changed: previousDomain.toLowerCase() !== domain.toLowerCase()
      });
    }
    if (route === "master/domain-provision-status" && request.method === "GET") {
      const siteId = Number(u.searchParams.get("site_id") || 0), domain = normalizeDomain(u.searchParams.get("domain") || "");
      if (!siteId || !domain) return json({ error: "Thi\u1EBFu website ho\u1EB7c domain" }, 400);
      let diag = await diagnoseDomain(env, domain);
      let dns_action = null;
      if (!diag.dns?.ok && ["initializing", "pending"].includes(String(diag.pages_status || "").toLowerCase())) {
        dns_action = await ensurePagesDns(env, domain);
        if (dns_action.ok) {
          diag.dns_action = dns_action;
        } else {
          diag.dns_action = dns_action;
        }
      }
      const active = diag.pages_status === "active";
      await env.DB.prepare(`UPDATE service_subscriptions SET domain_status=?,service_status=CASE WHEN ? THEN 'ready' ELSE service_status END,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(active ? "active" : diag.pages_status === "error" ? "error" : "pending", active ? 1 : 0, siteId).run();
      return json({ ok: true, active, ...diag, dns_action, error: diag.pages_error || "" });
    }
    if (route === "master/domain-mark-purchased" && request.method === "POST") {
      const b = await body(request);
      const siteId = Number(b.site_id), domain = normalizeDomain(b.domain || "");
      if (!siteId || !domain) return json({ error: "Thi\u1EBFu website ho\u1EB7c t\xEAn mi\u1EC1n" }, 400);
      const site2 = await env.DB.prepare(`SELECT id FROM sites WHERE id=?`).bind(siteId).first();
      if (!site2) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const registrar = String(b.registrar || "Cloudflare").trim() || "Cloudflare";
      const cost = Number(b.internal_cost || 0);
      const registeredAt = String(b.domain_registered_at || "").trim() || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const expiresAt = String(b.domain_expires_at || "").trim() || null;
      const autoRenew = 0;
      await env.DB.batch([
        env.DB.prepare(`UPDATE sites SET domain=? WHERE id=?`).bind(domain, siteId),
        env.DB.prepare(`INSERT INTO service_subscriptions(
        site_id,internal_cost,domain_status,domain_registered_at,domain_expires_at,auto_renew,registrar,updated_at
      ) VALUES(?,?,'active',?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET
        internal_cost=excluded.internal_cost,
        domain_status='active',
        domain_registered_at=excluded.domain_registered_at,
        domain_expires_at=excluded.domain_expires_at,
        auto_renew=excluded.auto_renew,
        registrar=excluded.registrar,
        updated_at=CURRENT_TIMESTAMP`).bind(siteId, cost, registeredAt, expiresAt, autoRenew, registrar)
      ]);
      return json({ ok: true, domain, domain_status: "active", registrar, internal_cost: cost, domain_registered_at: registeredAt, domain_expires_at: expiresAt, auto_renew: !!autoRenew });
    }
    if (route === "master/domain-save" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id), domain = normalizeDomain(b.domain || "");
      if (!siteId || !domain) return json({ error: "Thi\u1EBFu website ho\u1EB7c t\xEAn mi\u1EC1n" }, 400);
      if (!await env.DB.prepare(`SELECT id FROM sites WHERE id=?`).bind(siteId).first()) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      await env.DB.prepare(`UPDATE sites SET domain=? WHERE id=?`).bind(domain, siteId).run();
      await env.DB.prepare(`INSERT INTO service_subscriptions(site_id,domain_status,registrar,updated_at)
      VALUES(?,?,'Cloudflare',CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET domain_status=excluded.domain_status,registrar='Cloudflare',updated_at=CURRENT_TIMESTAMP`).bind(siteId, String(b.domain_status || "not_configured")).run();
      return json({ ok: true, domain });
    }
    if (route === "master/send-renewal-reminder" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const row = await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,ss.expires_at,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_price,1999000) renewal_price
      FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin' LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
      if (!row) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      if (!row.expires_at) return json({ error: "Ch\u01B0a c\xF3 ng\xE0y h\u1EBFt h\u1EA1n d\u1ECBch v\u1EE5" }, 400);
      const sent = await renewalEmailForSite(env, row, new URL(request.url).origin, "manual");
      if (!sent.ok) return json({ error: sent.error || "Kh\xF4ng g\u1EEDi \u0111\u01B0\u1EE3c email", configured: sent.configured ?? false }, sent.configured === false ? 503 : 502);
      return json({ ok: true, email: sent.email, days: sent.days });
    }
    if (route === "master/send-renewal-payment" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const row = await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,cp.order_code,ss.plan_name,ss.expires_at,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_price,1999000) renewal_price,coalesce(sp.renewal_status,'none') renewal_status,coalesce(sp.renewal_stage,'none') renewal_stage
      FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin' LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
      if (!row) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const sent = await renewalPaymentEmail(env, row);
      if (!sent.ok) return json({ error: sent.error || "Kh\xF4ng g\u1EEDi \u0111\u01B0\u1EE3c email", configured: sent.configured ?? false }, sent.configured === false ? 503 : 400);
      return json({ ok: true, email: sent.email, memo: sent.memo, amount: sent.amount });
    }
    if (route === "master/reset-renewal-test" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const row = await env.DB.prepare(`SELECT s.id,s.name,ss.expires_at,ss.domain_expires_at,
      coalesce(sp.renewal_status,'none') renewal_status,coalesce(sp.renewal_stage,'none') renewal_stage,
      sp.renewal_paid_at,sp.renewal_completed_at
      FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
      LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=?`).bind(siteId).first();
      if (!row) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      if (String(row.renewal_stage || "none") !== "renewed") return json({ error: "Ch\u1EC9 reset \u0111\u01B0\u1EE3c chu k\u1EF3 \u0111\xE3 ho\xE0n t\u1EA5t" }, 409);
      const hist = await env.DB.prepare(`SELECT id,old_expires_at,new_expires_at FROM renewal_history WHERE site_id=? ORDER BY id DESC LIMIT 1`).bind(siteId).first();
      if (!hist) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y l\u1ECBch s\u1EED gia h\u1EA1n \u0111\u1EC3 ho\xE0n t\xE1c an to\xE0n" }, 409);
      const current = String(row.expires_at || "").slice(0, 10), histNew = String(hist.new_expires_at || "").slice(0, 10), histOld = String(hist.old_expires_at || "").slice(0, 10);
      if (!histOld || !histNew || current !== histNew) return json({ error: "Ng\xE0y h\u1EBFt h\u1EA1n hi\u1EC7n t\u1EA1i kh\xF4ng kh\u1EDBp l\u1ECBch s\u1EED gia h\u1EA1n g\u1EA7n nh\u1EA5t. Kh\xF4ng t\u1EF1 \u0111\u1ED9ng reset \u0111\u1EC3 tr\xE1nh sai d\u1EEF li\u1EC7u." }, 409);
      await env.DB.batch([
        env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(histOld, siteId),
        env.DB.prepare(`UPDATE service_promotions SET renewal_status='yes',renewal_stage='paid',renewal_completed_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId),
        env.DB.prepare(`DELETE FROM renewal_history WHERE id=? AND site_id=?`).bind(hist.id, siteId),
        env.DB.prepare(`UPDATE financial_transactions SET status='void',note='Reset chu k\u1EF3 test',updated_at=CURRENT_TIMESTAMP WHERE unique_key=?`).bind(`renewal:${siteId}:${histOld}`)
      ]);
      return json({ ok: true, stage: "paid", old_current_expiry: current, restored_expiry: histOld, domain_expires_at: String(row.domain_expires_at || "").slice(0, 10) });
    }
    if (route === "master/check-renewal-domain" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const row = await env.DB.prepare(`SELECT s.id,s.domain,ss.expires_at,ss.domain_expires_at,
      coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_selected_months,sp.term_months,12) renewal_selected_months
      FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=?`).bind(siteId).first();
      if (!row) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      const domain = normalizeDomain(row.domain || "");
      if (!domain) return json({ error: "Website ch\u01B0a c\xF3 domain" }, 400);
      const info = await registryDomainInfo(domain);
      if (!info.ok || info.available) return json({ error: info.error || "Registry ch\u01B0a tr\u1EA3 v\u1EC1 th\xF4ng tin domain" }, 502);
      const registryExpiry = info.expires_at ? String(info.expires_at).slice(0, 10) : "";
      if (!registryExpiry) return json({ error: "Registry ch\u01B0a tr\u1EA3 v\u1EC1 ng\xE0y h\u1EBFt h\u1EA1n domain" }, 502);
      await env.DB.prepare(`UPDATE service_subscriptions SET domain_expires_at=?,domain_status='active',registrar=coalesce(?,registrar),updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(registryExpiry, info.registrar || null, siteId).run();
      const serviceExpiry = String(row.expires_at || "").slice(0, 10), minTerm = Math.max(1, Number(row.renewal_selected_months || row.term_months || 12));
      const requiredExpiry = serviceExpiry ? addMonthsISO(serviceExpiry, minTerm) : "";
      const renewalYears = serviceExpiry ? renewalYearsCovered(serviceExpiry, registryExpiry) : 0;
      const renewalMonths = renewalYears * 12;
      const ready = renewalMonths >= minTerm;
      return json({
        ok: true,
        domain,
        domain_expires_at: registryExpiry,
        previous_domain_expires_at: String(row.domain_expires_at || "").slice(0, 10),
        required_expiry: requiredExpiry,
        ready,
        renewal_years: renewalYears,
        renewal_months: renewalMonths,
        service_expiry_after_renewal: ready ? registryExpiry : "",
        registrar: info.registrar || "Cloudflare",
        cloudflare_url: "https://dash.cloudflare.com/?to=/:account/domains/registrations"
      });
    }
    if (route === "master/repair-renewal-cycle" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      const row = await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,cp.order_code,
      ss.expires_at,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_price,1999000) renewal_price,
      coalesce(sp.renewal_stage,'none') renewal_stage,sp.renewal_paid_at,sp.renewal_completed_at,
      (SELECT count(*) FROM renewal_history rh WHERE rh.site_id=s.id) renewal_history_count
      FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin'
      LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
      LEFT JOIN service_promotions sp ON sp.site_id=s.id
      WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
      if (!row) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      if (String(row.renewal_stage || "none") !== "renewed") return json({ error: "Ch\u1EC9 d\xF9ng s\u1EEDa chu k\u1EF3 cho d\u1EEF li\u1EC7u \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\xE1nh d\u1EA5u gia h\u1EA1n" }, 409);
      if (!row.expires_at) return json({ error: "Ch\u01B0a c\xF3 ng\xE0y h\u1EBFt h\u1EA1n d\u1ECBch v\u1EE5" }, 400);
      const oldExpiry = String(row.expires_at).slice(0, 10);
      const hist = await env.DB.prepare(`SELECT old_expires_at,new_expires_at,term_months,amount FROM renewal_history WHERE site_id=? ORDER BY id DESC LIMIT 1`).bind(siteId).first();
      if (hist?.new_expires_at) {
        const target = String(hist.new_expires_at).slice(0, 10);
        if (target <= oldExpiry) return json({ ok: true, repaired: false, old_expiry: oldExpiry, new_expiry: oldExpiry, message: "Th\u1EDDi h\u1EA1n d\u1ECBch v\u1EE5 \u0111\xE3 \u0111\u1ED3ng b\u1ED9" });
        await env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(target, siteId).run();
        return json({ ok: true, repaired: true, from_history: true, old_expiry: oldExpiry, new_expiry: target, term_months: Number(hist.term_months || row.term_months || 12) });
      }
      const term = Math.max(1, Number(row.term_months || 12));
      const newExpiry = addMonthsISO(oldExpiry, term);
      const amount = Math.max(0, Number(row.renewal_price || 0));
      await env.DB.batch([
        env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(newExpiry, siteId),
        env.DB.prepare(`INSERT INTO renewal_history(site_id,old_expires_at,new_expires_at,term_months,amount,order_code,paid_at,completed_at)
        VALUES(?,?,?,?,?,?,coalesce(?,CURRENT_TIMESTAMP),coalesce(?,CURRENT_TIMESTAMP))`).bind(siteId, oldExpiry, newExpiry, term, amount, String(row.order_code || ""), row.renewal_paid_at || null, row.renewal_completed_at || null)
      ]);
      const mail = await renewalCompletedEmail(env, row, newExpiry);
      return json({ ok: true, repaired: true, from_history: false, old_expiry: oldExpiry, new_expiry: newExpiry, term_months: term, email_sent: !!mail.ok, email_error: mail.ok ? "" : mail.error || "" });
    }
    if (route === "master/renewal-stage" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id), stage = String(b.stage || "");
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      if (!["requested", "payment_sent", "paid", "renewed"].includes(stage)) return json({ error: "Tr\u1EA1ng th\xE1i kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      if (stage === "renewed") {
        const done = await completeRenewal(env, siteId);
        if (!done.ok) return json({ error: done.error }, done.status || 400);
        return json(done);
      }
      const current = await env.DB.prepare(`SELECT coalesce(renewal_stage,'none') renewal_stage FROM service_promotions WHERE site_id=?`).bind(siteId).first();
      if (String(current?.renewal_stage || "none") === "renewed") return json({ error: "Chu k\u1EF3 gia h\u1EA1n \u0111\xE3 ho\xE0n t\u1EA5t" }, 409);
      const sets = [`renewal_stage=?`, `updated_at=CURRENT_TIMESTAMP`], bind = [stage];
      if (stage === "paid") sets.push(`renewal_paid_at=CURRENT_TIMESTAMP`);
      bind.push(siteId);
      await env.DB.prepare(`UPDATE service_promotions SET ${sets.join(",")} WHERE site_id=?`).bind(...bind).run();
      if (stage === "paid") {
        const r = await env.DB.prepare(`SELECT ss.expires_at,ss.internal_cost,coalesce(ss.finance_excluded,0) finance_excluded,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_price,1999000) renewal_price,coalesce(cp.order_code,'') order_code
        FROM service_subscriptions ss LEFT JOIN service_promotions sp ON sp.site_id=ss.site_id LEFT JOIN customer_profiles cp ON cp.site_id=ss.site_id WHERE ss.site_id=?`).bind(siteId).first();
        const start = String(r?.expires_at || "").slice(0, 10), end = start ? addMonthsISO(start, Math.max(1, Number(r?.term_months || 12))) : null;
        if (start && Number(r?.finance_excluded || 0) === 0) await env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note)
        VALUES(?,'renewal','paid',?,?,?,?,?,?,CURRENT_TIMESTAMP,?,'Ghi nh\u1EADn khi Master x\xE1c nh\u1EADn \u0111\xE3 thanh to\xE1n')
        ON CONFLICT(unique_key) DO UPDATE SET status='paid',amount=excluded.amount,cost=excluded.cost,order_code=excluded.order_code,cycle_end=excluded.cycle_end,paid_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP`).bind(siteId, Math.max(0, Number(r?.renewal_price || 0)), Math.max(0, Number(r?.internal_cost || 0)), String(r?.order_code || ""), "Gia h\u1EA1n d\u1ECBch v\u1EE5", start, end, `renewal:${siteId}:${start}`).run();
      }
      return json({ ok: true, stage });
    }
    if (route === "master/expenses") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare(`SELECT *,CASE category WHEN 'domain' THEN 'Domain' WHEN 'cloudflare' THEN 'Cloudflare / h\u1EA1 t\u1EA7ng' WHEN 'email' THEN 'Email / Resend' WHEN 'ads' THEN 'Qu\u1EA3ng c\xE1o' WHEN 'software' THEN 'Ph\u1EA7n m\u1EC1m / API' ELSE 'Chi ph\xED kh\xE1c' END category_label FROM operating_expenses ORDER BY expense_date DESC,id DESC LIMIT 500`).all();
        return json({ expenses: results || [] });
      }
      if (request.method === "POST") {
        const b = await body(request), title = String(b.title || "").trim(), amount = Math.max(0, Number(b.amount || 0)), category = String(b.category || "other"), recurring = ["monthly", "yearly"].includes(String(b.recurring)) ? String(b.recurring) : "none", expenseDate = String(b.expense_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).slice(0, 10), note = String(b.note || "").trim();
        if (!title || !amount) return json({ error: "Thi\u1EBFu m\xF4 t\u1EA3 ho\u1EB7c s\u1ED1 ti\u1EC1n chi ph\xED" }, 400);
        const r = await env.DB.prepare(`INSERT INTO operating_expenses(category,title,amount,recurring,expense_date,note) VALUES(?,?,?,?,?,?)`).bind(category, title, amount, recurring, expenseDate, note).run();
        return json({ ok: true, id: r.meta.last_row_id });
      }
      if (request.method === "DELETE") {
        const id = Number(u.searchParams.get("id") || 0);
        if (!id) return json({ error: "Thi\u1EBFu chi ph\xED" }, 400);
        await env.DB.prepare(`DELETE FROM operating_expenses WHERE id=?`).bind(id).run();
        return json({ ok: true });
      }
    }
    if (route === "master/finance") {
      await syncFinancialLedger(env);
      const siteId = Number(u.searchParams.get("site_id") || 0);
      const where = siteId ? " WHERE ft.site_id=? " : "";
      const q = `SELECT ft.*,s.name site_name,s.domain,cp.full_name customer_name,cp.email customer_email,cp.phone customer_phone FROM financial_transactions ft JOIN sites s ON s.id=ft.site_id LEFT JOIN customer_profiles cp ON cp.site_id=ft.site_id ${where} ORDER BY coalesce(ft.paid_at,ft.created_at) DESC,ft.id DESC LIMIT 300`;
      const tx = siteId ? (await env.DB.prepare(q).bind(siteId).all()).results : (await env.DB.prepare(q).all()).results;
      const all = await env.DB.prepare(`SELECT
      coalesce(sum(CASE WHEN status='paid' THEN amount ELSE 0 END),0) revenue_all,
      coalesce(sum(CASE WHEN status='paid' THEN cost ELSE 0 END),0) cost_all,
      coalesce(sum(CASE WHEN status='paid' AND kind='initial' THEN amount ELSE 0 END),0) initial_revenue,
      coalesce(sum(CASE WHEN status='paid' AND kind='renewal' THEN amount ELSE 0 END),0) renewal_revenue,
      coalesce(sum(CASE WHEN status='paid' AND strftime('%Y',coalesce(paid_at,created_at))=strftime('%Y','now') THEN amount ELSE 0 END),0) revenue_year,
      coalesce(sum(CASE WHEN status='paid' AND strftime('%Y-%m',coalesce(paid_at,created_at))=strftime('%Y-%m','now') THEN amount ELSE 0 END),0) revenue_month
      FROM financial_transactions`).first() || {};
      const pending = (await env.DB.prepare(`SELECT coalesce(sum(CASE WHEN coalesce(ss.finance_excluded,0)=1 THEN 0 WHEN coalesce(sp.renewal_status,'none')='yes' AND coalesce(sp.renewal_stage,'none') IN ('requested','payment_sent','payment_pending') THEN coalesce(sp.renewal_price,0) WHEN ss.payment_status!='paid' THEN coalesce(sp.first_price,ss.sale_price,0) ELSE 0 END),0) amount FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id`).first())?.amount || 0;
      const pipeline = await env.DB.prepare(`SELECT
      sum(CASE WHEN coalesce(sp.renewal_stage,'none')='requested' THEN 1 ELSE 0 END) requested,
      sum(CASE WHEN coalesce(sp.renewal_stage,'none') IN ('payment_sent','payment_pending') THEN 1 ELSE 0 END) payment_sent,
      sum(CASE WHEN coalesce(sp.renewal_stage,'none')='paid' THEN 1 ELSE 0 END) paid_wait_domain,
      sum(CASE WHEN ss.expires_at IS NOT NULL AND date(ss.expires_at)>=date('now') AND date(ss.expires_at)<=date('now','+30 day') THEN 1 ELSE 0 END) expiring_30
      FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id`).first() || {};
      const op = await env.DB.prepare(`SELECT
      coalesce(sum(amount),0) operating_cost_all,
      coalesce(sum(CASE WHEN strftime('%Y',expense_date)=strftime('%Y','now') THEN amount ELSE 0 END),0) operating_cost_year,
      coalesce(sum(CASE WHEN strftime('%Y-%m',expense_date)=strftime('%Y-%m','now') THEN amount ELSE 0 END),0) operating_cost_month
      FROM operating_expenses`).first() || {};
      const totalCosts = Number(all.cost_all || 0) + Number(op.operating_cost_all || 0);
      return json({ summary: { ...all, ...op, cost_all: totalCosts, transaction_cost_all: Number(all.cost_all || 0), profit_all: Number(all.revenue_all || 0) - totalCosts, pending: Number(pending || 0) }, pipeline, transactions: tx || [] });
    }
    if (route === "master/finance-cost" && request.method === "POST") {
      const b = await body(request), id = Number(b.id), cost = Math.max(0, Number(b.cost || 0));
      if (!id) return json({ error: "Thi\u1EBFu giao d\u1ECBch" }, 400);
      await env.DB.prepare(`UPDATE financial_transactions SET cost=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(cost, id).run();
      return json({ ok: true });
    }
    if (route === "payment-status" && request.method === "GET") {
      const orderCode = String(u.searchParams.get("order_code") || "").trim(), token = String(u.searchParams.get("token") || "").trim();
      if (!orderCode || !token) return json({ error: "Thi\u1EBFu th\xF4ng tin thanh to\xE1n" }, 400);
      const hash = await sha256(token);
      const row = await env.DB.prepare(`SELECT pp.status,pp.amount,pp.paid_amount,pp.paid_at,pp.order_code
    FROM purchase_payments pp WHERE pp.order_code=? AND pp.token_hash=? LIMIT 1`).bind(orderCode, hash).first();
      if (!row) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y giao d\u1ECBch" }, 404);
      return json({ ok: true, status: row.status, amount: Number(row.amount || 0), paid_amount: Number(row.paid_amount || 0), paid_at: row.paid_at || null, order_code: row.order_code });
    }
    if (route === "payos-webhook" && request.method === "POST") {
      if (!payosReady(env)) return json({ error: "payOS ch\u01B0a c\u1EA5u h\xECnh" }, 503);
      const b = await body(request);
      if (!await payosVerifyWebhook(env, b)) return json({ error: "Invalid payOS signature" }, 400);
      const d = b.data || {};
      if (b.success !== true || String(d.code || "00") !== "00") return json({ ok: true, ignored: "not_success" });
      const providerOrderCode = Number(d.orderCode || 0), amount = Math.max(0, Number(d.amount || 0));
      if (!providerOrderCode) return json({ ok: true, ignored: "missing_order_code" });
      const ref = String(d.reference || d.paymentLinkId || "").slice(0, 250), transferContent = String(d.description || "").slice(0, 1e3);
      const rp = await env.DB.prepare(`SELECT rp.*,s.name,s.domain,cp.full_name customer_name,cp.email customer_email FROM renewal_payments rp JOIN sites s ON s.id=rp.site_id LEFT JOIN customer_profiles cp ON cp.site_id=s.id WHERE rp.provider='payos' AND rp.provider_order_code=? LIMIT 1`).bind(providerOrderCode).first();
      if (rp) {
        if (rp.status === "paid") return json({ ok: true, duplicate: true, type: "renewal" });
        if (amount < Number(rp.amount || 0)) return json({ ok: true, ignored: "amount_too_low", type: "renewal" });
        await env.DB.batch([env.DB.prepare(`UPDATE renewal_payments SET status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,transfer_ref=?,transfer_content=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='paid'`).bind(amount, ref, transferContent, rp.id), env.DB.prepare(`UPDATE service_promotions SET renewal_status='yes',renewal_stage='paid',renewal_paid_at=CURRENT_TIMESTAMP,renewal_selected_months=?,renewal_order_code=?,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(Number(rp.years || 1) * 12, rp.order_code, rp.site_id), env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note) VALUES(?,'renewal','paid',?,0,?,'Gia h\u1EA1n d\u1ECBch v\u1EE5 \u0111\xE3 thanh to\xE1n',NULL,NULL,CURRENT_TIMESTAMP,?,'payOS webhook') ON CONFLICT(unique_key) DO UPDATE SET status='paid',amount=excluded.amount,order_code=excluded.order_code,paid_at=CURRENT_TIMESTAMP,note='payOS webhook'`).bind(rp.site_id, Number(rp.amount || 0), rp.order_code, `renewal-payment:${rp.id}`)]);
        try {
          await notifyMasterRenewalPaid(env, rp, { ...rp, amount: Number(rp.amount || 0) });
        } catch (e) {
          console.log("renewal payOS mail:", e?.message || e);
        }
        return json({ ok: true, status: "paid", type: "renewal" });
      }
      const pp = await env.DB.prepare(`SELECT pp.*,sl.customer_name,sl.email,sl.phone,sl.site_name,sl.template_name FROM purchase_payments pp JOIN sales_leads sl ON sl.id=pp.lead_id WHERE pp.provider='payos' AND pp.provider_order_code=? LIMIT 1`).bind(providerOrderCode).first();
      if (pp) {
        if (pp.status === "paid") return json({ ok: true, duplicate: true, type: "initial" });
        if (amount < Number(pp.amount || 0)) return json({ ok: true, ignored: "amount_too_low", type: "initial" });
        await env.DB.batch([env.DB.prepare(`UPDATE purchase_payments SET status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,transfer_ref=?,transfer_content=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='paid'`).bind(amount, ref, transferContent, pp.id), env.DB.prepare(`UPDATE sales_leads SET status='paid',payment_status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(amount, pp.lead_id)]);
        try {
          await notifyInitialPayment(env, { lead: pp, orderCode: pp.order_code, amount: Number(pp.amount || 0) });
        } catch (e) {
          console.log("payOS payment notification:", e?.message || e);
        }
        return json({ ok: true, status: "paid", type: "initial" });
      }
      return json({ ok: true, ignored: "unknown_signed_order" });
    }
    if ((route === "payment-webhook" || route === "vietqr-callback") && request.method === "POST") {
      const secret = String(env.VIETQR_WEBHOOK_TOKEN || env.PAYMENT_WEBHOOK_SECRET || "").trim();
      if (!secret) return json({ error: "VIETQR_WEBHOOK_TOKEN ch\u01B0a c\u1EA5u h\xECnh" }, 503);
      if (!paymentWebhookAuthorized(env, request)) return json({ error: "Webhook kh\xF4ng h\u1EE3p l\u1EC7" }, 401);
      const b = await body(request);
      const amount = Math.max(0, Number(b.amount ?? b.transferAmount ?? b.transfer_amount ?? 0));
      const transType = String(b.transType ?? b.transferType ?? b.direction ?? b.type ?? "C").toUpperCase();
      if (["D", "OUT", "DEBIT", "WITHDRAW"].includes(transType)) return json({ ok: true, ignored: "outgoing" });
      const content = [b.content, b.description, b.transferContent, b.transfer_content, b.orderId, b.order_code].filter(Boolean).join(" ");
      const explicit = String(b.orderId || b.order_code || "").trim().toUpperCase();
      const purchaseMatch = content.match(/\bHV\d{8}-\d{5}-[A-Z0-9]{5}\b/i);
      const renewalMatch = content.match(/\bGH\d{8}-\d{5}-[A-Z0-9]{5}\b/i);
      const orderCode = explicit || (renewalMatch ? renewalMatch[0].toUpperCase() : purchaseMatch ? purchaseMatch[0].toUpperCase() : "");
      if (!orderCode) return json({ ok: true, ignored: "order_not_found" });
      const ref = String(b.transactionid ?? b.referenceCode ?? b.referencenumber ?? b.reference ?? b.id ?? "").slice(0, 250);
      const transferContent = String(b.content ?? b.description ?? b.transferContent ?? "").slice(0, 1e3);
      if (orderCode.startsWith("GH")) {
        const rp = await env.DB.prepare(`SELECT rp.*,s.name,s.domain,cp.full_name customer_name,cp.email customer_email
      FROM renewal_payments rp JOIN sites s ON s.id=rp.site_id LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      WHERE rp.order_code=? LIMIT 1`).bind(orderCode).first();
        if (!rp) return json({ ok: true, ignored: "unknown_renewal_order" });
        if (rp.status === "paid") return json({ ok: true, duplicate: true, order_code: orderCode, type: "renewal" });
        if (amount < Number(rp.amount || 0)) return json({ ok: true, ignored: "amount_too_low", expected: Number(rp.amount || 0), received: amount, type: "renewal" });
        await env.DB.batch([
          env.DB.prepare(`UPDATE renewal_payments SET status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,transfer_ref=?,transfer_content=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='paid'`).bind(amount, ref, transferContent, rp.id),
          env.DB.prepare(`UPDATE service_promotions SET renewal_status='yes',renewal_stage='paid',renewal_paid_at=CURRENT_TIMESTAMP,renewal_selected_months=?,renewal_order_code=?,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(Number(rp.years || 1) * 12, orderCode, rp.site_id),
          env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note)
        VALUES(?,'renewal','paid',?,0,?,'Gia h\u1EA1n d\u1ECBch v\u1EE5 \u0111\xE3 thanh to\xE1n',NULL,NULL,CURRENT_TIMESTAMP,?,'VietQR callback')
        ON CONFLICT(unique_key) DO UPDATE SET status='paid',amount=excluded.amount,order_code=excluded.order_code,paid_at=CURRENT_TIMESTAMP,note='VietQR callback'`).bind(rp.site_id, Number(rp.amount || 0), orderCode, `renewal-payment:${rp.id}`)
        ]);
        try {
          await notifyMasterRenewalPaid(env, rp, { ...rp, order_code: orderCode, amount: Number(rp.amount || 0) });
        } catch (e) {
          console.log("renewal paid mail:", e?.message || e);
        }
        return json({ ok: true, order_code: orderCode, status: "paid", type: "renewal", site_id: rp.site_id });
      }
      const pp = await env.DB.prepare(`SELECT pp.*,sl.customer_name,sl.email,sl.phone,sl.site_name,sl.template_name FROM purchase_payments pp JOIN sales_leads sl ON sl.id=pp.lead_id WHERE pp.order_code=? LIMIT 1`).bind(orderCode).first();
      if (!pp) return json({ ok: true, ignored: "unknown_order" });
      if (pp.status === "paid") return json({ ok: true, duplicate: true, order_code: orderCode, type: "initial" });
      if (amount < Number(pp.amount || 0)) return json({ ok: true, ignored: "amount_too_low", expected: Number(pp.amount || 0), received: amount, type: "initial" });
      await env.DB.batch([
        env.DB.prepare(`UPDATE purchase_payments SET status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,transfer_ref=?,transfer_content=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='paid'`).bind(amount, ref, transferContent, pp.id),
        env.DB.prepare(`UPDATE sales_leads SET status='paid',payment_status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(amount, pp.lead_id)
      ]);
      try {
        await notifyInitialPayment(env, { lead: pp, orderCode, amount: Number(pp.amount || 0) });
      } catch (e) {
        console.log("payment notification:", e?.message || e);
      }
      return json({ ok: true, order_code: orderCode, status: "paid", type: "initial" });
    }
    if (route === "master/leads" && request.method === "GET") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const { results } = await env.DB.prepare(`SELECT * FROM sales_leads
    WHERE coalesce(lead_kind,'inquiry')!='trial' OR source='trial_conversion'
    ORDER BY
    CASE status WHEN 'paid' THEN 0 WHEN 'payment_pending' THEN 1 WHEN 'new' THEN 2 WHEN 'contacted' THEN 3 WHEN 'qualified' THEN 4 WHEN 'won' THEN 5 ELSE 6 END,
    datetime(created_at) DESC,id DESC`).all();
      return json({ ok: true, leads: results || [] }, 200, { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", "CDN-Cache-Control": "no-store" });
    }
    if (route === "master/lead-update" && request.method === "POST") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const b = await body(request), id = Number(b.id);
      const allowed = ["payment_pending", "paid", "new", "contacted", "qualified", "won", "lost"];
      const status = allowed.includes(String(b.status || "")) ? String(b.status) : null;
      const masterNote = String(b.master_note ?? "").trim().slice(0, 3e3);
      const careNote = String(b.care_note ?? "").trim().slice(0, 3e3);
      const tags = String(b.tags ?? "").trim().slice(0, 500);
      const followUp = String(b.follow_up_at || "").trim() || null;
      const marketing = b.marketing_opt_in === true || Number(b.marketing_opt_in) === 1 ? 1 : 0;
      if (!id) return json({ error: "Thi\u1EBFu m\xE3 lead" }, 400);
      const row = await env.DB.prepare(`SELECT id FROM sales_leads WHERE id=?`).bind(id).first();
      if (!row) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y lead" }, 404);
      await env.DB.prepare(`UPDATE sales_leads SET
    status=coalesce(?,status),master_note=?,care_note=?,tags=?,follow_up_at=?,marketing_opt_in=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?`).bind(status, masterNote, careNote, tags, followUp, marketing, id).run();
      return json({ ok: true });
    }
    if (route === "master/lead-delete" && request.method === "POST") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const b = await body(request), id = Number(b.id);
      if (!id) return json({ error: "Thi\u1EBFu m\xE3 y\xEAu c\u1EA7u" }, 400);
      const row = await env.DB.prepare(`SELECT id,coalesce(lead_kind,'inquiry') lead_kind,coalesce(converted_site_id,0) converted_site_id FROM sales_leads WHERE id=?`).bind(id).first();
      if (!row) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y y\xEAu c\u1EA7u" }, 404);
      if (row.lead_kind === "trial") return json({ error: "Lead d\xF9ng th\u1EED ph\u1EA3i x\xF3a trong Trial Website" }, 409);
      await env.DB.prepare(`DELETE FROM sales_leads WHERE id=?`).bind(id).run();
      return json({ ok: true, id, kept_site_id: Number(row.converted_site_id || 0) || null });
    }
    if (route === "master/favicon-upload" && request.method === "POST") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      if (!env.IMAGES) return json({ error: "Ch\u01B0a c\u1EA5u h\xECnh R2 binding IMAGES" }, 500);
      const form = await request.formData(), siteId = Number(form.get("site_id")), file = form.get("file");
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      if (!file || typeof file === "string") return json({ error: "Ch\u01B0a ch\u1ECDn \u1EA3nh" }, 400);
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) return json({ error: "Favicon ch\u1EC9 h\u1ED7 tr\u1EE3 JPG, PNG, WEBP" }, 400);
      if (file.size > 2 * 1024 * 1024) return json({ error: "Favicon t\u1ED1i \u0111a 2 MB" }, 400);
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg", key = `sites/${siteId}/branding/favicon-${crypto.randomUUID()}.${ext}`;
      await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
      const url = `/api/image?key=${encodeURIComponent(key)}`;
      await env.DB.prepare(`UPDATE sites SET favicon_url=? WHERE id=?`).bind(url, siteId).run();
      return json({ ok: true, url });
    }
    if (route === "master/favicon-clear" && request.method === "POST") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website" }, 400);
      await env.DB.prepare(`UPDATE sites SET favicon_url='' WHERE id=?`).bind(siteId).run();
      return json({ ok: true });
    }
    if (route === "master/service-documents" && request.method === "GET") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const siteId = Number(u.searchParams.get("site_id"));
      const { results } = await env.DB.prepare(`SELECT id,site_id,document_type,document_code,document_version,customer_email,sent_customer_at,sent_master_at,created_at FROM service_documents WHERE site_id=? ORDER BY id DESC`).bind(siteId).all();
      return json({ ok: true, documents: results || [] });
    }
    if (route === "master/service-document" && request.method === "GET") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const id = Number(u.searchParams.get("id"));
      const row = await env.DB.prepare(`SELECT * FROM service_documents WHERE id=?`).bind(id).first();
      if (!row) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y bi\xEAn b\u1EA3n" }, 404);
      return json({ ok: true, document: row, html: row.content_html });
    }
    if (route === "master/renewal-watch" && request.method === "GET") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const { results } = await env.DB.prepare(`SELECT s.id,s.name,s.domain,cp.full_name customer_name,cp.phone customer_phone,
    coalesce(sp.renewal_stage,'none') renewal_stage,coalesce(sp.renewal_status,'none') renewal_status,
    sp.renewal_requested_at,sp.renewal_paid_at,coalesce(sp.renewal_price,1999000) renewal_price,
    coalesce(sp.renewal_selected_months,sp.term_months,12) renewal_selected_months,coalesce(sp.renewal_order_code,'') renewal_order_code
    FROM sites s
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id
    WHERE sp.renewal_status='yes' AND coalesce(sp.renewal_stage,'none')!='renewed'
    ORDER BY CASE coalesce(sp.renewal_stage,'none') WHEN 'paid' THEN 0 WHEN 'payment_pending' THEN 1 ELSE 2 END,
      datetime(sp.renewal_requested_at) DESC,s.id DESC`).all();
      return json({ ok: true, renewals: results || [] }, 200, { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" });
    }
    if (route === "master/template-catalog" && request.method === "GET") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const { results } = await env.DB.prepare(`SELECT template_key,name,category,preset,price,renewal_price,is_active,sort_order,
    image_url,demo_url,badge,description,features,accent,editor_profile,
    coalesce(sample_enabled,0) sample_enabled,coalesce(sample_count,12) sample_count,layout_profile,structure_profile,updated_at
    FROM template_catalog ORDER BY category,sort_order,template_key`).all();
      return json({ ok: true, templates: results || [] });
    }
    if (route === "master/template-price" && request.method === "POST") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const b = await body(request);
      const key = String(b.template_key || "").trim();
      const price = Math.max(0, Math.round(Number(b.price) || 0));
      const renewal = Math.max(0, Math.round(Number(b.renewal_price) || 0));
      if (!key) return json({ error: "Thi\u1EBFu m\xE3 template" }, 400);
      const row = await env.DB.prepare(`SELECT template_key FROM template_catalog WHERE template_key=?`).bind(key).first();
      if (!row) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y template" }, 404);
      await env.DB.prepare(`UPDATE template_catalog SET price=?,renewal_price=?,updated_at=CURRENT_TIMESTAMP WHERE template_key=?`).bind(price, renewal, key).run();
      return json({ ok: true, template_key: key, price, renewal_price: renewal });
    }
    if (route === "master/template-save" && request.method === "POST") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const b = await body(request);
      const key = String(b.template_key || "").trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const name = String(b.name || "").trim();
      const category = String(b.category || "bat-dong-san").trim();
      const preset = String(b.preset || "").trim();
      const price = Math.max(0, Math.round(Number(b.price) || 0));
      const renewal = Math.max(0, Math.round(Number(b.renewal_price) || 0));
      const sort = Math.max(0, Math.round(Number(b.sort_order) || 0));
      const image = String(b.image_url || "").trim();
      const demo = String(b.demo_url || "").trim();
      const badge = String(b.badge || "").trim().slice(0, 60);
      const description = String(b.description || "").trim().slice(0, 1e3);
      const features = String(b.features || "").trim().slice(0, 2e3);
      const seoTitle = String(b.seo_title || "").trim().slice(0, 90), seoSlug = String(b.seo_slug || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 90), primaryKeyword = String(b.primary_keyword || "").trim().slice(0, 120), secondaryKeywords = String(b.secondary_keywords || "").trim().slice(0, 500), metaDescription = String(b.meta_description || "").trim().slice(0, 180), internalAnchor = String(b.internal_anchor || "").trim().slice(0, 120);
      const accent = ["blue", "green", "orange", "purple", "red"].includes(String(b.accent || "")) ? String(b.accent) : "blue";
      const active = b.is_active === false || Number(b.is_active) === 0 ? 0 : 1;
      const sampleEnabled = b.sample_enabled === true || Number(b.sample_enabled) === 1 ? 1 : 0;
      const sampleCount = Math.max(1, Math.min(30, Math.round(Number(b.sample_count) || 12)));
      let layoutProfile = {};
      try {
        layoutProfile = typeof b.layout_profile === "object" && b.layout_profile ? b.layout_profile : JSON.parse(String(b.layout_profile || "{}"));
      } catch (e) {
        return json({ error: "C\u1EA5u h\xECnh b\u1ED1 c\u1EE5c kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      }
      const cl = /* @__PURE__ */ __name((v, min, max, def) => Math.max(min, Math.min(max, Math.round(Number(v) || def))), "cl");
      layoutProfile = { category_columns: cl(layoutProfile.category_columns, 1, 6, 4), category_rows: cl(layoutProfile.category_rows, 1, 4, 2), sidebar_enabled: layoutProfile.sidebar_enabled === false || Number(layoutProfile.sidebar_enabled) === 0 ? 0 : 1, sidebar_read_most: cl(layoutProfile.sidebar_read_most, 0, 12, 6), sidebar_latest: cl(layoutProfile.sidebar_latest, 0, 12, 5), sidebar_categories: cl(layoutProfile.sidebar_categories, 0, 12, 8), home_latest_count: cl(layoutProfile.home_latest_count, 4, 24, 10), related_count: cl(layoutProfile.related_count, 2, 12, 6) };
      const layoutProfileJson = JSON.stringify(layoutProfile);
      let structureProfile = normalizeStructureProfile(b.structure_profile, key, category === "tin-tuc" ? "news" : category === "bat-dong-san" ? "property" : category === "dich-vu" ? "service" : category === "game" ? "game" : "generic");
      const existingTemplate = await env.DB.prepare(`SELECT structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(key).first();
      let existingStructure = null;
      if (existingTemplate?.structure_profile) {
        try {
          existingStructure = JSON.parse(existingTemplate.structure_profile);
        } catch (e) {
          existingStructure = null;
        }
      }
      const legacyGeometryLocked = Number(existingStructure?.geometry_locked || 0) === 1;
      if (legacyGeometryLocked) structureProfile = existingStructure;
      const structureProfileJson = JSON.stringify(structureProfile);
      const structureValidation = validateStructureProfile(structureProfile, { active });
      if (active && !structureValidation.ok && !legacyGeometryLocked) return json({ error: "Khung giao di\u1EC7n ch\u01B0a \u0111\u1EA1t chu\u1EA9n \u0111\u1EC3 \u0111\u01B0a v\xE0o Kho template.", details: structureValidation.errors, warnings: structureValidation.warnings }, 400);
      let editorProfile = {};
      try {
        editorProfile = typeof b.editor_profile === "object" && b.editor_profile ? b.editor_profile : JSON.parse(String(b.editor_profile || "{}"));
      } catch (e) {
        return json({ error: "C\u1EA5u h\xECnh form \u0111\u0103ng b\xE0i kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      }
      const allowedContentTypes = ["property", "news", "product", "app", "service", "game", "generic"];
      editorProfile.content_type = allowedContentTypes.includes(String(editorProfile.content_type || "")) ? String(editorProfile.content_type) : category === "tin-tuc" ? "news" : category === "bat-dong-san" ? "property" : category === "dich-vu" ? "service" : category === "game" ? "game" : "generic";
      editorProfile.id = String(editorProfile.id || editorProfile.content_type).slice(0, 50);
      if (editorProfile.content_type === "property") {
        editorProfile.categoriesByTransaction = editorProfile.categoriesByTransaction || {};
        for (const k of ["buy", "sale", "rent"]) editorProfile.categoriesByTransaction[k] = Array.isArray(editorProfile.categoriesByTransaction[k]) ? editorProfile.categoriesByTransaction[k].map((x) => String(x).trim()).filter(Boolean).slice(0, 60) : [];
        delete editorProfile.categories;
      } else {
        editorProfile.categories = Array.isArray(editorProfile.categories) ? editorProfile.categories.map((x) => String(x).trim()).filter(Boolean).slice(0, 80) : [];
      }
      editorProfile = templateCategoryContract(structureProfile, editorProfile, editorProfile.content_type);
      editorProfile.custom_fields = Array.isArray(editorProfile.custom_fields) ? editorProfile.custom_fields.slice(0, 60) : [];
      const editorProfileJson = JSON.stringify(editorProfile);
      if (!key || !name) return json({ error: "M\xE3 template v\xE0 t\xEAn template l\xE0 b\u1EAFt bu\u1ED9c" }, 400);
      await env.DB.prepare(`INSERT INTO template_catalog
    (template_key,name,category,preset,price,renewal_price,is_active,sort_order,image_url,demo_url,badge,description,features,accent,seo_title,seo_slug,primary_keyword,secondary_keywords,meta_description,internal_anchor,editor_profile,sample_enabled,sample_count,layout_profile,structure_profile,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(template_key) DO UPDATE SET
      name=excluded.name,category=excluded.category,preset=excluded.preset,price=excluded.price,
      renewal_price=excluded.renewal_price,is_active=excluded.is_active,sort_order=excluded.sort_order,
      image_url=excluded.image_url,demo_url=excluded.demo_url,badge=excluded.badge,
      description=excluded.description,features=excluded.features,accent=excluded.accent,
      seo_title=excluded.seo_title,seo_slug=excluded.seo_slug,primary_keyword=excluded.primary_keyword,secondary_keywords=excluded.secondary_keywords,meta_description=excluded.meta_description,internal_anchor=excluded.internal_anchor,
      editor_profile=excluded.editor_profile,sample_enabled=excluded.sample_enabled,sample_count=excluded.sample_count,layout_profile=excluded.layout_profile,structure_profile=excluded.structure_profile,
      updated_at=CURRENT_TIMESTAMP`).bind(key, name, category, preset, price, renewal, active, sort, image, demo, badge, description, features, accent, seoTitle, seoSlug, primaryKeyword, secondaryKeywords, metaDescription, internalAnchor, editorProfileJson, sampleEnabled, sampleCount, layoutProfileJson, structureProfileJson).run();
      return json({ ok: true, template_key: key, structure_validation: structureValidation });
    }
    if (route === "master/template-seed-existing" && request.method === "POST") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const b = await body(request), key = String(b.template_key || "").trim();
      if (!key) return json({ error: "Thi\u1EBFu m\xE3 template" }, 400);
      const t = await env.DB.prepare(`SELECT template_key,name,coalesce(sample_enabled,0) sample_enabled,coalesce(sample_count,12) sample_count FROM template_catalog WHERE template_key=?`).bind(key).first();
      if (!t) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y template" }, 404);
      if (Number(t.sample_enabled) !== 1) return json({ error: "B\xE0i m\u1EABu c\u1EE7a template \u0111ang t\u1EAFt. H\xE3y b\u1EADt trong Template Manager tr\u01B0\u1EDBc." }, 409);
      const { results } = await env.DB.prepare(`SELECT id,name,domain FROM sites WHERE template_key=? ORDER BY id`).bind(key).all();
      let created = 0, skipped = 0, failed = 0;
      const details = [];
      for (const s of results || []) {
        try {
          const r = await seedDemoForSite(env, Number(s.id), { limit: Number(t.sample_count || 12), source: "template-sync" });
          created += Number(r.created || 0);
          skipped += Number(r.skipped || 0);
          details.push({ site_id: s.id, domain: s.domain, created: r.created || 0, skipped: r.skipped || 0 });
        } catch (e) {
          failed++;
          details.push({ site_id: s.id, domain: s.domain, error: String(e?.message || e) });
        }
      }
      return json({ ok: true, template_key: key, sites: (results || []).length, created, skipped, failed, details });
    }
    if (route === "master/template-toggle" && request.method === "POST") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const b = await body(request), key = String(b.template_key || "").trim(), active = Number(b.is_active) ? 1 : 0;
      if (!key) return json({ error: "Thi\u1EBFu m\xE3 template" }, 400);
      await env.DB.prepare(`UPDATE template_catalog SET is_active=?,updated_at=CURRENT_TIMESTAMP WHERE template_key=?`).bind(active, key).run();
      return json({ ok: true, is_active: active });
    }
    if (route === "master/template-archive" && request.method === "POST") {
      if (!await masterOK(env, request)) return json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n" }, 401);
      const b = await body(request), key = String(b.template_key || "").trim();
      if (!key) return json({ error: "Thi\u1EBFu m\xE3 template" }, 400);
      await env.DB.prepare(`UPDATE template_catalog SET is_active=0,updated_at=CURRENT_TIMESTAMP WHERE template_key=?`).bind(key).run();
      return json({ ok: true });
    }
    if (route === "master/overview") {
      const { results } = await env.DB.prepare(`WITH post_agg AS (
        SELECT site_id,count(*) posts,coalesce(sum(views),0) views,
               coalesce(sum(CASE WHEN listing_code LIKE 'DEMO-%' THEN 1 ELSE 0 END),0) demo_posts
        FROM posts GROUP BY site_id
      ), admin_ranked AS (
        SELECT site_id,email,row_number() OVER(PARTITION BY site_id ORDER BY id) rn
        FROM users WHERE role='admin'
      ), pending_activation AS (
        SELECT DISTINCT site_id FROM site_activation_tokens
        WHERE used_at IS NULL AND expires_at>datetime('now')
      ), trial_sites AS (
        SELECT DISTINCT site_id FROM website_trials
      ), preset_templates AS (
        SELECT preset,name,row_number() OVER(PARTITION BY preset ORDER BY sort_order,template_key) rn
        FROM template_catalog
      )
      SELECT s.id,s.name,s.domain,s.status,s.created_at,s.preset,s.template_key,
      coalesce(tc.name,pt.name,s.preset) template_name,
      coalesce(pa.posts,0) posts,coalesce(pa.views,0) views,ar.email admin_email,coalesce(pa.demo_posts,0) demo_posts,
      cp.full_name customer_name,cp.phone customer_phone,cp.email customer_email,cp.company customer_company,
      cp.order_code,cp.activated_at,
      ss.plan_name,ss.sale_price,ss.internal_cost,ss.payment_status,ss.service_status,
      ss.started_at,ss.expires_at,ss.domain_status,ss.domain_registered_at,ss.domain_expires_at,ss.registrar,
      coalesce(sp.term_months,12) term_months,coalesce(sp.promotion_name,'') promotion_name,coalesce(sp.list_price,1999000) list_price,coalesce(sp.first_discount,0) first_discount,coalesce(sp.first_price,ss.sale_price,1999000) first_price,coalesce(sp.renewal_price,1999000) renewal_price,
      coalesce(sp.renewal_status,'none') renewal_status,sp.renewal_notified_at,sp.renewal_decision_at,sp.renewal_requested_at,coalesce(sp.renewal_stage,'none') renewal_stage,sp.renewal_payment_sent_at,sp.renewal_paid_at,sp.renewal_completed_at,coalesce(sp.renewal_selected_months,sp.term_months,12) renewal_selected_months,coalesce(sp.renewal_order_code,'') renewal_order_code,
      CASE WHEN cp.activated_at IS NOT NULL THEN 'activated'
           WHEN pact.site_id IS NOT NULL THEN 'pending'
           ELSE 'not_created' END onboarding_status
      FROM sites s
      LEFT JOIN template_catalog tc ON tc.template_key=s.template_key
      LEFT JOIN preset_templates pt ON pt.preset=s.preset AND pt.rn=1
      LEFT JOIN post_agg pa ON pa.site_id=s.id
      LEFT JOIN admin_ranked ar ON ar.site_id=s.id AND ar.rn=1
      LEFT JOIN pending_activation pact ON pact.site_id=s.id
      LEFT JOIN trial_sites ts ON ts.site_id=s.id
      LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
      LEFT JOIN service_promotions sp ON sp.site_id=s.id
      WHERE ts.site_id IS NULL
      ORDER BY s.id DESC`).all();
      return json({ stats: await masterOverview(env), sites: results });
    }
    if (route === "master/seed-demo" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website c\u1EA7n t\u1EA1o d\u1EEF li\u1EC7u m\u1EABu" }, 400);
      const target = await env.DB.prepare(`SELECT s.id,s.template_key,cp.activated_at,coalesce(tc.sample_enabled,0) sample_enabled,coalesce(tc.sample_count,12) sample_count
      FROM sites s LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN template_catalog tc ON tc.template_key=s.template_key WHERE s.id=?`).bind(siteId).first();
      if (!target) return json({ error: "Website kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
      if (!target.activated_at) return json({ error: "Kh\xE1ch ch\u01B0a k\xEDch ho\u1EA1t Admin Client. Ch\u1EC9 c\xE0i b\xE0i m\u1EABu sau khi kh\xE1ch \u0111\xE3 k\xEDch ho\u1EA1t." }, 409);
      if (Number(target.sample_enabled) !== 1) return json({ error: "Template n\xE0y ch\u01B0a b\u1EADt b\u1ED9 b\xE0i m\u1EABu trong Template Manager." }, 409);
      const result = await seedDemoForSite(env, siteId, { limit: Number(target.sample_count || 12), source: "master-customer-request" });
      return json({ ok: true, ...result });
    }
    if (route === "master/clear-demo" && request.method === "POST") {
      const b = await body(request), siteId = Number(b.site_id);
      if (!siteId) return json({ error: "Thi\u1EBFu website c\u1EA7n x\xF3a d\u1EEF li\u1EC7u m\u1EABu" }, 400);
      const demoRows = await env.DB.prepare(`SELECT id FROM posts WHERE site_id=? AND (coalesce(is_sample,0)=1 OR listing_code LIKE 'DEMO-%' OR listing_code LIKE 'SAMPLE-%')`).bind(siteId).all();
      const count = demoRows.results?.length || 0;
      if (count) {
        await env.DB.prepare(`DELETE FROM pageviews WHERE site_id=? AND post_id IN (SELECT id FROM posts WHERE site_id=? AND (coalesce(is_sample,0)=1 OR listing_code LIKE 'DEMO-%' OR listing_code LIKE 'SAMPLE-%'))`).bind(siteId, siteId).run();
        await env.DB.prepare(`DELETE FROM posts WHERE site_id=? AND (coalesce(is_sample,0)=1 OR listing_code LIKE 'DEMO-%' OR listing_code LIKE 'SAMPLE-%')`).bind(siteId).run();
      }
      return json({ ok: true, deleted: count });
    }
    if (route === "master/cleanup-test-data" && request.method === "POST") {
      const b = await body(request);
      const preserveDomain = normalizeDomain(b.preserve_domain || "");
      const confirmText = String(b.confirm || "").trim();
      if (!preserveDomain) return json({ error: "Thi\u1EBFu domain c\u1EA7n gi\u1EEF l\u1EA1i" }, 400);
      if (confirmText !== "XOA DU LIEU TEST") return json({ error: "X\xE1c nh\u1EADn kh\xF4ng \u0111\xFAng" }, 400);
      const keep = await env.DB.prepare(`SELECT id,name,domain FROM sites WHERE lower(domain)=lower(?) LIMIT 1`).bind(preserveDomain).first();
      if (!keep) return json({ error: `Kh\xF4ng t\xECm th\u1EA5y website c\xF3 domain ${preserveDomain}. Kh\xF4ng x\xF3a g\xEC c\u1EA3.` }, 404);
      const keepId = Number(keep.id);
      const money = await env.DB.prepare(`SELECT
      coalesce(sum(CASE WHEN status='paid' THEN amount ELSE 0 END),0) test_revenue
      FROM financial_transactions WHERE site_id=?`).bind(keepId).first();
      const removedTestRevenue = Math.max(0, Number(money?.test_revenue || 0));
      await env.DB.prepare(`UPDATE service_subscriptions SET finance_excluded=1,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(keepId).run();
      await env.DB.prepare(`DELETE FROM financial_transactions WHERE site_id=?`).bind(keepId).run();
      const leadCount = Number((await env.DB.prepare(`SELECT count(*) n FROM sales_leads`).first())?.n || 0);
      await env.DB.prepare(`DELETE FROM sales_leads`).run();
      const doomed = (await env.DB.prepare(`SELECT id,domain FROM sites WHERE id<>?`).bind(keepId).all()).results || [];
      for (const s of doomed) {
        const id = Number(s.id);
        for (const [table, col] of [
          ["password_reset_tokens", "site_id"],
          ["handover_login_tokens", "site_id"],
          ["site_activation_tokens", "site_id"],
          ["renewal_response_tokens", "site_id"],
          ["renewal_reminder_log", "site_id"],
          ["renewal_history", "site_id"],
          ["financial_transactions", "site_id"],
          ["service_promotions", "site_id"],
          ["service_subscriptions", "site_id"],
          ["site_public_settings", "site_id"],
          ["customer_profiles", "site_id"],
          ["pageviews", "site_id"],
          ["sessions", "site_id"],
          ["posts", "site_id"],
          ["users", "site_id"]
        ]) {
          try {
            await env.DB.prepare(`DELETE FROM ${table} WHERE ${col}=?`).bind(id).run();
          } catch (e) {
          }
        }
        await env.DB.prepare(`DELETE FROM sites WHERE id=?`).bind(id).run();
      }
      try {
        await env.DB.prepare(`UPDATE service_promotions SET renewal_status='none',renewal_stage='none',
      renewal_notified_at=NULL,renewal_decision_at=NULL,renewal_requested_at=NULL,
      renewal_payment_sent_at=NULL,renewal_paid_at=NULL,renewal_completed_at=NULL,
      updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(keepId).run();
      } catch (e) {
      }
      try {
        await env.DB.prepare(`DELETE FROM renewal_response_tokens WHERE site_id=?`).bind(keepId).run();
      } catch (e) {
      }
      try {
        await env.DB.prepare(`DELETE FROM renewal_reminder_log WHERE site_id=?`).bind(keepId).run();
      } catch (e) {
      }
      return json({
        ok: true,
        preserved: { id: keepId, name: keep.name, domain: keep.domain },
        deleted_sites: doomed.length,
        deleted_leads: leadCount,
        removed_test_revenue: removedTestRevenue,
        operating_expenses_preserved: true
      });
    }
    if (route === "master/site-status" && request.method === "PUT") {
      const b = await body(request), id = Number(b.site_id), status = b.status === "inactive" ? "inactive" : "active";
      if (!id) return json({ error: "Thi\u1EBFu website c\u1EA7n c\u1EADp nh\u1EADt" }, 400);
      await env.DB.prepare(`UPDATE sites SET status=? WHERE id=?`).bind(status, id).run();
      return json({ ok: true });
    }
    if (route.startsWith("master/")) return json({ error: "Master API kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
    if (route === "activation-status" && request.method === "GET") {
      const raw = String(u.searchParams.get("token") || "");
      if (!raw) return json({ error: "Thi\u1EBFu m\xE3 k\xEDch ho\u1EA1t" }, 400);
      const hash = await sha256(raw);
      const row = await env.DB.prepare(`SELECT at.site_id,at.expires_at,at.used_at,s.name,s.domain
    FROM site_activation_tokens at JOIN sites s ON s.id=at.site_id WHERE at.token_hash=?`).bind(hash).first();
      if (!row) return json({ error: "Li\xEAn k\u1EBFt k\xEDch ho\u1EA1t kh\xF4ng h\u1EE3p l\u1EC7" }, 404);
      if (row.used_at) return json({ error: "Li\xEAn k\u1EBFt n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng" }, 410);
      if (await env.DB.prepare(`SELECT 1 expired WHERE datetime(?)<=datetime('now')`).bind(row.expires_at).first()) return json({ error: "Li\xEAn k\u1EBFt k\xEDch ho\u1EA1t \u0111\xE3 h\u1EBFt h\u1EA1n" }, 410);
      const pages = await getPagesDomainStatus(env, row.domain);
      const active = pages.status === "active";
      if (active) {
        await env.DB.prepare(`UPDATE service_subscriptions SET domain_status='active',service_status='ready',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(row.site_id).run();
      }
      return json({ ok: true, site: { id: row.site_id, name: row.name, domain: row.domain }, pages_configured: pages.configured, pages_status: pages.status, active, error: pages.error || "" });
    }
    if (route === "activation" && request.method === "GET") {
      const raw = String(u.searchParams.get("token") || "");
      if (!raw) return json({ error: "Thi\u1EBFu m\xE3 k\xEDch ho\u1EA1t" }, 400);
      const hash = await sha256(raw);
      const row = await env.DB.prepare(`SELECT at.id token_id,at.site_id,at.expires_at,at.used_at,s.name,s.domain,
      cp.full_name,cp.phone,cp.email,cp.company,cp.activated_at,sl.site_name
    FROM site_activation_tokens at JOIN sites s ON s.id=at.site_id
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN website_trials wt0 ON wt0.site_id=s.id
    LEFT JOIN sales_leads sl ON sl.id=wt0.lead_id
    WHERE at.token_hash=?`).bind(hash).first();
      if (!row) return json({ error: "Li\xEAn k\u1EBFt k\xEDch ho\u1EA1t kh\xF4ng h\u1EE3p l\u1EC7" }, 404);
      if (row.used_at) return json({ error: "Li\xEAn k\u1EBFt n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng" }, 410);
      if (await env.DB.prepare(`SELECT 1 expired WHERE datetime(?)<=datetime('now')`).bind(row.expires_at).first()) return json({ error: "Li\xEAn k\u1EBFt k\xEDch ho\u1EA1t \u0111\xE3 h\u1EBFt h\u1EA1n" }, 410);
      const trial = await env.DB.prepare(`SELECT wt.trial_token,wt.template_key,wt.status,tc.name template_name FROM website_trials wt LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.site_id=? LIMIT 1`).bind(row.site_id).first();
      if (!trial) {
        const pages = await getPagesDomainStatus(env, row.domain);
        if (pages.status !== "active") {
          return json({
            error: "Website \u0111ang ho\xE0n t\u1EA5t DNS/SSL tr\xEAn Cloudflare Pages",
            code: "DOMAIN_NOT_READY",
            domain: row.domain,
            pages_configured: pages.configured,
            pages_status: pages.status,
            detail: pages.error || ""
          }, 409);
        }
      }
      return json({ site: { id: row.site_id, name: row.name, domain: row.domain }, customer: { full_name: row.full_name || "", phone: row.phone || "", email: row.email || "", company: row.company || "", site_name: row.site_name || "" }, trial: trial ? { is_trial: true, token: trial.trial_token, template_key: trial.template_key, template_name: trial.template_name || trial.template_key, status: trial.status } : null });
    }
    if (route === "activation" && request.method === "POST") {
      const b = await body(request), raw = String(b.token || ""), newPassword = String(b.password || ""), loginEmail = String(b.email || "").trim().toLowerCase(), desiredSiteName = String(b.site_name || "").trim();
      if (!raw) return json({ error: "Thi\u1EBFu m\xE3 k\xEDch ho\u1EA1t" }, 400);
      if (!loginEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) return json({ error: "Email \u0111\u0103ng nh\u1EADp kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      if (newPassword.length < 8) return json({ error: "M\u1EADt kh\u1EA9u qu\u1EA3n tr\u1ECB ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 8 k\xFD t\u1EF1" }, 400);
      const hash = await sha256(raw);
      const at = await env.DB.prepare(`SELECT at.*,s.domain FROM site_activation_tokens at JOIN sites s ON s.id=at.site_id
    WHERE at.token_hash=? AND at.used_at IS NULL AND at.expires_at>datetime('now')`).bind(hash).first();
      if (!at) return json({ error: "Li\xEAn k\u1EBFt k\xEDch ho\u1EA1t kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n" }, 410);
      const trial = await env.DB.prepare(`SELECT wt.*,tc.name template_name FROM website_trials wt LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.site_id=? LIMIT 1`).bind(at.site_id).first();
      if (trial && !desiredSiteName) return json({ error: "Vui l\xF2ng nh\u1EADp T\xEAn website mong mu\u1ED1n" }, 400);
      if (!trial) {
        const ready = await getPagesDomainStatus(env, at.domain);
        if (ready.status !== "active") return json({ error: "Domain/SSL ch\u01B0a s\u1EB5n s\xE0ng. Vui l\xF2ng th\u1EED l\u1EA1i sau.", code: "DOMAIN_NOT_READY", pages_status: ready.status, detail: ready.error || "" }, 409);
      }
      const usr = await env.DB.prepare(`SELECT id,email FROM users WHERE site_id=? AND role='admin' ORDER BY id LIMIT 1`).bind(at.site_id).first();
      if (!usr) return json({ error: "Website ch\u01B0a c\xF3 t\xE0i kho\u1EA3n qu\u1EA3n tr\u1ECB" }, 409);
      const magicRaw = activationToken(), magicHash = await sha256(magicRaw), passwordHash = await sha256(newPassword);
      const activationSession = tok();
      const ops = [
        env.DB.prepare(`UPDATE users SET email=?,password_hash=? WHERE id=?`).bind(loginEmail, passwordHash, usr.id),
        env.DB.prepare(`DELETE FROM sessions WHERE site_id=?`).bind(at.site_id),
        env.DB.prepare(`INSERT INTO sessions(site_id,user_id,token,expires_at) VALUES(?,?,?,datetime('now','+30 days'))`).bind(at.site_id, usr.id, activationSession),
        env.DB.prepare(`UPDATE customer_profiles SET email=?,activated_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(loginEmail, at.site_id),
        env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(at.site_id),
        env.DB.prepare(`UPDATE handover_login_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(at.site_id),
        env.DB.prepare(`INSERT INTO handover_login_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+30 minutes'))`).bind(at.site_id, magicHash)
      ];
      if (trial) {
        ops.push(env.DB.prepare(`UPDATE website_trials SET status='active',started_at=CURRENT_TIMESTAMP,expires_at=datetime('now','+1 day'),grace_expires_at=datetime('now','+8 days'),updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(trial.id));
        ops.push(env.DB.prepare(`UPDATE service_subscriptions SET service_status='active',domain_status='trial',started_at=date('now'),expires_at=date('now','+1 day'),updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(at.site_id));
        ops.push(env.DB.prepare(`UPDATE sales_leads SET email=?,site_name=?,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(loginEmail, desiredSiteName, trial.lead_id));
        ops.push(env.DB.prepare(`UPDATE sites SET name=? WHERE id=?`).bind(desiredSiteName + " \xB7 Trial", at.site_id));
      } else {
        ops.push(env.DB.prepare(`UPDATE service_subscriptions SET service_status='active',domain_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(at.site_id));
      }
      await env.DB.batch(ops);
      if (trial) {
        await trialEvent(env, { ...trial, email: loginEmail }, "trial_activated", { template_key: trial.template_key });
        return json({ ok: true, is_trial: true, domain: at.domain, token: activationSession, admin_url: `/admin?tenant=${encodeURIComponent(at.domain)}&nr_trial=${encodeURIComponent(trial.trial_token)}&template=${encodeURIComponent(trial.template_key)}`, website_url: `/?template=${encodeURIComponent(trial.template_key)}&nr_trial=${encodeURIComponent(trial.trial_token)}` }, 200, { "Set-Cookie": `nr_session=${encodeURIComponent(activationSession)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` });
      }
      try {
        await createActivationServiceDocument(env, at.site_id, loginEmail);
      } catch (e) {
        console.log("activation service document:", e?.message || e);
      }
      return json({ ok: true, domain: at.domain, admin_url: `https://${at.domain}/admin?handover=${encodeURIComponent(magicRaw)}` });
    }
    if (route === "handover-login" && request.method === "POST") {
      const b = await body(request), raw = String(b.token || "");
      if (!raw) return json({ error: "Thi\u1EBFu m\xE3 b\xE0n giao" }, 400);
      const hash = await sha256(raw);
      const ht = await env.DB.prepare(`SELECT * FROM handover_login_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>datetime('now')`).bind(hash).first();
      if (!ht) return json({ error: "M\xE3 \u0111\u0103ng nh\u1EADp b\xE0n giao kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n" }, 410);
      const s = await env.DB.prepare(`SELECT * FROM sites WHERE id=? AND status='active'`).bind(ht.site_id).first();
      if (!s) return json({ error: "Website ch\u01B0a ho\u1EA1t \u0111\u1ED9ng" }, 409);
      const usr = await env.DB.prepare(`SELECT * FROM users WHERE site_id=? AND role='admin' ORDER BY id LIMIT 1`).bind(ht.site_id).first();
      if (!usr) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y Admin" }, 404);
      const t = tok();
      await env.DB.batch([
        env.DB.prepare(`INSERT INTO sessions(site_id,user_id,token,expires_at) VALUES(?,?,?,datetime('now','+30 days'))`).bind(s.id, usr.id, t),
        env.DB.prepare(`UPDATE handover_login_tokens SET used_at=datetime('now') WHERE id=?`).bind(ht.id)
      ]);
      return json({ ok: true, token: t, site_id: s.id }, 200, { "Set-Cookie": `nr_session=${encodeURIComponent(t)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` });
    }
    if (route === "image" && request.method === "GET") {
      const key = u.searchParams.get("key");
      if (!key) return json({ error: "Thi\u1EBFu key \u1EA3nh" }, 400);
      const obj = await env.IMAGES?.get(key);
      if (!obj) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y \u1EA3nh" }, 404);
      const h = new Headers();
      obj.writeHttpMetadata(h);
      h.set("Cache-Control", "public, max-age=31536000, immutable");
      h.set("CDN-Cache-Control", "public, max-age=31536000, immutable");
      h.set("ETag", obj.httpEtag);
      return new Response(obj.body, { headers: h });
    }
    const site = await siteFor(env, request);
    if (!site) return json({ error: "Website ch\u01B0a \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t" }, 404);
    if (route === "game/stats" && request.method === "GET") {
      const slugs = String(u.searchParams.get("slugs") || "").split(",").map(nrSlug).filter(Boolean).slice(0, 60);
      if (!slugs.length) return json({ ok: true, stats: {} }, 200, publicCache(15, 60));
      const qs = slugs.map(() => "?").join(",");
      const { results } = await env.DB.prepare(`SELECT slug,views,vote_sum,vote_count,downloads FROM game_base_stats WHERE site_id=? AND slug IN (${qs})`).bind(site.id, ...slugs).all();
      const out = {};
      for (const row of results || []) out[row.slug] = nrGameStatsPublic(row);
      return json({ ok: true, stats: out }, 200, publicCache(15, 60));
    }
    if (route === "game/stats/action" && request.method === "POST") {
      const b = await body(request), slug = nrSlug(b.slug || ""), action = String(b.action || "").toLowerCase();
      if (!slug || !["view", "download", "vote"].includes(action)) return json({ error: "Stats action kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      await env.DB.prepare(`INSERT OR IGNORE INTO game_base_stats(site_id,slug) VALUES(?,?)`).bind(site.id, slug).run();
      if (action === "view") await env.DB.prepare(`UPDATE game_base_stats SET views=views+1,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=?`).bind(site.id, slug).run();
      if (action === "download") await env.DB.prepare(`UPDATE game_base_stats SET downloads=downloads+1,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=?`).bind(site.id, slug).run();
      if (action === "vote") {
        const vote = Math.max(1, Math.min(5, Number(b.value || 0)));
        if (!Number.isFinite(vote)) return json({ error: "Vote ph\u1EA3i t\u1EEB 1 \u0111\u1EBFn 5" }, 400);
        const client = String(b.client_id || "").slice(0, 160);
        if (client.length < 8) return json({ error: "Thi\u1EBFu client id" }, 400);
        const voterKey = await sha256(`coc-vote:${site.id}:${client}`);
        const prev = await env.DB.prepare(`SELECT vote FROM game_base_votes WHERE site_id=? AND slug=? AND voter_key=?`).bind(site.id, slug, voterKey).first();
        if (prev) {
          await env.DB.batch([
            env.DB.prepare(`UPDATE game_base_votes SET vote=?,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=? AND voter_key=?`).bind(vote, site.id, slug, voterKey),
            env.DB.prepare(`UPDATE game_base_stats SET vote_sum=vote_sum+?,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=?`).bind(vote - Number(prev.vote || 0), site.id, slug)
          ]);
        } else {
          await env.DB.batch([
            env.DB.prepare(`INSERT INTO game_base_votes(site_id,slug,voter_key,vote) VALUES(?,?,?,?)`).bind(site.id, slug, voterKey, vote),
            env.DB.prepare(`UPDATE game_base_stats SET vote_sum=vote_sum+?,vote_count=vote_count+1,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=?`).bind(vote, site.id, slug)
          ]);
        }
      }
      const row = await env.DB.prepare(`SELECT slug,views,vote_sum,vote_count,downloads FROM game_base_stats WHERE site_id=? AND slug=?`).bind(site.id, slug).first();
      return json({ ok: true, slug, stats: nrGameStatsPublic(row) }, 200, { "Cache-Control": "no-store" });
    }
    let __siteTrial = null;
    try {
      __siteTrial = await env.DB.prepare(`SELECT * FROM website_trials WHERE site_id=? LIMIT 1`).bind(site.id).first();
    } catch (e) {
    }
    if (__siteTrial) {
      const st = trialPublicState(__siteTrial);
      if (st?.expired && __siteTrial.status === "active") {
        await env.DB.prepare(`UPDATE website_trials SET status='expired',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(__siteTrial.id).run();
        __siteTrial.status = "expired";
      }
      const expired = st?.expired || __siteTrial.status === "expired";
      if (expired && request.method !== "GET" && !["logout"].includes(route)) return json({ error: "Th\u1EDDi gian tr\u1EA3i nghi\u1EC7m website \u0111\xE3 k\u1EBFt th\xFAc.", code: "TRIAL_EXPIRED", trial: st }, 402);
      if (!expired && request.method !== "GET" && route !== "logout") await trialEvent(env, __siteTrial, "api_write", { route });
    }
    if (route === "site" && request.method === "GET") {
      const hideSamples = !!__siteTrial || request.headers.get("X-NR-Preview-Samples") === "0";
      const templateSimulation = request.headers.get("X-NR-Template-Simulation") === "1";
      const templateDemo = request.headers.get("X-NR-Template-Demo") === "1";
      const requestedPreviewTemplate = String(request.headers.get("X-NR-Template-Key") || "").trim();
      if (templateDemo && !templateSimulation) {
        const previewTemplate = requestedPreviewTemplate || site.template_key;
        const previewSite = { ...site, template_key: previewTemplate };
        let t = null;
        try {
          t = await env.DB.prepare(`SELECT preset,editor_profile,structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(previewTemplate || "").first();
        } catch (e) {
        }
        if (t?.preset) previewSite.preset = t.preset;
        if (t?.editor_profile) previewSite.editor_profile = t.editor_profile;
        if (t?.structure_profile) previewSite.structure_profile = t.structure_profile;
        const blueprint = await buildTemplatePreviewBlueprint(env, previewTemplate, site);
        const virtualPosts = blueprint.posts;
        const st2 = { posts: virtualPosts.length, properties: virtualPosts.filter((x) => x.type === "property").length, news: virtualPosts.filter((x) => x.type === "news").length, views: virtualPosts.reduce((n, p) => n + Number(p.views || 0), 0) };
        return json({ site: previewSite, posts: virtualPosts, stats: st2, preview: { demo: true, template_demo: true, samples: 1, source: "template-sample-package", content_type: blueprint.content_type } }, 200, { "Cache-Control": "no-store" });
      }
      if (templateSimulation) {
        const previewTemplate = requestedPreviewTemplate;
        const previewSite = { ...site, template_key: previewTemplate || site.template_key };
        if (hideSamples) {
          let t = null;
          try {
            t = await env.DB.prepare(`SELECT editor_profile,structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(previewTemplate || site.template_key || "").first();
          } catch (e) {
          }
          if (t?.editor_profile) previewSite.editor_profile = t.editor_profile;
          if (t?.structure_profile) previewSite.structure_profile = t.structure_profile;
          let st3 = await stats(env, site.id);
          st3 = { ...st3, posts: 0, properties: 0, news: 0, views: 0 };
          return json({ site: previewSite, posts: [], stats: st3, preview: { client: true, template_simulation: true, samples: 0, structure_first: true, source: "template-structure-profile" } }, 200, { "Cache-Control": "no-store" });
        }
        const blueprint = await buildTemplatePreviewBlueprint(env, previewTemplate, site);
        const virtualPosts = blueprint.posts;
        const st2 = { posts: virtualPosts.length, properties: virtualPosts.filter((x) => x.type === "property").length, news: virtualPosts.filter((x) => x.type === "news").length, views: virtualPosts.reduce((n, p) => n + Number(p.views || 0), 0) };
        return json({ site: previewSite, posts: virtualPosts, stats: st2, preview: { client: true, template_simulation: true, samples: 1, structure_first: true, source: "template-sample-package", content_type: blueprint.content_type } }, 200, { "Cache-Control": "no-store" });
      }
      let responseSite = site;
      if (__siteTrial) {
        try {
          const tk = String(__siteTrial.template_key || site.template_key || "").trim();
          const tp = tk ? await env.DB.prepare(`SELECT preset,editor_profile,layout_profile,structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(tk).first() : null;
          if (tp) {
            responseSite = { ...site, template_key: tk || site.template_key };
            if (tp.preset) responseSite.preset = tp.preset;
            if (tp.editor_profile) responseSite.editor_profile = tp.editor_profile;
            if (tp.layout_profile) responseSite.layout_profile = tp.layout_profile;
            if (tp.structure_profile) responseSite.structure_profile = tp.structure_profile;
          }
        } catch (e) {
          console.log("trial template parity:", e?.message || e);
        }
      }
      const sql = hideSamples ? `SELECT * FROM posts WHERE site_id=? AND status='published' AND coalesce(is_sample,0)=0 AND coalesce(sample_key,'')='' AND coalesce(listing_code,'') NOT LIKE 'DEMO-%' AND coalesce(listing_code,'') NOT LIKE 'SAMPLE-%' ORDER BY id DESC LIMIT 100` : `SELECT *,count(*) OVER() __nr_total_posts,coalesce(sum(views) OVER(),0) __nr_total_views FROM posts WHERE site_id=? AND status='published' ORDER BY id DESC LIMIT 100`;
      const { results } = await env.DB.prepare(sql).bind(site.id).all();
      for (const p of results || []) {
        if (String(p.type || "").toLowerCase() !== "game") continue;
        let ex = {};
        try {
          ex = JSON.parse(String(p.extra_json || "{}"));
        } catch (e) {
        }
        const slug = nrSlug(ex.slug || p.title || "base-" + p.id);
        p.slug = slug;
        p.url = `/base/${slug}.html`;
        p.demo_url = p.url;
      }
      let st;
      const published = results || [];
      if (hideSamples) {
        const today = (await env.DB.prepare(`SELECT count(*) c FROM pageviews WHERE site_id=? AND created_at>=datetime('now','start of day')`).bind(site.id).first())?.c || 0;
        st = { posts: published.length, views: published.reduce((n, p) => n + Number(p.views || 0), 0), today: Number(today || 0) };
      } else {
        const first = published[0] || {};
        const today = (await env.DB.prepare(`SELECT count(*) c FROM pageviews WHERE site_id=? AND created_at>=datetime('now','start of day')`).bind(site.id).first())?.c || 0;
        st = { posts: Number(first.__nr_total_posts || 0), views: Number(first.__nr_total_views || 0), today: Number(today || 0) };
        for (const row of published) {
          delete row.__nr_total_posts;
          delete row.__nr_total_views;
        }
      }
      return json({ site: responseSite, posts: results, stats: st, preview: { client: true, template_simulation: templateSimulation, samples: hideSamples ? 0 : 1, trial_template_parity: !!__siteTrial } }, 200, { "Cache-Control": "no-store" });
    }
    if (route === "article" && request.method === "GET") {
      const id = +u.searchParams.get("id");
      const hideSamples = !!__siteTrial || request.headers.get("X-NR-Preview-Samples") === "0";
      const templateSimulation = request.headers.get("X-NR-Template-Simulation") === "1";
      if (templateSimulation && hideSamples) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y b\xE0i vi\u1EBFt" }, 404);
      const p = await env.DB.prepare(`SELECT * FROM posts WHERE id=? AND site_id=? AND status='published'`).bind(id, site.id).first();
      const legacySample = p && (Number(p.is_sample || 0) === 1 || String(p.sample_key || "") !== "" || /^DEMO-|^SAMPLE-/i.test(String(p.listing_code || "")));
      if (!p || hideSamples && legacySample) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y b\xE0i vi\u1EBFt" }, 404);
      await env.DB.prepare(`UPDATE posts SET views=views+1 WHERE id=? AND site_id=?`).bind(id, site.id).run();
      p.views = (p.views || 0) + 1;
      const { results: related } = await env.DB.prepare(`
   SELECT id,type,title,category,image,price,area,district,province,property_type,"transaction",views,created_at
   FROM posts
   WHERE site_id=? AND status='published' AND id<>? AND type=? ${hideSamples ? "AND coalesce(is_sample,0)=0" : ""}
   ORDER BY
     CASE WHEN category=? THEN 0 ELSE 1 END,
     CASE WHEN property_type=? THEN 0 ELSE 1 END,
     id DESC
   LIMIT 6
 `).bind(site.id, id, p.type || "property", p.category || "", p.property_type || "").all();
      let latestNews = [], popularNews = [], newsCategories = [];
      if (p.type === "news") {
        latestNews = (await env.DB.prepare(`
     SELECT id,title,category,image,views,created_at FROM posts
     WHERE site_id=? AND status='published' AND type='news' AND id<>? ${hideSamples ? "AND coalesce(is_sample,0)=0" : ""}
     ORDER BY id DESC LIMIT 6
   `).bind(site.id, id).all()).results || [];
        popularNews = (await env.DB.prepare(`
     SELECT id,title,category,image,views FROM posts
     WHERE site_id=? AND status='published' AND type='news' AND id<>? ${hideSamples ? "AND coalesce(is_sample,0)=0" : ""}
     ORDER BY views DESC,id DESC LIMIT 5
   `).bind(site.id, id).all()).results || [];
        newsCategories = (await env.DB.prepare(`
     SELECT category,count(*) total FROM posts
     WHERE site_id=? AND status='published' AND type='news' AND trim(category)<>'' ${hideSamples ? "AND coalesce(is_sample,0)=0" : ""}
     GROUP BY category ORDER BY total DESC,category ASC LIMIT 12
   `).bind(site.id).all()).results || [];
      }
      return json({ site, post: p, related, latestNews, popularNews, newsCategories }, 200, publicCache(30, 120));
    }
    if (route === "forgot-password" && request.method === "POST") {
      const b = await body(request), email = String(b.email || "").trim().toLowerCase();
      const generic = { ok: true, message: "N\u1EBFu email n\xE0y thu\u1ED9c t\xE0i kho\u1EA3n qu\u1EA3n tr\u1ECB, NEWSREAL \u0111\xE3 g\u1EEDi li\xEAn k\u1EBFt \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u. Vui l\xF2ng ki\u1EC3m tra H\u1ED9p th\u01B0 \u0111\u1EBFn v\xE0 Spam." };
      if (!email || !site) return json(generic);
      const usr = await env.DB.prepare(`SELECT id,email FROM users WHERE site_id=? AND lower(email)=? AND role='admin' ORDER BY id LIMIT 1`).bind(site.id, email).first();
      if (!usr) return json(generic);
      const origin = `${u.protocol}//${u.host}`;
      const sent = await issuePasswordReset(env, { site, user: usr, origin });
      if (!sent.ok) return json({ error: sent.error || "Ch\u01B0a g\u1EEDi \u0111\u01B0\u1EE3c email \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u" }, 500);
      return json(generic);
    }
    if (route === "reset-password" && request.method === "POST") {
      const b = await body(request), raw = String(b.token || "").trim(), password = String(b.password || "");
      if (!raw) return json({ error: "Li\xEAn k\u1EBFt \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      if (password.length < 8) return json({ error: "M\u1EADt kh\u1EA9u m\u1EDBi ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 8 k\xFD t\u1EF1" }, 400);
      const hash = await sha256(raw);
      const rt = await env.DB.prepare(`SELECT prt.id,prt.site_id,prt.user_id,u.email
    FROM password_reset_tokens prt JOIN users u ON u.id=prt.user_id
    WHERE prt.token_hash=? AND prt.used_at IS NULL AND prt.expires_at>datetime('now')
    LIMIT 1`).bind(hash).first();
      if (!rt) return json({ error: "Li\xEAn k\u1EBFt \u0111\xE3 h\u1EBFt h\u1EA1n, \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng ho\u1EB7c kh\xF4ng h\u1EE3p l\u1EC7" }, 410);
      if (!site || Number(rt.site_id) !== Number(site.id)) return json({ error: "Li\xEAn k\u1EBFt n\xE0y kh\xF4ng thu\u1ED9c website hi\u1EC7n t\u1EA1i" }, 403);
      const newHash = await sha256(password);
      await env.DB.batch([
        env.DB.prepare(`UPDATE users SET password_hash=? WHERE id=? AND site_id=?`).bind(newHash, rt.user_id, rt.site_id),
        env.DB.prepare(`UPDATE password_reset_tokens SET used_at=datetime('now') WHERE id=?`).bind(rt.id),
        env.DB.prepare(`UPDATE password_reset_tokens SET used_at=datetime('now') WHERE site_id=? AND user_id=? AND used_at IS NULL`).bind(rt.site_id, rt.user_id),
        env.DB.prepare(`DELETE FROM sessions WHERE site_id=? AND user_id=?`).bind(rt.site_id, rt.user_id)
      ]);
      const resetSite = await env.DB.prepare(`SELECT domain FROM sites WHERE id=? LIMIT 1`).bind(rt.site_id).first();
      const trialReset = await env.DB.prepare(`SELECT trial_token,template_key FROM website_trials WHERE site_id=? LIMIT 1`).bind(rt.site_id).first();
      const adminUrl = trialReset ? `/admin?tenant=${encodeURIComponent(resetSite?.domain || "")}&nr_trial=${encodeURIComponent(trialReset.trial_token)}&template=${encodeURIComponent(trialReset.template_key)}` : `https://${resetSite?.domain || u.host}/admin`;
      return json({ ok: true, message: "\u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u th\xE0nh c\xF4ng. B\u1EA1n c\xF3 th\u1EC3 \u0111\u0103ng nh\u1EADp b\u1EB1ng m\u1EADt kh\u1EA9u m\u1EDBi.", admin_url: adminUrl }, 200, { "Set-Cookie": "nr_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax" });
    }
    if (route === "login" && request.method === "POST") {
      const b = await body(request), h = await sha256(b.password || "");
      const usr = await env.DB.prepare(`SELECT * FROM users WHERE site_id=? AND lower(email)=? AND password_hash=?`).bind(site.id, (b.email || "").toLowerCase(), h).first();
      if (!usr) return json({ error: "Sai email ho\u1EB7c m\u1EADt kh\u1EA9u" }, 401);
      if (__siteTrial) {
        await env.DB.prepare(`UPDATE website_trials SET admin_login_count=admin_login_count+1,last_seen_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(__siteTrial.id).run();
        await trialEvent(env, __siteTrial, "admin_login", {});
      }
      const t = tok();
      await env.DB.prepare(`INSERT INTO sessions(site_id,user_id,token,expires_at) VALUES(?,?,?,datetime('now','+7 days'))`).bind(site.id, usr.id, t).run();
      return json({ ok: true, token: t }, 200, { "Set-Cookie": `nr_session=${encodeURIComponent(t)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800` });
    }
    if (route === "logout" && request.method === "POST") {
      const a = request.headers.get("Authorization") || "", t = (a.startsWith("Bearer ") ? a.slice(7).trim() : "") || cookies(request).nr_session;
      if (t) await env.DB.prepare(`DELETE FROM sessions WHERE token=?`).bind(t).run();
      return json({ ok: true }, 200, { "Set-Cookie": "nr_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax" });
    }
    const user = await userFor(env, request, site);
    if (route === "upload" && request.method === "POST") {
      if (!user) return json({ error: "Ch\u01B0a \u0111\u0103ng nh\u1EADp" }, 401);
      if (!env.IMAGES) return json({ error: "Ch\u01B0a c\u1EA5u h\xECnh R2 binding IMAGES" }, 500);
      const form = await request.formData(), file = form.get("file");
      if (!file || typeof file === "string") return json({ error: "Ch\u01B0a ch\u1ECDn \u1EA3nh" }, 400);
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) return json({ error: "Ch\u1EC9 h\u1ED7 tr\u1EE3 JPG, PNG, WEBP" }, 400);
      if (file.size > 8 * 1024 * 1024) return json({ error: "\u1EA2nh t\u1ED1i \u0111a 8 MB" }, 400);
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const key = `sites/${site.id}/${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
      await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
      return json({ ok: true, url: `/api/image?key=${encodeURIComponent(key)}` });
    }
    if (route === "image" && request.method === "GET") {
      const key = u.searchParams.get("key");
      if (!key) return json({ error: "Thi\u1EBFu key \u1EA3nh" }, 400);
      const obj = await env.IMAGES?.get(key);
      if (!obj) return json({ error: "Kh\xF4ng t\xECm th\u1EA5y \u1EA3nh" }, 404);
      const h = new Headers();
      obj.writeHttpMetadata(h);
      h.set("Cache-Control", "public, max-age=31536000, immutable");
      h.set("CDN-Cache-Control", "public, max-age=31536000, immutable");
      h.set("ETag", obj.httpEtag);
      return new Response(obj.body, { headers: h });
    }
    if (route === "me") {
      if (!user) return json({ error: "Ch\u01B0a \u0111\u0103ng nh\u1EADp" }, 401);
      let tc = null;
      try {
        tc = await env.DB.prepare(`SELECT template_key,category,editor_profile,structure_profile FROM template_catalog WHERE template_key=? OR (template_key='' AND preset=?) ORDER BY CASE WHEN template_key=? THEN 0 ELSE 1 END LIMIT 1`).bind(site.template_key || "", site.preset || "", site.template_key || "").first();
      } catch (e) {
      }
      if (!tc) try {
        tc = await env.DB.prepare(`SELECT template_key,category,editor_profile,structure_profile FROM template_catalog WHERE preset=? ORDER BY sort_order,template_key LIMIT 1`).bind(site.preset || "").first();
      } catch (e) {
      }
      site.template_category = tc?.category || "";
      let content_profile = {};
      try {
        content_profile = tc?.editor_profile ? JSON.parse(tc.editor_profile) : {};
      } catch (e) {
        content_profile = {};
      }
      const profileType = String(content_profile?.content_type || (tc?.category === "tin-tuc" ? "news" : tc?.category === "bat-dong-san" ? "property" : "generic"));
      let categoryStructure = {};
      try {
        categoryStructure = tc?.structure_profile ? JSON.parse(tc.structure_profile) : defaultTemplateStructure(site.template_key || tc?.template_key || "");
      } catch (e) {
        categoryStructure = defaultTemplateStructure(site.template_key || tc?.template_key || "");
      }
      if (!categoryStructure || !Array.isArray(categoryStructure.sections) || !categoryStructure.sections.length) categoryStructure = defaultTemplateStructure(site.template_key || tc?.template_key || "");
      content_profile = templateCategoryContract(categoryStructure, content_profile, profileType);
      content_profile.settings_schema = Array.isArray(categoryStructure?.settings_schema) ? categoryStructure.settings_schema : [];
      try {
        site.template_settings = JSON.parse(String(site.template_settings_json || "{}"));
      } catch (e) {
        site.template_settings = {};
      }
      return json({ user: { id: user.id, email: user.email, role: user.role }, site, content_profile, stats: await stats(env, site.id) });
    }
    if (route === "service-info" && request.method === "GET") {
      if (!user) return json({ error: "Ch\u01B0a \u0111\u0103ng nh\u1EADp" }, 401);
      try {
        await syncCompletedRenewalExpiry(env, site.id);
      } catch (e) {
        console.log("service-info renewal sync:", e?.message || e);
      }
      let ss = null, cp = null, sp = null;
      try {
        ss = await env.DB.prepare(`SELECT plan_name,sale_price,payment_status,service_status,started_at,expires_at,domain_status,domain_registered_at,domain_expires_at,registrar FROM service_subscriptions WHERE site_id=?`).bind(site.id).first();
      } catch (e) {
        console.log("service-info subscription:", e?.message || e);
      }
      try {
        cp = await env.DB.prepare(`SELECT full_name,email,phone FROM customer_profiles WHERE site_id=?`).bind(site.id).first();
      } catch (e) {
        console.log("service-info customer:", e?.message || e);
      }
      try {
        sp = await env.DB.prepare(`SELECT * FROM service_promotions WHERE site_id=?`).bind(site.id).first();
      } catch (e) {
        console.log("service-info promotion:", e?.message || e);
      }
      const sale = Number(ss?.sale_price || 0);
      const listPrice = Number(sp?.list_price || 1999e3);
      const firstDiscount = Number(sp?.first_discount || 0);
      const service = {
        plan_name: ss?.plan_name || "G\xF3i website tr\u1ECDn g\xF3i",
        payment_status: ss?.payment_status || "unpaid",
        service_status: ss?.service_status || "active",
        started_at: ss?.started_at || null,
        expires_at: ss?.expires_at || null,
        domain_status: ss?.domain_status || "not_configured",
        domain_registered_at: ss?.domain_registered_at || null,
        domain_expires_at: ss?.domain_expires_at || null,
        registrar: ss?.registrar || "Cloudflare",
        customer_name: cp?.full_name || "",
        customer_email: cp?.email || user.email || "",
        customer_phone: cp?.phone || "",
        term_months: Number(sp?.term_months || 12),
        promotion_name: sp?.promotion_name || "\u01AFu \u0111\xE3i k\xEDch ho\u1EA1t l\u1EA7n \u0111\u1EA7u",
        list_price: listPrice,
        first_discount: firstDiscount,
        first_price: Number(sp?.first_price ?? (sale || Math.max(0, listPrice - firstDiscount))),
        renewal_price: Number(sp?.renewal_price || listPrice),
        renewal_status: sp?.renewal_status || "none",
        renewal_stage: sp?.renewal_stage || "none",
        renewal_requested_at: sp?.renewal_requested_at || null,
        renewal_notified_at: sp?.renewal_notified_at || null,
        renewal_payment_sent_at: sp?.renewal_payment_sent_at || null,
        renewal_paid_at: sp?.renewal_paid_at || null,
        renewal_completed_at: sp?.renewal_completed_at || null,
        renewal_selected_months: Number(sp?.renewal_selected_months || sp?.term_months || 12),
        renewal_order_code: sp?.renewal_order_code || ""
      };
      return json({ ok: true, service, site: { name: site.name, domain: site.domain } });
    }
    if (route === "request-renewal" && request.method === "POST") {
      if (!user) return json({ error: "Ch\u01B0a \u0111\u0103ng nh\u1EADp" }, 401);
      const b = await body(request);
      try {
        const pay = await createRenewalPayment(env, site.id, Number(b.years || 1));
        return json({ ok: true, status: "payment_pending", payment: { order_code: pay.order_code, payment_token: pay.payment_token, years: pay.years, amount: pay.amount, memo: pay.memo, provider: pay.provider, provider_order_code: pay.provider_order_code, qr_code: pay.qr_code, checkout_url: pay.checkout_url, payment_link_id: pay.payment_link_id, qr_url: pay.qr_url, bank_name: pay.bank_name, account_name: pay.account_name, account_number: pay.account_number } });
      } catch (e) {
        return json({ error: e.message || "Kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c thanh to\xE1n gia h\u1EA1n" }, 400);
      }
    }
    if (route === "service-leads") {
      try {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS service_leads(id INTEGER PRIMARY KEY AUTOINCREMENT,site_id INTEGER NOT NULL,customer_name TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',province TEXT NOT NULL DEFAULT '',district TEXT NOT NULL DEFAULT '',need TEXT NOT NULL DEFAULT '',package_title TEXT NOT NULL DEFAULT '',package_category TEXT NOT NULL DEFAULT '',source_url TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'new',note TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
      } catch (e) {
      }
      if (request.method === "POST") {
        const b = await body(request), name = String(b.customer_name || "").trim(), phone = String(b.phone || "").trim();
        if (!name || !phone) return json({ error: "Vui l\xF2ng nh\u1EADp h\u1ECD t\xEAn v\xE0 s\u1ED1 \u0111i\u1EC7n tho\u1EA1i" }, 400);
        const r = await env.DB.prepare(`INSERT INTO service_leads(site_id,customer_name,phone,province,district,need,package_title,package_category,source_url) VALUES(?,?,?,?,?,?,?,?,?)`).bind(site.id, name, phone, String(b.province || "").trim(), String(b.district || "").trim(), String(b.need || "").trim(), String(b.package_title || "").trim(), String(b.package_category || "").trim(), String(b.source_url || "").slice(0, 500)).run();
        return json({ ok: true, id: r.meta.last_row_id, message: "\u0110\xE3 g\u1EEDi y\xEAu c\u1EA7u t\u01B0 v\u1EA5n" });
      }
      if (request.method === "GET") {
        if (!user) return json({ error: "Ch\u01B0a \u0111\u0103ng nh\u1EADp" }, 401);
        const { results } = await env.DB.prepare(`SELECT * FROM service_leads WHERE site_id=? ORDER BY id DESC LIMIT 500`).bind(site.id).all();
        return json({ ok: true, leads: results || [] }, 200, { "Cache-Control": "no-store" });
      }
      if (request.method === "PUT") {
        if (!user) return json({ error: "Ch\u01B0a \u0111\u0103ng nh\u1EADp" }, 401);
        const b = await body(request), id = Number(b.id || 0);
        if (!id) return json({ error: "Thi\u1EBFu m\xE3 lead" }, 400);
        await env.DB.prepare(`UPDATE service_leads SET status=?,note=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND site_id=?`).bind(String(b.status || "new"), String(b.note || ""), id, site.id).run();
        return json({ ok: true });
      }
    }
    if (!user) return json({ error: "Ch\u01B0a \u0111\u0103ng nh\u1EADp" }, 401);
    if (route === "seed-demo") {
      return json({ error: "D\u1EEF li\u1EC7u m\u1EABu ch\u1EC9 c\xF3 th\u1EC3 \u0111\u01B0\u1EE3c kh\u1EDFi t\u1EA1o t\u1EEB Qu\u1EA3n tr\u1ECB t\u1ED5ng" }, 403);
    }
    if (route === "posts") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare(`SELECT * FROM posts WHERE site_id=? ORDER BY id DESC`).bind(site.id).all();
        return json({ posts: results }, 200, user ? { "Cache-Control": "no-store" } : publicCache(30, 120));
      }
      const b = await body(request);
      const missing = [];
      if (!String(b.title || "").trim()) missing.push("Ti\xEAu \u0111\u1EC1");
      if (!String(b.content || "").trim()) missing.push("M\xF4 t\u1EA3 chi ti\u1EBFt");
      if ((b.type || "property") === "property") {
        if (!String(b.price || "").trim()) missing.push("Gi\xE1");
        if (!String(b.area || "").trim()) missing.push("Di\u1EC7n t\xEDch");
        if (!String(b.province || "").trim()) missing.push("T\u1EC9nh/Th\xE0nh ph\u1ED1");
        if (!String(b.district || "").trim()) missing.push("Qu\u1EADn/Huy\u1EC7n");
        if (!String(b.address || "").trim()) missing.push("\u0110\u1ECBa ch\u1EC9 chi ti\u1EBFt");
        if (!String(b.contact_name || "").trim()) missing.push("T\xEAn ng\u01B0\u1EDDi li\xEAn h\u1EC7");
        if (!String(b.phone || "").trim()) missing.push("S\u1ED1 \u0111i\u1EC7n tho\u1EA1i");
        if (!String(b.image || "").trim()) missing.push("\u1EA2nh \u0111\u1EA1i di\u1EC7n");
      }
      if (missing.length) return json({ error: "Thi\u1EBFu th\xF4ng tin b\u1EAFt bu\u1ED9c: " + missing.join(", ") }, 400);
      if (request.method === "POST" && !String(b.listing_code || "").trim()) {
        const postType = String(b.type || "property");
        const prefix = postType === "news" ? "TT" : postType === "game" ? "BASE" : postType === "service" ? "DV" : "BDS";
        const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
        const row = await env.DB.prepare(`SELECT coalesce(max(id),0)+1 n FROM posts WHERE site_id=?`).bind(site.id).first();
        b.listing_code = `${prefix}-${String(site.id).padStart(2, "0")}-${stamp}-${String(row?.n || 1).padStart(4, "0")}`;
      }
      const vals = [b.type || "property", b.title || "", b.category || "", b.image || "", b.price || "", b.area || "", b.address || "", b.phone || "", b.content || "", b.status || "published", b.transaction || "", b.property_type || "", b.unit_price || "", b.bedrooms || null, b.bathrooms || null, b.floors || null, b.direction || "", b.legal || "", b.furniture || "", b.province || "", b.district || "", b.ward || "", b.gallery || "", b.contact_name || "", b.featured ? 1 : 0, b.verified ? 1 : 0, b.listing_code || "", b.frontage || "", String(b.extra_json || "{}")];
      if (request.method === "POST") {
        const r = await env.DB.prepare(`INSERT INTO posts(site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,extra_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(site.id, ...vals.slice(0, 10), user.id, ...vals.slice(10)).run();
        if (__siteTrial) {
          await env.DB.prepare(`UPDATE website_trials SET post_create_count=post_create_count+1,last_seen_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(__siteTrial.id).run();
          await trialEvent(env, __siteTrial, "post_created", { post_id: Number(r.meta.last_row_id) });
        }
        return json({ ok: true, id: r.meta.last_row_id });
      }
      if (request.method === "PUT") {
        const id = +u.searchParams.get("id");
        await env.DB.prepare(`UPDATE posts SET type=?,title=?,category=?,image=?,price=?,area=?,address=?,phone=?,content=?,status=?,"transaction"=?,property_type=?,unit_price=?,bedrooms=?,bathrooms=?,floors=?,direction=?,legal=?,furniture=?,province=?,district=?,ward=?,gallery=?,contact_name=?,featured=?,verified=?,listing_code=?,frontage=?,extra_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND site_id=?`).bind(...vals, id, site.id).run();
        return json({ ok: true });
      }
      if (request.method === "DELETE") {
        await env.DB.prepare(`DELETE FROM posts WHERE id=? AND site_id=?`).bind(+u.searchParams.get("id"), site.id).run();
        return json({ ok: true });
      }
    }
    if (route === "settings" && request.method === "PUT") {
      const b = await body(request);
      const publicEmail = String(b.email || "").trim().toLowerCase();
      const seoTitle = String(b.seo_title || "").trim().slice(0, 90), seoDescription = String(b.seo_description || "").trim().slice(0, 180), seoOgImage = String(b.seo_og_image || "").trim().slice(0, 1e3), seoIndex = b.seo_index === false || b.seo_index === 0 || String(b.seo_index) === "0" ? 0 : 1;
      if (publicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicEmail)) return json({ error: "Email li\xEAn h\u1EC7 kh\xF4ng h\u1EE3p l\u1EC7" }, 400);
      if (seoOgImage && !/^https?:\/\//i.test(seoOgImage) && !seoOgImage.startsWith("/")) return json({ error: "\u1EA2nh chia s\u1EBB SEO ph\u1EA3i l\xE0 URL http(s) ho\u1EB7c \u0111\u01B0\u1EDDng d\u1EABn b\u1EAFt \u0111\u1EA7u b\u1EB1ng /" }, 400);
      let structure = defaultTemplateStructure(site.template_key || "");
      try {
        const tr = await env.DB.prepare(`SELECT structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(site.template_key || "").first();
        if (tr?.structure_profile) structure = JSON.parse(tr.structure_profile);
      } catch (e) {
      }
      const schema = Array.isArray(structure?.settings_schema) ? structure.settings_schema : [], allowed = new Map(schema.map((x) => [String(x.key || ""), x]));
      const incoming = b.template_settings && typeof b.template_settings === "object" ? b.template_settings : {}, clean = {};
      for (const [key, def] of allowed) {
        let v = String(incoming[key] ?? def.default ?? "").trim();
        const max = def.type === "textarea" ? 12e3 : 1e3;
        v = v.slice(0, max);
        if (def.type === "url" && v && !/^https?:\/\//i.test(v)) return json({ error: `${def.label || key}: link ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng http:// ho\u1EB7c https://` }, 400);
        clean[key] = v;
      }
      await env.DB.batch([
        env.DB.prepare(`UPDATE sites SET name=?,phone=?,zalo=?,facebook=? WHERE id=?`).bind(b.name || site.name, b.phone || "", b.zalo || "", b.facebook || "", site.id),
        env.DB.prepare(`INSERT INTO site_public_settings(site_id,contact_email,settings_json,seo_title,seo_description,seo_og_image,seo_index,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
     ON CONFLICT(site_id) DO UPDATE SET contact_email=excluded.contact_email,settings_json=excluded.settings_json,seo_title=excluded.seo_title,seo_description=excluded.seo_description,seo_og_image=excluded.seo_og_image,seo_index=excluded.seo_index,updated_at=CURRENT_TIMESTAMP`).bind(site.id, publicEmail, JSON.stringify(clean), seoTitle, seoDescription, seoOgImage, seoIndex)
      ]);
      await env.DB.prepare(`UPDATE sites SET email=? WHERE id=?`).bind(publicEmail, site.id).run();
      return json({ ok: true, email: publicEmail, template_settings: clean, seo_title: seoTitle, seo_description: seoDescription, seo_og_image: seoOgImage, seo_index: seoIndex });
    }
    if (route === "password" && request.method === "PUT") {
      const b = await body(request), old = await sha256(b.old_password || "");
      if (old !== user.password_hash) return json({ error: "M\u1EADt kh\u1EA9u hi\u1EC7n t\u1EA1i kh\xF4ng \u0111\xFAng" }, 400);
      if ((b.new_password || "").length < 8) return json({ error: "M\u1EADt kh\u1EA9u m\u1EDBi ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 8 k\xFD t\u1EF1" }, 400);
      await env.DB.prepare(`UPDATE users SET password_hash=? WHERE id=?`).bind(await sha256(b.new_password), user.id).run();
      return json({ ok: true });
    }
    if (route === "stats") {
      const [postAgg, pvAgg, topRows] = await env.DB.batch([
        env.DB.prepare(`SELECT coalesce(sum(views),0) all_views FROM posts WHERE site_id=? AND status='published'`).bind(site.id),
        env.DB.prepare(`SELECT coalesce(sum(CASE WHEN created_at>=datetime('now','-7 day') THEN 1 ELSE 0 END),0) last7,count(*) last30 FROM pageviews WHERE site_id=? AND created_at>=datetime('now','-30 day')`).bind(site.id),
        env.DB.prepare(`SELECT title,views FROM posts WHERE site_id=? ORDER BY views DESC LIMIT 10`).bind(site.id)
      ]);
      const pr = postAgg?.results?.[0] || {}, vr = pvAgg?.results?.[0] || {};
      return json({ all: Number(pr.all_views || 0), last7: Number(vr.last7 || 0), last30: Number(vr.last30 || 0), top: topRows?.results || [] });
    }
    return json({ error: "API kh\xF4ng t\u1ED3n t\u1EA1i" }, 404);
  } catch (e) {
    return json({ error: e.message || String(e) }, 500);
  }
}
__name(onRequest, "onRequest");
async function registryDomainInfo(domain) {
  domain = normalizeDomain(domain);
  if (!domain) return { ok: false, error: "T\xEAn mi\u1EC1n kh\xF4ng h\u1EE3p l\u1EC7" };
  try {
    const tld = domain.split(".").pop(), boot = await fetch("https://data.iana.org/rdap/dns.json", { headers: { "Accept": "application/json" } });
    if (!boot.ok) return { ok: false, error: "Kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c RDAP bootstrap" };
    const bd = await boot.json();
    let base = "";
    for (const svc of bd.services || []) if ((svc[0] || []).map((x) => String(x).toLowerCase()).includes(tld)) {
      base = (svc[1] || [])[0] || "";
      break;
    }
    const known = { com: "https://rdap.verisign.com/com/v1/", net: "https://rdap.verisign.com/net/v1/", org: "https://rdap.publicinterestregistry.org/rdap/" };
    base = base || known[tld] || "";
    if (!base) return { ok: false, error: "Ch\u01B0a h\u1ED7 tr\u1EE3 \u0111u\xF4i ." + tld };
    const r = await fetch(base.replace(/\/?$/, "/") + "domain/" + encodeURIComponent(domain), { headers: { "Accept": "application/rdap+json, application/json" } });
    if (r.status === 404) return { ok: false, available: true };
    if (!r.ok) return { ok: false, error: "Registry HTTP " + r.status };
    const d = await r.json(), ev = Array.isArray(d.events) ? d.events : [];
    const ed = /* @__PURE__ */ __name((names) => {
      for (const n of names) {
        const x = ev.find((e) => String(e.eventAction || "").toLowerCase() === n);
        if (x?.eventDate) return x.eventDate;
      }
      return null;
    }, "ed");
    let registrar = "";
    for (const e of d.entities || []) {
      if (!(e.roles || []).map((x) => String(x).toLowerCase()).includes("registrar")) continue;
      const fn = (e.vcardArray?.[1] || []).find((x) => x?.[0] === "fn");
      registrar = String(fn?.[3] || e.handle || "");
      break;
    }
    return { ok: true, available: false, registered_at: ed(["registration"]), expires_at: ed(["expiration", "expiry"]), registrar };
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
}
__name(registryDomainInfo, "registryDomainInfo");

// [[path]].js
var INDEX_HTML = `<!doctype html>
<html lang="vi" class="nr-template-booting">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style id="nrTemplateBootStyle">html.nr-template-booting{background:#fff}html.nr-template-booting body{visibility:hidden!important}html.nr-template-booting::before{content:"";position:fixed;inset:0;background:#fff;z-index:2147483646}html.nr-template-booting::after{content:"";position:fixed;left:50%;top:50%;width:30px;height:30px;margin:-15px 0 0 -15px;border:3px solid #e2e8f0;border-top-color:#1463ff;border-radius:50%;animation:nrTemplateBootSpin .75s linear infinite;z-index:2147483647}@keyframes nrTemplateBootSpin{to{transform:rotate(360deg)}}html.nr-template-booting.nr-template-boot-timeout::after{content:"Kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c giao di\u1EC7n. Vui l\xF2ng t\u1EA3i l\u1EA1i trang.";width:min(420px,calc(100vw - 40px));height:auto;margin:0;transform:translate(-50%,-50%);border:0;border-radius:12px;animation:none;text-align:center;color:#334155;font:700 15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}</style>
<script>window.__NR_BOOT_TIMEOUT__=setTimeout(function(){var r=document.documentElement;if(r.classList.contains('nr-template-booting'))r.classList.add('nr-template-boot-timeout')},12000);<\/script>
<title>NewsReal</title>
<meta name="description" content="C\u1ED5ng th\xF4ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n v\xE0 tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng">
<link rel="stylesheet" href="/assets/style.css?v=20.1.0">

<meta name="description" content="C\u1ED5ng th\xF4ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n, nh\xE0 \u0111\u1EA5t b\xE1n, cho thu\xEA v\xE0 tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng.">
<meta property="og:type" content="website">
<meta property="og:title" content="B\u1EA5t \u0111\u1ED9ng s\u1EA3n">
<meta property="og:description" content="Tin \u0111\u0103ng b\u1EA5t \u0111\u1ED9ng s\u1EA3n, mua b\xE1n, cho thu\xEA v\xE0 tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng.">
<meta property="og:image" content="">
<meta property="og:url" content="">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="theme-color" content="#ffffff">
</head>
<body>
<div class="topbar"><div class="wrap"><span id="topLeft">Tin t\u1EE9c & b\u1EA5t \u0111\u1ED9ng s\u1EA3n</span><span id="topContact">Hotline: \u2014 \xB7 Zalo: \u2014</span></div></div>

<header class="header">
  <div class="wrap">
    <a class="logo" href="/"><span id="brandLeft">NEWS</span><b id="brandRight">REAL</b></a>
    <nav class="nav">
      <a href="/">Trang ch\u1EE7</a>
      <a href="/bat-dong-san/">B\u1EA5t \u0111\u1ED9ng s\u1EA3n</a>
      <a href="/mua/">Mua</a>
      <a href="/ban/">B\xE1n</a>
      <a href="/cho-thue/">Cho thu\xEA</a>
      <details class="property-taxonomy-menu"><summary>Lo\u1EA1i B\u0110S</summary><div class="property-taxonomy-dropdown"><a href="/bat-dong-san/?property_type=Chung%20c\u01B0">C\u0103n h\u1ED9 / Chung c\u01B0</a><a href="/bat-dong-san/?property_type=Nh\xE0%20ri\xEAng">Nh\xE0 ri\xEAng</a><a href="/bat-dong-san/?property_type=Nh\xE0%20ph\u1ED1">Nh\xE0 m\u1EB7t ph\u1ED1</a><a href="/bat-dong-san/?property_type=Bi\u1EC7t%20th\u1EF1">Bi\u1EC7t th\u1EF1 / Li\u1EC1n k\u1EC1</a><a href="/bat-dong-san/?property_type=Shophouse">Shophouse / Nh\xE0 ph\u1ED1 th\u01B0\u01A1ng m\u1EA1i</a><a href="/bat-dong-san/?property_type=\u0110\u1EA5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</a><a href="/bat-dong-san/?property_type=\u0110\u1EA5t%20th\u1ED5%20c\u01B0">\u0110\u1EA5t th\u1ED5 c\u01B0</a><a href="/bat-dong-san/?property_type=Trang%20tr\u1EA1i">\u0110\u1EA5t n\xF4ng nghi\u1EC7p / Trang tr\u1EA1i</a><a href="/bat-dong-san/?property_type=V\u0103n%20ph\xF2ng">V\u0103n ph\xF2ng</a><a href="/bat-dong-san/?property_type=M\u1EB7t%20b\u1EB1ng%20kinh%20doanh">M\u1EB7t b\u1EB1ng kinh doanh</a><a href="/bat-dong-san/?property_type=Kho%20x\u01B0\u1EDFng">Kho / Nh\xE0 x\u01B0\u1EDFng</a><a href="/bat-dong-san/?property_type=B\u1EA5t%20\u0111\u1ED9ng%20s\u1EA3n%20c\xF4ng%20nghi\u1EC7p">B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\xF4ng nghi\u1EC7p</a><a href="/bat-dong-san/?property_type=Kh\xE1ch%20s\u1EA1n%20%2F%20Resort">Kh\xE1ch s\u1EA1n / Resort / Ngh\u1EC9 d\u01B0\u1EE1ng</a><a href="/bat-dong-san/?property_type=Officetel">Officetel / C\u0103n h\u1ED9 d\u1ECBch v\u1EE5</a><a href="/bat-dong-san/?property_type=Kh\xE1c">B\u1EA5t \u0111\u1ED9ng s\u1EA3n kh\xE1c</a></div></details>
      <a href="#news">Tin t\u1EE9c</a>
    </nav>
    <div class="actions">
      <a class="btn soft" href="/favorites">\u2665 Tin \u0111\xE3 l\u01B0u</a>
      <a class="btn primary" href="/admin?tab=newpost">+ \u0110\u0103ng tin</a>
      <button id="mobileMenuBtn" class="btn soft mobile-menu">\u2630</button>
    </div>
  </div>
</header>

<main>
<section class="hero-home"><div class="wrap">
  <div class="hero-grid">
    <div id="heroSlider" class="hero-slider">
      <div id="heroSlides"></div>
      
    </div>
    <div>
      <div class="side-title"><span>TIN \u0110\xC1NG CH\xDA \xDD</span><a href="#news">Xem t\u1EA5t c\u1EA3 \u2192</a></div>
      <div id="sideStack" class="side-stack"></div>
    </div>
  </div>

  <div class="searchbox">
    <div class="tabs">
      <button class="tab active" data-transaction="buy">Mua</button>
      <button class="tab" data-transaction="sale">B\xE1n</button>
      <button class="tab" data-transaction="rent">Cho thu\xEA</button>
      <button class="tab" data-transaction="">T\u1EA5t c\u1EA3</button>
    </div>
    <div class="filters">
      <input id="searchQ" class="input" placeholder="Nh\u1EADp t\u1EEB kh\xF3a, d\u1EF1 \xE1n, khu v\u1EF1c...">
      <select id="searchType" class="select"><option value="">Lo\u1EA1i b\u1EA5t \u0111\u1ED9ng s\u1EA3n</option><option value="Chung c\u01B0">C\u0103n h\u1ED9 / Chung c\u01B0</option><option value="Nh\xE0 ri\xEAng">Nh\xE0 ri\xEAng</option><option value="Nh\xE0 ph\u1ED1">Nh\xE0 m\u1EB7t ph\u1ED1</option><option value="Bi\u1EC7t th\u1EF1">Bi\u1EC7t th\u1EF1 / Li\u1EC1n k\u1EC1</option><option value="Shophouse">Shophouse / Nh\xE0 ph\u1ED1 th\u01B0\u01A1ng m\u1EA1i</option><option value="\u0110\u1EA5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</option><option value="\u0110\u1EA5t th\u1ED5 c\u01B0">\u0110\u1EA5t th\u1ED5 c\u01B0</option><option value="Trang tr\u1EA1i">\u0110\u1EA5t n\xF4ng nghi\u1EC7p / Trang tr\u1EA1i</option><option value="V\u0103n ph\xF2ng">V\u0103n ph\xF2ng</option><option value="M\u1EB7t b\u1EB1ng kinh doanh">M\u1EB7t b\u1EB1ng kinh doanh</option><option value="Kho x\u01B0\u1EDFng">Kho / Nh\xE0 x\u01B0\u1EDFng</option><option value="B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\xF4ng nghi\u1EC7p">B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\xF4ng nghi\u1EC7p</option><option value="Kh\xE1ch s\u1EA1n / Resort">Kh\xE1ch s\u1EA1n / Resort / Ngh\u1EC9 d\u01B0\u1EE1ng</option><option value="Officetel">Officetel / C\u0103n h\u1ED9 d\u1ECBch v\u1EE5</option><option value="Kh\xE1c">B\u1EA5t \u0111\u1ED9ng s\u1EA3n kh\xE1c</option></select>
      <select id="searchProvince" class="select"><option value="">T\u1EC9nh / Th\xE0nh ph\u1ED1</option></select>
      <select id="searchDistrict" class="select"><option value="">Qu\u1EADn / Huy\u1EC7n</option></select>
      <select id="searchPrice" class="select">
        <option value="">Kho\u1EA3ng gi\xE1</option>
        <option value="duoi-2">D\u01B0\u1EDBi 2 t\u1EF7</option>
        <option value="2-5">2 - 5 t\u1EF7</option>
        <option value="5-10">5 - 10 t\u1EF7</option>
        <option value="tren-10">Tr\xEAn 10 t\u1EF7</option>
      </select>
      <button class="btn primary" id="searchBtn">T\xECm ki\u1EBFm</button>
    </div>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="section-head">
    <div><small class="section-kicker">B\u1EA4T \u0110\u1ED8NG S\u1EA2N</small><h2>Tin \u0111\u0103ng m\u1EDBi nh\u1EA5t</h2><p>Tin \u0111\u0103ng m\u1EDBi, tr\xECnh b\xE0y g\u1ECDn \u0111\u1EC3 ng\u01B0\u1EDDi xem so s\xE1nh nhanh.</p></div>
    <a href="/bat-dong-san/">Xem t\u1EA5t c\u1EA3 \u2192</a>
  </div>
  <div id="propertyCards" class="cards"></div>
</div></section>


<section class="section category-links-section"><div class="wrap">
  <div class="section-head">
    <div><small class="section-kicker">DANH M\u1EE4C NH\xC0 \u0110\u1EA4T</small><h2>T\xECm nhanh theo nhu c\u1EA7u</h2><p>C\xE1c nh\xF3m ph\u1ED5 bi\u1EBFn, \u0111\u1EE7 d\xF9ng nh\u01B0ng kh\xF4ng qu\xE1 r\u1ED1i.</p></div>
  </div>
  <div class="category-link-grid">
    <a href="/ban/?property_type=Chung%20c\u01B0"><b>B\xE1n c\u0103n h\u1ED9 chung c\u01B0</b><span>C\u0103n h\u1ED9, studio, duplex</span></a>
    <a href="/ban/?property_type=Nh\xE0%20ph\u1ED1"><b>B\xE1n nh\xE0 \u0111\u1EA5t</b><span>Nh\xE0 ph\u1ED1, nh\xE0 ri\xEAng, bi\u1EC7t th\u1EF1</span></a>
    <a href="/cho-thue/"><b>Cho thu\xEA nh\xE0</b><span>Nh\xE0 \u1EDF, c\u0103n h\u1ED9, ph\xF2ng</span></a>
    <a href="/listings?property_type=Kho x\u01B0\u1EDFng"><b>Kho x\u01B0\u1EDFng & m\u1EB7t b\u1EB1ng</b><span>Kho, x\u01B0\u1EDFng, v\u0103n ph\xF2ng, c\u1EEDa h\xE0ng</span></a>
    <a href="/listings?property_type=\u0110\u1EA5t"><b>\u0110\u1EA5t n\u1EC1n & \u0111\u1EA5t d\u1EF1 \xE1n</b><span>\u0110\u1EA5t \u1EDF, \u0111\u1EA5t n\u1EC1n, \u0111\u1EA5t \u0111\u1EA7u t\u01B0</span></a>
  </div>
</div></section>

<section class="section category-section" id="categories"><div class="wrap">
  <div class="category-block square-block">
    <div class="category-heading">
      <div><span class="category-icon">\u{1F3E2}</span><div><small>CHUY\xCAN M\u1EE4C 01</small><h3>B\xE1n c\u0103n h\u1ED9 chung c\u01B0</h3></div></div>
      <a href="/ban/?property_type=Chung%20c\u01B0">Xem t\u1EA5t c\u1EA3 \u2192</a>
    </div>
    <div id="apartmentCards" class="cards"></div>
  </div>

  <div class="category-block square-block">
    <div class="category-heading">
      <div><span class="category-icon">\u{1F3E0}</span><div><small>CHUY\xCAN M\u1EE4C 02</small><h3>B\xE1n nh\xE0 \u0111\u1EA5t</h3></div></div>
      <a href="/ban/">Xem t\u1EA5t c\u1EA3 \u2192</a>
    </div>
    <div id="saleCards" class="cards"></div>
  </div>

  <div class="category-block square-block">
    <div class="category-heading">
      <div><span class="category-icon">\u{1F511}</span><div><small>CHUY\xCAN M\u1EE4C 03</small><h3>Cho thu\xEA nh\xE0</h3></div></div>
      <a href="/cho-thue/">Xem t\u1EA5t c\u1EA3 \u2192</a>
    </div>
    <div id="rentCards" class="cards"></div>
  </div>

  <div class="category-block square-block">
    <div class="category-heading">
      <div><span class="category-icon">\u{1F3ED}</span><div><small>CHUY\xCAN M\u1EE4C 04</small><h3>Kho x\u01B0\u1EDFng & m\u1EB7t b\u1EB1ng</h3></div></div>
      <a href="/listings?property_type=Kho x\u01B0\u1EDFng">Xem t\u1EA5t c\u1EA3 \u2192</a>
    </div>
    <div id="warehouseCards" class="cards"></div>
  </div>

  <div class="category-block square-block">
    <div class="category-heading">
      <div><span class="category-icon">\u{1F33F}</span><div><small>CHUY\xCAN M\u1EE4C 05</small><h3>\u0110\u1EA5t n\u1EC1n & \u0111\u1EA5t d\u1EF1 \xE1n</h3></div></div>
      <a href="/listings?property_type=\u0110\u1EA5t">Xem t\u1EA5t c\u1EA3 \u2192</a>
    </div>
    <div id="landCards" class="cards"></div>
  </div>
</div></section>

<section class="section news-home-section" id="news"><div class="wrap">
  <div class="section-head">
    <div><small class="section-kicker">TIN T\u1EE8C</small><h2>Tin th\u1ECB tr\u01B0\u1EDDng & ki\u1EBFn th\u1EE9c</h2><p>Th\xF4ng tin h\u1ED7 tr\u1EE3 ng\u01B0\u1EDDi mua, ng\u01B0\u1EDDi b\xE1n v\xE0 nh\xE0 \u0111\u1EA7u t\u01B0.</p></div>
  </div>
  <div class="news-grid">
    <div id="newsLead"></div>
    <div id="newsList" class="news-list"></div>
  </div>
</div></section>
</main>

<footer class="footer public-footer"><div class="wrap public-footer-grid">
  <div class="footer-about"><div class="brand footer-logo"><span data-footer-brand>NEWSREAL</span></div><p class="footer-desc">K\xEAnh th\xF4ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n, mua b\xE1n v\xE0 cho thu\xEA v\u1EDBi n\u1ED9i dung r\xF5 r\xE0ng, d\u1EC5 t\xECm ki\u1EBFm v\xE0 thu\u1EADn ti\u1EC7n li\xEAn h\u1EC7.</p><div class="footer-contact-list"><a data-footer-phone href="#">\u260E Hotline: \u2014</a><a data-footer-zalo href="#" target="_blank" rel="noopener">\u{1F4AC} Zalo: \u2014</a><a data-footer-email href="#">\u2709 Email: \u2014</a></div></div>
  <div><h4>B\u1EA5t \u0111\u1ED9ng s\u1EA3n</h4><a href="/mua/">C\u1EA7n mua</a><a href="/ban/">Nh\xE0 \u0111\u1EA5t b\xE1n</a><a href="/cho-thue/">Nh\xE0 \u0111\u1EA5t cho thu\xEA</a><a href="/listings?property_type=Chung%20c\u01B0">C\u0103n h\u1ED9 / Chung c\u01B0</a><a href="/listings?property_type=\u0110\u1EA5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</a></div>
  <div><h4>Kh\xE1m ph\xE1</h4><a href="/">Trang ch\u1EE7</a><a href="/#news">Tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng</a><a href="/favorites">Tin \u0111\xE3 l\u01B0u</a><a href="/admin?tab=newpost">\u0110\u0103ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n</a></div>
  <div><h4>Th\xF4ng tin & h\u1ED7 tr\u1EE3</h4><p class="footer-note">C\u1EA7n t\u01B0 v\u1EA5n \u0111\u0103ng tin ho\u1EB7c t\xECm b\u1EA5t \u0111\u1ED9ng s\u1EA3n ph\xF9 h\u1EE3p? Li\xEAn h\u1EC7 tr\u1EF1c ti\u1EBFp \u0111\u1EC3 \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3.</p><a href="/admin">Qu\u1EA3n tr\u1ECB website</a><a href="https://www.facebook.com/groups/batdongsanhaiphong2021" target="_blank" rel="noopener">C\u1ED9ng \u0111\u1ED3ng Facebook \u2197</a></div>
</div><div class="footer-bottom"><div class="wrap"><span>\xA9 2026 <b data-footer-brand>NEWSREAL</b>. N\u1ED9i dung thu\u1ED9c website.</span><span>Powered by NEWSREAL \xB7 HO\xC0NG V\u01AF\u01A0NG TECH</span></div></div></footer>

<script src="/assets/site.js?v=20.4.2"><\/script>
</body>
</html>`;
var LISTINGS_HTML = '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Danh s\xE1ch b\u1EA5t \u0111\u1ED9ng s\u1EA3n</title><link rel="stylesheet" href="/assets/style.css?v=1788174900">\n<meta name="description" content="C\u1ED5ng th\xF4ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n, nh\xE0 \u0111\u1EA5t b\xE1n, cho thu\xEA v\xE0 tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng.">\n<meta property="og:type" content="website">\n<meta property="og:title" content="B\u1EA5t \u0111\u1ED9ng s\u1EA3n">\n<meta property="og:description" content="Tin \u0111\u0103ng b\u1EA5t \u0111\u1ED9ng s\u1EA3n, mua b\xE1n, cho thu\xEA v\xE0 tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng.">\n<meta property="og:image" content="">\n<meta property="og:url" content="">\n<meta name="twitter:card" content="summary_large_image">\n<link rel="canonical" href="">\n  <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">\n  <meta name="msapplication-TileColor" content="#ffffff">\n  <meta name="theme-color" content="#ffffff">\n</head><body>\n<div class="top-strip"><div class="wrap"><span>B\u1EA5t \u0111\u1ED9ng s\u1EA3n</span><span id="topContact">Hotline: \u2014</span></div></div>\n<header class="header"><div class="wrap nav"><a class="brand" href="/"><b id="brandName">NEWSREAL</b></a><nav id="mainNav"><a href="/">Trang ch\u1EE7</a><a href="/mua/">Mua</a><a href="/ban/">B\xE1n</a><a href="/cho-thue/">Cho thu\xEA</a><details class="property-taxonomy-menu"><summary>Lo\u1EA1i B\u0110S</summary><div class="property-taxonomy-dropdown"><a href="/bat-dong-san/?property_type=Chung%20c%C6%B0">C\u0103n h\u1ED9 / Chung c\u01B0</a><a href="/bat-dong-san/?property_type=Nh%C3%A0%20ri%C3%AAng">Nh\xE0 ri\xEAng</a><a href="/bat-dong-san/?property_type=Nh%C3%A0%20tr%E1%BB%8D">Nh\xE0 tr\u1ECD / Ph\xF2ng tr\u1ECD</a><a href="/bat-dong-san/?property_type=Nh%C3%A0%20ph%E1%BB%91">Nh\xE0 m\u1EB7t ph\u1ED1</a><a href="/bat-dong-san/?property_type=Bi%E1%BB%87t%20th%E1%BB%B1">Bi\u1EC7t th\u1EF1 / Li\u1EC1n k\u1EC1</a><a href="/bat-dong-san/?property_type=Shophouse">Shophouse / Nh\xE0 ph\u1ED1 th\u01B0\u01A1ng m\u1EA1i</a><a href="/bat-dong-san/?property_type=%C4%90%E1%BA%A5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</a><a href="/bat-dong-san/?property_type=%C4%90%E1%BA%A5t%20th%E1%BB%95%20c%C6%B0">\u0110\u1EA5t th\u1ED5 c\u01B0</a><a href="/bat-dong-san/?property_type=Trang%20tr%E1%BA%A1i">\u0110\u1EA5t n\xF4ng nghi\u1EC7p / Trang tr\u1EA1i</a><a href="/bat-dong-san/?property_type=V%C4%83n%20ph%C3%B2ng">V\u0103n ph\xF2ng</a><a href="/bat-dong-san/?property_type=M%E1%BA%B7t%20b%E1%BA%B1ng%20kinh%20doanh">M\u1EB7t b\u1EB1ng kinh doanh</a><a href="/bat-dong-san/?property_type=Kho%20x%C6%B0%E1%BB%9Fng">Kho / Nh\xE0 x\u01B0\u1EDFng</a><a href="/bat-dong-san/?property_type=B%E1%BA%A5t%20%C4%91%E1%BB%99ng%20s%E1%BA%A3n%20c%C3%B4ng%20nghi%E1%BB%87p">B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\xF4ng nghi\u1EC7p</a><a href="/bat-dong-san/?property_type=Kh%C3%A1ch%20s%E1%BA%A1n%20/%20Resort">Kh\xE1ch s\u1EA1n / Resort / Ngh\u1EC9 d\u01B0\u1EE1ng</a><a href="/bat-dong-san/?property_type=Officetel">Officetel / C\u0103n h\u1ED9 d\u1ECBch v\u1EE5</a><a href="/bat-dong-san/?property_type=Kh%C3%A1c">B\u1EA5t \u0111\u1ED9ng s\u1EA3n kh\xE1c</a></div></details><a href="/favorites">Tin \u0111\xE3 l\u01B0u</a></nav><a class="btn header-post-btn" href="/admin?tab=newpost">+ \u0110\u0103ng tin</a><button id="menuToggle" class="menu-toggle" aria-label="M\u1EDF menu">\u2630</button></div></header>\n<main class="section listings-page"><div class="wrap"><div class="breadcrumb"><a href="/">Trang ch\u1EE7</a> / Danh s\xE1ch b\u1EA5t \u0111\u1ED9ng s\u1EA3n</div>\n<div class="section-head listings-title"><div><span class="eyebrow">B\u1EA4T \u0110\u1ED8NG S\u1EA2N</span><h2 id="listTitle">Danh s\xE1ch tin</h2><p id="resultCount"></p></div><button id="filterToggle" class="btn ghost filter-toggle">\u2637 B\u1ED9 l\u1ECDc</button></div>\n<section id="filterPanel" class="panel listing-filter-panel"><div class="filters listing-filters">\n<input id="fq" placeholder="T\u1EEB kh\xF3a, d\u1EF1 \xE1n, khu v\u1EF1c">\n<select id="ftransaction"><option value="">Mua / B\xE1n / Cho thu\xEA</option><option value="buy">Mua</option><option value="sale">B\xE1n</option><option value="rent">Cho thu\xEA</option></select>\n<select id="ftype"><option value="">Lo\u1EA1i B\u0110S</option><option value="Chung c\u01B0">C\u0103n h\u1ED9 / Chung c\u01B0</option><option value="Nh\xE0 ri\xEAng">Nh\xE0 ri\xEAng</option><option value="Nh\xE0 ph\u1ED1">Nh\xE0 m\u1EB7t ph\u1ED1</option><option value="Bi\u1EC7t th\u1EF1">Bi\u1EC7t th\u1EF1 / Li\u1EC1n k\u1EC1</option><option value="Shophouse">Shophouse / Nh\xE0 ph\u1ED1 th\u01B0\u01A1ng m\u1EA1i</option><option value="\u0110\u1EA5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</option><option value="\u0110\u1EA5t th\u1ED5 c\u01B0">\u0110\u1EA5t th\u1ED5 c\u01B0</option><option value="Trang tr\u1EA1i">\u0110\u1EA5t n\xF4ng nghi\u1EC7p / Trang tr\u1EA1i</option><option value="V\u0103n ph\xF2ng">V\u0103n ph\xF2ng</option><option value="M\u1EB7t b\u1EB1ng kinh doanh">M\u1EB7t b\u1EB1ng kinh doanh</option><option value="Kho x\u01B0\u1EDFng">Kho / Nh\xE0 x\u01B0\u1EDFng</option><option value="B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\xF4ng nghi\u1EC7p">B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\xF4ng nghi\u1EC7p</option><option value="Kh\xE1ch s\u1EA1n / Resort">Kh\xE1ch s\u1EA1n / Resort / Ngh\u1EC9 d\u01B0\u1EE1ng</option><option value="Officetel">Officetel / C\u0103n h\u1ED9 d\u1ECBch v\u1EE5</option><option value="Kh\xE1c">B\u1EA5t \u0111\u1ED9ng s\u1EA3n kh\xE1c</option></select>\n<input id="fprovince" placeholder="T\u1EC9nh/Th\xE0nh ph\u1ED1"><input id="fdistrict" placeholder="Qu\u1EADn/Huy\u1EC7n">\n<select id="fprice"><option value="">Kho\u1EA3ng gi\xE1</option></select>\n<select id="fbed"><option value="">Ph\xF2ng ng\u1EE7</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select>\n<button class="btn" onclick="applyFilters()">\xC1p d\u1EE5ng</button><button class="btn ghost" onclick="resetFilters()">X\xF3a l\u1ECDc</button>\n</div></section>\n<div id="listingGrid" class="listing-grid listing-grid-wide"></div></div></main>\n<footer class="footer public-footer"><div class="wrap public-footer-grid">\n  <div class="footer-about"><div class="brand footer-logo"><span data-footer-brand>NEWSREAL</span></div><p class="footer-desc">K\xEAnh th\xF4ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n, mua b\xE1n v\xE0 cho thu\xEA v\u1EDBi n\u1ED9i dung r\xF5 r\xE0ng, d\u1EC5 t\xECm ki\u1EBFm v\xE0 thu\u1EADn ti\u1EC7n li\xEAn h\u1EC7.</p><div class="footer-contact-list"><a data-footer-phone href="#">\u260E Hotline: \u2014</a><a data-footer-zalo href="#" target="_blank" rel="noopener">\u{1F4AC} Zalo: \u2014</a><a data-footer-email href="#">\u2709 Email: \u2014</a></div></div>\n  <div><h4>B\u1EA5t \u0111\u1ED9ng s\u1EA3n</h4><a href="/mua/">C\u1EA7n mua</a><a href="/ban/">Nh\xE0 \u0111\u1EA5t b\xE1n</a><a href="/cho-thue/">Nh\xE0 \u0111\u1EA5t cho thu\xEA</a><a href="/listings?property_type=Chung%20c\u01B0">C\u0103n h\u1ED9 / Chung c\u01B0</a><a href="/listings?property_type=\u0110\u1EA5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</a></div>\n  <div><h4>Kh\xE1m ph\xE1</h4><a href="/">Trang ch\u1EE7</a><a href="/#news">Tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng</a><a href="/favorites">Tin \u0111\xE3 l\u01B0u</a><a href="/admin?tab=newpost">\u0110\u0103ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n</a></div>\n  <div><h4>Th\xF4ng tin & h\u1ED7 tr\u1EE3</h4><p class="footer-note">C\u1EA7n t\u01B0 v\u1EA5n \u0111\u0103ng tin ho\u1EB7c t\xECm b\u1EA5t \u0111\u1ED9ng s\u1EA3n ph\xF9 h\u1EE3p? Li\xEAn h\u1EC7 tr\u1EF1c ti\u1EBFp \u0111\u1EC3 \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3.</p><a href="/admin">Qu\u1EA3n tr\u1ECB website</a><a href="https://www.facebook.com/groups/batdongsanhaiphong2021" target="_blank" rel="noopener">C\u1ED9ng \u0111\u1ED3ng Facebook \u2197</a></div>\n</div><div class="footer-bottom"><div class="wrap"><span>\xA9 2026 <b data-footer-brand>NEWSREAL</b>. N\u1ED9i dung thu\u1ED9c website.</span><span>Powered by NEWSREAL \xB7 HO\xC0NG V\u01AF\u01A0NG TECH</span></div></div></footer>\n<script src="/assets/listings.js?v=1788135100"><\/script></body></html>';
var PROPERTY_HTML = '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chi ti\u1EBFt b\xE0i vi\u1EBFt</title><link rel="stylesheet" href="/assets/style.css?v=1788174900">\n<meta name="description" content="C\u1ED5ng th\xF4ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n, nh\xE0 \u0111\u1EA5t b\xE1n, cho thu\xEA v\xE0 tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng.">\n<meta property="og:type" content="website">\n<meta property="og:title" content="B\u1EA5t \u0111\u1ED9ng s\u1EA3n">\n<meta property="og:description" content="Tin \u0111\u0103ng b\u1EA5t \u0111\u1ED9ng s\u1EA3n, mua b\xE1n, cho thu\xEA v\xE0 tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng.">\n<meta property="og:image" content="">\n<meta property="og:url" content="">\n<meta name="twitter:card" content="summary_large_image">\n<link rel="canonical" href="">\n  <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">\n  <meta name="msapplication-TileColor" content="#ffffff">\n  <meta name="theme-color" content="#ffffff">\n</head><body>\n<div class="top-strip"><div class="wrap"><span id="detailTypeLabel">Chi ti\u1EBFt b\xE0i vi\u1EBFt</span><span id="topContact">Hotline: \u2014</span></div></div>\n<header class="header"><div class="wrap nav"><a class="brand" href="/"><b id="brandName">NEWSREAL</b></a><nav id="detailNav"><a href="/">Trang ch\u1EE7</a><a href="/mua/">Mua</a><a href="/ban/">B\xE1n</a><a href="/cho-thue/">Cho thu\xEA</a><details class="property-taxonomy-menu"><summary>Lo\u1EA1i B\u0110S</summary><div class="property-taxonomy-dropdown"><a href="/bat-dong-san/?property_type=Chung%20c%C6%B0">C\u0103n h\u1ED9 / Chung c\u01B0</a><a href="/bat-dong-san/?property_type=Nh%C3%A0%20ri%C3%AAng">Nh\xE0 ri\xEAng</a><a href="/bat-dong-san/?property_type=Nh%C3%A0%20tr%E1%BB%8D">Nh\xE0 tr\u1ECD / Ph\xF2ng tr\u1ECD</a><a href="/bat-dong-san/?property_type=Nh%C3%A0%20ph%E1%BB%91">Nh\xE0 m\u1EB7t ph\u1ED1</a><a href="/bat-dong-san/?property_type=Bi%E1%BB%87t%20th%E1%BB%B1">Bi\u1EC7t th\u1EF1 / Li\u1EC1n k\u1EC1</a><a href="/bat-dong-san/?property_type=Shophouse">Shophouse / Nh\xE0 ph\u1ED1 th\u01B0\u01A1ng m\u1EA1i</a><a href="/bat-dong-san/?property_type=%C4%90%E1%BA%A5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</a><a href="/bat-dong-san/?property_type=%C4%90%E1%BA%A5t%20th%E1%BB%95%20c%C6%B0">\u0110\u1EA5t th\u1ED5 c\u01B0</a><a href="/bat-dong-san/?property_type=Trang%20tr%E1%BA%A1i">\u0110\u1EA5t n\xF4ng nghi\u1EC7p / Trang tr\u1EA1i</a><a href="/bat-dong-san/?property_type=V%C4%83n%20ph%C3%B2ng">V\u0103n ph\xF2ng</a><a href="/bat-dong-san/?property_type=M%E1%BA%B7t%20b%E1%BA%B1ng%20kinh%20doanh">M\u1EB7t b\u1EB1ng kinh doanh</a><a href="/bat-dong-san/?property_type=Kho%20x%C6%B0%E1%BB%9Fng">Kho / Nh\xE0 x\u01B0\u1EDFng</a><a href="/bat-dong-san/?property_type=B%E1%BA%A5t%20%C4%91%E1%BB%99ng%20s%E1%BA%A3n%20c%C3%B4ng%20nghi%E1%BB%87p">B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\xF4ng nghi\u1EC7p</a><a href="/bat-dong-san/?property_type=Kh%C3%A1ch%20s%E1%BA%A1n%20/%20Resort">Kh\xE1ch s\u1EA1n / Resort / Ngh\u1EC9 d\u01B0\u1EE1ng</a><a href="/bat-dong-san/?property_type=Officetel">Officetel / C\u0103n h\u1ED9 d\u1ECBch v\u1EE5</a><a href="/bat-dong-san/?property_type=Kh%C3%A1c">B\u1EA5t \u0111\u1ED9ng s\u1EA3n kh\xE1c</a></div></details><a href="/favorites">Tin \u0111\xE3 l\u01B0u</a></nav><a class="btn header-post-btn" href="/admin?tab=newpost">+ \u0110\u0103ng tin</a><button id="detailMenuToggle" class="menu-toggle">\u2630</button></div></header>\n<main class="property-page"><div class="wrap"><div class="breadcrumb"><a href="/">Trang ch\u1EE7</a> / <a id="breadcrumbSection" href="/bat-dong-san/">B\u1EA5t \u0111\u1ED9ng s\u1EA3n</a> / <span id="crumb">Chi ti\u1EBFt</span></div><div id="propertyRoot">\u0110ang t\u1EA3i...</div></div></main>\n<footer class="footer public-footer"><div class="wrap public-footer-grid">\n  <div class="footer-about"><div class="brand footer-logo"><span data-footer-brand>NEWSREAL</span></div><p class="footer-desc">K\xEAnh th\xF4ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n, mua b\xE1n v\xE0 cho thu\xEA v\u1EDBi n\u1ED9i dung r\xF5 r\xE0ng, d\u1EC5 t\xECm ki\u1EBFm v\xE0 thu\u1EADn ti\u1EC7n li\xEAn h\u1EC7.</p><div class="footer-contact-list"><a data-footer-phone href="#">\u260E Hotline: \u2014</a><a data-footer-zalo href="#" target="_blank" rel="noopener">\u{1F4AC} Zalo: \u2014</a><a data-footer-email href="#">\u2709 Email: \u2014</a></div></div>\n  <div><h4>B\u1EA5t \u0111\u1ED9ng s\u1EA3n</h4><a href="/mua/">C\u1EA7n mua</a><a href="/ban/">Nh\xE0 \u0111\u1EA5t b\xE1n</a><a href="/cho-thue/">Nh\xE0 \u0111\u1EA5t cho thu\xEA</a><a href="/listings?property_type=Chung%20c\u01B0">C\u0103n h\u1ED9 / Chung c\u01B0</a><a href="/listings?property_type=\u0110\u1EA5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</a></div>\n  <div><h4>Kh\xE1m ph\xE1</h4><a href="/">Trang ch\u1EE7</a><a href="/#news">Tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng</a><a href="/favorites">Tin \u0111\xE3 l\u01B0u</a><a href="/admin?tab=newpost">\u0110\u0103ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n</a></div>\n  <div><h4>Th\xF4ng tin & h\u1ED7 tr\u1EE3</h4><p class="footer-note">C\u1EA7n t\u01B0 v\u1EA5n \u0111\u0103ng tin ho\u1EB7c t\xECm b\u1EA5t \u0111\u1ED9ng s\u1EA3n ph\xF9 h\u1EE3p? Li\xEAn h\u1EC7 tr\u1EF1c ti\u1EBFp \u0111\u1EC3 \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3.</p><a href="/admin">Qu\u1EA3n tr\u1ECB website</a><a href="https://www.facebook.com/groups/batdongsanhaiphong2021" target="_blank" rel="noopener">C\u1ED9ng \u0111\u1ED3ng Facebook \u2197</a></div>\n</div><div class="footer-bottom"><div class="wrap"><span>\xA9 2026 <b data-footer-brand>NEWSREAL</b>. N\u1ED9i dung thu\u1ED9c website.</span><span>Powered by NEWSREAL \xB7 HO\xC0NG V\u01AF\u01A0NG TECH</span></div></div></footer>\n<script src="/assets/property.js?v=1788135100"><\/script></body></html>';
var FAVORITES_HTML = '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tin \u0111\xE3 l\u01B0u</title><meta name="robots" content="noindex,follow"><link rel="stylesheet" href="/assets/style.css?v=1788174900">  <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">\n  <meta name="msapplication-TileColor" content="#ffffff">\n  <meta name="theme-color" content="#ffffff">\n</head><body>\n<header class="header"><div class="wrap nav"><a class="brand" href="/"><b id="brandName">NEWSREAL</b></a><nav id="favoritesNav"><a href="/">Trang ch\u1EE7</a><a href="/bat-dong-san/">B\u1EA5t \u0111\u1ED9ng s\u1EA3n</a><a href="/mua/">Mua</a><a href="/ban/">B\xE1n</a><a href="/cho-thue/">Cho thu\xEA</a></nav><button id="favoritesMenuToggle" class="menu-toggle" aria-label="M\u1EDF menu">\u2630</button></div></header>\n<main class="section"><div class="wrap"><div class="section-head"><div><span class="eyebrow">Y\xCAU TH\xCDCH</span><h2>Tin \u0111\xE3 l\u01B0u</h2><p>C\xE1c b\u1EA5t \u0111\u1ED9ng s\u1EA3n b\u1EA1n \u0111\xE3 l\u01B0u tr\xEAn tr\xECnh duy\u1EC7t n\xE0y.</p></div></div><div id="favGrid" class="listing-grid"></div></div></main>\n<footer class="footer public-footer"><div class="wrap public-footer-grid">\n  <div class="footer-about"><div class="brand footer-logo"><span data-footer-brand>NEWSREAL</span></div><p class="footer-desc">K\xEAnh th\xF4ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n, mua b\xE1n v\xE0 cho thu\xEA v\u1EDBi n\u1ED9i dung r\xF5 r\xE0ng, d\u1EC5 t\xECm ki\u1EBFm v\xE0 thu\u1EADn ti\u1EC7n li\xEAn h\u1EC7.</p><div class="footer-contact-list"><a data-footer-phone href="#">\u260E Hotline: \u2014</a><a data-footer-zalo href="#" target="_blank" rel="noopener">\u{1F4AC} Zalo: \u2014</a><a data-footer-email href="#">\u2709 Email: \u2014</a></div></div>\n  <div><h4>B\u1EA5t \u0111\u1ED9ng s\u1EA3n</h4><a href="/mua/">C\u1EA7n mua</a><a href="/ban/">Nh\xE0 \u0111\u1EA5t b\xE1n</a><a href="/cho-thue/">Nh\xE0 \u0111\u1EA5t cho thu\xEA</a><a href="/listings?property_type=Chung%20c\u01B0">C\u0103n h\u1ED9 / Chung c\u01B0</a><a href="/listings?property_type=\u0110\u1EA5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</a></div>\n  <div><h4>Kh\xE1m ph\xE1</h4><a href="/">Trang ch\u1EE7</a><a href="/#news">Tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng</a><details class="property-taxonomy-menu"><summary>Lo\u1EA1i B\u0110S</summary><div class="property-taxonomy-dropdown"><a href="/bat-dong-san/?property_type=Chung%20c%C6%B0">C\u0103n h\u1ED9 / Chung c\u01B0</a><a href="/bat-dong-san/?property_type=Nh%C3%A0%20ri%C3%AAng">Nh\xE0 ri\xEAng</a><a href="/bat-dong-san/?property_type=Nh%C3%A0%20tr%E1%BB%8D">Nh\xE0 tr\u1ECD / Ph\xF2ng tr\u1ECD</a><a href="/bat-dong-san/?property_type=Nh%C3%A0%20ph%E1%BB%91">Nh\xE0 m\u1EB7t ph\u1ED1</a><a href="/bat-dong-san/?property_type=Bi%E1%BB%87t%20th%E1%BB%B1">Bi\u1EC7t th\u1EF1 / Li\u1EC1n k\u1EC1</a><a href="/bat-dong-san/?property_type=Shophouse">Shophouse / Nh\xE0 ph\u1ED1 th\u01B0\u01A1ng m\u1EA1i</a><a href="/bat-dong-san/?property_type=%C4%90%E1%BA%A5t">\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n</a><a href="/bat-dong-san/?property_type=%C4%90%E1%BA%A5t%20th%E1%BB%95%20c%C6%B0">\u0110\u1EA5t th\u1ED5 c\u01B0</a><a href="/bat-dong-san/?property_type=Trang%20tr%E1%BA%A1i">\u0110\u1EA5t n\xF4ng nghi\u1EC7p / Trang tr\u1EA1i</a><a href="/bat-dong-san/?property_type=V%C4%83n%20ph%C3%B2ng">V\u0103n ph\xF2ng</a><a href="/bat-dong-san/?property_type=M%E1%BA%B7t%20b%E1%BA%B1ng%20kinh%20doanh">M\u1EB7t b\u1EB1ng kinh doanh</a><a href="/bat-dong-san/?property_type=Kho%20x%C6%B0%E1%BB%9Fng">Kho / Nh\xE0 x\u01B0\u1EDFng</a><a href="/bat-dong-san/?property_type=B%E1%BA%A5t%20%C4%91%E1%BB%99ng%20s%E1%BA%A3n%20c%C3%B4ng%20nghi%E1%BB%87p">B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\xF4ng nghi\u1EC7p</a><a href="/bat-dong-san/?property_type=Kh%C3%A1ch%20s%E1%BA%A1n%20/%20Resort">Kh\xE1ch s\u1EA1n / Resort / Ngh\u1EC9 d\u01B0\u1EE1ng</a><a href="/bat-dong-san/?property_type=Officetel">Officetel / C\u0103n h\u1ED9 d\u1ECBch v\u1EE5</a><a href="/bat-dong-san/?property_type=Kh%C3%A1c">B\u1EA5t \u0111\u1ED9ng s\u1EA3n kh\xE1c</a></div></details><a href="/favorites">Tin \u0111\xE3 l\u01B0u</a><a href="/admin?tab=newpost">\u0110\u0103ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n</a></div>\n  <div><h4>Th\xF4ng tin & h\u1ED7 tr\u1EE3</h4><p class="footer-note">C\u1EA7n t\u01B0 v\u1EA5n \u0111\u0103ng tin ho\u1EB7c t\xECm b\u1EA5t \u0111\u1ED9ng s\u1EA3n ph\xF9 h\u1EE3p? Li\xEAn h\u1EC7 tr\u1EF1c ti\u1EBFp \u0111\u1EC3 \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3.</p><a href="/admin">Qu\u1EA3n tr\u1ECB website</a><a href="https://www.facebook.com/groups/batdongsanhaiphong2021" target="_blank" rel="noopener">C\u1ED9ng \u0111\u1ED3ng Facebook \u2197</a></div>\n</div><div class="footer-bottom"><div class="wrap"><span>\xA9 2026 <b data-footer-brand>NEWSREAL</b>. N\u1ED9i dung thu\u1ED9c website.</span><span>Powered by NEWSREAL \xB7 HO\xC0NG V\u01AF\u01A0NG TECH</span></div></div></footer>\n<script src="/assets/favorites.js?v=1788135100"><\/script></body></html>';
function esc(v = "") {
  return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c]);
}
__name(esc, "esc");
function stripHtml(v = "") {
  return String(v || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
__name(stripHtml, "stripHtml");
function slugify(v = "") {
  return String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "tin-bat-dong-san";
}
__name(slugify, "slugify");
function siteHost(req) {
  return new URL(req.url).hostname.replace(/^www\./, "").toLowerCase();
}
__name(siteHost, "siteHost");
async function siteFor2(env, req) {
  const h = siteHost(req);
  const sql = `SELECT s.*,coalesce(ps.seo_title,'') seo_title,coalesce(ps.seo_description,'') seo_description,coalesce(ps.seo_og_image,'') seo_og_image,coalesce(ps.seo_index,1) seo_index FROM sites s LEFT JOIN site_public_settings ps ON ps.site_id=s.id`;
  let s = await env.DB.prepare(sql + ` WHERE lower(s.domain)=? AND s.status='active'`).bind(h).first();
  if (!s && (h === "localhost" || h.endsWith(".pages.dev") || h === "app.hoangvuongtech.com")) s = await env.DB.prepare(sql + ` WHERE s.status='active' ORDER BY s.id LIMIT 1`).first();
  return s;
}
__name(siteFor2, "siteFor");
function postUrl(base, p) {
  const cat = p.type === "news" ? "tin-tuc" : p.transaction === "rent" ? "cho-thue" : p.transaction === "buy" ? "mua" : p.transaction === "sale" ? "ban" : "bat-dong-san";
  return `${base}/${cat}/${slugify(p.title)}-p${p.id}`;
}
__name(postUrl, "postUrl");
function metaTags({ title, description, image, url, type = "website" }) {
  return `
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="${esc(type)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image || "")}">
<meta property="og:image:secure_url" content="${esc(image || "")}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="NEWSREAL">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image || "")}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
`;
}
__name(metaTags, "metaTags");
function inject(html, meta) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, "").replace(/<meta name="description"[^>]*>/ig, "").replace(/<meta property="og:[^"]+"[^>]*>/ig, "").replace(/<meta name="twitter:[^"]+"[^>]*>/ig, "").replace(/<link rel="canonical"[^>]*>/ig, "").replace("</head>", meta + "</head>");
}
__name(inject, "inject");
function htmlResponse(body2, status = 200) {
  return new Response(body2, { status, headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=60" } });
}
__name(htmlResponse, "htmlResponse");
function htmlNoCache(body2, status = 200) {
  return new Response(body2, { status, headers: {
    "Content-Type": "text/html; charset=UTF-8",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
    "CDN-Cache-Control": "no-store",
    "Cloudflare-CDN-Cache-Control": "no-store"
  } });
}
__name(htmlNoCache, "htmlNoCache");
function themedHtml(html, preset) {
  const cls = preset === "newsreal" ? "theme-estate-default" : preset === "estate_green" ? "theme-estate-green" : preset === "estate_luxe_3" ? "theme-estate-luxe" : preset === "estate_minimal_4" ? "theme-estate-minimal" : preset === "estate_urban_5" ? "theme-estate-urban" : preset === "news_portal_1" ? "theme-news-portal" : preset === "service_fpt_1" ? "theme-service-fpt" : preset === "service_vnpt_2" ? "theme-service-vnpt" : preset === "service_viettel_3" ? "theme-service-viettel" : preset === "service_camera_store_4" ? "theme-service-camera-store" : preset === "game_clash_1" ? "theme-game-clash" : "";
  return cls ? html.replace("<body>", `<body class="${cls}">`) : html;
}
__name(themedHtml, "themedHtml");
var TEMPLATE_MARKET_HOSTS = /* @__PURE__ */ new Set(["hoangvuongtech.com", "www.hoangvuongtech.com"]);
var TRIAL_LAUNCH_HOSTS = /* @__PURE__ */ new Set(["hoangvuongtech.com", "www.hoangvuongtech.com", "app.hoangvuongtech.com"]);
function isTemplateMarketHost(host2) {
  return TEMPLATE_MARKET_HOSTS.has(String(host2 || "").toLowerCase());
}
__name(isTemplateMarketHost, "isTemplateMarketHost");
function demoThemeFromPath(path) {
  if (path === "/templates" || path === "/templates/" || path.startsWith("/templates/")) return "marketplace";
  if (path === "/demo" || path === "/demo/") return "legacy-center";
  const legacyEstate = path.match(/^\/demo\/(mau-[1-5])(?:\/|$)/i);
  if (legacyEstate) return legacyEstate[1].toLowerCase();
  const estate = path.match(/^\/demo\/bat-dong-san\/(mau-[1-5])(?:\/|$)/i);
  if (estate) return estate[1].toLowerCase();
  const news = path.match(/^\/demo\/tin-tuc\/mau-([1-4])(?:\/|$)/i);
  if (news) return "tin-tuc-" + news[1];
  const service = path.match(/^\/demo\/dich-vu\/mau-([1-9]\d*)(?:\/|$)/i);
  if (service) return "dich-vu-" + service[1];
  const game = path.match(/^\/demo\/game\/clash-of-clans(?:\/|$)/i);
  if (game) return "game-1";
  const product = path.match(/^\/demo\/san-pham\/mau-1(?:\/|$)/i);
  if (product) return "san-pham-1";
  return "";
}
__name(demoThemeFromPath, "demoThemeFromPath");
function demoPrefixForPath(path, demo) {
  if (!demo || demo === "marketplace" || demo === "legacy-center") return "";
  if (/^tin-tuc-[1-4]$/.test(demo)) return "/demo/tin-tuc/mau-" + demo.split("-").pop();
  if (/^dich-vu-\d+$/.test(demo)) return "/demo/dich-vu/mau-" + demo.split("-").pop();
  if (demo === "game-1") return "/demo/game/clash-of-clans";
  if (demo === "san-pham-1") return "/demo/san-pham/mau-1";
  if (/^mau-[1-5]$/.test(demo)) return "/demo/bat-dong-san/" + demo;
  return "";
}
__name(demoPrefixForPath, "demoPrefixForPath");
function stripDemoPath(path, demo) {
  if (!demo || demo === "marketplace" || demo === "legacy-center") return path;
  let sourcePrefix = demoPrefixForPath(path, demo);
  if (/^mau-[1-5]$/.test(demo) && path.startsWith("/demo/" + demo)) sourcePrefix = "/demo/" + demo;
  const rest = path.slice(sourcePrefix.length);
  return rest || "/";
}
__name(stripDemoPath, "stripDemoPath");
function demoInject(html, demo, trialCtx = null) {
  if (!demo || demo === "center") return html;
  html = html.replace(/\/assets\/style\.css\?v=[^\"'&<]+/g, "/assets/style.css?v=20.9.23.5").replace(/\/assets\/site\.js\?v=[^\"'&<]+/g, "/assets/site.js?v=20.9.23.5");
  const preset = demo === "mau-1" ? "newsreal" : demo === "mau-2" ? "estate_green" : demo === "mau-3" ? "estate_luxe_3" : demo === "mau-4" ? "estate_minimal_4" : demo === "mau-5" ? "estate_urban_5" : demo === "tin-tuc-1" ? "news_portal_1" : demo === "tin-tuc-2" ? "news_paper_2" : demo === "tin-tuc-3" ? "news_magazine_3" : demo === "tin-tuc-4" ? "news_minimal_4" : demo === "dich-vu-1" ? "service_fpt_1" : demo === "dich-vu-2" ? "service_vnpt_2" : demo === "dich-vu-3" ? "service_viettel_3" : demo === "dich-vu-4" ? "service_camera_store_4" : demo === "game-1" ? "game_clash_1" : demo === "san-pham-1" ? "product_affiliate_1" : "";
  let out = themedHtml(html, preset);
  const currentPath = typeof rawPath !== "undefined" ? rawPath : "";
  const prefix = demoPrefixForPath(currentPath, demo);
  const boot = `<meta name="robots" content="noindex,follow"><meta name="newsreal-demo-build" content="20.9.23.5"><script>window.NR_DEMO_THEME=${JSON.stringify(demo)};window.NR_DEMO_PREFIX=${JSON.stringify(prefix)};window.NR_TRIAL_TOKEN=${JSON.stringify(trialCtx?.trial_token || "")};window.NR_TRIAL_TENANT=${JSON.stringify(trialCtx?.domain || "")};window.NR_DEMO_TENANT=window.NR_TRIAL_TENANT||'batdongsan2027.org.uk';
window.nrTrialUrl=function(raw){
 if(!window.NR_TRIAL_TOKEN||!raw||typeof raw!=='string'||raw==='#'||/^mailto:|^tel:|^javascript:/i.test(raw))return raw;
 try{const x=new URL(raw,location.origin);if(x.origin!==location.origin)return raw;if(x.pathname.startsWith('/api/')||x.pathname.startsWith('/assets/')||x.pathname.startsWith('/admin')||x.pathname.startsWith('/control-center'))return raw;x.searchParams.set('nr_trial',window.NR_TRIAL_TOKEN);return x.pathname+x.search+x.hash}catch(e){return raw}
};
window.nrDemoAdminUrl=function(templateKey,tab){
 const key=String(templateKey||window.NR_DEMO_THEME||'').trim();
 if(window.NR_TRIAL_TOKEN){const q=new URLSearchParams();if(window.NR_TRIAL_TENANT)q.set('tenant',window.NR_TRIAL_TENANT);q.set('nr_trial',window.NR_TRIAL_TOKEN);if(key)q.set('template',key);if(tab)q.set('tab',tab);return '/admin?'+q.toString()}
 const q=new URLSearchParams();if(key)q.set('template',key);if(tab)q.set('tab',tab);return 'https://batdongsan2027.org.uk/admin'+(q.toString()?'?'+q.toString():'')
};
window.NR_ESTATE_CORE={
 'mau-1':{brand:'B\u1EA4T \u0110\u1ED8NG S\u1EA2N',cls:'theme-estate-default'},
 'mau-2':{brand:'B\u1EA4T \u0110\u1ED8NG S\u1EA2N',cls:'theme-estate-green'},
 'mau-3':{brand:'LIVING ESTATE',cls:'theme-estate-luxe'},
 'mau-4':{brand:'NH\xC0 \u0110\u1EB8P',cls:'theme-estate-minimal'},
 'mau-5':{brand:'URBAN HOME',cls:'theme-estate-urban'}
};
window.NR_DEMO_TITLE_LABELS={
 'mau-1':'B\u0110S M\u1EABu 1','mau-2':'B\u0110S M\u1EABu 2','mau-3':'B\u0110S M\u1EABu 3','mau-4':'B\u0110S M\u1EABu 4','mau-5':'B\u0110S M\u1EABu 5',
 'tin-tuc-1':'Tin t\u1EE9c M\u1EABu 1','tin-tuc-2':'Tin t\u1EE9c M\u1EABu 2','tin-tuc-3':'Tin t\u1EE9c M\u1EABu 3','tin-tuc-4':'Tin t\u1EE9c M\u1EABu 4',
 'dich-vu-1':'FPT','dich-vu-2':'VNPT','dich-vu-3':'Viettel','dich-vu-4':'Camera Store','game-1':'Clash of Clans \xB7 Base Portal','san-pham-1':'Product Store \xB7 Affiliate'
};
window.nrApplyDemoTitle=function(){
 const key=String(window.NR_DEMO_THEME||''),base=window.NR_DEMO_TITLE_LABELS[key];
 if(!base)return;
 const prefix=String(window.NR_DEMO_PREFIX||''),path=location.pathname;
 let rel=prefix&&path.startsWith(prefix)?path.slice(prefix.length):path;
 rel=rel||'/';
 // Article pages own their title (headline + template). Do not overwrite them here.
 if(/\\.html$/i.test(rel)||/\\-p\\d+\\/?$/i.test(rel))return;
 const q=new URLSearchParams(location.search);
 const category=q.get('category');
 let page='';
 if(category&&/^tin-tuc-/.test(key))page=category;
 else if(/^\\/mua-ban\\/?/i.test(rel))page='Nh\xE0 \u0111\u1EA5t b\xE1n';
 else if(/^\\/cho-thue\\/?/i.test(rel))page='Nh\xE0 \u0111\u1EA5t cho thu\xEA';
 else if(/^\\/bat-dong-san\\/?/i.test(rel))page='B\u1EA5t \u0111\u1ED9ng s\u1EA3n';
 else if(/^\\/favorites\\/?/i.test(rel))page='Tin \u0111\xE3 l\u01B0u';
 document.title=(page?page+' | ':'')+base+' \xB7 Demo | HoangVuongTech';
};
document.addEventListener('DOMContentLoaded',()=>window.nrApplyDemoTitle&&window.nrApplyDemoTitle());
window.nrEstateDemoUrl=function(path){
 if(!window.NR_DEMO_PREFIX||!path||typeof path!=='string')return path;
 if(/^https?:|^mailto:|^tel:|^javascript:/i.test(path))return path;
 if(path.startsWith('/api/')||path.startsWith('/assets/')||path.startsWith('/admin')||path.startsWith('/control-center')||path.startsWith('/activate')||path.startsWith('/renewal')||path.startsWith('/reset-password')||path.startsWith('/templates/')||path.startsWith('/demo/'))return path;
 if(path==='#')return '#';
 const out=path.startsWith('/')?window.NR_DEMO_PREFIX+path:path;
 if(window.NR_TRIAL_TOKEN&&window.nrTrialUrl)return window.nrTrialUrl(out);
 return window.NR_CLIENT_SIM&&window.nrClientSimUrl?window.nrClientSimUrl(out):out;
};
window.nrApplyEstateDemoShell=function(){
 const key=String(window.NR_DEMO_THEME||'');
 const cfg=window.NR_ESTATE_CORE&&window.NR_ESTATE_CORE[key];
 if(!cfg)return;
 document.body.dataset.estateDemo=key;
 ['theme-estate-default','theme-estate-green','theme-estate-luxe','theme-estate-minimal','theme-estate-urban'].forEach(c=>document.body.classList.toggle(c,c===cfg.cls));

 document.querySelectorAll('#brandLeft,#brandName,[data-estate-brand]').forEach(el=>el.textContent=cfg.brand);
 document.querySelectorAll('.header a.logo,.header a.brand,header a.logo,header a.brand,a[data-brand-link]').forEach(a=>{a.setAttribute('href',window.nrEstateDemoUrl('/'));a.onclick=null});

 const propertyTypes=[
  ['C\u0103n h\u1ED9 / Chung c\u01B0','Chung c\u01B0'],['Nh\xE0 ri\xEAng','Nh\xE0 ri\xEAng'],['Nh\xE0 tr\u1ECD / Ph\xF2ng tr\u1ECD','Nh\xE0 tr\u1ECD'],['Nh\xE0 m\u1EB7t ph\u1ED1','Nh\xE0 ph\u1ED1'],['Bi\u1EC7t th\u1EF1 / Li\u1EC1n k\u1EC1','Bi\u1EC7t th\u1EF1'],
  ['Shophouse / Nh\xE0 ph\u1ED1 th\u01B0\u01A1ng m\u1EA1i','Shophouse'],['\u0110\u1EA5t n\u1EC1n / \u0110\u1EA5t d\u1EF1 \xE1n','\u0110\u1EA5t'],['\u0110\u1EA5t th\u1ED5 c\u01B0','\u0110\u1EA5t th\u1ED5 c\u01B0'],['\u0110\u1EA5t n\xF4ng nghi\u1EC7p / Trang tr\u1EA1i','Trang tr\u1EA1i'],
  ['V\u0103n ph\xF2ng','V\u0103n ph\xF2ng'],['M\u1EB7t b\u1EB1ng kinh doanh','M\u1EB7t b\u1EB1ng kinh doanh'],['Kho / Nh\xE0 x\u01B0\u1EDFng','Kho x\u01B0\u1EDFng'],['B\u0110S c\xF4ng nghi\u1EC7p','B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\xF4ng nghi\u1EC7p'],
  ['Kh\xE1ch s\u1EA1n / Resort / Ngh\u1EC9 d\u01B0\u1EE1ng','Kh\xE1ch s\u1EA1n / Resort'],['Officetel / C\u0103n h\u1ED9 d\u1ECBch v\u1EE5','Officetel'],['B\u1EA5t \u0111\u1ED9ng s\u1EA3n kh\xE1c','Kh\xE1c']
 ];
 const typeMenu='<details class="property-taxonomy-menu"><summary>Lo\u1EA1i B\u0110S</summary><div class="property-taxonomy-dropdown">'+propertyTypes.map(([label,value])=>'<a href="'+window.nrEstateDemoUrl('/bat-dong-san/?property_type='+encodeURIComponent(value))+'">'+label+'</a>').join('')+'</div></details>';
 const navHtml=[['Trang ch\u1EE7','/'],['B\u1EA5t \u0111\u1ED9ng s\u1EA3n','/bat-dong-san/'],['Mua','/mua/'],['B\xE1n','/ban/'],['Cho thu\xEA','/cho-thue/']].map(([label,url])=>'<a href="'+window.nrEstateDemoUrl(url)+'">'+label+'</a>').join('')+typeMenu+'<a href="'+window.nrEstateDemoUrl('/#news')+'">Tin t\u1EE9c</a>';

 document.querySelectorAll('.header nav.nav,#mainNav,#detailNav,#favoritesNav').forEach(nav=>nav.innerHTML=navHtml);

 const admin=window.nrDemoAdminUrl?window.nrDemoAdminUrl(key,'newpost'):'https://batdongsan2027.org.uk/admin?tab=newpost&template='+encodeURIComponent(key);
 document.querySelectorAll('.header-post-btn').forEach(a=>{a.href=admin;a.target='_blank';a.rel='noopener';a.textContent='+ \u0110\u0103ng tin'});
 document.querySelectorAll('.header .actions').forEach(actions=>{
   if(actions.querySelector('[data-nr-estate-core-actions]'))return;
   actions.innerHTML='<span data-nr-estate-core-actions style="display:contents"><a class="btn soft" href="'+window.nrEstateDemoUrl('/favorites')+'">\u2665 Tin \u0111\xE3 l\u01B0u</a><a class="btn primary" href="'+admin+'" target="_blank" rel="noopener">+ \u0110\u0103ng tin</a><button id="mobileMenuBtn" class="btn soft mobile-menu">\u2630</button></span>';
 });

 // Rewrite ALL local links generated later by page-specific JS.
 const fixLinks=()=>{
  document.querySelectorAll('a[href]').forEach(a=>{
   if(a.dataset.demoExternal==='1')return;
   let h=a.getAttribute('href')||'';
   if(!h||h==='#'||h.startsWith(window.NR_DEMO_PREFIX+'/')||h===window.NR_DEMO_PREFIX+'/')return;
   if(h==='#estate-categories'||h==='/#estate-categories'||h==='#categories')h='/#categories';
   if(h==='#estate-news'||h==='/#estate-news'||h==='#news')h='/#news';
   const fixed=window.nrEstateDemoUrl(h);
   if(fixed!==h)a.setAttribute('href',fixed);
  });
 };
 fixLinks();

 // Keep brand/nav/routes stable even after listings/property/favorites JS renders.
 if(!window.__nrEstateShellObserver){
   window.__nrEstateShellObserver=new MutationObserver(()=>{
     fixLinks();
     document.querySelectorAll('#brandLeft,#brandName,[data-estate-brand]').forEach(el=>{if(el.textContent!==cfg.brand)el.textContent=cfg.brand});
   });
   window.__nrEstateShellObserver.observe(document.body,{childList:true,subtree:true});
 }
};
document.addEventListener('DOMContentLoaded',()=>{if(/^mau-[1-5]$/.test(String(window.NR_DEMO_THEME||'')))window.nrApplyEstateDemoShell()});
const __nrQ=new URLSearchParams(location.search);
window.NR_CLIENT_SIM=__nrQ.get('nr_client')==='1';
window.NR_CLIENT_SAMPLES=__nrQ.get('nr_samples')==='1';
window.nrClientSimUrl=function(raw){
 if(!window.NR_CLIENT_SIM||!raw||typeof raw!=='string'||raw==='#'||/^mailto:|^tel:|^javascript:/i.test(raw))return raw;
 try{
   const u=new URL(raw,location.origin);
   if(u.origin!==location.origin)return raw;
   if(u.pathname.startsWith('/api/')||u.pathname.startsWith('/assets/')||u.pathname.startsWith('/admin')||u.pathname.startsWith('/control-center'))return raw;
   u.searchParams.set('nr_client','1');
   u.searchParams.set('nr_samples',window.NR_CLIENT_SAMPLES?'1':'0');
   return u.pathname+u.search+u.hash;
 }catch(e){return raw}
};
const __nrFetch=window.fetch.bind(window);window.fetch=(input,init={})=>{try{
 const raw=typeof input==='string'?input:(input&&input.url)||'';
 if(raw.startsWith('/api/')){
   const h=new Headers(init.headers||{});
   h.set('X-Tenant',window.NR_DEMO_TENANT);
   if(window.NR_TRIAL_TOKEN){
     h.set('X-NR-Trial',window.NR_TRIAL_TOKEN);
   }else if(window.NR_CLIENT_SIM){
     // Client simulation is the customer handover view. Default is always EMPTY.
     h.set('X-NR-Preview-Samples',window.NR_CLIENT_SAMPLES?'1':'0');
     h.set('X-NR-Template-Simulation','1');
     h.set('X-NR-Template-Key',String(window.NR_DEMO_THEME||''));
   }else if(window.NR_DEMO_THEME){
     // Public template demo is a sales showroom: always render the template sample package.
     // Never depend on whatever posts happen to exist in the shared demo tenant DB.
     h.set('X-NR-Template-Demo','1');
     h.set('X-NR-Template-Key',String(window.NR_DEMO_THEME||''));
   }
   return __nrFetch(input,{...init,headers:h})
 }
}catch(e){}return __nrFetch(input,init)};
document.addEventListener('DOMContentLoaded',()=>{if(!/^mau-[1-5]$/.test(String(window.NR_DEMO_THEME||'')))document.querySelectorAll('header a.logo,header a.brand,.header a.logo,.header a.brand,a[data-brand-link]').forEach(a=>{a.setAttribute('href','#');a.addEventListener('click',e=>e.preventDefault())})});
document.addEventListener('DOMContentLoaded',()=>{
 if(!window.NR_CLIENT_SIM)return;
 document.body.classList.add('nr-client-simulation');
 const bar=document.createElement('div');bar.className='nr-client-simbar';
 const mode=window.NR_CLIENT_SAMPLES?'with':'empty';
 bar.innerHTML='<div class="nr-sim-brand"><b>GI\u1EA2 L\u1EACP KH\xC1CH H\xC0NG</b><span>Preview \u0111\xFAng d\u1EEF li\u1EC7u c\u1EE7a template \xB7 kh\xF4ng ghi v\xE0o site kh\xE1ch</span></div>'+
 '<div class="nr-sim-state"><span>N\u1ED9i dung:</span>'+
 '<button type="button" data-sim-samples="1" class="'+(mode==='with'?'active':'')+'">C\xF3 b\xE0i m\u1EABu</button>'+
 '<button type="button" data-sim-samples="0" class="'+(mode==='empty'?'active':'')+'">Kh\xF4ng b\xE0i m\u1EABu</button></div>'+
 '<div class="nr-sim-actions"><button type="button" data-sim-close>Tho\xE1t gi\u1EA3 l\u1EADp</button></div>';
 document.body.prepend(bar);
 bar.querySelectorAll('[data-sim-samples]').forEach(btn=>btn.onclick=()=>{
   const u=new URL(location.href);u.searchParams.set('nr_client','1');u.searchParams.set('nr_samples',btn.dataset.simSamples);location.href=u.toString();
 });
 bar.querySelector('[data-sim-close]').onclick=()=>{const u=new URL(location.href);u.searchParams.delete('nr_client');u.searchParams.delete('nr_samples');location.href=u.toString()};
 const keepSim=()=>{
   document.querySelectorAll('a[href]').forEach(a=>{
     if(a.closest('.nr-client-simbar'))return;
     const h=a.getAttribute('href')||'';
     const fixed=window.nrClientSimUrl(h);
     if(fixed!==h)a.setAttribute('href',fixed);
   });
 };
 keepSim();
 if(!window.__nrClientSimObserver){
   window.__nrClientSimObserver=new MutationObserver(keepSim);
   window.__nrClientSimObserver.observe(document.body,{childList:true,subtree:true});
 }
});

document.addEventListener('DOMContentLoaded',()=>{
 if(!window.NR_TRIAL_TOKEN)return;
 const keepTrial=()=>document.querySelectorAll('a[href]').forEach(a=>{if(a.closest('.nr-trial-bar')||a.closest('.nr-trial-expired-modal'))return;const h=a.getAttribute('href')||'';const f=window.nrTrialUrl?window.nrTrialUrl(h):h;if(f!==h)a.setAttribute('href',f)});
 keepTrial();if(!window.__nrTrialObserver){window.__nrTrialObserver=new MutationObserver(keepTrial);window.__nrTrialObserver.observe(document.body,{childList:true,subtree:true})}
});

document.addEventListener('DOMContentLoaded',()=>{
 const btn=document.querySelector('[data-start-trial]');if(!btn||window.NR_TRIAL_TOKEN)return;
 // Legacy in-demo CTA, if a future template still exposes it, follows the same V17.9 activation contract.
 btn.onclick=async()=>{location.href='/templates/'};
});

document.addEventListener('DOMContentLoaded',()=>{
 if(!window.NR_TRIAL_TOKEN)return;
 document.body.classList.add('nr-trial-mode');
 const bar=document.createElement('div');bar.className='nr-trial-bar';
 const trialLabel=(window.NR_DEMO_THEME||'website').replace(/^tin-tuc-/i,'Tin t\u1EE9c M\u1EABu ').replace(/^mau-/i,'B\u0110S M\u1EABu ');
 bar.innerHTML='<div class="nr-trial-info"><span class="nr-trial-badge">D\xD9NG TH\u1EEC MI\u1EC4N PH\xCD</span><div class="nr-trial-context"><b id="nrTrialTemplateLabel">'+trialLabel+'</b><small>Website th\u1EED nghi\u1EC7m ri\xEAng c\u1EE7a b\u1EA1n</small></div></div><div class="nr-trial-time"><small>C\xF2n l\u1EA1i</small><strong id="nrTrialCountdown"><span>--</span><i>:</i><span>--</span><i>:</i><span>--</span></strong></div><div class="nr-trial-actions"><a id="nrTrialAdmin" class="nr-trial-admin" href="#"><span>\u2699</span> Trang qu\u1EA3n tr\u1ECB</a><button id="nrTrialBuy" class="nr-trial-buy" type="button">\u0110\u0103ng k\xFD s\u1EED d\u1EE5ng</button></div>';
 document.body.prepend(bar);
 const statusUrl='/api/trial/status?token='+encodeURIComponent(window.NR_TRIAL_TOKEN)+'&path='+encodeURIComponent(location.pathname);
 let expiryMs=0,expiredShown=false;
 function paintClock(){const el=document.getElementById('nrTrialCountdown');if(!el||!expiryMs)return;const left=Math.max(0,Math.floor((expiryMs-Date.now())/1000));const h=Math.floor(left/3600),mi=Math.floor((left%3600)/60),s=left%60;el.innerHTML='<span>'+String(h).padStart(2,'0')+'</span><i>:</i><span>'+String(mi).padStart(2,'0')+'</span><i>:</i><span>'+String(s).padStart(2,'0')+'</span>';if(left<=0&&!expiredShown){expiredShown=true;showExpired({expired:true})}}
 let trialCommercial={price:0,renewal_price:0,name:''};
 const moneyVN=n=>Number(n||0)>0?new Intl.NumberFormat('vi-VN').format(Number(n))+'\u0111':'Li\xEAn h\u1EC7';
 const sync=async()=>{try{const r=await fetch(statusUrl,{cache:'no-store'}),d=await r.json(),tr=d.trial||{},tpl=d.template||{};trialCommercial={price:Number(tpl.price||0),renewal_price:Number(tpl.renewal_price||0),name:tpl.name||''};expiryMs=Date.parse(String(tr.expires_at||'').replace(' ','T')+'Z')||Date.now()+Math.max(0,Number(tr.remaining_seconds||0))*1000;document.getElementById('nrTrialAdmin').href='/admin?tenant='+encodeURIComponent(tr.tenant||window.NR_TRIAL_TENANT)+'&nr_trial='+encodeURIComponent(window.NR_TRIAL_TOKEN)+'&template='+encodeURIComponent(tr.template_key||window.NR_DEMO_THEME);const tl=document.getElementById('nrTrialTemplateLabel');if(tl)tl.textContent=tpl.name||trialLabel;paintClock();if(tr.expired){expiredShown=true;showExpired(tr)}}catch(e){}};
 function showExpired(tr){if(document.querySelector('.nr-trial-expired-modal'))return;document.body.classList.add('nr-trial-expired');const p=trialCommercial.price;const priceLine=p?'<div class="nr-trial-expired-price"><small>G\xD3I WEBSITE N\xC0Y</small><strong>'+moneyVN(p)+' <em>/ n\u0103m \u0111\u1EA7u</em></strong></div>':'';const x=document.createElement('div');x.className='nr-trial-expired-modal';x.innerHTML='<div class="nr-trial-expired-card"><div class="nr-trial-expired-icon">\u231B</div><small>D\xD9NG TH\u1EEC \u0110\xC3 K\u1EBET TH\xDAC</small><h2>B\u1EA1n mu\u1ED1n ti\u1EBFp t\u1EE5c v\u1EDBi giao di\u1EC7n n\xE0y?</h2>'+priceLine+'<p>\u0110\u0103ng k\xFD \u0111\u1EC3 ti\u1EBFp t\u1EE5c s\u1EED d\u1EE5ng. <b>T\u1EA5t c\u1EA3 b\xE0i vi\u1EBFt b\u1EA1n \u0111\xE3 \u0111\u0103ng s\u1EBD \u0111\u01B0\u1EE3c gi\u1EEF nguy\xEAn.</b></p><button data-trial-register>\u0110\u0103ng k\xFD g\xF3i website n\xE0y</button><a href="/templates/">Xem giao di\u1EC7n kh\xE1c</a></div>';document.body.appendChild(x);x.querySelector('[data-trial-register]').onclick=buy;}
 async function buy(){try{const d=await (await fetch('/api/trial/convert-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:window.NR_TRIAL_TOKEN})})).json();location.href=d.checkout_url||('/trial-checkout/?token='+encodeURIComponent(window.NR_TRIAL_TOKEN))}catch(e){location.href='/trial-checkout/?token='+encodeURIComponent(window.NR_TRIAL_TOKEN)}}
 document.getElementById('nrTrialBuy').onclick=buy;sync();setInterval(paintClock,1000);setInterval(sync,60000);
});
document.addEventListener('DOMContentLoaded',()=>{
 const q=new URLSearchParams(location.search);
 const framed=q.get('nr_frame')==='1';
 if(framed){
   document.body.classList.add('nr-demo-framed');
   return;
 }
 const buttons=[...document.querySelectorAll('[data-demo-device]')];
 let stage=null,frame=null;
 function cleanFrameUrl(){
   const u=new URL(location.href);
   u.searchParams.set('nr_frame','1');
   return u.toString();
 }
 function closeStage(){
   if(stage){stage.remove();stage=null;frame=null}
   document.body.classList.remove('nr-device-open');
 }
 function setMode(mode){
   buttons.forEach(b=>b.classList.toggle('active',b.dataset.demoDevice===mode));
   if(mode==='desktop'){closeStage();try{sessionStorage.setItem('nr_demo_device','desktop')}catch(e){};return}
   closeStage();
   stage=document.createElement('div');stage.className='nr-device-stage nr-device-'+mode;
   const label=document.createElement('div');label.className='nr-device-label';label.textContent=mode==='tablet'?'M\xE1y t\xEDnh b\u1EA3ng \xB7 820px':'\u0110i\u1EC7n tho\u1EA1i \xB7 390px';
   frame=document.createElement('iframe');frame.className='nr-device-frame';frame.src=cleanFrameUrl();frame.title='Xem tr\u01B0\u1EDBc giao di\u1EC7n '+mode;
   stage.append(label,frame);document.body.appendChild(stage);document.body.classList.add('nr-device-open');
   try{sessionStorage.setItem('nr_demo_device',mode)}catch(e){}
 }
 buttons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.demoDevice)));
 // Always open demo normally on a fresh page/reload.
 // Mobile/Tablet are explicit preview modes only.
 setMode('desktop');
});
<\/script>`;
  const newsNum = /^tin-tuc-([1-4])$/.exec(demo)?.[1] || "";
  const serviceNum = /^dich-vu-(\d+)$/.exec(demo)?.[1] || "";
  const isGameDemo = demo === "game-1";
  const isProductDemo = demo === "san-pham-1";
  const newsNames = { "1": "Tin t\u1EE9c M\u1EABu 1 \xB7 T\u1EA1p ch\xED hi\u1EC7n \u0111\u1EA1i", "2": "Tin t\u1EE9c M\u1EABu 2 \xB7 B\xE1o \u0111i\u1EC7n t\u1EED", "3": "Tin t\u1EE9c M\u1EABu 3 \xB7 Magazine hi\u1EC7n \u0111\u1EA1i", "4": "Tin t\u1EE9c M\u1EABu 4 \xB7 Minimal SEO" };
  const estateNames = { "mau-1": "M\u1EABu 1 \xB7 Tin t\u1EE9c & B\u0110S", "mau-2": "M\u1EABu 2 \xB7 B\u0110S hi\u1EC7n \u0111\u1EA1i", "mau-3": "M\u1EABu 3 \xB7 B\u0110S Luxury", "mau-4": "M\u1EABu 4 \xB7 B\u0110S Minimal", "mau-5": "M\u1EABu 5 \xB7 B\u0110S Urban" };
  const serviceNames = { "1": "FPT", "2": "VNPT", "3": "Viettel", "4": "Camera Store" };
  const demoLabel = isProductDemo ? "Product Store \xB7 Affiliate" : isGameDemo ? "Template website Clash of Clans \xB7 Base Portal" : newsNum ? newsNames[newsNum] : serviceNum ? serviceNames[serviceNum] || `D\u1ECBch v\u1EE5 M\u1EABu ${serviceNum}` : estateNames[demo] || "M\u1EABu b\u1EA5t \u0111\u1ED9ng s\u1EA3n";
  const isNewsDemo = !!newsNum;
  const isProductTemplateDemo = isProductDemo;
  const isServiceDemo = !!serviceNum;
  const relativeDemoPath = prefix && currentPath.startsWith(prefix) ? currentPath.slice(prefix.length) || "/" : currentPath;
  const isDemoArticle = /\.html$/i.test(relativeDemoPath) || /\-p\d+\/?$/i.test(relativeDemoPath);
  if (!isDemoArticle) {
    const tabTitle = isProductDemo ? "Product Store \xB7 Affiliate \xB7 Demo | HoangVuongTech" : isGameDemo ? "Template website Clash of Clans \xB7 Demo | HoangVuongTech" : isNewsDemo ? `Tin t\u1EE9c M\u1EABu ${newsNum} \xB7 Demo | HoangVuongTech` : isServiceDemo ? `D\u1ECBch v\u1EE5 M\u1EABu ${serviceNum} \xB7 Demo | HoangVuongTech` : `B\u0110S ${demo === "mau-1" ? "M\u1EABu 1" : demo === "mau-2" ? "M\u1EABu 2" : demo === "mau-3" ? "M\u1EABu 3" : demo === "mau-4" ? "M\u1EABu 4" : "M\u1EABu 5"} \xB7 Demo | HoangVuongTech`;
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${tabTitle}</title>`);
  }
  const bar = `<div class="nr-demo-bar"><div class="nr-demo-inner"><b>\u0110ANG XEM ${isProductDemo ? "S\u1EA2N PH\u1EA8M \xB7 AFFILIATE" : isGameDemo ? "GAME \xB7 CLASH OF CLANS" : isNewsDemo ? "TIN T\u1EE8C \xB7 M\u1EAAU " + newsNum : isServiceDemo ? "D\u1ECACH V\u1EE4 \xB7 M\u1EAAU " + serviceNum : "B\u1EA4T \u0110\u1ED8NG S\u1EA2N \xB7 " + (demo === "mau-1" ? "M\u1EAAU 1" : demo === "mau-2" ? "M\u1EAAU 2" : demo === "mau-3" ? "M\u1EAAU 3" : demo === "mau-4" ? "M\u1EAAU 4" : "M\u1EAAU 5")}</b><span>Ch\u1ECDn giao di\u1EC7n ph\xF9 h\u1EE3p v\u1EDBi b\u1EA1n</span><div class="nr-demo-actions"><div class="nr-demo-devices" aria-label="Xem tr\xEAn thi\u1EBFt b\u1ECB"><button type="button" class="active" data-demo-device="desktop" title="Xem tr\xEAn PC">\u25B0 <span>PC</span></button><button type="button" data-demo-device="tablet" title="Xem tr\xEAn m\xE1y t\xEDnh b\u1EA3ng">\u25AF <span>Tablet</span></button><button type="button" data-demo-device="mobile" title="Xem tr\xEAn \u0111i\u1EC7n tho\u1EA1i">\u25AF <span>Mobile</span></button></div><a href="${isProductDemo ? "/templates/ban-hang/" : isGameDemo ? "/templates/game/" : isNewsDemo ? "/templates/tin-tuc/" : isServiceDemo ? "/templates/dich-vu/" : "/templates/bat-dong-san/"}">Kho m\u1EABu</a><a class="nr-demo-cta" data-demo-external="1" href="https://hoangvuongtech.com/?template=${encodeURIComponent(demo)}&name=${encodeURIComponent(demoLabel)}#dang-ky" target="_blank" rel="noopener">Ch\u1ECDn m\u1EABu n\xE0y</a></div></div></div>`;
  return out.replace("</head>", boot + "</head>").replace(/<body([^>]*)>/i, `<body$1>${bar}`);
}
__name(demoInject, "demoInject");
var TEMPLATE_CATALOG_DEFAULTS = [
  { template_key: "mau-1", name: "M\u1EABu 1 \xB7 Tin t\u1EE9c & B\u0110S", category: "bat-dong-san", preset: "newsreal", price: 1499e3, renewal_price: 1999e3, is_active: 1, sort_order: 1, image_url: "/assets/demo/mau-1-preview.png", demo_url: "/demo/bat-dong-san/mau-1/", badge: "NHI\u1EC0U N\u1ED8I DUNG", description: "Phong c\xE1ch c\u1ED5ng th\xF4ng tin b\u1EA5t \u0111\u1ED9ng s\u1EA3n, ph\xF9 h\u1EE3p website c\xF3 nhi\u1EC1u tin t\u1EE9c, chuy\xEAn m\u1EE5c v\xE0 b\xE0i \u0111\u0103ng.", features: "Trang ch\u1EE7 nhi\u1EC1u chuy\xEAn m\u1EE5c\nTin t\u1EE9c + b\u1EA5t \u0111\u1ED9ng s\u1EA3n\nPh\xF9 h\u1EE3p SEO n\u1ED9i dung", accent: "blue", seo_title: "Template website b\u1EA5t \u0111\u1ED9ng s\u1EA3n & tin t\u1EE9c \u2013 C\u1ED5ng th\xF4ng tin SEO", seo_slug: "bat-dong-san-tin-tuc-portal", primary_keyword: "template website b\u1EA5t \u0111\u1ED9ng s\u1EA3n", secondary_keywords: "m\u1EABu website b\u1EA5t \u0111\u1ED9ng s\u1EA3n, website tin t\u1EE9c b\u1EA5t \u0111\u1ED9ng s\u1EA3n, giao di\u1EC7n website nh\xE0 \u0111\u1EA5t", meta_description: "M\u1EABu website b\u1EA5t \u0111\u1ED9ng s\u1EA3n k\u1EBFt h\u1EE3p tin t\u1EE9c, nhi\u1EC1u chuy\xEAn m\u1EE5c, trang b\xE0i chi ti\u1EBFt v\xE0 c\u1EA5u tr\xFAc n\u1ED9i dung ph\xF9 h\u1EE3p x\xE2y d\u1EF1ng SEO d\xE0i h\u1EA1n.", internal_anchor: "template website b\u1EA5t \u0111\u1ED9ng s\u1EA3n" },
  { template_key: "dich-vu-1", name: "FPT", category: "dich-vu", preset: "service_fpt_1", price: 1499e3, renewal_price: 1999e3, is_active: 1, sort_order: 1, image_url: "/assets/demo/dich-vu-1-preview.png", demo_url: "/demo/dich-vu/mau-1/", badge: "FPT", description: "Website d\u1ECBch v\u1EE5 FPT v\u1EDBi Internet, FPT Play, Camera AI, combo v\xE0 lu\u1ED3ng t\u01B0 v\u1EA5n.", features: "Internet FPT\nFPT Play\nCamera AI\nCombo & CTA t\u01B0 v\u1EA5n", accent: "orange", seo_title: "Template website FPT \u2013 Internet, FPT Play, Camera & Combo", seo_slug: "website-dich-vu-fpt", primary_keyword: "template website FPT", secondary_keywords: "m\u1EABu website internet FPT, website FPT Play, landing page d\u1ECBch v\u1EE5 FPT", meta_description: "Template website d\u1ECBch v\u1EE5 FPT v\u1EDBi Internet, FPT Play, Camera AI, combo v\xE0 CTA t\u01B0 v\u1EA5n r\xF5 r\xE0ng, ph\xF9 h\u1EE3p \u0111\u1EA1i l\xFD v\xE0 nh\xE2n vi\xEAn kinh doanh FPT.", internal_anchor: "template website FPT" },
  { template_key: "dich-vu-2", name: "VNPT", category: "dich-vu", preset: "service_vnpt_2", price: 1499e3, renewal_price: 1999e3, is_active: 1, sort_order: 2, image_url: "/assets/demo/dich-vu-2-preview.png", demo_url: "/demo/dich-vu/mau-2/", badge: "VNPT", description: "Website VNPT Home v\u1EDBi Home Internet, MyTV, Home Cam v\xE0 combo gia \u0111\xECnh.", features: "Home Internet\nMyTV\nHome Cam\nCombo gia \u0111\xECnh", accent: "blue", seo_title: "Template website VNPT \u2013 Home Internet, MyTV & Home Cam", seo_slug: "website-dich-vu-vnpt", primary_keyword: "template website VNPT", secondary_keywords: "m\u1EABu website VNPT, website MyTV, landing page Home Internet VNPT", meta_description: "Template website VNPT v\u1EDBi Home Internet, MyTV, Home Cam, combo gia \u0111\xECnh v\xE0 CTA t\u01B0 v\u1EA5n, ph\xF9 h\u1EE3p \u0111\u1EA1i l\xFD v\xE0 nh\xE2n vi\xEAn kinh doanh VNPT.", internal_anchor: "template website VNPT" },
  { template_key: "dich-vu-3", name: "Viettel", category: "dich-vu", preset: "service_viettel_3", price: 1499e3, renewal_price: 1999e3, is_active: 1, sort_order: 3, image_url: "/assets/demo/dich-vu-3-preview.png", demo_url: "/demo/dich-vu/mau-3/", badge: "VIETTEL", description: "Website Viettel v\u1EDBi Internet Wi-Fi 6, TV360, Camera v\xE0 combo tr\u1ECDn g\xF3i.", features: "Internet Viettel\nTV360\nCamera Cloud\nCombo tr\u1ECDn g\xF3i", accent: "red", seo_title: "Template website Viettel \u2013 Internet, TV360 & Camera", seo_slug: "website-dich-vu-viettel", primary_keyword: "template website Viettel", secondary_keywords: "m\u1EABu website Viettel, website TV360, landing page internet Viettel", meta_description: "Template website Viettel v\u1EDBi Internet Wi-Fi, TV360, Camera Cloud, combo v\xE0 CTA \u0111\u0103ng k\xFD, ph\xF9 h\u1EE3p \u0111\u1EA1i l\xFD v\xE0 nh\xE2n vi\xEAn kinh doanh Viettel.", internal_anchor: "template website Viettel" },
  { template_key: "dich-vu-4", name: "Camera Store", category: "dich-vu", preset: "service_camera_store_4", price: 1499e3, renewal_price: 1999e3, is_active: 1, sort_order: 4, image_url: "/assets/demo/dich-vu-4-preview.png", demo_url: "/demo/dich-vu/mau-4/", badge: "CAMERA", description: "Website tr\u01B0ng b\xE0y v\xE0 t\u01B0 v\u1EA5n camera \u0111a th\u01B0\u01A1ng hi\u1EC7u v\u1EDBi s\u1EA3n ph\u1EA9m, gi\xE1, th\xF4ng s\u1ED1, khuy\u1EBFn m\xE3i v\xE0 form lead.", features: "Camera trong nh\xE0\nCamera ngo\xE0i tr\u1EDDi\nCamera AI quay qu\xE9t\nCamera IP / b\u1ED9 gi\xE1m s\xE1t", accent: "green", seo_title: "Template website b\xE1n Camera \u2013 Catalog s\u1EA3n ph\u1EA9m & t\u01B0 v\u1EA5n", seo_slug: "website-camera", primary_keyword: "template website camera", secondary_keywords: "m\u1EABu website camera, website b\xE1n camera, catalog camera an ninh", meta_description: "Template website camera \u0111a th\u01B0\u01A1ng hi\u1EC7u v\u1EDBi catalog s\u1EA3n ph\u1EA9m, gi\xE1, th\xF4ng s\u1ED1, khuy\u1EBFn m\xE3i, trang chi ti\u1EBFt v\xE0 form t\u01B0 v\u1EA5n kh\xE1ch h\xE0ng.", internal_anchor: "template website camera" },
  { template_key: "san-pham-1", name: "Product Store \xB7 Affiliate", category: "ban-hang", preset: "product_affiliate_1", price: 1499e3, renewal_price: 1999e3, is_active: 1, sort_order: 1, image_url: "/assets/demo/san-pham-1-preview-real.webp", demo_url: "/demo/san-pham/mau-1/", badge: "S\u1EA2N PH\u1EA8M", description: "Website catalog / review s\u1EA3n ph\u1EA9m v\u1EDBi gi\xE1, voucher, rating, gallery, link mua h\xE0ng v\xE0 qu\u1EA3n tr\u1ECB s\u1EA3n ph\u1EA9m ri\xEAng.", features: "Catalog s\u1EA3n ph\u1EA9m nhi\u1EC1u chuy\xEAn m\u1EE5c\nTrang chi ti\u1EBFt s\u1EA3n ph\u1EA9m & gallery\nGi\xE1, voucher, rating & link affiliate\nKh\xE1ch t\u1EF1 qu\u1EA3n l\xFD b\u1EB1ng Trang qu\u1EA3n tr\u1ECB", accent: "orange", seo_title: "Template website b\xE1n h\xE0ng & Affiliate \u2013 Catalog s\u1EA3n ph\u1EA9m", seo_slug: "website-ban-hang-affiliate", primary_keyword: "template website b\xE1n h\xE0ng affiliate", secondary_keywords: "m\u1EABu website review s\u1EA3n ph\u1EA9m, website affiliate, catalog s\u1EA3n ph\u1EA9m, website gi\u1EDBi thi\u1EC7u s\u1EA3n ph\u1EA9m", meta_description: "Template website b\xE1n h\xE0ng v\xE0 affiliate v\u1EDBi catalog nhi\u1EC1u chuy\xEAn m\u1EE5c, gi\xE1, voucher, rating, gallery, trang chi ti\u1EBFt v\xE0 link mua h\xE0ng do kh\xE1ch t\u1EF1 qu\u1EA3n l\xFD.", internal_anchor: "template website b\xE1n h\xE0ng affiliate" },
  { template_key: "game-1", name: "Template website Clash of Clans \xB7 Base Portal", category: "game", preset: "game_clash_1", price: 1699e3, renewal_price: 2199e3, is_active: 1, sort_order: 1, image_url: "/assets/demo/game-clash-1-preview.png", demo_url: "/demo/game/clash-of-clans/", badge: "CLASH OF CLANS", description: "M\u1EABu website game chia s\u1EBB base Clash of Clans cho c\u1ED9ng \u0111\u1ED3ng v\u1EDBi TH/BH/CH, b\u1ED9 l\u1ECDc nhanh v\xE0 trang chi ti\u1EBFt base.", features: "Town Hall TH2\u2013TH18\nBuilder Hall BH2\u2013BH10\nClan Capital CH1\u2013CH10\nFast Filter + Copy Link", accent: "orange", seo_title: "Template website Clash of Clans \u2013 Chia s\u1EBB base TH/BH/CH", seo_slug: "clash-of-clans-base", primary_keyword: "template website Clash of Clans", secondary_keywords: "m\u1EABu website game, website chia s\u1EBB base Clash of Clans, template game Clash of Clans", meta_description: "Template website Clash of Clans chuy\xEAn chia s\u1EBB base Town Hall, Builder Hall v\xE0 Clan Capital v\u1EDBi b\u1ED9 l\u1ECDc nhanh, copy link v\xE0 trang chi ti\u1EBFt t\u1ED1i \u01B0u SEO.", internal_anchor: "template website Clash of Clans" },
  { template_key: "tin-tuc-1", name: "Tin t\u1EE9c M\u1EABu 1 \xB7 T\u1EA1p ch\xED hi\u1EC7n \u0111\u1EA1i", category: "tin-tuc", preset: "news_portal_1", price: 1499e3, renewal_price: 1999e3, is_active: 1, sort_order: 1, image_url: "/assets/demo/tin-tuc-1-preview-v2.png", demo_url: "/demo/tin-tuc/mau-1/", badge: "M\u1EDAI", description: "Giao di\u1EC7n tin t\u1EE9c hi\u1EC7n \u0111\u1EA1i, t\u1EADp trung b\xE0i n\u1ED5i b\u1EADt, d\xF2ng tin m\u1EDBi, chuy\xEAn m\u1EE5c v\xE0 n\u1ED9i dung \u0111\u1ECDc nhi\u1EC1u.", features: "Trang ch\u1EE7 ki\u1EC3u t\u1EA1p ch\xED\nTin n\u1ED5i b\u1EADt + \u0111\u1ECDc nhi\u1EC1u\nChuy\xEAn m\u1EE5c t\u1EF1 \u0111\u1ED9ng theo b\xE0i vi\u1EBFt\nT\u1ED1i \u01B0u n\u1ED9i dung & mobile", accent: "red", seo_title: "Template website tin t\u1EE9c hi\u1EC7n \u0111\u1EA1i \u2013 T\u1EA1p ch\xED & c\u1ED5ng n\u1ED9i dung", seo_slug: "tin-tuc-tap-chi-hien-dai", primary_keyword: "template website tin t\u1EE9c", secondary_keywords: "m\u1EABu website tin t\u1EE9c, giao di\u1EC7n b\xE1o \u0111i\u1EC7n t\u1EED, template t\u1EA1p ch\xED online", meta_description: "Template website tin t\u1EE9c hi\u1EC7n \u0111\u1EA1i v\u1EDBi b\xE0i n\u1ED5i b\u1EADt, tin m\u1EDBi, chuy\xEAn m\u1EE5c v\xE0 n\u1ED9i dung \u0111\u1ECDc nhi\u1EC1u; ph\xF9 h\u1EE3p b\xE1o \u0111i\u1EC7n t\u1EED, t\u1EA1p ch\xED v\xE0 site n\u1ED9i dung.", internal_anchor: "template website tin t\u1EE9c" },
  { template_key: "mau-2", name: "M\u1EABu 2 \xB7 B\u0110S hi\u1EC7n \u0111\u1EA1i", category: "bat-dong-san", preset: "estate_green", price: 1799e3, renewal_price: 2299e3, is_active: 1, sort_order: 2, image_url: "/assets/demo/mau-2-preview.png", demo_url: "/demo/bat-dong-san/mau-2/", badge: "\u0110\u1EC0 XU\u1EA4T", description: "Phong c\xE1ch portal b\u1EA5t \u0111\u1ED9ng s\u1EA3n hi\u1EC7n \u0111\u1EA1i, hero t\xECm ki\u1EBFm l\u1EDBn v\xE0 t\u1EADp trung m\u1EA1nh v\xE0o chuy\u1EC3n \u0111\u1ED5i kh\xE1ch h\xE0ng.", features: "B\u1ED9 l\u1ECDc t\xECm ki\u1EBFm n\u1ED5i b\u1EADt\nCard b\u1EA5t \u0111\u1ED9ng s\u1EA3n hi\u1EC7n \u0111\u1EA1i\nT\u1ED1i \u01B0u tr\u1EA3i nghi\u1EC7m mobile", accent: "green", seo_title: "Template website b\u1EA5t \u0111\u1ED9ng s\u1EA3n hi\u1EC7n \u0111\u1EA1i \u2013 T\xECm ki\u1EBFm & chuy\u1EC3n \u0111\u1ED5i", seo_slug: "bat-dong-san-hien-dai", primary_keyword: "m\u1EABu website b\u1EA5t \u0111\u1ED9ng s\u1EA3n hi\u1EC7n \u0111\u1EA1i", secondary_keywords: "template nh\xE0 \u0111\u1EA5t, website m\xF4i gi\u1EDBi b\u1EA5t \u0111\u1ED9ng s\u1EA3n, giao di\u1EC7n website b\u1EA5t \u0111\u1ED9ng s\u1EA3n", meta_description: "Template b\u1EA5t \u0111\u1ED9ng s\u1EA3n hi\u1EC7n \u0111\u1EA1i v\u1EDBi hero t\xECm ki\u1EBFm, card d\u1EF1 \xE1n v\xE0 b\u1ED1 c\u1EE5c t\u1ED1i \u01B0u tr\u1EA3i nghi\u1EC7m mobile, ph\xF9 h\u1EE3p m\xF4i gi\u1EDBi v\xE0 doanh nghi\u1EC7p nh\xE0 \u0111\u1EA5t.", internal_anchor: "m\u1EABu website b\u1EA5t \u0111\u1ED9ng s\u1EA3n hi\u1EC7n \u0111\u1EA1i" }
];
function moneyVN(v) {
  return Number(v || 0).toLocaleString("vi-VN") + "\u0111";
}
__name(moneyVN, "moneyVN");
async function ensureMarketCatalog(env) {
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS template_catalog(
    template_key TEXT PRIMARY KEY,name TEXT NOT NULL,category TEXT NOT NULL DEFAULT 'bat-dong-san',
    preset TEXT NOT NULL DEFAULT '',price INTEGER NOT NULL DEFAULT 0,renewal_price INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,sort_order INTEGER NOT NULL DEFAULT 0,image_url TEXT NOT NULL DEFAULT '',
    demo_url TEXT NOT NULL DEFAULT '',badge TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',
    features TEXT NOT NULL DEFAULT '',accent TEXT NOT NULL DEFAULT 'blue',seo_title TEXT NOT NULL DEFAULT '',seo_slug TEXT NOT NULL DEFAULT '',primary_keyword TEXT NOT NULL DEFAULT '',secondary_keywords TEXT NOT NULL DEFAULT '',meta_description TEXT NOT NULL DEFAULT '',internal_anchor TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
    const alters = [
      `ALTER TABLE template_catalog ADD COLUMN image_url TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN demo_url TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN badge TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN features TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN accent TEXT NOT NULL DEFAULT 'blue'`,
      `ALTER TABLE template_catalog ADD COLUMN seo_title TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN seo_slug TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN primary_keyword TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN secondary_keywords TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN meta_description TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE template_catalog ADD COLUMN internal_anchor TEXT NOT NULL DEFAULT ''`
    ];
    for (const q of alters) {
      try {
        await env.DB.prepare(q).run();
      } catch (e) {
      }
    }
    for (const d of TEMPLATE_CATALOG_DEFAULTS) {
      await env.DB.prepare(`INSERT OR IGNORE INTO template_catalog(template_key,name,category,preset,price,renewal_price,is_active,sort_order,image_url,demo_url,badge,description,features,accent)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(d.template_key, d.name, d.category, d.preset, d.price, d.renewal_price, 1, d.sort_order, d.image_url, d.demo_url, d.badge, d.description, d.features, d.accent).run();
      await env.DB.prepare(`UPDATE template_catalog SET
    image_url=CASE WHEN coalesce(image_url,'')='' THEN ? ELSE image_url END,
    demo_url=CASE WHEN coalesce(demo_url,'')='' THEN ? ELSE demo_url END,
    badge=CASE WHEN coalesce(badge,'')='' THEN ? ELSE badge END,
    description=CASE WHEN coalesce(description,'')='' THEN ? ELSE description END,
    features=CASE WHEN coalesce(features,'')='' THEN ? ELSE features END,
    accent=CASE WHEN coalesce(accent,'')='' THEN ? ELSE accent END,
    seo_title=CASE WHEN trim(coalesce(seo_title,''))='' THEN ? ELSE seo_title END,
    seo_slug=CASE WHEN trim(coalesce(seo_slug,''))='' THEN ? ELSE seo_slug END,
    primary_keyword=CASE WHEN trim(coalesce(primary_keyword,''))='' THEN ? ELSE primary_keyword END,
    secondary_keywords=CASE WHEN trim(coalesce(secondary_keywords,''))='' THEN ? ELSE secondary_keywords END,
    meta_description=CASE WHEN trim(coalesce(meta_description,''))='' THEN ? ELSE meta_description END,
    internal_anchor=CASE WHEN trim(coalesce(internal_anchor,''))='' THEN ? ELSE internal_anchor END
    WHERE template_key=?`).bind(d.image_url, d.demo_url, d.badge, d.description, d.features, d.accent, d.seo_title || "", d.seo_slug || "", d.primary_keyword || "", d.secondary_keywords || "", d.meta_description || "", d.internal_anchor || "", d.template_key).run();
    }
    try {
      await env.DB.prepare(`UPDATE template_catalog SET image_url='/assets/demo/game-clash-1-preview.png',updated_at=CURRENT_TIMESTAMP WHERE template_key='game-1'`).run();
    } catch (e) {
    }
    const serviceRefresh = [["dich-vu-1", "FPT", "/assets/demo/dich-vu-1-preview.png"], ["dich-vu-2", "VNPT", "/assets/demo/dich-vu-2-preview.png"], ["dich-vu-3", "Viettel", "/assets/demo/dich-vu-3-preview.png"], ["dich-vu-4", "Camera Store", "/assets/demo/dich-vu-4-preview.png"]];
    for (const [k, n, img] of serviceRefresh) {
      try {
        await env.DB.prepare(`UPDATE template_catalog SET name=?,image_url=?,updated_at=CURRENT_TIMESTAMP WHERE template_key=?`).bind(n, img, k).run();
      } catch (e) {
      }
    }
  } catch (e) {
  }
}
__name(ensureMarketCatalog, "ensureMarketCatalog");
async function loadTemplateCatalog(env, category = "") {
  try {
    await ensureMarketCatalog(env);
    if (!category) {
      const { results: results2 } = await env.DB.prepare(`SELECT template_key,name,category,preset,price,renewal_price,is_active,sort_order,
    image_url,demo_url,badge,description,features,accent,seo_title,seo_slug,primary_keyword,secondary_keywords,meta_description,internal_anchor FROM template_catalog
    WHERE is_active=1 ORDER BY CASE category WHEN 'bat-dong-san' THEN 1 WHEN 'tin-tuc' THEN 2 WHEN 'ban-hang' THEN 3 WHEN 'landing-page' THEN 4 WHEN 'dich-vu' THEN 5 WHEN 'game' THEN 6 ELSE 99 END,sort_order,template_key`).all();
      return results2 || [];
    }
    const { results } = await env.DB.prepare(`SELECT template_key,name,category,preset,price,renewal_price,is_active,sort_order,
   image_url,demo_url,badge,description,features,accent,seo_title,seo_slug,primary_keyword,secondary_keywords,meta_description,internal_anchor FROM template_catalog
   WHERE category=? AND is_active=1 ORDER BY sort_order,template_key`).bind(category).all();
    return results || [];
  } catch (e) {
    return category ? TEMPLATE_CATALOG_DEFAULTS.filter((x) => x.category === category) : TEMPLATE_CATALOG_DEFAULTS.filter((x) => x.is_active !== 0);
  }
}
__name(loadTemplateCatalog, "loadTemplateCatalog");
var CATEGORY_NAMES = {
  "bat-dong-san": "B\u1EA5t \u0111\u1ED9ng s\u1EA3n",
  "tin-tuc": "Tin t\u1EE9c",
  "ban-hang": "B\xE1n h\xE0ng",
  "landing-page": "Landing Page",
  "dich-vu": "D\u1ECBch v\u1EE5",
  "game": "Game",
  "san-pham": "S\u1EA3n ph\u1EA9m / Affiliate"
};
function marketCategoryFromPath(path) {
  const m = String(path || "").match(/^\/templates\/([^/]+)/);
  return m ? m[1] : "";
}
__name(marketCategoryFromPath, "marketCategoryFromPath");
function gameMarketplacePreviewHtml(extraClass = "") {
  const th18 = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3uXRRSSucOwlCPaoJSv4XPqTAR-s4SHVTJWpurkKLFH3cXyvohLv33sXpzq58mRiTZ7PR9aI-lJvSJKoCJcVpJimUrunFPbHAXoKxyIh8EzcdgrzJR7fipf6CUToq7ibCmUoiht-v74iHihZLCeoO7VTTYLDXODjTL1DmcSm2EaTb3yrm0BJi1nOP2rG7/s600/th18_coc.webp";
  const th17 = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCdTCaRil9IY_W-rNX711VaHAhJNjjOtAXgOVP1encGhR8xMFphnPCGqG38HdjI9NckADJBNLdIIeyusee62Tws19DdZGJZZLDU5aypHG_iICQrGmRM7CdxxzsUojv2Xw7Pd1nFw1Qkh1mXbHEYcezZv9eEIHQGM2gMYNYACvM8GAcnm_xccqJ64FJ0I3U/s400/th17_coc.jpg";
  const bh10 = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEglyTmwita5O6d-FqJvM1tagpIJdcbw3aEa1v13VjnNm61qliTiDqWzWL2UuJJVQrWtGlE2q_HOuH1FKclTc-5AIPL6OHSnTZooP29rTeG_hSyghYoCGwafFZYxRcNxCXAOfnnPod7Hi1tGiegwtDdvn617weuPuMml0IclLSXFD5NFnovowsAJxlRDK3kI/s400/bh8_min.jpg";
  return `<div class="market-game-preview ${extraClass}" aria-label="Preview giao di\u1EC7n Clash of Clans">
   <div class="mgp-nav"><b><i>COC</i> BASE PORTAL</b><span>Home</span><span>Browse Bases</span><span>Town Hall</span><span>Builder Hall</span><span>Clan Capital</span><em>+ \u0110\u0103ng base</em></div>
   <div class="mgp-main">
    <div class="mgp-hero"><div><small>CLASH OF CLANS \xB7 COMMUNITY BASES</small><strong>Choose your Hall.<br><i>Find a base fast.</i></strong><p>Ch\u1ECDn \u0111\xFAng c\u1EA5p nh\xE0, l\u1ECDc nhanh v\xE0 m\u1EDF Copy Link ch\u1EC9 trong v\xE0i gi\xE2y.</p><div class="mgp-actions"><span>Browse TH18 Bases</span><span>Choose another Hall</span></div></div><img src="${th18}" alt="Town Hall 18"></div>
    <div class="mgp-section-head"><small>TOWN HALL</small><b>Choose Town Hall</b></div>
    <div class="mgp-levels"><article><img src="${th17}" alt="TH17"><b>TH17</b></article><article class="active"><img src="${th18}" alt="TH18"><b>TH18</b></article><article><div class="mgp-level-fallback">BH</div><b>BH10</b></article><article><div class="mgp-level-fallback">CH</div><b>CH10</b></article></div>
    <div class="mgp-browser"><div><small>GROUP</small><b>Town Hall</b></div><div><small>LEVEL</small><b>TH18</b></div><div><small>TYPE</small><b>All</b></div><div><small>YEAR</small><b>2026</b></div><div><small>SORT</small><b>Latest</b></div></div>
   </div>
 </div>`;
}
__name(gameMarketplacePreviewHtml, "gameMarketplacePreviewHtml");
function templateSeoDetailHtml(t) {
  const esc2 = /* @__PURE__ */ __name((v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]), "esc");
  const key = String(t?.template_key || ""), slug = String(t?.seo_slug || "").trim(), url = `https://hoangvuongtech.com/templates/${esc2(t?.category || "game")}/${esc2(slug)}/`, demo = t?.demo_url || "", title = t?.seo_title || t?.name || "Template website", desc = t?.meta_description || t?.description || "", keywords = [t?.primary_keyword, ...String(t?.secondary_keywords || "").split(",")].map((x) => String(x || "").trim()).filter(Boolean);
  const features = String(t?.features || "").split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const image = "https://hoangvuongtech.com" + String(t?.image_url || "/assets/demo/game-clash-1-preview.png");
  const catUrl = `https://hoangvuongtech.com/templates/${String(t?.category || "game")}/`;
  const graph = { "@context": "https://schema.org", "@graph": [{ "@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "HoangVuongTech", "item": "https://hoangvuongtech.com/" }, { "@type": "ListItem", "position": 2, "name": "Kho giao di\u1EC7n", "item": "https://hoangvuongtech.com/templates/" }, { "@type": "ListItem", "position": 3, "name": CATEGORY_NAMES[t?.category] || "Template", "item": catUrl }, { "@type": "ListItem", "position": 4, "name": t?.name || title, "item": url }] }, { "@type": "Product", "@id": url + "#product", "name": t?.name || title, "description": desc, "image": [image], "category": "Website Template", "brand": { "@type": "Brand", "name": "HoangVuongTech" }, "url": url, "offers": { "@type": "Offer", "url": url, "priceCurrency": "VND", "price": String(Number(t?.price || t?.renewal_price || 0)), "availability": "https://schema.org/InStock", "seller": { "@type": "Organization", "name": "HoangVuongTech", "url": "https://hoangvuongtech.com/" } } }] };
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc2(title)} | HoangVuongTech</title><meta name="description" content="${esc2(desc)}"><meta name="keywords" content="${esc2(keywords.join(", "))}"><link rel="canonical" href="${url}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><meta property="og:type" content="product"><meta property="og:site_name" content="HoangVuongTech"><meta property="og:title" content="${esc2(title)}"><meta property="og:description" content="${esc2(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${esc2(image)}"><meta property="og:image:alt" content="${esc2(t?.name || title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc2(title)}"><meta name="twitter:description" content="${esc2(desc)}"><meta name="twitter:image" content="${esc2(image)}"><link rel="stylesheet" href="/assets/style.css?v=20.9.23.5"><script type="application/ld+json">${JSON.stringify(graph)}<\/script></head><body class="template-seo-detail"><header class="demo-showroom-header"><div class="demo-showroom-nav"><a class="demo-brand" href="/templates/"><b>HOANGVUONGTECH \xB7 TEMPLATES</b></a><div><a href="/templates/${esc2(t?.category || "game")}/">Kho ${esc2(CATEGORY_NAMES[t?.category] || "template")}</a><a class="demo-contact-btn" href="/#dang-ky">T\u01B0 v\u1EA5n</a></div></div></header><main class="template-detail-wrap"><nav class="template-detail-crumb"><a href="/templates/">Kho giao di\u1EC7n</a> / <a href="/templates/${esc2(t?.category || "game")}/">${esc2(CATEGORY_NAMES[t?.category] || "Game")}</a> / ${esc2(t?.name || title)}</nav><section class="template-detail-hero"><div><span>${esc2(t?.badge || "TEMPLATE")}</span><h1>${esc2(t?.name || title)}</h1><p>${esc2(t?.description || desc)}</p><div class="template-detail-actions">${demo ? `<a class="primary" href="${esc2(demo)}" target="_blank" rel="noopener">Xem demo tr\u1EF1c ti\u1EBFp</a>` : ""}<a href="/?template=${encodeURIComponent(key)}&name=${encodeURIComponent(t?.name || key)}#dang-ky">\u0110\u0103ng k\xFD m\u1EABu n\xE0y</a></div></div>${t?.category === "game" ? gameMarketplacePreviewHtml("is-detail") : `<img src="${esc2(t?.image_url || "/assets/demo/game-clash-1-preview.png")}" alt="${esc2(title)}">`}</section><section class="template-detail-grid"><article><h2>Giao di\u1EC7n \u0111\u01B0\u1EE3c thi\u1EBFt k\u1EBF cho \u0111\xFAng nhu c\u1EA7u</h2><p>Template n\xE0y tu\xE2n th\u1EE7 Universal Layout Contract c\u1EE7a HoangVuongTech: showroom c\xF3 d\u1EEF li\u1EC7u m\u1EABu \u0111\u1EA7y \u0111\u1EE7, c\xF2n trial/client gi\u1EEF nguy\xEAn c\u1EA5u tr\xFAc 1:1 v\xE0 ch\u1EC9 thay \u0111\u1ED5i payload n\u1ED9i dung.</p><div class="template-detail-features">${features.map((x) => `<span>\u2713 ${esc2(x)}</span>`).join("")}</div></article><aside><small>G\xD3I WEBSITE TR\u1ECCN G\xD3I</small><strong>${moneyVN(Number(t?.renewal_price || t?.price || 0))} / n\u0103m</strong><span>\u0110\xE3 g\u1ED3m t\xEAn mi\u1EC1n, hosting, giao di\u1EC7n v\xE0 c\xF4ng c\u1EE5 qu\u1EA3n tr\u1ECB \u0111\u0103ng b\xE0i.</span><hr><b>\u{1F39F} Voucher kh\xE1ch m\u1EDBi: gi\u1EA3m ${moneyVN(Math.max(0, Number(t?.renewal_price || 0) - Number(t?.price || 0)) || 5e5)}</b></aside></section></main></body></html>`;
}
__name(templateSeoDetailHtml, "templateSeoDetailHtml");
var PRODUCT_AFFILIATE_REAL_PREVIEW_FALLBACK = "data:image/webp;base64,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";
function demoCenterHtml(siteName, templates = [], category = "") {
  const isRoot = !category;
  const catName = isRoot ? "T\u1EA5t c\u1EA3 giao di\u1EC7n" : CATEGORY_NAMES[category] || category;
  const categorySeo = category === "game" ? { title: "Template website game \u2013 Clash of Clans & Game Portal", desc: "Kho template website game chuy\xEAn nghi\u1EC7p. Xem m\u1EABu website Clash of Clans, website chia s\u1EBB base TH/BH/CH, b\u1ED9 l\u1ECDc nhanh v\xE0 giao di\u1EC7n game t\u1ED1i \u01B0u SEO." } : category === "dich-vu" ? { title: "Template website d\u1ECBch v\u1EE5 \u2013 Internet, Camera, Vi\u1EC5n th\xF4ng", desc: "Kho template website d\u1ECBch v\u1EE5 chuy\xEAn nghi\u1EC7p cho FPT, VNPT, Viettel, camera v\xE0 c\xE1c m\xF4 h\xECnh t\u01B0 v\u1EA5n d\u1ECBch v\u1EE5." } : category === "tin-tuc" ? { title: "Template website tin t\u1EE9c \u2013 B\xE1o \u0111i\u1EC7n t\u1EED, t\u1EA1p ch\xED & blog SEO", desc: "Kho template website tin t\u1EE9c, b\xE1o \u0111i\u1EC7n t\u1EED v\xE0 t\u1EA1p ch\xED online v\u1EDBi b\u1ED1 c\u1EE5c chuy\xEAn m\u1EE5c r\xF5 r\xE0ng, t\u1ED1c \u0111\u1ED9 t\u1ED1t v\xE0 c\u1EA5u tr\xFAc ph\xF9 h\u1EE3p SEO n\u1ED9i dung." } : category === "bat-dong-san" ? { title: "Template website b\u1EA5t \u0111\u1ED9ng s\u1EA3n \u2013 Nh\xE0 \u0111\u1EA5t, m\xF4i gi\u1EDBi & d\u1EF1 \xE1n", desc: "Kho template website b\u1EA5t \u0111\u1ED9ng s\u1EA3n chuy\xEAn nghi\u1EC7p cho m\xF4i gi\u1EDBi, s\xE0n nh\xE0 \u0111\u1EA5t v\xE0 d\u1EF1 \xE1n v\u1EDBi giao di\u1EC7n responsive, t\xECm ki\u1EBFm v\xE0 c\u1EA5u tr\xFAc SEO." } : null;
  const esc2 = /* @__PURE__ */ __name((v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]), "esc");
  const cards = templates.map((t, idx) => {
    const key = String(t.template_key || "");
    const demo = t.demo_url || "";
    const image = t.image_url || "/assets/demo/mau-1-preview.png";
    const accent = ["blue", "green", "orange", "purple", "red"].includes(t.accent) ? t.accent : "blue";
    const choose = `/?template=${encodeURIComponent(key)}&name=${encodeURIComponent(t.name || key)}#dang-ky`;
    const first = Number(t.price || 0), renewal = Number(t.renewal_price || 0);
    const saving = renewal > first && first > 0 ? renewal - first : 0;
    return `<article class="demo-pro-card ${accent}">
    <div class="demo-pro-shot ${t.category === "game" ? "game-live-preview" : ""}">
     ${t.category === "game" ? gameMarketplacePreviewHtml("is-card") : key === "san-pham-1" ? `<img src="${esc2(image)}" alt="${esc2(t.name)}" onerror="this.onerror=null;this.src='${PRODUCT_AFFILIATE_REAL_PREVIEW_FALLBACK}'">` : `<img src="${esc2(image)}" alt="${esc2(t.name)}">`}
     ${t.badge ? `<span class="demo-pro-badge">${esc2(t.badge)}</span>` : ""}<span class="demo-pro-number">${String(idx + 1).padStart(2, "0")}</span>
     ${demo ? `<div class="demo-pro-hover"><a href="${esc2(demo)}" target="_blank" rel="noopener">Xem demo tr\u1EF1c ti\u1EBFp</a></div>` : ""}
    </div>
    <div class="demo-pro-body commercial-card">
     <div class="demo-pro-title-row"><h2>${t.seo_slug ? `<a class="market-title-link" href="/templates/${esc2(t.category)}/${esc2(t.seo_slug)}/">${esc2(t.name)}</a>` : esc2(t.name)}</h2><span>Website tr\u1ECDn g\xF3i</span></div>${t.description ? `<p class="market-seo-desc">${esc2(t.description)}</p>` : ""}

     <div class="commercial-pricing commercial-pricing-simple" data-market-price data-list-price="${renewal}" data-voucher-price="${first}">
       <div class="commercial-price-main">
         <small>GI\xC1 WEBSITE TR\u1ECCN G\xD3I</small>
         <div class="commercial-price-line"><del data-market-list hidden>${renewal > 0 ? moneyVN(renewal) : ""}</del><strong data-market-current>${renewal > 0 ? moneyVN(renewal) : first > 0 ? moneyVN(first) : "Li\xEAn h\u1EC7"}</strong><b>/ n\u0103m</b></div>
         <em data-market-voucher-status>Gi\xE1 ni\xEAm y\u1EBFt h\u1EB1ng n\u0103m</em>
       </div>
     </div>

     <div class="commercial-gift-box">
       <div class="commercial-gift-title"><b>\u{1F381} T\u1EB6NG K\xC8M TR\u1ECCN G\xD3I</b><span>\u0110\xE3 bao g\u1ED3m</span></div>
       <div class="commercial-includes">
        <span><i>\u2713</i><b>T\xEAn mi\u1EC1n ri\xEAng mi\u1EC5n ph\xED</b></span>
        <span><i>\u2713</i><b>Hosting mi\u1EC5n ph\xED</b></span>
        <span><i>\u2713</i><b>Giao di\u1EC7n Website \u0111\xE3 ch\u1ECDn</b></span>
        <span><i>\u2713</i><b>C\xF4ng c\u1EE5 qu\u1EA3n tr\u1ECB \u0111\u0103ng b\xE0i</b></span>
       </div>
       <button type="button" class="commercial-voucher" data-market-voucher>\u{1F39F} \xC1P D\u1EE4NG NGAY VOUCHER GI\u1EA2M 500K</button>
       <small class="commercial-voucher-note">\xC1p d\u1EE5ng 1 l\u1EA7n cho kh\xE1ch h\xE0ng \u0111\u0103ng k\xFD m\u1EDBi.</small>
     </div>

     <div class="commercial-note">Kh\xF4ng ph\u1EA3i ch\u1EC9 mua file template \u2014 \u0111\xE2y l\xE0 g\xF3i website ho\xE0n ch\u1EC9nh \u0111\u1EC3 \u0111\u01B0a v\xE0o s\u1EED d\u1EE5ng.</div>

     <div class="demo-pro-actions">
       ${demo ? `<a class="demo-view" href="${esc2(demo)}" target="_blank" rel="noopener">Xem giao di\u1EC7n</a>` : `<span class="demo-view disabled">Demo \u0111ang c\u1EADp nh\u1EADt</span>`}
       <a class="demo-choose" href="${choose}" target="_blank" rel="noopener" data-market-choose><span data-market-choose-main>\u0110\u0103ng k\xFD \xB7 <b data-market-choose-price>${new Intl.NumberFormat("vi-VN").format(Math.round((renewal || first) / 1e3))}K</b></span></a>
       <button type="button" class="demo-trial-start" data-trial-template="${esc2(key)}" data-trial-name="${esc2(t.name || key)}">D\xF9ng th\u1EED mi\u1EC5n ph\xED 1 ng\xE0y</button>
     </div>
    </div>
   </article>`;
  }).join("");
  const counts = templates.reduce((m, t) => (m[t.category] = (m[t.category] || 0) + 1, m), {});
  const categoryLinks = Object.entries(CATEGORY_NAMES).map(([k, n]) => k === category ? `<a class="active" href="/templates/${k}/">${n} <b>${counts[k] || templates.length}</b></a>` : `<a href="/templates/${k}/">${n}${isRoot && counts[k] ? ` <b>${counts[k]}</b>` : ""}</a>`).join("");
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>${categorySeo ? esc2(categorySeo.title) : isRoot ? "Kho giao di\u1EC7n website" : esc2(catName) + " - Kho giao di\u1EC7n website"} | HoangVuongTech</title>
 <meta name="description" content="${categorySeo ? esc2(categorySeo.desc) : isRoot ? "Kho giao di\u1EC7n website HoangVuongTech: ch\u1ECDn nh\xF3m giao di\u1EC7n r\u1ED3i xem demo, gi\xE1 n\u0103m \u0111\u1EA7u v\xE0 chi ph\xED gia h\u1EA1n." : "Kho giao di\u1EC7n website " + esc2(catName) + " tr\u1ECDn g\xF3i. Xem demo, gi\xE1 n\u0103m \u0111\u1EA7u, chi ph\xED gia h\u1EA1n v\xE0 ch\u1ECDn m\u1EABu tr\u1EF1c ti\u1EBFp."}">
 <link rel="canonical" href="https://hoangvuongtech.com/templates/${isRoot ? "" : esc2(category) + "/"}">
 <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
 <meta property="og:type" content="website"><meta property="og:site_name" content="HoangVuongTech">
 <meta property="og:title" content="${isRoot ? "Kho giao di\u1EC7n website" : esc2(catName) + " - Kho giao di\u1EC7n"} | HoangVuongTech">
 <meta property="og:description" content="Xem demo v\xE0 chi ph\xED tr\u1ECDn g\xF3i c\u1EE7a t\u1EEBng m\u1EABu website.">
 <meta property="og:url" content="https://hoangvuongtech.com/templates/${isRoot ? "" : esc2(category) + "/"}">
 <meta property="og:image" content="https://hoangvuongtech.com/assets/marketing-demo.webp"><meta property="og:image:alt" content="Kho giao di\u1EC7n website HoangVuongTech">
 <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${categorySeo ? esc2(categorySeo.title) : "Kho giao di\u1EC7n website HoangVuongTech"}"><meta name="twitter:description" content="${categorySeo ? esc2(categorySeo.desc) : "Kho giao di\u1EC7n website tr\u1ECDn g\xF3i HoangVuongTech."}"><meta name="twitter:image" content="https://hoangvuongtech.com/assets/marketing-demo.webp">
 <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "BreadcrumbList", "itemListElement": isRoot ? [{ "@type": "ListItem", "position": 1, "name": "HoangVuongTech", "item": "https://hoangvuongtech.com/" }, { "@type": "ListItem", "position": 2, "name": "Kho giao di\u1EC7n", "item": "https://hoangvuongtech.com/templates/" }] : [{ "@type": "ListItem", "position": 1, "name": "HoangVuongTech", "item": "https://hoangvuongtech.com/" }, { "@type": "ListItem", "position": 2, "name": "Kho giao di\u1EC7n", "item": "https://hoangvuongtech.com/templates/" }, { "@type": "ListItem", "position": 3, "name": catName, "item": `https://hoangvuongtech.com/templates/${category}/` }] }, { "@type": "CollectionPage", "name": categorySeo ? categorySeo.title : "Kho giao di\u1EC7n website HoangVuongTech", "description": categorySeo ? categorySeo.desc : "Kho giao di\u1EC7n website tr\u1ECDn g\xF3i HoangVuongTech.", "url": `https://hoangvuongtech.com/templates/${isRoot ? "" : category + "/"}`, "isPartOf": { "@id": "https://hoangvuongtech.com/#website" } }] })}<\/script>
 <link rel="stylesheet" href="/assets/style.css?v=20.9.23.5">  <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="theme-color" content="#ffffff">
</head>
 <body class="demo-center-page demo-showroom-v2 template-marketplace">
  <header class="demo-showroom-header"><div class="demo-showroom-nav">
   <a class="demo-brand" href="/templates/"><span>\u2302</span><b>HOANGVUONGTECH \xB7 TEMPLATES</b></a>
   <div><a href="/">Trang ch\xEDnh</a><a class="demo-contact-btn" href="/#dang-ky" target="_blank" rel="noopener">T\u01B0 v\u1EA5n ch\u1ECDn m\u1EABu</a></div>
  </div></header>
  <main class="demo-center">
   <section class="demo-center-head">
    <span class="demo-eyebrow">HOANGVUONGTECH \xB7 WEBSITE TR\u1ECCN G\xD3I</span>
    <h1>Ch\u1ECDn giao di\u1EC7n, xem r\xF5 chi ph\xED tr\u01B0\u1EDBc khi \u0111\u0103ng k\xFD</h1>
    <p>M\u1ED7i m\u1EABu hi\u1EC3n th\u1ECB m\u1ED9t m\u1EE9c gi\xE1 theo n\u0103m, c\xE1c h\u1EA1ng m\u1EE5c \u0111\xE3 bao g\u1ED3m v\xE0 voucher d\xE0nh cho kh\xE1ch \u0111\u0103ng k\xFD m\u1EDBi. B\u1EA1n c\xF3 th\u1EC3 m\u1EDF demo trong tab m\u1EDBi tr\u01B0\u1EDBc khi l\u1EF1a ch\u1ECDn.</p>
    <nav class="template-categories">${categoryLinks}</nav>
    <div class="demo-mini-trust"><span>\u2713 T\xEAn mi\u1EC1n ri\xEAng</span><span>\u2713 Hosting mi\u1EC5n ph\xED</span><span>\u2713 Qu\u1EA3n tr\u1ECB d\u1EC5 d\xF9ng</span><span>\u2713 H\u1ED7 tr\u1EE3 b\xE0n giao</span></div>
   </section>
   <section class="market-section-head"><div><span>${isRoot ? "KHO GIAO DI\u1EC6N" : "GIAO DI\u1EC6N " + esc2(catName.toUpperCase())}</span><h2>${isRoot ? "Ch\u1ECDn nh\xF3m giao di\u1EC7n \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u" : templates.length + " g\xF3i \u0111ang m\u1EDF b\xE1n"}</h2></div><p>${isRoot ? "B\u1EA1n c\xF3 th\u1EC3 xem t\u1EA5t c\u1EA3 m\u1EABu b\xEAn d\u01B0\u1EDBi ho\u1EB7c ch\u1ECDn m\u1ED9t nh\xF3m \u0111\u1EC3 l\u1ECDc \u0111\xFAng nhu c\u1EA7u." : "Gi\xE1 v\xE0 quy\u1EC1n l\u1EE3i \u0111\u01B0\u1EE3c \u0111\u1ED3ng b\u1ED9 tr\u1EF1c ti\u1EBFp t\u1EEB Master Control."}</p></section>
   <section class="demo-pro-grid">${cards || `<div class="market-empty"><h3>Ch\u01B0a c\xF3 m\u1EABu \u0111ang b\xE1n</h3><p>Danh m\u1EE5c n\xE0y s\u1EBD \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt trong th\u1EDDi gian t\u1EDBi.</p></div>`}</section>
   <section class="demo-compare"><div><span>C\u1EA6N T\u01AF V\u1EA4N?</span><h3>Ch\u01B0a bi\u1EBFt m\u1EABu n\xE0o ph\xF9 h\u1EE3p? G\u1EEDi nhu c\u1EA7u, b\xEAn m\xECnh s\u1EBD h\u1ED7 tr\u1EE3 ch\u1ECDn.</h3></div><a href="/#dang-ky" target="_blank" rel="noopener">G\u1EEDi y\xEAu c\u1EA7u t\u01B0 v\u1EA5n \u2192</a></section>
   <script>
   (()=>{
     const escHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
     function closeTrial(){document.querySelector('.market-trial-modal')?.remove();document.body.classList.remove('market-trial-open')}
     function trialSiteSuggestion(key,name){
       key=String(key||'').toLowerCase();name=String(name||'').toLowerCase();
       if(key==='game-1'||key.startsWith('game-'))return 'V\xED d\u1EE5: Clash Base Vi\u1EC7t Nam';
       if(key==='dich-vu-1'||name.includes('fpt'))return 'V\xED d\u1EE5: Internet FPT H\u1EA3i Ph\xF2ng';
       if(key==='dich-vu-2'||name.includes('vnpt'))return 'V\xED d\u1EE5: Internet VNPT H\u1EA3i Ph\xF2ng';
       if(key==='dich-vu-3'||name.includes('viettel'))return 'V\xED d\u1EE5: Internet Viettel H\u1EA3i Ph\xF2ng';
       if(key==='dich-vu-4'||name.includes('camera'))return 'V\xED d\u1EE5: Camera An Ninh H\u1EA3i Ph\xF2ng';
       if(key.startsWith('tin-tuc-'))return 'V\xED d\u1EE5: Tin Vi\u1EC7t 24h';
       if(key.startsWith('mau-')||name.includes('b\u1EA5t \u0111\u1ED9ng s\u1EA3n'))return 'V\xED d\u1EE5: B\u1EA5t \u0111\u1ED9ng s\u1EA3n Ho\xE0ng Gia';
       return 'V\xED d\u1EE5: Website Th\u01B0\u01A1ng Hi\u1EC7u Vi\u1EC7t';
     }
     function openTrial(btn){
       const key=String(btn.dataset.trialTemplate||''),name=String(btn.dataset.trialName||key);
       if(!key)return;
       const siteSuggestion=trialSiteSuggestion(key,name);
       closeTrial();
       const modal=document.createElement('div');modal.className='market-trial-modal';
       modal.innerHTML='<div class="market-trial-card" role="dialog" aria-modal="true" aria-labelledby="marketTrialTitle">'+
        '<button type="button" class="market-trial-close" aria-label="\u0110\xF3ng">\xD7</button>'+
        '<div class="market-trial-badge">D\xD9NG TH\u1EEC WEBSITE TH\u1EF0C T\u1EBE</div>'+
        '<h2 id="marketTrialTitle">D\xF9ng th\u1EED mi\u1EC5n ph\xED 1 ng\xE0y</h2>'+
        '<p class="market-trial-template">Giao di\u1EC7n: <b>'+escHtml(name)+'</b></p>'+
        '<p>B\u1EA1n \u0111\u01B0\u1EE3c d\xF9ng website v\xE0 Trang qu\u1EA3n tr\u1ECB trong 24 gi\u1EDD: \u0111\u0103ng, s\u1EEDa, x\xF3a b\xE0i v\xE0 tr\u1EA3i nghi\u1EC7m c\xE1c t\xEDnh n\u0103ng nh\u01B0 m\u1ED9t kh\xE1ch h\xE0ng th\u1EADt.</p>'+
        '<form class="market-trial-form">'+
          '<label>H\u1ECD t\xEAn<input name="name" autocomplete="name" required></label>'+
          '<label>S\u1ED1 \u0111i\u1EC7n tho\u1EA1i<input name="phone" inputmode="tel" autocomplete="tel" required></label>'+
          '<label>Email<input name="email" type="email" autocomplete="email" required></label>'+
          '<label>Zalo<input name="zalo" inputmode="tel" placeholder="Kh\xF4ng b\u1EAFt bu\u1ED9c"></label>'+
          '<label class="full">T\xEAn website mong mu\u1ED1n *<input name="site_name" autocomplete="organization" required placeholder="'+escHtml(siteSuggestion)+'"><small class="market-trial-site-help">G\u1EE3i \xFD \u0111\u01B0\u1EE3c \u0111i\u1EC1u ch\u1EC9nh theo lo\u1EA1i website \u0111ang xem. B\u1EA1n c\xF3 th\u1EC3 nh\u1EADp t\xEAn th\u01B0\u01A1ng hi\u1EC7u ho\u1EB7c khu v\u1EF1c kinh doanh th\u1EF1c t\u1EBF.</small></label>'+
          '<label>C\xF4ng ty / th\u01B0\u01A1ng hi\u1EC7u<input name="company" autocomplete="organization"></label>'+
          '<label class="full">Nhu c\u1EA7u / ghi ch\xFA<textarea name="note" rows="2" placeholder="B\u1EA1n mu\u1ED1n th\u1EED website cho nhu c\u1EA7u n\xE0o?"></textarea></label>'+
          '<input class="market-trial-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><label class="full market-trial-consent"><input name="contact_consent" type="checkbox" value="1"> <span>T\xF4i \u0111\u1ED3ng \xFD \u0111\u1EC3 HoangVuongTech li\xEAn h\u1EC7 h\u1ED7 tr\u1EE3 v\xE0 t\u01B0 v\u1EA5n v\u1EC1 website sau th\u1EDDi gian d\xF9ng th\u1EED.</span></label>'+
          '<div class="market-trial-msg full" aria-live="polite"></div>'+
          '<button class="market-trial-submit full" type="submit">B\u1EAFt \u0111\u1EA7u d\xF9ng th\u1EED mi\u1EC5n ph\xED</button>'+
        '</form>'+
        '<div class="market-trial-foot">Kh\xF4ng c\u1EA7n thanh to\xE1n \xB7 Th\u1EDDi h\u1EA1n 24 gi\u1EDD \xB7 D\u1EEF li\u1EC7u d\xF9ng th\u1EED t\xE1ch ri\xEAng</div>'+
       '</div>';
       document.body.appendChild(modal);document.body.classList.add('market-trial-open');
       modal.querySelector('.market-trial-close').onclick=closeTrial;
       modal.addEventListener('click',e=>{if(e.target===modal)closeTrial()});
       const form=modal.querySelector('form');form.querySelector('input[name="name"]')?.focus();
       form.onsubmit=async e=>{
         e.preventDefault();
         const fd=new FormData(form),msg=modal.querySelector('.market-trial-msg'),submit=modal.querySelector('.market-trial-submit');
         submit.disabled=true;msg.className='market-trial-msg full';msg.textContent='\u0110ang t\u1EA1o website d\xF9ng th\u1EED\u2026';
         try{
           const rr=await fetch('/api/trial/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
             template_key:key,name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email'),zalo:fd.get('zalo'),site_name:fd.get('site_name'),company:fd.get('company'),note:fd.get('note'),website:fd.get('website'),marketing_opt_in:fd.get('contact_consent')==='1',source_url:location.href
           })});
           const d=await rr.json().catch(()=>({}));
           if(!rr.ok){
             if(rr.status===409&&d.activation_url){
               msg.className='market-trial-msg full info';msg.innerHTML=escHtml(d.error||'B\u1EA1n \u0111\xE3 \u0111\u0103ng k\xFD d\xF9ng th\u1EED giao di\u1EC7n n\xE0y.')+' <a href="'+escHtml(d.activation_url)+'">Ti\u1EBFp t\u1EE5c k\xEDch ho\u1EA1t \u2192</a>';submit.disabled=false;return;
             }
             if(rr.status===409&&d.trial_url){
               msg.className='market-trial-msg full info';msg.innerHTML=escHtml(d.error||'B\u1EA1n \u0111\xE3 c\xF3 website d\xF9ng th\u1EED g\u1EA7n \u0111\xE2y.')+' <a href="'+escHtml(d.trial_url)+'">M\u1EDF l\u1EA1i website d\xF9ng th\u1EED \u2192</a>';submit.disabled=false;return;
             }
             throw new Error(d.error||'Kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c website d\xF9ng th\u1EED');
           }
           modal.querySelector('.market-trial-card').innerHTML='<div class="market-trial-success">'+
             '<div class="market-trial-success-icon">\u2713</div><div class="market-trial-badge">S\u1EB4N S\xC0NG K\xCDCH HO\u1EA0T</div><h2>Ho\xE0n t\u1EA5t k\xEDch ho\u1EA1t website d\xF9ng th\u1EED</h2>'+ 
             '<p>H\xE3y x\xE1c nh\u1EADn email v\xE0 t\u1EF1 t\u1EA1o m\u1EADt kh\u1EA9u Trang qu\u1EA3n tr\u1ECB. <b>24 gi\u1EDD d\xF9ng th\u1EED ch\u1EC9 b\u1EAFt \u0111\u1EA7u sau khi k\xEDch ho\u1EA1t.</b></p>'+ 
             '<div class="market-trial-success-actions one"><a class="primary" href="'+escHtml(d.activation_url||'#')+'">K\xEDch ho\u1EA1t website d\xF9ng th\u1EED \u2192</a></div>'+ 
             '<button type="button" class="market-trial-done">\u0110\xF3ng</button></div>';
           modal.querySelector('.market-trial-done').onclick=closeTrial;
         }catch(err){msg.className='market-trial-msg full error';msg.textContent=err.message||'C\xF3 l\u1ED7i x\u1EA3y ra';submit.disabled=false}
       };
     }
     document.addEventListener('click',e=>{
       const voucher=e.target.closest('[data-market-voucher]');
       if(voucher){e.preventDefault();const card=voucher.closest('.commercial-card'),box=card?.querySelector('[data-market-price]');if(!box)return;const list=Number(box.dataset.listPrice||0),price=Number(box.dataset.voucherPrice||0)||Math.max(0,list-500000),fmt=n=>new Intl.NumberFormat('vi-VN').format(n)+'\u0111',del=box.querySelector('[data-market-list]'),cur=box.querySelector('[data-market-current]'),st=box.querySelector('[data-market-voucher-status]'),choose=card?.querySelector('[data-market-choose]'),chooseMain=choose?.querySelector('[data-market-choose-main]'),chooseNote=choose?.querySelector('[data-market-choose-note]');if(del){del.hidden=false;del.textContent=fmt(list)}if(cur)cur.textContent=fmt(price);if(st)st.textContent='\u2713 \u0110\xE3 \xE1p d\u1EE5ng voucher th\xE0nh c\xF4ng';voucher.textContent='\u2713 \u0110\xC3 \xC1P D\u1EE4NG VOUCHER GI\u1EA2M 500K';voucher.disabled=true;if(chooseMain){const choosePrice=chooseMain.querySelector('[data-market-choose-price]'),priceK=new Intl.NumberFormat('vi-VN').format(Math.round(price/1000))+'K';chooseMain.classList.add('market-cta-price-changing');setTimeout(()=>{if(choosePrice)choosePrice.textContent=priceK;chooseMain.classList.remove('market-cta-price-changing');chooseMain.classList.add('market-cta-price-changed');setTimeout(()=>chooseMain.classList.remove('market-cta-price-changed'),650)},850)}card?.classList.add('voucher-applied');return;}
       const b=e.target.closest('.demo-trial-start');if(!b)return;e.preventDefault();openTrial(b)
     });
     document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTrial()});
   })();
   <\/script>
  </main>
 </body></html>`;
}
__name(demoCenterHtml, "demoCenterHtml");
async function onRequest2(context) {
  const { request, env } = context;
  if (request.method !== "GET" && request.method !== "HEAD") return context.next();
  const u = new URL(request.url), rawPath2 = u.pathname.replace(/\/+$/, "") || "/";
  const demo = demoThemeFromPath(rawPath2);
  let path = stripDemoPath(rawPath2, demo);
  const host2 = u.hostname.replace(/^www\./, "").toLowerCase();
  const marketHost = isTemplateMarketHost(host2);
  const trialLaunch = TRIAL_LAUNCH_HOSTS.has(host2) ? rawPath2.match(/^\/trial\/([a-zA-Z0-9]+)(?:\/(admin))?\/?$/) : null;
  if (trialLaunch) {
    try {
      const tr = await env.DB.prepare(`SELECT wt.*,s.domain,tc.demo_url,tc.template_key FROM website_trials wt JOIN sites s ON s.id=wt.site_id LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.trial_token=? LIMIT 1`).bind(trialLaunch[1]).first();
      if (!tr) return htmlResponse("<h1>Trial kh\xF4ng t\u1ED3n t\u1EA1i</h1>", 404);
      if (tr.status === "pending_activation") return htmlResponse('<main style="font-family:Arial,sans-serif;max-width:680px;margin:80px auto;padding:28px"><h1>Website d\xF9ng th\u1EED ch\u01B0a \u0111\u01B0\u1EE3c k\xEDch ho\u1EA1t</h1><p>H\xE3y quay l\u1EA1i li\xEAn k\u1EBFt k\xEDch ho\u1EA1t \u0111\xE3 nh\u1EADn \u0111\u1EC3 x\xE1c nh\u1EADn email v\xE0 t\u1EA1o m\u1EADt kh\u1EA9u Trang qu\u1EA3n tr\u1ECB. Th\u1EDDi gian 24 gi\u1EDD ch\u1EC9 b\u1EAFt \u0111\u1EA7u sau khi k\xEDch ho\u1EA1t.</p></main>', 409);
      const expired = Date.parse(String(tr.expires_at).replace(" ", "T") + "Z") <= Date.now() || tr.status === "expired";
      const publicOrigin = "https://hoangvuongtech.com";
      if (trialLaunch[2] === "admin") return Response.redirect(publicOrigin + `/admin?tenant=${encodeURIComponent(tr.domain)}&nr_trial=${encodeURIComponent(tr.trial_token)}&template=${encodeURIComponent(tr.template_key)}`, 302);
      const base = String(tr.demo_url || "/");
      return Response.redirect(publicOrigin + base + (base.includes("?") ? "&" : "?") + "nr_trial=" + encodeURIComponent(tr.trial_token), 302);
    } catch (e) {
      return htmlResponse("<h1>Kh\xF4ng th\u1EC3 m\u1EDF website d\xF9ng th\u1EED</h1>", 500);
    }
  }
  const legacyEstateMatch = rawPath2.match(/^\/demo\/(mau-[1-5])(?:\/(.*))?$/i);
  if (marketHost && legacyEstateMatch) {
    const key = legacyEstateMatch[1].toLowerCase();
    const tail = String(legacyEstateMatch[2] || "").replace(/^\/+|\/+$/g, "");
    const canonical = "/demo/bat-dong-san/" + key + "/" + (tail ? tail + "/" : "");
    return Response.redirect(u.origin + canonical + u.search, 301);
  }
  if (marketHost && rawPath2 === "/robots.txt") {
    return new Response(`User-agent: *
Allow: /
Disallow: /control-center/
Disallow: /admin/
Disallow: /activate/
Disallow: /renewal/
Disallow: /reset-password/
Disallow: /trial-checkout/
Disallow: /favorites
Disallow: /api/
Disallow: /demo/
Sitemap: https://hoangvuongtech.com/sitemap.xml
`, { headers: { "Content-Type": "text/plain; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
  }
  if (marketHost && rawPath2 === "/sitemap.xml") {
    const urls = [
      ["https://hoangvuongtech.com/", "1.0", ""],
      ["https://hoangvuongtech.com/templates/", "0.9", ""],
      ["https://hoangvuongtech.com/templates/bat-dong-san/", "0.85", ""],
      ["https://hoangvuongtech.com/templates/tin-tuc/", "0.85", ""],
      ["https://hoangvuongtech.com/templates/dich-vu/", "0.85", ""],
      ["https://hoangvuongtech.com/templates/game/", "0.85", ""],
      ["https://hoangvuongtech.com/templates/ban-hang/", "0.85", ""]
    ];
    try {
      const catalog = await loadTemplateCatalog(env, "");
      for (const t of catalog) {
        const cat = String(t?.category || "").trim(), slug = String(t?.seo_slug || "").trim();
        if (cat && slug && t?.is_active !== 0) urls.push([`https://hoangvuongtech.com/templates/${encodeURIComponent(cat)}/${encodeURIComponent(slug)}/`, "0.80", String(t?.updated_at || "").slice(0, 10)]);
      }
    } catch (e) {
    }
    const unique = [...new Map(urls.map((x) => [x[0], x])).values()];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${unique.map(([loc, p, lastmod]) => `<url><loc>${loc}</loc>${/^\d{4}-\d{2}-\d{2}$/.test(lastmod || "") ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>${p}</priority></url>`).join("")}</urlset>`;
    return new Response(xml, { headers: { "Content-Type": "application/xml; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
  }
  if (!marketHost && (rawPath2 === "/templates" || rawPath2.startsWith("/templates/") || rawPath2 === "/demo" || rawPath2.startsWith("/demo/"))) {
    let target = rawPath2;
    if (rawPath2 === "/demo") target = "/templates/bat-dong-san/";
    else if (/^\/demo\/mau-[1-5](?:\/|$)/.test(rawPath2)) {
      const legacy = rawPath2.match(/^\/demo\/(mau-[1-5])/i)?.[1] || "mau-1";
      target = `/demo/bat-dong-san/${legacy}/`;
    }
    return Response.redirect("https://hoangvuongtech.com" + target + u.search, 301);
  }
  if (marketHost && (rawPath2 === "/demo/tin-tuc-1" || rawPath2.startsWith("/demo/tin-tuc-1/"))) {
    const oldSlug = rawPath2.replace(/^\/demo\/tin-tuc-1\/?/, "").replace(/^\/+|\/+$/g, "");
    const target = oldSlug ? `/demo/tin-tuc/mau-1/${oldSlug}` : "/demo/tin-tuc/mau-1/";
    return Response.redirect("https://hoangvuongtech.com" + target, 301);
  }
  if (marketHost && demo === "legacy-center") {
    return Response.redirect("https://hoangvuongtech.com/templates/", 302);
  }
  if (marketHost && demo === "marketplace") {
    const detailMatch = rawPath2.match(/^\/templates\/([^/]+)\/([^/]+)\/?$/i);
    if (detailMatch) {
      const cat = decodeURIComponent(detailMatch[1]), slug = decodeURIComponent(detailMatch[2]);
      const all = await loadTemplateCatalog(env, cat);
      const t = all.find((x) => String(x.seo_slug || "") === slug);
      if (t) return htmlNoCache(templateSeoDetailHtml(t));
      return new Response('<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Kh\xF4ng t\xECm th\u1EA5y giao di\u1EC7n | HoangVuongTech</title></head><body><main><h1>Kh\xF4ng t\xECm th\u1EA5y giao di\u1EC7n</h1><p><a href="/templates/">Quay l\u1EA1i kho giao di\u1EC7n</a></p></main></body></html>', { status: 404, headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store" } });
    }
    const category = marketCategoryFromPath(rawPath2);
    if (category && !CATEGORY_NAMES[category]) return Response.redirect("https://hoangvuongtech.com/templates/", 302);
    const catalog = await loadTemplateCatalog(env, category);
    return htmlNoCache(demoCenterHtml("HoangVuongTech", catalog, category));
  }
  if (marketHost && rawPath2 === "/") {
    const r = await env.ASSETS.fetch(new URL("/marketing.html", u.origin));
    let body2 = await r.text();
    const seo = `<title>Thi\u1EBFt K\u1EBF Website Tr\u1ECDn G\xF3i Gi\xE1 R\u1EBB, D\u1EC5 S\u1EED D\u1EE5ng | HoangVuongTech</title>
<meta name="description" content="Thi\u1EBFt k\u1EBF website tr\u1ECDn g\xF3i t\u1EEB 1.499.000\u0111/n\u0103m, d\u1EC5 s\u1EED d\u1EE5ng, kh\xF4ng c\u1EA7n bi\u1EBFt code. D\xF9ng th\u1EED mi\u1EC5n ph\xED 1 ng\xE0y, kh\xE1ch m\u1EDBi \u01B0u \u0111\xE3i 500K, t\u1EB7ng t\xEAn mi\u1EC1n v\xE0 hosting.">
<link rel="canonical" href="https://hoangvuongtech.com/">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="HoangVuongTech">
<meta property="og:title" content="Thi\u1EBFt K\u1EBF Website Tr\u1ECDn G\xF3i T\u1EEB 1.499K | HoangVuongTech">
<meta property="og:description" content="Website d\u1EC5 s\u1EED d\u1EE5ng, d\xF9ng th\u1EED mi\u1EC5n ph\xED 1 ng\xE0y. T\u1EB7ng t\xEAn mi\u1EC1n, hosting v\xE0 \u01B0u \u0111\xE3i 500K cho kh\xE1ch \u0111\u0103ng k\xFD l\u1EA7n \u0111\u1EA7u.">
<meta property="og:url" content="https://hoangvuongtech.com/">
<meta property="og:image" content="https://hoangvuongtech.com/assets/marketing-demo.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Thi\u1EBFt K\u1EBF Website Tr\u1ECDn G\xF3i T\u1EEB 1.499K | HoangVuongTech">
<meta name="twitter:description" content="D\xF9ng th\u1EED website mi\u1EC5n ph\xED 1 ng\xE0y, qu\u1EA3n tr\u1ECB d\u1EC5 d\xF9ng, t\u1EB7ng t\xEAn mi\u1EC1n v\xE0 hosting, kh\xE1ch m\u1EDBi \u01B0u \u0111\xE3i 500K.">
<meta name="twitter:image" content="https://hoangvuongtech.com/assets/marketing-demo.webp">
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "Organization", "@id": "https://hoangvuongtech.com/#organization", "name": "HoangVuongTech", "url": "https://hoangvuongtech.com/", "email": "hoangquocvuong.hp89@gmail.com", "telephone": "+84389986287", "logo": "https://hoangvuongtech.com/favicons/favicon-16x16.png", "contactPoint": { "@type": "ContactPoint", "telephone": "+84389986287", "contactType": "customer service", "areaServed": "VN", "availableLanguage": ["vi"] } }, { "@type": "WebSite", "@id": "https://hoangvuongtech.com/#website", "url": "https://hoangvuongtech.com/", "name": "HoangVuongTech", "publisher": { "@id": "https://hoangvuongtech.com/#organization" } }, { "@type": "Service", "@id": "https://hoangvuongtech.com/#service", "name": "Thi\u1EBFt k\u1EBF website tr\u1ECDn g\xF3i", "serviceType": ["Thi\u1EBFt k\u1EBF website", "Thi\u1EBFt k\u1EBF website gi\xE1 r\u1EBB", "Thi\u1EBFt k\u1EBF website b\xE1n h\xE0ng", "Thi\u1EBFt k\u1EBF website b\u1EA5t \u0111\u1ED9ng s\u1EA3n", "Thi\u1EBFt k\u1EBF website doanh nghi\u1EC7p", "Thi\u1EBFt k\u1EBF website tin t\u1EE9c"], "description": "D\u1ECBch v\u1EE5 thi\u1EBFt k\u1EBF website tr\u1ECDn g\xF3i d\u1EC5 s\u1EED d\u1EE5ng, c\xF3 t\xEAn mi\u1EC1n, hosting, trang qu\u1EA3n tr\u1ECB v\xE0 tr\u1EA3i nghi\u1EC7m mi\u1EC5n ph\xED 1 ng\xE0y.", "provider": { "@id": "https://hoangvuongtech.com/#organization" }, "areaServed": { "@type": "Country", "name": "Vi\u1EC7t Nam" }, "url": "https://hoangvuongtech.com/", "offers": { "@type": "Offer", "priceCurrency": "VND", "price": "1499000", "description": "Gi\xE1 t\u1EEB 1.499.000\u0111/n\u0103m; \u01B0u \u0111\xE3i kh\xE1ch \u0111\u0103ng k\xFD l\u1EA7n \u0111\u1EA7u 500.000\u0111 theo ch\u01B0\u01A1ng tr\xECnh \xE1p d\u1EE5ng." } }, { "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "T\xF4i c\xF3 c\u1EA7n bi\u1EBFt l\u1EADp tr\xECnh \u0111\u1EC3 s\u1EED d\u1EE5ng website kh\xF4ng?", "acceptedAnswer": { "@type": "Answer", "text": "Kh\xF4ng. Website c\xF3 trang qu\u1EA3n tr\u1ECB d\u1EC5 s\u1EED d\u1EE5ng \u0111\u1EC3 \u0111\u0103ng b\xE0i, h\xECnh \u1EA3nh v\xE0 c\u1EADp nh\u1EADt n\u1ED9i dung c\u01A1 b\u1EA3n." } }, { "@type": "Question", "name": "C\xF3 \u0111\u01B0\u1EE3c d\xF9ng th\u1EED website tr\u01B0\u1EDBc khi \u0111\u0103ng k\xFD kh\xF4ng?", "acceptedAnswer": { "@type": "Answer", "text": "C\xF3. Kh\xE1ch h\xE0ng c\xF3 th\u1EC3 ch\u1ECDn m\u1EABu v\xE0 tr\u1EA3i nghi\u1EC7m website mi\u1EC5n ph\xED 1 ng\xE0y tr\u01B0\u1EDBc khi quy\u1EBFt \u0111\u1ECBnh \u0111\u0103ng k\xFD." } }, { "@type": "Question", "name": "G\xF3i website c\xF3 t\xEAn mi\u1EC1n v\xE0 hosting kh\xF4ng?", "acceptedAnswer": { "@type": "Answer", "text": "C\xF3. G\xF3i website bao g\u1ED3m t\xEAn mi\u1EC1n ri\xEAng v\xE0 hosting theo ch\xEDnh s\xE1ch c\u1EE7a g\xF3i." } }, { "@type": "Question", "name": "Kh\xE1ch \u0111\u0103ng k\xFD l\u1EA7n \u0111\u1EA7u c\xF3 \u01B0u \u0111\xE3i g\xEC?", "acceptedAnswer": { "@type": "Answer", "text": "Kh\xE1ch \u0111\u0103ng k\xFD l\u1EA7n \u0111\u1EA7u \u0111\u01B0\u1EE3c \u01B0u \u0111\xE3i 500.000\u0111 theo ch\u01B0\u01A1ng tr\xECnh \xE1p d\u1EE5ng." } }] }] })}<\/script>`;
    body2 = body2.replace(/<title>.*?<\/title>/is, "").replace("</head>", seo + "</head>");
    return new Response(body2, { status: 200, headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=300" } });
  }
  if (path.startsWith("/api") || path.startsWith("/assets") || path.startsWith("/admin") || path.startsWith("/control-center") || path.startsWith("/activate") || path.startsWith("/renewal")) return context.next();
  const publicProductShowroom = marketHost && demo === "san-pham-1" && !u.searchParams.get("nr_trial");
  if (publicProductShowroom) {
    const isProductDetail = /^\/san-pham\/[^/]+\.html$/i.test(path);
    const relTitle = isProductDetail ? path.split("/").pop().replace(/\.html$/i, "").split("-").filter(Boolean).map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(" ") : "";
    const title = isProductDetail ? `${relTitle} | Product Store \xB7 Affiliate` : "Product Store \xB7 Affiliate | Demo website b\xE1n h\xE0ng";
    const description = isProductDetail ? `Chi ti\u1EBFt s\u1EA3n ph\u1EA9m demo ${relTitle} tr\xEAn giao di\u1EC7n Product Store \xB7 Affiliate.` : "Demo giao di\u1EC7n website catalog, review s\u1EA3n ph\u1EA9m v\xE0 affiliate v\u1EDBi gi\xE1, voucher, rating, gallery v\xE0 trang chi ti\u1EBFt s\u1EA3n ph\u1EA9m.";
    let html = inject(INDEX_HTML, metaTags({ title, description, image: "/assets/demo/san-pham-1-preview-real.webp", url: u.origin + rawPath2, type: isProductDetail ? "article" : "website" }));
    html = html.replace(/<meta name="robots"[^>]*>/ig, "").replace("</head>", '<meta name="robots" content="noindex,follow"></head>');
    return htmlNoCache(demoInject(html, demo, null));
  }
  let site, trialCtx = null;
  const trialToken = String(u.searchParams.get("nr_trial") || "");
  if (marketHost && trialToken && (/^mau-[1-5]$/.test(demo) || /^tin-tuc-[1-4]$/.test(demo) || /^dich-vu-\d+$/.test(demo) || demo === "game-1" || demo === "san-pham-1")) {
    try {
      trialCtx = await env.DB.prepare(`SELECT wt.*,s.domain,s.name,s.preset,s.template_key FROM website_trials wt JOIN sites s ON s.id=wt.site_id WHERE wt.trial_token=? LIMIT 1`).bind(trialToken).first();
    } catch (e) {
    }
    if (trialCtx && trialCtx.status !== "pending_activation") {
      const expired = Date.parse(String(trialCtx.expires_at).replace(" ", "T") + "Z") <= Date.now() || trialCtx.status === "expired";
      if (expired) trialCtx.status = "expired";
      site = await env.DB.prepare(`SELECT * FROM sites WHERE id=? AND status='active'`).bind(trialCtx.site_id).first();
    }
  }
  if (!site && marketHost && (/^mau-[1-5]$/.test(demo) || /^tin-tuc-[1-4]$/.test(demo) || /^dich-vu-\d+$/.test(demo) || demo === "game-1" || demo === "san-pham-1")) {
    const demoReq = new Request("https://batdongsan2027.org.uk" + path + u.search, request);
    site = await siteFor2(env, demoReq);
  } else if (!site) {
    site = await siteFor2(env, request);
  }
  if (!site) return context.next();
  const origin = u.origin, siteName = String(site.name || "B\u1EA5t \u0111\u1ED9ng s\u1EA3n").replace(/\s*Demo\s*$/i, "").trim();
  if (/^tin-tuc-[1-4]$/.test(demo) && /^\/[^/]+\.html$/i.test(path)) {
    const n = demo.split("-").pop(), slug = path.slice(1, -5);
    const niceTitle = slug.split("-").filter(Boolean).map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(" ");
    const canonical = `${origin}/demo/tin-tuc/mau-${n}/${slug}.html`;
    const preview = n === "1" ? "/assets/demo/tin-tuc-1-preview-v2.png" : `/assets/demo/tin-tuc-${n}-preview.png`;
    let html = inject(INDEX_HTML, metaTags({
      title: `${niceTitle} | Tin t\u1EE9c M\u1EABu ${n}`,
      description: `B\xE0i vi\u1EBFt demo ${niceTitle} tr\xEAn giao di\u1EC7n Tin t\u1EE9c M\u1EABu ${n} c\u1EE7a HoangVuongTech.`,
      image: preview,
      url: canonical,
      type: "article"
    }));
    html = html.replace("</head>", '<meta name="robots" content="noindex,follow"></head>');
    return htmlNoCache(demoInject(html, demo, trialCtx));
  }
  if ((demo === "game-1" || site.preset === "game_clash_1") && (path === "/about" || path === "/terms")) {
    const isTerms = path === "/terms";
    const title = isTerms ? "\u0110i\u1EC1u kho\u1EA3n s\u1EED d\u1EE5ng | COC Base Portal" : "Th\xF4ng tin | COC Base Portal";
    const description = isTerms ? "\u0110i\u1EC1u kho\u1EA3n s\u1EED d\u1EE5ng c\u1EE7a COC Base Portal." : "Th\xF4ng tin v\u1EC1 COC Base Portal v\xE0 th\u01B0 vi\u1EC7n base Clash of Clans c\u1ED9ng \u0111\u1ED3ng.";
    let html = inject(INDEX_HTML, metaTags({ title, description, image: "/assets/demo/game-clash-1-preview.png", url: demo ? origin + rawPath2 : origin + path, type: "website" }));
    if (demo) html = html.replace("</head>", '<meta name="robots" content="noindex,follow"></head>');
    return htmlNoCache(demo ? demoInject(html, demo, trialCtx) : themedHtml(html, "game_clash_1"));
  }
  if ((demo === "game-1" || site.preset === "game_clash_1") && (path === "/bases" || path === "/free-bases" || path === "/premium-bases" || /^\/base\/[^/]+\.html$/i.test(path))) {
    const article = /^\/base\/[^/]+\.html$/i.test(path);
    const slug = article ? path.split("/").pop().replace(/\.html$/i, "") : "";
    const nice = slug ? slug.split("-").filter(Boolean).map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(" ") : "";
    const title = article ? `${nice} | Clash of Clans Base` : "Clash of Clans Base Layouts | Community Base Portal";
    const desc = article ? `Chi ti\u1EBFt ${nice}: \u1EA3nh base, vote, view, download v\xE0 copy link.` : "Clash of Clans community bases cho Town Hall, Builder Hall v\xE0 Clan Capital v\u1EDBi b\u1ED9 l\u1ECDc nhanh kh\xF4ng t\u1EA3i l\u1EA1i to\xE0n trang.";
    let html = inject(INDEX_HTML, metaTags({ title, description: desc, image: "/assets/demo/game-clash-1-preview.png", url: demo ? origin + rawPath2 : origin + path, type: article ? "article" : "website" }));
    if (demo) html = html.replace("</head>", '<meta name="robots" content="noindex,follow"></head>');
    return htmlNoCache(demo ? demoInject(html, demo, trialCtx) : themedHtml(html, site.preset));
  }
  if (path === "/") {
    const hero = await env.DB.prepare(`SELECT * FROM posts WHERE site_id=? AND status='published' AND image<>'' ORDER BY featured DESC,id DESC LIMIT 1`).bind(site.id).first();
    const title = String(site.seo_title || "").trim() || `${siteName} - B\u1EA5t \u0111\u1ED9ng s\u1EA3n & tin t\u1EE9c th\u1ECB tr\u01B0\u1EDDng`, desc = String(site.seo_description || "").trim() || `${siteName} - tin \u0111\u0103ng b\u1EA5t \u0111\u1ED9ng s\u1EA3n, nh\xE0 \u0111\u1EA5t b\xE1n, cho thu\xEA v\xE0 th\xF4ng tin th\u1ECB tr\u01B0\u1EDDng m\u1EDBi nh\u1EA5t.`;
    const seoImage = String(site.seo_og_image || "").trim() || hero?.image || "";
    let html = inject(INDEX_HTML, metaTags({ title, description: desc, image: seoImage, url: demo && demo !== "marketplace" && demo !== "legacy-center" ? origin + demoPrefixForPath(rawPath2, demo) + "/" : origin + "/" }));
    if (!demo && Number(site.seo_index) === 0) html = html.replace(/<meta name="robots"[^>]*>/ig, "").replace("</head>", '<meta name="robots" content="noindex,follow"></head>');
    return demo ? htmlNoCache(demoInject(html, demo, trialCtx)) : htmlResponse(themedHtml(html, site.preset));
  }
  if (path === "/favorites") {
    const title = `Tin \u0111\xE3 l\u01B0u - ${siteName}`;
    const desc = `Danh s\xE1ch b\u1EA5t \u0111\u1ED9ng s\u1EA3n \u0111\xE3 l\u01B0u tr\xEAn tr\xECnh duy\u1EC7t c\u1EE7a b\u1EA1n t\u1EA1i ${siteName}.`;
    let html = inject(FAVORITES_HTML, metaTags({ title, description: desc, image: "", url: origin + (demo ? demoPrefixForPath(rawPath2, demo) : "") + "/favorites" }));
    html = html.replace("</head>", '<meta name="robots" content="noindex,follow"></head>');
    return htmlNoCache(demo ? demoInject(html, demo, trialCtx) : themedHtml(html, site.preset));
  }
  if (path === "/property" && u.searchParams.get("id")) {
    const p = await env.DB.prepare(`SELECT * FROM posts WHERE id=? AND site_id=? AND status='published'`).bind(+u.searchParams.get("id"), site.id).first();
    if (p) {
      const dest = postUrl(origin, p).slice(origin.length);
      return Response.redirect(origin + (demo ? demoPrefixForPath(rawPath2, demo) : "") + dest, 301);
    }
  }
  if (path === "/listings") {
    const tx = u.searchParams.get("transaction") || "";
    u.searchParams.delete("transaction");
    const base = tx === "rent" ? "/cho-thue/" : tx === "buy" ? "/mua/" : tx === "sale" ? "/ban/" : "/bat-dong-san/";
    const qs = u.searchParams.toString();
    return Response.redirect(origin + (demo ? demoPrefixForPath(rawPath2, demo) : "") + base + (qs ? "?" + qs : ""), 301);
  }
  const m = path.match(/^\/(mua|ban|mua-ban|cho-thue|bat-dong-san|tin-tuc)\/([^/]+)-p(\d+)$/i);
  if (m) {
    let p = await env.DB.prepare(`SELECT * FROM posts WHERE id=? AND site_id=? AND status='published'`).bind(+m[3], site.id).first();
    if (!p && demo && /^mau-[1-5]$/.test(demo) && Number(m[3]) >= 91e4) {
      p = { id: +m[3], title: String(m[2] || "B\u1EA5t \u0111\u1ED9ng s\u1EA3n demo").replace(/-/g, " "), type: "property", image: "", content: "", transaction: m[1].toLowerCase() === "cho-thue" ? "rent" : m[1].toLowerCase() === "mua" ? "buy" : "sale" };
    }
    if (!p) return htmlResponse("<h1>404 - Kh\xF4ng t\xECm th\u1EA5y b\xE0i vi\u1EBFt</h1>", 404);
    const canonical = postUrl(origin, p);
    if (!demo && origin + path !== canonical) return Response.redirect(canonical, 301);
    const loc = [p.district, p.province].filter(Boolean).join(", "), detail = [p.price, p.area, loc].filter(Boolean).join(" \xB7 ");
    const desc = (detail ? detail + ". " : "") + (stripHtml(p.content).slice(0, 150) || `Th\xF4ng tin ${p.title} tr\xEAn ${siteName}.`);
    {
      const html = inject(PROPERTY_HTML, metaTags({ title: `${p.title} | ${siteName}`, description: desc, image: p.image || "", url: demo ? origin + rawPath2 : canonical, type: "article" }));
      return htmlResponse(demo ? demoInject(html, demo, trialCtx) : themedHtml(html, site.preset));
    }
  }
  if (path === "/mua-ban") {
    const qs = u.searchParams.toString();
    return Response.redirect(origin + (demo ? demoPrefixForPath(rawPath2, demo) : "") + "/ban/" + (qs ? "?" + qs : ""), 301);
  }
  if (["/mua", "/ban", "/cho-thue", "/bat-dong-san"].includes(path)) {
    const tx = path === "/mua" ? "buy" : path === "/ban" ? "sale" : path === "/cho-thue" ? "rent" : "", label = tx === "buy" ? "B\u1EA5t \u0111\u1ED9ng s\u1EA3n c\u1EA7n mua" : tx === "sale" ? "Nh\xE0 \u0111\u1EA5t b\xE1n" : tx === "rent" ? "B\u1EA5t \u0111\u1ED9ng s\u1EA3n cho thu\xEA" : "B\u1EA5t \u0111\u1ED9ng s\u1EA3n";
    let hero;
    if (tx) hero = await env.DB.prepare(`SELECT image FROM posts WHERE site_id=? AND status='published' AND type='property' AND "transaction"=? AND image<>'' ORDER BY featured DESC,id DESC LIMIT 1`).bind(site.id, tx).first();
    else hero = await env.DB.prepare(`SELECT image FROM posts WHERE site_id=? AND status='published' AND type='property' AND image<>'' ORDER BY featured DESC,id DESC LIMIT 1`).bind(site.id).first();
    {
      const html = inject(LISTINGS_HTML, metaTags({ title: `${label} | ${siteName}`, description: `${label} m\u1EDBi nh\u1EA5t tr\xEAn ${siteName}. T\xECm ki\u1EBFm theo lo\u1EA1i b\u1EA5t \u0111\u1ED9ng s\u1EA3n, t\u1EC9nh th\xE0nh, qu\u1EADn huy\u1EC7n v\xE0 nhu c\u1EA7u.`, image: hero?.image || "", url: demo ? origin + rawPath2 + "/" : origin + path + "/" }));
      return htmlResponse(demo ? demoInject(html, demo, trialCtx) : themedHtml(html, site.preset));
    }
  }
  return context.next();
}
__name(onRequest2, "onRequest");

// ../.wrangler/tmp/pages-ofy2WS/functionsRoutes-0.9756423996186062.mjs
var routes = [
  {
    routePath: "/api/:path*",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/:path*",
    mountPath: "/",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  }
];

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
