// Client Disputes Shell
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';

const Disputes = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const fetchDisputes = async () => {
      const q = query(collection(db, 'clients', user.uid, 'disputes'));
      const snap = await getDocs(q);
      setDisputes(snap.docs.map(d => d.data()));
      setLoading(false);
    };
    fetchDisputes();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dispute Center</h1>
      {disputes.length === 0 ? <div>No disputes found.</div> : (
        <ul>
          {disputes.map((d, i) => (
            <li key={i} className="mb-2">
              <span className="font-semibold">{d.subject || 'Dispute'}:</span> {d.status || 'Unknown'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Disputes;
