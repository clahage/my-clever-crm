import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function ImportContactsModal({ isOpen, onClose, onImport }) {
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState('');

  const handleCsvFileChange = e => {
    setImportError('');
    const file = e.target.files[0];
    setCsvFile(file);
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => {
          setCsvPreview(results.data);
        },
        error: err => {
          setImportError('CSV parsing error: ' + err.message);
        }
      });
    }
  };

  const handleImport = async () => {
    setImportProgress(0);
    let imported = 0;
    for (let i = 0; i < csvPreview.length; i++) {
      try {
        await addDoc(collection(db, 'contacts'), { ...csvPreview[i], createdAt: new Date().toISOString() });
        imported++;
        setImportProgress(Math.round(((i + 1) / csvPreview.length) * 100));
      } catch (err) {
        setImportError('Error importing row ' + (i + 1) + ': ' + err.message);
        break;
      }
    }
    if (imported === csvPreview.length) {
      if (onImport) onImport();
      setCsvPreview([]);
      setCsvFile(null);
      setImportProgress(100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Import Contacts (CSV)</h2>
        <input type="file" accept=".csv" onChange={handleCsvFileChange} className="mb-4" />
        {importError && <div className="text-red-600 font-semibold mb-2">{importError}</div>}
        {csvPreview.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold mb-2">Preview ({csvPreview.length} rows):</div>
            <div className="overflow-x-auto max-h-48 border rounded">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>{Object.keys(csvPreview[0]).map(h => <th key={h} className="border px-2 py-1">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {csvPreview.slice(0, 10).map((row, i) => (
                    <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="border px-2 py-1">{v}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              {csvPreview.length > 10 && <div className="text-xs text-gray-500 px-2 py-1">Showing first 10 rows</div>}
            </div>
            <button type="button" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleImport}>Import Contacts</button>
            {importProgress > 0 && <div className="mt-2">Progress: <span className="font-bold">{importProgress}%</span></div>}
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}
