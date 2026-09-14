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
  ['Game structure profile',"'game-1':{version:17,layout_contract:'universal-layout-v1'"],
  ['Game level card renderer symbol','function nrGameLevelCards(group,prefix'],
  ['backend Game renderer boot contract',"boot_contract:'game-runtime-symbol-complete-v3'"],
  ['Game community archive route','/bases?'],
  ['Game fast filter binding','nrGameBindFastFilters'],
  ['Game mobile detail CSS','.coc-stats.big{display:flex!important'],
  ['Game real sample feed data','GAME_REAL_SAMPLE_POSTS'],
  ['Game menu home hash routing','nrGameHomeHash'],
  ['Game related base section','nrGameRelatedPosts'],
  ['Game results pagination size','PAGE_SIZE=12'],
  ['Game pagination UI','coc-pagination'],
  ['Game mobile two-column results CSS','repeat(2,minmax(0,1fr))!important'],
  ['Game mobile related visible CSS','coc-related{display:block!important'],
  ['Game rich article sidebar helper','function nrGameDetailSidebar(post,copy)'],
  ['Game rich article sidebar content','coc-side-info'],
  ['Game desktop sidebar safe sticky CSS','top:92px!important'],
  ['backend Game article sidebar contract',"article_sidebar_contract:'game-unified-sticky-sidebar-v3'"],
  ['Unified sidebar CSS','position:sticky!important;'],
  ['Aligned desktop detail stats CSS','grid-template-columns:92px 108px 108px 86px!important;'],
  ['CoC sidebar copy CTA is rendered last','<section class=\"coc-side-info\">'],
  ['CoC one-line card title CSS','white-space:nowrap!important'],
  ['backend Game pagination contract',"pagination_contract:'game-results-pagination-v1'"],
  ['backend Game related contract',"related_contract:'same-group-level-visible-v2'"],
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
  ['Game filter remember symbol','function nrGameRememberFilter(state)'],
  ['Game result scroll symbol','function nrGameScrollResults(behavior='],
  ['Game daily hero rotation V2','NR_COC_HERO_SHOWCASE_V2_'],
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
  ['Product Affiliate preset',"'san-pham-1':'product_affiliate_1'"],
  ['Product Affiliate renderer','renderProductAffiliate1'],
  ['Product Affiliate detail route','/san-pham/'],
  ['Product Affiliate Admin data contract','product_affiliate_url'],
  ['Product Affiliate contextual filter engine','nrProductInitFilters(posts)'],
  ['Product Affiliate filter result anchor','paFilterResults'],
  ['Product Affiliate category scroll routing','data-pa-category'],
  ['Product Affiliate compact mobile accordion','pa-mobile-collapse'],
  ['Product Affiliate mobile sticky buy','pa-mobile-sticky-buy'],
  ['Product Affiliate mobile detail nav hidden CSS','.theme-product-affiliate.pa-product-detail .pa-nav{display:none!important}'],
  ['Product Affiliate mobile inline buy hidden CSS','.theme-product-affiliate.pa-product-detail .pa-buy{display:none!important}'],
  ['Product Affiliate Buy Now CTA','Mua Ngay'],
  ['Product Affiliate no private SanVoucher API','No SanVoucher API/catalogue dependency'],
  ['backend Product preview contract',"contentType==='product'"],
  ['Product showroom self-contained',"isPublicProductDemo=demoTemplateKey==='san-pham-1'"],
  ['Product showroom hard anti-cross-template fallback',"window.NR_DEMO_THEME==='san-pham-1'"],
  ['Marketplace Product category route',"isProductDemo?'/templates/ban-hang/'"],
  ['Marketplace Product real preview WebP','/assets/demo/san-pham-1-preview-real.webp'],
];
let failed=0;
for(const [name,needle] of required){
  const haystack=name.startsWith('index ')?index:name.startsWith('function embedded')||name.includes('About Terms server route')?fn:name.includes('Marketplace')?fn:name.includes('structure profile')?api:name.startsWith('Publisher')||name.startsWith('Production game')?api:name.includes('CSS')?css:name.startsWith('backend')?api:site;
  const ok=haystack.includes(needle)||(name.includes('VNPT')&&(api.includes(needle)||site.includes(needle)));
  console.log(`${ok?'OK':'FAIL'}  ${name}`);
  if(!ok)failed++;
}
for(const key of ['dich-vu-1','dich-vu-2','dich-vu-3','dich-vu-4','dich-vu-5','dich-vu-6','blog-ca-nhan-1','blog-ca-nhan-2','doanh-nghiep-1','doanh-nghiep-2','game-1','san-pham-1']){
  const ok=api.includes(`'${key}'`);
  console.log(`${ok?'OK':'FAIL'}  profile ${key}`);
  if(!ok)failed++;
}

