import React, { useState } from 'react';

export default function EmailParserModal({ isOpen, onClose, onParse }) {
  const [emailText, setEmailText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [batchEmails, setBatchEmails] = useState('');

  function parseEmail(text) {
    // Simple template recognition and parsing
    const nameMatch = text.match(/Name:\s*(.*)/i);
    const phoneMatch = text.match(/Phone:\s*([\d\-() ]+)/i);
    const summaryMatch = text.match(/Summary:\s*(.*)/i);
    const urgencyMatch = text.match(/Urgency:\s*(.*)/i);
    return {
      firstName: nameMatch ? nameMatch[1].split(' ')[0] : '',
      lastName: nameMatch ? nameMatch[1].split(' ').slice(1).join(' ') : '',
      phone: phoneMatch ? phoneMatch[1] : '',
      conversationSummary: summaryMatch ? summaryMatch[1] : '',
      urgencyLevel: urgencyMatch ? urgencyMatch[1] : '',
    };
  }

  function handleParse() {
    const result = parseEmail(emailText);
    setParsed(result);
    if (onParse) onParse(result);
  }

  function handleBatchParse() {
    const emails = batchEmails.split(/\n\n+/);
    const results = emails.map(parseEmail);
    setParsed(results);
    if (onParse) onParse(results);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Email Parser</h2>
        <textarea value={emailText} onChange={e => setEmailText(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" rows={6} placeholder="Paste AI Receptionist email here..." />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleParse}>Parse Email</button>
        <div className="mt-4">
          <h3 className="font-semibold">Batch Email Parse</h3>
          <textarea value={batchEmails} onChange={e => setBatchEmails(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" rows={4} placeholder="Paste multiple emails separated by blank lines..." />
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleBatchParse}>Parse Batch</button>
        </div>
        {parsed && (
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <pre>{JSON.stringify(parsed, null, 2)}</pre>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}