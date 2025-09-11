import React from 'react';
import { Link } from 'react-router-dom';


const metrics = [
  { label: "Total Clients", value: 128, icon: "👥", color: "bg-blue-100 text-blue-700" },
  { label: "Active Disputes", value: 34, icon: "⚡", color: "bg-yellow-100 text-yellow-700" },
  { label: "Success Rate", value: "92%", icon: "✅", color: "bg-green-100 text-green-700" },
  { label: "Monthly Revenue", value: "$12,400", icon: "💰", color: "bg-purple-100 text-purple-700" },
];

const recentActivity = [
  { id: 1, type: "Dispute Created", client: "John Doe", date: "2025-08-14", status: "Open" },
  { id: 2, type: "Client Added", client: "Jane Smith", date: "2025-08-13", status: "Active" },
  { id: 3, type: "Dispute Resolved", client: "Carlos Ruiz", date: "2025-08-12", status: "Resolved" },
  { id: 4, type: "Payment Received", client: "Emily Chen", date: "2025-08-11", status: "Completed" },
];

const quickActions = [
  // Step 1-4: Update Quick Action routes to match App.jsx
  { label: "Add Client", href: "/contacts", color: "bg-blue-600" },
  { label: "New Dispute", href: "/dispute-center", color: "bg-yellow-500" },
  { label: "Generate Report", href: "/analytics", color: "bg-green-600" },
  { label: "Send Letter", href: "/letters", color: "bg-purple-600" },
];

export default function Dashboard() {
  // Debug: log when Dashboard loads
  React.useEffect(() => {
    console.log('Dashboard component loaded');
  }, []);
  // Step 6: Add console logging for Quick Action navigation
  function handleQuickActionClick(label, href) {
    console.log(`Quick Action clicked: ${label}, route: ${href}`);
  }
  try {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <main className="mx-auto max-w-4xl px-6 py-10">
          <h1 className="text-3xl font-bold mb-4">Welcome to Speedy Credit Repair CRM</h1>
          <p className="mb-8 text-lg text-gray-700">Your business hub for managing clients, disputes, and revenue.</p>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {metrics.map((m) => (
              <div key={m.label} className={`rounded-lg border bg-white p-5 flex items-center gap-3 ${m.color}`}>
                <span className="text-3xl">{m.icon}</span>
                <div>
                  <div className="text-xl font-bold text-gray-900">{m.value}</div>
                  <div className="text-sm font-medium text-gray-600">{m.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className={`px-5 py-2 rounded-md text-white font-semibold shadow hover:opacity-90 transition ${action.color}`}
                  style={{ minWidth: 120, textAlign: "center" }}
                  onClick={() => handleQuickActionClick(action.label, action.href)}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Recent Activity</h2>
            <div className="bg-white rounded-lg border shadow p-4 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-3 font-bold text-gray-700">Type</th>
                    <th className="py-2 px-3 font-bold text-gray-700">Client</th>
                    <th className="py-2 px-3 font-bold text-gray-700">Date</th>
                    <th className="py-2 px-3 font-bold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item) => (
                    <tr key={item.id} className="border-b last:border-none">
                      <td className="py-2 px-3 text-gray-900">{item.type}</td>
                      <td className="py-2 px-3 text-gray-900">{item.client}</td>
                      <td className="py-2 px-3 text-gray-900">{item.date}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (err) {
    console.error('Dashboard render error:', err);
    return <div className="p-6 text-red-600">Dashboard failed to load.</div>;
  }
}
