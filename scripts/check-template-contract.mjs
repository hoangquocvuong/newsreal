import fs from 'node:fs';
const site=fs.readFileSync('public/assets/site.js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const css=fs.readFileSync('public/assets/style.css','utf8');
const index=fs.readFileSync('public/index.html','utf8');
const fn=fs.readFileSync('functions/[[path]].js','utf8');
const required=[
  ['site exact target','nrEnforceSlotHost'],
  ['site contract audit','NR_TEMPLATE_CONTRACT_REPORT'],
  ['site service binding','data-structure-key="internet"'],
  ['backend universal contract','universal-layout-v1'],
  ['backend exact slots',"slot_contract:'exact'"],
  ['VNPT split host','.vnpt-pack-list'],
  ['Camera Store exact section','data-structure-key=\"indoor\"'],
  ['Camera Store preset','service_camera_store_4'],
  ['Camera indoor 6-slot renderer',"secSlots('indoor',6)"],
  ['Camera outdoor 6-slot renderer',"secSlots('outdoor',6)"],
  ['Camera AI 6-slot renderer',"secSlots('ai',6)"],
  ['Camera pro 6-slot renderer',"secSlots('pro',6)"],
  ['Camera showroom preset dispatch',"'dich-vu-4':'service_camera_store_4'"],
  ['Camera renderer dispatch',"effectivePreset==='service_camera_store_4'"],
  ['Service demo template key contract',"/^dich-vu-\\d+$/.test(window.NR_DEMO_THEME)"],
  ['backend News M1 latest 3-column contract',"desktop_columns:3,desktop_rows:4"],
  ['backend News M3 mosaic computed contract',"layout_variant:'mosaic-featured-1-plus-4'"],
  ['News M3 mosaic CSS','grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr)!important'],
  ['site universal boot ready','nrTemplateBootReady'],
  ['site boot finally','requestAnimationFrame(()=>requestAnimationFrame(nrTemplateBootReady))'],
  ['index boot gate','nr-template-booting'],
  ['index neutral boot timeout','nr-template-boot-timeout'],
  ['function embedded index boot gate','class=\\"nr-template-booting\\"'],
  ['function embedded boot timeout','__NR_BOOT_TIMEOUT__'],
  ['sidebar follow contract CSS','Universal Sidebar Follow Contract V1'],
  ['sidebar home sticky CSS','.news-home-sidebar'],
  ['sidebar article sticky CSS','.news-article-sidebar'],
  ['homepage sidebar balance helper','nrSidebarBalancedTarget'],
  ['homepage sidebar reserve helper','nrNewsHomeLatestRenderCount'],
  ['backend sidebar balance contract','homepage_sidebar_balance'],
  ['backend sidebar-balanced slots',"slot_contract:'sidebar-balanced'"],
  ['Game Clash preset',"'game-1':'game_clash_1'"],
  ['Game Clash renderer','renderGameClash1'],
  ['Game Town Hall level chooser',"GAME_LEVELS={th:Array.from({length:17}"],
  ['Game structure profile',"'game-1':{version:12,layout_contract:'universal-layout-v1'"],
  ['Game level card renderer symbol','function nrGameLevelCards(group,prefix'],
  ['backend Game renderer boot contract',"boot_contract:'game-route-runtime-complete-v2'"],
  ['Game community archive route','/bases?'],
  ['Game fast filter binding','nrGameBindFastFilters'],
  ['Game mobile detail CSS','.coc-stats.big{display:flex!important'],
  ['Game real sample feed data','GAME_REAL_SAMPLE_POSTS'],
  ['Game menu home hash routing','nrGameHomeHash'],
  ['Game related base section','nrGameRelatedPosts'],
  ['Game full footer contract','nrGameFooter'],
  ['Game smart desktop nav','coc-desktop-nav'],
  ['Game mobile hamburger','data-coc-menu-toggle="1"'],
  ['Game smart progressive filter','data-coc-smart-filter="1"'],
  ['Game five-stage filter controls','data-coc-filter-step="${normalized}"'],
  ['Game recent filters','NR_COC_RECENT_FILTERS_V1'],
  ['backend Game progressive filter contract',"filter_contract:'smart-progressive-filter-v4'"],
  ['Game filter type runtime helper','function nrGameFilterTypes(group)'],
  ['Game About Terms server route',"path==='/about'||path==='/terms'"],
    ['Game Saved toast','nrGameToast'],
  ['Game Saved toast message','Base đã được lưu'],
  ['Game remembered hall','NR_COC_LAST_FILTER_V1'],
  ['Game mobile copy dock','coc-mobile-copy-dock'],
  ['Game result focus helper','nrGameScrollResults'],
  ['Game result anchor','data-coc-results=\"1\"'],
  ['Game BuyMeCoffee donate','https://buymeacoffee.com/cocbase'],
  ['Game local-first saved','NR_COC_SAVED_V1'],
  ['Game saved sheet','data-coc-saved-sheet="1"'],
  ['Game daily hero skin loader','nrGameLoadHeroSkinShowcase'],
  ['Game hero skin source','hoangquocvuong.github.io/coc-hero-skins/'],
  ['Game functional menu only','coc-saved-nav'],
  ['Game circular donate CSS','.coc-donate-float{'],
  ['backend Game community model',"sharing_model:'community_free'"],
  ['Marketplace SEO fields','primary_keyword'],
  ['Publisher base endpoint',"route==='publisher/base'"],
  ['Publisher idempotency index','publisher_imports'],
  ['Publisher secret auth','CONTENT_PUBLISHER_SECRET'],
  ['Production game slug route','p.url=`/base/${slug}.html`'],
  ['backend Game D1 batch stats',"stats_contract:'cloudflare-d1-batch-v1'"],
  ['backend template personalization',"settings_contract:'template-personalization-v1'"],
  ['Game stats batch hydration','nrGameHydrateStats'],
  ['Game stats detail view dedupe','nrGameTrackDetailView'],
  ['Game dynamic Donate setting','nrGameTemplateSettings'],
];
let failed=0;
for(const [name,needle] of required){
  const haystack=name.startsWith('index ')?index:name.startsWith('function embedded')||name.includes('About Terms server route')?fn:name.includes('Marketplace')?fn:name.includes('structure profile')?api:name.startsWith('Publisher')||name.startsWith('Production game')?api:name.includes('CSS')?css:name.startsWith('backend')?api:site;
  const ok=haystack.includes(needle)||(name.includes('VNPT')&&(api.includes(needle)||site.includes(needle)));
  console.log(`${ok?'OK':'FAIL'}  ${name}`);
  if(!ok)failed++;
}
for(const key of ['dich-vu-1','dich-vu-2','dich-vu-3','dich-vu-4','game-1']){
  const ok=api.includes(`'${key}'`);
  console.log(`${ok?'OK':'FAIL'}  profile ${key}`);
  if(!ok)failed++;
}
if(/designedRows\*cols/.test(site)){
  console.log('FAIL  legacy computed slot target still present');
  failed++;
}else console.log('OK  no computed slot target');
if(failed){
  console.error(`Template contract failed: ${failed}`);
  process.exit(1);
}


console.log('Template contract smoke: PASS');
