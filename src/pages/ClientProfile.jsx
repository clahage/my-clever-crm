import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ClientProfile() {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Client Profile</h1>
      <button 
        onClick={() => navigate('/clients')} 
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Back to Clients
      </button>
      <p>Client profile details coming soon...</p>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Dispute Letters</h2>
        {/* Replace with actual client data integration as needed */}
        <div className="mb-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded font-bold shadow">Generate Dispute Letter</button>
        </div>
        {/* Optionally, show dispute letter history for this client here */}
      </div>
    </div>
  );
}