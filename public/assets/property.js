
function nrDemoUrl(url){
 if(!window.NR_DEMO_PREFIX||!url||typeof url!=='string')return url;
 if(url.startsWith('/api/')||url.startsWith('/assets/')||url.startsWith('/admin')||url.startsWith('/control-center')||url.startsWith('/activate')||url.startsWith('/renewal')||url.startsWith('/reset-password')||url.startsWith('/demo/'))return url;
 return url.startsWith('/')?window.NR_DEMO_PREFIX+url:url;
}
function nrEnableDemoLinks(){
 if(!window.NR_DEMO_PREFIX)return;
 const fix=()=>document.querySelectorAll('a[href^="/"]').forEach(a=>{const h=a.getAttribute('href');if(h&&!h.startsWith('/demo/')&&!h.startsWith('/admin'))a.setAttribute('href',nrDemoUrl(h));});
 fix(); new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});
}
document.addEventListener('DOMContentLoaded',nrEnableDemoLinks);

const pageTenant=new URLSearchParams(location.search).get('tenant')||'';function tenantApiUrl(path){return path+(pageTenant?(path.includes('?')?'&':'?')+'tenant='+encodeURIComponent(pageTenant):'')}

function seoSlug(s=''){
 return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'tin-bat-dong-san';
}
function seoPostUrl(x){
 const base=x.type==='news'?'tin-tuc':(x.transaction==='rent'?'cho-thue':(x.transaction==='sale'?'mua-ban':'bat-dong-san'));
 const u=`/${base}/${seoSlug(x.title)}-p${x.id}`;
 return u+(pageTenant?`?tenant=${encodeURIComponent(pageTenant)}`:'');
}
function seoListingsUrl(transaction='',params={}){
 const base=transaction==='rent'?'/cho-thue/':transaction==='sale'?'/mua-ban/':'/bat-dong-san/';
 const q=new URLSearchParams(params); if(pageTenant)q.set('tenant',pageTenant); const s=q.toString(); return base+(s?'?'+s:'');
}
function fillPublicFooter(site={}){
 const name=cleanSiteName(site.name||'NEWSREAL'), phone=String(site.phone||'').trim(), zalo=String(site.zalo||phone||'').trim(), email=String(site.email||site.contact_email||'').trim();
 document.querySelectorAll('[data-footer-brand]').forEach(el=>el.textContent=name);
 document.querySelectorAll('[data-footer-phone]').forEach(el=>{el.textContent='☎ Hotline: '+(phone||'Đang cập nhật');el.href=phone?'tel:'+phone.replace(/\s/g,''):'#'});
 document.querySelectorAll('[data-footer-zalo]').forEach(el=>{el.textContent='💬 Zalo: '+(zalo||'Đang cập nhật');el.href=zalo?'https://zalo.me/'+zalo.replace(/\D/g,''):'#'});
 document.querySelectorAll('[data-footer-email]').forEach(el=>{el.textContent='✉ Email: '+(email||'Đang cập nhật');el.href=email?'mailto:'+email:'#'});
}

function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function decodeRichHtmlEntities(value=''){
 let out=String(value||'');
 // Some publishers copy fragments as escaped HTML text (&lt;div&gt;...). Decode only
 // when the payload clearly contains rich-text tags, so ordinary prose stays untouched.
 for(let i=0;i<2&&/&lt;\/?(?:p|div|figure|figcaption|img|h[1-6]|ul|ol|li|blockquote|a|br|strong|em)\b/i.test(out);i++){
  const ta=document.createElement('textarea');ta.innerHTML=out;const decoded=ta.value;
  if(decoded===out)break;out=decoded;
 }
 return out;
}
function safeRichHtml(html=''){
 const tpl=document.createElement('template');tpl.innerHTML=decodeRichHtmlEntities(html);
 tpl.content.querySelectorAll('script,style,iframe,object,embed,form,input,button,textarea,select,link,meta,svg').forEach(x=>x.remove());
 tpl.content.querySelectorAll('*').forEach(el=>{
  [...el.attributes].forEach(a=>{
   const n=a.name.toLowerCase(),v=String(a.value||'').trim();
   if(n.startsWith('on')||n==='srcdoc'||n==='id'||n==='class'||n.startsWith('data-'))el.removeAttribute(a.name);
   if(n==='style')el.removeAttribute(a.name);
   if((n==='href'||n==='src')&&/^\s*(?:javascript|data:text\/html):/i.test(v))el.removeAttribute(a.name);
  });
  if(el.tagName==='A'){el.setAttribute('rel','noopener noreferrer');if(/^https?:/i.test(el.getAttribute('href')||''))el.setAttribute('target','_blank')}
  if(el.tagName==='IMG'){el.setAttribute('loading','lazy');el.setAttribute('decoding','async')}
 });
 return tpl.innerHTML;
}

