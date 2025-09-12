import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { DocumentIcon, EyeIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const AdminDocumentViewer = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'documents'),
      orderBy('uploadedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docs);
      setFilteredDocuments(docs);
      const uniqueClients = [...new Set(docs.map(d => d.clientEmail))];
      setClients(uniqueClients);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...documents];
    if (selectedClient !== 'all') filtered = filtered.filter(d => d.clientEmail === selectedClient);
    if (selectedType !== 'all') filtered = filtered.filter(d => d.category === selectedType);
    setFilteredDocuments(filtered);
  }, [selectedClient, selectedType, documents]);

  const deleteDocument = async (docId) => {
    if (window.confirm('Delete this document?')) {
      await deleteDoc(doc(db, 'documents', docId));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Document Management</h2>
      <div className="mb-6 flex gap-4">
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="all">All Clients</option>
          {clients.map(client => (
            <option key={client} value={client}>{client}</option>
          ))}
        </select>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="all">All Types</option>
          <option value="Credit Report">Credit Reports</option>
          <option value="ID">ID Documents</option>
          <option value="Dispute">Dispute Letters</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="grid gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : filteredDocuments.length === 0 ? (
          <div>No documents found</div>
        ) : (
          filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DocumentIcon className="h-10 w-10 text-gray-400" />
                <div>
                  <p className="font-medium">{doc.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {doc.clientEmail} • {doc.category} • {new Date(doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt).toLocaleDateString()}
                  </p>
                  {doc.parsed && (
                    <span className="text-xs text-green-600">✓ Parsed</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <EyeIcon className="h-5 w-5" />
                </a>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDocumentViewer;
