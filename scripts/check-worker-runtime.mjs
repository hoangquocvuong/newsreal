const mod = await import('../functions/[[path]].js');
if (typeof mod.onRequest !== 'function') throw new Error('functions/[[path]].js does not export onRequest');
const routes = [
  ['/demo/blog-ca-nhan/mau-1/','blog-ca-nhan-1','Bài nổi bật'],
  ['/demo/blog-ca-nhan/mau-2/','blog-ca-nhan-2','Kinh doanh nội dung'],
  ['/demo/doanh-nghiep/mau-1/','doanh-nghiep-1','doanh nghiệp'],
  ['/demo/doanh-nghiep/mau-2/','doanh-nghiep-2','năng lực'],
  ['/demo/dich-vu/tram-sac-vinfast/','dich-vu-5','xe điện'],
  ['/demo/dich-vu/mua-lan-su-rong/','dich-vu-6','Gói 2 đầu lân'],
];
for (const [path, renderer, sampleMarker] of routes) {
  const request = new Request('https://hoangvuongtech.com'+path);
  const response = await mod.onRequest({request, env:{}, next:()=>new Response('NEXT')});
  const html = await response.text();
  if (response.status !== 200) throw new Error(`${path}: status ${response.status}`);
  if (response.headers.get('X-HVT-Demo-Build') !== '20.9.27.17') throw new Error(`${path}: wrong build header`);
  if (response.headers.get('X-HVT-Demo-Renderer') !== renderer) throw new Error(`${path}: wrong renderer`);
  for(const marker of ['NR_LOCAL_SHOWROOM_PACKAGE','nr-one-renderer-showroom','/assets/site.js','/favicons/favicon-16x16.png']) if(!html.includes(marker)) throw new Error(`${path}: missing unified marker ${marker}`);
  if (!html.includes('\"posts\":[') && !html.includes('\"posts\": [')) throw new Error(`${path}: showroom package has no posts payload`);
  if (html.includes('sales-chat.js') || html.includes('Tư vấn online')) throw new Error(`${path}: HoangVuongTech sales chat leaked into client template`);
  console.log(`OK runtime one-renderer ${path} -> ${renderer}`);
}
const previewResponse=await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/blog-ca-nhan/mau-1/?nr_client=1&nr_samples=1'),env:{},next:()=>new Response('NEXT')});
const previewHtml=await previewResponse.text();
for(const marker of ['GIẢ LẬP KHÁCH HÀNG','Có bài mẫu','NR_LOCAL_SHOWROOM_PACKAGE']) if(!previewHtml.includes(marker)) throw new Error('client simulation shell missing: '+marker);
console.log('OK runtime professional simulation uses same renderer shell');
const simEmpty = await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/dich-vu/mua-lan-su-rong/?nr_client=1&nr_samples=0'),env:{},next:()=>new Response('NEXT')});
const simEmptyHtml = await simEmpty.text();
for(const marker of ['GIẢ LẬP KHÁCH HÀNG','Không bài mẫu','nr-pro-empty','NR_LOCAL_SHOWROOM_PACKAGE']) if(!simEmptyHtml.includes(marker)) throw new Error('professional empty simulation missing: '+marker);
console.log('OK runtime EMPTY is same package + same renderer + empty data mode');
const article = await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/dich-vu/mua-lan-su-rong/bai-viet/goi-2-dau-lan/?id=960000'),env:{},next:()=>new Response('NEXT')});
const articleHtml=await article.text();
for(const marker of ['NR_LOCAL_SHOWROOM_PACKAGE','Gói 2 đầu lân','/assets/site.js']) if(!articleHtml.includes(marker)) throw new Error('professional article shell failed: '+marker);
console.log('OK runtime professional article uses same renderer package');
