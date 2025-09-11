import React, { useState } from "react";
import { useEffect } from "react";
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';

const demoExports = [
  { id: 1, type: "Client List", date: "2025-08-10", status: "Completed" },
  { id: 2, type: "Dispute History", date: "2025-08-12", status: "Completed" },
];

export default function Export() {
  const [exports, setExports] = useState(demoExports);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'export'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setExports(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setExports(demoExports);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setExports(demoExports);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Export</h1>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {exports.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    No exports found.
                  </td>
                </tr>
              ) : (
                exports.map((exp) => (
                  <tr key={exp.id} className="border-b">
                    <td className="py-2 px-4">{exp.type}</td>
                    <td className="py-2 px-4">{exp.date}</td>
                    <td className="py-2 px-4">{exp.status}</td>
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
