
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Clients() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <p className="mb-4">This page is now managed via the Contacts page. Please use the Contacts tab for all client management.</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => navigate('/contacts?category=client')}>Go to Clients</button>
    </div>
  );
}
