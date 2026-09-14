-- V20.9.23.1 — Product/Affiliate belongs to the existing Bán hàng marketplace category.
UPDATE template_catalog
SET category='ban-hang', updated_at=CURRENT_TIMESTAMP
WHERE template_key='san-pham-1';
