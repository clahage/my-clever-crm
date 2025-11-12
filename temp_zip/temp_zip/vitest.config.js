import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/test/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'backups', 'backups/**'],
    // Use happy-dom to avoid jsdom + ESM interop issues in this environment
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['vitest.setup.js'],
  },
});
