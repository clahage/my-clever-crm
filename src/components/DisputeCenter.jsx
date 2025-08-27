import React, { useState } from "react";
import { useEffect } from "react";
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { demoDisputes } from "../data/demoData";

export default function DisputeCenter() {
  const [disputes, setDisputes] = useState(demoDisputes);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'disputes'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDisputes(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setDisputes(demoDisputes);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setDisputes(demoDisputes);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Dispute Center</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 rounded p-4 text-center">
            <div className="text-lg font-semibold text-blue-700">Open Disputes</div>
            <div className="text-2xl font-bold">{disputes.filter((d) => d.status === "Open").length}</div>
          </div>
          <div className="bg-green-100 rounded p-4 text-center">
            <div className="text-lg font-semibold text-green-700">Resolved</div>
            <div className="text-2xl font-bold">{disputes.filter((d) => d.status === "Resolved").length}</div>
          </div>
          <div className="bg-yellow-100 rounded p-4 text-center">
            <div className="text-lg font-semibold text-yellow-700">In Progress</div>
            <div className="text-2xl font-bold">{disputes.filter((d) => d.status === "In Progress").length}</div>
          </div>
          <div className="bg-gray-100 rounded p-4 text-center">
            <div className="text-lg font-semibold text-gray-700">Total</div>
            <div className="text-2xl font-bold">{disputes.length}</div>
          </div>
        </div>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Client</th>
                <th className="py-2 px-4 text-left">Bureau</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Date Created</th>
              </tr>
            </thead>
            <tbody>
              {disputes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No disputes found.
                  </td>
                </tr>
              ) : (
                disputes.map((dispute) => (
                  <tr key={dispute.id} className="border-b">
                    <td className="py-2 px-4">{dispute.clientName}</td>
                    <td className="py-2 px-4">{dispute.bureau}</td>
                    <td className="py-2 px-4">{dispute.type}</td>
                    <td className="py-2 px-4">{dispute.status}</td>
                    <td className="py-2 px-4">{dispute.dateCreated}</td>
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