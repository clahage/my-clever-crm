import { useEffect, useState, useRef, useCallback } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, startAfter, onSnapshot, getDocs } from 'firebase/firestore';

const PAGE_SIZE = 25;

function useRealtimeLeads({ search, filter }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const unsubRef = useRef(null);

  // Initial load (realtime for first page)
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    unsubRef.current = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(docs);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
      setLoading(false);
    }, (err) => {
      setError('Failed to load leads.');
      setLoading(false);
    });
    return () => unsubRef.current && unsubRef.current();
  }, [search, filter]); // Reset on search/filter change

  // Load more (not realtime)
  const loadMore = useCallback(async () => {
    if (!lastDoc) return;
    setLoading(true);
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
    const snap = await getDocs(q);
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLeads(prev => [...prev, ...docs]);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setHasMore(snap.docs.length === PAGE_SIZE);
    setLoading(false);
  }, [lastDoc]);

  return { leads, loading, error, loadMore, hasMore };
}

export { useRealtimeLeads };
export default useRealtimeLeads;
