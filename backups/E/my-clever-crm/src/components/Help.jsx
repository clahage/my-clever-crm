import React from 'react';

const faqs = [
  { q: 'How do I add a new client?', a: 'Go to Clients, click Add Client, and fill out the form.' },
  { q: 'How do I schedule an appointment?', a: 'Go to Calendar, click New Appointment, and select date/time.' },
  { q: 'How do I export data?', a: 'Go to Export, choose the data type, and click Export.' },
  { q: 'How do I manage user permissions?', a: 'Go to Admin Permissions to assign roles and access.' },
  { q: 'How do I start a drip campaign?', a: 'Go to Drip Campaigns, create a new campaign, and set automation rules.' },
];

export default function Help() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Help & FAQ</h1>
      <ul className="space-y-4">
        {faqs.map((faq, idx) => (
          <li key={idx} className="bg-white shadow rounded p-4">
            <strong className="block mb-2">Q: {faq.q}</strong>
            <span className="text-gray-700">A: {faq.a}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
