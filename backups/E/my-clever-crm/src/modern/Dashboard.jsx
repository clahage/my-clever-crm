import React from "react";
import AppShell from "./AppShell";
import Sidebar from "./Sidebar";
import { useBranding } from "../branding/theme.jsx";
import AskPanel from "../components/AskPanel";

function KPI({ label, value, delta, good }) {
  return (
    <div className="rounded-2xl p-4 ring-1 ring-white/10 bg-white/5">
      <div className="text-white/70 text-sm">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      <div className={`mt-2 text-sm ${good ? "text-emerald-400" : "text-rose-400"}`}>{delta}</div>
    </div>
  );
}

export default function Dashboard() {
  const { brand } = useBranding();
  return (
    <AppShell>
      <div className="flex gap-0 min-h-[70vh]">
        <Sidebar />
        <section className="flex-1 flex flex-col gap-6">
          <div className="rounded-3xl p-6 ring-1 ring-white/10"
               style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)" }}>
            <div className="text-white/80">Welcome back</div>
            <div className="text-3xl font-semibold text-white mt-1">Client Health Overview</div>
            <div className="text-white/70 mt-2 max-w-2xl">
              A quick snapshot of disputes, removals, payments, and pipeline.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI label="Active Clients" value="412" delta="▲ 8 this week" good />
            <KPI label="Disputes Sent" value="1,245" delta="▲ 112 this month" good />
            <KPI label="Item Removals" value="338" delta="▲ 19 this week" good />
            <KPI label="Churn" value="3.2%" delta="▼ 0.4% vs last month" good />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-3xl p-6 ring-1 ring-white/10 bg-white/5">
              <div className="text-white/80 font-medium">Disputes by Bureau</div>
              <div className="mt-3 h-40 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-white/50">
                (chart placeholder)
              </div>
            </div>
            <div className="rounded-3xl p-6 ring-1 ring-white/10 bg-white/5">
              <div className="text-white/80 font-medium">Tasks</div>
              <ul className="mt-3 space-y-2 text-white/90">
                <li>📨 Prepare Experian batch</li>
                <li>🧾 Send client onboarding packet</li>
                <li>🔁 Follow up on disputes #2483</li>
              </ul>
            </div>
          </div>
          <AskPanel />
        </section>
      </div>
    </AppShell>
  );
}
