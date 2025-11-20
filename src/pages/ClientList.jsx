import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeClients } from '../services/clientService';

export default function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeClients(
      (data) => {
        setClients(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load clients');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    completed: clients.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 rounded-lg shadow p-6 text-center">
          <div className="text-lg font-semibold text-blue-700">Total Clients</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-green-100 rounded-lg shadow p-6 text-center">
          <div className="text-lg font-semibold text-green-700">Active Cases</div>
          <div className="text-3xl font-bold">{stats.active}</div>
        </div>
        <div className="bg-gray-100 rounded-lg shadow p-6 text-center">
          <div className="text-lg font-semibold text-gray-700">Completed</div>
          <div className="text-3xl font-bold">{stats.completed}</div>
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-semibold"
          onClick={() => navigate('/add-client')}
        >
          Add Contact
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Clients</h2>
        {loading ? (
          <div className="text-gray-500">Loading clients...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : clients.length === 0 ? (
          <div className="text-gray-500">No clients yet.</div>
        ) : (
          <ul>
            {clients.map(client => (
              <li key={client.id} className="border-b py-2 flex justify-between items-center">
                <div className="font-semibold">{client.name || 'No Name'}</div>
                <div className="text-sm text-gray-600">{client.email}</div>
                <div className="text-sm text-gray-600">{client.phone}</div>
                <button className="text-blue-600 underline text-sm mt-1" onClick={() => navigate(`/client/${client.id}`)}>View Profile</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
