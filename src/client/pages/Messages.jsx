// Client Messages Shell
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Messages = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const fetchThreads = async () => {
      const q = query(collection(db, 'messages'), where('participants', 'array-contains', user.uid));
      const snap = await getDocs(q);
      setThreads(snap.docs.map(d => d.data()));
      setLoading(false);
    };
    fetchThreads();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      {threads.length === 0 ? <div>No messages found.</div> : (
        <ul>
          {threads.map((t, i) => (
            <li key={i} className="mb-2">
              <span className="font-semibold">{t.subject || 'Thread'}:</span> {t.lastMessage || 'No messages'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Messages;
