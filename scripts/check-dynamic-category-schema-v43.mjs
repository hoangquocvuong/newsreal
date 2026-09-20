import fs from 'node:fs';
const s=fs.readFileSync('public/assets/admin.js','utf8');
const must=[
 'function telecomCategoryFields',"c.includes('camera')","c.includes('combo')","c.includes('truyền hình')","function isTelecomAdminTemplate",'const current=collectProfileFields();renderProfileFields(current)',"{key:'camera_resolution'","{key:'service_channels'","{key:'service_speed_down'"
];
for(const x of must) if(!s.includes(x)) throw new Error('Missing dynamic schema contract: '+x);
console.log('Dynamic Category Schema V43: PASS');
