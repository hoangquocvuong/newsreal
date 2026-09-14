-- V20.5.1 — Service provider trio: FPT / VNPT / Viettel.
-- Runtime ensureTemplateCatalog backfills editor + structure profiles. Showroom samples are virtual and never copied to trial/client tenants.
INSERT OR IGNORE INTO template_catalog(template_key,name,category,preset,price,renewal_price,is_active,sort_order,image_url,demo_url,badge,description,features,accent)
VALUES
('dich-vu-2','Dịch vụ Mẫu 2 · VNPT','dich-vu','service_vnpt_2',1499000,1999000,1,2,'/assets/demo/dich-vu-2-preview.svg','/demo/dich-vu/mau-2/','VNPT','Mẫu website dịch vụ VNPT với Home Internet, MyTV, Home Cam và combo gia đình.','Home Internet\nMyTV\nHome Cam\nCombo gia đình','blue'),
('dich-vu-3','Dịch vụ Mẫu 3 · Viettel','dich-vu','service_viettel_3',1499000,1999000,1,3,'/assets/demo/dich-vu-3-preview.svg','/demo/dich-vu/mau-3/','VIETTEL','Mẫu website Viettel Telecom với Internet Wi-Fi 6, TV360, Camera và combo trọn gói.','Internet Viettel\nTV360\nCamera Cloud\nCombo trọn gói','red');
UPDATE template_catalog SET name='Dịch vụ Mẫu 1 · FPT Telecom',badge='FPT',description='Mẫu website đại lý FPT Telecom với gói Internet, FPT Play, Camera AI và combo dịch vụ.',features='Internet FPT\nFPT Play\nCamera AI\nCombo & CTA tư vấn',updated_at=CURRENT_TIMESTAMP WHERE template_key='dich-vu-1';
