import React, { useState } from "react";
import { useEffect } from "react";
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';

const demoBulkActions = [
  { id: 1, action: "Send Welcome Email", date: "2025-08-10", status: "Completed" },
  { id: 2, action: "Update Billing Status", date: "2025-08-12", status: "Completed" },
];

export default function Bulk() {
  const [bulkActions, setBulkActions] = useState(demoBulkActions);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'bulk'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBulkActions(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setBulkActions(demoBulkActions);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setBulkActions(demoBulkActions);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Bulk Actions</h1>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Action</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {bulkActions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    No bulk actions found.
                  </td>
                </tr>
              ) : (
                bulkActions.map(action => (
                  <tr key={action.id} className="border-b">
                    <td className="py-2 px-4">{action.action}</td>
                    <td className="py-2 px-4">{action.date}</td>
                    <td className="py-2 px-4">{action.status}</td>
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
