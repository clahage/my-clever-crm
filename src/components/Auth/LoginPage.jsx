import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = ({ onLogin }) => {
  const { signInWithGoogle, loading: googleLoading, error: googleError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log('Login successful:', userCredential.user);
      // Navigation will be handled by auth state listener
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fa'}}>
      <div style={{background: '#fff', padding: 36, borderRadius: 10, boxShadow: '0 2px 16px #aaa', minWidth: 340}}>
        <h2 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 18}}>Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div style={{marginBottom: 16}}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 16}}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          {error && <div style={{color: '#d32f2f', marginBottom: 10}}>{error}</div>}
          <button type="submit" disabled={loading} style={{width: '100%', padding: '10px 0', fontSize: 17, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer'}}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        {/* Google Sign-in Button */}
        <div style={{marginTop: 18, textAlign: 'center'}}>
          <button
            onClick={signInWithGoogle}
            disabled={googleLoading}
            style={{
              width: '100%',
              padding: '10px 0',
              fontSize: 17,
              background: '#fff',
              color: '#444',
              border: '1px solid #ccc',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{width: 22, height: 22, marginRight: 8}} />
            {googleLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          {googleError && <div style={{color: '#d32f2f', marginTop: 10}}>{googleError}</div>}
        </div>
        </form>
        {/* Removed Test Direct Login button as requested */}
        <div style={{marginTop: 18, textAlign: 'right'}}>
          <a href="#" style={{color: '#1976d2', textDecoration: 'underline', fontSize: 15}}>Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
