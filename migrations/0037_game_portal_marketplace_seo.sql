-- V20.8.0 — Game Portal + Marketplace SEO Contract
ALTER TABLE template_catalog ADD COLUMN seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE template_catalog ADD COLUMN seo_slug TEXT NOT NULL DEFAULT '';
ALTER TABLE template_catalog ADD COLUMN primary_keyword TEXT NOT NULL DEFAULT '';
ALTER TABLE template_catalog ADD COLUMN secondary_keywords TEXT NOT NULL DEFAULT '';
ALTER TABLE template_catalog ADD COLUMN meta_description TEXT NOT NULL DEFAULT '';
ALTER TABLE template_catalog ADD COLUMN internal_anchor TEXT NOT NULL DEFAULT '';

INSERT OR IGNORE INTO template_catalog(template_key,name,category,preset,price,renewal_price,is_active,sort_order,image_url,demo_url,badge,description,features,accent,sample_enabled,sample_count)
VALUES('game-1','Template website Clash of Clans · Base Portal','game','game_clash_1',1699000,2199000,1,1,'/assets/demo/game-clash-1-preview.svg','/demo/game/clash-of-clans/','CLASH OF CLANS','Mẫu website game chuyên đăng và bán base Clash of Clans với TH/BH/CH, Free/Premium, bộ lọc và trang chi tiết base.','Town Hall TH2–TH18
Builder Hall BH2–BH10
Clan Capital CH1–CH10
Free / Premium + Copy Link','orange',1,28);

UPDATE template_catalog SET
 seo_title='Template website Clash of Clans – Bán base TH/BH/CH',seo_slug='clash-of-clans-base',
 primary_keyword='template website Clash of Clans',secondary_keywords='mẫu website game, website bán base Clash of Clans, template game Clash of Clans',
 meta_description='Template website Clash of Clans chuyên đăng và bán base Town Hall, Builder Hall, Clan Capital, hỗ trợ Free/Premium, bộ lọc và trang chi tiết base.',
 internal_anchor='template website Clash of Clans'
WHERE template_key='game-1';

UPDATE template_catalog SET seo_title='Template website lắp mạng FPT – Internet, FPT Play, Camera',primary_keyword='template website FPT',secondary_keywords='website lắp mạng FPT, mẫu website internet FPT, website camera FPT',internal_anchor='template website lắp mạng FPT' WHERE template_key='dich-vu-1';
UPDATE template_catalog SET seo_title='Template website VNPT – Internet, MyTV, Camera',primary_keyword='template website VNPT',secondary_keywords='website internet VNPT, mẫu website MyTV, website camera VNPT',internal_anchor='template website VNPT' WHERE template_key='dich-vu-2';
UPDATE template_catalog SET seo_title='Template website Viettel – Internet, TV360, Camera',primary_keyword='template website Viettel',secondary_keywords='website internet Viettel, mẫu website TV360, website camera Viettel',internal_anchor='template website Viettel' WHERE template_key='dich-vu-3';
UPDATE template_catalog SET seo_title='Template website bán Camera – Cửa hàng & lắp đặt Camera',primary_keyword='template website camera',secondary_keywords='mẫu website bán camera, website cửa hàng camera, website lắp đặt camera',internal_anchor='template website bán camera' WHERE template_key='dich-vu-4';
UPDATE template_catalog SET seo_title='Template website tin tức – Tạp chí hiện đại',primary_keyword='template website tin tức',secondary_keywords='mẫu website báo điện tử, template tạp chí online, website tin tức',internal_anchor='template website tin tức' WHERE template_key='tin-tuc-1';
UPDATE template_catalog SET seo_title='Mẫu website báo điện tử – Tin tức nhiều chuyên mục',primary_keyword='mẫu website báo điện tử',secondary_keywords='template website tin tức, website báo online, giao diện báo điện tử',internal_anchor='mẫu website báo điện tử' WHERE template_key='tin-tuc-2';
UPDATE template_catalog SET seo_title='Template website tạp chí online – Magazine hiện đại',primary_keyword='template website tạp chí',secondary_keywords='mẫu website magazine, website lifestyle, template tin tức hình ảnh',internal_anchor='template website tạp chí online' WHERE template_key='tin-tuc-3';
UPDATE template_catalog SET seo_title='Template website tin tức SEO – Giao diện tối giản',primary_keyword='template website tin tức SEO',secondary_keywords='mẫu website tin tức nhẹ, template blog chuyên ngành, website tin tức tốc độ cao',internal_anchor='template website tin tức SEO' WHERE template_key='tin-tuc-4';
UPDATE template_catalog SET seo_title='Template website bất động sản – Tin tức & nhà đất',primary_keyword='template website bất động sản',secondary_keywords='mẫu website nhà đất, website môi giới bất động sản, website đăng tin nhà đất',internal_anchor='template website bất động sản' WHERE template_key='mau-1';
UPDATE template_catalog SET seo_title='Template website môi giới bất động sản hiện đại',primary_keyword='template website môi giới bất động sản',secondary_keywords='mẫu website bất động sản, website môi giới nhà đất, website nhà đất',internal_anchor='template website môi giới bất động sản' WHERE template_key='mau-2';
UPDATE template_catalog SET seo_title='Template website bất động sản cao cấp – Luxury',primary_keyword='template website bất động sản cao cấp',secondary_keywords='mẫu website biệt thự, website bất động sản luxury, website môi giới cao cấp',internal_anchor='template website bất động sản cao cấp' WHERE template_key='mau-3';
UPDATE template_catalog SET seo_title='Mẫu website đăng tin nhà đất – Minimal',primary_keyword='mẫu website đăng tin nhà đất',secondary_keywords='template website bất động sản, website nhà đất tối giản, website môi giới',internal_anchor='mẫu website đăng tin nhà đất' WHERE template_key='mau-4';
UPDATE template_catalog SET seo_title='Template website mua bán cho thuê bất động sản – Urban',primary_keyword='template website mua bán cho thuê bất động sản',secondary_keywords='website nhà đất, mẫu website bất động sản, website môi giới đô thị',internal_anchor='template website mua bán cho thuê bất động sản' WHERE template_key='mau-5';
