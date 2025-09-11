import React, { useState, useEffect } from 'react';

const roles = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
  { label: 'Master Admin', value: 'master' },
];

const EditUserModal = ({ isOpen, onClose, user, onUpdate, darkMode }) => {
  const [form, setForm] = useState({ ...user });
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({ ...user });
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.email || !form.displayName) {
      setError('Email and Display Name are required.');
      return;
    }
    setError('');
    onUpdate(form);
  };

  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`rounded-xl p-6 shadow-2xl w-full max-w-md ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="px-3 py-2 rounded border" />
          <input name="displayName" type="text" placeholder="Display Name" value={form.displayName} onChange={handleChange} className="px-3 py-2 rounded border" />
          <select name="role" value={form.role} onChange={handleChange} className="px-3 py-2 rounded border">
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Update</button>
            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
