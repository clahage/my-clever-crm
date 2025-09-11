import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to sign in with Google');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ type: 'success', text: 'Password reset email sent!' });
      setTimeout(() => {
        setShowResetForm(false);
        setResetEmail('');
        setResetMessage(null);
      }, 3000);
    } catch (error) {
      setResetMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {!showResetForm ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Password"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowResetForm(true)}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Forgot password?
              </button>
            </div>

            <div className="my-4 text-center text-gray-500">Or</div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign in with Google
            </button>
          </>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
            {resetMessage && (
              <div className={`mb-3 p-2 rounded ${
                resetMessage.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {resetMessage.text}
              </div>
            )}
            <form onSubmit={handlePasswordReset}>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded mb-3"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(false);
                    setResetEmail('');
                    setResetMessage(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;