import React, { useState } from "react";
import { useEffect } from "react";
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { demoInvoices } from "../data/demoData";

export default function Billing() {
  const [invoices, setInvoices] = useState(demoInvoices);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'billing'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setInvoices(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setInvoices(demoInvoices);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setInvoices(demoInvoices);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Billing</h1>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Client</th>
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Due Date</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-2 px-4">{invoice.client}</td>
                    <td className="py-2 px-4">${invoice.amount}</td>
                    <td className="py-2 px-4">{invoice.dueDate}</td>
                    <td className="py-2 px-4">{invoice.status}</td>
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
