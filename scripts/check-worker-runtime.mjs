const mod = await import('../functions/[[path]].js');
if (typeof mod.onRequest !== 'function') throw new Error('functions/[[path]].js does not export onRequest');
const routes = [
  ['/demo/blog-ca-nhan/mau-1/','blog-ca-nhan-1','Bài nổi bật & bài được đọc nhiều'],
  ['/demo/blog-ca-nhan/mau-2/','blog-ca-nhan-2','Kinh doanh nội dung'],
  ['/demo/doanh-nghiep/mau-1/','doanh-nghiep-1','Bản tin doanh nghiệp'],
  ['/demo/doanh-nghiep/mau-2/','doanh-nghiep-2','Hình ảnh hoạt động doanh nghiệp'],
  ['/demo/dich-vu/tram-sac-vinfast/','dich-vu-5','Thư viện kiến thức xe điện'],
];
for (const [path, renderer, marker] of routes) {
  const request = new Request('https://hoangvuongtech.com'+path);
  const response = await mod.onRequest({request, env:{}, next:()=>new Response('NEXT')});
  const html = await response.text();
  if (response.status !== 200) throw new Error(`${path}: status ${response.status}`);
  if (response.headers.get('X-HVT-Demo-Build') !== '20.9.26.2') throw new Error(`${path}: wrong build header`);
  if (response.headers.get('X-HVT-Demo-Renderer') !== renderer) throw new Error(`${path}: wrong renderer`);
  if (!html.includes(marker)) throw new Error(`${path}: missing marker ${marker}`);
  if (html.includes('NEWS REAL') || html.includes('Bất động sản</a>')) throw new Error(`${path}: leaked legacy NEWSREAL/BDS shell`);
  console.log(`OK  runtime ${path} -> ${renderer}`);
}
const previewResponse=await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/blog-ca-nhan/mau-1/'),env:{},next:()=>new Response('NEXT')});
const previewHtml=await previewResponse.text();
for(const marker of ['▰ PC','Máy tính bảng','Điện thoại','hvtPreviewDevice']) if(!previewHtml.includes(marker)) throw new Error('device preview toolbar missing: '+marker);
console.log('OK  runtime PC/Tablet/Mobile preview toolbar');
const evResponse=await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/dich-vu/tram-sac-vinfast/'),env:{},next:()=>new Response('NEXT')});
const evHtml=await evResponse.text();
for(const marker of ['id="evMap"','tile.openstreetmap.org','HVT_EV_API_ENDPOINT','Dữ liệu mẫu']) if(!evHtml.includes(marker)) throw new Error('EV map/API contract missing: '+marker);
console.log('OK  runtime EV map + authorized API-ready fallback');
const article = await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/doanh-nghiep/mau-2/bai-viet/nang-luc-doanh-nghiep/'),env:{},next:()=>new Response('NEXT')});
const articleHtml=await article.text();
if(article.status!==200 || !articleHtml.includes('Checklist thực hành')) throw new Error('professional article runtime failed');
console.log('OK  runtime professional article route');
