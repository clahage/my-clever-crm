// Client Reports Shell
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const fetchReports = async () => {
      const q = query(collection(db, 'clients', user.uid, 'reports'));
      const snap = await getDocs(q);
      setReports(snap.docs.map(d => d.data()));
      setLoading(false);
    };
    fetchReports();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Credit Reports</h1>
      {reports.length === 0 ? <div>No reports available.</div> : (
        <ul>
          {reports.map((r, i) => (
            <li key={i} className="mb-2">
              <span className="font-semibold">{r.date || 'Unknown Date'}:</span> {r.summary || 'No summary'}
              {r.pdfUrl && (
                <a href={r.pdfUrl} className="ml-2 text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download PDF</a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reports;
