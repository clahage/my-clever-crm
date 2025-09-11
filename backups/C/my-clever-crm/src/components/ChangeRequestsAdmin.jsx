import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";

const ChangeRequestsAdmin = () => {
  const { db } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    let unsub;
    (async () => {
      const { collection, onSnapshot, doc, updateDoc } = await import("firebase/firestore");
      unsub = onSnapshot(collection(db, "changeRequests"), (snapshot) => {
        setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
    })();
    return () => unsub && unsub();
  }, [db]);

  const handleApprove = async (id) => {
    if (!db) return;
    const { doc, updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, "changeRequests", id), { status: "approved" });
  };
  const handleDeny = async (id) => {
    if (!db) return;
    const { doc, updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, "changeRequests", id), { status: "denied" });
  };

  if (loading) return <div>Loading change requests...</div>;
  if (!requests.length) return <div>No change requests.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Change Requests</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Action</th>
            <th className="border px-2 py-1">Target</th>
            <th className="border px-2 py-1">Details</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Timestamp</th>
            <th className="border px-2 py-1">Approve/Deny</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td className="border px-2 py-1">{r.userId}</td>
              <td className="border px-2 py-1">{r.action}</td>
              <td className="border px-2 py-1">{r.targetType}:{r.targetId}</td>
              <td className="border px-2 py-1">{r.details}</td>
              <td className="border px-2 py-1">{r.status}</td>
              <td className="border px-2 py-1">{r.timestamp?.toDate?.().toLocaleString?.() || ""}</td>
              <td className="border px-2 py-1">
                {r.status === 'pending' && (
                  <>
                    <button className="bg-green-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleApprove(r.id)}>Approve</button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDeny(r.id)}>Deny</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChangeRequestsAdmin;
