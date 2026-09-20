import fs from 'node:fs';
const s=fs.readFileSync(new URL('../public/assets/site.js',import.meta.url),'utf8');
const must=['class="shop18"','s18-hero-main','s18CategoryMenu','universal_commerce_5','renderCommerceStore(site)','id="comGrid"','id="comCart"'];
for(const x of must) if(!s.includes(x)) throw new Error('Missing '+x);
for(const x of ['class="market17"','m17-main-banner','Smartphone Pro 5G']) if(s.includes(x)) throw new Error('Legacy storefront remains: '+x);
console.log('Commerce Clean Slate V56: PASS');
