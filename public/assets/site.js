
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
      <span class="badge">${x.type==='news'?'TIN NỔI BẬT':(x.transaction==='rent'?'CHO THUÊ':'BẤT ĐỘNG SẢN NỔI BẬT')}</span>
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
  const byType=(needle)=>props.filter(x=>(x.property_type||'').toLowerCase().includes(needle.toLowerCase()));
  const apartments=props.filter(x=>x.transaction!=='rent' && (x.property_type||'').toLowerCase().includes('chung cư'));
  const sale=props.filter(x=>x.transaction!=='rent' && !(x.property_type||'').toLowerCase().includes('chung cư') && !(x.property_type||'').toLowerCase().includes('đất'));
  const rent=props.filter(x=>x.transaction==='rent');
  const warehouse=props.filter(x=>['kho xưởng','shophouse','văn phòng','mặt bằng'].some(k=>(x.property_type||x.category||'').toLowerCase().includes(k)));
  const land=props.filter(x=>(x.property_type||x.category||'').toLowerCase().includes('đất'));

  const fill=(id,arr,msg,fallback=[])=>{
    const el=document.getElementById(id);
    const src=arr.length?arr:fallback;
    const merged=[...arr,...fallback].filter((v,i,a)=>v&&a.findIndex(z=>z.id===v.id)===i);
    el.innerHTML=merged.slice(0,6).map(card).join('')||`<div class="category-empty">${msg}</div>`;
  };
  fill('apartmentCards',apartments,'Chưa có tin căn hộ chung cư.',props.filter(x=>x.transaction!=='rent'));
  fill('saleCards',sale,'Chưa có tin nhà đất bán.',props.filter(x=>x.transaction!=='rent'));
  fill('rentCards',rent,'Chưa có tin cho thuê.');
  fill('warehouseCards',warehouse,'Chưa có tin kho xưởng hoặc mặt bằng.');
  fill('landCards',land,'Chưa có tin đất nền hoặc đất dự án.');
}




