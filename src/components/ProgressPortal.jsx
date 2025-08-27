import React, { useState } from "react";
import { useEffect } from "react";
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';

const demoProgress = [
  { id: 1, client: "John Doe", status: "In Progress", percent: 65 },
  { id: 2, client: "Jane Smith", status: "Completed", percent: 100 },
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
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProgress(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setProgress(demoProgress);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setProgress(demoProgress);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Progress Portal</h1>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Client</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Progress</th>
              </tr>
            </thead>
            <tbody>
              {progress.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-4 text-gray-500"
                  >
                    No progress data found.
                  </td>
                </tr>
              ) : (
                progress.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="py-2 px-4">{row.client}</td>
                    <td className="py-2 px-4">{row.status}</td>
                    <td className="py-2 px-4">{row.percent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
