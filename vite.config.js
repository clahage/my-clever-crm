console.log('Vite config loaded with CORS headers');

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import path from "path"; // ⬅️ add this

const API_BASE = process.env.VITE_API_BASE; // only used if set in dev env

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ⬅️ add this
    },
  },
  css: {
    // Inline PostCSS so Vite doesn't try to auto-load an external config
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  server: {
    ...(API_BASE
      ? {
          proxy: {
            '/api': {
              target: API_BASE,
              changeOrigin: true,
              rewrite: (path) => path
            }
          }
        }
      : {}),
    historyApiFallback: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  }
});
