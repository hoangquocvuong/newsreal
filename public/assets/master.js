
const masterLogin=document.getElementById('masterLogin');
const masterDashboard=document.getElementById('masterDashboard');
const masterLoginForm=document.getElementById('masterLoginForm');
const masterKey=document.getElementById('masterKey');
const masterLoginMsg=document.getElementById('masterLoginMsg');
const mSites=document.getElementById('mSites');
const mActive=document.getElementById('mActive');
const mPosts=document.getElementById('mPosts');
const mViews=document.getElementById('mViews');
const mToday=document.getElementById('mToday');
const siteRows=document.getElementById('siteRows');
const openCreateSite=document.getElementById('openCreateSite');
const createSiteModal=document.getElementById('createSiteModal');
const closeCreateSite=document.getElementById('closeCreateSite');
const createSiteForm=document.getElementById('createSiteForm');
const createSiteResult=document.getElementById('createSiteResult');
const customerModal=document.getElementById('customerModal');
let activeDomainWatchStop=()=>{};
const closeCustomer=document.getElementById('closeCustomer');
const customerDetail=document.getElementById('customerDetail');
const csName=document.getElementById('csName');
const csDomain=document.getElementById('csDomain');
const csCustomerName=document.getElementById('csCustomerName');
const csCustomerPhone=document.getElementById('csCustomerPhone');
const csAdminEmail=document.getElementById('csAdminEmail');
const csCompany=document.getElementById('csCompany');
const csNote=document.getElementById('csNote');
const csPlan=document.getElementById('csPlan');
const csSalePrice=document.getElementById('csSalePrice');
const csInternalCost=document.getElementById('csInternalCost');
const csPayment=document.getElementById('csPayment');
const csPaidAmount=document.getElementById('csPaidAmount');
const csPartialPaymentRow=document.getElementById('csPartialPaymentRow');
const csRemainingAmount=document.getElementById('csRemainingAmount');
const csThemePicker=document.getElementById('csThemePicker');
const csTemplateKey=document.getElementById('csTemplateKey');
const checkDomainBtn=document.getElementById('checkDomainBtn');
const domainCheckResult=document.getElementById('domainCheckResult');
const domainCheckNote=document.getElementById('domainCheckNote');
const registrarStatus=document.getElementById('registrarStatus');
const domainManagerBox=document.getElementById('domainManagerBox');
const dmDomain=document.getElementById('dmDomain');
const dmStatus=document.getElementById('dmStatus');
const dmCheck=document.getElementById('dmCheck');
const dmSave=document.getElementById('dmSave');
const dmResult=document.getElementById('dmResult');
const dmCost=document.getElementById('dmCost');
const dmRegistrar=document.getElementById('dmRegistrar');
const dmRegisteredAt=document.getElementById('dmRegisteredAt');
const dmExpiresAt=document.getElementById('dmExpiresAt');

const dmOpenCloudflare=document.getElementById('dmOpenCloudflare');
const dmMarkPurchased=document.getElementById('dmMarkPurchased');
const dmCompleteDomain=document.getElementById('dmCompleteDomain');
const handoverModal=document.getElementById('handoverModal');
const closeHandoverModal=document.getElementById('closeHandoverModal');
const handoverSummary=document.getElementById('handoverSummary');
const handoverLink=document.getElementById('handoverLink');
const copyHandoverLink=document.getElementById('copyHandoverLink');
const handoverPagesStatus=document.getElementById('handoverPagesStatus');
const handoverDone=document.getElementById('handoverDone');
const provisionNotice=document.getElementById('provisionNotice');
const provisionNoticeIcon=document.getElementById('provisionNoticeIcon');
const provisionNoticeTitle=document.getElementById('provisionNoticeTitle');
const provisionNoticeText=document.getElementById('provisionNoticeText');
const provisionCopyLink=document.getElementById('provisionCopyLink');
const provisionDismiss=document.getElementById('provisionDismiss');
let provisionActivationUrl='';
const domainPurchaseModal=document.getElementById('domainPurchaseModal');
const closeDomainPurchase=document.getElementById('closeDomainPurchase');
const purchaseSummary=document.getElementById('purchaseSummary');
const purchaseConfirmDomain=document.getElementById('purchaseConfirmDomain');
const purchaseAutoRenew=document.getElementById('purchaseAutoRenew');
const purchaseMsg=document.getElementById('purchaseMsg');
const confirmDomainPurchase=document.getElementById('confirmDomainPurchase');

function cleanSiteName(n=''){return String(n||'').replace(/\s*Demo\s*$/i,'').trim()||'Trang Tin';}

function money(v,c='USD'){if(v===undefined||v===null||v==='')return '—';return `${v} ${c}`}
function domainStateText(reason=''){
 const map={domain_unavailable:'Tên miền đã được đăng ký',domain_premium:'Tên miền premium chưa hỗ trợ mua tự động',
 extension_not_supported_via_api:'Đuôi tên miền chưa hỗ trợ qua API',extension_not_supported:'Cloudflare chưa hỗ trợ đuôi tên miền này',
 extension_disallows_registration:'Registry đang tạm ngừng đăng ký'};
 return map[reason]||reason||'Không thể đăng ký';
}
function renderDomainCheck(box,d){
 box.classList.remove('hidden');
 if(d.registrable){
  box.className='domain-check-result success';
  box.innerHTML=`<b>✓ ${esc(d.domain)} có vẻ đang còn trống</b><span>Bạn có thể mở Cloudflare để mua tên miền này. Trạng thái được kiểm tra trực tiếp với registry quản lý đuôi tên miền.</span>`;
 }else{
  box.className='domain-check-result danger';
  box.innerHTML=`<b>✕ ${esc(d.domain)} đã được đăng ký</b><span>Hãy chọn một tên miền khác.</span>`;
 }
}


