
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
function cleanSiteName(n=''){return String(n||'').replace(/\s*Demo\s*$/i,'').trim()||'Trang Tin';}

function fillPublicFooter(site={}){
 const name=cleanSiteName(site.name||'NEWSREAL'), phone=String(site.phone||'').trim(), zalo=String(site.zalo||phone||'').trim(), email=String(site.email||site.contact_email||'').trim();
 document.querySelectorAll('[data-footer-brand]').forEach(el=>el.textContent=name);
 document.querySelectorAll('[data-footer-phone]').forEach(el=>{el.textContent='☎ Hotline: '+(phone||'Đang cập nhật');el.href=phone?'tel:'+phone.replace(/\s/g,''):'#'});
 document.querySelectorAll('[data-footer-zalo]').forEach(el=>{el.textContent='💬 Zalo: '+(zalo||'Đang cập nhật');el.href=zalo?'https://zalo.me/'+zalo.replace(/\D/g,''):'#'});
 document.querySelectorAll('[data-footer-email]').forEach(el=>{el.textContent='✉ Email: '+(email||'Đang cập nhật');el.href=email?'mailto:'+email:'#'});
}

function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function displayListingCode(code,id){const c=String(code||'').replace(/^DEMO[-_ ]*/i,'').trim();return c||('NR-'+String(id||'').padStart(6,'0'));}
function propertyCard(x){
 const favs=JSON.parse(localStorage.getItem('nr_favs')||'[]'),liked=favs.includes(x.id);
 const location=[x.ward,x.district,x.province].filter(Boolean).join(', ')||x.address||'Chưa cập nhật';
 return `<article class="listing-card rich-listing-card">
   <a class="listing-img" href="${seoPostUrl(x)}">${x.image?`<img src="${esc(x.image)}" alt="${esc(x.title)}">`:''}
     <span class="listing-image-tags"><span class="listing-image-tag transaction">${x.transaction==='rent'?'CHO THUÊ':'MUA BÁN'}</span>${x.verified?'<span class="listing-image-tag verified">✓ XÁC MINH</span>':''}${x.featured?'<span class="listing-image-tag featured">NỔI BẬT</span>':''}</span>
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
function toggleFav(e,id){e.preventDefault();let a=JSON.parse(localStorage.getItem('nr_favs')||'[]');a=a.includes(id)?a.filter(x=>x!==id):[...a,id];localStorage.setItem('nr_favs',JSON.stringify(a));e.currentTarget.textContent=a.includes(id)?'♥':'♡'}


function normFilter(v=''){
 return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[.,/\\_-]+/g,' ').replace(/\s+/g,' ').trim();
}
function locationKey(v=''){
 return normFilter(v).replace(/\b(thanh pho|tp|tinh)\b/g,'').replace(/\s+/g,' ').trim();
}
function parseMoneyVnd(v=''){
 const raw=String(v||'').toLowerCase().trim();
 if(!raw)return 0;
 let m=raw.match(/(\d+(?:[.,]\d+)?)/);
 if(!m)return 0;
 let n=parseFloat(m[1].replace(',','.'));
 if(!Number.isFinite(n))return 0;
 if(/tỷ|ty\b|billion/.test(raw))return n*1e9;
 if(/triệu|trieu\b|million/.test(raw))return n*1e6;
 if(/nghìn|nghin|ngàn|ngan/.test(raw))return n*1e3;
 // Existing numeric prices in VND remain supported.
 return n>=100000?n:0;
}
function priceBounds(code='',transaction=''){
 const c=String(code||'');
 if(!c)return null;
 const tx=transaction||ftransaction?.value||'';
 // Backward compatibility: old Theme 2 URL used price_range=2-5.
 if(c==='duoi-2'||c==='sale-under-2b')return [0,2e9];
 if(c==='2-5'||c==='sale-2-5b')return [2e9,5e9];
 if(c==='5-10'||c==='sale-5-10b')return [5e9,10e9];
 if(c==='tren-10'||c==='sale-over-10b')return [10e9,Infinity];
 if(c==='rent-under-10m')return [0,10e6];
 if(c==='rent-10-20m')return [10e6,20e6];
 if(c==='rent-20-50m')return [20e6,50e6];
 if(c==='rent-over-50m')return [50e6,Infinity];
 // Support numeric "min-max" values if added later.
 const mm=c.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
 if(mm){
   const scale=tx==='rent'?1e6:1e9;
   return [+mm[1]*scale,+mm[2]*scale];
 }
 return null;
}
function updatePriceOptions(transaction='',selected=''){
 const el=document.getElementById('fprice');
 if(!el)return;
 const rent=transaction==='rent';
 const options=rent
   ? [['','Khoảng giá'],['rent-under-10m','Dưới 10 triệu/tháng'],['rent-10-20m','10 - 20 triệu/tháng'],['rent-20-50m','20 - 50 triệu/tháng'],['rent-over-50m','Trên 50 triệu/tháng']]
   : [['','Khoảng giá'],['sale-under-2b','Dưới 2 tỷ'],['sale-2-5b','2 - 5 tỷ'],['sale-5-10b','5 - 10 tỷ'],['sale-over-10b','Trên 10 tỷ']];
 el.innerHTML=options.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
 const legacy={'duoi-2':'sale-under-2b','2-5':'sale-2-5b','5-10':'sale-5-10b','tren-10':'sale-over-10b'};
 const wanted=legacy[selected]||selected;
 if(options.some(x=>x[0]===wanted))el.value=wanted;
}

let all=[];
(async()=>{const d=await fetch(tenantApiUrl('/api/site')).then(r=>r.json());document.body.classList.toggle('theme-estate-green',d.site?.preset==='estate_green');brandName.textContent=cleanSiteName(d.site.name);fillPublicFooter(d.site);if(window.footerListBrand)footerListBrand.textContent=cleanSiteName(d.site.name);topContact.textContent='Hotline: '+(d.site.phone||'—');all=(d.posts||[]).filter(x=>x.type==='property');const p=new URLSearchParams(location.search);const pathTx=location.pathname.startsWith('/cho-thue')?'rent':location.pathname.startsWith('/mua-ban')?'sale':'';fq.value=p.get('q')||'';ftransaction.value=p.get('transaction')||pathTx;ftype.value=p.get('property_type')||'';fprovince.value=p.get('province')||'';fdistrict.value=p.get('district')||'';fbed.value=p.get('bedrooms')||'';updatePriceOptions(ftransaction.value,p.get('price_range')||'');render()})();
function render(){
 let a=[...all],q=normFilter(fq.value);
 if(q)a=a.filter(x=>normFilter([x.title,x.address,x.province,x.district,x.ward,x.property_type].join(' ')).includes(q));

 const tx=String(ftransaction.value||'');
 if(tx)a=a.filter(x=>String(x.transaction||'')===tx);

 const type=normFilter(ftype.value);
 if(type)a=a.filter(x=>normFilter(x.property_type||x.category)===type);

 const province=locationKey(fprovince.value);
 if(province)a=a.filter(x=>locationKey(x.province||'')===province || locationKey(x.address||'').includes(province));

 const district=locationKey(fdistrict.value);
 if(district)a=a.filter(x=>locationKey(x.district||'')===district || locationKey(x.address||'').includes(district));

 const bounds=priceBounds(document.getElementById('fprice')?.value||'',tx);
 if(bounds){
   a=a.filter(x=>{
     const money=parseMoneyVnd(x.price);
     return money>0 && money>=bounds[0] && money<=bounds[1];
   });
 }

 if(fbed.value)a=a.filter(x=>Number(x.bedrooms||0)>=Number(fbed.value));

 listingGrid.innerHTML=a.map(propertyCard).join('')||'<div class="empty filter-empty"><b>Không có bất động sản phù hợp.</b><span>Hãy thử thay đổi khu vực, loại bất động sản hoặc khoảng giá.</span></div>';
 resultCount.textContent=a.length+' kết quả';
 const tr=ftransaction.value;
 listTitle.textContent=tr==='rent'?'Bất động sản cho thuê':tr==='sale'?'Nhà đất đang bán':'Danh sách tin';
}
function syncListingUrl(){const params={};if(fq.value.trim())params.q=fq.value.trim();if(ftype.value)params.property_type=ftype.value;if(fprovince.value)params.province=fprovince.value;if(fdistrict.value)params.district=fdistrict.value;if(fbed.value)params.bedrooms=fbed.value;const fp=document.getElementById('fprice');if(fp?.value)params.price_range=fp.value;history.replaceState(null,'',nrDemoUrl(seoListingsUrl(ftransaction.value,params)))}
function applyFilters(){render();syncListingUrl()}
function resetFilters(){[fq,ftransaction,ftype,fprovince,fdistrict,fbed].forEach(x=>{if(x)x.value=''});updatePriceOptions('','');render();history.replaceState(null,'',nrDemoUrl(seoListingsUrl('')))}

;(()=>{const mt=document.getElementById('menuToggle'),nav=document.getElementById('mainNav');if(mt&&nav){mt.setAttribute('aria-expanded','false');mt.onclick=(e)=>{e.stopPropagation();const on=nav.classList.toggle('mobile-open');mt.setAttribute('aria-expanded',String(on));};nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('mobile-open');mt.setAttribute('aria-expanded','false')}));document.addEventListener('click',e=>{if(!nav.contains(e.target)&&e.target!==mt){nav.classList.remove('mobile-open');mt.setAttribute('aria-expanded','false')}});}const ft=document.getElementById('filterToggle'),fp=document.getElementById('filterPanel');if(ft&&fp)ft.onclick=()=>fp.classList.toggle('mobile-show');['fq','ftype','fprovince','fdistrict','fbed','fprice'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{if(innerWidth>720)render()})});const tx=document.getElementById('ftransaction');if(tx)tx.addEventListener('change',()=>{updatePriceOptions(tx.value,'');if(innerWidth>720)render()})})();
