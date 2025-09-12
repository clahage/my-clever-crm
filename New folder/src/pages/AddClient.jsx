import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../services/clientService';

export default function AddClient() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!form.name || !form.email) return 'Name and Email are required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Invalid email address.';
    return '';
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      setSuccess(false);
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await createClient(form);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', address: '' });
      setTimeout(() => navigate('/clients'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to add client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Add Client</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full px-3 py-2 border rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full px-3 py-2 border rounded" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full px-3 py-2 border rounded" />
        {error && <div className="text-red-500 font-semibold">{error}</div>}
        {success && <div className="text-green-600 font-semibold">Client added successfully!</div>}
        <div className="flex gap-4 mt-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-semibold" disabled={loading}>
            {loading ? 'Adding...' : 'Add Client'}
          </button>
          <button type="button" className="bg-gray-300 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-400 font-semibold" onClick={() => navigate('/clients')}>Back to Client List</button>
        </div>
      </form>
    </div>
  );
}