// Regression: demoInject must declare new template flags before demoLabel reads them.
const demoFlagDecl=Math.min(...['const isBlogDemo=','const isCorpDemo=','const isEvDemo='].map(x=>fn.indexOf(x)).filter(x=>x>=0));
const demoLabelUse=fn.indexOf('const demoLabel=');
if(demoFlagDecl<0||demoLabelUse<0||demoFlagDecl>demoLabelUse){
  console.log('FAIL  marketplace demo runtime flag declaration order');
  failed++;
}else console.log('OK  marketplace demo runtime flag declaration order');
for(const route of ['/demo/blog-ca-nhan/mau-1','/demo/blog-ca-nhan/mau-2','/demo/doanh-nghiep/mau-1','/demo/doanh-nghiep/mau-2','/demo/dich-vu/tram-sac-vinfast','/demo/dich-vu/mua-lan-su-rong']){
  const ok=fn.includes(route);
  console.log(`${ok?'OK':'FAIL'}  demo route ${route}`);
  if(!ok)failed++;
}
for(const asset of ['blog-ca-nhan-1-preview.png','blog-ca-nhan-2-preview.png','doanh-nghiep-1-preview.png','doanh-nghiep-2-preview.png','dich-vu-5-preview.png','dich-vu-6-preview.png']){
  const ok=fs.existsSync('public/assets/demo/'+asset);
  console.log(`${ok?'OK':'FAIL'}  preview asset ${asset}`);
  if(!ok)failed++;
}


// V20.9.25.4 — hard pathname dispatch must run before all legacy tenant fallbacks.
const hardProFn=fn.indexOf('function proDemoKeyFromPath(path)');
const hardProCall=fn.indexOf('const hardProDemo=proDemoKeyFromPath(rawPath)');
const hardProReturn=fn.indexOf("'X-HVT-Demo-Build':'20.9.27.5'");
const legacyTenantPos=fn.indexOf("const demoReq=new Request('https://batdongsan2027.org.uk'");
if(hardProFn<0||hardProCall<0||hardProReturn<0||legacyTenantPos<0||hardProCall>legacyTenantPos){
  console.log('FAIL  hard professional demo pathname dispatch before BDS fallback');failed++;
}else console.log('OK  hard professional demo pathname dispatch before BDS fallback');
for(const pair of [
  ['/demo/blog-ca-nhan/mau-1','blog-ca-nhan-1'],
  ['/demo/blog-ca-nhan/mau-2','blog-ca-nhan-2'],
  ['/demo/doanh-nghiep/mau-1','doanh-nghiep-1'],
  ['/demo/doanh-nghiep/mau-2','doanh-nghiep-2'],
  ['/demo/dich-vu/tram-sac-vinfast','dich-vu-5'],
  ['/demo/dich-vu/mua-lan-su-rong','dich-vu-6']
]){
  const marker=`return '${pair[1]}'`;
  const ok=fn.includes(marker);
  console.log(`${ok?'OK':'FAIL'}  hard route renderer ${pair[0]} -> ${pair[1]}`);
  if(!ok)failed++;
}

