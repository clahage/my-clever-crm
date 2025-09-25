import { TOKENS } from "./tokens";

function ensureFontLink(url) {
  if (!url) return;
  const id = `font-${btoa(url)}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

export function applyTheme(skinId) {
  const t = TOKENS[skinId];
  if (!t) return;

  document.documentElement.setAttribute("data-skin", skinId);

  const root = document.documentElement.style;
  root.setProperty("--brand-bg", t.colors.bg);
  root.setProperty("--brand-fg", t.colors.fg);
  root.setProperty("--brand-primary", t.colors.primary);
  root.setProperty("--brand-secondary", t.colors.secondary);
  root.setProperty("--brand-surface", t.colors.surface);
  root.setProperty("--brand-stroke", t.colors.stroke);

  root.setProperty("--brand-radius-xl", t.radii.xl);
  root.setProperty("--brand-radius-xxl", t.radii.xxl);
  root.setProperty("--brand-shadow-soft", t.shadow.soft);

  root.setProperty("--brand-font-family", t.font.family || "Inter, ui-sans-serif, system-ui");

  document.documentElement.setAttribute("data-logo-header-light", t.logos.headerLight);
  document.documentElement.setAttribute("data-logo-header-dark", t.logos.headerDark);
  document.documentElement.setAttribute("data-favicon", t.logos.favicon);

  ensureFontLink(t.font.url);
}
