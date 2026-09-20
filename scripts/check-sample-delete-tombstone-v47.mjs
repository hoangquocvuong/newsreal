import fs from 'node:fs';
const src=fs.readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const route=src.indexOf("if(route==='posts')");
if(route<0) throw new Error('posts route missing');
const body=src.indexOf('const b=await body(request);',route);
const del=src.indexOf("if(request.method==='DELETE')",route);
if(del<0||body<0||del>body) throw new Error('DELETE must execute before POST/PUT body validation');
const segment=src.slice(del,body);
for(const token of ['site_sample_tombstones','sample_key','DELETE FROM posts','sample_tombstoned']){
  if(!segment.includes(token)) throw new Error('DELETE contract missing: '+token);
}
const seed=src.indexOf('async function seedDemoForSite');
const tomb=src.indexOf('site_sample_tombstones',seed);
const insert=src.indexOf('INSERT INTO posts',seed);
if(seed<0||tomb<0||insert<0||tomb>insert) throw new Error('seed must check tombstone before recreating sample');
console.log('Sample Delete Tombstone V47: PASS');
