-- V20.9.23.3 — Product/Affiliate demo route must resolve inside the isolated showroom namespace.
-- Version the real rendered preview asset as well to avoid stale marketplace image cache.
UPDATE template_catalog
SET image_url='/assets/demo/san-pham-1-preview-v2.png',
    demo_url='/demo/san-pham/mau-1/',
    category='ban-hang',
    is_active=1,
    updated_at=CURRENT_TIMESTAMP
WHERE template_key='san-pham-1';
