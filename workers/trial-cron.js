export default {
 async scheduled(event,env,ctx){
  if(!env.NEWSREAL_API_BASE||!env.CRON_SECRET)return;
  ctx.waitUntil(fetch(String(env.NEWSREAL_API_BASE).replace(/\/$/,'')+'/api/system/trial-maintenance',{method:'POST',headers:{Authorization:'Bearer '+env.CRON_SECRET}}));
 }
};
