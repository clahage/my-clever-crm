import { useEffect, useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function useRealtimeLeads() {
  const [hotLeads, setHotLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const callsRef = collection(db, 'aiReceptionistCalls');
    const q = query(callsRef, where('leadScore', '>=', 8), orderBy('processedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leads = [];
      snapshot.forEach(doc => {
        leads.push({ id: doc.id, ...doc.data() });
      });
      setHotLeads(leads);
      setLoading(false);
    }, (err) => {
      setError('Error loading hot leads');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { hotLeads, loading, error };
}
