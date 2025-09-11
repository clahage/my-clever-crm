import React from 'react';

export default function DripCampaign() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Drip Campaigns</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Automated Email & SMS Campaigns</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Create and manage drip campaigns for leads and clients</li>
          <li>Schedule automated follow-ups</li>
          <li>Track campaign performance and engagement</li>
          <li>Integrate with CRM contacts and segments</li>
        </ul>
        <p className="text-gray-700 mb-2">For advanced campaign settings, visit <a href="/settings" className="text-blue-600 underline">Settings</a>.</p>
      </div>
    </div>
  );
}
