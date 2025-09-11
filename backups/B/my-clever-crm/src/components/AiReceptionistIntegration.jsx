// scr-admin-vite/src/components/AiReceptionistIntegration.jsx
import React, { useState } from 'react';
import Card from './ui/card'; // Relative path
import Button from './ui/button'; // Relative path

function AiReceptionistIntegration() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState("Offline");

  const toggleAi = () => {
    setIsEnabled(!isEnabled);
    setAiStatus(isEnabled ? "Offline" : "Online & Active");
    console.log(`AI Receptionist toggled to: ${isEnabled ? 'Disabled' : 'Enabled'}`);
  };

  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <h3 className="text-xl font-semibold mb-4 text-center">AI Receptionist Integration</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
        Integrate and manage your AI-powered virtual receptionist for automated lead qualification and client communication.
      </p>
      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          Status: {aiStatus}
        </span>
      </div>
      <Button onClick={toggleAi}>
        {isEnabled ? 'Disable AI Receptionist' : 'Enable AI Receptionist'}
      </Button>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
        (Future integration with AI models for natural language processing and automated responses.)
      </p>
    </Card>
  );
}

export default AiReceptionistIntegration;