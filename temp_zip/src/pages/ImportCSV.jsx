import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Download, Users } from 'lucide-react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

const ImportCSV = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const [mappings, setMappings] = useState({});

  const csvFields = [
    'firstName', 'lastName', 'email', 'phone', 'company',
    'address', 'city', 'state', 'zip', 'country',
    'creditScore', 'notes', 'tags', 'status'
  ];

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
      parseCSVPreview(selectedFile);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const parseCSVPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Auto-map headers
      const autoMappings = {};
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().replace(/\s+/g, '');
        csvFields.forEach(field => {
          if (normalizedHeader.includes(field.toLowerCase()) || 
              field.toLowerCase().includes(normalizedHeader)) {
            autoMappings[index] = field;
          }
        });
      });
      setMappings(autoMappings);

      // Parse preview rows
      const previewRows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {});
      });

      setPreview({
        headers,
        rows: previewRows,
        totalRows: lines.length - 1
      });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;
      const errors = [];

      // Check for existing contacts
      const existingContacts = await getDocs(
        query(collection(db, 'contacts'), where('userId', '==', user.uid))
      );
      const existingEmails = new Set(
        existingContacts.docs.map(doc => doc.data().email?.toLowerCase())
      );

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const contactData = {
            userId: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'csv_import'
          };

          // Map CSV columns to contact fields
          headers.forEach((header, index) => {
            const fieldName = mappings[index];
            if (fieldName && values[index]) {
              if (fieldName === 'tags') {
                contactData[fieldName] = values[index].split(';').map(t => t.trim());
              } else if (fieldName === 'creditScore') {
                contactData[fieldName] = parseInt(values[index]) || 0;
              } else {
                contactData[fieldName] = values[index];
              }
            }
          });

          // Check for duplicate email
          if (contactData.email && existingEmails.has(contactData.email.toLowerCase())) {
            duplicateCount++;
            errors.push(`Row ${i}: Duplicate email ${contactData.email}`);
            continue;
          }

          // Validate required fields
          if (!contactData.firstName && !contactData.lastName && !contactData.email) {
            errorCount++;
            errors.push(`Row ${i}: Missing required fields`);
            continue;
          }

          await addDoc(collection(db, 'contacts'), contactData);
          successCount++;
          
          if (contactData.email) {
            existingEmails.add(contactData.email.toLowerCase());
          }
        } catch (err) {
          errorCount++;
          errors.push(`Row ${i}: ${err.message}`);
        }
      }

      setImportResult({
        success: successCount,
        errors: errorCount,
        duplicates: duplicateCount,
        errorDetails: errors.slice(0, 10) // Show max 10 errors
      });
    } catch (err) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleMappingChange = (columnIndex, fieldName) => {
    setMappings(prev => ({
      ...prev,
      [columnIndex]: fieldName
    }));
  };

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setError(null);
    setMappings({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,phone,company,address,city,state,zip,country,creditScore,notes,tags,status
John,Doe,john@example.com,555-0100,ABC Company,123 Main St,New York,NY,10001,USA,750,Sample note,tag1;tag2,active
Jane,Smith,jane@example.com,555-0101,XYZ Corp,456 Oak Ave,Los Angeles,CA,90001,USA,680,Another note,tag3,lead`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Contacts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Upload a CSV file to import multiple contacts at once
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Template</span>
          </button>
        </div>

        {!preview && !importResult && (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Maximum file size: 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select CSV File
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {preview && !importResult && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {file.name}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {preview.totalRows} rows detected
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetImport}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Map CSV Columns
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {preview.headers.map((header, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {header}
                    </label>
                    <select
                      value={mappings[index] || ''}
                      onChange={(e) => handleMappingChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Skip</option>
                      {csvFields.map(field => (
                        <option key={field} value={field}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Preview (First 5 rows)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      {preview.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                        >
                          {header}
                          {mappings[index] && (
                            <span className="block text-blue-600 dark:text-blue-400 normal-case">
                              → {mappings[index]}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {preview.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {preview.headers.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-4 py-2 text-sm text-gray-900 dark:text-gray-300"
                          >
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={resetImport}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Import {preview.totalRows} Contacts</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {importResult && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Import Complete!
            </h2>
            <div className="space-y-2 mb-6">
              <p className="text-green-600 dark:text-green-400">
                ✓ {importResult.success} contacts imported successfully
              </p>
              {importResult.duplicates > 0 && (
                <p className="text-yellow-600 dark:text-yellow-400">
                  ⚠ {importResult.duplicates} duplicates skipped
                </p>
              )}
              {importResult.errors > 0 && (
                <p className="text-red-600 dark:text-red-400">
                  ✗ {importResult.errors} errors occurred
                </p>
              )}
            </div>
            
            {importResult.errorDetails.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Error Details:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {importResult.errorDetails.map((err, index) => (
                    <li key={index}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetImport}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Import Another File
              </button>
              <button
                onClick={() => window.location.href = '/contacts'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Contacts
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportCSV;