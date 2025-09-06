import React, { useState } from "react";
import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from 'firebase/firestore';
import { demoLetters } from "../data/demoData";

export default function Letters() {
  const [templates, setTemplates] = useState(demoLetters);
  const [useDemo, setUseDemo] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'letters'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTemplates(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          setTemplates(demoLetters);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setTemplates(demoLetters);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Letters</h1>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Client</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Date Sent</th>
                <th className="py-2 px-4 text-left">Bureau</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No letters found.
                  </td>
                </tr>
              ) : (
                templates.map((letter) => (
                  <tr key={letter.id} className="border-b">
                    <td className="py-2 px-4">{letter.clientName}</td>
                    <td className="py-2 px-4">{letter.type}</td>
                    <td className="py-2 px-4">{letter.status}</td>
                    <td className="py-2 px-4">{letter.dateSent}</td>
                    <td className="py-2 px-4">{letter.bureau}</td>
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