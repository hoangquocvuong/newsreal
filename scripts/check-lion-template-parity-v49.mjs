import fs from 'node:fs';
const src=fs.readFileSync('functions/api/[[path]].js','utf8');
const must=[
  "if(key==='dich-vu-6')return {family:'lion',persistedType:'service',sampleMode:'editable'}",
  "'dich-vu-6':{id:'service'",
  "const currentVersion=8;",
  'sample_pack_version=8',
  "resolvedKey==='dich-vu-6'?lionExtra(a):{}",
  "sample_key:`${resolvedKey}:showroom-${String(a.slug||i+1)}`"
];
for(const x of must) if(!src.includes(x)) throw new Error('Missing lion parity contract: '+x);
const cats=['Gói múa lân','Múa rồng','Trống hội','Sự kiện đã thực hiện','Tin hoạt động','Kiến thức & phong tục'];
for(const c of cats) if(!src.includes(c)) throw new Error('Missing lion category: '+c);
console.log('Lion Demo Trial Live Parity V49: PASS');
