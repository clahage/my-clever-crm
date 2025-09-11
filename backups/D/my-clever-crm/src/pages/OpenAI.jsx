import React from 'react';

export default function OpenAI() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">AI Integration Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">OpenAI & AI Tools</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Connect your OpenAI API key</li>
          <li>Configure AI-powered lead scoring</li>
          <li>Enable AI chat and support features</li>
          <li>Review AI usage analytics</li>
        </ul>
        <p className="text-gray-700 mb-2">For more information, visit <a href="https://platform.openai.com" className="text-blue-600 underline">OpenAI Platform</a>.</p>
      </div>
    </div>
  );
}
