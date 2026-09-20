import fs from 'node:fs';
const s=fs.readFileSync('public/assets/admin.js','utf8');
const must=[
 "'dich-vu-1':{id:'service',label:'Gói dịch vụ FPT'",
 "categories:['Internet FPT','Truyền hình FPT','Camera FPT','Combo FPT']",
 "'dich-vu-2':{id:'service',label:'Gói dịch vụ VNPT'",
 "'dich-vu-3':{id:'service',label:'Gói dịch vụ Viettel'",
 'function applyAdaptiveEditorContract()',
 "kind==='service'?'Nhóm hiển thị / Danh mục '",
 "serviceKey)?'Đăng gói mới':'Đăng bài mới'"
];
for(const x of must){if(!s.includes(x)){console.error('FAIL',x);process.exit(1)} console.log('OK  ',x.slice(0,70))}
console.log('Adaptive Editor Contract V42: PASS');