// V20.9.25.9 — professional demo renderer contract.
for(const needle of [
  'const PRO_DEMO_KEYS=new Set',
  'const PRO_REAL_DEMO_DATA=',
  'function proDemoHtml(demo,rawPath)',
  "if(!html&&c.kind==='blog-minimal')html=blogMinimalHome",
  "if(!html&&c.kind==='creator')html=creatorHome",
  "if(!html&&c.kind==='corporate')html=corpHome",
  "if(!html&&c.kind==='industrial')html=industrialHome",
  "if(!html&&c.kind==='ev')html=evHome",
  'function proPlatformContract(html,demo)',
  'data-pro-admin-quick',
  '/favicons/favicon-16x16.png',
  'Tìm điểm sạc',
  'Bản tin doanh nghiệp',
  'Hình ảnh hoạt động doanh nghiệp',
  'Thư viện kiến thức xe điện',
  '/bai-viet/'
]){
  const ok=fn.includes(needle);
  console.log(`${ok?'OK':'FAIL'}  professional demo contract ${needle}`);
  if(!ok)failed++;
}
const proDispatch=fn.indexOf('const hardProDemo=proDemoKeyFromPath(rawPath)');
const sharedDemoTenant=fn.indexOf("const demoReq=new Request('https://batdongsan2027.org.uk'");
if(proDispatch<0||sharedDemoTenant<0||proDispatch>sharedDemoTenant){
  console.log('FAIL  professional demos bypass shared BDS shell');failed++;
}else console.log('OK  professional demos bypass shared BDS shell');
const evPrefixSpecial=fn.indexOf("if(demo==='dich-vu-5')return '/demo/dich-vu/tram-sac-vinfast'");
const genericServicePrefix=fn.indexOf(String.raw`if(/^dich-vu-\d+$/.test(demo))return '/demo/dich-vu/mau-'`);
if(evPrefixSpecial<0||genericServicePrefix<0||evPrefixSpecial>genericServicePrefix){
  console.log('FAIL  EV route prefix precedence');failed++;
}else console.log('OK  EV route prefix precedence');
for(const asset of ['blog1-hero.webp','blog2-hero.webp','corp1-hero.webp','corp2-hero.webp','ev-hero.webp','ev-1.webp']){
  const ok=fs.existsSync('public/assets/showcase/'+asset);
  console.log(`${ok?'OK':'FAIL'}  showcase asset ${asset}`);if(!ok)failed++;
}

if(site.includes('BÀI REVIEW MẪU')||site.includes('Khám phá bài viết sản phẩm chi tiết')){
  console.log('FAIL  Product Affiliate forced homepage review block still present');
  failed++;
}else console.log('OK  Product Affiliate no forced homepage review block');
if(/designedRows\*cols/.test(site)){
  console.log('FAIL  legacy computed slot target still present');
  failed++;
}else console.log('OK  no computed slot target');

// V20.9.25.7 — professional real-content demo regression checks
for(const needle of ['PRO_REAL_DEMO_DATA','Ảnh demo sử dụng ảnh chụp thực tế từ Unsplash','Thương hiệu cá nhân','Kinh doanh nội dung','Giới thiệu & năng lực','Dự án tiêu biểu','Kiến thức sạc']){
  const ok=fn.includes(needle); console.log(`${ok?'OK':'FAIL'}  rich demo content ${needle}`); if(!ok) failed++;
}

for(const needle of ['Bản tin doanh nghiệp','Hình ảnh hoạt động doanh nghiệp','Năng lực cốt lõi','Thư viện kiến thức xe điện','Kinh doanh nội dung','Bài nổi bật & bài được đọc nhiều','Nguồn tham khảo chuyên môn','IEA · Electric vehicle charging 2026']){
  const ok=fn.includes(needle); console.log(`${ok?'OK':'FAIL'}  pro real-world layout ${needle}`); if(!ok) failed++;
}
const richSections=[['blog-ca-nhan-1',7],['blog-ca-nhan-2',7],['doanh-nghiep-1',8],['doanh-nghiep-2',8],['dich-vu-5',8],['dich-vu-6',1]];
for(const [k,v] of richSections){
 const marker=`'${k}':{version:${v}`;
 const ok=api.includes(marker); console.log(`${ok?'OK':'FAIL'}  rich structure ${k}`); if(!ok) failed++;
}