let __masterSites=[];let __financeRows=[];let __expenseRows=[];
let __sitePage=1,__sitePageSize=10;
function normText(v=''){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function siteDaysLeft(x){if(!x?.expires_at)return 999999;return Math.ceil((new Date(x.expires_at+'T23:59:59')-new Date())/86400000)}
function siteNextStep(x){
 const renewal=String(x?.renewal_stage||'none');
 if(renewal==='paid')return {key:'renewal-paid',label:'Gia hạn domain ngay',tone:'urgent'};
 if(renewal==='payment_pending')return {key:'renewal-payment',label:'Chờ VietQR xác nhận',tone:'waiting'};
 if(x?.onboarding_status!=='activated'&&x?.domain_status!=='active')return {key:'setup',label:'Cấu hình Domain / SSL',tone:'progress'};
 if(x?.onboarding_status!=='activated'&&x?.domain_status==='active')return {key:'activation',label:'Gửi link kích hoạt',tone:'ready'};
 const days=siteDaysLeft(x);
 if(x?.onboarding_status==='activated'&&days>=0&&days<=30)return {key:'expiring',label:'Theo dõi gia hạn',tone:'warning'};
 if(x?.status!=='active')return {key:'inactive',label:'Website đang khóa',tone:'muted'};
 return {key:'running',label:'Đang vận hành',tone:'ok'};
}
let __workflowSiteMode='';
function renderSiteRows(){
 const q=normText(document.getElementById('siteSearch')?.value||''),st=document.getElementById('siteStatusFilter')?.value||'',pay=document.getElementById('sitePaymentFilter')?.value||'';
 const rows=__masterSites.filter(x=>{const hay=normText([x.name,x.customer_name,x.customer_phone,x.customer_email,x.admin_email,x.domain,x.plan_name,x.order_code].join(' '));if(q&&!hay.includes(q))return false;if(pay&&String(x.payment_status||'unpaid')!==pay)return false;if(st==='active'&&!(x.status==='active'&&x.onboarding_status==='activated'))return false;if(st==='inactive'&&x.status==='active')return false;if(st==='setup'&&!(x.onboarding_status!=='activated'&&x.domain_status!=='active'))return false;if(st==='activation'&&!(x.onboarding_status!=='activated'&&x.domain_status==='active'))return false;if(st==='renewal'&&!(x.renewal_status==='yes'&&String(x.renewal_stage||'none')!=='renewed'))return false;if(st==='expiring'&&!(siteDaysLeft(x)>=0&&siteDaysLeft(x)<=30))return false;return true});
 const cnt=document.getElementById('siteFilterCount');if(cnt)cnt.textContent=`${rows.length}/${__masterSites.length} website`;
 const totalPages=Math.max(1,Math.ceil(rows.length/__sitePageSize));if(__sitePage>totalPages)__sitePage=totalPages;
 const paged=rows.slice((__sitePage-1)*__sitePageSize,__sitePage*__sitePageSize);
 const spi=document.getElementById('sitePageInfo');if(spi)spi.textContent=`Trang ${__sitePage}/${totalPages} · ${rows.length} kết quả`;
 siteRows.innerHTML=rows.length?paged.map(x=>`<tr>
   <td><div class="master-site-name"><span class="site-mini-mark">⌂</span><div><b>${esc(cleanSiteName(x.name))}</b><small>#${x.id} · ${x.onboarding_status==='activated'?'Đã bàn giao':'Đang thiết lập'}</small></div></div></td>
   <td><div class="customer-cell"><b>${esc(x.customer_name||'Chưa hoàn thiện')}</b><small>${esc(x.customer_phone||x.customer_email||x.admin_email||'')}</small></div></td>
   <td><div class="domain-stack"><b>${esc(x.domain)}</b><span class="domain-state ${x.domain_status||'not_configured'}">${x.domain_status==='active'?'Domain hoạt động':x.domain_status==='pending'?'Chờ DNS':'Chưa cấu hình'}</span></div></td>
   <td><div class="service-cell"><b>${esc(x.plan_name||'Gói website trọn gói')}</b><small>${Number(x.sale_price||0).toLocaleString('vi-VN')}đ · ${Number(x.term_months||12)} tháng</small>${x.renewal_stage==='renewed'?'<span class="renewal-choice yes">Đã gia hạn</span>':x.renewal_status==='yes'?'<span class="renewal-choice yes">Khách muốn gia hạn</span>':x.renewal_status==='no'?'<span class="renewal-choice no">Khách không gia hạn</span>':''}</div></td>
   <td><span class="pay-state ${x.payment_status||'unpaid'}">${x.payment_status==='paid'?'Đã thanh toán':x.payment_status==='partial'?'Một phần':'Chưa thanh toán'}</span></td>
   <td><div class="expiry-cell">${x.expires_at?esc(x.expires_at):'—'}${x.expires_at?(()=>{const days=siteDaysLeft(x);return `<small class="${days<=30?'expiry-warning':''}">${days} ngày${days<=30?' · sắp hết hạn':''}</small>`})():''}</div></td>
   <td><b>${x.posts}</b> bài<small class="block-mini">${x.views||0} lượt xem</small></td>
   <td>${(()=>{const n=siteNextStep(x);return `<div class="next-step-cell"><span class="next-step ${n.tone}">${n.label}</span><small>${x.status==='active'?'Website hoạt động':'Website đã khóa'}</small></div>`})()}</td>
   <td><div class="master-actions"><button class="smallbtn primary-mini" onclick="viewCustomer(${x.id})">Quản lý</button><button class="smallbtn" ${x.onboarding_status==='activated'?`onclick="resetHandover(${x.id},'${esc(cleanSiteName(x.name)).replace(/'/g,"&#39;")}')" title="Master: thu hồi bàn giao để tạo link kích hoạt mới"`:x.domain_status==='active'?`onclick="newActivation(${x.id},'${esc(cleanSiteName(x.name)).replace(/'/g,"&#39;")}')"`:'disabled title="Chỉ mở khi Domain + SSL đã hoạt động"'}>${x.onboarding_status==='activated'?'Reset bàn giao':x.domain_status==='active'?'Link kích hoạt':'Chờ Domain + SSL'}</button>${x.onboarding_status!=='activated'&&x.domain_status==='active'?`<button class="smallbtn activation-email-btn" onclick="sendActivationEmail(${x.id},'${esc(cleanSiteName(x.name)).replace(/'/g,"&#39;")}','${esc(x.customer_email||x.admin_email||'').replace(/'/g,"&#39;")}')" title="Gửi link kích hoạt tới email khách đã đăng ký">Gửi email kích hoạt</button>`:''}<button class="smallbtn ${x.status==='active'?'danger':''}" onclick="toggleSite(${x.id},'${x.status==='active'?'inactive':'active'}')">${x.status==='active'?'Khóa':'Mở lại'}</button></div></td>
 </tr>`).join(''):'<tr><td colspan="9" style="text-align:center;padding:24px">Không tìm thấy website phù hợp.</td></tr>';
}

function clearSiteFilterNow(){const a=document.getElementById('siteSearch'),b=document.getElementById('siteStatusFilter'),c=document.getElementById('sitePaymentFilter');if(a)a.value='';if(b)b.value='';if(c)c.value='';renderSiteRows()}
function clearLedgerFilterNow(){const a=document.getElementById('ledgerSearch'),b=document.getElementById('ledgerKindFilter');if(a)a.value='';if(b)b.value='';renderLedger()}

function renderLedger(){const q=normText(document.getElementById('ledgerSearch')?.value||''),kind=document.getElementById('ledgerKindFilter')?.value||'';const rows=__financeRows.filter(t=>{if(kind&&String(t.kind)!==kind)return false;const hay=normText([t.site_name,t.customer_name,t.customer_email,t.customer_phone,t.domain,t.order_code,t.memo].join(' '));return !q||hay.includes(q)});const c=document.getElementById('ledgerCount');if(c)c.textContent=`(${rows.length}/${__financeRows.length})`;const box=document.getElementById('ledgerRows');if(box)box.innerHTML=rows.length?rows.map(t=>`<tr class="${t.status==='void'?'tx-void':''}"><td>${shortDate(t.paid_at||t.created_at)}</td><td><b>${esc(cleanSiteName(t.site_name||''))}</b><small class="block-mini">${esc(t.domain||'')}</small></td><td><span class="tx-kind">${t.kind==='renewal'?'Gia hạn':t.kind==='initial'?'Kích hoạt':'Khác'}</span></td><td>${shortDate(t.cycle_start)} → ${shortDate(t.cycle_end)}</td><td><b>${vnd(t.amount)}</b></td><td>${vnd(t.cost)}</td><td class="tx-profit">${vnd(Number(t.amount||0)-Number(t.cost||0))}</td><td>${esc(t.order_code||'—')}</td><td>${t.status==='paid'?`<button class="smallbtn" onclick="editTxCost(${t.id},${Number(t.cost||0)})">Sửa chi phí</button>`:'Đã reset test'}</td></tr>`).join(''):'<tr><td colspan="9">Không có giao dịch phù hợp.</td></tr>'}
function expenseCycleText(v){return v==='monthly'?'Hàng tháng':v==='yearly'?'Hàng năm':'Một lần'}
function renderExpenses(){const box=document.getElementById('expenseRows'),c=document.getElementById('expenseCount');if(c)c.textContent=`(${__expenseRows.length})`;if(box)box.innerHTML=__expenseRows.length?__expenseRows.map(e=>`<tr><td>${shortDate(e.expense_date||e.created_at)}</td><td>${esc(e.category_label||e.category||'Khác')}</td><td><b>${esc(e.title||'')}</b>${e.note?`<small class="block-mini">${esc(e.note)}</small>`:''}</td><td>${expenseCycleText(e.recurring)}</td><td><b>${vnd(e.amount)}</b></td><td><button class="smallbtn danger" onclick="deleteExpense(${e.id})">Xóa</button></td></tr>`).join(''):'<tr><td colspan="6">Chưa có chi phí vận hành.</td></tr>'}
async function loadExpenses(){const box=document.getElementById('expenseRows');try{const d=await mapi('expenses');__expenseRows=d.expenses||[];renderExpenses()}catch(e){console.error('expenses',e);if(box)box.innerHTML='<tr><td colspan="6" style="color:#b91c1c"><b>Không tải được chi phí:</b> '+esc(e.message)+' <button class="smallbtn" onclick="loadExpenses()">Thử lại</button></td></tr>'}}
async function addExpense(){const category=document.getElementById('expenseCategory')?.value||'other',title=document.getElementById('expenseTitle')?.value.trim()||'',amount=Number(String(document.getElementById('expenseAmount')?.value||'').replace(/[^0-9]/g,''))||0,recurring=document.getElementById('expenseRecurring')?.value||'none',expense_date=document.getElementById('expenseDate')?.value||new Date().toISOString().slice(0,10);if(!title||amount<=0)return alert('Nhập mô tả và số tiền chi phí.');try{await mapi('expenses',{method:'POST',body:JSON.stringify({category,title,amount,recurring,expense_date})});document.getElementById('expenseTitle').value='';document.getElementById('expenseAmount').value='';await Promise.all([loadExpenses(),loadFinance()])}catch(e){alert(e.message)}}
async function deleteExpense(id){if(!confirm('Xóa khoản chi phí này?'))return;try{await mapi('expenses?id='+id,{method:'DELETE'});await Promise.all([loadExpenses(),loadFinance()])}catch(e){alert(e.message)}}

async function mapi(path,opts={}){const mt=localStorage.getItem('nr_master_token')||'';const r=await fetch('/api/master/'+path,{credentials:'include',headers:{'Content-Type':'application/json',...(mt?{'Authorization':'Bearer '+mt}:{}),...(opts.headers||{})},...opts});const t=await r.text();let d={};try{d=JSON.parse(t)}catch{}if(!r.ok)throw new Error(d.error||t);return d}
async function runMasterRefresh(btn,job){if(!btn)return job();const old=btn.textContent;btn.disabled=true;btn.classList.add('is-refreshing');btn.textContent='↻ Đang tải…';try{return await job()}catch(e){console.error(e);throw e}finally{btn.disabled=false;btn.classList.remove('is-refreshing');btn.textContent=old}}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function vnd(v){return Number(v||0).toLocaleString('vi-VN')+'đ'}
function shortDate(v){if(!v)return '—';const x=String(v).slice(0,10).split('-');return x.length===3?`${x[2]}/${x[1]}/${x[0]}`:String(v)}

async function cleanupNewsrealTestData(){
 const preserve=prompt('Nhập chính xác domain đang hoạt động cần GIỮ LẠI:','batdongsan2027.org.uk');
 if(preserve===null)return;
 if(!preserve.trim())return alert('Phải nhập domain cần giữ lại.');
 const ok=confirm(`DỌN DỮ LIỆU TEST?\n\nGIỮ LẠI: ${preserve.trim()}\n\nSẽ thực hiện:\n• Xóa tất cả website test khác\n• Xóa toàn bộ Hộp yêu cầu test\n• Xóa doanh thu test của website được giữ\n• Chuyển số tiền kích hoạt/gia hạn test thành Chi phí vận hành\n• Giữ website, domain, bài viết và thời hạn của domain đang hoạt động\n\nThao tác này không thể hoàn tác.`);
 if(!ok)return;
 const typed=prompt('Để xác nhận lần cuối, nhập: XOA DU LIEU TEST','');
 if(typed!=='XOA DU LIEU TEST')return alert('Đã hủy. Không có dữ liệu nào bị xóa.');
 try{
   const r=await mapi('cleanup-test-data',{method:'POST',body:JSON.stringify({preserve_domain:preserve.trim(),confirm:typed})});
   alert(`Dọn dữ liệu test hoàn tất.\n\nĐã giữ: ${r.preserved?.domain||preserve}\nWebsite test đã xóa: ${r.deleted_sites||0}\nYêu cầu test đã xóa: ${r.deleted_leads||0}\nDoanh thu test chuyển sang chi phí: ${vnd(r.moved_test_revenue_to_expense||0)}\n\nTài chính sẽ được tải lại.`);
   location.reload();
 }catch(e){alert('Không dọn dữ liệu: '+e.message)}
}
document.getElementById('cleanupTestData')?.addEventListener('click',cleanupNewsrealTestData);

async function loadFinance(){
 try{
  const d=await mapi('finance'),q=id=>document.getElementById(id),s=d.summary||{},p=d.pipeline||{};
  if(q('finMonth'))q('finMonth').textContent=vnd(s.revenue_month);if(q('finYear'))q('finYear').textContent=vnd(s.revenue_year);if(q('finRevenue'))q('finRevenue').textContent=vnd(s.revenue_all);if(q('finCost'))q('finCost').textContent=vnd(s.cost_all);if(q('finProfit'))q('finProfit').textContent=vnd(s.profit_all);if(q('finPending'))q('finPending').textContent=vnd(s.pending);if(q('finInitial'))q('finInitial').textContent=vnd(s.initial_revenue);if(q('finRenewal'))q('finRenewal').textContent=vnd(s.renewal_revenue);
  if(q('pipeRequested'))q('pipeRequested').textContent=Number(p.requested||0);if(q('pipePayment'))q('pipePayment').textContent=Number(p.payment_sent||0);if(q('pipePaid'))q('pipePaid').textContent=Number(p.paid_wait_domain||0);if(q('pipeExpiring'))q('pipeExpiring').textContent=Number(p.expiring_30||0);
  __financeRows=d.transactions||[];renderLedger();
 }catch(err){console.error('finance',err)}
}
async function editTxCost(id,current){const raw=prompt('Chi phí thực tế của giao dịch (VNĐ):',String(current||0));if(raw===null)return;const cost=Math.max(0,Number(String(raw).replace(/[^0-9]/g,''))||0);try{await mapi('finance-cost',{method:'POST',body:JSON.stringify({id,cost})});await loadFinance()}catch(e){alert(e.message)}}
async function loadCustomerFinance(siteId){
 const box=document.getElementById('customerFinanceBox');if(!box)return;
 try{const d=await mapi('finance?site_id='+siteId),rows=d.transactions||[];box.innerHTML=`<h3>Lịch sử giao dịch & timeline</h3><div class="timeline-list">${rows.length?rows.map(t=>`<div class="timeline-item ${t.status==='void'?'tx-void':''}"><small>${shortDate(t.paid_at||t.created_at)}</small><div><b>${t.kind==='renewal'?'Gia hạn dịch vụ':'Kích hoạt dịch vụ'}</b><small class="block-mini">${shortDate(t.cycle_start)} → ${shortDate(t.cycle_end)} · ${esc(t.order_code||'')}</small></div><span class="timeline-money">${vnd(t.amount)}</span></div>`).join(''):'<div class="timeline-item"><small>—</small><div><b>Chưa có giao dịch</b><small class="block-mini">Khi đánh dấu thanh toán, hệ thống tự ghi sổ.</small></div><span></span></div>'}</div>`}catch(e){box.innerHTML='<h3>Lịch sử giao dịch</h3><small>Chưa tải được dữ liệu.</small>'}
}



function showProvisionNotice({type='pending',title='',text='',activation_url=''}){
  if(!provisionNotice)return;
  provisionNotice.className='provision-notice '+type;
  provisionNoticeIcon.textContent=type==='ok'?'✓':type==='error'?'!':'…';
  provisionNoticeTitle.textContent=title;
  provisionNoticeText.textContent=text;
  provisionActivationUrl=activation_url||'';
  provisionCopyLink?.classList.toggle('hidden',!provisionActivationUrl);
  provisionNotice.classList.remove('hidden');
  provisionNotice.scrollIntoView({behavior:'smooth',block:'center'});
}
if(provisionDismiss)provisionDismiss.onclick=()=>provisionNotice.classList.add('hidden');
if(provisionCopyLink)provisionCopyLink.onclick=async()=>{
  try{
    await navigator.clipboard.writeText(provisionActivationUrl);
    provisionCopyLink.textContent='Đã sao chép';
    setTimeout(()=>provisionCopyLink.textContent='Sao chép link kích hoạt',1200);
  }catch{
    prompt('Copy link kích hoạt:',provisionActivationUrl);
  }
};

function showHandoverModal(data){
 if(!handoverModal)return;
 const title=handoverModal.querySelector('h2');
 const ready=data.pages_status==='active';
 if(title)title.textContent=ready?'Website đã sẵn sàng kích hoạt':'Domain đang hoàn tất DNS/SSL';
 handoverSummary.textContent=ready
   ?`${data.domain} đã hoạt động. Gửi link dưới đây cho khách để kích hoạt website.`
   :`${data.domain} đã lưu vào NEWSREAL. Link kích hoạt đã tạo nhưng chỉ hoạt động sau khi DNS/SSL chuyển Active.`;
 handoverLink.value=data.activation_url||'';
 if(data.pages_configured){
   handoverPagesStatus.className='handover-status '+(data.pages_status==='active'?'ok':'pending');
   handoverPagesStatus.textContent=data.pages_status==='active'
     ?'✓ Custom domain + SSL đã hoạt động trên Cloudflare Pages.'
     :'Đang hoàn tất custom domain/SSL trên Cloudflare Pages.';
 }else{
   handoverPagesStatus.className='handover-status warn';
   handoverPagesStatus.textContent='⚠ '+(data.pages_error||'CF_PAGES_TOKEN/CF_ACCOUNT_ID chưa được Functions nhận. Domain đã lưu nhưng Pages chưa tự gắn.');
 }
 handoverModal.classList.remove('hidden');
}
if(closeHandoverModal)closeHandoverModal.onclick=()=>handoverModal.classList.add('hidden');
if(handoverDone)handoverDone.onclick=()=>handoverModal.classList.add('hidden');
if(copyHandoverLink)copyHandoverLink.onclick=async()=>{
 try{await navigator.clipboard.writeText(handoverLink.value);copyHandoverLink.textContent='Đã sao chép';setTimeout(()=>copyHandoverLink.textContent='Sao chép',1200)}
 catch{handoverLink.select();document.execCommand('copy')}
};
async function loadRegistrarStatus(){
 registrarStatus.className='registrar-status connected';
 registrarStatus.innerHTML='<b>Domain:</b> Chế độ bán tự động — mua trên Cloudflare Dashboard, sau đó xác nhận trong Control Center để NEWSREAL theo dõi giá vốn, ngày hết hạn và trạng thái.';
}

async function loadMaster(){try{
 const d=await mapi('overview');
 masterLogin.classList.add('hidden');masterDashboard.classList.remove('hidden');document.dispatchEvent(new CustomEvent('newsreal:master-ready'));
 mSites.textContent=d.stats.sites;mActive.textContent=d.stats.active;mPosts.textContent=d.stats.posts;mViews.textContent=d.stats.views;mToday.textContent=d.stats.today;
 const renewalWaiting=(d.sites||[]).filter(x=>x.renewal_status==='yes'&&String(x.renewal_stage||'none')!=='renewed');
 const renewalAlert=document.getElementById('renewalMasterAlert'),renewalAlertTitle=document.getElementById('renewalMasterAlertTitle'),renewalAlertText=document.getElementById('renewalMasterAlertText'),renewalAlertBtn=document.getElementById('renewalMasterAlertBtn');
 if(renewalAlert){
  if(renewalWaiting.length){renewalAlert.classList.remove('hidden');renewalAlertTitle.textContent=`${renewalWaiting.length} khách yêu cầu gia hạn`;renewalAlertText.textContent=renewalWaiting.map(x=>cleanSiteName(x.name)).join(' · ');if(renewalAlertBtn)renewalAlertBtn.onclick=()=>{const first=renewalWaiting[0];if(first)viewCustomer(first.id)}}
  else renewalAlert.classList.add('hidden');
 }

 loadRegistrarStatus();__masterSites=d.sites||[];renderSiteRows();updateWorkflowCenter();
 await Promise.all([loadFinance(),loadExpenses()]);
}catch(err){console.error(err);masterLoginMsg.textContent='Đăng nhập đã nhận nhưng không tải được Control Center: '+err.message;masterLoginMsg.classList.remove('hidden');throw err}}



if(checkDomainBtn)checkDomainBtn.onclick=async()=>{
 const domain=csDomain.value.trim();if(!domain){alert('Nhập tên miền cần kiểm tra');return}
 checkDomainBtn.disabled=true;checkDomainBtn.textContent='Đang kiểm tra...';
 try{const d=await mapi('domain-check',{method:'POST',body:JSON.stringify({domain})});renderDomainCheck(domainCheckResult,d)}
 catch(err){domainCheckResult.className='domain-check-result danger';domainCheckResult.innerHTML=`<b>Không kiểm tra được domain</b><span>${esc(err.message)}</span>`}
 finally{checkDomainBtn.disabled=false;checkDomainBtn.textContent='Kiểm tra'}
};

if(openCreateSite)openCreateSite.onclick=()=>{createSiteModal.classList.remove('hidden');createSiteResult.classList.add('hidden')};
const syncCreateContactDefaults=()=>{
 if(window.csPublicPhone&&!csPublicPhone.dataset.edited)csPublicPhone.value=csCustomerPhone?.value||'';
 if(window.csPublicZalo&&!csPublicZalo.dataset.edited)csPublicZalo.value=csCustomerPhone?.value||'';
 if(window.csPublicEmail&&!csPublicEmail.dataset.edited)csPublicEmail.value=csAdminEmail?.value||'';
};
[window.csCustomerPhone,window.csAdminEmail].filter(Boolean).forEach(el=>el.addEventListener('input',syncCreateContactDefaults));
document.querySelectorAll('input[name="csTheme"]').forEach(r=>r.addEventListener('change',()=>document.querySelectorAll('.master-theme-card').forEach(c=>c.classList.toggle('active',c.querySelector('input')?.checked))));

[window.csPublicPhone,window.csPublicZalo,window.csPublicEmail].filter(Boolean).forEach(el=>el.addEventListener('input',()=>{el.dataset.edited='1'}));
const updateCreatePromo=()=>{const list=Number(csListPrice?.value||0),discount=Number(csFirstDiscount?.value||0),first=Math.max(0,list-discount),renew=Number(csRenewalPrice?.value||list);if(csPromoSummary)csPromoSummary.innerHTML=`Giá niêm yết <b>${list.toLocaleString('vi-VN')}đ</b> → khách mới thanh toán <b>${first.toLocaleString('vi-VN')}đ</b>. Từ kỳ tiếp theo: <b>${renew.toLocaleString('vi-VN')}đ/${Number(csTermMonths?.value||12)} tháng</b>.`;};
[window.csTermMonths,window.csListPrice,window.csFirstDiscount,window.csRenewalPrice].filter(Boolean).forEach(el=>el.addEventListener('input',updateCreatePromo));
if(closeCreateSite)closeCreateSite.onclick=()=>createSiteModal.classList.add('hidden');
if(closeCustomer)closeCustomer.onclick=()=>{activeDomainWatchStop();customerModal.classList.add('hidden')};
if(createSiteModal)createSiteModal.addEventListener('click',e=>{if(e.target===createSiteModal)createSiteModal.classList.add('hidden')});
if(customerModal)customerModal.addEventListener('click',e=>{if(e.target===customerModal){activeDomainWatchStop();customerModal.classList.add('hidden')}});

if(createSiteForm)createSiteForm.addEventListener('submit',async e=>{
 e.preventDefault();
 const submit=e.submitter;submit.disabled=true;submit.textContent='Đang khởi tạo...';
 try{
  const d=await mapi('create-site',{method:'POST',body:JSON.stringify({
   name:csName.value,domain:csDomain.value,admin_email:csAdminEmail.value,lead_id:Number(window.__pendingLeadId||0),
   template_key:(csTemplateKey?.value||document.querySelector('input[name="csTheme"]:checked')?.dataset.templateKey||''),
   theme_key:(document.querySelector('input[name="csTheme"]:checked')?.value||'newsreal'),
   customer_name:csCustomerName.value,customer_phone:csCustomerPhone.value,
   public_phone:csPublicPhone?.value||csCustomerPhone.value,
   public_zalo:csPublicZalo?.value||csCustomerPhone.value,
   public_email:csPublicEmail?.value||csAdminEmail.value,
   public_facebook:csPublicFacebook?.value||'',
   company:csCompany.value,internal_note:csNote.value,
   plan_name:csPlan.value,sale_price:csSalePrice.value,internal_cost:csInternalCost.value,payment_status:csPayment.value,paid_amount:Number(csPaidAmount?.value||0),
   term_months:csTermMonths.value,list_price:csListPrice.value,first_discount:csFirstDiscount.value,first_price:Math.max(0,Number(csListPrice.value||0)-Number(csFirstDiscount.value||0)),renewal_price:csRenewalPrice.value,promotion_name:csPromotionName.value
  })});
  // V8.7.1: create-site is only the first provisioning step.
  // Close the modal immediately after success so Master sees the new website row.
  createSiteForm.reset();
  [window.csPublicPhone,window.csPublicZalo,window.csPublicEmail].filter(Boolean).forEach(el=>delete el.dataset.edited);
  if(window.csTermMonths)csTermMonths.value=12;if(window.csListPrice)csListPrice.value=1999000;if(window.csFirstDiscount)csFirstDiscount.value=500000;if(window.csRenewalPrice)csRenewalPrice.value=1999000;if(window.csPromotionName)csPromotionName.value='Ưu đãi kích hoạt lần đầu';
  if(window.csPromoSummary)csPromoSummary.innerHTML='Giá niêm yết <b>1.999.000đ</b> → khách mới thanh toán <b>1.499.000đ</b>. Từ năm thứ 2: <b>1.999.000đ/năm</b>.';
  createSiteResult.classList.add('hidden');
  createSiteModal.classList.add('hidden');
  window.__pendingLeadId=0;
  await Promise.all([loadMaster(),loadLeadCRM()]);
  alert(`Đã tạo website thành công${d.order_code?' · Mã đơn: '+d.order_code:''}. Tiếp theo mở Quản lý để hoàn tất domain.`);
 }catch(err){alert(err.message)}
 finally{submit.disabled=false;submit.textContent='Tạo website'}
});
async function copyActivation(url){try{await navigator.clipboard.writeText(url);alert('Đã sao chép link kích hoạt')}catch{prompt('Sao chép link này:',url)}}
async function newActivation(id,name){
 if(!confirm(`Tạo liên kết kích hoạt mới cho "${name}"? Link cũ chưa dùng sẽ bị vô hiệu hóa.`))return;
 try{const d=await mapi('regenerate-activation',{method:'POST',body:JSON.stringify({site_id:id})});const url=location.origin+d.activation_path;await copyActivation(url);loadMaster()}catch(err){alert(err.message)}
}
async function sendActivationEmail(id,name,email){
 if(!email)return alert('Website này chưa có email khách hàng hợp lệ.');
 if(!confirm(`Gửi link kích hoạt "${name}" tới email:\n${email}\n\nTiếp tục?`))return;
 try{const d=await mapi('send-activation-email',{method:'POST',body:JSON.stringify({site_id:id})});alert(`Đã gửi link kích hoạt tới ${d.email}.`);await loadMaster()}catch(err){alert(err.message)}
}
async function resetHandover(id,name){
 const ok=confirm(`RESET BÀN GIAO cho "${name}"?

• Khách hiện tại sẽ bị đăng xuất.
• Link/token bàn giao cũ sẽ bị thu hồi.
• Domain, DNS, SSL, dữ liệu khách và bài đăng KHÔNG bị xóa.
• Sau reset bạn có thể bấm Link kích hoạt để test/bàn giao lại.`);
 if(!ok)return;
 try{
   await mapi('reset-handover',{method:'POST',body:JSON.stringify({site_id:id})});
   alert('Đã reset bàn giao. Bây giờ có thể tạo Link kích hoạt mới.');
   await loadMaster();
   if(window.currentManagedSiteId===id && customerModal && !customerModal.classList.contains('hidden')) await viewCustomer(id);
 }catch(err){alert('Không reset được bàn giao: '+err.message)}
}
async function viewCustomer(id){
 window.currentManagedSiteId=id;
 try{
  const d=await mapi('customer?site_id='+id),x=d.customer||{};
  if(!tmData?.length){try{const tr=await mapi('template-catalog');tmData=tr.templates||[]}catch(e){}}
  const activeTemplates=(tmData||[]).filter(t=>Number(t.is_active)===1 || t.template_key===x.template_key);
  const currentTemplate=activeTemplates.find(t=>t.template_key===x.template_key)||activeTemplates.find(t=>t.preset===x.preset)||null;
  const activeTemplateName=x.template_name||currentTemplate?.name||x.preset||'Chưa xác định';
  const themeOptions=activeTemplates.map(t=>`<option value="${tmEsc(t.template_key)}" ${t.template_key===(x.template_key||currentTemplate?.template_key)?'selected':''}>${tmEsc(t.name)} · ${fmtTemplateMoney(t.price)}</option>`).join('');
  customerDetail.innerHTML=`<div class="customer-profile-grid">
   <div><span>Website</span><b>${esc(cleanSiteName(x.name||''))}</b></div><div><span>Domain</span><b>${esc(x.domain||'')}</b></div>
   <div><span>Họ tên</span><b>${esc(x.full_name||'Chưa cập nhật')}</b></div><div><span>Điện thoại</span><b>${esc(x.phone||'Chưa cập nhật')}</b></div>
   <div><span>Email</span><b>${esc(x.email||x.admin_email||'')}</b></div><div><span>Công ty</span><b>${esc(x.company||'—')}</b></div>
   <div><span>Mã đơn hàng</span><b>${esc(x.order_code||'—')}</b></div><div><span>Link kích hoạt</span><b>${x.activated_at?'Đã kích hoạt':'Chưa kích hoạt'}</b></div>
   <div class="wide"><span>Địa chỉ</span><b>${esc([x.address,x.district,x.province].filter(Boolean).join(', ')||'Chưa cập nhật')}</b></div>
  </div>
  <div class="security-tools">
    <div><span>Bảo mật tài khoản khách hàng</span><b>Quên mật khẩu / không đăng nhập được</b></div>
    <button id="svSendPasswordReset" class="smallbtn" type="button">Gửi link đặt lại mật khẩu</button>
  </div>
  <div class="master-theme-manager favicon-manager">
   <div><span>Favicon website</span><b>${x.favicon_url?'Đã cài biểu tượng riêng':'Đang dùng favicon mặc định'}</b><small>Master có thể tải nhanh PNG/JPG/WEBP tối đa 2 MB cho khách.</small></div>
   <div class="theme-manager-actions"><input id="svFaviconFile" type="file" accept="image/png,image/jpeg,image/webp" style="max-width:220px"><button id="svUploadFavicon" class="smallbtn primary-mini" type="button">Cập nhật favicon</button>${x.favicon_url?'<button id="svClearFavicon" class="smallbtn" type="button">Về mặc định</button>':''}</div>
  </div>
  <div class="master-theme-manager service-doc-manager">
   <div><span>Biên bản / hồ sơ dịch vụ</span><b id="svDocTitle">Đang tải hồ sơ…</b><small>Biên bản kích hoạt được lưu theo từng website và có thể mở lại bất cứ lúc nào.</small></div>
   <div class="theme-manager-actions"><button id="svOpenLatestDoc" class="smallbtn" type="button" disabled>Xem biên bản gần nhất</button></div>
  </div>
  <div class="master-theme-manager">
   <div><span>Mẫu đã bán / đang kích hoạt</span><b>${esc(activeTemplateName)}</b><small>Mã mẫu: ${esc(x.template_key||currentTemplate?.template_key||'—')} · Preset: ${esc(x.preset||'—')}</small></div>
   <div class="theme-manager-actions"><select id="svTemplateKey">${themeOptions}</select><button id="svApplyTheme" class="smallbtn primary-mini" type="button">Kích hoạt mẫu</button></div>
  </div>
  <div class="master-theme-manager">
   <div><span>Bài mẫu theo yêu cầu khách</span><b>${Number(x.demo_posts||0)>0?`${Number(x.demo_posts||0)} bài mẫu đã cài`:'Website đang sạch · chưa có bài mẫu'}</b><small>${x.activated_at?'Admin Client đã kích hoạt. Chỉ Master quản lý bài mẫu của website này.':'Chỉ được cài bài mẫu sau khi khách kích hoạt Admin Client.'}</small></div>
   <div class="theme-manager-actions">${x.activated_at?`<button id="svInstallSamples" class="smallbtn primary-mini" type="button">Cài bài mẫu</button>${Number(x.demo_posts||0)>0?'<button id="svClearSamples" class="smallbtn" type="button">Xóa bài mẫu</button>':''}`:'<button class="smallbtn" type="button" disabled>Chờ khách kích hoạt</button>'}</div>
  </div>
  <form id="serviceForm" class="service-edit-form">
   <div class="form-section-title">Quản lý gói dịch vụ</div>
   <div class="two"><label>Tên gói<input id="svPlan" value="${esc(x.plan_name||'Gói website trọn gói')}"></label><label>Giá bán/năm<input id="svSale" type="number" value="${x.sale_price||0}"></label></div>
   <div class="two"><label>Chi phí nội bộ<input id="svCost" type="number" value="${x.internal_cost||0}"></label><label>Thanh toán<select id="svPayment"><option value="unpaid">Chưa thanh toán</option><option value="partial">Một phần</option><option value="paid">Đã thanh toán</option></select></label></div><div id="svPaidRow" class="two partial-payment-row"><label>Số tiền đã thanh toán<input id="svPaidAmount" type="number" min="0" step="1000" value="${Number(x.paid_amount||0)}"></label><label>Còn lại<div id="svRemaining" class="auto-code-field">0đ</div></label></div>
   <div class="two"><label>Trạng thái dịch vụ<select id="svStatus"><option value="setup">Đang thiết lập</option><option value="active">Đang hoạt động</option><option value="suspended">Tạm ngưng</option><option value="expired">Hết hạn</option></select></label><label>Trạng thái domain<select id="svDomain"><option value="not_configured">Chưa cấu hình</option><option value="pending">Chờ DNS</option><option value="active">Hoạt động</option><option value="expired">Hết hạn</option></select></label></div>
   <div class="form-section-title">Khuyến mãi & gia hạn</div>
   <div class="two"><label>Thời hạn (tháng)<input id="svTermMonths" type="number" min="1" max="60" value="${Number(x.term_months||12)}"></label><label>Giá niêm yết<input id="svListPrice" type="number" value="${Number(x.list_price||1999000)}"></label></div>
   <div class="two"><label>Giảm lần đầu<input id="svFirstDiscount" type="number" value="${Number(x.first_discount||0)}"></label><label>Giá gia hạn<input id="svRenewalPrice" type="number" value="${Number(x.renewal_price||1999000)}"></label></div>
   <label>Tên chương trình<input id="svPromotionName" value="${esc(x.promotion_name||'')}"></label>
   <div class="promo-summary" id="svPromoSummary"></div>
   <div class="renewal-panel ${x.renewal_stage==='paid'?'renewal-paid-attention':''}"><div><span>Quy trình gia hạn</span><b>${(()=>{const st=x.renewal_stage&&x.renewal_stage!=='none'?x.renewal_stage:(x.renewal_status==='no'?'declined':'none');return st==='renewed'?'✓ Gia hạn thành công':st==='paid'?'✓ KHÁCH ĐÃ THANH TOÁN':st==='payment_pending'?'⏳ Chờ VietQR xác nhận':st==='declined'?'✕ Khách không gia hạn':'Chưa phản hồi'})()}</b><small>${x.renewal_stage==='renewed'&&x.renewal_completed_at?'Hoàn tất: '+esc(x.renewal_completed_at)+' · Hết hạn mới: '+esc(x.expires_at||''):x.renewal_paid_at?'Thanh toán: '+esc(x.renewal_paid_at)+' · '+Math.round(Number(x.renewal_selected_months||12)/12)+' năm · '+esc(x.renewal_order_code||''):x.renewal_stage==='payment_pending'?'Mã thanh toán: '+esc(x.renewal_order_code||'')+' · '+Math.round(Number(x.renewal_selected_months||12)/12)+' năm':x.renewal_notified_at?'Đã gửi nhắc: '+esc(x.renewal_notified_at):'Chưa gửi email nhắc gia hạn'}</small></div><div class="renewal-actions">${x.renewal_stage==='renewed'?((x.renewal_history_expiry&&String(x.renewal_history_expiry).slice(0,10)>String(x.expires_at||'').slice(0,10))?'<span class="renewal-done-note">Thời hạn dịch vụ chưa khớp lịch sử gia hạn</span><button id="svRepairRenewal" class="smallbtn" type="button">Đồng bộ thời hạn</button>':'<span class="renewal-done-note">Chu kỳ gia hạn đã hoàn tất</span><button id="svResetRenewalTest" class="smallbtn danger-lite" type="button" title="Chỉ dùng để test lại quy trình gia hạn">Reset chu kỳ gia hạn test</button>'):x.renewal_stage==='paid'?'<button id="svOpenRegistrar" class="smallbtn" type="button">Mở Cloudflare gia hạn domain ↗</button><button id="svCheckRenewalDomain" class="smallbtn" type="button">Kiểm tra lại domain</button><button id="svMarkRenewed" class="smallbtn" type="button">Hoàn tất gia hạn</button>':x.renewal_stage==='payment_pending'?'<span class="renewal-done-note">Đang chờ khách thanh toán QR</span>':'<button id="svSendRenewal" class="smallbtn" type="button">Gửi email nhắc gia hạn</button>'}</div></div>
   <div class="two"><label>Ngày bắt đầu<input id="svStart" type="date" value="${esc(x.started_at||'')}"></label><label>Ngày hết hạn dịch vụ<input id="svExpire" type="date" value="${esc(x.expires_at||'')}"></label></div>
   <div class="two"><label>Ngày mua domain<input id="svDomainStart" type="date" value="${esc(x.domain_registered_at||'')}"></label><label>Ngày hết hạn domain<input id="svDomainExpire" type="date" value="${esc(x.domain_expires_at||'')}"></label></div>
   <label>Ghi chú dịch vụ<textarea id="svNote">${esc(x.service_note||'')}</textarea></label>
   <div class="profit-box"><span>Lợi nhuận dự kiến</span><b>${Number((x.sale_price||0)-(x.internal_cost||0)).toLocaleString('vi-VN')}đ/năm</b></div>
   <button class="btn primary" type="submit">Lưu thông tin dịch vụ</button>
  </form><section id="customerFinanceBox" class="customer-ledger"><h3>Lịch sử giao dịch & timeline</h3><small>Đang tải...</small></section>`
  customerModal.classList.remove('hidden');
  const svUploadFavicon=document.getElementById('svUploadFavicon');
  const svFaviconFile=document.getElementById('svFaviconFile');
  if(svUploadFavicon)svUploadFavicon.onclick=async()=>{const file=svFaviconFile?.files?.[0];if(!file){alert('Chọn ảnh favicon trước.');return}const fd=new FormData();fd.append('site_id',String(id));fd.append('file',file);const old=svUploadFavicon.textContent;svUploadFavicon.disabled=true;svUploadFavicon.textContent='Đang tải...';try{const token=localStorage.getItem('nr_master_token')||'';const r=await fetch('/api/master/favicon-upload',{method:'POST',body:fd,headers:token?{'Authorization':'Bearer '+token}:{},credentials:'include'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Không cập nhật được favicon');alert('Đã cập nhật favicon.');await viewCustomer(id)}catch(e){alert(e.message)}finally{svUploadFavicon.disabled=false;svUploadFavicon.textContent=old}};
  const svClearFavicon=document.getElementById('svClearFavicon');if(svClearFavicon)svClearFavicon.onclick=async()=>{if(!confirm('Đưa favicon website về mặc định?'))return;try{await mapi('favicon-clear',{method:'POST',body:JSON.stringify({site_id:id})});await viewCustomer(id)}catch(e){alert(e.message)}};
  try{const docs=await mapi('service-documents?site_id='+id),rows=docs.documents||[];const ttl=document.getElementById('svDocTitle'),btn=document.getElementById('svOpenLatestDoc');if(ttl)ttl.textContent=rows.length?`${rows.length} biên bản đã lưu · gần nhất ${rows[0].document_code}`:'Chưa có biên bản kích hoạt';if(btn&&rows.length){btn.disabled=false;btn.onclick=async()=>{try{const d=await mapi('service-document?id='+rows[0].id);const w=window.open('','_blank');w.document.open();w.document.write(d.html||'');w.document.close()}catch(e){alert(e.message)}}}}catch(e){}
  const svApplyTheme=document.getElementById('svApplyTheme');
  if(svApplyTheme)svApplyTheme.onclick=async()=>{
    const templateKey=document.getElementById('svTemplateKey')?.value||'';
    const tpl=(tmData||[]).find(t=>t.template_key===templateKey);
    const label=tpl?.name||templateKey||'mẫu đã chọn';
    if(!confirm(`Kích hoạt ${label} cho website này?\n\nNội dung, domain và dữ liệu khách được giữ nguyên.`))return;
    const oldText=svApplyTheme.textContent;svApplyTheme.disabled=true;svApplyTheme.textContent='Đang kích hoạt...';
    try{await mapi('set-theme',{method:'POST',body:JSON.stringify({site_id:id,template_key:templateKey})});alert(`Đã kích hoạt ${label}.`);await viewCustomer(id)}
    catch(err){alert('Không đổi được giao diện: '+err.message)}
    finally{svApplyTheme.disabled=false;svApplyTheme.textContent=oldText}
  };
  const svInstallSamples=document.getElementById('svInstallSamples');
  if(svInstallSamples)svInstallSamples.onclick=async()=>{
    if(!confirm('Cài bộ bài mẫu của template hiện tại cho RIÊNG website khách này?\n\nBài khách tự đăng được giữ nguyên; bài mẫu đã có sẽ không bị nhân đôi.'))return;
    try{const r=await mapi('seed-demo',{method:'POST',body:JSON.stringify({site_id:id})});alert(`Đã xử lý bài mẫu: tạo ${Number(r.created||0)} · bỏ qua ${Number(r.skipped||0)}.`);await viewCustomer(id);await loadMaster()}catch(e){alert(e.message||'Không cài được bài mẫu')}
  };
  const svClearSamples=document.getElementById('svClearSamples');
  if(svClearSamples)svClearSamples.onclick=async()=>{
    if(!confirm('Xóa toàn bộ BÀI MẪU khỏi website này?\n\nBài khách tự đăng sẽ không bị xóa.'))return;
    try{const r=await mapi('clear-demo',{method:'POST',body:JSON.stringify({site_id:id})});alert(`Đã xóa ${Number(r.deleted||0)} bài mẫu.`);await viewCustomer(id);await loadMaster()}catch(e){alert(e.message||'Không xóa được bài mẫu')}
  };
  const svSendPasswordReset=document.getElementById('svSendPasswordReset');
  if(svSendPasswordReset)svSendPasswordReset.onclick=async()=>{
    if(!confirm(`Gửi liên kết đặt lại mật khẩu tới ${x.email||x.admin_email||'email quản trị'}?\n\nLink có hiệu lực 30 phút và chỉ dùng được một lần.`))return;
    const oldText=svSendPasswordReset.textContent;svSendPasswordReset.disabled=true;svSendPasswordReset.textContent='Đang gửi...';
    try{
      const r=await mapi('send-password-reset',{method:'POST',body:JSON.stringify({site_id:id})});
      alert(`Đã gửi link đặt lại mật khẩu tới ${r.email||x.email||x.admin_email||'email khách hàng'}.`);
    }catch(err){alert('Không gửi được link đặt lại mật khẩu: '+err.message)}
    finally{svSendPasswordReset.disabled=false;svSendPasswordReset.textContent=oldText}
  };
  domainManagerBox.classList.remove('hidden');
  loadCustomerFinance(id);
  if(dmDomain)dmDomain.value=x.domain||'';if(dmStatus)dmStatus.value=x.domain_status||'not_configured';
  if(dmCost)dmCost.value=x.internal_cost||'';if(dmRegistrar)dmRegistrar.value=x.registrar||'Cloudflare';

  const pagesWatchStatus=document.getElementById('dmPagesWatchStatus');
  const pagesWatchNote=document.getElementById('dmPagesWatchNote');
  let domainWatchTimer=null;
  let domainWatchRuns=0;
  const stopDomainWatch=()=>{if(domainWatchTimer){clearTimeout(domainWatchTimer);domainWatchTimer=null;}};
  activeDomainWatchStop=stopDomainWatch;
  const setWatch=(state,text,note)=>{
    if(pagesWatchStatus){
      pagesWatchStatus.dataset.state=state||'pending';
      pagesWatchStatus.textContent=text||'Đang kiểm tra DNS/SSL...';
    }
    if(pagesWatchNote)pagesWatchNote.textContent=note||'';
    const ms=document.getElementById('dmPagesWatchStatusMirror');
    const mn=document.getElementById('dmPagesWatchNoteMirror');
    if(ms){ms.dataset.state=state||'pending';ms.textContent=text||'Đang kiểm tra DNS/SSL...';}
    if(mn)mn.textContent=note||'';
  };
  const watchDomain=async()=>{
    stopDomainWatch();
    const domain=(dmDomain?.value||x.domain||'').trim().toLowerCase();
    if(!domain){setWatch('idle','Chưa có domain thực tế','Nhập domain đã mua để hệ thống theo dõi Pages.');return;}
    try{
      const s=await mapi(`domain-provision-status?site_id=${encodeURIComponent(id)}&domain=${encodeURIComponent(domain)}`);
      const ps=String(s?.pages_status||s?.status||'').toLowerCase();
      const dnsOk=!!s?.dns?.ok;
      const validation=s?.validation_status||'pending';
      const ssl=s?.ssl_status||'pending';
      const da=s?.dns_action;
      let dnsText=dnsOk?'✓ Có bản ghi':'… Chưa phân giải';
      if(!dnsOk&&da?.ok)dnsText=da.created?'✓ Đã tự tạo DNS, đang lan truyền':'✓ DNS Pages đã cấu hình, đang lan truyền';
      if(!dnsOk&&da&&!da.ok)dnsText='! Chưa tạo được DNS';
      const details=`DNS: ${dnsText} · Pages: ${ps||'pending'} · Xác thực: ${validation} · SSL: ${ssl}`+(da&&!da.ok?` · ${da.error}`:'');
      if(ps==='active'){
        setWatch('active','✓ Domain + SSL đã hoạt động',details);
        if(dmStatus)dmStatus.value='active';
        try{await saveService({silent:true});}catch(_){}
        stopDomainWatch();
        loadMaster();
        return;
      }
      if(ps==='error'||s?.error){
        setWatch('error','! Cloudflare Pages đang lỗi',(s?.error||'Không lấy được trạng thái custom domain.')+' · '+details);
      }else{
        setWatch('pending','● Đang chờ hoàn tất...',details);
      }
    }catch(err){
      setWatch('error','! Chưa kiểm tra được Pages',err.message||'Lỗi kết nối');
    }
    domainWatchRuns++;
    if(domainWatchRuns<60) domainWatchTimer=setTimeout(watchDomain,5000);
  };
  setTimeout(watchDomain,300);
  if(dmResult){
    dmResult.className='domain-check-result';
    dmResult.innerHTML=`<div class="domain-pages-watch">
      <div class="domain-pages-watch-title">Cloudflare Pages</div>
      <div class="domain-pages-watch-status" id="dmPagesWatchStatusMirror">● Đang kiểm tra DNS/SSL...</div>
      <div class="domain-pages-watch-note" id="dmPagesWatchNoteMirror">Tự động kiểm tra, không cần bấm thủ công.</div>
    </div>`;
  }

  if(dmRegisteredAt)dmRegisteredAt.value=(x.domain_registered_at||'').slice(0,10);
  if(dmExpiresAt)dmExpiresAt.value=(x.domain_expires_at||'').slice(0,10);
  
  if(dmResult)dmResult.classList.remove('hidden');
  if(dmOpenCloudflare)dmOpenCloudflare.onclick=()=>window.open('https://dash.cloudflare.com/?to=/:account/domains/registrations','_blank','noopener');
  if(dmCompleteDomain)dmCompleteDomain.onclick=async()=>{try{
    const domain=(dmDomain?.value||'').trim();
    if(!domain)return alert('Nhập tên miền đã mua');

    dmCompleteDomain.disabled=true;
    dmCompleteDomain.textContent='Đang đồng bộ...';

    const d=await mapi('domain-complete',{method:'POST',body:JSON.stringify({site_id:id,domain})});

    let finalPagesStatus=d.pages_status||'pending';
    let finalPagesError=d.pages_error||'';

    if(d.pages_configured){
      for(let i=0;i<8;i++){
        await new Promise(r=>setTimeout(r,2500));
        try{
          const st=await mapi('domain-provision-status?site_id='+id+'&domain='+encodeURIComponent(domain));
          finalPagesStatus=st.pages_status||finalPagesStatus;
          finalPagesError=st.error||'';
          if(st.active||st.pages_status==='error')break;
        }catch{}
      }
    }

    stopDomainWatch?.();customerModal.classList.add('hidden');
    await loadMaster();

    if(!d.pages_configured){
      showProvisionNotice({
        type:'error',
        title:'Domain đã lưu nhưng Pages chưa tự gắn',
        text:finalPagesError||'Functions chưa nhận CF_PAGES_TOKEN/CF_ACCOUNT_ID. Chưa nên gửi link kích hoạt cho khách.',
        activation_url:null
      });
    }else if(finalPagesStatus==='active'){
      showProvisionNotice({
        type:'ok',
        title:'Domain + SSL đã hoạt động',
        text:`${domain} đã sẵn sàng. Bây giờ có thể tạo Link kích hoạt để bàn giao cho khách.`,
        activation_url:null
      });
    }else if(finalPagesStatus==='error'){
      showProvisionNotice({
        type:'error',
        title:'Tự cấu hình domain thất bại',
        text:finalPagesError||'Cloudflare Pages trả về lỗi khi gắn custom domain.',
        activation_url:null
      });
    }else{
      showProvisionNotice({
        type:'pending',
        title:'Đang chờ DNS/SSL',
        text:`${domain} đã được ghi nhận. Cloudflare Pages đang hoàn tất custom domain và SSL. Chưa gửi link cho khách cho tới khi trạng thái chuyển Hoạt động.`,
        activation_url:null
      });
    }
  }catch(err){
    stopDomainWatch?.();customerModal.classList.add('hidden');
    await loadMaster();
    showProvisionNotice({
      type:'error',
      title:'Tự cấu hình domain thất bại',
      text:err.message||String(err)
    });
  }finally{
    dmCompleteDomain.disabled=false;
    dmCompleteDomain.textContent='Đã mua domain · Tự cấu hình';
  }};

  if(dmMarkPurchased)dmMarkPurchased.onclick=async()=>{try{
    if(!dmDomain.value.trim())return alert('Nhập tên miền đã mua');
    if(!confirm('Xác nhận domain này đã được mua trên Cloudflare và ghi nhận vào NEWSREAL?'))return;
    await mapi('domain-mark-purchased',{method:'POST',body:JSON.stringify({
      site_id:id,domain:dmDomain.value,internal_cost:Number(dmCost.value||0),
      registrar:dmRegistrar.value||'Cloudflare',domain_registered_at:dmRegisteredAt.value,
      domain_expires_at:dmExpiresAt.value
    })});
    dmStatus.value='active';
    alert('Đã ghi nhận domain đã mua');
    stopDomainWatch?.();stopDomainWatch?.();customerModal.classList.add('hidden');loadMaster();
  }catch(err){alert(err.message)}};
  if(dmCheck)dmCheck.onclick=async()=>{try{const d=await mapi('domain-check',{method:'POST',body:JSON.stringify({domain:dmDomain.value})});renderDomainCheck(dmResult,d)}catch(err){dmResult.className='domain-check-result danger';dmResult.innerHTML=`<b>Lỗi kiểm tra</b><span>${esc(err.message)}</span>`}};
  if(dmSave)dmSave.onclick=async()=>{try{await mapi('domain-save',{method:'POST',body:JSON.stringify({site_id:id,domain:dmDomain.value,domain_status:dmStatus.value})});alert('Đã lưu tên miền');stopDomainWatch?.();customerModal.classList.add('hidden');loadMaster()}catch(err){alert(err.message)}};
  svPayment.value=x.payment_status||'unpaid';svStatus.value=x.service_status||'setup';svDomain.value=x.domain_status||'not_configured';

  const addMonthsDate=(dateStr,months)=>{
    if(!dateStr)return '';
    const [y,m,d]=dateStr.split('-').map(Number),dt=new Date(Date.UTC(y,m-1,1));dt.setUTCMonth(dt.getUTCMonth()+Number(months||0));
    const last=new Date(Date.UTC(dt.getUTCFullYear(),dt.getUTCMonth()+1,0)).getUTCDate();dt.setUTCDate(Math.min(d,last));return dt.toISOString().slice(0,10);
  };
  const updatePromoSummary=(recalc=false)=>{
    const paid=Math.max(1,Number(svTermMonths?.value||12)),list=Number(svListPrice?.value||0),discount=Number(svFirstDiscount?.value||0),first=Math.max(0,list-discount),renew=Number(svRenewalPrice?.value||list);
    if(svPromoSummary)svPromoSummary.innerHTML=`Giá niêm yết <b>${list.toLocaleString('vi-VN')}đ</b> → lần đầu <b>${first.toLocaleString('vi-VN')}đ</b> → gia hạn <b>${renew.toLocaleString('vi-VN')}đ/${paid} tháng</b>.`;
    if(recalc&&svStart?.value&&svExpire)svExpire.value=addMonthsDate(svStart.value,paid);
  };
  updatePromoSummary(false);
  [svTermMonths,svListPrice,svFirstDiscount,svRenewalPrice].filter(Boolean).forEach(el=>el.addEventListener('change',()=>updatePromoSummary(true)));
  if(svStart)svStart.addEventListener('change',()=>updatePromoSummary(true));
  const svSendRenewal=document.getElementById('svSendRenewal'),svSendPayment=document.getElementById('svSendPayment'),svMarkPaid=document.getElementById('svMarkPaid'),svMarkRenewed=document.getElementById('svMarkRenewed'),svRepairRenewal=document.getElementById('svRepairRenewal'),svResetRenewalTest=document.getElementById('svResetRenewalTest');
  if(svSendRenewal)svSendRenewal.onclick=async()=>{
    if(!confirm(`Gửi email hỏi gia hạn tới khách hàng của "${cleanSiteName(x.name||'website')}" ngay bây giờ?`))return;
    svSendRenewal.disabled=true;svSendRenewal.textContent='Đang gửi...';
    try{const r=await mapi('send-renewal-reminder',{method:'POST',body:JSON.stringify({site_id:id})});alert(`Đã gửi email nhắc gia hạn tới ${r.email}.`);await viewCustomer(id)}
    catch(err){alert('Chưa gửi được email: '+err.message);}
  };
  if(svSendPayment)svSendPayment.onclick=async()=>{
    if(!confirm(`Gửi hướng dẫn thanh toán gia hạn tới khách hàng của "${cleanSiteName(x.name||'website')}"?`))return;
    svSendPayment.disabled=true;svSendPayment.textContent='Đang gửi...';
    try{const r=await mapi('send-renewal-payment',{method:'POST',body:JSON.stringify({site_id:id})});alert(`Đã gửi hướng dẫn thanh toán tới ${r.email}.\nNội dung CK: ${r.memo}`);await viewCustomer(id)}
    catch(err){alert('Chưa gửi được hướng dẫn thanh toán: '+err.message)}
  };
  if(svMarkPaid)svMarkPaid.onclick=async()=>{
    if(!confirm('Xác nhận khách hàng đã thanh toán gia hạn?'))return;
    try{await mapi('renewal-stage',{method:'POST',body:JSON.stringify({site_id:id,stage:'paid'})});alert('Đã ghi nhận khách hàng đã thanh toán.');await viewCustomer(id)}catch(err){alert(err.message)}
  };
  const svOpenRegistrar=document.getElementById('svOpenRegistrar');
  const svCheckRenewalDomain=document.getElementById('svCheckRenewalDomain');
  if(svOpenRegistrar)svOpenRegistrar.onclick=()=>window.open('https://dash.cloudflare.com/?to=/:account/domains/registrations','_blank','noopener');
  if(svCheckRenewalDomain)svCheckRenewalDomain.onclick=async()=>{
    svCheckRenewalDomain.disabled=true;svCheckRenewalDomain.textContent='Đang kiểm tra...';
    try{const r=await mapi('check-renewal-domain',{method:'POST',body:JSON.stringify({site_id:id})});
      alert(r.ready?`Domain đã gia hạn thành công.\nThời hạn phát hiện: ${r.renewal_years} năm (${r.renewal_months} tháng)\nDomain hết hạn: ${r.domain_expires_at}\nDịch vụ sẽ tự gia hạn đến: ${r.service_expiry_after_renewal}\nCó thể bấm Hoàn tất gia hạn.`:`Domain chưa đủ thời hạn.\nHiện tại: ${r.domain_expires_at}\nCần tối thiểu: ${r.required_expiry}\nHãy renew domain trên Cloudflare rồi kiểm tra lại.`);await viewCustomer(id)}catch(err){alert('Không kiểm tra được domain: '+err.message);svCheckRenewalDomain.disabled=false;svCheckRenewalDomain.textContent='Kiểm tra lại domain'}
  };
  if(svMarkRenewed)svMarkRenewed.onclick=async()=>{
    if(!confirm('Xác nhận dịch vụ đã được gia hạn hoàn tất?'))return;
    try{const r=await mapi('renewal-stage',{method:'POST',body:JSON.stringify({site_id:id,stage:'renewed'})});alert(`Gia hạn hoàn tất.\nThời hạn: ${r.renewal_years||Math.round((r.term_months||12)/12)} năm\nNgày hết hạn mới: ${r.new_expiry}${r.email_sent?'\nĐã gửi email xác nhận cho khách.':'\nEmail xác nhận chưa gửi được'+(r.email_error?': '+r.email_error:'')}`);await viewCustomer(id);await loadMaster()}catch(err){alert(err.message)}
  };


  if(svResetRenewalTest)svResetRenewalTest.onclick=async()=>{
    if(!confirm('CHỈ DÙNG TEST: Hoàn tác chu kỳ gia hạn gần nhất và đưa khách về trạng thái Đã thanh toán để kiểm tra luồng renew domain?\n\nThời hạn dịch vụ sẽ quay về mốc trước khi gia hạn. Domain không bị thay đổi.'))return;
    svResetRenewalTest.disabled=true;svResetRenewalTest.textContent='Đang reset...';
    try{const r=await mapi('reset-renewal-test',{method:'POST',body:JSON.stringify({site_id:id})});alert(`Đã reset chu kỳ test.\nHạn dịch vụ: ${r.old_current_expiry} → ${r.restored_expiry}\nTrạng thái: Đã thanh toán.\nBây giờ có thể test Mở Cloudflare → Kiểm tra domain → Hoàn tất gia hạn.`);await viewCustomer(id);await loadMaster()}catch(err){alert(err.message);svResetRenewalTest.disabled=false;svResetRenewalTest.textContent='Reset chu kỳ gia hạn test'}
  };

  if(svRepairRenewal)svRepairRenewal.onclick=async()=>{
    if(!confirm('Đây là dữ liệu gia hạn cũ chưa được cộng thời hạn. Đồng bộ thêm đúng một chu kỳ dịch vụ?'))return;
    svRepairRenewal.disabled=true;svRepairRenewal.textContent='Đang đồng bộ...';
    try{const r=await mapi('repair-renewal-cycle',{method:'POST',body:JSON.stringify({site_id:id})});alert(`Đã đồng bộ chu kỳ gia hạn.\n${r.old_expiry} → ${r.new_expiry}${r.email_sent?'\nĐã gửi email xác nhận cho khách.':'\nEmail xác nhận chưa gửi được'+(r.email_error?': '+r.email_error:'')}`);await viewCustomer(id);await loadMaster()}catch(err){alert(err.message);svRepairRenewal.disabled=false;svRepairRenewal.textContent='Đồng bộ chu kỳ +12 tháng'}
  };

  
  const svPaidAmountEl=document.getElementById('svPaidAmount'),svPaidRowEl=document.getElementById('svPaidRow'),svRemainingEl=document.getElementById('svRemaining');
  const updateServicePaymentUI=()=>{
    const sale=Math.max(0,Number(svSale?.value||0));
    if(svPayment?.value==='paid'&&svPaidAmountEl)svPaidAmountEl.value=sale;
    if(svPayment?.value==='unpaid'&&svPaidAmountEl)svPaidAmountEl.value=0;
    if(svPaidRowEl)svPaidRowEl.classList.toggle('hidden',svPayment?.value!=='partial');
    const paid=svPayment?.value==='paid'?sale:svPayment?.value==='partial'?Number(svPaidAmountEl?.value||0):0;
    if(svRemainingEl)svRemainingEl.textContent=vnd(Math.max(0,sale-paid));
  };
  svPayment?.addEventListener('change',updateServicePaymentUI);
  svPaidAmountEl?.addEventListener('input',updateServicePaymentUI);
  svSale?.addEventListener('input',updateServicePaymentUI);
  updateServicePaymentUI();

  const saveService=async({silent=false}={})=>{
    await mapi('update-service',{method:'POST',body:JSON.stringify({site_id:id,plan_name:svPlan.value,sale_price:svSale.value,internal_cost:svCost.value,
      payment_status:svPayment.value,paid_amount:Number(document.getElementById('svPaidAmount')?.value||0),service_status:svStatus.value,domain_status:svDomain.value,started_at:svStart.value||null,expires_at:svExpire.value||null,
      domain_registered_at:svDomainStart.value||null,domain_expires_at:svDomainExpire.value||null,term_months:svTermMonths.value,list_price:svListPrice.value,first_discount:svFirstDiscount.value,first_price:Math.max(0,Number(svListPrice.value||0)-Number(svFirstDiscount.value||0)),renewal_price:svRenewalPrice.value,promotion_name:svPromotionName.value,auto_renew:false,registrar:(dmRegistrar?.value||x.registrar||'Cloudflare'),note:svNote.value})});
    if(!silent)alert('Đã lưu thông tin dịch vụ');
  };

  serviceForm.onsubmit=async e=>{e.preventDefault();try{
    await saveService();
    stopDomainWatch?.();stopDomainWatch?.();customerModal.classList.add('hidden');loadMaster();
  }catch(err){alert(err.message)}};

  let autoSaveTimer=null;
  const autoSaveFields=[svPlan,svSale,svCost,svPayment,document.getElementById('svPaidAmount'),svStatus,svDomain,svTermMonths,svListPrice,svFirstDiscount,svRenewalPrice,svPromotionName,svStart,svExpire,svDomainStart,svDomainExpire,svNote].filter(Boolean);
  autoSaveFields.forEach(el=>{
    const evt=(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='date')?'change':'input';
    el.addEventListener(evt,()=>{
      clearTimeout(autoSaveTimer);
      autoSaveTimer=setTimeout(()=>saveService({silent:true}).catch(()=>{}),500);
    });
  });
 }catch(err){alert(err.message)}
}

if(masterLoginForm)masterLoginForm.onsubmit=async e=>{e.preventDefault();const btn=e.submitter;btn.disabled=true;btn.textContent='Đang đăng nhập...';try{
 const d=await mapi('login',{method:'POST',body:JSON.stringify({master_key:masterKey.value})});
 if(d.master_token)localStorage.setItem('nr_master_token',d.master_token);
 masterLoginMsg.classList.add('hidden');
 await loadMaster();
}catch(err){masterLoginMsg.textContent=err.message;masterLoginMsg.classList.remove('hidden')}finally{btn.disabled=false;btn.textContent='Đăng nhập Master'}}
async function toggleSite(id,status){if(!confirm(status==='inactive'?'Khóa website này?':'Mở lại website này?'))return;await mapi('site-status',{method:'PUT',body:JSON.stringify({site_id:id,status})});loadMaster()}
async function masterLogout(){await mapi('logout',{method:'POST',body:'{}'}).catch(()=>{});localStorage.removeItem('nr_master_token');location.reload()}
const refreshFinance=document.getElementById('refreshFinance');if(refreshFinance)refreshFinance.onclick=()=>runMasterRefresh(refreshFinance,()=>Promise.all([loadFinance(),loadExpenses()]));
loadMaster();
window.addEventListener('error',e=>{
  if(masterLoginMsg){
    masterLoginMsg.textContent='Lỗi giao diện Control Center: '+(e.message||'JavaScript không chạy');
    masterLoginMsg.classList.remove('hidden');
  }
});


['siteSearch','siteStatusFilter','sitePaymentFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='siteSearch'?'input':'change',renderSiteRows));
document.getElementById('clearSiteFilters')?.addEventListener('click',()=>{const a=document.getElementById('siteSearch'),b=document.getElementById('siteStatusFilter'),c=document.getElementById('sitePaymentFilter');if(a)a.value='';if(b)b.value='';if(c)c.value='';renderSiteRows()});
document.getElementById('sitePrevPage')?.addEventListener('click',()=>{if(__sitePage>1){__sitePage--;renderSiteRows()}});
document.getElementById('siteNextPage')?.addEventListener('click',()=>{__sitePage++;renderSiteRows()});
document.getElementById('sitePageSize')?.addEventListener('change',e=>{__sitePageSize=Number(e.target.value||10);__sitePage=1;renderSiteRows()});
['siteSearch','siteStatusFilter','sitePaymentFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='siteSearch'?'input':'change',()=>{__sitePage=1;}));
['ledgerSearch','ledgerKindFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='ledgerSearch'?'input':'change',renderLedger));
document.getElementById('clearLedgerFilters')?.addEventListener('click',()=>{const a=document.getElementById('ledgerSearch'),b=document.getElementById('ledgerKindFilter');if(a)a.value='';if(b)b.value='';renderLedger()});
document.getElementById('addExpense')?.addEventListener('click',addExpense);
const expenseDate=document.getElementById('expenseDate');if(expenseDate&&!expenseDate.value)expenseDate.value=new Date().toISOString().slice(0,10);



const TM_DEFAULT_BUY_CATEGORIES=[
 'Mua căn hộ chung cư','Mua nhà riêng','Mua nhà trọ, phòng trọ','Mua nhà mặt phố','Mua biệt thự, nhà liền kề',
 'Mua shophouse, nhà phố thương mại','Mua đất nền, đất dự án','Mua đất thổ cư, đất ở',
 'Mua trang trại, khu nghỉ dưỡng','Mua kho, nhà xưởng','Mua văn phòng','Mua khách sạn',
 'Mua mặt bằng kinh doanh','Bất động sản cần mua khác'
];
const TM_DEFAULT_SALE_CATEGORIES=[
 'Bán căn hộ chung cư','Bán nhà riêng','Bán nhà trọ, phòng trọ','Bán nhà mặt phố','Bán biệt thự, nhà liền kề',
 'Bán shophouse, nhà phố thương mại','Bán đất nền, đất dự án','Bán đất thổ cư, đất ở',
 'Bán trang trại, khu nghỉ dưỡng','Bán kho, nhà xưởng','Bán văn phòng','Bán khách sạn',
 'Bán mặt bằng kinh doanh','Bất động sản bán khác'
];
const TM_DEFAULT_RENT_CATEGORIES=[
 'Cho thuê căn hộ chung cư','Cho thuê nhà riêng','Cho thuê nhà trọ, phòng trọ','Cho thuê nhà mặt phố','Cho thuê biệt thự, nhà liền kề',
 'Cho thuê shophouse, cửa hàng','Cho thuê văn phòng','Cho thuê kho, nhà xưởng',
 'Cho thuê mặt bằng kinh doanh','Cho thuê đất','Bất động sản cho thuê khác'
];
const TM_DEFAULT_NEWS_CATEGORIES=['Kinh tế','Công nghệ','Du lịch','Sức khỏe','Bất động sản','Đời sống','Kinh doanh','Giáo dục','Nhà đẹp'];
const TM_DEFAULT_GAME_CATEGORIES=['Town Hall','Builder Hall','Clan Capital'];
function tmLines(v=''){return String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean)}
function tmProfile(t){
 let p={};try{p=typeof t?.editor_profile==='object'?t.editor_profile:JSON.parse(t?.editor_profile||'{}')}catch{}
 const ct=p.content_type||(t?.category==='tin-tuc'?'news':t?.category==='dich-vu'?'service':t?.category==='game'?'game':'property');
 if(ct==='property'){
  p.categoriesByTransaction=p.categoriesByTransaction||{};
  p.categoriesByTransaction.buy=Array.isArray(p.categoriesByTransaction.buy)&&p.categoriesByTransaction.buy.length?p.categoriesByTransaction.buy:TM_DEFAULT_BUY_CATEGORIES;
  p.categoriesByTransaction.sale=Array.isArray(p.categoriesByTransaction.sale)&&p.categoriesByTransaction.sale.length?p.categoriesByTransaction.sale:TM_DEFAULT_SALE_CATEGORIES;
  p.categoriesByTransaction.rent=Array.isArray(p.categoriesByTransaction.rent)&&p.categoriesByTransaction.rent.length?p.categoriesByTransaction.rent:TM_DEFAULT_RENT_CATEGORIES;
 }else if(ct==='news'){
  p.categories=Array.isArray(p.categories)&&p.categories.length?p.categories:TM_DEFAULT_NEWS_CATEGORIES;
 }else if(ct==='service'){
  p.categories=Array.isArray(p.categories)&&p.categories.length?p.categories:['Internet FPT','Truyền hình FPT','Camera FPT','Combo Internet + Truyền hình','Combo Internet + Camera','Khuyến mãi'];
 }else if(ct==='game'){
  p.categories=Array.isArray(p.categories)&&p.categories.length?p.categories:TM_DEFAULT_GAME_CATEGORIES;
 }
 return {id:p.id||ct,content_type:ct,contentLabel:p.contentLabel||'',contentHelp:p.contentHelp||'',categories:p.categories||[],categoriesByTransaction:p.categoriesByTransaction||{},custom_fields:Array.isArray(p.custom_fields)?p.custom_fields:[]};
}
function tmToggleProfileFields(){
 const ct=document.getElementById('teContentType')?.value||'property';
 document.getElementById('tePropertyCategories')?.classList.toggle('hidden',ct!=='property');
 document.getElementById('teCategoriesWrap')?.classList.toggle('hidden',ct==='property');
}

const TM_DEFAULT_LAYOUT={category_columns:4,category_rows:2,sidebar_enabled:1,sidebar_read_most:6,sidebar_latest:5,sidebar_categories:8,home_latest_count:10,related_count:6};
function tmLayoutProfile(t){let p={};try{p=typeof t?.layout_profile==='object'?t.layout_profile:JSON.parse(t?.layout_profile||'{}')}catch{}return {...TM_DEFAULT_LAYOUT,...p}}
function tmStructureProfile(t){let p={};try{p=typeof t?.structure_profile==='object'?t.structure_profile:JSON.parse(t?.structure_profile||'{}')}catch{}return p&&Array.isArray(p.sections)?p:{version:1,content_type:tmProfile(t).content_type,sections:[]}}
function tmStructureDefaults(type='section'){
 const staticTypes=new Set(['section','intro','topics','property_search','property_categories','benefits','newsletter','services','stats']);
 const map={category:'category',latest:'latest',breaking:'latest',ticker:'latest',trending:'latest',hero:'featured',special:'featured',explore:'latest',property_list:'property',property_projects:'projects',property_split:'property',property_areas:'property',news:'news',property_hero:'featured'};
 const bind=!staticTypes.has(String(type||'section'));return {bind_required:bind?1:0,content_source:map[type]||(bind?'auto':'none')};
}
function tmNormalizeStructureDraft(raw,contentType='generic'){
 const p=raw&&typeof raw==='object'?JSON.parse(JSON.stringify(raw)):{version:5,content_type:contentType,geometry_locked:0,sidebars:[],sections:[]};
 p.version=Math.max(5,Number(p.version||5));p.content_type=p.content_type||contentType;p.layout_contract=String(p.layout_contract||'universal-layout-v1');p.geometry_locked=Number(p.geometry_locked||0)?1:0;p.sidebars=Array.isArray(p.sidebars)?p.sidebars:[];p.sections=Array.isArray(p.sections)?p.sections:[];
 if(p.content_type==='news'){
  p.route_contract='news-v2';p.card_contract='title-only-v1';p.article_contract='article-first-v1';
  p.article_sidebar={enabled:1,sticky:1,internal_scroll:0,...(p.article_sidebar&&typeof p.article_sidebar==='object'?p.article_sidebar:{})};
  p.article_sidebar.enabled=1;p.article_sidebar.sticky=1;p.article_sidebar.internal_scroll=0;
 }
 p.sections=p.sections.map((x,i)=>{const type=String(x?.type||'section'),d=tmStructureDefaults(type),rawSlots=Math.max(0,Number(x?.slots||x?.limit||0)),dc=Math.max(1,Number(x?.desktop_columns||x?.columns||1));const slot_hosts=(Array.isArray(x?.slot_hosts)?x.slot_hosts:[]).map(h=>({selector:String(h?.selector||'').trim(),slots:Math.max(0,Number(h?.slots||0))})).filter(h=>h.selector&&h.slots>0);const slots=slot_hosts.length?slot_hosts.reduce((s,h)=>s+h.slots,0):rawSlots;return {...x,key:String(x?.key||`section-${i+1}`),type,slots,slot_contract:'exact',slot_hosts,desktop_columns:dc,tablet_columns:Math.max(1,Number(x?.tablet_columns||Math.min(2,dc))),mobile_columns:Math.max(1,Number(x?.mobile_columns||1)),fill_policy:x?.fill_policy||(d.bind_required?'complete_rows':'natural'),column_mode:['computed','fixed'].includes(String(x?.column_mode||''))?String(x.column_mode):'fixed',desktop_rows:Math.max(0,Number(x?.desktop_rows||0)),content_source:x?.content_source||d.content_source,bind_required:x?.bind_required===false||Number(x?.bind_required)===0?0:d.bind_required,empty_policy:x?.empty_policy||(d.bind_required?'slots':'message')}});return p;
}
function tmValidateStructure(raw){
 const p=tmNormalizeStructureDraft(raw,document.getElementById('teContentType')?.value||'generic'),errors=[],warnings=[],keys=new Set();
 if(!p.sections.length)errors.push('Chưa khai báo section nào.');
 p.sections.forEach((s,i)=>{const label=s.title||s.key||`Section ${i+1}`,key=String(s.key||'').trim(),slots=Number(s.slots||0),dc=Math.max(1,Number(s.desktop_columns||1)),bind=Number(s.bind_required||0)===1;if(!key)errors.push(`${label}: thiếu key`);else if(keys.has(key))errors.push(`${label}: key bị trùng`);else keys.add(key);if(bind&&slots<1)errors.push(`${label}: phải có slots > 0`);if(bind&&slots>0&&dc>slots)errors.push(`${label}: số cột Desktop lớn hơn slots`);if(bind&&s.fill_policy==='complete_rows'&&String(s.column_mode||'computed')==='fixed'&&slots>0&&slots%dc!==0)errors.push(`${label}: slots phải chia hết cho số cột Desktop khi column_mode=fixed`);const hosts=Array.isArray(s.slot_hosts)?s.slot_hosts:[];if(hosts.length){const hs=hosts.reduce((sum,h)=>sum+Number(h?.slots||0),0);if(hs!==slots)errors.push(`${label}: tổng slot_hosts (${hs}) phải bằng slots (${slots})`);hosts.forEach((h,hi)=>{if(!String(h?.selector||'').trim())errors.push(`${label}: slot_hosts ${hi+1} thiếu selector`);if(Number(h?.slots||0)<1)errors.push(`${label}: slot_hosts ${hi+1} phải có slots > 0`)})}if(bind&&String(s.column_mode||'computed')==='computed'&&Number(s.desktop_rows||0)<1)warnings.push(`${label}: nên khai báo desktop_rows để giữ đúng số hàng khi CSS đổi số cột`);if(s.content_source==='category'&&!String(s.category||'').trim())errors.push(`${label}: thiếu category`);if(bind&&s.empty_policy==='hide')warnings.push(`${label}: đang ẩn section khi web trống`);const denseTypes=new Set(['category','latest','explore','property_list','property_projects','news']);const rows=Number(s.desktop_rows||Math.ceil(slots/dc));if(bind&&denseTypes.has(String(s.type||''))&&rows<2)warnings.push(`${label}: trang chủ đang mỏng, nên dùng tối thiểu 2 hàng Desktop`)});
 p.sidebars.forEach((sb,si)=>{if(!String(sb?.root_selector||'').trim())errors.push(`Sidebar ${si+1}: thiếu root_selector`);(Array.isArray(sb?.widgets)?sb.widgets:[]).forEach((w,wi)=>{const label=w?.title||w?.key||`Widget ${wi+1}`;if(!String(w?.key||'').trim())errors.push(`Sidebar ${si+1}/${label}: thiếu key`);if(['ranked','latest','list'].includes(String(w?.type||''))&&Number(w?.slots||0)<1)errors.push(`Sidebar ${si+1}/${label}: phải có slots > 0`)})});
 if(p.content_type==='news'){
  if(p.route_contract!=='news-v2')errors.push('News template: route_contract phải là news-v2');
  if(p.card_contract!=='title-only-v1')errors.push('News template: card_contract phải là title-only-v1');
  if(p.article_contract!=='article-first-v1')errors.push('News template: article_contract phải là article-first-v1');
  if(Number(p.article_sidebar?.enabled)!==1)errors.push('News template: article sidebar phải được bật');
  if(Number(p.article_sidebar?.sticky)!==1)errors.push('News template: article sidebar phải sticky trên Desktop');
  if(Number(p.article_sidebar?.internal_scroll)!==0)errors.push('News template: sidebar không được dùng scrollbar riêng');
 }
 return {profile:p,ok:!errors.length,errors,warnings};
}
function tmRenderStructureHealth(){
 const box=document.getElementById('teStructureProfile'),out=document.getElementById('teStructureHealth');if(!box||!out)return;let raw={};try{raw=JSON.parse(box.value||'{}')}catch(e){out.className='tm-structure-health bad';out.textContent='✕ JSON không hợp lệ';return}const v=tmValidateStructure(raw);out.className='tm-structure-health '+(v.ok?'ok':'bad');out.innerHTML=v.ok?`✓ Universal Layout Contract hợp lệ · ${v.profile.sections.length} section${v.warnings.length?` · ${v.warnings.length} cảnh báo`:''}`:`✕ ${v.errors.length} lỗi: ${v.errors.slice(0,2).join(' · ')}`;
}

// V10.2 — Scientific Template Manager
const tmList=document.getElementById('tmList');
const tmMsg=document.getElementById('tmMsg');
const tmSearch=document.getElementById('tmSearch');
const tmCategoryFilter=document.getElementById('tmCategoryFilter');
const tmStatusFilter=document.getElementById('tmStatusFilter');
const refreshTemplateManager=document.getElementById('refreshTemplateManager');
const openTemplateEditor=document.getElementById('openTemplateEditor');
const templateEditorModal=document.getElementById('templateEditorModal');
const closeTemplateEditor=document.getElementById('closeTemplateEditor');
const cancelTemplateEditor=document.getElementById('cancelTemplateEditor');
const templateEditorForm=document.getElementById('templateEditorForm');
let tmData=[];let __tmPage=1,__tmPageSize=8;
function renderCreateThemePicker(selectedTemplateKey=''){
 if(!csThemePicker)return;
 const active=(tmData||[]).filter(t=>Number(t.is_active)===1);
 if(!active.length){csThemePicker.innerHTML='<div class="theme-picker-loading">Chưa có template đang mở bán.</div>';if(csTemplateKey)csTemplateKey.value='';return;}
 const selected=active.find(t=>t.template_key===selectedTemplateKey)||active.find(t=>t.template_key===csTemplateKey?.value)||active[0];
 csThemePicker.innerHTML=active.map(t=>`<label class="master-theme-card dynamic-theme-card ${t.template_key===selected.template_key?'active':''}"><input type="radio" name="csTheme" value="${tmEsc(t.preset||'newsreal')}" data-template-key="${tmEsc(t.template_key)}" ${t.template_key===selected.template_key?'checked':''}><span class="dynamic-theme-preview">${t.image_url?`<img src="${tmEsc(t.image_url)}" alt="">`:`<b>${tmEsc(t.template_key)}</b>`}</span><span class="dynamic-theme-info"><b>${tmEsc(t.name)}</b><small>${fmtTemplateMoney(t.price)} năm đầu · ${fmtTemplateMoney(t.renewal_price)} từ năm 2</small></span></label>`).join('');
 if(csTemplateKey)csTemplateKey.value=selected.template_key;
 csThemePicker.querySelectorAll('input[name="csTheme"]').forEach(r=>r.addEventListener('change',()=>{if(csTemplateKey)csTemplateKey.value=r.dataset.templateKey||'';csThemePicker.querySelectorAll('.master-theme-card').forEach(c=>c.classList.toggle('active',c.contains(r)&&r.checked));}));
}


const fmtTemplateMoney=n=>Number(n||0)>0?new Intl.NumberFormat('vi-VN').format(Number(n))+'đ':'Liên hệ';
const tmEsc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function tmClientSimulationUrl(t){
 const key=String(t?.template_key||'');
 let base=String(t?.demo_url||'').trim();
 if(!base){
   if(t?.category==='tin-tuc'){
     const m=key.match(/(\d+)$/);base=`/demo/tin-tuc/mau-${m?m[1]:'1'}/`;
   }else if(t?.category==='dich-vu'){
     const m=key.match(/(\d+)$/);base=`/demo/dich-vu/mau-${m?m[1]:'1'}/`;
   }else{
     const m=key.match(/mau-(\d+)/);base=`/demo/bat-dong-san/mau-${m?m[1]:'1'}/`;
   }
 }
 try{
   const u=new URL(base,location.origin);
   u.searchParams.set('nr_client','1');
   u.searchParams.set('nr_samples','0');
   return u.pathname+u.search;
 }catch(e){
   return base+(base.includes('?')?'&':'?')+'nr_client=1&nr_samples=0';
 }
}
const tmCatName=k=>({'bat-dong-san':'Bất động sản','tin-tuc':'Tin tức','ban-hang':'Bán hàng','landing-page':'Landing Page','dich-vu':'Dịch vụ','game':'Game'}[k]||k||'Khác');

function tmUpdateStats(){
 const active=tmData.filter(x=>Number(x.is_active)===1).length;
 document.getElementById('tmTotal').textContent=tmData.length;
 document.getElementById('tmActive').textContent=active;
 document.getElementById('tmHidden').textContent=tmData.length-active;
 document.getElementById('tmCategories').textContent=new Set(tmData.map(x=>x.category).filter(Boolean)).size;
}
function tmFiltered(){
 const q=(tmSearch?.value||'').trim().toLowerCase(),cat=tmCategoryFilter?.value||'',status=tmStatusFilter?.value||'';
 return tmData.filter(t=>(!q||String(t.name).toLowerCase().includes(q)||String(t.template_key).toLowerCase().includes(q))
   &&(!cat||t.category===cat)&&(!status||String(Number(t.is_active))===status));
}
function tmRender(){
 if(!tmList)return;
 const rows=tmFiltered();
 const pages=Math.max(1,Math.ceil(rows.length/__tmPageSize));if(__tmPage>pages)__tmPage=pages;
 const pageRows=rows.slice((__tmPage-1)*__tmPageSize,__tmPage*__tmPageSize);
 const info=document.getElementById('tmPageInfo');if(info)info.textContent=`Trang ${__tmPage}/${pages} · ${rows.length} mẫu`;
 tmList.innerHTML=pageRows.map(t=>`
  <article class="tm-card ${Number(t.is_active)?'is-active':'is-hidden'}" data-key="${tmEsc(t.template_key)}">
   <div class="tm-thumb">${t.image_url?`<img src="${tmEsc(t.image_url)}" alt="">`:'<div class="tm-thumb-empty">Không có ảnh</div>'}
    <span class="tm-state">${Number(t.is_active)?'ĐANG BÁN':'ĐANG ẨN'}</span>
   </div>
   <div class="tm-card-body">
    <div class="tm-card-title"><div><small>${tmEsc(tmCatName(t.category))} · #${Number(t.sort_order||0)}</small><h3>${tmEsc(t.name)}</h3><code>${tmEsc(t.template_key)}</code></div>${t.badge?`<span class="tm-badge">${tmEsc(t.badge)}</span>`:''}</div>
    <div class="tm-prices commercial-admin-prices">
      <div><small>NĂM ĐẦU</small><strong>${fmtTemplateMoney(t.price)}</strong></div>
      <div><small>TỪ NĂM 2 / 12 THÁNG</small><strong>${fmtTemplateMoney(t.renewal_price)}</strong></div>
      <div class="tm-save-value"><small>ƯU ĐÃI</small><strong>${Number(t.renewal_price)>Number(t.price)&&Number(t.price)>0?fmtTemplateMoney(Number(t.renewal_price)-Number(t.price)):'—'}</strong></div>
    </div>
    <div class="tm-package-mini">Tên miền 1 năm · Hosting 1 năm · Giao diện · Quản trị & bàn giao</div>
    <div class="tm-sample-state ${Number(t.sample_enabled)?'on':'off'}"><b>Bộ bài mẫu:</b> ${Number(t.sample_enabled)?`${Number(t.sample_count||12)} bài · Master cài theo yêu cầu khách`:'Chưa bật cho template'}</div>
    <div class="tm-card-actions">
      ${t.demo_url?`<a class="btn soft" href="${tmEsc(t.demo_url)}" target="_blank" rel="noopener">Xem demo ↗</a>`:''}
      <a class="btn primary tm-client-view" href="${tmEsc(tmClientSimulationUrl(t))}" target="_blank" rel="noopener">👤 Xem như khách hàng</a>
      <button class="btn soft tm-edit" type="button">Sửa</button>
      <button class="btn ${Number(t.is_active)?'warning':'primary'} tm-toggle" type="button">${Number(t.is_active)?'Ẩn khỏi kho':'Mở bán'}</button>
    </div>
   </div>
  </article>`).join('')||'<div class="empty-state">Không có template phù hợp bộ lọc.</div>';

 tmList.querySelectorAll('.tm-edit').forEach(b=>b.onclick=()=>tmOpenEditor(tmData.find(x=>x.template_key===b.closest('.tm-card').dataset.key)));
 tmList.querySelectorAll('.tm-toggle').forEach(b=>b.onclick=()=>tmToggle(b.closest('.tm-card').dataset.key));
}
async function loadTemplateManager(){
 if(!tmList)return;
 tmList.innerHTML='<div class="empty-state">Đang tải dữ liệu template…</div>';
 try{
  const r=await mapi('template-catalog');
  tmData=r.templates||[];tmUpdateStats();tmRender();renderCreateThemePicker(csTemplateKey?.value||'');
 }catch(e){tmList.innerHTML='<div class="empty-state">Không tải được Template Manager.</div>'}
}
function tmOpenEditor(t=null){
 templateEditorForm.reset();
 document.getElementById('tmModalTitle').textContent=t?'Chỉnh sửa template':'Thêm template mới';
 const set=(id,v)=>document.getElementById(id).value=v??'';
 set('teKey',t?.template_key||'');set('teName',t?.name||'');set('teCategory',t?.category||'bat-dong-san');
 set('tePreset',t?.preset||'');set('teSeoTitle',t?.seo_title||'');set('teSeoSlug',t?.seo_slug||'');set('tePrimaryKeyword',t?.primary_keyword||'');set('teSecondaryKeywords',t?.secondary_keywords||'');set('teMetaDescription',t?.meta_description||'');set('teInternalAnchor',t?.internal_anchor||'');set('tePrice',t?.price||0);set('teRenewal',t?.renewal_price||0);
 set('teSort',t?.sort_order||0);set('teAccent',t?.accent||'blue');set('teImage',t?.image_url||'');
 set('teDemo',t?.demo_url||'');set('teBadge',t?.badge||'');set('teDescription',t?.description||'');set('teFeatures',t?.features||'');
 const ep=tmProfile(t);
 set('teContentType',ep.content_type||'property');
 set('teContentLabel',ep.contentLabel||(ep.content_type==='news'?'Nội dung bài viết':ep.content_type==='service'?'Mô tả gói dịch vụ':ep.content_type==='game'?'Nội dung / chiến thuật base':'Mô tả chi tiết bất động sản'));
 set('teCategories',(ep.categories||[]).join('\n'));
 set('teBuyCategories',(ep.categoriesByTransaction?.buy||TM_DEFAULT_BUY_CATEGORIES).join('\n'));
 set('teSaleCategories',(ep.categoriesByTransaction?.sale||TM_DEFAULT_SALE_CATEGORIES).join('\n'));
 set('teRentCategories',(ep.categoriesByTransaction?.rent||TM_DEFAULT_RENT_CATEGORIES).join('\n'));
 tmToggleProfileFields();
 const sp=tmNormalizeStructureDraft(tmStructureProfile(t),ep.content_type||'generic');set('teStructureProfile',JSON.stringify(sp,null,2));setTimeout(tmRenderStructureHealth,0);
 const structureBox=document.getElementById('teStructureProfile');
 const legacyLayoutIds=['teCategoryColumns','teCategoryRows','teHomeLatestCount','teRelatedCount','teSidebarEnabled','teSidebarReadMost','teSidebarLatest','teSidebarCategories'];
 const geometryLocked=!!t && Number(sp?.geometry_locked||0)===1;
 if(structureBox){structureBox.readOnly=geometryLocked;structureBox.classList.toggle('tm-locked-field',geometryLocked);}
 legacyLayoutIds.forEach(id=>{const el=document.getElementById(id);if(el){el.disabled=geometryLocked;el.title=geometryLocked?'Khóa theo bộ khung gốc của template này':'';}});
 const sh=document.getElementById('teStructureHelp');if(sh)sh.textContent=geometryLocked?'Khung gốc của mẫu này đang được bảo vệ. Muốn thay đổi thiết kế, hãy tạo phiên bản template mới thay vì sửa hình học đang bán.':'Template mới: khai báo sections, slots và số cột theo từng thiết bị. Sau khi lưu, khung có thể được khóa để bảo vệ giao diện.';
 document.getElementById('teSampleEnabled').checked=t?Number(t.sample_enabled)===1:false;
 set('teSampleCount',Math.max(1,Math.min(30,Number(t?.sample_count||12))));
 const lp=tmLayoutProfile(t);set('teCategoryColumns',lp.category_columns);set('teCategoryRows',lp.category_rows);set('teHomeLatestCount',lp.home_latest_count);set('teRelatedCount',lp.related_count);set('teSidebarReadMost',lp.sidebar_read_most);set('teSidebarLatest',lp.sidebar_latest);set('teSidebarCategories',lp.sidebar_categories);document.getElementById('teSidebarEnabled').checked=Number(lp.sidebar_enabled)!==0;
 document.getElementById('teActive').checked=t?Number(t.is_active)===1:true;
 document.getElementById('teKey').readOnly=!!t;
 document.getElementById('tePricePreview').textContent=fmtTemplateMoney(t?.price||0);
 document.getElementById('teRenewalPreview').textContent=fmtTemplateMoney(t?.renewal_price||0);
 const sv=Math.max(0,Number(t?.renewal_price||0)-Number(t?.price||0));
 document.getElementById('teDiscountPreview').textContent=sv>0?fmtTemplateMoney(sv):'0đ';
 templateEditorModal.classList.remove('hidden');
}
function tmCloseEditor(){templateEditorModal?.classList.add('hidden')}

async function tmSeedExisting(key){
 const t=tmData.find(x=>x.template_key===key);if(!t)return;
 if(!Number(t.sample_enabled))return alert('Bài mẫu của template này đang tắt.');
 if(!confirm(`Đồng bộ tối đa ${Number(t.sample_count||12)} bài mẫu cho TẤT CẢ website đang dùng "${t.name}"?\n\nBài đã có sẽ được bỏ qua, bài khách tự đăng không bị ảnh hưởng.`))return;
 try{
   const r=await mapi('template-seed-existing',{method:'POST',body:JSON.stringify({template_key:key})});
   alert(`Đồng bộ hoàn tất.\nWebsite: ${r.sites||0}\nTạo mới: ${r.created||0} bài\nĐã có: ${r.skipped||0} bài${r.failed?`\nLỗi: ${r.failed} website`:''}`);
   loadMaster();
 }catch(e){alert(e.message||'Không đồng bộ được bài mẫu')}
}

async function tmToggle(key){
 const t=tmData.find(x=>x.template_key===key);if(!t)return;
 const next=Number(t.is_active)?0:1;
 try{
  await mapi('template-toggle',{method:'POST',body:JSON.stringify({template_key:key,is_active:next})});
  t.is_active=next;tmUpdateStats();tmRender();
  tmMsg.textContent=next?'✓ Template đã được mở bán lại.':'✓ Template đã ẩn khỏi Kho giao diện.';
  tmMsg.classList.remove('hidden');
 }catch(e){alert(e.message||'Không đổi được trạng thái')}
}
refreshTemplateManager?.addEventListener('click',()=>runMasterRefresh(refreshTemplateManager,loadTemplateManager));
openTemplateEditor?.addEventListener('click',()=>tmOpenEditor());
closeTemplateEditor?.addEventListener('click',tmCloseEditor);
cancelTemplateEditor?.addEventListener('click',tmCloseEditor);
tmSearch?.addEventListener('input',tmRender);
tmCategoryFilter?.addEventListener('change',tmRender);
tmStatusFilter?.addEventListener('change',tmRender);
document.getElementById('tmPrevPage')?.addEventListener('click',()=>{if(__tmPage>1){__tmPage--;tmRender()}});
document.getElementById('tmNextPage')?.addEventListener('click',()=>{__tmPage++;tmRender()});
document.getElementById('tmPageSize')?.addEventListener('change',e=>{__tmPageSize=Number(e.target.value||8);__tmPage=1;tmRender()});
[tmSearch,tmCategoryFilter,tmStatusFilter].filter(Boolean).forEach(el=>el.addEventListener(el===tmSearch?'input':'change',()=>{__tmPage=1;}));
function updateTemplatePricePreview(){
 const p=Number(document.getElementById('tePrice')?.value||0),r=Number(document.getElementById('teRenewal')?.value||0);
 document.getElementById('tePricePreview').textContent=fmtTemplateMoney(p);
 document.getElementById('teRenewalPreview').textContent=fmtTemplateMoney(r);
 const save=Math.max(0,r-p);
 document.getElementById('teDiscountPreview').textContent=save>0?fmtTemplateMoney(save):'0đ';
}
document.getElementById('tePrice')?.addEventListener('input',updateTemplatePricePreview);
document.getElementById('teRenewal')?.addEventListener('input',updateTemplatePricePreview);
document.getElementById('teContentType')?.addEventListener('change',tmToggleProfileFields);
document.getElementById('teStructureProfile')?.addEventListener('input',tmRenderStructureHealth);
document.getElementById('teContentType')?.addEventListener('change',tmRenderStructureHealth);

templateEditorForm?.addEventListener('submit',async e=>{
 e.preventDefault();
 const g=id=>document.getElementById(id);
 const contentType=g('teContentType').value||'generic';
 const current=tmData.find(x=>x.template_key===g('teKey').value);
 const oldProfile=tmProfile(current);
 const editorProfile={
   id:contentType,content_type:contentType,
   contentLabel:g('teContentLabel').value.trim()||(contentType==='news'?'Nội dung bài viết':contentType==='property'?'Mô tả chi tiết bất động sản':contentType==='service'?'Mô tả gói dịch vụ':contentType==='game'?'Nội dung / chiến thuật base':'Nội dung'),
   contentHelp:oldProfile.contentHelp||'Soạn nội dung đầy đủ bằng trình soạn thảo.',
   custom_fields:oldProfile.custom_fields||[]
 };
 if(contentType==='property')editorProfile.categoriesByTransaction={
   buy:tmLines(g('teBuyCategories').value),
   sale:tmLines(g('teSaleCategories').value),
   rent:tmLines(g('teRentCategories').value)
 };
 else editorProfile.categories=tmLines(g('teCategories').value);

 let structureProfile={};try{structureProfile=JSON.parse(g('teStructureProfile').value||'{}')}catch(err){alert('Khung giao diện JSON không hợp lệ.');return}
 structureProfile=tmNormalizeStructureDraft(structureProfile,contentType);
 const geometryLocked=!!current&&Number(tmStructureProfile(current)?.geometry_locked||0)===1;
 // Existing locked templates may carry legacy structure profiles that predate the
 // Universal Layout Contract. Editing commercial/SEO metadata must never be
 // blocked by those legacy warnings; preserve the sold geometry byte-for-byte.
 if(geometryLocked)structureProfile=tmStructureProfile(current);
 const structureCheck=tmValidateStructure(structureProfile);
 if(g('teActive').checked&&!structureCheck.ok&&!geometryLocked){alert('Chưa thể đưa template vào Kho giao diện:\n\n- '+structureCheck.errors.join('\n- '));return}
 if(!Array.isArray(structureProfile.sections))structureProfile.sections=[];
 const payload={
  template_key:g('teKey').value,name:g('teName').value,category:g('teCategory').value,preset:g('tePreset').value,
  price:Number(g('tePrice').value||0),renewal_price:Number(g('teRenewal').value||0),sort_order:Number(g('teSort').value||0),
  accent:g('teAccent').value,image_url:g('teImage').value,demo_url:g('teDemo').value,badge:g('teBadge').value,
  description:g('teDescription').value,features:g('teFeatures').value,seo_title:g('teSeoTitle').value,seo_slug:g('teSeoSlug').value,primary_keyword:g('tePrimaryKeyword').value,secondary_keywords:g('teSecondaryKeywords').value,meta_description:g('teMetaDescription').value,internal_anchor:g('teInternalAnchor').value,is_active:g('teActive').checked?1:0,
  editor_profile:editorProfile,
  structure_profile:structureProfile,
  sample_enabled:g('teSampleEnabled').checked?1:0,
  sample_count:Math.max(1,Math.min(30,Number(g('teSampleCount').value||12))),
  layout_profile:geometryLocked?tmLayoutProfile(current):{category_columns:Number(g('teCategoryColumns').value||4),category_rows:Number(g('teCategoryRows').value||2),sidebar_enabled:g('teSidebarEnabled').checked?1:0,sidebar_read_most:Number(g('teSidebarReadMost').value||6),sidebar_latest:Number(g('teSidebarLatest').value||5),sidebar_categories:Number(g('teSidebarCategories').value||8),home_latest_count:Number(g('teHomeLatestCount').value||10),related_count:Number(g('teRelatedCount').value||6)}
 };
 const save=document.getElementById('saveTemplateEditor');save.disabled=true;save.textContent='Đang lưu…';
 try{
  await mapi('template-save',{method:'POST',body:JSON.stringify(payload)});
  tmCloseEditor();await loadTemplateManager();
  tmMsg.textContent='✓ Đã lưu template. Kho giao diện công khai đã dùng dữ liệu mới.';
  tmMsg.classList.remove('hidden');
 }catch(err){alert(err.message||'Không lưu được template')}
 finally{save.disabled=false;save.textContent='Lưu template'}
});
document.addEventListener('newsreal:master-ready',loadTemplateManager);
setTimeout(()=>{if(!masterDashboard?.classList.contains('hidden'))loadTemplateManager()},1200);


function updatePartialPaymentUI(){
 if(!csPayment)return;
 const partial=csPayment.value==='partial';
 csPartialPaymentRow?.classList.toggle('hidden',!partial);
 const sale=Number(csSalePrice?.value||0);
 if(csPayment.value==='paid'&&csPaidAmount)csPaidAmount.value=sale;
 if(csPayment.value==='unpaid'&&csPaidAmount)csPaidAmount.value=0;
 const paid=partial?Number(csPaidAmount?.value||0):(csPayment.value==='paid'?sale:0);
 if(csRemainingAmount)csRemainingAmount.textContent=vnd(Math.max(0,sale-paid));
}
csPayment?.addEventListener('change',updatePartialPaymentUI);
csPaidAmount?.addEventListener('input',updatePartialPaymentUI);
csSalePrice?.addEventListener('input',updatePartialPaymentUI);

// V10.5 — Lead CRM
const leadList=document.getElementById('leadList');
const leadSearch=document.getElementById('leadSearch');
const leadStatusFilter=document.getElementById('leadStatusFilter');
const refreshLeads=document.getElementById('refreshLeads');
let __leadRows=[];let __leadPage=1,__leadPageSize=10;

function workflowCounts(){
 const leads=Array.isArray(__leadRows)?__leadRows:[],sites=Array.isArray(__masterSites)?__masterSites:[];
 return {
  pendingPayment:leads.filter(x=>x.status==='payment_pending'||(x.payment_order_code&&x.payment_status!=='paid'&&x.status!=='won'&&x.status!=='lost')).length,
  paidOrders:leads.filter(x=>x.status==='paid'&&x.status!=='won').length,
  domainSetup:sites.filter(x=>x.onboarding_status!=='activated'&&x.domain_status!=='active').length,
  activation:sites.filter(x=>x.onboarding_status!=='activated'&&x.domain_status==='active').length,
  renewalPaid:sites.filter(x=>String(x.renewal_stage||'none')==='paid').length,
  expiring:sites.filter(x=>x.onboarding_status==='activated'&&siteDaysLeft(x)>=0&&siteDaysLeft(x)<=30).length
 };
}
function updateWorkflowCenter(){
 const c=workflowCounts(),set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v)};
 set('wfPendingPayment',c.pendingPayment);set('wfPaidOrders',c.paidOrders);set('wfDomainSetup',c.domainSetup);set('wfActivation',c.activation);set('wfRenewalPaid',c.renewalPaid);set('wfExpiring',c.expiring);
 const u=document.getElementById('workflowUpdated');if(u)u.textContent='Cập nhật '+new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
 document.querySelectorAll('.workflow-step').forEach(btn=>{const id=btn.querySelector('b')?.id;const map={wfPendingPayment:c.pendingPayment,wfPaidOrders:c.paidOrders,wfDomainSetup:c.domainSetup,wfActivation:c.activation,wfRenewalPaid:c.renewalPaid,wfExpiring:c.expiring};btn.classList.toggle('has-work',Number(map[id]||0)>0)});
 renderRenewalOps();
}
function renderRenewalOps(){
 const box=document.getElementById('renewalOpsList');if(!box)return;
 const rows=(__masterSites||[]).filter(x=>{
  const st=String(x.renewal_stage||'none'),days=siteDaysLeft(x);
  return st==='paid'||st==='payment_pending'||(x.onboarding_status==='activated'&&days>=0&&days<=30);
 }).sort((a,b)=>{const rank=x=>String(x.renewal_stage||'none')==='paid'?0:String(x.renewal_stage||'none')==='payment_pending'?1:2;return rank(a)-rank(b)||siteDaysLeft(a)-siteDaysLeft(b)});
 const paid=rows.filter(x=>String(x.renewal_stage||'none')==='paid').length,pending=rows.filter(x=>String(x.renewal_stage||'none')==='payment_pending').length,exp=rows.filter(x=>!['paid','payment_pending'].includes(String(x.renewal_stage||'none'))).length;
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v)};set('renewalPaidCount',paid);set('renewalPendingCount',pending);set('renewalExpiringCount',exp);
 if(!rows.length){box.innerHTML='<div class="empty-state">Không có việc gia hạn cần xử lý.</div>';return}
 box.innerHTML=rows.map(x=>{const st=String(x.renewal_stage||'none'),days=siteDaysLeft(x),years=Math.max(1,Math.round(Number(x.renewal_selected_months||12)/12));const paidNow=st==='paid';return `<article class="renewal-ops-card ${paidNow?'is-paid':st==='payment_pending'?'is-pending':'is-expiring'}"><div class="renewal-ops-main"><div><small>#${x.id} · ${esc(x.domain||'')}</small><h3>${esc(cleanSiteName(x.name))}</h3><span>${esc(x.customer_name||x.customer_email||x.admin_email||'Khách hàng')}</span></div><div class="renewal-ops-state"><b>${paidNow?'✓ ĐÃ THANH TOÁN':st==='payment_pending'?'⏳ CHỜ VIETQR':`⚠ CÒN ${days} NGÀY`}</b><small>${paidNow?`${years} năm · ${esc(x.renewal_order_code||'')}`:st==='payment_pending'?esc(x.renewal_order_code||''):`Hết hạn ${esc(x.expires_at||'—')}`}</small></div></div><div class="renewal-ops-actions"><button class="smallbtn primary-mini" onclick="viewCustomer(${x.id})">${paidNow?'Gia hạn domain →':'Mở quản lý'}</button>${paidNow?'<span>1. Gia hạn domain trên Cloudflare → 2. Kiểm tra lại domain → 3. Hoàn tất</span>':st==='payment_pending'?'<span>Không thao tác thủ công. Chờ VietQR xác nhận.</span>':'<span>Khách sẽ nhận nhắc hạn theo lịch hiện tại.</span>'}</div></article>`}).join('');
}
function jumpWorkflow(btn){
 const target=document.getElementById(btn.dataset.jump||'');if(!target)return;
 if(btn.dataset.filter!==undefined){const f=document.getElementById('leadStatusFilter');if(f){f.value=btn.dataset.filter;__leadPage=1;renderLeadCRM()}}
 if(btn.dataset.siteFilter!==undefined){const f=document.getElementById('siteStatusFilter');if(f){f.value=btn.dataset.siteFilter;__sitePage=1;renderSiteRows()}}
 target.scrollIntoView({behavior:'smooth',block:'start'});
}


const leadStatusText=s=>({payment_pending:'Chờ thanh toán',paid:'Đã thanh toán',new:'Chưa xử lý',contacted:'Đã liên hệ',qualified:'Đã liên hệ',won:'Đã tạo website',lost:'Đã bỏ qua'}[s]||s);
const leadStatusClass=s=>'lead-status-'+(s||'new');
function leadMoney(v){return Number(v||0)>0?new Intl.NumberFormat('vi-VN').format(Number(v))+'đ':'Liên hệ'}
function leadDate(v){if(!v)return '—';try{return new Date(String(v).replace(' ','T')+'Z').toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}catch{return v}}
function leadUpdateStats(){
 const c=s=>__leadRows.filter(x=>x.status===s).length;
 const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};
 set('leadNew',c('new')+c('payment_pending'));
 set('leadContacted',c('contacted'));
 set('leadQualified',c('qualified'));
 set('leadWon',c('won'));
}
function leadFiltered(){
 const q=normText(leadSearch?.value||''),st=leadStatusFilter?.value||'';
 return __leadRows.filter(x=>{
  if(st&&x.status!==st)return false;
  if(!q)return true;
  return normText([x.customer_name,x.phone,x.email,x.site_name,x.requested_domain,x.template_name,x.note].join(' ')).includes(q);
 });
}
function renderLeadCRM(){
 if(!leadList)return;
 const rows=leadFiltered();
 const pages=Math.max(1,Math.ceil(rows.length/__leadPageSize));if(__leadPage>pages)__leadPage=pages;
 const pageRows=rows.slice((__leadPage-1)*__leadPageSize,__leadPage*__leadPageSize);
 const pinfo=document.getElementById('leadPageInfo');if(pinfo)pinfo.textContent=`Trang ${__leadPage}/${pages} · ${rows.length} yêu cầu`;

 leadList.innerHTML=pageRows.map(x=>`
  <article class="simple-lead-card ${x.status==='new'?'is-new':''}" data-id="${x.id}">
   <div class="simple-lead-main">
    <div class="simple-lead-title">
     <div><small>#${x.id} · ${leadDate(x.created_at)}</small><h3>${esc(x.customer_name||'Khách hàng')}</h3></div>
     <span class="lead-status ${leadStatusClass(x.status)}">${leadStatusText(x.status)}</span>
    </div>
    <div class="simple-lead-contact">
     <span>☎ ${esc(x.phone||'—')}</span>
     ${x.email?`<a href="mailto:${esc(x.email)}">✉ ${esc(x.email)}</a>`:''}
     ${x.facebook?`<a href="${esc(x.facebook)}" target="_blank" rel="noopener">Facebook ↗</a>`:''}
    </div>
    <div class="simple-lead-package">
     <b>${esc(x.template_name||'Chưa chọn mẫu')}</b>
     <span>Năm đầu: ${leadMoney(x.price)}</span>
     <span>Từ năm 2: ${leadMoney(x.renewal_price)}</span>
    </div>
    ${x.payment_order_code?`<div class="lead-payment ${x.payment_status==='paid'?'is-paid':'is-pending'}"><b>${x.payment_status==='paid'?'✓ ĐÃ THANH TOÁN':'⏳ CHỜ THANH TOÁN'}</b><span>${esc(x.payment_order_code)} · ${leadMoney(x.payment_status==='paid'?x.paid_amount:x.price)}${x.paid_at?' · '+leadDate(x.paid_at):''}</span></div>`:''}
    ${(x.site_name||x.requested_domain)?`<div class="simple-lead-site">${x.site_name?`Website: <b>${esc(x.site_name)}</b>`:''}${x.requested_domain?` · Domain: <b>${esc(x.requested_domain)}</b>`:''}</div>`:''}
    ${x.note?`<div class="simple-lead-note">${esc(x.note)}</div>`:''}
   </div>
   <div class="simple-lead-actions">
    ${x.status==='new'?`<button class="btn soft lead-action" data-status="contacted">Đã liên hệ</button>`:''}
    ${x.status==='paid'?`<button class="btn primary lead-convert">Tạo website →</button>`:x.status!=='won'&&x.payment_order_code?`<button class="btn primary" disabled title="Chỉ mở sau khi webhook xác nhận thanh toán">Chờ thanh toán</button>`:x.status!=='won'?`<button class="btn primary lead-convert">Tạo website →</button>`:''}
    ${x.status!=='lost'&&x.status!=='won'?`<button class="btn simple-skip lead-action" data-status="lost">Bỏ qua</button>`:''}
    <button class="btn simple-delete lead-delete" type="button">Xóa</button>
   </div>
  </article>`).join('')||'<div class="empty-state">Không có yêu cầu phù hợp.</div>';

 leadList.querySelectorAll('.lead-action').forEach(btn=>btn.onclick=async()=>{
   const card=btn.closest('[data-id]'),id=Number(card.dataset.id),status=btn.dataset.status;
   try{
    await mapi('lead-update',{method:'POST',body:JSON.stringify({id,status})});
    const row=__leadRows.find(x=>Number(x.id)===id);if(row)row.status=status;
    leadUpdateStats();renderLeadCRM();updateWorkflowCenter();
   }catch(e){alert(e.message)}
 });
 leadList.querySelectorAll('.lead-convert').forEach(btn=>btn.onclick=()=>prefillLeadToWebsite(Number(btn.closest('[data-id]').dataset.id)));
 leadList.querySelectorAll('.lead-delete').forEach(btn=>btn.onclick=async()=>{
   const id=Number(btn.closest('[data-id]').dataset.id);
   const row=__leadRows.find(x=>Number(x.id)===id);
   if(!confirm(`Xóa yêu cầu #${id} của ${row?.customer_name||'khách hàng'}?\n\nChỉ xóa yêu cầu trong Hộp yêu cầu, không xóa website đã tạo.`))return;
   try{await mapi('lead-delete',{method:'POST',body:JSON.stringify({id})});__leadRows=__leadRows.filter(x=>Number(x.id)!==id);leadUpdateStats();renderLeadCRM();updateWorkflowCenter()}catch(e){alert(e.message)}
 });
}
async function loadLeadCRM(opts={}){
 if(!leadList)return;
 const silent=!!opts.silent;
 try{
  const d=await mapi('leads');
  const next=d.leads||[];
  const prevIds=new Set(__leadRows.map(x=>Number(x.id)));
  const incoming=__leadRows.length?next.filter(x=>x.status==='new'&&!prevIds.has(Number(x.id))):[];
  __leadRows=next;leadUpdateStats();renderLeadCRM();updateWorkflowCenter();

  const live=document.getElementById('leadLiveStatus');
  if(live){
   live.classList.remove('offline');
   live.innerHTML='<i></i> Đã cập nhật '+new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
  }

  if(incoming.length){
   showLeadAlert(incoming);
  }else if(!silent){
   stopLeadTitleAlert();
  }
 }catch(e){
  const live=document.getElementById('leadLiveStatus');
  if(live){live.classList.add('offline');live.innerHTML='<i></i> Mất kết nối · thử lại sau';}
  if(!silent)leadList.innerHTML='<div class="empty-state">Không tải được khách hàng tiềm năng: '+esc(e.message)+'</div>';
 }
}
function prefillLeadToWebsite(id){
 const x=__leadRows.find(r=>Number(r.id)===Number(id));if(!x)return;
 window.__pendingLeadId=Number(x.id);
 createSiteForm.reset();
 csName.value=x.site_name||('Website '+(x.customer_name||'khách hàng'));
 csDomain.value=x.requested_domain||'';
 csCustomerName.value=x.customer_name||'';
 csCustomerPhone.value=x.phone||'';
 csAdminEmail.value=x.email||'';
 if(window.csPublicPhone)csPublicPhone.value=x.phone||'';
 if(window.csPublicZalo)csPublicZalo.value=x.phone||'';
 if(window.csPublicEmail)csPublicEmail.value=x.email||'';
 csNote.value=`Lead #${x.id}${x.note?' · '+x.note:''}`;
 csPlan.value='Gói website trọn gói';
 csSalePrice.value=Number(x.price||0);
 if(window.csListPrice)csListPrice.value=Number(x.renewal_price||x.price||0);
 if(window.csFirstDiscount)csFirstDiscount.value=Math.max(0,Number(x.renewal_price||0)-Number(x.price||0));
 if(window.csRenewalPrice)csRenewalPrice.value=Number(x.renewal_price||0);
 if(window.csPromotionName)csPromotionName.value='Ưu đãi kích hoạt lần đầu';
 if(window.csPayment)csPayment.value=x.payment_status==='paid'?'paid':'unpaid';
 if(window.csPaidAmount)csPaidAmount.value=x.payment_status==='paid'?Number(x.paid_amount||x.price||0):0;
 if(window.csPromoSummary)csPromoSummary.innerHTML=`Năm đầu <b>${leadMoney(x.price)}</b> → từ năm 2 <b>${leadMoney(x.renewal_price)}/12 tháng</b>.`;
 // Select exact template chosen by customer; scales to Mẫu 3,4,5,6...
 renderCreateThemePicker(x.template_key||'');
 if(csTemplateKey)csTemplateKey.value=x.template_key||'';
 if(window.csPublicFacebook)csPublicFacebook.value=x.facebook||'';
 updatePartialPaymentUI();
 createSiteModal.classList.remove('hidden');
 createSiteModal.scrollTop=0;
}


let __leadPollTimer=null;
let __leadTitleTimer=null;
let __leadOriginalTitle=document.title;
let __leadAlertActive=false;

function startLeadTitleAlert(count){
 __leadAlertActive=true;
 clearInterval(__leadTitleTimer);
 let on=false;
 __leadTitleTimer=setInterval(()=>{
  on=!on;
  document.title=on?`🔔 ${count} YÊU CẦU MỚI!`:`NEWSREAL CONTROL`;
 },900);
}
function stopLeadTitleAlert(){
 __leadAlertActive=false;
 clearInterval(__leadTitleTimer);
 __leadTitleTimer=null;
 document.title=__leadOriginalTitle||'NEWSREAL CONTROL';
}
function showLeadAlert(rows){
 const toast=document.getElementById('masterLeadToast');
 const title=document.getElementById('masterLeadToastTitle');
 const text=document.getElementById('masterLeadToastText');
 if(title)title.textContent=rows.length===1?'Có 1 yêu cầu mới':`Có ${rows.length} yêu cầu mới`;
 if(text){
  const x=rows[0];
  text.textContent=`${x.customer_name||'Khách hàng'} · ${x.phone||''} · ${x.template_name||'Chưa chọn mẫu'}`;
 }
 toast?.classList.remove('hidden');
 toast?.classList.add('show');
 startLeadTitleAlert(rows.length);
 // Blink the Leads panel itself so it is obvious even if the user is lower on the page.
 document.getElementById('leadCRM')?.classList.add('lead-attention');
 setTimeout(()=>document.getElementById('leadCRM')?.classList.remove('lead-attention'),5000);
}
function dismissLeadAlert(){
 document.getElementById('masterLeadToast')?.classList.add('hidden');
 document.getElementById('masterLeadToast')?.classList.remove('show');
 stopLeadTitleAlert();
}
document.getElementById('masterLeadToastClose')?.addEventListener('click',dismissLeadAlert);
document.getElementById('masterLeadToast')?.addEventListener('click',e=>{
 if(e.target.closest('#masterLeadToastClose'))return;
 const box=document.getElementById('leadCRM');
 if(box)box.scrollIntoView({behavior:'smooth',block:'start'});
 dismissLeadAlert();
});
window.addEventListener('focus',()=>{
 // Keep alert until user actually sees/focuses control center, then restore title.
 if(__leadAlertActive)setTimeout(stopLeadTitleAlert,1200);
});
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden&&__leadAlertActive)setTimeout(stopLeadTitleAlert,1200);
});
function startLeadAutoRefresh(){
 clearInterval(__leadPollTimer);
 // 15 seconds is fast enough for sales leads without hammering D1.
 __leadPollTimer=setInterval(()=>{
  if(!masterDashboard?.classList.contains('hidden'))loadLeadCRM({silent:true});
 },15000);
}
refreshLeads?.addEventListener('click',()=>runMasterRefresh(refreshLeads,()=>loadLeadCRM()));
leadSearch?.addEventListener('input',renderLeadCRM);
leadStatusFilter?.addEventListener('change',renderLeadCRM);
document.getElementById('leadPrevPage')?.addEventListener('click',()=>{if(__leadPage>1){__leadPage--;renderLeadCRM()}});
document.getElementById('leadNextPage')?.addEventListener('click',()=>{__leadPage++;renderLeadCRM()});
document.getElementById('leadPageSize')?.addEventListener('change',e=>{__leadPageSize=Number(e.target.value||10);__leadPage=1;renderLeadCRM()});
leadSearch?.addEventListener('input',()=>{__leadPage=1;});leadStatusFilter?.addEventListener('change',()=>{__leadPage=1;});
document.addEventListener('newsreal:master-ready',()=>{loadLeadCRM();
  loadTrials();startLeadAutoRefresh();});
