import fs from 'node:fs';
const api=fs.readFileSync('functions/api/[[path]].js','utf8');
const start=api.indexOf("if(route==='service-info'&&request.method==='GET')");
const end=api.indexOf("if(route==='service-leads')",start);
if(start<0||end<0) throw new Error('service-info route not found');
const block=api.slice(start,end);
const checks=[
 ['service-info reads template_catalog.price',/SELECT template_key,name,price FROM template_catalog WHERE template_key=\?/],
 ['service-info uses global sale for first payment display',/globalSaleState\(env,\{price:listPrice\}\)/],
 ['renewal display uses Master base price',/renewal_price:listPrice/],
 ['first payment uses current sale result',/first_price:firstPrice/],
 ['legacy 1999000 removed from customer service-info',b=>!b.includes('1999000')],
 ['legacy promotion renewal cannot override customer renewal',b=>!b.includes('renewal_price:Number(sp?.renewal_price')],
];
for(const [name,test] of checks){const ok=typeof test==='function'?test(block):test.test(block);if(!ok)throw new Error('FAIL '+name);console.log('OK',name)}
console.log('Customer Pricing Single Source V14: PASS');
