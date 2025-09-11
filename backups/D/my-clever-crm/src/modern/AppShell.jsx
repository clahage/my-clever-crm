import React from "react";
import Toggle from "./Toggle";
import { useBranding } from "../branding/theme.jsx";
import UpsellBanner from "../components/UpsellBanner";

export default function AppShell({ children }) {
  const { brand } = useBranding();
  return (
    <div className="min-h-screen" style={{ background: brand?.colors?.bg || "#0B0F14" }}>
      <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10 bg-[#10151A] h-16 flex items-center overflow-hidden" style={{ background: "#10151A" }}>
        <div className="mx-auto max-w-7xl px-4 w-full flex items-center justify-between h-full">
          <div className="flex items-center gap-3 h-full">
            <div className="flex items-center h-full overflow-hidden">
              {brand?.logo ? (
                <img src={brand.logo} alt="brand" className="h-12 w-auto max-w-[140px] object-contain object-center block" style={{ maxHeight: '48px', minHeight: '32px', margin: 0, padding: 0, background: 'transparent' }} onError={(e) => { e.currentTarget.remove(); }} />
              ) : (
                <div className="text-white font-semibold">{brand?.name || 'My Clever CRM'}</div>
              )}
            </div>
            <div className="hidden md:block text-white/60 text-sm">Credit CRM</div>
          </div>
          <div className="flex items-center gap-3">
            <Toggle />
            <div className="h-8 w-8 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="h-1 w-full" style={{ background: brand?.colors?.accent }} />
      </header>
      <UpsellBanner />
      <main className="mx-auto max-w-7xl px-4 py-6 text-white">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 py-6 text-white/60">© Speedy Credit Repair Inc</footer>
    </div>
  );
}
