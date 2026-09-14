export const PROFESSIONAL_TEMPLATE_KEYS=['blog-ca-nhan-1','blog-ca-nhan-2','doanh-nghiep-1','doanh-nghiep-2','dich-vu-5','dich-vu-6'];

const commonCardSelectors='article,.rcard,.news-card,.post-card,.card,.knowledge-card';
const registry={
 'blog-ca-nhan-1':{
   version:8,preset:'personal_blog_1',content_type:'news',demo_key:'blog-ca-nhan-1',
   hero:{selector:'.mag-hero',mode:'single-image',fields:['hero_title','hero_note','hero_image_url','hero_primary_label','hero_primary_url','hero_secondary_label','hero_secondary_url'],image_fields:['hero_image_url']},
   simulation:{content_selectors:commonCardSelectors},
   sections:[['hero','section','Giới thiệu tác giả',0],['popular','latest','Đang được đọc nhiều',6],['cat-1','category','Thương hiệu cá nhân',6],['cat-2','category','Freelance',6],['cat-3','category','Năng suất',6],['cat-4','category','Sách & công cụ',6],['cat-5','category','Lối sống sáng tạo',6],['cat-6','category','Góc nhìn',6],['contact','section','Liên hệ',0]],
   editor:{id:'news',label:'Bài viết blog cá nhân',content_type:'news',categories:['Thương hiệu cá nhân','Freelance','Năng suất','Sách & công cụ','Lối sống sáng tạo','Góc nhìn'],contentLabel:'Nội dung bài viết',contentHelp:'Viết bài đầy đủ, chọn đúng chuyên mục; bài sẽ tự xuất hiện ở khối tương ứng trên trang chủ.',custom_fields:[{key:'author_name',label:'Tên tác giả',type:'text',placeholder:'Tên hiển thị'},{key:'reading_time',label:'Thời gian đọc',type:'text',placeholder:'Ví dụ: 6 phút'}]}
 },
 'blog-ca-nhan-2':{
   version:8,preset:'personal_blog_2',content_type:'news',demo_key:'blog-ca-nhan-2',
   hero:{selector:'.cr-hero',mode:'single-image',fields:['hero_title','hero_note','hero_image_url','hero_primary_label','hero_primary_url','hero_secondary_label','hero_secondary_url'],image_fields:['hero_image_url']},
   simulation:{content_selectors:commonCardSelectors},
   sections:[['hero','section','Giới thiệu người sáng tạo',0],['stories','latest','Bài nổi bật & câu chuyện dự án',8],['cat-1','category','Kinh doanh nội dung',6],['cat-2','category','Video & sản xuất',6],['cat-3','category','Chiến lược nội dung',6],['cat-4','category','Câu chuyện dự án',6],['cat-5','category','Công cụ',6],['cat-6','category','Kiếm tiền nội dung',6],['contact','section','Liên hệ hợp tác',0]],
   editor:{id:'news',label:'Bài viết người sáng tạo',content_type:'news',categories:['Kinh doanh nội dung','Video & sản xuất','Chiến lược nội dung','Câu chuyện dự án','Công cụ','Kiếm tiền nội dung'],contentLabel:'Nội dung bài viết',contentHelp:'Chọn đúng chuyên mục để nội dung được phân phối chính xác trên trang chủ.',custom_fields:[{key:'author_name',label:'Tên tác giả',type:'text'},{key:'reading_time',label:'Thời gian đọc',type:'text'}]}
 },
 'doanh-nghiep-1':{
   version:9,preset:'corporate_modern_1',content_type:'news',demo_key:'doanh-nghiep-1',
   hero:{selector:'.enterprise-hero',mode:'single-image',fields:['hero_title','hero_note','hero_image_url','hero_primary_label','hero_primary_url','hero_secondary_label','hero_secondary_url'],image_fields:['hero_image_url']},
   simulation:{content_selectors:commonCardSelectors},
   sections:[['hero','section','Giới thiệu doanh nghiệp',0],['services','services','Giải pháp',0],['case','section','Dự án tiêu biểu',0],['cat-1','category','Giới thiệu & năng lực',6],['cat-2','category','Sản phẩm & dịch vụ',6],['cat-3','category','Dự án & đối tác',6],['cat-4','category','Tin tức & sự kiện',6],['cat-5','category','Tuyển dụng',6],['cat-6','category','Hoạt động & văn hóa',6],['contact','section','Liên hệ doanh nghiệp',0]],
   editor:{id:'news',label:'Bài viết doanh nghiệp',content_type:'news',categories:['Giới thiệu & năng lực','Sản phẩm & dịch vụ','Dự án & đối tác','Tin tức & sự kiện','Tuyển dụng','Hoạt động & văn hóa'],contentLabel:'Nội dung bài viết / dự án',contentHelp:'Dùng chuyên mục để đưa bài vào đúng khu vực trên trang chủ doanh nghiệp.',custom_fields:[{key:'company_author',label:'Bộ phận / tác giả',type:'text',placeholder:'Phòng Marketing'},{key:'project_client',label:'Khách hàng / dự án',type:'text',placeholder:'Tùy chọn'}]}
 },
 'doanh-nghiep-2':{
   version:9,preset:'corporate_industry_2',content_type:'news',demo_key:'doanh-nghiep-2',
   hero:{selector:'.ind-hero',mode:'single-image',fields:['hero_title','hero_note','hero_image_url','hero_primary_label','hero_primary_url','hero_secondary_label','hero_secondary_url'],image_fields:['hero_image_url']},
   simulation:{content_selectors:commonCardSelectors},
   sections:[['hero','section','Hồ sơ năng lực',0],['capabilities','services','Năng lực kỹ thuật',0],['projects','section','Dự án',0],['cat-1','category','Giới thiệu & năng lực',6],['cat-2','category','Sản phẩm & dịch vụ',6],['cat-3','category','Dự án tiêu biểu',6],['cat-4','category','Tin tức & sự kiện',6],['cat-5','category','Nhân sự & tuyển dụng',6],['cat-6','category','Trách nhiệm xã hội',6],['contact','section','Nhận báo giá',0]],
   editor:{id:'news',label:'Bài viết kỹ thuật & dự án',content_type:'news',categories:['Giới thiệu & năng lực','Sản phẩm & dịch vụ','Dự án tiêu biểu','Tin tức & sự kiện','Nhân sự & tuyển dụng','Trách nhiệm xã hội'],contentLabel:'Nội dung kỹ thuật / dự án',contentHelp:'Chọn chuyên mục chính xác để bài hiển thị đúng khối năng lực, dự án hoặc chuyên san.',custom_fields:[{key:'project_location',label:'Địa điểm dự án',type:'text'},{key:'project_scope',label:'Phạm vi công việc',type:'text'}]}
 },
 'dich-vu-5':{
   version:9,preset:'service_ev_charge_5',content_type:'service',demo_key:'dich-vu-5',
   hero:{selector:'.ev-hero',mode:'single-image',fields:['hero_title','hero_note','hero_image_url','hero_primary_label','hero_primary_url','hero_secondary_label','hero_secondary_url'],image_fields:['hero_image_url']},
   simulation:{content_selectors:commonCardSelectors+',.ev-links>a'},
   sections:[['hero','section','Điểm sạc xe điện',0],['stations','section','Điểm sạc gần bạn',0],['services','services','Giải pháp sạc',0],['cat-1','category','Kiến thức sạc',6],['cat-2','category','Lắp đặt tại nhà',6],['cat-3','category','Điểm sạc công cộng',6],['cat-4','category','Kỹ thuật điện',6],['cat-5','category','Bảo trì',6],['cat-6','category','Vận hành đội xe',6],['contact','section','Đăng ký khảo sát',0]],
   editor:{id:'service',label:'Điểm sạc & kiến thức xe điện',content_type:'service',categories:['Kiến thức sạc','Lắp đặt tại nhà','Điểm sạc công cộng','Kỹ thuật điện','Bảo trì','Vận hành đội xe'],contentLabel:'Nội dung dịch vụ / bài kiến thức',contentHelp:'Chọn đúng chuyên mục để bài được hiển thị vào Thư viện kiến thức và các khối tương ứng.',custom_fields:[{key:'service_price',label:'Giá / chi phí tham khảo',type:'text',placeholder:'Ví dụ: Liên hệ khảo sát'},{key:'service_area',label:'Khu vực phục vụ',type:'text',placeholder:'Hải Phòng / Hà Nội / Toàn quốc'},{key:'service_cta',label:'Nhãn nút liên hệ',type:'text',placeholder:'Đăng ký khảo sát'}]}
 },
 'dich-vu-6':{
   version:3,preset:'service_lion_dance_6',content_type:'service',demo_key:'dich-vu-6',
   hero:{selector:'.lion-hero',mode:'slider',fields:['hero_badge','hero_title','hero_note','hero_image_url','hero_image_url_2','hero_image_url_3','hero_primary_label','hero_primary_url','hero_secondary_label','hero_secondary_url','experience_years','event_count','member_count','hero_stat_4_value','hero_stat_4_label'],image_fields:['hero_image_url','hero_image_url_2','hero_image_url_3'],slides:3},
   simulation:{content_selectors:commonCardSelectors+',.lion-pack,.lion-feature,.lion-event-main,.lion-event-side>a'},
   sections:[['hero','section','Lân Sư Rồng',0],['packages','category','Gói múa lân',6],['cat-2','category','Múa rồng',3],['cat-3','category','Trống hội',3],['trust','section','Kinh nghiệm & danh hiệu',0],['cat-4','category','Sự kiện đã thực hiện',6],['cat-5','category','Tin hoạt động',6],['cat-6','category','Kiến thức & phong tục',6],['contact','section','Liên hệ báo giá',0]],
   editor:{id:'service',label:'Dịch vụ Lân Sư Rồng',content_type:'service',categories:['Gói múa lân','Múa rồng','Trống hội','Sự kiện đã thực hiện','Tin hoạt động','Kiến thức & phong tục'],contentLabel:'Nội dung gói dịch vụ / bài viết',contentHelp:'Tải nhiều ảnh để tạo album/slideshow. Với gói dịch vụ, nhập rõ quy mô đội hình, nhân sự, đạo cụ, hiệu ứng và giá tham khảo.',custom_fields:[{key:'service_price',label:'Giá gói / Giá tham khảo',type:'text',placeholder:'Từ 3.500.000đ'},{key:'lion_count',label:'Số đầu lân / Rồng',type:'text',placeholder:'2 đầu lân'},{key:'drum_count',label:'Trống & bộ gõ',type:'text',placeholder:'1 trống cái + chập chõa'},{key:'performers_count',label:'Số người tham gia',type:'text',placeholder:'7–9 người'},{key:'performance_duration',label:'Thời lượng',type:'text',placeholder:'20–30 phút'},{key:'fireworks',label:'Pháo sáng',type:'text',placeholder:'Tùy chọn'},{key:'confetti',label:'Pháo kim tuyến',type:'text',placeholder:'Có / Không'},{key:'couplets',label:'Câu đối / liễn',type:'text',placeholder:'01 bộ'},{key:'service_area',label:'Khu vực phục vụ',type:'text',placeholder:'Hải Phòng / Hà Nội / Toàn quốc'},{key:'service_cta',label:'Nhãn CTA',type:'text',placeholder:'Liên hệ báo giá'}]}
 }
};

function sectionFromTuple(t){
 const [key,type,title,slots]=t;
 const out={key,type,title,content_source:(type==='category'||type==='latest')?(type==='category'?'category':'latest'):'none',bind_required:(type==='category'||type==='latest')?1:0};
 if(type==='category')out.category=title;
 if(slots){out.slots=slots;out.desktop_columns=3;out.tablet_columns=2;out.mobile_columns=1;out.fill_policy='complete_rows'}
 return out;
}

export function professionalTemplateContract(key){
 const c=registry[String(key||'')];
 if(!c)return null;
 return JSON.parse(JSON.stringify({
   contract_version:'template-ssot-v2',
   contract_key:key,
   version:c.version,
   preset:c.preset,
   content_type:c.content_type,
   geometry_locked:1,
   hero:c.hero,
   simulation:c.simulation,
   sections:c.sections.map(sectionFromTuple),
   editor:c.editor
 }));
}

export function professionalEditorProfile(key){return professionalTemplateContract(key)?.editor||null}
export function professionalSimulationContract(key){const c=professionalTemplateContract(key);return c?{contract_version:c.contract_version,hero:c.hero,simulation:c.simulation}:null}
