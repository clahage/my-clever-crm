// scr-admin-vite/src/components/IdiqApiIntegration.jsx
import React, { useState } from 'react';
import Card from './ui/card'; // Relative path
import Button from './ui/button'; // Relative path

function IdiqApiIntegration() {
  const [apiKey, setApiKey] = useState('YOUR_IDIQ_API_KEY_PLACEHOLDER');
  const [apiStatus, setApiStatus] = useState('Disconnected');

  const connectApi = () => {
    setApiStatus('Connecting...');
    // Simulate API connection
    setTimeout(() => {
      if (apiKey && apiKey !== 'YOUR_IDIQ_API_KEY_PLACEHOLDER') {
        setApiStatus('Connected');
        alert('IDIQ API Connected! (Simulated)'); // Placeholder for real connection
      } else {
        setApiStatus('Failed: Invalid API Key');
        alert('Please enter a valid IDIQ API Key. (Simulated)');
      }
    }, 1500);
  };

  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <h3 className="text-xl font-semibold mb-4 text-center">IDIQ API Integration</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
        Connect to the IDIQ API for enhanced identity verification or credit monitoring services.
      </p>
      <div className="w-full mb-4">
        <label htmlFor="idiqApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          API Key
        </label>
        <input
          type="text"
          id="idiqApiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your IDIQ API Key"
        />
      </div>
      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          apiStatus === 'Connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          Status: {apiStatus}
        </span>
      </div>
      <Button onClick={connectApi}>
        {apiStatus === 'Connecting...' ? 'Connecting...' : 'Connect to IDIQ API'}
      </Button>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
        (Requires a valid IDIQ API key and subscription for full functionality.)
      </p>
    </Card>
  );
}

export default IdiqApiIntegration;