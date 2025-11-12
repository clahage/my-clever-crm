import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all'); // all, hot, warm, cold
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'contacts'), where('category', 'in', ['lead', 'Lead']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsData);
    });
    return () => unsubscribe();
  }, []);

  const getUrgencyColor = (urgency) => {
    switch(urgency?.toLowerCase()) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-300';
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(l => (l.urgency || 'cold').toLowerCase() === filter);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <button 
          onClick={() => navigate('/add-client')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add New Lead
        </button>
      </div>

      {/* Urgency Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          All ({leads.length})
        </button>
        <button onClick={() => setFilter('hot')} className={`px-4 py-2 rounded ${filter === 'hot' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
          🔥 Hot ({leads.filter(l => l.urgency === 'hot').length})
        </button>
        <button onClick={() => setFilter('warm')} className={`px-4 py-2 rounded ${filter === 'warm' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}>
          ☀️ Warm ({leads.filter(l => l.urgency === 'warm').length})
        </button>
        <button onClick={() => setFilter('cold')} className={`px-4 py-2 rounded ${filter === 'cold' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
          ❄️ Cold ({leads.filter(l => l.urgency === 'cold').length})
        </button>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map(lead => (
          <div key={lead.id} className={`border-2 rounded-lg p-4 ${getUrgencyColor(lead.urgency)}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">
                {lead.firstName} {lead.lastName}
              </h3>
              <span className="px-2 py-1 rounded text-xs font-bold">
                {lead.urgency || 'COLD'}
              </span>
            </div>
            
            <div className="space-y-1 text-sm mb-3">
              <p>📞 {lead.phone || 'No phone'}</p>
              <p>✉️ {lead.email || 'No email'}</p>
              <p>🏢 {lead.company || 'No company'}</p>
              <p>📅 Added: {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => navigate(`/add-client?edit=${lead.id}`)}
                className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                View/Edit
              </button>
              <button 
                onClick={async () => {
                  await updateDoc(doc(db, 'contacts', lead.id), { category: 'client' });
                  alert('Converted to client!');
                }}
                className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Convert
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeadsPage;
