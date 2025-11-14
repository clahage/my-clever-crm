import React, { useEffect, useRef, useState } from "react";
import { useSkin } from "./SkinContext";

/**
 * Skin Switcher with Role Selection:
 * - Theme switching (light/dark)
 * - Role switching (admin/agent/viewer)
 * - Admin-only visibility
 * - Persists theme in localStorage("speedycrm.theme")
 * - Persists role via SkinContext
 * - Toggles Tailwind "dark" class on <html>
 */

function getUserRole() {
  try {
    if (typeof window !== "undefined") {
      const r = window.__SCR_USER_ROLE__ || localStorage.getItem("mcc_role") || localStorage.getItem("scr.role");
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

  const { role: currentRole, setRole } = useSkin();
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
        <span className="sr-only">Open theme & role switcher</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Theme & Role Switcher"
          className="fixed bottom-24 right-6 z-50 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          {/* Theme Section */}
          <div className="mb-3">
            <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Theme
            </h3>
            <ul className="space-y-1 mt-1">
              <li>
                <button
                  onClick={() => choose("light")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    theme === "light"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                      : "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  } focus:outline-none focus-visible:ring`}
                >
                  ☀️ Light
                </button>
              </li>
              <li>
                <button
                  onClick={() => choose("dark")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    theme === "dark"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                      : "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  } focus:outline-none focus-visible:ring`}
                >
                  🌙 Dark
                </button>
              </li>
            </ul>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Role Section */}
          <div>
            <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              View as Role
            </h3>
            <ul className="space-y-1 mt-1">
              <li>
                <button
                  onClick={() => setRole("admin")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    currentRole === "admin"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium"
                      : "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  } focus:outline-none focus-visible:ring`}
                >
                  👑 Admin
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRole("agent")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    currentRole === "agent"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium"
                      : "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  } focus:outline-none focus-visible:ring`}
                >
                  👤 Agent
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRole("viewer")}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    currentRole === "viewer"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium"
                      : "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  } focus:outline-none focus-visible:ring`}
                >
                  👁️ Viewer
                </button>
              </li>
            </ul>
          </div>

          {/* Info Footer */}
          <div className="mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Note:</strong> Switching roles will reload the page to update navigation and permissions.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default SkinSwitcher;