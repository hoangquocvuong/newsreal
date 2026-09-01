
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

function displayListingCode(code,id){const c=String(code||'').replace(/^DEMO[-_ ]*/i,'').trim();return c||('NR-'+String(id||'').padStart(6,'0'));}

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
const pageTenant=new URLSearchParams(location.search).get('tenant')||'';function tenantApiUrl(path){return path+(pageTenant?(path.includes('?')?'&':'?')+'tenant='+encodeURIComponent(pageTenant):'')}
function cleanSiteName(n=''){return String(n||'').replace(/\s*Demo\s*$/i,'').trim()||'Trang Tin';}

function fillPublicFooter(site={}){
 const name=cleanSiteName(site.name||'NEWSREAL'), phone=String(site.phone||'').trim(), zalo=String(site.zalo||phone||'').trim(), email=String(site.email||site.contact_email||'').trim();
 document.querySelectorAll('[data-footer-brand]').forEach(el=>el.textContent=name);
 document.querySelectorAll('[data-footer-phone]').forEach(el=>{el.textContent='☎ Hotline: '+(phone||'Đang cập nhật');el.href=phone?'tel:'+phone.replace(/\s/g,''):'#'});
 document.querySelectorAll('[data-footer-zalo]').forEach(el=>{el.textContent='💬 Zalo: '+(zalo||'Đang cập nhật');el.href=zalo?'https://zalo.me/'+zalo.replace(/\D/g,''):'#'});
 document.querySelectorAll('[data-footer-email]').forEach(el=>{el.textContent='✉ Email: '+(email||'Đang cập nhật');el.href=email?'mailto:'+email:'#'});
}

function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function propertyCard(x){
 const favs=JSON.parse(localStorage.getItem('nr_favs')||'[]'),liked=favs.includes(x.id);
 const location=[x.ward,x.district,x.province].filter(Boolean).join(', ')||x.address||'Chưa cập nhật';
 return `<article class="listing-card rich-listing-card">
   <a class="listing-img" href="${seoPostUrl(x)}">${x.image?`<img src="${esc(x.image)}" alt="${esc(x.title)}">`:''}
     <span class="badge">${x.transaction==='rent'?'Cho thuê':'Mua bán'}${x.verified?' · ✓ Xác minh':''}</span>
   </a>
   <div class="listing-body">
     <div class="listing-headline"><div class="eyebrow">${esc(x.property_type||x.category||'Bất động sản')}</div><button class="fav" onclick="toggleFav(event,${x.id})">${liked?'♥':'♡'}</button></div>
     <a class="listing-title" href="${seoPostUrl(x)}">${esc(x.title)}</a>
     <div class="listing-price">${esc(x.price||'Liên hệ')} ${x.unit_price?`<small>· ${esc(x.unit_price)}</small>`:''}</div>
     <div class="listing-meta rich-listing-meta">
       <span><b>${esc(x.area||'—')}</b><small>Diện tích</small></span>
       <span><b>${x.bedrooms||'—'}</b><small>Phòng ngủ</small></span>
       <span><b>${x.bathrooms||'—'}</b><small>WC</small></span>
       <span><b>${x.floors||'—'}</b><small>Tầng</small></span>
     </div>
     <div class="listing-specs">
       ${x.frontage?`<span>Mặt tiền ${esc(x.frontage)}</span>`:''}
       ${x.direction?`<span>Hướng ${esc(x.direction)}</span>`:''}
       ${x.legal?`<span>${esc(x.legal)}</span>`:''}
     </div>
     <div class="listing-location">📍 ${esc(location)}</div>
     <div class="listing-footer"><span>${esc(displayListingCode(x.listing_code,x.id))}</span><span>${x.views||0} lượt xem</span></div>
   </div>
 </article>`;
}
function toggleFav(e,id){
 e.preventDefault();e.stopPropagation();
 let a=JSON.parse(localStorage.getItem('nr_favs')||'[]');
 a=a.includes(id)?a.filter(x=>x!==id):[...a,id];
 localStorage.setItem('nr_favs',JSON.stringify(a));
 if(!a.includes(id)){
   const card=e.currentTarget.closest('article'); if(card)card.remove();
   if(!favGrid.querySelector('article'))favGrid.innerHTML='<div class="empty theme2-empty">Bạn chưa lưu tin nào.</div>';
 }else e.currentTarget.textContent='♥';
}


function theme2FavoriteCard(x){
 const img=x.image||'';
 const location=[x.district,x.province].filter(Boolean).join(', ')||x.address||'Đang cập nhật';
 return `<article class="t2-card">
  <a class="t2-card-media" href="${seoPostUrl(x)}">
   ${img?`<img src="${esc(img)}" alt="${esc(x.title)}">`:''}
   <span class="t2-featured">Đã lưu</span>
   <span class="t2-type">${esc(x.property_type||'BĐS')}</span>
   <button class="t2-fav-btn saved" type="button" aria-label="Bỏ lưu tin" onclick="toggleFav(event,${x.id})">♥</button>
   <span class="t2-img-meta">⌖ ${esc(location)}</span>
  </a>
  <div class="t2-card-body"><h3><a href="${seoPostUrl(x)}">${esc(x.title)}</a></h3><div class="t2-price">${esc(x.price||'Liên hệ')}</div></div>
 </article>`;
}
(async()=>{
 const d=await fetch(tenantApiUrl('/api/site')).then(r=>r.json());
 brandName.textContent=cleanSiteName(d.site.name);fillPublicFooter(d.site);
 const ids=JSON.parse(localStorage.getItem('nr_favs')||'[]');
 const a=(d.posts||[]).filter(x=>ids.includes(x.id));
 const isTheme2=document.body.classList.contains('theme-estate-green')||window.NR_DEMO_THEME==='mau-2';
 if(isTheme2){
   document.body.classList.add('theme-estate-green','theme2-favorites-page');
   favGrid.className='t2-card-grid t2-card-grid-latest theme2-favorites-grid';
   favGrid.innerHTML=a.map(theme2FavoriteCard).join('')||'<div class="empty theme2-empty">Bạn chưa lưu tin nào.</div>';
 }else{
   favGrid.innerHTML=a.map(propertyCard).join('')||'<div class="empty">Bạn chưa lưu tin nào.</div>';
 }
})();

;(()=>{const b=document.getElementById('favoritesMenuToggle'),n=document.getElementById('favoritesNav');if(b&&n)b.onclick=()=>n.classList.toggle('mobile-open')})();
