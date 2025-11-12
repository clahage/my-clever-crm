// Client Documents Shell
import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const fetchDocs = async () => {
      const q = query(collection(db, 'clients', user.uid, 'documents'));
      const snap = await getDocs(q);
      setDocuments(snap.docs.map(d => d.data()));
      setLoading(false);
    };
    fetchDocs();
  }, [user]);

  // Placeholder upload handler
  const handleUpload = (e) => {
    alert('File upload not implemented in MVP.');
  };

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={handleUpload}>Upload Document</button>
      {documents.length === 0 ? <div>No documents found.</div> : (
        <ul>
          {documents.map((d, i) => (
            <li key={i} className="mb-2">
              <span className="font-semibold">{d.name || 'Document'}:</span> {d.status || 'No status'}
              {d.url && (
                <a href={d.url} className="ml-2 text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Documents;
