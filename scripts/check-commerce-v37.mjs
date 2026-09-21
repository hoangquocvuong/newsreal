import fs from 'node:fs';
const html=fs.readFileSync('public/admin.html','utf8');
const js=fs.readFileSync('public/assets/admin.js','utf8');
const checks=[
 ['form blocks native GET',/id="commerceProductForm" onsubmit="return false"/.test(html)],
 ['publish is button not submit',/commerce-publish-btn" type="button"/.test(html)],
 ['publish direct handler',/window\.commerceV37Publish\(event\)/.test(html)],
 ['v37 cache',/admin\.js\?v=20260921-v37/.test(html)],
 ['publish global exists',/window\.commerceV37Publish=async function/.test(js)],
 ['submit listener only blocks native',/addEventListener\('submit',e=>\{e\.preventDefault\(\);e\.stopImmediatePropagation\(\);return false\}\)/.test(js)],
 ['cover chooser text',/Đặt làm ảnh đại diện/.test(html)&&/⭐ Ảnh đại diện/.test(js)],
 ['cover persisted from chosen first image',/b\.image_url=commerceGalleryImages\[0\]/.test(js)],
 ['gallery persisted separately',/b\.gallery=commerceGalleryImages\.slice\(1\)/.test(js)]
];
let bad=0;for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++}if(bad)process.exit(1);console.log('Commerce V37 Submit + Cover: PASS');
