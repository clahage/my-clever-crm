import { useEffect, useState, useRef, useCallback } from 'react';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, getDocs, query, where } from 'firebase/firestore';

function useRealtimeLeads({ search, filter }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [liveMode, setLiveMode] = useState(true);
  const [liveError, setLiveError] = useState(false);
  const unsubRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Manual direct read for debugging
  const manualReadLeads = async () => {
    try {
      const snap = await getDocs(collection(db, 'leads'));
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Only log errors, not data
    } catch (err) {
      console.error('[useRealtimeLeads] Manual read error:', err);
    }
  };

  // Manual refresh function
  const refreshLeads = useCallback(async () => {
    setLoading(true);
    try {
      const q = collection(db, 'leads');
      const snap = await getDocs(q);
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(docs);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(true);
      setError('');
      setLiveError(false);
      setLiveMode(false);
    } catch (err) {
      setError('Failed to manually refresh leads.');
      setLiveError(true);
      setLiveMode(false);
      console.error('[useRealtimeLeads] Manual refresh error:', err);
    }
    setLoading(false);
  }, []);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(async () => {
      try {
        const q = collection(db, 'leads');
        const snap = await getDocs(q);
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeads(docs);
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(true);
        setError('');
      } catch (err) {
        setError('Polling failed.');
        console.error('[useRealtimeLeads] Polling error:', err);
      }
    }, 5000);
    setLiveMode(false);
    setLiveError(true);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Try to enable live mode
  const tryLiveMode = useCallback(() => {
    setLiveMode(true);
    setLiveError(false);
    stopPolling();
    refreshLeads(); // Immediate refresh
  }, [stopPolling, refreshLeads]);

  // Initial load (realtime for first page)
  useEffect(() => {
    setLoading(true);
    console.log('Leads query: filtering for category = lead');
    const q = query(
      collection(db, 'contacts'),
      where('category', '==', 'lead')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(docs);
      setLoading(false);
      setError('');
      setLiveError(false);
      setLiveMode(true);
    }, (err) => {
      setError('Failed to load leads (onSnapshot).');
      setLoading(false);
      setLiveError(true);
      setLiveMode(false);
      console.error('[useRealtimeLeads] Error in onSnapshot:', err);
    });
    return () => unsubscribe();
  }, [search, filter]); // Reset on search/filter change

  // Load more (not realtime)
  const loadMore = useCallback(async () => {
    if (!lastDoc) return;
    setLoading(true);
    const q = collection(db, 'leads');
    const snap = await getDocs(q);
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLeads(prev => [...prev, ...docs]);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setHasMore(true);
    setLoading(false);
  }, [lastDoc]);

  return { leads, loading, error, loadMore, hasMore, refreshLeads, manualReadLeads, liveMode, liveError, tryLiveMode };
}

export { useRealtimeLeads };
export default useRealtimeLeads;
