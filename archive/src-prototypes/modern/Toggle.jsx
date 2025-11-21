import React from "react";
import { useBranding } from "../branding/theme.jsx";

export default function Toggle() {
  const { theme, setTheme } = useBranding();
  const options = [
    { id: "legacy", label: "Legacy" },
    { id: "speedy", label: "Speedy" },
    { id: "generic", label: "Generic" }
  ];
  return (
    <div className="inline-flex rounded-xl bg-white/10 p-1 backdrop-blur ring-1 ring-white/10">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => setTheme(opt.id)}
          className={`px-3 py-1 text-sm rounded-lg transition ${
            theme === opt.id ? "bg-white/90 text-slate-900 shadow" : "text-white/80 hover:bg-white/20"
          }`}
          aria-pressed={theme === opt.id}
          aria-label={`Switch to ${opt.label} theme`}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              setTheme(opt.id);
            }
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
