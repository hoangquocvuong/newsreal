import fs from 'node:fs';
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const admin=fs.readFileSync('public/assets/admin.js','utf8');
const site=fs.readFileSync('public/assets/site.js','utf8');
function must(x,m){if(!x){console.error('FAIL',m);process.exit(1)}console.log('OK',m)}
must(api.includes("label:'Ảnh chính đầu trang'")&&api.includes('Đây là ảnh lớn nổi bật ở phần đầu Trang chủ'),'customer-friendly Hero image wording/help');
must(api.includes("title:'Kết nối mạnh. Trọn trải nghiệm số.'")&&api.includes("primary:'Xem gói cước'"),'FPT effective Hero text defaults are populated');
must(api.includes("type:'image-list'")&&api.includes("key:'hero_slides'"),'slider templates receive image-list schema');
must(api.includes("schema[i]={...schema[i],...def}"),'universal Hero definitions upgrade legacy schemas instead of being skipped');
must(admin.includes("data-template-image-list")&&admin.includes("data-slide-up")&&admin.includes("data-slide-down")&&admin.includes("data-slide-remove"),'Admin supports add/remove/reorder slider images');
must(api.includes("if(def.type==='image-list')")&&api.includes('clean[key]=arr'),'API validates and persists slider image arrays');
must(site.includes('customHeroSlides')&&site.includes('displayHeroImgs'),'slider renderer consumes customer Hero slide overrides');
must(site.includes("settings.hero_cta_primary||'Xem gói biểu diễn'")&&site.includes("settings.hero_cta_secondary||'Liên hệ báo giá'"),'Lion Hero text/CTA consumes customer settings');
console.log('Effective Hero + Slider Contract V19: PASS');
