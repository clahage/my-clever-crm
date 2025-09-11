import React, { useEffect, useState } from "react";
import { useBranding } from "../branding/theme.jsx";

const HIDE_KEY = "mcc_hide_upsell";

export default function UpsellBanner() {
  const { theme } = useBranding();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const flag = (import.meta.env.VITE_UPSELL_ENABLED ?? "true").toString().toLowerCase();
    const enabled = flag !== "false";
    const dismissed = typeof window !== "undefined" && localStorage.getItem(HIDE_KEY) === "1";
    // Only show if speedy + enabled + not dismissed
    if (theme === "speedy" && enabled && !dismissed) setHidden(false);
    else setHidden(true);
  }, [theme]);

  if (hidden) return null;

  const onClose = () => {
    try { localStorage.setItem(HIDE_KEY, "1"); } catch {}
    setHidden(true);
  };

  return (
    <div
      className="mx-auto max-w-7xl px-4 pt-3"
      role="region"
      aria-label="Upsell notice"
    >
      <div
        className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ring-1 text-white"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          borderColor: "rgba(255,255,255,0.15)"
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <div className="text-sm md:text-base">
            Offer your clients a <span className="font-semibold">white-label, fully branded</span> CRM experience.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/pricing"
            className="rounded-xl px-3 py-1.5 bg-white/90 text-slate-900 text-sm font-medium hover:bg-white"
          >
            Learn More
          </a>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 bg-white/10 text-white/80 text-sm hover:bg-white/20"
            aria-label="Dismiss upsell"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
