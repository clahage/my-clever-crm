

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Leads() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leads</h1>
      <p className="mb-4">This page is now managed via the Contacts page. Please use the Contacts tab for all lead management.</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => navigate('/contacts?category=lead')}>Go to Leads</button>
    </div>
  );
}
                  <td className="border px-2 py-1">

                    <button className="text-blue-600 underline text-sm" onClick={() => navigate(`/client/${lead.id}`)}>View Profile</button>

