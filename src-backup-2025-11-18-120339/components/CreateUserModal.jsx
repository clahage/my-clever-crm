import React, { useState } from 'react';

const initialState = {
  email: '',
  displayName: '',
  password: '',
  role: 'user',
};

const roles = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
  { label: 'Master Admin', value: 'master' },
];

const CreateUserModal = ({ isOpen, onClose, onCreate, darkMode }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.email || !form.displayName || !form.password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    onCreate(form);
    setForm(initialState);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`rounded-xl p-6 shadow-2xl w-full max-w-md ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <h2 className="text-xl font-bold mb-4">Create New User</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="px-3 py-2 rounded border" />
          <input name="displayName" type="text" placeholder="Display Name" value={form.displayName} onChange={handleChange} className="px-3 py-2 rounded border" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="px-3 py-2 rounded border" />
          <select name="role" value={form.role} onChange={handleChange} className="px-3 py-2 rounded border">
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Create</button>
            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
