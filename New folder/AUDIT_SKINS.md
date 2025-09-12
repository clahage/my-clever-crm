// Moved to __CLEANUP__/look at file further/AUDIT_SKINS.md

- **In use:** ✔
  - `react-router-dom` dependency in `package.json`
  - Usage of `<Routes>`, `<Route>`, `<BrowserRouter>` in `src/App.jsx`

## Global CSS Entry

- **File:** `src/index.css` ✔
- **Contains:**
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  html, body, #root { height: 100%; margin: 0; }
  ```

## Layout Wrappers/Providers

- **ThemeProvider:**
  - Custom: `BrandingProvider` wraps all routes in `src/App.jsx` ✔
- **Other Providers:**
  - `AuthProvider`, `ThemeProvider` (custom), `HelmetProvider` (react-helmet-async)
  - No Redux or QueryClientProvider detected

## Global Styles That Could Clash

- `src/index.css` sets `html, body, #root { height: 100%; margin: 0; }`
- No global `* { color: ... }` detected
- No CSS resets that would override skin classes

## Path Aliases

- No explicit path aliases (`@/components`) found in `vite.config.js` or codebase

## Public Assets (Logos/Favicons)

- **Favicons:**
  - `favicon.ico`, `favicon.png`
- **Logos:**
  - Multiple variants: `logo.png`, `logo-16.svg`, `logo-32.svg`, `logo-128.svg`, `logo-512.svg`, `logo-1200.svg`, etc.
  - Black, white, brand, transparent, tagline, horizontal, fullcolor, graymode, lightmode, darkmode, generic, speedy folders
- **Splash screens:**
  - `splash-dark-phone.png`, `splash-dark-tablet.png`, `splash-gray-phone.png`, etc.
- **Branding guides:**
  - `SpeedyCRM_Branding_Guide.pdf`

## PWA Manifest

- **File:** `public/manifest.json` ✔
- **Parsed fields:**
  - `name`: "Speedy Credit Repair" / "My Clever CRM"
  - `short_name`: "SpeedyCRM" / "CleverCRM"
  - `start_url`: "/" or "."
  - `display`: "standalone"
  - `background_color`: `#FFFFFF` / `#ffffff`
  - `theme_color`: `#1C9A3E` / `#3b82f6`
  - `icons`: logo-192x192.png, logo-512x512.png, favicon.ico, logo.png
  - `orientation`: "portrait" (in one block)

## Risk Areas & Insertion Points

- **Risk Areas:**
  - Multiple logo variants: ensure correct logo is used for each skin
  - Manifest has duplicate blocks (merge for clarity)
  - No path aliases: use relative imports for new skin files
  - No global style clashes detected
  - Providers: wrap new skin system in `BrandingProvider` and any required providers
- **Insertion Points:**
  - Mount skin system inside main layout, wrapped by `BrandingProvider` in `src/App.jsx`
  - Use Tailwind classes for all skin components
  - Reference public assets via `/logo.png` or other variants as needed

---
✔ = Confirmed present and correct
⚠ = Needs review or may be missing

ACK-AUDIT
