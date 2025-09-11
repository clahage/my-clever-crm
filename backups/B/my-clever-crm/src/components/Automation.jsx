import React, { useState } from "react";
import { useEffect } from "react";
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';

const demoAutomationRules = [
  { id: 1, rule: "Auto-send Welcome Email", status: "Active" },
  { id: 2, rule: "Flag Overdue Payments", status: "Active" },
];

export default function Automation() {
  const [rules, setRules] = useState(demoAutomationRules);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'automation'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRules(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setRules(demoAutomationRules);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setRules(demoAutomationRules);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Automation</h1>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Rule</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center py-4 text-gray-500"
                  >
                    No automation rules found.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="border-b">
                    <td className="py-2 px-4">{rule.rule}</td>
                    <td className="py-2 px-4">{rule.status}</td>
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
