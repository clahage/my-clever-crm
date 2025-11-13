// src/pages/Payments/PaymentHistory.jsx
import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const PaymentHistory = () => {
  const { currentUser, userProfile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const paymentsRef = collection(db, 'payments');
      let q;

      if (userProfile?.role === 'admin' || userProfile?.role === 'masterAdmin') {
        if (filter === 'all') {
          q = query(paymentsRef, orderBy('createdAt', 'desc'));
        } else {
          q = query(paymentsRef, where('status', '==', filter), orderBy('createdAt', 'desc'));
        }
      } else {
        if (filter === 'all') {
          q = query(paymentsRef, where('clientId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        } else {
          q = query(paymentsRef, where('clientId', '==', currentUser.uid), where('status', '==', filter), orderBy('createdAt', 'desc'));
        }
      }

      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setPayments(list);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Client', 'Amount', 'Method', 'Status'];
    const rows = payments.map(p => [
      p.createdAt?.toDate().toLocaleDateString(),
      p.clientName,
      p.amount,
      p.paymentMethod,
      p.status
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-history.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <span>Payment History</span>
            </h1>
            <p className="text-gray-600 mt-1">{payments.length} total payments</p>
          </div>
          <div className="flex items-center space-x-3">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <button onClick={exportCSV} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading history...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payment history found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{payment.createdAt?.toDate().toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">{payment.clientName}</td>
                    <td className="px-6 py-4 text-sm font-bold">${payment.amount}</td>
                    <td className="px-6 py-4 text-sm">{payment.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
