export const PROFESSIONAL_TEMPLATE_KEYS=['blog-ca-nhan-1','blog-ca-nhan-2','doanh-nghiep-1','doanh-nghiep-2','dich-vu-5','dich-vu-6'];
export const GLOBAL_TEMPLATE_KEYS=['mau-1','mau-2','mau-3','mau-4','mau-5','tin-tuc-1','tin-tuc-2','tin-tuc-3','tin-tuc-4','dich-vu-1','dich-vu-2','dich-vu-3','dich-vu-4','dich-vu-5','dich-vu-6','san-pham-1','game-1','blog-ca-nhan-1','blog-ca-nhan-2','doanh-nghiep-1','doanh-nghiep-2'];

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


// V20.9.27.14 — Global SSOT contract. Every marketplace template must be
// registered here, even when its visual renderer is legacy/specialized.
// The structure passed to templateUsageGuide is the same structure used by
// runtime rendering/Admin, so the guide can never drift from real sections.
const globalMeta={
 'mau-1':{name:'Mẫu 1 · Tin tức & BĐS',family:'bat-dong-san'},
 'mau-2':{name:'Mẫu 2 · BĐS hiện đại',family:'bat-dong-san'},
 'mau-3':{name:'Mẫu 3 · BĐS Luxury',family:'bat-dong-san'},
 'mau-4':{name:'Mẫu 4 · BĐS Minimal',family:'bat-dong-san'},
 'mau-5':{name:'Mẫu 5 · BĐS Urban',family:'bat-dong-san'},
 'tin-tuc-1':{name:'Tin tức Mẫu 1 · Tạp chí hiện đại',family:'tin-tuc'},
 'tin-tuc-2':{name:'Tin tức Mẫu 2 · Báo điện tử',family:'tin-tuc'},
 'tin-tuc-3':{name:'Tin tức Mẫu 3 · Magazine hiện đại',family:'tin-tuc'},
 'tin-tuc-4':{name:'Tin tức Mẫu 4 · Minimal SEO',family:'tin-tuc'},
 'dich-vu-1':{name:'FPT',family:'dich-vu'},
 'dich-vu-2':{name:'VNPT',family:'dich-vu'},
 'dich-vu-3':{name:'Viettel',family:'dich-vu'},
 'dich-vu-4':{name:'Camera Store',family:'dich-vu'},
 'dich-vu-5':{name:'Điểm sạc xe điện',family:'dich-vu'},
 'dich-vu-6':{name:'Lân Sư Rồng',family:'dich-vu'},
 'san-pham-1':{name:'Product Store · Affiliate',family:'ban-hang'},
 'game-1':{name:'Clash of Clans · Base Portal',family:'game'},
 'blog-ca-nhan-1':{name:'Blog cá nhân · Nhật ký tối giản',family:'blog-ca-nhan'},
 'blog-ca-nhan-2':{name:'Blog cá nhân · Góc người sáng tạo',family:'blog-ca-nhan'},
 'doanh-nghiep-1':{name:'Doanh nghiệp · Giải pháp hiện đại',family:'doanh-nghiep'},
 'doanh-nghiep-2':{name:'Doanh nghiệp · Hồ sơ năng lực',family:'doanh-nghiep'}
};

export function globalTemplateMeta(key){
 const k=String(key||'');
 const meta=globalMeta[k];
 if(!meta)return null;
 const pro=professionalTemplateContract(k);
 return {contract_version:'template-global-ssot-v3',contract_key:k,geometry_locked:1,...meta,professional:!!pro,hero:pro?.hero||null,simulation:pro?.simulation||null,editor:pro?.editor||null};
}

