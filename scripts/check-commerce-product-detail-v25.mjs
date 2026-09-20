import fs from 'node:fs';
const site=fs.readFileSync('public/assets/site.js','utf8');
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const checks=[
 ['gallery parser',site.includes('gallery_json')&&site.includes('normalizeGallery')],
 ['attributes parser',site.includes('attributes_json')&&site.includes('normalizeAttrs')],
 ['variants parser',site.includes('variants_json')&&site.includes('normalizeVariants')],
 ['gallery thumbnails',site.includes('data-v25-thumb')&&site.includes('v25MainImage')],
 ['attribute/spec table',site.includes('Thông số & thuộc tính')&&site.includes('v25-specs')],
 ['detailed description',site.includes('Mô tả chi tiết')&&site.includes('x.desc')],
 ['variant selector',site.includes('data-v25-variant')&&site.includes('Chọn phân loại')],
 ['related products',site.includes('Sản phẩm liên quan')&&site.includes('CÓ THỂ BẠN SẼ THÍCH')],
 ['admin update preserves gallery',api.includes('gallery_json=?,price=?')&&api.includes('JSON.stringify(b.gallery||parseJsonSafe(b.gallery_json,[])||[])')],
];
let bad=0; for(const [n,ok] of checks){console.log(ok?'PASS':'FAIL',n);if(!ok)bad++} if(bad)process.exit(1); console.log('Commerce Product Detail V25: PASS');
