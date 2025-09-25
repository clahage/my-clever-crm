// --- Dynamic Logo Component Example ---
// Usage: <BrandLogo portalType={portalType} theme={theme} />
import React from "react";
import { useTheme } from "@/theme/ThemeProvider"; // falls back gracefully if not present

function DefaultBrandLogo({ variant = "dashboard", className = "" }) {
  const sizes = {
    nav: "w-10",        // ~40px
    header: "w-10",     // 32–40px
    dashboard: "w-40",  // ~160px
    login: "w-40",      // up to ~160px
  };

  let theme = "light";
  try {
    theme =
      useTheme()?.theme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch {}

  const light = "/brand/default/logo-horizontal-tagline-1200.png";
  const dark  = "/brand/default/logo-white-tagline-1200.png"; // or '/brand/default/logo-fullcolor-darkmode-1200.png'

  const light2x = "/brand/default/logo-horizontal-tagline-1200.png";
  const dark2x  = "/brand/default/logo-white-tagline-1200.png";

  const src    = theme === "dark" ? dark : light;
  const srcSet = theme === "dark"
    ? `${dark} 1x, ${dark2x} 2x`
    : `${light} 1x, ${light2x} 2x`;

  return (
    <img
      src={src}
      srcSet={srcSet}
      alt="Speedy Credit Repair Logo"
      className={`h-auto ${sizes[variant]} ${className}`}
      width={160}
      height={48}
      onError={e => { e.currentTarget.src = "/brand/default/favicon.png"; e.currentTarget.removeAttribute("srcset"); }}
    />
  );
}

// Export BOTH ways so any import style works:
export default DefaultBrandLogo;        // import BrandLogo from "@/components/BrandLogo";
export const BrandLogo = DefaultBrandLogo; // import { BrandLogo } from "@/components/BrandLogo";