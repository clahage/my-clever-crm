import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClient, updateClient } from '../services/clientService';

export default function EditClient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchClient() {
      setLoading(true);
      try {
        const data = await getClient(id);
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      } catch (err) {
        setError('Failed to load client.');
      } finally {
        setLoading(false);
      }
    }
    fetchClient();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await updateClient(id, form);
      setSuccess(true);
      setTimeout(() => navigate('/clients'), 1200);
    } catch (err) {
      setError('Failed to update client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Client</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full px-3 py-2 border rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full px-3 py-2 border rounded" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full px-3 py-2 border rounded" />
        {error && <div className="text-red-500 font-semibold">{error}</div>}
        {success && <div className="text-green-600 font-semibold">Client updated successfully!</div>}
        <div className="flex gap-4 mt-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-semibold" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="bg-gray-300 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-400 font-semibold" onClick={() => navigate('/clients')}>
            Back to Client List
          </button>
        </div>
      </form>
    </div>
  );
}
