import { describe, it, expect } from 'vitest';
import { generateTrackingId, buildAffiliateHtml, prepareDelta } from '../../src/utils/affiliateUtils';

describe('affiliateUtils', () => {
  it('generateTrackingId produces predictable format', () => {
    const id = generateTrackingId('article123', 2, 1690000000000);
    expect(id).toMatch(/^aff_article123_1690000000000_2$/);
  });

  it('buildAffiliateHtml produces sanitized anchor', () => {
    const html = buildAffiliateHtml('https://example.com', 'Click here', 'aff_test_1', 'Test Product');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('data-tracking="aff_test_1"');
    expect(html).toContain('data-product="Test Product"');
    expect(html).toContain('Click here');
  });

  it('prepareDelta replaces first occurrence and returns addedLinks', () => {
    const content = 'This is a sample article. Buy now for great value. Another buy now mention.';
    const opportunities = [{ index: 0, text: 'Buy now' }, { index: 1, text: 'sample article' }];
    const selected = { 0: true, 1: true };
    const mappings = { 0: { url: 'https://aff.com/p', product: 'Aff P', commission: 10 }, 1: { url: 'https://aff.com/q', product: 'Aff Q', commission: 5 } };

    const delta = prepareDelta({ content, opportunities, selected, mappings, articleId: 'art1', idFn: (a, i, now) => `X_${a}_${i}` });
    expect(delta).toBeTruthy();
    expect(delta.addedLinks.length).toBeGreaterThanOrEqual(1);
    expect(delta.newContent).toContain('class="affiliate-link"');
  });
});
