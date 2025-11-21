import React, { useState, useEffect } from "react";
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

export default function ProgressPortal() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'progress'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
          setProgress(firebaseData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching progress:", error);
          setError(error.message);
          setProgress([]);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Firebase connection error:", error);
      setError(error.message);
      setProgress([]);
      setLoading(false);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Client Progress Portal
      </h2>
      
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading progress data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>Unable to load progress data: {error}</p>
        </div>
      )}

      {!loading && !error && progress.length === 0 && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p className="font-bold">No Progress Data</p>
          <p>No client progress records found. Add client progress in the system to see tracking here.</p>
        </div>
      )}

      {!loading && progress.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Active Progress Tracking</h3>
            <div className="space-y-3">
              {progress.map((item) => (
              <div key={item.id} className="border rounded p-4 dark:border-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{item.client}</span>
                  <span className={
                    item.percent === 100 ? 'text-green-600' : 
                    item.percent >= 75 ? 'text-blue-600' : 
                    item.percent >= 50 ? 'text-yellow-600' : 'text-gray-600'
                  }>
                    {item.percent}% - {item.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={
                      item.percent === 100 ? 'bg-green-600 h-2 rounded-full transition-all' :
                      item.percent >= 75 ? 'bg-blue-600 h-2 rounded-full transition-all' :
                      item.percent >= 50 ? 'bg-yellow-600 h-2 rounded-full transition-all' :
                      'bg-gray-400 h-2 rounded-full transition-all'
                    }
                    style={{width: `${item.percent}%`}}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-4">
            <h3 className="text-xl font-bold mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.length}</div>
                <div className="text-sm text-gray-600">Total Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progress.filter(p => p.percent === 100).length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {progress.filter(p => p.percent < 100).length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}