function cleanSiteName(n=''){return String(n||'').replace(/\s*Demo\s*$/i,'').trim()||'Trang Tin'}
let propertyImages=[],propertyImageIndex=0;
function propertySlide(i){
 if(!propertyImages.length)return;
 propertyImageIndex=(i+propertyImages.length)%propertyImages.length;
 const main=document.getElementById('propertyMainImage');if(main)main.src=propertyImages[propertyImageIndex];
 const c=document.getElementById('propertyImageCount');if(c)c.textContent=`${propertyImageIndex+1}/${propertyImages.length}`;
 document.querySelectorAll('.property-thumb').forEach((x,n)=>x.classList.toggle('active',n===propertyImageIndex));
}
function propertyNext(d){propertySlide(propertyImageIndex+d)}
function saveFav(id){let a=JSON.parse(localStorage.getItem('nr_favs')||'[]');if(!a.includes(id))a.push(id);localStorage.setItem('nr_favs',JSON.stringify(a));alert('Đã lưu tin')}
function shareFacebook(){window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(location.href),'_blank','noopener')}
function shareZalo(){window.open('https://zalo.me/share?url='+encodeURIComponent(location.href),'_blank','noopener')}
function shareTelegram(){window.open('https://t.me/share/url?url='+encodeURIComponent(location.href)+'&text='+encodeURIComponent(document.title),'_blank','noopener')}
function shareEmail(){location.href='mailto:?subject='+encodeURIComponent(document.title)+'&body='+encodeURIComponent(location.href)}
async function copyLink(){await navigator.clipboard.writeText(location.href);alert('Đã sao chép liên kết')}
function newsSmallCard(x){
 return `<a class="news-side-item" href="${seoPostUrl(x)}">
  <img src="${esc(x.image||'')}" alt="${esc(x.title)}"><div><span>${esc(x.category||'Tin tức')}</span><b>${esc(x.title)}</b><small>${x.views||0} lượt xem</small></div>
 </a>`;
}
function displayListingCode(code,id){const c=String(code||'').replace(/^DEMO[-_ ]*/i,'').trim();return c||('NR-'+String(id||'').padStart(6,'0'));}
function relatedCard(x){
 const isNews=x.type==='news';
 return `<a class="related-card" href="${seoPostUrl(x)}">
   <img src="${esc(x.image||'')}" alt="${esc(x.title)}">
   <div><span>${esc(x.category||x.property_type||(isNews?'Tin tức':'Bất động sản'))}</span><h3>${esc(x.title)}</h3>
   ${isNews?`<p>${x.views||0} lượt xem</p>`:`<p><b>${esc(x.price||'Liên hệ')}</b>${x.area?' · '+esc(x.area):''}</p><small>📍 ${esc(x.district||x.province||'')}</small>`}</div>
 </a>`;
}