export function templateUsageGuide(key,structure={},editor={}){
 const meta=globalTemplateMeta(key)||{contract_key:String(key||''),name:String(key||'Mẫu website'),family:'generic'};
 const sections=Array.isArray(structure?.sections)?structure.sections:[];
 const cats=Array.isArray(editor?.categories)?editor.categories:[];
 const tx=editor?.categoriesByTransaction&&typeof editor.categoriesByTransaction==='object'?editor.categoriesByTransaction:null;
 const steps=[];
 for(let i=0;i<sections.length;i++){
  const x=sections[i]||{},type=String(x.type||'section'),title=String(x.title||x.category||x.key||`Khối ${i+1}`),cat=String(x.category||'');
  const postBound=Number(x.bind_required||0)===1 || ['category','latest','breaking','ticker','trending','hero','special','explore','property_list','property_projects','property_split','property_areas','news'].includes(type);
  let source='Cài đặt website',instruction='Khối bố cục cố định của giao diện; chỉnh thông tin tương ứng trong Cài đặt website nếu có trường cấu hình.';
  if(type==='category'&&cat){source=`Đăng bài → ${cat}`;instruction=`Muốn nội dung xuất hiện tại khối “${title}”, khi đăng bài hãy chọn chính xác chuyên mục “${cat}”.`;}
  else if(type==='latest'||type==='breaking'||type==='ticker'||type==='trending'||type==='explore'){source='Đăng bài';instruction=`Khối “${title}” lấy bài theo quy tắc ${type==='latest'?'mới nhất':type==='trending'?'nổi bật/xu hướng':'tự động'}; hãy đăng bài đúng chuyên mục và trạng thái Đăng ngay.`;}
  else if(type==='hero'||type==='special'){source='Bài nổi bật / Cài đặt Hero';instruction=`Khối “${title}” ưu tiên nội dung nổi bật hoặc trường Hero của mẫu. Nếu muốn bài được ưu tiên, bật “Tin nổi bật” khi đăng.`;}
  else if(type.startsWith('property_')){source='Đăng bất động sản';instruction=`Khối “${title}” được hệ thống phân phối từ tin BĐS theo loại giao dịch, loại hình và trạng thái nổi bật phù hợp.`;}
  else if(type==='news'){source='Đăng bài tin tức';instruction=`Khối “${title}” lấy bài tin tức đã xuất bản.`;}
  else if(postBound){source='Đăng bài';instruction=`Khối “${title}” lấy dữ liệu bài đăng theo quy tắc của mẫu.`;}
  steps.push({order:i+1,key:String(x.key||''),title,type,category:cat,source,instruction,slots:Number(x.slots||0),columns:{desktop:Number(x.desktop_columns||0),tablet:Number(x.tablet_columns||0),mobile:Number(x.mobile_columns||0)}});
 }
 const structuralCats=[...new Set(steps.filter(x=>x.category).map(x=>x.category))];
 const guideCats=structuralCats.length?structuralCats:cats;
 const categoryRules=guideCats.map(c=>({category:String(c),instruction:`Chọn “${c}” trong ô Chuyên mục để bài đi vào đúng khu vực mang tên “${c}” trên giao diện.`}));
 const transactionRules=tx?Object.entries(tx).map(([k,v])=>({transaction:k,categories:Array.isArray(v)?v:[]})):[];
 return {
  version:'template-admin-guide-v1',template_key:meta.contract_key,template_name:meta.name,family:meta.family,
  contract_version:'template-global-ssot-v3',geometry_locked:1,
  intro:'Sơ đồ này được sinh trực tiếp từ cùng cấu trúc mà website đang dùng. Thứ tự khối bên dưới chính là thứ tự bố cục trang chủ.',
  publish_checklist:['Chọn đúng loại nội dung/chuyên mục theo sơ đồ.','Điền tiêu đề, ảnh đại diện và nội dung đầy đủ.','Nếu mẫu có trường riêng (giá, thông số, level, dịch vụ...), điền đủ trước khi đăng.','Chọn Đăng ngay để nội dung xuất hiện trên website.','Sau khi đăng, bấm Xem website để kiểm tra đúng khối.'],
  sections:steps,category_rules:categoryRules,transaction_rules:transactionRules,
  empty_mode_note:'Website bàn giao không có bài vẫn giữ bố cục 1:1 bằng skeleton. Khi bạn đăng đúng nội dung, skeleton tương ứng sẽ được thay bằng bài thật.'
 };
}
