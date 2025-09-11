// Client Profile Shell
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const fetchProfile = async () => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      setProfile(snap.exists() ? snap.data() : null);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found.</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-2"><span className="font-semibold">Name:</span> {profile.name || 'N/A'}</div>
      <div className="mb-2"><span className="font-semibold">Email:</span> {profile.email || 'N/A'}</div>
      <div className="mb-2"><span className="font-semibold">Role:</span> {profile.role || 'N/A'}</div>
      {/* Add more settings/preferences as needed */}
    </div>
  );
};

export default Profile;
