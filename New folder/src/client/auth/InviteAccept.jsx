// Client Invite Accept Shell
import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

const InviteAccept = () => {
  const [invite, setInvite] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse inviteToken from URL
    const params = new URLSearchParams(location.search);
    const inviteToken = params.get('inviteToken');
    if (!inviteToken) {
      setError('Missing invite token.');
      return;
    }
    // Fetch invite doc from Firestore
    const fetchInvite = async () => {
      const db = getFirestore();
      const inviteRef = doc(db, 'invites', inviteToken);
      const snap = await getDoc(inviteRef);
      if (snap.exists()) {
        setInvite({ ...snap.data(), id: snap.id });
      } else {
        setError('Invalid or expired invite.');
      }
    };
    fetchInvite();
  }, [location.search]);

  const handleAccept = async (e) => {
    e.preventDefault();
    if (!invite) return;
    setLoading(true);
    setError('');
    try {
      const auth = getAuth();
      const userCred = await createUserWithEmailAndPassword(auth, invite.email, password);
      // Set user role in Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', userCred.user.uid), {
        email: invite.email,
        role: 'client',
        name: invite.name || '',
        createdAt: new Date()
      });
      // Link clientId to user
      await setDoc(doc(db, 'clients', userCred.user.uid), {
        userId: userCred.user.uid,
        email: invite.email,
        name: invite.name || ''
      });
      navigate('/client');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="max-w-md mx-auto mt-16 text-red-500">{error}</div>;
  if (!invite) return <div className="max-w-md mx-auto mt-16">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Accept Invitation</h2>
      <p className="mb-4">Welcome, {invite.name || invite.email}! Set your password to activate your account.</p>
      <form onSubmit={handleAccept}>
        <input
          type="password"
          className="w-full p-2 mb-2 border rounded"
          placeholder="Set Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
          {loading ? 'Activating...' : 'Activate Account'}
        </button>
      </form>
    </div>
  );
};

export default InviteAccept;
