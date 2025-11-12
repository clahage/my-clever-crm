import { vi } from 'vitest';
// Global test setup: mock heavy UI icon libraries to avoid opening lots of files
vi.mock('@mui/icons-material', () => {
  const React = require('react');
  const proxy = new Proxy({}, {
    get: () => (props) => React.createElement('span', props)
  });
  return proxy;
});

// Optionally mock other heavy libraries here in future
