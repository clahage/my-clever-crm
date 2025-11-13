// src/pages/Payments/CollectionList.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Download, CheckCircle, Clock, Mail } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const CollectionList = () => {
  const { currentUser } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadCollections();
  }, [selectedDate]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const date = new Date(selectedDate);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const q = query(
        collection(db, 'payments'),
        where('dueDate', '>=', date),
        where('dueDate', '<', nextDay),
        where('status', 'in', ['pending', 'scheduled'])
      );

      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setCollections(list.sort((a, b) => a.clientName.localeCompare(b.clientName)));
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsProcessed = async (paymentId) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status: 'pending',
        processedAt: new Date()
      });
      loadCollections();
    } catch (error) {
      console.error('Error marking payment:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Client Name', 'Amount', 'Method', 'Account Last 4', 'Status'];
    const rows = collections.map(c => [
      c.clientName,
      c.amount,
      c.paymentMethod,
      c.bankDetails?.accountLast4 || 'N/A',
      c.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collections-${selectedDate}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span>Daily Collection List</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {collections.length} payments due on {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading collections...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No payments due on this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {collections.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.clientName}</div>
                        <div className="text-xs text-gray-500">{payment.clientId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        ${payment.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{payment.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                        {payment.bankDetails?.accountLast4 ? `****${payment.bankDetails.accountLast4}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => markAsProcessed(payment.id)}
                          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark Processed</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionList;
