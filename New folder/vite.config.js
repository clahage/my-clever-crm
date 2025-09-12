// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  resolve: {
    alias: {
      // If you still want "@", keep it here; otherwise remove this alias entirely.
      "@": path.resolve(__dirname, "src"),
    },
  },
});
