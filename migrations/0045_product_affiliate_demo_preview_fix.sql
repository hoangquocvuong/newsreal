-- V20.9.23.2 — Product/Affiliate demo boot + real marketplace preview.
UPDATE template_catalog
SET image_url='/assets/demo/san-pham-1-preview.png',
    demo_url='/demo/san-pham/mau-1/',
    category='ban-hang',
    updated_at=CURRENT_TIMESTAMP
WHERE template_key='san-pham-1';
