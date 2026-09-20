import fs from 'node:fs';
const s=fs.readFileSync('public/assets/site.js','utf8');
const must=[
  'nrNormalizeContentPosts(Array.isArray(window.NR_POSTS)?window.NR_POSTS:[])',
  'const serviceCardSpec=x=>',
  'const serviceDetailBenefits=x=>',
  "c.includes('camera')",
  "c.includes('combo')",
  "c.includes('truyền hình')",
  'meta.display_price',
  "esc(e.service_cta||'Đăng ký')",
  ':serviceDetailBenefits(x)'
];
for(const x of must) if(!s.includes(x)) throw new Error('Renderer sync missing: '+x);
if(!s.includes("const arr=i=>posts.filter(x=>x.category===cfg.cats[i])")) throw new Error('Category->homepage section mapping missing');
console.log('Renderer Sync V44: PASS');
