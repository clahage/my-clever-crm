import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "../authContext";

const ActivityLog = ({ targetType, targetId, limit = 10 }) => {
  const { db } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !targetType || !targetId) return;
    (async () => {
      setLoading(true);
      const q = query(
        collection(db, "activityLogs"),
        where("targetType", "==", targetType),
        where("targetId", "==", targetId),
        orderBy("timestamp", "desc")
      );
      const snap = await getDocs(q);
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    })();
  }, [db, targetType, targetId]);

  if (loading) return <div>Loading activity log...</div>;
  if (!logs.length) return <div>No activity yet.</div>;

  return (
    <div className="my-4">
      <h3 className="font-bold mb-2">Activity Log</h3>
      <ul className="text-sm space-y-1">
        {logs.map(log => (
          <li key={log.id}>
            <span className="font-mono text-gray-500">{log.timestamp?.toDate?.().toLocaleString?.() || ""}</span> -
            <span className="ml-2">{log.action}</span>
            {log.details && <span className="ml-2 text-gray-400">({log.details})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
