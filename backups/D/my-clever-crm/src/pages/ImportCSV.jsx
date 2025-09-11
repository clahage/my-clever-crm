// scr-admin-vite/src/pages/ImportCSV.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Card from '../components/ui/card';
import Button from '../components/ui/button';
import Loader from '../components/ui/loader';

function ImportCSV() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewData, setPreviewData] = useState(null); // NEW: State for preview data

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setMessage('');
    setPreviewData(null); // Clear previous preview

    if (file) {
      // Simulate reading file content for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        // Basic CSV parsing for preview (first few lines)
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim());
          const sampleRows = lines.slice(1, Math.min(4, lines.length)).map(line => {
            const values = line.split(',').map(v => v.trim());
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index] || '';
              return obj;
            }, {});
          });
          setPreviewData({ headers, rows: sampleRows });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setMessage('Uploading and processing CSV...');

    // Simulate API call or file processing
    setTimeout(() => {
      // ...removed for production...
      setMessage(`Successfully processed ${selectedFile.name}! (Placeholder success)`);
      setSelectedFile(null); // Clear selected file after "upload"
      setPreviewData(null); // Clear preview after "upload"
      setIsLoading(false);
    }, 2000); // Simulate 2-second upload time
  };

  return (
    <>
      <Helmet>
        <title>Import CSV | SpeedyCRM</title>
        <meta name="description" content="Import client lead data from CSV files for SpeedyCRM." />
      </Helmet>
      <h2 className="text-2xl font-bold mb-4">Import Leads from CSV</h2>
      <Card className="p-6">
        <p className="mb-4">
          Upload a CSV file containing your client leads. Ensure the file is correctly formatted with relevant columns.
        </p>
        <div className="mb-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100
                       dark:file:bg-gray-700 dark:file:text-white dark:hover:file:bg-gray-600"
          />
          {selectedFile && (
            <p className="mt-2 text-gray-600 dark:text-gray-300">Selected file: {selectedFile.name}</p>
          )}
        </div>
        <Button onClick={handleUpload} disabled={!selectedFile || isLoading}>
          {isLoading ? 'Uploading...' : 'Upload CSV'}
        </Button>
        {isLoading && <Loader className="mt-4" />}
        {message && <p className="mt-4 text-sm text-green-600 dark:text-green-400">{message}</p>}

        {/* NEW: Display CSV Preview */}
        {previewData && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">CSV Preview (First few rows)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {previewData.headers.map((header, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {previewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {previewData.headers.map((header, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              (This is a basic preview. Full CSV parsing and validation will be implemented with backend integration.)
            </p>
          </div>
        )}
      </Card>
    </>
  );
}

export default ImportCSV;