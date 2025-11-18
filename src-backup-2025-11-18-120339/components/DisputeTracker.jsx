import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const DisputeTracker = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'disputes'),
      where('clientEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const disputeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDisputes(disputeData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const statusConfig = {
    pending: { color: 'yellow', icon: ClockIcon, label: 'Pending' },
    sent: { color: 'blue', icon: DocumentTextIcon, label: 'Sent to Bureau' },
    investigating: { color: 'purple', icon: ClockIcon, label: 'Under Investigation' },
    resolved: { color: 'green', icon: CheckCircleIcon, label: 'Resolved' },
    rejected: { color: 'red', icon: XCircleIcon, label: 'Rejected' }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Dispute Tracker</h2>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No disputes found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {disputes.map(dispute => {
            const status = statusConfig[dispute.status] || statusConfig['pending'];
            const StatusIcon = status.icon;
            return (
              <div key={dispute.id} className={`flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800`}>
                <div className="flex items-center gap-3">
                  <StatusIcon className={`h-8 w-8 text-${status.color}-600`} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{dispute.subject || 'Dispute'}</p>
                    <p className="text-xs text-gray-500">{dispute.bureau || 'Unknown Bureau'}</p>
                    <p className="text-xs text-gray-500">{new Date(dispute.createdAt?.toDate ? dispute.createdAt.toDate() : dispute.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full bg-${status.color}-100 text-${status.color}-800`}>{status.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DisputeTracker;
