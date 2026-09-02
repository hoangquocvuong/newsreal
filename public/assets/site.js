
/* V14.3 — canonical BĐS demo route guard */
(function(){
 const m=location.pathname.match(/^\/demo\/(mau-[1-5])(?:\/(.*))?$/i);
 if(!m)return;
 const tail=String(m[2]||'').replace(/^\/+|\/+$/g,'');
 const dest='/demo/bat-dong-san/'+m[1].toLowerCase()+'/'+(tail?tail+'/':'')+location.search+location.hash;
 location.replace(dest);
})();


function nrDemoUrl(url){
 if(!window.NR_DEMO_PREFIX||!url||typeof url!=='string')return url;
 if(url.startsWith('/api/')||url.startsWith('/assets/')||url.startsWith('/admin')||url.startsWith('/control-center')||url.startsWith('/activate')||url.startsWith('/renewal')||url.startsWith('/reset-password')||url.startsWith('/demo/'))return url;
 return url.startsWith('/')?window.NR_DEMO_PREFIX+url:url;
}
function nrEnableDemoLinks(){
 if(!window.NR_DEMO_PREFIX)return;
 const fix=()=>document.querySelectorAll('a[href^="/"]').forEach(a=>{
   const h=a.getAttribute('href');
   if(!h||a.dataset.demoExternal==='1'||h.startsWith('/demo/')||h.startsWith('/admin')||h.startsWith('/templates/')||h.startsWith('/?template='))return;
   a.setAttribute('href',nrDemoUrl(h));
 });
 fix(); new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});
}
document.addEventListener('DOMContentLoaded',nrEnableDemoLinks);

function nrDemoAdminUrl(templateKey='',tab=''){
 const key=String(templateKey||window.NR_DEMO_THEME||'').trim();
 if(window.NR_TRIAL_TOKEN){
  const q=new URLSearchParams();
  if(window.NR_TRIAL_TENANT)q.set('tenant',window.NR_TRIAL_TENANT);
  q.set('nr_trial',window.NR_TRIAL_TOKEN);
  if(key)q.set('template',key);
  if(tab)q.set('tab',tab);
  return '/admin?'+q.toString();
 }
 const q=new URLSearchParams();
 if(key)q.set('template',key);
 if(tab)q.set('tab',tab);
 return 'https://batdongsan2027.org.uk/admin'+(q.toString()?'?'+q.toString():'');
}

const pageTenant=new URLSearchParams(location.search).get('tenant')||'';function tenantApiUrl(path){return path+(pageTenant?(path.includes('?')?'&':'?')+'tenant='+encodeURIComponent(pageTenant):'')}

// V20.7.8 — Fast demo navigation cache + predictive prefetch.
// Showroom demo data is immutable during a browsing session, so it can be reused
// across homepage/category/article navigations. Trial/client data is never cached here.
const NR_FAST_NAV_VERSION='20.7.7';
function nrFastDemoCacheEnabled(){
  return !!window.NR_DEMO_THEME&&!window.NR_TRIAL_TOKEN&&!window.NR_CLIENT_SIM&&new URLSearchParams(location.search).get('nr_client')!=='1';
}
function nrFastCacheKey(kind,key=''){return `nrfast:${NR_FAST_NAV_VERSION}:${kind}:${String(window.NR_DEMO_THEME||'')}:${pageTenant}:${key}`}
function nrFastCacheRead(kind,key='',ttl=300000){
  if(!nrFastDemoCacheEnabled())return null;
  try{const raw=sessionStorage.getItem(nrFastCacheKey(kind,key));if(!raw)return null;const x=JSON.parse(raw);if(!x||Date.now()-Number(x.t||0)>ttl){sessionStorage.removeItem(nrFastCacheKey(kind,key));return null}return x.d}catch(e){return null}
}
function nrFastCacheWrite(kind,key='',data){
  if(!nrFastDemoCacheEnabled())return;
  try{sessionStorage.setItem(nrFastCacheKey(kind,key),JSON.stringify({t:Date.now(),d:data}))}catch(e){}
}
async function nrFetchJsonCached(url,{kind='json',key='',ttl=300000,options={}}={}){
  const cached=nrFastCacheRead(kind,key,ttl);if(cached)return cached;
  const r=await fetch(url,options),d=await r.json();if(!r.ok)throw new Error(d?.error||'Không tải được dữ liệu');nrFastCacheWrite(kind,key,d);return d;
}
function nrInstallPredictivePrefetch(){
  if(window.__nrPredictivePrefetchInstalled)return;window.__nrPredictivePrefetchInstalled=1;
  const done=new Set();
  const warm=(a)=>{try{if(!a||a.target==='_blank'||a.hasAttribute('download'))return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||!u.pathname.startsWith('/demo/'))return;const k=u.pathname+u.search;if(done.has(k)||done.size>24)return;done.add(k);fetch(u.href,{method:'GET',credentials:'same-origin',cache:'force-cache',priority:'low'}).catch(()=>{})}catch(e){}};
  document.addEventListener('pointerover',e=>warm(e.target?.closest?.('a[href]')),{passive:true});
  document.addEventListener('touchstart',e=>warm(e.target?.closest?.('a[href]')),{passive:true});
}

// V20.7.8 — Sidebar Follow Contract V3.
// Do not rely on CSS sticky for tall sidebars: a sticky element taller than the
// usable viewport can either appear frozen or start with its heading hidden.
// Instead the sidebar follows the article runway with a scroll-synchronised
// transform. Short sidebars pin below the real sticky header stack. Tall
// sidebars scroll naturally until their bottom reaches the viewport, then stay
// with the article. No nested/private sidebar scrollbar is introduced.
function nrStickyHeaderOffset(){
  let bottom=0;
  const sels=['.demo-showroom-header','.demo-customer-bar','.demo-preview-bar','.topbar','.header','.n3-nav','.np-header','.nmin-nav','.tel-nav'];
  document.querySelectorAll(sels.join(',')).forEach(el=>{
    const cs=getComputedStyle(el),r=el.getBoundingClientRect();
    if((cs.position==='sticky'||cs.position==='fixed')&&r.bottom>0&&r.top<=3)bottom=Math.max(bottom,r.bottom);
  });
  return Math.max(16,Math.ceil(bottom+12));
}
function nrDocTop(el){let y=0,n=el;while(n){y+=Number(n.offsetTop||0);n=n.offsetParent}return y}
function nrActivateSidebarFollow(root=document){
  const old=[...document.querySelectorAll('.nr-sidebar-follow-host')];
  old.forEach(h=>{h.style.removeProperty('--nr-sidebar-follow-y');h.classList.remove('nr-sidebar-follow-host','nr-sidebar-follow-short','nr-sidebar-follow-tall')});
  if(innerWidth<=900)return;
  const candidates=[...root.querySelectorAll('.news-sticky-sidebar,.news-home-sidebar,.news-article-sidebar,.np-home-sidebar,.n3-popular,.content-layout>.sidebar,.content-layout>.news-sidebar')];
  const hosts=[];
  candidates.forEach(node=>{
    let host=node;
    const aside=node.closest?.('aside');
    if(aside&&aside.contains(node))host=aside;
    if(!hosts.includes(host))hosts.push(host);
    host.classList.add('nr-sidebar-follow-host');
    if(node!==host)node.classList.add('nr-sidebar-follow-inner');
  });
  if(!hosts.length)return;
  window.__nrSidebarFollowHosts=hosts;
  let raf=0;
  const update=()=>{
    raf=0;
    if(innerWidth<=900){hosts.forEach(h=>h.style.removeProperty('--nr-sidebar-follow-y'));return}
    const headerTop=nrStickyHeaderOffset(),bottomGap=16,sy=window.scrollY||document.documentElement.scrollTop||0;
    hosts.forEach(host=>{
      const container=host.parentElement;if(!container)return;
      const h=Math.ceil(host.offsetHeight||host.getBoundingClientRect().height||0);
      const naturalDocTop=nrDocTop(host),containerDocTop=nrDocTop(container);
      const naturalViewportTop=naturalDocTop-sy;
      const available=Math.max(180,innerHeight-headerTop-bottomGap);
      let desiredViewportTop=naturalViewportTop;
      if(h<=available){
        host.classList.add('nr-sidebar-follow-short');host.classList.remove('nr-sidebar-follow-tall');
        desiredViewportTop=Math.max(headerTop,naturalViewportTop);
      }else{
        host.classList.add('nr-sidebar-follow-tall');host.classList.remove('nr-sidebar-follow-short');
        // Let the top/title leave the viewport naturally. Only once the whole
        // sidebar has travelled enough for its bottom to be visible do we hold
        // that bottom in view. This avoids the "missing sidebar title" bug.
        const bottomStickTop=innerHeight-h-bottomGap;
        desiredViewportTop=Math.max(bottomStickTop,naturalViewportTop);
      }
      let dy=Math.max(0,desiredViewportTop-naturalViewportTop);
      const localTop=Math.max(0,naturalDocTop-containerDocTop);
      const maxDy=Math.max(0,(container.offsetHeight||0)-localTop-h);
      dy=Math.min(dy,maxDy);
      host.style.setProperty('--nr-sidebar-follow-y',`${Math.round(dy)}px`);
    });
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(update)};
  // Replace the previous listener contract with one shared passive listener.
  if(!window.__nrSidebarFollowScrollInstalled){
    window.__nrSidebarFollowScrollInstalled=1;
    addEventListener('scroll',()=>{const hs=window.__nrSidebarFollowHosts||[];if(hs.length)schedule()},{passive:true});
    addEventListener('resize',schedule,{passive:true});
  }
  if('ResizeObserver'in window){
    window.__nrSidebarFollowRO=window.__nrSidebarFollowRO||new ResizeObserver(schedule);
    hosts.forEach(h=>{try{window.__nrSidebarFollowRO.observe(h);if(h.parentElement)window.__nrSidebarFollowRO.observe(h.parentElement)}catch(e){}});
  }
  requestAnimationFrame(update);
}

function seoSlug(s=''){
 return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'tin-bat-dong-san';
}
function seoPostUrl(x){
 const base=x.type==='news'?'tin-tuc':(x.transaction==='rent'?'cho-thue':(x.transaction==='buy'?'mua':(x.transaction==='sale'?'ban':'bat-dong-san')));
 const u=`/${base}/${seoSlug(x.title)}-p${x.id}`;
 return u+(pageTenant?`?tenant=${encodeURIComponent(pageTenant)}`:'');
}
function seoListingsUrl(transaction='',params={}){
 const base=transaction==='rent'?'/cho-thue/':transaction==='buy'?'/mua/':transaction==='sale'?'/ban/':'/bat-dong-san/';
 const q=new URLSearchParams(params); if(pageTenant)q.set('tenant',pageTenant); const s=q.toString(); return base+(s?'?'+s:'');
}
function cleanSiteName(n=''){return String(n||'').replace(/\s*Demo\s*$/i,'').trim()||'Trang Tin';}

let SITE_DATA=null, heroIndex=0, heroTimer=null, selectedTransaction='sale';

function fillPublicFooter(site={}){
 const name=cleanSiteName(site.name||'NEWSREAL'), phone=String(site.phone||'').trim(), zalo=String(site.zalo||phone||'').trim(), email=String(site.email||site.contact_email||'').trim();
 document.querySelectorAll('[data-footer-brand]').forEach(el=>el.textContent=name);
 document.querySelectorAll('[data-footer-phone]').forEach(el=>{el.textContent='☎ Hotline: '+(phone||'Đang cập nhật');el.href=phone?'tel:'+phone.replace(/\s/g,''):'#'});
 document.querySelectorAll('[data-footer-zalo]').forEach(el=>{el.textContent='💬 Zalo: '+(zalo||'Đang cập nhật');el.href=zalo?'https://zalo.me/'+zalo.replace(/\D/g,''):'#'});
 document.querySelectorAll('[data-footer-email]').forEach(el=>{el.textContent='✉ Email: '+(email||'Đang cập nhật');el.href=email?'mailto:'+email:'#'});
}

function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function nrDecodeRichHtml(value=''){
 let out=String(value||'');
 for(let i=0;i<4;i++){
  if(!/(?:&lt;|&#60;|&amp;lt;|&quot;|&#34;)/i.test(out))break;
  const ta=document.createElement('textarea');ta.innerHTML=out;const next=ta.value;
  if(next===out)break;out=next;
 }
 return out;
}
function nrSafeRichHtml(value=''){
 const source=nrDecodeRichHtml(value);
 const tpl=document.createElement('template');tpl.innerHTML=source;
 const out=document.createElement('div');
 const safeUrl=v=>{try{const u=new URL(String(v||'').trim(),location.href);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
 const inline=new Set(['STRONG','B','EM','I','U','S','BR','A']);
 const blocks=new Set(['P','H2','H3','H4','UL','OL','LI','BLOCKQUOTE','FIGURE','FIGCAPTION']);
 function walk(node,parent){
  if(node.nodeType===Node.TEXT_NODE){parent.appendChild(document.createTextNode(node.nodeValue||''));return}
  if(node.nodeType!==Node.ELEMENT_NODE)return;const tag=node.tagName;
  if(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','TEXTAREA','SELECT','OPTION','LINK','META','SVG','CANVAS','NOSCRIPT','VIDEO','AUDIO'].includes(tag))return;
  if(tag==='IMG'){
   const src=safeUrl(node.getAttribute('src')||node.getAttribute('data-src')||node.getAttribute('data-original')||node.getAttribute('data-lazy-src'));if(!src)return;
   const img=document.createElement('img');img.src=src;img.alt=node.getAttribute('alt')||'';img.loading='lazy';img.decoding='async';parent.appendChild(img);return;
  }
  if(inline.has(tag)){
   const el=document.createElement(tag==='B'?'strong':tag==='I'?'em':tag.toLowerCase());
   if(tag==='A'){const href=safeUrl(node.getAttribute('href'));if(!href){[...node.childNodes].forEach(c=>walk(c,parent));return}el.href=href;el.rel='noopener noreferrer';el.target='_blank'}
   [...node.childNodes].forEach(c=>walk(c,el));parent.appendChild(el);return;
  }
  if(blocks.has(tag)){
   const el=document.createElement(tag.toLowerCase());[...node.childNodes].forEach(c=>walk(c,el));
   if((tag==='P'||/^H[2-4]$/.test(tag)||tag==='LI'||tag==='BLOCKQUOTE'||tag==='FIGCAPTION')&&!el.textContent.trim()&&!el.querySelector('img,br'))return;
   parent.appendChild(el);return;
  }
  [...node.childNodes].forEach(c=>walk(c,parent));
 }
 [...tpl.content.childNodes].forEach(n=>walk(n,out));
 return out.innerHTML;
}
function getImages(x){
  return [x.image,...String(x.gallery||'').split(',').map(v=>v.trim())].filter(Boolean);
}
function fallbackImage(){
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="100%" height="100%" fill="#e9eef6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8291a8" font-family="Arial" font-size="34">NewsReal</text></svg>`);
}
function nrOptimizedImage(src,width=720){
 let u=String(src||'').replace(/&amp;/g,'&');
 if(!u)return fallbackImage();
 try{
  const x=new URL(u,location.origin);
  if(x.hostname==='images.unsplash.com'){
   x.searchParams.set('auto','format');
   x.searchParams.set('fit','crop');
   x.searchParams.set('w',String(Math.max(320,Math.min(960,Number(width||720)))));
   x.searchParams.set('q','72');
   return x.toString();
  }
 }catch(e){}
 return u;
}
function nrImgTag(src,alt='',cls='',opts={}){
 const eager=!!opts.eager;
 const safe=esc(nrOptimizedImage(src,opts.width||(eager?900:720)));
 return `<img${cls?` class="${esc(cls)}"`:''} src="${safe}" alt="${esc(alt)}" loading="${eager?'eager':'lazy'}" decoding="async" fetchpriority="${eager?'high':'low'}" onerror="this.onerror=null;this.src='${fallbackImage()}'">`;
}
function favState(id){return JSON.parse(localStorage.getItem('nr_favs')||'[]').includes(id)}
function toggleFav(e,id){e.preventDefault();e.stopPropagation();let a=JSON.parse(localStorage.getItem('nr_favs')||'[]');a=a.includes(id)?a.filter(x=>x!==id):[...a,id];localStorage.setItem('nr_favs',JSON.stringify(a));e.currentTarget.textContent=a.includes(id)?'♥':'♡'}
function toggleTheme2Fav(e,id){
 e.preventDefault();e.stopPropagation();
 let a=JSON.parse(localStorage.getItem('nr_favs')||'[]');
 a=a.includes(id)?a.filter(x=>x!==id):[...a,id];
 localStorage.setItem('nr_favs',JSON.stringify(a));
 const saved=a.includes(id);
 e.currentTarget.textContent=saved?'♥':'♡';
 e.currentTarget.classList.toggle('saved',saved);
 e.currentTarget.setAttribute('aria-label',saved?'Bỏ lưu tin':'Lưu tin');
}


function displayListingCode(code,id){const c=String(code||'').replace(/^DEMO[-_ ]*/i,'').trim();return c||('NR-'+String(id||'').padStart(6,'0'));}
function card(x){
  const imgs=getImages(x), first=imgs[0]||fallbackImage();
  const location=[x.ward,x.district,x.province].filter(Boolean).join(', ')||x.address||'Chưa cập nhật';
  const status=x.verified?'<span class="verified-status">Đã xác minh</span>':'Tin thường';
  return `<article class="card property-card rich-card">
    <a href="${seoPostUrl(x)}" class="card-img property-media" data-id="${x.id}" data-index="0">
      <img src="${esc(first)}" alt="${esc(x.title)}">
      <span class="price">${esc(x.price||'Liên hệ')}</span>
      ${x.featured?'<span class="featured-label">NỔI BẬT</span>':''}
    </a>
    <div class="card-body">
      <div class="card-topline">
        <span class="pill">${x.transaction==='rent'?'CHO THUÊ':esc(x.property_type||'NHÀ ĐẤT BÁN')}</span>
        <button class="fav-card-inline" onclick="toggleFav(event,${x.id})">${favState(x.id)?'♥':'♡'}</button>
      </div>
      <h3><a href="${seoPostUrl(x)}">${esc(x.title)}</a></h3>
      <div class="card-price-line"><b>${esc(x.price||'Liên hệ')}</b>${x.unit_price?`<span>${esc(x.unit_price)}</span>`:''}</div>
      <div class="rich-facts">
        ${x.area?`<span><b>${esc(x.area)}</b><small>Diện tích</small></span>`:''}
        ${x.bedrooms?`<span><b>${x.bedrooms}</b><small>Phòng ngủ</small></span>`:''}
        ${x.bathrooms?`<span><b>${x.bathrooms}</b><small>WC</small></span>`:''}
        ${x.floors?`<span><b>${x.floors}</b><small>Tầng</small></span>`:''}
      </div>
      <div class="rich-extra">
        ${x.frontage?`<span>Mặt tiền: <b>${esc(x.frontage)}</b></span>`:''}
        ${x.direction?`<span>Hướng: <b>${esc(x.direction)}</b></span>`:''}
        ${x.legal?`<span>Pháp lý: <b>${esc(x.legal)}</b></span>`:''}
      </div>
      <div class="listing-location">📍 ${esc(location)}</div>
      <div class="rich-footer"><span>${esc(displayListingCode(x.listing_code,x.id))}</span><span>${status}</span><span>${x.views||0} lượt xem</span></div>
    </div>
  </article>`;
}
function slideCard(e,id,dir){
  e.preventDefault();e.stopPropagation();
  const x=(SITE_DATA.posts||[]).find(p=>p.id===id), imgs=getImages(x); if(imgs.length<2)return;
  const media=document.querySelector(`.property-media[data-id="${id}"]`);
  let i=(+media.dataset.index+dir+imgs.length)%imgs.length;media.dataset.index=i;
  media.querySelector('img').src=imgs[i];media.querySelector('.image-count').textContent=`${i+1}/${imgs.length}`;
}
function renderHero(){
  const posts=SITE_DATA.posts||[];
  const x=posts.find(p=>p.featured&&getImages(p).length)||posts.find(p=>getImages(p).length);
  const slidesEl=document.getElementById('heroSlides');
  if(!x){
    slidesEl.innerHTML=`<div class="hero-slide active"><img src="${fallbackImage()}"><div class="hero-content"><div class="hero-copy"><span class="badge">NEWSREAL</span><h1>Website bất động sản của bạn đã sẵn sàng</h1><div class="meta">Hãy đăng tin đầu tiên từ trang quản trị.</div></div></div></div>`;
    return;
  }
  const img=getImages(x)[0]||fallbackImage();
  slidesEl.innerHTML=`<a href="${seoPostUrl(x)}" class="hero-slide active">
    <img src="${esc(img)}" alt="${esc(x.title)}">
    <div class="hero-content"><div class="hero-copy">
      <span class="badge">${x.type==='news'?'TIN NỔI BẬT':(x.transaction==='rent'?'CHO THUÊ':(x.transaction==='buy'?'CẦN MUA':'BẤT ĐỘNG SẢN NỔI BẬT'))}</span>
      <h1>${esc(x.title)}</h1>
      <div class="meta">${esc(x.price||x.category||'')}${x.views?' · '+x.views+' lượt xem':''}</div>
    </div></div>
  </a>`;
}
function renderSideNews(){
  const a=(SITE_DATA.posts||[]).filter(x=>x.type==='news').slice(0,3);
  const fallback=(SITE_DATA.posts||[]).filter(x=>x.type==='property').slice(0,3);
  sideStack.innerHTML=(a.length?a:fallback).map(x=>`<a class="side-card" href="${seoPostUrl(x)}">
    <div class="thumb"><img src="${esc(getImages(x)[0]||fallbackImage())}" alt=""></div>
    <div><small>${esc(x.category||x.property_type||'Tin mới')}</small><h3>${esc(x.title)}</h3><small>${x.views||0} lượt xem</small></div>
  </a>`).join('');
}
function renderAreas(props){
  const counts={};props.forEach(x=>{const k=x.province||x.district;if(k)counts[k]=(counts[k]||0)+1});
  let entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if(!entries.length)entries=[['Hải Phòng',0],['Hà Nội',0],['TP. Hồ Chí Minh',0],['Đà Nẵng',0]];
  areaGrid.innerHTML=entries.map(([name,count])=>`<a class="area-card" href="/listings?province=${encodeURIComponent(name)}"><div><b>${esc(name)}</b><span>${count} tin đăng</span></div><strong>→</strong></a>`).join('');
}
function renderNews(){
  const news=(SITE_DATA.posts||[]).filter(x=>x.type==='news');
  if(!news.length){newsLead.innerHTML='<div class="empty">Chưa có tin tức.</div>';newsList.innerHTML='';return}
  const lead=news[0];newsLead.innerHTML=`<a class="card news-lead" href="${seoPostUrl(lead)}"><div class="card-img news-lead-img"><img src="${esc(getImages(lead)[0]||fallbackImage())}"></div><div class="card-body"><span class="pill">${esc(lead.category||'TIN TỨC')}</span><h3>${esc(lead.title)}</h3><p>${esc((lead.content||'').slice(0,160))}${(lead.content||'').length>160?'…':''}</p></div></a>`;
  newsList.innerHTML=news.slice(1,4).map(x=>`<a class="news-row" href="${seoPostUrl(x)}"><div class="thumb"><img src="${esc(getImages(x)[0]||fallbackImage())}"></div><div><small>${esc(x.category||'Tin tức')}</small><h3>${esc(x.title)}</h3><small>${x.views||0} lượt xem</small></div></a>`).join('');
}
function renderCategorySections(props){
  // V20.4.3 — category selected in Admin is the source of truth.
  // Never fill a named homepage category with unrelated posts just to avoid an empty block.
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('vi');
  const exact=label=>props.filter(x=>norm(x.category)===norm(label));
  const fill=(id,label,msg)=>{
    const el=document.getElementById(id);if(!el)return;
    const arr=exact(label);
    el.innerHTML=arr.slice(0,6).map(card).join('')||`<div class="category-empty">${msg}</div>`;
  };
  fill('apartmentCards','Bán căn hộ chung cư','Chưa có tin trong chuyên mục Bán căn hộ chung cư.');
  fill('saleCards','Bán nhà đất','Chưa có tin trong chuyên mục Bán nhà đất.');
  fill('rentCards','Cho thuê nhà','Chưa có tin trong chuyên mục Cho thuê nhà.');
  fill('warehouseCards','Kho xưởng & mặt bằng','Chưa có tin trong chuyên mục Kho xưởng & mặt bằng.');
  fill('landCards','Đất nền & đất dự án','Chưa có tin trong chuyên mục Đất nền & đất dự án.');
}




function renderNewsFooter(site,isDemo=false,categories=[]){
  const footer=document.querySelector('.public-footer');
  if(!footer)return;
  const brand=isDemo?'TIN TỨC 24H':cleanSiteName(site.name||'TIN TỨC');
  const phone=site.phone||'—',zalo=site.zalo||site.phone||'—',email=site.email||'—';
  const adminUrl=isDemo?nrDemoAdminUrl('tin-tuc-1',''):'/admin';
  const postUrl=isDemo?nrDemoAdminUrl('tin-tuc-1','newpost'):'/admin?tab=newpost';
  const demoNoNav=isDemo?' onclick="return false"':'';
  const cats=(categories&&categories.length?categories:['Kinh tế','Công nghệ','Đời sống','Sức khỏe']).slice(0,4);
  footer.innerHTML=`<div class="wrap public-footer-grid news-footer-grid">
   <div class="footer-about">
    <div class="brand footer-logo"><span>${esc(brand)}</span></div>
    <p class="footer-desc">Kênh tin tức tổng hợp với nội dung mới mỗi ngày, trình bày rõ ràng và tối ưu trải nghiệm đọc trên mọi thiết bị.</p>
    <div class="footer-contact-list">
     <a href="tel:${esc(String(phone).replace(/\s+/g,''))}">☎ Hotline: ${esc(phone)}</a>
     <a href="https://zalo.me/${esc(String(zalo).replace(/\D/g,''))}" target="_blank" rel="noopener">💬 Zalo: ${esc(zalo)}</a>
     <a href="mailto:${esc(email)}">✉ Email: ${esc(email)}</a>
    </div>
   </div>
   <div><h4>Chuyên mục</h4>${cats.map(c=>`<a href="#cat-${seoSlug(c)}">${esc(c)}</a>`).join('')}</div>
   <div><h4>Khám phá</h4>
    <a href="${isDemo?'#':'/'}"${demoNoNav}>Trang chủ</a>
    <a href="#moi-nhat">Tin mới nhất</a>
    <a href="#doc-nhieu">Đọc nhiều</a>
    <a href="${postUrl}"${isDemo?' target="_blank" rel="noopener"':''}>Đăng bài mới</a>
   </div>
   <div><h4>Quản trị & hỗ trợ</h4>
    <p class="footer-note">Quản lý bài viết, chuyên mục và nội dung website từ trang quản trị riêng.</p>
    <a href="${adminUrl}"${isDemo?' target="_blank" rel="noopener"':''}>Quản trị website</a>
    <a href="${postUrl}"${isDemo?' target="_blank" rel="noopener"':''}>+ Đăng bài</a>
   </div>
  </div>
  <div class="footer-bottom"><div class="wrap"><span>© 2026 <b>${esc(brand)}</b>. Nội dung thuộc website.</span><span>Powered by NEWSREAL · HOÀNG VƯƠNG TECH</span></div></div>`;
}



function renderEstateLuxe3(site,props){
 props=estateCoreSafeProps(props);const key='mau-3';estateCoreApplyShell(site,key);estateCoreFooter(site,key);
 const g=estateCoreGroups(props),hero=g.featured[0]||g.newest[0],heroImg=hero?estateCoreImage(hero):fallbackImage(),main=document.querySelector('main');
 const premium=g.featured.slice(0,6);
 const rent=g.rent.length?g.rent:g.newest.slice(2,8);
 const apartment=g.apartment.length?g.apartment:g.newest.slice(1,7);
 const land=g.land.length?g.land:g.newest.slice(3,9);
 main.innerHTML=`<section class="e3-hero" style="--hero:url('${esc(heroImg)}')"><div class="wrap"><div class="e3-copy"><small>BẤT ĐỘNG SẢN CAO CẤP</small><h1>Không gian sống<br>đáng giá mỗi ngày</h1><p>Tuyển chọn nhà ở, căn hộ và bất động sản nổi bật với trải nghiệm tìm kiếm tinh gọn.</p></div>${estateCoreSearchBox(props,key,'luxe')}</div></section>
 <section class="e3-intro"><div class="wrap">${estateCoreCategoryStrip(key)}</div></section>
 ${estateCoreSection(key,'Bất động sản nổi bật','TUYỂN CHỌN',premium,{limit:6,style:'luxe',className:'e3-section'})}
 ${estateCoreProjectStrip(key,props)}
 ${estateCoreSection(key,'Căn hộ & chung cư','PHONG CÁCH SỐNG',apartment,{limit:8,style:'compact',more:'/ban/?property_type=Chung%20cư',className:'e3-soft'})}
 ${estateCoreSection(key,'Nhà phố & biệt thự','KHÔNG GIAN RIÊNG',g.house,{limit:8,style:'compact',more:'/ban/?property_type=Nhà%20phố',className:'e3-section'})}
 ${estateCoreSection(key,'Bất động sản cho thuê','LỰA CHỌN LINH HOẠT',rent,{limit:8,style:'compact',more:'/cho-thue/',className:'e3-soft'})}
 ${estateCoreSection(key,'Đất nền & cơ hội đầu tư','ĐẦU TƯ',land,{limit:8,style:'compact',more:'/ban/?property_type=Đất',className:'e3-section'})}
 ${estateCoreServiceBand()}
 <section class="e3-news"><div class="wrap">${estateCoreNews(site,key,6)}</div></section>`;
 estateCoreBindSearch(key);
}
function renderEstateMinimal4(site,props){
 props=estateCoreSafeProps(props);const key='mau-4';estateCoreApplyShell(site,key);estateCoreFooter(site,key);
 const g=estateCoreGroups(props),main=document.querySelector('main'),hero=g.featured[0]||g.newest[0];
 main.innerHTML=`<section class="e4-intro"><div class="wrap"><div><small>TÌM NHÀ THEO CÁCH ĐƠN GIẢN HƠN</small><h1>Bất động sản rõ ràng.<br>Quyết định dễ dàng.</h1><p>Thiết kế tối giản tập trung vào hình ảnh, giá, vị trí và những thông tin quan trọng nhất.</p></div>${hero?`<img src="${esc(estateCoreImage(hero))}" alt="${esc(hero.title)}">`:''}</div></section>
 <section class="e4-search-wrap"><div class="wrap">${estateCoreSearchBox(props,key,'minimal')}</div></section>
 <section class="e4-cats"><div class="wrap">${estateCoreCategoryStrip(key)}</div></section>
 ${estateCoreSection(key,'Tin đăng mới nhất','MỚI CẬP NHẬT',g.newest,{limit:12,style:'minimal',className:'e4-section'})}
 ${estateCoreSection(key,'Nhà đất đang bán','MUA BÁN',g.sale,{limit:8,style:'minimal',more:'/ban/',className:'e4-white'})}
 ${estateCoreProjectStrip(key,props)}
 ${estateCoreSection(key,'Căn hộ được quan tâm','CĂN HỘ',g.apartment,{limit:8,style:'minimal',more:'/ban/?property_type=Chung%20cư',className:'e4-section'})}
 ${estateCoreSection(key,'Nhà phố & biệt thự','NHÀ Ở',g.house,{limit:8,style:'minimal',className:'e4-white'})}
 ${estateCoreSection(key,'Cho thuê nổi bật','CHO THUÊ',g.rent.length?g.rent:g.newest.slice(3),{limit:8,style:'minimal',more:'/cho-thue/',className:'e4-section'})}
 ${estateCoreSection(key,'Đất nền & dự án','ĐẦU TƯ',g.land.length?g.land:g.newest.slice(4),{limit:8,style:'minimal',more:'/ban/?property_type=Đất',className:'e4-white'})}
 <section class="e4-band"><div class="wrap"><div><b>${g.sale.length}+</b><span>Tin mua bán</span></div><div><b>${g.rent.length}+</b><span>Tin cho thuê</span></div><div><b>${new Set(props.map(x=>x.province).filter(Boolean)).size}+</b><span>Khu vực</span></div><div><b>24/7</b><span>Website hoạt động</span></div></div></section>
 ${estateCoreServiceBand()}
 <section class="e4-news"><div class="wrap">${estateCoreNews(site,key,6)}</div></section>`;
 estateCoreBindSearch(key);
}
function estateCorePlaceholderCard(style='standard'){
 return `<article class="estate-core-card estate-card-${esc(style)} nr-structure-placeholder nr-property-placeholder" aria-hidden="true"><div class="estate-core-media nr-placeholder-media"></div><div class="estate-core-body nr-placeholder-body"><div class="estate-core-meta"><span>CHƯA CÓ TIN</span><span>Bất động sản</span></div><h3>Vị trí đang chờ nội dung</h3><div class="estate-core-loc">⌖ Chưa cập nhật</div><div class="estate-core-price">—</div></div></article>`;
}
function estateCoreFixedRows(items,style='row',slots=6){
 const list=(items||[]).filter(Boolean).slice(0,slots);return list.map(x=>estateCoreCard(x,style)).join('')+Array.from({length:Math.max(0,slots-list.length)},()=>estateCorePlaceholderCard(style)).join('');
}
function renderEstateUrban5(site,props){
 props=estateCoreSafeProps(props);const key='mau-5';estateCoreApplyShell(site,key);estateCoreFooter(site,key);
 const g=estateCoreGroups(props),main=document.querySelector('main'),hero=g.featured[0]||g.newest[0],heroImg=hero?estateCoreImage(hero):fallbackImage();
 const areas=[...new Set(props.map(x=>x.district||x.province).filter(Boolean))].slice(0,6);
 main.innerHTML=`<section class="e5-hero"><div class="e5-hero-img" style="background-image:url('${esc(heroImg)}')"></div><div class="e5-hero-panel"><small>URBAN PROPERTY FINDER</small><h1>Tìm đúng nơi.<br>Sống đúng chất.</h1><p>Khám phá bất động sản theo khu vực, nhu cầu và phong cách sống của bạn.</p>${estateCoreSearchBox(props,key,'urban')}</div></section>
 <section class="e5-area"><div class="wrap"><div class="estate-section-head"><div><small>KHÁM PHÁ KHU VỰC</small><h2>Nơi bạn muốn sống</h2></div></div><div class="e5-area-grid">${(areas.length?areas:['Trung tâm','Ven đô','Khu đô thị','Gần biển']).map((a,i)=>`<a href="${estateCoreUrl('/bat-dong-san/?q='+encodeURIComponent(a),key,true)}"><span>0${i+1}</span><b>${esc(a)}</b><small>Xem bất động sản →</small></a>`).join('')}</div></div></section>
 ${estateCoreSection(key,'Bất động sản nổi bật','ĐƯỢC QUAN TÂM',g.featured,{limit:8,style:'urban',className:'e5-section'})}
 ${estateCoreProjectStrip(key,props)}
 ${estateCoreSection(key,'Nhà đất mới lên','MỚI NHẤT',g.newest,{limit:8,style:'urban',className:'e5-white'})}
 ${estateCoreSection(key,'Căn hộ thành thị','CĂN HỘ',g.apartment.length?g.apartment:g.newest.slice(1),{limit:8,style:'urban',more:'/ban/?property_type=Chung%20cư',className:'e5-section'})}
 <section class="e5-split"><div class="wrap"><div><div class="estate-section-head"><div><small>BÁN</small><h2>Cơ hội sở hữu</h2></div><a href="${estateCoreUrl('/ban/',key,true)}">Xem thêm →</a></div>${estateCoreFixedRows(g.sale,'row',6)}</div><div><div class="estate-section-head"><div><small>CHO THUÊ</small><h2>Lựa chọn linh hoạt</h2></div><a href="${estateCoreUrl('/cho-thue/',key,true)}">Xem thêm →</a></div>${estateCoreFixedRows(g.rent.length?g.rent:g.newest.slice(2),'row',6)}</div></div></section>
 ${estateCoreSection(key,'Nhà phố & biệt thự','KHÔNG GIAN SỐNG',g.house,{limit:8,style:'urban',className:'e5-section'})}
 ${estateCoreSection(key,'Đất nền & dự án','ĐẦU TƯ',g.land.length?g.land:g.newest.slice(4),{limit:8,style:'urban',more:'/ban/?property_type=Đất',className:'e5-white'})}
 ${estateCoreServiceBand()}
 <section class="e5-news"><div class="wrap">${estateCoreNews(site,key,6)}</div></section>`;
 estateCoreBindSearch(key);
}
/* V14 — Shared News Template Core */
const NEWS_TEMPLATE_CORE={
 'tin-tuc-1':{variant:1,brand:'TIN TỨC 24H',base:'/demo/tin-tuc/mau-1'},
 'tin-tuc-2':{variant:2,brand:'TIN NHANH 360',base:'/demo/tin-tuc/mau-2'},
 'tin-tuc-3':{variant:3,brand:'MOSAIC MAG',base:'/demo/tin-tuc/mau-3'},
 'tin-tuc-4':{variant:4,brand:'THE DAILY NOTE',base:'/demo/tin-tuc/mau-4'}
};
function newsCoreConfig(key){return NEWS_TEMPLATE_CORE[key]||NEWS_TEMPLATE_CORE['tin-tuc-1']}
const NR_NEWS_TAXONOMY_V1=['Kinh tế','Công nghệ','Kinh doanh','Tài chính','Thế giới','Xã hội','Giáo dục','Sức khỏe','Đời sống','Du lịch','Bất động sản','Pháp luật','Văn hóa','Giải trí','Thể thao','Khoa học','Xe','Nhà đẹp'];
function newsCoreTemplateKey(){
 const k=String(window.NR_DEMO_THEME||'');
 return NEWS_TEMPLATE_CORE[k]?k:'';
}
function newsCoreNavHtml(ctx){
 const home=ctx.isDemo?`${ctx.base}/`:'/';
 const latest=ctx.isDemo?`${home}#moi-nhat`:'#moi-nhat';
 const popular=ctx.isDemo?`${home}#doc-nhieu`:'#doc-nhieu';
 const cats=[...new Set((ctx.navCategories||ctx.categories||[]).filter(Boolean))];
 // Navigation Contract V1: taxonomy may be broad, but the first navigation tier must stay compact.
 // Homepage sections remain template-specific; this only controls discoverability in the header.
 const preferred=['Kinh tế','Công nghệ','Thế giới','Xã hội'];
 const primary=[...preferred.filter(x=>cats.includes(x)),...cats.filter(x=>!preferred.includes(x))].slice(0,4);
 const more=cats.filter(x=>!primary.includes(x));
 const link=c=>`<a href="${newsCategoryUrl(ctx.isDemo?ctx.base:'',c)}">${esc(c)}</a>`;
 const groups=[
   ['Thời sự & xã hội',['Thế giới','Xã hội','Pháp luật','Giáo dục','Sức khỏe']],
   ['Kinh tế & thị trường',['Kinh tế','Kinh doanh','Tài chính','Bất động sản','Xe']],
   ['Đời sống & giải trí',['Đời sống','Du lịch','Văn hóa','Giải trí','Thể thao','Nhà đẹp']],
   ['Công nghệ & tri thức',['Công nghệ','Khoa học']]
 ];
 const used=new Set();
 const grouped=groups.map(([title,names])=>{
   const items=names.filter(x=>more.includes(x));items.forEach(x=>used.add(x));
   return items.length?`<section><b>${esc(title)}</b>${items.map(link).join('')}</section>`:'';
 }).join('');
 const rest=more.filter(x=>!used.has(x));
 const restHtml=rest.length?`<section><b>Chuyên mục khác</b>${rest.map(link).join('')}</section>`:'';
 return `<a href="${home}">Trang chủ</a><a href="${latest}">Mới nhất</a>${primary.map(link).join('')}${more.length?`<details class="news-nav-more nr-nav-tier"><summary>Chuyên mục</summary><div class="news-nav-mega">${grouped}${restHtml}</div></details>`:''}<a href="${popular}">Đọc nhiều</a>`;
}
function newsCoreApplyShell(site,ctx,key,opts={}){
 const cfg=newsCoreConfig(key);
 const topLeft=document.getElementById('topLeft');if(topLeft)topLeft.textContent='Tin mới mỗi ngày · Cập nhật nhanh · Dễ đọc';
 const brandLeft=document.getElementById('brandLeft');if(brandLeft)brandLeft.textContent=ctx.isDemo?cfg.brand:cleanSiteName(site.name||cfg.brand);
 const brandRight=document.getElementById('brandRight');if(brandRight)brandRight.textContent='';
 const brandLink=document.querySelector('.header a.logo,.header a.brand');
 if(brandLink&&ctx.isDemo){brandLink.setAttribute('href','#');brandLink.onclick=e=>e.preventDefault()}
 const nav=document.querySelector('.header nav.nav');if(nav)nav.innerHTML=newsCoreNavHtml(ctx);
 const actions=document.querySelector('.header .actions');
 const postUrl=ctx.isDemo?nrDemoAdminUrl(key,'newpost'):'/admin?tab=newpost';
 if(actions){
   actions.innerHTML=opts.article
     ? `<a class="btn soft" href="${ctx.isDemo?ctx.base+'/':'/'}">← Trang chủ</a>`
     : `<a class="btn soft" href="${ctx.isDemo?ctx.base+'/#moi-nhat':'#moi-nhat'}">Tin mới</a><a class="btn primary" href="${postUrl}"${ctx.isDemo?' target="_blank" rel="noopener"':''}>+ Đăng bài</a><button id="mobileMenuBtn" class="btn soft mobile-menu">☰</button>`;
 }
}
function newsCoreRelated(ctx,article){
 const items=ctx.all.filter(x=>x.id!==article.id&&x.category===article.category);
 for(const x of ctx.all){
   if(items.length>=ctx.layout.related_count)break;
   if(x.id!==article.id&&!items.includes(x))items.push(x);
 }
 return items.slice(0,ctx.layout.related_count);
}
function newsCoreSidebar(ctx){
 if(!ctx.layout.sidebar_enabled)return '';
 const ranked=[...ctx.all].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,ctx.layout.sidebar_read_most);
 return `<div class="news-sticky-sidebar">
  <section class="news-side-box"><div class="n3-aside-title">ĐỌC NHIỀU</div>${ranked.map((x,i)=>`<a class="news-side-rank" href="${ctx.url(x)}"><b>${String(i+1).padStart(2,'0')}</b><div><span>${esc(x.category||'Tin tức')}</span><h3>${esc(x.title)}</h3></div></a>`).join('')}</section>
  <section class="news-side-box news-side-categories"><div class="n3-aside-title">CHUYÊN MỤC</div><div>${(ctx.navCategories||ctx.categories).slice(0,ctx.layout.sidebar_categories).map(c=>`<a href="${ctx.isDemo?newsCategoryUrl(ctx.base,c):'#cat-'+seoSlug(c)}">${esc(c)}</a>`).join('')}</div></section>
  <section class="news-side-box"><div class="n3-aside-title">TIN MỚI</div>${ctx.all.slice(0,ctx.layout.sidebar_latest).map(x=>`<a class="news-side-latest" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title,'',{width:420})}<span>${esc(x.title)}</span></a>`).join('')}</section>
 </div>`;
}

// News Article Contract V1 — all news templates share the same article sidebar behavior.
// It is intentionally independent from homepage sidebar_enabled so article pages never look empty.
function newsArticleSidebar(ctx,article){
 // Article sidebar must stay populated even when an article endpoint returns only
 // the current post. Merge the active dataset with the shared demo pool on demos.
 const merged=[];const seen=new Set();
 const push=x=>{if(!x)return;const k=String(x.id??x.sample_key??x.title??'');if(!k||seen.has(k))return;seen.add(k);merged.push(x)};
 (ctx.all||[]).forEach(push);
 if(ctx.isDemo&&!window.NR_TRIAL_TOKEN&&!window.NR_CLIENT_SIM&&merged.length<18){try{newsVariantDemoData().forEach(push)}catch(e){}}
 const pool=merged.filter(x=>String(x.id)!==String(article?.id)&&String(x.title||'')!==String(article?.title||''));
 const same=pool.filter(x=>String(x.category||'')===String(article?.category||'')).slice(0,5);
 const ranked=[...pool].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,7);
 const latest=pool.slice(0,6);
 const cats=[...new Set([...(ctx.navCategories||ctx.categories||[]),...pool.map(x=>String(x.category||'').trim())].filter(Boolean))].slice(0,10);
 const sameHtml=`<section class="news-side-box news-article-same"><div class="n3-aside-title">CÙNG CHUYÊN MỤC</div>${same.length?same.map(x=>`<a class="news-side-latest" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title,'',{width:360})}<span>${esc(x.title)}</span></a>`).join(''):'<div class="news-side-note">Chưa có thêm bài cùng chuyên mục.</div>'}<a class="news-side-more" href="${newsCategoryUrl(ctx.base,article.category)}">Xem tất cả ${esc(article.category)} →</a></section>`;
 return `<div class="news-sticky-sidebar news-article-sidebar">
  ${sameHtml}
  <section class="news-side-box"><div class="n3-aside-title">ĐỌC NHIỀU</div>${ranked.map((x,i)=>`<a class="news-side-rank" href="${ctx.url(x)}"><b>${String(i+1).padStart(2,'0')}</b><div><span>${esc(x.category||'Tin tức')}</span><h3>${esc(x.title)}</h3></div></a>`).join('')}</section>
  <section class="news-side-box"><div class="n3-aside-title">TIN MỚI</div>${latest.map(x=>`<a class="news-side-latest" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title,'',{width:360})}<span>${esc(x.title)}</span></a>`).join('')}</section>
  <section class="news-side-box news-side-categories"><div class="n3-aside-title">CHUYÊN MỤC</div><div>${cats.map(c=>`<a href="${newsCategoryUrl(ctx.base,c)}">${esc(c)}</a>`).join('')}</div></section>
 </div>`;
}

