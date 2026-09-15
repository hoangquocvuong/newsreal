import fs from 'node:fs';
const fn=fs.readFileSync('functions/[[path]].js','utf8');
const admin=fs.readFileSync('public/assets/admin.js','utf8');
function must(v,m){if(!v)throw new Error(m);console.log('OK '+m)}
const block=fn.slice(fn.indexOf('function laptopStoreHome'),fn.indexOf('function laptopLeadContact'));
must((block.match(/status:'Còn hàng'/g)||[]).length>=30,'laptop showroom contains at least 30 available product cards');
for(const x of ['ASUS Vivobook 14','Dell Inspiron 15 3530','Lenovo LOQ 15','ASUS Zenbook 14 OLED','ASUS ProArt P16','MacBook Pro 14']) must(block.includes(x),'showroom includes '+x);
for(const x of ['Laptop văn phòng','Laptop gaming','Laptop mỏng nhẹ','Laptop đồ họa','MacBook']) must(block.includes(x),'showroom category '+x);
must(block.includes('lp-brands')&&block.includes('lp-promo')&&block.includes('lp-card-actions'),'professional brand/promo/product commerce sections');
must(block.includes('30 laptop mẫu')&&block.includes('9 thương hiệu'),'showroom density is explicit');
must(block.includes('laptopLeadContact(c)'),'customer lead inbox remains connected');
must(admin.includes('ASUS Vivobook 14 Core i5 16GB 512GB'),'Admin laptop editor no longer contains EV-era placeholder');
must(!admin.includes('Khảo sát lắp sạc tại nhà cần kiểm tra những gì?'),'obsolete EV admin copy removed');
console.log('Laptop Showroom Contract V24: PASS');
