import fs from "node:fs";
const js=fs.readFileSync("public/assets/admin.js","utf8");
const html=fs.readFileSync("public/admin.html","utf8");
const checks=[
 [js.includes("label:'Thêm sản phẩm'"),"registry menu label"],
 [html.includes('data-tab="commerce-products"><span>＋</span>Thêm sản phẩm'),"fallback menu label"],
 [html.includes('<h1>Thêm & quản lý sản phẩm</h1>'),"commerce heading"],
 [html.includes('id="commerceProductSku"') && html.includes('readonly'),"auto SKU remains"],
 [html.includes('id="commerceProductCategory"'),"category selector remains"],
 [html.includes('<option value="Mới">Mới</option>') && html.includes('<option value="Bán chạy">Bán chạy</option>'),"product badges remain"]
];
for(const [ok,name] of checks){if(!ok){console.error("Commerce Admin UX V51 FAIL:",name);process.exit(1)}}
console.log("Commerce Admin UX V51: PASS");
