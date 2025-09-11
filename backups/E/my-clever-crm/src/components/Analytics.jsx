import React, { useState } from "react";
import { useEffect } from "react";
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { demoAnalytics } from "../data/demoData";

export default function Analytics() {
  const [stats, setStats] = useState(demoAnalytics);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'analytics'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setStats(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setStats(demoAnalytics);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setStats(demoAnalytics);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">No analytics data found.</div>
          ) : (
            stats.map((stat) => (
              <div key={stat.id} className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
                <div className="text-2xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg text-gray-700">{stat.label}</div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
