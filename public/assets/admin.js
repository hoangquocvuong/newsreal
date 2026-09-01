
const handoverParam=new URLSearchParams(location.search).get('handover')||'';
const trialParam=new URLSearchParams(location.search).get('nr_trial')||'';
async function consumeHandover(){
 if(!handoverParam)return false;
 try{
  const r=await fetch('/api/handover-login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:handoverParam})});
  const t=await r.text();let d={};try{d=JSON.parse(t)}catch{}
  if(!r.ok)throw new Error(d.error||t);
  if(d.token)localStorage.setItem('nr_client_token',d.token);
  const cleanUrl=new URL(location.href);cleanUrl.searchParams.delete('handover');history.replaceState({},'',cleanUrl.pathname+(cleanUrl.searchParams.toString()?'?'+cleanUrl.searchParams.toString():'')+cleanUrl.hash);
  return true;
 }catch(e){console.error(e);alert('Không thể hoàn tất bàn giao: '+e.message);return false}
}
function cleanSiteName(n=''){return String(n||'').replace(/\s*Demo\s*$/i,'').trim()||'Trang Tin';}

let allPosts=[];

const imageFiles=document.getElementById('imageFiles'), imagePreview=document.getElementById('imagePreview'), uploadStatus=document.getElementById('uploadStatus');
let uploadedImages=[];
function renderImages(){
  imagePreview.innerHTML=uploadedImages.map((url,i)=>`<div class="upload-thumb"><img src="${url}" alt=""><div><button type="button" class="smallbtn ${i===0?'':'soft'}" onclick="makeCover(${i})">${i===0?'Ảnh đại diện':'Đặt làm đại diện'}</button><button type="button" class="smallbtn danger" onclick="removeImage(${i})">Xóa</button></div></div>`).join('');
  postImage.value=uploadedImages[0]||postImage.value||'';
  gallery.value=uploadedImages.slice(1).join(', ');
}
function makeCover(i){const x=uploadedImages.splice(i,1)[0];uploadedImages.unshift(x);renderImages()}
function removeImage(i){uploadedImages.splice(i,1);renderImages()}
imageFiles.addEventListener('change',async()=>{
  const files=[...imageFiles.files]; if(!files.length)return;
  uploadStatus.textContent=`Đang tải ${files.length} ảnh...`;
  for(const file of files){
    if(file.size>8*1024*1024){uploadStatus.textContent=`${file.name} vượt quá 8 MB`;continue}
    const fd=new FormData(); fd.append('file',file);
    try{
      const tk=localStorage.getItem('nr_client_token')||'';const r=await fetch(tenantUrl('/upload'),{method:'POST',body:fd,credentials:'include',headers:tk?{'Authorization':'Bearer '+tk}:{}});
      const d=await r.json(); if(!r.ok)throw new Error(d.error||'Tải ảnh thất bại');
      uploadedImages.push(d.url); renderImages();
    }catch(e){uploadStatus.textContent=e.message;return}
  }
  uploadStatus.textContent=`Đã tải ${files.length} ảnh.`;
  imageFiles.value='';
});

const tenantParam=new URLSearchParams(location.search).get('tenant')||'';
if(trialParam){document.body.classList.add('admin-trial-mode');if(window.viewSiteLink){viewSiteLink.href='#';viewSiteLink.style.display='none'}}else if(window.viewSiteLink&&tenantParam)viewSiteLink.href='/?tenant='+encodeURIComponent(tenantParam);function tenantUrl(path){if(!tenantParam)return '/api'+path;return '/api'+path+(path.includes('?')?'&':'?')+'tenant='+encodeURIComponent(tenantParam)}
async function api(path,opts={}){const token=localStorage.getItem('nr_client_token')||'';const headers={'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{}),...(opts.headers||{})};const r=await fetch(tenantUrl(path),{credentials:'include',...opts,headers});const t=await r.text();let d={};try{d=JSON.parse(t)}catch{}if(!r.ok)throw new Error(d.error||t);return d}

let CLIENT_TEMPLATE_KEY='',CLIENT_PRESET='',CLIENT_CATEGORY='',CLIENT_PROFILE=null;

const BUILTIN_CONTENT_PROFILES={
 property:{
  id:'property',label:'Bất động sản',content_type:'property',
  categoriesByTransaction:{
   buy:["Mua căn hộ / chung cư","Mua nhà riêng","Mua nhà trọ / phòng trọ","Mua nhà mặt phố","Mua biệt thự / liền kề","Mua shophouse / nhà phố thương mại","Mua đất nền / đất dự án","Mua đất thổ cư","Mua đất nông nghiệp / trang trại","Mua văn phòng","Mua mặt bằng kinh doanh","Mua kho / nhà xưởng","Mua bất động sản công nghiệp","Mua khách sạn / resort / nghỉ dưỡng","Mua officetel / căn hộ dịch vụ","Bất động sản cần mua khác"],
   sale:["Bán căn hộ / chung cư","Bán nhà riêng","Bán nhà trọ / phòng trọ","Bán nhà mặt phố","Bán biệt thự / liền kề","Bán shophouse / nhà phố thương mại","Bán đất nền / đất dự án","Bán đất thổ cư","Bán đất nông nghiệp / trang trại","Bán văn phòng","Bán mặt bằng kinh doanh","Bán kho / nhà xưởng","Bán bất động sản công nghiệp","Bán khách sạn / resort / nghỉ dưỡng","Bán officetel / căn hộ dịch vụ","Bất động sản bán khác"],
   rent:["Cho thuê căn hộ / chung cư","Cho thuê nhà riêng","Cho thuê nhà trọ / phòng trọ","Cho thuê nhà mặt phố","Cho thuê biệt thự / liền kề","Cho thuê shophouse / nhà phố thương mại","Cho thuê đất nền / đất dự án","Cho thuê đất thổ cư","Cho thuê đất nông nghiệp / trang trại","Cho thuê văn phòng","Cho thuê mặt bằng kinh doanh","Cho thuê kho / nhà xưởng","Cho thuê bất động sản công nghiệp","Cho thuê khách sạn / resort / nghỉ dưỡng","Cho thuê officetel / căn hộ dịch vụ","Bất động sản cho thuê khác"]
  },
  contentLabel:'Mô tả chi tiết bất động sản',
  contentHelp:'Trình bày vị trí, tiện ích, pháp lý, ưu điểm; có thể chèn ảnh và định dạng nội dung.',
  custom_fields:[]
 },
 news:{
  id:'news',label:'Tin tức',content_type:'news',
  categories:['Kinh tế','Công nghệ','Kinh doanh','Tài chính','Thế giới','Xã hội','Giáo dục','Sức khỏe','Đời sống','Du lịch','Bất động sản','Pháp luật','Văn hóa','Giải trí','Thể thao','Khoa học','Xe','Nhà đẹp'],
  contentLabel:'Nội dung bài viết',
  contentHelp:'Soạn bài như trình soạn thảo văn bản: tiêu đề phụ, danh sách, liên kết và ảnh trong bài.',
  custom_fields:[]
 }
};
function resolvedContentProfile(){
 const override=adminTemplateOverride();
 let base;
 if(/^tin-tuc-\d+$/i.test(override))base=BUILTIN_CONTENT_PROFILES.news;
 else if(override==='mau-1'||override==='mau-2')base=BUILTIN_CONTENT_PROFILES.property;
 else if(CLIENT_PROFILE?.content_type==='news'||CLIENT_PROFILE?.id==='news'||isNewsTemplate())base=BUILTIN_CONTENT_PROFILES.news;
 else base=BUILTIN_CONTENT_PROFILES.property;

 // Merge instead of replacing the built-in profile. This prevents an older
 // editor_profile that only contains labels/custom_fields from erasing
 // category definitions.
 const remote=(CLIENT_PROFILE&&typeof CLIENT_PROFILE==='object')?CLIENT_PROFILE:{};
 const newsBase=base.content_type==='news'||remote.content_type==='news'||/^tin-tuc-\d+$/i.test(adminTemplateOverride())||isNewsTemplate();
 const merged={...base,...remote,custom_fields:Array.isArray(remote.custom_fields)?remote.custom_fields:(base.custom_fields||[])};
 if(newsBase){
   merged.content_type='news';
   merged.categories=Array.isArray(remote.categories)&&remote.categories.length?remote.categories:(base.categories||[]);
   delete merged.categoriesByTransaction;
 }else{
   merged.categoriesByTransaction={...(base.categoriesByTransaction||{}),...(remote.categoriesByTransaction||{})};
 }
 return merged;
}
function safeProfileId(v=''){return String(v).replace(/[^a-z0-9_-]/gi,'').slice(0,60)}
function renderProfileFields(values={}){
 const host=document.getElementById('profileFieldsHost');if(!host)return;
 const profile=resolvedContentProfile(),fields=Array.isArray(profile.custom_fields)?profile.custom_fields:[];
 if(!fields.length){host.innerHTML='';host.classList.add('hidden');return}
 host.classList.remove('hidden');
 host.innerHTML='<div class="form-section-title">Thông tin theo mẫu giao diện</div><div class="profile-fields-grid">'+fields.map(f=>{
   const key=safeProfileId(f.key||''),label=String(f.label||key),val=values[key]??'',required=f.required?' required':'';
   if(f.type==='select')return `<label>${label}${f.required?' <span class="req">*</span>':''}<select data-profile-field="${key}"${required}>${(f.options||[]).map(o=>`<option value="${String(o).replace(/"/g,'&quot;')}" ${String(o)===String(val)?'selected':''}>${o}</option>`).join('')}</select></label>`;
   if(f.type==='textarea')return `<label class="profile-field-wide">${label}${f.required?' <span class="req">*</span>':''}<textarea data-profile-field="${key}"${required}>${String(val||'')}</textarea></label>`;
   const type=['url','number','email','date'].includes(f.type)?f.type:'text';
   return `<label>${label}${f.required?' <span class="req">*</span>':''}<input type="${type}" data-profile-field="${key}" value="${String(val||'').replace(/"/g,'&quot;')}" placeholder="${String(f.placeholder||'').replace(/"/g,'&quot;')}"${required}></label>`;
 }).join('')+'</div>';
}
function collectProfileFields(){
 const o={};document.querySelectorAll('[data-profile-field]').forEach(el=>o[el.dataset.profileField]=el.value||'');return o;
}
function parseExtraJson(v){try{return typeof v==='object'&&v?v:JSON.parse(v||'{}')}catch{return {}}}

function adminTemplateOverride(){return new URLSearchParams(location.search).get('template')||''}
function isServiceTemplate(){const override=adminTemplateOverride();if(override)return /^dich-vu-\d+$/i.test(override);return CLIENT_CATEGORY==='dich-vu'||CLIENT_PROFILE?.content_type==='service'||CLIENT_PROFILE?.id==='service'||CLIENT_PRESET==='service_fpt_1'}
function isNewsTemplate(){
 const override=adminTemplateOverride();
 if(override)return /^tin-tuc-\d+$/i.test(override);
 return CLIENT_TEMPLATE_KEY==='tin-tuc-1'||CLIENT_PRESET==='news_portal_1'||CLIENT_CATEGORY==='tin-tuc'||CLIENT_PROFILE?.content_type==='news'||CLIENT_PROFILE?.id==='news';
}
function configureAdminForTemplate(){
 const news=isNewsTemplate(),service=isServiceTemplate();
 document.body.classList.toggle('admin-template-news',news);
 const picker=document.getElementById('contentTypePicker');
 const notice=document.getElementById('newsTemplateNotice');
 const menuNew=document.getElementById('menuNewPostText');
 const menuPosts=document.getElementById('menuPostsText');
 const overviewBtn=document.querySelector('#tab-overview .admin-page-head .btn.primary');
 const profile=resolvedContentProfile();
 const editorLabel=document.getElementById('contentEditorLabel'),editorHelp=document.getElementById('contentEditorHelp');
 if(editorLabel)editorLabel.textContent=profile.contentLabel||(news?'Nội dung bài viết':'Mô tả chi tiết');
 if(editorHelp)editorHelp.textContent=profile.contentHelp||'Soạn và định dạng nội dung.';
 renderProfileFields();
 if(service){
   document.getElementById('menuServiceLeads')?.classList.remove('hidden');
   postType.value='service';postType.disabled=true;picker?.classList.add('hidden');notice?.classList.add('hidden');
   if(menuNew)menuNew.textContent='Thêm gói dịch vụ';if(menuPosts)menuPosts.textContent='Quản lý dịch vụ';if(overviewBtn)overviewBtn.textContent='＋ Thêm gói dịch vụ';
   if(postTitle)postTitle.placeholder='Ví dụ: Gói Internet Home 500';
 }else if(news){
   postType.value='news';
   postType.disabled=true;
   picker?.classList.add('hidden');
   notice?.classList.remove('hidden');
   if(menuNew)menuNew.textContent='Đăng bài mới';
   if(menuPosts)menuPosts.textContent='Quản lý bài viết';
   if(overviewBtn)overviewBtn.textContent='＋ Đăng bài mới';
   if(postTitle)postTitle.placeholder='Ví dụ: Những xu hướng công nghệ đáng chú ý hôm nay';
   document.querySelector('#tab-overview .admin-page-head p')?.replaceChildren(document.createTextNode('Quản lý bài viết, chuyên mục và theo dõi hiệu quả website tin tức.'));
   document.querySelector('#tab-overview .admin-kpis .kpi:first-child small')?.replaceChildren(document.createTextNode('TỔNG BÀI VIẾT'));
   document.querySelector('#tab-overview .admin-kpis .kpi:first-child span')?.replaceChildren(document.createTextNode('Bài đã đăng'));
 }else{
   postType.disabled=false;
   picker?.classList.remove('hidden');
   notice?.classList.add('hidden');
   if(menuNew)menuNew.textContent='Đăng nội dung mới';
   if(menuPosts)menuPosts.textContent='Quản lý nội dung';
 }
 updateContentTypeUI();
}
function showTab(n){document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));document.getElementById('tab-'+n).classList.remove('hidden');document.querySelectorAll('.menu-btn').forEach(x=>x.classList.toggle('active',x.dataset.tab===n));if(n==='posts')loadPosts();if(n==='stats')loadStats();if(n==='service')loadService();if(n==='serviceleads')loadServiceLeads()}
document.querySelectorAll('.menu-btn').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
let websiteSettingsSnapshot=null;
function captureWebsiteSettings(){return {name:setName.value,phone:setPhone.value,zalo:setZalo.value,email:setEmail.value,facebook:setFacebook.value}}
function setWebsiteSettingsEditing(editing){
 [setName,setPhone,setZalo,setEmail,setFacebook].forEach(el=>{if(el)el.disabled=!editing});
 settingsForm?.classList.toggle('settings-readonly',!editing);
 settingsEditActions?.classList.toggle('hidden',!editing);
 editWebsiteSettings?.classList.toggle('hidden',editing);
}
async function boot(){try{
 const d=await api('/me');
 CLIENT_TEMPLATE_KEY=String(d.site.template_key||'');
 CLIENT_PRESET=String(d.site.preset||'');
 CLIENT_CATEGORY=String(d.site.template_category||'');
 CLIENT_PROFILE=d.content_profile&&typeof d.content_profile==='object'?d.content_profile:null;
 loginPanel.classList.add('hidden');dashboard.classList.remove('hidden');document.documentElement.classList.remove('nr-admin-auth-boot','nr-handover-boot');
 if(d.site?.favicon_url){let f=document.querySelector('link[rel=\"icon\"]');if(!f){f=document.createElement('link');f.rel='icon';document.head.appendChild(f)}f.href=d.site.favicon_url}
 welcome.textContent=cleanSiteName(d.site.name);kpiPosts.textContent=d.stats.posts;kpiViews.textContent=d.stats.views;kpiToday.textContent=d.stats.today;
 setName.value=cleanSiteName(d.site.name||'');setPhone.value=d.site.phone||'';setZalo.value=d.site.zalo||'';setEmail.value=d.site.email||'';setFacebook.value=d.site.facebook||'';
 websiteSettingsSnapshot=captureWebsiteSettings();setWebsiteSettingsEditing(false);
 configureAdminForTemplate();
 const wanted=new URLSearchParams(location.search).get('tab');if(wanted==='newpost')showTab('newpost')
}catch(err){console.error('BOOT ERROR',err);document.documentElement.classList.remove('nr-admin-auth-boot','nr-handover-boot');loginPanel.classList.remove('hidden');dashboard.classList.add('hidden');}}
loginForm.addEventListener('submit',async e=>{e.preventDefault();try{const d=await api('/login',{method:'POST',body:JSON.stringify({email:email.value,password:password.value})});if(d.token)localStorage.setItem('nr_client_token',d.token);loginMsg.classList.add('hidden');document.documentElement.classList.add('nr-admin-auth-boot');await boot()}catch(err){document.documentElement.classList.remove('nr-admin-auth-boot');loginMsg.textContent=err.message;loginMsg.classList.remove('hidden')}});

