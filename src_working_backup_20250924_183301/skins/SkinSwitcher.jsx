import React, { useEffect, useRef, useState } from "react";

/**
 * Self-contained Skin Switcher:
 * - No imports from SkinContext (avoids casing error 1149)
 * - Admin-only via localStorage("scr.role") — default "admin" so you can test
 * - Persists theme in localStorage("speedycrm.theme")
 * - Toggles Tailwind "dark" class on <html>
 */

function getUserRole() {
  try {
    if (typeof window !== "undefined") {
      const r = window.__SCR_USER_ROLE__ || localStorage.getItem("scr.role");
      if (r) return r;
    }
  } catch {}
  return "admin"; // default so FAB shows for testing
}

function applyTheme(theme) {
  try {
    localStorage.setItem("speedycrm.theme", theme);
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  } catch {}
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("speedycrm.theme");
    return saved === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function SkinSwitcher() {
  const role = getUserRole();
  if (role !== "admin") return null;

  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme());
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e) {
      if (!open) return;
      const t = e.target;
      if (
        panelRef.current &&
        !panelRef.current.contains(t) &&
        btnRef.current &&
        !btnRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const choose = (next) => {
    setTheme(next);
    applyTheme(next);
    setOpen(false);
  };

  return (
    <>
      {/* Floating FAB */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition hover:shadow-xl focus:outline-none focus-visible:ring dark:border-gray-800 dark:bg-gray-900"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
             viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a10 10 0 1 1 10-10c0 1.657-1.343 3-3 3h-1a2 2 0 0 0-2 2v1c0 1.657-1.343 3-3 3z"/>
          <circle cx="7.5" cy="10.5" r="1.5"/>
          <circle cx="12" cy="7.5" r="1.5"/>
          <circle cx="16.5" cy="10.5" r="1.5"/>
        </svg>
        <span className="sr-only">Open theme switcher</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Theme Switcher"
          className="fixed bottom-24 right-6 z-50 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => choose("light")}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus-visible:ring dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Light
              </button>
            </li>
            <li>
              <button
                onClick={() => choose("dark")}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus-visible:ring dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Dark
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

export default SkinSwitcher;