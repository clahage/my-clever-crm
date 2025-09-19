import React from 'react';

export default function Reports() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Reports & Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Monthly Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>New Clients:</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between">
              <span>Disputes Filed:</span>
              <span className="font-bold">48</span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate:</span>
              <span className="font-bold text-green-600">78%</span>
            </div>
            <div className="flex justify-between">
              <span>Revenue:</span>
              <span className="font-bold">$18,450</span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Client Satisfaction:</span>
              <span className="font-bold">4.8/5.0</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Resolution Time:</span>
              <span className="font-bold">45 days</span>
            </div>
            <div className="flex justify-between">
              <span>Active Disputes:</span>
              <span className="font-bold">23</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import TopNav from "../layout/TopNav";
import SkinSwitcher from "../skins/SkinSwitcher";

export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Placeholder page. Add charts and export actions here.
        </p>
      </main>
      <SkinSwitcher />
    </div>
  );
}
// Removed duplicate default export
// No duplicate imports found.
// No unused variables found in the visible code.
// No useless catch blocks found in the visible code.
// No react-hooks/exhaustive-deps issues in the visible code.
