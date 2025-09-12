import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "@/authContext";


const AllActivityLog = ({ limit = 50 }) => {
  const auth = useAuth();
  const db = auth && auth.db ? auth.db : null;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "activityLogs"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, limit));
      } catch (err) {
        setLogs([]);
      }
      setLoading(false);
    })();
  }, [db, limit]);

  if (!db) return <div className="text-red-500">Activity log unavailable: not signed in.</div>;
  if (loading) return <div>Loading activity log...</div>;
  if (!logs.length) return <div>No activity yet.</div>;

  return (
    <div className="my-4">
      <h2 className="font-bold mb-4 text-xl">All Activity Logs</h2>
      <ul className="text-sm space-y-1">
        {logs.map(log => (
          <li key={log.id}>
            <span className="font-mono text-gray-500">{log.timestamp?.toDate?.().toLocaleString?.() || ""}</span> -
            <span className="ml-2">{log.action}</span>
            {log.details && <span className="ml-2 text-gray-400">({log.details})</span>}
            {log.targetType && log.targetId && <span className="ml-2 text-blue-400">[{log.targetType}:{log.targetId}]</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllActivityLog;
