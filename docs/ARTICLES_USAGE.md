# Articles Page — Usage & Local Setup

This project includes an advanced Articles management page with an editor, analyzer, and affiliate manager.

Quick start (local):

1. Install deps:

```bash
npm install
```

2. Create a `.env` file with the following variables (Vite expects `VITE_` prefix):

```
VITE_OPENAI_API_KEY=sk-...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

3. Start dev server:

```bash
npm run dev
```

How to exercise the Articles UI:

- Open the app and navigate to the Articles page (via your `ProtectedLayout` NavConfig).
- Click "Load Sample" or press Ctrl/Cmd+I to load a test article.
- Click "New Article" to create a blank article and use the templates.
- Open the editor, expand "Article Analyzer & Affiliate Manager" to inspect opportunities.
- Use the AI buttons to auto-generate SEO, enhance content, or insert affiliate links (requires OpenAI key).

Notes:
- The analyzer uses `src/utils/articleHelpers.js` for AI calls and `src/utils/affiliateUtils.js` for deterministic affiliate link generation.
- Tests are configured to run only files under `src/test/**` (see `vitest.config.js`).
