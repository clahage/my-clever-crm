import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';

const AdminDisputeManager = () => {
  const [disputes, setDisputes] = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const disputesQuery = query(
      collection(db, 'disputes'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(disputesQuery, (snapshot) => {
      const disputeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDisputes(disputeData);
      setFilteredDisputes(disputeData);
      const uniqueClients = [...new Set(disputeData.map(d => d.clientEmail))];
      setClients(uniqueClients);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...disputes];
    if (filter !== 'all') filtered = filtered.filter(d => d.status === filter);
    if (selectedClient !== 'all') filtered = filtered.filter(d => d.clientEmail === selectedClient);
    setFilteredDisputes(filtered);
  }, [filter, selectedClient, disputes]);

  const updateStatus = async (disputeId, newStatus) => {
    try {
      await updateDoc(doc(db, 'disputes', disputeId), {
        status: newStatus,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating dispute status:', error);
    }
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    sent: { color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon },
    investigating: { color: 'bg-purple-100 text-purple-800', icon: ClockIcon },
    resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dispute Management</h2>
      <div className="mb-6 flex gap-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="all">All Clients</option>
          {clients.map(client => (
            <option key={client} value={client}>{client}</option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bureau</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDisputes.map(dispute => {
              const config = statusConfig[dispute.status] || statusConfig.pending;
              return (
                <tr key={dispute.id}>
                  <td className="px-4 py-3">{dispute.clientEmail}</td>
                  <td className="px-4 py-3">{dispute.bureau}</td>
                  <td className="px-4 py-3">{dispute.item}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>{dispute.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(dispute.createdAt?.toDate ? dispute.createdAt.toDate() : dispute.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select value={dispute.status} onChange={e => updateStatus(dispute.id, e.target.value)} className="text-sm border rounded px-2 py-1">
                      <option value="pending">Pending</option>
                      <option value="sent">Sent</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDisputeManager;
