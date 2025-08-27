import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AddClient() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', status: 'active' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!form.firstName || !form.lastName || !form.email) return 'First name, last name, and email are required.';
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
      await addDoc(collection(db, 'contacts'), {
        ...form,
        name: `${form.firstName} ${form.lastName}`,
        category: 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setSuccess(true);
      setForm({ firstName: '', lastName: '', email: '', phone: '', status: 'active' });
      setTimeout(() => navigate('/contacts?category=client'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to add client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Add Client</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              required
              value={form.firstName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              required
              value={form.lastName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>
        {error && <div className="text-red-500 font-semibold mt-4">{error}</div>}
        {success && <div className="text-green-600 font-semibold mt-4">Client added successfully!</div>}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Client'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/contacts?category=client')}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
