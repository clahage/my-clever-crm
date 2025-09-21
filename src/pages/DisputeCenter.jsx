import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FileText, Plus, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function DisputeCenter() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'disputes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const disputesData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setDisputes(disputesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching disputes:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (filter === 'all') return true;
    return dispute.status === filter;
  });

  if (loading) return <div className="p-6">Loading disputes...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Dispute Center
        </h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Dispute
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All ({disputes.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
        >
          Pending ({disputes.filter(d => d.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Resolved ({disputes.filter(d => d.status === 'resolved').length})
        </button>
      </div>

      <div className="grid gap-4">
        {filteredDisputes.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No disputes found
          </div>
        ) : (
          filteredDisputes.map(dispute => (
            <div key={dispute.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(dispute.status)}
                    <h3 className="text-lg font-semibold">
                      {dispute.title || 'Untitled Dispute'}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Client: {dispute.clientName || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {dispute.createdAt ? new Date(dispute.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    View Details
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}