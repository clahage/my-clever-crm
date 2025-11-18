import React, { useState, useEffect } from "react";
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

const demoProgress = [
  { id: 1, client: "John Doe", status: "In Progress", percent: 65 },
  { id: 2, client: "Jane Smith", status: "Completed", percent: 100 },
  { id: 3, client: "Mike Johnson", status: "In Progress", percent: 45 },
  { id: 4, client: "Sarah Williams", status: "In Progress", percent: 80 }
];

export default function ProgressPortal() {
  const [progress, setProgress] = useState(demoProgress);
  const [useDemo, setUseDemo] = useState(true);

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
          if (firebaseData.length > 0) {
            setProgress(firebaseData);
            setUseDemo(false);
          }
        },
        (error) => {
          console.log("Using demo data:", error.message);
          setProgress(demoProgress);
          setUseDemo(true);
        }
      );
    } catch (error) {
      console.log("Firebase connection error, using demo data");
      setProgress(demoProgress);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Client Progress Portal
      </h2>
      
      {useDemo && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">Demo Mode</p>
          <p>Showing sample data. Connect to Firebase to see real progress.</p>
        </div>
      )}

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
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
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
    </div>
  );
}