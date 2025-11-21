import React, { useState } from "react";
import { useBranding } from "../branding/theme.jsx";
import BrandLogo from "@/components/BrandLogo";
import { Line, Bar } from "react-chartjs-2";
import "../branding/brand-globals.css";

const kpiData = [
  { label: "Leads Today", value: 42, icon: "👥" },
  { label: "Disputes Open", value: 17, icon: "⚡" },
  { label: "Credit Reports Pulled", value: 29, icon: "📄" },
  { label: "Avg. Score Increase", value: "+38", icon: "⬆️" },
];

const lineChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Monthly Disputes",
      data: [12, 19, 14, 23, 20, 28, 25],
      fill: true,
      backgroundColor: "rgba(0,123,255,0.1)",
      borderColor: "#007BFF",
      tension: 0.4,
    },
  ],
};

const barChartData = {
  labels: ["Web", "Referral", "Phone", "Email"],
  datasets: [
    {
      label: "Leads by Source",
      data: [18, 12, 8, 4],
      backgroundColor: ["#007BFF", "#28D17C", "#6A00F4", "#FFC107"],
    },
  ],
};

const activityFeed = [
  { time: "2m ago", text: "New lead added: John Doe" },
  { time: "10m ago", text: "Dispute started for Jane Smith" },
  { time: "1h ago", text: "Credit report pulled: Mike Lee" },
  { time: "2h ago", text: "Lead converted: Sarah Kim" },
];

const quickActions = [
  { label: "New Lead", color: "bg-blue-500" },
  { label: "Run Credit Report", color: "bg-green-500" },
  { label: "Start Dispute", color: "bg-purple-500" },
];

export default function ModernDashboard() {
  const { theme, setTheme, brand } = useBranding();
  const isSpeedy = theme === "speedy";

  return (
    <div className={`min-h-screen bg-white ${isSpeedy ? "" : "bg-gray-100"} font-sans`}> 
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4 shadow-sm bg-white/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {isSpeedy && <BrandLogo variant="dashboard" />}
          <span className="text-2xl font-bold tracking-tight" style={{ color: isSpeedy ? brand.colors.primary : "#333" }}>
            {isSpeedy ? "Speedy Credit Repair" : "CRM Dashboard"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
            onClick={() => setTheme(isSpeedy ? "generic" : "speedy")}
          >
            Switch to {isSpeedy ? "Generic" : "Speedy"}
          </button>
          <span className="material-icons text-gray-500">account_circle</span>
          <span className="material-icons text-gray-500">settings</span>
        </div>
      </nav>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 mt-6">
        {kpiData.map((kpi, i) => (
          <div
            key={kpi.label}
            className="brand-panel rounded-2xl p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-2xl backdrop-blur-md bg-white/60 border border-gray-200"
            style={{
              borderColor: isSpeedy ? brand.colors.primary : "#e5e7eb",
              boxShadow: isSpeedy ? "0 4px 24px 0 rgba(0,123,255,0.08)" : undefined,
            }}
          >
            <div className="text-3xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold" style={{ color: isSpeedy ? brand.colors.primary : "#333" }}>{kpi.value}</div>
            <div className="text-sm text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 mt-8">
        <div className="brand-panel rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/60 border border-gray-200">
          <div className="font-semibold mb-2">Monthly Disputes</div>
          <Line data={lineChartData} options={{ animation: { duration: 1200 } }} />
        </div>
        <div className="brand-panel rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/60 border border-gray-200">
          <div className="font-semibold mb-2">Leads by Source</div>
          <Bar data={barChartData} options={{ animation: { duration: 1200 } }} />
        </div>
      </div>

      {/* Activity & Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 mt-8 pb-8">
        <div className="brand-panel rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/60 border border-gray-200">
          <div className="font-semibold mb-2">Recent Activity</div>
          <ul className="space-y-2">
            {activityFeed.map((item, i) => (
              <li key={i} className="flex justify-between text-sm text-gray-700">
                <span>{item.text}</span>
                <span className="text-gray-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="brand-panel rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/60 border border-gray-200 flex flex-col gap-4">
          <div className="font-semibold mb-2">Quick Actions</div>
          <div className="flex gap-3 flex-wrap">
            {quickActions.map((action, i) => (
              <button
                key={action.label}
                className={`px-4 py-2 rounded-xl text-white font-semibold shadow-md transition-transform hover:scale-105 ${action.color}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Old Dashboard Link */}
      <div className="w-full text-center py-4">
        <a href="/old-dashboard" className="text-blue-500 underline hover:text-blue-700">View Old Dashboard</a>
      </div>
    </div>
  );
}
