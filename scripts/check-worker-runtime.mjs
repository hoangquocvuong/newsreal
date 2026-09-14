const mod = await import('../functions/[[path]].js');
if (typeof mod.onRequest !== 'function') throw new Error('functions/[[path]].js does not export onRequest');
const routes = [
  ['/demo/blog-ca-nhan/mau-1/','blog-ca-nhan-1','Bài nổi bật & bài được đọc nhiều'],
  ['/demo/blog-ca-nhan/mau-2/','blog-ca-nhan-2','Kinh doanh nội dung'],
  ['/demo/doanh-nghiep/mau-1/','doanh-nghiep-1','Bản tin doanh nghiệp'],
  ['/demo/doanh-nghiep/mau-2/','doanh-nghiep-2','Hình ảnh hoạt động doanh nghiệp'],
  ['/demo/dich-vu/tram-sac-vinfast/','dich-vu-5','Thư viện kiến thức xe điện'],
  ['/demo/dich-vu/mua-lan-su-rong/','dich-vu-6','Gói 2 đầu lân'],
];
for (const [path, renderer, marker] of routes) {
  const request = new Request('https://hoangvuongtech.com'+path);
  const response = await mod.onRequest({request, env:{}, next:()=>new Response('NEXT')});
  const html = await response.text();
  if (response.status !== 200) throw new Error(`${path}: status ${response.status}`);
  if (response.headers.get('X-HVT-Demo-Build') !== '20.9.27.9') throw new Error(`${path}: wrong build header`);
  if (response.headers.get('X-HVT-Demo-Renderer') !== renderer) throw new Error(`${path}: wrong renderer`);
  if (!html.includes(marker)) throw new Error(`${path}: missing marker ${marker}`);
  if (!html.includes('/favicons/favicon-16x16.png')) throw new Error(`${path}: missing shared default favicon`);
  if (!html.includes('data-pro-admin-quick')) throw new Error(`${path}: missing quick publish action`);
  if (html.includes('sales-chat.js') || html.includes('Tư vấn online')) throw new Error(`${path}: HoangVuongTech sales chat leaked into client template`);
  if (html.includes('NEWS REAL') || html.includes('Bất động sản</a>')) throw new Error(`${path}: leaked legacy NEWSREAL/BDS shell`);
  console.log(`OK  runtime ${path} -> ${renderer}`);
}
const previewResponse=await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/blog-ca-nhan/mau-1/'),env:{},next:()=>new Response('NEXT')});
const previewHtml=await previewResponse.text();
for(const marker of ['▰ PC','Máy tính bảng','Điện thoại','hvtPreviewDevice']) if(!previewHtml.includes(marker)) throw new Error('device preview toolbar missing: '+marker);
console.log('OK  runtime PC/Tablet/Mobile preview toolbar');
for(const marker of ['/favicons/favicon-16x16.png','data-pro-admin-quick']) if(!previewHtml.includes(marker)) throw new Error('professional platform contract missing: '+marker);
console.log('OK  runtime professional shared favicon + quick-publish contract');

// V20.9.27.9: every professional demo must carry the shared mobile-safe contact contract.
for (const [path] of routes) {
  const response = await mod.onRequest({request:new Request('https://hoangvuongtech.com' + path),env:{},next:()=>new Response('NEXT')});
  const html = await response.text();
  if (!html.includes('id=\"proContactResponsive\"') || !html.includes('grid-template-columns:minmax(0,1fr)!important')) {
    throw new Error(`${path}: missing mobile-safe contact contract`);
  }
}
console.log('OK  runtime all professional demos mobile-safe contact contract');
const evResponse=await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/dich-vu/tram-sac-vinfast/'),env:{},next:()=>new Response('NEXT')});
const evHtml=await evResponse.text();
for(const marker of ['id="evMap"','tile.openstreetmap.org','HVT_EV_API_ENDPOINT','Dữ liệu mẫu']) if(!evHtml.includes(marker)) throw new Error('EV map/API contract missing: '+marker);
console.log('OK  runtime EV map + authorized API-ready fallback');
const article = await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/doanh-nghiep/mau-2/bai-viet/nang-luc-doanh-nghiep/'),env:{},next:()=>new Response('NEXT')});
const articleHtml=await article.text();
if(article.status!==200 || !articleHtml.includes('Checklist thực hành')) throw new Error('professional article runtime failed');
console.log('OK  runtime professional article route');


