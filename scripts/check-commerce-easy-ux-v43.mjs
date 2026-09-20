import fs from 'node:fs';
const admin=fs.readFileSync('public/admin.html','utf8'),js=fs.readFileSync('public/assets/admin.js','utf8'),site=fs.readFileSync('public/assets/site.js','utf8'),api=fs.readFileSync('functions/api/[[path]].js','utf8'),worker=fs.readFileSync('functions/[[path]].js','utf8'),css=fs.readFileSync('public/assets/style.css','utf8');
const checks=[
 ['commerce disables article authoring by capability',api.includes("const content=declared.content===true||(declared.content!==false&&!commerceEnabled)")],
 ['Admin hides article create/manage when content disabled',js.includes("menuNew.classList.toggle('hidden',cap.content===false)")&&js.includes("menuPosts.classList.toggle('hidden',cap.content===false)")],
 ['sample library remains available',admin.includes('id="menuSamples"')&&api.includes('samples:true')],
 ['product badge is selectable',admin.includes('<select name="badge">')&&admin.includes('Bán chạy')&&admin.includes('Mới')],
 ['SKU auto-generates server side',api.includes("b.sku='SP-'+Date.now().toString().slice(-8)")],
 ['advanced product options collapsed',admin.includes('class="commerce-advanced"')],
 ['all sample products sync into catalog',api.includes("coalesce(is_sample,0)=1")&&!api.includes('if(Number(c?.n||0)>0)return')],
 ['product cards renderer exists',site.includes('function comProductCards(items=[])')],
 ['product pagination exists',site.includes('COM_PAGE_SIZE=12')&&site.includes('function comPagination(total)')],
 ['real product recommendation grid exists',site.includes('id="comRecommendations"')&&site.includes('Có thể bạn sẽ thích')],
 ['related products on detail exist',site.includes('<h2>Sản phẩm liên quan</h2>')],
 ['mobile slider hidden',css.includes('.com-hero{display:none!important}.com-featured-shell{display:none!important}')],
 ['mobile two-column catalog',css.includes('.com-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important')],
 ['mobile checkout is full screen and scrollable',css.includes('height:100dvh!important')&&css.includes('overflow-y:auto!important;-webkit-overflow-scrolling:touch')],
 ['product gallery centered',css.includes('.com-gallery{display:flex;flex-direction:column;align-items:center')],
 ['voucher block removed',!worker.includes('Voucher WELCOME10')],
 ['demo capability explainer removed',!worker.includes('Trải nghiệm mua hàng đầy đủ')],
 ['demo mobile hides hero and benefits',worker.includes('.ec-hero,.ec-benefits{display:none!important}')]
];
let bad=0;console.log('Commerce Easy UX V43');for(const [n,ok] of checks){console.log(ok?'OK ':'FAIL',n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce Easy UX V43: PASS');