function propertyDiscovery(x){
 const qs=(obj)=>{const o={...obj},tx=o.transaction||'';delete o.transaction;return seoListingsUrl(tx,o)};
 const links=[];
 if(x.district)links.push(['📍 Cùng '+x.district,qs({district:x.district})]);
 else if(x.province)links.push(['📍 Cùng '+x.province,qs({province:x.province})]);
 if(x.property_type)links.push(['🏠 '+x.property_type,qs({property_type:x.property_type})]);
 links.push(['🏷 Nhà đất bán',qs({transaction:'sale'})]);
 links.push(['🔑 Nhà cho thuê',qs({transaction:'rent'})]);
 if(x.province)links.push(['🗺 BĐS '+x.province,qs({province:x.province})]);
 links.push(['♥ Tin đã lưu','/favorites']);
 links.push(['➕ Đăng tin',window.nrTrialAdminUrl&&window.NR_TRIAL_TOKEN?window.nrTrialAdminUrl('newpost'):'/admin?tab=newpost']);
 return `<div class="property-discovery"><div class="property-discovery-head"><div><h3>Khám phá thêm bất động sản</h3><p>Lọc nhanh theo nhu cầu để người xem tiếp tục ở lại website.</p></div><a class="market-all" href="/bat-dong-san/">Xem tất cả →</a></div><div class="property-discovery-links">${links.map(([t,u])=>`<a href="${u}">${esc(t)}</a>`).join('')}</div></div>`;
}
function smartPropertyRelated(current,posts=[],seed=[]){
 const uniq=new Map();
 [...seed,...posts].forEach(x=>{if(x&&x.type==='property'&&String(x.id)!==String(current.id))uniq.set(String(x.id),x)});
 return [...uniq.values()].map(x=>{
   let score=0;
   if(current.district&&x.district===current.district)score+=7;
   if(current.province&&x.province===current.province)score+=4;
   if(current.property_type&&x.property_type===current.property_type)score+=4;
   if(current.transaction&&x.transaction===current.transaction)score+=3;
   score+=(Number(x.featured)||0)*2+(Number(x.views)||0)/10000;
   return {x,score};
 }).sort((a,b)=>b.score-a.score).slice(0,9).map(v=>v.x);
}
function renderNewsDetail(d,x,s){
 detailTypeLabel.textContent='Tin tức & kiến thức';
 breadcrumbSection.textContent='Tin tức';breadcrumbSection.href='/#news';
 const latest=d.latestNews||[],popular=d.popularNews||[],cats=d.newsCategories||[];
 propertyRoot.innerHTML=`
 <div class="news-detail-layout">
  <article class="news-article">
   <div class="news-article-head"><span class="eyebrow">${esc(x.category||'TIN TỨC')}</span><h1>${esc(x.title)}</h1>
    <div class="news-meta">Cập nhật ${esc((x.created_at||'').slice(0,10))} · ${x.views||0} lượt xem</div>
   </div>
   ${x.image?`<img class="news-cover" src="${esc(x.image)}" alt="${esc(x.title)}">`:''}
   <div class="news-article-body">${safeRichHtml(x.content||'')}</div>
   <div class="panel square-panel share-panel"><h2>Chia sẻ bài viết</h2><div class="share-row">
    <button onclick="copyLink()">🔗 Sao chép liên kết</button><button onclick="shareFacebook()">Facebook</button>
    <button onclick="shareZalo()">Zalo</button><button onclick="shareTelegram()">Telegram</button><button onclick="shareEmail()">Email</button>
   </div></div>
  </article>
  <aside class="news-sidebar">
   <div class="news-side-box"><div class="news-side-title">Tin mới nhất</div>${latest.slice(0,4).map(newsSmallCard).join('')||'<p class="muted">Chưa có tin khác.</p>'}</div>
   <div class="news-side-box"><div class="news-side-title">Chuyên mục</div><div class="news-category-list">${cats.map(c=>`<a href="/#news">${esc(c.category)} <span>${c.total}</span></a>`).join('')||'<span class="muted">Chưa có chuyên mục.</span>'}</div></div>
   <div class="news-side-box"><div class="news-side-title">Được quan tâm</div>${popular.slice(0,4).map(newsSmallCard).join('')}</div>
  </aside>
 </div>
 <section class="related-section"><div class="section-head"><div><small class="section-kicker">ĐỌC THÊM</small><h2>Bài viết liên quan</h2></div></div>
  <div class="related-grid">${(d.related||[]).map(relatedCard).join('')||'<div class="category-empty">Chưa có bài viết liên quan.</div>'}</div>
 </section>`;
}

