import fs from 'node:fs';
const s=fs.readFileSync('public/assets/admin.js','utf8');
const checks=[
 ['shared category registry',s.includes('UNIVERSAL_CATEGORY_MODE_REGISTRY')],
 ['telecom explicit commercial',s.includes("'Internet FPT':'commercial'")&&s.includes("'Camera VNPT':'commercial'")&&s.includes("'Camera Viettel':'commercial'")],
 ['commerce editorial explicit',s.includes("'Cẩm nang mua sắm':'editorial'")&&s.includes("'Tin cửa hàng':'editorial'")],
 ['lion package commercial',s.includes("'Gói múa lân':'commercial'")&&s.includes("'Múa rồng':'commercial'")&&s.includes("'Trống hội':'commercial'")],
 ['lion event mode',s.includes("'Sự kiện đã thực hiện':'event'")],
 ['lion news editorial',s.includes("'Tin hoạt động':'editorial'")&&s.includes("'Kiến thức & phong tục':'editorial'")],
 ['profile category_modes override',s.includes('declaredModes=profile.category_modes')],
 ['case insensitive category matching',s.includes("toLowerCase()===name.toLowerCase()")],
 ['lion editorial has no service fields',s.includes("if(isLionAdminTemplate())return mode==='editorial'?[]:lionCategoryFields")],
 ['editorial commerce field filter retained',s.includes("if(mode==='editorial')return fields.filter")],
 ['category change rerenders fields',s.includes("postCategory.addEventListener('change',()=>{const current=collectProfileFields();renderProfileFields(current);applyUniversalCategoryContract()})")],
 ['trial resolver not introduced',!s.includes('trial-daf00c268cd244fb')]
];
let bad=0; for(const [n,ok] of checks){console.log((ok?'PASS ':'FAIL ')+n);if(!ok)bad++;}
if(bad)process.exit(1); console.log('Universal Schema Contract V52: PASS');
