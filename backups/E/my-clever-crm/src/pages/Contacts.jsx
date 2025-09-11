import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeClients } from '../services/clientService';

export default function Contacts() {
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
        setError(err.message || 'Failed to load contacts');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'Active').length,
    inactive: clients.filter(c => c.status === 'Inactive').length,
    prospects: clients.filter(c => c.status === 'Prospect').length,
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 rounded-lg shadow p-6 text-center">
          <div className="text-lg font-semibold text-blue-700">Total</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-green-100 rounded-lg shadow p-6 text-center">
          <div className="text-lg font-semibold text-green-700">Active</div>
          <div className="text-3xl font-bold">{stats.active}</div>
        </div>
        <div className="bg-gray-100 rounded-lg shadow p-6 text-center">
          <div className="text-lg font-semibold text-gray-700">Inactive</div>
          <div className="text-3xl font-bold">{stats.inactive}</div>
        </div>
        <div className="bg-purple-100 rounded-lg shadow p-6 text-center">
          <div className="text-lg font-semibold text-purple-700">Prospects</div>
          <div className="text-3xl font-bold">{stats.prospects}</div>
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <button className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-semibold" onClick={() => navigate('/add-client')}>Add New Contact</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <p className="text-gray-500">Loading contacts...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : clients.length > 0 ? (
          <ul>
            {clients.map(client => (
              <li key={client.id} className="border-b py-2">
                <div className="font-semibold">{client.name || 'No Name'}</div>
                <div className="text-sm text-gray-600">{client.email}</div>
                <div className="text-sm text-gray-600">{client.phone}</div>
                <button className="text-blue-600 underline text-sm mt-1" onClick={() => navigate(`/client/${client.id}`)}>View Profile</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No contacts found.</p>
        )}
      </div>
    </div>
  );
}