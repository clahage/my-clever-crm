import React, { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportContactsModal({ isOpen, onClose, onImport }) {
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [defaultType, setDefaultType] = useState('Lead');

  if (!isOpen) return null;

  const handleCsvFileChange = e => {
    setImportError('');
    setImportSuccess('');
    const file = e.target.files[0];
    setCsvFile(file);
    
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => {
          // Preview first 5 rows
          setCsvPreview(results.data.slice(0, 5));
          console.log('Total rows to import:', results.data.length);
          console.log('Columns found:', Object.keys(results.data[0] || {}));
        },
        error: err => {
          setImportError('CSV parsing error: ' + err.message);
        }
      });
    }
  };

  const handleImport = async () => {
    if (!csvFile) {
      setImportError('Please select a file first');
      return;
    }

    setImporting(true);
    setImportProgress(0);
    setImportError('');
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let imported = 0;
        let failed = 0;
        
        for (let i = 0; i < results.data.length; i++) {
          try {
            const row = results.data[i];
            
            // Map CSV fields to your database fields
            const contact = {
              // Try various common CSV field names
              firstName: row.firstName || row.first_name || row.First || row.name?.split(' ')[0] || '',
              lastName: row.lastName || row.last_name || row.Last || row.name?.split(' ').slice(1).join(' ') || '',
              email: row.email || row.Email || row.EMAIL || '',
              phone: row.phone || row.Phone || row.telephone || row.mobile || '',
              company: row.company || row.Company || row.organization || '',
              
              // Address fields
              streetAddress: row.address || row.street || row.streetAddress || '',
              city: row.city || row.City || '',
              state: row.state || row.State || '',
              zipCode: row.zip || row.zipCode || row.postal || '',
              
              // CRM-specific fields
              type: row.type || defaultType,
              source: row.source || 'CSV Import',
              leadScore: row.leadScore || row.score || 3,
              notes: row.notes || row.Notes || '',
              
              // Metadata
              createdAt: new Date(),
              importedFrom: csvFile.name,
              importedAt: new Date()
            };
            
            // Only import if we have at least a name or email
            if (contact.firstName || contact.email) {
              await addDoc(collection(db, 'contacts'), contact);
              imported++;
            } else {
              failed++;
              console.log('Skipped row - no name or email:', row);
            }
            
            setImportProgress(Math.round(((i + 1) / results.data.length) * 100));
          } catch (err) {
            failed++;
            console.error('Error importing row ' + (i + 1) + ':', err);
          }
        }
        
        setImporting(false);
        setImportSuccess(`Successfully imported ${imported} contacts. ${failed > 0 ? `Failed: ${failed}` : ''}`);
        
        // Reset after 3 seconds
        setTimeout(() => {
          if (onImport) onImport();
          onClose();
          resetForm();
        }, 3000);
      },
      error: err => {
        setImporting(false);
        setImportError('Import failed: ' + err.message);
      }
    });
  };

  const resetForm = () => {
    setCsvFile(null);
    setCsvPreview([]);
    setImportProgress(0);
    setImportError('');
    setImportSuccess('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Import Contacts from CSV
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              CSV Format Guidelines
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• First row should contain column headers</li>
              <li>• Supported columns: firstName, lastName, email, phone, company, address, city, state, zip</li>
              <li>• At minimum, include name or email for each contact</li>
              <li>• Contacts will be imported as: {defaultType}s</li>
            </ul>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Import contacts as:
            </label>
            <select
              value={defaultType}
              onChange={(e) => setDefaultType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Lead">Leads</option>
              <option value="Client">Clients</option>
              <option value="Affiliate">Affiliates</option>
              <option value="Vendor">Vendors</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
            />
          </div>

          {/* Preview */}
          {csvPreview.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Preview (First 5 rows)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {Object.keys(csvPreview[0]).slice(0, 5).map(key => (
                        <th key={key} className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {csvPreview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).slice(0, 5).map((val, j) => (
                          <td key={j} className="px-2 py-1 text-xs text-gray-900 dark:text-gray-300">
                            {String(val).substring(0, 30)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Total rows in file: {csvFile ? 'Calculating...' : '0'}
              </p>
            </div>
          )}

          {/* Progress Bar */}
          {importing && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Importing...</span>
                <span>{importProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Messages */}
          {importError && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              {importError}
            </div>
          )}
          
          {importSuccess && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              {importSuccess}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!csvFile || importing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : 'Import Contacts'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}