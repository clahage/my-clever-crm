import React, { useEffect } from 'react';
import useRealtimeLeads from '../hooks/useRealtimeLeads';

function getUrgencyColor(urgency) {
  if (urgency === 'high') return 'bg-red-100 border-red-500 text-red-700';
  if (urgency === 'medium') return 'bg-orange-100 border-orange-500 text-orange-700';
  return 'bg-yellow-100 border-yellow-500 text-yellow-700';
}

function timeSince(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function HotLeadsWidget() {
  const { hotLeads, loading, error } = useRealtimeLeads();

  useEffect(() => {
    const interval = setInterval(() => {
      // This will trigger a re-render via the hook's real-time listener
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-blue-300">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">🔥 Hot Leads (Score ≥ 8)</h2>
      {loading && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
        </div>
      )}
      {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}
      {!loading && hotLeads.length === 0 && (
        <div className="text-gray-500 text-center py-8">No hot leads at the moment.</div>
      )}
      <ul className="space-y-4">
        {hotLeads.map(lead => (
          <li key={lead.id} className={`border-l-4 p-4 flex flex-col md:flex-row md:items-center justify-between ${getUrgencyColor(lead.urgencyLevel)}`}>
            <div className="flex-1">
              <div className="font-semibold text-lg">{lead.username || lead.firstName || 'Unknown'} <span className="text-gray-500">({lead.phone})</span></div>
              <div className="text-sm text-gray-700">Score: <span className="font-bold">{lead.leadScore}</span></div>
              <div className="text-sm text-gray-700">Pain Points: {lead.painPoints && lead.painPoints.length > 0 ? lead.painPoints.join(', ') : 'None'}</div>
              <div className="text-sm text-gray-700">Urgency: <span className="font-bold capitalize">{lead.urgencyLevel}</span></div>
              <div className="text-xs text-gray-500">{timeSince(lead.processedAt || lead.timestamp)}</div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
              <a href={`tel:${lead.phone}`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold shadow">Call Now</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