function renderNewsPortalHome(site){
  const main=document.querySelector('main');
  const isDemo=window.NR_DEMO_THEME==='tin-tuc-1';
  const isShowroom=isDemo&&!window.NR_TRIAL_TOKEN&&!window.NR_CLIENT_SIM;

  const demoNews=[
   {id:'dn01',title:'Giá vàng và thị trường tài chính hôm nay có gì đáng chú ý?',category:'Kinh tế',image:'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=82',views:1842,content:'Những chuyển động đáng chú ý của thị trường, dòng tiền và các yếu tố đang được nhà đầu tư quan tâm trong ngày.'},
   {id:'dn02',title:'AI đang thay đổi cách doanh nghiệp nhỏ vận hành như thế nào?',category:'Công nghệ',image:'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=82',views:1530,content:'Trí tuệ nhân tạo ngày càng đi sâu vào công việc hằng ngày, từ nội dung, bán hàng đến chăm sóc khách hàng.'},
   {id:'dn03',title:'5 xu hướng tiêu dùng mới đang định hình thị trường Việt Nam',category:'Kinh tế',image:'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=82',views:1328,content:'Người tiêu dùng thay đổi nhanh về cách mua sắm, thanh toán và lựa chọn sản phẩm trong môi trường số.'},
   {id:'dn04',title:'Những điểm đến được tìm kiếm nhiều cho kỳ nghỉ ngắn ngày',category:'Du lịch',image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82',views:1214,content:'Các điểm đến gần thành phố, dễ di chuyển và có trải nghiệm riêng đang được nhiều gia đình lựa chọn.'},
   {id:'dn05',title:'Thói quen nhỏ giúp duy trì sức khỏe tốt khi làm việc văn phòng',category:'Sức khỏe',image:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=82',views:1097,content:'Vận động nhẹ, nghỉ mắt đúng lúc và ngủ đủ giấc vẫn là những thói quen đơn giản nhưng đem lại hiệu quả lâu dài.'},
   {id:'dn06',title:'Thị trường nhà ở: người mua ngày càng quan tâm nhiều hơn đến tiện ích',category:'Bất động sản',image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82',views:986,content:'Ngoài vị trí và giá, chất lượng sống và hệ tiện ích đang trở thành yếu tố quan trọng trong quyết định mua nhà.'},
   {id:'dn07',title:'Kỹ năng quản lý chi tiêu cá nhân đơn giản cho người trẻ',category:'Đời sống',image:'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=82',views:874,content:'Một kế hoạch chi tiêu rõ ràng giúp kiểm soát dòng tiền tốt hơn mà không cần những công cụ quá phức tạp.'},
   {id:'dn08',title:'Điện thoại mới tập trung nhiều hơn vào pin và khả năng xử lý AI',category:'Công nghệ',image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=82',views:812,content:'Thị trường smartphone tiếp tục cạnh tranh ở thời lượng pin, camera và các tính năng AI chạy trực tiếp trên thiết bị.'},
   {id:'dn09',title:'Các món ăn gia đình dễ làm cho ngày bận rộn',category:'Đời sống',image:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=82',views:761,content:'Một vài lựa chọn nhanh gọn giúp bữa cơm đủ dinh dưỡng mà không tốn quá nhiều thời gian chuẩn bị.'},
   {id:'dn10',title:'Doanh nghiệp nhỏ tận dụng mạng xã hội để tiếp cận khách hàng địa phương',category:'Kinh doanh',image:'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82',views:743,content:'Nội dung đều đặn và thông tin liên hệ rõ ràng vẫn là nền tảng quan trọng cho hoạt động bán hàng tại địa phương.'},
   {id:'dn11',title:'Du lịch tự túc: những khoản nên dự trù trước chuyến đi',category:'Du lịch',image:'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=82',views:694,content:'Chuẩn bị trước ngân sách di chuyển, lưu trú và chi phí phát sinh giúp chuyến đi chủ động và thoải mái hơn.'},
   {id:'dn12',title:'Không gian xanh đang trở thành tiêu chí đáng chú ý của các khu đô thị mới',category:'Bất động sản',image:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82',views:652,content:'Các dự án dành nhiều diện tích cho công viên và không gian cộng đồng đang nhận được sự quan tâm lớn hơn.'},
   {id:'dn13',title:'Ba cách bảo vệ dữ liệu cá nhân khi sử dụng dịch vụ trực tuyến',category:'Công nghệ',image:'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=82',views:621,content:'Mật khẩu mạnh, xác thực hai lớp và kiểm tra quyền truy cập là những biện pháp cơ bản nhưng rất cần thiết.'},
   {id:'dn14',title:'Tập luyện ngắn mỗi ngày có thể tạo khác biệt lớn sau vài tháng',category:'Sức khỏe',image:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=82',views:589,content:'Duy trì lịch tập phù hợp quan trọng hơn việc cố gắng quá sức trong một khoảng thời gian ngắn.'},
   {id:'dn15',title:'Kinh doanh online: vì sao website riêng vẫn có giá trị lâu dài?',category:'Kinh doanh',image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=82',views:556,content:'Website riêng giúp doanh nghiệp kiểm soát nội dung, thương hiệu và dữ liệu tốt hơn so với chỉ phụ thuộc mạng xã hội.'},
   {id:'dn16',title:'Những thay đổi nhỏ giúp căn nhà thoáng và dễ sử dụng hơn',category:'Nhà đẹp',image:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=82',views:517,content:'Sắp xếp ánh sáng, màu sắc và không gian lưu trữ hợp lý có thể cải thiện đáng kể trải nghiệm sống.'},
   {id:'dn17',title:'Thị trường lao động chú trọng kỹ năng số và khả năng tự học',category:'Giáo dục',image:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=82',views:493,content:'Khả năng sử dụng công cụ số và cập nhật kiến thức liên tục ngày càng quan trọng với người lao động trẻ.'},
   {id:'dn18',title:'Xu hướng thanh toán không tiền mặt tiếp tục mở rộng',category:'Kinh tế',image:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=82',views:472,content:'Thanh toán số ngày càng phổ biến trong mua sắm, dịch vụ và các giao dịch hằng ngày.'},
   {id:'dn19',title:'Cách xây dựng lịch học đều đặn mà không tạo áp lực',category:'Giáo dục',image:'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=1200&q=82',views:451,content:'Chia mục tiêu thành những phiên học ngắn giúp duy trì nhịp độ ổn định và dễ theo dõi tiến bộ.'},
   {id:'dn20',title:'Thiết kế tối giản vẫn được ưa chuộng trong không gian sống hiện đại',category:'Nhà đẹp',image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=82',views:426,content:'Ít chi tiết hơn nhưng chú trọng công năng và vật liệu là hướng được nhiều gia đình lựa chọn.'}
  ].map(x=>({...x,type:'news',demo:true}));

  const dbNews=(SITE_DATA.posts||[]).filter(x=>x.type==='news').sort((a,b)=>Number(b.id||0)-Number(a.id||0));
  // V16.0 — Public showroom demos must render the structure-complete virtual package
  // returned by /api/site. Keep the small local demo array only as an emergency fallback.
  // This prevents the browser from replacing 40–60 blueprint stories with the old 20-item
  // hard-coded set and leaving structural placeholders visible in category grids.
  const all=isShowroom?(dbNews.length?dbNews:demoNews):dbNews;
  const layout=newsLayoutProfile(site,1);
  let epCats=[];try{const ep=site?.editor_profile&&typeof site.editor_profile==='object'?site.editor_profile:JSON.parse(site?.editor_profile||'{}');epCats=Array.isArray(ep?.categories)?ep.categories:[]}catch(e){}
  const categories=nrStructureCategories(site,'tin-tuc-1',epCats.length?epCats:[...new Set(all.map(x=>String(x.category||'Tin mới').trim()).filter(Boolean))]).slice(0,12);
  const navCategories=[...new Set([...(epCats||[]),...NR_NEWS_TAXONOMY_V1,...all.map(x=>String(x.category||'').trim())].map(x=>String(x||'').trim()).filter(Boolean))];
  const excerpt=x=>esc(String(x?.content||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,155));
  const nimg=x=>esc(x.image||getImages(x)[0]||fallbackImage());
  const demoNewsBase='/demo/tin-tuc/mau-1';
  const demoArticlePath=x=>`${demoNewsBase}/${seoSlug(x.title)}.html`;
  const nurl=x=>isDemo?demoArticlePath(x):seoPostUrl(x);

  const m1ctx={isDemo,all,categories,navCategories,base:isDemo?'/demo/tin-tuc/mau-1':'',url:nurl,img:nimg,excerpt,layout};
  if(renderNewsClientEmpty(site,m1ctx,1))return;
  newsCoreApplyShell(site,m1ctx,'tin-tuc-1');
  const hero=all[0],secondary=all.slice(1,5);
  const noNav='';
  const row=x=>`<a class="n3-row" href="${nurl(x)}"${noNav}><img src="${nimg(x)}" alt="${esc(x.title)}"><div><span>${esc(x.category||'TIN MỚI')}</span><h3>${esc(x.title)}</h3><small>${Number(x.views||0).toLocaleString('vi-VN')} lượt xem</small></div></a>`;
  const cardN=x=>`<a class="n3-card" href="${nurl(x)}"${noNav}><img src="${nimg(x)}" alt="${esc(x.title)}"><div><span>${esc(x.category||'TIN TỨC')}</span><h3>${esc(x.title)}</h3><small>${Number(x.views||0).toLocaleString('vi-VN')} lượt xem</small></div></a>`;
  const relatedCard=x=>`<a class="news-related-card" href="${nurl(x)}"><img src="${nimg(x)}" alt="${esc(x.title)}"><span>${esc(x.category||'TIN TỨC')}</span><h3>${esc(x.title)}</h3></a>`;
  const sidebarHtml=(items,cats)=>`<div class="news-sticky-sidebar">
    <section class="news-side-box"><div class="n3-aside-title">TIN ĐỌC NHIỀU</div>${[...items].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,layout.sidebar_read_most).map((x,i)=>`<a class="news-side-rank" href="${nurl(x)}"><b>${String(i+1).padStart(2,'0')}</b><div><span>${esc(x.category||'Tin tức')}</span><h3>${esc(x.title)}</h3></div></a>`).join('')}</section>
    <section class="news-side-box news-side-categories"><div class="n3-aside-title">CHUYÊN MỤC</div><div>${cats.slice(0,layout.sidebar_categories).map(c=>`<a href="${isDemo?newsCategoryUrl('/demo/tin-tuc/mau-1',c):'#cat-'+seoSlug(c)}">${esc(c)}</a>`).join('')}</div></section>
    <section class="news-side-box"><div class="n3-aside-title">TIN MỚI</div>${items.slice(0,layout.sidebar_latest).map(x=>`<a class="news-side-latest" href="${nurl(x)}"><img src="${nimg(x)}"><span>${esc(x.title)}</span></a>`).join('')}</section>
  </div>`;


  const demoArticleSlug=isDemo?location.pathname.replace(/^\/demo\/tin-tuc\/mau-1\/?/,'').replace(/\.html$/,'').replace(/^\/+|\/+$/g,''):'';
  if(isDemo&&demoArticleSlug){
    const article=all.find(x=>seoSlug(x.title)===demoArticleSlug);
    if(article){
      const related=newsCoreRelated(m1ctx,article);
      const more=all.filter(x=>x.id!==article.id && !related.includes(x)).slice(0,6);
      document.body.classList.add('news-demo-article');
      newsCoreApplyShell(site,m1ctx,'tin-tuc-1',{article:true});
      main.innerHTML=`
       <article class="n3-article-page"><div class="wrap n3-article-layout">
        <div class="n3-article-main">
         <div class="n3-breadcrumb"><a href="/demo/tin-tuc/mau-1/">Trang chủ</a><span>›</span><a href="${newsCategoryUrl('/demo/tin-tuc/mau-1',article.category)}">${esc(article.category)}</a></div>
         <span class="n3-article-cat">${esc(article.category)}</span>
         <h1>${esc(article.title)}</h1>
         <div class="n3-article-meta">30/08/2026 · ${Number(article.views||0).toLocaleString('vi-VN')} lượt xem · Tin tức 24H</div>
         <p class="n3-article-lead">${excerpt(article)}</p>
         <img class="n3-article-cover" src="${nimg(article)}" alt="${esc(article.title)}">
         <div class="n3-article-content">
          ${nrSafeRichHtml(article.content)}
          <h2>Thông tin đáng chú ý</h2>
          <p>Nội dung bài viết được trình bày theo phong cách báo điện tử, ưu tiên khả năng đọc trên cả máy tính và điện thoại. Các đoạn văn có khoảng cách rõ ràng, tiêu đề phụ nổi bật và hình ảnh nằm đúng trong chiều rộng nội dung.</p>
          <p>Website có thể sử dụng nhiều chuyên mục khác nhau. Bài mới sẽ tự động xuất hiện ở trang chủ, chuyên mục tương ứng và các khu đề xuất phù hợp.</p>
          <h2>Bối cảnh và xu hướng</h2>
          <p>Trang chi tiết hỗ trợ nội dung dài, ảnh chèn trong bài, liên kết, danh sách và các khối đề xuất bên dưới để giữ người đọc tiếp tục khám phá website.</p>
          <p>Đây là dữ liệu minh họa. Khi website được bàn giao, khách hàng quản lý toàn bộ nội dung bằng Client Admin và trình soạn thảo rich text.</p>
          <h2>Những điểm nên theo dõi</h2>
          <ul><li>Thông tin mới trong cùng chuyên mục.</li><li>Các bài được đọc nhiều trong ngày.</li><li>Nội dung mới nhất từ những chuyên mục khác.</li></ul>
         </div>
         <div class="n3-related"><div class="n3-title"><div><small>CÙNG CHUYÊN MỤC</small><h2>Bài viết liên quan</h2></div></div><div class="news-related-grid">${related.map(relatedCard).join('')}</div></div>
        </div>
        ${newsArticleSidebar(m1ctx,article)?`<aside class="n3-article-aside">${newsArticleSidebar(m1ctx,article)}</aside>`:''}
       </div></article>
       ${categories.filter(c=>c!==article.category).slice(0,3).map((cat,idx)=>{
          const items=all.filter(x=>x.id!==article.id&&x.category===cat).concat(all.filter(x=>x.id!==article.id&&x.category!==cat)).slice(0,4);
          return `<section class="news-detail-category ${idx%2?'alt':''}"><div class="wrap"><div class="n3-title"><div><small>KHÁM PHÁ THÊM</small><h2>${esc(cat)}</h2></div><a href="${newsCategoryUrl('/demo/tin-tuc/mau-1',cat)}">Xem chuyên mục →</a></div><div class="news-detail-category-grid">${items.map(relatedCard).join('')}</div></div></section>`;
       }).join('')}
       <section class="n3-more-news"><div class="wrap"><div class="n3-title"><div><small>TIẾP TỤC KHÁM PHÁ</small><h2>Tin mới khác</h2></div></div><div class="n3-wide-grid">${more.map(cardN).join('')}</div></div></section>`;
      renderNewsFooter(site,true,categories);
      try{if('scrollRestoration' in history)history.scrollRestoration='manual';window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0));setTimeout(()=>window.scrollTo(0,0),80)}catch(e){window.scrollTo(0,0)}
      return;
    }
  }

  // V16.5 — Article routes always have priority over category/archive routes.
  if(maybeRenderNewsCategoryArchive(site,m1ctx))return;
  newsCoreApplyShell(site,m1ctx,'tin-tuc-1');

  main.innerHTML=`
   <section class="n3-breaking"><div class="wrap"><b>MỚI NHẤT</b><div>${all.slice(0,4).map(x=>`<a href="${nurl(x)}"${noNav}>${esc(x.title)}</a>`).join('<span>•</span>')}</div></div></section>
   <section class="n3-hero"><div class="wrap n3-hero-grid">
    <div class="n3-lead">${hero?`<a href="${nurl(hero)}"${noNav}><img src="${nimg(hero)}" alt="${esc(hero.title)}"><div class="n3-overlay"><span>${esc(hero.category||'NỔI BẬT')}</span><h1>${esc(hero.title)}</h1></div></a>`:'<div class="empty">Hãy đăng bài tin tức đầu tiên.</div>'}</div>
    <div class="n3-side">${secondary.map(row).join('')||'<div class="empty">Chưa có bài mới.</div>'}</div>
   </div></section>

   <section class="n3-topics"><div class="wrap">${navCategories.map(c=>`<a href="${newsCategoryUrl(isDemo?'/demo/tin-tuc/mau-1':'',c)}">${esc(c)}</a>`).join('')}</div></section>

   <section class="n3-section" id="moi-nhat"><div class="wrap">
    <div class="n3-title"><div><small>DÒNG TIN</small><h2>Tin mới nhất</h2></div><span>Cập nhật các nội dung đáng chú ý</span></div>
    <div class="n3-layout"><div class="n3-grid">${all.slice(1,1+nrNewsHomeLatestRenderCount(site,'tin-tuc-1',layout.home_latest_count)).map(cardN).join('')||'<div class="empty">Chưa có nội dung.</div>'}</div>
    ${layout.sidebar_enabled?`<aside class="n3-popular news-home-sidebar" id="doc-nhieu">
      <section class="news-side-box"><div class="n3-aside-title">ĐỌC NHIỀU</div>${[...all].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,layout.sidebar_read_most).map((x,i)=>`<a class="news-side-rank" href="${nurl(x)}"><b>${String(i+1).padStart(2,'0')}</b><div><span>${esc(x.category||'Tin tức')}</span><h3>${esc(x.title)}</h3></div></a>`).join('')}</section>
      <section class="news-side-box news-side-categories"><div class="n3-aside-title">CHUYÊN MỤC</div><div>${categories.slice(0,layout.sidebar_categories).map(c=>`<a href="#cat-${seoSlug(c)}">${esc(c)}</a>`).join('')}</div></section>
      <section class="news-side-box"><div class="n3-aside-title">TIN MỚI</div>${all.slice(0,layout.sidebar_latest).map(x=>`<a class="news-side-latest" href="${nurl(x)}"><img src="${nimg(x)}"><span>${esc(x.title)}</span></a>`).join('')}</section>
     </aside>`:''}</div>
   </div></section>

   ${categories.slice(0,6).map((cat,ci)=>{
      const count=layout.category_columns*layout.category_rows;
      const items=all.filter(x=>String(x.category||'Tin mới').trim()===cat).slice(0,count);
      return `<section class="n3-section n3-category" id="cat-${seoSlug(cat)}"><div class="wrap"><div class="n3-title"><div><small>CHUYÊN MỤC ${String(ci+1).padStart(2,'0')}</small><h2>${esc(cat)}</h2></div><a href="${newsCategoryUrl(isDemo?'/demo/tin-tuc/mau-1':'/',cat)}">Xem thêm →</a></div><div class="news-configurable-grid n3-config-category-grid" style="${newsGridStyle(layout)}">${items.map(cardN).join('')}</div></div></section>`;
   }).join('')}

   <section class="n3-wide-list"><div class="wrap"><div class="n3-title"><div><small>KHÁM PHÁ</small><h2>Nội dung khác</h2></div><span>Đa dạng chủ đề mỗi ngày</span></div><div class="n3-wide-grid">${all.slice(10,10+Math.max(8,nrStructureSlots(site,'tin-tuc-1','explore',8))).map(cardN).join('')}</div></div></section>

   <section class="n3-newsletter n3-newsletter-light"><div class="wrap"><div><small>WEBSITE TIN TỨC RIÊNG</small><h2>Nội dung của bạn, thương hiệu của bạn</h2><p>Đăng bài từ trang quản trị và website tự trình bày theo phong cách tạp chí hiện đại.</p></div><a href="${isDemo?nrDemoAdminUrl('tin-tuc-1','newpost'):'/admin?tab=newpost'}"${isDemo?' target="_blank" rel="noopener"':''}>Đăng bài mới →</a></div></section>`;
  renderNewsFooter(site,isDemo,categories);
}


// V20.7.9 — HOMEPAGE SIDEBAR BALANCE CONTRACT V1.
// A homepage that owns a sidebar must never end the "latest" feed noticeably
// above that sidebar. Structure `slots` remain the guaranteed minimum; when a
// section opts into `slot_contract: sidebar-balanced`, the renderer provides a
// small reserve and the geometry pass keeps only the extra complete rows needed
// to meet the sidebar height. The same rule is used by showroom, trial and client.
function nrSidebarBalanceConfig(site,key=''){
 const p=nrStructureProfile(site,key),cfg=p?.homepage_sidebar_balance;
 if(!cfg||Number(cfg.enabled||0)!==1)return null;
 return {
  target_section:String(cfg.target_section||'latest'),
  max_extra_rows:Math.max(0,Math.min(6,Number(cfg.max_extra_rows||3))),
  tolerance_px:Math.max(0,Math.min(120,Number(cfg.tolerance_px||32)))
 };
}
function nrNewsHomeLatestRenderCount(site,key,baseCount){
 const p=nrStructureProfile(site,key),cfg=nrSidebarBalanceConfig(site,key);
 const sec=(p.sections||[]).find(x=>String(x?.key||'')===String(cfg?.target_section||'latest'));
 if(!cfg||!sec||String(sec.slot_contract||'exact')!=='sidebar-balanced')return Math.max(1,Number(baseCount||sec?.slots||1));
 const cols=Math.max(1,Number(sec.desktop_columns||1));
 return Math.max(1,Number(sec.slots||baseCount||1))+cols*cfg.max_extra_rows;
}
function nrSidebarBalancedTarget(site,key,sec,host,baseTarget){
 const cfg=nrSidebarBalanceConfig(site,key);
 if(!cfg||String(sec?.key||'')!==cfg.target_section||String(sec?.slot_contract||'exact')!=='sidebar-balanced')return Math.max(0,Number(baseTarget||0));
 const p=nrStructureProfile(site,key),sidebarDef=(p.sidebars||[])[0];
 let sidebar=null;try{sidebar=document.querySelector(String(sidebarDef?.root_selector||''))}catch(e){}
 if(!sidebar||!host||window.innerWidth<1001)return Math.max(0,Number(baseTarget||0));
 const base=Math.max(1,Number(sec.slots||baseTarget||1)),cols=Math.max(1,Number(sec.desktop_columns||1));
 const max=base+cols*cfg.max_extra_rows;
 const cards=nrSlotChildren(host).filter(n=>!nrIsStructureEmptyNode(n));
 const sample=cards[0]||nrSlotChildren(host)[0];
 if(!sample)return base;
 let gap=0;try{const cs=getComputedStyle(host);gap=parseFloat(cs.rowGap||cs.gap||'0')||0}catch(e){}
 const cardH=Math.max(1,sample.getBoundingClientRect().height||sample.offsetHeight||1);
 const sideH=Math.max(0,sidebar.getBoundingClientRect().height||sidebar.scrollHeight||0);
 if(!sideH)return base;
 const rowH=cardH+gap;
 const rows=Math.max(Math.ceil(base/cols),Math.ceil(Math.max(0,sideH-cfg.tolerance_px)/rowH));
 return Math.max(base,Math.min(max,rows*cols));
}
const DEFAULT_NEWS_LAYOUT={category_columns:4,category_rows:3,sidebar_enabled:1,sidebar_read_most:6,sidebar_latest:6,sidebar_categories:8,home_latest_count:12,related_count:8};
function newsLayoutProfile(site,variant=1){
 let p={};try{p=site?.layout_profile&&typeof site.layout_profile==='object'?site.layout_profile:JSON.parse(site?.layout_profile||'{}')}catch{}
 const d=variant===3?{category_columns:5,category_rows:2}:variant===4?{category_columns:2,category_rows:3}:variant===2?{category_columns:4,category_rows:3}:{};
 const out={...DEFAULT_NEWS_LAYOUT,...d,...p};
 // V15.9: Structure owns homepage density. Layout settings can style the grid, but
 // cannot silently make populated/empty/demo views thinner than the template frame.
 try{
   const st=nrStructureProfile(site,'');
   const cats=(st.sections||[]).filter(x=>String(x?.type||'')==='category'&&Number(x?.slots||0)>0);
   if(cats.length){
     const sec=cats[0],cols=Math.max(1,Number(sec.desktop_columns||out.category_columns||1));
     out.category_columns=cols;
     out.category_rows=Math.max(1,Number(sec.desktop_rows||Math.ceil(Number(sec.slots||cols)/cols)));
   }
   const latest=(st.sections||[]).find(x=>['latest','moi-nhat'].includes(String(x?.key||''))||String(x?.type||'')==='latest');
   if(latest&&Number(latest.slots||0)>0)out.home_latest_count=Math.max(1,Number(latest.slots));
 }catch(e){}
 return out;
}
function newsGridStyle(lp){return `--news-cols:${Math.max(1,Math.min(6,Number(lp.category_columns||4)))}`}
function newsCategoryUrl(base,cat){
 const u=(base||'/').replace(/\/$/,'')+'/';
 const q=new URLSearchParams();
 q.set('category',seoSlug(cat));
 // Preserve Client Simulation context when navigating between article/category routes.
 if(window.NR_CLIENT_SIM){
  const cur=new URLSearchParams(location.search);
  if(cur.has('nr_client'))q.set('nr_client',cur.get('nr_client')||'1');
  if(cur.has('nr_samples'))q.set('nr_samples',cur.get('nr_samples')||'0');
 }
 return `${u}?${q.toString()}#chuyen-muc`;
}
function nrNewsDemoBase(){
 const m=String(location.pathname||'').match(/^\/demo\/tin-tuc\/mau-[1-4]/);
 return m?m[0]:'';
}
// News Route Contract V2: legacy #cat-* links are never allowed to behave as
// homepage anchors inside a news demo. Normalize old URLs and intercept every
// click at document level so current and future templates share one routing rule.
function nrNormalizeLegacyNewsCategoryHash(){
 const base=nrNewsDemoBase();if(!base)return false;
 const m=String(location.hash||'').match(/^#cat-([^?#]+)/i);if(!m)return false;
 const q=new URLSearchParams(location.search);q.set('category',decodeURIComponent(m[1]));
 if(window.NR_CLIENT_SIM){
  const cur=new URLSearchParams(location.search);
  if(cur.has('nr_client'))q.set('nr_client',cur.get('nr_client')||'1');
  if(cur.has('nr_samples'))q.set('nr_samples',cur.get('nr_samples')||'0');
 }
 history.replaceState(null,'',`${base}/?${q.toString()}#chuyen-muc`);
 return true;
}
function nrInstallUnifiedNewsCategoryRouter(){
 if(window.__nrNewsCategoryRouterInstalled)return;
 window.__nrNewsCategoryRouterInstalled=1;
 document.addEventListener('click',e=>{
  const a=e.target?.closest?.('a');if(!a)return;
  const base=nrNewsDemoBase();if(!base)return;
  const raw=String(a.getAttribute('href')||'');
  const m=raw.match(/(?:^|\/)#cat-([^?#]+)/i)||raw.match(/^#cat-([^?#]+)/i);
  if(!m)return;
  e.preventDefault();
  const q=new URLSearchParams();q.set('category',decodeURIComponent(m[1]));
  if(window.NR_CLIENT_SIM){
   const cur=new URLSearchParams(location.search);
   if(cur.has('nr_client'))q.set('nr_client',cur.get('nr_client')||'1');
   if(cur.has('nr_samples'))q.set('nr_samples',cur.get('nr_samples')||'0');
  }
  location.href=`${base}/?${q.toString()}#chuyen-muc`;
 },true);
}
function newsCompactCard(ctx,x){
 return `<a class="news-layout-card" href="${ctx.url(x)}">
   ${nrImgTag(ctx.img(x),x.title)}
   <div><span>${esc(x.category||'Tin tức')}</span><h3>${esc(x.title)}</h3><small>${Number(x.views||0).toLocaleString('vi-VN')} lượt xem</small></div>
 </a>`;
}


function nrNewsRouteMode(){
 const p=String(location.pathname||'');
 const isNewsDemo=/^\/demo\/tin-tuc\/mau-[1-4](?:\/|$)/.test(p);
 const article=isNewsDemo&&/\.html$/i.test(p);
 const category=isNewsDemo&&!article&&new URLSearchParams(location.search).has('category');
 return {isNewsDemo,article,category,home:isNewsDemo&&!article&&!category};
}
// Unified News Route Contract V1: ARTICLE > CATEGORY > HOME.
// Category navigation must use real archive routes, never homepage #cat fallbacks from article pages.
function nrEnforceNewsRouteContract(root=document){
 const route=nrNewsRouteMode();
 if(!route.isNewsDemo)return;
 if(route.article){
  root.querySelectorAll('.news-detail-category a,.n3-article-aside a,.nvar-article a').forEach(a=>{
   const h=String(a.getAttribute('href')||'');
   const m=h.match(/#cat-([^?#]+)/);
   if(m){
    const slug=m[1];const ctxBase=location.pathname.match(/^\/demo\/tin-tuc\/mau-[1-4]/)?.[0]||'';
    a.setAttribute('href',`${ctxBase}/?category=${encodeURIComponent(slug)}#chuyen-muc`);
   }
  });
 }
}
function nrEnforceTitleOnlyCards(root=document){
 const selectors=['.n3-card','.n3-row','.news-layout-card','.news-archive-card','.np-row','.np-top-story','.nmin-latest-card','.news-related-card','.news-side-rank','.news-side-latest','.nm-tile'];
 for(const card of root.querySelectorAll(selectors.join(','))){
   card.querySelectorAll('p,.excerpt,.summary,.description,.card-excerpt,.post-excerpt').forEach(n=>n.remove());
 }
}
function maybeRenderNewsCategoryArchive(site,ctx){
 // V16.5 — a concrete article slug always wins over archive/category state.
 if(/\.html$/i.test(location.pathname))return false;
 const wanted=new URLSearchParams(location.search).get('category');
 const coreKey=newsCoreTemplateKey();if(coreKey)newsCoreApplyShell(site,ctx,coreKey);
 if(!wanted)return false;
 const allCats=(ctx.navCategories||ctx.categories||[]);const cat=allCats.find(c=>seoSlug(c)===wanted)||allCats[0];
 if(!cat)return false;
 const items=ctx.all.filter(x=>String(x.category||'').trim()===cat).slice(0,24);
 const card=x=>`<a class="news-archive-card" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title)}<div><span>${esc(x.category)}</span><h3>${esc(x.title)}</h3><small>${Number(x.views||0).toLocaleString('vi-VN')} lượt xem</small></div></a>`;
 document.querySelector('main').innerHTML=`<section class="news-category-archive" id="chuyen-muc"><div class="wrap">
   <div class="news-archive-head"><div><small>CHUYÊN MỤC</small><h1>${esc(cat)}</h1><p>Tổng hợp các bài viết thuộc chuyên mục ${esc(cat)}.</p></div><a href="${ctx.base||'/'}">← Trang chủ</a></div>
   <div class="news-archive-grid">${items.length?items.map(card).join(''):'<div class="news-archive-empty">Chưa có thêm bài viết trong chuyên mục này.</div>'}</div>
 </div></section>`;
 renderNewsFooter(site,ctx.isDemo,ctx.categories);
 return true;
}

function newsVariantDemoData(){
 return [
  {id:'nv01',title:'Giá vàng và thị trường tài chính hôm nay có gì đáng chú ý?',category:'Kinh tế',image:'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=82',views:1842,content:'Những chuyển động đáng chú ý của thị trường, dòng tiền và các yếu tố đang được quan tâm trong ngày.'},
  {id:'nv02',title:'AI đang thay đổi cách doanh nghiệp nhỏ vận hành như thế nào?',category:'Công nghệ',image:'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=82',views:1530,content:'AI đang đi sâu vào nội dung, bán hàng và chăm sóc khách hàng.'},
  {id:'nv03',title:'5 xu hướng tiêu dùng mới đang định hình thị trường Việt Nam',category:'Kinh doanh',image:'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=82',views:1328,content:'Người tiêu dùng thay đổi nhanh về cách mua sắm, thanh toán và lựa chọn sản phẩm.'},
  {id:'nv04',title:'Những điểm đến được tìm kiếm nhiều cho kỳ nghỉ ngắn ngày',category:'Du lịch',image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82',views:1214,content:'Những điểm đến gần, dễ di chuyển và có trải nghiệm riêng đang được lựa chọn nhiều.'},
  {id:'nv05',title:'Thói quen nhỏ giúp duy trì sức khỏe tốt khi làm việc văn phòng',category:'Sức khỏe',image:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=82',views:1097,content:'Vận động nhẹ, nghỉ mắt và ngủ đủ giúp duy trì hiệu suất lâu dài.'},
  {id:'nv06',title:'Thị trường nhà ở: người mua quan tâm nhiều hơn đến tiện ích',category:'Bất động sản',image:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82',views:986,content:'Ngoài vị trí và giá, chất lượng sống ngày càng ảnh hưởng đến quyết định mua nhà.'},
  {id:'nv07',title:'Kỹ năng quản lý chi tiêu cá nhân đơn giản cho người trẻ',category:'Đời sống',image:'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=82',views:874,content:'Một kế hoạch chi tiêu rõ ràng giúp kiểm soát dòng tiền tốt hơn.'},
  {id:'nv08',title:'Điện thoại mới tập trung nhiều hơn vào pin và khả năng xử lý AI',category:'Công nghệ',image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=82',views:812,content:'Smartphone tiếp tục cạnh tranh ở pin, camera và tính năng AI.'},
  {id:'nv09',title:'Các món ăn gia đình dễ làm cho ngày bận rộn',category:'Đời sống',image:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=82',views:761,content:'Những lựa chọn nhanh gọn giúp bữa cơm đủ dinh dưỡng.'},
  {id:'nv10',title:'Doanh nghiệp nhỏ tận dụng mạng xã hội để tiếp cận khách hàng địa phương',category:'Kinh doanh',image:'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82',views:743,content:'Nội dung đều đặn và thông tin liên hệ rõ ràng vẫn là nền tảng quan trọng.'},
  {id:'nv11',title:'Du lịch tự túc: những khoản nên dự trù trước chuyến đi',category:'Du lịch',image:'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=82',views:694,content:'Chuẩn bị ngân sách trước giúp chuyến đi chủ động hơn.'},
  {id:'nv12',title:'Không gian xanh trở thành tiêu chí của các khu đô thị mới',category:'Bất động sản',image:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82',views:652,content:'Không gian xanh và tiện ích cộng đồng ngày càng được chú ý.'},
  {id:'nv13',title:'Ba cách bảo vệ dữ liệu cá nhân khi sử dụng dịch vụ trực tuyến',category:'Công nghệ',image:'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=82',views:621,content:'Mật khẩu mạnh và xác thực hai lớp là những biện pháp cơ bản.'},
  {id:'nv14',title:'Tập luyện ngắn mỗi ngày có thể tạo khác biệt lớn sau vài tháng',category:'Sức khỏe',image:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=82',views:589,content:'Duy trì lịch tập phù hợp quan trọng hơn việc cố gắng quá sức.'},
  {id:'nv15',title:'Kinh doanh online: vì sao website riêng vẫn có giá trị lâu dài?',category:'Kinh doanh',image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=82',views:556,content:'Website riêng giúp doanh nghiệp kiểm soát thương hiệu và nội dung tốt hơn.'},
  {id:'nv16',title:'Thiết kế tối giản vẫn được ưa chuộng trong không gian sống hiện đại',category:'Nhà đẹp',image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=82',views:426,content:'Ít chi tiết nhưng chú trọng công năng là hướng được nhiều gia đình lựa chọn.'}
 ].map(x=>({...x,type:'news',demo:true}));
}
// V15.2 — Structure First helpers.
function nrStructureProfile(site,key=''){
 let p={};try{p=site?.structure_profile&&typeof site.structure_profile==='object'?site.structure_profile:JSON.parse(site?.structure_profile||'{}')}catch(e){}
 return p&&Array.isArray(p.sections)?p:{version:1,content_type:'generic',sections:[]};
}
function nrStructureSections(site,key=''){return nrStructureProfile(site,key).sections||[]}
function nrStructureSidebars(site,key=''){const p=nrStructureProfile(site,key);return Array.isArray(p.sidebars)?p.sidebars:[]}
function nrSidebarPlaceholder(type='list',i=0){
 const t=String(type||'list');
 if(t==='categories')return `<a class="nr-sidebar-placeholder nr-sidebar-category-placeholder" aria-hidden="true">Chuyên mục ${i+1}</a>`;
 if(t==='ranked')return `<div class="nr-sidebar-placeholder nr-sidebar-rank-placeholder" aria-hidden="true"><b>${String(i+1).padStart(2,'0')}</b><span>Chưa có bài viết</span></div>`;
 return `<div class="nr-sidebar-placeholder nr-sidebar-item-placeholder" aria-hidden="true"><span class="nr-sidebar-thumb"></span><span>Chưa có bài viết</span></div>`;
}
function nrLegacySidebarShell(site,key=''){
 const bars=nrStructureSidebars(site,key);if(!bars.length)return '';
 const box=(title,cls='')=>`<section class="news-side-box ${cls}"><div class="n3-aside-title">${esc(title)}</div>${cls.includes('news-side-categories')?'<div></div>':''}</section>`;
 if(key==='tin-tuc-1')return `<aside class="n3-popular news-home-sidebar" id="doc-nhieu">${box('ĐỌC NHIỀU')}${box('CHUYÊN MỤC','news-side-categories')}${box('TIN MỚI')}</aside>`;
 if(key==='tin-tuc-2')return `<aside class="np-home-sidebar news-home-sidebar" id="doc-nhieu">${box('ĐỌC NHIỀU')}${box('CHUYÊN MỤC','news-side-categories')}${box('TIN MỚI')}</aside>`;
 if(key==='tin-tuc-4')return `<aside id="doc-nhieu"><h3>Đọc nhiều</h3></aside>`;
 return '';
}
function nrApplySidebarStructure(site,key=''){
 const bars=nrStructureSidebars(site,key);if(!bars.length)return;
 for(const sb of bars){
  let root=null;try{root=document.querySelector(String(sb.root_selector||''))}catch(e){}
  if(!root)continue;
  root.dataset.nrSidebarRoot=String(key||'template');
  for(const w of (sb.widgets||[])){
   let target=root;
   if(w.selector){try{const q=String(w.selector);target=(q===String(sb.root_selector||''))?root:(root.querySelector(q)||document.querySelector(q)||root)}catch(e){target=root}}
   if(!target)continue;
   target.dataset.nrSidebarWidget=String(w.key||'widget');
   [...target.querySelectorAll(':scope > .empty,:scope > .nr-structure-empty,:scope > .nr-sidebar-placeholder')].forEach(n=>n.remove());
   let itemHost=target;
   if(String(w.type||'')==='categories'){
    const inner=target.matches?.('.news-side-categories')?target.querySelector(':scope > div:last-child'):null;
    if(inner)itemHost=inner;
   }
   const children=[...itemHost.children].filter(n=>!n.classList?.contains('n3-aside-title')&&!n.matches?.('h1,h2,h3,h4'));
   const real=children.filter(n=>!n.classList?.contains('nr-sidebar-placeholder'));
   const slots=Math.max(0,Number(w.slots||0));
   for(let i=real.length;i<slots;i++)itemHost.insertAdjacentHTML('beforeend',nrSidebarPlaceholder(w.type,i));
  }
 }
}
function nrStructureCategories(site,key='',fallback=[]){
 const cats=nrStructureSections(site,key).filter(x=>x?.type==='category').map(x=>String(x.category||x.title||'').trim()).filter(Boolean);
 return cats.length?[...new Set(cats)]:fallback;
}
function nrApplyStructureOrder(site,key=''){
 const profile=nrStructureProfile(site,key),main=document.querySelector('main');if(!main||!profile.sections?.length)return;
 // New templates: just emit data-structure-key on each top-level block. No core edit needed.
 const keyed=new Map([...main.children].filter(n=>n?.dataset?.structureKey).map(n=>[n.dataset.structureKey,n]));
 // First map old templates by their visible headings. This keeps the profile synced
 // with the real frame without deriving the frame from post data.
 const norm=v=>String(v||'').replace(/\s+/g,' ').trim().toLowerCase();
 for(const sec of profile.sections){
  if(keyed.has(String(sec.key||''))||!sec.title)continue;
  const want=norm(sec.title);
  const n=[...main.children].find(node=>{const h=node.querySelector?.('h1,h2');const tx=norm(h?.textContent||'');return tx&&(tx===want||tx.includes(want)||want.includes(tx))});
  if(n){n.dataset.structureKey=String(sec.key||'');keyed.set(String(sec.key||''),n)}
 }
 // Compatibility adapter for sections without a visible heading in the 9 legacy templates.
 if(keyed.size<profile.sections.length){
  const maps={
   // V20.4.2 — Mẫu 1 must keep the same structural order in showroom demo and Trial.
   // Do not infer the hero from its dynamic headline: sample content titles may not contain
   // the words "Bất động sản", which previously caused `latest` to be prepended above hero.
   'mau-1':[['hero','.hero-home'],['latest','.section:has(#propertyCards)'],['needs','.category-links-section']],
   'tin-tuc-1':[['breaking','.n3-breaking'],['hero','.n3-hero'],['topics','.n3-topics'],['latest','#moi-nhat'],['explore','.n3-wide-list'],['newsletter','.n3-newsletter']],
   'tin-tuc-2':[['ticker','.np-ticker'],['hero','.np-main'],['latest','.np-latest-zone']],
   'tin-tuc-3':[['editors-pick','.nm-hero'],['trending','.nm-strip'],['weekend','.nm-dark']],
   'tin-tuc-4':[['intro','.nmin-intro'],['lead','.nmin-lead'],['latest','.nmin-main']],
   'mau-2':[['hero','.t2-hero'],['benefits','.t2-benefits'],['featured','.t2-featured-section'],['quick-categories','.t2-quick-categories'],['sale','.t2-market-section'],['rent','.t2-rent-section'],['local','.t2-local-section'],['latest','.t2-latest-section'],['news','.t2-news-section'],['bottom-benefits','.t2-bottom-benefits']],
   'mau-3':[['hero','.e3-hero'],['intro','.e3-intro'],['projects','.estate-project-strip'],['services','.estate-service-band'],['news','.e3-news']],
   'mau-4':[['intro','.e4-intro'],['search','.e4-search-wrap'],['categories','.e4-cats'],['projects','.estate-project-strip'],['stats','.e4-band'],['services','.estate-service-band'],['news','.e4-news']],
   'mau-5':[['hero','.e5-hero'],['areas','.e5-area'],['projects','.estate-project-strip'],['sale-rent','.e5-split'],['services','.estate-service-band'],['news','.e5-news']]
  };
  for(const [k,sel] of maps[key]||[]){const n=main.querySelector(':scope > '+sel);if(n){n.dataset.structureKey=k;keyed.set(k,n)}}
  const cats=[...main.querySelectorAll(':scope > .n3-category,:scope > .np-section[id^="cat-"],:scope > .nm-section,:scope > .nmin-topic')];
  cats.forEach((n,i)=>{const k='cat-'+(i+1);n.dataset.structureKey=k;keyed.set(k,n)});
 }
 if(!keyed.size)return;
 let anchor=null;
 for(const sec of profile.sections){const n=keyed.get(String(sec.key||''));if(!n)continue;if(anchor)anchor.after(n);else main.prepend(n);anchor=n}
}

function nrEmptyBox(label='Chưa có bài viết.'){return `<div class="empty nr-structure-empty">${esc(label)}</div>`}
function nrStructureSection(site,key,matcher=''){
 const sections=nrStructureSections(site,key);const m=String(matcher||'').toLowerCase().trim();
 return sections.find(x=>String(x.key||'')===matcher)||sections.find(x=>String(x.title||'').toLowerCase().trim()===m)||null;
}
function nrStructureSlots(site,key,matcher,fallback=0){const s=nrStructureSection(site,key,matcher);return Math.max(0,Number(s?.slots||fallback||0));}
function nrStructurePlaceholder(type='generic',label=''){
 const property=String(type||'').includes('property');
 return `<article class="nr-structure-placeholder ${property?'nr-property-placeholder':'nr-content-placeholder'}" data-contract-slot="1" data-empty="1" aria-hidden="true"><div class="nr-placeholder-media"></div><div class="nr-placeholder-body"><span></span><b>${esc(label||(property?'Chưa có tin đăng':'Chưa có bài viết'))}</b><small>Nội dung sẽ hiển thị tại đây</small></div></article>`;
}
function nrGridColumns(grid,fallback=1){
 try{
  const css=getComputedStyle(grid).gridTemplateColumns||'';
  if(css&&css!=='none'){
   const parts=css.trim().split(/\s+/).filter(Boolean);
   if(parts.length)return Math.max(1,parts.length);
  }
 }catch(e){}
 return Math.max(1,Number(fallback||1));
}
function nrIsStructureEmptyNode(n){
 if(!n)return false;
 return n.dataset?.empty==='1'||n.classList?.contains('nr-structure-placeholder')||n.classList?.contains('nr-structure-empty')||n.classList?.contains('tel-empty')||n.classList?.contains('svc1-empty')||n.classList?.contains('empty')||n.classList?.contains('category-empty')||n.hasAttribute?.('data-empty');
}
function nrSlotHostConfig(sec,section){
 const declared=Array.isArray(sec?.slot_hosts)?sec.slot_hosts:[];
 if(declared.length){
  return declared.map((h,i)=>{
   let node=null;try{node=(section&&section.querySelector(String(h?.selector||'')))||document.querySelector(String(h?.selector||''))}catch(e){}
   return {node,slots:Math.max(0,Number(h?.slots||0)),selector:String(h?.selector||''),index:i};
  }).filter(x=>x.node&&x.slots>0);
 }
 let grid=null;
 if(sec?.grid_selector){try{grid=(section&&section.querySelector(sec.grid_selector))||document.querySelector(sec.grid_selector)}catch(e){}}
 if(!grid&&section){
  const selectors=['[data-contract-grid="1"]','.estate-rich-grid','.estate-news-grid','.estate-project-grid','.news-configurable-grid','.nm-mosaic','.nm-dark-grid','.n3-grid','.n3-wide-grid','.np-list','.np-category-grid','.nmin-latest-grid','.nmin-lead-grid','.t2-card-grid','.t2-card-track','.t2-news-grid','.cards'];
  for(const sel of selectors){grid=section.querySelector(sel);if(grid)break}
 }
 return grid?[{node:grid,slots:Math.max(0,Number(sec?.slots||0)),selector:String(sec?.grid_selector||''),index:0}]:[];
}
function nrSlotChildren(host){
 const direct=[...host.children];
 const explicit=direct.filter(n=>n.dataset?.contractSlot==='1');
 if(explicit.length)return explicit;
 return direct.filter(n=>!n.matches?.('h1,h2,h3,h4,.section-head,.tel-heading,.svc1-head,.nm-title,.np-heading,.n3-heading'));
}
function nrEnforceSlotHost(host,target,sec,profile){
 if(!host||target<=0)return {expected:target,actual:0};
 // Remove message-style empties first; contract slots are recreated deterministically below.
 [...host.children].filter(n=>nrIsStructureEmptyNode(n)&&n.dataset?.contractSlot!=='1').forEach(n=>n.remove());
 let slotsNow=nrSlotChildren(host);
 if(slotsNow.length>target){slotsNow.slice(target).forEach(n=>n.remove());slotsNow=slotsNow.slice(0,target)}
 let real=slotsNow.filter(n=>!nrIsStructureEmptyNode(n));
 // Homepage slot count is a view contract. Extra real content stays in DB/archive but not in this homepage section.
 if(real.length>target){real.slice(target).forEach(n=>n.remove());real=real.slice(0,target)}
 for(const n of real)n.dataset.contractSlot='1';
 const current=nrSlotChildren(host).length;
 for(let i=current;i<target;i++)host.insertAdjacentHTML('beforeend',nrStructurePlaceholder(sec?.type));
 const locked=Number(profile?.geometry_locked||0)===1;
 const customHosts=Array.isArray(sec?.slot_hosts)&&sec.slot_hosts.length>0;
 if(locked&&!customHosts&&String(sec?.column_mode||'fixed')!=='computed'&&!host.classList.contains('t2-card-track')){
  const cols=Math.max(1,Number(sec?.desktop_columns||1));
  host.classList.add('nr-structure-grid');
  host.style.setProperty('--nr-cols-desktop',String(cols));
  host.style.setProperty('--nr-cols-tablet',String(Math.max(1,Number(sec?.tablet_columns||Math.min(2,cols)))));
  host.style.setProperty('--nr-cols-mobile',String(Math.max(1,Number(sec?.mobile_columns||1))));
 }
 host.dataset.nrTargetSlots=String(target);
 host.dataset.nrActualSlots=String(nrSlotChildren(host).length);
 return {expected:target,actual:nrSlotChildren(host).length};
}
function nrApplyStructureGeometry(site,key=''){
 const profile=nrStructureProfile(site,key),main=document.querySelector('main');if(!main||!profile.sections?.length)return;
 const report=[];
 for(const sec of profile.sections){
  const expected=Math.max(0,Number(sec.slots||0));if(!expected)continue;
  const section=main.querySelector(`[data-structure-key="${CSS.escape(String(sec.key||''))}"]`);
  if(!section){report.push({key:sec.key,expected,actual:0,error:'missing-section'});continue}
  const hosts=nrSlotHostConfig(sec,section);
  if(!hosts.length){report.push({key:sec.key,expected,actual:0,error:'missing-slot-host'});continue}
  let actual=0,hostExpected=0;
  for(const h of hosts){
   const dynamicTarget=hosts.length===1?nrSidebarBalancedTarget(site,key,sec,h.node,h.slots):h.slots;
   const r=nrEnforceSlotHost(h.node,dynamicTarget,sec,profile);actual+=r.actual;hostExpected+=r.expected
  }
  // Exact sections stay exact. Sidebar-balanced latest sections may grow by complete
  // rows, but never below the declared minimum and never beyond the configured cap.
  const target=hostExpected||expected,balanced=String(sec.slot_contract||'exact')==='sidebar-balanced';
  const ok=balanced?(actual===target&&target>=expected):(actual===expected&&target===expected);
  report.push({key:sec.key,expected,target,actual,balanced,ok});
  section.dataset.nrExpectedSlots=String(target);section.dataset.nrBaseSlots=String(expected);section.dataset.nrActualSlots=String(actual);
 }
 window.NR_TEMPLATE_LAYOUT_REPORT=report;
}
function nrAuditStructureContract(site,key=''){
 const p=nrStructureProfile(site,key),main=document.querySelector('main');if(!main)return {ok:false,reason:'missing-main'};
 const errors=[];
 for(const sec of p.sections||[]){
  if(Number(sec.bind_required||0)!==1)continue;
  const node=main.querySelector(`[data-structure-key="${CSS.escape(String(sec.key||''))}"]`);
  if(!node){errors.push({section:sec.key,error:'missing-section'});continue}
  const expected=Math.max(0,Number(sec.slots||0));if(!expected)continue;
  const hosts=nrSlotHostConfig(sec,node);if(!hosts.length){errors.push({section:sec.key,error:'missing-slot-host'});continue}
  const balanced=String(sec.slot_contract||'exact')==='sidebar-balanced';
  const target=balanced?Math.max(expected,Number(node.dataset.nrExpectedSlots||expected)):expected;
  const hostTotal=balanced?target:hosts.reduce((s,h)=>s+Math.max(0,Number(h.slots||0)),0);
  const actual=hosts.reduce((s,h)=>s+nrSlotChildren(h.node).length,0);
  if(!balanced&&hostTotal!==expected)errors.push({section:sec.key,error:'host-total-mismatch',expected,hostTotal});
  if(actual!==target)errors.push({section:sec.key,error:'slot-mismatch',expected:target,base:expected,actual});
 }
 for(const sb of (p.sidebars||[])){let r=null;try{r=document.querySelector(String(sb.root_selector||''))}catch(e){}if(!r)errors.push({sidebar:sb.root_selector,error:'missing-sidebar'})}
 const report={ok:errors.length===0,key,version:String(p.layout_contract||'universal-layout-v1'),errors};
 window.NR_TEMPLATE_CONTRACT_REPORT=report;
 if(errors.length)console.error('[NEWSREAL Universal Template Contract] FAIL',report);else console.info('[NEWSREAL Universal Template Contract] OK',key);
 return report;
}
function nrNewsStructureHtml(site,ctx,variant,key){
 const sections=nrStructureSections(site,key);if(!sections.length)return '';
 let ci=0;const e=()=>nrEmptyBox();
 return sections.map(sec=>{
  const type=String(sec.type||''),title=String(sec.title||''),cat=String(sec.category||title||'');
  if(variant===3){
   if(type==='hero')return `<section class="nm-hero"><div class="wrap"><div class="nm-kicker">${esc(title)}</div><div class="nm-mosaic news-client-empty-hero">${e()}</div></div></section>`;
   if(type==='trending')return `<section class="nm-strip" id="moi-nhat"><div class="wrap"><h2>${esc(title||'Trending now')}</h2><div>${e()}</div></div></section>`;
   if(type==='category'){ci++;return `<section class="nm-section" id="cat-${seoSlug(cat)}"><div class="wrap"><div class="nm-title"><span>${String(ci).padStart(2,'0')}</span><h2>${esc(cat)}</h2><a class="nm-more" href="#cat-${seoSlug(cat)}">Xem thêm →</a></div><div class="nm-cards news-configurable-grid" style="${newsGridStyle(ctx.layout)}">${e()}</div></div></section>`;}
   if(type==='special')return `<section class="nm-dark" id="doc-nhieu"><div class="wrap"><div><small>${esc(sec.eyebrow||'WEEKEND READ')}</small><h2>${esc(title)}</h2></div><div class="nm-dark-grid">${e()}</div></div></section>`;
  }
  if(variant===2){
   if(type==='ticker')return `<section class="np-ticker"><div class="wrap"><b>${esc(title||'TIN NÓNG')}</b><span>Chưa có bài viết</span></div></section>`;
   if(type==='hero')return `<section class="np-main"><div class="wrap np-top-grid">${e()}</div></section>`;
   if(type==='latest')return `<section class="np-section np-latest-zone" id="moi-nhat"><div class="wrap"><div class="np-heading"><h2>${esc(title||'Tin mới nhất')}</h2><span>0 bài viết</span></div><div class="np-content-layout"><div class="np-list">${e()}</div>${nrLegacySidebarShell(site,key)}</div></div></section>`;
   if(type==='category')return `<section class="np-section" id="cat-${seoSlug(cat)}"><div class="wrap"><div class="np-heading"><h2>${esc(cat)}</h2><a href="#cat-${seoSlug(cat)}">Xem thêm →</a></div><div class="np-category-grid news-configurable-grid" style="${newsGridStyle(ctx.layout)}">${e()}</div></div></section>`;
  }
  if(variant===4){
   if(type==='intro')return `<section class="nmin-intro"><div class="wrap"><span>ĐỌC · HIỂU · GHI NHỚ</span><h1>${esc(title)}</h1></div></section>`;
   if(type==='hero')return `<section class="nmin-lead"><div class="wrap nmin-lead-grid">${e()}</div></section>`;
   if(type==='latest')return `<section class="nmin-main" id="moi-nhat"><div class="wrap nmin-layout"><div><div class="nmin-title"><h2>${esc(title||'Mới nhất')}</h2><span>0 bài viết</span></div>${e()}</div>${nrLegacySidebarShell(site,key)}</div></section>`;
   if(type==='category')return `<section class="nmin-topic" id="cat-${seoSlug(cat)}"><div class="wrap"><div class="nmin-topic-head"><h2>${esc(cat)}</h2><a href="#cat-${seoSlug(cat)}">Xem thêm →</a></div><div class="news-configurable-grid" style="${newsGridStyle(ctx.layout)}">${e()}</div></div></section>`;
  }
  if(variant===1){
   if(type==='breaking')return `<section class="n3-breaking"><div class="wrap"><b>${esc(title||'MỚI NHẤT')}</b><div><span>Chưa có bài viết</span></div></div></section>`;
   if(type==='hero')return `<section class="n3-hero"><div class="wrap n3-hero-grid"><div class="n3-lead">${e()}</div><div class="n3-side">${e()}</div></div></section>`;
   if(type==='topics')return `<section class="n3-topics"><div class="wrap">${ctx.categories.map(c=>`<a href="#cat-${seoSlug(c)}">${esc(c)}</a>`).join('')}</div></section>`;
   if(type==='latest')return `<section class="n3-section" id="moi-nhat"><div class="wrap"><div class="n3-title"><div><small>DÒNG TIN</small><h2>${esc(title||'Tin mới nhất')}</h2></div><span>0 bài viết</span></div><div class="n3-layout"><div class="n3-grid">${e()}</div>${nrLegacySidebarShell(site,key)}</div></div></section>`;
   if(type==='category'){ci++;return `<section class="n3-section n3-category" id="cat-${seoSlug(cat)}"><div class="wrap"><div class="n3-title"><div><small>CHUYÊN MỤC ${String(ci).padStart(2,'0')}</small><h2>${esc(cat)}</h2></div><a href="#cat-${seoSlug(cat)}">Xem thêm →</a></div><div class="news-configurable-grid n3-config-category-grid" style="${newsGridStyle(ctx.layout)}">${e()}</div></div></section>`;}
   if(type==='explore')return `<section class="n3-wide-list"><div class="wrap"><div class="n3-title"><div><small>KHÁM PHÁ</small><h2>${esc(title)}</h2></div></div><div class="n3-wide-grid">${e()}</div></div></section>`;
   if(type==='newsletter')return `<section class="n3-newsletter n3-newsletter-light"><div class="wrap"><div><small>WEBSITE TIN TỨC RIÊNG</small><h2>${esc(title)}</h2><p>Website đã sẵn khung và đang chờ nội dung đầu tiên.</p></div></div></section>`;
  }
  return `<section class="nr-generic-structure-section"><div class="wrap"><h2>${esc(title||sec.key||'Nội dung')}</h2>${e()}</div></section>`;
 }).join('');
}

function newsVariantContext(site,variant){
 const isDemo=/^tin-tuc-[234]$/.test(window.NR_DEMO_THEME||'');
 const isShowroom=isDemo&&!window.NR_TRIAL_TOKEN&&!window.NR_CLIENT_SIM;
 const apiNews=(SITE_DATA.posts||[]).filter(x=>x.type==='news');
 // V16.0 — Same contract for News templates 2–4: the public showroom consumes
 // the API blueprint first. Local demo data is fallback-only, never the primary source.
 let source=(isShowroom?(apiNews.length?apiNews:newsVariantDemoData()):apiNews);
 // Article pages may receive a narrow API payload. Keep the current post first but
 // enrich demo navigation/sidebar with the shared pool so the article shell is never empty.
 if(isShowroom&&/\.html$/i.test(location.pathname)&&source.length<18){
   const seen=new Set(source.map(x=>String(x.id??x.sample_key??x.title??'')));
   source=[...source,...newsVariantDemoData().filter(x=>!seen.has(String(x.id??x.sample_key??x.title??'')))];
 }
 const all=source.sort((a,b)=>Number(b.id||0)-Number(a.id||0));
 let profileCategories=[];
 try{const ep=site?.editor_profile&&typeof site.editor_profile==='object'?site.editor_profile:JSON.parse(site?.editor_profile||'{}');profileCategories=Array.isArray(ep?.categories)?ep.categories.map(x=>String(x||'').trim()).filter(Boolean):[]}catch(e){}
 const dataCategories=[...new Set(all.map(x=>String(x.category||'Tin mới').trim()).filter(Boolean))];
 const key=`tin-tuc-${variant}`;
 // Structure categories continue to own homepage sections. Navigation/Admin use the
 // expanded taxonomy so adding categories never changes the established homepage frame.
 const categories=nrStructureCategories(site,key,profileCategories.length?profileCategories:dataCategories).slice(0,12);
 const navCategories=[...new Set([...(profileCategories||[]),...NR_NEWS_TAXONOMY_V1,...dataCategories].map(x=>String(x||'').trim()).filter(Boolean))];
 const base=isDemo?`/demo/tin-tuc/mau-${variant}`:'';
 const url=x=>{if(!isDemo)return seoPostUrl(x);const raw=String(x?.demo_url||`${base}/${seoSlug(x.title)}.html`);return window.NR_CLIENT_SIM&&window.nrClientSimUrl?window.nrClientSimUrl(raw):raw};
 const img=x=>esc(x.image||getImages(x)[0]||fallbackImage());
 const excerpt=x=>esc(String(x?.content||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,150));
 const layout=newsLayoutProfile(site,variant);return {isDemo,all,categories,navCategories,base,url,img,excerpt,layout,structure:nrStructureProfile(site,key)};
}
function setupNewsVariantHeader(site,ctx,key,title){newsCoreApplyShell(site,ctx,key)}
function nrDemoWindow(items,start,count,isDemo){
 const src=(items||[]).filter(Boolean),need=Math.max(0,Number(count||0));
 if(!need||!src.length)return [];
 const direct=src.slice(start,start+need);
 if(!isDemo||direct.length>=need)return direct;
 const out=[...direct],used=new Set(out.map(x=>String(x?.id??x?.sample_key??x?.title??'')));
 let i=0,guard=0;
 while(out.length<need&&guard++<src.length*4+need*2){
  const x=src[(start+direct.length+i)%src.length];i++;if(!x)continue;
  const id=String(x?.id??x?.sample_key??x?.title??'');
  if(!used.has(id)||used.size>=src.length){out.push(x);used.add(id)}
 }
 return out.slice(0,need);
}

function renderNewsClientEmpty(site,ctx,variant){
 if(ctx.all.length!==0)return false;
 const key=`tin-tuc-${variant}`;
 // V19.1 — Empty Trial must still inherit the selected NEWS shell before we return.
 // Without this, Template 1 returned early and kept the property navigation from index.html.
 newsCoreApplyShell(site,ctx,key);
 const html=nrNewsStructureHtml(site,ctx,variant,key);
 if(!html)return false;
 const main=document.querySelector('main');if(main)main.innerHTML=html;
 renderNewsFooter(site,ctx.isDemo,ctx.categories);
 return true;
}

function renderVariantArticle(site,ctx,variant,key){
 if(!ctx.isDemo)return false;
 const slug=location.pathname.replace(new RegExp(`^/demo/tin-tuc/mau-${variant}/?`),'').replace(/\.html$/,'').replace(/^\/+|\/+$/g,'');
 if(!slug)return false;
 const article=ctx.all.find(x=>seoSlug(x.title)===slug);if(!article)return false;
 newsCoreApplyShell(site,ctx,key,{article:true});

 const related=newsCoreRelated(ctx,article);

 const card=x=>`<a class="news-related-card" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title)}<span>${esc(x.category)}</span><h3>${esc(x.title)}</h3></a>`;
 const side=newsArticleSidebar(ctx,article);

 const brand=variant===2?'Báo điện tử':variant===3?'Magazine hiện đại':'Minimal SEO';
 const main=document.querySelector('main');
 main.innerHTML=`<article class="nvar-article news-detail-v${variant}"><div class="wrap nvar-article-grid">
  <div class="nvar-article-main">
   <div class="n3-breadcrumb"><a href="${ctx.base}/">Trang chủ</a><span>›</span><a href="${newsCategoryUrl(ctx.base,article.category)}">${esc(article.category)}</a></div>
   <span class="n3-article-cat">${esc(article.category)}</span>
   <h1>${esc(article.title)}</h1>
   <div class="n3-article-meta">30/08/2026 · ${Number(article.views||0).toLocaleString('vi-VN')} lượt xem · ${brand}</div>
   <p class="n3-article-lead">${ctx.excerpt(article)}</p>
   ${nrImgTag(ctx.img(article),article.title,'n3-article-cover',{eager:true,width:960})}
   <div class="n3-article-content">
    ${nrSafeRichHtml(article.content)}
    <h2>Nội dung chi tiết</h2>
    <p>Bài viết demo này minh họa cách một nội dung dài được trình bày trong mẫu ${variant}. Ảnh đại diện luôn nằm trong cột bài viết, không chồng lên sidebar hay phần văn bản.</p>
    <p>Khách hàng có thể dùng trình soạn thảo trong Client Admin để chèn ảnh giữa bài, định dạng tiêu đề H2/H3, danh sách, liên kết, chữ đậm, chữ nghiêng và nhiều đoạn nội dung.</p>
    <h2>Thông tin đáng chú ý</h2>
    <p>Cấu trúc trang bài được thiết kế để người đọc dễ theo dõi từ phần mở đầu đến các ý chính. Sidebar giữ các nội dung quan trọng trong tầm nhìn khi người đọc cuộn bài dài.</p>
    <blockquote>Nội dung trên website thật sẽ được lấy trực tiếp từ dữ liệu do khách hàng đăng và quản lý.</blockquote>
    <h2>Góc nhìn mở rộng</h2>
    <p>Ngoài bài liên quan, phía dưới còn có các khối chuyên mục khác nhau nhằm tăng số trang được xem trong một phiên và giúp người đọc khám phá nhiều nội dung hơn.</p>
    <p>Đây là nội dung trình diễn nên thông tin chỉ mang tính minh họa cho thiết kế và khả năng trình bày của template.</p>
   </div>
   <div class="n3-related"><div class="n3-title"><div><small>CÙNG CHUYÊN MỤC</small><h2>Bài viết liên quan</h2></div></div><div class="news-related-grid">${related.map(card).join('')}</div></div>
  </div>
  ${side?`<aside class="n3-article-aside">${side}</aside>`:''}
 </div></article>
 ${ctx.categories.filter(c=>c!==article.category).slice(0,3).map((cat,idx)=>{
   const items=ctx.all.filter(x=>x.id!==article.id&&x.category===cat).concat(ctx.all.filter(x=>x.id!==article.id&&x.category!==cat)).slice(0,4);
   return `<section class="news-detail-category ${idx%2?'alt':''}"><div class="wrap"><div class="n3-title"><div><small>CHUYÊN MỤC KHÁC</small><h2>${esc(cat)}</h2></div><a href="${newsCategoryUrl(ctx.base,cat)}">Xem chuyên mục →</a></div><div class="news-detail-category-grid">${items.map(card).join('')}</div></div></section>`;
 }).join('')}
 <section class="news-detail-more"><div class="wrap"><div class="n3-title"><div><small>TIN MỚI</small><h2>Tiếp tục khám phá</h2></div></div><div class="news-detail-category-grid">${ctx.all.filter(x=>x.id!==article.id&&!related.includes(x)).slice(0,8).map(card).join('')}</div></div></section>`;

 renderNewsFooter(site,true,ctx.categories);
 // Always land users at the article headline, even when they came from a scrolled archive.
 try{if('scrollRestoration' in history)history.scrollRestoration='manual';window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0));setTimeout(()=>window.scrollTo(0,0),80)}catch(e){window.scrollTo(0,0)}
 return true;
}
function renderNewsPaperHome(site){
 const ctx=newsVariantContext(site,2);setupNewsVariantHeader(site,ctx,'tin-tuc-2','TIN NHANH 360');if(renderNewsClientEmpty(site,ctx,2))return;if(renderVariantArticle(site,ctx,2,'tin-tuc-2'))return;if(maybeRenderNewsCategoryArchive(site,ctx))return;
 const a=ctx.all,lead=a[0],side=a.slice(1,5),latest=a.slice(1,1+nrNewsHomeLatestRenderCount(site,'tin-tuc-2',ctx.layout.home_latest_count));
 const row=x=>`<a class="np-row" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title)}<div><span>${esc(x.category)}</span><h3>${esc(x.title)}</h3><small>${Number(x.views||0).toLocaleString('vi-VN')} lượt xem</small></div></a>`;
 const compact=x=>`<a class="np-top-story" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title)}<div><span>${esc(x.category)}</span><h3>${esc(x.title)}</h3><small>${Number(x.views||0).toLocaleString('vi-VN')} lượt xem</small></div></a>`;
 const sidebar=ctx.layout.sidebar_enabled?`<aside class="np-home-sidebar" id="doc-nhieu">
   <section class="news-side-box"><div class="n3-aside-title">ĐỌC NHIỀU</div>${[...a].sort((x,y)=>y.views-x.views).slice(0,ctx.layout.sidebar_read_most).map((x,i)=>`<a class="news-side-rank" href="${ctx.url(x)}"><b>${String(i+1).padStart(2,'0')}</b><div><span>${esc(x.category)}</span><h3>${esc(x.title)}</h3></div></a>`).join('')}</section>
   <section class="news-side-box news-side-categories"><div class="n3-aside-title">CHUYÊN MỤC</div><div>${ctx.categories.slice(0,ctx.layout.sidebar_categories).map(c=>`<a href="${newsCategoryUrl(ctx.base,c)}">${esc(c)}</a>`).join('')}</div></section>
   <section class="news-side-box"><div class="n3-aside-title">TIN MỚI</div>${a.slice(0,ctx.layout.sidebar_latest).map(x=>`<a class="news-side-latest" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title,'',{width:420})}<span>${esc(x.title)}</span></a>`).join('')}</section>
 </aside>`:'';

 document.querySelector('main').innerHTML=`<section class="np-ticker"><div class="wrap"><b>TIN NÓNG</b>${a.slice(0,4).map(x=>`<a href="${ctx.url(x)}">${esc(x.title)}</a>`).join('<i>•</i>')}</div></section>

 <section class="np-main"><div class="wrap np-top-grid">
   <article class="np-lead"><a href="${ctx.url(lead)}">${nrImgTag(ctx.img(lead),lead.title)}<span>${esc(lead.category)}</span><h1>${esc(lead.title)}</h1><small>${Number(lead.views||0).toLocaleString('vi-VN')} lượt xem</small></a></article>
   <div class="np-top-side">${side.map(compact).join('')}</div>
 </div></section>

 <section class="np-section np-latest-zone" id="moi-nhat"><div class="wrap">
   <div class="np-heading"><h2>Tin mới nhất</h2><span>Cập nhật liên tục</span></div>
   <div class="np-content-layout">
     <div class="np-list">${latest.map(row).join('')}</div>
     ${sidebar}
   </div>
 </div></section>

 ${ctx.categories.slice(0,5).map(c=>`<section class="np-section" id="cat-${seoSlug(c)}"><div class="wrap"><div class="np-heading"><h2>${esc(c)}</h2><a href="${newsCategoryUrl(ctx.base,c)}">Xem thêm →</a></div><div class="np-category-grid news-configurable-grid" style="${newsGridStyle(ctx.layout)}">${a.filter(x=>x.category===c).slice(0,ctx.layout.category_columns*ctx.layout.category_rows).map(x=>newsCompactCard(ctx,x)).join('')}</div></div></section>`).join('')}`;
 renderNewsFooter(site,ctx.isDemo,ctx.categories);
}
function renderNewsMagazineHome(site){
 const ctx=newsVariantContext(site,3);setupNewsVariantHeader(site,ctx,'tin-tuc-3','MOSAIC MAG');if(renderNewsClientEmpty(site,ctx,3))return;if(renderVariantArticle(site,ctx,3,'tin-tuc-3'))return;if(maybeRenderNewsCategoryArchive(site,ctx))return;
 const a=ctx.all;
 const tile=(x,cls='')=>`<a class="nm-tile ${cls}" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title,'',{eager:cls==='big',width:cls==='big'?900:640})}<div><span>${esc(x.category)}</span><h3>${esc(x.title)}</h3></div></a>`;
 document.querySelector('main').innerHTML=`<section class="nm-hero"><div class="wrap"><div class="nm-kicker">EDITOR'S PICK · CÂU CHUYỆN ĐÁNG ĐỌC</div><div class="nm-mosaic">${tile(a[0],'big')}${a.slice(1,5).map(x=>tile(x)).join('')}</div></div></section>
 <section class="nm-strip" id="moi-nhat"><div class="wrap"><h2>Trending now</h2><div>${a.slice(5,5+Math.max(6,nrStructureSlots(site,'tin-tuc-3','trending',ctx.layout.home_latest_count))).map(x=>`<a href="${ctx.url(x)}">${esc(x.title)}</a>`).join('')}</div></div></section>
 ${ctx.categories.slice(0,5).map((c,i)=>`<section class="nm-section" id="cat-${seoSlug(c)}"><div class="wrap"><div class="nm-title"><span>0${i+1}</span><h2>${esc(c)}</h2><a class="nm-more" href="${newsCategoryUrl(ctx.base,c)}">Xem thêm →</a></div><div class="nm-cards news-configurable-grid" style="${newsGridStyle(ctx.layout)}">${a.filter(x=>x.category===c).slice(0,ctx.layout.category_columns*ctx.layout.category_rows).map(x=>newsCompactCard(ctx,x)).join('')}</div></div></section>`).join('')}
 <section class="nm-dark" id="doc-nhieu"><div class="wrap"><div><small>WEEKEND READ</small><h2>Đọc chậm, hiểu sâu hơn</h2></div><div class="nm-dark-grid">${nrDemoWindow(a,9,Math.max(8,nrStructureSlots(site,'tin-tuc-3','weekend',8)),ctx.isDemo).map(x=>tile(x)).join('')}</div></div></section>`;
 renderNewsFooter(site,ctx.isDemo,ctx.categories);
}
function renderNewsMinimalHome(site){
 const ctx=newsVariantContext(site,4);setupNewsVariantHeader(site,ctx,'tin-tuc-4','THE DAILY NOTE');if(renderNewsClientEmpty(site,ctx,4))return;if(renderVariantArticle(site,ctx,4,'tin-tuc-4'))return;if(maybeRenderNewsCategoryArchive(site,ctx))return;
 const a=ctx.all,lead=a[0],topSide=a.slice(1,5);
 const latestCard=x=>`<a class="nmin-latest-card" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title,'',{width:560})}<div><span>${esc(x.category)}</span><h3>${esc(x.title)}</h3><small>${Number(x.views||0).toLocaleString('vi-VN')} lượt xem</small></div></a>`;
 const topCard=x=>`<a class="nmin-top-card" href="${ctx.url(x)}">${nrImgTag(ctx.img(x),x.title,'',{width:520})}<div><span>${esc(x.category)}</span><h3>${esc(x.title)}</h3></div></a>`;
 document.querySelector('main').innerHTML=`<section class="nmin-intro"><div class="wrap"><span>ĐỌC · HIỂU · GHI NHỚ</span><h1>Tin tức rõ ràng, tối giản và tập trung vào nội dung.</h1></div></section>
 <section class="nmin-lead"><div class="wrap nmin-feature-grid"><article class="nmin-feature-main"><a href="${ctx.url(lead)}">${nrImgTag(ctx.img(lead),lead.title,'',{eager:true,width:900})}<div><span>${esc(lead.category)}</span><h2>${esc(lead.title)}</h2><small>${Number(lead.views||0).toLocaleString('vi-VN')} lượt xem</small></div></a></article><div class="nmin-feature-side">${topSide.map(topCard).join('')}</div></div></section>
 <section class="nmin-main" id="moi-nhat"><div class="wrap nmin-layout"><div><div class="nmin-title"><h2>Mới nhất</h2><span>${a.length} bài viết</span></div><div class="nmin-latest-grid">${a.slice(5,5+ctx.layout.home_latest_count).map(latestCard).join('')}</div></div>
 <aside id="doc-nhieu"><h3>Đọc nhiều</h3>${[...a].sort((x,y)=>y.views-x.views).slice(0,ctx.layout.sidebar_read_most).map((x,i)=>`<a href="${ctx.url(x)}"><b>${String(i+1).padStart(2,'0')}</b><span>${esc(x.title)}</span></a>`).join('')}</aside></div></section>
 ${ctx.categories.slice(0,5).map(c=>`<section class="nmin-topic" id="cat-${seoSlug(c)}"><div class="wrap"><div class="nmin-topic-head"><h2>${esc(c)}</h2><a href="${newsCategoryUrl(ctx.base,c)}">Xem thêm →</a></div><div class="news-configurable-grid" style="${newsGridStyle(ctx.layout)}">${a.filter(x=>x.category===c).slice(0,ctx.layout.category_columns*ctx.layout.category_rows).map(x=>newsCompactCard(ctx,x)).join('')}</div></div></section>`).join('')}`;
 renderNewsFooter(site,ctx.isDemo,ctx.categories);
}

function theme2Money(x){
  return esc(x.price||'Liên hệ');
}
function theme2Location(x){
  return esc([x.district,x.province].filter(Boolean).join(', ')||x.address||'Đang cập nhật');
}
function theme2Type(x){
  return esc(x.property_type|| (x.transaction==='rent'?'Cho thuê':'Nhà đất'));
}
function theme2Card(x){
  const img=getImages(x)[0]||fallbackImage();
  const facts=[
    x.area?`<span>▣ ${esc(x.area)}</span>`:'',
    x.bedrooms?`<span>⌁ ${esc(x.bedrooms)} PN</span>`:'',
    x.bathrooms?`<span>♨ ${esc(x.bathrooms)} WC</span>`:''
  ].filter(Boolean).join('');
  return `<article class="t2-card">
    <a class="t2-card-media" href="${seoPostUrl(x)}">
      <img src="${esc(img)}" alt="${esc(x.title)}">
      <span class="t2-featured">${x.featured?'Nổi bật':(x.transaction==='rent'?'Cho thuê':'Tin mới')}</span>
      <span class="t2-type">${theme2Type(x)}</span>
      <button class="t2-fav-btn ${favState(x.id)?'saved':''}" type="button" aria-label="${favState(x.id)?'Bỏ lưu tin':'Lưu tin'}" onclick="toggleTheme2Fav(event,${x.id})">${favState(x.id)?'♥':'♡'}</button>
      <span class="t2-img-meta">⌖ ${theme2Location(x)} ${facts?`<i>${facts}</i>`:''}</span>
    </a>
    <div class="t2-card-body">
      <h3><a href="${seoPostUrl(x)}">${esc(x.title)}</a></h3>
      <div class="t2-price">${theme2Money(x)}</div>
    </div>
  </article>`;
}

/* V14.1 — Shared Real Estate Template Core */
const ESTATE_TEMPLATE_CORE={
 'mau-1':{preset:'newsreal',brand:'BẤT ĐỘNG SẢN',base:'/demo/bat-dong-san/mau-1',variant:1},
 'mau-2':{preset:'estate_green',brand:'BẤT ĐỘNG SẢN',base:'/demo/bat-dong-san/mau-2',variant:2},
 'mau-3':{preset:'estate_luxe_3',brand:'LIVING ESTATE',base:'/demo/bat-dong-san/mau-3',variant:3},
 'mau-4':{preset:'estate_minimal_4',brand:'NHÀ ĐẸP',base:'/demo/bat-dong-san/mau-4',variant:4},
 'mau-5':{preset:'estate_urban_5',brand:'URBAN HOME',base:'/demo/bat-dong-san/mau-5',variant:5}
};
function estateCoreConfig(key){return ESTATE_TEMPLATE_CORE[key]||ESTATE_TEMPLATE_CORE['mau-1']}
function estateCoreTemplateKey(){
 const k=String(window.NR_DEMO_THEME||'');
 return ESTATE_TEMPLATE_CORE[k]?k:'';
}
function estateCoreBase(key,isDemo){
 const cfg=estateCoreConfig(key);
 return isDemo?cfg.base:'';
}
function estateCoreUrl(path,key,isDemo){
 if(!isDemo)return path;
 const base=estateCoreConfig(key).base.replace(/\/$/,'');
 if(path==='#'||path==='/')return base+'/';
 if(path.startsWith('#'))return base+'/'+path;
 return base+'/'+String(path).replace(/^\/+/,'');
}
function estateCoreApplyShell(site,key,{compact=false}={}){
 const cfg=estateCoreConfig(key),isDemo=window.NR_DEMO_THEME===key;
 const brandLeft=document.getElementById('brandLeft');if(brandLeft)brandLeft.textContent=isDemo?cfg.brand:cleanSiteName(site.name||cfg.brand);
 const brandRight=document.getElementById('brandRight');if(brandRight)brandRight.textContent='';
 const topLeft=document.getElementById('topLeft');if(topLeft)topLeft.textContent='Tin tức & bất động sản';
 const topContact=document.getElementById('topContact');if(topContact)topContact.textContent=`Hotline: ${site.phone||'—'} · Zalo: ${site.zalo||'—'}`;
 const logo=document.querySelector('.header a.logo,.header a.brand');if(logo&&isDemo){logo.href=estateCoreUrl('/',key,true);logo.onclick=null}
 const nav=document.querySelector('.header nav.nav');
 if(nav)nav.innerHTML=[
   ['Trang chủ','#'],
   ['Bất động sản','/bat-dong-san/'],
   ['Mua','/mua/'],
   ['Bán','/ban/'],
   ['Cho thuê','/cho-thue/'],
   ['Chuyên mục','/#categories'],
   ['Tin tức','/#news']
 ].map(([l,h])=>`<a href="${estateCoreUrl(h,key,isDemo)}">${l}</a>`).join('');
 const actions=document.querySelector('.header .actions');
 if(actions){
   const fav=estateCoreUrl('/favorites',key,isDemo);
   const post=isDemo?nrDemoAdminUrl(key,'newpost'):'/admin?tab=newpost';
   actions.innerHTML=`<a class="btn soft" href="${fav}">♥ Tin đã lưu</a><a class="btn primary" href="${post}"${isDemo?' target="_blank" rel="noopener"':''}>+ Đăng tin</a><button id="mobileMenuBtn" class="btn soft mobile-menu">☰</button>`;
 }
}
function estateCoreLocation(x){return [x.ward,x.district,x.province].filter(Boolean).join(', ')||x.address||'Chưa cập nhật'}
function estateCoreImage(x){return getImages(x)[0]||fallbackImage()}
function estateCorePrice(x){return esc(x.price||'Liên hệ')}
function estateCoreFacts(x){
 return [x.area?`${esc(x.area)} m²`:'',x.bedrooms?`${esc(x.bedrooms)} PN`:'',x.bathrooms?`${esc(x.bathrooms)} WC`:''].filter(Boolean).join(' · ')
}
function estateCoreCard(x,style='standard'){
 const img=estateCoreImage(x),loc=estateCoreLocation(x),facts=estateCoreFacts(x);
 return `<article class="estate-core-card estate-card-${style}">
  <a class="estate-core-media" href="${seoPostUrl(x)}"><img src="${esc(img)}" alt="${esc(x.title)}">${x.featured?'<span class="estate-core-featured">Nổi bật</span>':''}<button class="estate-core-fav" onclick="toggleTheme2Fav(event,${x.id})" aria-label="Lưu tin">${favState(x.id)?'♥':'♡'}</button></a>
  <div class="estate-core-body">
   <div class="estate-core-meta"><span>${x.transaction==='rent'?'CHO THUÊ':(x.transaction==='buy'?'MUA':'BÁN')}</span><span>${esc(x.property_type||'Bất động sản')}</span></div>
   <h3><a href="${seoPostUrl(x)}">${esc(x.title)}</a></h3>
   <div class="estate-core-loc">⌖ ${esc(loc)}</div>
   ${facts?`<div class="estate-core-facts">${facts}</div>`:''}
   <div class="estate-core-price">${estateCorePrice(x)}</div>
  </div>
 </article>`;
}
function estateCoreSearchBox(props,key,style='default'){
 const provinces=[...new Set(props.map(x=>x.province).filter(Boolean))];
 const uid=`ecs-${key}`;
 return `<form class="estate-core-search estate-search-${style}" id="${uid}">
  <label><small>Giao dịch</small><select name="transaction"><option value="buy">Mua</option><option value="sale">Bán</option><option value="rent">Cho thuê</option><option value="">Tất cả</option></select></label>
  <label><small>Loại BĐS</small><select name="property_type"><option value="">Tất cả loại</option><option>Nhà phố</option><option>Chung cư</option><option>Biệt thự</option><option>Đất</option><option>Shophouse</option></select></label>
  <label><small>Khu vực</small><select name="province"><option value="">Tất cả</option>${provinces.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label>
  <label><small>Từ khóa</small><input name="q" placeholder="Dự án, khu vực..."></label>
  <button>Tìm kiếm</button>
 </form>`;
}
function estateCoreBindSearch(key){
 const form=document.getElementById(`ecs-${key}`);if(!form)return;
 form.onsubmit=e=>{
   e.preventDefault();const fd=new FormData(form),q=new URLSearchParams();
   const tr=String(fd.get('transaction')||''),type=String(fd.get('property_type')||''),pv=String(fd.get('province')||''),kw=String(fd.get('q')||'');
   if(type)q.set('property_type',type);if(pv)q.set('province',pv);if(kw)q.set('q',kw);
   const path=tr==='rent'?'/cho-thue/':tr==='buy'?'/mua/':tr==='sale'?'/ban/':'/bat-dong-san/';
   location.href=estateCoreUrl(path,key,window.NR_DEMO_THEME===key)+(q.toString()?'?'+q.toString():'');
 };
}
function estateCoreGroups(props){
 const newest=[...props].sort((a,b)=>Number(b.id||0)-Number(a.id||0));
 const featured=[...props].sort((a,b)=>(Number(b.featured||0)-Number(a.featured||0))||((b.views||0)-(a.views||0)));
 return {
   newest,featured,
   buy:newest.filter(x=>x.transaction==='buy'),
   sale:newest.filter(x=>x.transaction==='sale'),
   rent:newest.filter(x=>x.transaction==='rent'),
   apartment:newest.filter(x=>/chung cư|căn hộ/i.test(String(x.property_type||x.title||''))),
   house:newest.filter(x=>/nhà|biệt thự|shophouse/i.test(String(x.property_type||x.title||''))),
   land:newest.filter(x=>/đất/i.test(String(x.property_type||x.title||'')))
 };
}
function estateCoreCategoryStrip(key){
 const isDemo=window.NR_DEMO_THEME===key;
 const data=[['⌂','Nhà phố','/ban/?property_type=Nhà%20phố'],['▦','Căn hộ','/ban/?property_type=Chung%20cư'],['◇','Đất nền','/ban/?property_type=Đất'],['♜','Biệt thự','/ban/?property_type=Biệt%20thự'],['⌁','Cho thuê','/cho-thue/']];
 return `<span id="categories" class="nr-route-anchor" aria-hidden="true"></span><div class="estate-core-categories" id="estate-categories">${data.map(([i,l,u])=>`<a href="${estateCoreUrl(u,key,isDemo)}"><span>${i}</span><b>${l}</b></a>`).join('')}</div>`;
}
function estateCoreNews(site,key,count=4){
 const items=(SITE_DATA.posts||[]).filter(x=>x.type==='news').slice(0,count);
 return `<span id="news" class="nr-route-anchor" aria-hidden="true"></span><section class="estate-core-news" id="estate-news"><div class="estate-section-head"><div><small>CẨM NANG & THỊ TRƯỜNG</small><h2>Tin tức bất động sản</h2></div><a href="${estateCoreUrl('/#news',key,window.NR_DEMO_THEME===key)}">Xem tất cả →</a></div><div class="estate-news-grid">${items.map(x=>`<a href="${seoPostUrl(x)}"><img src="${esc(getImages(x)[0]||fallbackImage())}"><small>${esc(x.category||'Tin tức')}</small><h3>${esc(x.title)}</h3></a>`).join('')||'<div class="empty">Chưa có tin tức.</div>'}</div></section>`;
}
function estateCoreSection(key,title,eyebrow,items,{limit=8,style='standard',more='/bat-dong-san/',className=''}={}){
 const site=SITE_DATA?.site||{};
 const structuralLimit=nrStructureSlots(site,key,title,limit);
 limit=Math.max(1,structuralLimit||limit);
 const list=(items||[]).filter(Boolean).slice(0,limit);
 return `<section class="estate-rich-section ${className}"><div class="wrap">
   <div class="estate-section-head">
     <div><small>${esc(eyebrow)}</small><h2>${esc(title)}</h2></div>
     <a href="${estateCoreUrl(more,key,window.NR_DEMO_THEME===key)}">Xem thêm →</a>
   </div>
   <div class="estate-rich-grid estate-rich-${style}">${list.map(x=>estateCoreCard(x,style)).join('')}</div>
 </div></section>`;
}
function estateCoreProjectStrip(key,props){
 const projects=[...new Set((props||[]).map(x=>x.project_name||x.project||x.district||x.province).filter(Boolean))].slice(0,6);
 return `<section class="estate-project-strip"><div class="wrap">
  <div class="estate-section-head"><div><small>KHÁM PHÁ</small><h2>Dự án & khu vực nổi bật</h2></div></div>
  <div class="estate-project-grid">${projects.map((p,i)=>`<a href="${estateCoreUrl('/bat-dong-san/?q='+encodeURIComponent(p),key,window.NR_DEMO_THEME===key)}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(p)}</b><small>Xem tin đăng →</small></a>`).join('')}</div>
 </div></section>`;
}
function estateCoreServiceBand(){
 return `<section class="estate-service-band"><div class="wrap">
  <div><b>✓ Tin đăng rõ ràng</b><span>Thông tin dễ xem, dễ so sánh</span></div>
  <div><b>⌖ Tìm theo khu vực</b><span>Lọc nhanh theo nhu cầu</span></div>
  <div><b>♡ Lưu tin quan tâm</b><span>Xem lại bất động sản đã lưu</span></div>
  <div><b>☎ Liên hệ trực tiếp</b><span>Kết nối nhanh với người đăng</span></div>
 </div></section>`;
}

function estateCoreFooter(site,key){
 // All estate templates use the same footer logic/data; skin comes from the theme.
 fillPublicFooter(site);
}
function estateCoreEmpty(main,title='Chưa có dữ liệu bất động sản'){
 if(main)main.innerHTML=`<section class="estate-core-empty"><div class="wrap"><h2>${esc(title)}</h2><p>Demo đang chờ dữ liệu mẫu. Hãy tải lại trang sau khi dữ liệu được đồng bộ.</p></div></section>`;
}
function estateCoreSafeProps(props){return Array.isArray(props)?props.filter(Boolean):[]}



function renderTheme1Home(site,props){
 estateCoreApplyShell(site,'mau-1');estateCoreFooter(site,'mau-1');
 renderHero();renderSideNews();fillSearch(props);renderCategorySections(props);renderNews();
 propertyCards.innerHTML=props.slice(0,Math.max(12,nrStructureSlots(site,'mau-1','latest',12))).map(card).join('')||'<div class="empty">Chưa có tin bất động sản.</div>';
}

function renderTheme2Home(site,props){
  estateCoreApplyShell(site,'mau-2');estateCoreFooter(site,'mau-2');
  document.body.classList.add('theme-estate-green','theme2-portal-ready');

  // Theme 2 is a property portal, so the hero always uses property imagery/content,
  // never a news article headline.
  const hero=props.find(x=>x.featured&&getImages(x).length)||props.find(x=>getImages(x).length)||null;
  const heroImg=hero?(getImages(hero)[0]||fallbackImage()):fallbackImage();

  const main=document.querySelector('main');
  if(!main)return;
  main.innerHTML=`
    <section class="t2-hero" style="--t2-hero:url('${esc(heroImg)}')">
      <div class="wrap t2-hero-inner">
        <div class="t2-hero-copy">
          <span class="t2-kicker">CỔNG THÔNG TIN BẤT ĐỘNG SẢN</span>
          <h1>Tìm kiếm bất động sản<br>phù hợp nhu cầu của bạn</h1>
          <p>Hàng nghìn tin đăng mới mỗi ngày</p>
        </div>
        <div class="t2-search">
          <div class="t2-search-field">
            <span class="t2-search-icon">⌂</span><label>Loại giao dịch<select id="t2Transaction"><option value="buy">Mua</option><option value="sale">Bán</option><option value="rent">Cho thuê</option><option value="">Tất cả</option></select></label>
          </div>
          <div class="t2-search-field">
            <span class="t2-search-icon">▦</span><label>Loại bất động sản<select id="t2Type"><option value="">Tất cả loại BĐS</option><option>Nhà phố</option><option>Chung cư</option><option>Đất</option><option>Biệt thự</option><option>Shophouse</option><option>Kho xưởng</option></select></label>
          </div>
          <div class="t2-search-field">
            <span class="t2-search-icon">⌖</span><label>Khu vực<select id="t2Province"><option value="">Tất cả</option></select></label>
          </div>
          <div class="t2-search-field">
            <span class="t2-search-icon">◉</span><label>Mức giá<select id="t2Price"></select></label>
          </div>
          <button id="t2SearchBtn" class="t2-search-btn">⌕ <b>Tìm kiếm</b></button>
        </div>
      </div>
    </section>

    <section class="t2-benefits">
      <div class="wrap t2-benefit-grid">
        <div class="t2-benefit"><span>⌂</span><div><b>Mua bán dễ dàng</b><small>Hàng ngàn tin đăng<br>mua bán mỗi ngày</small></div></div>
        <div class="t2-benefit"><span>⌁</span><div><b>Cho thuê nhanh chóng</b><small>Đa dạng lựa chọn<br>phù hợp nhu cầu</small></div></div>
        <div class="t2-benefit"><span>✓</span><div><b>Thông tin minh bạch</b><small>Pháp lý rõ ràng,<br>kiểm duyệt chặt chẽ</small></div></div>
        <div class="t2-benefit"><span>◉</span><div><b>Hỗ trợ tận tâm</b><small>Tư vấn nhanh,<br>hỗ trợ thuận tiện</small></div></div>
        <div class="t2-benefit"><span>▥</span><div><b>Hiệu quả vượt trội</b><small>Tiếp cận khách hàng<br>tiềm năng nhanh chóng</small></div></div>
      </div>
    </section>

    <section class="t2-featured-section">
      <div class="wrap">
        <div class="t2-section-head">
          <h2>BẤT ĐỘNG SẢN <em>NỔI BẬT</em></h2>
          <a href="${estateCoreUrl('/bat-dong-san/','mau-2',window.NR_DEMO_THEME==='mau-2')}">Xem tất cả →</a>
        </div>
        <div class="t2-carousel-shell">
          <button class="t2-carousel-btn prev" id="t2FeaturedPrev" type="button" aria-label="Tin trước">‹</button>
          <div class="t2-carousel-viewport" id="t2FeaturedViewport">
            <div id="t2Featured" class="t2-card-track"></div>
          </div>
          <button class="t2-carousel-btn next" id="t2FeaturedNext" type="button" aria-label="Tin tiếp theo">›</button>
        </div>
        <div id="t2FeaturedDots" class="t2-dots"></div>
      </div>
    </section>

    <section class="t2-quick-categories" id="categories">
      <div class="wrap">
        <div class="t2-section-head"><h2>Khám phá theo <em>nhu cầu</em></h2><a href="${estateCoreUrl('/bat-dong-san/','mau-2',window.NR_DEMO_THEME==='mau-2')}">Tất cả tin →</a></div>
        <div class="t2-quick-grid">
          <a href="${estateCoreUrl('/ban/?property_type=Nhà%20phố','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>⌂</span><b>Nhà phố</b><small>Mua bán nhà riêng</small></a>
          <a href="${estateCoreUrl('/ban/?property_type=Chung%20cư','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>▦</span><b>Căn hộ</b><small>Chung cư, duplex</small></a>
          <a href="${estateCoreUrl('/ban/?property_type=Biệt%20thự','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>♜</span><b>Biệt thự</b><small>Không gian cao cấp</small></a>
          <a href="${estateCoreUrl('/listings?property_type=Đất','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>◇</span><b>Đất nền</b><small>Đất ở & dự án</small></a>
          <a href="${estateCoreUrl('/cho-thue/','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>⌁</span><b>Cho thuê</b><small>Nhà, căn hộ, mặt bằng</small></a>
        </div>
      </div>
    </section>


    <section class="t2-market-section">
      <div class="wrap">
        <div class="t2-section-head"><h2>Bán <em>nổi bật</em></h2><a href="${estateCoreUrl('/ban/','mau-2',window.NR_DEMO_THEME==='mau-2')}">Xem tất cả →</a></div>
        <div id="t2SaleGrid" class="t2-card-grid t2-card-grid-3"></div>
      </div>
    </section>

    <section class="t2-rent-section">
      <div class="wrap">
        <div class="t2-section-head"><h2>Bất động sản <em>cho thuê</em></h2><a href="${estateCoreUrl('/cho-thue/','mau-2',window.NR_DEMO_THEME==='mau-2')}">Xem tất cả →</a></div>
        <div id="t2RentGrid" class="t2-card-grid t2-card-grid-3"></div>
      </div>
    </section>

    <section class="t2-local-section">
      <div class="wrap">
        <div class="t2-section-head"><h2>Nhà đất <em>Hải Phòng</em></h2><a href="${estateCoreUrl('/bat-dong-san/?province=Hải%20Phòng','mau-2',window.NR_DEMO_THEME==='mau-2')}">Xem khu vực →</a></div>
        <div id="t2LocalGrid" class="t2-card-grid t2-card-grid-3"></div>
      </div>
    </section>

    <section class="t2-latest-section">
      <div class="wrap">
        <div class="t2-section-head"><h2>Tin đăng <em>mới nhất</em></h2><a href="/bat-dong-san/">Xem thêm →</a></div>
        <div id="t2Latest" class="t2-card-grid t2-card-grid-latest"></div>
      </div>
    </section>

    <section class="t2-news-section" id="news">
      <div class="wrap">
        <div class="t2-section-head"><h2>Tin tức & <em>thị trường</em></h2><a href="${estateCoreUrl('/#news','mau-2',window.NR_DEMO_THEME==='mau-2')}">Xem tất cả →</a></div>
        <div id="t2News" class="t2-news-grid"></div>
      </div>
    </section>

    <section class="t2-bottom-benefits">
      <div class="wrap t2-bottom-grid">
        <div><span>◎</span><b>Giao diện chuyên nghiệp</b><small>Chuẩn SEO – Hiện đại</small></div>
        <div><span>➤</span><b>Tốc độ vượt trội</b><small>Tối ưu trải nghiệm người dùng</small></div>
        <div><span>▣</span><b>Bảo mật & ổn định</b><small>Vận hành an toàn</small></div>
        <div><span>⚙</span><b>Dễ dàng quản trị</b><small>Quản lý nội dung thuận tiện</small></div>
        <a class="t2-call" href="${site.phone?'tel:'+String(site.phone).replace(/\D/g,''):'#'}"><span>☎</span><b>${esc(site.phone||'Liên hệ')}</b><small>Tư vấn & hỗ trợ</small></a>
      </div>
    </section>`;

  const provinces=[...new Set(props.map(x=>x.province).filter(Boolean))];
  const psel=document.getElementById('t2Province');
  psel.innerHTML='<option value="">Tất cả</option>'+provinces.map(x=>`<option>${esc(x)}</option>`).join('');

  const txSel=document.getElementById('t2Transaction'),priceSel=document.getElementById('t2Price');
  function fillT2Prices(){
    const rent=txSel.value==='rent';
    const opts=rent
      ? [['','Tất cả'],['rent-under-10m','Dưới 10 triệu/tháng'],['rent-10-20m','10 - 20 triệu/tháng'],['rent-20-50m','20 - 50 triệu/tháng'],['rent-over-50m','Trên 50 triệu/tháng']]
      : [['','Tất cả'],['sale-under-2b','Dưới 2 tỷ'],['sale-2-5b','2 - 5 tỷ'],['sale-5-10b','5 - 10 tỷ'],['sale-over-10b','Trên 10 tỷ']];
    priceSel.innerHTML=opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  }
  fillT2Prices();
  txSel.addEventListener('change',fillT2Prices);

  document.getElementById('t2SearchBtn').onclick=()=>{
    const q=new URLSearchParams();
    const tr=txSel.value;
    const tp=document.getElementById('t2Type').value;
    const pv=document.getElementById('t2Province').value;
    const pr=priceSel.value;
    if(tp)q.set('property_type',tp);
    if(pv)q.set('province',pv);
    if(pr)q.set('price_range',pr);
    const base=tr==='rent'?'/cho-thue/':tr==='buy'?'/mua/':tr==='sale'?'/ban/':'/bat-dong-san/';
    location.href=nrDemoUrl(base)+(q.toString()?'?'+q.toString():'');
  };

  const featured=[...props].sort((a,b)=>(Number(b.featured||0)-Number(a.featured||0))||((b.views||0)-(a.views||0))).slice(0,12);
  const featuredTrack=document.getElementById('t2Featured');
  featuredTrack.innerHTML=featured.map(theme2Card).join('')||'<div class="empty">Chưa có tin bất động sản.</div>';

  // Real carousel: arrows + dots + autoplay. It pauses while the user interacts.
  const viewport=document.getElementById('t2FeaturedViewport');
  const prevBtn=document.getElementById('t2FeaturedPrev');
  const nextBtn=document.getElementById('t2FeaturedNext');
  const dots=document.getElementById('t2FeaturedDots');
  let carouselIndex=0,carouselTimer=null,userPause=false;
  const visibleCards=()=>innerWidth<=480?1:(innerWidth<=760?2:(innerWidth<=1050?3:5));
  const maxIndex=()=>Math.max(0,featured.length-visibleCards());
  function paintCarousel(){
    carouselIndex=Math.max(0,Math.min(carouselIndex,maxIndex()));
    const first=featuredTrack?.querySelector('.t2-card');
    if(first&&viewport){
      const gap=parseFloat(getComputedStyle(featuredTrack).gap)||15;
      const step=first.getBoundingClientRect().width+gap;
      featuredTrack.style.transform=`translate3d(${-carouselIndex*step}px,0,0)`;
    }
    if(prevBtn)prevBtn.disabled=carouselIndex<=0;
    if(nextBtn)nextBtn.disabled=carouselIndex>=maxIndex();
    const pages=Math.max(1,maxIndex()+1);
    if(dots){
      dots.innerHTML=Array.from({length:pages},(_,i)=>`<button class="${i===carouselIndex?'active':''}" data-i="${i}" aria-label="Trang ${i+1}"></button>`).join('');
      dots.querySelectorAll('button').forEach(b=>b.onclick=()=>{carouselIndex=Number(b.dataset.i||0);paintCarousel();restartCarousel()});
    }
  }
  function moveCarousel(dir){
    const max=maxIndex();
    if(!max)return;
    carouselIndex+=dir;
    if(carouselIndex>max)carouselIndex=0;
    if(carouselIndex<0)carouselIndex=max;
    paintCarousel();
  }
  function restartCarousel(){
    clearInterval(carouselTimer);
    if(featured.length>visibleCards()&&!userPause)carouselTimer=setInterval(()=>moveCarousel(1),4300);
  }
  prevBtn?.addEventListener('click',()=>{moveCarousel(-1);restartCarousel()});
  nextBtn?.addEventListener('click',()=>{moveCarousel(1);restartCarousel()});
  viewport?.addEventListener('mouseenter',()=>{userPause=true;clearInterval(carouselTimer)});
  viewport?.addEventListener('mouseleave',()=>{userPause=false;restartCarousel()});
  viewport?.addEventListener('touchstart',()=>{userPause=true;clearInterval(carouselTimer)},{passive:true});
  viewport?.addEventListener('touchend',()=>{userPause=false;restartCarousel()},{passive:true});
  addEventListener('resize',()=>{paintCarousel();restartCarousel()},{passive:true});
  requestAnimationFrame(()=>{paintCarousel();restartCarousel()});

  const byNewest=[...props].sort((a,b)=>Number(b.id||0)-Number(a.id||0));
  const sale=byNewest.filter(x=>x.transaction!=='rent').slice(0,6);
  const rent=byNewest.filter(x=>x.transaction==='rent').slice(0,6);
  let local=byNewest.filter(x=>String(x.province||'').toLowerCase().includes('hải phòng')||String(x.address||'').toLowerCase().includes('hải phòng')).slice(0,6);
  if(local.length<6)local=[...local,...byNewest.filter(x=>!local.some(y=>y.id===x.id)).slice(0,6-local.length)];

  document.getElementById('t2SaleGrid').innerHTML=sale.map(theme2Card).join('')||'<div class="empty">Chưa có tin mua bán.</div>';
  document.getElementById('t2RentGrid').innerHTML=rent.map(theme2Card).join('')||'<div class="empty">Chưa có tin cho thuê.</div>';
  document.getElementById('t2LocalGrid').innerHTML=local.map(theme2Card).join('')||'<div class="empty">Chưa có tin khu vực.</div>';
  document.getElementById('t2Latest').innerHTML=byNewest.slice(0,8).map(theme2Card).join('')||'<div class="empty">Chưa có tin mới.</div>';

  const news=(SITE_DATA.posts||[]).filter(x=>x.type==='news').slice(0,6);
  document.getElementById('t2News').innerHTML=news.map(x=>`<a class="t2-news-card" href="${seoPostUrl(x)}"><img src="${esc(getImages(x)[0]||fallbackImage())}" alt=""><div><small>${esc(x.category||'Tin tức')}</small><h3>${esc(x.title)}</h3><span>${x.views||0} lượt xem</span></div></a>`).join('')||'<div class="empty">Chưa có tin tức.</div>';
}

// V15.2: V15.1 post-blueprint stripping removed. Empty state is rendered from structure_profile.

// V20.7.5 — Universal Template Boot / No-Flash Contract.
// The static index is only a transport shell. It must remain invisible until the
// selected template + route + structure have finished rendering.
function nrTemplateBootReady(){
  const root=document.documentElement;
  try{if(window.__NR_BOOT_TIMEOUT__)clearTimeout(window.__NR_BOOT_TIMEOUT__)}catch(e){}
  root.classList.remove('nr-template-booting','nr-template-boot-timeout');
  root.classList.add('nr-template-ready');
  root.dataset.nrTemplateReady='1';
  try{window.dispatchEvent(new CustomEvent('nr:template-ready'))}catch(e){}
}

function fillSearch(props){
  const ps=[...new Set(props.map(x=>x.province).filter(Boolean))];
  searchProvince.innerHTML='<option value="">Tỉnh / Thành phố</option>'+ps.map(x=>`<option>${esc(x)}</option>`).join('');
  const updateDistrict=()=>{const ds=[...new Set(props.filter(x=>!searchProvince.value||x.province===searchProvince.value).map(x=>x.district).filter(Boolean))];searchDistrict.innerHTML='<option value="">Quận / Huyện</option>'+ds.map(x=>`<option>${esc(x)}</option>`).join('')};
  searchProvince.onchange=updateDistrict;updateDistrict();
}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');selectedTransaction=btn.dataset.transaction||''}));
searchBtn.onclick=()=>{const p=new URLSearchParams();if(searchQ.value)p.set('q',searchQ.value);if(selectedTransaction)p.set('transaction',selectedTransaction);if(searchType.value)p.set('property_type',searchType.value);if(searchProvince.value)p.set('province',searchProvince.value);if(searchDistrict.value)p.set('district',searchDistrict.value);if(searchPrice.value)p.set('price_range',searchPrice.value);location.href=nrDemoUrl('/listings?'+p.toString())};

(async()=>{
 try{
   const demoTemplateKey=window.NR_DEMO_THEME&&(/^tin-tuc-[1-4]$/.test(window.NR_DEMO_THEME)||/^mau-[1-5]$/.test(window.NR_DEMO_THEME)||/^dich-vu-\d+$/.test(window.NR_DEMO_THEME)||/^game-\d+$/.test(window.NR_DEMO_THEME))?window.NR_DEMO_THEME:'';
   // Demo route already tells us the template key, so site data and catalog profile
   // are requested in parallel. Subsequent demo pages reuse session cache.
   const sitePromise=nrFetchJsonCached(tenantApiUrl('/api/site'),{kind:'site',key:demoTemplateKey||'site',ttl:300000});
   const demoCatalogPromise=demoTemplateKey?nrFetchJsonCached(tenantApiUrl('/api/template-catalog?key='+encodeURIComponent(demoTemplateKey)),{kind:'catalog',key:demoTemplateKey,ttl:1800000,options:{cache:'force-cache'}}):null;
   const d=await sitePromise;
   SITE_DATA=d;
   const s=d.site;
   if(s?.favicon_url){let f=document.querySelector('link[rel=\"icon\"]');if(!f){f=document.createElement('link');f.rel='icon';document.head.appendChild(f)}f.href=s.favicon_url}
   const activeTemplateKey=demoTemplateKey||s.template_key||'';
   if(activeTemplateKey){
     try{
       const td=(demoCatalogPromise&&activeTemplateKey===demoTemplateKey)
         ?await demoCatalogPromise
         :await nrFetchJsonCached(tenantApiUrl('/api/template-catalog?key='+encodeURIComponent(activeTemplateKey)),{kind:'catalog',key:activeTemplateKey,ttl:1800000,options:{cache:'force-cache'}});
       const t=td?.templates?.[0];
       if(t?.layout_profile){try{s.layout_profile=JSON.parse(t.layout_profile)}catch(e){s.layout_profile=t.layout_profile}}
       if(t?.editor_profile){try{s.editor_profile=JSON.parse(t.editor_profile)}catch(e){s.editor_profile=t.editor_profile}}
       if(t?.structure_profile){try{s.structure_profile=JSON.parse(t.structure_profile)}catch(e){s.structure_profile=t.structure_profile}}
     }catch(e){console.warn('LAYOUT PROFILE',e)}
   }
   const name=cleanSiteName(s.name||'NEWSREAL');
   const demoTheme=String(window.NR_DEMO_THEME||'');
   const DEMO_PRESETS={
     'mau-1':'newsreal',
     'mau-2':'estate_green',
     'mau-3':'estate_luxe_3',
     'mau-4':'estate_minimal_4',
     'mau-5':'estate_urban_5',
     'tin-tuc-1':'news_portal_1',
     'tin-tuc-2':'news_paper_2',
     'tin-tuc-3':'news_magazine_3',
     'tin-tuc-4':'news_minimal_4',
     'dich-vu-1':'service_fpt_1',
     'dich-vu-2':'service_vnpt_2',
     'dich-vu-3':'service_viettel_3',
     'dich-vu-4':'service_camera_store_4',
     'game-1':'game_clash_1'
   };
   const effectivePreset=DEMO_PRESETS[demoTheme]||s.preset||'newsreal';
   document.body.classList.toggle('nr-demo-performance',!!demoTheme);
   document.body.classList.toggle('theme-estate-green',effectivePreset==='estate_green');
   document.body.classList.toggle('theme-estate-luxe',effectivePreset==='estate_luxe_3');
   document.body.classList.toggle('theme-estate-minimal',effectivePreset==='estate_minimal_4');
   document.body.classList.toggle('theme-estate-urban',effectivePreset==='estate_urban_5');
   document.body.classList.toggle('theme-news-portal',effectivePreset==='news_portal_1');
   document.body.classList.toggle('theme-news-paper',effectivePreset==='news_paper_2');
   document.body.classList.toggle('theme-news-magazine',effectivePreset==='news_magazine_3');
   document.body.classList.toggle('theme-news-minimal',effectivePreset==='news_minimal_4');
   document.body.classList.toggle('theme-service-fpt',effectivePreset==='service_fpt_1');
   document.body.classList.toggle('theme-service-vnpt',effectivePreset==='service_vnpt_2');
   document.body.classList.toggle('theme-service-viettel',effectivePreset==='service_viettel_3');
   document.body.classList.toggle('theme-service-camera-store',effectivePreset==='service_camera_store_4');
   document.body.classList.toggle('theme-game-clash',effectivePreset==='game_clash_1');
   fillPublicFooter(s);
   // V17.1 — Demo tab title is owned by the selected template, never by the shared showroom tenant.
   if(window.NR_DEMO_THEME&&window.nrApplyDemoTitle){
     window.nrApplyDemoTitle();
   }else{
     document.title=effectivePreset.startsWith('news_')?name+' — Tin tức mới nhất':name+' — Bất động sản & Tin tức';
   }
   const brandLeftEl=document.getElementById('brandLeft'), brandRightEl=document.getElementById('brandRight'), topContactEl=document.getElementById('topContact');
   if(brandLeftEl) brandLeftEl.textContent=name;
   if(brandRightEl) brandRightEl.textContent='';
   if(topContactEl) topContactEl.textContent='Hotline: '+(s.phone||'—')+' · Zalo: '+(s.zalo||'—');
   const props=(d.posts||[]).filter(x=>x.type==='property');
   // Normalize old #cat-* URLs before any news renderer decides ARTICLE/CATEGORY/HOME.
   nrNormalizeLegacyNewsCategoryHash();
   if(effectivePreset==='estate_green'){
     try{renderTheme2Home(s,props)}catch(e){console.error('ESTATE M2',e);estateCoreEmpty(document.querySelector('main'),'Không tải được BĐS Mẫu 2')}
   }else if(effectivePreset==='estate_luxe_3'){
     try{renderEstateLuxe3(s,props)}catch(e){console.error('ESTATE M3',e);estateCoreEmpty(document.querySelector('main'),'Không tải được BĐS Mẫu 3')}
   }else if(effectivePreset==='estate_minimal_4'){
     try{renderEstateMinimal4(s,props)}catch(e){console.error('ESTATE M4',e);estateCoreEmpty(document.querySelector('main'),'Không tải được BĐS Mẫu 4')}
   }else if(effectivePreset==='estate_urban_5'){
     try{renderEstateUrban5(s,props)}catch(e){console.error('ESTATE M5',e);estateCoreEmpty(document.querySelector('main'),'Không tải được BĐS Mẫu 5')}
   }else if(effectivePreset==='newsreal'&&window.NR_DEMO_THEME==='mau-1'){
     try{renderTheme1Home(s,props)}catch(e){console.error('ESTATE M1',e);estateCoreEmpty(document.querySelector('main'),'Không tải được BĐS Mẫu 1')}
   }else if(effectivePreset==='news_portal_1'){
     try{renderNewsPortalHome(s)}catch(e){console.error('NEWS M1',e);showError('Không tải được dữ liệu demo tin tức.')}
   }else if(effectivePreset==='news_paper_2'){
     try{renderNewsPaperHome(s)}catch(e){console.error('NEWS M2',e);showError('Không tải được giao diện Tin tức Mẫu 2.')}
   }else if(effectivePreset==='news_magazine_3'){
     try{renderNewsMagazineHome(s)}catch(e){console.error('NEWS M3',e);showError('Không tải được giao diện Tin tức Mẫu 3.')}
   }else if(effectivePreset==='news_minimal_4'){
     try{renderNewsMinimalHome(s)}catch(e){console.error('NEWS M4',e);showError('Không tải được giao diện Tin tức Mẫu 4.')}
   }else if(effectivePreset==='service_fpt_1'){
     try{renderServiceFpt1(s)}catch(e){console.error('SERVICE M1',e);showError('Không tải được giao diện Dịch vụ Mẫu 1.')}
   }else if(effectivePreset==='service_vnpt_2'){
     try{renderServiceVnpt2(s)}catch(e){console.error('SERVICE M2',e);showError('Không tải được giao diện Dịch vụ Mẫu 2.')}
   }else if(effectivePreset==='service_viettel_3'){
     try{renderServiceViettel3(s)}catch(e){console.error('SERVICE M3',e);showError('Không tải được giao diện Dịch vụ Mẫu 3.')}
   }else if(effectivePreset==='service_camera_store_4'){
     try{renderServiceCameraStore4(s)}catch(e){console.error('SERVICE M4',e);showError('Không tải được giao diện Camera Store.')}
   }else if(effectivePreset==='game_clash_1'){
     try{renderGameClash1(s)}catch(e){console.error('GAME CLASH',e);showError('Không tải được giao diện Clash of Clans.')}
   }else{
     renderTheme1Home(s,props);
   }
   const nrRoute=nrNewsRouteMode();
   // V16.6: homepage structure machinery must NEVER reorder an article or category archive.
   // It is only valid for homepage / client-empty structural views.
   if(!nrRoute.article&&!nrRoute.category){
     nrApplyStructureOrder(s,activeTemplateKey);
     nrApplyStructureGeometry(s,activeTemplateKey);
     nrApplySidebarStructure(s,activeTemplateKey);
     nrAuditStructureContract(s,activeTemplateKey);
   }
   // Absolute card contract: body/excerpt text is detail-only.
   nrEnforceTitleOnlyCards(document);
   nrEnforceNewsRouteContract(document);
   nrInstallUnifiedNewsCategoryRouter();
   const mm=document.getElementById('mobileMenuBtn'), nav=document.querySelector('.header nav.nav'); if(mm&&nav){mm.setAttribute('aria-expanded','false');mm.onclick=(e)=>{e.stopPropagation();const on=nav.classList.toggle('mobile-open');mm.setAttribute('aria-expanded',String(on));};nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('mobile-open');mm.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(!nav.contains(e.target)&&e.target!==mm){nav.classList.remove('mobile-open');mm.setAttribute('aria-expanded','false')}});}
   nrActivateSidebarFollow(document);
   nrInstallPredictivePrefetch();
 }catch(e){
   console.error(e);
   if(window.NR_DEMO_THEME==='tin-tuc-1'||document.body.classList.contains('theme-news-portal')){
     const main=document.querySelector('main');
     if(main)main.innerHTML='<section class="n3-section"><div class="wrap"><div class="empty">Không tải được dữ liệu demo tin tức.</div></div></section>';
   }else if(typeof heroSlides!=='undefined'&&heroSlides)heroSlides.innerHTML='<div class="empty">Không tải được dữ liệu trang chủ.</div>';
 }finally{
   // Two animation frames ensure the real template DOM/classes are committed before paint.
   requestAnimationFrame(()=>requestAnimationFrame(nrTemplateBootReady));
 }
})();

/* V20.5.1 — Service provider template contract.
   Showroom uses real public package examples from the provider; trial/client uses the exact same architecture with no showroom sample posts. */

/* =========================================================
   V20.8.0 — GAME PORTAL / CLASH OF CLANS CONTRACT
   Same renderer powers showroom, trial and client. Structure profile owns
   section order + exact slots; content payload is the only difference.
========================================================= */
const GAME_CLASH_LEVEL_ART={
 TH2:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYCi8SvgZpQwZKTzLlL26_H45NhJzXtiqWbk10t2CS1fOoh2hpLtkd9NSrjQ80bM75qxN_h1x78mn3tAcBa15xLPS_0jZCxh3eGiulPxLDP61-uS8JNnWGKuaW88j7SQfAcaLW4KLL6T_fsi9o0DVLECAaubVT82NoJEdLU20zR8Guhw2WzKpmBHI9S0WF/s400/th3_min.jpg',
 TH3:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYCi8SvgZpQwZKTzLlL26_H45NhJzXtiqWbk10t2CS1fOoh2hpLtkd9NSrjQ80bM75qxN_h1x78mn3tAcBa15xLPS_0jZCxh3eGiulPxLDP61-uS8JNnWGKuaW88j7SQfAcaLW4KLL6T_fsi9o0DVLECAaubVT82NoJEdLU20zR8Guhw2WzKpmBHI9S0WF/s400/th3_min.jpg',
 TH4:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEheolHY4te_AoCLqFirzRQUkC9uqCzk8aK_4-HVqsRquxijqDtGcHMqjWEPjgCfTbfSacC83bpx9dHXfZ3I79TnJBQKYFpNSp3qdkORQD-YtuJQCu-OnFMhrCZMBv6ALCjLJd2-oTT7uwwBVh9k7WKeDmqGIrN2RQY69lwIvytC3w2XdbO3ymPOsp0k6vlK/s400/th4_min.jpg',
 TH5:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiZyWwyYBp20g8flAmGbuViYKEIQFVEL-vAz6CsUR9g_Bc8RaIX9GGQD0cJPB9ZheAUQ0nq16h3gz1Knn15mtaNTtIvXhwQswmzAEmJN9BuU2S-kjWCiGqoELNMMph8_W9suMqRfoUF_1QFbQ4zp6AFfFKV6aIIk-oJrWArkzm3DzKOVh2PcRcBgvA8X251/s400/th5_min.jpg',
 TH6:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEijyKAimVhCEc2LEwr0kuyrFCKCXZHXt-2oh-bMIBGmxlt-K7nXBvgHCIyA8IZUyfVS0WkbFDSVFxXnB1vhnpwVJRv7W9nfch5pcF9cD6g9Tcc97kZuRxZuRlBanSFr8cOPnOxYKzsvVwT1Dn7drZcK3q0rkS2xiy4tM_hMTMOX2WnJB90xbgnhwkeEV2dw/s400/th6_min.jpg',
 TH7:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhIp7FvWLrBc4aWzNF_BrLjayL0CdQYKoy1DUzwUY9NMrK8xAKJeFRlpc9I49YBidTnfF_TzBrxUiq7T6DJ2T56e8DMkLlPSVwvyUAn7G0cjuzZ3ckH-WXA94GONI9TUwrif5VGon-LaRrayDUhUG6PhiafPRhg2jPxvephCy-rIr4UJv91OM1FGwAYSKNI/s400/th7_min.jpg',
 TH8:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhaOUdRpn5aHQvdAN0zrfqkGizFKJvb_zyZ0io7omwCgX_B-CwQULp5CnYVu1-6DLsLADx8Jfc5fhzPi1-SyIN7KzywUe-X7-Nm_LM_s0Vvke0Zqq1ronOlnlm-PuI-OSadbEBipTNY9-oC6KuQvl8EYZDeWRIGujTM_nleDj7_pB2_DbQnl7v1CDyWFlKJ/s400/th8_min.jpg',
 TH9:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjLWcJnPnSjwTWOeZgpn8_ogqSP5rK6sNFwVm6MvroqpZfHzFkhyphenhyphenBxN5ViljoZZHYxgT0UnecVQDn68-2wEmpPi-g2tMu6dswnnGWgEVicdNO2Z3KmtvLorZxMKrhKYL7IDOpqkeMmGA45ZtuIocbXXWclv_MXsXjQEm0kcei4-VTtVMe8OtrsPiLwUE7Oa/s400/th9_min.jpg',
 TH10:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgQoM0PbJpAPxxaAJbJPJWkZ0KJy1NPp3hSlyG4Z9bFow8uOHdbeG4GxK4h9mTM_JUCtk5vunqNI1q95OMB125KqQjE0FQmTgqax1FVR7xTm8XzCU6GXt7VaRTa5GBDe0cdXGM4V_KWSnQ7Dh2gMJg14rIcp-N3qiT1zsJocarO78l0ipdbPUJ_cDU3PqPx/s400/th10_min.jpg',
 TH11:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhcuIECC_Zse5vR22cBGQAPEjPO02qPwhs-0ZJyaj-fdlzebzo83Y-IHd_Le13b7m4QDCl5ex1qLEL5iD9RFQqjKuzXJMOLE7favB4WtxABFvAV1yrYn8_R2OkxmvHFn2cogZF2tH_lm290m95Nw1h61omj3bljMvpuG0iKxJYHaf9g85481QDFL0XXr3ts/s400/th11_min.jpg',
 TH12:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNl7LQu8-QQYyuMwQ8-gxJ2JNcZ_p4yrBD3hpXAyw2O-6UhdhZaS9jWducs1aU3JYF_q9yFXhstKiWqRAnAlGpPss5j8QgdfTlZySQfgKwhuScTB3Fh57evZLWJlHjronJalHHO8fRHvyMtJGBEI0iOfkxp1BZGhIANYP0gBg2Hu0o5T3mLzSaDwVARQb-/s400/th12_min.jpg',
 TH13:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGWOIyyM5RR1ue2jDlloGpRgHbJ4e437f33d0uNdIOqNdF5Jv1JSIR4RhBbj4ZzSqLxaaLsVojWwZRPuTkNku49KQn_wCoTvZm3HYwiQZcX2oQYeUl2bdS-4PVOEsHqvqEg7LdRWLI-ZTJAAdc5vXT3gI_wJjmD86enOKCCQ3i5pNjyuIvgj7ExuB2SFqm/s400/th13_min.jpg',
 TH14:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjg2Z5dTFysG1v8SqOxc1AIQox_KNBdiFAAaeyillHDzHYg7HeeUJpW_0JdUi9SIleVVECYU-LNd10H6Z5_2WZzn5IjBL2Tchc-KkU6hyphenhyphenivjHStWJQxkhKT9EvHScRs7j43C8rrWDc5qionA1ZllfVX4WB5jhhCn7fEp3l5zmAidCgPDUQODDWAHprvaVwU/s400/th14_min.jpg',
 TH15:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEige_0UXUdEAvsq8mCAXhYFtQIQpuFov2WY4SHOEt7E0jh7diMy3I0RIdSQL9wCJ-NyITIf5P293mufD6VVJ-svmFIQtHFnR6PQhX86J32CwrRuSrJFZ7_Ln4Q0rfXxYpy0-6vVmW15YOKhD-nkDiiID3ztqbdXu0XvPF83UY4-t0e9UETONrQy42pe3j_g/s400/th15_min.jpg',
 TH16:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhJtm5GbeDyNy9urRtDBa9NcRpHmNhKqvqCHF46317xeKn6pp3YfycZH2g6vmaQnzzKiFG7D0D8ZgozccrJZ3DXeyc8pw_I9-bFzpDKxRjY64MkQSwTOeikJCvb0bDf1W0ewXUmoOC5YzSgySe0xC-7ReJ6PRSEOkliaBHx8NrXJHjWow-VbSTTsgEtlsU9/s400/th16_min.jpg',
 TH17:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCdTCaRil9IY_W-rNX711VaHAhJNjjOtAXgOVP1encGhR8xMFphnPCGqG38HdjI9NckADJBNLdIIeyusee62Tws19DdZGJZZLDU5aypHG_iICQrGmRM7CdxxzsUojv2Xw7Pd1nFw1Qkh1mXbHEYcezZv9eEIHQGM2gMYNYACvM8GAcnm_xccqJ64FJ0I3U/s400/th17_coc.jpg',
 TH18:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj3uXRRSSucOwlCPaoJSv4XPqTAR-s4SHVTJWpurkKLFH3cXyvohLv33sXpzq58mRiTZ7PR9aI-lJvSJKoCJcVpJimUrunFPbHAXoKxyIh8EzcdgrzJR7fipf6CUToq7ibCmUoiht-v74iHihZLCeoO7VTTYLDXODjTL1DmcSm2EaTb3yrm0BJi1nOP2rG7/s600/th18_coc.webp',
 BH2:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgiOTS4KWzsgt1kT-GUq7Qz0wcGQB6DDxGz7vlDR5HtWqDbNOGcSu_v3hh1Tiy86QfOxjiSAgUjkVp0zuq5P_Subw-EVvBTXsBgK_35k4GLhr2HSt6MdoNZWJp2g2cCqSFj8-oNSwDNoXVxbNkt94cu0s0Na-HzAt8wyg1yFYR4MbWg2YsVytdqqnj5vno/s400/builder-hall-2%20%281%29.webp',
 BH1:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7n5GRhrPHZhcP8JdHfKjT1197jXUFt-Qdyqd0IvHNKhPbtp-CXbvWiqVuYqWDBFsxXC1KtiP3GnXyaGVVD5Gj9nBypxi_U9l7TbBnDg0dVMJx_ARKDTmZGRINv0liyAquRkBh8h7UfSkUhA5b2UZMtQcJw2eeXJL60CihrDAr12aYufLyJzdldtRHBEE/s400/builder-hall-1%20%281%29.webp',
 BH3:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGQ4irYKZH-1LqkU2Ede4z_K0ettAD4eQN1rtAHkgqpTje82jfgOcCsDkxbyZ5H-UDrnqeCBafnHEdKjYPo_Jy7rj5BZmivDWF9vZZs2K4mSBX0qb-I2nwwGEewB6A9PQbrs9jpcF7yTYAa_PLAnv8-6Hk1pzwqd_qmXtSnlQvEYzq6bBic9cso8snFqqv/s400/bh3_min.jpg',
 BH4:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEimQzCWcuoKx01P55-t3CgTcgBAj-a7EFj11klRe35dUk_H79ax7DLW6IWHVffyBbL65iHDiqEvWv67d5ByIZdekMNW7eMYazmFei-QV0xxsIVoIwC0e5wYuuHntIc6bL1FqfPu-TAxJGtqyGy1iX7hIwLdCdawb5S1jS9DWgj8JfrGzLt3GuJQUkFLsYuX/s400/bh4_min.jpg',
 BH5:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjkwQV9Nq_qSWRE-6e6RW5TIMN_VnmpQxe5rHvWrql94B7qxk6m6V5koAxpQN9CJn12x1w_CMKrjSRmpUyKbA7nkFd7cYjlAAihhQz9lt88oM435n9h4cU2T9hgNeTL0ZWrzcun_HOhrDM17Ge80OjRj0rJHpzkMSxm6y_PrgwkiZ4pE3pxGALxBOrbJoU/s400/bh5_min.jpg',
 BH6:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLFqsnO6e7nHi7TwNy1YpHjMhD_KpFlWCIHZPy-gtOZeuQ1UJ5PvumzZxfI13EeRjxAVLvvy5GO8hlfq9Hyl_BFjrBFU2AIqV9tbREPc__V9iDENmjhrYpZMUYz4pH1j36biSjgyyGm_DTPjzMIct_NZnyDxkixwREEVx2l5U0lSsaOShHmFmBCPTXwOQO/s400/bh6_min.jpg',
 BH7:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEijCwQNwk8Q0U36XNPnx0eJqx2I9cftr6duQQFZSbECPjgDn67edPM2ohlGwwBxZ_K4vJqPeCyIag8woC-tcIEtdlN7uFTZQ5CLHXEkoXDqWMspj9a5AK-KgqKxohEHI7ZQgPXO92JVmWQ5TB_UMEycscbgZJKt9O7Hm8fh1NuiKytnfFMcaocVAmaHSqxE/s400/bh7_min.jpg',
 BH8:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEglyTmwita5O6d-FqJvM1tagpIJdcbw3aEa1v13VjnNm61qliTiDqWzWL2UuJJVQrWtGlE2q_HOuH1FKclTc-5AIPL6OHSnTZooP29rTeG_hSyghYoCGwafFZYxRcNxCXAOfnnPod7Hi1tGiegwtDdvn617weuPuMml0IclLSXFD5NFnovowsAJxlRDK3kI/s400/bh8_min.jpg',
 BH9:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEglbhY3UBlGUikeGiX3sx54La_9kNQCCKt865LUIKpqUDONuvNp8pzqLr2wxhYy7f9m10JLXXDH2QM5uzLmV9AMgz74PZ0EaWqN-LdKah8bKytFJQ3tVYummGeZezHAh0Dts36x5TWxfHMdU0leJvmnn0pVgvP8jV27bPqi82ab1wxKQt18erW4k1AQBT4Z/s400/bh9_min.jpg',
 BH10:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhebxJQQZOV6GRSR_hHw82twIMi35fdd6cpa8UPSNhQrjzLHY6do0xh258qQd08fT9-Xl6bmIdwDqDLfzMqS4L0D_o28_bs2G1YWfipFxUtPuXOXCldYenAPk91lV1cHD1MOwITfBradygsmJg8N6FJs1Gv6baKlu2hTkKJQBgZeBp52XrA1kGZMqTZ0aBn/s400/bh10_min.jpg',
 CH1:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiqBJ0u-4XrRDsyr7OcdJK8E9ORAEXN5NFZ72beGgKg4P_ammINoZaFqRy4rkCtdU6mgs-7YqvBeSvCfiQbbwijtixKSPzXyNJmIuvP-jv8OS8GuYfVjCP_bM5tptZfd42GoillBjOBi_pGrt5Ntoz0TSHAr4OdV2ftuCoLg40FenZl4hhsLwVXv203DJU/s600/capital-hall-1.webp',
 CH2:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiM-Vv66VkIdIlBxpMaDagythAD92HJrgSWP7TEidpmt62kYOqGlWAjtOg4IvebGoYfFxRzj2__jtQBPwlbA0s9ZfxO3SrPyAW4DxuCcA4a_nvYHlnJc6j0dot9BPXdyhctq5rCtcaIjYe6Jf_reUYgebLiFsiTWvVnz_QtsDEry2ArZ9RMGL_46CeGtF0/s600/capital-hall-2.webp',
 CH3:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjdyeUtSgFM8pgVj0xASDmAPrs1dK8GvNI7Gj9m-kfv3XrO8bYH41FBioDYQ9qQ_LrJIJaD9WeNPNr9stgMw3R2b71yCn1lgFjrNGCufVQ2ic4fdlj9qiYPNUvYNHyamJVLbv67VuHTqYD4Ph6dhC7PJRtXVRoEaiCxnoaRVzIEFnH4TRN2wae_wI4ERts/s600/ch-3.webp',
 CH4:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj8gw6uFuaAL3bgMKLtgP7e3v4kluGzOKkxlfEo0E3RvnhyphenhyphenD2Dznewts2RWmhQTRH0wo2_2vQd6OTYMdZqSFvRTTV6uo9E7tk7bSs114axz5M_WOp4qdHTXS1g18nXYR_E-wIk6hI6ARBW0RTf_6KnGiZDJ9Ugu9a6StfZBNMnqVDz4mwuQUdVxeIjRgYQ/s600/captital-hall-4.webp',
 CH5:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixylIgt0N9XOHJ3cwHJQmt7hCtpbsmWik7xFh0Pj_BTHfS69dqSNPMqMdgopm9KBmCHGKxpq-ZZuWaxmk_AMA09PeA3ELY8k-AxOAbWDRHxL6GOCIZbFwB82MAai5dIvJzQAaoaaWpS-Wu7UfRVfrSauMDMJ5cvqq55Nby5qU_eJxihdAAuzlNLNFj52s/s600/capital-hall-5.webp',
 CH6:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg2-pFcSKsmMq0OSs_vfUAl6y_OM4tL2kr89LjVQs9CShyphenhyphenwuCzmydytqflBb7l2pQ1bMHhp_aBdQYlwTI_R0GiNIwETZkjNtzTr_3oEyKQD1H4ebWK378KpzRCMwLPjUpdNCk4PWLv1ZpQ2aAI_-tPF70E-pBrZMnWPWHkbbciC6SWgYgsyQRhf817Z9Zo/s600/capital-hall-6.webp',
 CH7:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBtN_IeHltQt9QyIXfvQqrAV2Mo4UNaiJ1sKHpTjvy7WV4zc8AimJF5vK5zdLo5zr9h2a-ETxcHwTY7M0oPRsU-tQdcHspyGmcLkmq5kYJr79tce_i4VrhGUQ_uAzq68BLGJ7ZhDMZGB6a5siqsWogLy23RAGoScxhj0IJdv_9nk5AagXilPBX3PUdH1g/s400/capital-hall-7.webp',
 CH8:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhi0qrwJOARFP3G319r-s4uz6BUZxgVgWqoKFB2KO9rmEqGvl36iDlprh2Qz8yFQgulZJrb2tR8dOV-UlWyl5Z52R1Ll7TaaOUXY6NJj9iCzavUqC3d1VVKWMYyjU2Ry16Ze7RXdVMdqdaF6E_3F4ZEd_y-b2nhhcJ6IcBWtlap1tmqGsbe0hyWdriR-60/s400/capital-hall-8.webp',
 CH9:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhK7gAeMA8bLHvElABLledL0Rdnrjttol8qQekrODgxgx5PNxLYGo3UugbqHF07KjGmp2y6T8WuVKrBuK0zxBiKNEIqjklvMJVrx2d5Gm8EolZGVyx-kJPT9zQqLdGr-YdHbcWBzqlonJHJZrQy0Uy-PtGa0qu5biNfbmfFRgDf4PcZQWoAuqlMVIpC3pI/s400/cpital-hall-9.webp',
 CH10:'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj1JvIJLGPBJbMokfsAMHLojAaUuRSTqccAC4mSWjBatPVAwFh9y3vcHhiiReED2d4S9XpfjjuwtvFv4dO2G1aEgIaI4xm3qSxEkb7uNzoyoQziorJr2w2-SzOHx14ECOLgZnMIPlVRjI0FNYxMU7ELxrKTWnZwlUH6ughJvTDv3nWbDQbSvkbY93cK9LU/s400/capitall-hall-10.webp'
};
const GAME_LEVELS={th:Array.from({length:17},(_,i)=>i+2),bh:Array.from({length:9},(_,i)=>i+2),ch:Array.from({length:10},(_,i)=>i+1)};
const GAME_REAL_SAMPLE_POSTS=[{"type":"game","title":"TH7 Anti 3 Star War Base (2025 Meta Hex Core)","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg81icGed1u6h_vCePeCuh14sa9TSpkDspGMFeh8abjoHGUCAomjo95CxiRMO9NnDKOhl38OP8mnVDoM3htb_VQtuddQKJcGgWk8cVdTda6jHy9HTg4hL9f98OZjHaSL3xfbiXb1cy5-HkHW1ehNMWqN2AyCcHMAJf-1JI3nFLSatJLxoishJeg4V3EaVI/s640/th7-anti-3star-hex-war-base-2025.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/th7-anti-3-star-war-base-2025-meta-hex-core.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH7\", \"game_purpose\": \"War\", \"game_style\": \"Original\", \"game_defense\": \"Anti 3 Star\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH7%3AWB%3AAAAACQAAAAGvLefwAbBGI40wfUyE-skg\", \"game_year\": \"2025\", \"legacy_labels\": [\"TH7\", \"TH7-Anti-3-stars\", \"TH7-War\"]}","content":"<p>TH7 Anti 3 Star War Base (2025 Meta Hex Core) is shared for Clash of Clans players looking for a practical TH7 layout. Use the copy link to open the layout directly in game.</p><h2>TH7 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"TH9 Hybrid Base Layout 2025 | Anti Air & Ground | Clash of Clans","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEimdHkAIkLSGx_z4UTk8D4ZUnHtrxq2SwWCBZ1SL9aKurseimlBQm_H2fMW11LpBWxA2dbAEOHdrV2l8SpV_YpFq3RFcf52Q3BlAihr3B43meyw-FwPOZv5BrSpQSmPDfPRW33e1hAzWQdZyc5STZzSpXI4qU_QgNHSOrO_IuZMkUepWvmzN5fbYkTrZ-w/s640/th9-hybrid-base-2025-anti-air-ground%20(1).webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/th9-hybrid-base-layout-2025-anti-air-ground-clash-of-clans.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH9\", \"game_purpose\": \"Hybrid\", \"game_style\": \"Original\", \"game_defense\": \"Anti Air\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH9%3AHV%3AAAAAQgAAAAGKFKzD0VOxW_VLKH5ZGf_Q\", \"game_year\": \"2025\", \"legacy_labels\": [\"TH9\", \"TH8-Anti-air\", \"TH9-War\"]}","content":"<p>TH9 Hybrid Base Layout 2025 | Anti Air &amp; Ground | Clash of Clans is shared for Clash of Clans players looking for a practical TH9 layout. Use the copy link to open the layout directly in game.</p><h2>TH9 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"TH7 Storage Split Farming Base","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjB6UMslKRLJwsolihOfP0ORAnRVYlB1GamxUKgEmdtvSwwxr61oaDKvwVeF8u_Q_RMASZy_Dbr2Uhv5UYXcNrSuq1mF2jnrAkENHryguzAtQR9JB60YgSTMFvfxTiLapbDzf7rg9wnrdHHzeuqVFfSP1GH1DEpi5XGgnlDqD0AcGsl3JvBQ3KmENyYmsA/s640/th7-storage-split-farming-base-2025.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/th7-storage-split-farming-base.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH7\", \"game_purpose\": \"Farming\", \"game_style\": \"Original\", \"game_defense\": \"Anti 3 Star\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH7%3AHV%3AAAAAIAAAAAHdJOJI6CCJj1F88QYW61m2\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH7\", \"TH7-Farming\", \"TH7-Hybrid\", \"TH7-Anti-3-stars\"]}","content":"<p>TH7 Storage Split Farming Base is shared for Clash of Clans players looking for a practical TH7 layout. Use the copy link to open the layout directly in game.</p><h2>TH7 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best TH5 Hybrid Base Layout in Clash of Clans","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiGaoL3LiSeTJWbM9ePE161Mdzsij3MDgFsq3IfXuS3DjVddVElDDM0OPIWcmXkgDys64fHuAPqaQKKCkb5Xq_0W-x4qCKrqge7IrWMmV5LXwwpUOsLjGSnzzU0TVamkS1rSvxLZQXy7tn7Y31Oet_eoDs-BbQYBezy9-eGbgG_wIPS5H3TqvDbZjvE7q0/s640/th5-hybrid-base-layout-coc%20(2).webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-th5-hybrid-base-layout-in-clash-of-clans.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH5\", \"game_purpose\": \"Hybrid\", \"game_style\": \"Original\", \"game_defense\": \"Anti 3 Star\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH5%3AHV%3AAAAASgAAAAEz8ab5i9ctFWNvP54woT3V\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH5\", \"TH5-Hybrid\", \"TH5-Anti-3-stars\", \"TH5-Anti-ground\"]}","content":"<p>Best TH5 Hybrid Base Layout in Clash of Clans is shared for Clash of Clans players looking for a practical TH5 layout. Use the copy link to open the layout directly in game.</p><h2>TH5 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Top Town Hall 6 Anti Air Base (Clash of Clans)","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh-EuvmDRyNZp-8vqe5Z8k-ijTKDlR3fE6-zNlgWs3IaWrNd1v64gME18_J6P-XoU3Hrfy9YGFP5yhqHe9-NcMXSAXETu67JJyrDCU40248AUXjYr6Ar8L6CrxFHDI2uLpZCt_20cdynjV2gIq3QNDxGMgZTQQhJtYl4xQmPYfVmYtSW7Y1W7xhnSTUXl4/s640/th6-anti-air-base-coc.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/top-town-hall-6-anti-air-base-clash-of-clans.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH6\", \"game_purpose\": \"Hybrid\", \"game_style\": \"Original\", \"game_defense\": \"Anti Air\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH6%3AHV%3AAAAAEAAAAAHnY6ICVpxiZY7y2ssOgp2b\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH6\", \"TH6-Anti-air\", \"TH6-Trophy\", \"TH6-Hybrid\"]}","content":"<p>Top Town Hall 6 Anti Air Base (Clash of Clans) is shared for Clash of Clans players looking for a practical TH6 layout. Use the copy link to open the layout directly in game.</p><h2>TH6 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best TH15 Farming Base 2025 | Anti Everything Resource Protection Layout","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHxbM58JZjHOC_A_guq8LMXNiOdj3POFrNiA9Wu1jyv8xQi7gi4BTQZ4fS0u-KBMolgXzuu7z4OO03Goyvjs5QOhS4XOtO4icTG-2JiSzg1ltJmN-InxX7etLJzlMJvmupVr4elHaMchHYV2u8hZ-g08xj_ZJHsVZx-1wp7V1h1Y8lhE6p-miWkeDF298/s639/th15-farming-base-anti-everything-2025.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-th15-farming-base-2025-anti-everything-resource-protection-layout.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH15\", \"game_purpose\": \"Farming\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH15%3AWB%3AAAAALwAAAAH0MpNd-RmjM_qXVP7Q27b5\", \"game_year\": \"2025\", \"legacy_labels\": [\"TH15\", \"TH15-Farming\"]}","content":"<p>Best TH15 Farming Base 2025 | Anti Everything Resource Protection Layout is shared for Clash of Clans players looking for a practical TH15 layout. Use the copy link to open the layout directly in game.</p><h2>TH15 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhANocmnO0x-4qD0RM9WA9Myff7w295VBKM_8JcmAQKvASAMZcUbmA6WoDNCAv26DzH_CoyFgtUUEMBAom4t-6jQhObuBonMfYZCO41I2QrEmLtbl-_lhyphenhyphenx5fZHESSasYhQiN0jgR-lwunYzzN2aaA2UOOBFNvtQ4ARDdx2TR9zu_78HF4m6mnzzfLoNKg/s1600/th7-war-base-anti-ground-2025%20(1).webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH5\", \"game_purpose\": \"War\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en/?action=OpenLayout&id=TH7%3AHV%3AAAAAOAAAAAIJiAL6N4AYqs2DXEprXFbe\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH5\"]}","content":"<p> is shared for Clash of Clans players looking for a practical TH5 layout. Use the copy link to open the layout directly in game.</p><h2>TH5 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"TH7 Hybrid Base Layout","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfQeYcny6ex7eLq321optUXhLoKAFVCUPU7xkXE9PSXKmwuDThe7SUtYMe6tiMw3IIYrrC_PkkwjQtOn8NnwR3_E3XkUiG1mT0Kit7PDNIzlpGPuZYf9TBsglrNoUzTHdLVZQknzqMTZYucjEd7t4g6m0DU68LxDK7hqeqCu0YN8K9cmjKdZ6jxaQtcnE/s640/th7-hybrid-base-layout.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/th7-hybrid-base-layout.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH7\", \"game_purpose\": \"Hybrid\", \"game_style\": \"Original\", \"game_defense\": \"Anti Air\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH7%3AWB%3AAAAAIAAAAAHaIvgmXH3auIew7wh-PFWL\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH7\", \"TH7-Hybrid\", \"TH7-Anti-air\", \"TH7-Anti-ground\"]}","content":"<p>TH7 Hybrid Base Layout is shared for Clash of Clans players looking for a practical TH7 layout. Use the copy link to open the layout directly in game.</p><h2>TH7 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best TH5 Farming Base Layout | Clash of Clans Resource Protection Design","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiIVMis8IgaUhhfWI3SkBXBtL_5aC64-qa0SpFdFonMybi49ObdgCQKK4baZ3EhbWUOZHYrIder0hDfYSpiG4mDYd5H1hKxGehG-v-yxJqfJ4vg1akgGc86YbYKxuZjUNNXnE-bsSMVOkgzhGZoE0DI2KIn5QzRphKEJQWy9I90Wb5qfQLcYiPQHV6Gx2Y/s640/th5-farming-base-layout-resource-defense-coc.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-th5-farming-base-layout-clash-of-clans-resource-protection-design.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH5\", \"game_purpose\": \"Farming\", \"game_style\": \"Original\", \"game_defense\": \"Anti Ground\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH5%3AHV%3AAAAABQAAAAITQuwqcnK2IcB29ofdLI3B\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH5\", \"TH5-Farming\", \"TH5-Anti-ground\", \"TH5-Trophy\"]}","content":"<p>Best TH5 Farming Base Layout | Clash of Clans Resource Protection Design is shared for Clash of Clans players looking for a practical TH5 layout. Use the copy link to open the layout directly in game.</p><h2>TH5 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Town Hall 14 Base Layout 2025 | Anti 2-Star & War Defense Base","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi9exTL6a3RtkaMLNdrY-KRE-iUoKwIH5dcjhx5yhL3bRw7I6t1_V4TETj3xY3iRMmBmEmppvDEi1UR29OGcscb-TcIu2jkMR4mEnJ2u_J0qJ6c4zRb8M89uwl9QBuMvHHIlZesnAU4Bg9USguQ-I1t_zdkvDpiGbjDoB9gEajJCnkZqmBbmuqECFCClSQ/s640/th14-base-2025-anti-2star-war-defense.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-town-hall-14-base-layout-2025-anti-2-star-war-defense-base.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH14\", \"game_purpose\": \"War\", \"game_style\": \"Original\", \"game_defense\": \"Anti 2 Star\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH14%3AWB%3AAAAAUgAAAAEw_DrnwPn3IHZtdaMQIlrJ\", \"game_year\": \"2025\", \"legacy_labels\": [\"TH14\", \"TH14-War\", \"TH14-Anti-2-star\"]}","content":"<p>Best Town Hall 14 Base Layout 2025 | Anti 2-Star &amp; War Defense Base is shared for Clash of Clans players looking for a practical TH14 layout. Use the copy link to open the layout directly in game.</p><h2>TH14 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best TH8 Hybrid Base 2025 – Town Hall 8 Anti Hog Giant Farming Layout","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhucI_eBLHAtgrsPtmH5URrYqXXxnyVT369q9KzaVzDH1pufZ-vUYVhzNIzD434PuWxRPpKuXbi_7ALooswa2LvTVIQr_OY7BwP58qrekyHd-s1paHWXVfPeJwygbFUk58eMwDN0k29Jv-jVL4tZMdeJuiN0jtuGh5b4iZIoGUXEGV6wvpSPKyt8WRTPRw/s640/th8-hybrid-farming-anti-hog-giant-2025.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-th8-hybrid-base-2025-town-hall-8-anti-hog-giant-farming-layout.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH8\", \"game_purpose\": \"Farming\", \"game_style\": \"Original\", \"game_defense\": \"Anti Ground\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH8%3AHV%3AAAAATAAAAAGtYiVAEOCXnv79DOBR_-jk\", \"game_year\": \"2025\", \"legacy_labels\": [\"TH8\", \"TH8-Hybrid\", \"TH8-Anti-ground\", \"TH8-Farming\"]}","content":"<p>Best TH8 Hybrid Base 2025 – Town Hall 8 Anti Hog Giant Farming Layout is shared for Clash of Clans players looking for a practical TH8 layout. Use the copy link to open the layout directly in game.</p><h2>TH8 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best TH14 Base Layout 2025 | Anti Queen Charge & War Defense Base","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj4V15c3wGZfjvS4Gv3LB_vcFOd8D2UO_nuS8shUVceW2Xu649RR_WBpPPJH_Le1Dwoqpi47pQNvr2yZ89-KPcjwRpLS_HrV6hd1g_qFii3wFEZ3gz24l9119aFe5DYuq2OI7T0niRBb-xy96swKieK2U_B9WD-OluKiW2bMsvuiPrdwhSJww4YztFDD2o/s639/th14-base-2025-anti-queen-charge-war-defense.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-th14-base-layout-2025-anti-queen-charge-war-defense-base.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH14\", \"game_purpose\": \"Hybrid\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"#\", \"game_year\": \"2025\", \"legacy_labels\": [\"TH14\", \"TH14-War\", \"TH14-Hybrid\", \"TH14-Trophy\"]}","content":"<p>Best TH14 Base Layout 2025 | Anti Queen Charge &amp; War Defense Base is shared for Clash of Clans players looking for a practical TH14 layout. Use the copy link to open the layout directly in game.</p><h2>TH14 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Town Hall 8 War Base Layout Anti Dragon – Clash of Clans TH8","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEitL4Y-OJBDCRk7G74lJ-De_CcLRyzHALsUd-S4BU0vTez0Lg1DMaP7PkvgiLZq4s8Nf0jVfspnDZJ-d15mLCevj_4q6RXJWZlZZ4uCkFHVbX8-YQahJvNI2kyjMYnbEvREN9mR_0rq45wgkuTmPckhgIYjpgqg_A46OCSxT3UX1tnhd7sw-0R3q6k6h_s/s640/clash-of-clans-th8-anti-dragon-war-base.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-town-hall-8-war-base-layout-anti-dragon-clash-of-clans-th8.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH8\", \"game_purpose\": \"War\", \"game_style\": \"Original\", \"game_defense\": \"Anti Air\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH8%3AWB%3AAAAACgAAAAHbjcdw5_4A_VnZro43rkZO\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH8\", \"TH8-War\", \"TH8-Anti-air\"]}","content":"<p>Best Town Hall 8 War Base Layout Anti Dragon – Clash of Clans TH8 is shared for Clash of Clans players looking for a practical TH8 layout. Use the copy link to open the layout directly in game.</p><h2>TH8 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"TH12 Hybrid Base Layout 2025 | Anti Electro Dragon, Anti 2 Star, Farming + Trophy Base","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgjpJbTloi0_jHbQfCzIc1F-bLhb6BoqvFEWdvyCpFgohsW0VU5IyW6rp0p1DTr2MAUzyDPsZJ-f7vgJAZ8FOYffTBV0ZjYZiPF7Y_1y3XnvH7hu1egrY83swPxVeMKCgxiyXkdAkF5vWsisZ1wlhbA5MQTHUAcfIf-v1SMw9meUm33Dy3dUW9ddtDrWto/s639/th12-hybrid-base-2025-anti-electro-dragon-farming.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/th12-hybrid-base-layout-2025-anti-electro-dragon-anti-2-star-farming-trophy-base.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH12\", \"game_purpose\": \"Farming\", \"game_style\": \"Original\", \"game_defense\": \"Anti Air\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH12%3AHV%3AAAAAHgAAAAHW3f35Huc7STBvvWOIdydz\", \"game_year\": \"2025\", \"legacy_labels\": [\"TH12\", \"TH12-Hibrid\", \"TH12-Trophy\", \"TH12-Anti-2-stars\", \"TH12-Anti-air\"]}","content":"<p>TH12 Hybrid Base Layout 2025 | Anti Electro Dragon, Anti 2 Star, Farming + Trophy Base is shared for Clash of Clans players looking for a practical TH12 layout. Use the copy link to open the layout directly in game.</p><h2>TH12 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best TH9 Hybrid Base Layout 2025 | Anti 2-Star & Farming Base","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCe6M1TQR_GdbG1t6PdsxNjGyFO1tzxjGPDWtow9iCGyRg67XPqNadmSZrnikyv1WlWEMSyLN74FewjdeQLTHgSwPvvSWbxnPAHqlEfVYD1vpP8V2eoXIXAfRyoFMEq9JhHrw0aktzpyXiGuFmcPvYC3874bvt9vT1LR4V0ojt68Oz1YMckzYu5iKhEQA/s640/th9-hybrid-base-2025-anti-2-star-farming-trophy.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-th9-hybrid-base-layout-2025-anti-2-star-farming-base.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH9\", \"game_purpose\": \"Farming\", \"game_style\": \"Original\", \"game_defense\": \"Anti 2 Star\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH9%3AHV%3AAAAAQgAAAAGD-bZTQ6aUneLO4tonzo89\", \"game_year\": \"2025\", \"legacy_labels\": [\"TH9\", \"TH9-Hybrid\", \"TH9-Anti-2-stars\"]}","content":"<p>Best TH9 Hybrid Base Layout 2025 | Anti 2-Star &amp; Farming Base is shared for Clash of Clans players looking for a practical TH9 layout. Use the copy link to open the layout directly in game.</p><h2>TH9 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"TH17 Farming Base | Clash of Clans","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpb7xgGxjSHQc6WyskeiyDvoC7N8Y8OlOZyGRbg2i1b8IQ7XGHRp7P9Ce93dKQp4O2Jo7Q026678iFAbC5xHLOsHTdMNkFcoESMezArPGEJybssog75ueb4Q57tPZkVKjdJuOXnXHmXZp86hyphenhyphenAF0xWLZlCOWWaVYed0-aJNkH_X8zWwXiYRQBK-mOwsAk/s640/th17-farming-base-coc.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/th17-farming-base-clash-of-clans.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH17\", \"game_purpose\": \"Farming\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en/?action=OpenLayout&id=TH17%3AWB%3AAAAAVQAAAAHHpSWF3zefV_nmJtj3t84g\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH17\", \"TH17-Hybrid\", \"TH17-Farming\"]}","content":"<p>TH17 Farming Base | Clash of Clans is shared for Clash of Clans players looking for a practical TH17 layout. Use the copy link to open the layout directly in game.</p><h2>TH17 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best TH5 War Base Layout | Clash of Clans Town Hall 5 Anti 3-Star War Base","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjmGfpXyslXCZNwyXy9Ofhty0IYVu1vsZWXwMpB-YBpglwDp1zWx-2KxB4o8jyXzAWf9QAVdQUIvEIW6E253nY5Eb6wmF2WjxO6reM0pcGnMLifAIJzEV8pFOr9M6yh7Jv7BkiRTslOLtE3RzufwnAKNlid_sFkjyqzscy5pWZgkMhDLhFrhYwAT6XHPWk/s640/th5-war-base-clash-of-clans-town-hall-5-anti-3-star.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-th5-war-base-layout-clash-of-clans-town-hall-5-anti-3-star-war-base.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH5\", \"game_purpose\": \"Trophy\", \"game_style\": \"Original\", \"game_defense\": \"Anti 3 Star\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH5%3AWB%3AAAAAAgAAAAK-wS132-MbMHcU6BN4pPg5\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH5\", \"TH5-Anti-3-stars\", \"TH5-War\", \"TH5-Trophy\"]}","content":"<p>Best TH5 War Base Layout | Clash of Clans Town Hall 5 Anti 3-Star War Base is shared for Clash of Clans players looking for a practical TH5 layout. Use the copy link to open the layout directly in game.</p><h2>TH5 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best TH10 War Base Layout | Anti Air & Queen Charge | COCBasePro","category":"Town Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEHZZIeA2wDIFfkeftdf6XJRNtfKWWouUChVJGCazyACG0VlNeOOxnRSf48PAso886ofl5FLM6m-LHGKp_nWbSkEvVqb_WyUwETomUqSEsV5JDM5IR_LAaOEaWTOeshpsszrFEb4RGyhsYSG_y8Kc3mGav348dphQrD5I6Dd7wvqQuoIa2p_X5-cD-cSM/s640/coc-base-hall-10-war%20(1).webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-th10-war-base-layout-anti-air-queen-charge-cocbasepro.html","extra_json":"{\"game_group\": \"Town Hall\", \"game_level\": \"TH10\", \"game_purpose\": \"War\", \"game_style\": \"Original\", \"game_defense\": \"Anti Air\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH10%3AWB%3AAAAAGAAAAAGup1JE4O44eB_PyB9Dvy3J\", \"game_year\": \"2026\", \"legacy_labels\": [\"TH10\", \"TH10-War\", \"TH10-Anti-air\"]}","content":"<p>Best TH10 War Base Layout | Anti Air &amp; Queen Charge | COCBasePro is shared for Clash of Clans players looking for a practical TH10 layout. Use the copy link to open the layout directly in game.</p><h2>TH10 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best BH6 Trophy Base | Builder Hall 6 Anti 2-Star Defense Layout","category":"Builder Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQ4o_G9VPIn5uBhiFrF5DiJANfjgxCmPKItIZHVm8s1zcPD4C-RYO9bgikCaUid8x6ZJXJTuUaq8MOiSvNGVxsrLSG5nt_hC509RBmtAFLZQTOIoHfShiI-neiDXPLrgUO0hRalkfEQ9YaoBVDgQCOYhO7vSO7HZ1gNhiHOGgtX1dwUBWbj5qoUMToizo/s639/bh6-trophy-base-layout.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-bh6-trophy-base-builder-hall-6-anti-2-star-defense-layout.html","extra_json":"{\"game_group\": \"Builder Hall\", \"game_level\": \"BH6\", \"game_purpose\": \"Builder Base\", \"game_style\": \"Original\", \"game_defense\": \"Anti 2 Star\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH6%3ABB%3AAAAASgAAAAFJgFyPa4O26XGNYOIBn8gQ%0A%20%0A\", \"game_year\": \"2026\", \"legacy_labels\": [\"BH6\", \"BH6-Trophy\", \"BH6-Anti-2-stars\"]}","content":"<p>Best BH6 Trophy Base | Builder Hall 6 Anti 2-Star Defense Layout is shared for Clash of Clans players looking for a practical BH6 layout. Use the copy link to open the layout directly in game.</p><h2>BH6 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best BH9 Base Layout 2025 | Builder Hall 9 Hybrid Trophy Base","category":"Builder Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgLMv1jv62zuw7BdR6h4AgAHg2X10Yg8pGV6zX8q1I5qcgPRFlTB_NUTvS4oHMWcIbnhzhjhuzb5biHqi90Ns6oDEnEQnNmhjGvuKcQW3G3I8INlMYgSqDFgz0JSSVqcaZQutnDaCRgqa1JoI2MiaFW0evto2mUb_8eC4WJ8urvKv3alRFoou13XSLtUU0/s500/bh9-best-hybrid-trophy-base-2025.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-bh9-base-layout-2025-builder-hall-9-hybrid-trophy-base.html","extra_json":"{\"game_group\": \"Builder Hall\", \"game_level\": \"BH9\", \"game_purpose\": \"Builder Base\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH9%3ABB%3AAAAATQAAAAFBFM3Ht6UTidrIEny87Am8\", \"game_year\": \"2025\", \"legacy_labels\": [\"BH9\", \"BH9-Hybrid\", \"BH9-Trophy\"]}","content":"<p>Best BH9 Base Layout 2025 | Builder Hall 9 Hybrid Trophy Base is shared for Clash of Clans players looking for a practical BH9 layout. Use the copy link to open the layout directly in game.</p><h2>BH9 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Builder Hall 8 Trophy Base | Anti Ground & Air Design 2025","category":"Builder Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjALnyQHcP6nsgkSqdC5TVmwenZ519Zo2RtqNwwOpNPnubRD6rSSCH1J-MuTiUai0JchmB3eJ4attLZm8a6UfEmoxYJO6cimRpWQ0JEbSWZZJq-E2nK87V7fX-ovgZvUwiwCuReOcGJlYuSNyWzUEkXJO9VDZoDPWOdymG5ndoRyIzR4EObQMDIHRQdvFk/s534/bh8-trophy-base-anti-air-ground-2025.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-builder-hall-8-trophy-base-anti-ground-air-design-2025.html","extra_json":"{\"game_group\": \"Builder Hall\", \"game_level\": \"BH8\", \"game_purpose\": \"Anti Air\", \"game_style\": \"Original\", \"game_defense\": \"Anti Air\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH8%3ABB%3AAAAABQAAAAHGvj0rQWt5B7hz8ksw6qtn\", \"game_year\": \"2025\", \"legacy_labels\": [\"BH8\", \"BH8-Anti-ground\", \"BH8-Anti-air\"]}","content":"<p>Best Builder Hall 8 Trophy Base | Anti Ground &amp; Air Design 2025 is shared for Clash of Clans players looking for a practical BH8 layout. Use the copy link to open the layout directly in game.</p><h2>BH8 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Builder Hall 10 Anti Air Base 2025 | Clash of Clans","category":"Builder Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLSiAFeTIQOP21mKcoT-9S3LgY0Eao1HXWHO4Xm81Xm5u1K7p-HUSlz6CWx3btmyQgsUbixGRvMYlzk1wjnHNsPfwY8D7EOFz8y68U1OfviNdO97RAyJH2O2sKjGzTJin3YOGg9DHcgAbcHn3Bq9fTKtNPRBYua2vsFOJSm4Sko_27r1u8cp8NAFwlXTU/s400/bh10-anti-air-base-2025.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-builder-hall-10-anti-air-base-2025-clash-of-clans.html","extra_json":"{\"game_group\": \"Builder Hall\", \"game_level\": \"BH10\", \"game_purpose\": \"Anti Air\", \"game_style\": \"Original\", \"game_defense\": \"Anti Air\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH10%3ABB2%3AAAAAAQAAAAKUrmtGYCLBvb8E5iBzPBXm&fbclid=IwAR1KDKCXQMdiMHv9_GM33-SIeq-7mvq3P2--p_n6o4NEYU2PhRqnRUJDwEU\", \"game_year\": \"2025\", \"legacy_labels\": [\"BH10\", \"BH10-Anti-air\", \"BH10-Anti-baby-dragon\", \"BH10-Anti-minion\"]}","content":"<p>Best Builder Hall 10 Anti Air Base 2025 | Clash of Clans is shared for Clash of Clans players looking for a practical BH10 layout. Use the copy link to open the layout directly in game.</p><h2>BH10 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Builder Hall 10 Anti Ground Base 2025 | Clash of Clans","category":"Builder Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiNlF1paU8tnm3DFv5xXy5zRD5dDe4OAAqxU96nYvTW1vHCxmTDC3-OZcLNpoL-66Yw1U4TXK6m7goeNYURNkc0r1EAdMF58sdQxDW6eNLJfgFWJxEsb6mCObJPblUpKMt-Vlcg1I7WsoRgwwEC68bzAqMkIuVqGd-rN8C9z2fL4-aAqGp3nJtaA9ahmTs/s400/bh10-anti-ground-base-2025%20(1).webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-builder-hall-10-anti-ground-base-2025-clash-of-clans.html","extra_json":"{\"game_group\": \"Builder Hall\", \"game_level\": \"BH10\", \"game_purpose\": \"Anti Ground\", \"game_style\": \"Original\", \"game_defense\": \"Anti Ground\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH10%3ABB2%3AAAAAAQAAAAKUrhrrvXMHx_VRZ4VzOpUd&fbclid=IwAR0XlATlJrbRO8eFZw392QiqavbpHvL70fNGbE6yoBx6gy6g5A5v7bVPLWM\", \"game_year\": \"2025\", \"legacy_labels\": [\"BH10\", \"BH10-Anti-ground\", \"BH10-Anti-giant-boxer\"]}","content":"<p>Best Builder Hall 10 Anti Ground Base 2025 | Clash of Clans is shared for Clash of Clans players looking for a practical BH10 layout. Use the copy link to open the layout directly in game.</p><h2>BH10 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Builder Hall 10 Diamond Base Layout 2025 | Anti 3-Star Defense","category":"Builder Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgjwt5cl7-5K4oZYuZhyCnX0JeJT08OGeBkbTXkB62EVIqJosUNq0xXw5XxpVUzoE-UeAxtv_KsYEastA6aaNFnLNl0d-e_wxJsa2E5Saa9k7R4oNpYZpDbg_O1JhtS89SpiavnewXJbgIKzEuJDVrW5HtWBjlZzBKKePYUACkdRJCxSn_5goKa5SjSbhM/s400/bh10-diamond-base-2025.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-builder-hall-10-diamond-base-layout-2025-anti-3-star-defense.html","extra_json":"{\"game_group\": \"Builder Hall\", \"game_level\": \"BH10\", \"game_purpose\": \"Builder Base\", \"game_style\": \"Original\", \"game_defense\": \"Anti 3 Star\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH10%3ABB2%3AAAAAAQAAAAKUqDkEZET-PAjlaSG5M1SX&fbclid=IwAR3l0LjrF_dQalZRITbme8ZctpqN39REQ4FjxvscM6ipgR_r-d8rR3o9oGg\", \"game_year\": \"2025\", \"legacy_labels\": [\"BH10\", \"BH10-Diamond\", \"BH10-Anti-3-stars\", \"BH10-Trophy\"]}","content":"<p>Best Builder Hall 10 Diamond Base Layout 2025 | Anti 3-Star Defense is shared for Clash of Clans players looking for a practical BH10 layout. Use the copy link to open the layout directly in game.</p><h2>BH10 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best BH8 Anti 3-Star Base Layout | Clash of Clans 2025","category":"Builder Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi3OK9OEaDaJUexKhyEE58374LopWaOlrT9WuaxakoNqaRrActzpRwezbuj3uKPJaeVHkC6qKHjRnPtHjd78XNntEYpUlhh55bTSEveijX2v7dEXN4x0QtPPJt5WKI8W1SFG2nETvyKccRLqmL-eeG3JtseCIa0KDzYHM1Hy221F5uoaCMgxgU8L3U6_d4/s640/bh8-anti-3star-base-2025%20(1).webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-bh8-anti-3-star-base-layout-clash-of-clans-2025.html","extra_json":"{\"game_group\": \"Builder Hall\", \"game_level\": \"BH8\", \"game_purpose\": \"Builder Base\", \"game_style\": \"Original\", \"game_defense\": \"Anti 3 Star\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH8%3ABB%3AAAAADQAAAAHQvOPUlNJzhKQILAWwdIBT\", \"game_year\": \"2025\", \"legacy_labels\": [\"BH8\", \"BH8-Anti-3-stars\", \"BH8-Trophy\"]}","content":"<p>Best BH8 Anti 3-Star Base Layout | Clash of Clans 2025 is shared for Clash of Clans players looking for a practical BH8 layout. Use the copy link to open the layout directly in game.</p><h2>BH8 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best BH4 Hybrid Base Layout | Anti Air & Ground Builder Hall 4 Design","category":"Builder Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgbwalTpEw-L0UJzQ4HbXqhugji92GNv5BQVmN4R3pjdeoxpDrkbBsv_N9KUuV0eGTKxB8BzKmlhk5je-cul_zLfWwnKHTCt4AcDiOfi7i2_4x1EYWMlWCMPIV2PAwQ7vjvonNuwQ-IwxiLQfrbgbVZzORLce8KAuSWGMjOAGQFJwGzfsmdd0rCLrNTDYw/s640/bh4-hybrid-anti-air-ground-base.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-bh4-hybrid-base-layout-anti-air-ground-builder-hall-4-design.html","extra_json":"{\"game_group\": \"Builder Hall\", \"game_level\": \"BH4\", \"game_purpose\": \"Anti Air\", \"game_style\": \"Original\", \"game_defense\": \"Anti Air\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH5%3ABB%3AAAAACwAAAAGY6g7fDMT4luGzQ5d8YCjw\", \"game_year\": \"2026\", \"legacy_labels\": [\"BH4\", \"BH4-Hybrid\", \"BH4-Anti-air\"]}","content":"<p>Best BH4 Hybrid Base Layout | Anti Air &amp; Ground Builder Hall 4 Design is shared for Clash of Clans players looking for a practical BH4 layout. Use the copy link to open the layout directly in game.</p><h2>BH4 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best BH4 Hybrid Base Layout | Builder Hall 4 Anti Ground & Air Design","category":"Builder Hall","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh8KE_qidGkXEh848B7uJsXIlNNw-GrEMPOdOlnTQjBcw6zVOqP2kKOVaOrftcpbWuZ7s4X57VipqwtqYljd9GZeTZXgQtCc-WwdbmUvYwYc6e6Yi7cV-y3WIxDfFoAM7uAg1Al4JyYL8tVu7ydDLEiF-Hx50Y33tioXaXudWnRzh1UWppT495VG07cZNc/s634/bh4-hybrid-base-layout.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-bh4-hybrid-base-layout-builder-hall-4-anti-ground-air-design.html","extra_json":"{\"game_group\": \"Builder Hall\", \"game_level\": \"BH4\", \"game_purpose\": \"Anti Ground\", \"game_style\": \"Original\", \"game_defense\": \"Anti Ground\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH4%3ABB%3AAAAAMgAAAAFSqSXdDi23vWWAlHHI56fD\", \"game_year\": \"2026\", \"legacy_labels\": [\"BH4\", \"BH4-Anti-ground\", \"BH4-Hybrid\"]}","content":"<p>Best BH4 Hybrid Base Layout | Builder Hall 4 Anti Ground &amp; Air Design is shared for Clash of Clans players looking for a practical BH4 layout. Use the copy link to open the layout directly in game.</p><h2>BH4 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Dragon Cliffs Level 2 Layout – Strong Capital Base Design (Clash of Clans)","category":"Clan Capital","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgyvgRWuC_2pVeegHXzefOAxh2N4dhzYpXFm0pKDCQeUBZ4uIbWal9mWfHrdagwrciUToGracs9Fl9-E6kxMuCzY-J4I3PsxiUQQzyo67nBW2YUfWfLGvqlDxzLQWMK1jDO9jmzkvY6vLrnKcRUKRG0aldfRUgREQyasK655krFXQaCeG1fPzLtXDX3wFs/s2140/dragon-cliffs-level-2-best-base-layout-coc.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-dragon-cliffs-level-2-layout-strong-capital-base-design-clash-of-clans.html","extra_json":"{\"game_group\": \"Clan Capital\", \"game_level\": \"CH2\", \"game_purpose\": \"Dragon Cliffs\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH2%3ACC%3A5%3AAAAAMwAAAAJjBGCthM7IhWO5AwTeI7n_\", \"game_year\": \"2026\", \"legacy_labels\": [\"CH2\", \"CH2-Dragon-Cliffs-lv2\"]}","content":"<p>Best Dragon Cliffs Level 2 Layout – Strong Capital Base Design (Clash of Clans) is shared for Clash of Clans players looking for a practical CH2 layout. Use the copy link to open the layout directly in game.</p><h2>CH2 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Capital Peak Level 4 Layout – Strong Defense Base Design","category":"Clan Capital","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgTeJFRPmpmVKAkWxA62zqHQDVWnYlKfLZPkoz_4f4QTaLtbb1-FjWYtGGQhkOStiXtfknSUasrhS6c-5CqoDjZG97d3KXSVAznQjA5P1w386zM6r0zn0tMgndNVxXfSakYOcFuP1q7pOey6X-HrMh0YBYqgDJCp_iF3uhyXQkZGkxqEBAlj2QlObl0U2Q/s2143/capital-peak-level-4-best-base-layout.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-capital-peak-level-4-layout-strong-defense-base-design.html","extra_json":"{\"game_group\": \"Clan Capital\", \"game_level\": \"CH4\", \"game_purpose\": \"Capital Peak\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH4%3ACC%3A0%3AAAAALwAAAAJkSgf5q1dqmWhchPam9ld1\", \"game_year\": \"2026\", \"legacy_labels\": [\"CH4\", \"CH4-Capital-peak-lv4\"]}","content":"<p>Best Capital Peak Level 4 Layout – Strong Defense Base Design is shared for Clash of Clans players looking for a practical CH4 layout. Use the copy link to open the layout directly in game.</p><h2>CH4 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Wizard Valley Level 2 Base Layout – Anti Ground Island Core","category":"Clan Capital","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgQ3dAYCXRAOVEUgsUVKuJj9m7Pv5SeU3LEpN0foOUcyD2Fv8RN5bctKnD8Hs-8vMMm4ZmyPkFy_GUqMv1NdDDfNBXyktKG1kO8DlzpKs2Qdlie5_36_Yy6n1FNuzCp3F-NZjs_K8E4EWg2p7BDvSYdD7INFx2Q63v9-F8192YNpsxTPVWgGFyClqaG7_g/s1600/wizard-valley-level-2-island-core-defense.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-wizard-valley-level-2-base-layout-anti-ground-island-core.html","extra_json":"{\"game_group\": \"Clan Capital\", \"game_level\": \"CH2\", \"game_purpose\": \"Wizard Valley\", \"game_style\": \"Original\", \"game_defense\": \"Anti Ground\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH2%3ACC%3A2%3AAAAALwAAAAJkSg_YSdv_Sutumo8M65FH\", \"game_year\": \"2026\", \"legacy_labels\": [\"CH2\", \"CH2-Wizard-Valley-lv2\"]}","content":"<p>Best Wizard Valley Level 2 Base Layout – Anti Ground Island Core is shared for Clash of Clans players looking for a practical CH2 layout. Use the copy link to open the layout directly in game.</p><h2>CH2 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Dragon Cliffs Level 1 Layout – Clash of Clans Capital Base Design","category":"Clan Capital","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEja2QAbpk9SHVe5gSohQo8S2q7sVWcn9PJ5vzciuIl9V6ITSzdTL3CgkatcufV2dP4VYyetAQJunUEJ3OLqa7rJSXXSL-gLNNJy-G_jcc64EHlkF2qO4zi3HqvExetKjnnf0Tflb99tcveB121G7i0-TCp6SiSiOPGffQT4X_XxH6s6iFphU1znaxAdR8E/s2143/dragon-cliffs-level-1-best-capital-layout-coc.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-dragon-cliffs-level-1-layout-clash-of-clans-capital-base-design.html","extra_json":"{\"game_group\": \"Clan Capital\", \"game_level\": \"CH1\", \"game_purpose\": \"Dragon Cliffs\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH1%3ACC%3A5%3AAAAAAQAAAAL1vTkiWejVcGLUVM9a2w3l\", \"game_year\": \"2026\", \"legacy_labels\": [\"CH1\", \"CH1-Dragon-Cliffs-lv1\"]}","content":"<p>Best Dragon Cliffs Level 1 Layout – Clash of Clans Capital Base Design is shared for Clash of Clans players looking for a practical CH1 layout. Use the copy link to open the layout directly in game.</p><h2>CH1 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Balloon Lagoon Level 1 Base Layout – Lake Island Split Core Anti Ram","category":"Clan Capital","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFq0Ra1wKSovbLSyRHqxBPr5XCaEXhJyzwrpZ2JiKqh87Q-kVujBsyNtfszziLjBYtFSIl-67LJrZBS5UHfXkl6NiGss2nnd04HqMc8qEvshCJw4Pb3jgJBMP07xJDPxxdYcoUlHeqVcI5Bd0DPeJerLOtIOpOmjT5Miu9_i9z4ATRhrmY0k8l_iscoFA/s1600/balloon-lagoon-level-1-island-core.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-balloon-lagoon-level-1-base-layout-lake-island-split-core-anti-ram.html","extra_json":"{\"game_group\": \"Clan Capital\", \"game_level\": \"CH1\", \"game_purpose\": \"Balloon Lagoon\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH1%3ACC%3A3%3AAAAALwAAAAJkShOHehzuU33iC3Qasbyx\", \"game_year\": \"2026\", \"legacy_labels\": [\"CH1\", \"CH1-Balloon-Lagoon-lv1\"]}","content":"<p>Best Balloon Lagoon Level 1 Base Layout – Lake Island Split Core Anti Ram is shared for Clash of Clans players looking for a practical CH1 layout. Use the copy link to open the layout directly in game.</p><h2>CH1 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Barbarian Camp Level 4 Anti Giant Split Lane Base (Clan Capital)","category":"Clan Capital","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjjO04NkBRqk-FRr4B3rkB7_mWq8wpWcBOYaqc1WHbYZ_mw6b-JC3W33CaIp6uPovIi1nUd0cyC4Myzj-5Jy2X1ZQQz_wIUWzvKVz-JWmiLtnpILi8n8Znu_Z2Og2uknomp2rysfW8YQi0WjOq1wXSfqXidmljAMak4WowSFDhC0ikOavmPzkm-s2Yrosg/s1600/best-barbarian-camp-level-4-anti-giant-split-defense.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-barbarian-camp-level-4-anti-giant-split-lane-base-clan-capital.html","extra_json":"{\"game_group\": \"Clan Capital\", \"game_level\": \"CH4\", \"game_purpose\": \"Barbarian Camp\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH4%3ACC%3A1%3AAAAAPwAAAAIxFif7Ib5dijiWl50J8LS8\", \"game_year\": \"2026\", \"legacy_labels\": [\"CH4\", \"CH4-Barbarian-camp-lv4\"]}","content":"<p>Best Barbarian Camp Level 4 Anti Giant Split Lane Base (Clan Capital) is shared for Clash of Clans players looking for a practical CH4 layout. Use the copy link to open the layout directly in game.</p><h2>CH4 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Goblin Mines Level 3 Water Island Defense Anti Flying Base Layout","category":"Clan Capital","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhE-ZrNPMGukrNhgzRtZu2pIF6A6jyhE7eqNSakpYC_n-JMeCgrtZhHIVKrUBIJAi62mc5tz2JA308D_3qZUq-VSB1_sXYtE2SK-X1gX3TK2cvaaqB7ZS9tBy9IpMOQTbhxwc8PhVBVpMWlL3ZZvIeGcPbMwq3q6VoD5V6tQKKO0FS8_94DX6bFH8Qd_S8/s1600/goblin-mines-level-3-water-island-air-denial-base.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-goblin-mines-level-3-water-island-defense-anti-flying-base-layout.html","extra_json":"{\"game_group\": \"Clan Capital\", \"game_level\": \"CH3\", \"game_purpose\": \"Goblin Mines\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH3%3ACC%3A8%3AAAAAJwAAAAI_z1_m4cbOy-XOjfFcVAa7\", \"game_year\": \"2026\", \"legacy_labels\": [\"CH3\", \"CH3-Goblin-mines-lv3\"]}","content":"<p>Best Goblin Mines Level 3 Water Island Defense Anti Flying Base Layout is shared for Clash of Clans players looking for a practical CH3 layout. Use the copy link to open the layout directly in game.</p><h2>CH3 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Capital Peak Level 9 Base Layout (Compact Meta)","category":"Clan Capital","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZX-hdsTPkHj0h6bZMf2ca_oIl8q1FO6boqEWlESH5l4UERitO2NVjUlqLZ5K4RzuKibCfxfksm1vvkbmqcl7xmI-lGqkFJIrFcjJDvxBIymu-ILtxwD-jSC8rFdjvEQFRV1oWiF_bXOLvDJKmFGEPlPQMtI-obroiA6oKmdvVgH2RxMXhmBLeq8GMYwk/s2038/best-capital-peak-level-9-compact-base.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-capital-peak-level-9-base-layout-compact-meta.html","extra_json":"{\"game_group\": \"Clan Capital\", \"game_level\": \"CH9\", \"game_purpose\": \"Capital Peak\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH9%3ACC%3A0%3AAAAAAQAAAAL1vGHCHfPqzqhxCN2540c0\", \"game_year\": \"2026\", \"legacy_labels\": [\"CH9\", \"CH9-Capital-peak-lv9\"]}","content":"<p>Best Capital Peak Level 9 Base Layout (Compact Meta) is shared for Clash of Clans players looking for a practical CH9 layout. Use the copy link to open the layout directly in game.</p><h2>CH9 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"},{"type":"game","title":"Best Barbarian Camp Level 3 Diamond Rail Defense Base (Anti Wizard Pathing)","category":"Clan Capital","image":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjeD3crrnK3dvL0ChVClalxKxraRGOkhEmXIyktUdY133kdcoiykJdZWECtOKZz5UlRZV2JAhd4KLc0J9nH0RzMn84YmGTYhfnU-WQGQUsDf6RPOqhM2k9YQkIoOPHLf6Zy0nWIBT2TrhEeEPCmiMsKAtImp4ftYHVhqwQPXpHPn1Efyf8vLKhbE9SEsCE/s1600/best-barbarian-camp-level-3-diamond-rail-defense.webp","rating":4.8,"views":0,"downloads":0,"demo_url":"/demo/game/clash-of-clans/base/best-barbarian-camp-level-3-diamond-rail-defense-base-anti-wizard-pathing.html","extra_json":"{\"game_group\": \"Clan Capital\", \"game_level\": \"CH3\", \"game_purpose\": \"Barbarian Camp\", \"game_style\": \"Original\", \"game_defense\": \"Balanced Defense\", \"copy_link\": \"https://link.clashofclans.com/en?action=OpenLayout&id=TH3%3ACC%3A1%3AAAAAAQAAAAL1vTMJgRmlscsmnjXUqL-5\", \"game_year\": \"2026\", \"legacy_labels\": [\"CH3\", \"CH3-Barbarian-camp-lv3\"]}","content":"<p>Best Barbarian Camp Level 3 Diamond Rail Defense Base (Anti Wizard Pathing) is shared for Clash of Clans players looking for a practical CH3 layout. Use the copy link to open the layout directly in game.</p><h2>CH3 base layout overview</h2><p>This page keeps the original base image and taxonomy while adding a concise desktop description for search visibility.</p>"}];
function nrGameExtra(post){try{return typeof post.extra_json==='string'?JSON.parse(post.extra_json||'{}'):(post.extra_json||{})}catch(e){return {}}}
function nrGamePosts(){const live=(SITE_DATA?.posts||[]).filter(x=>['game','base'].includes(String(x.type||'').toLowerCase())||nrGameExtra(x).game_group);return window.NR_DEMO_THEME==='game-1'?GAME_REAL_SAMPLE_POSTS:live}
function nrGameLevel(post){const e=nrGameExtra(post);return String(e.game_level||e.level||post.level||'TH18').toUpperCase()}
function nrGameArt(group,lv){const key=group.toUpperCase()+lv;if(GAME_CLASH_LEVEL_ART[key])return GAME_CLASH_LEVEL_ART[key];if(group==='bh')return GAME_CLASH_LEVEL_ART.BH10;if(group==='ch')return GAME_CLASH_LEVEL_ART.CH10;return GAME_CLASH_LEVEL_ART.TH18}
function nrGameLegacyMenu(prefix){const base=prefix||'';return `<details class="coc-more"><summary>More</summary><div class="coc-more-menu"><a href="${base}/bases?th=all">Town Hall</a><a href="${base}/bases?bh=all">Builder Hall</a><a href="${base}/bases?ch=all">Capital Hall</a><a href="#events">Events</a><a href="#rankings">Rankings</a><a href="#hero-skins">Hero Skins</a><a href="#about">About</a><a href="#privacy">Privacy</a><a href="#android-app">Android App</a><a href="#ios-app">iOS App</a></div></details>`}
function nrGameHeader(prefix,admin){const home=prefix||'/';return `<header class="coc-top"><div class="coc-wrap"><a class="coc-brand" href="${home}"><b>COC</b><span>BASE PORTAL</span></a><nav class="coc-main-menu"><a href="${home}">Home</a><a href="#news">News</a><a href="#find-source">Find Source</a><a href="#donate-center">Donate</a><a href="#saved">Saved</a>${nrGameLegacyMenu(prefix)}</nav>${admin?`<a class="coc-admin" href="${esc(admin)}" target="_blank" rel="noopener">+ Đăng base</a>`:''}</div></header>`}
function nrGameBaseCard(post){const e=nrGameExtra(post),level=nrGameLevel(post),href=post.demo_url||post.url||'#';return `<article class="coc-card"><a class="coc-thumb" href="${esc(href)}"><img src="${esc(post.image||nrGameArt(level.slice(0,2).toLowerCase(),Number(level.replace(/\D/g,''))))}" alt="${esc(post.title||level+' Base')}" loading="lazy" decoding="async"><span class="coc-level">${esc(level)}</span></a><div class="coc-card-body"><h3><a href="${esc(href)}">${esc(post.title||level+' Base Layout')}</a></h3><div class="coc-tags"><span>${esc(e.game_purpose||'Base')}</span><span>${esc(e.game_style||'Original')}</span><span>${esc(e.game_defense||'Balanced Defense')}</span></div></div></article>`}
function nrGameLevelCards(group,prefix){return GAME_LEVELS[group].slice().reverse().map(lv=>{const code=group.toUpperCase()+lv,href=`${prefix}/bases?${group}=${lv}`;return `<article class="coc-level-card"><a class="coc-level-art" href="${href}"><img src="${esc(nrGameArt(group,lv))}" alt="${code} Clash of Clans" loading="lazy" decoding="async"></a><h3><a href="${href}">${code}</a></h3></article>`}).join('')}
function nrGameFilterTypes(group){if(group==='th')return [['all','All'],['war','War'],['farming','Farming'],['hybrid','Hybrid'],['trophy','Trophy'],['legend','Legend'],['cwl','CWL'],['troll','Troll']];if(group==='bh')return [['all','All'],['anti air','Anti Air'],['anti ground','Anti Ground'],['anti baby dragon','Anti Baby Dragon'],['anti minion','Anti Minion'],['anti giant','Anti Giant'],['builder base','Builder Base']];return [['all','All'],['capital peak','Capital Peak'],['barbarian camp','Barbarian Camp'],['wizard valley','Wizard Valley'],['balloon lagoon','Balloon Lagoon'],['builders workshop','Builders Workshop'],['dragon cliffs','Dragon Cliffs'],['golem quarry','Golem Quarry'],['skeleton park','Skeleton Park'],['goblin mines','Goblin Mines']]}
function nrGameFilterState(){const params=new URLSearchParams(location.search),group=['th','bh','ch'].find(g=>params.has(g))||'th';return {group,level:params.get(group)||'all',type:params.get('type')||'all',year:params.get('year')||'all',sort:params.get('sort')||'latest'}}
function nrGameFilterUrl(prefix,state,changes={}){const n={...state,...changes};if(changes.group&&changes.group!==state.group){n.level='all';n.type='all'}const q=new URLSearchParams();q.set(n.group,n.level||'all');if(n.type&&n.type!=='all')q.set('type',n.type);if(n.year&&n.year!=='all')q.set('year',n.year);if(n.sort&&n.sort!=='latest')q.set('sort',n.sort);return `${prefix}/bases?${q.toString()}`}
function nrGameFilterPage(posts,prefix){const state=nrGameFilterState(),{group,level,type,year,sort}=state,groupName=group==='th'?'Town Hall':group==='bh'?'Builder Hall':'Clan Capital',types=nrGameFilterTypes(group),years=['all','2026','2025'];let arr=posts.filter(p=>{const e=nrGameExtra(p),g=String(e.game_group||p.category||'').toLowerCase(),lv=nrGameLevel(p).replace(/\D/g,''),pt=String(e.game_purpose||'').toLowerCase();return g.includes(group==='th'?'town hall':group==='bh'?'builder hall':'clan capital')&&(level==='all'||lv===level)&&(type==='all'||pt===type||pt.startsWith(type))&&(year==='all'||String(e.game_year||'2026')===year)});if(sort==='rating')arr.sort((a,b)=>Number(b.rating||0)-Number(a.rating||0));else if(sort==='download')arr.sort((a,b)=>Number(nrGameExtra(b).downloads||b.downloads||0)-Number(nrGameExtra(a).downloads||a.downloads||0));else if(sort==='view')arr.sort((a,b)=>Number(b.views||0)-Number(a.views||0));const link=(label,changes,active)=>`<a data-coc-filter="1" class="${active?'active':''}" href="${nrGameFilterUrl(prefix,state,changes)}">${label}</a>`;const levelBtns=['all',...GAME_LEVELS[group].map(String)].map(v=>link(v==='all'?'All':group.toUpperCase()+v,{level:v},v===level)).join('');return `<section class="coc-browser" data-coc-browser="1"><div class="coc-wrap"><div class="coc-browser-head"><div><small>COMMUNITY BASES</small><h1>${groupName} ${level==='all'?'':group.toUpperCase()+level} Base Layouts</h1><p>Chọn cấp nhà và tiêu chí. Kết quả thay đổi tức thì, không tải lại toàn trang.</p></div></div><div class="coc-filter-panel"><div class="coc-filter-row"><b>Group</b>${['th','bh','ch'].map(g=>link(g==='th'?'Town Hall':g==='bh'?'Builder Hall':'Clan Capital',{group:g},g===group)).join('')}</div><div class="coc-filter-row"><b>Level</b>${levelBtns}</div><div class="coc-filter-row"><b>${group==='ch'?'District':'Type'}</b>${types.map(([v,t])=>link(t,{type:v},v===type)).join('')}</div><div class="coc-filter-row"><b>Year</b>${years.map(v=>link(v==='all'?'All':v,{year:v},v===year)).join('')}</div><div class="coc-filter-row"><b>Sort</b>${[['latest','Latest'],['rating','Vote'],['download','Download'],['view','View']].map(([v,t])=>link(t,{sort:v},v===sort)).join('')}</div></div><div class="coc-result-meta"><b>${arr.length}</b> base phù hợp</div><div class="coc-grid coc-result-grid">${arr.length?arr.map(nrGameBaseCard).join(''):'<div class="coc-no-results">Chưa có base phù hợp bộ lọc này.</div>'}</div></div></section>`}
function nrGameBindFastFilters(posts,prefix){const browser=document.querySelector('[data-coc-browser="1"]');if(!browser)return;browser.addEventListener('click',e=>{const a=e.target.closest('a[data-coc-filter="1"]');if(!a)return;const u=new URL(a.href,location.origin);if(u.origin!==location.origin)return;e.preventDefault();history.pushState({cocFilter:1},'',u.pathname+u.search);const old=document.querySelector('[data-coc-browser="1"]');if(old)old.outerHTML=nrGameFilterPage(posts,prefix);nrGameBindFastFilters(posts,prefix);window.scrollTo({top:Math.max(0,(document.querySelector('[data-coc-browser="1"]')?.offsetTop||0)-90),behavior:'auto'});},{once:true})}
function nrGameDetail(post,prefix){const e=nrGameExtra(post),level=nrGameLevel(post),copy=e.copy_link||'#';return `<div class="coc-site">${nrGameHeader(prefix,'')}<main class="coc-detail coc-wrap"><div class="coc-breadcrumb"><a href="${prefix||'/'}">Home</a> / ${esc(level)} / ${esc(post.title||'Base')}</div><div class="coc-detail-grid"><article><img class="coc-detail-image" src="${esc(post.image||GAME_CLASH_LEVEL_ART[level]||GAME_CLASH_LEVEL_ART.TH18)}" alt="${esc(post.title||level+' Base Layout')}"><div class="coc-detail-copy"><div class="coc-tags"><span>${esc(level)}</span><span>${esc(e.game_purpose||'Base')}</span><span>${esc(e.game_style||'Original')}</span><span>${esc(e.game_defense||'Balanced Defense')}</span></div><h1>${esc(post.title||level+' Base Layout')}</h1><div class="coc-stats big"><span>⭐ ${Number(post.rating||4.8).toFixed(1)}</span><span>👁 ${Number(post.views||0).toLocaleString()}</span><span>⬇ ${Number(post.downloads||e.downloads||0).toLocaleString()}</span></div><div class="coc-article-body">${post.content||''}</div></div></article><aside class="coc-detail-side"><div class="coc-access-card"><small>BASE LINK</small><h3>${esc(level)} · ${esc(e.game_purpose||'Base')}</h3><a href="${esc(copy)}" target="_blank" rel="noopener">Copy Base Link</a></div></aside></div></main></div>`}
function renderGameClash1(site={}){const root=document.querySelector('main');if(!root)return;const posts=nrGamePosts(),isDemo=window.NR_DEMO_THEME==='game-1',prefix=isDemo?(window.NR_DEMO_PREFIX||'/demo/game/clash-of-clans'):'',rel=isDemo&&location.pathname.startsWith(prefix)?(location.pathname.slice(prefix.length)||'/'):location.pathname,admin=isDemo?nrDemoAdminUrl('game-1','newpost'):'/admin?tab=newpost';if(/^\/base\/[^/]+\.html$/i.test(rel)){const slug=rel.split('/').pop().replace(/\.html$/i,''),post=posts.find(p=>String(p.demo_url||p.url||'').includes('/'+slug+'.html'))||posts[0];if(post){root.innerHTML=nrGameDetail(post,prefix);return}}if(/^\/(bases|free-bases|premium-bases)/i.test(rel)){if(/\/(free|premium)-bases/i.test(rel))history.replaceState({},'',`${prefix}/bases${location.search||'?th=all'}`);root.innerHTML=`<div class="coc-site">${nrGameHeader(prefix,admin)}${nrGameFilterPage(posts,prefix)}<footer class="coc-footer"><div class="coc-wrap"><b>COC BASE PORTAL</b><span>Community Clash of Clans base sharing</span></div></footer></div>`;nrGameBindFastFilters(posts,prefix);if(!window.__NR_COC_POPSTATE__){window.__NR_COC_POPSTATE__=1;window.addEventListener('popstate',()=>{const b=document.querySelector('[data-coc-browser="1"]');if(b){b.outerHTML=nrGameFilterPage(posts,prefix);nrGameBindFastFilters(posts,prefix)}})}return}root.innerHTML=`<div class="coc-site">${nrGameHeader(prefix,admin)}<section class="coc-hero"><div class="coc-wrap coc-hero-grid"><div><span class="coc-kicker">CLASH OF CLANS · COMMUNITY BASE LAYOUTS</span><h1>Choose your Hall.<br><em>Find a base fast.</em></h1><p>Kho chia sẻ base Clash of Clans miễn phí cho cộng đồng. Trang chủ chỉ chọn cấp nhà; bộ lọc chi tiết mở sau khi bạn chọn TH, BH hoặc CH.</p><div class="coc-proof"><span><b>TH2–TH18</b><small>Town Hall</small></span><span><b>BH2–BH10</b><small>Builder Hall</small></span><span><b>CH1–CH10</b><small>Clan Capital</small></span></div></div><div class="coc-hero-art"><img src="${GAME_CLASH_LEVEL_ART.TH18}" alt="TH18"><div><b>Choose Hall Level</b><span>Fast filters · Direct copy link</span></div></div></div></section><section id="town-hall" class="coc-section" data-structure-key="town-hall"><div class="coc-wrap"><div class="coc-heading"><div><span>TOWN HALL</span><h2>Choose Town Hall</h2></div></div><div class="coc-level-grid" data-contract-grid="1">${nrGameLevelCards('th',prefix)}</div></div></section><section id="builder-hall" class="coc-section coc-dark" data-structure-key="builder-hall"><div class="coc-wrap"><div class="coc-heading light"><div><span>BUILDER BASE</span><h2>Choose Builder Hall</h2></div></div><div class="coc-level-grid" data-contract-grid="1">${nrGameLevelCards('bh',prefix)}</div></div></section><section id="clan-capital" class="coc-section" data-structure-key="clan-capital"><div class="coc-wrap"><div class="coc-heading"><div><span>CLAN CAPITAL</span><h2>Choose Capital Hall</h2></div></div><div class="coc-level-grid" data-contract-grid="1">${nrGameLevelCards('ch',prefix)}</div></div></section><footer class="coc-footer"><div class="coc-wrap"><b>COC BASE PORTAL</b><span>Community Clash of Clans base sharing</span></div></footer></div>`;try{nrApplyStructureGeometry(site,'game-1');nrAuditStructureContract(site,'game-1')}catch(e){}}

const NR_SERVICE_PROVIDERS={
 'dich-vu-1':{
  preset:'service_fpt_1',provider:'FPT Telecom',brand:'FPT',brand2:'TELECOM',kicker:'INTERNET FPT · FPT PLAY · CAMERA AI',
  hero:'Internet nhanh. Giải trí trọn vẹn. Camera an tâm.',heroText:'Mẫu website dành cho đại lý và đơn vị tư vấn dịch vụ FPT Telecom, tập trung gói cước rõ ràng và CTA đăng ký nhanh.',
  visual:[['INTERNET','1 Gbps','Wi-Fi 6'],['FPT PLAY','4K','Giải trí gia đình'],['CAMERA AI','24/7','Cloud an toàn'],['HỖ TRỢ','24h','Tư vấn lắp đặt']],
  cats:['Internet FPT','Truyền hình FPT','Camera FPT','Combo FPT'],
  labels:['Internet FPT nổi bật','FPT Play & truyền hình','Camera AI FPT','Combo FPT tiết kiệm'],
  subs:['INTERNET FPT','FPT PLAY','CAMERA AI','COMBO FPT'],
  samples:[
   ['Internet FPT','Internet Giga F1','300 Mbps','205.000đ/tháng','Modem Wi-Fi 6 + 1 Access Point, phù hợp gia đình ít tầng.'],
   ['Internet FPT','Internet Sky F1','1 Gbps / 300 Mbps','210.000đ/tháng','Internet tốc độ cao, Wi-Fi 6 + 1 Access Point, phù hợp nhiều thiết bị.'],
   ['Internet FPT','Internet Meta','1 Gbps / 1 Gbps','339.000đ/tháng','Băng thông đối xứng cao cho gia đình có nhu cầu tải lên lớn.'],
   ['Internet FPT','Wi-Fi 360','500 Mbps','230.000đ/tháng','Internet + Wi-Fi Mesh, ưu tiên phủ sóng nhà nhiều phòng/tầng.'],
   ['Internet FPT','F-Game','Đến 1 Gbps','235.000đ/tháng','Tích hợp Ultra Fast, hướng đến game thủ và nhu cầu độ trễ thấp.'],
   ['Internet FPT','Combo Lux 500 Internet','500 Mbps','830.000đ/tháng','Gói hiệu năng cao, nhiều thiết bị kết nối đồng thời.'],
   ['Truyền hình FPT','Combo Giga - V.VIP','300/300 Mbps','220.000đ/tháng','Internet + FPT Play, gần 120 kênh và nội dung thể thao/giải trí.'],
   ['Truyền hình FPT','Combo Sky - V.VIP','1 Gbps / 300 Mbps','239.000đ/tháng','Internet tốc độ cao kết hợp FPT Play cho gia đình.'],
   ['Truyền hình FPT','Combo Meta - V.VIP','1 Gbps / 1 Gbps','339.000đ/tháng','Internet đối xứng + FPT Play, phù hợp nhiều thiết bị.'],
   ['Truyền hình FPT','Combo Lux 500 - V.VIP','500/500 Mbps','830.000đ/tháng','FPT Play + Internet hiệu năng cao, nhiều thiết bị.'],
   ['Truyền hình FPT','Combo Lux 800 - V.VIP','800/800 Mbps','1.030.000đ/tháng','Gói cao cấp, tối ưu tốc độ và trải nghiệm giải trí.'],
   ['Truyền hình FPT','Triple GigaEyes3 Play4 - FPT Play','300 Mbps','270.000đ/tháng','Internet + FPT Play Box + Camera Play4 + Cloud.'],
   ['Camera FPT','Camera Play 4','Camera AI','Từ 500.000đ','Camera trong nhà, quản lý tập trung qua hệ sinh thái FPT Life.','https://hi-static.fpt.vn/sys/shop/prod/2025-04-08/67f4b9178361d_mien-phi-camera-khi-dang-ky-internet-thang-4.jpg'],
   ['Camera FPT','Camera IQ4S','Camera AI','Từ 500.000đ','Camera ngoài trời, giám sát và xem lại qua Cloud.','https://hi-static.fpt.vn/sys/shop/prod/2025-04-08/67f4b9178361d_mien-phi-camera-khi-dang-ky-internet-thang-4.jpg'],
   ['Camera FPT','Combo 2 Camera Play 4','2 camera','Từ 1.000.000đ','Bộ 2 camera cho nhà ở/cửa hàng cần nhiều góc quan sát.','https://hi-static.fpt.vn/sys/shop/prod/2025-04-08/67f4b9178361d_mien-phi-camera-khi-dang-ky-internet-thang-4.jpg'],
   ['Camera FPT','Combo 3 Camera IQ4S','3 camera','Từ 1.500.000đ','Bộ camera ngoài trời cho nhiều vị trí giám sát.','https://hi-static.fpt.vn/sys/shop/prod/2025-04-08/67f4b9178361d_mien-phi-camera-khi-dang-ky-internet-thang-4.jpg'],
   ['Camera FPT','Giga An Tâm 7 - Play 4','300/300 Mbps','220.000đ/tháng','Internet + Camera Play 4 + Cloud An Tâm 7 ngày.','https://hi-static.fpt.vn/sys/shop/prod/2025-04-08/67f4b9178361d_mien-phi-camera-khi-dang-ky-internet-thang-4.jpg'],
   ['Camera FPT','Sky An Tâm 7 - IQ4S','1 Gbps / 300 Mbps','235.000đ/tháng','Internet tốc độ cao + Camera IQ4S + Cloud 7 ngày.','https://hi-static.fpt.vn/sys/shop/prod/2025-04-08/67f4b9178361d_mien-phi-camera-khi-dang-ky-internet-thang-4.jpg'],
   ['Combo FPT','Triple Sky - Camera Play 4','1 Gbps / 300 Mbps','Từ 205.000đ/tháng','Internet + gần 120 kênh truyền hình + Camera Play 4.'],
   ['Combo FPT','Sky F1 An Tâm 7 - Play 4','1 Gbps / 300 Mbps','230.000đ/tháng','Wi-Fi 6 + Access Point + Camera Play 4 + Cloud 7.'],
   ['Combo FPT','Sky F2 An Tâm 7 - Play 4','1 Gbps / 300 Mbps','260.000đ/tháng','02 Access Point + Camera Play 4 cho nhà nhiều tầng.'],
   ['Combo FPT','Combo Giga - V.VIP + Camera','300/300 Mbps','220.000đ/tháng','Internet + FPT Play + ưu đãi Camera/Cloud theo chương trình.'],
   ['Combo FPT','Combo Sky - V.VIP + Camera','1 Gbps / 300 Mbps','239.000đ/tháng','Internet + FPT Play + Camera/Cloud theo điều kiện ưu đãi.'],
   ['Combo FPT','Triple GigaEyes3 IQ4S - FPT Play','300 Mbps','Liên hệ','Internet + FPT Play + Camera IQ4S cho gia đình/cửa hàng.']
  ]
 },
 'dich-vu-2':{
  preset:'service_vnpt_2',provider:'VNPT',brand:'VNPT',brand2:'HOME',kicker:'HOME INTERNET · MYTV · HOME CAM',
  hero:'Kết nối số cho gia đình. Một hệ sinh thái, nhiều tiện ích.',heroText:'Mẫu website dịch vụ VNPT với Home Internet, MyTV và Home Cam, tối ưu cho tư vấn gói cước theo nhu cầu gia đình.',
  visual:[['HOME INTERNET','~1 Gbps','Fiber tốc độ cao'],['MYTV','180+','Kênh & nội dung'],['HOME CAM','Cloud 7','Quan sát an ninh'],['TỔNG ĐÀI','18001166','Internet / MyTV']],
  cats:['Internet VNPT','Truyền hình MyTV','Camera VNPT','Combo VNPT'],
  labels:['Home Internet nổi bật','MyTV cho gia đình','Home Cam & Camera','Combo VNPT'],
  subs:['VNPT INTERNET','MYTV','HOME CAM','HOME COMBO'],
  samples:[
   ['Internet VNPT','Home 1','300 Mbps','Liên hệ theo khu vực','Internet gia đình, hỗ trợ nâng cấp XGSPON và thiết bị theo chính sách.'],
   ['Internet VNPT','Home 2','500 Mbps','Liên hệ theo khu vực','Internet 500 Mbps, phù hợp gia đình nhiều thiết bị.'],
   ['Internet VNPT','Home 3','~1 Gbps','Liên hệ theo khu vực','Internet tốc độ cao cho nhu cầu giải trí/làm việc nặng.'],
   ['Internet VNPT','Home 2 (Mesh)','500 Mbps','Liên hệ','Internet + Wi-Fi Mesh 6 cho vùng phủ rộng.'],
   ['Internet VNPT','Home 3 (2 Mesh)','~1 Gbps','Liên hệ','Internet tốc độ cao + 2 Wi-Fi Mesh 6 cho nhà nhiều tầng.'],
   ['Internet VNPT','HomeX','2500 Mbps','990.000đ/tháng','Internet XGSPON 2.5Gbps + Wi-Fi Mesh 6, gói hiệu năng cao.'],
   ['Truyền hình MyTV','HomeTV 1 (Mesh)','300 Mbps + MyTV','Liên hệ','Internet + MyTV App + Wi-Fi Mesh 6.','https://media-vnpt.vnptvas.vn/Media/Images/upload_images/images/202605/img_vm_2605291842257354.jpg?mode=crop&w=700'],
   ['Truyền hình MyTV','HomeTV 2 (Mesh)','500 Mbps + MyTV','250.000đ/tháng','Internet 500 Mbps + MyTV + 1 Wi-Fi Mesh 6.','https://media-vnpt.vnptvas.vn/Media/Images/upload_images/images/202605/img_vm_2605291842257354.jpg?mode=crop&w=700'],
   ['Truyền hình MyTV','HomeTV 2 (2 Mesh)','500 Mbps + MyTV','265.000đ/tháng','Internet 500 Mbps + MyTV + 2 Wi-Fi Mesh 6.','https://media-vnpt.vnptvas.vn/Media/Images/upload_images/images/202605/img_vm_2605291842257354.jpg?mode=crop&w=700'],
   ['Truyền hình MyTV','HomeTV 3','~1 Gbps + MyTV','310.000đ/tháng','Internet ~1Gbps + MyTV App.','https://media-vnpt.vnptvas.vn/Media/Images/upload_images/images/202605/img_vm_2605291839585263.jpg?mode=crop&w=700'],
   ['Truyền hình MyTV','HomeTV 3 (2 Mesh)','~1 Gbps + MyTV','355.000đ/tháng','Internet ~1Gbps + MyTV + 2 Wi-Fi Mesh 6.','https://media-vnpt.vnptvas.vn/Media/Images/upload_images/images/202605/img_vm_2605291844449089.jpg?mode=crop&w=700'],
   ['Truyền hình MyTV','HomeTV VIP1 (Mesh)','300 Mbps + MyTV VIP','270.000đ/tháng','Internet + MyTV VIP + Wi-Fi Mesh 6.','https://media-vnpt.vnptvas.vn/Media/Images/upload_images/images/202605/img_vm_2605291842257354.jpg?mode=crop&w=700'],
   ['Camera VNPT','Home Cam 1','300 Mbps + Camera','250.000đ/tháng','Internet 300 Mbps + Camera Indoor + Cloud 7 + Wi-Fi Mesh 5/6.'],
   ['Camera VNPT','Home Cam 2','500 Mbps + Camera','Liên hệ','Internet 500 Mbps kết hợp Camera và Cloud.'],
   ['Camera VNPT','Home Cam 3','~1 Gbps + Camera','Liên hệ','Internet tốc độ cao + Camera + Wi-Fi Mesh.'],
   ['Camera VNPT','Camera Indoor + Cloud 7','Camera Cloud','Liên hệ','Giải pháp camera trong nhà, lưu trữ Cloud 7 ngày.'],
   ['Camera VNPT','Internet + Camera cho cửa hàng','Theo hạ tầng','Liên hệ','Gói tư vấn Internet và Camera cho cửa hàng nhỏ.'],
   ['Camera VNPT','Home Camera + Wi-Fi Mesh','Internet + Camera','Liên hệ','Kết hợp vùng phủ Wi-Fi và giám sát an ninh.'],
   ['Combo VNPT','HomeTV 2 + Mesh','500 Mbps','250.000đ/tháng','Internet + MyTV + Mesh cho gia đình.','https://media-vnpt.vnptvas.vn/Media/Images/upload_images/images/202605/img_vm_2605291842257354.jpg?mode=crop&w=700'],
   ['Combo VNPT','HomeTV 3 + 2 Mesh','~1 Gbps','355.000đ/tháng','Internet + MyTV + 2 Mesh cho nhà nhiều tầng.','https://media-vnpt.vnptvas.vn/Media/Images/upload_images/images/202605/img_vm_2605291844449089.jpg?mode=crop&w=700'],
   ['Combo VNPT','HomeTV VIP1','300 Mbps','270.000đ/tháng','Internet + MyTV VIP + Mesh.'],
   ['Combo VNPT','Home Cam 1','300 Mbps','250.000đ/tháng','Internet + Camera Indoor + Cloud 7 + Mesh.'],
   ['Combo VNPT','HomeX + MyTV','2500 Mbps','990.000đ/tháng','XGSPON 2.5Gbps + MyTV + Mesh 6.'],
   ['Combo VNPT','Home Internet + MyTV + Camera','Theo nhu cầu','Liên hệ','Combo 3 dịch vụ, tư vấn theo hạ tầng và khu vực.']
  ]
 },
 'dich-vu-3':{
  preset:'service_viettel_3',provider:'Viettel Telecom',brand:'VIETTEL',brand2:'HOME',kicker:'INTERNET · TV360 · CAMERA CLOUD',
  hero:'Wi-Fi mạnh cho mọi phòng. TV360 trọn giải trí. Camera luôn an tâm.',heroText:'Mẫu website dịch vụ Viettel Telecom theo phong cách mạnh, gọn và chuyển đổi nhanh cho Internet, TV360 và Camera.',
  visual:[['INTERNET','1 Gbps','Wi-Fi 6'],['TV360','World Cup','Giải trí thể thao'],['CAMERA','Cloud','Theo dõi 24/7'],['HỖ TRỢ','24/7','Sau bán online']],
  cats:['Internet Viettel','Truyền hình TV360','Camera Viettel','Combo Viettel'],
  labels:['Internet Viettel','Truyền hình TV360','Camera Viettel','Combo Internet + TV360'],
  subs:['INTERNET VIETTEL','TV360','CAMERA CLOUD','COMBO VIETTEL'],
  samples:[
   ['Internet Viettel','NETVT1_H','Tốc độ cao','Liên hệ theo khu vực','Internet gia đình, modem Wi-Fi thế hệ mới theo chính sách.'],
   ['Internet Viettel','NETVT2_H','500 Mbps - 1 Gbps','265.000đ/tháng','Modem Wi-Fi 6, phù hợp 10–15 thiết bị, hỗ trợ XGSPON nơi sẵn sàng.'],
   ['Internet Viettel','Internet Wi-Fi 6 gia đình','Đến 1 Gbps','Liên hệ','Internet cáp quang tốc độ cao, tư vấn theo hạ tầng khu vực.'],
   ['Internet Viettel','Internet nhà nhiều tầng','Wi-Fi 6 / Mesh','Liên hệ','Giải pháp vùng phủ cho nhà nhiều phòng và nhiều thiết bị.'],
   ['Internet Viettel','Internet doanh nghiệp nhỏ','Theo hạ tầng','Liên hệ','Kết nối ổn định cho cửa hàng/văn phòng nhỏ.'],
   ['Internet Viettel','Internet XGSPON','Đến 1 Gbps+','Liên hệ','Nâng cấp công nghệ tại khu vực sẵn sàng hạ tầng.'],
   ['Truyền hình TV360','TV360 World Cup - Ngày','Đa thiết bị','2.000đ/ngày','Xem World Cup 2026 và nhóm kênh truyền hình.','https://media.vietteltelecom.vn/upload/ckfinder/images/20_1%281%29.png'],
   ['Truyền hình TV360','TV360 World Cup - Tháng','Đa thiết bị','15.000đ/tháng','Gói World Cup linh hoạt theo tháng.','https://media.vietteltelecom.vn/upload/ckfinder/images/20_1%281%29.png'],
   ['Truyền hình TV360','TV360 Vsport','Mobile / Laptop','35.000đ/30 ngày','World Cup 2026, 120+ kênh và các giải thể thao.','https://media.vietteltelecom.vn/upload/ckfinder/images/20_1%281%29.png'],
   ['Truyền hình TV360','TV360 Standard','Đa thiết bị','60.000đ/30 ngày','130+ kênh, phim và thể thao, xem đồng thời 2 thiết bị.','https://media.vietteltelecom.vn/upload/ckfinder/images/20_1%281%29.png'],
   ['Truyền hình TV360','TV360 VIP','Đa thiết bị','80.000đ/30 ngày','World Cup, F1, 130+ kênh và kho phim.','https://media.vietteltelecom.vn/upload/ckfinder/images/20_1%281%29.png'],
   ['Truyền hình TV360','TV360 Standard 12 tháng','Đa thiết bị','625.000đ/360 ngày','Gói dài hạn cho nhu cầu giải trí gia đình.','https://media.vietteltelecom.vn/upload/ckfinder/images/20_1%281%29.png'],
   ['Camera Viettel','Home Camera AI','AI xoay 360°','Liên hệ','Camera gia đình với AI, lưu Cloud và đàm thoại hai chiều.','https://media.vietteltelecom.vn/upload/ckfinder/images/87_ab.jpg'],
   ['Camera Viettel','Camera + Cloud 01 ngày','Cloud','Theo gói','Giải pháp camera và lưu trữ Cloud cho gia đình.','https://media.vietteltelecom.vn/upload/ckfinder/images/87_ab.jpg'],
   ['Camera Viettel','Camera gia đình 24/7','Giám sát','Liên hệ','Theo dõi từ xa, phù hợp nhà ở/cửa hàng.','https://media.vietteltelecom.vn/upload/ckfinder/images/87_ab.jpg'],
   ['Camera Viettel','Combo 2 Camera','2 thiết bị','Liên hệ','Nhiều góc quan sát cho nhà/cửa hàng.','https://media.vietteltelecom.vn/upload/ckfinder/images/87_ab.jpg'],
   ['Camera Viettel','Internet + Camera','Wi-Fi 6 + Camera','Liên hệ','Kết hợp đường truyền và an ninh trong một gói.','https://media.vietteltelecom.vn/upload/ckfinder/images/87_ab.jpg'],
   ['Camera Viettel','Camera Cloud cho cửa hàng','Cloud','Liên hệ','Giám sát cửa hàng và lưu trữ trực tuyến.','https://media.vietteltelecom.vn/upload/ckfinder/images/87_ab.jpg'],
   ['Combo Viettel','Internet + TV360 Giải trí App','Đến 1 Gbps','Từ 215.000đ/tháng','Wi-Fi 6 + TV360, ưu đãi Camera/Cloud theo điều kiện.'],
   ['Combo Viettel','Internet + TV360 Giải trí Box','Đến 1 Gbps','Từ 235.000đ/tháng','Wi-Fi 6 + Android Box TV360 + nội dung giải trí.'],
   ['Combo Viettel','Internet + TV360 Đẳng cấp App','Đến 1 Gbps','Từ 245.000đ/tháng','130+ kênh, thể thao cao cấp và Internet tốc độ cao.'],
   ['Combo Viettel','Internet + TV360 Đẳng cấp Box','Đến 1 Gbps','Từ 275.000đ/tháng','Android Box + TV360 Đẳng cấp + Internet Wi-Fi 6.'],
   ['Combo Viettel','Internet + TV360 + Camera','Đến 1 Gbps','Liên hệ','Combo kết nối, giải trí và an ninh cho gia đình.'],
   ['Combo Viettel','Internet + Camera Cloud','Wi-Fi 6 + Camera','Liên hệ','Gói Internet kết hợp Camera/Cloud, tư vấn theo khu vực.']
  ]
 },
 'dich-vu-4':{
  preset:'service_camera_store_4',provider:'Camera Store',brand:'CAMERA',brand2:'STORE',kicker:'CAMERA AN NINH · ĐA THƯƠNG HIỆU',
  hero:'Camera đúng nhu cầu. Xem rõ trước khi chọn.',heroText:'Mẫu website trưng bày camera cho cửa hàng, đại lý và đơn vị lắp đặt: có ảnh sản phẩm, giá, thông số, khuyến mãi và tư vấn nhanh.',
  visual:[['THƯƠNG HIỆU','6+','IMOU · EZVIZ · TAPO'],['SẢN PHẨM','24','Mẫu demo có sẵn'],['TƯ VẤN','1:1','Theo nhu cầu lắp đặt'],['BẢO HÀNH','12–24T','Tùy sản phẩm']],
  cats:['Camera Wi-Fi trong nhà','Camera ngoài trời','Camera AI quay quét','Camera IP & bộ giám sát'],
  labels:['Camera trong nhà dễ lắp','Camera ngoài trời bền bỉ','Camera AI quay quét thông minh','Camera IP & bộ giám sát chuyên dụng'],
  subs:['CAMERA TRONG NHÀ','CAMERA NGOÀI TRỜI','CAMERA AI','CAMERA IP / POE'],
  samples:[
   ['Camera Wi-Fi trong nhà','Tapo C200','1080p · quay quét 360°','399.000đ','Camera Wi-Fi trong nhà, đàm thoại hai chiều, theo dõi chuyển động và lưu thẻ nhớ.','https://static.tp-link.com/upload/image-line/01_normal_20230817224004g.jpg'],
   ['Camera Wi-Fi trong nhà','Tapo C210','3MP · 2K','469.000đ','Camera quay quét độ phân giải cao, phù hợp phòng khách, cửa hàng nhỏ và theo dõi thú cưng.','https://static.tp-link.com/upload/image-line/01_normal_20230817224004g.jpg'],
   ['Camera Wi-Fi trong nhà','EZVIZ H6c','1080p · 360°','499.000đ','Camera nhà thông minh có theo dõi chuyển động, đàm thoại hai chiều và lưu trữ linh hoạt.','https://mfs.ezvizlife.com/30641be87a5f77e69e993bfce0059448.jpg'],
   ['Camera Wi-Fi trong nhà','IMOU Ranger 2 3MP','3MP · quay quét','489.000đ','Camera trong nhà hỗ trợ phát hiện người, smart tracking, night vision và chế độ riêng tư.','https://static-website.imou.com/5ea45542-a2fa-4c66-afdb-7cba6126041f.png'],
   ['Camera Wi-Fi trong nhà','IMOU Ranger 2C 4MP','4MP · 2.5K','599.000đ','Mẫu quay quét nhỏ gọn, phù hợp căn hộ, văn phòng và cửa hàng.','https://store.imou.com/cdn/shop/files/ranger-2c-5mp4mp3mp-uk-643678.jpg?v=1750840838&width=1000'],
   ['Camera Wi-Fi trong nhà','EZVIZ C6N','2MP · quay quét','459.000đ','Camera Wi-Fi phổ biến cho gia đình, xem từ xa, theo dõi chuyển động và đàm thoại.','https://mfs.ezvizlife.com/30641be87a5f77e69e993bfce0059448.jpg'],
   ['Camera ngoài trời','Tapo C320WS','2K QHD · IP66','899.000đ','Camera ngoài trời Starlight, hình màu ban đêm và kết nối Wi-Fi hoặc LAN.','https://static.tp-link.com/upload/image-line/Tapo_C320WS_Tapo_C320WSP2_EU_2_thumb_20231019030651t.png'],
   ['Camera ngoài trời','Tapo C325WB','2K QHD · ColorPro','1.390.000đ','Camera ngoài trời độ nhạy sáng cao, ưu tiên hình màu trong điều kiện thiếu sáng.','https://static.tp-link.com/upload/image-line/Tapo_C320WS_Tapo_C320WSP2_EU_2_thumb_20231019030651t.png'],
   ['Camera ngoài trời','EZVIZ H8c','1080p · quay quét 360°','799.000đ','Camera ngoài trời quay quét, phát hiện người AI, theo dõi tự động và cảnh báo chủ động.','https://mfs.ezvizlife.com/df6b54ca5abd887d3ea08a487fce96a0.jpg'],
   ['Camera ngoài trời','IMOU Cruiser SE+ 5MP','5MP · IP66','1.090.000đ','Camera ngoài trời quay quét, lưu thẻ nhớ/NVR/Cloud và giám sát từ xa.','https://static-website.imou.com/4436d7ea-7d60-4115-afa6-4f808bbdbb23.jpg'],
   ['Camera ngoài trời','IMOU Bullet 2E','4MP · Wi-Fi','790.000đ','Camera thân ngoài trời, phù hợp cổng nhà, sân, kho nhỏ và mặt tiền cửa hàng.','https://static-website.imou.com/4436d7ea-7d60-4115-afa6-4f808bbdbb23.jpg'],
   ['Camera ngoài trời','EZVIZ H3c Color','2K · Full Color','990.000đ','Camera thân ngoài trời, quan sát màu ban đêm và cảnh báo thông minh.','https://mfs.ezvizlife.com/df6b54ca5abd887d3ea08a487fce96a0.jpg'],
   ['Camera AI quay quét','Tapo C220','2K QHD · AI','649.000đ','Quay quét trong nhà với phát hiện thông minh, theo dõi chuyển động và lưu trữ linh hoạt.','https://static.tp-link.com/upload/image-line/01_normal_20230817224004g.jpg'],
   ['Camera AI quay quét','Tapo C225','2K QHD · AI nâng cao','1.090.000đ','Camera quay quét AI cho gia đình cần nhận diện và cảnh báo chi tiết hơn.','https://static.tp-link.com/upload/image-line/01_normal_20230817224004g.jpg'],
   ['Camera AI quay quét','EZVIZ H9c Dual','2K + 2K · 2 ống kính','1.690.000đ','Camera hai ống kính cho vùng quan sát rộng, theo dõi thông minh và giám sát ngoài trời.','https://mfs.ezvizlife.com/df6b54ca5abd887d3ea08a487fce96a0.jpg'],
   ['Camera AI quay quét','IMOU Ranger Dual','2 ống kính · AI','1.290.000đ','Camera trong nhà hai mắt, hỗ trợ theo dõi nhiều vùng quan sát trong cùng không gian.','https://static-website.imou.com/5ea45542-a2fa-4c66-afdb-7cba6126041f.png'],
   ['Camera AI quay quét','IMOU Rex VT','5MP · AI','1.190.000đ','Camera quay quét độ phân giải cao, phù hợp gia đình và cửa hàng cần chi tiết hình ảnh.','https://static-website.imou.com/5ea45542-a2fa-4c66-afdb-7cba6126041f.png'],
   ['Camera AI quay quét','EZVIZ H6c Pro 3K','3K · quay quét','1.090.000đ','Camera nhà thông minh độ phân giải cao, giảm điểm mù và theo dõi tự động.','https://mfs.ezvizlife.com/30641be87a5f77e69e993bfce0059448.jpg'],
   ['Camera IP & bộ giám sát','Hikvision ColorVu 4MP','4MP · Full Color','1.350.000đ','Camera IP dòng ColorVu cho nhu cầu hình màu ban đêm và hệ thống NVR chuyên dụng.','/assets/camera-store/pro.svg'],
   ['Camera IP & bộ giám sát','Hikvision AcuSense 4MP','4MP · AI','1.590.000đ','Camera IP AI phân loại đối tượng, phù hợp nhà xưởng và văn phòng.','/assets/camera-store/pro.svg'],
   ['Camera IP & bộ giám sát','Dahua WizSense 4MP','4MP · AI','1.290.000đ','Camera IP dòng AI cho hệ thống giám sát nhiều điểm, hỗ trợ đầu ghi NVR.','/assets/camera-store/pro.svg'],
   ['Camera IP & bộ giám sát','Dahua Full-Color 4MP','4MP · Full Color','1.490.000đ','Camera IP màu ban đêm dành cho sân, kho, cửa hàng và mặt tiền.','/assets/camera-store/pro.svg'],
   ['Camera IP & bộ giám sát','KBVision AI 4MP','4MP · AI','1.190.000đ','Camera IP cho hệ thống giám sát chuyên dụng, phù hợp cửa hàng và doanh nghiệp nhỏ.','/assets/camera-store/pro.svg'],
   ['Camera IP & bộ giám sát','Bộ NVR 8 kênh + 4 Camera PoE','4 camera · NVR 8 kênh','6.990.000đ','Bộ giải pháp mẫu gồm đầu ghi NVR, camera PoE và ổ cứng; cấu hình thực tế tùy công trình.','/assets/camera-store/pro.svg']
  ]
 }
};
function nrServiceIsShowroom(key){return String(window.NR_DEMO_THEME||'')===key&&!window.NR_TRIAL_TOKEN&&new URLSearchParams(location.search).get('nr_client')!=='1'&&new URLSearchParams(location.search).get('nr_samples')!=='0'}
function nrSvcImg(i,kind='net'){
 const imgs={net:['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=82'],tv:['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=900&q=82'],cam:['https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=900&q=82'],combo:['https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=82','https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=82']};return (imgs[kind]||imgs.net)[i%3]
}
function nrSvcFallback(key,category=''){
 const cfg=NR_SERVICE_PROVIDERS[key]||{};
 const idx=Math.max(0,(cfg.cats||[]).indexOf(category));
 if(key==='dich-vu-4')return ['/assets/camera-store/indoor.svg','/assets/camera-store/outdoor.svg','/assets/camera-store/ai.svg','/assets/camera-store/pro.svg'][idx]||'/assets/camera-store/indoor.svg';
 const brand=key==='dich-vu-1'?'fpt':key==='dich-vu-2'?'vnpt':'viettel';
 const kind=['net','tv','cam','combo'][idx]||'net';
 return `/assets/telecom-demo/${brand}-${kind}.webp`;
}
function nrSvcDemoPrice(key,index,raw=''){
 const value=String(raw||'').trim();
 if(value&&!/liên hệ|theo gói|theo nhu cầu/i.test(value)) return value;
 const group=Math.floor(index/6);
 const fallback={
  'dich-vu-1':['205.000đ/tháng*','220.000đ/tháng*','500.000đ/thiết bị*','220.000đ/tháng*'],
  'dich-vu-2':['180.000đ/tháng*','220.000đ/tháng*','250.000đ/tháng*','250.000đ/tháng*'],
  'dich-vu-3':['180.000đ/tháng*','35.000đ/30 ngày*','500.000đ/thiết bị*','215.000đ/tháng*'],
  'dich-vu-4':['399.000đ*','799.000đ*','649.000đ*','1.190.000đ*']
 };
 return (fallback[key]||fallback['dich-vu-1'])[group]||'199.000đ/tháng*';
}
function nrSvcSafePrice(key,category,raw=''){
 const value=String(raw||'').trim();
 if(value&&!/liên hệ|theo gói|theo nhu cầu/i.test(value))return value;
 const cfg=NR_SERVICE_PROVIDERS[key]||{},idx=Math.max(0,(cfg.cats||[]).indexOf(category));
 const fallback={
  'dich-vu-1':['205.000đ/tháng*','220.000đ/tháng*','500.000đ/thiết bị*','220.000đ/tháng*'],
  'dich-vu-2':['180.000đ/tháng*','220.000đ/tháng*','250.000đ/tháng*','250.000đ/tháng*'],
  'dich-vu-3':['180.000đ/tháng*','35.000đ/30 ngày*','500.000đ/thiết bị*','215.000đ/tháng*'],
  'dich-vu-4':['399.000đ*','799.000đ*','649.000đ*','1.190.000đ*']
 };
 return (fallback[key]||fallback['dich-vu-1'])[idx]||'199.000đ/tháng*';
}
function renderServiceProvider(site={},key='dich-vu-1'){
 const root=document.querySelector('main'),cfg=NR_SERVICE_PROVIDERS[key];if(!root||!cfg)return;
 const real=(SITE_DATA?.posts||[]).filter(x=>x.type==='service');
 const samples=(cfg.samples||[]).map((x,i)=>({id:955000+(Number(key.split('-').pop())*100)+i,type:'service',category:x[0],title:x[1],image:x[5]||nrSvcImg(i, i<6?'net':i<12?'tv':i<18?'cam':'combo'),extra_json:JSON.stringify({service_speed:x[2],service_price:x[3],service_promo:x[4],service_cta:'Đăng ký tư vấn'}),content:x[4]}));
 const posts=nrServiceIsShowroom(key)?samples:real;
 const ex=x=>{try{return typeof x.extra_json==='object'?x.extra_json:JSON.parse(x.extra_json||'{}')}catch{return {}}};
 const img=x=>x.image||x.image_url||x.thumbnail||'';
 const card=(x,variant='')=>{const e=ex(x),im=img(x),speed=e.service_speed_down||e.service_speed||'';return `<article class="svc2-card ${variant}">${im?`<div class="svc2-thumb"><img src="${esc(im)}" alt="${esc(x.title||'Dịch vụ')}" loading="lazy"></div>`:''}<div class="svc2-body"><span class="tag">${esc(x.category||'Dịch vụ')}</span><h3>${esc(x.title||'Gói dịch vụ')}</h3>${speed?`<div class="spec">${esc(speed)}</div>`:''}<p>${esc(e.service_promo||String(x.content||'').replace(/<[^>]+>/g,' ').slice(0,150)||'Thông tin chi tiết đang được cập nhật.')}</p><div class="price">${e.service_price?`Chỉ từ <strong>${esc(e.service_price)}</strong>`:'Liên hệ để nhận báo giá'}</div><a class="svc1-btn primary svc-lead-open" href="#dang-ky" data-package="${esc(x.title||'')}" data-category="${esc(x.category||'')}">${esc(e.service_cta||'Đăng ký tư vấn')}</a></div></article>`};
 const empty=cat=>[0,1,2].map(()=>`<div class="svc1-empty"><b>${esc(cat)}</b><br>Chưa có bài dịch vụ của website này.<br>Khung template vẫn giữ nguyên.</div>`).join('');
 const arr=i=>posts.filter(x=>x.category===cfg.cats[i]).slice(0,6);
 const head=i=>`<div class="svc1-head"><div><small>${esc(cfg.subs[i])}</small><h2>${esc(cfg.labels[i])}</h2></div><span class="svc-note">Giá/ưu đãi showroom chỉ mang tính tham khảo và có thể thay đổi theo khu vực, thời điểm.</span></div>`;
 const standard=(id,i,alt=false)=>`<section class="svc1-section ${alt?'alt':''}" id="${id}"><div class="svc-wrap">${head(i)}<div class="svc2-grid">${arr(i).length?arr(i).map(x=>card(x)).join(''):empty(cfg.cats[i])}</div></div></section>`;
 document.body.classList.remove('theme-service-fpt','theme-service-vnpt','theme-service-viettel');document.body.classList.add(cfg.preset==='service_fpt_1'?'theme-service-fpt':cfg.preset==='service_vnpt_2'?'theme-service-vnpt':'theme-service-viettel');
 document.querySelector('.topbar')?.remove();document.querySelector('header.header')?.remove();document.querySelector('footer.footer')?.remove();
 const visual=cfg.visual.map(v=>`<div><span>${esc(v[0])}</span><b>${esc(v[1])}</b><small>${esc(v[2])}</small></div>`).join('');
 const nav=`<nav class="svc1-nav"><div class="svc-wrap"><a class="svc1-brand" href="#"><strong>${esc(cfg.brand)}</strong><span>${esc(cfg.brand2)}</span></a><div class="svc1-links"><a href="#internet">Internet</a><a href="#tv">Truyền hình</a><a href="#camera">Camera</a><a href="#combo">Combo</a><a class="svc1-call" href="#dang-ky">Đăng ký tư vấn</a></div></div></nav>`;
 let body='';
 if(key==='dich-vu-1'){
   const featured=arr(0)[0];
   body=`<section class="svc1-hero fpt-hero"><div class="svc-wrap svc1-hero-grid"><div><div class="svc1-kicker">${esc(cfg.kicker)}</div><h1>${esc(cfg.hero)}</h1><p>${esc(cfg.heroText)}</p><div class="svc1-hero-actions"><a class="svc1-btn primary" href="#internet">Khám phá gói cước</a><a class="svc1-btn" href="#dang-ky">Nhận tư vấn</a></div></div><div class="svc1-visual">${visual}</div></div></section><div class="svc-wrap svc1-trust"><div><b>⚡ Lắp đặt nhanh</b><small>Khảo sát theo khu vực</small></div><div><b>📶 Wi-Fi 6</b><small>Phủ sóng đa thiết bị</small></div><div><b>🎬 FPT Play</b><small>Giải trí đa nền tảng</small></div><div><b>🛡 Camera AI</b><small>Cloud an tâm</small></div></div>${standard('internet',0)}${standard('tv',1,true)}${standard('camera',2)}${standard('combo',3,true)}`;
 }else if(key==='dich-vu-2'){
   const a0=arr(0),a1=arr(1),a2=arr(2),a3=arr(3);
   body=`<section class="vnpt-hero"><div class="svc-wrap"><div class="vnpt-copy"><div class="svc1-kicker">${esc(cfg.kicker)}</div><h1>${esc(cfg.hero)}</h1><p>${esc(cfg.heroText)}</p><a class="svc1-btn primary" href="#internet">Chọn nhu cầu của bạn</a></div><div class="vnpt-orbit">${visual}</div></div></section><section class="svc1-section" id="internet"><div class="svc-wrap">${head(0)}<div class="vnpt-feature">${a0[0]?card(a0[0],'feature'):''}<div class="vnpt-side">${a0.slice(1,5).map(x=>card(x,'compact')).join('')||empty(cfg.cats[0])}</div></div></div></section><section class="svc1-section alt" id="tv"><div class="svc-wrap">${head(1)}<div class="vnpt-editorial">${a1.length?a1.slice(0,6).map((x,i)=>card(x,i===0?'wide':'')).join(''):empty(cfg.cats[1])}</div></div></section>${standard('camera',2)}${standard('combo',3,true)}`;
 }else{
   const all=[...arr(0),...arr(1),...arr(2),...arr(3)];
   body=`<section class="viettel-hero"><div class="svc-wrap"><div class="viettel-banner"><div><div class="svc1-kicker">${esc(cfg.kicker)}</div><h1>${esc(cfg.hero)}</h1><p>${esc(cfg.heroText)}</p><div class="svc1-hero-actions"><a class="svc1-btn primary" href="#combo">Xem combo nổi bật</a><a class="svc1-btn" href="#dang-ky">Kiểm tra hạ tầng</a></div></div><div class="viettel-stat">${visual}</div></div></div></section><section class="svc1-section viettel-hot" id="combo"><div class="svc-wrap">${head(3)}<div class="viettel-hot-grid">${arr(3).length?arr(3).map((x,i)=>card(x,i===0?'hero-card':'')).join(''):empty(cfg.cats[3])}</div></div></section><section class="svc1-section alt" id="internet"><div class="svc-wrap">${head(0)}<div class="viettel-list">${arr(0).length?arr(0).map(x=>card(x,'row')).join(''):empty(cfg.cats[0])}</div></div></section>${standard('tv',1)}${standard('camera',2,true)}`;
 }
 root.innerHTML=`<div class="svc1 svc-provider-${key}">${nav}${body}<section class="svc1-section"><div class="svc-wrap"><div class="svc1-head"><div><small>NỘI DUNG & TƯ VẤN</small><h2>Nhiều bài trong từng chuyên mục, dễ mở rộng</h2></div></div><div class="svc1-benefits"><div>📰<b>Bài dịch vụ có ảnh</b><span>Card sinh động, dễ quét nội dung.</span></div><div>📦<b>Nhiều gói cùng nhóm</b><span>So sánh nhiều lựa chọn ngay trang chủ.</span></div><div>☎️<b>CTA rõ ràng</b><span>Dẫn khách tới đăng ký tư vấn.</span></div><div>🧩<b>Đúng taxonomy</b><span>Bài thật vào đúng chuyên mục đã chọn.</span></div></div></div></section><section class="svc1-section alt" id="dang-ky"><div class="svc-wrap"><div class="svc-lead-shell"><div class="svc-lead-copy"><small>ĐĂNG KÝ TƯ VẤN</small><h2>Để lại số điện thoại, tư vấn đúng nhu cầu</h2><p>Chỉ cần vài thông tin ngắn. Gói cước bạn vừa chọn sẽ được ghi nhận tự động.</p><div class="svc-contact-quick"><a href="tel:${esc(String(site.phone||'').replace(/\s/g,''))}">☎ Gọi ngay ${esc(site.phone||'')}</a>${site.zalo?`<a href="https://zalo.me/${esc(String(site.zalo).replace(/\D/g,''))}" target="_blank" rel="noopener">💬 Chat Zalo</a>`:''}</div></div><form id="svcLeadForm" class="svc-lead-form"><input name="customer_name" required placeholder="Họ và tên *"><input name="phone" required inputmode="tel" placeholder="Số điện thoại *"><div class="svc-form-row"><input name="province" placeholder="Tỉnh / Thành phố"><input name="district" placeholder="Quận / Huyện"></div><select name="need"><option value="">Nhu cầu cần tư vấn</option><option>Internet gia đình</option><option>Internet doanh nghiệp</option><option>Wi-Fi Mesh / phủ sóng</option><option>Truyền hình</option><option>Camera</option><option>Combo nhiều dịch vụ</option></select><input type="hidden" name="package_title" id="svcLeadPackage"><input type="hidden" name="package_category" id="svcLeadCategory"><div id="svcLeadPicked" class="svc-picked hidden"></div><button class="svc1-btn primary" type="submit">Gửi yêu cầu tư vấn</button><div id="svcLeadMsg" class="svc-lead-msg"></div></form></div></div></section><footer class="svc1-footer"><div class="svc-wrap svc1-footer-grid"><div><b class="svc1-brand"><strong>${esc(cfg.brand)}</strong><span>${esc(cfg.brand2)}</span></b><p>${esc(cfg.kicker.replace(/ · /g,' • '))}</p></div><div><b>Dịch vụ</b><a href="#internet">Internet</a><a href="#tv">Truyền hình</a><a href="#camera">Camera</a></div><div><b>Liên hệ</b><a href="tel:${esc(String(site.phone||'').replace(/\s/g,''))}">${esc(site.phone||'Hotline')}</a><a href="#dang-ky">Đăng ký tư vấn</a></div></div></footer><div class="svc-mobile-contact"><a href="tel:${esc(String(site.phone||'').replace(/\s/g,''))}">☎ Gọi ngay</a><a href="#dang-ky">Đăng ký tư vấn</a></div></div>`;
 const leadForm=document.getElementById('svcLeadForm'),leadMsg=document.getElementById('svcLeadMsg');
 document.querySelectorAll('.svc-lead-open').forEach(a=>a.addEventListener('click',()=>{const t=a.dataset.package||'',c=a.dataset.category||'';const pi=document.getElementById('svcLeadPackage'),ci=document.getElementById('svcLeadCategory'),picked=document.getElementById('svcLeadPicked');if(pi)pi.value=t;if(ci)ci.value=c;if(picked&&t){picked.textContent='Bạn đang quan tâm: '+t;picked.classList.remove('hidden')}}));
 if(leadForm)leadForm.addEventListener('submit',async e=>{e.preventDefault();if(nrServiceIsShowroom(key)){leadMsg.textContent='Đây là form minh họa trong showroom. Khi khách kích hoạt website, yêu cầu sẽ vào mục “Khách hàng cần tư vấn” trong Admin.';leadMsg.className='svc-lead-msg ok';return}const fd=new FormData(leadForm),payload=Object.fromEntries(fd.entries());payload.source_url=location.href;const q=new URLSearchParams();const cur=new URLSearchParams(location.search);for(const k of ['tenant','nr_trial'])if(cur.get(k))q.set(k,cur.get(k));try{leadMsg.textContent='Đang gửi...';const r=await fetch('/api/service-leads'+(q.toString()?'?'+q:''),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),d=await r.json();if(!r.ok)throw new Error(d.error||'Không gửi được');leadMsg.textContent='✓ Đã gửi yêu cầu. Bộ phận tư vấn sẽ liên hệ với bạn.';leadMsg.className='svc-lead-msg ok';leadForm.reset();document.getElementById('svcLeadPicked')?.classList.add('hidden')}catch(err){leadMsg.textContent=err.message||'Không gửi được yêu cầu';leadMsg.className='svc-lead-msg error'}});
}
function renderServiceFpt1(site={}){renderServiceProvider(site,'dich-vu-1')}
function renderServiceVnpt2(site={}){renderServiceProvider(site,'dich-vu-2')}
function renderServiceViettel3(site={}){renderServiceProvider(site,'dich-vu-3')}
function renderServiceCameraStore4(site={}){renderServiceProvider(site,'dich-vu-4')}


/* V20.6.2 — Telecom Professional Visual Reset.
   Research contract: service storefronts prioritize product discovery, package comparison and consultation conversion.
   Showroom has rich samples; trial/client keeps the same sections with empty real-data slots. */
function renderServiceProvider(site={},key='dich-vu-1'){
 const cfg=NR_SERVICE_PROVIDERS[key]||NR_SERVICE_PROVIDERS['dich-vu-1'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 let posts=[]; try{posts=Array.isArray(window.NR_POSTS)?window.NR_POSTS:[]}catch{}
 if(nrServiceIsShowroom(key)) posts=cfg.samples.map((x,i)=>({title:x[1],category:x[0],content:x[4],image:x[5]||nrSvcFallback(key,x[0]),fallback_image:nrSvcFallback(key,x[0]),extra_json:{service_speed_down:x[2],service_price:nrSvcDemoPrice(key,i,x[3]),service_promo:x[4]}}));
 const root=document.querySelector('main')||document.body; const ex=x=>{try{return typeof x.extra_json==='object'?x.extra_json:JSON.parse(x.extra_json||'{}')}catch{return {}}};
 const arr=i=>posts.filter(x=>x.category===cfg.cats[i]).slice(0,60);
 const secSlots=(name,fallback=6)=>Math.max(0,nrStructureSlots(site,key,name,fallback));
 const secHostSlots=(name,selector,fallback)=>{const s=nrStructureSection(site,key,name);const h=(Array.isArray(s?.slot_hosts)?s.slot_hosts:[]).find(x=>String(x?.selector||'')===selector);return Math.max(0,Number(h?.slots||fallback||0))};
 const phone=esc(site.phone||'1900 0000'), phoneHref=esc(String(site.phone||'').replace(/\D/g,''));
 const card=(x,cl='')=>{const e=ex(x),im=x.image||x.image_url||x.thumbnail||nrSvcFallback(key,x.category),price=nrServiceIsShowroom(key)?nrSvcSafePrice(key,x.category,e.service_price):e.service_price||'Liên hệ',promo=e.service_promo||String(x.content||'').replace(/<[^>]+>/g,' ').slice(0,180)||'Thông tin đang cập nhật';return `<article class="tel-card ${cl}" data-service-card="1" data-contract-slot="1"><button type="button" class="tel-card-img svc-detail-open" data-package="${esc(x.title||'')}" aria-label="Xem chi tiết ${esc(x.title||'gói dịch vụ')}"><img src="${esc(im)}" alt="${esc(x.title)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(x.fallback_image||nrSvcFallback(key,x.category))}'"></button><div class="tel-card-body"><span class="tel-pill">${esc(x.category||'Dịch vụ')}</span><button type="button" class="tel-title-link svc-detail-open" data-package="${esc(x.title||'')}"><h3>${esc(x.title||'Gói dịch vụ')}</h3></button><div class="tel-speed">${esc(e.service_speed_down||'Tư vấn theo nhu cầu')}</div><p class="tel-desc">${esc(promo)}</p><button type="button" class="tel-detail-link svc-detail-open" data-package="${esc(x.title||'')}">Xem chi tiết & khuyến mãi →</button><div class="tel-card-bottom"><div class="tel-price"><small>Chỉ từ</small><strong>${esc(price)}</strong></div><a class="tel-cta svc-lead-open" href="#dang-ky" data-package="${esc(x.title||'')}" data-category="${esc(x.category||'')}">Đăng ký</a></div></div></article>`};
 const empty=(cat,n=6)=>Array.from({length:n},()=>`<div class="tel-empty" data-contract-slot="1" data-empty="1"><b>${esc(cat)}</b><span>Chưa có gói dịch vụ</span><small>Khung giao diện được giữ nguyên khi website chưa đăng nội dung.</small></div>`).join('');
 const paddedCards=(i,n=6,cl='',start=0)=>{const items=arr(i).slice(start,start+n);return items.map((x,j)=>card(x,cl+(start===0&&j===0?' is-first':''))).join('')+empty(cfg.cats[i],Math.max(0,n-items.length))};
 const cards=(i,n=6,cl='')=>paddedCards(i,n,cl,0);
 document.body.classList.remove('theme-service-fpt','theme-service-vnpt','theme-service-viettel','theme-service-camera-store'); document.body.classList.add(key==='dich-vu-1'?'theme-service-fpt':key==='dich-vu-2'?'theme-service-vnpt':key==='dich-vu-3'?'theme-service-viettel':'theme-service-camera-store','tel-pro');
 document.querySelector('.topbar')?.remove();document.querySelector('header.header')?.remove();document.querySelector('footer.footer')?.remove();
 const brand=`<a class="tel-brand" href="#"><strong>${esc(cfg.brand)}</strong><span>${esc(cfg.brand2)}</span></a>`;
 const nav=`<header class="tel-nav"><div class="tel-wrap">${brand}<nav><a href="#internet">Internet</a><a href="#tv">Truyền hình</a><a href="#camera">Camera</a><a href="#combo">Combo</a><a href="#tu-van">Tin tư vấn</a></nav><div class="tel-nav-actions"><a class="tel-hotline" href="tel:${phoneHref}">☎ ${phone}</a><a class="tel-btn" href="#dang-ky">Đăng ký lắp đặt</a></div></div></header>`;
 const consult=`<section class="tel-consult" id="dang-ky" data-structure-key="contact"><div class="tel-wrap tel-consult-grid"><div><span class="eyebrow">TƯ VẤN MIỄN PHÍ</span><h2>Kiểm tra hạ tầng & chọn gói phù hợp</h2><p>Để lại số điện thoại. Tư vấn viên liên hệ xác nhận khu vực, nhu cầu và gói cước phù hợp.</p><div class="tel-contact-row"><a href="tel:${phoneHref}">☎ Gọi ngay ${phone}</a>${site.zalo?`<a href="https://zalo.me/${esc(String(site.zalo).replace(/\D/g,''))}" target="_blank" rel="noopener">Zalo tư vấn</a>`:''}</div></div><form id="svcLeadForm" class="tel-form"><div class="tel-form-row"><input name="customer_name" required placeholder="Họ và tên *"><input name="phone" required inputmode="tel" placeholder="Số điện thoại *"></div><div class="tel-form-row"><input name="province" placeholder="Tỉnh / Thành phố"><input name="district" placeholder="Quận / Huyện"></div><select name="need"><option value="">Bạn đang quan tâm dịch vụ nào?</option><option>Internet gia đình</option><option>Internet doanh nghiệp</option><option>Wi-Fi Mesh / nhà nhiều tầng</option><option>Truyền hình</option><option>Camera</option><option>Combo Internet + TV + Camera</option></select><input type="hidden" name="package_title" id="svcLeadPackage"><input type="hidden" name="package_category" id="svcLeadCategory"><div id="svcLeadPicked" class="svc-picked hidden"></div><button class="tel-submit" type="submit">Yêu cầu tư vấn ngay →</button><div id="svcLeadMsg" class="svc-lead-msg"></div></form></div></section>`;
 const showroomPriceNote=nrServiceIsShowroom(key)?`<div class="tel-wrap tel-demo-price-note">* Giá hiển thị là dữ liệu minh họa showroom để khách xem bố cục. Chủ website có thể sửa toàn bộ giá, mô tả và ảnh trong Admin.</div>`:'';
 const advice=`<section class="tel-section tel-advice" id="tu-van" data-structure-key="advice"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">CẨM NANG DỊCH VỤ</span><h2>Thông tin hữu ích trước khi lắp đặt</h2></div><a href="#dang-ky">Cần tư vấn? →</a></div><div class="tel-advice-grid"><article><b>01</b><h3>Nhà nhiều tầng nên chọn Wi-Fi Mesh thế nào?</h3><p>Gợi ý vùng phủ, số lượng điểm phát và cách bố trí thiết bị.</p></article><article><b>02</b><h3>Internet + TV hay combo 3 dịch vụ?</h3><p>So sánh nhu cầu giải trí, camera và chi phí hàng tháng.</p></article><article><b>03</b><h3>Camera Cloud có gì khác thẻ nhớ?</h3><p>Khả năng xem lại, bảo mật dữ liệu và lựa chọn thời gian lưu trữ.</p></article></div></div></section>`;
 let body='';
 if(key==='dich-vu-1') body=`<section class="tel-hero fpt-pro" data-structure-key="hero"><div class="tel-wrap tel-hero-grid"><div class="tel-hero-copy"><span class="eyebrow">INTERNET • FPT PLAY • CAMERA AI</span><h1>Kết nối mạnh.<br><em>Trọn trải nghiệm số.</em></h1><p>Internet tốc độ cao, giải trí FPT Play và Camera AI trong một hệ sinh thái cho gia đình hiện đại.</p><div class="tel-hero-actions"><a class="tel-btn big" href="#internet">Xem gói cước</a><a class="tel-link" href="#dang-ky">Kiểm tra hạ tầng →</a></div><div class="tel-proof"><span><b>Wi-Fi 6/7</b> kết nối hiện đại</span><span><b>1 Gbps</b> tốc độ cao</span><span><b>24/7</b> hỗ trợ kỹ thuật</span></div></div><div class="tel-hero-photo"><img src="${nrSvcImg(7,'combo')}" alt="Gia đình sử dụng dịch vụ số"><div class="float-offer"><small>GÓI NỔI BẬT</small><b>Internet + TV + Camera</b><a href="#combo">Khám phá combo →</a></div></div></div></section><section class="tel-shortcuts" data-structure-key="needs"><div class="tel-wrap"><a href="#internet"><b>📶</b><span>Internet gia đình<small>Wi-Fi mạnh mọi phòng</small></span></a><a href="#tv"><b>▶</b><span>FPT Play<small>Giải trí đa nền tảng</small></span></a><a href="#camera"><b>◉</b><span>Camera AI<small>An tâm 24/7</small></span></a><a href="#combo"><b>＋</b><span>Combo tiết kiệm<small>Một gói, nhiều tiện ích</small></span></a></div></section><section class="tel-section" id="internet" data-structure-key="internet"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">INTERNET FPT</span><h2>Chọn tốc độ theo nhu cầu</h2></div><a href="#dang-ky">Tư vấn chọn gói →</a></div><div class="tel-grid3" data-contract-grid="1">${cards(0,secSlots('internet',6))}</div></div></section><section class="tel-showcase" id="tv" data-structure-key="tv"><div class="tel-wrap"><div class="tel-showcase-copy"><span class="eyebrow">FPT PLAY</span><h2>Biến phòng khách thành rạp giải trí</h2><p>Truyền hình, phim, thể thao và nội dung đa nền tảng kết hợp Internet tốc độ cao.</p><a class="tel-btn" href="#dang-ky">Tư vấn combo giải trí</a></div><div class="tel-showcase-cards" data-contract-grid="1">${cards(1,secSlots('tv',6),'compact')}</div></div></section><section class="tel-section" id="camera" data-structure-key="camera"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">CAMERA AI</span><h2>An tâm cho nhà ở & cửa hàng</h2></div></div><div class="tel-grid3" data-contract-grid="1">${cards(2,secSlots('camera',6))}</div></div></section><section class="tel-section soft" id="combo" data-structure-key="combo"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">COMBO FPT</span><h2>Gộp dịch vụ, tối ưu chi phí</h2></div></div><div class="tel-grid3" data-contract-grid="1">${cards(3,secSlots('combo',6))}</div></div></section>${advice}${consult}`;
 else if(key==='dich-vu-2') body=`<section class="vnpt-pro-hero" data-structure-key="hero"><div class="tel-wrap"><div class="vnpt-main"><span class="eyebrow">VNPT HOME</span><h1>Internet mạnh.<br>Giải trí hay.<br><em>Nhà luôn an tâm.</em></h1><p>Chọn Home Internet, MyTV, Wi-Fi Mesh và Home Camera theo đúng số người dùng, diện tích nhà và nhu cầu giải trí.</p><div class="tel-hero-actions"><a class="tel-btn big" href="#internet">Khám phá VNPT Home</a><a class="tel-link" href="#dang-ky">Đăng ký tư vấn →</a></div></div><div class="vnpt-service-board"><div class="big"><span>HOME INTERNET</span><b>Đến ~1 Gbps</b><small>Wi-Fi Mesh thế hệ mới</small></div><div><span>MYTV</span><b>180+</b><small>Kênh & nội dung</small></div><div><span>HOME CAM</span><b>Cloud 7</b><small>Giám sát thông minh</small></div></div></div></section><section class="vnpt-quick" data-structure-key="needs"><div class="tel-wrap"><div><b>01</b><span>Chọn nhu cầu</span></div><div><b>02</b><span>Kiểm tra hạ tầng</span></div><div><b>03</b><span>Nhận tư vấn gói</span></div><div><b>04</b><span>Hẹn lắp đặt</span></div></div></section><section class="tel-section" id="internet" data-structure-key="internet"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">HOME INTERNET</span><h2>Internet cho từng kiểu gia đình</h2></div></div><div class="vnpt-packages"><div class="vnpt-feature-pack" data-contract-grid="1">${paddedCards(0,secHostSlots('internet','.vnpt-feature-pack',1),'feature',0)}</div><div class="vnpt-pack-list" data-contract-grid="1">${paddedCards(0,secHostSlots('internet','.vnpt-pack-list',Math.max(0,secSlots('internet',6)-1)),'horizontal',secHostSlots('internet','.vnpt-feature-pack',1))}</div></div></div></section><section class="vnpt-mytv" id="tv" data-structure-key="tv"><div class="tel-wrap"><div class="vnpt-mytv-copy"><span class="eyebrow">MYTV</span><h2>Giải trí cho cả gia đình</h2><p>Truyền hình tương tác, nội dung theo yêu cầu và các gói HomeTV kết hợp Internet.</p></div><div class="vnpt-mytv-grid" data-contract-grid="1">${cards(1,secSlots('tv',6))}</div></div></section><section class="tel-section" id="camera" data-structure-key="camera"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">HOME CAMERA</span><h2>Quan sát ngôi nhà từ bất cứ đâu</h2></div></div><div class="tel-grid3" data-contract-grid="1">${cards(2,secSlots('camera',6))}</div></div></section><section class="tel-section blue-soft" id="combo" data-structure-key="combo"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">HOME COMBO</span><h2>Kết hợp Internet, MyTV, Camera & di động</h2></div></div><div class="tel-grid3" data-contract-grid="1">${cards(3,secSlots('combo',6))}</div></div></section>${advice}${consult}`;
  else if(key==='dich-vu-4') body=`<section class="camera-store-hero" data-structure-key="hero"><div class="tel-wrap camera-hero-grid"><div class="camera-hero-copy"><span class="eyebrow">CAMERA STORE • ĐA THƯƠNG HIỆU</span><h1>Camera đúng nhu cầu.<br><em>Xem rõ trước khi chọn.</em></h1><p>Danh mục mẫu dành cho cửa hàng và đơn vị lắp đặt camera: có ảnh, giá, thông số, mô tả ngắn, chi tiết khuyến mãi và tư vấn theo từng sản phẩm.</p><div class="tel-hero-actions"><a class="tel-btn big" href="#indoor">Xem sản phẩm</a><a class="tel-link" href="#dang-ky">Nhận tư vấn cấu hình →</a></div><div class="camera-proof"><span>24 sản phẩm demo</span><span>6+ thương hiệu phổ biến</span><span>Giá & khuyến mãi rõ ràng</span></div></div><div class="camera-hero-art"><img src="/assets/camera-store/hero.svg" alt="Giao diện cửa hàng camera"><div class="camera-hero-mini"><div><b>Chọn theo không gian</b><small>Trong nhà • ngoài trời • cửa hàng</small></div><div><b>Chọn theo công nghệ</b><small>Wi-Fi • AI • PoE • NVR</small></div></div></div></div></section><section class="camera-brands" data-structure-key="brands"><div class="tel-wrap"><span>IMOU</span><span>EZVIZ</span><span>TAPO</span><span>HIKVISION</span><span>DAHUA</span><span>KBVISION</span></div></section><section class="camera-shop-section" id="indoor" data-structure-key="indoor"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">CAMERA TRONG NHÀ</span><h2>Dễ lắp, dễ xem, phù hợp gia đình</h2><p>Quay quét, đàm thoại, theo dõi chuyển động và lưu trữ linh hoạt.</p></div><a href="#dang-ky">Nhờ tư vấn chọn mẫu →</a></div><div class="camera-product-grid" data-contract-grid="1">${cards(0,secSlots('indoor',6),'camera-product')}</div></div></section><section class="camera-shop-section camera-alt" id="outdoor" data-structure-key="outdoor"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">CAMERA NGOÀI TRỜI</span><h2>Bền thời tiết, quan sát rõ ban đêm</h2><p>Mẫu thân và quay quét cho cổng, sân, mặt tiền và kho nhỏ.</p></div></div><div class="camera-product-grid" data-contract-grid="1">${cards(1,secSlots('outdoor',6),'camera-product')}</div></div></section><section class="camera-shop-section" id="ai" data-structure-key="ai"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">CAMERA AI QUAY QUÉT</span><h2>Theo dõi thông minh, giảm điểm mù</h2><p>Dành cho khách cần cảnh báo, tracking và vùng quan sát rộng.</p></div></div><div class="camera-product-grid" data-contract-grid="1">${cards(2,secSlots('ai',6),'camera-product')}</div></div></section><section class="camera-shop-section camera-pro-section" id="pro" data-structure-key="pro"><div class="tel-wrap"><div class="tel-heading dark"><div><span class="eyebrow">CAMERA IP / POE</span><h2>Giải pháp hệ thống cho cửa hàng & doanh nghiệp</h2><p>Camera IP, NVR, PoE và các bộ giám sát nhiều điểm.</p></div></div><div class="camera-product-grid" data-contract-grid="1">${cards(3,secSlots('pro',6),'camera-product')}</div></div></section>${advice.replace('Thông tin hữu ích trước khi lắp đặt','Chọn camera dễ hơn với cẩm nang ngắn').replace('Nhà nhiều tầng nên chọn Wi-Fi Mesh thế nào?','Camera trong nhà nên chọn 2MP, 3MP hay 4MP?').replace('Internet + TV hay combo 3 dịch vụ?','Camera Wi-Fi hay PoE phù hợp công trình của bạn?').replace('Camera Cloud có gì khác thẻ nhớ?','Lưu thẻ nhớ, Cloud hay NVR: chọn cách nào?')}${consult.replace('Kiểm tra hạ tầng & chọn gói phù hợp','Nhận tư vấn camera & báo giá lắp đặt').replace('Để lại số điện thoại. Tư vấn viên liên hệ xác nhận khu vực, nhu cầu và gói cước phù hợp.','Để lại số điện thoại. Tư vấn viên hỗ trợ chọn camera, số lượng, vị trí lắp và phương án lưu trữ phù hợp.').replace('Bạn đang quan tâm dịch vụ nào?','Bạn đang quan tâm loại camera nào?').replace('Internet gia đình','Camera trong nhà').replace('Internet doanh nghiệp','Camera ngoài trời').replace('Wi-Fi Mesh / nhà nhiều tầng','Camera AI quay quét').replace('Truyền hình</option>','Camera IP / PoE</option>').replace('Camera</option>','Bộ camera & NVR</option>').replace('Combo Internet + TV + Camera','Tư vấn hệ thống trọn gói')}`;
 else body=`<section class="viettel-pro-hero" data-structure-key="hero"><div class="tel-wrap"><div class="viettel-copy"><span class="eyebrow">VIETTEL INTERNET • TV360 • CAMERA</span><h1>Mạnh từng kết nối.<br><em>Đủ mọi nhu cầu.</em></h1><p>Internet Wi-Fi 6 tốc độ cao, TV360 và Camera Cloud cho gia đình cần một hệ sinh thái đơn giản, mạnh và dễ đăng ký.</p><div class="tel-hero-actions"><a class="tel-btn big" href="#combo">Xem combo hot</a><a class="tel-link light" href="#dang-ky">Kiểm tra hạ tầng →</a></div></div><div class="viettel-campaign"><span>COMBO NỔI BẬT</span><strong>Internet<br>+ TV360<br>+ Camera</strong><small>Đăng ký một lần • Tư vấn theo khu vực</small><a href="#dang-ky">Đăng ký ngay →</a></div></div></section><section class="viettel-tabs" data-structure-key="needs"><div class="tel-wrap"><a href="#internet">Internet Wi-Fi 6</a><a href="#combo">Combo Internet</a><a href="#tv">TV360</a><a href="#camera">Camera Cloud</a><a href="#dang-ky">Internet doanh nghiệp</a></div></section><section class="tel-section" id="combo" data-structure-key="combo"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">COMBO ĐƯỢC QUAN TÂM</span><h2>Một gói cho kết nối, giải trí & an ninh</h2></div><a href="#dang-ky">Nhận báo giá khu vực →</a></div><div class="viettel-combo-grid" data-contract-grid="1">${cards(3,secSlots('combo',6))}</div></div></section><section class="viettel-dark" id="internet" data-structure-key="internet"><div class="tel-wrap"><div class="tel-heading dark"><div><span class="eyebrow">INTERNET VIETTEL</span><h2>Wi-Fi mạnh cho mọi không gian</h2></div></div><div class="viettel-net-list" data-contract-grid="1">${cards(0,secSlots('internet',6),'horizontal')}</div></div></section><section class="tel-section" id="tv" data-structure-key="tv"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">TV360</span><h2>Thể thao & giải trí trên mọi màn hình</h2></div></div><div class="tel-grid3" data-contract-grid="1">${cards(1,secSlots('tv',6))}</div></div></section><section class="tel-section red-soft" id="camera" data-structure-key="camera"><div class="tel-wrap"><div class="tel-heading"><div><span class="eyebrow">CAMERA CLOUD</span><h2>Giám sát thông minh, xem lại tiện lợi</h2></div></div><div class="tel-grid3" data-contract-grid="1">${cards(2,secSlots('camera',6))}</div></div></section>${advice}${consult}`;
 root.innerHTML=`<div class="tel-site tel-${key}">${nav}${showroomPriceNote}${body}<footer class="tel-footer"><div class="tel-wrap">${brand}<p>${esc(cfg.kicker.replace(/ · /g,' • '))}</p><div>${key==='dich-vu-4'?'<a href="#indoor">Trong nhà</a><a href="#outdoor">Ngoài trời</a><a href="#ai">AI quay quét</a><a href="#pro">IP & Bộ</a>':'<a href="#internet">Internet</a><a href="#tv">Truyền hình</a><a href="#camera">Camera</a>'}<a href="#dang-ky">Đăng ký tư vấn</a></div></div></footer><div class="svc-mobile-contact"><a href="tel:${phoneHref}">☎ Gọi ngay</a><a href="#dang-ky">Đăng ký tư vấn</a></div><div id="svcDetailModal" class="svc-detail-modal" aria-hidden="true"><div class="svc-detail-backdrop" data-detail-close="1"></div><div class="svc-detail-panel" role="dialog" aria-modal="true" aria-labelledby="svcDetailTitle"><button class="svc-detail-close" type="button" data-detail-close="1">×</button><div id="svcDetailContent"></div></div></div></div>`;
 const detailModal=document.getElementById('svcDetailModal'),detailContent=document.getElementById('svcDetailContent');
 const findPackage=title=>posts.find(x=>String(x.title||'')===String(title||''));
 const openDetail=x=>{if(!x||!detailModal||!detailContent)return;const e=ex(x),im=x.image||x.image_url||x.thumbnail||nrSvcFallback(key,x.category),price=nrServiceIsShowroom(key)?nrSvcSafePrice(key,x.category,e.service_price):e.service_price||'Liên hệ',promo=e.service_promo||String(x.content||'').replace(/<[^>]+>/g,' ').trim()||'Thông tin chi tiết đang cập nhật';const benefit=key==='dich-vu-4'?[e.camera_brand||'',e.camera_resolution||e.service_speed_down||'',e.camera_lens||'',e.camera_connection||'',e.camera_night||'',e.camera_storage||'',e.camera_warranty||''].filter(Boolean):[e.service_speed_down||e.service_speed||'',e.service_wifi||e.service_device||'',e.service_tv||'',e.service_camera||'',e.service_cloud||'',e.service_area||''].filter(Boolean);detailContent.innerHTML=`<div class="svc-detail-grid"><div class="svc-detail-media"><img src="${esc(im)}" alt="${esc(x.title||'Gói dịch vụ')}" onerror="this.onerror=null;this.src='${esc(x.fallback_image||nrSvcFallback(key,x.category))}'"></div><div class="svc-detail-copy"><span class="tel-pill">${esc(x.category||'Dịch vụ')}</span><h2 id="svcDetailTitle">${esc(x.title||'Gói dịch vụ')}</h2><div class="svc-detail-price"><small>Giá tham khảo showroom</small><strong>${esc(price)}</strong></div><p class="svc-detail-summary">${esc(promo)}</p><div class="svc-detail-benefits">${benefit.length?benefit.map(v=>`<span>✓ ${esc(v)}</span>`).join(''):`<span>✓ Tư vấn cấu hình theo nhu cầu thực tế</span><span>✓ Kiểm tra hạ tầng trước khi lắp đặt</span>`}</div><div class="svc-detail-promo"><b>Khuyến mãi & điều kiện</b><p>${esc(promo)} Giá, thiết bị và ưu đãi có thể thay đổi theo khu vực/thời điểm; chủ website có thể chỉnh toàn bộ nội dung này trong Admin.</p></div><div class="svc-detail-actions"><a class="tel-btn svc-lead-open detail-register" href="#dang-ky" data-package="${esc(x.title||'')}" data-category="${esc(x.category||'')}">Đăng ký tư vấn gói này</a><a class="tel-link" href="tel:${phoneHref}">☎ Gọi tư vấn</a></div></div></div>`;detailModal.classList.add('open');detailModal.setAttribute('aria-hidden','false');document.body.classList.add('svc-modal-open');detailContent.querySelectorAll('.svc-lead-open').forEach(a=>a.addEventListener('click',()=>{let t=a.dataset.package||'',c=a.dataset.category||'';let pi=document.getElementById('svcLeadPackage'),ci=document.getElementById('svcLeadCategory'),picked=document.getElementById('svcLeadPicked');if(pi)pi.value=t;if(ci)ci.value=c;if(picked&&t){picked.textContent='Bạn đang quan tâm: '+t;picked.classList.remove('hidden')}detailModal.classList.remove('open');document.body.classList.remove('svc-modal-open')}));};
 document.querySelectorAll('.svc-detail-open').forEach(b=>b.addEventListener('click',()=>openDetail(findPackage(b.dataset.package))));
 document.querySelectorAll('[data-detail-close]').forEach(b=>b.addEventListener('click',()=>{detailModal?.classList.remove('open');detailModal?.setAttribute('aria-hidden','true');document.body.classList.remove('svc-modal-open')}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&detailModal?.classList.contains('open')){detailModal.classList.remove('open');detailModal.setAttribute('aria-hidden','true');document.body.classList.remove('svc-modal-open')}});
 const leadForm=document.getElementById('svcLeadForm'),leadMsg=document.getElementById('svcLeadMsg'); document.querySelectorAll('.svc-lead-open').forEach(a=>a.addEventListener('click',()=>{let t=a.dataset.package||'',c=a.dataset.category||'';document.getElementById('svcLeadPackage').value=t;document.getElementById('svcLeadCategory').value=c;let p=document.getElementById('svcLeadPicked');if(t){p.textContent='Bạn đang quan tâm: '+t;p.classList.remove('hidden')}}));
 if(leadForm)leadForm.addEventListener('submit',async e=>{e.preventDefault();if(nrServiceIsShowroom(key)){leadMsg.textContent='Form minh họa showroom. Khi kích hoạt website, yêu cầu sẽ được lưu vào Khách hàng cần tư vấn.';leadMsg.className='svc-lead-msg ok';return}let payload=Object.fromEntries(new FormData(leadForm).entries());payload.source_url=location.href;let q=new URLSearchParams(),cur=new URLSearchParams(location.search);for(const k of ['tenant','nr_trial'])if(cur.get(k))q.set(k,cur.get(k));try{leadMsg.textContent='Đang gửi...';let r=await fetch('/api/service-leads'+(q.toString()?'?'+q:''),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),d=await r.json();if(!r.ok)throw new Error(d.error||'Không gửi được');leadMsg.textContent='✓ Đã gửi yêu cầu. Tư vấn viên sẽ liên hệ với bạn.';leadMsg.className='svc-lead-msg ok';leadForm.reset()}catch(err){leadMsg.textContent=err.message||'Không gửi được yêu cầu';leadMsg.className='svc-lead-msg error'}});
}