for(const [label,needle] of [
  ['professional extra article corpus','PRO_EXTRA_DEMO_ARTICLES'],
  ['real-photo catalog refresh','const proRefresh=['],
  ['real-photo corporate cover','photo-1521737711867-e3b97375f902'],
  ['real-photo industrial cover','photo-1504917595217-d4dc5ebe6122'],
  ['real-photo EV cover','photo-1755555707544-5f2cea7413c1']
]){
  const ok=fn.includes(needle); console.log(`${ok?'OK':'FAIL'}  ${label}`); if(!ok) failed++;
}

// V20.9.26.1 — professional Admin/category/contact contract.
for(const needle of [
  'const professionalEditors=',
  "'blog-ca-nhan-1':{id:'news'",
  "'doanh-nghiep-1':{id:'news'",
  "'dich-vu-5':{id:'service'",
  "settings_schema:proSettings",
  "sec('contact','section','Liên hệ'",
  "sec('contact','section','Liên hệ doanh nghiệp'",
  "sec('contact','section','Đăng ký khảo sát'"
]){const ok=api.includes(needle);console.log(`${ok?'OK':'FAIL'}  professional admin/contact ${needle}`);if(!ok)failed++;}
for(const needle of ['sxAdminNewPostUrl(key)','sx-head-admin','＋ Đăng bài']){
  const ok=site.includes(needle); console.log(`${ok?'OK':'FAIL'}  professional customer quick-publish ${needle}`); if(!ok) failed++;
}
for(const needle of ['BUILTIN_PROFESSIONAL_PROFILES','professionalAdminKey()','isProfessionalContactTemplate()','sxpContactForm','sxp-category']){const ok=site.includes(needle)||fs.readFileSync('public/assets/admin.js','utf8').includes(needle);console.log(`${ok?'OK':'FAIL'}  professional client/admin ${needle}`);if(!ok)failed++;}

// V20.9.26.9 — device preview + EV map/API-ready regression.
for(const needle of ['hvtPreviewDevice','Máy tính bảng','Điện thoại','id="evMap"','tile.openstreetmap.org','HVT_EV_API_ENDPOINT','hvt-ev-api-endpoint']){const ok=fn.includes(needle);console.log(`${ok?'OK':'FAIL'}  preview/EV ${needle}`);if(!ok)failed++;}
for(const needle of ["const evSettings=","ev_station_api_url","station_data_contract:'authorized-api-or-demo-v1'","map_contract:'leaflet-osm-v1'"]){const ok=api.includes(needle);console.log(`${ok?'OK':'FAIL'}  EV admin/API ${needle}`);if(!ok)failed++;}


// V20.9.26.9 — new professional templates must share the legacy customer-preview contract.
for (const marker of ['function injectProClientSimulation(html,url)','GIẢ LẬP KHÁCH HÀNG','data-pro-samples=\"1\"','data-pro-samples=\"0\"','nr-pro-empty','injectProClientSimulation(proDemoHtml(hardProDemo,rawPath),u)']) {
  const ok=fn.includes(marker); console.log(`${ok?'OK':'FAIL'}  professional customer simulation ${marker}`); if(!ok)failed++;
}
for(const needle of ['service_lion_dance_6','function lionDemoHome','function lionDemoArticle','Gói 2 đầu lân','Gói 7 đầu lân','Liên hệ báo giá','Giá tiền']){const ok=fn.includes(needle)||site.includes(needle)||api.includes(needle);console.log(`${ok?'OK':'FAIL'}  lion premium contract ${needle}`);if(!ok)failed++;}
if(failed){
  console.error(`Template contract failed: ${failed}`);
  process.exit(1);
}


