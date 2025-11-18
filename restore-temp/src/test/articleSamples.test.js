import { describe, it, expect } from 'vitest';
import { getSampleById, default as SAMPLES } from './samples/articleSamples';

describe('Article samples', () => {
  it('has at least one sample', () => {
    expect(SAMPLES.length).toBeGreaterThan(0);
  });

  it('getSampleById returns correct sample', () => {
    const s = getSampleById('sample-credit-repair-002');
    expect(s).toBeTruthy();
    expect(s.title).toContain('Dispute');
  });
});
