import React from 'react';

export default function Administration() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Controls & System Settings</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Manage users and roles</li>
          <li>Audit system activity</li>
          <li>Configure business settings</li>
          <li>Access advanced admin features</li>
        </ul>
        <p className="text-gray-700 mb-2">For user management, visit <a href="/permissions" className="text-blue-600 underline">Permissions</a>.</p>
      </div>
    </div>
  );
}
