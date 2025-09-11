import React, { useState } from 'react';

export default function AICommandCenter() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulated response for now
    setTimeout(() => {
      setResponse(`AI Response: Processing "${query}" - Full OpenAI integration coming soon.`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Command Center</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter your query:</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows="4"
              placeholder="Ask the AI assistant anything..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Send to AI'}
          </button>
        </form>
      </div>

      {response && (
        <div className="bg-gray-50 rounded-lg shadow p-6">
          <h2 className="font-semibold mb-2">AI Response:</h2>
          <p className="text-gray-700">{response}</p>
        </div>
      )}

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> OpenAI integration is configured. Full AI features will be enabled once the service connections are verified.
        </p>
      </div>
    </div>
  );
}
