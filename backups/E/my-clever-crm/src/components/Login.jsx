import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signIn, signInWithGoogle, loading, error, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('Login component rendered');
  }, []);

  if (user) {
    setTimeout(() => navigate('/clients'), 0);
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
    await signIn(form.email, form.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded" required />
          <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" className="w-full px-3 py-2 border rounded" required />
          {(formError || error) && <div className="text-red-500 font-semibold text-center">{formError || error}</div>}
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-semibold w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button type="button" className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 font-semibold w-full mt-2" onClick={() => signOut()}>
            Logout
          </button>
          <button type="button" className="bg-gray-100 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-200 font-semibold w-full mt-2" onClick={signInWithGoogle}>
            Sign in with Google
          </button>
          <button type="button" className="text-blue-600 underline mt-2 w-full" onClick={() => navigate('/register')}>Create Account</button>
        </form>
      </div>
    </div>
  );
}
