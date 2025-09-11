// src/theme/initTheme.js
// Applies the saved theme before React paints (minimize FOUC).
export function initTheme() {
  try {
    const saved = localStorage.getItem("speedycrm.theme");
    const isDark = saved === "dark";
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  } catch {
    // Fail silently
  }
}
