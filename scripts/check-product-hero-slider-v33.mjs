import fs from 'node:fs';
const worker=fs.readFileSync('functions/[[path]].js','utf8');
const site=fs.readFileSync('public/assets/site.js','utf8');
const admin=fs.readFileSync('public/admin.html','utf8');
const adminJs=fs.readFileSync('public/assets/admin.js','utf8');
const css=fs.readFileSync('public/assets/style.css','utf8');
const checks=[
 ['demo hero is product slider',worker.includes('ec-hero-slide')&&worker.includes('heroProducts=products.slice(0,5)')],
 ['demo hero has previous next and dots',worker.includes('ecHeroPrev')&&worker.includes('ecHeroNext')&&worker.includes('data-hero-dot')],
 ['demo hero auto rotates',worker.includes('setInterval(()=>showHero(heroIndex+1),5000)')],
 ['demo hero links product detail and cart',worker.includes('data-hero-add')&&worker.includes('Xem chi tiết')],
 ['old marketing hero removed',!worker.includes('Một website bán được nhiều loại sản phẩm.')&&!worker.includes('<div class="ec-side"><div><small>FLASH SALE</small>')],
 ['customer storefront renders featured product slider',site.includes('function comRenderFeaturedHero')&&site.includes('filter(x=>Number(x.is_featured)')],
 ['customer slider has previous next and auto rotation',site.includes('com-featured-prev')&&site.includes('com-featured-next')&&site.includes('setInterval(()=>{i=(i+1)%list.length;draw()},5000)')],
 ['Admin exposes simple featured slider toggle',admin.includes('Đưa sản phẩm lên Slider nổi bật')&&admin.includes('name="is_featured"')],
 ['Admin persists featured flag',adminJs.includes("b.is_featured=!!f.querySelector('[name=is_featured]')?.checked")],
 ['responsive featured slider CSS exists',css.includes('.com-featured-shell')&&css.includes('.com-featured-dots')]
];
for(const [n,ok] of checks){if(!ok)throw new Error('FAIL '+n);console.log('OK '+n)}
console.log('Product Hero Slider Contract V33: PASS');
