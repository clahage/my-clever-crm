import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const HotLeadsAlert = () => {
  const [hotLeads, setHotLeads] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'contacts'),
      where('category', '==', 'lead'),
      where('urgency', 'in', ['High', 'Critical']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Check for new hot leads
      if (leads.length > hotLeads.length) {
        setShowAlert(true);
        // Play sound if available
        const audio = new Audio('/sounds/alert.mp3');
        audio.play().catch(e => console.log('Audio blocked'));
      }
      setHotLeads(leads);
    });
    return () => unsubscribe();
  }, []);

  if (hotLeads.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      {hotLeads.slice(0, 3).map(lead => (
        <div key={lead.id} className="bg-red-500 text-white p-3 rounded-lg mb-2 shadow-lg animate-pulse">
          <div className="font-bold">🔥 HOT LEAD</div>
          <div>{lead.name || lead.firstName}</div>
          <div className="text-sm">Respond within 1 hour!</div>
        </div>
      ))}
    </div>
  );
};

export default HotLeadsAlert;