const simEmpty = await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/blog-ca-nhan/mau-1/?nr_client=1&nr_samples=0'),env:{},next:()=>new Response('NEXT')});
const simEmptyHtml = await simEmpty.text();
for(const marker of ['GIẢ LẬP KHÁCH HÀNG','Không bài mẫu','nr-pro-empty','href="/demo/blog-ca-nhan/mau-1/']) if(!simEmptyHtml.includes(marker)) throw new Error('professional empty simulation missing: '+marker);
if(!simEmptyHtml.includes('a[href*="/bai-viet/"]')) throw new Error('professional empty simulation does not preserve 1:1 article-card scaffold');
console.log('OK  runtime professional client simulation EMPTY keeps 1:1 layout scaffold');

if(!simEmptyHtml.includes('nr-configurable-hero')||!simEmptyHtml.includes('HERO · Có thể thay ảnh, tiêu đề và nút trong Trang quản trị')) throw new Error('professional configurable hero empty contract missing');
console.log('OK  runtime configurable Hero empty-state contract');

const simFull = await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/doanh-nghiep/mau-1/?nr_client=1&nr_samples=1'),env:{},next:()=>new Response('NEXT')});
const simFullHtml = await simFull.text();
for(const marker of ['GIẢ LẬP KHÁCH HÀNG','Có bài mẫu','nr-pro-client-sim']) if(!simFullHtml.includes(marker)) throw new Error('professional populated simulation missing: '+marker);
if(simFullHtml.includes('<body class="nr-pro-client-sim nr-pro-empty">')) throw new Error('professional populated simulation incorrectly empty');
console.log('OK  runtime professional client simulation WITH SAMPLES');

const lionResponse=await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/dich-vu/mua-lan-su-rong/'),env:{},next:()=>new Response('NEXT')});
const lionHtml=await lionResponse.text();
for(const marker of ['Gói 2 đầu lân','Gói 7 đầu lân','Múa rồng','Trống hội','Liên hệ báo giá','Giá tiền','▰ PC','Máy tính bảng','Điện thoại','/favicons/favicon-16x16.png','data-pro-admin-quick']) if(!lionHtml.includes(marker)) throw new Error('lion template contract missing: '+marker);
if(lionHtml.includes('sales-chat.js')||lionHtml.includes('Tư vấn online')) throw new Error('lion template leaked HVT sales chat');
const lionEmpty=await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/dich-vu/mua-lan-su-rong/?nr_client=1&nr_samples=0'),env:{},next:()=>new Response('NEXT')});
const lionEmptyHtml=await lionEmpty.text();
for(const marker of ['GIẢ LẬP KHÁCH HÀNG','Không bài mẫu','nr-pro-empty','.lion-pack .lion-pack-media img{visibility:hidden!important}','body.nr-pro-empty .lion-pack h3']) if(!lionEmptyHtml.includes(marker)) throw new Error('lion empty simulation missing: '+marker);
const lm=/href=\"([^\"]*\/bai-viet\/[^\"]+)\"/.exec(lionHtml);
if(!lm) throw new Error('lion article link missing');
const lionArticle=await mod.onRequest({request:new Request(new URL(lm[1],'https://hoangvuongtech.com')),env:{},next:()=>new Response('NEXT')});
const lionArticleHtml=await lionArticle.text();
for(const marker of ['lion-gallery','lion-thumbs','lionGalleryMain']) if(!lionArticleHtml.includes(marker)) throw new Error('lion article gallery missing: '+marker);
console.log('OK  runtime lion dance premium template + gallery + simulation contract');

console.log('OK lion empty-mode package cards are skeletonized 1:1');
