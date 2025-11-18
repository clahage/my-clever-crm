import React, { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const ImportContactsModal = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          for (const row of results.data) {
            if (!row.name && !row.email && !row.phone) continue;
            await addDoc(collection(db, 'contacts'), {
              ...row,
              createdAt: new Date(),
            });
          }
          setStatus({ success: true, message: 'Contacts imported successfully!' });
        } catch (err) {
          setStatus({ success: false, message: err.message });
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" /> Import Contacts
        </h2>

        <input type="file" accept=".csv" onChange={handleFileChange} />

        <button
          className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleImport}
        >
          Import
        </button>

        {status && (
          <div
            className={`mt-4 flex items-center gap-2 ${
              status.success ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {status.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportContactsModal;
