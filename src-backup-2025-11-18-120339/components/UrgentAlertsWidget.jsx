// src/components/UrgentAlertsWidget.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Phone, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const UrgentAlertsWidget = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'alerts'),
      where('status', '==', 'unread'),
      orderBy('priority', 'asc'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlerts(alertsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (alertId) => {
    await updateDoc(doc(db, 'alerts', alertId), {
      status: 'read',
      readAt: new Date()
    });
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold">Urgent Alerts</h3>
          {alerts.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
              {alerts.length} NEW
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No urgent alerts</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`border rounded-lg p-4 ${
                alert.priority === 1 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className={`h-4 w-4 mr-2 ${
                      alert.priority === 1 ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <h4 className="font-semibold">{alert.title}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {alert.message}
                  </p>
                  
                  <div className="bg-white dark:bg-gray-800 rounded p-2 mb-2">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Recommended Action:
                    </p>
                    <p className="text-sm">{alert.nextBestAction}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Score: {alert.leadScore}/10</span>
                    <span>•</span>
                    <span>{new Date(alert.createdAt?.toDate()).toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-3">
                  {alert.contactPhone && (
                    <button
                      onClick={() => handleCall(alert.contactPhone)}
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                      title="Call now"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300"
                    title="Mark as read"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UrgentAlertsWidget;