import React, { useState } from "react";
import { useEffect } from "react";
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';

const demoCommunications = [
  {
    id: 1,
    client: "John Doe",
    type: "Email",
    subject: "Welcome",
    date: "2025-08-10",
  },
  {
    id: 2,
    client: "Jane Smith",
    type: "SMS",
    subject: "Appointment Reminder",
    date: "2025-08-12",
  },
];

export default function Communications() {
  const [communications, setCommunications] = useState(demoCommunications);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'communications'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCommunications(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setCommunications(demoCommunications);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setCommunications(demoCommunications);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Communications</h1>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Client</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Subject</th>
                <th className="py-2 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {communications.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 text-gray-500"
                  >
                    No communications found.
                  </td>
                </tr>
              ) : (
                communications.map((comm) => (
                  <tr key={comm.id} className="border-b">
                    <td className="py-2 px-4">{comm.client}</td>
                    <td className="py-2 px-4">{comm.type}</td>
                    <td className="py-2 px-4">{comm.subject}</td>
                    <td className="py-2 px-4">{comm.date}</td>
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
