import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FileText, Plus, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function DisputeCenter() {
  const [disputes, setDisputes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDispute, setNewDispute] = useState({
    clientName: '',
    itemName: '',
    bureau: 'Experian',
    status: 'pending'
  });

  useEffect(() => {
    const q = query(collection(db, 'disputes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const disputesArray = [];
      querySnapshot.forEach((doc) => {
        disputesArray.push({ id: doc.id, ...doc.data() });
      });
      setDisputes(disputesArray);
    });
    return () => unsubscribe();
  }, []);

  const filteredDisputes = disputes.filter(dispute => {
    if (filter === 'all') return true;
    return dispute.status === filter;
  });

  const handleAddDispute = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'disputes'), {
        ...newDispute,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setIsModalOpen(false);
      setNewDispute({
        clientName: '',
        itemName: '',
        bureau: 'Experian',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error adding dispute:', error);
    }
  };

  const handleUpdateStatus = async (disputeId, newStatus) => {
    try {
      await updateDoc(doc(db, 'disputes', disputeId), {
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (disputeId) => {
    if (window.confirm('Are you sure you want to delete this dispute?')) {
      try {
        await deleteDoc(doc(db, 'disputes', disputeId));
      } catch (error) {
        console.error('Error deleting dispute:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dispute Center</h1>
        <p className="text-gray-600">Manage credit disputes and track their progress</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
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
            Pending
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Resolved
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Dispute
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bureau</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDisputes.map((dispute) => (
              <tr key={dispute.id}>
                <td className="px-6 py-4 whitespace-nowrap">{dispute.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dispute.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dispute.bureau}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(dispute.status)}
                    <span className="capitalize">{dispute.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={dispute.status}
                    onChange={(e) => handleUpdateStatus(dispute.id, e.target.value)}
                    className="mr-2 border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => handleDelete(dispute.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add New Dispute</h2>
            <form onSubmit={handleAddDispute}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Client Name</label>
                <input
                  type="text"
                  required
                  value={newDispute.clientName}
                  onChange={(e) => setNewDispute({...newDispute, clientName: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Item Name</label>
                <input
                  type="text"
                  required
                  value={newDispute.itemName}
                  onChange={(e) => setNewDispute({...newDispute, itemName: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Bureau</label>
                <select
                  value={newDispute.bureau}
                  onChange={(e) => setNewDispute({...newDispute, bureau: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Experian">Experian</option>
                  <option value="Equifax">Equifax</option>
                  <option value="TransUnion">TransUnion</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Dispute
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}