const showForgotPassword=document.getElementById('showForgotPassword');
const forgotPasswordBox=document.getElementById('forgotPasswordBox');
const forgotPasswordForm=document.getElementById('forgotPasswordForm');
const forgotEmail=document.getElementById('forgotEmail');
const forgotMsg=document.getElementById('forgotMsg');
const backToLogin=document.getElementById('backToLogin');
showForgotPassword?.addEventListener('click',()=>{
  forgotEmail.value=email.value||'';
  loginForm.classList.add('hidden');
  loginMsg.classList.add('hidden');
  forgotPasswordBox.classList.remove('hidden');
  forgotEmail.focus();
});
backToLogin?.addEventListener('click',()=>{
  forgotPasswordBox.classList.add('hidden');
  loginForm.classList.remove('hidden');
  forgotMsg.classList.add('hidden');
});
forgotPasswordForm?.addEventListener('submit',async e=>{
  e.preventDefault();
  const submit=e.submitter;
  submit.disabled=true; submit.textContent='Đang gửi...';
  try{
    const d=await api('/forgot-password',{method:'POST',body:JSON.stringify({email:forgotEmail.value})});
    forgotMsg.textContent=d.message||'Nếu email hợp lệ, liên kết đặt lại mật khẩu đã được gửi.';
    forgotMsg.classList.remove('hidden');
  }catch(err){
    forgotMsg.textContent=err.message;
    forgotMsg.classList.remove('hidden');
  }finally{
    submit.disabled=false; submit.textContent='Gửi link đặt lại mật khẩu';
  }
});
async function logout(){await api('/logout',{method:'POST',body:'{}'}).catch(()=>{});localStorage.removeItem('nr_client_token');location.href='/admin'}