setTimeout(()=>{if(!masterDashboard?.classList.contains('hidden'))loadLeadCRM()},1400);


let __renewalPollTimer=null;
let __renewalKnownIds=new Set();
async function pollRenewalWatch(){
 try{
  const d=await mapi('renewal-watch');
  const rows=d.renewals||[];
  const ids=new Set(rows.map(x=>Number(x.id)));
  const incoming=__renewalKnownIds.size?rows.filter(x=>!__renewalKnownIds.has(Number(x.id))):[];
  __renewalKnownIds=ids;
  if(incoming.length)showRenewalAlert(incoming);
  // Keep the existing banner synchronized without reloading whole Control Center.
  const box=document.getElementById('renewalMasterAlert'),title=document.getElementById('renewalMasterAlertTitle'),text=document.getElementById('renewalMasterAlertText'),btn=document.getElementById('renewalMasterAlertBtn');
  if(box){
   if(rows.length){
    box.classList.remove('hidden');const paidCount=rows.filter(x=>x.renewal_stage==='paid').length;
    title.textContent=paidCount?`🔔 ${paidCount} khách ĐÃ THANH TOÁN gia hạn`:`${rows.length} khách đang chờ thanh toán gia hạn`;
    text.textContent=rows.map(x=>`${x.renewal_stage==='paid'?'✓ ':''}${cleanSiteName(x.name)}`).join(' · ');
    if(btn)btn.onclick=()=>{const x=rows[0];if(x)viewCustomer(x.id)};
   }else box.classList.add('hidden');
  }
 }catch(e){console.warn('renewal watch',e)}
}
function showRenewalAlert(rows){
 const x=rows[0],toast=document.getElementById('masterLeadToast');
 const paidRows=rows.filter(x=>x.renewal_stage==='paid');document.getElementById('masterLeadToastTitle').textContent=paidRows.length?(paidRows.length===1?'🔔 Khách đã thanh toán gia hạn':`🔔 ${paidRows.length} khách đã thanh toán gia hạn`):(rows.length===1?'Có 1 yêu cầu gia hạn mới':`Có ${rows.length} yêu cầu gia hạn mới`);
 document.getElementById('masterLeadToastText').textContent=`${x.customer_name||cleanSiteName(x.name)} · ${x.domain||''}`;
 toast?.classList.remove('hidden');toast?.classList.add('show');
 startLeadTitleAlert(rows.length);
 let on=false;clearInterval(__leadTitleTimer);__leadTitleTimer=setInterval(()=>{on=!on;document.title=on?'🔔 YÊU CẦU GIA HẠN!':'NEWSREAL CONTROL'},900);
 const banner=document.getElementById('renewalMasterAlert');banner?.classList.add('renewal-attention');setTimeout(()=>banner?.classList.remove('renewal-attention'),6000);
}
function startRenewalAutoRefresh(){
 clearInterval(__renewalPollTimer);pollRenewalWatch();
 __renewalPollTimer=setInterval(()=>{if(!masterDashboard?.classList.contains('hidden'))pollRenewalWatch()},30000);
}
document.addEventListener('newsreal:master-ready',startRenewalAutoRefresh);



