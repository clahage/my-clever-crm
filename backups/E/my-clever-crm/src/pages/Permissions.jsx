import React from 'react';

export default function Permissions() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">User Permissions</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Manage User Roles & Permissions</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Assign roles to users (Admin, Manager, Agent, Viewer)</li>
          <li>Set access levels for CRM features</li>
          <li>Enable/disable permissions for sensitive actions</li>
          <li>Audit user activity and permission changes</li>
        </ul>
        <p className="text-gray-700 mb-2">For advanced permission management, visit the <a href="/settings" className="text-blue-600 underline">Settings</a> page.</p>
      </div>
    </div>
  );
}
