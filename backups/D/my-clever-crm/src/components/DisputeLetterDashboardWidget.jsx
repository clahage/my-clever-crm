import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function DisputeLetterDashboardWidget() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'disputeLetters'), orderBy('createdAt', 'desc'), limit(5));
    const unsub = onSnapshot(q, (snapshot) => {
      setLetters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <span role="img" aria-label="letter">📄</span> Recent Dispute Letters
      </h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : letters.length === 0 ? (
        <div className="text-gray-500">No dispute letters found.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {letters.map(letter => (
            <li key={letter.id} className="py-2 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <span className="font-bold text-blue-700">{letter.clientName || 'Unknown Client'}</span>
                <span className="ml-2 text-gray-600">{letter.letterType || 'Custom'}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 md:mt-0">
                {letter.createdAt?.toDate ? letter.createdAt.toDate().toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-xs text-green-600 ml-2">{letter.status || 'Draft'}</div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 text-right">
        <a href="/dispute-letters" className="text-blue-600 hover:underline font-medium">View All</a>
      </div>
    </div>
  );
}