function renderNewsFooter(site,isDemo=false,categories=[]){
  const footer=document.querySelector('.public-footer');
  if(!footer)return;
  const brand=isDemo?'TIN TỨC 24H':cleanSiteName(site.name||'TIN TỨC');
  const phone=site.phone||'—',zalo=site.zalo||site.phone||'—',email=site.email||'—';
  const adminUrl=isDemo?'https://batdongsan2027.org.uk/admin?template=tin-tuc-1':'/admin';
  const postUrl=isDemo?'https://batdongsan2027.org.uk/admin?tab=newpost&template=tin-tuc-1':'/admin?tab=newpost';
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
 ${estateCoreSection(key,'Căn hộ & chung cư','PHONG CÁCH SỐNG',apartment,{limit:8,style:'compact',more:'/mua-ban/?property_type=Chung%20cư',className:'e3-soft'})}
 ${estateCoreSection(key,'Nhà phố & biệt thự','KHÔNG GIAN RIÊNG',g.house,{limit:8,style:'compact',more:'/mua-ban/?property_type=Nhà%20phố',className:'e3-section'})}
 ${estateCoreSection(key,'Bất động sản cho thuê','LỰA CHỌN LINH HOẠT',rent,{limit:8,style:'compact',more:'/cho-thue/',className:'e3-soft'})}
 ${estateCoreSection(key,'Đất nền & cơ hội đầu tư','ĐẦU TƯ',land,{limit:8,style:'compact',more:'/mua-ban/?property_type=Đất',className:'e3-section'})}
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
 ${estateCoreSection(key,'Nhà đất đang bán','MUA BÁN',g.sale,{limit:8,style:'minimal',more:'/mua-ban/',className:'e4-white'})}
 ${estateCoreProjectStrip(key,props)}
 ${estateCoreSection(key,'Căn hộ được quan tâm','CĂN HỘ',g.apartment,{limit:8,style:'minimal',more:'/mua-ban/?property_type=Chung%20cư',className:'e4-section'})}
 ${estateCoreSection(key,'Nhà phố & biệt thự','NHÀ Ở',g.house,{limit:8,style:'minimal',className:'e4-white'})}
 ${estateCoreSection(key,'Cho thuê nổi bật','CHO THUÊ',g.rent.length?g.rent:g.newest.slice(3),{limit:8,style:'minimal',more:'/cho-thue/',className:'e4-section'})}
 ${estateCoreSection(key,'Đất nền & dự án','ĐẦU TƯ',g.land.length?g.land:g.newest.slice(4),{limit:8,style:'minimal',more:'/mua-ban/?property_type=Đất',className:'e4-white'})}
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
 ${estateCoreSection(key,'Căn hộ thành thị','CĂN HỘ',g.apartment.length?g.apartment:g.newest.slice(1),{limit:8,style:'urban',more:'/mua-ban/?property_type=Chung%20cư',className:'e5-section'})}
 <section class="e5-split"><div class="wrap"><div><div class="estate-section-head"><div><small>MUA BÁN</small><h2>Cơ hội sở hữu</h2></div><a href="${estateCoreUrl('/mua-ban/',key,true)}">Xem thêm →</a></div>${estateCoreFixedRows(g.sale,'row',6)}</div><div><div class="estate-section-head"><div><small>CHO THUÊ</small><h2>Lựa chọn linh hoạt</h2></div><a href="${estateCoreUrl('/cho-thue/',key,true)}">Xem thêm →</a></div>${estateCoreFixedRows(g.rent.length?g.rent:g.newest.slice(2),'row',6)}</div></div></section>
 ${estateCoreSection(key,'Nhà phố & biệt thự','KHÔNG GIAN SỐNG',g.house,{limit:8,style:'urban',className:'e5-section'})}
 ${estateCoreSection(key,'Đất nền & dự án','ĐẦU TƯ',g.land.length?g.land:g.newest.slice(4),{limit:8,style:'urban',more:'/mua-ban/?property_type=Đất',className:'e5-white'})}
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
 const postUrl=ctx.isDemo?`https://batdongsan2027.org.uk/admin?tab=newpost&template=${key}`:'/admin?tab=newpost';
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
    <div class="n3-layout"><div class="n3-grid">${all.slice(1,1+layout.home_latest_count).map(cardN).join('')||'<div class="empty">Chưa có nội dung.</div>'}</div>
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

   <section class="n3-newsletter n3-newsletter-light"><div class="wrap"><div><small>WEBSITE TIN TỨC RIÊNG</small><h2>Nội dung của bạn, thương hiệu của bạn</h2><p>Đăng bài từ trang quản trị và website tự trình bày theo phong cách tạp chí hiện đại.</p></div><a href="${isDemo?'https://batdongsan2027.org.uk/admin?tab=newpost&template=tin-tuc-1':'/admin?tab=newpost'}"${isDemo?' target="_blank" rel="noopener"':''}>Đăng bài mới →</a></div></section>`;
  renderNewsFooter(site,isDemo,categories);
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
   if(latest&&Number(latest.slots||0)>0)out.home_latest_count=Math.max(out.home_latest_count,Number(latest.slots));
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
 return `<article class="nr-structure-placeholder ${property?'nr-property-placeholder':'nr-content-placeholder'}" aria-hidden="true"><div class="nr-placeholder-media"></div><div class="nr-placeholder-body"><span></span><b>${esc(label||(property?'Chưa có tin đăng':'Chưa có bài viết'))}</b><small>Nội dung sẽ hiển thị tại đây</small></div></article>`;
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
 return n.classList?.contains('nr-structure-placeholder')||n.classList?.contains('nr-structure-empty')||n.classList?.contains('empty')||n.classList?.contains('category-empty')||n.hasAttribute?.('data-empty');
}
function nrApplyStructureGeometry(site,key=''){
 const profile=nrStructureProfile(site,key),main=document.querySelector('main');if(!main||!profile.sections?.length)return;
 for(const sec of profile.sections){
  const slots=Math.max(0,Number(sec.slots||0));if(!slots)continue;
  const section=main.querySelector(`[data-structure-key="${CSS.escape(String(sec.key||''))}"]`);
  let grid=null;
  if(sec.grid_selector){try{grid=(section&&section.querySelector(sec.grid_selector))||document.querySelector(sec.grid_selector)}catch(e){}}
  if(!section&&!grid)continue;
  if(!grid&&section){
   const selectors=['.estate-rich-grid','.estate-news-grid','.estate-project-grid','.news-configurable-grid','.nm-mosaic','.nm-dark-grid','.n3-grid','.n3-wide-grid','.np-list','.np-category-grid','.nmin-latest-grid','.nmin-lead-grid','.t2-card-grid','.t2-card-track','.t2-news-grid','.cards'];
   for(const sel of selectors){grid=section.querySelector(sel);if(grid)break}
  }
  if(!grid)continue;

  // Empty messages are labels, never grid cards. Remove them before counting geometry.
  [...grid.children].filter(n=>nrIsStructureEmptyNode(n)).forEach(n=>n.remove());

  const declaredCols=Math.max(1,Number(sec.desktop_columns||1));
  const columnMode=String(sec.column_mode||'computed');
  let cols=declaredCols;
  if(columnMode==='computed') cols=nrGridColumns(grid,declaredCols);

  // Preserve the number of rows designed by the structure, but adapt to the grid
  // that the template CSS actually renders. Example: 8 slots / 4 declared cols = 2 rows;
  // if the real template is 3 columns, target becomes 6, not 8 (= 3+3+2 broken row).
  const designedRows=Math.max(1,Number(sec.desktop_rows||Math.ceil(slots/declaredCols)));
  const structuralTarget=Math.max(cols,designedRows*cols);
  const real=[...grid.children].filter(n=>!nrIsStructureEmptyNode(n));
  let target=structuralTarget;

  if(String(sec.fill_policy||'')==='complete_rows'&&real.length){
   const completeReal=Math.floor(real.length/cols)*cols;
   if(completeReal>=cols) target=Math.max(completeReal,Math.min(structuralTarget,Math.ceil(real.length/cols)*cols));
  }

  // Never leave a partial visual row: missing cells become explicit structural slots.
  if(real.length<target){
   const count=target-real.length;
   for(let i=0;i<count;i++)grid.insertAdjacentHTML('beforeend',nrStructurePlaceholder(sec.type));
  }

  if(columnMode==='fixed'&&!grid.classList.contains('t2-card-track')){
   grid.classList.add('nr-structure-grid');
   grid.style.setProperty('--nr-cols-desktop',String(declaredCols));
   grid.style.setProperty('--nr-cols-tablet',String(Math.max(1,Number(sec.tablet_columns||Math.min(2,declaredCols)))));
   grid.style.setProperty('--nr-cols-mobile',String(Math.max(1,Number(sec.mobile_columns||1))));
  }
  grid.dataset.nrEffectiveColumns=String(cols);
  grid.dataset.nrTargetSlots=String(target);
 }
}
function nrAuditStructureContract(site,key=''){
 if(!window.NR_CLIENT_SIMULATION)return;
 const p=nrStructureProfile(site,key),main=document.querySelector('main');if(!main)return;
 const missing=[];
 for(const sec of p.sections||[]){if(Number(sec.bind_required||0)!==1)continue;const node=main.querySelector(`[data-structure-key="${CSS.escape(String(sec.key||''))}"]`);if(!node)missing.push(String(sec.title||sec.key||'section'))}
 const missingSidebars=[];
 for(const sb of (p.sidebars||[])){let root=null;try{root=document.querySelector(String(sb.root_selector||''))}catch(e){}if(!root)missingSidebars.push(String(sb.root_selector||'sidebar'))}
 if(missing.length||missingSidebars.length)console.warn('[NEWSREAL Structure Contract] Template thiếu vùng render:',key,{sections:missing,sidebars:missingSidebars});
 else console.info('[NEWSREAL Structure Contract] OK:',key,(p.sections||[]).length,'sections',(p.sidebars||[]).length,'sidebars');
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
 const a=ctx.all,lead=a[0],side=a.slice(1,5),latest=a.slice(1,1+ctx.layout.home_latest_count);
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
   ['Nhà đất bán','/mua-ban/'],
   ['Cho thuê','/cho-thue/'],
   ['Chuyên mục','/#categories'],
   ['Tin tức','/#news']
 ].map(([l,h])=>`<a href="${estateCoreUrl(h,key,isDemo)}">${l}</a>`).join('');
 const actions=document.querySelector('.header .actions');
 if(actions){
   const fav=estateCoreUrl('/favorites',key,isDemo);
   const post=isDemo?`https://batdongsan2027.org.uk/admin?tab=newpost&template=${key}`:'/admin?tab=newpost';
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
   <div class="estate-core-meta"><span>${x.transaction==='rent'?'CHO THUÊ':'MUA BÁN'}</span><span>${esc(x.property_type||'Bất động sản')}</span></div>
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
  <label><small>Giao dịch</small><select name="transaction"><option value="sale">Mua bán</option><option value="rent">Cho thuê</option><option value="">Tất cả</option></select></label>
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
   const path=tr==='rent'?'/cho-thue/':tr==='sale'?'/mua-ban/':'/bat-dong-san/';
   location.href=estateCoreUrl(path,key,window.NR_DEMO_THEME===key)+(q.toString()?'?'+q.toString():'');
 };
}
function estateCoreGroups(props){
 const newest=[...props].sort((a,b)=>Number(b.id||0)-Number(a.id||0));
 const featured=[...props].sort((a,b)=>(Number(b.featured||0)-Number(a.featured||0))||((b.views||0)-(a.views||0)));
 return {
   newest,featured,
   sale:newest.filter(x=>x.transaction!=='rent'),
   rent:newest.filter(x=>x.transaction==='rent'),
   apartment:newest.filter(x=>/chung cư|căn hộ/i.test(String(x.property_type||x.title||''))),
   house:newest.filter(x=>/nhà|biệt thự|shophouse/i.test(String(x.property_type||x.title||''))),
   land:newest.filter(x=>/đất/i.test(String(x.property_type||x.title||'')))
 };
}
function estateCoreCategoryStrip(key){
 const isDemo=window.NR_DEMO_THEME===key;
 const data=[['⌂','Nhà phố','/mua-ban/?property_type=Nhà%20phố'],['▦','Căn hộ','/mua-ban/?property_type=Chung%20cư'],['◇','Đất nền','/mua-ban/?property_type=Đất'],['♜','Biệt thự','/mua-ban/?property_type=Biệt%20thự'],['⌁','Cho thuê','/cho-thue/']];
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
            <span class="t2-search-icon">⌂</span><label>Loại giao dịch<select id="t2Transaction"><option value="sale">Mua bán</option><option value="rent">Cho thuê</option><option value="">Tất cả</option></select></label>
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
          <a href="${estateCoreUrl('/mua-ban/?property_type=Nhà%20phố','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>⌂</span><b>Nhà phố</b><small>Mua bán nhà riêng</small></a>
          <a href="${estateCoreUrl('/mua-ban/?property_type=Chung%20cư','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>▦</span><b>Căn hộ</b><small>Chung cư, duplex</small></a>
          <a href="${estateCoreUrl('/mua-ban/?property_type=Biệt%20thự','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>♜</span><b>Biệt thự</b><small>Không gian cao cấp</small></a>
          <a href="${estateCoreUrl('/listings?property_type=Đất','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>◇</span><b>Đất nền</b><small>Đất ở & dự án</small></a>
          <a href="${estateCoreUrl('/cho-thue/','mau-2',window.NR_DEMO_THEME==='mau-2')}"><span>⌁</span><b>Cho thuê</b><small>Nhà, căn hộ, mặt bằng</small></a>
        </div>
      </div>
    </section>


    <section class="t2-market-section">
      <div class="wrap">
        <div class="t2-section-head"><h2>Mua bán <em>nổi bật</em></h2><a href="${estateCoreUrl('/mua-ban/','mau-2',window.NR_DEMO_THEME==='mau-2')}">Xem tất cả →</a></div>
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
    const base=tr==='rent'?'/cho-thue/':tr==='sale'?'/mua-ban/':'/bat-dong-san/';
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
   const r=await fetch(tenantApiUrl('/api/site')),d=await r.json(); if(!r.ok)throw new Error(d.error||'Không tải được dữ liệu');
   SITE_DATA=d;
   const s=d.site;
   if(s?.favicon_url){let f=document.querySelector('link[rel=\"icon\"]');if(!f){f=document.createElement('link');f.rel='icon';document.head.appendChild(f)}f.href=s.favicon_url}
   const demoTemplateKey=window.NR_DEMO_THEME&&(/^tin-tuc-[1-4]$/.test(window.NR_DEMO_THEME)||/^mau-[1-5]$/.test(window.NR_DEMO_THEME))?window.NR_DEMO_THEME:'';
   const activeTemplateKey=demoTemplateKey||s.template_key||'';
   if(activeTemplateKey){
     try{
       const tr=await fetch(tenantApiUrl('/api/template-catalog?key='+encodeURIComponent(activeTemplateKey)),{cache:'no-store'});
       const td=await tr.json();
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
     'tin-tuc-4':'news_minimal_4'
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
 }catch(e){
   console.error(e);
   if(window.NR_DEMO_THEME==='tin-tuc-1'||document.body.classList.contains('theme-news-portal')){
     const main=document.querySelector('main');
     if(main)main.innerHTML='<section class="n3-section"><div class="wrap"><div class="empty">Không tải được dữ liệu demo tin tức.</div></div></section>';
   }else if(typeof heroSlides!=='undefined'&&heroSlides)heroSlides.innerHTML='<div class="empty">Không tải được dữ liệu trang chủ.</div>';
 }
})();
