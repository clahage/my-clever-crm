import React from 'react';

export default function Help() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Help & Support</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">How can we help you?</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Getting started with SpeedyCRM</li>
          <li>Managing your clients and contacts</li>
          <li>Using leads and prospects features</li>
          <li>Understanding analytics and reports</li>
          <li>Billing and account management</li>
          <li>Contacting support</li>
        </ul>
        <p className="text-gray-700 mb-2">For more detailed documentation, visit our <a href="https://speedycrm.help" className="text-blue-600 underline">Help Center</a>.</p>
        <p className="text-gray-700">If you need further assistance, please email <a href="mailto:support@speedycrm.com" className="text-blue-600 underline">support@speedycrm.com</a>.</p>
      </div>
    </div>
  );
}
