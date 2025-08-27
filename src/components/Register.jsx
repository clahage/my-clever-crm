import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { signUp, loading, error, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  if (user) {
    navigate('/clients');
    return null;
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setFormError('Email and password are required.');
      return;
    }
    await signUp(form.email, form.password);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" className="w-full px-3 py-2 border rounded" required />
        {(formError || error) && <div className="text-red-500 font-semibold">{formError || error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-semibold w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <button type="button" className="text-blue-600 underline mt-2" onClick={() => navigate('/login')}>Back to Login</button>
      </form>
    </div>
  );
}