const richEditor=document.getElementById('richEditor'),richToolbar=document.getElementById('richToolbar'),richFormat=document.getElementById('richFormat'),richImageFile=document.getElementById('richImageFile'),richStatus=document.getElementById('richStatus');
let nrTinyEditor=null;

function decodeRichEntities(raw=''){
 let out=String(raw||'');
 for(let i=0;i<4;i++){
  if(!/(?:&lt;|&#60;|&amp;lt;|&quot;|&#34;)/i.test(out))break;
  const ta=document.createElement('textarea');ta.innerHTML=out;const next=ta.value;
  if(next===out)break;out=next;
 }
 return out;
}
function normalizeArticleHtml(raw=''){
 const source=decodeRichEntities(raw);
 const tpl=document.createElement('template');tpl.innerHTML=source;
 const out=document.createElement('div');
 const safeUrl=v=>{try{const u=new URL(String(v||'').trim(),location.href);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
 const inlineTags=new Set(['STRONG','B','EM','I','U','S','BR','A','CODE','SUB','SUP']);
 const blockTags=new Set(['P','H2','H3','H4','UL','OL','LI','BLOCKQUOTE','FIGURE','FIGCAPTION','PRE','TABLE','THEAD','TBODY','TR','TH','TD']);
 function appendText(parent,text){if(!text)return;parent.appendChild(document.createTextNode(text))}
 function walk(node,parent){
  if(node.nodeType===Node.TEXT_NODE){appendText(parent,node.nodeValue||'');return}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  const tag=node.tagName;
  if(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','TEXTAREA','SELECT','OPTION','LINK','META','SVG','CANVAS','NOSCRIPT','VIDEO','AUDIO'].includes(tag))return;
  if(tag==='IMG'){
   const src=safeUrl(node.getAttribute('src')||node.getAttribute('data-src')||node.getAttribute('data-original')||node.getAttribute('data-lazy-src')||node.getAttribute('data-url'));
   if(!src)return;
   const img=document.createElement('img');img.src=src;img.alt=node.getAttribute('alt')||'';img.loading='lazy';img.decoding='async';parent.appendChild(img);return;
  }
  if(inlineTags.has(tag)){
   const el=document.createElement(tag==='B'?'strong':tag==='I'?'em':tag.toLowerCase());
   if(tag==='A'){
    const href=safeUrl(node.getAttribute('href'));if(!href){[...node.childNodes].forEach(c=>walk(c,parent));return}
    el.href=href;el.rel='noopener noreferrer';el.target='_blank';
   }
   [...node.childNodes].forEach(c=>walk(c,el));parent.appendChild(el);return;
  }
  if(blockTags.has(tag)){
   const el=document.createElement(tag.toLowerCase());
   if(['TH','TD'].includes(tag)){
    const colspan=parseInt(node.getAttribute('colspan')||'',10),rowspan=parseInt(node.getAttribute('rowspan')||'',10);
    if(colspan>1&&colspan<=10)el.setAttribute('colspan',String(colspan));
    if(rowspan>1&&rowspan<=50)el.setAttribute('rowspan',String(rowspan));
   }
   [...node.childNodes].forEach(c=>walk(c,el));
   if(['P','H2','H3','H4','LI','BLOCKQUOTE','FIGCAPTION','PRE','TH','TD'].includes(tag)){
    if(!el.textContent.trim()&&!el.querySelector('img,br'))return;
   }
   parent.appendChild(el);return;
  }
  // External-site layout wrappers are intentionally flattened.
  [...node.childNodes].forEach(c=>walk(c,parent));
 }
 [...tpl.content.childNodes].forEach(n=>walk(n,out));
 const normalized=document.createElement('div');let p=null;
 [...out.childNodes].forEach(n=>{
  const isBlock=n.nodeType===Node.ELEMENT_NODE&&['P','H2','H3','H4','UL','OL','BLOCKQUOTE','FIGURE','PRE','TABLE'].includes(n.tagName);
  if(isBlock){p=null;normalized.appendChild(n);return}
  if(!p){p=document.createElement('p');normalized.appendChild(p)}p.appendChild(n);
 });
 normalized.querySelectorAll('p').forEach(x=>{if(!x.textContent.trim()&&!x.querySelector('img,br'))x.remove()});
 normalized.querySelectorAll('figure').forEach(f=>{
  if(!f.querySelector('img')){[...f.childNodes].forEach(n=>f.parentNode.insertBefore(n,f));f.remove()}
 });
 normalized.querySelectorAll('img').forEach(img=>{
  img.removeAttribute('width');img.removeAttribute('height');img.removeAttribute('style');img.removeAttribute('class');
  img.setAttribute('loading','lazy');img.setAttribute('decoding','async');
 });
 return normalized.innerHTML.trim();
}
function cleanPastedArticleHtml(raw=''){return normalizeArticleHtml(raw)}
function richHtml(){return nrTinyEditor?nrTinyEditor.getContent({format:'html'}):(postContent?.value||richEditor?.innerHTML||'')}
function syncRichToTextarea(){
 const normalized=normalizeArticleHtml(richHtml());
 if(postContent)postContent.value=normalized;
 return normalized;
}
function setRichContent(html=''){
 const raw=String(html||'');
 const clean=raw?normalizeArticleHtml(raw):'';
 if(postContent)postContent.value=clean;
 if(nrTinyEditor)nrTinyEditor.setContent(clean||'');
 else if(richEditor)richEditor.innerHTML=clean;
}
function focusRich(){if(nrTinyEditor)nrTinyEditor.focus();else richEditor?.focus()}
function richCommand(cmd,value=null){if(nrTinyEditor)return;focusRich();document.execCommand(cmd,false,value);syncRichToTextarea()}

richToolbar?.addEventListener('click',e=>{if(nrTinyEditor)return;
 const btn=e.target.closest('button[data-cmd]');if(!btn)return;richCommand(btn.dataset.cmd);
});
richFormat?.addEventListener('change',()=>{if(nrTinyEditor)return;richCommand('formatBlock',richFormat.value);richFormat.value='p'});
document.getElementById('richLink')?.addEventListener('click',()=>{if(nrTinyEditor)return;
 const url=prompt('Nhập đường dẫn liên kết (https://...)','https://');if(!url)return;richCommand('createLink',url);
});
document.getElementById('richImage')?.addEventListener('click',()=>richImageFile?.click());
richEditor?.addEventListener('input',()=>{if(!nrTinyEditor)syncRichToTextarea()});
richEditor?.addEventListener('blur',()=>{if(!nrTinyEditor)syncRichToTextarea()});
richEditor?.addEventListener('paste',e=>{if(nrTinyEditor)return;
 const cb=e.clipboardData;if(!cb){setTimeout(syncRichToTextarea,0);return}
 const rich=cb.getData('text/html'),plain=cb.getData('text/plain');if(!rich&&!plain)return;
 e.preventDefault();
 let html=rich?normalizeArticleHtml(rich):'';
 if(!html){const text=String(plain||'');html=text.split(/\n{2,}/).map(x=>`<p>${x.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])).replace(/\n/g,'<br>')}</p>`).join('')}
 document.execCommand('insertHTML',false,html);syncRichToTextarea();
});

async function uploadEditorBlob(file){
 if(!file)throw new Error('Không có ảnh để tải lên');
 if(file.size>8*1024*1024)throw new Error('Ảnh vượt quá 8 MB');
 const fd=new FormData();fd.append('file',file);
 const tk=localStorage.getItem('nr_client_token')||'';
 const r=await fetch(tenantUrl('/upload'),{method:'POST',body:fd,credentials:'include',headers:tk?{'Authorization':'Bearer '+tk}:{}});
 const d=await r.json();if(!r.ok)throw new Error(d.error||'Tải ảnh thất bại');
 return d.url;
}

function initNewsrealEditor(){
 if(!postContent||!window.tinymce||nrTinyEditor)return Promise.resolve(false);
 richToolbar?.classList.add('legacy-rich-toolbar-hidden');
 richEditor?.classList.add('nr-editor-fallback-hidden');
 document.documentElement.classList.add('nr-tinymce-loading');
 return tinymce.init({
  selector:'#postContent',
  base_url:'https://cdn.jsdelivr.net/npm/tinymce@7',
  suffix:'.min',
  license_key:'gpl',
  height:560,
  menubar:'edit view insert format tools table help',
  plugins:'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime table help wordcount',
  toolbar:'undo redo | blocks | bold italic underline strikethrough | bullist numlist blockquote | link image table | alignleft aligncenter alignright | removeformat | code fullscreen preview',
  toolbar_mode:'sliding',
  statusbar:true,
  branding:false,
  promotion:false,
  convert_urls:false,
  relative_urls:false,
  remove_script_host:false,
  valid_elements:'p,h2,h3,h4,strong/b,em/i,u,s,br,a[href|target|rel],ul,ol,li,blockquote,figure,figcaption,img[src|alt|loading|decoding],pre,code,sub,sup,table,thead,tbody,tr,th[colspan|rowspan],td[colspan|rowspan]',
  extended_valid_elements:'img[src|alt|loading|decoding]',
  content_style:'body{font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.75;color:#182230;max-width:820px;margin:0 auto;padding:22px} img{display:block;max-width:100%;width:auto;height:auto;margin:18px auto;object-fit:contain} figure{max-width:100%;margin:22px auto} figcaption{text-align:center;font-size:14px;color:#687386;margin-top:8px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #d9e2ec;padding:8px} blockquote{border-left:4px solid #cbd5e1;margin-left:0;padding-left:16px;color:#475569}',
  automatic_uploads:true,
  images_upload_handler:async blobInfo=>{
   if(richStatus)richStatus.textContent='Đang tải ảnh vào bài viết...';
   try{
    const url=await uploadEditorBlob(blobInfo.blob());
    if(richStatus)richStatus.textContent='Đã tải ảnh.';
    return url;
   }catch(e){
    if(richStatus)richStatus.textContent=e.message||'Không tải được ảnh';
    throw e;
   }
  },
  file_picker_types:'image',
  file_picker_callback:(cb,value,meta)=>{
   if(meta.filetype!=='image')return;
   const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';
   input.onchange=async()=>{
    const file=input.files?.[0];if(!file)return;
    try{const url=await uploadEditorBlob(file);cb(url,{alt:file.name.replace(/\.[^.]+$/,'')})}
    catch(e){alert(e.message||'Không tải được ảnh')}
   };
   input.click();
  },
  setup:editor=>{
   editor.on('init',()=>{
    nrTinyEditor=editor;
    const initial=normalizeArticleHtml(postContent.value||'');
    if(initial)editor.setContent(initial);
    document.documentElement.classList.remove('nr-tinymce-loading');
    document.documentElement.classList.add('nr-tinymce-ready');
    syncRichToTextarea();
   });
   editor.on('change input undo redo SetContent',()=>{if(nrTinyEditor===editor)syncRichToTextarea()});
   editor.on('PastePreProcess',args=>{
    args.content=normalizeArticleHtml(args.content||'');
    if(richStatus){richStatus.textContent='Đã chuẩn hóa nội dung từ website nguồn.';setTimeout(()=>{if(richStatus.textContent.includes('chuẩn hóa'))richStatus.textContent=''},2200)}
   });
  }
 }).then(editors=>{nrTinyEditor=editors?.[0]||nrTinyEditor;return !!nrTinyEditor}).catch(err=>{
  console.warn('TinyMCE init failed; using fallback editor',err);
  document.documentElement.classList.remove('nr-tinymce-loading');
  richToolbar?.classList.remove('legacy-rich-toolbar-hidden');
  richEditor?.classList.remove('nr-editor-fallback-hidden');
  postContent?.classList.add('hidden');
  return false;
 });
}
initNewsrealEditor();

async function uploadEditorImage(file){
 if(!file)return;
 if(file.size>8*1024*1024){richStatus.textContent='Ảnh vượt quá 8 MB';return}
 richStatus.textContent='Đang tải ảnh vào bài viết...';
 try{
  const url=await uploadEditorBlob(file);
  if(nrTinyEditor){
   nrTinyEditor.insertContent(`<figure><img src="${url}" alt="" loading="lazy" decoding="async"><figcaption>Chú thích ảnh</figcaption></figure><p><br></p>`);
  }else{
   focusRich();document.execCommand('insertHTML',false,`<figure><img src="${url}" alt=""><figcaption>Chú thích ảnh</figcaption></figure><p><br></p>`);
  }
  syncRichToTextarea();richStatus.textContent='Đã chèn ảnh vào nội dung.';
 }catch(e){richStatus.textContent=e.message||'Không tải được ảnh'}
}
richImageFile?.addEventListener('change',async()=>{const f=richImageFile.files?.[0];await uploadEditorImage(f);richImageFile.value=''});

const formErrors=document.getElementById('formErrors'), submitPostBtn=document.getElementById('submitPostBtn');
const postStatus=document.getElementById('status');

function clearFieldErrors(){
  document.querySelectorAll('#postForm .field-error').forEach(x=>x.classList.remove('field-error'));
  document.querySelectorAll('#postForm .field-error-text').forEach(x=>x.remove());
  formErrors.classList.add('hidden'); formErrors.innerHTML='';
}
function markError(el,msg){
  if(!el)return;
  el.classList.add('field-error');
  const note=document.createElement('div'); note.className='field-error-text'; note.textContent=msg;
  el.insertAdjacentElement('afterend',note);
}
function validatePost(){
  syncRichToTextarea();
  clearFieldErrors();
  const errors=[];
  const add=(el,msg)=>{if(!String(el?.value||'').trim()){errors.push({el,msg});markError(el,msg)}};
  add(postTitle,isNewsTemplate()?'Vui lòng nhập tiêu đề bài viết.':'Vui lòng nhập tiêu đề tin.');
  if(postType.value==='property'){
    add(postPrice,'Vui lòng nhập giá bất động sản.');
    add(postArea,'Vui lòng nhập diện tích.');
    add(province,'Vui lòng nhập Tỉnh/Thành phố.');
    add(district,'Vui lòng nhập Quận/Huyện.');
    add(postAddress,'Vui lòng nhập địa chỉ chi tiết.');
    add(contactName,'Vui lòng nhập tên người liên hệ.');
    add(postPhone,'Vui lòng nhập số điện thoại.');
    if(!String(postImage.value||'').trim() && uploadedImages.length===0){
      errors.push({el:imageFiles,msg:'Vui lòng tải ít nhất 1 ảnh hoặc nhập URL ảnh đại diện.'});
      markError(document.querySelector('.upload-drop'),'Vui lòng tải ít nhất 1 ảnh hoặc nhập URL ảnh đại diện.');
    }
  }
  add(postContent,isNewsTemplate()?'Vui lòng nhập nội dung bài viết.':'Vui lòng nhập nội dung chi tiết.');
  if(postPhone.value && !/^[0-9+\s().-]{8,20}$/.test(postPhone.value.trim())){
    errors.push({el:postPhone,msg:'Số điện thoại chưa đúng định dạng.'}); markError(postPhone,'Số điện thoại chưa đúng định dạng.');
  }
  if(errors.length){
    formErrors.innerHTML='<b>Chưa thể đăng tin.</b><div>Vui lòng kiểm tra các mục sau:</div><ul>'+errors.map(x=>`<li>${x.msg}</li>`).join('')+'</ul>';
    formErrors.classList.remove('hidden');
    const first=errors[0].el;
    (first?.scrollIntoView?first:formErrors).scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>{if(first?.focus)first.focus()},350);
    return false;
  }
  return true;
}
function updateSubmitLabel(){
  if(!submitPostBtn)return;
  submitPostBtn.textContent=postStatus.value==='draft'?'Lưu bản nháp':(editingId.value?(isNewsTemplate()?'Cập nhật bài viết':'Cập nhật tin'):(isNewsTemplate()?'Đăng bài':'Đăng tin'));
}
postStatus.addEventListener('change',updateSubmitLabel);


function fillCategoryOptions(keep=''){
  const current=keep||postCategory.value||'',profile=resolvedContentProfile();
  let list=[];
  // Never infer a News category list from categoriesByTransaction. Older/stale
  // property profiles may still carry that object and previously produced an
  // empty dropdown for News Trial sites.
  if(isNewsTemplate()||isServiceTemplate()||profile.content_type==='news'||profile.content_type==='service')list=Array.isArray(profile.categories)?profile.categories:[];
  else if(profile.categoriesByTransaction)list=profile.categoriesByTransaction[transaction.value]||[];
  else list=Array.isArray(profile.categories)?profile.categories:[];
  list=[...new Set(list.map(x=>String(x||'').trim()).filter(Boolean))];
  postCategory.innerHTML='<option value="">Chọn chuyên mục</option>'+list.map(x=>`<option value="${x}">${x}</option>`).join('');
  if(current&&!list.includes(current))postCategory.insertAdjacentHTML('beforeend',`<option value="${current}">${current}</option>`);
  if(current)postCategory.value=current;
}

const propertyOnlyEls=[...document.querySelectorAll('.property-only')];
const contentTypeHint=document.getElementById('contentTypeHint');
const editorHelp=document.getElementById('editorHelp');
const imageSectionTitle=document.getElementById('imageSectionTitle');
function updateContentTypeUI(){
  if(isNewsTemplate())postType.value='news';if(isServiceTemplate())postType.value='service';
  const isNews=postType.value==='news',isService=postType.value==='service',isSimple=isNews||isService;
  propertyOnlyEls.forEach(el=>el.classList.toggle('hidden',isSimple));
  editorTitle.textContent=editingId.value?(isService?'Chỉnh sửa gói dịch vụ':isNews?'Chỉnh sửa tin tức':'Chỉnh sửa tin bất động sản'):(isService?'Thêm gói dịch vụ':isNews?'Đăng bài tin tức':'Đăng tin bất động sản');
  contentTypeHint.textContent=isService?'Dịch vụ: quản lý gói cước, thông số, giá, ưu đãi và nội dung tư vấn.':isNews?'Tin tức: chỉ cần tiêu đề, chuyên mục, hình ảnh và nội dung bài viết.':'Bất động sản: hiển thị giá, diện tích, vị trí và thông số chi tiết.';
  editorHelp.textContent=isService?'Điền thông tin gói dịch vụ; các trường riêng của template sẽ hiển thị tự động.':isNews?'Giao diện đã ẩn các trường bất động sản để bạn viết bài đơn giản và dễ nhìn hơn.':'Điền thông tin chi tiết để tin đăng hiển thị đầy đủ trên website.';
  imageSectionTitle.textContent=isService?'Hình ảnh dịch vụ':isNews?'Hình ảnh bài viết':'Hình ảnh bất động sản';
  fillCategoryOptions(postCategory.value);
}
postType.addEventListener('change',updateContentTypeUI);transaction.addEventListener('change',()=>fillCategoryOptions(postCategory.value));


postForm.addEventListener('submit',async e=>{e.preventDefault();if(!validatePost())return;const normalizedContent=normalizeArticleHtml(richHtml());if(postContent)postContent.value=normalizedContent;if(nrTinyEditor)nrTinyEditor.setContent(normalizedContent);else if(richEditor)richEditor.innerHTML=normalizedContent;submitPostBtn.disabled=true;submitPostBtn.textContent='Đang xử lý...';const isNews=postType.value==='news',isService=postType.value==='service',isSimple=isNews||isService;const b={type:postType.value,transaction:isSimple?'':transaction.value,property_type:isSimple?'':propertyType.value,title:postTitle.value,price:isSimple?'':postPrice.value,area:isSimple?'':postArea.value,unit_price:isSimple?'':unitPrice.value,listing_code:listingCode.value,bedrooms:isSimple?null:(+bedrooms.value||null),bathrooms:isSimple?null:(+bathrooms.value||null),floors:isSimple?null:(+floors.value||null),frontage:isSimple?'':frontage.value,direction:isSimple?'':direction.value,legal:isSimple?'':legal.value,furniture:isSimple?'':furniture.value,province:isSimple?'':province.value,district:isSimple?'':district.value,ward:isSimple?'':ward.value,address:isSimple?'':postAddress.value,image:postImage.value,gallery:gallery.value,contact_name:isSimple?'':contactName.value,phone:isSimple?'':postPhone.value,category:postCategory.value,content:postContent.value,extra_json:JSON.stringify(collectProfileFields()),featured:featured.checked?1:0,verified:verified.checked?1:0,status:postStatus.value};const id=editingId.value;try{
await api('/posts'+(id?'?id='+id:''),{method:id?'PUT':'POST',body:JSON.stringify(b)});
postMsg.textContent=b.status==='draft'?'Đã lưu bản nháp.':(id?'Đã cập nhật tin thành công.':'Đã đăng tin thành công.');
postMsg.classList.remove('hidden');postForm.reset();setRichContent('');renderProfileFields();uploadedImages=[];renderImages();editingId.value='';editorTitle.textContent=isServiceTemplate()?'Thêm gói dịch vụ':isNewsTemplate()?'Đăng bài tin tức':'Đăng tin bất động sản';if(isNewsTemplate())postType.value='news';if(isServiceTemplate())postType.value='service';updateContentTypeUI();clearFieldErrors();
}catch(err){
formErrors.innerHTML='<b>Không thể lưu tin.</b><div>'+String(err.message||err)+'</div>';formErrors.classList.remove('hidden');formErrors.scrollIntoView({behavior:'smooth',block:'center'});
}finally{submitPostBtn.disabled=false;updateSubmitLabel()}});
async function loadPosts(){
 const d=await api('/posts');allPosts=d.posts||[];
 const newsMode=isNewsTemplate();
 const rows=newsMode?allPosts.filter(x=>x.type==='news'):allPosts;
 postTable.innerHTML=`<div style="overflow:auto"><table class="table"><thead><tr><th>Tiêu đề</th>${newsMode?'<th>Chuyên mục</th>':'<th>Loại</th><th>Giá</th>'}<th>Trạng thái</th><th>Lượt xem</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${x.title}</b><div>${newsMode?(x.category||'Tin tức'):(x.listing_code||'')}</div></td>${newsMode?`<td>${x.category||'Tin tức'}</td>`:`<td>${x.type==='property'?'BĐS':'Tin tức'}</td><td>${x.price||''}</td>`}<td><span class="status-pill ${x.status==='published'?'status-published':'status-draft'}">${x.status==='published'?'Đã đăng':'Bản nháp'}</span></td><td>${x.views||0}</td><td><button class="smallbtn soft" onclick="editPost(${x.id})">Sửa</button> <button class="smallbtn danger" onclick="delPost(${x.id})">Xóa</button></td></tr>`).join('')}</tbody></table></div>`;
}
function editPost(id){const x=allPosts.find(p=>p.id===id);uploadedImages=[x.image,...String(x.gallery||'').split(',').map(v=>v.trim()).filter(Boolean)].filter(Boolean);renderImages();editingId.value=x.id;postType.value=isServiceTemplate()?'service':isNewsTemplate()?'news':(x.type||'property');updateContentTypeUI();transaction.value=x.transaction||'sale';propertyType.value=x.property_type||'Nhà phố';postTitle.value=x.title||'';postPrice.value=x.price||'';postArea.value=x.area||'';unitPrice.value=x.unit_price||'';listingCode.value=x.listing_code||'';bedrooms.value=x.bedrooms||'';bathrooms.value=x.bathrooms||'';floors.value=x.floors||'';frontage.value=x.frontage||'';direction.value=x.direction||'';legal.value=x.legal||'';furniture.value=x.furniture||'';province.value=x.province||'';district.value=x.district||'';ward.value=x.ward||'';postAddress.value=x.address||'';postImage.value=x.image||'';gallery.value=x.gallery||'';contactName.value=x.contact_name||'';postPhone.value=x.phone||'';fillCategoryOptions(x.category||'');setRichContent(x.content||'');renderProfileFields(parseExtraJson(x.extra_json));featured.checked=!!x.featured;verified.checked=!!x.verified;postStatus.value=x.status||'published';editorTitle.textContent='Chỉnh sửa tin';showTab('newpost');updateSubmitLabel()}
async function delPost(id){if(confirm('Xóa tin này?')){await api('/posts?id='+id,{method:'DELETE'});loadPosts()}}
async function loadStats(){const d=await api('/stats');stat7.textContent=d.last7;stat30.textContent=d.last30;statAll.textContent=d.all;topPosts.innerHTML=`<table class="table">${d.top.map(x=>`<tr><td>${x.title}</td><td>${x.views||0}</td></tr>`).join('')}</table>`}
editWebsiteSettings?.addEventListener('click',()=>{
 websiteSettingsSnapshot=captureWebsiteSettings();
 setWebsiteSettingsEditing(true);
 setPhone?.focus();
});
cancelWebsiteSettings?.addEventListener('click',()=>{
 if(websiteSettingsSnapshot){
  setName.value=websiteSettingsSnapshot.name||'';
  setPhone.value=websiteSettingsSnapshot.phone||'';
  setZalo.value=websiteSettingsSnapshot.zalo||'';
  setEmail.value=websiteSettingsSnapshot.email||'';
  setFacebook.value=websiteSettingsSnapshot.facebook||'';
 }
 setWebsiteSettingsEditing(false);
});
settingsForm.addEventListener('submit',async e=>{
 e.preventDefault();
 const btn=e.submitter||settingsForm.querySelector('button[type="submit"],button');
 const oldText=btn?.textContent||'Lưu cài đặt';
 if(btn){btn.disabled=true;btn.textContent='Đang lưu...'}
 try{
   await api('/settings',{method:'PUT',body:JSON.stringify({
     name:setName.value,phone:setPhone.value,zalo:setZalo.value,email:setEmail.value,facebook:setFacebook.value
   })});
   const fresh=await api('/me');
   setName.value=cleanSiteName(fresh.site.name||'');
   setPhone.value=fresh.site.phone||'';
   setZalo.value=fresh.site.zalo||'';
   setEmail.value=fresh.site.email||fresh.site.contact_email||'';
   setFacebook.value=fresh.site.facebook||'';
   websiteSettingsSnapshot=captureWebsiteSettings();
   setWebsiteSettingsEditing(false);
   alert('Đã lưu thông tin website. Thông tin mới đã được cập nhật ra website.');
 }catch(err){alert('Không lưu được cài đặt: '+err.message)}
 finally{if(btn){btn.disabled=false;btn.textContent=oldText}}
});
passwordForm.addEventListener('submit',async e=>{e.preventDefault();await api('/password',{method:'PUT',body:JSON.stringify({old_password:oldPassword.value,new_password:newPassword.value})});alert('Đổi mật khẩu thành công');passwordForm.reset()});
updateSubmitLabel();
updateContentTypeUI();
if(handoverParam){
 consumeHandover().then(ok=>{ if(ok)boot(); else boot(); });
}else boot();


function money(v){return Number(v||0).toLocaleString('vi-VN')+'đ'}
function dateVN(v){if(!v)return '—';const x=String(v).slice(0,10).split('-');return x.length===3?`${x[2]}/${x[1]}/${x[0]}`:v}
function payText(v){return ({paid:'Đã thanh toán',partial:'Thanh toán một phần',unpaid:'Chưa thanh toán'})[v]||v||'—'}
function renewalText(x){const st=String(x?.renewal_stage||'none');if(st==='renewed')return '✓ Gia hạn thành công';if(st==='paid')return '✓ Đã thanh toán · đang chờ gia hạn domain';if(st==='payment_pending')return 'Đang chờ thanh toán';if(st==='declined'||x?.renewal_status==='no')return 'Không gia hạn';return 'Chưa yêu cầu'}
async function loadService(){
 const box=document.getElementById('servicePanel');if(!box)return;
 box.innerHTML='<div class="muted">Đang tải thông tin dịch vụ...</div>';
 try{
  const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('Tải thông tin dịch vụ quá lâu. Vui lòng thử lại.')),12000));
  const d=await Promise.race([api('/service-info'),timeout]),x=d.service||{};
  const start=x.started_at||x.domain_registered_at, exp=x.expires_at||x.domain_expires_at;
  let days='';if(exp){days=Math.ceil((new Date(exp+'T23:59:59')-new Date())/86400000)}
  box.innerHTML=`<div class="client-service-hero"><div><small>GÓI ĐANG SỬ DỤNG</small><h2>${x.plan_name||'Gói website trọn gói'}</h2><b>${d.site.domain||''}</b></div><div class="service-expiry"><small>HẾT HẠN</small><strong>${dateVN(exp)}</strong><span>${days!==''?(days>=0?'Còn '+days+' ngày':'Đã quá hạn '+Math.abs(days)+' ngày'):''}</span></div></div>
  <div class="service-grid"><div><span>Thời hạn</span><b>${Number(x.term_months||12)} tháng</b></div><div><span>Trạng thái dịch vụ</span><b>${x.service_status==='ready'||x.service_status==='active'?'Đang hoạt động':(x.service_status||'—')}</b></div><div><span>Domain</span><b>${d.site.domain||'—'}</b><small>${x.domain_status==='active'?'✓ Đang hoạt động':x.domain_status||''}</small></div><div><span>Thanh toán</span><b>${payText(x.payment_status)}</b></div><div><span>Ngày bắt đầu</span><b>${dateVN(start)}</b></div><div><span>Ngày hết hạn</span><b>${dateVN(x.expires_at)}</b></div></div>
  <div class="client-promo"><div><span>ƯU ĐÃI KÍCH HOẠT LẦN ĐẦU</span><h3>${x.promotion_name||'Ưu đãi khách hàng mới'}</h3></div><div class="price-lines"><p>Giá niêm yết <del>${money(x.list_price)}</del></p><p>Giảm lần đầu <b>-${money(x.first_discount)}</b></p><p class="first-price">Thanh toán lần đầu <strong>${money(x.first_price)}</strong></p><p>Giá gia hạn từ năm thứ 2 <strong>${money(x.renewal_price)} / ${Number(x.term_months||12)} tháng</strong></p></div></div>
  <div class="client-renew"><div><span>GIA HẠN DỊCH VỤ</span><h3>${renewalText(x)}</h3><p>${x.renewal_stage==='renewed'?`Dịch vụ đã được gia hạn thành công. Ngày hết hạn mới: <b>${dateVN(x.expires_at)}</b>.`:x.renewal_stage==='paid'?`Đã nhận thanh toán cho ${Math.round(Number(x.renewal_selected_months||12)/12)} năm. Bộ phận quản lý đang gia hạn domain; ngày hết hạn website sẽ tự cập nhật theo domain sau khi hoàn tất.`:x.renewal_stage==='payment_pending'?'Giao dịch đang chờ VietQR xác nhận. Bạn có thể mở lại thanh toán để tiếp tục.':'Chọn thời hạn và thanh toán bằng QR VietinBank. Sau khi VietQR xác nhận tiền, Master sẽ nhận cảnh báo tự động và chỉ cần gia hạn domain.'}</p></div><div class="client-renew-pay"><select id="clientRenewYears" ${(x.renewal_stage==='paid'||x.renewal_stage==='renewed')?'disabled':''}><option value="1">1 năm · ${money(x.renewal_price)}</option><option value="2">2 năm · ${money(Number(x.renewal_price||0)*2)}</option><option value="3">3 năm · ${money(Number(x.renewal_price||0)*3)}</option></select><button id="clientRenewBtn" class="btn primary" ${(x.renewal_stage==='paid'||x.renewal_stage==='renewed')?'disabled':''}>${x.renewal_stage==='renewed'?'✓ Gia hạn thành công':x.renewal_stage==='paid'?'✓ Đã thanh toán':'Thanh toán gia hạn'}</button></div></div>`;
  const b=document.getElementById('clientRenewBtn');if(b&&!b.disabled)b.onclick=requestRenewal;
 }catch(e){box.innerHTML=`<div class="error"><b>Không tải được thông tin dịch vụ.</b><br>${e.message}<br><button type="button" class="smallbtn soft" id="retryServiceBtn">Thử lại</button></div>`;const rb=document.getElementById('retryServiceBtn');if(rb)rb.onclick=loadService}
}
let __renewPayTimer=null;
function showRenewalPayModal(p){
 let modal=document.getElementById('clientRenewPayModal');
 if(!modal){
  modal=document.createElement('div');modal.id='clientRenewPayModal';modal.className='client-renew-modal';
  modal.innerHTML=`<div class="client-renew-modal-card"><button class="client-renew-close" type="button">×</button><span>THANH TOÁN GIA HẠN</span><h3>Quét QR MB / payOS</h3><div class="client-renew-qr"></div><a class="client-renew-checkout hidden" target="_blank" rel="noopener">Mở trang thanh toán payOS ↗</a><div class="client-renew-bank"></div><div class="client-renew-row"><span>Số tiền</span><b class="client-renew-amount"></b></div><div class="client-renew-row"><span>Nội dung CK</span><b class="client-renew-memo"></b></div><div class="client-renew-wait">● Đang chờ payOS xác nhận giao dịch…</div><div class="client-renew-ok hidden"></div><small>QR được tạo riêng cho giao dịch này. Hệ thống chỉ xác nhận khi webhook payOS có chữ ký hợp lệ.</small></div>`;
  document.body.appendChild(modal);modal.querySelector('.client-renew-close').onclick=()=>modal.remove();
 }
 const qr=modal.querySelector('.client-renew-qr');qr.innerHTML='';
 if(p.qr_code&&window.QRCode){new QRCode(qr,{text:p.qr_code,width:300,height:300,correctLevel:QRCode.CorrectLevel.M})}else if(p.qr_url){const im=document.createElement('img');im.src=p.qr_url;im.alt='QR thanh toán';qr.appendChild(im)}
 const ck=modal.querySelector('.client-renew-checkout');if(p.checkout_url){ck.href=p.checkout_url;ck.classList.remove('hidden')}else ck.classList.add('hidden');
 modal.querySelector('.client-renew-bank').innerHTML=`<b>${p.bank_name||'MB Bank'}${p.account_number?' · '+p.account_number:''}</b><small>${p.account_name||''}</small>`;
 modal.querySelector('.client-renew-amount').textContent=money(p.amount);
 modal.querySelector('.client-renew-memo').textContent=p.memo||p.order_code;
 clearInterval(__renewPayTimer);
 const check=async()=>{try{const d=await fetch(`/api/renewal/payment-status?order_code=${encodeURIComponent(p.order_code)}&token=${encodeURIComponent(p.payment_token)}`,{cache:'no-store'}).then(r=>r.json());if(d.status==='paid'){clearInterval(__renewPayTimer);modal.querySelector('.client-renew-wait').classList.add('hidden');const ok=modal.querySelector('.client-renew-ok');ok.classList.remove('hidden');ok.innerHTML=`✓ Thanh toán <b>${money(d.amount)}</b> thành công.<br>Yêu cầu đã chuyển sang Master Control. Vui lòng chờ bộ phận quản lý gia hạn domain; thời hạn website sẽ tự cập nhật sau khi hoàn tất.`;await loadService()}}catch(e){}};
 check();__renewPayTimer=setInterval(check,4000);
}
async function requestRenewal(){const b=document.getElementById('clientRenewBtn'),years=Number(document.getElementById('clientRenewYears')?.value||1);if(!confirm(`Thanh toán gia hạn ${years} năm?`))return;b.disabled=true;b.textContent='Đang tạo QR...';try{const d=await api('/request-renewal',{method:'POST',body:JSON.stringify({years})});showRenewalPayModal(d.payment);b.disabled=false;b.textContent='Mở lại thanh toán'}catch(e){alert(e.message);b.disabled=false;b.textContent='Thanh toán gia hạn'}}

if(trialParam){
 document.addEventListener('DOMContentLoaded',()=>{
  const bar=document.createElement('div');bar.className='admin-trial-bar';bar.innerHTML='<div class="admin-trial-info"><span class="admin-trial-badge">DÙNG THỬ MIỄN PHÍ</span><div class="admin-trial-time"><small>Thời gian còn lại</small><strong id="adminTrialClock"><span>--</span><i>:</i><span>--</span><i>:</i><span>--</span></strong></div></div><div class="admin-trial-actions"><a id="adminTrialViewSite" href="#">← Xem website</a><button type="button" id="adminTrialBuy">Đăng ký sử dụng</button></div>';document.body.prepend(bar);
  let expiryMs=0,expiredShown=false,trialCommercial={price:0,renewal_price:0};
  const moneyVN=n=>Number(n||0)>0?new Intl.NumberFormat('vi-VN').format(Number(n))+'đ':'Liên hệ';
  const buy=async()=>{const key=new URLSearchParams(location.search).get('template')||'';try{const r=await fetch('/api/trial/convert-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:trialParam})}),d=await r.json();location.href=d.register_url||('/?template='+encodeURIComponent(key)+'&trial_token='+encodeURIComponent(trialParam)+'#dang-ky')}catch(e){location.href='/?template='+encodeURIComponent(key)+'&trial_token='+encodeURIComponent(trialParam)+'#dang-ky'}};
  const paint=()=>{const el=document.getElementById('adminTrialClock');if(!el||!expiryMs)return;const n=Math.max(0,Math.floor((expiryMs-Date.now())/1000)),h=Math.floor(n/3600),m=Math.floor((n%3600)/60),s=n%60;el.innerHTML='<span>'+String(h).padStart(2,'0')+'</span><i>:</i><span>'+String(m).padStart(2,'0')+'</span><i>:</i><span>'+String(s).padStart(2,'0')+'</span>';if(n<=0&&!expiredShown){expiredShown=true;expired()}};
  const expired=()=>{if(document.querySelector('.admin-trial-expired'))return;loginPanel?.classList.add('hidden');dashboard?.classList.add('hidden');const p=trialCommercial.price;const priceLine=p?'<div class="admin-trial-expired-price"><small>GÓI WEBSITE NÀY</small><strong>'+moneyVN(p)+' <em>/ năm đầu</em></strong></div>':'';const x=document.createElement('div');x.className='admin-trial-expired';x.innerHTML='<div><div class="admin-expired-icon">⌛</div><small>DÙNG THỬ ĐÃ KẾT THÚC</small><h2>Bạn muốn tiếp tục với giao diện này?</h2>'+priceLine+'<p>Đăng ký để tiếp tục quản trị website. <b>Toàn bộ bài viết bạn đã đăng sẽ được giữ nguyên.</b></p><button id="adminExpiredBuy">Đăng ký gói website này</button></div>';document.body.appendChild(x);document.getElementById('adminExpiredBuy').onclick=buy};
  const sync=async()=>{try{const d=await (await fetch('/api/trial/status?token='+encodeURIComponent(trialParam),{cache:'no-store'})).json(),tr=d.trial||{},tpl=d.template||{};trialCommercial={price:Number(tpl.price||0),renewal_price:Number(tpl.renewal_price||0)};const view=document.getElementById('adminTrialViewSite');if(view&&d.website_url)view.href=d.website_url;expiryMs=Date.parse(String(tr.expires_at||'').replace(' ','T')+'Z')||Date.now()+Math.max(0,Number(tr.remaining_seconds||0))*1000;paint();if(tr.expired){expiredShown=true;expired()}}catch(e){}};
  document.getElementById('adminTrialBuy').onclick=buy;sync();setInterval(paint,1000);setInterval(sync,60000);
 })
}


// V20.6.0 — Service lead inbox owned by each tenant.
async function loadServiceLeads(){
 const box=document.getElementById('serviceLeadsPanel');if(!box)return;box.innerHTML='<div class="muted">Đang tải yêu cầu tư vấn...</div>';
 try{const d=await api('/service-leads');const rows=d.leads||[];if(!rows.length){box.innerHTML='<div class="empty">Chưa có khách hàng gửi yêu cầu tư vấn.</div>';return}
 box.innerHTML='<div class="lead-table">'+rows.map(x=>`<article class="lead-row"><div><b>${esc(x.customer_name||'Khách hàng')}</b><a href="tel:${esc(x.phone||'')}">${esc(x.phone||'')}</a><small>${esc([x.province,x.district].filter(Boolean).join(' · ')||'Chưa chọn khu vực')}</small></div><div><span class="tag">${esc(x.package_category||'Tư vấn chung')}</span><b>${esc(x.package_title||x.need||'Cần tư vấn dịch vụ')}</b><small>${esc(x.need||'')}</small></div><label>Trạng thái<select data-lead-status="${x.id}"><option value="new" ${x.status==='new'?'selected':''}>Mới</option><option value="contacted" ${x.status==='contacted'?'selected':''}>Đã liên hệ</option><option value="consulting" ${x.status==='consulting'?'selected':''}>Đang tư vấn</option><option value="installed" ${x.status==='installed'?'selected':''}>Đã lắp</option><option value="lost" ${x.status==='lost'?'selected':''}>Không thành công</option></select></label><label>Ghi chú<textarea data-lead-note="${x.id}" placeholder="Ghi chú chăm sóc">${esc(x.note||'')}</textarea></label><button class="btn" onclick="saveServiceLead(${x.id})">Lưu</button></article>`).join('')+'</div>'}catch(e){box.innerHTML='<div class="error">'+esc(e.message||'Không tải được danh sách')+'</div>'}
}
async function saveServiceLead(id){const status=document.querySelector(`[data-lead-status="${id}"]`)?.value||'new',note=document.querySelector(`[data-lead-note="${id}"]`)?.value||'';try{await api('/service-leads',{method:'PUT',body:JSON.stringify({id,status,note})});loadServiceLeads()}catch(e){alert(e.message||'Không lưu được')}}
window.saveServiceLead=saveServiceLead;
