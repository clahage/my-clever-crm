import React from "react";
import { ChartBarIcon, UsersIcon, CurrencyDollarIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function ModernDashboard() {
  const stats = [
    { name: "Active Clients", value: "132", icon: UsersIcon, color: "bg-blue-500" },
    { name: "Revenue (This Month)", value: "$24,300", icon: CurrencyDollarIcon, color: "bg-green-500" },
    { name: "Leads Generated", value: "89", icon: ChartBarIcon, color: "bg-purple-500" },
    { name: "Tasks Pending", value: "17", icon: ClockIcon, color: "bg-orange-500" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Speedy Credit Repair Dashboard</h1>
        <p className="text-gray-600">Overview of your business performance</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow"
          >
            <div className={`p-3 rounded-full ${stat.color} text-white`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Example Chart or Report */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Credit Repair Progress</h2>
          <div className="h-64 bg-gray-50 flex items-center justify-center text-gray-400">
            Chart or graph goes here
          </div>
        </div>

        {/* Right Panel - Example Recent Activity */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <ul className="divide-y divide-gray-200">
            <li className="py-3 flex justify-between">
              <span>New lead added</span>
              <span className="text-gray-500">2h ago</span>
            </li>
            <li className="py-3 flex justify-between">
              <span>Client file updated</span>
              <span className="text-gray-500">5h ago</span>
            </li>
            <li className="py-3 flex justify-between">
              <span>Monthly report generated</span>
              <span className="text-gray-500">1d ago</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
