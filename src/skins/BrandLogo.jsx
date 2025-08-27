import React from "react";

export default function BrandLogo({ mode = "light", className = "h-8 w-auto" }) {
  const root = document.documentElement;
  const lightSrc = root.getAttribute("data-logo-header-light") || "/logo-header-light.png";
  const darkSrc  = root.getAttribute("data-logo-header-dark")  || "/logo-header-dark.png";
  const src = mode === "dark" ? darkSrc : lightSrc;
  return <img src={src} alt="Brand" className={className} />;
}
