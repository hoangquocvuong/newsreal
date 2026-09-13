const mod = await import('../functions/[[path]].js');
if (typeof mod.onRequest !== 'function') throw new Error('functions/[[path]].js does not export onRequest');
const routes = [
  ['/demo/blog-ca-nhan/mau-1/','blog-ca-nhan-1','Cover stories & bài được đọc nhiều'],
  ['/demo/blog-ca-nhan/mau-2/','blog-ca-nhan-2','Creator business'],
  ['/demo/doanh-nghiep/mau-1/','doanh-nghiep-1','Business newsroom'],
  ['/demo/doanh-nghiep/mau-2/','doanh-nghiep-2','Inside the plant'],
  ['/demo/dich-vu/tram-sac-vinfast/','dich-vu-5','EV knowledge hub'],
];
for (const [path, renderer, marker] of routes) {
  const request = new Request('https://hoangvuongtech.com'+path);
  const response = await mod.onRequest({request, env:{}, next:()=>new Response('NEXT')});
  const html = await response.text();
  if (response.status !== 200) throw new Error(`${path}: status ${response.status}`);
  if (response.headers.get('X-HVT-Demo-Build') !== '20.9.25.8') throw new Error(`${path}: wrong build header`);
  if (response.headers.get('X-HVT-Demo-Renderer') !== renderer) throw new Error(`${path}: wrong renderer`);
  if (!html.includes(marker)) throw new Error(`${path}: missing marker ${marker}`);
  if (html.includes('NEWS REAL') || html.includes('Bất động sản</a>')) throw new Error(`${path}: leaked legacy NEWSREAL/BDS shell`);
  console.log(`OK  runtime ${path} -> ${renderer}`);
}
const article = await mod.onRequest({request:new Request('https://hoangvuongtech.com/demo/doanh-nghiep/mau-2/bai-viet/oee-nha-may/'),env:{},next:()=>new Response('NEXT')});
const articleHtml=await article.text();
if(article.status!==200 || !articleHtml.includes('Checklist thực hành')) throw new Error('professional article runtime failed');
console.log('OK  runtime professional article route');
