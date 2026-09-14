import fs from 'node:fs';
const css=fs.readFileSync('public/assets/style.css','utf8');
const site=fs.readFileSync('public/assets/site.js','utf8');
function ok(v,m){if(!v){console.error('FAIL',m);process.exit(1)}console.log('OK',m)}
ok(css.includes('.ld-site .ld-hero{min-height:670px;display:grid;place-items:center}'),'live Lion Hero uses showroom height/alignment');
ok(css.includes('padding:90px 20px;box-sizing:border-box'),'live Lion Hero uses showroom content breathing room');
ok(css.includes('font-size:clamp(46px,6vw,82px)'),'live Lion headline geometry matches showroom');
ok(css.includes('max-width:680px;font-size:19px;line-height:1.75'),'live Lion lead geometry matches showroom');
ok(css.includes('margin-top:42px;max-width:860px'),'live Lion stats spacing matches showroom');
ok(site.includes("heroImages=['https://images.unsplash.com/photo-1675605849420-8637ece6a0a1"),'live Lion keeps fixed demo Hero images');
console.log('Lion Hero visual geometry parity V5: PASS');
