import React, { useState } from 'react';

const DocumentUpload = ({ onParsed }) => {
  const [autoParse, setAutoParse] = useState(true);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const serverFilePath = `c:\\SCR Project\\my-clever-crm\\server\\uploads\\documents\\${file.name}`;
    if (autoParse) {
      fetch('http://localhost:5000/api/parsepdf/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: serverFilePath })
      })
        .then(res => res.json())
        .then(data => {
          window.parsedPdfText = data.text;
          setLoading(false);
          if (onParsed) onParsed(data.text);
        })
        .catch(err => {
          setLoading(false);
          setError('Error parsing PDF');
          console.error('Error:', err);
        });
    } else {
      setLoading(false);
      if (onParsed) onParsed(null);
    }
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1em' }}>
        <input
          type="checkbox"
          checked={autoParse}
          onChange={() => setAutoParse(!autoParse)}
          style={{ marginRight: '0.5em' }}
        />
        <span>Auto-parse after upload</span>
      </label>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || loading} style={{ marginLeft: '1em' }}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
};

export default DocumentUpload;
