import React, { useState , useEffect } from "react";

import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
const demoAppointments = [
  { id: 1, client: "John Doe", date: "2025-08-18", time: "10:00 AM", type: "Consultation" },
  { id: 2, client: "Jane Smith", date: "2025-08-19", time: "2:00 PM", type: "Follow-up" },
];
export default function Calendar() {
  const [appointments, setAppointments] = useState(demoAppointments);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'calendar'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAppointments(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setAppointments(demoAppointments);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setAppointments(demoAppointments);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Calendar</h1>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Client</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Time</th>
                <th className="py-2 px-4 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">No appointments found.</td>
                </tr>
              ) : (
                appointments.map(appt => (
                  <tr key={appt.id} className="border-b">
                    <td className="py-2 px-4">{appt.client}</td>
                    <td className="py-2 px-4">{appt.date}</td>
                    <td className="py-2 px-4">{appt.time}</td>
                    <td className="py-2 px-4">{appt.type}</td>
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
