/* HoangVuongTech Unified Template System V1
 * One template identity -> one capability/profile contract for Demo, Trial and Live.
 * This file is intentionally data-only: it never resolves tenant/trial ownership.
 */
(function(g){
  const COMMON=['overview','samples','stats','service','support','settings','password'];
  const P={
    estate:{kind:'estate',contentType:'property',menus:['overview','newpost','posts','samples','stats','service','support','settings','password'],labels:{newpost:'Đăng tin mới',posts:'Quản lý tin đăng'},cta:'＋ Đăng tin mới',placeholder:'Ví dụ: Căn hộ 2PN trung tâm Hải Phòng'},
    news:{kind:'news',contentType:'news',menus:['overview','newpost','posts','samples','stats','service','support','settings','password'],labels:{newpost:'Đăng bài mới',posts:'Quản lý bài viết'},cta:'＋ Đăng bài mới',placeholder:'Nhập tiêu đề bài viết'},
    product:{kind:'product',contentType:'product',menus:['overview','newpost','posts','samples','stats','service','support','settings','password'],labels:{newpost:'Thêm sản phẩm',posts:'Quản lý sản phẩm'},cta:'＋ Thêm sản phẩm',placeholder:'Ví dụ: Chuột không dây Logitech G304'},
    game:{kind:'game',contentType:'game',menus:['overview','newpost','posts','samples','stats','service','support','settings','password'],labels:{newpost:'Đăng base mới',posts:'Quản lý base'},cta:'＋ Đăng base mới',placeholder:'Ví dụ: TH18 War Base Anti 3 Star'},
    commerce:{kind:'commerce',contentType:'product',menus:['overview','commerce-products','commerce-orders','commerce-settings','serviceleads','samples','stats','service','support','settings','password'],labels:{},cta:'＋ Thêm sản phẩm',ctaTab:'commerce-products',placeholder:'Ví dụ: ASUS Vivobook 14 Core i5 16GB 512GB'},
    internet:{kind:'internet',contentType:'service',menus:['overview','newpost','posts','samples','stats','serviceleads','service','support','settings','password'],labels:{newpost:'Đăng gói mới',posts:'Quản lý gói & bài viết'},cta:'＋ Đăng gói mới',placeholder:'Ví dụ: Gói Internet Home 500'},
    lion:{kind:'lion',contentType:'service',menus:['overview','newpost','posts','samples','stats','serviceleads','service','support','settings','password'],labels:{newpost:'Đăng gói mới',posts:'Quản lý gói & bài viết'},cta:'＋ Đăng gói mới',placeholder:'Ví dụ: Gói 2 đầu lân khai trương'},
    service:{kind:'service',contentType:'service',menus:['overview','newpost','posts','samples','stats','serviceleads','service','support','settings','password'],labels:{newpost:'Đăng dịch vụ mới',posts:'Quản lý dịch vụ'},cta:'＋ Đăng dịch vụ mới',placeholder:'Nhập tên dịch vụ'},
    corporate:{kind:'corporate',contentType:'news',menus:['overview','newpost','posts','samples','stats','serviceleads','service','support','settings','password'],labels:{newpost:'Đăng bài mới',posts:'Quản lý nội dung'},cta:'＋ Đăng bài mới',placeholder:'Nhập tiêu đề nội dung'}
  };
  function resolve(x={}){
    const key=String(x.templateKey||x.template_key||'').trim(),preset=String(x.preset||'').trim(),cat=String(x.category||x.template_category||'').trim();
    if(key==='dich-vu-5'||preset==='universal_commerce_5'||cat==='ban-hang')return P.commerce;
    if(key==='dich-vu-6'||preset==='service_lion_dance_6')return P.lion;
    if(/^dich-vu-[1-4]$/.test(key)||/^service_(fpt|vnpt|viettel|camera)/.test(preset))return P.internet;
    if(/^dich-vu-\d+$/.test(key)||cat==='dich-vu'||preset.startsWith('service_'))return P.service;
    if(/^game-\d+$/.test(key)||cat==='game'||preset.startsWith('game_'))return P.game;
    if(/^san-pham-\d+$/.test(key)||cat==='san-pham'||preset.startsWith('product_'))return P.product;
    if(/^tin-tuc-\d+$/.test(key)||/^blog-ca-nhan-\d+$/.test(key)||cat==='tin-tuc'||preset.startsWith('news_')||preset.startsWith('personal_blog_'))return P.news;
    if(/^doanh-nghiep-\d+$/.test(key)||preset.startsWith('corporate_'))return P.corporate;
    return P.estate;
  }
  g.NRTemplateSystem=Object.freeze({version:'1.0.0',profiles:P,resolve});
})(window);
