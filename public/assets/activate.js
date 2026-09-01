const token=new URLSearchParams(location.search).get('token')||'';
let retryTimer=null;
async function activationApi(method,data,path='activation'){
 const suffix=method==='GET'?('?token='+encodeURIComponent(token)):'';
 const r=await fetch('/api/'+path+suffix,{method,headers:{'Content-Type':'application/json'},body:method==='POST'?JSON.stringify(data):undefined});
 const t=await r.text();let d={};try{d=JSON.parse(t)}catch{}
 if(!r.ok){const e=new Error(d.error||t);e.data=d;e.status=r.status;throw e}
 return d
}
function showOnly(id){['activationLoading','activationReady','activationProvisioning','activationWorking','activationError'].forEach(x=>document.getElementById(x)?.classList.toggle('hidden',x!==id))}
async function loadActivation(){
 try{
  if(!token)throw new Error('Liên kết kích hoạt thiếu mã xác thực.');
  const d=await activationApi('GET');
  const isTrial=!!d.trial?.is_trial;
  activationTitle.textContent=isTrial?'Kích hoạt website dùng thử':('Nhận website '+(d.site.name||''));
  activationSite.innerHTML=`<div><span>Website</span><b>${isTrial?(d.trial.template_name||d.site.name||'Website dùng thử'):(d.site.name||'')}</b></div><div><span>${isTrial?'Thời gian':'Domain'}</span><b>${isTrial?'24 giờ sau khi kích hoạt':(d.site.domain||'')}</b></div>`;
  if(window.activationEmail)activationEmail.value=d.customer?.email||'';
  const intro=document.querySelector('#activationReady>p');if(intro)intro.textContent=isTrial?'Xác nhận email đăng nhập và tự tạo mật khẩu. Thời gian dùng thử 24 giờ chỉ bắt đầu sau bước này.':'Xác nhận email đăng nhập và tự tạo mật khẩu quản trị để hoàn tất bàn giao.';
  showOnly('activationReady');
  if(retryTimer){clearTimeout(retryTimer);retryTimer=null}
 }catch(err){
  if(err.data?.code==='DOMAIN_NOT_READY'){
    const status=err.data.pages_status||'pending';
    const detail=err.data.detail?` (${err.data.detail})`:'';
    activationProvisioningText.textContent=`${err.data.domain||'Domain'} đang ở trạng thái ${status}. Cloudflare đang hoàn tất DNS/SSL${detail}.`;
    showOnly('activationProvisioning');
    if(retryTimer)clearTimeout(retryTimer);
    retryTimer=setTimeout(loadActivation,8000);
    return;
  }
  activationErrorText.textContent=err.message;showOnly('activationError')
 }
}
retryActivation.onclick=loadActivation;
loadActivation();

activateNow.onclick=async()=>{
 const em=(activationEmail.value||'').trim().toLowerCase(),p1=activationPassword.value||'',p2=activationPassword2.value||'';
 activationMsg.classList.add('hidden');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){activationMsg.textContent='Vui lòng nhập email đăng nhập hợp lệ.';activationMsg.classList.remove('hidden');activationEmail.focus();return}
 if(p1.length<8){activationMsg.textContent='Mật khẩu phải có ít nhất 8 ký tự.';activationMsg.classList.remove('hidden');activationPassword.focus();return}
 if(p1!==p2){activationMsg.textContent='Hai mật khẩu chưa khớp.';activationMsg.classList.remove('hidden');activationPassword2.focus();return}
 activateNow.disabled=true;
 showOnly('activationWorking');
 try{
  const d=await activationApi('POST',{token,email:em,password:p1});
  location.href=d.admin_url;
 }catch(err){
  activateNow.disabled=false;
  if(err.data?.code==='DOMAIN_NOT_READY'){showOnly('activationProvisioning');loadActivation();return}
  activationErrorText.textContent=err.message;showOnly('activationError')
 }
};