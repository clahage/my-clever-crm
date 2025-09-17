import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

function getSentimentColor(score) {
  if (score >= 0.7) return "bg-green-100 text-green-800";
  if (score >= 0.4) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function getUrgencyBorder(urgency) {
  if (urgency === "hot") return "border-2 border-red-500";
  if (urgency === "warm") return "border-2 border-yellow-500";
  return "border";
}

export default function QuickContactConverter() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const q = query(collection(db, "aiReceptionistCalls"), where("processed", "==", false));
    const unsub = onSnapshot(q, (snap) => {
      setCalls(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleConvert(call) {
    // Create new contact
    await addDoc(collection(db, "contacts"), {
      name: call.clientName,
      phone: call.phone,
      summary: call.summary,
      sentiment: call.sentiment,
      urgency: call.urgency,
      source: "AI Receptionist",
      createdAt: new Date(),
    });
    // Mark call as processed
    await updateDoc(doc(db, "aiReceptionistCalls", call.id), { processed: true });
    setToast("Contact converted successfully!");
    setTimeout(() => setToast(""), 2500);
  }

  async function handleDismiss(call) {
    await updateDoc(doc(db, "aiReceptionistCalls", call.id), { processed: true });
    setToast("Call dismissed.");
    setTimeout(() => setToast(""), 2000);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Quick Contact Converter</h2>
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">{toast}</div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : calls.length === 0 ? (
        <div className="text-gray-500">No unprocessed calls.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {calls.map((call) => (
            <div
              key={call.id}
              className={`p-4 rounded-lg shadow border ${getUrgencyBorder(call.urgency)} flex flex-col gap-2`}
            >
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg">{call.clientName || "Unknown Caller"}</div>
                <div className="text-sm text-gray-500">{call.phone}</div>
              </div>
              <div className="text-gray-700 text-sm mb-2">{call.summary || "No summary available."}</div>
              <div className={`inline-block px-2 py-1 rounded ${getSentimentColor(call.sentiment)}`}>Sentiment: {call.sentiment ?? "N/A"}</div>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-indigo-600 text-white px-3 py-1 rounded font-semibold hover:bg-indigo-700"
                  onClick={() => handleConvert(call)}
                >Convert to Lead</button>
                <button
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded font-semibold hover:bg-gray-400"
                  onClick={() => handleDismiss(call)}
                >Dismiss</button>
              </div>
              {call.urgency === "hot" && (
                <div className="text-red-600 font-bold mt-1">HOT LEAD</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
