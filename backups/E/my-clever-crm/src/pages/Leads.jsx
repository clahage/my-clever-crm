
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeClients } from '../services/clientService';

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeClients(
      (data) => {
        // Only show clients with status 'Lead' or 'New' (customize as needed)
        setLeads(data.filter(c => c.status === 'Lead' || c.status === 'New'));
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load leads');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Leads</h1>
      <div className="flex justify-end mb-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-semibold" onClick={() => navigate('/add-client')}>Add New Lead</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : leads.length > 0 ? (
          <ul>
            {leads.map(lead => (
              <li key={lead.id} className="border-b py-2">
                <div className="font-semibold">{lead.name || 'No Name'}</div>
                <div className="text-sm text-gray-600">{lead.email}</div>
                <div className="text-sm text-gray-600">{lead.phone}</div>
                <button className="text-blue-600 underline text-sm mt-1" onClick={() => navigate(`/client/${lead.id}`)}>View Profile</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No leads found.</p>
        )}
      </div>
    </div>
  );
}

// Removed duplicate/invalid JSX and extra default export


