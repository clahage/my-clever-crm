import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

function getScoreColor(score) {
  if (score >= 8) return 'border-green-500 bg-green-50';
  if (score >= 5) return 'border-blue-500 bg-blue-50';
  return 'border-gray-400 bg-gray-50';
}

function getActivityIcons(call) {
  const icons = [];
  icons.push(<span key="phone" title="Call" className="mr-1">📞</span>);
  if (call.leadScore >= 8) icons.push(<span key="star" title="High Score" className="mr-1">⭐</span>);
  if (call.texts_sent && call.texts_sent.length > 0) icons.push(<span key="msg" title="Texts Sent" className="mr-1">💬</span>);
  return icons;
}

function timeSince(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function AIActivityFeed() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    const callsRef = collection(db, 'aiReceptionistCalls');
    const q = query(callsRef, orderBy('processedAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arr = [];
      snapshot.forEach(doc => {
        arr.push({ id: doc.id, ...doc.data() });
      });
      setCalls(arr);
      setLoading(false);
    }, (err) => {
      setError('Error loading activity feed');
      setLoading(false);
    });
    // Live timestamp update
    const interval = setInterval(() => setCalls(calls => [...calls]), 60000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-300 max-h-[500px] overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">🤖 AI Receptionist Activity</h2>
      {loading && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
        </div>
      )}
      {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}
      {!loading && calls.length === 0 && (
        <div className="text-gray-500 text-center py-8">No recent AI activity.</div>
      )}
      <ul className="space-y-4 flex flex-col-reverse">
        {calls.map(call => (
          <li key={call.id} className={`border-l-4 p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer ${getScoreColor(call.leadScore)}`}
              onClick={() => setSelected(call)}>
            <div className="flex-1">
              <div className="flex items-center mb-1">{getActivityIcons(call)}<span className="font-semibold text-lg">{call.username || call.firstName || 'Unknown'} <span className="text-gray-500">({call.phone})</span></span></div>
              <div className="text-sm text-gray-700">Score: <span className="font-bold">{call.leadScore}</span> | Duration: {call.duration}s</div>
              <div className="text-sm text-gray-700">Summary: {call.summary || 'No summary'}</div>
              <div className="text-xs text-gray-500">{timeSince(call.processedAt || call.timestamp)}</div>
            </div>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-auto relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setSelected(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-2">Full Transcript</h3>
            <div className="mb-2 text-sm text-gray-700"><span className="font-semibold">Caller:</span> {selected.username || selected.firstName || 'Unknown'} ({selected.phone})</div>
            <div className="mb-2 text-sm text-gray-700"><span className="font-semibold">Duration:</span> {selected.duration}s</div>
            <div className="mb-2 text-sm text-gray-700"><span className="font-semibold">Score:</span> {selected.leadScore}</div>
            <div className="mb-2 text-sm text-gray-700"><span className="font-semibold">Summary:</span> {selected.summary || 'No summary'}</div>
            <div className="mb-2 text-sm text-gray-700"><span className="font-semibold">Pain Points:</span> {selected.painPoints && selected.painPoints.length > 0 ? selected.painPoints.join(', ') : 'None'}</div>
            <div className="mb-2 text-sm text-gray-700"><span className="font-semibold">Transcript:</span></div>
            <div className="bg-gray-100 rounded p-2 text-xs whitespace-pre-line max-h-64 overflow-y-auto">{selected.transcript || 'No transcript available.'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
