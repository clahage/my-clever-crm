import { useEffect, useState, useRef, useCallback } from 'react';
import { db } from "../lib/firebase"; // Fixed import path from @/lib/firebase
import { collection, query, orderBy, limit, startAfter, onSnapshot, getDocs, where } from 'firebase/firestore';

const PAGE_SIZE = 25;

function useRealtimeLeads({ search, filter, hotLeadsOnly = false }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const unsubRef = useRef(null);

  // Initial load (realtime for first page)
  useEffect(() => {
    setLoading(true);
    
    // Build query based on requirements
    let q;
    if (hotLeadsOnly) {
      // For hot leads widget, query aiReceptionistCalls with high scores
      q = query(
        collection(db, 'aiReceptionistCalls'), 
        orderBy('timestamp', 'desc'),
        limit(PAGE_SIZE)
      );
    } else {
      // For regular leads page
      q = query(
        collection(db, 'contacts'),
        where('type', '==', 'Lead'),
        orderBy('createdAt', 'desc'), 
        limit(PAGE_SIZE)
      );
    }

    unsubRef.current = onSnapshot(
      q, 
      (snap) => {
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter for hot leads if needed (score >= 8)
        let filteredDocs = docs;
        if (hotLeadsOnly) {
          filteredDocs = docs.filter(doc => {
            const score = doc.leadScore || doc.score || 0;
            return score >= 8;
          });
        }
        
        setLeads(filteredDocs);
        setLastDoc(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.docs.length === PAGE_SIZE);
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error('Realtime leads error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
      }
    };
  }, [search, filter, hotLeadsOnly]);

  // Load more (non-realtime for subsequent pages)
  const loadMore = useCallback(async () => {
    if (!lastDoc || !hasMore) return;
    
    try {
      let q;
      if (hotLeadsOnly) {
        q = query(
          collection(db, 'aiReceptionistCalls'),
          orderBy('timestamp', 'desc'),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(
          collection(db, 'contacts'),
          where('type', '==', 'Lead'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }
      
      const snap = await getDocs(q);
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for hot leads if needed
      let filteredDocs = docs;
      if (hotLeadsOnly) {
        filteredDocs = docs.filter(doc => {
          const score = doc.leadScore || doc.score || 0;
          return score >= 8;
        });
      }
      
      setLeads(prev => [...prev, ...filteredDocs]);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error('Load more error:', err);
      setError(err.message);
    }
  }, [lastDoc, hasMore, hotLeadsOnly]);

  // Reset on search/filter change
  useEffect(() => {
    setLeads([]);
    setLastDoc(null);
    setHasMore(true);
  }, [search, filter]);

  return { 
    leads, 
    loading, 
    error, 
    loadMore, 
    hasMore,
    hotLeads: leads // For compatibility with existing components
  };
}

export default useRealtimeLeads;