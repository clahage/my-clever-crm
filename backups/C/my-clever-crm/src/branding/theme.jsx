import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export const BRAND_THEMES = {
  speedy: {
    id: "speedy",
    name: "Speedy Credit Repair",
    logo: "/logo-transparent-1200.png",
    colors: {
      primary: "#1C9A3E",
      primaryDark: "#157A31",
      secondary: "#003C71",
      bg: "#0C1116",
      panel: "rgba(255,255,255,0.05)",
      text: "#EAF7EF",
      kpiUp: "#22c55e",
      kpiDown: "#ef4444",
      accent: "linear-gradient(135deg, #1C9A3E 0%, #003C71 100%)"
    },
  },
  generic: {
    id: "generic",
    name: "Generic",
    logo: "/generic/logo.svg",
    colors: {
      primary: "#4f46e5",
      primaryDark: "#4338ca",
      secondary: "#10b981",
      bg: "#0B0F14",
      panel: "rgba(255,255,255,0.06)",
      text: "#E6F0FF",
      kpiUp: "#22c55e",
      kpiDown: "#ef4444",
      accent: "linear-gradient(135deg, #4f46e5 0%, #10b981 100%)"
    },
  },
  legacy: {
    id: "legacy",
    name: "Legacy",
    logo: null,
    colors: null,
  }
};

const THEME_KEY = "mcc_ui_theme";

function readQueryTheme() {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const t = p.get("theme");
  return t && BRAND_THEMES[t] ? t : null;
}
function readStoredTheme() {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}
export function getInitialTheme() {
  return readQueryTheme() || readStoredTheme() || "speedy";
}

const BrandingContext = createContext({
  theme: "speedy",
  setTheme: () => {},
  brand: BRAND_THEMES.speedy,
});

export function BrandingProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  const brand = useMemo(() => BRAND_THEMES[theme] || BRAND_THEMES.speedy, [theme]);

  useEffect(() => {
    if (brand.colors) {
      document.documentElement.style.setProperty("--brand-primary", brand.colors.primary);
      document.documentElement.style.setProperty("--brand-panel", brand.colors.panel);
      document.documentElement.style.setProperty("--brand-text", brand.colors.text);
      document.documentElement.style.setProperty("--brand-bg", brand.colors.bg);
    }
  }, [brand]);

  return (
    <BrandingContext.Provider value={{ theme, setTheme, brand }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