function marketLinksBox(x){
 const hp=['Hồng Bàng','Ngô Quyền','Lê Chân','Hải An','Kiến An','Đồ Sơn','Dương Kinh','An Dương','Thủy Nguyên','Kiến Thụy','Tiên Lãng','Vĩnh Bảo','Cát Hải'];
 const provinces=['Hà Nội','TP. Hồ Chí Minh','Hải Phòng','Đà Nẵng','Quảng Ninh','Bắc Ninh','Hưng Yên','Hải Dương','Thanh Hóa','Nghệ An','Khánh Hòa','Bình Dương','Đồng Nai','Long An','Bà Rịa - Vũng Tàu','Cần Thơ'];
 const local=(x.province||'').toLowerCase().includes('hải phòng'); const items=local?hp:provinces; const key=local?'district':'province';
 return `<div class="panel square-panel market-links"><div class="market-links-title">MUA BÁN NHÀ ĐẤT</div><div class="market-link-grid">${items.map(v=>`<a href="/listings?${key}=${encodeURIComponent(v)}">${esc(v)}</a>`).join('')}</div><a class="market-all" href="/listings">Xem tất cả khu vực →</a></div>`;
}
function renderPropertyDetail(d,x,s){
 detailTypeLabel.textContent='Chi tiết bất động sản';
 breadcrumbSection.textContent='Bất động sản';breadcrumbSection.href='/listings';
 propertyImages=[x.image,...String(x.gallery||'').split(',').map(v=>v.trim())].filter(Boolean);
 propertyImages=[...new Set(propertyImages)];const first=propertyImages[0]||'';
 propertyRoot.innerHTML=`<div class="property-gallery-slider">
   <div class="property-main-media"><img id="propertyMainImage" src="${esc(first)}" alt="${esc(x.title)}">
    ${propertyImages.length>1?`<button class="property-arrow prev" onclick="propertyNext(-1)">‹</button><button class="property-arrow next" onclick="propertyNext(1)">›</button><span id="propertyImageCount" class="property-count">1/${propertyImages.length}</span>`:''}
   </div>
   ${propertyImages.length>1?`<div class="property-thumbs">${propertyImages.map((img,i)=>`<button class="property-thumb ${i===0?'active':''}" onclick="propertySlide(${i})"><img src="${esc(img)}" alt=""></button>`).join('')}</div>`:''}
 </div>
 <div class="content-layout"><div>
   <div class="property-head"><div><span class="eyebrow">${esc(x.property_type||x.category||'BẤT ĐỘNG SẢN')}</span><h1>${esc(x.title)}</h1><div class="listing-location">📍 ${esc(x.address||[x.ward,x.district,x.province].filter(Boolean).join(', '))}</div></div><div class="property-price">${esc(x.price||'Liên hệ')}</div></div>
   <div class="facts"><div class="fact"><span>Diện tích</span><b>${esc(x.area||'—')}</b></div><div class="fact"><span>Phòng ngủ</span><b>${x.bedrooms||'—'}</b></div><div class="fact"><span>Phòng tắm</span><b>${x.bathrooms||'—'}</b></div><div class="fact"><span>Pháp lý</span><b>${esc(x.legal||'—')}</b></div></div>
   <div class="panel square-panel"><h2>Thông tin mô tả</h2><div class="article-body">${safeRichHtml(x.content||'')}</div></div>
   <div class="panel square-panel" style="margin-top:16px"><h2>Thông tin chi tiết</h2><div class="facts">
    <div class="fact"><span>Đơn giá</span><b>${esc(x.unit_price||'—')}</b></div><div class="fact"><span>Hướng</span><b>${esc(x.direction||'—')}</b></div>
    <div class="fact"><span>Số tầng</span><b>${x.floors||'—'}</b></div><div class="fact"><span>Mặt tiền</span><b>${esc(x.frontage||'—')}</b></div>
    <div class="fact"><span>Nội thất</span><b>${esc(x.furniture||'—')}</b></div><div class="fact"><span>Mã tin</span><b>${esc(displayListingCode(x.listing_code,x.id))}</b></div>
    <div class="fact"><span>Trạng thái</span><b>${x.verified?'Đã xác minh':'Chưa xác minh'}</b></div><div class="fact"><span>Lượt xem</span><b>${x.views||0}</b></div>
   </div></div>
   <div class="panel square-panel share-panel" style="margin-top:16px"><h2>Chia sẻ tin này</h2><div class="share-row">
    <button onclick="copyLink()">🔗 Sao chép liên kết</button><button onclick="shareFacebook()">Facebook</button><button onclick="shareZalo()">Zalo</button><button onclick="shareTelegram()">Telegram</button><button onclick="shareEmail()">Email</button>
   </div></div>
  </div>
  <aside class="sidebar property-sidebar">
   <div class="panel square-panel agent-card"><div class="agent-row"><div class="avatar">${esc((x.contact_name||'A').slice(0,1))}</div><div><b>${esc(x.contact_name||'Người đăng tin')}</b><div class="meta">${x.verified?'<span class="detail-verified">Tin đã xác minh</span>':'Liên hệ tư vấn'}</div></div></div>
    <div class="contact-stack"><a class="btn" href="tel:${String(x.phone||s.phone||'').replace(/\s/g,'')}">📞 ${esc(x.phone||s.phone||'Gọi tư vấn')}</a>${s.zalo?`<a class="btn ghost" href="https://zalo.me/${String(s.zalo).replace(/\D/g,'')}" target="_blank">💬 Chat Zalo</a>`:''}${s.facebook?`<a class="btn ghost" href="${esc(s.facebook)}" target="_blank">Facebook</a>`:'<a class="btn ghost" href="https://www.facebook.com/groups/batdongsanhaiphong2021" target="_blank">Facebook</a>'}${s.email?`<a class="btn ghost" href="mailto:${esc(s.email)}">✉ Email</a>`:''}<button class="btn dark" onclick="saveFav(${x.id})">♥ Lưu tin</button></div>
   </div>
   ${marketLinksBox(x)}
  </aside>
 </div>
 ${propertyDiscovery(x)}
 <section class="related-section"><div class="section-head"><div><small class="section-kicker">CÓ THỂ BẠN QUAN TÂM</small><h2>Bất động sản liên quan</h2></div><a href="/bat-dong-san/">Xem thêm →</a></div>
  <div class="related-grid property-related-grid">${(d.related||[]).map(relatedCard).join('')||'<div class="category-empty">Chưa có tin liên quan.</div>'}</div>
 </section>`;
}
(async()=>{try{
 const id=new URLSearchParams(location.search).get('id')||((location.pathname.match(/-p(\d+)\/?$/)||[])[1]||'');if(!id)throw new Error('Thiếu mã bài viết');
 let d=null,x=null,s=null;
 const estateDemo=/^mau-[1-5]$/.test(String(window.NR_DEMO_THEME||''));
 if(estateDemo && Number(id)>=910000){
   const sr=await fetch(tenantApiUrl('/api/site'));if(!sr.ok)throw new Error(await sr.text());
   const sd=await sr.json();x=(sd.posts||[]).find(p=>Number(p.id)===Number(id));
   if(!x)throw new Error('Không tìm thấy bài viết demo');
   d={post:x,related:smartPropertyRelated(x,(sd.posts||[]),[]),site:sd.site};s=sd.site||{};
 }else{
   const r=await fetch(tenantApiUrl('/api/article?id='+id));if(!r.ok)throw new Error(await r.text());
   d=await r.json();x=d.post;s=d.site||{};
 }
 const name=cleanSiteName(s.name);document.body.classList.toggle('theme-estate-green',s?.preset==='estate_green');
 if(x.type==='property'){try{const sr=await fetch(tenantApiUrl('/api/site'));if(sr.ok){const sd=await sr.json();d.related=smartPropertyRelated(x,(sd.posts||[]),(d.related||[]));}}catch(_){}}
 brandName.textContent=name;fillPublicFooter(s);if(window.footerDetailBrand)footerDetailBrand.textContent=name;
 topContact.textContent='Hotline: '+(s.phone||'—');
 const demoKey=String(window.NR_DEMO_THEME||'');
 const demoLabels={'mau-1':'BĐS Mẫu 1','mau-2':'BĐS Mẫu 2','mau-3':'BĐS Mẫu 3','mau-4':'BĐS Mẫu 4','mau-5':'BĐS Mẫu 5'};
 document.title=demoLabels[demoKey]?x.title+' | '+demoLabels[demoKey]+' · Demo':x.title+' — '+name;
 crumb.textContent=x.title;
 if(x.type==='news')renderNewsDetail(d,x,s);else renderPropertyDetail(d,x,s);
}catch(e){propertyRoot.innerHTML='<div class="panel"><h2>Không tìm thấy bài viết</h2><p>'+esc(e.message)+'</p></div>'}})();

;(()=>{const b=document.getElementById('detailMenuToggle'),n=document.getElementById('detailNav');if(b&&n){b.setAttribute('aria-expanded','false');b.onclick=(e)=>{e.stopPropagation();const on=n.classList.toggle('mobile-open');b.setAttribute('aria-expanded',String(on));};n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('mobile-open');b.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(!n.contains(e.target)&&e.target!==b){n.classList.remove('mobile-open');b.setAttribute('aria-expanded','false')}});}})();
