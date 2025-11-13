// src/pages/Payments/RecurringPayments.jsx
import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const RecurringPayments = () => {
  const { currentUser } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    frequency: 'monthly',
    dayOfMonth: 1,
    paymentMethod: 'ACH'
  });

  useEffect(() => {
    loadSchedules();
    loadClients();
  }, []);

  const loadSchedules = async () => {
    try {
      const q = query(collection(db, 'payments'), where('recurringSchedule', '!=', null));
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setSchedules(list);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'contacts'));
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setClients(list.sort((a, b) => a.name?.localeCompare(b.name)));
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const client = clients.find(c => c.id === formData.clientId);
      const nextDueDate = new Date();
      nextDueDate.setDate(parseInt(formData.dayOfMonth));

      await addDoc(collection(db, 'payments'), {
        clientId: formData.clientId,
        clientName: client.name,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        status: 'scheduled',
        dueDate: nextDueDate,
        recurringSchedule: {
          frequency: formData.frequency,
          dayOfMonth: parseInt(formData.dayOfMonth),
          nextDueDate: nextDueDate
        },
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid
      });

      setShowForm(false);
      loadSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <span>Recurring Payments</span>
          </h1>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            <span>New Schedule</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Amount" className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Create</button>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {loading ? <div className="p-12 text-center">Loading...</div> :
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Client</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id}>
                  <td className="px-6 py-4">{s.clientName}</td>
                  <td className="px-6 py-4">${s.amount}</td>
                  <td className="px-6 py-4">{s.recurringSchedule?.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>}
        </div>
      </div>
    </div>
  );
};

export default RecurringPayments;
