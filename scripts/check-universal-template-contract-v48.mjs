import fs from 'node:fs';
const src=fs.readFileSync('functions/api/[[path]].js','utf8');
for(const x of ['function templateContentContract(',"family:'property',persistedType:'property'","family:'blog',persistedType:'news'","family:'corporate',persistedType:'news'","family:'commerce'","family:'lion',persistedType:'service'","family:'game',persistedType:'game'","'dich-vu-5','dich-vu-6','blog-ca-nhan-1'","const professionalType=String(contract.persistedType"]){if(!src.includes(x))throw new Error('Missing universal contract: '+x)}
if(!src.includes('site_sample_tombstones'))throw new Error('Tombstone protection missing');
if(!src.includes('ORDER BY coalesce(is_sample,0) ASC,id DESC'))throw new Error('Customer-first ordering missing');
console.log('Universal Template Contract V48: PASS');
