import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Clients</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Hot Leads</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Disputes Won</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$45,231</p>
        </div>
      </div>
    </div>
  );
}