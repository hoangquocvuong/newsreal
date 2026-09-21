import fs from 'node:fs';
const js=fs.readFileSync('public/assets/admin.js','utf8');
const html=fs.readFileSync('public/admin.html','utf8');
const tests=[
 ['universal mode resolver',js.includes('function universalCategoryMode(')],
 ['supports profile-declared category modes',js.includes('profile.category_modes')],
 ['news always editorial',js.includes("if(type==='news')return 'editorial'" )],
 ['property remains property schema',js.includes("if(type==='property')return 'property'" )],
 ['product remains product schema',js.includes("if(type==='product')return 'product'" )],
 ['game remains game schema',js.includes("if(type==='game')return 'game'" )],
 ['service editorial detection',js.includes("if(type==='service'&&UNIVERSAL_EDITORIAL_CATEGORY_RE.test(name))return 'editorial'" )],
 ['service commercial default',js.includes("if(type==='service')return 'commercial'" )],
 ['editorial filters commerce fields',js.includes("if(mode==='editorial')return fields.filter")],
 ['telecom commercial schema preserved',js.includes("telecomCategoryFields(postCategory?.value||'')")],
 ['lion category schema preserved',js.includes('return lionCategoryFields(')],
 ['every category change rerenders schema',js.includes("postCategory.addEventListener('change',()=>{const current=collectProfileFields();renderProfileFields(current);applyUniversalCategoryContract()})")],
 ['content type applies adaptive contract',js.includes('applyUniversalCategoryContract();')],
 ['cache bumped',html.includes('/assets/admin.js?v=20260921-v51')],
 ['trial resolver untouched',!js.includes('V51_TRIAL_RESOLVER')]
];
let bad=0;for(const [name,ok] of tests){console.log((ok?'PASS ':'FAIL ')+name);if(!ok)bad++}if(bad)process.exit(1);console.log('Universal Adaptive Editor V51: PASS');
