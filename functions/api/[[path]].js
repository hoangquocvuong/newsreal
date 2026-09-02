
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8',...headers}})}
function cookies(req){return Object.fromEntries((req.headers.get('Cookie')||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),decodeURIComponent(x.slice(i+1))]}))}
async function sha256(s){const b=new TextEncoder().encode(s),h=await crypto.subtle.digest('SHA-256',b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function nrSlug(v=''){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,180)}
async function ensurePublisherTables(env){
  try{await env.DB.prepare(`ALTER TABLE posts ADD COLUMN extra_json TEXT NOT NULL DEFAULT '{}'`).run()}catch(e){}
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS publisher_imports(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    external_key TEXT NOT NULL,
    slug TEXT NOT NULL,
    source_url TEXT NOT NULL DEFAULT '',
    payload_hash TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id,external_key),
    UNIQUE(site_id,slug),
    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
  )`).run();
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_publisher_imports_post ON publisher_imports(post_id)`).run()}catch(e){}
}
function publisherAuthorized(request,env){
  const auth=String(request.headers.get('Authorization')||'');
  const token=auth.startsWith('Bearer ')?auth.slice(7).trim():String(request.headers.get('X-Publisher-Token')||'').trim();
  return !!env.CONTENT_PUBLISHER_SECRET&&token===String(env.CONTENT_PUBLISHER_SECRET);
}
async function publisherSite(env,domain){
  const h=String(domain||'').replace(/^https?:\/\//i,'').split('/')[0].replace(/^www\./,'').toLowerCase().trim();
  if(!h)return null;
  return env.DB.prepare(`SELECT * FROM sites WHERE lower(replace(domain,'www.',''))=? AND status='active' LIMIT 1`).bind(h).first();
}
async function body(r){try{return await r.json()}catch{return {}}} function tok(){return crypto.randomUUID()+crypto.randomUUID()}
function host(req){const u=new URL(req.url);return req.headers.get('X-Tenant')||u.searchParams.get('tenant')||u.hostname}
async function ensureSitePublicSettings(env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS site_public_settings(
    site_id INTEGER PRIMARY KEY,
    contact_email TEXT NOT NULL DEFAULT '',
    settings_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
  )`).run();
  try{await env.DB.prepare(`ALTER TABLE site_public_settings ADD COLUMN settings_json TEXT NOT NULL DEFAULT '{}'`).run()}catch(e){}
}
async function ensureGameStatsTables(env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS game_base_stats(
    site_id INTEGER NOT NULL,
    slug TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    vote_sum INTEGER NOT NULL DEFAULT 0,
    vote_count INTEGER NOT NULL DEFAULT 0,
    downloads INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(site_id,slug),
    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS game_base_votes(
    site_id INTEGER NOT NULL,
    slug TEXT NOT NULL,
    voter_key TEXT NOT NULL,
    vote INTEGER NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(site_id,slug,voter_key),
    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
  )`).run();
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_game_stats_site_updated ON game_base_stats(site_id,updated_at DESC)`).run()}catch(e){}
}
function nrGameStatsPublic(row){
  const count=Number(row?.vote_count||0),sum=Number(row?.vote_sum||0);
  return {views:Number(row?.views||0),downloads:Number(row?.downloads||0),vote_count:count,rating:count?Number((sum/count).toFixed(1)):0};
}

async function siteFor(env,req){
  await ensureSitePublicSettings(env);
  const h=host(req).replace(/^www\./,'').toLowerCase();
  const baseSql=`SELECT s.*,
    coalesce(ps.contact_email,'') contact_email,
    coalesce(ps.settings_json,'{}') template_settings_json,
    coalesce(cp.phone,'') customer_phone,
    coalesce(cp.email,'') customer_email,
    coalesce((SELECT email FROM users u WHERE u.site_id=s.id AND u.role='admin' ORDER BY u.id LIMIT 1),'') admin_email
    FROM sites s
    LEFT JOIN site_public_settings ps ON ps.site_id=s.id
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id`;
  let s=await env.DB.prepare(baseSql+` WHERE lower(s.domain)=? AND s.status='active'`).bind(h).first();
  if(!s&&(h==='localhost'||h.endsWith('.pages.dev')))s=await env.DB.prepare(baseSql+` WHERE s.status='active' ORDER BY s.id LIMIT 1`).first();
  if(s){
    // Sites created before V9.3.5 also get useful defaults automatically.
    s.phone=String(s.phone||s.customer_phone||'');
    s.zalo=String(s.zalo||s.customer_phone||'');
    s.email=String(s.contact_email||s.email||s.customer_email||s.admin_email||'');
    s.contact_email=s.email;
  }
  return s
}
async function userFor(env,req,site){
  const auth=req.headers.get('Authorization')||'';
  const bearer=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
  const t=bearer||cookies(req).nr_session;
  if(!t||!site)return null;
  return env.DB.prepare(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.site_id=? AND s.expires_at>datetime('now')`).bind(t,site.id).first();
}
async function ensurePerformanceIndexes(env){
 try{await env.DB.batch([
  env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_sites_domain_status ON sites(domain,status)`),
  env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_public_latest ON posts(site_id,status,id DESC)`),
  env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_public_type_latest ON posts(site_id,status,type,id DESC)`),
  env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_public_category ON posts(site_id,status,category,id DESC)`),
  env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_public_views ON posts(site_id,status,views DESC,id DESC)`),
  env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pageviews_site_created ON pageviews(site_id,created_at)`),
  env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_pageviews_site_post ON pageviews(site_id,post_id,created_at)`)
 ])}catch(e){console.log('performance indexes:',e?.message||e)}
}
function publicCache(seconds=60,stale=300){return {'Cache-Control':`public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${stale}`,'CDN-Cache-Control':`public, max-age=${seconds}, stale-while-revalidate=${stale}`}}
async function stats(env,id){
 const pv=await env.DB.prepare(`SELECT count(*) posts,coalesce(sum(views),0) views FROM posts WHERE site_id=? AND status='published'`).bind(id).first();
 const today=(await env.DB.prepare(`SELECT count(*) c FROM pageviews WHERE site_id=? AND created_at>=datetime('now','start of day')`).bind(id).first())?.c||0;
 return {posts:Number(pv?.posts||0),views:Number(pv?.views||0),today:Number(today||0)}
}


function isoDate(d){return d.toISOString().slice(0,10)}
function addMonthsISO(start,months){
  const raw=String(start||'').slice(0,10);
  const base=/^\d{4}-\d{2}-\d{2}$/.test(raw)?new Date(raw+'T12:00:00Z'):new Date();
  const day=base.getUTCDate();
  const d=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth()+Number(months||0),1,12));
  const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0,12)).getUTCDate();
  d.setUTCDate(Math.min(day,last));
  return isoDate(d);
}

function renewalYearsCovered(serviceExpiry,domainExpiry,maxYears=10){
  const start=String(serviceExpiry||'').slice(0,10),end=String(domainExpiry||'').slice(0,10);
  if(!start||!end||end<=start)return 0;
  let years=0;
  for(let y=1;y<=maxYears;y++){
    if(addMonthsISO(start,y*12)<=end)years=y;
    else break;
  }
  return years;
}
function htmlEsc(v=''){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]))}
async function sendMail(env,{to,subject,html}){
  if(!env.RESEND_API_KEY)return {ok:false,configured:false,error:'Thiếu RESEND_API_KEY'};
  const from=String(env.MAIL_FROM||'NEWSREAL <onboarding@resend.dev>').trim();
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject,html})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)return {ok:false,configured:true,error:d?.message||`Email API lỗi ${r.status}`};
  return {ok:true,configured:true,id:d?.id||''};
}
async function ensureServiceDocuments(env){
  try{await env.DB.prepare(`ALTER TABLE sites ADD COLUMN favicon_url TEXT DEFAULT ''`).run()}catch(e){}
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS service_documents(
    id INTEGER PRIMARY KEY AUTOINCREMENT,site_id INTEGER NOT NULL,document_type TEXT NOT NULL DEFAULT 'activation_confirmation',
    document_code TEXT NOT NULL UNIQUE,document_version TEXT NOT NULL DEFAULT '1.0',customer_email TEXT DEFAULT '',
    content_html TEXT NOT NULL,sent_customer_at TEXT,sent_master_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE)`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_service_documents_site ON service_documents(site_id,id DESC)`).run();
}
function fmtMoneyVN(v){return Number(v||0).toLocaleString('vi-VN')+'đ'}
async function createActivationServiceDocument(env,siteId,loginEmail){
  await ensureServiceDocuments(env);await ensureCustomerTables(env);await ensureTemplateCatalog(env);
  const row=await env.DB.prepare(`SELECT s.id,s.name,s.domain,s.template_key,s.preset,cp.full_name,cp.phone,cp.company,
    ss.plan_name,ss.sale_price,ss.payment_status,ss.started_at,ss.expires_at,
    coalesce(sp.term_months,12) term_months,coalesce(sp.first_price,ss.sale_price,0) first_price,coalesce(sp.renewal_price,0) renewal_price,
    coalesce(tc.name,s.preset) template_name
    FROM sites s LEFT JOIN customer_profiles cp ON cp.site_id=s.id LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id LEFT JOIN template_catalog tc ON tc.template_key=s.template_key WHERE s.id=? LIMIT 1`).bind(siteId).first();
  if(!row)return null;
  const stamp=new Date().toISOString().slice(0,10).replaceAll('-','');
  const code=`NR-${stamp}-${String(siteId).padStart(5,'0')}`;
  const providerEmail=String(env.MASTER_NOTIFY_EMAIL||'hoangquocvuong.hp89@gmail.com').trim();
  const providerPhone=String(env.SUPPORT_PHONE||'0389986287').trim();
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>${htmlEsc(code)}</title></head><body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:24px;color:#172033"><div style="max-width:760px;margin:auto;background:#fff;border:1px solid #dfe6ef;border-radius:16px;padding:32px"><div style="font-size:12px;font-weight:700;color:#1769ff">HOANGVUONGTECH · NEWSREAL</div><h1 style="margin:8px 0 4px">Biên bản xác nhận đăng ký & kích hoạt dịch vụ website</h1><p style="color:#667085;margin-top:0">Mã hồ sơ: <b>${htmlEsc(code)}</b> · Phiên bản 1.0</p><hr style="border:0;border-top:1px solid #e7ebf0"><h3>1. Thông tin khách hàng</h3><p>Họ tên: <b>${htmlEsc(row.full_name||'')}</b><br>Email đăng nhập: <b>${htmlEsc(loginEmail||'')}</b><br>Điện thoại: ${htmlEsc(row.phone||'')}<br>Công ty/Thương hiệu: ${htmlEsc(row.company||'—')}</p><h3>2. Thông tin website</h3><p>Website: <b>${htmlEsc(row.name||'')}</b><br>Domain: <b>${htmlEsc(row.domain||'')}</b><br>Giao diện: <b>${htmlEsc(row.template_name||row.template_key||row.preset||'')}</b><br>Gói dịch vụ: <b>${htmlEsc(row.plan_name||'Gói website trọn gói')}</b></p><h3>3. Chi phí & thời hạn</h3><p>Giá năm đầu: <b>${fmtMoneyVN(row.first_price||row.sale_price)}</b><br>Giá gia hạn dự kiến: <b>${fmtMoneyVN(row.renewal_price)} / ${Number(row.term_months||12)} tháng</b><br>Trạng thái thanh toán: <b>${htmlEsc(row.payment_status||'unpaid')}</b><br>Thời hạn dịch vụ: ${htmlEsc(row.started_at||'')} → ${htmlEsc(row.expires_at||'')}</p><h3>4. Phạm vi cung cấp</h3><p>HoangVuongTech cung cấp website theo giao diện đã chọn, Trang quản trị nội dung, hosting trong thời hạn gói và hỗ trợ bàn giao/vận hành theo thông tin dịch vụ đã đăng ký. Tên miền được quản lý theo hồ sơ dịch vụ thực tế của website.</p><h3>5. Dữ liệu & nội dung</h3><p>Khách hàng chịu trách nhiệm đối với nội dung tự đăng tải. Dữ liệu website được duy trì trong thời gian dịch vụ còn hiệu lực và theo chính sách sao lưu/vận hành của hệ thống.</p><h3>6. Gia hạn</h3><p>Hệ thống không tự động trừ tiền. Trước khi hết hạn, khách hàng sẽ được thông báo để xác nhận nhu cầu gia hạn. Mức giá gia hạn áp dụng theo hồ sơ dịch vụ hoặc thông báo tại thời điểm gia hạn.</p><h3>7. Xác nhận điện tử</h3><p>Biên bản này được tạo tự động khi khách hoàn tất kích hoạt bằng email đăng nhập và tự thiết lập mật khẩu quản trị. Thời điểm tạo: <b>${new Date().toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}</b>.</p><div style="margin-top:28px;padding:16px;background:#f7faff;border-radius:10px"><b>HoangVuongTech</b><br>Email: ${htmlEsc(providerEmail)} · Điện thoại: ${htmlEsc(providerPhone)}</div><p style="font-size:12px;color:#98a2b3;margin-top:18px">Đây là bản ghi xác nhận dịch vụ điện tử phục vụ quản lý hồ sơ và bàn giao. Nếu dùng như hợp đồng có giá trị pháp lý đầy đủ, nên được rà soát điều khoản bởi tư vấn pháp lý trước khi phát hành chính thức.</p></div></body></html>`;
  let existing=await env.DB.prepare(`SELECT id,document_code FROM service_documents WHERE site_id=? AND document_type='activation_confirmation' ORDER BY id DESC LIMIT 1`).bind(siteId).first();
  let docId=existing?.id;
  if(!docId){const ins=await env.DB.prepare(`INSERT INTO service_documents(site_id,document_type,document_code,customer_email,content_html) VALUES(?,?,?,?,?)`).bind(siteId,'activation_confirmation',code,loginEmail||'',html).run();docId=ins.meta?.last_row_id;}
  else return existing;
  const sentCustomer=loginEmail?await sendMail(env,{to:loginEmail,subject:`HoangVuongTech: Biên bản kích hoạt website ${row.name||''}`,html}):{ok:false};
  const masterTo=String(env.MASTER_NOTIFY_EMAIL||'').trim();const sentMaster=masterTo?await sendMail(env,{to:masterTo,subject:`NEWSREAL: Lưu hồ sơ kích hoạt ${row.name||''} · ${code}`,html}):{ok:false};
  if(sentCustomer.ok)await env.DB.prepare(`UPDATE service_documents SET sent_customer_at=CURRENT_TIMESTAMP WHERE id=?`).bind(docId).run();
  if(sentMaster.ok)await env.DB.prepare(`UPDATE service_documents SET sent_master_at=CURRENT_TIMESTAMP WHERE id=?`).bind(docId).run();
  return {id:docId,document_code:code};
}

async function notifyMasterRenewal(env,row){
  const to=String(env.MASTER_NOTIFY_EMAIL||'').trim();
  if(!to)return {ok:false,configured:false};
  return sendMail(env,{to,subject:`NEWSREAL: Khách yêu cầu gia hạn - ${row.name}`,html:`<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Khách yêu cầu gia hạn</h2><p><b>${htmlEsc(row.customer_name||row.name)}</b> vừa yêu cầu gia hạn website.</p><p>Website: <b>${htmlEsc(row.name)}</b><br>Domain: <b>${htmlEsc(row.domain)}</b><br>Email: ${htmlEsc(row.customer_email||row.admin_email||'')}<br>Điện thoại: ${htmlEsc(row.customer_phone||'')}<br>Giá gia hạn: <b>${Number(row.renewal_price||0).toLocaleString('vi-VN')}đ</b></p><p>Vui lòng vào NEWSREAL Control Center để liên hệ khách và xử lý thanh toán.</p></div>`});
}

async function renewalEmailForSite(env,row,origin,reminderKey='manual'){
  const email=String(row.customer_email||row.admin_email||'').trim().toLowerCase();
  if(!email)return {ok:false,error:'Khách hàng chưa có email'};
  const raw=activationToken(),hash=await sha256(raw);
  await env.DB.prepare(`INSERT INTO renewal_response_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+60 days'))`).bind(row.id,hash).run();
  const url=`${String(env.PUBLIC_APP_URL||origin).replace(/\/$/,'')}/renewal/?token=${encodeURIComponent(raw)}`;
  const days=Math.max(0,Math.ceil((new Date(String(row.expires_at)+'T23:59:59Z')-new Date())/86400000));
  const promo=row.renewal_price?` Giá gia hạn hiện tại: <b>${Number(row.renewal_price).toLocaleString('vi-VN')}đ / ${Number(row.term_months||12)} tháng</b>.`:'';
  const subject=days>0?`NEWSREAL: Website ${row.name} còn ${days} ngày hết hạn`:`NEWSREAL: Dịch vụ website ${row.name} đến hạn gia hạn`;
  const html=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#172033;line-height:1.6"><h2>Thông báo gia hạn website</h2><p>Xin chào ${htmlEsc(row.customer_name||'Quý khách')},</p><p>Dịch vụ website <b>${htmlEsc(row.name)}</b> (${htmlEsc(row.domain)}) sẽ hết hạn vào <b>${htmlEsc(row.expires_at||'')}</b>.${promo}</p><p>Vui lòng cho chúng tôi biết bạn có nhu cầu gia hạn hay không:</p><p><a href="${htmlEsc(url)}" style="display:inline-block;background:#1769ff;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">Xác nhận nhu cầu gia hạn</a></p><p style="font-size:13px;color:#667085">NEWSREAL không tự động trừ tiền hay tự gia hạn. Xác nhận này chỉ giúp chúng tôi liên hệ và xử lý gia hạn theo yêu cầu của bạn.</p></div>`;
  const sent=await sendMail(env,{to:email,subject,html});
  if(!sent.ok){await env.DB.prepare(`DELETE FROM renewal_response_tokens WHERE token_hash=?`).bind(hash).run();return sent}
  await env.DB.prepare(`UPDATE service_promotions SET renewal_notified_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(row.id).run();
  return {...sent,email,url,days,reminder_key:reminderKey};
}

function paymentConfig(env){
  return {
    accountName:String(env.PAYMENT_ACCOUNT_NAME||'').trim(),
    accountNumber:String(env.PAYMENT_ACCOUNT_NUMBER||'').trim(),
    bankName:String(env.PAYMENT_BANK_NAME||'MB Bank').trim(),
    bankBin:String(env.PAYMENT_BANK_BIN||'970422').trim(),
    qrUrl:String(env.PAYMENT_QR_URL||'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgz5fwEwS1BbSbW-WmWFqiqFhReV0qlsQWYUZ8qyGf1H_VEUCJ8Z76cnkoB-KVgFEJOx5I6gIVQqErka-b2BJwbDhvus-HSU1tUInQo9k0KvL7W6pIK-b3A0xdP1s932nGayqtZhDZaYaMk9DMnsm5RVVolQBZLwvgo_jgvzj_K7OIoYmCQX0Dwml05Lrw/s600/1788226781520_1785267834312255039_4752939212946377740_4429932c514f4f8ae82fe2b847f711a5_cropped.jpg').trim()
  };
}
function purchasePaymentQr(env,amount,memo){
  const cfg=paymentConfig(env);
  if(cfg.qrUrl)return cfg.qrUrl;
  if(cfg.bankBin&&cfg.accountNumber){
    return `https://img.vietqr.io/image/${encodeURIComponent(cfg.bankBin)}-${encodeURIComponent(cfg.accountNumber)}-compact2.png`;
  }
  return '';
}

function payosConfig(env){return {clientId:String(env.PAYOS_CLIENT_ID||'').trim(),apiKey:String(env.PAYOS_API_KEY||'').trim(),checksumKey:String(env.PAYOS_CHECKSUM_KEY||'').trim()}}
function payosReady(env){const c=payosConfig(env);return !!(c.clientId&&c.apiKey&&c.checksumKey)}
async function hmacSha256Hex(secret,message){const enc=new TextEncoder(),key=await crypto.subtle.importKey('raw',enc.encode(String(secret||'')),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await crypto.subtle.sign('HMAC',key,enc.encode(String(message||'')));return [...new Uint8Array(sig)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function payosValue(v){if(v===null||v===undefined||v==='undefined'||v==='null')return '';if(Array.isArray(v))return JSON.stringify(v.map(x=>x&&typeof x==='object'&&!Array.isArray(x)?Object.keys(x).sort().reduce((o,k)=>(o[k]=x[k],o),{}):x));return String(v)}
function payosDataString(data){return Object.keys(data||{}).filter(k=>data[k]!==undefined).sort().map(k=>`${k}=${payosValue(data[k])}`).join('&')}
async function payosSignData(checksumKey,data){return hmacSha256Hex(checksumKey,payosDataString(data))}
function secureHexEqual(a,b){a=String(a||'').toLowerCase();b=String(b||'').toLowerCase();if(a.length!==b.length||!a.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
function payosProviderOrderCode(){return Date.now()*100+Math.floor(Math.random()*100)}
async function payosCreatePayment(env,{amount,description,returnUrl,cancelUrl,buyerName='',buyerEmail='',buyerPhone=''}){const cfg=payosConfig(env);if(!payosReady(env))throw new Error('payOS chưa được cấu hình trong Cloudflare Secrets');const orderCode=payosProviderOrderCode();const payload={orderCode,amount:Math.max(1,Math.round(Number(amount||0))),description:String(description||'HVTECH').slice(0,25),cancelUrl,returnUrl};if(buyerName)payload.buyerName=String(buyerName).slice(0,100);if(buyerEmail)payload.buyerEmail=String(buyerEmail).slice(0,160);if(buyerPhone)payload.buyerPhone=String(buyerPhone).slice(0,30);payload.signature=await payosSignData(cfg.checksumKey,{amount:payload.amount,cancelUrl:payload.cancelUrl,description:payload.description,orderCode:payload.orderCode,returnUrl:payload.returnUrl});const r=await fetch('https://api-merchant.payos.vn/v2/payment-requests',{method:'POST',headers:{'Content-Type':'application/json','x-client-id':cfg.clientId,'x-api-key':cfg.apiKey},body:JSON.stringify(payload)});const out=await r.json().catch(()=>({}));if(!r.ok||out.code!=='00'||!out.data)throw new Error(out.desc||out.message||`payOS HTTP ${r.status}`);return out.data}
async function payosVerifyWebhook(env,payload){const cfg=payosConfig(env),data=payload&&payload.data&&typeof payload.data==='object'?payload.data:null,signature=String(payload?.signature||'');if(!cfg.checksumKey||!data||!signature)return false;return secureHexEqual(await payosSignData(cfg.checksumKey,data),signature)}
function purchaseOrderCode(leadId){
  const stamp=new Date().toISOString().slice(0,10).replaceAll('-','');
  const tail=crypto.randomUUID().replaceAll('-','').slice(0,5).toUpperCase();
  return `HV${stamp}-${String(leadId).padStart(5,'0')}-${tail}`;
}
async function ensurePurchasePayments(env){
  await ensureSalesLeads(env);
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS purchase_payments(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    order_code TEXT NOT NULL UNIQUE,
    token_hash TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL DEFAULT 0,
    paid_amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    provider TEXT NOT NULL DEFAULT 'bank_qr',
    transfer_ref TEXT DEFAULT '',
    transfer_content TEXT DEFAULT '',
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lead_id) REFERENCES sales_leads(id) ON DELETE CASCADE
  )`).run();
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_purchase_payments_lead ON purchase_payments(lead_id,id DESC)`).run()}catch(e){}
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_purchase_payments_status ON purchase_payments(status,created_at)`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE purchase_payments ADD COLUMN provider_order_code INTEGER`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE purchase_payments ADD COLUMN payment_link_id TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE purchase_payments ADD COLUMN checkout_url TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE purchase_payments ADD COLUMN qr_code TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_payments_provider_order ON purchase_payments(provider_order_code) WHERE provider_order_code IS NOT NULL`).run()}catch(e){}
}

async function ensureRenewalPayments(env){
  await ensureCustomerTables(env);
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS renewal_payments(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    order_code TEXT NOT NULL UNIQUE,
    token_hash TEXT NOT NULL UNIQUE,
    years INTEGER NOT NULL DEFAULT 1,
    amount INTEGER NOT NULL DEFAULT 0,
    paid_amount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    provider TEXT NOT NULL DEFAULT 'vietqr',
    transfer_ref TEXT DEFAULT '',
    transfer_content TEXT DEFAULT '',
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
  )`).run();
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_renewal_payments_site ON renewal_payments(site_id,id DESC)`).run()}catch(e){}
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_renewal_payments_status ON renewal_payments(status,created_at)`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE service_promotions ADD COLUMN renewal_selected_months INTEGER NOT NULL DEFAULT 12`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE service_promotions ADD COLUMN renewal_order_code TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE renewal_payments ADD COLUMN provider_order_code INTEGER`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE renewal_payments ADD COLUMN payment_link_id TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE renewal_payments ADD COLUMN checkout_url TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE renewal_payments ADD COLUMN qr_code TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_renewal_payments_provider_order ON renewal_payments(provider_order_code) WHERE provider_order_code IS NOT NULL`).run()}catch(e){}
}
function renewalOrderCode(siteId){
  const stamp=new Date().toISOString().slice(0,10).replaceAll('-','');
  const tail=crypto.randomUUID().replaceAll('-','').slice(0,5).toUpperCase();
  return `GH${stamp}-${String(siteId).padStart(5,'0')}-${tail}`;
}
async function createRenewalPayment(env,siteId,years=1){
  await ensureRenewalPayments(env);
  years=Math.max(1,Math.min(3,Number(years||1)));
  const row=await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,
    ss.expires_at,coalesce(sp.renewal_price,1999000) renewal_price
    FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin'
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
  if(!row)throw new Error('Website không tồn tại');
  const amount=Math.max(0,Number(row.renewal_price||0))*years;
  if(amount<=0)throw new Error('Chưa có giá gia hạn hợp lệ');
  await env.DB.prepare(`UPDATE renewal_payments SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND status='pending'`).bind(siteId).run();
  const orderCode=renewalOrderCode(siteId),token=activationToken(),hash=await sha256(token);
  await env.DB.prepare(`INSERT INTO renewal_payments(site_id,order_code,token_hash,years,amount,status,provider)
    VALUES(?,?,?,?,?,'pending','vietqr')`).bind(siteId,orderCode,hash,years,amount).run();
  await env.DB.prepare(`INSERT INTO service_promotions(site_id,renewal_status,renewal_decision_at,renewal_requested_at,renewal_stage,renewal_selected_months,renewal_order_code,updated_at)
    VALUES(?,'yes',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'payment_pending',?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(site_id) DO UPDATE SET renewal_status='yes',renewal_decision_at=CURRENT_TIMESTAMP,renewal_requested_at=CURRENT_TIMESTAMP,
      renewal_stage='payment_pending',renewal_selected_months=excluded.renewal_selected_months,renewal_order_code=excluded.renewal_order_code,updated_at=CURRENT_TIMESTAMP`)
    .bind(siteId,years*12,orderCode).run();
  const cfg=paymentConfig(env),origin=String(env.PUBLIC_APP_URL||'https://hoangvuongtech.com').replace(/\/$/,'');
  let provider='bank_qr',memo=orderCode,qrCode='',checkoutUrl='',paymentLinkId='',providerOrderCode=null;
  let bankName=cfg.bankName,accountName=cfg.accountName,accountNumber=cfg.accountNumber,qrUrl=purchasePaymentQr(env,amount,memo);
  if(payosReady(env)){
    const po=await payosCreatePayment(env,{amount,description:`GH${String(siteId).slice(-6)}`,returnUrl:`${origin}/renewal/?payment=success`,cancelUrl:`${origin}/renewal/?payment=cancel`,buyerName:row.customer_name||'',buyerEmail:row.customer_email||row.admin_email||''});
    provider='payos';providerOrderCode=Number(po.orderCode);paymentLinkId=String(po.paymentLinkId||'');checkoutUrl=String(po.checkoutUrl||'');qrCode=String(po.qrCode||'');
    memo=String(po.description||orderCode);bankName='MB Bank / payOS';accountName=String(po.accountName||'');accountNumber=String(po.accountNumber||'');qrUrl='';
    await env.DB.prepare(`UPDATE renewal_payments SET provider='payos',provider_order_code=?,payment_link_id=?,checkout_url=?,qr_code=?,updated_at=CURRENT_TIMESTAMP WHERE order_code=?`).bind(providerOrderCode,paymentLinkId,checkoutUrl,qrCode,orderCode).run();
  }
  return {row,order_code:orderCode,payment_token:token,years,months:years*12,amount,memo,provider,provider_order_code:providerOrderCode,qr_code:qrCode,checkout_url:checkoutUrl,payment_link_id:paymentLinkId,qr_url:qrUrl,bank_name:bankName,account_name:accountName,account_number:accountNumber};
}
async function notifyMasterRenewalPaid(env,row,payment){
  const to=String(env.MASTER_NOTIFY_EMAIL||'').trim();
  if(!to)return {ok:false,configured:false};
  const amount=Number(payment.amount||0).toLocaleString('vi-VN')+'đ';
  return sendMail(env,{to,subject:`NEWSREAL: GIA HẠN ĐÃ THANH TOÁN - ${row.name}`,
    html:`<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Khách đã thanh toán gia hạn</h2>
    <p><b>${htmlEsc(row.customer_name||row.name)}</b> đã thanh toán thành công.</p>
    <p>Website: <b>${htmlEsc(row.name)}</b><br>Domain: <b>${htmlEsc(row.domain||'')}</b><br>
    Mã thanh toán: <b>${htmlEsc(payment.order_code||'')}</b><br>Thời hạn khách chọn: <b>${Number(payment.years||1)} năm</b><br>
    Số tiền: <b>${amount}</b></p><p>Vào Master Control để gia hạn domain rồi bấm kiểm tra lại domain. Hệ thống sẽ tự đồng bộ ngày hết hạn website.</p></div>`});
}
function paymentWebhookAuthorized(env,request){
  const secret=String(env.VIETQR_WEBHOOK_TOKEN||env.PAYMENT_WEBHOOK_SECRET||'').trim();
  if(!secret)return false;
  const auth=String(request.headers.get('Authorization')||'').trim();
  const x=String(request.headers.get('X-Webhook-Secret')||request.headers.get('X-API-Key')||'').trim();
  let q='';try{q=String(new URL(request.url).searchParams.get('token')||'').trim()}catch(e){}
  return q===secret||x===secret||auth===secret||auth===`Bearer ${secret}`||auth===`Apikey ${secret}`||auth===`ApiKey ${secret}`;
}
async function notifyInitialPayment(env,{lead,orderCode,amount}){
  const customer=String(lead.email||'').trim().toLowerCase();
  const master=String(env.MASTER_NOTIFY_EMAIL||'hoangquocvuong.hp89@gmail.com').trim();
  const money=Number(amount||0).toLocaleString('vi-VN')+'đ';
  const customerHtml=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.6;color:#172033"><h2>HoangVuongTech đã nhận thanh toán</h2><p>Xin chào <b>${htmlEsc(lead.customer_name||'Quý khách')}</b>,</p><p>Chúng tôi đã ghi nhận thanh toán <b>${money}</b> cho yêu cầu <b>${htmlEsc(orderCode)}</b>.</p><p>Quý khách vui lòng chờ khoảng <b>30–60 phút</b> để hệ thống setup website. Link kích hoạt sẽ được gửi tự động tới chính địa chỉ email này sau khi domain, DNS và SSL hoàn tất.</p></div>`;
  const masterHtml=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.6"><h2>Khách đã thanh toán website</h2><p><b>${htmlEsc(lead.customer_name||'Khách hàng')}</b> đã thanh toán <b>${money}</b>.</p><p>Mã thanh toán: <b>${htmlEsc(orderCode)}</b><br>Giao diện: <b>${htmlEsc(lead.template_name||'')}</b><br>Email: <b>${htmlEsc(lead.email||'')}</b><br>Tên website mong muốn: <b>${htmlEsc(lead.site_name||'')}</b></p><p>Vào Master Control → Hộp yêu cầu và bấm <b>Tạo website</b>.</p></div>`;
  const sentCustomer=customer?await sendMail(env,{to:customer,subject:`HoangVuongTech: Đã nhận thanh toán ${orderCode}`,html:customerHtml}):{ok:false};
  const sentMaster=master?await sendMail(env,{to:master,subject:`NEWSREAL: Đã thanh toán ${orderCode} · ${lead.customer_name||''}`,html:masterHtml}):{ok:false};
  return {sent_customer:!!sentCustomer.ok,sent_master:!!sentMaster.ok};
}
function renewalStage(row){
  const stage=String(row?.renewal_stage||'').trim();
  if(stage&&stage!=='none')return stage;
  if(row?.renewal_status==='yes')return 'requested';
  if(row?.renewal_status==='no')return 'declined';
  return 'none';
}
function paymentMemo(row){
  const code=String(row.order_code||`NR-${row.id||''}`).trim().replace(/\s+/g,' ');
  return `NEWSREAL GH ${code}`;
}
async function renewalPaymentEmail(env,row){
  const email=String(row.customer_email||row.admin_email||'').trim().toLowerCase();
  if(!email)return {ok:false,error:'Khách hàng chưa có email'};
  if(String(row.renewal_status||'none')!=='yes')return {ok:false,error:'Khách chưa xác nhận muốn gia hạn'};
  const cfg=paymentConfig(env),amount=Math.max(0,Number(row.renewal_price||0)),term=Math.max(1,Number(row.term_months||12));
  const memo=paymentMemo(row);
  const subject=`NEWSREAL: Hướng dẫn thanh toán gia hạn - ${row.name}`;
  const html=`<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033;line-height:1.6">
    <div style="padding:24px;border:1px solid #e6eaf0;border-radius:16px;background:#fff">
      <div style="font-size:12px;font-weight:700;color:#1769ff;letter-spacing:.08em">NEWSREAL by HOÀNG VƯƠNG</div>
      <h2 style="margin:8px 0 16px">Hướng dẫn thanh toán gia hạn</h2>
      <p>Xin chào <b>${htmlEsc(row.customer_name||'Quý khách')}</b>,</p>
      <p>NEWSREAL đã ghi nhận yêu cầu gia hạn website của bạn. Thông tin gia hạn:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#667085">Website</td><td style="padding:8px 0;text-align:right"><b>${htmlEsc(row.name)}</b></td></tr>
        <tr><td style="padding:8px 0;color:#667085">Domain</td><td style="padding:8px 0;text-align:right"><b>${htmlEsc(row.domain)}</b></td></tr>
        <tr><td style="padding:8px 0;color:#667085">Ngày hết hạn</td><td style="padding:8px 0;text-align:right"><b>${htmlEsc(row.expires_at||'—')}</b></td></tr>
        <tr><td style="padding:8px 0;color:#667085">Thời hạn gia hạn</td><td style="padding:8px 0;text-align:right"><b>${term} tháng</b></td></tr>
        <tr><td style="padding:10px 0;color:#667085">Số tiền thanh toán</td><td style="padding:10px 0;text-align:right;font-size:20px;color:#1769ff"><b>${amount.toLocaleString('vi-VN')}đ</b></td></tr>
      </table>
      <div style="background:#f6f8fb;border-radius:12px;padding:16px;margin:18px 0">
        <div><b>Ngân hàng:</b> ${htmlEsc(cfg.bankName)}</div>
        <div><b>Chủ tài khoản:</b> ${htmlEsc(cfg.accountName)}</div>
        <div><b>Số tài khoản:</b> <span style="font-size:18px;font-weight:700">${htmlEsc(cfg.accountNumber)}</span></div>
        <div><b>Nội dung chuyển khoản:</b> <span style="font-size:17px;font-weight:700;color:#1769ff">${htmlEsc(memo)}</span></div>
      </div>
      ${cfg.qrUrl?`<div style="text-align:center;margin:20px 0"><div style="font-weight:700;margin-bottom:10px">Quét QR để chuyển khoản</div><img src="${htmlEsc(cfg.qrUrl)}" alt="QR thanh toán" style="max-width:320px;width:100%;height:auto;border-radius:12px;border:1px solid #e6eaf0"></div>`:''}
      <p>Sau khi nhận được thanh toán, bộ phận quản lý sẽ xác nhận và xử lý gia hạn dịch vụ cho bạn.</p>
      <p style="font-size:13px;color:#667085">NEWSREAL không tự động trừ tiền và không tự động gia hạn. Vui lòng kiểm tra đúng số tiền và nội dung chuyển khoản trước khi thanh toán.</p>
    </div>
  </div>`;
  const sent=await sendMail(env,{to:email,subject,html});
  if(!sent.ok)return sent;
  await env.DB.prepare(`UPDATE service_promotions SET renewal_stage='payment_sent',renewal_payment_sent_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(row.id).run();
  return {...sent,email,memo,amount};
}

async function renewalCompletedEmail(env,row,newExpiry){
  const email=String(row.customer_email||row.admin_email||'').trim().toLowerCase();
  if(!email)return {ok:false,configured:false,error:'Khách hàng chưa có email'};
  const term=Math.max(1,Number(row.renewal_selected_months||row.term_months||12));
  const amount=Math.max(0,Number(row.renewal_price||0))*Math.max(1,Math.round(term/12));
  const subject=`NEWSREAL: Gia hạn dịch vụ thành công - ${row.name}`;
  const html=`<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033;line-height:1.6">
    <div style="padding:24px;border:1px solid #dfe7f2;border-radius:16px;background:#fff">
      <div style="font-size:12px;font-weight:700;color:#1769ff;letter-spacing:.08em">NEWSREAL by HOÀNG VƯƠNG</div>
      <h2 style="margin:8px 0 16px">Gia hạn dịch vụ thành công</h2>
      <p>Xin chào <b>${htmlEsc(row.customer_name||'Quý khách')}</b>,</p>
      <p>NEWSREAL xác nhận dịch vụ website <b>${htmlEsc(row.name)}</b> đã được gia hạn thành công.</p>
      <div style="background:#f6f8fb;border-radius:12px;padding:16px;margin:18px 0">
        <div><b>Domain:</b> ${htmlEsc(row.domain||'')}</div>
        <div><b>Thời hạn gia hạn:</b> ${term} tháng</div>
        <div><b>Số tiền đã ghi nhận:</b> ${amount.toLocaleString('vi-VN')}đ</div>
        <div><b>Ngày hết hạn mới:</b> <span style="color:#1769ff;font-size:18px;font-weight:700">${htmlEsc(newExpiry)}</span></div>
      </div>
      <p>Dịch vụ website tiếp tục hoạt động bình thường đến ngày hết hạn mới ở trên.</p>
      <p style="font-size:13px;color:#667085">Ngày hết hạn domain được quản lý riêng và chỉ thay đổi sau khi domain thực tế được gia hạn. NEWSREAL không tự động trừ tiền.</p>
    </div>
  </div>`;
  return sendMail(env,{to:email,subject,html});
}

async function completeRenewal(env,siteId){
  const row=await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,cp.order_code,
      ss.expires_at,ss.domain_expires_at,ss.plan_name,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_selected_months,sp.term_months,12) renewal_selected_months,coalesce(sp.renewal_price,1999000) renewal_price,
      coalesce(sp.renewal_status,'none') renewal_status,coalesce(sp.renewal_stage,'none') renewal_stage
    FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin'
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id
    WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
  if(!row) return {ok:false,status:404,error:'Website không tồn tại'};
  if(String(row.renewal_stage||'none')==='renewed') return {ok:false,status:409,error:'Chu kỳ gia hạn này đã hoàn tất, không thể cộng thêm lần nữa'};
  if(String(row.renewal_stage||'none')!=='paid') return {ok:false,status:400,error:'Cần xác nhận khách đã thanh toán trước khi hoàn tất gia hạn'};
  if(!row.expires_at) return {ok:false,status:400,error:'Chưa có ngày hết hạn dịch vụ'};
  const oldExpiry=String(row.expires_at).slice(0,10);
  const minTerm=Math.max(1,Number(row.renewal_selected_months||row.term_months||12));
  const domainExpiry=String(row.domain_expires_at||'').slice(0,10);
  if(!domainExpiry) return {ok:false,status:409,error:'Chưa có ngày hết hạn domain. Hãy gia hạn domain trên Cloudflare rồi bấm Kiểm tra lại domain.'};

  // The renewed domain duration is the source of truth for the service renewal.
  // Example: service 2027-08-27, domain renewed to 2030-08-27 => 3 years / 36 months.
  const years=renewalYearsCovered(oldExpiry,domainExpiry);
  const term=years*12;
  if(term<minTerm){
    const requiredExpiry=addMonthsISO(oldExpiry,minTerm);
    return {ok:false,status:409,error:`Domain chưa được gia hạn đủ thời hạn. Domain hiện hết hạn ${domainExpiry}, cần tối thiểu đến ${requiredExpiry}. Hãy renew domain trên Cloudflare rồi bấm Kiểm tra lại domain.`};
  }
  // Keep service expiry synchronized to the actual registrar expiry date.
  const newExpiry=domainExpiry;
  const paidRow=await env.DB.prepare(`SELECT paid_amount,amount FROM renewal_payments WHERE site_id=? AND status='paid' ORDER BY id DESC LIMIT 1`).bind(siteId).first();
  const amount=Math.max(0,Number(paidRow?.paid_amount||paidRow?.amount||0))||Math.max(0,Number(row.renewal_price||0))*years;
  await env.DB.batch([
    env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(newExpiry,siteId),
    env.DB.prepare(`UPDATE service_promotions SET renewal_stage='renewed',renewal_completed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId),
    env.DB.prepare(`INSERT INTO renewal_history(site_id,old_expires_at,new_expires_at,term_months,amount,order_code,paid_at,completed_at)
      VALUES(?,?,?,?,?,?,coalesce((SELECT renewal_paid_at FROM service_promotions WHERE site_id=?),CURRENT_TIMESTAMP),CURRENT_TIMESTAMP)`).bind(siteId,oldExpiry,newExpiry,term,amount,String(row.order_code||''),siteId),
    env.DB.prepare(`DELETE FROM renewal_response_tokens WHERE site_id=? AND used_at IS NULL`).bind(siteId),
    env.DB.prepare(`UPDATE financial_transactions SET amount=?,cycle_end=?,memo=?,updated_at=CURRENT_TIMESTAMP
      WHERE unique_key=?`).bind(amount,newExpiry,`Gia hạn dịch vụ ${years} năm`,`renewal:${siteId}:${oldExpiry}`)
  ]);
  // Read back the saved value before reporting success. This makes the API
  // response and both dashboards use the actual persisted subscription expiry.
  let persisted=await env.DB.prepare(`SELECT expires_at FROM service_subscriptions WHERE site_id=?`).bind(siteId).first();
  let persistedExpiry=String(persisted?.expires_at||'').slice(0,10);
  if(persistedExpiry!==newExpiry){
    await env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(newExpiry,siteId).run();
    persistedExpiry=newExpiry;
  }
  const mail=await renewalCompletedEmail(env,row,persistedExpiry);
  return {ok:true,stage:'renewed',old_expiry:oldExpiry,new_expiry:persistedExpiry,renewal_years:years,term_months:term,amount,email:String(row.customer_email||row.admin_email||''),email_sent:!!mail.ok,email_error:mail.ok?'':(mail.error||'')};
}


async function syncCompletedRenewalExpiry(env,siteId){
  // If a completed renewal exists in renewal_history but the subscription row
  // still carries an older expiry (legacy/test/deploy race), make the history
  // authoritative and repair the service expiry automatically.
  const state=await env.DB.prepare(`
    SELECT ss.expires_at,
           coalesce(sp.renewal_stage,'none') renewal_stage,
           (SELECT max(rh.new_expires_at) FROM renewal_history rh WHERE rh.site_id=ss.site_id) history_expiry
    FROM service_subscriptions ss
    LEFT JOIN service_promotions sp ON sp.site_id=ss.site_id
    WHERE ss.site_id=? LIMIT 1`).bind(siteId).first();
  if(!state||String(state.renewal_stage||'none')!=='renewed')return {changed:false};
  const current=String(state.expires_at||'').slice(0,10);
  const target=String(state.history_expiry||'').slice(0,10);
  if(target && (!current || target>current)){
    await env.DB.prepare(`UPDATE service_subscriptions
      SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP
      WHERE site_id=?`).bind(target,siteId).run();
    return {changed:true,old_expiry:current,new_expiry:target};
  }
  return {changed:false,old_expiry:current,new_expiry:current};
}

async function ensureCustomerTables(env){
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS customer_profiles(
      site_id INTEGER PRIMARY KEY,
      full_name TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      company TEXT DEFAULT '',
      tax_code TEXT DEFAULT '',
      address TEXT DEFAULT '',
      province TEXT DEFAULT '',
      district TEXT DEFAULT '',
      order_code TEXT DEFAULT '',
      internal_note TEXT DEFAULT '',
      activated_at TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS site_activation_tokens(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_activation_hash ON site_activation_tokens(token_hash)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_customer_email ON customer_profiles(email)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS site_public_settings(
      site_id INTEGER PRIMARY KEY,
      contact_email TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS handover_login_tokens(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS password_reset_tokens(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_password_reset_hash ON password_reset_tokens(token_hash)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(site_id,user_id,used_at)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS service_promotions(
      site_id INTEGER PRIMARY KEY,
      term_months INTEGER NOT NULL DEFAULT 12,
      bonus_months INTEGER NOT NULL DEFAULT 0,
      promotion_name TEXT DEFAULT '',
      renewal_status TEXT NOT NULL DEFAULT 'none',
      renewal_notified_at TEXT,
      renewal_decision_at TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS renewal_response_tokens(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS renewal_reminder_log(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      service_expires_at TEXT NOT NULL,
      reminder_key TEXT NOT NULL,
      email TEXT DEFAULT '',
      sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(site_id,service_expires_at,reminder_key),
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_renewal_token_hash ON renewal_response_tokens(token_hash)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS renewal_history(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      old_expires_at TEXT NOT NULL,
      new_expires_at TEXT NOT NULL,
      term_months INTEGER NOT NULL DEFAULT 12,
      amount INTEGER NOT NULL DEFAULT 0,
      order_code TEXT DEFAULT '',
      paid_at TEXT,
      completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_renewal_history_site ON renewal_history(site_id,id)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS financial_transactions(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      kind TEXT NOT NULL DEFAULT 'manual',
      status TEXT NOT NULL DEFAULT 'paid',
      amount INTEGER NOT NULL DEFAULT 0,
      cost INTEGER NOT NULL DEFAULT 0,
      order_code TEXT DEFAULT '',
      memo TEXT DEFAULT '',
      cycle_start TEXT,
      cycle_end TEXT,
      paid_at TEXT,
      unique_key TEXT NOT NULL UNIQUE,
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_fin_tx_site ON financial_transactions(site_id,id)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_fin_tx_paid ON financial_transactions(status,paid_at)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS operating_expenses(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL DEFAULT 'other',
      title TEXT NOT NULL,
      amount INTEGER NOT NULL DEFAULT 0,
      recurring TEXT NOT NULL DEFAULT 'none',
      expense_date TEXT NOT NULL,
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_operating_expenses_date ON operating_expenses(expense_date,id)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS service_subscriptions(
      site_id INTEGER PRIMARY KEY,
      plan_name TEXT DEFAULT 'Gói website trọn gói',
      sale_price INTEGER NOT NULL DEFAULT 0,
      internal_cost INTEGER NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      service_status TEXT NOT NULL DEFAULT 'setup',
      started_at TEXT,
      expires_at TEXT,
      domain_status TEXT NOT NULL DEFAULT 'not_configured',
      domain_registered_at TEXT,
      domain_expires_at TEXT,
      auto_renew INTEGER NOT NULL DEFAULT 0,
      registrar TEXT DEFAULT 'Cloudflare',
      note TEXT DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    )`)
  ]);
  for(const sql of [
    `ALTER TABLE service_promotions ADD COLUMN list_price INTEGER NOT NULL DEFAULT 1999000`,
    `ALTER TABLE service_promotions ADD COLUMN first_discount INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE service_promotions ADD COLUMN first_price INTEGER NOT NULL DEFAULT 1999000`,
    `ALTER TABLE service_promotions ADD COLUMN renewal_price INTEGER NOT NULL DEFAULT 1999000`,
    `ALTER TABLE service_promotions ADD COLUMN renewal_requested_at TEXT`,
    `ALTER TABLE service_promotions ADD COLUMN renewal_stage TEXT NOT NULL DEFAULT 'none'`,
    `ALTER TABLE service_promotions ADD COLUMN renewal_payment_sent_at TEXT`,
    `ALTER TABLE service_promotions ADD COLUMN renewal_paid_at TEXT`,
    `ALTER TABLE service_promotions ADD COLUMN renewal_completed_at TEXT`,
    `ALTER TABLE service_promotions ADD COLUMN renewal_selected_months INTEGER NOT NULL DEFAULT 12`,
    `ALTER TABLE service_promotions ADD COLUMN renewal_order_code TEXT NOT NULL DEFAULT ''`
  ]){try{await env.DB.prepare(sql).run()}catch{}}
  try{await env.DB.prepare(`ALTER TABLE service_subscriptions ADD COLUMN paid_amount INTEGER NOT NULL DEFAULT 0`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE service_subscriptions ADD COLUMN finance_excluded INTEGER NOT NULL DEFAULT 0`).run()}catch(e){}
}
function cleanDomain(v=''){
  return String(v).trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/^www\./,'');
}
function activationToken(){return crypto.randomUUID().replace(/-/g,'')+crypto.randomUUID().replace(/-/g,'')}

async function issuePasswordReset(env,{site,user,origin}){
  await ensureCustomerTables(env);
  const raw=activationToken(),hash=await sha256(raw);
  // Only the newest reset link stays active for this account.
  await env.DB.prepare(`UPDATE password_reset_tokens SET used_at=datetime('now') WHERE site_id=? AND user_id=? AND used_at IS NULL`).bind(site.id,user.id).run();
  await env.DB.prepare(`INSERT INTO password_reset_tokens(site_id,user_id,token_hash,expires_at) VALUES(?,?,?,datetime('now','+30 minutes'))`).bind(site.id,user.id,hash).run();
  const base=String(origin||`https://${site.domain}`).replace(/\/$/,'');
  const url=`${base}/reset-password/?token=${encodeURIComponent(raw)}&tenant=${encodeURIComponent(site.domain||'')}`;
  const subject=`NEWSREAL: Đặt lại mật khẩu quản trị - ${site.name}`;
  const html=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#172033;line-height:1.65">
    <div style="padding:26px;border:1px solid #e5eaf2;border-radius:16px;background:#fff">
      <div style="font-size:12px;font-weight:800;color:#1769ff;letter-spacing:.08em">NEWSREAL · BẢO MẬT TÀI KHOẢN</div>
      <h2 style="margin:8px 0 14px">Đặt lại mật khẩu quản trị</h2>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho website <b>${htmlEsc(site.name)}</b>.</p>
      <p><a href="${htmlEsc(url)}" style="display:inline-block;background:#1769ff;color:#fff;text-decoration:none;padding:13px 20px;border-radius:9px;font-weight:bold">Đặt lại mật khẩu</a></p>
      <p style="font-size:13px;color:#667085">Liên kết chỉ dùng được một lần và hết hạn sau <b>30 phút</b>. Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.</p>
      <p style="font-size:13px;color:#667085">NEWSREAL không gửi hoặc hiển thị mật khẩu cũ qua email.</p>
    </div>
  </div>`;
  const sent=await sendMail(env,{to:user.email,subject,html});
  if(!sent.ok){
    await env.DB.prepare(`DELETE FROM password_reset_tokens WHERE token_hash=?`).bind(hash).run();
    return sent;
  }
  return {...sent,url,email:user.email};
}


// V15.2 — Structure First: khung giao diện thuộc template, không thuộc bài viết.
function defaultTemplateStructure(key){
 const sec=(key,type,title,extra={})=>({key,type,title,...extra});
 const cat=(i,title,extra={})=>sec('cat-'+i,'category',title,{category:title,slots:8,desktop_columns:4,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',...extra});
 const side=(root,widgets=[])=>({root_selector:root,widgets});
 const sw=(key,title,type,slots,selector='')=>({key,title,type,slots,selector,empty_policy:'slots'});
 const newsStd={route_contract:'news-v2',card_contract:'title-only-v1',article_contract:'article-first-v1',article_sidebar:{enabled:1,sticky:1,internal_scroll:0},homepage_top:{min_stories:5},homepage_sidebar_balance:{enabled:1,target_section:'latest',max_extra_rows:3,tolerance_px:32}};
 const p={
  'tin-tuc-1':{...newsStd,version:8,content_type:'news',geometry_locked:1,sidebars:[side('.news-home-sidebar',[sw('popular','ĐỌC NHIỀU','ranked',6,'.news-side-box:nth-child(1)'),sw('categories','CHUYÊN MỤC','categories',8,'.news-side-box:nth-child(2)'),sw('latest','TIN MỚI','latest',5,'.news-side-box:nth-child(3)')])],sections:[sec('breaking','breaking','Mới nhất'),sec('hero','hero','Nổi bật',{slots:3}),sec('topics','topics','Chuyên mục'),sec('latest','latest','Tin mới nhất',{slots:12,slot_contract:'sidebar-balanced',desktop_columns:3,desktop_rows:4,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),cat(1,'Kinh tế',{slots:12,desktop_columns:4,desktop_rows:3}),cat(2,'Công nghệ',{slots:12,desktop_columns:4,desktop_rows:3}),cat(3,'Du lịch',{slots:12,desktop_columns:4,desktop_rows:3}),cat(4,'Sức khỏe',{slots:12,desktop_columns:4,desktop_rows:3}),cat(5,'Bất động sản',{slots:12,desktop_columns:4,desktop_rows:3}),cat(6,'Đời sống',{slots:12,desktop_columns:4,desktop_rows:3}),sec('explore','explore','Nội dung khác',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('newsletter','newsletter','Nội dung của bạn, thương hiệu của bạn')]},
  'tin-tuc-2':{...newsStd,version:8,content_type:'news',geometry_locked:1,sidebars:[side('.np-home-sidebar',[sw('popular','ĐỌC NHIỀU','ranked',6,'.news-side-box:nth-child(1)'),sw('categories','CHUYÊN MỤC','categories',8,'.news-side-box:nth-child(2)'),sw('latest','TIN MỚI','latest',5,'.news-side-box:nth-child(3)')])],sections:[sec('ticker','ticker','Tin nóng'),sec('hero','hero','Nổi bật',{slots:3}),sec('latest','latest','Tin mới nhất',{slots:8,slot_contract:'sidebar-balanced',desktop_columns:2,desktop_rows:4,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),cat(1,'Kinh tế',{slots:12,desktop_columns:4,desktop_rows:3}),cat(2,'Công nghệ',{slots:12,desktop_columns:4,desktop_rows:3}),cat(3,'Du lịch',{slots:12,desktop_columns:4,desktop_rows:3}),cat(4,'Sức khỏe',{slots:12,desktop_columns:4,desktop_rows:3}),cat(5,'Bất động sản',{slots:12,desktop_columns:4,desktop_rows:3})]},
  'tin-tuc-3':{...newsStd,version:9,content_type:'news',geometry_locked:1,sidebars:[],sections:[sec('editors-pick','hero',"EDITOR'S PICK · CÂU CHUYỆN ĐÁNG ĐỌC",{slots:5,desktop_columns:3,desktop_rows:2,tablet_columns:2,mobile_columns:1,column_mode:'computed',layout_variant:'mosaic-featured-1-plus-4',fill_policy:'natural'}),sec('trending','trending','Trending now',{slots:12,desktop_columns:6,desktop_rows:2,tablet_columns:3,mobile_columns:2,fill_policy:'complete_rows'}),cat(1,'Kinh tế',{slots:10,desktop_columns:5,desktop_rows:2}),cat(2,'Công nghệ',{slots:10,desktop_columns:5,desktop_rows:2}),cat(3,'Du lịch',{slots:10,desktop_columns:5,desktop_rows:2}),cat(4,'Sức khỏe',{slots:10,desktop_columns:5,desktop_rows:2}),cat(5,'Bất động sản',{slots:10,desktop_columns:5,desktop_rows:2}),sec('weekend','special','Đọc chậm, hiểu sâu hơn',{eyebrow:'WEEKEND READ',slots:8,desktop_columns:4,desktop_rows:2,tablet_columns:2,mobile_columns:1,column_mode:'fixed',fill_policy:'complete_rows'})]},
  'tin-tuc-4':{...newsStd,version:8,content_type:'news',geometry_locked:1,sidebars:[side('#doc-nhieu',[sw('popular','Đọc nhiều','ranked',6,'#doc-nhieu')])],sections:[sec('intro','intro','Tin tức rõ ràng, tối giản và tập trung vào nội dung.'),sec('lead','hero','Bài nổi bật',{slots:1,desktop_columns:1,desktop_rows:1,fill_policy:'natural'}),sec('latest','latest','Mới nhất',{slots:8,desktop_columns:4,desktop_rows:2,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),cat(1,'Kinh tế',{slots:8,desktop_columns:4,desktop_rows:2}),cat(2,'Công nghệ',{slots:8,desktop_columns:4,desktop_rows:2}),cat(3,'Du lịch',{slots:8,desktop_columns:4,desktop_rows:2}),cat(4,'Sức khỏe',{slots:8,desktop_columns:4,desktop_rows:2}),cat(5,'Bất động sản',{slots:8,desktop_columns:4,desktop_rows:2})]},
  'mau-1':{version:5,content_type:'property',geometry_locked:1,sidebars:[],sections:[sec('hero','property_hero','Bất động sản'),sec('search','property_search','Tìm kiếm'),sec('latest','property_list','Tin đăng mới nhất',{slots:15,desktop_columns:3,desktop_rows:5,tablet_columns:2,mobile_columns:1,column_mode:'computed',fill_policy:'complete_rows',grid_selector:'#propertyCards'}),sec('needs','property_categories','Tìm nhanh theo nhu cầu'),sec('apartment','property_list','Bán căn hộ chung cư',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,column_mode:'computed',fill_policy:'complete_rows',grid_selector:'#apartmentCards'}),sec('sale','property_list','Bán nhà đất',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,column_mode:'computed',fill_policy:'complete_rows',grid_selector:'#saleCards'}),sec('rent','property_list','Cho thuê nhà',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,column_mode:'computed',fill_policy:'complete_rows',grid_selector:'#rentCards'}),sec('warehouse','property_list','Kho xưởng & mặt bằng',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,column_mode:'computed',fill_policy:'complete_rows',grid_selector:'#warehouseCards'}),sec('land','property_list','Đất nền & đất dự án',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,column_mode:'computed',fill_policy:'complete_rows',grid_selector:'#landCards'}),sec('news','news','Tin thị trường & kiến thức',{slots:8,desktop_columns:4,desktop_rows:2,tablet_columns:2,mobile_columns:1,column_mode:'computed',fill_policy:'complete_rows'})]},
  'mau-2':{version:5,content_type:'property',geometry_locked:1,sidebars:[],sections:[sec('hero','property_hero','Tìm kiếm bất động sản phù hợp nhu cầu của bạn'),sec('benefits','benefits','Lợi ích'),sec('featured','property_list','Bất động sản nổi bật',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',grid_selector:'#t2Featured'}),sec('quick-categories','property_categories','Khám phá theo nhu cầu'),sec('sale','property_list','Mua bán nổi bật',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',grid_selector:'#t2SaleGrid'}),sec('rent','property_list','Bất động sản cho thuê',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',grid_selector:'#t2RentGrid'}),sec('local','property_list','Nhà đất theo khu vực',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',grid_selector:'#t2LocalGrid'}),sec('latest','property_list','Tin đăng mới nhất',{slots:16,desktop_columns:4,desktop_rows:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',grid_selector:'#t2Latest'}),sec('news','news','Tin tức & thị trường',{slots:8,desktop_columns:4,desktop_rows:2,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',grid_selector:'#t2News'}),sec('bottom-benefits','benefits','Hỗ trợ')]},
  'mau-3':{version:5,content_type:'property',geometry_locked:1,sidebars:[],sections:[sec('hero','property_hero','Không gian sống đáng giá mỗi ngày'),sec('intro','property_categories','Danh mục bất động sản'),sec('featured','property_list','Bất động sản nổi bật',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('projects','property_projects','Dự án',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('apartment','property_list','Căn hộ & chung cư',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('houses','property_list','Nhà phố & biệt thự',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('rent','property_list','Bất động sản cho thuê',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('land','property_list','Đất nền & cơ hội đầu tư',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('services','services','Dịch vụ'),sec('news','news','Tin tức',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'})]},
  'mau-4':{version:5,content_type:'property',geometry_locked:1,sidebars:[],sections:[sec('intro','property_hero','Bất động sản rõ ràng. Quyết định dễ dàng.'),sec('search','property_search','Tìm kiếm'),sec('categories','property_categories','Danh mục'),sec('latest','property_list','Tin đăng mới nhất',{slots:16,desktop_columns:4,desktop_rows:4,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('sale','property_list','Nhà đất đang bán',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('projects','property_projects','Dự án',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('apartment','property_list','Căn hộ được quan tâm',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('house','property_list','Nhà phố & biệt thự',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('rent','property_list','Cho thuê nổi bật',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('land','property_list','Đất nền & dự án',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('stats','stats','Thống kê'),sec('services','services','Dịch vụ'),sec('news','news','Tin tức',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'})]},
  'mau-5':{version:5,content_type:'property',geometry_locked:1,sidebars:[],sections:[sec('hero','property_hero','Tìm đúng nơi. Sống đúng chất.'),sec('areas','property_areas','Nơi bạn muốn sống',{slots:8,desktop_columns:4,desktop_rows:2,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('featured','property_list','Bất động sản nổi bật',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('projects','property_projects','Dự án',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('latest','property_list','Nhà đất mới lên',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('apartment','property_list','Căn hộ thành thị',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('sale-rent','property_split','Mua bán & Cho thuê',{slots:12,desktop_columns:2,tablet_columns:1,mobile_columns:1,fill_policy:'complete_rows'}),sec('house','property_list','Nhà phố & biệt thự',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('land','property_list','Đất nền & dự án',{slots:12,desktop_columns:4,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'}),sec('services','services','Dịch vụ'),sec('news','news','Tin tức',{slots:9,desktop_columns:3,desktop_rows:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows'})]}
,
  'dich-vu-1':{version:8,layout_contract:'universal-layout-v1',content_type:'service',geometry_locked:1,sidebars:[],sections:[sec('hero','section','Giải pháp FPT',{content_source:'none',bind_required:0}),sec('needs','section','Chọn theo nhu cầu',{content_source:'none',bind_required:0}),sec('internet','category','Internet FPT',{category:'Internet FPT',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('tv','category','Truyền hình FPT',{category:'Truyền hình FPT',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('camera','category','Camera FPT',{category:'Camera FPT',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('combo','category','Combo FPT',{category:'Combo FPT',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('advice','section','Cẩm nang dịch vụ',{content_source:'none',bind_required:0}),sec('contact','section','Đăng ký tư vấn',{content_source:'none',bind_required:0})]},
  'dich-vu-2':{version:8,layout_contract:'universal-layout-v1',content_type:'service',geometry_locked:1,sidebars:[],sections:[sec('hero','section','Giải pháp VNPT',{content_source:'none',bind_required:0}),sec('needs','section','Chọn theo nhu cầu',{content_source:'none',bind_required:0}),sec('internet','category','Internet VNPT',{category:'Internet VNPT',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1,slot_hosts:[{selector:'.vnpt-feature-pack',slots:1},{selector:'.vnpt-pack-list',slots:5}]}),sec('tv','category','Truyền hình MyTV',{category:'Truyền hình MyTV',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('camera','category','Camera VNPT',{category:'Camera VNPT',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('combo','category','Combo VNPT',{category:'Combo VNPT',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('advice','section','Cẩm nang dịch vụ',{content_source:'none',bind_required:0}),sec('contact','section','Đăng ký tư vấn',{content_source:'none',bind_required:0})]},
  'dich-vu-3':{version:8,layout_contract:'universal-layout-v1',content_type:'service',geometry_locked:1,sidebars:[],sections:[sec('hero','section','Giải pháp Viettel',{content_source:'none',bind_required:0}),sec('needs','section','Chọn theo nhu cầu',{content_source:'none',bind_required:0}),sec('combo','category','Combo Viettel',{category:'Combo Viettel',slots:6,desktop_columns:2,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('internet','category','Internet Viettel',{category:'Internet Viettel',slots:6,desktop_columns:2,tablet_columns:1,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('tv','category','Truyền hình TV360',{category:'Truyền hình TV360',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('camera','category','Camera Viettel',{category:'Camera Viettel',slots:6,desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('advice','section','Cẩm nang dịch vụ',{content_source:'none',bind_required:0}),sec('contact','section','Đăng ký tư vấn',{content_source:'none',bind_required:0})]},
  'dich-vu-4':{version:9,layout_contract:'universal-layout-v1',content_type:'service',geometry_locked:1,route_contract:'service-commerce-v2',card_contract:'camera-product-card-v1',article_contract:'service-detail-v2',lead_contract:'service-lead-v1',sidebars:[],sections:[sec('hero','section','Camera & giải pháp an ninh',{content_source:'none',bind_required:0}),sec('brands','section','Thương hiệu nổi bật',{content_source:'none',bind_required:0}),sec('indoor','category','Camera Wi-Fi trong nhà',{category:'Camera Wi-Fi trong nhà',slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('outdoor','category','Camera ngoài trời',{category:'Camera ngoài trời',slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('ai','category','Camera AI quay quét',{category:'Camera AI quay quét',slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('pro','category','Camera IP & bộ giám sát',{category:'Camera IP & bộ giám sát',slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,fill_policy:'complete_rows',bind_required:1}),sec('advice','section','Cẩm nang camera',{content_source:'none',bind_required:0}),sec('contact','section','Nhận tư vấn & báo giá',{content_source:'none',bind_required:0})]},
  'game-1':{version:11,layout_contract:'universal-layout-v1',content_type:'game',geometry_locked:1,route_contract:'game-community-base-v1',card_contract:'game-base-card-v5',article_contract:'game-base-detail-v5',navigation_contract:'game-mobile-hamburger-v2',saved_contract:'local-first-saved-toast-v2',filter_contract:'smart-progressive-filter-v4',boot_contract:'game-route-runtime-complete-v2',mobile_cta_contract:'sticky-copy-v1',preference_contract:'remember-hall-v1',stats_contract:'cloudflare-d1-batch-v1',settings_contract:'template-personalization-v1',hero_contract:'daily-latest-skin-v1',settings_schema:[{key:'donate_url',label:'Link Donate / Buy Me a Coffee',type:'url',placeholder:'https://buymeacoffee.com/ten-cua-ban',default:'https://buymeacoffee.com/cocbase',help:'Nút Donate trên header, footer và nút nổi sẽ dùng link này.'},{key:'about_title',label:'Tiêu đề trang Thông tin',type:'text',default:'About COC Base Portal'},{key:'about_content',label:'Nội dung trang Thông tin',type:'textarea',default:'Thư viện base cộng đồng dành cho Town Hall, Builder Hall và Clan Capital.'},{key:'terms_title',label:'Tiêu đề trang Điều khoản',type:'text',default:'Điều khoản sử dụng'},{key:'terms_content',label:'Nội dung Điều khoản',type:'textarea',default:'Base được chia sẻ cho cộng đồng. Người dùng tự chịu trách nhiệm khi sử dụng liên kết bên thứ ba.'},{key:'footer_text',label:'Thông tin ngắn dưới Footer',type:'textarea',default:'Community Clash of Clans base sharing · Not affiliated with Supercell.'}],sidebars:[],sections:[sec('hero','section','Clash of Clans Community Base Portal',{content_source:'none',bind_required:0}),sec('filters','section','Bộ lọc Base',{content_source:'none',bind_required:0}),sec('town-hall','category','Town Hall',{category:'Town Hall',slots:17,slot_contract:'exact',desktop_columns:4,tablet_columns:3,mobile_columns:2,fill_policy:'complete_rows',bind_required:1}),sec('builder-hall','category','Builder Hall',{category:'Builder Hall',slots:9,slot_contract:'exact',desktop_columns:4,tablet_columns:2,mobile_columns:2,fill_policy:'complete_rows',bind_required:1}),sec('clan-capital','category','Clan Capital',{category:'Clan Capital',slots:10,slot_contract:'exact',desktop_columns:4,tablet_columns:2,mobile_columns:2,fill_policy:'complete_rows',bind_required:1})]}
 };
 return p[String(key||'')]||{version:5,content_type:'generic',geometry_locked:0,sidebars:[],sections:[]};
}
function structureSectionDefaults(type='section'){
 const t=String(type||'section');
 const staticTypes=new Set(['section','intro','topics','property_search','property_categories','benefits','newsletter','services','stats']);
 const sourceMap={category:'category',latest:'latest',breaking:'latest',ticker:'latest',trending:'latest',hero:'featured',special:'featured',explore:'latest',property_list:'property',property_projects:'projects',property_split:'property',property_areas:'property',news:'news',property_hero:'featured'};
 const bindRequired=!staticTypes.has(t);
 return {bind_required:bindRequired?1:0,content_source:sourceMap[t]||(bindRequired?'auto':'none')};
}
function normalizeStructureProfile(raw,key,contentType='generic'){
 let p={};try{p=raw&&typeof raw==='object'?raw:JSON.parse(String(raw||'{}'))}catch(e){p={}}
 if(!Array.isArray(p.sections)||!p.sections.length)p=defaultTemplateStructure(key);
 p.version=Math.max(4,Number(p.version||1));p.content_type=String(p.content_type||contentType||'generic');p.layout_contract=String(p.layout_contract||'universal-layout-v1');
 if(p.content_type==='news'){
   p.route_contract='news-v2';p.card_contract='title-only-v1';p.article_contract='article-first-v1';
   p.article_sidebar={enabled:1,sticky:1,internal_scroll:0,...(p.article_sidebar&&typeof p.article_sidebar==='object'?p.article_sidebar:{})};
   p.article_sidebar.enabled=1;p.article_sidebar.sticky=1;p.article_sidebar.internal_scroll=0;
   p.homepage_sidebar_balance={enabled:1,target_section:'latest',max_extra_rows:3,tolerance_px:32,...(p.homepage_sidebar_balance&&typeof p.homepage_sidebar_balance==='object'?p.homepage_sidebar_balance:{})};
   p.homepage_sidebar_balance.enabled=Number(p.homepage_sidebar_balance.enabled||0)?1:0;
 }
 p.geometry_locked=Number(p.geometry_locked||0)?1:0;
 p.sidebars=(Array.isArray(p.sidebars)?p.sidebars:[]).slice(0,8).map((sb,si)=>({
   root_selector:String(sb?.root_selector||'').slice(0,180),
   widgets:(Array.isArray(sb?.widgets)?sb.widgets:[]).slice(0,12).map((w,wi)=>({key:String(w?.key||`widget-${wi+1}`).slice(0,80),title:String(w?.title||'').slice(0,120),type:String(w?.type||'list').slice(0,60),slots:Math.max(0,Math.min(30,Number(w?.slots||0))),selector:String(w?.selector||'').slice(0,180),empty_policy:['slots','message','hide'].includes(String(w?.empty_policy||''))?String(w.empty_policy):'slots'}))
 }));
 p.sections=(p.sections||[]).slice(0,80).map((x,i)=>{
   const type=String(x?.type||'section').slice(0,60),defs=structureSectionDefaults(type);
   const slots=Math.max(0,Math.min(60,Number(x?.slots||x?.limit||0)));
   const desktop=Math.max(1,Math.min(6,Number(x?.desktop_columns||x?.columns||1)));
   const slotHosts=(Array.isArray(x?.slot_hosts)?x.slot_hosts:[]).slice(0,12).map(h=>({selector:String(h?.selector||'').slice(0,180),slots:Math.max(0,Math.min(60,Number(h?.slots||0)))})).filter(h=>h.selector&&h.slots>0);
   const exactSlots=slotHosts.length?slotHosts.reduce((s,h)=>s+h.slots,0):slots;
   return {key:String(x?.key||`section-${i+1}`).slice(0,80),type,title:String(x?.title||'').slice(0,160),category:String(x?.category||'').slice(0,120),eyebrow:String(x?.eyebrow||'').slice(0,120),limit:Math.max(0,Math.min(60,Number(x?.limit||0))),slots:exactSlots,slot_contract:(p.content_type==='news'&&String(x?.slot_contract||'')==='sidebar-balanced')?'sidebar-balanced':'exact',slot_hosts:slotHosts,layout_variant:String(x?.layout_variant||'').slice(0,80),column_mode:['computed','fixed'].includes(String(x?.column_mode||''))?String(x.column_mode):'fixed',desktop_columns:desktop,tablet_columns:Math.max(1,Math.min(4,Number(x?.tablet_columns||Math.min(2,desktop)))),mobile_columns:Math.max(1,Math.min(2,Number(x?.mobile_columns||1))),fill_policy:['complete_rows','natural'].includes(String(x?.fill_policy||''))?String(x.fill_policy):(defs.bind_required?'complete_rows':'natural'),grid_selector:String(x?.grid_selector||'').slice(0,180),content_source:String(x?.content_source||defs.content_source).slice(0,60),bind_required:x?.bind_required===false||Number(x?.bind_required)===0?0:defs.bind_required,empty_policy:['slots','message','hide'].includes(String(x?.empty_policy||''))?String(x.empty_policy):(defs.bind_required?'slots':'message')};
 });
 return p;
}
// V18.5 — TEMPLATE CATEGORY CONTRACT V1.
// The public template structure is the source of truth for editor categories.
// A template may change its visual layout, but Admin must always expose every
// category that the corresponding public template can render.
function nrUniqueLabels(values=[]){
 const out=[],seen=new Set();
 for(const v of values||[]){const x=String(v||'').trim();if(!x)continue;const k=x.toLocaleLowerCase('vi');if(seen.has(k))continue;seen.add(k);out.push(x)}
 return out;
}
// V18.6 — NEWS TAXONOMY CONTRACT V1.
// Homepage structure may intentionally feature only a subset, but navigation + Admin
// must expose a richer shared taxonomy so editors are not forced into 5 categories.
const NR_NEWS_TAXONOMY_V1=['Kinh tế','Công nghệ','Kinh doanh','Tài chính','Thế giới','Xã hội','Giáo dục','Sức khỏe','Đời sống','Du lịch','Bất động sản','Pháp luật','Văn hóa','Giải trí','Thể thao','Khoa học','Xe','Nhà đẹp'];
function templateCategoryContract(structure,editorProfile={},contentType='generic'){
 const sp=structure&&typeof structure==='object'?structure:{};
 const ep=editorProfile&&typeof editorProfile==='object'?{...editorProfile}:{};
 const sections=Array.isArray(sp.sections)?sp.sections:[];
 const type=String(contentType||ep.content_type||sp.content_type||'generic').toLowerCase();
 if(type==='news'){
   const structural=nrUniqueLabels(sections.filter(sec=>String(sec?.type||'').toLowerCase()==='category'||String(sec?.content_source||'').toLowerCase()==='category').map(sec=>String(sec?.category||sec?.title||'').trim()));
   ep.content_type='news';ep.id=String(ep.id||'news');
   // Keep the visual sections first, then append the canonical newsroom taxonomy.
   // This preserves every existing homepage frame while giving menu/Admin a complete list.
   ep.categories=nrUniqueLabels([...(structural||[]),...(Array.isArray(ep.categories)?ep.categories:[]),...NR_NEWS_TAXONOMY_V1]);
   delete ep.categoriesByTransaction;
   ep.category_contract='news-taxonomy-v1';
   return ep;
 }
 if(type==='property'){
   const current=ep.categoriesByTransaction&&typeof ep.categoriesByTransaction==='object'?ep.categoriesByTransaction:{};
   const buy=[],sale=[],rent=[];
   for(const sec of sections){
     const st=String(sec?.type||'').toLowerCase();
     if(!['property_list','property_projects','property_split'].includes(st))continue;
     const title=String(sec?.category||sec?.title||'').trim();if(!title)continue;
     const low=title.toLocaleLowerCase('vi');
     if(/thuê/.test(low))rent.push(title);
     else if(/bán|mua|căn hộ|chung cư|nhà phố|biệt thự|đất|kho|xưởng|mặt bằng|shophouse|dự án/.test(low))sale.push(title);
   }
   // V20.4.3 — BĐS uses three explicit intents: Mua / Bán / Cho thuê.
   // Buy categories mirror the template's sale taxonomy so Admin stays synchronized
   // without forcing template authors to duplicate the same property taxonomy.
   const buyLabel=v=>{
     const x=String(v||'').trim();
     if(!x)return '';
     if(/^bán\s+/i.test(x))return x.replace(/^bán\s+/i,'Mua ');
     if(/^mua\s*bán\s*/i.test(x))return x.replace(/^mua\s*bán\s*/i,'Mua ');
     return 'Mua '+x.charAt(0).toLocaleLowerCase('vi')+x.slice(1);
   };
   buy.push(...sale.map(buyLabel).filter(Boolean));
   ep.content_type='property';ep.id=String(ep.id||'property');
   ep.categoriesByTransaction={
     buy:nrUniqueLabels([...buy,...(Array.isArray(current.buy)?current.buy:[])]),
     sale:nrUniqueLabels([...sale,...(Array.isArray(current.sale)?current.sale:[])]),
     rent:nrUniqueLabels([...rent,...(Array.isArray(current.rent)?current.rent:[])])
   };
   delete ep.categories;
   ep.category_contract='template-structure-v1';
   return ep;
 }
 const structural=nrUniqueLabels(sections.filter(sec=>String(sec?.type||'').toLowerCase()==='category'||String(sec?.content_source||'').toLowerCase()==='category').map(sec=>String(sec?.category||sec?.title||'').trim()));
 if(structural.length)ep.categories=structural;else ep.categories=nrUniqueLabels(ep.categories||[]);
 ep.category_contract='template-structure-v1';
 return ep;
}

function validateStructureProfile(p,{active=0}={}){
 const errors=[],warnings=[];const sections=Array.isArray(p?.sections)?p.sections:[];
 if(!sections.length)errors.push('Template chưa có section nào trong structure_profile.');
 const keys=new Set();
 for(let i=0;i<sections.length;i++){
   const sec=sections[i]||{},label=sec.title||sec.key||`Section ${i+1}`,key=String(sec.key||'').trim();
   if(!key)errors.push(`${label}: thiếu key.`); else if(keys.has(key))errors.push(`${label}: key "${key}" bị trùng.`); else keys.add(key);
   const bind=Number(sec.bind_required||0)===1;
   const slots=Math.max(0,Number(sec.slots||0)),dc=Math.max(1,Number(sec.desktop_columns||1)),tc=Math.max(1,Number(sec.tablet_columns||1)),mc=Math.max(1,Number(sec.mobile_columns||1));
   if(bind&&slots<1)errors.push(`${label}: section nhận nội dung phải có slots > 0.`);
   if(bind&&dc>slots&&slots>0)errors.push(`${label}: desktop_columns (${dc}) lớn hơn slots (${slots}).`);
   if(bind&&String(sec.fill_policy)==='complete_rows'&&slots>0&&slots%dc!==0)errors.push(`${label}: slots (${slots}) phải chia hết cho desktop_columns (${dc}) để luôn full hàng.`);
   if(bind&&slots>0&&tc>slots)warnings.push(`${label}: tablet_columns lớn hơn slots.`);
   if(bind&&slots>0&&mc>slots)warnings.push(`${label}: mobile_columns lớn hơn slots.`);
   if(String(sec.content_source)==='category'&&!String(sec.category||'').trim())errors.push(`${label}: content_source=category nhưng chưa khai báo category.`);
   if(bind&&String(sec.empty_policy||'')==='hide')warnings.push(`${label}: empty_policy=hide sẽ làm mất khung khi website chưa có bài.`);
 }
 for(const [si,sb] of (Array.isArray(p?.sidebars)?p.sidebars:[]).entries()){
   if(!String(sb?.root_selector||'').trim())errors.push(`Sidebar ${si+1}: thiếu root_selector.`);
   for(const [wi,w] of (Array.isArray(sb?.widgets)?sb.widgets:[]).entries()){
     const label=w?.title||w?.key||`Widget ${wi+1}`;
     if(!String(w?.key||'').trim())errors.push(`Sidebar ${si+1} / ${label}: thiếu key.`);
     if(['ranked','latest','list'].includes(String(w?.type||''))&&Number(w?.slots||0)<1)errors.push(`Sidebar ${si+1} / ${label}: widget nội dung phải có slots > 0.`);
   }
 }
 if(Number(p?.version||0)<4)errors.push('Structure schema phải là version 4 trở lên.');
 if(active&&errors.length)warnings.push('Template đang bật bán nhưng structure chưa đạt chuẩn.');
 return {ok:errors.length===0,errors,warnings};
}
async function ensureTemplateCatalog(env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS template_catalog(
    template_key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'bat-dong-san',
    preset TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    renewal_price INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL DEFAULT '',
    demo_url TEXT NOT NULL DEFAULT '',
    badge TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    features TEXT NOT NULL DEFAULT '',
    accent TEXT NOT NULL DEFAULT 'blue',
    editor_profile TEXT NOT NULL DEFAULT '',
    sample_enabled INTEGER NOT NULL DEFAULT 0,
    sample_count INTEGER NOT NULL DEFAULT 12,
    layout_profile TEXT NOT NULL DEFAULT '',
    structure_profile TEXT NOT NULL DEFAULT '',
    seo_title TEXT NOT NULL DEFAULT '',
    seo_slug TEXT NOT NULL DEFAULT '',
    primary_keyword TEXT NOT NULL DEFAULT '',
    secondary_keywords TEXT NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    internal_anchor TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();

  const alters=[
    `ALTER TABLE template_catalog ADD COLUMN image_url TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN demo_url TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN badge TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN description TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN features TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN accent TEXT NOT NULL DEFAULT 'blue'`,
    `ALTER TABLE template_catalog ADD COLUMN editor_profile TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN sample_enabled INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE template_catalog ADD COLUMN sample_count INTEGER NOT NULL DEFAULT 12`,
    `ALTER TABLE template_catalog ADD COLUMN layout_profile TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN structure_profile TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN seo_title TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN seo_slug TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN primary_keyword TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN secondary_keywords TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN meta_description TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE template_catalog ADD COLUMN internal_anchor TEXT NOT NULL DEFAULT ''`
  ];
  for(const q of alters){try{await env.DB.prepare(q).run()}catch(e){}}

  const seeds=[
    {
      key:'mau-1',name:'Mẫu 1 · Tin tức & BĐS',category:'bat-dong-san',preset:'newsreal',
      price:1499000,renewal:1999000,sort:1,image:'/assets/demo/mau-1-preview.png',
      demo:'/demo/bat-dong-san/mau-1/',badge:'NHIỀU NỘI DUNG',
      description:'Phong cách cổng thông tin bất động sản, phù hợp website có nhiều tin tức, chuyên mục và bài đăng.',
      features:'Trang chủ nhiều chuyên mục\\nTin tức + bất động sản\\nPhù hợp SEO nội dung',accent:'blue'
    },
    {key:'dich-vu-1',name:'FPT',category:'dich-vu',preset:'service_fpt_1',price:1499000,renewal:1999000,sort:1,image:'/assets/demo/dich-vu-1-preview.png',demo:'/demo/dich-vu/mau-1/',badge:'FPT',description:'Website dịch vụ FPT với Internet, FPT Play, Camera AI và combo.',features:'Internet FPT\nFPT Play\nCamera AI\nCombo & CTA tư vấn',accent:'orange'},
    {key:'dich-vu-2',name:'VNPT',category:'dich-vu',preset:'service_vnpt_2',price:1499000,renewal:1999000,sort:2,image:'/assets/demo/dich-vu-2-preview.png',demo:'/demo/dich-vu/mau-2/',badge:'VNPT',description:'Website VNPT Home với Home Internet, MyTV, Home Cam và combo gia đình.',features:'Home Internet\nMyTV\nHome Cam\nCombo gia đình',accent:'blue'},
    {key:'dich-vu-3',name:'Viettel',category:'dich-vu',preset:'service_viettel_3',price:1499000,renewal:1999000,sort:3,image:'/assets/demo/dich-vu-3-preview.png',demo:'/demo/dich-vu/mau-3/',badge:'VIETTEL',description:'Website Viettel với Internet Wi-Fi 6, TV360, Camera và combo trọn gói.',features:'Internet Viettel\nTV360\nCamera Cloud\nCombo trọn gói',accent:'red'},
    {key:'dich-vu-4',name:'Camera Store',category:'dich-vu',preset:'service_camera_store_4',price:1499000,renewal:1999000,sort:4,image:'/assets/demo/dich-vu-4-preview.png',demo:'/demo/dich-vu/mau-4/',badge:'CAMERA',description:'Website trưng bày camera đa thương hiệu với sản phẩm, thông số, giá, khuyến mãi và tư vấn.',features:'Camera trong nhà\nCamera ngoài trời\nCamera AI quay quét\nCamera IP / bộ giám sát',accent:'green'},
    {key:'game-1',name:'Template website Clash of Clans · Base Portal',category:'game',preset:'game_clash_1',price:1699000,renewal:2199000,sort:1,image:'/assets/demo/game-clash-1-preview.svg',demo:'/demo/game/clash-of-clans/',badge:'CLASH OF CLANS',description:'Mẫu website game chia sẻ base Clash of Clans cho cộng đồng với TH/BH/CH, bộ lọc nhanh và trang chi tiết base.',features:'Town Hall TH2–TH18\nBuilder Hall BH2–BH10\nClan Capital CH1–CH10\nFast Filter + Copy Link',accent:'orange'},
    {key:'tin-tuc-1',name:'Tin tức Mẫu 1 · Tạp chí hiện đại',category:'tin-tuc',preset:'news_portal_1',price:1499000,renewal:1999000,sort:1,image:'/assets/demo/tin-tuc-1-preview-v2.png',demo:'/demo/tin-tuc/mau-1/',badge:'MỚI',description:'Giao diện tin tức hiện đại, tập trung bài nổi bật, dòng tin mới, chuyên mục và nội dung đọc nhiều.',features:'Trang chủ kiểu tạp chí\nTin nổi bật + đọc nhiều\nChuyên mục tự động theo bài viết\nTối ưu nội dung & mobile',accent:'red'},
    {key:'tin-tuc-2',name:'Tin tức Mẫu 2 · Báo điện tử',category:'tin-tuc',preset:'news_paper_2',price:1399000,renewal:1899000,sort:2,image:'/assets/demo/tin-tuc-2-preview.png',demo:'/demo/tin-tuc/mau-2/',badge:'BÁO ĐIỆN TỬ',description:'Bố cục tin dày, headline lớn, danh sách cập nhật liên tục và khu đọc nhiều kiểu báo điện tử.',features:'Headline + tin cạnh bên\nDanh sách tin dày\nĐọc nhiều + chuyên mục\nTối ưu website tin tổng hợp',accent:'red'},
    {key:'tin-tuc-3',name:'Tin tức Mẫu 3 · Magazine hiện đại',category:'tin-tuc',preset:'news_magazine_3',price:1599000,renewal:1999000,sort:3,image:'/assets/demo/tin-tuc-3-preview.png',demo:'/demo/tin-tuc/mau-3/',badge:'MAGAZINE',description:'Giao diện tạp chí hình ảnh nổi bật, hero mosaic, card hiện đại và nhiều khối biên tập.',features:'Hero mosaic nhiều ảnh\nEditor Pick + Trending\nCard tạp chí hiện đại\nPhù hợp lifestyle/công nghệ',accent:'orange'},
    {key:'tin-tuc-4',name:'Tin tức Mẫu 4 · Minimal SEO',category:'tin-tuc',preset:'news_minimal_4',price:1299000,renewal:1799000,sort:4,image:'/assets/demo/tin-tuc-4-preview.png',demo:'/demo/tin-tuc/mau-4/',badge:'SEO / NHẸ',description:'Giao diện tối giản, typography mạnh, mật độ nội dung cao và ưu tiên tốc độ đọc.',features:'Tối giản & tải nhanh\nTypography dễ đọc\nDanh sách nội dung SEO\nPhù hợp blog chuyên ngành',accent:'blue'},
    {
      key:'mau-2',name:'Mẫu 2 · BĐS hiện đại',category:'bat-dong-san',preset:'estate_green',
      price:1799000,renewal:2299000,sort:2,image:'/assets/demo/mau-2-preview.png',
      demo:'/demo/bat-dong-san/mau-2/',badge:'ĐỀ XUẤT',
      description:'Phong cách portal bất động sản hiện đại, hero tìm kiếm lớn và tập trung mạnh vào chuyển đổi khách hàng.',
      features:'Bộ lọc tìm kiếm nổi bật\\nCard bất động sản hiện đại\\nTối ưu trải nghiệm mobile',accent:'green'
    },
    {
      key:'mau-3',name:'Mẫu 3 · BĐS Luxury',category:'bat-dong-san',preset:'estate_luxe_3',
      price:1999000,renewal:2499000,sort:3,image:'/assets/demo/mau-3-preview.png',
      demo:'/demo/bat-dong-san/mau-3/',badge:'CAO CẤP',
      description:'Phong cách luxury editorial, hình ảnh lớn, màu navy/ivory và trải nghiệm phù hợp bất động sản cao cấp.',
      features:'Hero cao cấp\\nGrid tuyển chọn\\nNhà & biệt thự\\nResponsive mobile',accent:'navy'
    },
    {
      key:'mau-4',name:'Mẫu 4 · BĐS Minimal',category:'bat-dong-san',preset:'estate_minimal_4',
      price:1599000,renewal:1999000,sort:4,image:'/assets/demo/mau-4-preview.png',
      demo:'/demo/bat-dong-san/mau-4/',badge:'TỐI GIẢN',
      description:'Giao diện sáng, tối giản, tập trung ảnh, giá và thông tin quan trọng để khách dễ so sánh.',
      features:'Minimal hiện đại\\nLưới tin dày\\nTải nhanh\\nMobile 2 bài/hàng',accent:'black'
    },
    {
      key:'mau-5',name:'Mẫu 5 · BĐS Urban',category:'bat-dong-san',preset:'estate_urban_5',
      price:1899000,renewal:2299000,sort:5,image:'/assets/demo/mau-5-preview.png',
      demo:'/demo/bat-dong-san/mau-5/',badge:'ĐÔ THỊ',
      description:'Phong cách urban hiện đại với hero split-screen, khám phá khu vực và danh sách mua bán/cho thuê rõ ràng.',
      features:'Hero split-screen\\nKhám phá khu vực\\nMua bán + cho thuê\\nCTA chuyển đổi mạnh',accent:'orange'
    }
  ];
  for(const d of seeds){
    await env.DB.prepare(`INSERT OR IGNORE INTO template_catalog
      (template_key,name,category,preset,price,renewal_price,is_active,sort_order,image_url,demo_url,badge,description,features,accent)
      VALUES(?,?,?,?,?,?,1,?,?,?,?,?,?,?)`)
      .bind(d.key,d.name,d.category,d.preset,d.price,d.renewal,d.sort,d.image,d.demo,d.badge,d.description,d.features,d.accent).run();

    // Backfill visual metadata on sites upgraded from V10 without overwriting admin-managed prices/names.
    await env.DB.prepare(`UPDATE template_catalog SET
      image_url=CASE WHEN coalesce(image_url,'')='' THEN ? ELSE image_url END,
      demo_url=CASE WHEN coalesce(demo_url,'')='' THEN ? ELSE demo_url END,
      badge=CASE WHEN coalesce(badge,'')='' THEN ? ELSE badge END,
      description=CASE WHEN coalesce(description,'')='' THEN ? ELSE description END,
      features=CASE WHEN coalesce(features,'')='' THEN ? ELSE features END,
      accent=CASE WHEN coalesce(accent,'')='' THEN ? ELSE accent END
      WHERE template_key=?`)
      .bind(d.image,d.demo,d.badge,d.description,d.features,d.accent,d.key).run();
  }
  
  try{await env.DB.prepare(`UPDATE template_catalog SET image_url='/assets/demo/mau-3-preview.png',demo_url='/demo/bat-dong-san/mau-3/',updated_at=CURRENT_TIMESTAMP WHERE template_key='mau-3'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET image_url='/assets/demo/mau-4-preview.png',demo_url='/demo/bat-dong-san/mau-4/',updated_at=CURRENT_TIMESTAMP WHERE template_key='mau-4'`).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET image_url='/assets/demo/mau-5-preview.png',demo_url='/demo/bat-dong-san/mau-5/',updated_at=CURRENT_TIMESTAMP WHERE template_key='mau-5'`).run()}catch(e){}

  // V12.4: replace the old synthetic SVG thumbnail with the realistic PNG preview.
  try{await env.DB.prepare(`UPDATE template_catalog SET image_url='/assets/demo/tin-tuc-1-preview-v2.png',demo_url='/demo/tin-tuc/mau-1/',updated_at=CURRENT_TIMESTAMP WHERE template_key='tin-tuc-1' AND image_url<>'/assets/demo/tin-tuc-1-preview-v2.png'`).run()}catch(e){}
  for(const [k,n,img] of [['dich-vu-1','FPT','/assets/demo/dich-vu-1-preview.png'],['dich-vu-2','VNPT','/assets/demo/dich-vu-2-preview.png'],['dich-vu-3','Viettel','/assets/demo/dich-vu-3-preview.png'],['dich-vu-4','Camera Store','/assets/demo/dich-vu-4-preview.png']]){try{await env.DB.prepare(`UPDATE template_catalog SET name=?,image_url=?,updated_at=CURRENT_TIMESTAMP WHERE template_key=?`).bind(n,img,k).run()}catch(e){}}

  try{await env.DB.prepare(`UPDATE template_catalog SET editor_profile=? WHERE template_key IN ('mau-1','mau-2','mau-3','mau-4','mau-5') AND (coalesce(editor_profile,'')='' OR editor_profile NOT LIKE '%"categoriesByTransaction"%')`).bind("{\"id\":\"property\",\"label\":\"B\u1ea5t \u0111\u1ed9ng s\u1ea3n\",\"content_type\":\"property\",\"categoriesByTransaction\":{\"sale\":[\"B\u00e1n c\u0103n h\u1ed9 chung c\u01b0\",\"B\u00e1n nh\u00e0 ri\u00eang\",\"B\u00e1n nh\u00e0 m\u1eb7t ph\u1ed1\",\"B\u00e1n bi\u1ec7t th\u1ef1, nh\u00e0 li\u1ec1n k\u1ec1\",\"B\u00e1n shophouse, nh\u00e0 ph\u1ed1 th\u01b0\u01a1ng m\u1ea1i\",\"B\u00e1n \u0111\u1ea5t n\u1ec1n, \u0111\u1ea5t d\u1ef1 \u00e1n\",\"B\u00e1n \u0111\u1ea5t th\u1ed5 c\u01b0, \u0111\u1ea5t \u1edf\",\"B\u00e1n trang tr\u1ea1i, khu ngh\u1ec9 d\u01b0\u1ee1ng\",\"B\u00e1n kho, nh\u00e0 x\u01b0\u1edfng\",\"B\u00e1n v\u0103n ph\u00f2ng\",\"B\u00e1n kh\u00e1ch s\u1ea1n\",\"B\u00e1n m\u1eb7t b\u1eb1ng kinh doanh\",\"B\u1ea5t \u0111\u1ed9ng s\u1ea3n b\u00e1n kh\u00e1c\"],\"rent\":[\"Cho thu\u00ea c\u0103n h\u1ed9 chung c\u01b0\",\"Cho thu\u00ea nh\u00e0 ri\u00eang\",\"Cho thu\u00ea nh\u00e0 m\u1eb7t ph\u1ed1\",\"Cho thu\u00ea bi\u1ec7t th\u1ef1, nh\u00e0 li\u1ec1n k\u1ec1\",\"Cho thu\u00ea shophouse, c\u1eeda h\u00e0ng\",\"Cho thu\u00ea ph\u00f2ng tr\u1ecd\",\"Cho thu\u00ea v\u0103n ph\u00f2ng\",\"Cho thu\u00ea kho, nh\u00e0 x\u01b0\u1edfng\",\"Cho thu\u00ea m\u1eb7t b\u1eb1ng kinh doanh\",\"Cho thu\u00ea \u0111\u1ea5t\",\"B\u1ea5t \u0111\u1ed9ng s\u1ea3n cho thu\u00ea kh\u00e1c\"]},\"contentLabel\":\"M\u00f4 t\u1ea3 chi ti\u1ebft b\u1ea5t \u0111\u1ed9ng s\u1ea3n\",\"contentHelp\":\"Tr\u00ecnh b\u00e0y v\u1ecb tr\u00ed, ti\u1ec7n \u00edch, ph\u00e1p l\u00fd, \u01b0u \u0111i\u1ec3m; c\u00f3 th\u1ec3 ch\u00e8n \u1ea3nh v\u00e0 \u0111\u1ecbnh d\u1ea1ng n\u1ed9i dung.\",\"custom_fields\":[]}").run()}catch(e){}
  try{await env.DB.prepare(`UPDATE template_catalog SET editor_profile=? WHERE template_key LIKE 'tin-tuc-%' AND (coalesce(editor_profile,'')='' OR editor_profile NOT LIKE '%\"content_type\":\"news\"%')`).bind("{\"id\":\"news\",\"label\":\"Tin t\u1ee9c\",\"content_type\":\"news\",\"categories\":[\"Kinh t\u1ebf\",\"C\u00f4ng ngh\u1ec7\",\"Du l\u1ecbch\",\"S\u1ee9c kh\u1ecfe\",\"B\u1ea5t \u0111\u1ed9ng s\u1ea3n\",\"\u0110\u1eddi s\u1ed1ng\",\"Kinh doanh\",\"Gi\u00e1o d\u1ee5c\",\"Nh\u00e0 \u0111\u1eb9p\"],\"contentLabel\":\"N\u1ed9i dung b\u00e0i vi\u1ebft\",\"contentHelp\":\"So\u1ea1n b\u00e0i nh\u01b0 tr\u00ecnh so\u1ea1n th\u1ea3o v\u0103n b\u1ea3n: ti\u00eau \u0111\u1ec1 ph\u1ee5, danh s\u00e1ch, li\u00ean k\u1ebft v\u00e0 \u1ea3nh trong b\u00e0i.\",\"custom_fields\":[]}").run()}catch(e){}
  // V20.5.1 — Three provider service templates. Structure is identical between showroom/trial/client; only showroom has sample content.
  const serviceTemplates={
    'dich-vu-1':{provider:'FPT',categories:['Internet FPT','Truyền hình FPT','Camera FPT','Combo FPT','Khuyến mãi FPT']},
    'dich-vu-2':{provider:'VNPT',categories:['Internet VNPT','Truyền hình MyTV','Camera VNPT','Combo VNPT','Khuyến mãi VNPT']},
    'dich-vu-3':{provider:'Viettel',categories:['Internet Viettel','Truyền hình TV360','Camera Viettel','Combo Viettel','Khuyến mãi Viettel']},
    'dich-vu-4':{provider:'Camera Store',categories:['Camera Wi-Fi trong nhà','Camera ngoài trời','Camera AI quay quét','Camera IP & bộ giám sát','Khuyến mãi Camera']}
  };
  for(const [key,cfg] of Object.entries(serviceTemplates)){
    const ep={id:'service',label:'Dịch vụ',content_type:'service',categories:cfg.categories,contentLabel:'Mô tả gói dịch vụ',contentHelp:'Trình bày quyền lợi, điều kiện, khu vực áp dụng và hướng dẫn đăng ký.',custom_fields:[{key:'service_price',label:'Giá / tháng',type:'text',placeholder:'Ví dụ: 200.000đ/tháng'},{key:'service_speed',label:'Tốc độ / thông số',type:'text',placeholder:'Ví dụ: 300 Mbps'},{key:'service_promo',label:'Ưu đãi / quyền lợi',type:'text',placeholder:'Ví dụ: Modem Wi-Fi 6, ưu đãi theo khu vực'},{key:'service_cta',label:'Nhãn nút CTA',type:'text',placeholder:'Ví dụ: Đăng ký tư vấn'}]};
    try{await env.DB.prepare(`UPDATE template_catalog SET editor_profile=? WHERE template_key=? AND (coalesce(editor_profile,'')='' OR editor_profile NOT LIKE '%"content_type":"service"%')`).bind(JSON.stringify(ep),key).run()}catch(e){}
    const cats=cfg.categories;const sp={version:6,content_type:'service',geometry_locked:1,route_contract:'service-v1',card_contract:'service-card-v1',article_contract:'service-detail-v1',sidebars:[],sections:[{key:'hero',type:'section',title:`Giải pháp ${cfg.provider} cho gia đình`,slots:0,desktop_columns:1,tablet_columns:1,mobile_columns:1,content_source:'none',bind_required:0,empty_policy:'slots'},{key:'internet',type:'category',title:cats[0],category:cats[0],slots:3,desktop_columns:3,tablet_columns:2,mobile_columns:1,desktop_rows:1,content_source:'category',bind_required:1,empty_policy:'slots'},{key:'television',type:'category',title:cats[1],category:cats[1],slots:3,desktop_columns:3,tablet_columns:2,mobile_columns:1,desktop_rows:1,content_source:'category',bind_required:1,empty_policy:'slots'},{key:'camera',type:'category',title:cats[2],category:cats[2],slots:3,desktop_columns:3,tablet_columns:2,mobile_columns:1,desktop_rows:1,content_source:'category',bind_required:1,empty_policy:'slots'},{key:'combo',type:'category',title:cats[3],category:cats[3],slots:3,desktop_columns:3,tablet_columns:2,mobile_columns:1,desktop_rows:1,content_source:'category',bind_required:1,empty_policy:'slots'},{key:'benefits',type:'benefits',title:'Lợi ích dịch vụ',slots:0,desktop_columns:4,tablet_columns:2,mobile_columns:1,content_source:'none',bind_required:0,empty_policy:'slots'},{key:'contact',type:'section',title:'Đăng ký tư vấn',slots:0,desktop_columns:1,tablet_columns:1,mobile_columns:1,content_source:'none',bind_required:0,empty_policy:'slots'}]};
    try{await env.DB.prepare(`UPDATE template_catalog SET structure_profile=? WHERE template_key=? AND (coalesce(structure_profile,'')='' OR structure_profile NOT LIKE '%"content_type":"service"%')`).bind(JSON.stringify(sp),key).run()}catch(e){}
  }
  // V20.6.0 — Service Commerce & Lead: richer package taxonomy + conversion fields.
  const serviceCommerce={
    'dich-vu-1':{provider:'FPT',categories:['Internet gia đình FPT','Internet doanh nghiệp FPT','Wi-Fi Mesh / Wi-Fi 6 FPT','Internet Gaming FPT','FPT Play / Truyền hình','Camera FPT','Cloud Camera FPT','Combo Internet + FPT Play','Combo Internet + Camera','Triple Combo FPT','Thiết bị FPT','Khuyến mãi FPT','Tin tư vấn FPT']},
    'dich-vu-2':{provider:'VNPT',categories:['Home Internet VNPT','Internet doanh nghiệp VNPT','Wi-Fi Mesh VNPT','Internet Gaming VNPT','MyTV / Truyền hình','Home Cam VNPT','Cloud Camera VNPT','Combo Internet + MyTV','Combo Internet + Camera','Triple Combo VNPT','Thiết bị VNPT','Khuyến mãi VNPT','Tin tư vấn VNPT']},
    'dich-vu-3':{provider:'Viettel',categories:['Internet gia đình Viettel','Internet doanh nghiệp Viettel','Wi-Fi Mesh / Wi-Fi 6 Viettel','Internet Gaming Viettel','TV360 / Truyền hình','Camera Viettel','Cloud Camera Viettel','Combo Internet + TV360','Combo Internet + Camera','Triple Combo Viettel','Thiết bị Viettel','Khuyến mãi Viettel','Tin tư vấn Viettel']},
    'dich-vu-4':{provider:'Camera Store',categories:['Camera Wi-Fi trong nhà','Camera ngoài trời','Camera AI quay quét','Camera IP & bộ giám sát','Camera IMOU','Camera EZVIZ','Camera Tapo','Camera Hikvision','Camera Dahua','Camera KBVision','Đầu ghi NVR / DVR','Phụ kiện camera','Khuyến mãi Camera','Tin tư vấn Camera']}
  };
  for(const [key,cfg] of Object.entries(serviceCommerce)){
    const ep=key==='dich-vu-4'?{id:'service',label:'Sản phẩm Camera',content_type:'service',categories:cfg.categories,contentLabel:'Mô tả chi tiết sản phẩm',contentHelp:'Trình bày tính năng, thông số, bảo hành, khuyến mãi và hướng dẫn tư vấn/lắp đặt.',custom_fields:[{key:'service_price',label:'Giá bán',type:'text',placeholder:'Ví dụ: 599.000đ'},{key:'camera_brand',label:'Thương hiệu',type:'text',placeholder:'IMOU / EZVIZ / Tapo / Hikvision...'},{key:'camera_resolution',label:'Độ phân giải',type:'text',placeholder:'2MP / 3MP / 4MP / 5MP / 3K'},{key:'camera_lens',label:'Ống kính / góc nhìn',type:'text',placeholder:'4mm / quay quét 360°'},{key:'camera_connection',label:'Kết nối',type:'text',placeholder:'Wi-Fi / LAN / PoE / 4G'},{key:'camera_night',label:'Quan sát ban đêm',type:'text',placeholder:'Hồng ngoại / Full Color / Starlight'},{key:'camera_storage',label:'Lưu trữ',type:'text',placeholder:'microSD 512GB / Cloud / NVR'},{key:'camera_warranty',label:'Bảo hành',type:'text',placeholder:'12 / 24 tháng'},{key:'service_promo',label:'Khuyến mãi / quyền lợi',type:'textarea',placeholder:'Quà tặng, lắp đặt, điều kiện áp dụng'},{key:'service_cta',label:'Nhãn CTA',type:'text',placeholder:'Nhận tư vấn / Đặt hàng'}]}:{id:'service',label:'Dịch vụ',content_type:'service',categories:cfg.categories,contentLabel:'Mô tả gói / bài tư vấn',contentHelp:'Mô tả quyền lợi, điều kiện, khu vực áp dụng, thiết bị và hướng dẫn đăng ký.',custom_fields:[
      {key:'service_price',label:'Giá / tháng',type:'text',placeholder:'Ví dụ: 220.000đ/tháng'},
      {key:'service_speed_down',label:'Tốc độ Download',type:'text',placeholder:'Ví dụ: 300 Mbps'},
      {key:'service_speed_up',label:'Tốc độ Upload',type:'text',placeholder:'Ví dụ: 300 Mbps'},
      {key:'service_equipment',label:'Modem / Wi-Fi / Thiết bị',type:'text',placeholder:'Wi-Fi 6, Mesh, Box...'},
      {key:'service_devices',label:'Số thiết bị phù hợp',type:'text',placeholder:'Ví dụ: 15–25 thiết bị'},
      {key:'service_tv',label:'Truyền hình / nội dung',type:'text',placeholder:'MyTV, FPT Play, TV360...'},
      {key:'service_camera',label:'Camera / Cloud',type:'text',placeholder:'Camera AI + Cloud 7 ngày'},
      {key:'service_install_fee',label:'Phí hòa mạng / lắp đặt',type:'text',placeholder:'Miễn phí / theo khu vực'},
      {key:'service_prepaid',label:'Ưu đãi trả trước',type:'text',placeholder:'Trả trước 6/12 tháng...'},
      {key:'service_promo',label:'Khuyến mãi / quyền lợi',type:'textarea',placeholder:'Ưu đãi, quà tặng, điều kiện áp dụng'},
      {key:'service_area',label:'Khu vực áp dụng',type:'text',placeholder:'Toàn quốc / tỉnh thành cụ thể'},
      {key:'service_audience',label:'Khách hàng phù hợp',type:'text',placeholder:'Gia đình, game thủ, văn phòng...'},
      {key:'service_cta',label:'Nhãn CTA',type:'text',placeholder:'Đăng ký tư vấn'}
    ]};
    const cats=cfg.categories;
    const visibleCats={
      'dich-vu-1':['Internet FPT','Truyền hình FPT','Camera FPT','Combo FPT'],
      'dich-vu-2':['Internet VNPT','Truyền hình MyTV','Camera VNPT','Combo VNPT'],
      'dich-vu-3':['Internet Viettel','Truyền hình TV360','Camera Viettel','Combo Viettel'],
      'dich-vu-4':['Camera Wi-Fi trong nhà','Camera ngoài trời','Camera AI quay quét','Camera IP & bộ giám sát']
    }[key]||[cats[0],cats[4],cats[5],cats[7]];
    const sp=key==='dich-vu-4'?{version:9,layout_contract:'universal-layout-v1',content_type:'service',geometry_locked:1,route_contract:'service-commerce-v2',card_contract:'camera-product-card-v1',article_contract:'service-detail-v2',lead_contract:'service-lead-v1',sidebars:[],sections:[{key:'hero',type:'section',title:'Camera & giải pháp an ninh',content_source:'none',bind_required:0},{key:'brands',type:'section',title:'Thương hiệu nổi bật',content_source:'none',bind_required:0},{key:'indoor',type:'category',title:visibleCats[0],category:visibleCats[0],slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,content_source:'category',bind_required:1},{key:'outdoor',type:'category',title:visibleCats[1],category:visibleCats[1],slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,content_source:'category',bind_required:1},{key:'ai',type:'category',title:visibleCats[2],category:visibleCats[2],slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,content_source:'category',bind_required:1},{key:'pro',type:'category',title:visibleCats[3],category:visibleCats[3],slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,content_source:'category',bind_required:1},{key:'advice',type:'section',title:'Cẩm nang camera',content_source:'none',bind_required:0},{key:'contact',type:'section',title:'Nhận tư vấn & báo giá',content_source:'none',bind_required:0}]}:{version:8,layout_contract:'universal-layout-v1',content_type:'service',geometry_locked:1,route_contract:'service-commerce-v2',card_contract:'service-commerce-card-v2',article_contract:'service-detail-v2',lead_contract:'service-lead-v1',sidebars:[],sections:[
      {key:'hero',type:'section',title:`Giải pháp ${cfg.provider}`,content_source:'none',bind_required:0},
      {key:'needs',type:'section',title:'Chọn theo nhu cầu',content_source:'none',bind_required:0},
      {key:'internet',type:'category',title:visibleCats[0],category:visibleCats[0],slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,content_source:'category',bind_required:1,...(key==='dich-vu-2'?{slot_hosts:[{selector:'.vnpt-feature-pack',slots:1},{selector:'.vnpt-pack-list',slots:5}]}:{})},
      {key:'tv',type:'category',title:visibleCats[1],category:visibleCats[1],slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,content_source:'category',bind_required:1},
      {key:'camera',type:'category',title:visibleCats[2],category:visibleCats[2],slots:6,slot_contract:'exact',desktop_columns:3,tablet_columns:2,mobile_columns:1,content_source:'category',bind_required:1},
      {key:'combo',type:'category',title:visibleCats[3],category:visibleCats[3],slots:6,slot_contract:'exact',desktop_columns:key==='dich-vu-3'?2:3,tablet_columns:2,mobile_columns:1,content_source:'category',bind_required:1},
      {key:'advice',type:'section',title:'Cẩm nang dịch vụ',content_source:'none',bind_required:0},
      {key:'contact',type:'section',title:'Đăng ký tư vấn',content_source:'none',bind_required:0}
    ]};
    try{await env.DB.prepare(`UPDATE template_catalog SET editor_profile=?,structure_profile=? WHERE template_key=?`).bind(JSON.stringify(ep),JSON.stringify(sp),key).run()}catch(e){}
  }

  // V20.8.0 — Game / Clash of Clans content contract.
  try{
    const gameEditor={id:'game-base',label:'Clash of Clans Base',content_type:'game',categories:['Town Hall','Builder Hall','Clan Capital'],contentLabel:'Nội dung / chiến thuật base',contentHelp:'Mô tả cách base hoạt động, mục tiêu phòng thủ, meta phù hợp và hướng dẫn copy.',custom_fields:[
      {key:'game_group',label:'Nhóm Base',type:'select',options:['Town Hall','Builder Hall','Clan Capital']},
      {key:'game_level',label:'Level',type:'text',placeholder:'TH18 / BH10 / CH10'},
      {key:'game_purpose',label:'Purpose',type:'select',options:['War','Farming','Hybrid','Trophy','Legend','CWL','Troll']},
      {key:'game_style',label:'Style',type:'select',options:['Diamond','Ring','Box','Compact','Spread']},
      {key:'game_defense',label:'Defense',type:'select',options:['Anti 3 Star','Anti 2 Star','Anti Everything']},
      {key:'copy_link',label:'Copy Link',type:'url',placeholder:'https://link.clashofclans.com/...'},
      {key:'game_year',label:'Năm',type:'text',placeholder:'2026'}
    ]};
    await env.DB.prepare(`UPDATE template_catalog SET editor_profile=?,structure_profile=? WHERE template_key='game-1'`).bind(JSON.stringify(gameEditor),JSON.stringify(defaultTemplateStructure('game-1'))).run();
  }catch(e){}

  // V15.2: backfill đúng khung riêng cho 9 template hiện tại.
  for(const k of ['mau-1','mau-2','mau-3','mau-4','mau-5','tin-tuc-1','tin-tuc-2','tin-tuc-3','tin-tuc-4','dich-vu-1','dich-vu-2','dich-vu-3','dich-vu-4','game-1']){try{const row=await env.DB.prepare(`SELECT structure_profile FROM template_catalog WHERE template_key=?`).bind(k).first();let cur={};try{cur=JSON.parse(String(row?.structure_profile||'{}'))}catch(e){}const def=defaultTemplateStructure(k);const requiredVersion=Math.max(1,Number(def?.version||1));if(!row?.structure_profile||Number(cur?.version||0)<requiredVersion||!Array.isArray(cur?.sections)||!cur.sections.some(x=>Number(x?.slots||0)>0)){await env.DB.prepare(`UPDATE template_catalog SET structure_profile=? WHERE template_key=?`).bind(JSON.stringify(def),k).run()}}catch(e){}}


}


async function ensureSiteTemplateIdentity(env){
  try{await env.DB.prepare(`ALTER TABLE sites ADD COLUMN template_key TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  await ensureTemplateCatalog(env);
  try{
    await env.DB.prepare(`UPDATE sites SET template_key=coalesce(
      (SELECT tc.template_key FROM template_catalog tc WHERE tc.preset=sites.preset ORDER BY tc.sort_order,tc.template_key LIMIT 1),'')
      WHERE coalesce(template_key,'')=''`).run();
  }catch(e){}
}

async function ensureSalesLeads(env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS sales_leads(
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
    facebook TEXT NOT NULL DEFAULT '',
    master_note TEXT NOT NULL DEFAULT '',
    care_note TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '',
    follow_up_at TEXT,
    marketing_opt_in INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    payment_order_code TEXT NOT NULL DEFAULT '',
    paid_amount INTEGER NOT NULL DEFAULT 0,
    paid_at TEXT,
    converted_site_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  try{await env.DB.prepare(`ALTER TABLE sales_leads ADD COLUMN facebook TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE sales_leads ADD COLUMN care_note TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE sales_leads ADD COLUMN tags TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE sales_leads ADD COLUMN follow_up_at TEXT`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE sales_leads ADD COLUMN marketing_opt_in INTEGER NOT NULL DEFAULT 0`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE sales_leads ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid'`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE sales_leads ADD COLUMN payment_order_code TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE sales_leads ADD COLUMN paid_amount INTEGER NOT NULL DEFAULT 0`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE sales_leads ADD COLUMN paid_at TEXT`).run()}catch(e){}
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_sales_leads_status ON sales_leads(status,created_at)`).run()}catch(e){}
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_sales_leads_phone ON sales_leads(phone)`).run()}catch(e){}
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_sales_leads_email ON sales_leads(email)`).run()}catch(e){}
}

async function masterOK(env,req){
  if(!env.MASTER_KEY)return false;
  const auth=req.headers.get('Authorization')||'';
  const bearer=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
  const t=bearer||cookies(req).nr_master_session||'';
  if(!t)return false;
  return t===await sha256('newsreal-master:'+env.MASTER_KEY);
}
async function syncFinancialLedger(env){
  await ensureCustomerTables(env);
  // Initial payment: one immutable/idempotent ledger row per customer site.
  await env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note)
    SELECT s.id,'initial','paid',coalesce(sp.first_price,ss.sale_price,0),coalesce(ss.internal_cost,0),coalesce(cp.order_code,''),
      'Thanh toán kích hoạt lần đầu',ss.started_at,ss.expires_at,coalesce(ss.started_at,cp.activated_at,ss.updated_at,CURRENT_TIMESTAMP),'initial:'||s.id,'Tự đồng bộ từ trạng thái dịch vụ'
    FROM sites s JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    WHERE ss.payment_status='paid' AND coalesce(ss.finance_excluded,0)=0
      AND NOT EXISTS(SELECT 1 FROM financial_transactions ft WHERE ft.unique_key='initial:'||s.id)`).run();
  // Completed historical renewals.
  await env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note)
    SELECT rh.site_id,'renewal','paid',rh.amount,coalesce(ss.internal_cost,0),coalesce(rh.order_code,''),'Gia hạn dịch vụ',rh.old_expires_at,rh.new_expires_at,
      coalesce(rh.paid_at,rh.completed_at,rh.created_at),'renewal:'||rh.site_id||':'||rh.old_expires_at,'Tự đồng bộ từ lịch sử gia hạn'
    FROM renewal_history rh LEFT JOIN service_subscriptions ss ON ss.site_id=rh.site_id
    WHERE coalesce(ss.finance_excluded,0)=0
      AND NOT EXISTS(SELECT 1 FROM financial_transactions ft WHERE ft.unique_key='renewal:'||rh.site_id||':'||rh.old_expires_at)`).run();
}


async function ensureTrialTables(env){
  await ensureSalesLeads(env);
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS website_trials(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trial_token TEXT NOT NULL UNIQUE,
      site_id INTEGER NOT NULL UNIQUE,
      lead_id INTEGER NOT NULL,
      template_key TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      grace_expires_at TEXT NOT NULL,
      last_seen_at TEXT,
      admin_login_count INTEGER NOT NULL DEFAULT 0,
      post_create_count INTEGER NOT NULL DEFAULT 0,
      conversion_request_at TEXT,
      converted_site_id INTEGER,
      master_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
      FOREIGN KEY(lead_id) REFERENCES sales_leads(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_trials_status_expiry ON website_trials(status,expires_at)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_trials_lead ON website_trials(lead_id)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS trial_events(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trial_id INTEGER NOT NULL,
      lead_id INTEGER,
      event_type TEXT NOT NULL,
      event_data TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(trial_id) REFERENCES website_trials(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_trial_events_trial ON trial_events(trial_id,id)`)
  ]);
  for(const q of [
    `ALTER TABLE sales_leads ADD COLUMN lead_kind TEXT NOT NULL DEFAULT 'inquiry'`,
    `ALTER TABLE sales_leads ADD COLUMN trial_id INTEGER`,
    `ALTER TABLE sales_leads ADD COLUMN last_activity_at TEXT`,
    `ALTER TABLE sales_leads ADD COLUMN care_status TEXT NOT NULL DEFAULT 'new'`,
    `ALTER TABLE sales_leads ADD COLUMN zalo TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE sales_leads ADD COLUMN company TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE sales_leads ADD COLUMN trial_source_url TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE website_trials ADD COLUMN source_ip_hash TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE website_trials ADD COLUMN user_agent_hash TEXT NOT NULL DEFAULT ''`
  ]){try{await env.DB.prepare(q).run()}catch(e){}}
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_trials_ip_created ON website_trials(source_ip_hash,created_at)`).run()}catch(e){}
}
function trialPublicState(row){
  if(!row)return null;
  const now=Date.now(),end=Date.parse(String(row.expires_at||'').replace(' ','T')+'Z');
  const expired=Number.isFinite(end)&&end<=now;
  return {id:Number(row.id),token:row.trial_token,template_key:row.template_key,status:expired&&row.status==='active'?'expired':row.status,
    started_at:row.started_at,expires_at:row.expires_at,grace_expires_at:row.grace_expires_at,expired,
    remaining_seconds:expired?0:Math.max(0,Math.floor((end-now)/1000)),site_id:Number(row.site_id),lead_id:Number(row.lead_id),tenant:row.domain||''};
}
async function trialByToken(env,token){
  await ensureTrialTables(env);
  const row=await env.DB.prepare(`SELECT wt.*,s.domain,s.name,s.preset,s.template_key site_template_key,sl.customer_name,sl.phone,sl.email,sl.zalo,sl.company,sl.facebook,sl.site_name,sl.note,sl.marketing_opt_in,sl.template_name,
      tc.price template_price,tc.renewal_price template_renewal_price,tc.demo_url template_demo_url,tc.category template_category
    FROM website_trials wt JOIN sites s ON s.id=wt.site_id LEFT JOIN sales_leads sl ON sl.id=wt.lead_id LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.trial_token=? LIMIT 1`).bind(String(token||'')).first();
  if(!row)return null;
  const st=trialPublicState(row);
  if(st.expired&&row.status==='active'){
    await env.DB.prepare(`UPDATE website_trials SET status='expired',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(row.id).run();
    row.status='expired';
  }
  return row;
}
async function trialEvent(env,trial,eventType,data={}){
  if(!trial)return;
  try{await env.DB.prepare(`INSERT INTO trial_events(trial_id,lead_id,event_type,event_data) VALUES(?,?,?,?)`).bind(trial.id,trial.lead_id,eventType,JSON.stringify(data||{})).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE website_trials SET last_seen_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(trial.id).run()}catch(e){}
  try{await env.DB.prepare(`UPDATE sales_leads SET last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(trial.lead_id).run()}catch(e){}
}

async function masterOverview(env){
  const sites=(await env.DB.prepare(`SELECT count(*) c FROM sites s WHERE NOT EXISTS(SELECT 1 FROM website_trials wt WHERE wt.site_id=s.id)`).first())?.c||0;
  const active=(await env.DB.prepare(`SELECT count(*) c FROM sites s WHERE s.status='active' AND NOT EXISTS(SELECT 1 FROM website_trials wt WHERE wt.site_id=s.id)`).first())?.c||0;
  const posts=(await env.DB.prepare(`SELECT count(*) c FROM posts`).first())?.c||0;
  const views=(await env.DB.prepare(`SELECT coalesce(sum(views),0) c FROM posts`).first())?.c||0;
  const today=(await env.DB.prepare(`SELECT count(*) c FROM pageviews WHERE date(created_at)=date('now')`).first())?.c||0;
  return {sites,active,posts,views,today};
}

const DEMO_CONTENT=[["property", "Căn hộ 2 phòng ngủ view hồ tại Vinhomes Ocean Park", "Bán căn hộ chung cư", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=82", "4,25 tỷ", "72 m²", "Khu đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội", "0903668899", "sale", "Chung cư", "59 triệu/m²", 2, 2, 1, "Đông Nam", "Sổ hồng lâu dài", "Full nội thất", "Hà Nội", "Gia Lâm", "Đa Tốn", "Nguyễn Minh Anh", 1, 1, "DEMO-CH-001", ""], ["property", "Bán căn hộ 3 phòng ngủ trung tâm Cầu Giấy, nội thất đẹp", "Bán căn hộ chung cư", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=82", "6,8 tỷ", "108 m²", "Đường Trần Thái Tông, Cầu Giấy, Hà Nội", "0988123456", "sale", "Chung cư", "63 triệu/m²", 3, 2, 1, "Nam", "Sổ hồng", "Nội thất cao cấp", "Hà Nội", "Cầu Giấy", "Dịch Vọng", "Trần Quốc Huy", 0, 1, "DEMO-CH-002", ""], ["property", "Nhà phố 5 tầng mặt phố Lê Chân, Hải Phòng, kinh doanh tốt", "Bán nhà đất", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82", "9,6 tỷ", "86 m²", "Lê Chân, Hải Phòng", "03899862876", "sale", "Nhà phố", "112 triệu/m²", 5, 5, 5, "Đông Bắc", "Sổ đỏ", "Cơ bản", "Hải Phòng", "Lê Chân", "Dư Hàng", "Vương Hoàng", 1, 1, "DEMO-NP-001", "5,2 m"], ["property", "Biệt thự song lập khu đô thị Vinhomes Riverside, hoàn thiện đẹp", "Bán nhà đất", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=82", "29 tỷ", "180 m²", "Long Biên, Hà Nội", "0912555888", "sale", "Biệt thự", "161 triệu/m²", 4, 5, 3, "Tây Bắc", "Sổ đỏ lâu dài", "Full nội thất", "Hà Nội", "Long Biên", "Phúc Lợi", "Phạm Thu Trang", 1, 1, "DEMO-BT-001", "10 m"], ["property", "Cho thuê căn hộ 2 phòng ngủ Masteri Waterfront, đầy đủ nội thất", "Cho thuê nhà", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=82", "17 triệu/tháng", "68 m²", "Ocean Park, Gia Lâm, Hà Nội", "0966222399", "rent", "Chung cư", "250 nghìn/m²/tháng", 2, 2, 1, "Đông", "Hợp đồng chính chủ", "Full nội thất", "Hà Nội", "Gia Lâm", "Đa Tốn", "Lê Hải Yến", 1, 1, "DEMO-RENT-001", ""], ["property", "Cho thuê nhà nguyên căn 4 tầng quận 7, phù hợp văn phòng", "Cho thuê nhà", "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=82", "32 triệu/tháng", "96 m²", "Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh", "0938555119", "rent", "Nhà phố", "333 nghìn/m²/tháng", 5, 5, 4, "Nam", "Hợp đồng thuê", "Cơ bản", "TP. Hồ Chí Minh", "Quận 7", "Tân Phong", "Đỗ Thanh Tùng", 0, 1, "DEMO-RENT-002", "6 m"], ["property", "Kho xưởng 1.200 m² tại An Dương, xe container ra vào thuận tiện", "Kho xưởng & mặt bằng", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=82", "78 triệu/tháng", "1.200 m²", "KCN An Dương, Hải Phòng", "0904818686", "rent", "Kho xưởng", "65 nghìn/m²/tháng", 0, 2, 1, "Tây", "Hợp đồng thuê rõ ràng", "Điện 3 pha", "Hải Phòng", "An Dương", "Lê Thiện", "Nguyễn Văn Nam", 1, 1, "DEMO-KX-001", "30 m"], ["property", "Mặt bằng kinh doanh góc 2 mặt tiền trung tâm Đà Nẵng", "Kho xưởng & mặt bằng", "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82", "65 triệu/tháng", "220 m²", "Hải Châu, Đà Nẵng", "0905991228", "rent", "Mặt bằng", "295 nghìn/m²/tháng", 0, 2, 2, "Đông Nam", "Hợp đồng thuê", "Mặt bằng trống", "Đà Nẵng", "Hải Châu", "Hải Châu 1", "Hoàng Đức Long", 0, 1, "DEMO-MB-001", "12 m"], ["property", "Đất nền 100 m² khu đô thị Bắc Sông Cấm, vị trí đẹp", "Đất nền & đất dự án", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=82", "3,9 tỷ", "100 m²", "Thủy Nguyên, Hải Phòng", "0915771338", "sale", "Đất", "39 triệu/m²", 0, 0, 0, "Nam", "Sổ đỏ", "", "Hải Phòng", "Thủy Nguyên", "Tân Dương", "Bùi Mạnh Cường", 1, 1, "DEMO-DAT-001", "5 m"], ["property", "Đất biệt thự 200 m² ven sông Hội An, Quảng Nam", "Đất nền & đất dự án", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82", "7,5 tỷ", "200 m²", "Cẩm Hà, Hội An, Quảng Nam", "0977334556", "sale", "Đất", "37,5 triệu/m²", 0, 0, 0, "Đông", "Sổ đỏ", "", "Quảng Nam", "Hội An", "Cẩm Hà", "Đặng Hoàng Sơn", 0, 1, "DEMO-DAT-002", "10 m"], ["property", "Shophouse 5 tầng khu đô thị mới, trục đường thương mại sầm uất", "Bán nhà đất", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82", "18,5 tỷ", "105 m²", "Hạ Long, Quảng Ninh", "0911202668", "sale", "Shophouse", "176 triệu/m²", 4, 6, 5, "Đông Nam", "Sổ đỏ", "Hoàn thiện cơ bản", "Quảng Ninh", "Hạ Long", "Bãi Cháy", "Vũ Đức Hải", 1, 1, "DEMO-SH-001", "7 m"], ["property", "Nhà vườn 160 m² tại Đà Lạt, không gian xanh, đường ô tô", "Bán nhà đất", "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=82", "8,2 tỷ", "160 m²", "Phường 10, Đà Lạt, Lâm Đồng", "0932667099", "sale", "Nhà phố", "51 triệu/m²", 4, 3, 2, "Tây Nam", "Sổ riêng", "Nội thất gỗ", "Lâm Đồng", "Đà Lạt", "Phường 10", "Nguyễn Thảo Vy", 0, 1, "DEMO-NV-001", "8 m"], ["news", "Thị trường căn hộ 2026: người mua ưu tiên pháp lý và tiện ích thật", "Thị trường", "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "Hà Nội", "", "", "Ban biên tập", 1, 1, "DEMO-NEWS-001", ""], ["news", "5 bước kiểm tra pháp lý trước khi đặt cọc mua nhà đất", "Kiến thức", "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Ban biên tập", 0, 1, "DEMO-NEWS-002", ""], ["news", "Kinh nghiệm định giá nhà phố: 4 yếu tố quyết định mức giá thực tế", "Kinh nghiệm", "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Ban biên tập", 0, 1, "DEMO-NEWS-003", ""], ["property", "Căn hộ 1 phòng ngủ gần trung tâm Mỹ Đình, phù hợp đầu tư cho thuê", "Bán căn hộ chung cư", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=82", "3,15 tỷ", "52 m²", "Mỹ Đình, Nam Từ Liêm, Hà Nội", "0912333444", "sale", "Chung cư", "61 triệu/m²", 1, 1, 1, "Đông", "Sổ hồng", "Đầy đủ", "Hà Nội", "Nam Từ Liêm", "Mỹ Đình 1", "Lê Minh Quân", 0, 1, "DEMO-CH-003", ""], ["property", "Penthouse 4 phòng ngủ view sông Sài Gòn, nội thất nhập khẩu", "Bán căn hộ chung cư", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=82", "22 tỷ", "210 m²", "Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh", "0908999888", "sale", "Chung cư", "105 triệu/m²", 4, 4, 1, "Nam", "Sổ hồng", "Nội thất nhập khẩu", "TP. Hồ Chí Minh", "TP. Thủ Đức", "Thảo Điền", "Phan Hoàng Long", 1, 1, "DEMO-CH-004", ""], ["property", "Nhà phố 4 tầng ô tô vào nhà, trung tâm Ninh Kiều Cần Thơ", "Bán nhà đất", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=82", "7,9 tỷ", "92 m²", "Ninh Kiều, Cần Thơ", "0939111222", "sale", "Nhà phố", "86 triệu/m²", 4, 4, 4, "Đông Nam", "Sổ đỏ", "Cơ bản", "Cần Thơ", "Ninh Kiều", "An Khánh", "Trịnh Văn Đức", 0, 1, "DEMO-NP-002", "5 m"], ["property", "Nhà mặt tiền 3 tầng gần biển Nha Trang, phù hợp kinh doanh", "Bán nhà đất", "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=82", "13,2 tỷ", "110 m²", "Lộc Thọ, Nha Trang, Khánh Hòa", "0905111777", "sale", "Nhà phố", "120 triệu/m²", 5, 4, 3, "Đông", "Sổ đỏ", "Đầy đủ", "Khánh Hòa", "Nha Trang", "Lộc Thọ", "Ngô Minh Hải", 1, 1, "DEMO-NP-003", "6 m"], ["property", "Cho thuê căn hộ studio cao cấp Bình Thạnh, gần Landmark 81", "Cho thuê nhà", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=82", "11 triệu/tháng", "38 m²", "Bình Thạnh, TP. Hồ Chí Minh", "0968123123", "rent", "Chung cư", "289 nghìn/m²/tháng", 1, 1, 1, "Tây Bắc", "Hợp đồng thuê", "Full nội thất", "TP. Hồ Chí Minh", "Bình Thạnh", "Phường 22", "Võ Thanh Hà", 0, 1, "DEMO-RENT-003", ""], ["property", "Cho thuê biệt thự 3 tầng khu đô thị Ciputra, có sân vườn", "Cho thuê nhà", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=82", "58 triệu/tháng", "220 m²", "Ciputra, Tây Hồ, Hà Nội", "0903222666", "rent", "Biệt thự", "264 nghìn/m²/tháng", 5, 5, 3, "Nam", "Hợp đồng chính chủ", "Full nội thất", "Hà Nội", "Tây Hồ", "Phú Thượng", "Đinh Thu Hương", 1, 1, "DEMO-RENT-004", "12 m"], ["property", "Kho logistics 2.500 m² gần cao tốc Hà Nội - Hải Phòng", "Kho xưởng & mặt bằng", "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=82", "145 triệu/tháng", "2.500 m²", "Văn Lâm, Hưng Yên", "0981888777", "rent", "Kho xưởng", "58 nghìn/m²/tháng", 0, 4, 1, "Bắc", "Hợp đồng dài hạn", "PCCC, điện 3 pha", "Hưng Yên", "Văn Lâm", "Tân Quang", "Phạm Văn Thắng", 1, 1, "DEMO-KX-002", "45 m"], ["property", "Cho thuê văn phòng 350 m² hạng B tại quận Cầu Giấy", "Kho xưởng & mặt bằng", "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82", "92 triệu/tháng", "350 m²", "Duy Tân, Cầu Giấy, Hà Nội", "0977666555", "rent", "Văn phòng", "263 nghìn/m²/tháng", 0, 4, 1, "Đông Nam", "Hợp đồng thuê", "Trần sàn, điều hòa", "Hà Nội", "Cầu Giấy", "Dịch Vọng Hậu", "Bùi Ngọc Mai", 0, 1, "DEMO-VP-001", "18 m"], ["property", "Đất nền 125 m² gần biển Phú Quốc, đường ô tô", "Đất nền & đất dự án", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82", "4,6 tỷ", "125 m²", "Dương Tơ, Phú Quốc, Kiên Giang", "0917000111", "sale", "Đất", "36,8 triệu/m²", 0, 0, 0, "Tây Nam", "Sổ riêng", "", "Kiên Giang", "Phú Quốc", "Dương Tơ", "Hoàng Quốc Bảo", 1, 1, "DEMO-DAT-003", "5 m"], ["property", "Đất 150 m² khu dân cư Biên Hòa, Đồng Nai, sổ riêng", "Đất nền & đất dự án", "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=82", "5,1 tỷ", "150 m²", "Biên Hòa, Đồng Nai", "0933444555", "sale", "Đất", "34 triệu/m²", 0, 0, 0, "Đông Bắc", "Sổ đỏ", "", "Đồng Nai", "Biên Hòa", "Long Bình", "Trần Đức Khánh", 0, 1, "DEMO-DAT-004", "7,5 m"], ["property", "Shophouse góc 2 mặt tiền tại khu đô thị Ecopark", "Bán nhà đất", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82", "16,8 tỷ", "118 m²", "Ecopark, Văn Giang, Hưng Yên", "0909888666", "sale", "Shophouse", "142 triệu/m²", 3, 5, 4, "Đông Nam", "Sổ đỏ", "Hoàn thiện", "Hưng Yên", "Văn Giang", "Xuân Quan", "Phạm Minh Tú", 1, 1, "DEMO-SH-002", "9 m"], ["property", "Biệt thự nghỉ dưỡng 300 m² ven biển Hồ Tràm", "Bán nhà đất", "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=82", "24 tỷ", "300 m²", "Hồ Tràm, Xuyên Mộc, Bà Rịa - Vũng Tàu", "0918888999", "sale", "Biệt thự", "80 triệu/m²", 4, 5, 2, "Đông", "Sổ lâu dài", "Full nội thất", "Bà Rịa - Vũng Tàu", "Xuyên Mộc", "Phước Thuận", "Nguyễn Hoài Nam", 1, 1, "DEMO-BT-002", "15 m"], ["news", "Xu hướng chọn nhà gần metro: tiện đi lại đang tác động giá bất động sản", "Thị trường", "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "TP. Hồ Chí Minh", "", "", "Ban biên tập", 1, 1, "DEMO-NEWS-004", ""], ["news", "Cách đọc thông tin trên sổ đỏ trước khi giao dịch nhà đất", "Kiến thức", "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Ban biên tập", 0, 1, "DEMO-NEWS-005", ""], ["news", "Những chi phí người mua nhà cần dự trù ngoài giá bán", "Kinh nghiệm", "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=82", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Ban biên tập", 0, 1, "DEMO-NEWS-006", ""]];


const NEWS_SAMPLE_CONTENT=[["kinh-te-01","Giá vàng và thị trường tài chính hôm nay có gì đáng chú ý?","Kinh tế","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=82"],["kinh-te-02","Người tiêu dùng đang thay đổi cách chi tiêu như thế nào?","Kinh tế","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=82"],["kinh-te-03","Dòng tiền cá nhân nên được phân bổ ra sao trong giai đoạn nhiều biến động?","Kinh tế","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82"],["kinh-te-04","Doanh nghiệp nhỏ tối ưu chi phí vận hành bằng những cách nào?","Kinh tế","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=82"],["kinh-te-05","Xu hướng thanh toán không tiền mặt tiếp tục mở rộng ở các đô thị","Kinh tế","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=82"],["kinh-te-06","Thị trường bán lẻ bước vào mùa cạnh tranh trải nghiệm khách hàng","Kinh tế","https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=82"],["kinh-te-07","Lãi suất và sức mua đang tác động thế nào đến kế hoạch tài chính gia đình?","Kinh tế","https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=82"],["kinh-te-08","Các ngành dịch vụ nào đang thu hút sự quan tâm của nhà đầu tư nhỏ?","Kinh tế","https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82"],["kinh-te-09","Người trẻ ưu tiên tiết kiệm hay đầu tư cho trải nghiệm?","Kinh tế","https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=82"],["kinh-te-10","Kinh tế số tạo thêm cơ hội mới cho hộ kinh doanh địa phương","Kinh tế","https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82"],["kinh-te-11","Xu hướng mua sắm thông minh giúp người dùng kiểm soát ngân sách tốt hơn","Kinh tế","https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82"],["kinh-te-12","Những chỉ số tài chính cá nhân nên theo dõi mỗi tháng","Kinh tế","https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-01","AI đang thay đổi cách doanh nghiệp nhỏ vận hành như thế nào?","Công nghệ","https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-02","Những công cụ số giúp đội nhóm làm việc hiệu quả hơn","Công nghệ","https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-03","Điện thoại mới tập trung nhiều hơn vào pin và khả năng xử lý AI","Công nghệ","https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-04","Bảo mật dữ liệu cá nhân trở thành ưu tiên khi làm việc trực tuyến","Công nghệ","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-05","Ứng dụng AI nào đang được dùng nhiều trong công việc văn phòng?","Công nghệ","https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-06","Xu hướng thiết bị thông minh kết nối liền mạch trong gia đình","Công nghệ","https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-07","Doanh nghiệp chuyển sang tự động hóa các tác vụ lặp lại","Công nghệ","https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-08","Cloud và công cụ cộng tác đang thay đổi cách làm việc từ xa","Công nghệ","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-09","Người dùng quan tâm nhiều hơn đến quyền riêng tư trên ứng dụng","Công nghệ","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-10","Những kỹ năng công nghệ nên có trong môi trường làm việc mới","Công nghệ","https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-11","Các nền tảng sáng tạo nội dung bổ sung ngày càng nhiều tính năng AI","Công nghệ","https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82"],["cong-nghe-12","Thiết bị đeo thông minh mở rộng vai trò trong đời sống hằng ngày","Công nghệ","https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82"],["du-lich-01","Những điểm đến được tìm kiếm nhiều cho kỳ nghỉ ngắn ngày","Du lịch","https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=82"],["du-lich-02","Kinh nghiệm chuẩn bị hành lý gọn cho chuyến đi cuối tuần","Du lịch","https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82"],["du-lich-03","Gợi ý lịch trình hai ngày cho người thích khám phá chậm","Du lịch","https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=82"],["du-lich-04","Du lịch tự túc: cách cân đối chi phí mà vẫn có trải nghiệm tốt","Du lịch","https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=1200&q=82"],["du-lich-05","Những cung đường ven biển phù hợp cho chuyến đi ngắn","Du lịch","https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=82"],["du-lich-06","Xu hướng nghỉ dưỡng gần thiên nhiên được nhiều gia đình lựa chọn","Du lịch","https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=82"],["du-lich-07","Các món ăn địa phương đáng thử khi khám phá một thành phố mới","Du lịch","https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=82"],["du-lich-08","Kinh nghiệm chọn nơi lưu trú thuận tiện cho nhóm bạn","Du lịch","https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=82"],["du-lich-09","Đi du lịch mùa thấp điểm có những lợi ích gì?","Du lịch","https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=82"],["du-lich-10","Checklist đơn giản trước khi bắt đầu một chuyến đi dài ngày","Du lịch","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82"],["du-lich-11","Những trải nghiệm văn hóa giúp chuyến đi đáng nhớ hơn","Du lịch","https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=82"],["du-lich-12","Cách chụp ảnh du lịch tự nhiên mà không cần thiết bị cầu kỳ","Du lịch","https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-01","5 thói quen đơn giản giúp duy trì năng lượng trong ngày","Sức khỏe","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-02","Vì sao giấc ngủ đều đặn quan trọng với hiệu suất làm việc?","Sức khỏe","https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-03","Đi bộ mỗi ngày mang lại những thay đổi tích cực nào?","Sức khỏe","https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-04","Cách xây dựng thời gian nghỉ ngắn hợp lý khi làm việc tại bàn","Sức khỏe","https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-05","Bữa sáng cân bằng nên có những nhóm thực phẩm nào?","Sức khỏe","https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-06","Những dấu hiệu cho thấy bạn cần điều chỉnh nhịp sinh hoạt","Sức khỏe","https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-07","Thói quen uống đủ nước dễ duy trì hơn với vài mẹo nhỏ","Sức khỏe","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-08","Tập luyện ngắn nhưng đều đặn có thể phù hợp với người bận rộn","Sức khỏe","https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-09","Không gian làm việc ảnh hưởng thế nào đến sự tập trung?","Sức khỏe","https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-10","Các cách thư giãn đơn giản sau một ngày làm việc dài","Sức khỏe","https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-11","Ăn uống đúng giờ giúp duy trì năng lượng ổn định hơn","Sức khỏe","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=82"],["suc-khoe-12","Thói quen vận động nhẹ giữa giờ được nhiều dân văn phòng áp dụng","Sức khỏe","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-01","Thị trường căn hộ: người mua quan tâm nhiều hơn đến giá trị sử dụng thật","Bất động sản","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-02","Những yếu tố người mua nên kiểm tra trước khi chọn nơi an cư","Bất động sản","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-03","Không gian sống xanh trở thành tiêu chí quan trọng của nhiều gia đình","Bất động sản","https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-04","Người mua nhà ưu tiên kết nối giao thông và tiện ích thực tế","Bất động sản","https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-05","Căn hộ diện tích vừa phải được quan tâm nhờ tối ưu công năng","Bất động sản","https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-06","Những lưu ý khi so sánh giá giữa các dự án cùng khu vực","Bất động sản","https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-07","Xu hướng tìm nhà gần nơi làm việc tiếp tục tăng ở đô thị lớn","Bất động sản","https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-08","Pháp lý và tiến độ bàn giao là hai yếu tố cần kiểm tra kỹ","Bất động sản","https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-09","Nhà phố vùng ven thu hút nhóm khách tìm không gian rộng hơn","Bất động sản","https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-10","Người thuê nhà quan tâm ngày càng nhiều đến chất lượng nội thất","Bất động sản","https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-11","Khu đô thị tích hợp tiện ích đang thay đổi thói quen chọn nơi ở","Bất động sản","https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82"],["bat-dong-san-12","Bài toán tài chính dài hạn khi cân nhắc mua căn nhà đầu tiên","Bất động sản","https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=82"],["doi-song-01","Xu hướng sống tối giản đang thay đổi cách bố trí không gian gia đình","Đời sống","https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=1200&q=82"],["doi-song-02","Thanh toán số ngày càng phổ biến trong mua sắm và dịch vụ","Đời sống","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=82"],["doi-song-03","Những thói quen nhỏ giúp căn nhà luôn gọn gàng hơn","Đời sống","https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=82"],["doi-song-04","Cuối tuần chậm rãi: những hoạt động đơn giản để nạp lại năng lượng","Đời sống","https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=82"],["doi-song-05","Cách tổ chức góc làm việc tại nhà vừa gọn vừa dễ tập trung","Đời sống","https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=82"],["doi-song-06","Người trẻ đang ưu tiên trải nghiệm nào trong cuộc sống đô thị?","Đời sống","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=82"],["doi-song-07","Bữa cơm gia đình trở lại như một khoảng thời gian kết nối","Đời sống","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=82"],["doi-song-08","Những vật dụng đa năng giúp tiết kiệm diện tích căn hộ","Đời sống","https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=82"],["doi-song-09","Thói quen ghi chép giúp quản lý công việc và cuộc sống tốt hơn","Đời sống","https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82"],["doi-song-10","Không gian xanh nhỏ mang lại cảm giác dễ chịu cho nhà ở","Đời sống","https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82"],["doi-song-11","Cách sắp xếp lịch cá nhân để có thêm thời gian cho sở thích","Đời sống","https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=82"],["doi-song-12","Xu hướng tự làm đồ trang trí đơn giản tại nhà","Đời sống","https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82"]];

function sampleRichContent(title,category){
  return `<p><strong>${title}</strong> là bài viết mẫu thuộc chuyên mục ${category}, được chuẩn bị để khách hàng xem đúng bố cục và trải nghiệm của giao diện tin tức.</p>
  <h2>Nội dung nổi bật</h2><p>Phần nội dung này minh họa cách trình bày một bài báo hoàn chỉnh với đoạn văn, tiêu đề phụ, hình ảnh và liên kết. Khi nhận website, khách hàng có thể sửa hoặc xóa toàn bộ bài mẫu trong Client Admin.</p>
  <h2>Thông tin tham khảo</h2><p>Nội dung mẫu không đại diện cho thông tin thời sự thực tế. Website thật nên được cập nhật bằng nội dung riêng của thương hiệu để đạt hiệu quả SEO tốt hơn.</p>`;
}

async function ensureSampleColumns(env){
  try{await env.DB.prepare(`ALTER TABLE posts ADD COLUMN is_sample INTEGER NOT NULL DEFAULT 0`).run()}catch(e){}
  try{await env.DB.prepare(`ALTER TABLE posts ADD COLUMN sample_key TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
  try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_site_sample ON posts(site_id,is_sample)`).run()}catch(e){}
  try{await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_site_sample_key ON posts(site_id,sample_key) WHERE sample_key<>''`).run()}catch(e){}
}

async function seedDemoForSite(env,siteId,opts={}){
  await ensureSiteTemplateIdentity(env);
  await ensureSampleColumns(env);
  const site=await env.DB.prepare(`SELECT id,name,coalesce(template_key,'') template_key,coalesce(preset,'') preset FROM sites WHERE id=?`).bind(siteId).first();
  if(!site)throw new Error('Website không tồn tại');
  const admin=await env.DB.prepare(`SELECT id FROM users WHERE site_id=? AND role='admin' ORDER BY id LIMIT 1`).bind(siteId).first();
  if(!admin)throw new Error('Website chưa có tài khoản Admin khách');

  // V15.9 — The sample package installed for a customer uses the same structural
  // blueprint as showroom/simulation. This guarantees that "Có bài mẫu" fills
  // the same rows/columns as the template frame instead of stopping at sample_count.
  const blueprint=await buildTemplatePreviewBlueprint(env,site.template_key,site);
  let rows=Array.isArray(blueprint?.posts)?blueprint.posts:[];
  const requested=Math.max(0,Number(opts.limit||0));
  if(requested>rows.length)rows=rows.slice(0,requested);
  let created=0,skipped=0;

  for(let i=0;i<rows.length;i++){
    const x=rows[i]||{};
    const sampleKey=String(x.sample_key||`${site.template_key||x.type||'sample'}:${i+1}`);
    const listingCode=String(x.listing_code||`SAMPLE-${String(i+1).padStart(3,'0')}`);
    const exists=await env.DB.prepare(`SELECT id FROM posts WHERE site_id=? AND (sample_key=? OR (listing_code<>'' AND listing_code=?)) LIMIT 1`).bind(siteId,sampleKey,listingCode).first();
    if(exists){skipped++;continue}
    if(String(x.type||'')==='news'){
      await env.DB.prepare(`INSERT INTO posts(site_id,type,title,category,image,content,status,author_id,featured,verified,listing_code,views,is_sample,sample_key,extra_json)
        VALUES(?,'news',?,?,?,?, 'published',?,?,?,?,?,1,?,'{}')`)
        .bind(siteId,x.title||'',x.category||'Tin mới',x.image||'',x.content||sampleRichContent(x.title||'',x.category||'Tin mới'),admin.id,x.featured?1:0,x.verified?1:0,listingCode,Number(x.views||120),sampleKey).run();
    }else{
      await env.DB.prepare(`INSERT INTO posts(
        site_id,type,title,category,image,price,area,address,phone,content,status,author_id,
        "transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,
        province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,views,is_sample,sample_key,extra_json
      ) VALUES(?,?,?,?,?,?,?,?,?,?,'published',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,'{}')`)
      .bind(siteId,x.type||'property',x.title||'',x.category||'',x.image||'',x.price||'',x.area||'',x.address||'',x.phone||'',x.content||'<p>Bài mẫu dùng để xem trước bố cục website.</p>',admin.id,
        x.transaction||'',x.property_type||'',x.unit_price||'',x.bedrooms||null,x.bathrooms||null,x.floors||null,x.direction||'',x.legal||'',x.furniture||'',
        x.province||'',x.district||'',x.ward||'','',x.contact_name||'',x.featured?1:0,x.verified?1:0,listingCode,x.frontage||'',Number(x.views||40),sampleKey).run();
    }
    created++;
  }
  return {created,skipped,total:rows.length,profile:blueprint?.content_type||'generic',template_key:site.template_key||'',density:'structure-v5'};
}

// V15.1: one structural blueprint source for every template preview.
// "Có bài mẫu" renders these posts normally. "Không bài mẫu" uses the exact
// same posts only as an in-memory layout scaffold, then the browser removes
// article/listing cards after render. This keeps section/category order identical
// to the populated template without writing anything to a customer site.
async function buildTemplatePreviewBlueprint(env,templateKey,site={}){
  await ensureTemplateCatalog(env);
  const key=String(templateKey||site?.template_key||'').trim();
  let t=null;
  if(key)try{t=await env.DB.prepare(`SELECT template_key,category,preset,coalesce(sample_count,12) sample_count,editor_profile,structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(key).first()}catch(e){}
  if(!t&&site?.preset)try{t=await env.DB.prepare(`SELECT template_key,category,preset,coalesce(sample_count,12) sample_count,editor_profile,structure_profile FROM template_catalog WHERE preset=? ORDER BY sort_order,template_key LIMIT 1`).bind(site.preset).first()}catch(e){}
  let ep={};try{ep=t?.editor_profile?JSON.parse(t.editor_profile):{}}catch(e){ep={}}
  let sp={};try{sp=t?.structure_profile?JSON.parse(t.structure_profile):defaultTemplateStructure(key||t?.template_key||'')}catch(e){sp=defaultTemplateStructure(key||t?.template_key||'')}
  if(!sp||!Array.isArray(sp.sections))sp=defaultTemplateStructure(key||t?.template_key||'')||{sections:[]};
  const category=String(t?.category||'').toLowerCase();
  const contentType=String(ep?.content_type||(category==='tin-tuc'?'news':category==='bat-dong-san'?'property':'generic')).toLowerCase();
  const limit=Math.max(1,Math.min(30,Number(t?.sample_count||12)));
  let posts=[];
  if(contentType==='news'){
    // V15.8 — Sales demos must be presentation-complete. The template structure,
    // not sample_count, decides the minimum virtual content needed to fill every
    // category/grid. These records are in-memory only and never touch customer DB.
    const sections=Array.isArray(sp?.sections)?sp.sections:[];
    const categoryNeeds=new Map();
    let generalNeed=limit;
    for(const sec of sections){
      const slots=Math.max(0,Number(sec?.slots||0));
      if(!slots)continue;
      const secType=String(sec?.type||'').toLowerCase();
      const catName=String(sec?.category||((secType==='category')?sec?.title:'')||'').trim();
      if(catName)categoryNeeds.set(catName,Math.max(categoryNeeds.get(catName)||0,slots));
      else generalNeed=Math.max(generalNeed,slots);
    }
    const sourceByCat=new Map();
    for(const x of NEWS_SAMPLE_CONTENT){
      const c=String(x[2]||'').trim();
      if(!sourceByCat.has(c))sourceByCat.set(c,[]);
      sourceByCat.get(c).push(x);
    }
    const wantedCats=categoryNeeds.size?[...categoryNeeds.keys()]:(Array.isArray(ep?.categories)?ep.categories:[]).map(x=>String(x||'').trim()).filter(Boolean);
    const rows=[];
    const usedKeys=new Set();
    function pushNews(base,cat,copyNo){
      const src=base||NEWS_SAMPLE_CONTENT[rows.length%NEWS_SAMPLE_CONTENT.length];
      const stem=String(src?.[0]||`demo-${rows.length+1}`);
      let k=copyNo>1?`${stem}-full-${copyNo}`:stem;
      while(usedKeys.has(k))k=`${k}-x`;
      usedKeys.add(k);
      const title0=String(src?.[1]||`Nội dung nổi bật ${rows.length+1}`);
      const title=copyNo>1?`${title0} · Góc nhìn ${copyNo}`:title0;
      rows.push([k,title,cat||String(src?.[2]||'Tin mới'),String(src?.[3]||NEWS_SAMPLE_CONTENT[rows.length%NEWS_SAMPLE_CONTENT.length]?.[3]||'')]);
    }
    // Fill every category section to its exact structural capacity.
    for(const cat of wantedCats){
      const need=Math.max(1,Number(categoryNeeds.get(cat)||0));
      const pool=sourceByCat.get(cat)||[];
      for(let i=0;i<need;i++)pushNews(pool[i%Math.max(1,pool.length)]||NEWS_SAMPLE_CONTENT[i%NEWS_SAMPLE_CONTENT.length],cat,Math.floor(i/Math.max(1,pool.length))+1);
    }
    // Also guarantee enough general stories for hero/trending/special blocks.
    let cursor=0;
    while(rows.length<generalNeed){
      const src=NEWS_SAMPLE_CONTENT[cursor%NEWS_SAMPLE_CONTENT.length];
      const cat=String(src?.[2]||wantedCats[cursor%Math.max(1,wantedCats.length)]||'Tin mới');
      pushNews(src,cat,Math.floor(cursor/NEWS_SAMPLE_CONTENT.length)+2);cursor++;
    }
    // If the template has no category contract yet, preserve its configured demo size.
    if(!rows.length){
      for(let i=0;i<limit;i++)pushNews(NEWS_SAMPLE_CONTENT[i%NEWS_SAMPLE_CONTENT.length],String(NEWS_SAMPLE_CONTENT[i%NEWS_SAMPLE_CONTENT.length]?.[2]||'Tin mới'),Math.floor(i/NEWS_SAMPLE_CONTENT.length)+1);
    }
    const newsDemoNum=String(key||t?.template_key||'').match(/^tin-tuc-(\d+)$/)?.[1]||'';
    const newsDemoBase=newsDemoNum?`/demo/tin-tuc/mau-${newsDemoNum}`:'';
    const slugifyDemo=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'tin-demo';
    posts=rows.map((x,i)=>({
      id:900000+i,type:'news',title:x[1],category:x[2],image:x[3],
      content:sampleRichContent(x[1],x[2]),status:'published',featured:i===0?1:0,verified:1,
      listing_code:`SAMPLE-NEWS-${String(i+1).padStart(3,'0')}`,views:120+(i*37),
      demo_url:newsDemoBase?`${newsDemoBase}/${slugifyDemo(x[1])}.html`:'',
      is_sample:1,sample_key:`${key||'news'}:${x[0]}`,__nr_blueprint:1
    }));
  }else if(contentType==='game'){
    const groups=[['Town Hall','town-hall',12],['Builder Hall','builder-hall',8],['Clan Capital','clan-capital',8]];
    const imgs={
      TH18:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3uXRRSSucOwlCPaoJSv4XPqTAR-s4SHVTJWpurkKLFH3cXyvohLv33sXpzq58mRiTZ7PR9aI-lJvSJKoCJcVpJimUrunFPbHAXoKxyIh8EzcdgrzJR7fipf6CUToq7ibCmUoiht-v74iHihZLCeoO7VTTYLDXODjTL1DmcSm2EaTb3yrm0BJi1nOP2rG7/s600/th18_coc.webp',
      TH17:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhJtm5GbeDyNy9urRtDBa9NcRpHmNhKqvqCHF46317xeKn6pp3YfycZH2g6vmaQnzzKiFG7D0D8ZgozccrJZ3DXeyc8pw_I9-bFzpDKxRjY64MkQSwTOeikJCvb0bDf1W0ewXUmoOC5YzSgySe0xC-7ReJ6PRSEOkliaBHx8NrXJHjWow-VbSTTsgEtlsU9/s400/th17_coc.jpg',
      TH16:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCdTCaRil9IY_W-rNX711VaHAhJNjjOtAXgOVP1encGhR8xMFphnPCGqG38HdjI9NckADJBNLdIIeyusee62Tws19DdZGJZZLDU5aypHG_iICQrGmRM7CdxxzsUojv2Xw7Pd1nFw1Qkh1mXbHEYcezZv9eEIHQGM2gMYNYACvM8GAcnm_xccqJ64FJ0I3U/s400/th16_min.jpg',
      BH10:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhebxJQQZOV6GRSR_hHw82twIMi35fdd6cpa8UPSNhQrjzLHY6do0xh258qQd08fT9-Xl6bmIdwDqDLfzMqS4L0D_o28_bs2G1YWfipFxUtPuXOXCldYenAPk91lV1cHD1MOwITfBradygsmJg8N6FJs1Gv6baKlu2hTkKJQBgZeBp52XrA1kGZMqTZ0aBn/s400/bh10_min.jpg',
      CH10:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj1JvIJLGPBJbMokfsAMHLojAaUuRSTqccAC4mSWjBatPVAwFh9y3vcHhiiReED2d4S9XpfjjuwtvFv4dO2G1aEgIaI4xm3qSxEkb7uNzoyoQziorJr2w2-SzOHx14ECOLgZnMIPlVRjI0FNYxMU7ELxrKTWnZwlUH6ughJvTDv3nWbDQbSvkbY93cK9LU/s400/capitall-hall-10.webp'
    };
    const purposes=['War','Farming','Hybrid','Trophy','Legend','CWL','Troll'],styles=['Compact','Ring','Box','Diamond','Spread'],defs=['Anti 3 Star','Anti 2 Star','Anti Everything'];
    posts=[];let id=930000;
    for(const [group,secKey,fallback] of groups){
      const sec=(sp.sections||[]).find(x=>x.key===secKey);const need=Math.max(1,Number(sec?.slots||fallback))*2;
      for(let i=0;i<need;i++){
        const level=group==='Town Hall'?['TH18','TH17','TH16'][i%3]:group==='Builder Hall'?'BH10':'CH10';
        const purpose=purposes[i%purposes.length],style=styles[i%styles.length],defense=defs[i%defs.length];
        {const title=`${level} ${purpose} Base Layout ${String(i+1).padStart(2,'0')}`,slug=title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');posts.push({id:id++,type:'game',title,category:group,image:imgs[level]||imgs.TH18,content:`<p>${level} ${purpose} base mẫu dành cho showroom. Nội dung chiến thuật và copy link có thể chỉnh trong Admin.</p><h2>Base overview</h2><p>Layout được trình bày với level, purpose, style và defense rõ ràng để người xem quyết định nhanh trước khi copy base.</p>`,status:'published',featured:i===0?1:0,verified:1,views:850+i*113,rating:4.6+(i%4)*.1,downloads:160+i*17,demo_url:`/demo/game/clash-of-clans/base/${slug}.html`,extra_json:JSON.stringify({game_group:group,game_level:level,game_purpose:purpose,game_style:style,game_defense:defense,copy_link:'#',game_year:'2026'}),is_sample:1,sample_key:`game-1:${group}:${i+1}`,__nr_blueprint:1});}
      }
    }
  }else if(contentType==='property'){
    const propertyContent='<p>Bài mẫu dùng làm khung bố cục xem trước.</p>';
    const sections=Array.isArray(sp?.sections)?sp.sections:[];
    const baseRows=DEMO_CONTENT.filter(x=>x[0]==='property');
    const knownCats=[...new Set(baseRows.map(x=>String(x[2]||'').trim()).filter(Boolean))];
    const categoryNeeds=new Map();
    let generalNeed=limit;
    let saleNeed=0,rentNeed=0;
    for(const sec of sections){
      const slots=Math.max(0,Number(sec?.slots||0));
      if(!slots)continue;
      const title=String(sec?.category||sec?.title||'').trim();
      const exact=knownCats.find(c=>c.toLowerCase()===title.toLowerCase());
      if(exact)categoryNeeds.set(exact,Math.max(categoryNeeds.get(exact)||0,slots));
      generalNeed=Math.max(generalNeed,slots);
      const low=title.toLowerCase();
      if(/mua|bán/.test(low))saleNeed=Math.max(saleNeed,slots);
      if(/thuê/.test(low))rentNeed=Math.max(rentNeed,slots);
    }
    const rows=[];
    const copyRow=(x,i,copyNo)=>{
      const y=[...x];
      y[1]=copyNo>1?`${x[1]} · Lựa chọn ${copyNo}`:x[1];
      y[23]=`${String(x[23]||'DEMO')}-FULL-${String(i+1).padStart(3,'0')}`;
      return y;
    };
    for(const cat of knownCats){
      const pool=baseRows.filter(x=>String(x[2]||'')===cat);
      const need=Math.max(pool.length,Number(categoryNeeds.get(cat)||0));
      for(let i=0;i<need;i++)rows.push(copyRow(pool[i%pool.length],rows.length,Math.floor(i/pool.length)+1));
    }
    const countTx=tx=>rows.filter(x=>String(x[8]||'')===tx).length;
    let guard=0;
    while(countTx('sale')<saleNeed&&guard++<100){const pool=baseRows.filter(x=>x[8]==='sale');rows.push(copyRow(pool[guard%pool.length],rows.length,Math.floor(guard/pool.length)+2));}
    guard=0;
    while(countTx('rent')<rentNeed&&guard++<100){const pool=baseRows.filter(x=>x[8]==='rent');rows.push(copyRow(pool[guard%pool.length],rows.length,Math.floor(guard/pool.length)+2));}
    let cursor=0;while(rows.length<generalNeed){rows.push(copyRow(baseRows[cursor%baseRows.length],rows.length,Math.floor(cursor/baseRows.length)+2));cursor++;}
    posts=rows.map((x,i)=>{
      const [type,title,postCategory,image,price,area,address,phone,transaction,property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,contact_name,featured,verified,listing_code,frontage]=x;
      return {id:910000+i,type,title,category:postCategory,image,price:price||'',area:area||'',address:address||'',phone:phone||'',content:propertyContent,status:'published',transaction:transaction||'',property_type:property_type||'',unit_price:unit_price||'',bedrooms:bedrooms||null,bathrooms:bathrooms||null,floors:floors||null,direction:direction||'',legal:legal||'',furniture:furniture||'',province:province||'',district:district||'',ward:ward||'',contact_name:contact_name||'',featured:featured?1:0,verified:verified?1:0,listing_code:listing_code||`SAMPLE-PROPERTY-${i+1}`,frontage:frontage||'',views:40+(i*11),is_sample:1,sample_key:`${key||'property'}:${listing_code||i+1}`,__nr_blueprint:1};
    });
  }else{
    // Future template categories: editor_profile + structure_profile are the contract.
    const sections=Array.isArray(sp?.sections)?sp.sections:[];
    const categoryNeeds=new Map();
    let totalNeed=limit;
    for(const sec of sections){
      const slots=Math.max(0,Number(sec?.slots||0));if(!slots)continue;
      const cat=String(sec?.category||((String(sec?.type||'').toLowerCase()==='category')?sec?.title:'')||'').trim();
      if(cat)categoryNeeds.set(cat,Math.max(categoryNeeds.get(cat)||0,slots));
      totalNeed=Math.max(totalNeed,slots);
    }
    const cats=categoryNeeds.size?[...categoryNeeds.keys()]:(Array.isArray(ep?.categories)?ep.categories.map(x=>String(x||'').trim()).filter(Boolean):[]);
    const baseCats=cats.length?cats:['Nội dung'];
    posts=[];
    for(const cat of baseCats){
      const need=Math.max(1,Number(categoryNeeds.get(cat)||0));
      for(let i=0;i<need;i++)posts.push({id:920000+posts.length,type:contentType==='generic'?'news':contentType,title:`${cat} · Nội dung mẫu ${String(i+1).padStart(2,'0')}`,category:cat,image:'',content:'Nội dung mẫu dùng làm khung bố cục xem trước.',status:'published',featured:posts.length===0?1:0,verified:1,listing_code:`SAMPLE-${String(posts.length+1).padStart(3,'0')}`,views:0,is_sample:1,sample_key:`${key||'template'}:generic-${posts.length+1}`,__nr_blueprint:1});
    }
    let i=0;while(posts.length<totalNeed){const cat=baseCats[i%baseCats.length];posts.push({id:920000+posts.length,type:contentType==='generic'?'news':contentType,title:`${cat} · Nội dung mẫu ${String(posts.length+1).padStart(2,'0')}`,category:cat,image:'',content:'Nội dung mẫu dùng làm khung bố cục xem trước.',status:'published',featured:posts.length===0?1:0,verified:1,listing_code:`SAMPLE-${String(posts.length+1).padStart(3,'0')}`,views:0,is_sample:1,sample_key:`${key||'template'}:generic-${posts.length+1}`,__nr_blueprint:1});i++;}
  }
  return {posts,content_type:contentType,template_key:key||String(t?.template_key||''),editor_profile:ep};
}

async function nextOrderCode(env){
  await ensureCustomerTables(env);
  const y=new Date().getUTCFullYear();
  const prefix=`NR-${y}-`;
  const row=await env.DB.prepare(`
    SELECT order_code FROM customer_profiles
    WHERE order_code LIKE ?
    ORDER BY CAST(substr(order_code,9) AS INTEGER) DESC
    LIMIT 1
  `).bind(prefix+'%').first();
  let n=1;
  if(row?.order_code){
    const m=String(row.order_code).match(/NR-\d{4}-(\d+)$/);
    if(m)n=Number(m[1])+1;
  }
  return prefix+String(n).padStart(4,'0');
}


function cfRegistrarConfigured(env){
  return !!(env.CF_ACCOUNT_ID && env.CF_REGISTRAR_TOKEN);
}
async function cfRegistrar(env,path,opts={}){
  if(!cfRegistrarConfigured(env)) throw new Error('Cloudflare Registrar chưa được cấu hình API');
  const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/registrar/${path}`,{
    ...opts,
    headers:{
      'Authorization':`Bearer ${env.CF_REGISTRAR_TOKEN}`,
      'Content-Type':'application/json',
      ...(opts.headers||{})
    }
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok || d.success===false){
    const msg=d?.errors?.map(x=>x.message).filter(Boolean).join('; ')||`Cloudflare API lỗi ${r.status}`;
    throw new Error(msg);
  }
  return d.result??d;
}
function normalizeDomain(v=''){
  return String(v).trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/^www\./,'');
}


function pagesToken(env){return String(env.CF_PAGES_TOKEN||env.CLOUDFLARE_PAGES_TOKEN||env.CF_API_TOKEN||'').trim()}
function pagesProject(env){return String(env.CF_PAGES_PROJECT||'newsreal').trim()||'newsreal'}
function pagesConfigured(env){return !!(String(env.CF_ACCOUNT_ID||'').trim() && pagesToken(env))}
function pagesConfigProblem(env){
  const missing=[];
  if(!String(env.CF_ACCOUNT_ID||'').trim())missing.push('CF_ACCOUNT_ID');
  if(!pagesToken(env))missing.push('CF_PAGES_TOKEN');
  return missing.join(' + ');
}
async function cfPagesApi(env,path,opts={}){
  if(!pagesConfigured(env))throw new Error('Chưa cấu hình CF_PAGES_TOKEN');
  const url=`https://api.cloudflare.com/client/v4/accounts/${String(env.CF_ACCOUNT_ID).trim()}/pages/projects/${encodeURIComponent(pagesProject(env))}/${path}`;
  const r=await fetch(url,{...opts,headers:{'Authorization':`Bearer ${pagesToken(env)}`,'Content-Type':'application/json',...(opts.headers||{})}});
  const raw=await r.text();let d={};try{d=raw?JSON.parse(raw):{}}catch{}
  if(!r.ok||d.success===false){
    const msg=(d.errors||[]).map(x=>x.message).filter(Boolean).join('; ')||`Cloudflare Pages API lỗi ${r.status}`;
    throw new Error(msg);
  }
  return d.result??d;
}
async function attachPagesDomain(env,domain){
  if(!pagesConfigured(env))return {configured:false,status:'manual',error:(pagesConfigProblem(env)||'Pages config')+' chưa có trong runtime'};
  try{
    const result=await cfPagesApi(env,'domains',{method:'POST',body:JSON.stringify({name:domain})});
    return {configured:true,status:String(result?.status||'pending'),result};
  }catch(e){
    // Domain may already be attached even if POST returns a conflict.
    try{
      const result=await cfPagesApi(env,`domains/${encodeURIComponent(domain)}`,{method:'GET'});
      return {configured:true,status:String(result?.status||'pending'),result,warning:e.message||String(e)};
    }catch{}
    return {configured:true,status:'error',error:e.message||String(e)};
  }
}
async function getPagesDomainStatus(env,domain){
  if(!pagesConfigured(env))return {configured:false,status:'manual'};
  try{
    const result=await cfPagesApi(env,`domains/${encodeURIComponent(domain)}`,{method:'GET'});
    return {configured:true,status:String(result?.status||'pending'),result};
  }catch(e){return {configured:true,status:'error',error:e.message||String(e)}}
}
async function cfAccountApi(env,path,opts={}){
  const token=env.CF_DNS_TOKEN||env.CF_PAGES_TOKEN||env.CF_API_TOKEN||env.CLOUDFLARE_API_TOKEN;
  if(!token)throw new Error('Thiếu CF_DNS_TOKEN/CF_PAGES_TOKEN');
  const r=await fetch(`https://api.cloudflare.com/client/v4/${path}`,{
    ...opts,
    headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json',...(opts.headers||{})}
  });
  const j=await r.json().catch(()=>({}));
  if(!r.ok||j.success===false)throw new Error((j.errors||[]).map(x=>x.message).join('; ')||`Cloudflare API ${r.status}`);
  return j.result;
}
async function ensurePagesDns(env,domain){
  try{
    const pages=await getPagesDomainStatus(env,domain);
    let zoneId=pages?.result?.zone_tag||pages?.result?.zone_id||'';
    let zoneSource=zoneId?'pages':'lookup';

    if(!zoneId){
      const account=env.CF_ACCOUNT_ID;
      if(!account)return {ok:false,created:false,error:'Thiếu CF_ACCOUNT_ID'};
      let zones=[];
      try{
        zones=await cfAccountApi(env,`zones?name=${encodeURIComponent(domain)}&account.id=${encodeURIComponent(account)}&status=active`);
      }catch(e){
        return {ok:false,created:false,error:'Token DNS không đọc được Zone: '+(e.message||String(e))};
      }
      const zone=Array.isArray(zones)?zones[0]:null;
      if(!zone?.id){
        return {ok:false,created:false,error:'Không lấy được Zone ID. Hãy cấp CF_DNS_TOKEN quyền Zone:Read + DNS:Edit'};
      }
      zoneId=zone.id;
    }

    const token=env.CF_DNS_TOKEN||env.CF_PAGES_TOKEN||env.CF_API_TOKEN||env.CLOUDFLARE_API_TOKEN;
    if(!token)return {ok:false,created:false,zone_id:zoneId,error:'Chưa có CF_DNS_TOKEN với quyền DNS:Edit'};

    const target=`${env.CF_PAGES_PROJECT||'newsreal'}.pages.dev`;
    let existing=[];
    try{
      existing=await cfAccountApi(env,`zones/${zoneId}/dns_records?name=${encodeURIComponent(domain)}&type=CNAME`);
    }catch(e){
      return {ok:false,created:false,zone_id:zoneId,error:'Không đọc được DNS record. CF_DNS_TOKEN cần Zone:DNS Read/Edit. '+(e.message||String(e))};
    }

    if(Array.isArray(existing)&&existing.length){
      const rec=existing[0];
      if(String(rec.content||'').replace(/\.$/,'')===target){
        return {ok:true,created:false,zone_id:zoneId,zone_source:zoneSource,target,record_id:rec.id};
      }
      return {ok:false,created:false,zone_id:zoneId,error:`Apex CNAME đang trỏ tới ${rec.content}, NEWSREAL không tự ghi đè`};
    }

    try{
      const rec=await cfAccountApi(env,`zones/${zoneId}/dns_records`,{
        method:'POST',
        body:JSON.stringify({type:'CNAME',name:domain,content:target,proxied:true,ttl:1,comment:'NEWSREAL auto Pages DNS'})
      });
      return {ok:true,created:true,zone_id:zoneId,zone_source:zoneSource,target,record_id:rec?.id||''};
    }catch(e){
      return {ok:false,created:false,zone_id:zoneId,error:'Không tạo được DNS. CF_DNS_TOKEN cần Zone:DNS Edit. '+(e.message||String(e))};
    }
  }catch(e){
    return {ok:false,created:false,error:e.message||String(e)};
  }
}
async function diagnoseDomain(env,domain){
  const pages=await getPagesDomainStatus(env,domain);
  let dns={ok:false,a:[],aaaa:[],error:''};
  try{
    const [a4,a6]=await Promise.all([
      fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,{headers:{accept:'application/dns-json'}}).then(r=>r.json()),
      fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=AAAA`,{headers:{accept:'application/dns-json'}}).then(r=>r.json())
    ]);
    dns.a=(a4.Answer||[]).filter(x=>x.type===1).map(x=>x.data);
    dns.aaaa=(a6.Answer||[]).filter(x=>x.type===28).map(x=>x.data);
    dns.ok=dns.a.length>0||dns.aaaa.length>0;
  }catch(e){dns.error=e.message||String(e)}
  const r=pages.result||{};
  const validation=r.validation_data||{};
  const validationStatus=String(validation.status||validation.state||'').toLowerCase();
  const sslStatus=String(r.certificate_status||r.ssl_status||r.certificate?.status||'').toLowerCase();
  return {
    domain,
    pages_configured:pages.configured,
    pages_status:pages.status,
    pages_error:pages.error||'',
    dns,
    zone_status:String(r.zone_tag?'connected':'unknown'),
    validation_status:validationStatus||'pending',
    ssl_status:sslStatus||(pages.status==='active'?'active':'pending'),
    raw_stage:String(r.status||pages.status||'pending')
  };
}

export async function onRequest({request,env}){const u=new URL(request.url),route=u.pathname.replace(/^\/api\/?/,'');try{
// V20.8.1 — authenticated VPS -> Cloudflare content publishing bridge.
if(route==='publisher/health'&&request.method==='GET'){
  if(!publisherAuthorized(request,env))return json({error:'Unauthorized'},401);
  await ensurePublisherTables(env);
  return json({ok:true,contract:'content-publisher-v1',content_types:['game'],max_payload_bytes:262144});
}
if(route==='publisher/check'&&request.method==='GET'){
  if(!publisherAuthorized(request,env))return json({error:'Unauthorized'},401);
  await ensurePublisherTables(env);
  const tenant=String(u.searchParams.get('tenant')||u.searchParams.get('domain')||'').trim();
  const externalKey=String(u.searchParams.get('external_key')||'').trim();
  const slug=nrSlug(u.searchParams.get('slug')||'');
  const target=await publisherSite(env,tenant);if(!target)return json({error:'Tenant không tồn tại hoặc chưa active'},404);
  let row=null;
  if(externalKey)row=await env.DB.prepare(`SELECT pi.*,p.title,p.status FROM publisher_imports pi JOIN posts p ON p.id=pi.post_id WHERE pi.site_id=? AND pi.external_key=? LIMIT 1`).bind(target.id,externalKey).first();
  else if(slug)row=await env.DB.prepare(`SELECT pi.*,p.title,p.status FROM publisher_imports pi JOIN posts p ON p.id=pi.post_id WHERE pi.site_id=? AND pi.slug=? LIMIT 1`).bind(target.id,slug).first();
  return json({ok:true,exists:!!row,item:row?{post_id:Number(row.post_id),external_key:row.external_key,slug:row.slug,title:row.title,status:row.status,url:`https://${target.domain}/base/${row.slug}.html`,updated_at:row.updated_at}:null});
}
if(route==='publisher/base'&&request.method==='POST'){
  if(!publisherAuthorized(request,env))return json({error:'Unauthorized'},401);
  await ensurePublisherTables(env);await ensureTemplateCatalog(env);
  const b=await body(request);
  const tenant=String(b.tenant_domain||b.tenant||b.domain||'').trim();
  const target=await publisherSite(env,tenant);if(!target)return json({error:'Tenant không tồn tại hoặc chưa active'},404);
  const templateKey=String(target.template_key||'');
  if(templateKey!=='game-1'&&String(target.preset||'')!=='game_clash_1')return json({error:'Publisher Base V1 chỉ nhận tenant Game / Clash of Clans'},409);
  const title=String(b.title||'').trim();if(!title)return json({error:'Thiếu title'},400);
  const sourceUrl=String(b.source_url||b.sourceUrl||'').trim();
  const copyLink=String(b.copy_link||b.baseLink||b.copyLink||'').trim();
  const externalKey=String(b.external_key||b.base_id||b.baseId||copyLink||sourceUrl||'').trim();
  if(!externalKey)return json({error:'Thiếu external_key/base_id/baseLink/source_url để chống trùng'},400);
  let slug=nrSlug(b.slug||b.slug_key||b.slugKey||title);if(!slug)slug='base-'+(await sha256(externalKey)).slice(0,16);
  const group=String(b.game_group||b.group||b.category||'Town Hall').trim();
  const level=String(b.game_level||b.level||'').trim().toUpperCase();
  const purpose=String(b.game_purpose||b.purpose||b.type||b.baseType||'Base').trim();
  const style=String(b.game_style||b.style||'').trim();
  const defense=String(b.game_defense||b.defense||'').trim();
  const image=String(b.processed_image_url||b.processedImageUrl||b.image_url||b.imageUrl||b.image||'').trim();
  const year=String(b.game_year||b.year||new Date().getUTCFullYear()).trim();
  const content=String(b.content||b.description||'').trim()||`<p>${title}</p>`;
  const extra={game_group:group,game_level:level,game_purpose:purpose,game_style:style,game_defense:defense,copy_link:copyLink,game_year:year,slug,source_url:sourceUrl,external_key:externalKey,original_image_url:String(b.original_image_url||b.originalImageUrl||'').trim(),publisher:'vps',sharing_model:'community_free'};
  const payloadHash=await sha256(JSON.stringify({title,sourceUrl,copyLink,group,level,purpose,style,defense,image,year,content,slug}));
  let imp=await env.DB.prepare(`SELECT * FROM publisher_imports WHERE site_id=? AND external_key=? LIMIT 1`).bind(target.id,externalKey).first();
  if(!imp){
    const slugTaken=await env.DB.prepare(`SELECT id,external_key FROM publisher_imports WHERE site_id=? AND slug=? LIMIT 1`).bind(target.id,slug).first();
    if(slugTaken&&String(slugTaken.external_key)!==externalKey)slug=`${slug}-${(await sha256(externalKey)).slice(0,8)}`;
    extra.slug=slug;
    const r=await env.DB.prepare(`INSERT INTO posts(site_id,type,title,category,image,content,status,author_id,featured,verified,listing_code,views,is_sample,sample_key,extra_json) VALUES(?,?,?,?,?,?,'published',NULL,?,?,?,?,0,'',?)`).bind(target.id,'game',title,group,image,content,b.featured?1:0,1,`COC-${(await sha256(externalKey)).slice(0,12).toUpperCase()}`,Number(b.views||0),JSON.stringify(extra)).run();
    const postId=Number(r.meta.last_row_id);
    await env.DB.prepare(`INSERT INTO publisher_imports(site_id,post_id,external_key,slug,source_url,payload_hash) VALUES(?,?,?,?,?,?)`).bind(target.id,postId,externalKey,slug,sourceUrl,payloadHash).run();
    try{await ensureGameStatsTables(env);await env.DB.prepare(`INSERT OR IGNORE INTO game_base_stats(site_id,slug,views) VALUES(?,?,?)`).bind(target.id,slug,Number(b.views||0)).run()}catch(e){}
    return json({ok:true,created:true,updated:false,duplicate:false,post_id:postId,slug,url:`https://${target.domain}/base/${slug}.html`},201);
  }
  const current=await env.DB.prepare(`SELECT id,extra_json FROM posts WHERE id=? AND site_id=? LIMIT 1`).bind(imp.post_id,target.id).first();
  if(!current)return json({error:'Publisher index trỏ tới post không còn tồn tại'},409);
  const merged={...(()=>{try{return JSON.parse(current.extra_json||'{}')}catch{return {}}})(),...extra,slug:imp.slug};
  await env.DB.prepare(`UPDATE posts SET type='game',title=?,category=?,image=?,content=?,status='published',featured=?,verified=1,extra_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND site_id=?`).bind(title,group,image,content,b.featured?1:0,JSON.stringify(merged),imp.post_id,target.id).run();
  await env.DB.prepare(`UPDATE publisher_imports SET source_url=?,payload_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(sourceUrl,payloadHash,imp.id).run();
  return json({ok:true,created:false,updated:true,duplicate:imp.payload_hash===payloadHash,post_id:Number(imp.post_id),slug:imp.slug,url:`https://${target.domain}/base/${imp.slug}.html`});
}
// TRIAL WEBSITE MAINTENANCE — hourly/daily cron safe endpoint.
if(route==='system/trial-maintenance'&&request.method==='POST'){
  await ensureCustomerTables(env);await ensureTrialTables(env);
  const auth=request.headers.get('Authorization')||'';if(!env.CRON_SECRET||auth!==`Bearer ${env.CRON_SECRET}`)return json({error:'Unauthorized'},401);
  const expired=(await env.DB.prepare(`UPDATE website_trials SET status='expired',updated_at=CURRENT_TIMESTAMP WHERE status='active' AND datetime(expires_at)<=datetime('now') RETURNING id`).all()).results||[];
  const due=(await env.DB.prepare(`SELECT wt.id,wt.site_id FROM website_trials wt WHERE wt.status='expired' AND datetime(wt.grace_expires_at)<=datetime('now')`).all()).results||[];
  let purged=0;
  for(const x of due){
    try{await env.DB.batch([env.DB.prepare(`DELETE FROM sessions WHERE site_id=?`).bind(x.site_id),env.DB.prepare(`DELETE FROM posts WHERE site_id=?`).bind(x.site_id),env.DB.prepare(`UPDATE sites SET status='inactive' WHERE id=?`).bind(x.site_id),env.DB.prepare(`UPDATE website_trials SET status='purged',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(x.id)]);purged++}catch(e){}
  }
  return json({ok:true,expired:expired.length,purged});
}

// DAILY RENEWAL REMINDER JOB — called by a Cloudflare Cron Worker.
if(route==='system/renewal-reminders'&&request.method==='POST'){
  await ensureCustomerTables(env);
  const auth=request.headers.get('Authorization')||'';
  if(!env.CRON_SECRET||auth!==`Bearer ${env.CRON_SECRET}`)return json({error:'Unauthorized'},401);
  const {results}=await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,ss.expires_at,
    coalesce(sp.term_months,12) term_months,coalesce(sp.bonus_months,0) bonus_months
    FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin' LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id
    WHERE s.status='active' AND ss.service_status IN ('active','ready') AND ss.expires_at IS NOT NULL AND date(ss.expires_at)>=date('now')
    AND julianday(ss.expires_at)-julianday(date('now'))<=30 ORDER BY ss.expires_at ASC`).all();
  const thresholds=[30,14,7,3,1],out=[];
  for(const row of results){
    const days=Math.max(0,Math.ceil((new Date(String(row.expires_at)+'T23:59:59Z')-new Date())/86400000));
    const key=thresholds.find(x=>days<=x);
    if(!key)continue;
    const reminderKey=`d${key}`;
    const exists=await env.DB.prepare(`SELECT id FROM renewal_reminder_log WHERE site_id=? AND service_expires_at=? AND reminder_key=?`).bind(row.id,row.expires_at,reminderKey).first();
    if(exists)continue;
    const sent=await renewalEmailForSite(env,row,new URL(request.url).origin,reminderKey);
    if(sent.ok){
      await env.DB.prepare(`INSERT OR IGNORE INTO renewal_reminder_log(site_id,service_expires_at,reminder_key,email) VALUES(?,?,?,?)`).bind(row.id,row.expires_at,reminderKey,sent.email).run();
      out.push({site_id:row.id,ok:true,email:sent.email,days,reminder:reminderKey});
    }else out.push({site_id:row.id,ok:false,error:sent.error||'Send failed'});
  }
  return json({ok:true,checked:results.length,sent:out.filter(x=>x.ok).length,results:out});
}

// Public renewal-response flow. YES creates a VietQR payment; service time changes only after real domain renewal.
if(route==='renewal/payment-status'&&request.method==='GET'){
  await ensureRenewalPayments(env);
  const orderCode=String(u.searchParams.get('order_code')||'').trim(),token=String(u.searchParams.get('token')||'').trim();
  if(!orderCode||!token)return json({error:'Thiếu thông tin thanh toán'},400);
  const hash=await sha256(token);
  const row=await env.DB.prepare(`SELECT status,amount,paid_amount,paid_at,order_code,years FROM renewal_payments WHERE order_code=? AND token_hash=? LIMIT 1`).bind(orderCode,hash).first();
  if(!row)return json({error:'Không tìm thấy giao dịch'},404);
  return json({ok:true,status:row.status,amount:Number(row.amount||0),paid_amount:Number(row.paid_amount||0),paid_at:row.paid_at||null,order_code:row.order_code,years:Number(row.years||1)});
}
if(route==='renewal/info'&&request.method==='GET'){
  await ensureCustomerTables(env);
  const raw=String(u.searchParams.get('token')||'');if(!raw)return json({error:'Thiếu mã xác nhận'},400);
  const hash=await sha256(raw);
  const row=await env.DB.prepare(`SELECT rt.id token_id,rt.expires_at,rt.used_at,s.id site_id,s.name,s.domain,ss.expires_at service_expires_at,cp.full_name,
    coalesce(sp.renewal_status,'none') renewal_status,coalesce(sp.renewal_price,1999000) renewal_price
    FROM renewal_response_tokens rt JOIN sites s ON s.id=rt.site_id LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE rt.token_hash=?`).bind(hash).first();
  if(!row)return json({error:'Liên kết không hợp lệ'},404);
  if(new Date(row.expires_at+'Z')<=new Date())return json({error:'Liên kết đã hết hạn'},410);
  return json({ok:true,site:{name:row.name,domain:row.domain},customer_name:row.full_name||'',expires_at:row.service_expires_at||'',renewal_status:row.renewal_status,renewal_price:Number(row.renewal_price||0),responded:!!row.used_at});
}
if(route==='renewal/respond'&&request.method==='POST'){
  await ensureCustomerTables(env);
  const b=await body(request),raw=String(b.token||''),decision=String(b.decision||'');
  if(!raw||!['yes','no'].includes(decision))return json({error:'Yêu cầu không hợp lệ'},400);
  const hash=await sha256(raw);
  const rt=await env.DB.prepare(`SELECT * FROM renewal_response_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>datetime('now')`).bind(hash).first();
  if(!rt)return json({error:'Liên kết đã hết hạn hoặc đã được sử dụng'},410);
  if(decision==='yes'){
    try{
      const pay=await createRenewalPayment(env,rt.site_id,Number(b.years||1));
      await env.DB.prepare(`UPDATE renewal_response_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?`).bind(rt.id).run();
      return json({ok:true,decision,payment:{order_code:pay.order_code,payment_token:pay.payment_token,years:pay.years,amount:pay.amount,memo:pay.memo,provider:pay.provider,provider_order_code:pay.provider_order_code,qr_code:pay.qr_code,checkout_url:pay.checkout_url,payment_link_id:pay.payment_link_id,qr_url:pay.qr_url,bank_name:pay.bank_name,account_name:pay.account_name,account_number:pay.account_number}});
    }catch(e){return json({error:e.message||'Không tạo được thanh toán gia hạn'},400)}
  }
  await env.DB.batch([
    env.DB.prepare(`UPDATE renewal_response_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?`).bind(rt.id),
    env.DB.prepare(`INSERT INTO service_promotions(site_id,renewal_status,renewal_decision_at,renewal_stage,updated_at) VALUES(?,'no',CURRENT_TIMESTAMP,'declined',CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET renewal_status='no',renewal_decision_at=CURRENT_TIMESTAMP,renewal_stage='declined',updated_at=CURRENT_TIMESTAMP`).bind(rt.site_id)
  ]);
  return json({ok:true,decision});
}



// TRIAL WEBSITE CONTRACT V1 — public lifecycle endpoints.
if(route==='trial/create'&&request.method==='POST'){
  await ensureCustomerTables(env);await ensureTemplateCatalog(env);await ensureTrialTables(env);await ensureSiteTemplateIdentity(env);
  const b=await body(request),name=String(b.name||'').trim(),phone=String(b.phone||'').trim(),email=String(b.email||'').trim().toLowerCase(),zalo=String(b.zalo||phone).trim(),siteName=String(b.site_name||'').trim();
  const templateKey=String(b.template_key||'').trim();
  if(!name||!phone||!email||!siteName||!templateKey)return json({error:'Vui lòng nhập họ tên, số điện thoại, email, tên website mong muốn và chọn giao diện'},400);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Email không hợp lệ'},400);
  const tpl=await env.DB.prepare(`SELECT template_key,name,category,preset,price,renewal_price,accent FROM template_catalog WHERE template_key=? AND is_active=1 LIMIT 1`).bind(templateKey).first();
  if(!tpl)return json({error:'Giao diện không tồn tại hoặc đã ngừng cung cấp'},404);
  // TRIAL ABUSE GUARD V1 — layered identity + IP throttling.
  // Never trust the browser alone: every public trial create is checked server-side.
  const ipRaw=String(request.headers.get('CF-Connecting-IP')||request.headers.get('X-Forwarded-For')||'').split(',')[0].trim();
  const uaRaw=String(request.headers.get('User-Agent')||'').slice(0,500);
  const ipHash=ipRaw?await sha256('trial-ip:'+ipRaw):'';
  const uaHash=uaRaw?await sha256('trial-ua:'+uaRaw):'';
  if(String(b.website||'').trim())return json({error:'Yêu cầu không hợp lệ'},400); // honeypot
  const identityBurst=await env.DB.prepare(`SELECT count(*) c FROM website_trials wt JOIN sales_leads sl ON sl.id=wt.lead_id WHERE (lower(sl.email)=? OR sl.phone=?) AND wt.created_at>=datetime('now','-30 days')`).bind(email,phone).first();
  if(Number(identityBurst?.c||0)>=3)return json({error:'Bạn đã sử dụng số lượt dùng thử miễn phí cho phép trong thời gian gần đây. Vui lòng liên hệ HoangVuongTech nếu cần thêm thời gian trải nghiệm.',code:'TRIAL_IDENTITY_LIMIT'},429);
  if(ipHash){
    const ipBurst=await env.DB.prepare(`SELECT count(*) c FROM website_trials WHERE source_ip_hash=? AND created_at>=datetime('now','-1 day')`).bind(ipHash).first();
    if(Number(ipBurst?.c||0)>=5)return json({error:'Đã có nhiều lượt dùng thử được tạo từ kết nối này. Vui lòng thử lại sau hoặc liên hệ HoangVuongTech.',code:'TRIAL_IP_LIMIT'},429);
  }
  const dup=await env.DB.prepare(`SELECT wt.id,wt.trial_token,wt.expires_at,wt.status,s.domain FROM website_trials wt JOIN sales_leads sl ON sl.id=wt.lead_id JOIN sites s ON s.id=wt.site_id
    WHERE wt.template_key=? AND (lower(sl.email)=? OR sl.phone=?) AND wt.created_at>=datetime('now','-7 days') ORDER BY wt.id DESC LIMIT 1`).bind(templateKey,email,phone).first();
  if(dup){
    const st=trialPublicState(dup);
    if(String(dup.status||'')==='pending_activation'){
      const ar=activationToken(),ah=await sha256(ar);
      await env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=(SELECT site_id FROM website_trials WHERE id=?) AND used_at IS NULL`).bind(dup.id).run();
      await env.DB.prepare(`INSERT INTO site_activation_tokens(site_id,token_hash,expires_at) SELECT site_id,?,datetime('now','+2 days') FROM website_trials WHERE id=?`).bind(ah,dup.id).run();
      return json({error:'Bạn đã đăng ký dùng thử giao diện này. Hãy hoàn tất bước kích hoạt.',code:'TRIAL_PENDING_ACTIVATION',activation_url:`/activate/?token=${encodeURIComponent(ar)}&trial=1`,status:'pending_activation'},409);
    }
    return json({error:'Bạn đã đăng ký dùng thử giao diện này trong 7 ngày gần đây.',code:'TRIAL_RECENT_EXISTS',trial_url:`/trial/${dup.trial_token}/`,expires_at:dup.expires_at,status:st?.status},409)
  }
  const leadRun=await env.DB.prepare(`INSERT INTO sales_leads(source,status,lead_kind,care_status,template_key,template_name,price,renewal_price,customer_name,phone,email,zalo,company,trial_source_url,site_name,requested_domain,note,marketing_opt_in,last_activity_at)
    VALUES('trial','new','trial','new',?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`).bind(templateKey,tpl.name,Number(tpl.price||0),Number(tpl.renewal_price||0),name,phone,email,zalo,String(b.company||''),String(b.source_url||''),siteName,'',String(b.note||''),b.marketing_opt_in?1:0).run();
  const leadId=Number(leadRun.meta.last_row_id),token=crypto.randomUUID().replace(/-/g,'')+crypto.randomUUID().replace(/-/g,'').slice(0,8);
  const tenant=`trial-${token.slice(0,16)}.trial.hoangvuongtech.local`;
  const accentMap={green:'#138a4b',orange:'#e87817',purple:'#7653d6',red:'#d74646',blue:'#1463ff',navy:'#0f2943',black:'#111827'};
  const siteRun=await env.DB.prepare(`INSERT INTO sites(name,domain,preset,template_key,accent,phone,zalo,facebook,email,status) VALUES(?,?,?,?,?,?,?,?,?,'active')`)
    .bind(`${siteName} · Trial`,tenant,tpl.preset,templateKey,accentMap[String(tpl.accent||'blue')]||'#1463ff',phone,zalo,'',email).run();
  const siteId=Number(siteRun.meta.last_row_id);
  // V17.9 — Trial activation parity: never issue a temporary password. The visitor owns the credential from first activation.
  const placeholder=await sha256(activationToken());
  await env.DB.prepare(`INSERT INTO users(site_id,email,password_hash,role) VALUES(?,?,?,'admin')`).bind(siteId,email,placeholder).run();
  await env.DB.prepare(`INSERT INTO customer_profiles(site_id,full_name,phone,email,company,order_code,internal_note,activated_at,updated_at) VALUES(?,?,?,?,?,'','TRIAL WEBSITE',NULL,CURRENT_TIMESTAMP)`)
    .bind(siteId,name,phone,email,String(b.company||'')).run();
  await env.DB.prepare(`INSERT INTO site_public_settings(site_id,contact_email,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(site_id) DO UPDATE SET contact_email=excluded.contact_email,updated_at=CURRENT_TIMESTAMP`).bind(siteId,email).run();
  // Keep provisional timestamps to satisfy the V1 schema; the full 24 hours starts only after activation.
  const trialRun=await env.DB.prepare(`INSERT INTO website_trials(trial_token,site_id,lead_id,template_key,status,expires_at,grace_expires_at,source_ip_hash,user_agent_hash) VALUES(?,?,?,?,'pending_activation',datetime('now','+1 day'),datetime('now','+8 days'),?,?)`)
    .bind(token,siteId,leadId,templateKey,ipHash,uaHash).run();
  const trialId=Number(trialRun.meta.last_row_id);
  await env.DB.prepare(`UPDATE sales_leads SET trial_id=? WHERE id=?`).bind(trialId,leadId).run();
  await env.DB.prepare(`INSERT INTO service_subscriptions(site_id,plan_name,sale_price,internal_cost,payment_status,service_status,started_at,expires_at,domain_status,registrar,note)
    VALUES(?,'Dùng thử website 24 giờ',0,0,'trial','pending_activation',date('now'),date('now','+1 day'),'trial','HoangVuongTech','Tenant dùng thử - không tính doanh thu')`).bind(siteId).run();
  try{await env.DB.prepare(`UPDATE service_subscriptions SET finance_excluded=1 WHERE site_id=?`).bind(siteId).run()}catch(e){}
  const activationRaw=activationToken(),activationHash=await sha256(activationRaw);
  await env.DB.prepare(`INSERT INTO site_activation_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+2 days'))`).bind(siteId,activationHash).run();
  // V19.0 — TRIAL EMPTY DATA CONTRACT: every new trial starts with zero posts/listings.
  // Public showroom demo data is virtual and must never leak into a trial tenant.
  try{await env.DB.prepare(`DELETE FROM posts WHERE site_id=?`).bind(siteId).run()}catch(e){}
  const tr=await trialByToken(env,token);await trialEvent(env,tr,'trial_created',{template_key:templateKey,activation_required:true});
  const demoBase=String(tpl.demo_url||(`/demo/${tpl.category==='tin-tuc'?'tin-tuc':'bat-dong-san'}/${templateKey.replace('tin-tuc-','mau-')}/`));
  return json({ok:true,trial_id:trialId,lead_id:leadId,token,tenant,status:'pending_activation',
    activation_url:`/activate/?token=${encodeURIComponent(activationRaw)}&trial=1`,
    trial_url:`/trial/${token}/`,website_url:`${demoBase}?nr_trial=${encodeURIComponent(token)}`,
    admin_email:email,template:{key:templateKey,name:tpl.name}});
}
if(route==='trial/status'&&request.method==='GET'){
  const tr=await trialByToken(env,String(u.searchParams.get('token')||''));if(!tr)return json({error:'Trial không tồn tại'},404);
  await trialEvent(env,tr,'trial_seen',{path:String(u.searchParams.get('path')||'')});
  const demoBase=String(tr.template_demo_url||(`/demo/${tr.template_category==='tin-tuc'?'tin-tuc':'bat-dong-san'}/${String(tr.template_key||'').replace('tin-tuc-','mau-')}/`));
  const websiteUrl=demoBase+(demoBase.includes('?')?'&':'?')+'nr_trial='+encodeURIComponent(tr.trial_token);
  return json({ok:true,trial:trialPublicState(tr),customer:{name:tr.customer_name||'',email:tr.email||'',phone:tr.phone||'',zalo:tr.zalo||'',company:tr.company||'',facebook:tr.facebook||'',site_name:tr.site_name||'',note:tr.note||'',marketing_opt_in:Number(tr.marketing_opt_in||0)},template:{key:tr.template_key,name:tr.template_name||tr.template_key,price:Number(tr.template_price||0),renewal_price:Number(tr.template_renewal_price||0),demo_url:demoBase},website_url:websiteUrl});
}
if(route==='trial/convert-request'&&request.method==='POST'){
  const b=await body(request),tr=await trialByToken(env,String(b.token||''));if(!tr)return json({error:'Trial không tồn tại'},404);
  await env.DB.batch([
    env.DB.prepare(`UPDATE website_trials SET conversion_request_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.id),
    env.DB.prepare(`UPDATE sales_leads SET status='contacted',care_status='interested',last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.lead_id)
  ]);
  await trialEvent(env,tr,'conversion_requested',{});
  return json({ok:true,lead_id:tr.lead_id,checkout_url:`/trial-checkout/?token=${encodeURIComponent(tr.trial_token)}`});
}

// V20.6.10 — Trial Direct Checkout v2: payment is created from data already stored on the Trial.
if(route==='trial/direct-checkout'&&request.method==='POST'){
  const b=await body(request),trialToken=String(b.token||'').trim();
  if(!trialToken)return json({error:'Thiếu mã website dùng thử'},400);
  await ensureTemplateCatalog(env);await ensureSalesLeads(env);await ensurePurchasePayments(env);
  const tr=await trialByToken(env,trialToken);if(!tr)return json({error:'Website dùng thử không tồn tại'},404);
  const templateKey=String(tr.template_key||'').trim();
  const tpl=await env.DB.prepare(`SELECT template_key,name,price,renewal_price FROM template_catalog WHERE template_key=? AND is_active=1 LIMIT 1`).bind(templateKey).first();
  if(!tpl)return json({error:'Giao diện của website dùng thử không còn mở bán'},409);
  const name=String(tr.customer_name||'').trim(),phone=String(tr.phone||'').trim(),email=String(tr.email||'').trim().toLowerCase();
  const siteName=String(tr.site_name||'').trim(),note=String(tr.note||'').trim(),facebook=String(tr.facebook||'').trim();
  const marketingOptIn=Number(tr.marketing_opt_in||0)===1?1:0;
  if(!name||!phone||!email||!siteName)return json({error:'Website dùng thử chưa đủ thông tin kích hoạt. Vui lòng liên hệ hỗ trợ.'},409);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Email của website dùng thử không hợp lệ'},409);
  const templateName=String(tpl.name||tr.template_name||templateKey).trim();
  const finalPrice=Math.max(0,Number(tpl.price||0)),renewalPrice=Math.max(0,Number(tpl.renewal_price||0));
  if(finalPrice<=0)return json({error:'Giao diện này chưa có giá thanh toán tự động. Vui lòng liên hệ hỗ trợ.'},409);
  const leadId=Number(tr.lead_id||0);if(!leadId)return json({error:'Không tìm thấy hồ sơ dùng thử'},409);
  await env.DB.batch([
    env.DB.prepare(`UPDATE sales_leads SET source='trial_conversion',status='payment_pending',care_status='interested',template_key=?,template_name=?,price=?,renewal_price=?,customer_name=?,phone=?,email=?,site_name=?,requested_domain='',note=?,facebook=?,marketing_opt_in=?,payment_status='pending',last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(templateKey,templateName,finalPrice,renewalPrice,name,phone,email,siteName,note,facebook,marketingOptIn,leadId),
    env.DB.prepare(`UPDATE website_trials SET conversion_request_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.id)
  ]);
  await env.DB.prepare(`UPDATE purchase_payments SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE lead_id=? AND status='pending'`).bind(leadId).run();
  const orderCode=purchaseOrderCode(leadId),token=activationToken(),tokenHash=await sha256(token);
  await env.DB.prepare(`INSERT INTO purchase_payments(lead_id,order_code,token_hash,amount,status,provider) VALUES(?,?,?,?,'pending','bank_qr')`).bind(leadId,orderCode,tokenHash,finalPrice).run();
  await env.DB.prepare(`UPDATE sales_leads SET payment_order_code=?,payment_status='pending',paid_amount=0,paid_at=NULL,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(orderCode,leadId).run();
  await trialEvent(env,tr,'payment_started',{lead_id:leadId,amount:finalPrice,direct_checkout:true});
  const listPrice=Math.max(finalPrice,renewalPrice||0),discount=Math.max(0,listPrice-finalPrice);
  const cfg=paymentConfig(env),origin=String(env.PUBLIC_APP_URL||u.origin).replace(/\/$/,'');
  let provider='bank_qr',memo=orderCode,qrCode='',checkoutUrl='',paymentLinkId='',providerOrderCode=null;
  let bankName=cfg.bankName,accountName=cfg.accountName,accountNumber=cfg.accountNumber,qrUrl=purchasePaymentQr(env,finalPrice,memo);
  if(payosReady(env)){
    const po=await payosCreatePayment(env,{amount:finalPrice,description:`HV${String(leadId).slice(-6)}`,returnUrl:`${origin}/?payment=success`,cancelUrl:`${origin}/?payment=cancel`,buyerName:name,buyerEmail:email,buyerPhone:phone});
    provider='payos';providerOrderCode=Number(po.orderCode);paymentLinkId=String(po.paymentLinkId||'');checkoutUrl=String(po.checkoutUrl||'');qrCode=String(po.qrCode||'');
    memo=String(po.description||orderCode);bankName='MB Bank / payOS';accountName=String(po.accountName||'');accountNumber=String(po.accountNumber||'');qrUrl='';
    await env.DB.prepare(`UPDATE purchase_payments SET provider='payos',provider_order_code=?,payment_link_id=?,checkout_url=?,qr_code=?,updated_at=CURRENT_TIMESTAMP WHERE order_code=?`).bind(providerOrderCode,paymentLinkId,checkoutUrl,qrCode,orderCode).run();
  }
  return json({ok:true,lead_id:leadId,order_code:orderCode,payment_token:token,status:'pending',trial_token:trialToken,
    invoice:{template_name:templateName,list_price:listPrice,domain_price:0,hosting_price:0,discount,total:finalPrice,renewal_price:renewalPrice,site_name:siteName},
    payment:{provider,provider_order_code:providerOrderCode,amount:finalPrice,memo,qr_code:qrCode,checkout_url:checkoutUrl,payment_link_id:paymentLinkId,qr_url:qrUrl,bank_name:bankName,account_name:accountName,account_number:accountNumber}});
}

if(route==='template-inquiry'&&request.method==='POST'){
  const b=await body(request);
  const name=String(b.name||'').trim(),phone=String(b.phone||'').trim();
  const email=String(b.email||'').trim().toLowerCase();
  const siteName=String(b.site_name||'').trim(),note=String(b.note||'').trim();
  const facebook=String(b.facebook||'').trim(),templateKey=String(b.template_key||'').trim();
  const marketingOptIn=b.marketing_opt_in===true||Number(b.marketing_opt_in)===1?1:0;
  if(!name||!phone||!email||!siteName)return json({error:'Vui lòng nhập họ tên, số điện thoại, email chính xác và tên website mong muốn'},400);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Email không hợp lệ. Đây là email dùng để nhận link kích hoạt website.'},400);
  await ensureTemplateCatalog(env);await ensureSalesLeads(env);await ensurePurchasePayments(env);
  const tpl=templateKey?await env.DB.prepare(`SELECT template_key,name,price,renewal_price FROM template_catalog WHERE template_key=? AND is_active=1 LIMIT 1`).bind(templateKey).first():null;
  if(!tpl)return json({error:'Vui lòng chọn một giao diện đang mở bán trước khi thanh toán'},400);
  const templateName=String(tpl.name||b.template_name||templateKey).trim();
  const finalPrice=Math.max(0,Number(tpl.price||0)),renewalPrice=Math.max(0,Number(tpl.renewal_price||0));
  if(finalPrice<=0)return json({error:'Giao diện này chưa có giá thanh toán tự động. Vui lòng liên hệ hỗ trợ.'},409);

  let leadId=0;
  const trialToken=String(b.trial_token||'').trim();
  if(trialToken){
    const tr=await trialByToken(env,trialToken);
    if(tr){
      leadId=Number(tr.lead_id);
      await env.DB.batch([
        env.DB.prepare(`UPDATE sales_leads SET source='trial_conversion',status='payment_pending',care_status='interested',template_key=?,template_name=?,price=?,renewal_price=?,customer_name=?,phone=?,email=?,site_name=?,requested_domain='',note=?,facebook=?,marketing_opt_in=?,payment_status='pending',last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
          .bind(templateKey,templateName,finalPrice,renewalPrice,name,phone,email,siteName,note,facebook,marketingOptIn,leadId),
        env.DB.prepare(`UPDATE website_trials SET conversion_request_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.id)
      ]);
      await trialEvent(env,tr,'payment_started',{lead_id:leadId,amount:finalPrice});
    }
  }
  if(!leadId){
    const ins=await env.DB.prepare(`INSERT INTO sales_leads
      (source,status,template_key,template_name,price,renewal_price,customer_name,phone,email,site_name,requested_domain,note,facebook,marketing_opt_in,payment_status)
      VALUES('template_checkout','payment_pending',?,?,?,?,?,?,?,?,?,?,?,?,'pending')`)
      .bind(templateKey,templateName,finalPrice,renewalPrice,name,phone,email,siteName,'',note,facebook,marketingOptIn).run();
    leadId=Number(ins.meta.last_row_id);
  }

  await env.DB.prepare(`UPDATE purchase_payments SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE lead_id=? AND status='pending'`).bind(leadId).run();
  const orderCode=purchaseOrderCode(leadId),token=activationToken(),tokenHash=await sha256(token);
  await env.DB.prepare(`INSERT INTO purchase_payments(lead_id,order_code,token_hash,amount,status,provider) VALUES(?,?,?,?,'pending','bank_qr')`).bind(leadId,orderCode,tokenHash,finalPrice).run();
  await env.DB.prepare(`UPDATE sales_leads SET payment_order_code=?,payment_status='pending',paid_amount=0,paid_at=NULL,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(orderCode,leadId).run();

  const listPrice=Math.max(finalPrice,renewalPrice||0),discount=Math.max(0,listPrice-finalPrice);
  const cfg=paymentConfig(env),origin=String(env.PUBLIC_APP_URL||u.origin).replace(/\/$/,'');
  let provider='bank_qr',memo=orderCode,qrCode='',checkoutUrl='',paymentLinkId='',providerOrderCode=null;
  let bankName=cfg.bankName,accountName=cfg.accountName,accountNumber=cfg.accountNumber,qrUrl=purchasePaymentQr(env,finalPrice,memo);
  if(payosReady(env)){
    const po=await payosCreatePayment(env,{amount:finalPrice,description:`HV${String(leadId).slice(-6)}`,returnUrl:`${origin}/?payment=success`,cancelUrl:`${origin}/?payment=cancel`,buyerName:name,buyerEmail:email,buyerPhone:phone});
    provider='payos';providerOrderCode=Number(po.orderCode);paymentLinkId=String(po.paymentLinkId||'');checkoutUrl=String(po.checkoutUrl||'');qrCode=String(po.qrCode||'');
    memo=String(po.description||orderCode);bankName='MB Bank / payOS';accountName=String(po.accountName||'');accountNumber=String(po.accountNumber||'');qrUrl='';
    await env.DB.prepare(`UPDATE purchase_payments SET provider='payos',provider_order_code=?,payment_link_id=?,checkout_url=?,qr_code=?,updated_at=CURRENT_TIMESTAMP WHERE order_code=?`).bind(providerOrderCode,paymentLinkId,checkoutUrl,qrCode,orderCode).run();
  }
  return json({ok:true,lead_id:leadId,order_code:orderCode,payment_token:token,status:'pending',
    invoice:{template_name:templateName,list_price:listPrice,domain_price:0,hosting_price:0,discount,total:finalPrice,renewal_price:renewalPrice},
    payment:{provider,provider_order_code:providerOrderCode,amount:finalPrice,memo,qr_code:qrCode,checkout_url:checkoutUrl,payment_link_id:paymentLinkId,qr_url:qrUrl,bank_name:bankName,account_name:accountName,account_number:accountNumber}});
}

  if(route==='master/trials'&&request.method==='GET'){
    try{
      const {results}=await env.DB.prepare(`SELECT wt.*,s.name site_name,s.domain,s.preset,tc.demo_url,tc.category template_category,sl.customer_name,sl.phone,sl.email,coalesce(sl.zalo,'') zalo,coalesce(sl.company,'') company,sl.template_name,sl.status lead_status,coalesce(sl.care_status,'new') care_status,
        (SELECT count(*) FROM trial_events te WHERE te.trial_id=wt.id) event_count,
        (SELECT count(*) FROM posts p WHERE p.site_id=wt.site_id AND coalesce(p.is_sample,0)=0) real_post_count
        FROM website_trials wt JOIN sites s ON s.id=wt.site_id LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key LEFT JOIN sales_leads sl ON sl.id=wt.lead_id ORDER BY wt.id DESC LIMIT 500`).all();
      for(const x of results||[]){if(x.status==='active'&&Date.parse(String(x.expires_at).replace(' ','T')+'Z')<=Date.now())x.status='expired'}
      const stats=await env.DB.prepare(`SELECT count(*) total,
        sum(CASE WHEN status='active' AND datetime(expires_at)>datetime('now') THEN 1 ELSE 0 END) active,
        sum(CASE WHEN status='expired' OR (status<>'pending_activation' AND datetime(expires_at)<=datetime('now')) THEN 1 ELSE 0 END) expired,
        sum(CASE WHEN conversion_request_at IS NOT NULL THEN 1 ELSE 0 END) interested,
        sum(CASE WHEN status='converted' THEN 1 ELSE 0 END) converted
        FROM website_trials`).first();
      return json({ok:true,trials:results||[],stats:{total:Number(stats?.total||0),active:Number(stats?.active||0),expired:Number(stats?.expired||0),interested:Number(stats?.interested||0),converted:Number(stats?.converted||0)}},200,{'Cache-Control':'no-store, no-cache, must-revalidate, max-age=0','CDN-Cache-Control':'no-store'});
    }catch(e){
      console.error('master/trials',e);
      return json({error:'Không tải được dữ liệu khách dùng thử',detail:String(e?.message||e)},500,{'Cache-Control':'no-store'});
    }
  }
  if(route==='master/trial-access'&&request.method==='POST'){
    const b=await body(request),id=Number(b.id);if(!id)return json({error:'Thiếu trial'},400);
    const tr=await env.DB.prepare(`SELECT wt.*,s.domain,tc.demo_url,tc.category template_category FROM website_trials wt JOIN sites s ON s.id=wt.site_id LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.id=? LIMIT 1`).bind(id).first();
    if(!tr)return json({error:'Trial không tồn tại'},404);
    if(tr.status==='pending_activation')return json({error:'Khách chưa hoàn tất kích hoạt Trial'},409);
    const publicOrigin='https://hoangvuongtech.com';
    let base=String(tr.demo_url||'');
    if(!base){const key=String(tr.template_key||'');base=key.startsWith('tin-tuc-')?`/demo/tin-tuc/${key.replace('tin-tuc-','mau-')}/`:`/demo/bat-dong-san/${key||'mau-1'}/`}
    const website_url=publicOrigin+base+(base.includes('?')?'&':'?')+'nr_trial='+encodeURIComponent(tr.trial_token);
    if(String(b.target||'website')!=='admin')return json({ok:true,website_url});
    const magicRaw=tok(),magicHash=await sha256(magicRaw);
    await env.DB.prepare(`INSERT INTO handover_login_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+10 minutes'))`).bind(tr.site_id,magicHash).run();
    await trialEvent(env,tr,'master_open_admin',{});
    const admin_url=publicOrigin+`/admin?tenant=${encodeURIComponent(tr.domain)}&nr_trial=${encodeURIComponent(tr.trial_token)}&template=${encodeURIComponent(tr.template_key)}&handover=${encodeURIComponent(magicRaw)}`;
    return json({ok:true,admin_url,website_url});
  }
  if(route==='master/trial-update'&&request.method==='POST'){
    const b=await body(request),id=Number(b.id);if(!id)return json({error:'Thiếu trial'},400);
    const tr=await env.DB.prepare(`SELECT * FROM website_trials WHERE id=?`).bind(id).first();if(!tr)return json({error:'Trial không tồn tại'},404);
    const action=String(b.action||'');
    if(action==='extend'){const hours=Math.max(1,Math.min(168,Number(b.hours||24)));await env.DB.prepare(`UPDATE website_trials SET status='active',expires_at=datetime(CASE WHEN datetime(expires_at)>datetime('now') THEN expires_at ELSE datetime('now') END, '+'||?||' hours'),grace_expires_at=datetime(CASE WHEN datetime(expires_at)>datetime('now') THEN expires_at ELSE datetime('now') END, '+'||?||' hours','+7 days'),updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(hours,hours,id).run()}
    else if(action==='expire')await env.DB.prepare(`UPDATE website_trials SET status='expired',expires_at=datetime('now'),updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
    else if(action==='care'){const care=String(b.care_status||'new');await env.DB.prepare(`UPDATE sales_leads SET care_status=?,status=CASE WHEN ?='won' THEN 'won' WHEN ?='lost' THEN 'lost' WHEN ? IN ('contacted','interested') THEN 'contacted' ELSE status END,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(care,care,care,care,tr.lead_id).run()}
    else if(action==='note'){await env.DB.prepare(`UPDATE website_trials SET master_note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(String(b.note||''),id).run()}
    else if(action==='converted'){await env.DB.batch([env.DB.prepare(`UPDATE website_trials SET status='converted',converted_site_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(Number(b.converted_site_id||0)||null,id),env.DB.prepare(`UPDATE sales_leads SET status='won',care_status='won',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(tr.lead_id)])}
    else if(action==='delete'){
      const siteId=Number(tr.site_id||0),leadId=Number(tr.lead_id||0);
      // Hard-delete a trial tenant only when Master explicitly confirms it. This is intended for test/spam cleanup.
      try{await env.DB.prepare(`DELETE FROM trial_events WHERE trial_id=?`).bind(id).run()}catch(e){}
      for(const [table,col] of [
        ['password_reset_tokens','site_id'],['handover_login_tokens','site_id'],['site_activation_tokens','site_id'],
        ['financial_transactions','site_id'],['service_promotions','site_id'],['service_subscriptions','site_id'],
        ['site_public_settings','site_id'],['customer_profiles','site_id'],['pageviews','site_id'],['sessions','site_id'],['posts','site_id'],['users','site_id']
      ]){try{await env.DB.prepare(`DELETE FROM ${table} WHERE ${col}=?`).bind(siteId).run()}catch(e){}}
      try{await env.DB.prepare(`DELETE FROM website_trials WHERE id=?`).bind(id).run()}catch(e){}
      try{await env.DB.prepare(`DELETE FROM sales_leads WHERE id=? AND coalesce(lead_kind,'')='trial'`).bind(leadId).run()}catch(e){}
      try{await env.DB.prepare(`DELETE FROM sites WHERE id=?`).bind(siteId).run()}catch(e){}
      return json({ok:true,deleted:true,id,site_id:siteId,lead_id:leadId});
    }
    else return json({error:'Thao tác không hợp lệ'},400);
    const fresh=await env.DB.prepare(`SELECT * FROM website_trials WHERE id=?`).bind(id).first();await trialEvent(env,fresh,'master_'+action,b);
    return json({ok:true,trial:fresh});
  }
  if(route==='master/create-site'&&request.method==='POST'){
    const b=await body(request);
    await ensureCustomerTables(env);
    await ensureSiteTemplateIdentity(env);
    const name=String(b.name||'').trim(),domain=cleanDomain(b.domain||''),adminEmail=String(b.admin_email||'').trim().toLowerCase();
    if(!name||!domain||!adminEmail)return json({error:'Thiếu tên website, domain hoặc email Admin khách'},400);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail))return json({error:'Email Admin khách không hợp lệ'},400);
    await ensureTemplateCatalog(env);
    const requestedTemplateKey=String(b.template_key||'').trim();
    let templateRow=requestedTemplateKey?await env.DB.prepare(`SELECT template_key,preset,name,accent,coalesce(sample_enabled,0) sample_enabled,coalesce(sample_count,12) sample_count FROM template_catalog WHERE template_key=? LIMIT 1`).bind(requestedTemplateKey).first():null;
    const requestedPreset=String(b.theme_key||'').trim();
    if(!templateRow&&requestedPreset)templateRow=await env.DB.prepare(`SELECT template_key,preset,name,accent,coalesce(sample_enabled,0) sample_enabled,coalesce(sample_count,12) sample_count FROM template_catalog WHERE preset=? AND is_active=1 ORDER BY sort_order LIMIT 1`).bind(requestedPreset).first();
    const themeKey=String(templateRow?.preset||requestedPreset||'newsreal').trim()||'newsreal';
    const customerPhone=String(b.customer_phone||'').trim();
    const publicPhone=String(b.public_phone||customerPhone).trim();
    const publicZalo=String(b.public_zalo||customerPhone).trim();
    const publicFacebook=String(b.public_facebook||'').trim();
    const publicEmail=String(b.public_email||adminEmail).trim().toLowerCase();
    if(publicEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicEmail))return json({error:'Email liên hệ công khai không hợp lệ'},400);
    const leadId=Number(b.lead_id||0);
    // V20.4.6 — Early/expired Trial conversion uses ONE pipeline and promotes the
    // existing trial tenant in-place. This preserves every customer-created post,
    // media reference, taxonomy choice, credential and website setting.
    let promoteTrial=null;
    if(leadId){
      try{promoteTrial=await env.DB.prepare(`SELECT wt.id trial_id,wt.site_id,wt.trial_token,wt.template_key,wt.status,sl.source,sl.payment_status FROM website_trials wt JOIN sales_leads sl ON sl.id=wt.lead_id WHERE wt.lead_id=? AND sl.source='trial_conversion' LIMIT 1`).bind(leadId).first()}catch(e){}
    }
    const promoteSiteId=Number(promoteTrial?.site_id||0);
    if(await env.DB.prepare(`SELECT id FROM sites WHERE lower(domain)=? AND id<>?`).bind(domain,promoteSiteId||0).first())return json({error:'Domain đã tồn tại trong hệ thống'},409);
    const accentMap={green:'#138a4b',orange:'#e87817',purple:'#7653d6',red:'#d74646',blue:'#1463ff'};
    const accent=accentMap[String(templateRow?.accent||'blue')]||'#1463ff';
    const exactTemplateKey=String(templateRow?.template_key||requestedTemplateKey||promoteTrial?.template_key||'').trim();
    let siteId=promoteSiteId;
    if(siteId){
      await env.DB.prepare(`UPDATE sites SET name=?,domain=?,preset=?,template_key=?,accent=?,phone=?,zalo=?,facebook=?,email=?,status='active' WHERE id=?`)
        .bind(name,domain,themeKey,exactTemplateKey,accent,publicPhone,publicZalo,publicFacebook,publicEmail,siteId).run();
      // Keep the password the customer created during Trial activation; only sync login email.
      await env.DB.prepare(`UPDATE users SET email=? WHERE site_id=? AND role='admin'`).bind(adminEmail,siteId).run();
    }else{
      const siteRun=await env.DB.prepare(`INSERT INTO sites(name,domain,preset,template_key,accent,phone,zalo,facebook,email,status) VALUES(?,?,?,?,?,?,?,?,?,'active')`)
        .bind(name,domain,themeKey,exactTemplateKey,accent,publicPhone,publicZalo,publicFacebook,publicEmail).run();
      siteId=Number(siteRun.meta.last_row_id);
      const placeholder=await sha256(activationToken());
      await env.DB.prepare(`INSERT INTO users(site_id,email,password_hash,role) VALUES(?,?,?,'admin')`).bind(siteId,adminEmail,placeholder).run();
    }
    const orderCode=await nextOrderCode(env);
    await env.DB.prepare(`INSERT INTO customer_profiles(site_id,full_name,phone,email,company,order_code,internal_note,updated_at) VALUES(?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET full_name=excluded.full_name,phone=excluded.phone,email=excluded.email,company=excluded.company,order_code=excluded.order_code,internal_note=excluded.internal_note,updated_at=CURRENT_TIMESTAMP`)
      .bind(siteId,String(b.customer_name||'').trim(),String(b.customer_phone||'').trim(),adminEmail,String(b.company||'').trim(),orderCode,String(b.internal_note||'').trim()).run();
    await ensureSitePublicSettings(env);
    await env.DB.prepare(`INSERT INTO site_public_settings(site_id,contact_email,updated_at) VALUES(?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET contact_email=excluded.contact_email,updated_at=CURRENT_TIMESTAMP`).bind(siteId,publicEmail).run();
    const termMonths=Math.max(1,Math.min(60,Number(b.term_months||12)));
    const listPrice=Math.max(0,Number(b.list_price||1999000)),firstDiscount=Math.max(0,Number(b.first_discount||0)),firstPrice=Math.max(0,Number(b.first_price??(listPrice-firstDiscount))),renewalPrice=Math.max(0,Number(b.renewal_price||listPrice));
    const startedAt=isoDate(new Date()),serviceExpires=addMonthsISO(startedAt,termMonths);
    try{await env.DB.prepare(`ALTER TABLE service_subscriptions ADD COLUMN paid_amount INTEGER NOT NULL DEFAULT 0`).run()}catch(e){}
    const paymentStatus=String(b.payment_status||'unpaid');
    const salePrice=Number(b.sale_price||0);
    const paidAmount=paymentStatus==='paid'?salePrice:paymentStatus==='partial'?Math.max(0,Math.min(salePrice,Number(b.paid_amount||0))):0;
    await env.DB.prepare(`INSERT INTO service_subscriptions(site_id,plan_name,sale_price,internal_cost,payment_status,paid_amount,service_status,started_at,expires_at,domain_status,registrar,note,finance_excluded,updated_at)
      VALUES(?,?,?,?,?,?,'setup',?,?,?,'Cloudflare',?,0,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET plan_name=excluded.plan_name,sale_price=excluded.sale_price,internal_cost=excluded.internal_cost,payment_status=excluded.payment_status,paid_amount=excluded.paid_amount,service_status='setup',started_at=excluded.started_at,expires_at=excluded.expires_at,domain_status=excluded.domain_status,registrar='Cloudflare',note=excluded.note,finance_excluded=0,updated_at=CURRENT_TIMESTAMP`)
      .bind(siteId,String(b.plan_name||'Gói website trọn gói').trim(),salePrice,Number(b.internal_cost||0),paymentStatus,paidAmount,startedAt,serviceExpires,String(b.domain_status||'not_configured'),String(b.service_note||'').trim()).run();
    await env.DB.prepare(`INSERT INTO service_promotions(site_id,term_months,bonus_months,promotion_name,list_price,first_discount,first_price,renewal_price) VALUES(?,?,0,?,?,?,?,?)
      ON CONFLICT(site_id) DO UPDATE SET term_months=excluded.term_months,bonus_months=0,promotion_name=excluded.promotion_name,list_price=excluded.list_price,first_discount=excluded.first_discount,first_price=excluded.first_price,renewal_price=excluded.renewal_price,updated_at=CURRENT_TIMESTAMP`)
      .bind(siteId,termMonths,String(b.promotion_name||'Ưu đãi kích hoạt lần đầu').trim(),listPrice,firstDiscount,firstPrice,renewalPrice).run();
    // Activation links are intentionally NOT created at website creation time.
    // They are available only after the custom domain + SSL is active on Cloudflare Pages.
    if(leadId){
      await ensureSalesLeads(env);
      await env.DB.prepare(`UPDATE sales_leads SET status='won',converted_site_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(siteId,leadId).run();
      try{await env.DB.prepare(`UPDATE website_trials SET status='converted',converted_site_id=?,updated_at=CURRENT_TIMESTAMP WHERE lead_id=?`).bind(siteId,leadId).run()}catch(e){}
    }
    // V14.6: Website mới luôn được bàn giao ở trạng thái sạch, KHÔNG tự tạo bài mẫu.
    // Bộ bài mẫu vẫn thuộc Template Manager và chỉ Master cài theo từng khách sau khi Admin Client đã kích hoạt.
    return json({ok:true,site_id:siteId,order_code:orderCode,activation_ready:false,already_activated:!!promoteSiteId,trial_promoted:!!promoteSiteId,lead_id:leadId||null,sample_result:null});
  }
  if(route==='master/regenerate-activation'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    const site=await env.DB.prepare(`SELECT s.id,s.domain,ss.domain_status FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id WHERE s.id=?`).bind(siteId).first();
    if(!site)return json({error:'Website không tồn tại'},404);
    const handover=await env.DB.prepare(`SELECT activated_at FROM customer_profiles WHERE site_id=?`).bind(siteId).first();
    if(handover?.activated_at)return json({error:'Website đã bàn giao cho khách. Không thể tạo lại link kích hoạt.',code:'ALREADY_HANDED_OVER'},409);
    if(site.domain_status!=='active')return json({error:'Chưa thể tạo link kích hoạt: Domain + SSL chưa hoạt động.',code:'DOMAIN_NOT_READY'},409);
    // Re-check Cloudflare Pages at the moment Master creates the handover link.
    const pages=await getPagesDomainStatus(env,site.domain);
    if(pages.status!=='active'){
      await env.DB.prepare(`UPDATE service_subscriptions SET domain_status='pending',service_status='setup',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId).run();
      return json({error:'Chưa thể tạo link kích hoạt: Cloudflare Pages/SSL chưa Active.',code:'DOMAIN_NOT_READY',pages_status:pages.status,detail:pages.error||''},409);
    }
    await env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(siteId).run();
    const raw=activationToken(),hash=await sha256(raw);
    await env.DB.prepare(`INSERT INTO site_activation_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+14 days'))`).bind(siteId,hash).run();
    return json({ok:true,activation_token:raw,activation_path:`/activate/?token=${raw}`});
  }

  if(route==='master/send-activation-email'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    const row=await env.DB.prepare(`SELECT s.id,s.name,s.domain,ss.domain_status,cp.full_name customer_name,coalesce(cp.email,u.email) customer_email,cp.activated_at
      FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN users u ON u.site_id=s.id AND u.role='admin' WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
    if(!row)return json({error:'Website không tồn tại'},404);
    const email=String(row.customer_email||'').trim().toLowerCase();
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Email khách hàng chưa hợp lệ. Hãy cập nhật đúng email trước khi gửi kích hoạt.'},409);
    if(row.activated_at)return json({error:'Website đã được khách kích hoạt'},409);
    if(row.domain_status!=='active')return json({error:'Chỉ gửi link khi Domain + SSL đã Active'},409);
    const pages=await getPagesDomainStatus(env,row.domain);
    if(pages.status!=='active')return json({error:'Cloudflare Pages/SSL chưa Active. Chưa gửi link kích hoạt.'},409);
    await env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(siteId).run();
    const raw=activationToken(),hash=await sha256(raw);
    await env.DB.prepare(`INSERT INTO site_activation_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+14 days'))`).bind(siteId,hash).run();
    const base=String(env.PUBLIC_APP_URL||'https://hoangvuongtech.com').replace(/\/$/,'');
    const activationUrl=`${base}/activate/?token=${encodeURIComponent(raw)}`;
    const html=`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.6;color:#172033"><h2>Website của bạn đã sẵn sàng</h2><p>Xin chào <b>${htmlEsc(row.customer_name||'Quý khách')}</b>,</p><p>HoangVuongTech đã hoàn tất setup website <b>${htmlEsc(row.name)}</b>.</p><p>Domain: <b>${htmlEsc(row.domain)}</b><br>DNS: ✓ Có bản ghi · Pages: active · Xác thực: active · SSL: active</p><p><a href="${htmlEsc(activationUrl)}" style="display:inline-block;background:#1769ff;color:#fff;padding:13px 20px;border-radius:9px;text-decoration:none;font-weight:700">Kích hoạt website</a></p><p>Link có hiệu lực trong 14 ngày. Tại bước kích hoạt, bạn sẽ xác nhận email và tự đặt mật khẩu Trang quản trị.</p></div>`;
    const sent=await sendMail(env,{to:email,subject:`HoangVuongTech: Link kích hoạt website ${row.name}`,html});
    if(!sent.ok){await env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE token_hash=?`).bind(hash).run();return json({error:sent.error||'Không gửi được email kích hoạt'},500)}
    return json({ok:true,email,activation_url:activationUrl});
  }

  if(route==='master/reset-handover'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website cần reset bàn giao'},400);
    const site=await env.DB.prepare(`SELECT s.id,s.domain,cp.activated_at,ss.domain_status
      FROM sites s LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id WHERE s.id=?`).bind(siteId).first();
    if(!site)return json({error:'Website không tồn tại'},404);
    if(!site.activated_at)return json({error:'Website này chưa được bàn giao nên không cần reset.',code:'NOT_HANDED_OVER'},409);

    // Master-only recovery/test action. Keep the customer's site/domain/content intact,
    // but revoke every active login/handover token and return onboarding to pre-handover state.
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM sessions WHERE site_id=?`).bind(siteId),
      env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(siteId),
      env.DB.prepare(`UPDATE handover_login_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(siteId),
      env.DB.prepare(`UPDATE customer_profiles SET activated_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId),
      env.DB.prepare(`UPDATE service_subscriptions SET service_status=CASE WHEN domain_status='active' THEN 'ready' ELSE 'setup' END,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId)
    ]);
    return json({ok:true,site_id:siteId,domain:site.domain,domain_status:site.domain_status||'not_configured',activation_ready:site.domain_status==='active'});
  }
  if(route==='master/send-password-reset'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    const row=await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.id user_id,u.email
      FROM sites s JOIN users u ON u.site_id=s.id AND u.role='admin'
      WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
    if(!row)return json({error:'Không tìm thấy tài khoản Admin khách hàng'},404);
    const sent=await issuePasswordReset(env,{
      site:{id:row.id,name:row.name,domain:row.domain},
      user:{id:row.user_id,email:row.email},
      origin:`https://${row.domain}`
    });
    if(!sent.ok)return json({error:sent.error||'Không gửi được email đặt lại mật khẩu'},500);
    return json({ok:true,email:sent.email});
  }
  if(route==='master/customer'&&request.method==='GET'){
    const siteId=Number(u.searchParams.get('site_id'));
    await ensureServiceDocuments(env);
    await ensureCustomerTables(env);
    await syncCompletedRenewalExpiry(env,siteId);
    await ensureSiteTemplateIdentity(env);
    const row=await env.DB.prepare(`SELECT s.id,s.name,s.domain,s.status,s.preset,s.template_key,s.accent,s.created_at,
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
    if(!row)return json({error:'Không tìm thấy website'},404);
    return json({customer:row});
  }
  if(route==='master/set-theme'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    await ensureSiteTemplateIdentity(env);
    const templateKey=String(b.template_key||'').trim();
    const requestedPreset=String(b.theme_key||'').trim();
    let tpl=templateKey?await env.DB.prepare(`SELECT template_key,name,preset,accent FROM template_catalog WHERE template_key=? LIMIT 1`).bind(templateKey).first():null;
    if(!tpl&&requestedPreset)tpl=await env.DB.prepare(`SELECT template_key,name,preset,accent FROM template_catalog WHERE preset=? ORDER BY is_active DESC,sort_order LIMIT 1`).bind(requestedPreset).first();
    if(!tpl)return json({error:'Mẫu giao diện không tồn tại trong Template Manager'},400);
    const exists=await env.DB.prepare(`SELECT id FROM sites WHERE id=?`).bind(siteId).first();
    if(!exists)return json({error:'Website không tồn tại'},404);
    const accentMap={green:'#138a4b',orange:'#e87817',purple:'#7653d6',red:'#d74646',blue:'#1463ff'};
    const accent=accentMap[String(tpl.accent||'blue')]||'#1463ff';
    await env.DB.prepare(`UPDATE sites SET preset=?,template_key=?,accent=? WHERE id=?`).bind(tpl.preset,tpl.template_key,accent,siteId).run();
    return json({ok:true,template_key:tpl.template_key,theme_key:tpl.preset,template_name:tpl.name});
  }
  if(route==='master/update-service'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    await ensureCustomerTables(env);
    const paymentStatus=String(b.payment_status||'unpaid');
    const salePrice=Math.max(0,Number(b.sale_price||0));
    const paidAmount=paymentStatus==='paid'?salePrice:paymentStatus==='partial'?Math.max(0,Math.min(salePrice,Number(b.paid_amount||0))):0;
    await env.DB.prepare(`INSERT INTO service_subscriptions(site_id,plan_name,sale_price,internal_cost,payment_status,paid_amount,service_status,started_at,expires_at,domain_status,domain_registered_at,domain_expires_at,auto_renew,registrar,note,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET plan_name=excluded.plan_name,sale_price=excluded.sale_price,internal_cost=excluded.internal_cost,
      payment_status=excluded.payment_status,paid_amount=excluded.paid_amount,service_status=excluded.service_status,started_at=excluded.started_at,expires_at=excluded.expires_at,
      domain_status=excluded.domain_status,domain_registered_at=excluded.domain_registered_at,domain_expires_at=excluded.domain_expires_at,
      auto_renew=excluded.auto_renew,registrar=excluded.registrar,note=excluded.note,updated_at=CURRENT_TIMESTAMP`)
      .bind(siteId,String(b.plan_name||'Gói website trọn gói'),salePrice,Number(b.internal_cost||0),
      paymentStatus,paidAmount,String(b.service_status||'setup'),b.started_at||null,b.expires_at||null,
      String(b.domain_status||'not_configured'),b.domain_registered_at||null,b.domain_expires_at||null,0,
      String(b.registrar||'Cloudflare'),String(b.note||'')).run();
    const termMonths=Math.max(1,Math.min(60,Number(b.term_months||12))),listPrice=Math.max(0,Number(b.list_price||1999000)),firstDiscount=Math.max(0,Number(b.first_discount||0)),firstPrice=Math.max(0,Number(b.first_price??(listPrice-firstDiscount))),renewalPrice=Math.max(0,Number(b.renewal_price||listPrice));
    await env.DB.prepare(`INSERT INTO service_promotions(site_id,term_months,bonus_months,promotion_name,list_price,first_discount,first_price,renewal_price,updated_at) VALUES(?,?,0,?,?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET term_months=excluded.term_months,bonus_months=0,promotion_name=excluded.promotion_name,list_price=excluded.list_price,first_discount=excluded.first_discount,first_price=excluded.first_price,renewal_price=excluded.renewal_price,updated_at=CURRENT_TIMESTAMP`)
      .bind(siteId,termMonths,String(b.promotion_name||''),listPrice,firstDiscount,firstPrice,renewalPrice).run();
    if(paymentStatus==='paid') await syncFinancialLedger(env);
    return json({ok:true});
  }
  if(route==='master/domain-config'&&request.method==='GET'){
    return json({configured:cfRegistrarConfigured(env)});
  }
  if(route==='master/domain-search'&&request.method==='GET'){
    const q=String(u.searchParams.get('q')||'').trim();
    if(!q)return json({error:'Nhập từ khóa hoặc tên miền cần tìm'},400);
    if(!cfRegistrarConfigured(env))return json({configured:false,results:[]});
    const data=await cfRegistrar(env,`domain-search?q=${encodeURIComponent(q)}&limit=12`,{method:'GET'});
    return json({configured:true,results:Array.isArray(data)?data:(data?.domains||data?.result||[])});
  }
  if(route==='master/domain-check'&&request.method==='POST'){
    const b=await body(request),domain=normalizeDomain(b.domain||'');
    if(!domain)return json({error:'Thiếu tên miền'},400);
    if(!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain))
      return json({error:'Tên miền không hợp lệ'},400);

    // Resolve the authoritative registry RDAP endpoint from IANA's bootstrap file.
    // This avoids the public rdap.org proxy, which can return 403 to shared Worker IPs.
    const tld=domain.split('.').pop().toLowerCase();
    let base='';
    try{
      const boot=await fetch('https://data.iana.org/rdap/dns.json',{headers:{'Accept':'application/json'}});
      if(boot.ok){
        const data=await boot.json();
        for(const service of (data.services||[])){
          const tlds=service?.[0]||[],urls=service?.[1]||[];
          if(tlds.map(x=>String(x).toLowerCase()).includes(tld) && urls.length){base=String(urls[0]);break;}
        }
      }
    }catch{}
    // Stable direct fallbacks for the most common extensions.
    if(!base){
      const known={com:'https://rdap.verisign.com/com/v1/',net:'https://rdap.verisign.com/net/v1/',org:'https://rdap.publicinterestregistry.org/rdap/'};
      base=known[tld]||'';
    }
    if(!base)return json({error:`Chưa hỗ trợ kiểm tra đuôi .${tld}`},422);
    if(!base.endsWith('/'))base+='/';
    const r=await fetch(`${base}domain/${encodeURIComponent(domain)}`,{
      method:'GET',headers:{'Accept':'application/rdap+json, application/json','User-Agent':'NEWSREAL-Domain-Check/1.0'}
    });
    if(r.status===404)return json({domain,registrable:true,reason:'available',source:'registry-rdap'});
    if(r.ok)return json({domain,registrable:false,reason:'domain_unavailable',source:'registry-rdap'});
    if(r.status===429)return json({error:'Hệ thống kiểm tra tên miền đang giới hạn tần suất. Vui lòng thử lại sau vài giây.'},503);
    return json({error:`Không kiểm tra được tên miền lúc này (Registry RDAP ${r.status})`},502);
  }
  if(route==='master/domain-purchase'&&request.method==='POST'){
    const b=await body(request);
    const siteId=Number(b.site_id),domain=normalizeDomain(b.domain||''),confirmDomain=normalizeDomain(b.confirm_domain||'');
    if(!siteId||!domain)return json({error:'Thiếu website hoặc tên miền'},400);
    if(!cfRegistrarConfigured(env))return json({error:'Cloudflare Registrar API chưa được cấu hình'},503);
    if(!b.confirm_purchase || confirmDomain!==domain)return json({error:'Bạn phải xác nhận chính xác tên miền trước khi đăng ký'},400);
    const site=await env.DB.prepare(`SELECT id,name,domain FROM sites WHERE id=?`).bind(siteId).first();
    if(!site)return json({error:'Website không tồn tại'},404);

    // Authoritative re-check immediately before the billable operation.
    const checked=await cfRegistrar(env,'domain-check',{method:'POST',body:JSON.stringify({domains:[domain]})});
    const rows=checked?.domains||[];
    const d=rows.find(v=>normalizeDomain(v.name||v.domain_name||'')===domain)||rows[0]||{};
    if(!d.registrable)return json({error:`Tên miền không còn khả dụng: ${d.reason||'domain_unavailable'}`,domain,check:d},409);
    if(String(d.tier||'').toLowerCase()==='premium')return json({error:'Tên miền premium chưa được Cloudflare Registrar API hỗ trợ đăng ký tự động'},409);

    const pricing=d.pricing||{};
    const registrationCost=Number(pricing.registration_cost??pricing.registration??pricing.price??0);
    const currency=String(pricing.currency||'USD');
    const expected=Number(b.expected_registration_cost||0);
    if(expected>0 && registrationCost>0 && Math.abs(expected-registrationCost)>0.0001){
      return json({error:'Giá tên miền đã thay đổi. Vui lòng kiểm tra lại trước khi mua.',price_changed:true,
        domain,registration_cost:registrationCost,currency,pricing},409);
    }

    const payload={domain_name:domain,auto_renew:false};
    // Uses the account default registrant contact. Do not send customer PII to Registrar here.
    const reg=await cfRegistrar(env,'registrations',{
      method:'POST',
      body:JSON.stringify(payload)
    });

    const contextReg=reg?.context?.registration||reg?.registration||{};
    const state=reg?.state||contextReg?.status||'registration_pending';
    const completed=reg?.completed===true || state==='succeeded' || contextReg?.status==='active';
    const createdAt=contextReg?.created_at||reg?.created_at||new Date().toISOString();
    const expiresAt=contextReg?.expires_at||reg?.expires_at||null;
    const domainStatus=completed?'active':'pending';

    await env.DB.batch([
      env.DB.prepare(`UPDATE sites SET domain=? WHERE id=?`).bind(domain,siteId),
      env.DB.prepare(`INSERT INTO service_subscriptions(site_id,domain_status,domain_registered_at,domain_expires_at,auto_renew,registrar,updated_at)
        VALUES(?,?,?,?,?,'Cloudflare',CURRENT_TIMESTAMP)
        ON CONFLICT(site_id) DO UPDATE SET domain_status=excluded.domain_status,domain_registered_at=excluded.domain_registered_at,
        domain_expires_at=excluded.domain_expires_at,auto_renew=excluded.auto_renew,registrar='Cloudflare',updated_at=CURRENT_TIMESTAMP`)
        .bind(siteId,domainStatus,createdAt,expiresAt,b.auto_renew?1:0)
    ]);

    return json({
      ok:true,domain,state,completed,domain_status:domainStatus,
      registration_cost:registrationCost,currency,pricing,
      created_at:createdAt,expires_at:expiresAt,auto_renew:!!b.auto_renew,
      status_url:reg?.links?.self||'',resource_url:reg?.links?.resource||''
    }, completed?201:202);
  }
  if(route==='master/domain-registration-status'&&request.method==='GET'){
    const domain=normalizeDomain(u.searchParams.get('domain')||''),siteId=Number(u.searchParams.get('site_id')||0);
    if(!domain)return json({error:'Thiếu tên miền'},400);
    if(!cfRegistrarConfigured(env))return json({error:'Cloudflare Registrar API chưa được cấu hình'},503);
    const status=await cfRegistrar(env,`registrations/${encodeURIComponent(domain)}/registration-status`,{method:'GET'});
    const contextReg=status?.context?.registration||status?.registration||{};
    const state=status?.state||contextReg?.status||'unknown';
    const completed=status?.completed===true || state==='succeeded' || contextReg?.status==='active';
    if(siteId){
      await env.DB.prepare(`UPDATE service_subscriptions SET domain_status=?,domain_registered_at=coalesce(?,domain_registered_at),
        domain_expires_at=coalesce(?,domain_expires_at),updated_at=CURRENT_TIMESTAMP WHERE site_id=?`)
        .bind(completed?'active':'pending',contextReg?.created_at||status?.created_at||null,contextReg?.expires_at||null,siteId).run();
    }
    return json({ok:true,domain,state,completed,status});
  }
  if(route==='master/domain-complete'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id),domain=normalizeDomain(b.domain||'');
    if(!siteId||!domain)return json({error:'Thiếu website hoặc tên miền'},400);
    const site=await env.DB.prepare(`SELECT * FROM sites WHERE id=?`).bind(siteId).first();
    if(!site)return json({error:'Website không tồn tại'},404);
    const duplicate=await env.DB.prepare(`SELECT id,name FROM sites WHERE lower(domain)=lower(?) AND id<>?`).bind(domain,siteId).first();
    if(duplicate)return json({error:`Domain ${domain} đang được gắn với website khác trong NEWSREAL`},409);
    const previousDomain=String(site.domain||'');

    const info=await registryDomainInfo(domain);
    if(!info.ok||info.available)return json({error:info.available?'Registry chưa thấy domain đã đăng ký. Đợi vài phút rồi thử lại.':(info.error||'Không đọc được domain')},409);

    const costs={'.com':280000,'.net':320000,'.org':300000,'.info':520000,'.xyz':350000};
    const cost=costs['.'+domain.split('.').pop()]||0;
    const registered=(info.registered_at||new Date().toISOString()).slice(0,10);
    const expires=info.expires_at?String(info.expires_at).slice(0,10):null;
    const registrar=info.registrar||'Cloudflare';

    // Attach the purchased domain to the shared Pages project. SSL is provisioned by Cloudflare Pages.
    const pages=await attachPagesDomain(env,domain);
    const pageStatus=pages.status==='active'?'active':pages.status==='error'?'error':'pending';

    // Do not create a handover link here. Domain purchase/attachment can still be pending DNS/SSL.
    // Master can create the link only after Cloudflare Pages reports Active.

    await env.DB.batch([
      env.DB.prepare(`UPDATE sites SET domain=? WHERE id=?`).bind(domain,siteId),
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
        updated_at=CURRENT_TIMESTAMP`)
        .bind(siteId,cost,pageStatus,registered,expires,registrar)
    ]);

    const origin=new URL(request.url).origin;
    return json({
      ok:true,domain,registered_at:registered,expires_at:expires,registrar,internal_cost:cost,cost_source:'tld_estimate',
      pages_configured:pages.configured,pages_status:pageStatus,pages_error:pages.error||'',
      activation_url:null,
      activation_ready:pageStatus==='active',
      previous_domain:previousDomain,
      domain_changed:previousDomain.toLowerCase()!==domain.toLowerCase()
    });
  }

  if(route==='master/domain-provision-status'&&request.method==='GET'){
    const siteId=Number(u.searchParams.get('site_id')||0),domain=normalizeDomain(u.searchParams.get('domain')||'');
    if(!siteId||!domain)return json({error:'Thiếu website hoặc domain'},400);
    let diag=await diagnoseDomain(env,domain);
    let dns_action=null;
    if(!diag.dns?.ok && ['initializing','pending'].includes(String(diag.pages_status||'').toLowerCase())){
      dns_action=await ensurePagesDns(env,domain);
      if(dns_action.ok){
        // DNS propagation is asynchronous; report action immediately and next poll will verify resolution.
        diag.dns_action=dns_action;
      }else{
        diag.dns_action=dns_action;
      }
    }
    const active=diag.pages_status==='active';
    await env.DB.prepare(`UPDATE service_subscriptions SET domain_status=?,service_status=CASE WHEN ? THEN 'ready' ELSE service_status END,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`)
      .bind(active?'active':diag.pages_status==='error'?'error':'pending',active?1:0,siteId).run();
    return json({ok:true,active,...diag,dns_action,error:diag.pages_error||''});
  }

  if(route==='master/domain-mark-purchased'&&request.method==='POST'){
    const b=await body(request);
    const siteId=Number(b.site_id),domain=normalizeDomain(b.domain||'');
    if(!siteId||!domain)return json({error:'Thiếu website hoặc tên miền'},400);
    const site=await env.DB.prepare(`SELECT id FROM sites WHERE id=?`).bind(siteId).first();
    if(!site)return json({error:'Website không tồn tại'},404);

    const registrar=String(b.registrar||'Cloudflare').trim()||'Cloudflare';
    const cost=Number(b.internal_cost||0);
    const registeredAt=String(b.domain_registered_at||'').trim()||new Date().toISOString().slice(0,10);
    const expiresAt=String(b.domain_expires_at||'').trim()||null;
    const autoRenew=0;

    await env.DB.batch([
      env.DB.prepare(`UPDATE sites SET domain=? WHERE id=?`).bind(domain,siteId),
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
        updated_at=CURRENT_TIMESTAMP`)
        .bind(siteId,cost,registeredAt,expiresAt,autoRenew,registrar)
    ]);
    return json({ok:true,domain,domain_status:'active',registrar,internal_cost:cost,domain_registered_at:registeredAt,domain_expires_at:expiresAt,auto_renew:!!autoRenew});
  }
  if(route==='master/domain-save'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id),domain=normalizeDomain(b.domain||'');
    if(!siteId||!domain)return json({error:'Thiếu website hoặc tên miền'},400);
    if(!await env.DB.prepare(`SELECT id FROM sites WHERE id=?`).bind(siteId).first())return json({error:'Website không tồn tại'},404);
    await env.DB.prepare(`UPDATE sites SET domain=? WHERE id=?`).bind(domain,siteId).run();
    await env.DB.prepare(`INSERT INTO service_subscriptions(site_id,domain_status,registrar,updated_at)
      VALUES(?,?,'Cloudflare',CURRENT_TIMESTAMP)
      ON CONFLICT(site_id) DO UPDATE SET domain_status=excluded.domain_status,registrar='Cloudflare',updated_at=CURRENT_TIMESTAMP`)
      .bind(siteId,String(b.domain_status||'not_configured')).run();
    return json({ok:true,domain});
  }
  if(route==='master/send-renewal-reminder'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    const row=await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,ss.expires_at,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_price,1999000) renewal_price
      FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin' LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
    if(!row)return json({error:'Website không tồn tại'},404);
    if(!row.expires_at)return json({error:'Chưa có ngày hết hạn dịch vụ'},400);
    const sent=await renewalEmailForSite(env,row,new URL(request.url).origin,'manual');
    if(!sent.ok)return json({error:sent.error||'Không gửi được email',configured:sent.configured??false},sent.configured===false?503:502);
    return json({ok:true,email:sent.email,days:sent.days});
  }
  if(route==='master/send-renewal-payment'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    const row=await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,cp.order_code,ss.plan_name,ss.expires_at,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_price,1999000) renewal_price,coalesce(sp.renewal_status,'none') renewal_status,coalesce(sp.renewal_stage,'none') renewal_stage
      FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin' LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
    if(!row)return json({error:'Website không tồn tại'},404);
    const sent=await renewalPaymentEmail(env,row);
    if(!sent.ok)return json({error:sent.error||'Không gửi được email',configured:sent.configured??false},sent.configured===false?503:400);
    return json({ok:true,email:sent.email,memo:sent.memo,amount:sent.amount});
  }
  // TEST/RECOVERY ONLY: reopen the most recently completed renewal cycle.
  // This rolls the service expiry back to the latest renewal_history.old_expires_at,
  // removes that single history row and returns the workflow to PAID so the domain guard can be retested.
  if(route==='master/reset-renewal-test'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    const row=await env.DB.prepare(`SELECT s.id,s.name,ss.expires_at,ss.domain_expires_at,
      coalesce(sp.renewal_status,'none') renewal_status,coalesce(sp.renewal_stage,'none') renewal_stage,
      sp.renewal_paid_at,sp.renewal_completed_at
      FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
      LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=?`).bind(siteId).first();
    if(!row)return json({error:'Website không tồn tại'},404);
    if(String(row.renewal_stage||'none')!=='renewed')return json({error:'Chỉ reset được chu kỳ đã hoàn tất'},409);
    const hist=await env.DB.prepare(`SELECT id,old_expires_at,new_expires_at FROM renewal_history WHERE site_id=? ORDER BY id DESC LIMIT 1`).bind(siteId).first();
    if(!hist)return json({error:'Không tìm thấy lịch sử gia hạn để hoàn tác an toàn'},409);
    const current=String(row.expires_at||'').slice(0,10),histNew=String(hist.new_expires_at||'').slice(0,10),histOld=String(hist.old_expires_at||'').slice(0,10);
    if(!histOld||!histNew||current!==histNew)return json({error:'Ngày hết hạn hiện tại không khớp lịch sử gia hạn gần nhất. Không tự động reset để tránh sai dữ liệu.'},409);
    await env.DB.batch([
      env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(histOld,siteId),
      env.DB.prepare(`UPDATE service_promotions SET renewal_status='yes',renewal_stage='paid',renewal_completed_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(siteId),
      env.DB.prepare(`DELETE FROM renewal_history WHERE id=? AND site_id=?`).bind(hist.id,siteId),
      env.DB.prepare(`UPDATE financial_transactions SET status='void',note='Reset chu kỳ test',updated_at=CURRENT_TIMESTAMP WHERE unique_key=?`).bind(`renewal:${siteId}:${histOld}`)
    ]);
    return json({ok:true,stage:'paid',old_current_expiry:current,restored_expiry:histOld,domain_expires_at:String(row.domain_expires_at||'').slice(0,10)});
  }
  if(route==='master/check-renewal-domain'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    const row=await env.DB.prepare(`SELECT s.id,s.domain,ss.expires_at,ss.domain_expires_at,
      coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_selected_months,sp.term_months,12) renewal_selected_months
      FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id WHERE s.id=?`).bind(siteId).first();
    if(!row)return json({error:'Website không tồn tại'},404);
    const domain=normalizeDomain(row.domain||''); if(!domain)return json({error:'Website chưa có domain'},400);
    const info=await registryDomainInfo(domain);
    if(!info.ok||info.available)return json({error:info.error||'Registry chưa trả về thông tin domain'},502);
    const registryExpiry=info.expires_at?String(info.expires_at).slice(0,10):'';
    if(!registryExpiry)return json({error:'Registry chưa trả về ngày hết hạn domain'},502);
    await env.DB.prepare(`UPDATE service_subscriptions SET domain_expires_at=?,domain_status='active',registrar=coalesce(?,registrar),updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(registryExpiry,info.registrar||null,siteId).run();
    const serviceExpiry=String(row.expires_at||'').slice(0,10),minTerm=Math.max(1,Number(row.renewal_selected_months||row.term_months||12));
    const requiredExpiry=serviceExpiry?addMonthsISO(serviceExpiry,minTerm):'';
    const renewalYears=serviceExpiry?renewalYearsCovered(serviceExpiry,registryExpiry):0;
    const renewalMonths=renewalYears*12;
    const ready=renewalMonths>=minTerm;
    return json({
      ok:true,domain,domain_expires_at:registryExpiry,
      previous_domain_expires_at:String(row.domain_expires_at||'').slice(0,10),
      required_expiry:requiredExpiry,ready,
      renewal_years:renewalYears,renewal_months:renewalMonths,
      service_expiry_after_renewal:ready?registryExpiry:'',
      registrar:info.registrar||'Cloudflare',
      cloudflare_url:'https://dash.cloudflare.com/?to=/:account/domains/registrations'
    });
  }
  if(route==='master/repair-renewal-cycle'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website'},400);
    const row=await env.DB.prepare(`SELECT s.id,s.name,s.domain,u.email admin_email,cp.full_name customer_name,cp.email customer_email,cp.order_code,
      ss.expires_at,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_price,1999000) renewal_price,
      coalesce(sp.renewal_stage,'none') renewal_stage,sp.renewal_paid_at,sp.renewal_completed_at,
      (SELECT count(*) FROM renewal_history rh WHERE rh.site_id=s.id) renewal_history_count
      FROM sites s LEFT JOIN users u ON u.site_id=s.id AND u.role='admin'
      LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
      LEFT JOIN service_promotions sp ON sp.site_id=s.id
      WHERE s.id=? ORDER BY u.id LIMIT 1`).bind(siteId).first();
    if(!row)return json({error:'Website không tồn tại'},404);
    if(String(row.renewal_stage||'none')!=='renewed')return json({error:'Chỉ dùng sửa chu kỳ cho dữ liệu đã được đánh dấu gia hạn'},409);
    if(!row.expires_at)return json({error:'Chưa có ngày hết hạn dịch vụ'},400);
    const oldExpiry=String(row.expires_at).slice(0,10);
    const hist=await env.DB.prepare(`SELECT old_expires_at,new_expires_at,term_months,amount FROM renewal_history WHERE site_id=? ORDER BY id DESC LIMIT 1`).bind(siteId).first();
    // If history already contains the completed cycle, do NOT add another year.
    // Restore exactly the expiry recorded by that completed cycle.
    if(hist?.new_expires_at){
      const target=String(hist.new_expires_at).slice(0,10);
      if(target<=oldExpiry)return json({ok:true,repaired:false,old_expiry:oldExpiry,new_expiry:oldExpiry,message:'Thời hạn dịch vụ đã đồng bộ'});
      await env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(target,siteId).run();
      return json({ok:true,repaired:true,from_history:true,old_expiry:oldExpiry,new_expiry:target,term_months:Number(hist.term_months||row.term_months||12)});
    }
    // Legacy completed state without history: add exactly one configured cycle.
    const term=Math.max(1,Number(row.term_months||12));
    const newExpiry=addMonthsISO(oldExpiry,term);
    const amount=Math.max(0,Number(row.renewal_price||0));
    await env.DB.batch([
      env.DB.prepare(`UPDATE service_subscriptions SET expires_at=?,service_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(newExpiry,siteId),
      env.DB.prepare(`INSERT INTO renewal_history(site_id,old_expires_at,new_expires_at,term_months,amount,order_code,paid_at,completed_at)
        VALUES(?,?,?,?,?,?,coalesce(?,CURRENT_TIMESTAMP),coalesce(?,CURRENT_TIMESTAMP))`).bind(siteId,oldExpiry,newExpiry,term,amount,String(row.order_code||''),row.renewal_paid_at||null,row.renewal_completed_at||null)
    ]);
    const mail=await renewalCompletedEmail(env,row,newExpiry);
    return json({ok:true,repaired:true,from_history:false,old_expiry:oldExpiry,new_expiry:newExpiry,term_months:term,email_sent:!!mail.ok,email_error:mail.ok?'':(mail.error||'')});
  }
  if(route==='master/renewal-stage'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id),stage=String(b.stage||'');
    if(!siteId)return json({error:'Thiếu website'},400);
    if(!['requested','payment_sent','paid','renewed'].includes(stage))return json({error:'Trạng thái không hợp lệ'},400);
    if(stage==='renewed'){
      const done=await completeRenewal(env,siteId);
      if(!done.ok)return json({error:done.error},done.status||400);
      return json(done);
    }
    const current=await env.DB.prepare(`SELECT coalesce(renewal_stage,'none') renewal_stage FROM service_promotions WHERE site_id=?`).bind(siteId).first();
    if(String(current?.renewal_stage||'none')==='renewed')return json({error:'Chu kỳ gia hạn đã hoàn tất'},409);
    const sets=[`renewal_stage=?`,`updated_at=CURRENT_TIMESTAMP`],bind=[stage];
    if(stage==='paid')sets.push(`renewal_paid_at=CURRENT_TIMESTAMP`);
    bind.push(siteId);
    await env.DB.prepare(`UPDATE service_promotions SET ${sets.join(',')} WHERE site_id=?`).bind(...bind).run();
    if(stage==='paid'){
      const r=await env.DB.prepare(`SELECT ss.expires_at,ss.internal_cost,coalesce(ss.finance_excluded,0) finance_excluded,coalesce(sp.term_months,12) term_months,coalesce(sp.renewal_price,1999000) renewal_price,coalesce(cp.order_code,'') order_code
        FROM service_subscriptions ss LEFT JOIN service_promotions sp ON sp.site_id=ss.site_id LEFT JOIN customer_profiles cp ON cp.site_id=ss.site_id WHERE ss.site_id=?`).bind(siteId).first();
      const start=String(r?.expires_at||'').slice(0,10),end=start?addMonthsISO(start,Math.max(1,Number(r?.term_months||12))):null;
      if(start && Number(r?.finance_excluded||0)===0) await env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note)
        VALUES(?,'renewal','paid',?,?,?,?,?,?,CURRENT_TIMESTAMP,?,'Ghi nhận khi Master xác nhận đã thanh toán')
        ON CONFLICT(unique_key) DO UPDATE SET status='paid',amount=excluded.amount,cost=excluded.cost,order_code=excluded.order_code,cycle_end=excluded.cycle_end,paid_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP`)
        .bind(siteId,Math.max(0,Number(r?.renewal_price||0)),Math.max(0,Number(r?.internal_cost||0)),String(r?.order_code||''),'Gia hạn dịch vụ',start,end,`renewal:${siteId}:${start}`).run();
    }
    return json({ok:true,stage});
  }
  if(route==='master/expenses'){
    await ensureCustomerTables(env);
    if(request.method==='GET'){
      const {results}=await env.DB.prepare(`SELECT *,CASE category WHEN 'domain' THEN 'Domain' WHEN 'cloudflare' THEN 'Cloudflare / hạ tầng' WHEN 'email' THEN 'Email / Resend' WHEN 'ads' THEN 'Quảng cáo' WHEN 'software' THEN 'Phần mềm / API' ELSE 'Chi phí khác' END category_label FROM operating_expenses ORDER BY expense_date DESC,id DESC LIMIT 500`).all();
      return json({expenses:results||[]});
    }
    if(request.method==='POST'){
      const b=await body(request),title=String(b.title||'').trim(),amount=Math.max(0,Number(b.amount||0)),category=String(b.category||'other'),recurring=['monthly','yearly'].includes(String(b.recurring))?String(b.recurring):'none',expenseDate=String(b.expense_date||new Date().toISOString().slice(0,10)).slice(0,10),note=String(b.note||'').trim();
      if(!title||!amount)return json({error:'Thiếu mô tả hoặc số tiền chi phí'},400);
      const r=await env.DB.prepare(`INSERT INTO operating_expenses(category,title,amount,recurring,expense_date,note) VALUES(?,?,?,?,?,?)`).bind(category,title,amount,recurring,expenseDate,note).run();
      return json({ok:true,id:r.meta.last_row_id});
    }
    if(request.method==='DELETE'){
      const id=Number(u.searchParams.get('id')||0);if(!id)return json({error:'Thiếu chi phí'},400);
      await env.DB.prepare(`DELETE FROM operating_expenses WHERE id=?`).bind(id).run();return json({ok:true});
    }
  }
  if(route==='master/finance'){
    await ensureCustomerTables(env);
    await syncFinancialLedger(env);
    const siteId=Number(u.searchParams.get('site_id')||0);
    const where=siteId?' WHERE ft.site_id=? ':'';
    const q=`SELECT ft.*,s.name site_name,s.domain,cp.full_name customer_name,cp.email customer_email,cp.phone customer_phone FROM financial_transactions ft JOIN sites s ON s.id=ft.site_id LEFT JOIN customer_profiles cp ON cp.site_id=ft.site_id ${where} ORDER BY coalesce(ft.paid_at,ft.created_at) DESC,ft.id DESC LIMIT 300`;
    const tx=siteId?(await env.DB.prepare(q).bind(siteId).all()).results:(await env.DB.prepare(q).all()).results;
    const all=(await env.DB.prepare(`SELECT
      coalesce(sum(CASE WHEN status='paid' THEN amount ELSE 0 END),0) revenue_all,
      coalesce(sum(CASE WHEN status='paid' THEN cost ELSE 0 END),0) cost_all,
      coalesce(sum(CASE WHEN status='paid' AND kind='initial' THEN amount ELSE 0 END),0) initial_revenue,
      coalesce(sum(CASE WHEN status='paid' AND kind='renewal' THEN amount ELSE 0 END),0) renewal_revenue,
      coalesce(sum(CASE WHEN status='paid' AND strftime('%Y',coalesce(paid_at,created_at))=strftime('%Y','now') THEN amount ELSE 0 END),0) revenue_year,
      coalesce(sum(CASE WHEN status='paid' AND strftime('%Y-%m',coalesce(paid_at,created_at))=strftime('%Y-%m','now') THEN amount ELSE 0 END),0) revenue_month
      FROM financial_transactions`).first())||{};
    const pending=(await env.DB.prepare(`SELECT coalesce(sum(CASE WHEN coalesce(ss.finance_excluded,0)=1 THEN 0 WHEN coalesce(sp.renewal_status,'none')='yes' AND coalesce(sp.renewal_stage,'none') IN ('requested','payment_sent','payment_pending') THEN coalesce(sp.renewal_price,0) WHEN ss.payment_status!='paid' THEN coalesce(sp.first_price,ss.sale_price,0) ELSE 0 END),0) amount FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id`).first())?.amount||0;
    const pipeline=(await env.DB.prepare(`SELECT
      sum(CASE WHEN coalesce(sp.renewal_stage,'none')='requested' THEN 1 ELSE 0 END) requested,
      sum(CASE WHEN coalesce(sp.renewal_stage,'none') IN ('payment_sent','payment_pending') THEN 1 ELSE 0 END) payment_sent,
      sum(CASE WHEN coalesce(sp.renewal_stage,'none')='paid' THEN 1 ELSE 0 END) paid_wait_domain,
      sum(CASE WHEN ss.expires_at IS NOT NULL AND date(ss.expires_at)>=date('now') AND date(ss.expires_at)<=date('now','+30 day') THEN 1 ELSE 0 END) expiring_30
      FROM sites s LEFT JOIN service_subscriptions ss ON ss.site_id=s.id LEFT JOIN service_promotions sp ON sp.site_id=s.id`).first())||{};
    const op=(await env.DB.prepare(`SELECT
      coalesce(sum(amount),0) operating_cost_all,
      coalesce(sum(CASE WHEN strftime('%Y',expense_date)=strftime('%Y','now') THEN amount ELSE 0 END),0) operating_cost_year,
      coalesce(sum(CASE WHEN strftime('%Y-%m',expense_date)=strftime('%Y-%m','now') THEN amount ELSE 0 END),0) operating_cost_month
      FROM operating_expenses`).first())||{};
    const totalCosts=Number(all.cost_all||0)+Number(op.operating_cost_all||0);
    return json({summary:{...all,...op,cost_all:totalCosts,transaction_cost_all:Number(all.cost_all||0),profit_all:Number(all.revenue_all||0)-totalCosts,pending:Number(pending||0)},pipeline,transactions:tx||[]});
  }
  if(route==='master/finance-cost'&&request.method==='POST'){
    const b=await body(request),id=Number(b.id),cost=Math.max(0,Number(b.cost||0));
    if(!id)return json({error:'Thiếu giao dịch'},400);
    await env.DB.prepare(`UPDATE financial_transactions SET cost=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(cost,id).run();
    return json({ok:true});
  }
  


if(route==='payment-status'&&request.method==='GET'){
  await ensurePurchasePayments(env);
  const orderCode=String(u.searchParams.get('order_code')||'').trim(),token=String(u.searchParams.get('token')||'').trim();
  if(!orderCode||!token)return json({error:'Thiếu thông tin thanh toán'},400);
  const hash=await sha256(token);
  const row=await env.DB.prepare(`SELECT pp.status,pp.amount,pp.paid_amount,pp.paid_at,pp.order_code
    FROM purchase_payments pp WHERE pp.order_code=? AND pp.token_hash=? LIMIT 1`).bind(orderCode,hash).first();
  if(!row)return json({error:'Không tìm thấy giao dịch'},404);
  return json({ok:true,status:row.status,amount:Number(row.amount||0),paid_amount:Number(row.paid_amount||0),paid_at:row.paid_at||null,order_code:row.order_code});
}


if(route==='payos-webhook'&&request.method==='POST'){
  await ensurePurchasePayments(env);await ensureRenewalPayments(env);
  if(!payosReady(env))return json({error:'payOS chưa cấu hình'},503);
  const b=await body(request);if(!await payosVerifyWebhook(env,b))return json({error:'Invalid payOS signature'},400);
  const d=b.data||{};if(b.success!==true||String(d.code||'00')!=='00')return json({ok:true,ignored:'not_success'});
  const providerOrderCode=Number(d.orderCode||0),amount=Math.max(0,Number(d.amount||0));if(!providerOrderCode)return json({ok:true,ignored:'missing_order_code'});
  const ref=String(d.reference||d.paymentLinkId||'').slice(0,250),transferContent=String(d.description||'').slice(0,1000);
  const rp=await env.DB.prepare(`SELECT rp.*,s.name,s.domain,cp.full_name customer_name,cp.email customer_email FROM renewal_payments rp JOIN sites s ON s.id=rp.site_id LEFT JOIN customer_profiles cp ON cp.site_id=s.id WHERE rp.provider='payos' AND rp.provider_order_code=? LIMIT 1`).bind(providerOrderCode).first();
  if(rp){if(rp.status==='paid')return json({ok:true,duplicate:true,type:'renewal'});if(amount<Number(rp.amount||0))return json({ok:true,ignored:'amount_too_low',type:'renewal'});await env.DB.batch([env.DB.prepare(`UPDATE renewal_payments SET status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,transfer_ref=?,transfer_content=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='paid'`).bind(amount,ref,transferContent,rp.id),env.DB.prepare(`UPDATE service_promotions SET renewal_status='yes',renewal_stage='paid',renewal_paid_at=CURRENT_TIMESTAMP,renewal_selected_months=?,renewal_order_code=?,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(Number(rp.years||1)*12,rp.order_code,rp.site_id),env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note) VALUES(?,'renewal','paid',?,0,?,'Gia hạn dịch vụ đã thanh toán',NULL,NULL,CURRENT_TIMESTAMP,?,'payOS webhook') ON CONFLICT(unique_key) DO UPDATE SET status='paid',amount=excluded.amount,order_code=excluded.order_code,paid_at=CURRENT_TIMESTAMP,note='payOS webhook'`).bind(rp.site_id,Number(rp.amount||0),rp.order_code,`renewal-payment:${rp.id}`)]);try{await notifyMasterRenewalPaid(env,rp,{...rp,amount:Number(rp.amount||0)})}catch(e){console.log('renewal payOS mail:',e?.message||e)}return json({ok:true,status:'paid',type:'renewal'});}
  const pp=await env.DB.prepare(`SELECT pp.*,sl.customer_name,sl.email,sl.phone,sl.site_name,sl.template_name FROM purchase_payments pp JOIN sales_leads sl ON sl.id=pp.lead_id WHERE pp.provider='payos' AND pp.provider_order_code=? LIMIT 1`).bind(providerOrderCode).first();
  if(pp){if(pp.status==='paid')return json({ok:true,duplicate:true,type:'initial'});if(amount<Number(pp.amount||0))return json({ok:true,ignored:'amount_too_low',type:'initial'});await env.DB.batch([env.DB.prepare(`UPDATE purchase_payments SET status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,transfer_ref=?,transfer_content=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='paid'`).bind(amount,ref,transferContent,pp.id),env.DB.prepare(`UPDATE sales_leads SET status='paid',payment_status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(amount,pp.lead_id)]);try{await notifyInitialPayment(env,{lead:pp,orderCode:pp.order_code,amount:Number(pp.amount||0)})}catch(e){console.log('payOS payment notification:',e?.message||e)}return json({ok:true,status:'paid',type:'initial'});}
  return json({ok:true,ignored:'unknown_signed_order'});
}

if((route==='payment-webhook'||route==='vietqr-callback')&&request.method==='POST'){
  await ensurePurchasePayments(env);await ensureRenewalPayments(env);
  const secret=String(env.VIETQR_WEBHOOK_TOKEN||env.PAYMENT_WEBHOOK_SECRET||'').trim();
  if(!secret)return json({error:'VIETQR_WEBHOOK_TOKEN chưa cấu hình'},503);
  if(!paymentWebhookAuthorized(env,request))return json({error:'Webhook không hợp lệ'},401);
  const b=await body(request);
  const amount=Math.max(0,Number(b.amount??b.transferAmount??b.transfer_amount??0));
  const transType=String(b.transType??b.transferType??b.direction??b.type??'C').toUpperCase();
  if(['D','OUT','DEBIT','WITHDRAW'].includes(transType))return json({ok:true,ignored:'outgoing'});
  const content=[b.content,b.description,b.transferContent,b.transfer_content,b.orderId,b.order_code].filter(Boolean).join(' ');
  const explicit=String(b.orderId||b.order_code||'').trim().toUpperCase();
  const purchaseMatch=content.match(/\bHV\d{8}-\d{5}-[A-Z0-9]{5}\b/i);
  const renewalMatch=content.match(/\bGH\d{8}-\d{5}-[A-Z0-9]{5}\b/i);
  const orderCode=explicit||(renewalMatch?renewalMatch[0].toUpperCase():purchaseMatch?purchaseMatch[0].toUpperCase():'');
  if(!orderCode)return json({ok:true,ignored:'order_not_found'});
  const ref=String(b.transactionid??b.referenceCode??b.referencenumber??b.reference??b.id??'').slice(0,250);
  const transferContent=String(b.content??b.description??b.transferContent??'').slice(0,1000);

  if(orderCode.startsWith('GH')){
    const rp=await env.DB.prepare(`SELECT rp.*,s.name,s.domain,cp.full_name customer_name,cp.email customer_email
      FROM renewal_payments rp JOIN sites s ON s.id=rp.site_id LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      WHERE rp.order_code=? LIMIT 1`).bind(orderCode).first();
    if(!rp)return json({ok:true,ignored:'unknown_renewal_order'});
    if(rp.status==='paid')return json({ok:true,duplicate:true,order_code:orderCode,type:'renewal'});
    if(amount<Number(rp.amount||0))return json({ok:true,ignored:'amount_too_low',expected:Number(rp.amount||0),received:amount,type:'renewal'});
    await env.DB.batch([
      env.DB.prepare(`UPDATE renewal_payments SET status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,transfer_ref=?,transfer_content=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='paid'`).bind(amount,ref,transferContent,rp.id),
      env.DB.prepare(`UPDATE service_promotions SET renewal_status='yes',renewal_stage='paid',renewal_paid_at=CURRENT_TIMESTAMP,renewal_selected_months=?,renewal_order_code=?,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(Number(rp.years||1)*12,orderCode,rp.site_id),
      env.DB.prepare(`INSERT INTO financial_transactions(site_id,kind,status,amount,cost,order_code,memo,cycle_start,cycle_end,paid_at,unique_key,note)
        VALUES(?,'renewal','paid',?,0,?,'Gia hạn dịch vụ đã thanh toán',NULL,NULL,CURRENT_TIMESTAMP,?,'VietQR callback')
        ON CONFLICT(unique_key) DO UPDATE SET status='paid',amount=excluded.amount,order_code=excluded.order_code,paid_at=CURRENT_TIMESTAMP,note='VietQR callback'`)
        .bind(rp.site_id,Number(rp.amount||0),orderCode,`renewal-payment:${rp.id}`)
    ]);
    try{await notifyMasterRenewalPaid(env,rp,{...rp,order_code:orderCode,amount:Number(rp.amount||0)})}catch(e){console.log('renewal paid mail:',e?.message||e)}
    return json({ok:true,order_code:orderCode,status:'paid',type:'renewal',site_id:rp.site_id});
  }

  const pp=await env.DB.prepare(`SELECT pp.*,sl.customer_name,sl.email,sl.phone,sl.site_name,sl.template_name FROM purchase_payments pp JOIN sales_leads sl ON sl.id=pp.lead_id WHERE pp.order_code=? LIMIT 1`).bind(orderCode).first();
  if(!pp)return json({ok:true,ignored:'unknown_order'});
  if(pp.status==='paid')return json({ok:true,duplicate:true,order_code:orderCode,type:'initial'});
  if(amount<Number(pp.amount||0))return json({ok:true,ignored:'amount_too_low',expected:Number(pp.amount||0),received:amount,type:'initial'});
  await env.DB.batch([
    env.DB.prepare(`UPDATE purchase_payments SET status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,transfer_ref=?,transfer_content=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='paid'`).bind(amount,ref,transferContent,pp.id),
    env.DB.prepare(`UPDATE sales_leads SET status='paid',payment_status='paid',paid_amount=?,paid_at=CURRENT_TIMESTAMP,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(amount,pp.lead_id)
  ]);
  try{await notifyInitialPayment(env,{lead:pp,orderCode,amount:Number(pp.amount||0)})}catch(e){console.log('payment notification:',e?.message||e)}
  return json({ok:true,order_code:orderCode,status:'paid',type:'initial'});
}

if(route==='master/leads'&&request.method==='GET'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureSalesLeads(env);
  // Trial registrations live in Trial CRM, not in the real purchase/request inbox.
  // They only enter the purchase inbox after the customer actually submits the registration form.
  const {results}=await env.DB.prepare(`SELECT * FROM sales_leads
    WHERE coalesce(lead_kind,'inquiry')!='trial' OR source='trial_conversion'
    ORDER BY
    CASE status WHEN 'paid' THEN 0 WHEN 'payment_pending' THEN 1 WHEN 'new' THEN 2 WHEN 'contacted' THEN 3 WHEN 'qualified' THEN 4 WHEN 'won' THEN 5 ELSE 6 END,
    datetime(created_at) DESC,id DESC`).all();
  return json({ok:true,leads:results||[]},200,{'Cache-Control':'no-store, no-cache, must-revalidate, max-age=0','CDN-Cache-Control':'no-store'});
}
if(route==='master/lead-update'&&request.method==='POST'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureSalesLeads(env);
  const b=await body(request),id=Number(b.id);
  const allowed=['payment_pending','paid','new','contacted','qualified','won','lost'];
  const status=allowed.includes(String(b.status||''))?String(b.status):null;
  const masterNote=String(b.master_note??'').trim().slice(0,3000);
  const careNote=String(b.care_note??'').trim().slice(0,3000);
  const tags=String(b.tags??'').trim().slice(0,500);
  const followUp=String(b.follow_up_at||'').trim()||null;
  const marketing=b.marketing_opt_in===true||Number(b.marketing_opt_in)===1?1:0;
  if(!id)return json({error:'Thiếu mã lead'},400);
  const row=await env.DB.prepare(`SELECT id FROM sales_leads WHERE id=?`).bind(id).first();
  if(!row)return json({error:'Không tìm thấy lead'},404);
  await env.DB.prepare(`UPDATE sales_leads SET
    status=coalesce(?,status),master_note=?,care_note=?,tags=?,follow_up_at=?,marketing_opt_in=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?`).bind(status,masterNote,careNote,tags,followUp,marketing,id).run();
  return json({ok:true});
}

if(route==='master/lead-delete'&&request.method==='POST'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureSalesLeads(env);const b=await body(request),id=Number(b.id);if(!id)return json({error:'Thiếu mã yêu cầu'},400);
  const row=await env.DB.prepare(`SELECT id,coalesce(lead_kind,'inquiry') lead_kind,coalesce(converted_site_id,0) converted_site_id FROM sales_leads WHERE id=?`).bind(id).first();
  if(!row)return json({error:'Không tìm thấy yêu cầu'},404);if(row.lead_kind==='trial')return json({error:'Lead dùng thử phải xóa trong Trial Website'},409);
  await env.DB.prepare(`DELETE FROM sales_leads WHERE id=?`).bind(id).run();return json({ok:true,id,kept_site_id:Number(row.converted_site_id||0)||null});
}
if(route==='master/favicon-upload'&&request.method==='POST'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);if(!env.IMAGES)return json({error:'Chưa cấu hình R2 binding IMAGES'},500);
  await ensureServiceDocuments(env);const form=await request.formData(),siteId=Number(form.get('site_id')),file=form.get('file');if(!siteId)return json({error:'Thiếu website'},400);if(!file||typeof file==='string')return json({error:'Chưa chọn ảnh'},400);
  const allowed=['image/jpeg','image/png','image/webp'];if(!allowed.includes(file.type))return json({error:'Favicon chỉ hỗ trợ JPG, PNG, WEBP'},400);if(file.size>2*1024*1024)return json({error:'Favicon tối đa 2 MB'},400);
  const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg',key=`sites/${siteId}/branding/favicon-${crypto.randomUUID()}.${ext}`;await env.IMAGES.put(key,file.stream(),{httpMetadata:{contentType:file.type}});const url=`/api/image?key=${encodeURIComponent(key)}`;await env.DB.prepare(`UPDATE sites SET favicon_url=? WHERE id=?`).bind(url,siteId).run();return json({ok:true,url});
}
if(route==='master/favicon-clear'&&request.method==='POST'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);await ensureServiceDocuments(env);const b=await body(request),siteId=Number(b.site_id);if(!siteId)return json({error:'Thiếu website'},400);await env.DB.prepare(`UPDATE sites SET favicon_url='' WHERE id=?`).bind(siteId).run();return json({ok:true});
}
if(route==='master/service-documents'&&request.method==='GET'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);await ensureServiceDocuments(env);const siteId=Number(u.searchParams.get('site_id'));const {results}=await env.DB.prepare(`SELECT id,site_id,document_type,document_code,document_version,customer_email,sent_customer_at,sent_master_at,created_at FROM service_documents WHERE site_id=? ORDER BY id DESC`).bind(siteId).all();return json({ok:true,documents:results||[]});
}
if(route==='master/service-document'&&request.method==='GET'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);await ensureServiceDocuments(env);const id=Number(u.searchParams.get('id'));const row=await env.DB.prepare(`SELECT * FROM service_documents WHERE id=?`).bind(id).first();if(!row)return json({error:'Không tìm thấy biên bản'},404);return json({ok:true,document:row,html:row.content_html});
}

if(route==='master/renewal-watch'&&request.method==='GET'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureCustomerTables(env);
  const {results}=await env.DB.prepare(`SELECT s.id,s.name,s.domain,cp.full_name customer_name,cp.phone customer_phone,
    coalesce(sp.renewal_stage,'none') renewal_stage,coalesce(sp.renewal_status,'none') renewal_status,
    sp.renewal_requested_at,sp.renewal_paid_at,coalesce(sp.renewal_price,1999000) renewal_price,
    coalesce(sp.renewal_selected_months,sp.term_months,12) renewal_selected_months,coalesce(sp.renewal_order_code,'') renewal_order_code
    FROM sites s
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN service_promotions sp ON sp.site_id=s.id
    WHERE sp.renewal_status='yes' AND coalesce(sp.renewal_stage,'none')!='renewed'
    ORDER BY CASE coalesce(sp.renewal_stage,'none') WHEN 'paid' THEN 0 WHEN 'payment_pending' THEN 1 ELSE 2 END,
      datetime(sp.renewal_requested_at) DESC,s.id DESC`).all();
  return json({ok:true,renewals:results||[]},200,{'Cache-Control':'no-store, no-cache, must-revalidate, max-age=0'});
}
if(route==='master/template-catalog'&&request.method==='GET'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureTemplateCatalog(env);
  const {results}=await env.DB.prepare(`SELECT template_key,name,category,preset,price,renewal_price,is_active,sort_order,
    image_url,demo_url,badge,description,features,accent,editor_profile,
    coalesce(sample_enabled,0) sample_enabled,coalesce(sample_count,12) sample_count,layout_profile,structure_profile,updated_at
    FROM template_catalog ORDER BY category,sort_order,template_key`).all();
  return json({ok:true,templates:results||[]});
}
if(route==='master/template-price'&&request.method==='POST'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureTemplateCatalog(env);
  const b=await body(request);
  const key=String(b.template_key||'').trim();
  const price=Math.max(0,Math.round(Number(b.price)||0));
  const renewal=Math.max(0,Math.round(Number(b.renewal_price)||0));
  if(!key)return json({error:'Thiếu mã template'},400);
  const row=await env.DB.prepare(`SELECT template_key FROM template_catalog WHERE template_key=?`).bind(key).first();
  if(!row)return json({error:'Không tìm thấy template'},404);
  await env.DB.prepare(`UPDATE template_catalog SET price=?,renewal_price=?,updated_at=CURRENT_TIMESTAMP WHERE template_key=?`)
    .bind(price,renewal,key).run();
  return json({ok:true,template_key:key,price,renewal_price:renewal});
}


if(route==='master/template-save'&&request.method==='POST'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureTemplateCatalog(env);
  const b=await body(request);
  const key=String(b.template_key||'').trim().toLowerCase().replace(/[^a-z0-9-_]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  const name=String(b.name||'').trim();
  const category=String(b.category||'bat-dong-san').trim();
  const preset=String(b.preset||'').trim();
  const price=Math.max(0,Math.round(Number(b.price)||0));
  const renewal=Math.max(0,Math.round(Number(b.renewal_price)||0));
  const sort=Math.max(0,Math.round(Number(b.sort_order)||0));
  const image=String(b.image_url||'').trim();
  const demo=String(b.demo_url||'').trim();
  const badge=String(b.badge||'').trim().slice(0,60);
  const description=String(b.description||'').trim().slice(0,1000);
  const features=String(b.features||'').trim().slice(0,2000);
  const accent=['blue','green','orange','purple','red'].includes(String(b.accent||''))?String(b.accent):'blue';
  const active=b.is_active===false||Number(b.is_active)===0?0:1;
  const sampleEnabled=b.sample_enabled===true||Number(b.sample_enabled)===1?1:0;
  const sampleCount=Math.max(1,Math.min(30,Math.round(Number(b.sample_count)||12)));
  let layoutProfile={};try{layoutProfile=typeof b.layout_profile==='object'&&b.layout_profile?b.layout_profile:JSON.parse(String(b.layout_profile||'{}'))}catch(e){return json({error:'Cấu hình bố cục không hợp lệ'},400)}
  const cl=(v,min,max,def)=>Math.max(min,Math.min(max,Math.round(Number(v)||def)));
  layoutProfile={category_columns:cl(layoutProfile.category_columns,1,6,4),category_rows:cl(layoutProfile.category_rows,1,4,2),sidebar_enabled:layoutProfile.sidebar_enabled===false||Number(layoutProfile.sidebar_enabled)===0?0:1,sidebar_read_most:cl(layoutProfile.sidebar_read_most,0,12,6),sidebar_latest:cl(layoutProfile.sidebar_latest,0,12,5),sidebar_categories:cl(layoutProfile.sidebar_categories,0,12,8),home_latest_count:cl(layoutProfile.home_latest_count,4,24,10),related_count:cl(layoutProfile.related_count,2,12,6)};
  const layoutProfileJson=JSON.stringify(layoutProfile);
  const structureProfile=normalizeStructureProfile(b.structure_profile,key,category==='tin-tuc'?'news':category==='bat-dong-san'?'property':'generic');
  const structureProfileJson=JSON.stringify(structureProfile);
  const structureValidation=validateStructureProfile(structureProfile,{active});
  if(active&&!structureValidation.ok)return json({error:'Khung giao diện chưa đạt chuẩn để đưa vào Kho template.',details:structureValidation.errors,warnings:structureValidation.warnings},400);
  let editorProfile={};
  try{editorProfile=typeof b.editor_profile==='object'&&b.editor_profile?b.editor_profile:JSON.parse(String(b.editor_profile||'{}'))}catch(e){return json({error:'Cấu hình form đăng bài không hợp lệ'},400)}
  const allowedContentTypes=['property','news','product','app','generic'];
  editorProfile.content_type=allowedContentTypes.includes(String(editorProfile.content_type||''))?String(editorProfile.content_type):(
    category==='tin-tuc'?'news':category==='bat-dong-san'?'property':'generic'
  );
  editorProfile.id=String(editorProfile.id||editorProfile.content_type).slice(0,50);
  if(editorProfile.content_type==='property'){
    editorProfile.categoriesByTransaction=editorProfile.categoriesByTransaction||{};
    for(const k of ['buy','sale','rent'])editorProfile.categoriesByTransaction[k]=Array.isArray(editorProfile.categoriesByTransaction[k])?editorProfile.categoriesByTransaction[k].map(x=>String(x).trim()).filter(Boolean).slice(0,60):[];
    delete editorProfile.categories;
  }else{
    editorProfile.categories=Array.isArray(editorProfile.categories)?editorProfile.categories.map(x=>String(x).trim()).filter(Boolean).slice(0,80):[];
  }
  // Category Contract: the structure wins over manually maintained editor lists.
  // This makes new templates automatically expose their public categories in Admin.
  editorProfile=templateCategoryContract(structureProfile,editorProfile,editorProfile.content_type);
  editorProfile.custom_fields=Array.isArray(editorProfile.custom_fields)?editorProfile.custom_fields.slice(0,60):[];
  const editorProfileJson=JSON.stringify(editorProfile);
  if(!key||!name)return json({error:'Mã template và tên template là bắt buộc'},400);

  await env.DB.prepare(`INSERT INTO template_catalog
    (template_key,name,category,preset,price,renewal_price,is_active,sort_order,image_url,demo_url,badge,description,features,accent,editor_profile,sample_enabled,sample_count,layout_profile,structure_profile,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(template_key) DO UPDATE SET
      name=excluded.name,category=excluded.category,preset=excluded.preset,price=excluded.price,
      renewal_price=excluded.renewal_price,is_active=excluded.is_active,sort_order=excluded.sort_order,
      image_url=excluded.image_url,demo_url=excluded.demo_url,badge=excluded.badge,
      description=excluded.description,features=excluded.features,accent=excluded.accent,
      editor_profile=excluded.editor_profile,sample_enabled=excluded.sample_enabled,sample_count=excluded.sample_count,layout_profile=excluded.layout_profile,structure_profile=excluded.structure_profile,
      updated_at=CURRENT_TIMESTAMP`)
    .bind(key,name,category,preset,price,renewal,active,sort,image,demo,badge,description,features,accent,editorProfileJson,sampleEnabled,sampleCount,layoutProfileJson,structureProfileJson).run();
  return json({ok:true,template_key:key,structure_validation:structureValidation});
}

if(route==='master/template-seed-existing'&&request.method==='POST'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureTemplateCatalog(env);
  const b=await body(request),key=String(b.template_key||'').trim();
  if(!key)return json({error:'Thiếu mã template'},400);
  const t=await env.DB.prepare(`SELECT template_key,name,coalesce(sample_enabled,0) sample_enabled,coalesce(sample_count,12) sample_count FROM template_catalog WHERE template_key=?`).bind(key).first();
  if(!t)return json({error:'Không tìm thấy template'},404);
  if(Number(t.sample_enabled)!==1)return json({error:'Bài mẫu của template đang tắt. Hãy bật trong Template Manager trước.'},409);
  const {results}=await env.DB.prepare(`SELECT id,name,domain FROM sites WHERE template_key=? ORDER BY id`).bind(key).all();
  let created=0,skipped=0,failed=0;
  const details=[];
  for(const s of (results||[])){
    try{
      const r=await seedDemoForSite(env,Number(s.id),{limit:Number(t.sample_count||12),source:'template-sync'});
      created+=Number(r.created||0);skipped+=Number(r.skipped||0);
      details.push({site_id:s.id,domain:s.domain,created:r.created||0,skipped:r.skipped||0});
    }catch(e){failed++;details.push({site_id:s.id,domain:s.domain,error:String(e?.message||e)})}
  }
  return json({ok:true,template_key:key,sites:(results||[]).length,created,skipped,failed,details});
}

if(route==='master/template-toggle'&&request.method==='POST'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureTemplateCatalog(env);
  const b=await body(request),key=String(b.template_key||'').trim(),active=Number(b.is_active)?1:0;
  if(!key)return json({error:'Thiếu mã template'},400);
  await env.DB.prepare(`UPDATE template_catalog SET is_active=?,updated_at=CURRENT_TIMESTAMP WHERE template_key=?`).bind(active,key).run();
  return json({ok:true,is_active:active});
}
if(route==='master/template-archive'&&request.method==='POST'){
  if(!await masterOK(env,request))return json({error:'Không có quyền'},401);
  await ensureTemplateCatalog(env);
  const b=await body(request),key=String(b.template_key||'').trim();
  if(!key)return json({error:'Thiếu mã template'},400);
  // Archive instead of hard delete so historical orders/links remain understandable.
  await env.DB.prepare(`UPDATE template_catalog SET is_active=0,updated_at=CURRENT_TIMESTAMP WHERE template_key=?`).bind(key).run();
  return json({ok:true});
}

if(route==='master/overview'){
  await ensureCustomerTables(env);
  await ensureSiteTemplateIdentity(env);

    const {results}=await env.DB.prepare(`SELECT s.id,s.name,s.domain,s.status,s.created_at,s.preset,s.template_key,
      coalesce((SELECT tc.name FROM template_catalog tc WHERE tc.template_key=s.template_key LIMIT 1),
               (SELECT tc2.name FROM template_catalog tc2 WHERE tc2.preset=s.preset ORDER BY tc2.sort_order LIMIT 1),
               s.preset) template_name,
      (SELECT count(*) FROM posts p WHERE p.site_id=s.id) posts,
      (SELECT coalesce(sum(p.views),0) FROM posts p WHERE p.site_id=s.id) views,
      (SELECT email FROM users u WHERE u.site_id=s.id AND u.role='admin' ORDER BY u.id LIMIT 1) admin_email,
      (SELECT count(*) FROM posts p WHERE p.site_id=s.id AND p.listing_code LIKE 'DEMO-%') demo_posts,
      cp.full_name customer_name,cp.phone customer_phone,cp.email customer_email,cp.company customer_company,
      cp.order_code,cp.activated_at,
      ss.plan_name,ss.sale_price,ss.internal_cost,ss.payment_status,ss.service_status,
      ss.started_at,ss.expires_at,ss.domain_status,ss.domain_registered_at,ss.domain_expires_at,ss.registrar,
      coalesce(sp.term_months,12) term_months,coalesce(sp.promotion_name,'') promotion_name,coalesce(sp.list_price,1999000) list_price,coalesce(sp.first_discount,0) first_discount,coalesce(sp.first_price,ss.sale_price,1999000) first_price,coalesce(sp.renewal_price,1999000) renewal_price,
      coalesce(sp.renewal_status,'none') renewal_status,sp.renewal_notified_at,sp.renewal_decision_at,sp.renewal_requested_at,coalesce(sp.renewal_stage,'none') renewal_stage,sp.renewal_payment_sent_at,sp.renewal_paid_at,sp.renewal_completed_at,coalesce(sp.renewal_selected_months,sp.term_months,12) renewal_selected_months,coalesce(sp.renewal_order_code,'') renewal_order_code,
      CASE WHEN cp.activated_at IS NOT NULL THEN 'activated'
           WHEN EXISTS(SELECT 1 FROM site_activation_tokens at WHERE at.site_id=s.id AND at.used_at IS NULL AND at.expires_at>datetime('now')) THEN 'pending'
           ELSE 'not_created' END onboarding_status
      FROM sites s LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN service_subscriptions ss ON ss.site_id=s.id
      LEFT JOIN service_promotions sp ON sp.site_id=s.id
      WHERE NOT EXISTS(SELECT 1 FROM website_trials wt WHERE wt.site_id=s.id)
      ORDER BY s.id DESC`).all();
    return json({stats:await masterOverview(env),sites:results});
  }
  if(route==='master/seed-demo'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website cần tạo dữ liệu mẫu'},400);
    await ensureCustomerTables(env);
    await ensureTemplateCatalog(env);
    const target=await env.DB.prepare(`SELECT s.id,s.template_key,cp.activated_at,coalesce(tc.sample_enabled,0) sample_enabled,coalesce(tc.sample_count,12) sample_count
      FROM sites s LEFT JOIN customer_profiles cp ON cp.site_id=s.id
      LEFT JOIN template_catalog tc ON tc.template_key=s.template_key WHERE s.id=?`).bind(siteId).first();
    if(!target)return json({error:'Website không tồn tại'},404);
    if(!target.activated_at)return json({error:'Khách chưa kích hoạt Admin Client. Chỉ cài bài mẫu sau khi khách đã kích hoạt.'},409);
    if(Number(target.sample_enabled)!==1)return json({error:'Template này chưa bật bộ bài mẫu trong Template Manager.'},409);
    const result=await seedDemoForSite(env,siteId,{limit:Number(target.sample_count||12),source:'master-customer-request'});
    return json({ok:true,...result});
  }
  if(route==='master/clear-demo'&&request.method==='POST'){
    const b=await body(request),siteId=Number(b.site_id);
    if(!siteId)return json({error:'Thiếu website cần xóa dữ liệu mẫu'},400);
    await ensureSampleColumns(env);
    const demoRows=await env.DB.prepare(`SELECT id FROM posts WHERE site_id=? AND (coalesce(is_sample,0)=1 OR listing_code LIKE 'DEMO-%' OR listing_code LIKE 'SAMPLE-%')`).bind(siteId).all();
    const count=demoRows.results?.length||0;
    if(count){
      await env.DB.prepare(`DELETE FROM pageviews WHERE site_id=? AND post_id IN (SELECT id FROM posts WHERE site_id=? AND (coalesce(is_sample,0)=1 OR listing_code LIKE 'DEMO-%' OR listing_code LIKE 'SAMPLE-%'))`).bind(siteId,siteId).run();
      await env.DB.prepare(`DELETE FROM posts WHERE site_id=? AND (coalesce(is_sample,0)=1 OR listing_code LIKE 'DEMO-%' OR listing_code LIKE 'SAMPLE-%')`).bind(siteId).run();
    }
    return json({ok:true,deleted:count});
  }

  if(route==='master/cleanup-test-data'&&request.method==='POST'){
    const b=await body(request);
    const preserveDomain=normalizeDomain(b.preserve_domain||'');
    const confirmText=String(b.confirm||'').trim();
    if(!preserveDomain)return json({error:'Thiếu domain cần giữ lại'},400);
    if(confirmText!=='XOA DU LIEU TEST')return json({error:'Xác nhận không đúng'},400);
    await ensureCustomerTables(env);
    await ensureSalesLeads(env);

    const keep=await env.DB.prepare(`SELECT id,name,domain FROM sites WHERE lower(domain)=lower(?) LIMIT 1`).bind(preserveDomain).first();
    if(!keep)return json({error:`Không tìm thấy website có domain ${preserveDomain}. Không xóa gì cả.`},404);
    const keepId=Number(keep.id);

    // Activation/renewal payments created while testing the workflow are neither
    // real revenue nor real expenses. Remove them from the financial ledger.
    const money=await env.DB.prepare(`SELECT
      coalesce(sum(CASE WHEN status='paid' THEN amount ELSE 0 END),0) test_revenue
      FROM financial_transactions WHERE site_id=?`).bind(keepId).first();
    const removedTestRevenue=Math.max(0,Number(money?.test_revenue||0));
    await env.DB.prepare(`UPDATE service_subscriptions SET finance_excluded=1,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(keepId).run();
    await env.DB.prepare(`DELETE FROM financial_transactions WHERE site_id=?`).bind(keepId).run();

    // IMPORTANT: operating_expenses is intentionally untouched.
    // finance_excluded=1 prevents syncFinancialLedger() from recreating these
    // test activation/renewal transactions on the next Finance dashboard load.
    // Only actual out-of-pocket expenses entered by Master (for example real
    // domain purchases) remain as costs. Fake package prices are never copied
    // into operating expenses.

    // Leads shown in "Hộp yêu cầu" are test registrations: clear all of them.
    const leadCount=Number((await env.DB.prepare(`SELECT count(*) n FROM sales_leads`).first())?.n||0);
    await env.DB.prepare(`DELETE FROM sales_leads`).run();

    // Remove every test website except the explicitly preserved live domain.
    const doomed=(await env.DB.prepare(`SELECT id,domain FROM sites WHERE id<>?`).bind(keepId).all()).results||[];
    for(const s of doomed){
      const id=Number(s.id);
      // Delete children explicitly so cleanup also works on older D1 schemas.
      for(const [table,col] of [
        ['password_reset_tokens','site_id'],['handover_login_tokens','site_id'],
        ['site_activation_tokens','site_id'],['renewal_response_tokens','site_id'],
        ['renewal_reminder_log','site_id'],['renewal_history','site_id'],
        ['financial_transactions','site_id'],['service_promotions','site_id'],
        ['service_subscriptions','site_id'],['site_public_settings','site_id'],
        ['customer_profiles','site_id'],['pageviews','site_id'],
        ['sessions','site_id'],['posts','site_id'],['users','site_id']
      ]){
        try{await env.DB.prepare(`DELETE FROM ${table} WHERE ${col}=?`).bind(id).run()}catch(e){}
      }
      await env.DB.prepare(`DELETE FROM sites WHERE id=?`).bind(id).run();
    }

    // Reset renewal workflow of the kept test site but preserve domain/service dates and content.
    try{await env.DB.prepare(`UPDATE service_promotions SET renewal_status='none',renewal_stage='none',
      renewal_notified_at=NULL,renewal_decision_at=NULL,renewal_requested_at=NULL,
      renewal_payment_sent_at=NULL,renewal_paid_at=NULL,renewal_completed_at=NULL,
      updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(keepId).run()}catch(e){}
    try{await env.DB.prepare(`DELETE FROM renewal_response_tokens WHERE site_id=?`).bind(keepId).run()}catch(e){}
    try{await env.DB.prepare(`DELETE FROM renewal_reminder_log WHERE site_id=?`).bind(keepId).run()}catch(e){}

    return json({ok:true,preserved:{id:keepId,name:keep.name,domain:keep.domain},
      deleted_sites:doomed.length,deleted_leads:leadCount,
      removed_test_revenue:removedTestRevenue,
      operating_expenses_preserved:true});
  }

  if(route==='master/site-status'&&request.method==='PUT'){
    const b=await body(request),id=Number(b.site_id),status=b.status==='inactive'?'inactive':'active';
    if(!id)return json({error:'Thiếu website cần cập nhật'},400);
    await env.DB.prepare(`UPDATE sites SET status=? WHERE id=?`).bind(status,id).run();
    return json({ok:true});
  }
  // V20.4.1 — only unknown Master routes should stop here.
  // The old unconditional return made every public API below this point
  // (including /api/activation) unreachable and returned "Master API không tồn tại".
  if(route.startsWith('master/'))return json({error:'Master API không tồn tại'},404);

if(route==='activation-status'&&request.method==='GET'){
  await ensureCustomerTables(env);
  const raw=String(u.searchParams.get('token')||'');
  if(!raw)return json({error:'Thiếu mã kích hoạt'},400);
  const hash=await sha256(raw);
  const row=await env.DB.prepare(`SELECT at.site_id,at.expires_at,at.used_at,s.name,s.domain
    FROM site_activation_tokens at JOIN sites s ON s.id=at.site_id WHERE at.token_hash=?`).bind(hash).first();
  if(!row)return json({error:'Liên kết kích hoạt không hợp lệ'},404);
  if(row.used_at)return json({error:'Liên kết này đã được sử dụng'},410);
  if(await env.DB.prepare(`SELECT 1 expired WHERE datetime(?)<=datetime('now')`).bind(row.expires_at).first())return json({error:'Liên kết kích hoạt đã hết hạn'},410);

  const pages=await getPagesDomainStatus(env,row.domain);
  const active=pages.status==='active';
  if(active){
    await env.DB.prepare(`UPDATE service_subscriptions SET domain_status='active',service_status='ready',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(row.site_id).run();
  }
  return json({ok:true,site:{id:row.site_id,name:row.name,domain:row.domain},pages_configured:pages.configured,pages_status:pages.status,active,error:pages.error||''});
}

if(route==='activation'&&request.method==='GET'){
  await ensureCustomerTables(env);
  const raw=String(u.searchParams.get('token')||'');
  if(!raw)return json({error:'Thiếu mã kích hoạt'},400);
  const hash=await sha256(raw);
  const row=await env.DB.prepare(`SELECT at.id token_id,at.site_id,at.expires_at,at.used_at,s.name,s.domain,
      cp.full_name,cp.phone,cp.email,cp.company,cp.activated_at,sl.site_name
    FROM site_activation_tokens at JOIN sites s ON s.id=at.site_id
    LEFT JOIN customer_profiles cp ON cp.site_id=s.id
    LEFT JOIN website_trials wt0 ON wt0.site_id=s.id
    LEFT JOIN sales_leads sl ON sl.id=wt0.lead_id
    WHERE at.token_hash=?`).bind(hash).first();
  if(!row)return json({error:'Liên kết kích hoạt không hợp lệ'},404);
  if(row.used_at)return json({error:'Liên kết này đã được sử dụng'},410);
  if(await env.DB.prepare(`SELECT 1 expired WHERE datetime(?)<=datetime('now')`).bind(row.expires_at).first())return json({error:'Liên kết kích hoạt đã hết hạn'},410);
  const trial=await env.DB.prepare(`SELECT wt.trial_token,wt.template_key,wt.status,tc.name template_name FROM website_trials wt LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.site_id=? LIMIT 1`).bind(row.site_id).first();
  if(!trial){
    const pages=await getPagesDomainStatus(env,row.domain);
    if(pages.status!=='active'){
      return json({
        error:'Website đang hoàn tất DNS/SSL trên Cloudflare Pages',
        code:'DOMAIN_NOT_READY',
        domain:row.domain,
        pages_configured:pages.configured,
        pages_status:pages.status,
        detail:pages.error||''
      },409);
    }
  }
  return json({site:{id:row.site_id,name:row.name,domain:row.domain},customer:{full_name:row.full_name||'',phone:row.phone||'',email:row.email||'',company:row.company||'',site_name:row.site_name||''},trial:trial?{is_trial:true,token:trial.trial_token,template_key:trial.template_key,template_name:trial.template_name||trial.template_key,status:trial.status}:null});
}
if(route==='activation'&&request.method==='POST'){
  await ensureCustomerTables(env);
  const b=await body(request),raw=String(b.token||''),newPassword=String(b.password||''),loginEmail=String(b.email||'').trim().toLowerCase(),desiredSiteName=String(b.site_name||'').trim();
  if(!raw)return json({error:'Thiếu mã kích hoạt'},400);
  if(!loginEmail||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail))return json({error:'Email đăng nhập không hợp lệ'},400);
  if(newPassword.length<8)return json({error:'Mật khẩu quản trị phải có ít nhất 8 ký tự'},400);
  const hash=await sha256(raw);
  const at=await env.DB.prepare(`SELECT at.*,s.domain FROM site_activation_tokens at JOIN sites s ON s.id=at.site_id
    WHERE at.token_hash=? AND at.used_at IS NULL AND at.expires_at>datetime('now')`).bind(hash).first();
  if(!at)return json({error:'Liên kết kích hoạt không hợp lệ hoặc đã hết hạn'},410);
  const trial=await env.DB.prepare(`SELECT wt.*,tc.name template_name FROM website_trials wt LEFT JOIN template_catalog tc ON tc.template_key=wt.template_key WHERE wt.site_id=? LIMIT 1`).bind(at.site_id).first();
  if(trial&&!desiredSiteName)return json({error:'Vui lòng nhập Tên website mong muốn'},400);
  if(!trial){
    const ready=await getPagesDomainStatus(env,at.domain);
    if(ready.status!=='active')return json({error:'Domain/SSL chưa sẵn sàng. Vui lòng thử lại sau.',code:'DOMAIN_NOT_READY',pages_status:ready.status,detail:ready.error||''},409);
  }
  const usr=await env.DB.prepare(`SELECT id,email FROM users WHERE site_id=? AND role='admin' ORDER BY id LIMIT 1`).bind(at.site_id).first();
  if(!usr)return json({error:'Website chưa có tài khoản quản trị'},409);

  // One activation contract for production + trial: customer confirms login email and creates their own password.
  const magicRaw=activationToken(),magicHash=await sha256(magicRaw),passwordHash=await sha256(newPassword);
  // V20.4.1 — activation creates the authenticated Admin session immediately.
  // Handover remains as a compatibility/recovery path, not a required second login.
  const activationSession=tok();
  const ops=[
    env.DB.prepare(`UPDATE users SET email=?,password_hash=? WHERE id=?`).bind(loginEmail,passwordHash,usr.id),
    env.DB.prepare(`DELETE FROM sessions WHERE site_id=?`).bind(at.site_id),
    env.DB.prepare(`INSERT INTO sessions(site_id,user_id,token,expires_at) VALUES(?,?,?,datetime('now','+30 days'))`).bind(at.site_id,usr.id,activationSession),
    env.DB.prepare(`UPDATE customer_profiles SET email=?,activated_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(loginEmail,at.site_id),
    env.DB.prepare(`UPDATE site_activation_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(at.site_id),
    env.DB.prepare(`UPDATE handover_login_tokens SET used_at=datetime('now') WHERE site_id=? AND used_at IS NULL`).bind(at.site_id),
    env.DB.prepare(`INSERT INTO handover_login_tokens(site_id,token_hash,expires_at) VALUES(?,?,datetime('now','+30 minutes'))`).bind(at.site_id,magicHash)
  ];
  if(trial){
    ops.push(env.DB.prepare(`UPDATE website_trials SET status='active',started_at=CURRENT_TIMESTAMP,expires_at=datetime('now','+1 day'),grace_expires_at=datetime('now','+8 days'),updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(trial.id));
    ops.push(env.DB.prepare(`UPDATE service_subscriptions SET service_status='active',domain_status='trial',started_at=date('now'),expires_at=date('now','+1 day'),updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(at.site_id));
    ops.push(env.DB.prepare(`UPDATE sales_leads SET email=?,site_name=?,last_activity_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(loginEmail,desiredSiteName,trial.lead_id));
    ops.push(env.DB.prepare(`UPDATE sites SET name=? WHERE id=?`).bind(desiredSiteName+' · Trial',at.site_id));
  }else{
    ops.push(env.DB.prepare(`UPDATE service_subscriptions SET service_status='active',domain_status='active',updated_at=CURRENT_TIMESTAMP WHERE site_id=?`).bind(at.site_id));
  }
  await env.DB.batch(ops);
  if(trial){
    await trialEvent(env,{...trial,email:loginEmail},'trial_activated',{template_key:trial.template_key});
    return json({ok:true,is_trial:true,domain:at.domain,token:activationSession,admin_url:`/admin?tenant=${encodeURIComponent(at.domain)}&nr_trial=${encodeURIComponent(trial.trial_token)}&template=${encodeURIComponent(trial.template_key)}`,website_url:`/?template=${encodeURIComponent(trial.template_key)}&nr_trial=${encodeURIComponent(trial.trial_token)}`},200,{'Set-Cookie':`nr_session=${encodeURIComponent(activationSession)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`});
  }
  try{await createActivationServiceDocument(env,at.site_id,loginEmail)}catch(e){console.log('activation service document:',e?.message||e)}
  return json({ok:true,domain:at.domain,admin_url:`https://${at.domain}/admin?handover=${encodeURIComponent(magicRaw)}`});
}
if(route==='handover-login'&&request.method==='POST'){
  await ensureCustomerTables(env);
  const b=await body(request),raw=String(b.token||'');
  if(!raw)return json({error:'Thiếu mã bàn giao'},400);
  const hash=await sha256(raw);
  const ht=await env.DB.prepare(`SELECT * FROM handover_login_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>datetime('now')`).bind(hash).first();
  if(!ht)return json({error:'Mã đăng nhập bàn giao không hợp lệ hoặc đã hết hạn'},410);
  const s=await env.DB.prepare(`SELECT * FROM sites WHERE id=? AND status='active'`).bind(ht.site_id).first();
  if(!s)return json({error:'Website chưa hoạt động'},409);
  const usr=await env.DB.prepare(`SELECT * FROM users WHERE site_id=? AND role='admin' ORDER BY id LIMIT 1`).bind(ht.site_id).first();
  if(!usr)return json({error:'Không tìm thấy Admin'},404);
  const t=tok();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO sessions(site_id,user_id,token,expires_at) VALUES(?,?,?,datetime('now','+30 days'))`).bind(s.id,usr.id,t),
    env.DB.prepare(`UPDATE handover_login_tokens SET used_at=datetime('now') WHERE id=?`).bind(ht.id)
  ]);
  return json({ok:true,token:t,site_id:s.id},200,{'Set-Cookie':`nr_session=${encodeURIComponent(t)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`});
}

// V18.6 — Public media route must not depend on tenant resolution.
// Uploaded post images are public content and their persisted URL is /api/image?key=...
// Trial/demo pages run on a shared host, so requiring siteFor() here made those URLs break.
if(route==='image'&&request.method==='GET'){
 const key=u.searchParams.get('key');if(!key)return json({error:'Thiếu key ảnh'},400);
 const obj=await env.IMAGES?.get(key);if(!obj)return json({error:'Không tìm thấy ảnh'},404);
 const h=new Headers();obj.writeHttpMetadata(h);h.set('Cache-Control','public, max-age=31536000, immutable');h.set('CDN-Cache-Control','public, max-age=31536000, immutable');h.set('ETag',obj.httpEtag);
 return new Response(obj.body,{headers:h});
}
const site=await siteFor(env,request);if(!site)return json({error:'Website chưa được kích hoạt'},404);
// V20.9.1 — Cloudflare-first CoC stats. Public, batched and non-blocking.
if(route==='game/stats'&&request.method==='GET'){
  await ensureGameStatsTables(env);
  const slugs=String(u.searchParams.get('slugs')||'').split(',').map(nrSlug).filter(Boolean).slice(0,60);
  if(!slugs.length)return json({ok:true,stats:{}},200,publicCache(15,60));
  const qs=slugs.map(()=>'?').join(',');
  const {results}=await env.DB.prepare(`SELECT slug,views,vote_sum,vote_count,downloads FROM game_base_stats WHERE site_id=? AND slug IN (${qs})`).bind(site.id,...slugs).all();
  const out={};for(const row of (results||[]))out[row.slug]=nrGameStatsPublic(row);
  return json({ok:true,stats:out},200,publicCache(15,60));
}
if(route==='game/stats/action'&&request.method==='POST'){
  await ensureGameStatsTables(env);
  const b=await body(request),slug=nrSlug(b.slug||''),action=String(b.action||'').toLowerCase();
  if(!slug||!['view','download','vote'].includes(action))return json({error:'Stats action không hợp lệ'},400);
  await env.DB.prepare(`INSERT OR IGNORE INTO game_base_stats(site_id,slug) VALUES(?,?)`).bind(site.id,slug).run();
  if(action==='view')await env.DB.prepare(`UPDATE game_base_stats SET views=views+1,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=?`).bind(site.id,slug).run();
  if(action==='download')await env.DB.prepare(`UPDATE game_base_stats SET downloads=downloads+1,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=?`).bind(site.id,slug).run();
  if(action==='vote'){
    const vote=Math.max(1,Math.min(5,Number(b.value||0)));if(!Number.isFinite(vote))return json({error:'Vote phải từ 1 đến 5'},400);
    const client=String(b.client_id||'').slice(0,160);if(client.length<8)return json({error:'Thiếu client id'},400);
    const voterKey=await sha256(`coc-vote:${site.id}:${client}`);
    const prev=await env.DB.prepare(`SELECT vote FROM game_base_votes WHERE site_id=? AND slug=? AND voter_key=?`).bind(site.id,slug,voterKey).first();
    if(prev){
      await env.DB.batch([
        env.DB.prepare(`UPDATE game_base_votes SET vote=?,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=? AND voter_key=?`).bind(vote,site.id,slug,voterKey),
        env.DB.prepare(`UPDATE game_base_stats SET vote_sum=vote_sum+?,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=?`).bind(vote-Number(prev.vote||0),site.id,slug)
      ]);
    }else{
      await env.DB.batch([
        env.DB.prepare(`INSERT INTO game_base_votes(site_id,slug,voter_key,vote) VALUES(?,?,?,?)`).bind(site.id,slug,voterKey,vote),
        env.DB.prepare(`UPDATE game_base_stats SET vote_sum=vote_sum+?,vote_count=vote_count+1,updated_at=CURRENT_TIMESTAMP WHERE site_id=? AND slug=?`).bind(vote,site.id,slug)
      ]);
    }
  }
  const row=await env.DB.prepare(`SELECT slug,views,vote_sum,vote_count,downloads FROM game_base_stats WHERE site_id=? AND slug=?`).bind(site.id,slug).first();
  return json({ok:true,slug,stats:nrGameStatsPublic(row)},200,{'Cache-Control':'no-store'});
}
await ensureTrialTables(env);
let __siteTrial=null;try{__siteTrial=await env.DB.prepare(`SELECT * FROM website_trials WHERE site_id=? LIMIT 1`).bind(site.id).first()}catch(e){}
if(__siteTrial){
  // V17.5 — Repair legacy trial tenants that were bootstrapped with sample posts.
  // Only generated sample rows are removed; posts created by the trial user are preserved.
  try{await env.DB.prepare(`DELETE FROM posts WHERE site_id=? AND (coalesce(is_sample,0)=1 OR coalesce(sample_key,'')<>'' OR coalesce(listing_code,'') LIKE 'DEMO-%' OR coalesce(listing_code,'') LIKE 'SAMPLE-%')`).bind(site.id).run()}catch(e){}
  const st=trialPublicState(__siteTrial);
  if(st?.expired&&__siteTrial.status==='active'){await env.DB.prepare(`UPDATE website_trials SET status='expired',updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(__siteTrial.id).run();__siteTrial.status='expired'}
  const expired=st?.expired||__siteTrial.status==='expired';
  if(expired&&request.method!=='GET'&&!['logout'].includes(route))return json({error:'Thời gian trải nghiệm website đã kết thúc.',code:'TRIAL_EXPIRED',trial:st},402);
  if(!expired&&request.method!=='GET'&&route!=='logout')await trialEvent(env,__siteTrial,'api_write',{route});
}
await ensurePerformanceIndexes(env);
if(route==='site'&&request.method==='GET'){
 const hideSamples=!!__siteTrial||request.headers.get('X-NR-Preview-Samples')==='0';
 const templateSimulation=request.headers.get('X-NR-Template-Simulation')==='1';
 const templateDemo=request.headers.get('X-NR-Template-Demo')==='1';
 const requestedPreviewTemplate=String(request.headers.get('X-NR-Template-Key')||'').trim();
 // V15.7 mode contract:
 // - Public template DEMO => always virtual sample package (sales showroom).
 // - Client simulation => empty by default, optional virtual samples for comparison.
 // - Customer production => DB only; a newly activated site therefore stays empty until Master seeds samples.
 if(templateDemo&&!templateSimulation){
   const previewTemplate=requestedPreviewTemplate||site.template_key;
   const previewSite={...site,template_key:previewTemplate};
   let t=null;try{t=await env.DB.prepare(`SELECT preset,editor_profile,structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(previewTemplate||'').first()}catch(e){}
   if(t?.preset)previewSite.preset=t.preset;
   if(t?.editor_profile)previewSite.editor_profile=t.editor_profile;
   if(t?.structure_profile)previewSite.structure_profile=t.structure_profile;
   const blueprint=await buildTemplatePreviewBlueprint(env,previewTemplate,site);
   const virtualPosts=blueprint.posts;
   const st={posts:virtualPosts.length,properties:virtualPosts.filter(x=>x.type==='property').length,news:virtualPosts.filter(x=>x.type==='news').length,views:virtualPosts.reduce((n,p)=>n+Number(p.views||0),0)};
   return json({site:previewSite,posts:virtualPosts,stats:st,preview:{demo:true,template_demo:true,samples:1,source:'template-sample-package',content_type:blueprint.content_type}},200,{'Cache-Control':'no-store'});
 }
 // V14.7: Template -> "Xem như khách" phải mô phỏng đúng website vừa bàn giao.
 // Ở trạng thái "Không bài mẫu" website preview luôn có 0 bài, không phụ thuộc tenant demo
 // đã từng được seed ở các version cũ. Nhánh này chỉ chạy khi có header simulation,
 // nên không thay đổi dữ liệu/render của website Tin tức hoặc BĐS production.
 if(templateSimulation){
   const previewTemplate=requestedPreviewTemplate;
   const previewSite={...site,template_key:previewTemplate||site.template_key};
   // V15.2 Structure First: trạng thái web mới = posts[] thật sự. Không dựng bài giả rồi bóc ra nữa.
   if(hideSamples){
     let t=null;try{t=await env.DB.prepare(`SELECT editor_profile,structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(previewTemplate||site.template_key||'').first()}catch(e){}
     if(t?.editor_profile)previewSite.editor_profile=t.editor_profile;
     if(t?.structure_profile)previewSite.structure_profile=t.structure_profile;
     let st=await stats(env,site.id);st={...st,posts:0,properties:0,news:0,views:0};
     return json({site:previewSite,posts:[],stats:st,preview:{client:true,template_simulation:true,samples:0,structure_first:true,source:'template-structure-profile'}},200,{'Cache-Control':'no-store'});
   }
   // Chỉ chế độ "Có bài mẫu" mới tạo dữ liệu mẫu ảo để bind vào chính khung template.
   const blueprint=await buildTemplatePreviewBlueprint(env,previewTemplate,site);
   const virtualPosts=blueprint.posts;
   const st={posts:virtualPosts.length,properties:virtualPosts.filter(x=>x.type==='property').length,news:virtualPosts.filter(x=>x.type==='news').length,views:virtualPosts.reduce((n,p)=>n+Number(p.views||0),0)};
   return json({site:previewSite,posts:virtualPosts,stats:st,preview:{client:true,template_simulation:true,samples:1,structure_first:true,source:'template-sample-package',content_type:blueprint.content_type}},200,{'Cache-Control':'no-store'});
 }
 // V20.4.6 — TRIAL TEMPLATE PARITY CONTRACT.
 // A trial tenant owns customer data, but its homepage frame/taxonomy must always inherit
 // the currently selected template contract from template_catalog. Public showroom and
 // Trial therefore receive the same editor/layout/structure profiles; only post data differs.
 let responseSite=site;
 if(__siteTrial){
   try{
     const tk=String(__siteTrial.template_key||site.template_key||'').trim();
     const tp=tk?await env.DB.prepare(`SELECT preset,editor_profile,layout_profile,structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(tk).first():null;
     if(tp){
       responseSite={...site,template_key:tk||site.template_key};
       if(tp.preset)responseSite.preset=tp.preset;
       if(tp.editor_profile)responseSite.editor_profile=tp.editor_profile;
       if(tp.layout_profile)responseSite.layout_profile=tp.layout_profile;
       if(tp.structure_profile)responseSite.structure_profile=tp.structure_profile;
     }
   }catch(e){console.log('trial template parity:',e?.message||e)}
 }
 const sql=hideSamples
  ?`SELECT * FROM posts WHERE site_id=? AND status='published' AND coalesce(is_sample,0)=0 AND coalesce(sample_key,'')='' AND coalesce(listing_code,'') NOT LIKE 'DEMO-%' AND coalesce(listing_code,'') NOT LIKE 'SAMPLE-%' ORDER BY id DESC LIMIT 100`
  :`SELECT * FROM posts WHERE site_id=? AND status='published' ORDER BY id DESC LIMIT 100`;
 const {results}=await env.DB.prepare(sql).bind(site.id).all();
 // V20.8.1 — production Game posts expose the same stable /base/<slug>.html route as showroom.
 for(const p of (results||[])){
   if(String(p.type||'').toLowerCase()!=='game')continue;
   let ex={};try{ex=JSON.parse(String(p.extra_json||'{}'))}catch(e){}
   const slug=nrSlug(ex.slug||p.title||('base-'+p.id));
   p.slug=slug;p.url=`/base/${slug}.html`;p.demo_url=p.url;
 }
 let st=await stats(env,site.id);
 if(hideSamples){
   const published=results||[];
   st={...st,posts:published.length,views:published.reduce((n,p)=>n+Number(p.views||0),0)};
 }
 return json({site:responseSite,posts:results,stats:st,preview:{client:true,template_simulation:templateSimulation,samples:hideSamples?0:1,trial_template_parity:!!__siteTrial}},200,{'Cache-Control':'no-store'});
}
if(route==='article'&&request.method==='GET'){
 const id=+u.searchParams.get('id');
 const hideSamples=!!__siteTrial||request.headers.get('X-NR-Preview-Samples')==='0';
 const templateSimulation=request.headers.get('X-NR-Template-Simulation')==='1';
 if(templateSimulation&&hideSamples)return json({error:'Không tìm thấy bài viết'},404);
 const p=await env.DB.prepare(`SELECT * FROM posts WHERE id=? AND site_id=? AND status='published'`).bind(id,site.id).first();
 const legacySample=p&&(Number(p.is_sample||0)===1||String(p.sample_key||'')!==''||/^DEMO-|^SAMPLE-/i.test(String(p.listing_code||'')));
 if(!p||hideSamples&&legacySample)return json({error:'Không tìm thấy bài viết'},404);
 await env.DB.prepare(`UPDATE posts SET views=views+1 WHERE id=? AND site_id=?`).bind(id,site.id).run();
 p.views=(p.views||0)+1;

 const {results:related}=await env.DB.prepare(`
   SELECT id,type,title,category,image,price,area,district,province,property_type,"transaction",views,created_at
   FROM posts
   WHERE site_id=? AND status='published' AND id<>? AND type=? ${hideSamples?'AND coalesce(is_sample,0)=0':''}
   ORDER BY
     CASE WHEN category=? THEN 0 ELSE 1 END,
     CASE WHEN property_type=? THEN 0 ELSE 1 END,
     id DESC
   LIMIT 6
 `).bind(site.id,id,p.type||'property',p.category||'',p.property_type||'').all();

 let latestNews=[],popularNews=[],newsCategories=[];
 if(p.type==='news'){
   latestNews=(await env.DB.prepare(`
     SELECT id,title,category,image,views,created_at FROM posts
     WHERE site_id=? AND status='published' AND type='news' AND id<>? ${hideSamples?'AND coalesce(is_sample,0)=0':''}
     ORDER BY id DESC LIMIT 6
   `).bind(site.id,id).all()).results||[];
   popularNews=(await env.DB.prepare(`
     SELECT id,title,category,image,views FROM posts
     WHERE site_id=? AND status='published' AND type='news' AND id<>? ${hideSamples?'AND coalesce(is_sample,0)=0':''}
     ORDER BY views DESC,id DESC LIMIT 5
   `).bind(site.id,id).all()).results||[];
   newsCategories=(await env.DB.prepare(`
     SELECT category,count(*) total FROM posts
     WHERE site_id=? AND status='published' AND type='news' AND trim(category)<>'' ${hideSamples?'AND coalesce(is_sample,0)=0':''}
     GROUP BY category ORDER BY total DESC,category ASC LIMIT 12
   `).bind(site.id).all()).results||[];
 }
 return json({site,post:p,related,latestNews,popularNews,newsCategories},200,publicCache(30,120));
}
if(route==='forgot-password'&&request.method==='POST'){
  await ensureCustomerTables(env);
  const b=await body(request),email=String(b.email||'').trim().toLowerCase();
  // Always return the same public message to avoid revealing whether an email exists.
  const generic={ok:true,message:'Nếu email này thuộc tài khoản quản trị, NEWSREAL đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra Hộp thư đến và Spam.'};
  if(!email||!site)return json(generic);
  const usr=await env.DB.prepare(`SELECT id,email FROM users WHERE site_id=? AND lower(email)=? AND role='admin' ORDER BY id LIMIT 1`).bind(site.id,email).first();
  if(!usr)return json(generic);
  const origin=`${u.protocol}//${u.host}`;
  const sent=await issuePasswordReset(env,{site,user:usr,origin});
  if(!sent.ok)return json({error:sent.error||'Chưa gửi được email đặt lại mật khẩu'},500);
  return json(generic);
}
if(route==='reset-password'&&request.method==='POST'){
  await ensureCustomerTables(env);
  const b=await body(request),raw=String(b.token||'').trim(),password=String(b.password||'');
  if(!raw)return json({error:'Liên kết đặt lại mật khẩu không hợp lệ'},400);
  if(password.length<8)return json({error:'Mật khẩu mới phải có ít nhất 8 ký tự'},400);
  const hash=await sha256(raw);
  const rt=await env.DB.prepare(`SELECT prt.id,prt.site_id,prt.user_id,u.email
    FROM password_reset_tokens prt JOIN users u ON u.id=prt.user_id
    WHERE prt.token_hash=? AND prt.used_at IS NULL AND prt.expires_at>datetime('now')
    LIMIT 1`).bind(hash).first();
  if(!rt)return json({error:'Liên kết đã hết hạn, đã được sử dụng hoặc không hợp lệ'},410);
  if(!site||Number(rt.site_id)!==Number(site.id))return json({error:'Liên kết này không thuộc website hiện tại'},403);
  const newHash=await sha256(password);
  await env.DB.batch([
    env.DB.prepare(`UPDATE users SET password_hash=? WHERE id=? AND site_id=?`).bind(newHash,rt.user_id,rt.site_id),
    env.DB.prepare(`UPDATE password_reset_tokens SET used_at=datetime('now') WHERE id=?`).bind(rt.id),
    env.DB.prepare(`UPDATE password_reset_tokens SET used_at=datetime('now') WHERE site_id=? AND user_id=? AND used_at IS NULL`).bind(rt.site_id,rt.user_id),
    env.DB.prepare(`DELETE FROM sessions WHERE site_id=? AND user_id=?`).bind(rt.site_id,rt.user_id)
  ]);
  const resetSite=await env.DB.prepare(`SELECT domain FROM sites WHERE id=? LIMIT 1`).bind(rt.site_id).first();
  const trialReset=await env.DB.prepare(`SELECT trial_token,template_key FROM website_trials WHERE site_id=? LIMIT 1`).bind(rt.site_id).first();
  const adminUrl=trialReset?`/admin?tenant=${encodeURIComponent(resetSite?.domain||'')}&nr_trial=${encodeURIComponent(trialReset.trial_token)}&template=${encodeURIComponent(trialReset.template_key)}`:`https://${resetSite?.domain||u.host}/admin`;
  return json({ok:true,message:'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',admin_url:adminUrl},200,{'Set-Cookie':'nr_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'});
}
if(route==='login'&&request.method==='POST'){const b=await body(request),h=await sha256(b.password||'');const usr=await env.DB.prepare(`SELECT * FROM users WHERE site_id=? AND lower(email)=? AND password_hash=?`).bind(site.id,(b.email||'').toLowerCase(),h).first();if(!usr)return json({error:'Sai email hoặc mật khẩu'},401);if(__siteTrial){await env.DB.prepare(`UPDATE website_trials SET admin_login_count=admin_login_count+1,last_seen_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(__siteTrial.id).run();await trialEvent(env,__siteTrial,'admin_login',{})}const t=tok();await env.DB.prepare(`INSERT INTO sessions(site_id,user_id,token,expires_at) VALUES(?,?,?,datetime('now','+7 days'))`).bind(site.id,usr.id,t).run();return json({ok:true,token:t},200,{'Set-Cookie':`nr_session=${encodeURIComponent(t)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`})}
if(route==='logout'&&request.method==='POST'){const a=request.headers.get('Authorization')||'',t=(a.startsWith('Bearer ')?a.slice(7).trim():'')||cookies(request).nr_session;if(t)await env.DB.prepare(`DELETE FROM sessions WHERE token=?`).bind(t).run();return json({ok:true},200,{'Set-Cookie':'nr_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'})}
const user=await userFor(env,request,site);
if(route==='upload'&&request.method==='POST'){
 if(!user)return json({error:'Chưa đăng nhập'},401);
 if(!env.IMAGES)return json({error:'Chưa cấu hình R2 binding IMAGES'},500);
 const form=await request.formData(),file=form.get('file');
 if(!file||typeof file==='string')return json({error:'Chưa chọn ảnh'},400);
 const allowed=['image/jpeg','image/png','image/webp'];
 if(!allowed.includes(file.type))return json({error:'Chỉ hỗ trợ JPG, PNG, WEBP'},400);
 if(file.size>8*1024*1024)return json({error:'Ảnh tối đa 8 MB'},400);
 const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
 const key=`sites/${site.id}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
 await env.IMAGES.put(key,file.stream(),{httpMetadata:{contentType:file.type}});
 return json({ok:true,url:`/api/image?key=${encodeURIComponent(key)}`});
}
if(route==='image'&&request.method==='GET'){
 const key=u.searchParams.get('key');if(!key)return json({error:'Thiếu key ảnh'},400);
 const obj=await env.IMAGES?.get(key);if(!obj)return json({error:'Không tìm thấy ảnh'},404);
 const h=new Headers();obj.writeHttpMetadata(h);h.set('Cache-Control','public, max-age=31536000, immutable');h.set('CDN-Cache-Control','public, max-age=31536000, immutable');h.set('ETag',obj.httpEtag);
 return new Response(obj.body,{headers:h});
}
if(route==='me'){
 if(!user)return json({error:'Chưa đăng nhập'},401);
 await ensureTemplateCatalog(env);
 let tc=null;
 try{tc=await env.DB.prepare(`SELECT template_key,category,editor_profile,structure_profile FROM template_catalog WHERE template_key=? OR (template_key='' AND preset=?) ORDER BY CASE WHEN template_key=? THEN 0 ELSE 1 END LIMIT 1`).bind(site.template_key||'',site.preset||'',site.template_key||'').first()}catch(e){}
 if(!tc)try{tc=await env.DB.prepare(`SELECT template_key,category,editor_profile,structure_profile FROM template_catalog WHERE preset=? ORDER BY sort_order,template_key LIMIT 1`).bind(site.preset||'').first()}catch(e){}
 site.template_category=tc?.category||'';
 let content_profile={};try{content_profile=tc?.editor_profile?JSON.parse(tc.editor_profile):{}}catch(e){content_profile={}}
 const profileType=String(content_profile?.content_type||(tc?.category==='tin-tuc'?'news':tc?.category==='bat-dong-san'?'property':'generic'));
 let categoryStructure={};try{categoryStructure=tc?.structure_profile?JSON.parse(tc.structure_profile):defaultTemplateStructure(site.template_key||tc?.template_key||'')}catch(e){categoryStructure=defaultTemplateStructure(site.template_key||tc?.template_key||'')}
 if(!categoryStructure||!Array.isArray(categoryStructure.sections)||!categoryStructure.sections.length)categoryStructure=defaultTemplateStructure(site.template_key||tc?.template_key||'');
 content_profile=templateCategoryContract(categoryStructure,content_profile,profileType);
 content_profile.settings_schema=Array.isArray(categoryStructure?.settings_schema)?categoryStructure.settings_schema:[];
 try{site.template_settings=JSON.parse(String(site.template_settings_json||'{}'))}catch(e){site.template_settings={}}
 return json({user:{id:user.id,email:user.email,role:user.role},site,content_profile,stats:await stats(env,site.id)})
}
if(route==='service-info'&&request.method==='GET'){
 if(!user)return json({error:'Chưa đăng nhập'},401);
 // Keep the client dashboard resilient for sites created by older NEWSREAL versions.
 // Read each service block independently so one optional promotion column can never
 // leave the whole Client Admin stuck at "Đang tải...".
 try{await ensureCustomerTables(env)}catch(e){console.log('service-info schema ensure:',e?.message||e)}
 try{await syncCompletedRenewalExpiry(env,site.id)}catch(e){console.log('service-info renewal sync:',e?.message||e)}
 let ss=null,cp=null,sp=null;
 try{ss=await env.DB.prepare(`SELECT plan_name,sale_price,payment_status,service_status,started_at,expires_at,domain_status,domain_registered_at,domain_expires_at,registrar FROM service_subscriptions WHERE site_id=?`).bind(site.id).first()}catch(e){console.log('service-info subscription:',e?.message||e)}
 try{cp=await env.DB.prepare(`SELECT full_name,email,phone FROM customer_profiles WHERE site_id=?`).bind(site.id).first()}catch(e){console.log('service-info customer:',e?.message||e)}
 try{sp=await env.DB.prepare(`SELECT * FROM service_promotions WHERE site_id=?`).bind(site.id).first()}catch(e){console.log('service-info promotion:',e?.message||e)}
 const sale=Number(ss?.sale_price||0);
 const listPrice=Number(sp?.list_price||1999000);
 const firstDiscount=Number(sp?.first_discount||0);
 const service={
   plan_name:ss?.plan_name||'Gói website trọn gói',
   payment_status:ss?.payment_status||'unpaid',
   service_status:ss?.service_status||'active',
   started_at:ss?.started_at||null,
   expires_at:ss?.expires_at||null,
   domain_status:ss?.domain_status||'not_configured',
   domain_registered_at:ss?.domain_registered_at||null,
   domain_expires_at:ss?.domain_expires_at||null,
   registrar:ss?.registrar||'Cloudflare',
   customer_name:cp?.full_name||'',customer_email:cp?.email||user.email||'',customer_phone:cp?.phone||'',
   term_months:Number(sp?.term_months||12),
   promotion_name:sp?.promotion_name||'Ưu đãi kích hoạt lần đầu',
   list_price:listPrice,
   first_discount:firstDiscount,
   first_price:Number(sp?.first_price ?? (sale||Math.max(0,listPrice-firstDiscount))),
   renewal_price:Number(sp?.renewal_price||listPrice),
   renewal_status:sp?.renewal_status||'none',
   renewal_stage:sp?.renewal_stage||'none',
   renewal_requested_at:sp?.renewal_requested_at||null,
   renewal_notified_at:sp?.renewal_notified_at||null,
   renewal_payment_sent_at:sp?.renewal_payment_sent_at||null,
   renewal_paid_at:sp?.renewal_paid_at||null,
   renewal_completed_at:sp?.renewal_completed_at||null,
   renewal_selected_months:Number(sp?.renewal_selected_months||sp?.term_months||12),
   renewal_order_code:sp?.renewal_order_code||''
 };
 return json({ok:true,service,site:{name:site.name,domain:site.domain}});
}
if(route==='request-renewal'&&request.method==='POST'){
 if(!user)return json({error:'Chưa đăng nhập'},401);
 const b=await body(request);
 try{
   const pay=await createRenewalPayment(env,site.id,Number(b.years||1));
   return json({ok:true,status:'payment_pending',payment:{order_code:pay.order_code,payment_token:pay.payment_token,years:pay.years,amount:pay.amount,memo:pay.memo,provider:pay.provider,provider_order_code:pay.provider_order_code,qr_code:pay.qr_code,checkout_url:pay.checkout_url,payment_link_id:pay.payment_link_id,qr_url:pay.qr_url,bank_name:pay.bank_name,account_name:pay.account_name,account_number:pay.account_number}});
 }catch(e){return json({error:e.message||'Không tạo được thanh toán gia hạn'},400)}
}
// V20.6.0 — tenant-owned service consultation leads.
if(route==='service-leads'){
  try{await env.DB.prepare(`CREATE TABLE IF NOT EXISTS service_leads(id INTEGER PRIMARY KEY AUTOINCREMENT,site_id INTEGER NOT NULL,customer_name TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',province TEXT NOT NULL DEFAULT '',district TEXT NOT NULL DEFAULT '',need TEXT NOT NULL DEFAULT '',package_title TEXT NOT NULL DEFAULT '',package_category TEXT NOT NULL DEFAULT '',source_url TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'new',note TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run()}catch(e){}
  if(request.method==='POST'){
    const b=await body(request),name=String(b.customer_name||'').trim(),phone=String(b.phone||'').trim();
    if(!name||!phone)return json({error:'Vui lòng nhập họ tên và số điện thoại'},400);
    const r=await env.DB.prepare(`INSERT INTO service_leads(site_id,customer_name,phone,province,district,need,package_title,package_category,source_url) VALUES(?,?,?,?,?,?,?,?,?)`).bind(site.id,name,phone,String(b.province||'').trim(),String(b.district||'').trim(),String(b.need||'').trim(),String(b.package_title||'').trim(),String(b.package_category||'').trim(),String(b.source_url||'').slice(0,500)).run();
    return json({ok:true,id:r.meta.last_row_id,message:'Đã gửi yêu cầu tư vấn'});
  }
  if(request.method==='GET'){
    if(!user)return json({error:'Chưa đăng nhập'},401);
    const {results}=await env.DB.prepare(`SELECT * FROM service_leads WHERE site_id=? ORDER BY id DESC LIMIT 500`).bind(site.id).all();return json({ok:true,leads:results||[]},200,{'Cache-Control':'no-store'});
  }
  if(request.method==='PUT'){
    if(!user)return json({error:'Chưa đăng nhập'},401);const b=await body(request),id=Number(b.id||0);if(!id)return json({error:'Thiếu mã lead'},400);
    await env.DB.prepare(`UPDATE service_leads SET status=?,note=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND site_id=?`).bind(String(b.status||'new'),String(b.note||''),id,site.id).run();return json({ok:true});
  }
}
if(!user)return json({error:'Chưa đăng nhập'},401);

if(route==='seed-demo'){return json({error:'Dữ liệu mẫu chỉ có thể được khởi tạo từ Quản trị tổng'},403)}

try{await env.DB.prepare(`ALTER TABLE posts ADD COLUMN extra_json TEXT NOT NULL DEFAULT '{}'`).run()}catch(e){}
try{await env.DB.prepare(`ALTER TABLE posts ADD COLUMN is_sample INTEGER NOT NULL DEFAULT 0`).run()}catch(e){}
try{await env.DB.prepare(`ALTER TABLE posts ADD COLUMN sample_key TEXT NOT NULL DEFAULT ''`).run()}catch(e){}
try{await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_posts_site_sample ON posts(site_id,is_sample)`).run()}catch(e){}
try{await env.DB.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_site_sample_key ON posts(site_id,sample_key) WHERE sample_key<>''`).run()}catch(e){}
if(route==='posts'){if(request.method==='GET'){const {results}=await env.DB.prepare(`SELECT * FROM posts WHERE site_id=? ORDER BY id DESC`).bind(site.id).all();return json({posts:results},200,user?{'Cache-Control':'no-store'}:publicCache(30,120))}
const b=await body(request);
const missing=[];
if(!String(b.title||'').trim())missing.push('Tiêu đề');
if(!String(b.content||'').trim())missing.push('Mô tả chi tiết');
if((b.type||'property')==='property'){
 if(!String(b.price||'').trim())missing.push('Giá');
 if(!String(b.area||'').trim())missing.push('Diện tích');
 if(!String(b.province||'').trim())missing.push('Tỉnh/Thành phố');
 if(!String(b.district||'').trim())missing.push('Quận/Huyện');
 if(!String(b.address||'').trim())missing.push('Địa chỉ chi tiết');
 if(!String(b.contact_name||'').trim())missing.push('Tên người liên hệ');
 if(!String(b.phone||'').trim())missing.push('Số điện thoại');
 if(!String(b.image||'').trim())missing.push('Ảnh đại diện');
}
if(missing.length)return json({error:'Thiếu thông tin bắt buộc: '+missing.join(', ')},400);
if(request.method==='POST'&&!String(b.listing_code||'').trim()){
 const prefix=(b.type||'property')==='news'?'TT':'BDS';
 const stamp=new Date().toISOString().slice(0,10).replace(/-/g,'');
 const row=await env.DB.prepare(`SELECT coalesce(max(id),0)+1 n FROM posts WHERE site_id=?`).bind(site.id).first();
 b.listing_code=`${prefix}-${String(site.id).padStart(2,'0')}-${stamp}-${String(row?.n||1).padStart(4,'0')}`;
}
const vals=[b.type||'property',b.title||'',b.category||'',b.image||'',b.price||'',b.area||'',b.address||'',b.phone||'',b.content||'',b.status||'published',b.transaction||'',b.property_type||'',b.unit_price||'',b.bedrooms||null,b.bathrooms||null,b.floors||null,b.direction||'',b.legal||'',b.furniture||'',b.province||'',b.district||'',b.ward||'',b.gallery||'',b.contact_name||'',b.featured?1:0,b.verified?1:0,b.listing_code||'',b.frontage||'',String(b.extra_json||'{}')];
if(request.method==='POST'){const r=await env.DB.prepare(`INSERT INTO posts(site_id,type,title,category,image,price,area,address,phone,content,status,author_id,"transaction",property_type,unit_price,bedrooms,bathrooms,floors,direction,legal,furniture,province,district,ward,gallery,contact_name,featured,verified,listing_code,frontage,extra_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(site.id,...vals.slice(0,10),user.id,...vals.slice(10)).run();if(__siteTrial){await env.DB.prepare(`UPDATE website_trials SET post_create_count=post_create_count+1,last_seen_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(__siteTrial.id).run();await trialEvent(env,__siteTrial,'post_created',{post_id:Number(r.meta.last_row_id)})}return json({ok:true,id:r.meta.last_row_id})}
if(request.method==='PUT'){const id=+u.searchParams.get('id');await env.DB.prepare(`UPDATE posts SET type=?,title=?,category=?,image=?,price=?,area=?,address=?,phone=?,content=?,status=?,"transaction"=?,property_type=?,unit_price=?,bedrooms=?,bathrooms=?,floors=?,direction=?,legal=?,furniture=?,province=?,district=?,ward=?,gallery=?,contact_name=?,featured=?,verified=?,listing_code=?,frontage=?,extra_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND site_id=?`).bind(...vals,id,site.id).run();return json({ok:true})}
if(request.method==='DELETE'){await env.DB.prepare(`DELETE FROM posts WHERE id=? AND site_id=?`).bind(+u.searchParams.get('id'),site.id).run();return json({ok:true})}}
if(route==='settings'&&request.method==='PUT'){
 const b=await body(request);
 const publicEmail=String(b.email||'').trim().toLowerCase();
 if(publicEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicEmail))return json({error:'Email liên hệ không hợp lệ'},400);
 await ensureSitePublicSettings(env);await ensureTemplateCatalog(env);
 let structure=defaultTemplateStructure(site.template_key||'');
 try{const tr=await env.DB.prepare(`SELECT structure_profile FROM template_catalog WHERE template_key=? LIMIT 1`).bind(site.template_key||'').first();if(tr?.structure_profile)structure=JSON.parse(tr.structure_profile)}catch(e){}
 const schema=Array.isArray(structure?.settings_schema)?structure.settings_schema:[],allowed=new Map(schema.map(x=>[String(x.key||''),x]));
 const incoming=b.template_settings&&typeof b.template_settings==='object'?b.template_settings:{},clean={};
 for(const [key,def] of allowed){let v=String(incoming[key]??def.default??'').trim();const max=def.type==='textarea'?12000:1000;v=v.slice(0,max);if(def.type==='url'&&v&&!/^https?:\/\//i.test(v))return json({error:`${def.label||key}: link phải bắt đầu bằng http:// hoặc https://`},400);clean[key]=v}
 await env.DB.batch([
   env.DB.prepare(`UPDATE sites SET name=?,phone=?,zalo=?,facebook=? WHERE id=?`).bind(b.name||site.name,b.phone||'',b.zalo||'',b.facebook||'',site.id),
   env.DB.prepare(`INSERT INTO site_public_settings(site_id,contact_email,settings_json,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP)
     ON CONFLICT(site_id) DO UPDATE SET contact_email=excluded.contact_email,settings_json=excluded.settings_json,updated_at=CURRENT_TIMESTAMP`).bind(site.id,publicEmail,JSON.stringify(clean))
 ]);
 try{await env.DB.prepare(`ALTER TABLE sites ADD COLUMN email TEXT DEFAULT ''`).run()}catch(e){}
 try{await env.DB.prepare(`UPDATE sites SET email=? WHERE id=?`).bind(publicEmail,site.id).run()}catch(e){}
 return json({ok:true,email:publicEmail,template_settings:clean})
}
if(route==='password'&&request.method==='PUT'){const b=await body(request),old=await sha256(b.old_password||'');if(old!==user.password_hash)return json({error:'Mật khẩu hiện tại không đúng'},400);if((b.new_password||'').length<8)return json({error:'Mật khẩu mới phải có ít nhất 8 ký tự'},400);await env.DB.prepare(`UPDATE users SET password_hash=? WHERE id=?`).bind(await sha256(b.new_password),user.id).run();return json({ok:true})}
if(route==='stats'){const all=(await stats(env,site.id)).views,last7=(await env.DB.prepare(`SELECT count(*)c FROM pageviews WHERE site_id=? AND created_at>=datetime('now','-7 day')`).bind(site.id).first())?.c||0,last30=(await env.DB.prepare(`SELECT count(*)c FROM pageviews WHERE site_id=? AND created_at>=datetime('now','-30 day')`).bind(site.id).first())?.c||0;const {results}=await env.DB.prepare(`SELECT title,views FROM posts WHERE site_id=? ORDER BY views DESC LIMIT 10`).bind(site.id).all();return json({all,last7,last30,top:results})}
return json({error:'API không tồn tại'},404)}catch(e){return json({error:e.message||String(e)},500)}}
async function registryDomainInfo(domain){
  domain=normalizeDomain(domain); if(!domain)return {ok:false,error:'Tên miền không hợp lệ'};
  try{
    const tld=domain.split('.').pop(),boot=await fetch('https://data.iana.org/rdap/dns.json',{headers:{'Accept':'application/json'}});
    if(!boot.ok)return {ok:false,error:'Không tải được RDAP bootstrap'};
    const bd=await boot.json(); let base='';
    for(const svc of (bd.services||[]))if((svc[0]||[]).map(x=>String(x).toLowerCase()).includes(tld)){base=(svc[1]||[])[0]||'';break}
    const known={com:'https://rdap.verisign.com/com/v1/',net:'https://rdap.verisign.com/net/v1/',org:'https://rdap.publicinterestregistry.org/rdap/'};
    base=base||known[tld]||''; if(!base)return {ok:false,error:'Chưa hỗ trợ đuôi .'+tld};
    const r=await fetch(base.replace(/\/?$/,'/')+'domain/'+encodeURIComponent(domain),{headers:{'Accept':'application/rdap+json, application/json'}});
    if(r.status===404)return {ok:false,available:true}; if(!r.ok)return {ok:false,error:'Registry HTTP '+r.status};
    const d=await r.json(),ev=Array.isArray(d.events)?d.events:[];
    const ed=(names)=>{for(const n of names){const x=ev.find(e=>String(e.eventAction||'').toLowerCase()===n);if(x?.eventDate)return x.eventDate}return null};
    let registrar=''; for(const e of (d.entities||[])){if(!(e.roles||[]).map(x=>String(x).toLowerCase()).includes('registrar'))continue;
      const fn=(e.vcardArray?.[1]||[]).find(x=>x?.[0]==='fn');registrar=String(fn?.[3]||e.handle||'');break}
    return {ok:true,available:false,registered_at:ed(['registration']),expires_at:ed(['expiration','expiry']),registrar};
  }catch(e){return {ok:false,error:e.message||String(e)}}
}


