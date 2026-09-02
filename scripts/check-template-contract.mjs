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
  ['Game structure profile',"'game-1':{version:5,layout_contract:'universal-layout-v1'"],
  ['Game community archive route','/bases?'],
  ['Game fast filter binding','nrGameBindFastFilters'],
  ['Game mobile SEO description CSS','.coc-article-body{display:block!important'],
  ['Game real sample feed data','GAME_REAL_SAMPLE_POSTS'],
  ['Game menu home hash routing','nrGameHomeHash'],
  ['Game related base section','nrGameRelatedPosts'],
  ['Game full footer contract','nrGameFooter'],
  ['Game sharp hero source',"replace('/s600/','/s1600/')"],
  ['Game original popup shell','nrGamePopupShell'],
  ['Game original primary nav ID','id=\"mobile-nav\"'],
  ['backend Game popup menu contract',"menu_contract:'coc-popup-runtime-v1'"],
  ['backend Game visible background contract',"background_contract:'coc-original-visible-v1'"],
  ['Game original More sheet ID','id=\"mobile-more-sheet\"'],
  ['Game original Simple popup ID','id=\"simple-popup\"'],
  ['Game original Donate popup ID','id=\"cbp-support-popup\"'],
  ['Game close-then-open popup handoff','requestAnimationFrame(()=>requestAnimationFrame'],
  ['Game More 3x3 popup','coc-more-grid'],
  ['Game card four metrics','nrGameStatsBar'],
  ['Game bookmark interaction','data-coc-bookmark'],
  ['Game original background CSS','o0830046714856186164.jpg'],
  ['Game body direct background CSS','body.theme-game-clash{'],
  ['Game transparent root background CSS','.coc-site{background:transparent!important'],
  ['backend Game community model',"sharing_model:'community_free'"],
  ['Marketplace SEO fields','primary_keyword'],
  ['Publisher base endpoint',"route==='publisher/base'"],
  ['Publisher idempotency index','publisher_imports'],
  ['Publisher secret auth','CONTENT_PUBLISHER_SECRET'],
  ['Production game slug route','p.url=`/base/${slug}.html`'],
];
let failed=0;
for(const [name,needle] of required){
  const haystack=name.startsWith('index ')?index:name.startsWith('function embedded')?fn:name.includes('Marketplace')?fn:name.includes('structure profile')?api:name.startsWith('Publisher')||name.startsWith('Production game')?api:name.includes('CSS')?css:name.startsWith('backend')?api:site;
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
