/**
 * CoCBasePro VPS -> NEWSREAL/Cloudflare publisher adapter V1.
 * Add this AFTER your existing import/parser/image pipeline has produced one normalized item.
 * Keep CONTENT_PUBLISHER_SECRET only on the VPS and Cloudflare Secret storage.
 */

export async function publishBaseToCloudflare(item, cfg = {}) {
  const endpoint = String(cfg.endpoint || process.env.COCBASE_CLOUDFLARE_PUBLISH_URL || '').replace(/\/$/, '');
  const token = String(cfg.token || process.env.CONTENT_PUBLISHER_SECRET || '');
  const tenantDomain = String(cfg.tenantDomain || process.env.COCBASE_TENANT_DOMAIN || '');
  if (!endpoint) throw new Error('Missing COCBASE_CLOUDFLARE_PUBLISH_URL');
  if (!token) throw new Error('Missing CONTENT_PUBLISHER_SECRET');
  if (!tenantDomain) throw new Error('Missing COCBASE_TENANT_DOMAIN');

  const payload = {
    tenant_domain: tenantDomain,
    external_key: item.baseId || item.base_id || item.baseLink || item.sourceUrl,
    source_url: item.sourceUrl,
    title: item.title,
    slug: item.slugKey || item.slug,
    game_group: item.group,
    game_level: item.level,
    game_purpose: item.type || item.baseType,
    game_style: item.style,
    game_defense: item.defense,
    access_tier: item.premium ? 'Premium' : 'Free',
    copy_link: item.baseLink || item.copyLink,
    premium_link: item.premiumLink || '',
    processed_image_url: item.processedImageUrl || item.imageUrl,
    original_image_url: item.originalImageUrl,
    description: item.description,
    content: item.content || item.description,
    year: item.year || new Date().getUTCFullYear()
  };

  const response = await fetch(`${endpoint}/api/publisher/base`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Cloudflare publisher HTTP ${response.status}`);
  return data;
}

export async function checkCloudflareBase(externalKey, cfg = {}) {
  const endpoint = String(cfg.endpoint || process.env.COCBASE_CLOUDFLARE_PUBLISH_URL || '').replace(/\/$/, '');
  const token = String(cfg.token || process.env.CONTENT_PUBLISHER_SECRET || '');
  const tenantDomain = String(cfg.tenantDomain || process.env.COCBASE_TENANT_DOMAIN || '');
  const q = new URLSearchParams({ tenant: tenantDomain, external_key: String(externalKey || '') });
  const response = await fetch(`${endpoint}/api/publisher/check?${q}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Cloudflare publisher check HTTP ${response.status}`);
  return data;
}
