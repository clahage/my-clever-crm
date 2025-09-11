import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import DisputeLetterGenerator from '../components/DisputeLetterGenerator.jsx';

export default function DisputeLetters() {
  const [letters, setLetters] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    async function fetchLetters() {
      let q = collection(db, 'disputeLetters');
      if (filter !== 'all') {
        q = query(q, where('status', '==', filter));
      }
      const snapshot = await getDocs(q);
      setLetters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchLetters();
  }, [filter, showGenerator]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dispute Letters</h1>
      <div className="mb-4 flex gap-4 items-center">
        <button onClick={() => setShowGenerator(true)} className="px-4 py-2 bg-blue-600 text-white rounded font-bold shadow">Generate New Letter</button>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="response_pending">Response Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      {showGenerator && (
        <div className="mb-8">
          <DisputeLetterGenerator client={{}} />
          <button onClick={() => setShowGenerator(false)} className="mt-2 px-4 py-2 bg-gray-300 rounded">Close Generator</button>
        </div>
      )}
      <table className="w-full border rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Client</th>
            <th className="p-2">Type</th>
            <th className="p-2">Status</th>
            <th className="p-2">Sent</th>
            <th className="p-2">Deadline</th>
            <th className="p-2">Account</th>
            <th className="p-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {letters.map(l => (
            <tr key={l.id} className="border-t">
              <td className="p-2">{l.clientInfo?.name}</td>
              <td className="p-2">{l.templateType}</td>
              <td className="p-2 font-bold">{l.status}</td>
              <td className="p-2">{l.dateSent?.toDate ? l.dateSent.toDate().toLocaleDateString() : ''}</td>
              <td className="p-2">{l.responseDeadline?.toDate ? l.responseDeadline.toDate().toLocaleDateString() : ''}</td>
              <td className="p-2">{l.accountDetails?.creditor} #{l.accountDetails?.accountNumber}</td>
              <td className="p-2">{l.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
