-- V20.9.23.4 — Absolute self-contained Product/Affiliate showroom + real preview asset.
UPDATE template_catalog
SET image_url='/assets/demo/san-pham-1-preview-real.webp',
    demo_url='/demo/san-pham/mau-1/',
    category='ban-hang',
    is_active=1,
    updated_at=CURRENT_TIMESTAMP
WHERE template_key='san-pham-1';
