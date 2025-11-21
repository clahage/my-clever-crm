import React from "react";
import { useBranding } from "../branding/theme.jsx";

const items = [
  { id: "dash", label: "Dashboard", emoji: "📊" },
  { id: "clients", label: "Clients", emoji: "👥" },
  { id: "disputes", label: "Disputes", emoji: "📨" },
  { id: "reports", label: "Reports", emoji: "📈" },
  { id: "settings", label: "Settings", emoji: "⚙️" },
];

export default function Sidebar() {
  const { brand } = useBranding();
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col gap-4 p-4 min-h-[70vh] bg-[#10151A] border-r border-white/10">
      <div className="rounded-2xl p-3 mb-2" style={{ background: brand?.colors?.panel }}>
        <div className="text-sm text-white/70 font-semibold tracking-wide">Navigation</div>
      </div>
      <nav className="flex flex-col gap-2">
        {items.map(i => (
          <button key={i.id}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-white/90 hover:bg-white/10 transition font-medium"
          >
            <span className="text-xl">{i.emoji}</span>
            <span>{i.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
