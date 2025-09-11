
import React from "react";
import { BarChart, Users, CheckCircle, Search, Filter } from "lucide-react";

const mockStats = [
  { label: "Active Clients", value: 42, icon: <Users className="w-6 h-6 text-blue-600" /> },
  { label: "Disputes Resolved", value: 128, icon: <CheckCircle className="w-6 h-6 text-green-600" /> },
  { label: "Avg. Progress", value: "78%", icon: <BarChart className="w-6 h-6 text-purple-600" /> },
];

const mockProgress = [
  { name: "John Doe", status: "In Progress", percent: 65 },
  { name: "Jane Smith", status: "Completed", percent: 100 },
  { name: "Sam Lee", status: "In Progress", percent: 80 },
  { name: "Alex Kim", status: "Review", percent: 90 },
];

function ProgressPortal() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Progress Portal</h1>
          <p className="text-gray-500 mt-1">Track client progress and dispute resolution status.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Search className="w-5 h-5 mr-2" /> Search
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
            <Filter className="w-5 h-5 mr-2" /> Filter
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {mockStats.map((stat) => (
          <div key={stat.label} className="bg-white shadow rounded-lg p-6 flex items-center gap-4">
            {stat.icon}
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Client Progress</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Client</th>
              <th className="py-2">Status</th>
              <th className="py-2">Progress</th>
            </tr>
          </thead>
          <tbody>
            {mockProgress.map((row) => (
              <tr key={row.name} className="border-b hover:bg-gray-50">
                <td className="py-2 font-medium">{row.name}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${row.status === "Completed" ? "bg-green-100 text-green-700" : row.status === "Review" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{row.status}</span>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${row.percent}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-700">{row.percent}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProgressPortal;