/**
 * Pure helpers for affiliate link generation and delta building.
 */
export const generateTrackingId = (articleId = 'local', index = 0, now = Date.now()) => `aff_${articleId}_${now}_${index}`;

export const buildAffiliateHtml = (url = '#', text = '', trackingId = 'aff_local_0_0', product = '') => {
  const safeUrl = url || '#';
  const safeText = (text || 'link');
  const safeProduct = product || '';
  return `<a href="${safeUrl}" class="affiliate-link" data-tracking="${trackingId}" data-product="${safeProduct}" target="_blank" rel="noopener noreferrer sponsored">${safeText}</a>`;
};

/**
 * Prepare a delta replacing the first occurrence of each selected opportunity text in `content`.
 *
 * - content: original HTML/text
 * - opportunities: array of { index, text }
 * - selected: object map of index -> boolean
 * - mappings: object map of index -> { url, product, commission }
 * - articleId: string used for tracking id
 * - idFn: optional tracking id generator (for tests)
 */
export const prepareDelta = ({ content = '', opportunities = [], selected = {}, mappings = {}, articleId = 'local', idFn = generateTrackingId }) => {
  const chosen = opportunities.filter(o => selected[o.index]);
  if (!chosen.length) return null;

  let newContent = content || '';
  const addedLinks = [];

  chosen.forEach((o, i) => {
    const map = mappings[o.index] || {};
    const trackingId = idFn(articleId, o.index, typeof map.now === 'number' ? map.now : undefined);
    const url = map.url || `https://speedycreditrepair.com/go/${(map.product || 'product').toLowerCase().replace(/\s+/g, '-')}`;
    const product = map.product || map.productName || '';
    const repl = buildAffiliateHtml(url, o.text, trackingId, product);

    const idx = newContent.indexOf(o.text);
    if (idx >= 0) {
      newContent = newContent.substring(0, idx) + repl + newContent.substring(idx + o.text.length);
      addedLinks.push({ text: o.text, product, url, trackingId, commission: map.commission || 0, position: idx });
    }
  });

  return { newContent, addedLinks };
};
