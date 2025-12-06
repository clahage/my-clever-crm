import React from 'react';

export default function Setup() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">System Setup</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Initial Configuration</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Connect your business email and phone</li>
          <li>Set up branding and logo</li>
          <li>Configure integrations (OpenAI, Google, etc.)</li>
          <li>Import initial client data</li>
        </ul>
        <p className="text-gray-700 mb-2">For help, visit <a href="/help" className="text-blue-600 underline">Help</a>.</p>
      </div>
    </div>
  );
}