// V20.0.1 — workflow-first Master Control.
document.querySelectorAll('.workflow-step').forEach(btn=>btn.addEventListener('click',()=>jumpWorkflow(btn)));
document.getElementById('masterRefreshAll')?.addEventListener('click',async e=>{const b=e.currentTarget,old=b.textContent;b.disabled=true;b.textContent='Đang làm mới…';try{await Promise.all([loadMaster(),loadLeadCRM({silent:true}),loadTrials()]);updateWorkflowCenter()}finally{b.disabled=false;b.textContent=old}});
document.getElementById('refreshRenewalOps')?.addEventListener('click',async e=>{const b=e.currentTarget,old=b.textContent;b.disabled=true;b.textContent='Đang tải…';try{await loadMaster();updateWorkflowCenter()}finally{b.disabled=false;b.textContent=old}});

// V17.3 — Trial Website CRM inside Master Control.
let __trialRows=[];
function trialRemain(x){if(x.status==='pending_activation')return 'Chờ kích hoạt';const ms=Date.parse(String(x.expires_at||'').replace(' ','T')+'Z')-Date.now();if(ms<=0)return 'Đã hết hạn';const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);return `${h}h ${m}m`;}
function trialStatus(x){if(x.status==='pending_activation')return 'Chờ kích hoạt';if(x.status==='converted')return 'Đã mua';if(x.conversion_request_at||x.care_status==='interested')return 'Quan tâm';if(x.status==='active'&&Date.parse(String(x.expires_at).replace(' ','T')+'Z')>Date.now())return 'Đang dùng';return 'Hết hạn';}
function renderTrials(){
 const host=document.getElementById('trialList');if(!host)return;
 const q=(document.getElementById('trialSearch')?.value||'').toLowerCase(),f=document.getElementById('trialStatusFilter')?.value||'';
 let rows=__trialRows.filter(x=>!q||[x.customer_name,x.phone,x.email,x.template_name,x.template_key].join(' ').toLowerCase().includes(q));
 if(f)rows=rows.filter(x=>f==='interested'?(x.conversion_request_at||x.care_status==='interested'):f==='active'?(x.status==='active'&&Date.parse(String(x.expires_at).replace(' ','T')+'Z')>Date.now()):f==='expired'?(x.status==='expired'||(x.status!=='pending_activation'&&Date.parse(String(x.expires_at).replace(' ','T')+'Z')<=Date.now())):x.status===f);
 if(!rows.length){host.innerHTML='<div class="empty-state">Chưa có khách phù hợp bộ lọc.</div>';return}
 host.innerHTML=rows.map(x=>{const st=trialStatus(x);const initial=esc((x.customer_name||'K').trim().charAt(0).toUpperCase());return `<article class="trial-card">
  <div class="trial-card-main">
   <div class="trial-person"><div class="trial-avatar">${initial}</div><div class="trial-identity"><div class="trial-template"><span>#T${x.id}</span><span>•</span><span>${esc(x.template_name||x.template_key)}</span></div><h3>${esc(x.customer_name||'Khách dùng thử')}</h3><div class="trial-contact"><span>☎ ${esc(x.phone||'—')}</span><span>✉ ${esc(x.email||'—')}</span>${x.zalo?`<span>Zalo ${esc(x.zalo)}</span>`:''}${x.company?`<span>🏢 ${esc(x.company)}</span>`:''}</div></div></div>
   <div class="trial-pill" data-state="${esc(st)}">${esc(st)}</div>
  </div>
  ${x.note?`<div class="trial-note">${esc(x.note)}</div>`:''}
  <div class="trial-meta"><span><b>${trialRemain(x)}</b><small>Thời gian còn lại</small></span><span><b>${Number(x.real_post_count||0)}</b><small>Bài khách tự đăng</small></span><span><b>${Number(x.admin_login_count||0)}</b><small>Lần vào Trang quản trị</small></span><span><b>${Number(x.event_count||0)}</b><small>Hoạt động ghi nhận</small></span></div>
  <div class="trial-action-row"><div class="trial-primary-actions">${x.status==='pending_activation'?'<span class="trial-wait-activation">⏳ Chờ khách hoàn tất kích hoạt</span>':`<button class="trial-open-site" data-id="${x.id}">↗ Xem website</button><button class="trial-open-admin" data-id="${x.id}">⚙ Quản trị</button>`}</div><div class="trial-care-actions">${x.status==='pending_activation'?'':`<button class="trial-do" data-id="${x.id}" data-action="extend">+24 giờ</button>`}<button class="trial-care" data-id="${x.id}" data-care="contacted">Đã liên hệ</button><button class="trial-care" data-id="${x.id}" data-care="interested">Quan tâm</button><button class="trial-delete" data-id="${x.id}" data-name="${esc(x.customer_name||'Khách dùng thử')}">Xóa trial</button></div></div>
 </article>`}).join('');
 host.querySelectorAll('.trial-do').forEach(b=>b.onclick=async()=>{await mapi('trial-update',{method:'POST',body:JSON.stringify({id:+b.dataset.id,action:b.dataset.action,hours:24})});await loadTrials()});
 host.querySelectorAll('.trial-care').forEach(b=>b.onclick=async()=>{await mapi('trial-update',{method:'POST',body:JSON.stringify({id:+b.dataset.id,action:'care',care_status:b.dataset.care})});await loadTrials()});
 host.querySelectorAll('.trial-open-site').forEach(b=>b.onclick=async()=>{const w=window.open('about:blank','_blank');try{const d=await mapi('trial-access',{method:'POST',body:JSON.stringify({id:+b.dataset.id,target:'website'})});if(w)w.location=d.website_url;else location.href=d.website_url}catch(e){if(w)w.close();alert('Không mở được website Trial: '+e.message)}});
 host.querySelectorAll('.trial-open-admin').forEach(b=>b.onclick=async()=>{const w=window.open('about:blank','_blank');try{const d=await mapi('trial-access',{method:'POST',body:JSON.stringify({id:+b.dataset.id,target:'admin'})});if(w)w.location=d.admin_url;else location.href=d.admin_url}catch(e){if(w)w.close();alert('Không mở được Trang quản trị Trial: '+e.message)}});
 host.querySelectorAll('.trial-delete').forEach(b=>b.onclick=async()=>{
   const name=b.dataset.name||'trial này';
   if(!confirm(`Xóa vĩnh viễn ${name}?\n\nWebsite trial, bài viết, phiên đăng nhập và lead trial liên quan sẽ bị xóa. Thao tác này không thể hoàn tác.`))return;
   b.disabled=true;const old=b.textContent;b.textContent='Đang xóa…';
   try{await mapi('trial-update',{method:'POST',body:JSON.stringify({id:+b.dataset.id,action:'delete'})});await loadTrials()}catch(e){alert('Không xóa được trial: '+e.message);b.disabled=false;b.textContent=old}
 });
}
async function loadTrials(){const host=document.getElementById('trialList');if(!host)return;try{const d=await mapi('trials');__trialRows=d.trials||[];document.getElementById('trialStatTotal').textContent=d.stats?.total||0;document.getElementById('trialStatActive').textContent=d.stats?.active||0;document.getElementById('trialStatExpired').textContent=d.stats?.expired||0;document.getElementById('trialStatInterested').textContent=d.stats?.interested||0;document.getElementById('trialStatConverted').textContent=d.stats?.converted||0;renderTrials()}catch(e){host.innerHTML='<div class="empty-state">Không tải được Trial: '+esc(e.message)+'</div>'}}
const refreshTrials=document.getElementById('refreshTrials');refreshTrials?.addEventListener('click',()=>runMasterRefresh(refreshTrials,loadTrials));document.getElementById('trialSearch')?.addEventListener('input',renderTrials);document.getElementById('trialStatusFilter')?.addEventListener('change',renderTrials);
// The first automatic loadMaster() can finish before newsreal:master-ready listeners below are registered.
// Bootstrap Trial/Lead/Renewal modules once more after the whole script is parsed so Control Center never stays at ‘Đang tải…’.
setTimeout(()=>{if(!masterDashboard?.classList.contains('hidden')){loadTrials();loadLeadCRM({silent:true});startLeadAutoRefresh();startRenewalAutoRefresh();}},1700);

