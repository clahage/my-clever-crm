import Articles from '../../src/pages/resources/Articles.jsx';

describe('Articles page smoke', () => {
  it('should import the Articles component without throwing', () => {
    // Basic sanity: the module should export a component (function or object)
    expect(Articles).toBeDefined();
    expect(typeof Articles === 'function' || typeof Articles === 'object').toBe(true);
  });
});
