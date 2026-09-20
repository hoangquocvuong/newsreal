import fs from 'node:fs';
const admin=fs.readFileSync('public/admin.html','utf8'), aj=fs.readFileSync('public/assets/admin.js','utf8'), site=fs.readFileSync('public/assets/site.js','utf8'), api=fs.readFileSync('functions/api/[[path]].js','utf8'), css=fs.readFileSync('public/assets/style.css','utf8'), fn=fs.readFileSync('functions/[[path]].js','utf8');
const checks=[
 ['commerce content disabled by capability, not template id',api.includes("type!=='commerce'")&&api.includes('admin-capabilities-v3')],
 ['admin hides article menus when content disabled',aj.includes("['menuNewPost','menuPosts','menuSamples']")&&aj.includes("cap.content!==false")],
 ['commerce product form uses selectable badges',admin.includes('<select name="badge">')&&admin.includes('Bán chạy')&&admin.includes('Giảm giá')],
 ['SKU can auto generate',aj.includes("b.sku='SP-'")],
 ['product cards renderer exists',site.includes('function comProductCards(items=[])')],
 ['product pagination exists',site.includes('COM_PAGE_SIZE=12')&&site.includes('comRenderPager')],
 ['related products remain on detail',site.includes('Sản phẩm liên quan')],
 ['mobile hero hidden and two-column product flow',css.includes('.com-hero{display:none!important}')&&css.includes('repeat(2,minmax(0,1fr))')],
 ['mobile checkout uses one scrollable sheet',css.includes('height:100dvh')&&css.includes('overflow-y:auto!important')],
 ['voucher demo removed',!fn.includes('Voucher WELCOME10')],
];
let bad=0;console.log('Commerce Easy UX V43');for(const [n,ok] of checks){console.log(ok?'OK ':'FAIL ',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce Easy UX V43: PASS');
