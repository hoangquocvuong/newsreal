-- V20.7.1 Camera Store template + real service previews
INSERT OR IGNORE INTO template_catalog(template_key,name,category,preset,price,renewal_price,is_active,sort_order,image_url,demo_url,badge,description,features,accent)
VALUES('dich-vu-4','Camera Store','dich-vu','service_camera_store_4',1499000,1999000,1,4,'/assets/demo/dich-vu-4-preview.png','/demo/dich-vu/mau-4/','CAMERA','Website trưng bày camera đa thương hiệu với sản phẩm, thông số, giá, khuyến mãi và tư vấn.','Camera trong nhà
Camera ngoài trời
Camera AI quay quét
Camera IP / bộ giám sát','green');
UPDATE template_catalog SET name='FPT',image_url='/assets/demo/dich-vu-1-preview.png',accent='orange',updated_at=CURRENT_TIMESTAMP WHERE template_key='dich-vu-1';
UPDATE template_catalog SET name='VNPT',image_url='/assets/demo/dich-vu-2-preview.png',updated_at=CURRENT_TIMESTAMP WHERE template_key='dich-vu-2';
UPDATE template_catalog SET name='Viettel',image_url='/assets/demo/dich-vu-3-preview.png',updated_at=CURRENT_TIMESTAMP WHERE template_key='dich-vu-3';
