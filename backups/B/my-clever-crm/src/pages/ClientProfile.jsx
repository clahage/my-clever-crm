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
    </div>
  );
}