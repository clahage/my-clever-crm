import React from "react";
import { ChartBarIcon, UsersIcon, CurrencyDollarIcon, ClockIcon, MapIcon } from "@heroicons/react/24/outline";

export default function ModernDashboardGlass() {
  const stats = [
    { name: "Active Clients", value: "132", icon: UsersIcon, color: "from-blue-600 via-blue-400 to-cyan-400" },
    { name: "Revenue (This Month)", value: "$24,300", icon: CurrencyDollarIcon, color: "from-emerald-600 via-green-400 to-emerald-300" },
    { name: "Leads Generated", value: "89", icon: ChartBarIcon, color: "from-purple-600 via-fuchsia-400 to-pink-300" },
    { name: "Tasks Pending", value: "17", icon: ClockIcon, color: "from-yellow-500 via-orange-400 to-amber-300" },
  ];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">Speedy Credit Repair Dashboard</h1>
        <p className="text-slate-300">Overview of your business performance</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl p-6 flex items-center space-x-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:scale-105 transition-transform hover:shadow-2xl"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)`,
            }}
          >
            <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color} text-white shadow-lg border border-white/30`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-300 font-medium">{stat.name}</p>
              <p className="text-xl font-semibold text-white drop-shadow">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Panel - Example Chart or Report */}
        <div className="rounded-2xl shadow-xl p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h2 className="text-lg font-bold text-white mb-4">Credit Repair Progress</h2>
          <div className="h-64 bg-gradient-to-tr from-blue-500/20 to-cyan-400/10 flex items-center justify-center text-slate-400 rounded-xl">
            Chart or graph goes here
          </div>
        </div>

        {/* Right Panel - Example Recent Activity */}
        <div className="rounded-2xl shadow-xl p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          <ul className="divide-y divide-white/10">
            <li className="py-3 flex justify-between">
              <span className="text-slate-200">New lead added</span>
              <span className="text-slate-400">2h ago</span>
            </li>
            <li className="py-3 flex justify-between">
              <span className="text-slate-200">Client file updated</span>
              <span className="text-slate-400">5h ago</span>
            </li>
            <li className="py-3 flex justify-between">
              <span className="text-slate-200">Monthly report generated</span>
              <span className="text-slate-400">1d ago</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Client Base Map Placeholder */}
        <div className="rounded-2xl shadow-xl p-6 bg-white/10 backdrop-blur-lg border border-white/20 flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MapIcon className="h-6 w-6" />Client Base Map</h2>
          <div className="h-64 w-full bg-gradient-to-tr from-emerald-500/20 to-blue-400/10 flex items-center justify-center text-slate-400 rounded-xl">
            [Map visualization placeholder]
          </div>
        </div>

        {/* Right Panel - Example Quick Actions */}
        <div className="rounded-2xl shadow-xl p-6 bg-white/10 backdrop-blur-lg border border-white/20 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 rounded-xl text-white font-semibold shadow-md bg-gradient-to-br from-blue-600 to-cyan-400 hover:scale-105 transition-transform">New Lead</button>
            <button className="px-4 py-2 rounded-xl text-white font-semibold shadow-md bg-gradient-to-br from-emerald-600 to-green-400 hover:scale-105 transition-transform">Run Credit Report</button>
            <button className="px-4 py-2 rounded-xl text-white font-semibold shadow-md bg-gradient-to-br from-purple-600 to-pink-400 hover:scale-105 transition-transform">Start Dispute</button>
          </div>
        </div>
      </div>
    </div>
  );
}