// V20.9.26.9 — Master Control must discover new template categories dynamically.
{
  const masterJs = fs.readFileSync('public/assets/master.js','utf8');
  const masterHtml = fs.readFileSync('public/control-center/index.html','utf8');
  for (const marker of ['TM_CATEGORY_LABELS','tmSyncCategoryOptions','blog-ca-nhan','doanh-nghiep']) {
    if (!masterJs.includes(marker)) throw new Error(`Master template category sync missing: ${marker}`);
  }
  for (const marker of ['value=\"blog-ca-nhan\"','value=\"doanh-nghiep\"','master.js?v=20.9.27.1']) {
    if (!masterHtml.includes(marker)) throw new Error(`Master template category HTML missing: ${marker}`);
  }
  console.log('OK  Master Control dynamic professional categories');
}


// V20.9.27.1 — login-safe tab regression: never observe the whole document for chat badges.
{
  const masterJs = fs.readFileSync('public/assets/master.js','utf8');
  if (masterJs.includes('observe(document.documentElement')) fail('Master Control must not attach a whole-document MutationObserver');
  for (const marker of ["document.addEventListener('newsreal:master-ready',initMasterTabs)",'if(__masterTabsInitialized||!masterDashboardIsReady())return','__masterSalesBadgeObserver.observe(src']) {
    if (!masterJs.includes(marker)) fail(`Master Control safe-tab guard missing: ${marker}`);
  }
  console.log('OK  Master Control login-safe tab initialization');
}

// V20.9.27.1 — Master Control compact tab layout contract.
{
  const masterJs = fs.readFileSync('public/assets/master.js','utf8');
  const masterHtml = fs.readFileSync('public/control-center/index.html','utf8');
  const masterCss = fs.readFileSync('public/assets/master.css','utf8');
  for (const marker of ['data-master-tab="overview"','data-master-tab="orders"','data-master-tab="templates"','data-master-tab="tools"']) {
    if (!masterHtml.includes(marker)) throw new Error(`Master tabs HTML missing: ${marker}`);
  }
  for (const marker of ['MASTER_TAB_MAP','setMasterTab','tabForMasterTarget','syncMasterSalesTabBadge']) {
    if (!masterJs.includes(marker)) throw new Error(`Master tabs JS missing: ${marker}`);
  }
  for (const marker of ['.master-tabbar','.master-tab-panel-hidden','body.master-tabs-ready']) {
    if (!masterCss.includes(marker)) throw new Error(`Master tabs CSS missing: ${marker}`);
  }
  console.log('OK  Master Control compact tab layout');
}


// V20.9.27.2 — initial-payment success confirmation must be explicit, verified and time-bounded.
{
  const apiPayment = fs.readFileSync('functions/api/[[path]].js','utf8');
  const marketing = fs.readFileSync('public/marketing.html','utf8');
  const trialCheckout = fs.readFileSync('public/trial-checkout/index.html','utf8');
  const successPage = fs.readFileSync('public/thanh-toan-thanh-cong/index.html','utf8');
  const returnMarker = '/thanh-toan-thanh-cong/?order_code=${encodeURIComponent(orderCode)}&token=${encodeURIComponent(token)}';
  if ((apiPayment.match(new RegExp(returnMarker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length < 2) throw new Error('Initial/trial payOS returnUrl is not routed to verified success page');
  for (const marker of ['Thanh toán thành công','30–60 phút','Link kích hoạt sẽ được gửi tới email đã đăng ký sau khi hoàn tất.','/api/payment-status?order_code=']) {
    if (!successPage.includes(marker)) throw new Error(`Payment success page missing: ${marker}`);
  }
  for (const [name,text] of [['marketing',marketing],['trial checkout',trialCheckout],['payment email',apiPayment]]) {
    if (!text.includes('30–60 phút')) throw new Error(`${name} missing 30–60 minute expectation`);
    if (!text.includes('Link kích hoạt sẽ được gửi tới email đã đăng ký sau khi hoàn tất.')) throw new Error(`${name} missing activation-link wording`);
  }
  console.log('OK  Verified payment success page + 30–60 minute expectation');
}

console.log('Template contract smoke: PASS');
