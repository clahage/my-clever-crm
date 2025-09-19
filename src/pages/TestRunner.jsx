import React, { useState } from 'react';
import { generateTestSocialData } from '../utils/testSocialMedia';
import { useNavigate } from 'react-router-dom';

export default function TestRunner() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const runTest = async () => {
    setLoading(true);
    try {
      const testResults = await generateTestSocialData();
      setResults(testResults);
      setTimeout(() => navigate('/social-admin'), 3000);
    } catch (error) {
      console.error('Test failed:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Social Media Test Data Generator</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          This will create sample social media messages and AI responses for testing.
        </p>
        <button
          onClick={runTest}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-medium ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Generating...' : 'Generate Test Data'}
        </button>
        {results && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Results:</h3>
            {results.error ? (
              <p className="text-red-600">Error: {results.error}</p>
            ) : (
              <>
                <p className="text-green-600">✅ {results.requests?.length || 0} requests created</p>
                <p className="text-blue-600">📝 {results.responses?.length || 0} AI responses</p>
                <p className="mt-3 text-gray-600">Redirecting to Social Admin...</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
