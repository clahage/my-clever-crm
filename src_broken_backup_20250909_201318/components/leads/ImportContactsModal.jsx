// ImportContactsModal.jsx
import React, { useState } from "react";
import { importLeadsFromCsv } from "@/services/firestore/leads";

function parseCsv(text) {
  // Simple CSV parser: handles quoted fields, commas
  const rows = [];
  let inQuotes = false, field = '', row = [];
  for (let i = 0; i < text.length; ++i) {
    const c = text[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) { row.push(field); field = ''; }
    else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (field || row.length) { row.push(field); rows.push(row); field = ''; row = []; }
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1);
}

export default function ImportContactsModal({ open, onClose, onSuccess }) {
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({ name: 0, email: 1, phone: 2, status: 3, source: 4, notes: 5 });
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e2 => {
      const text = e2.target.result;
      setCsv(text);
      const parsed = parseCsv(text);
      setRows(parsed);
      setPreview(parsed.slice(0, 20));
    };
    reader.readAsText(file);
  }

  function handleMapChange(field, idx) {
    setMapping(m => ({ ...m, [field]: Number(idx) }));
  }

  async function handleImport() {
    setImporting(true);
    const mappedRows = rows.map(r => ({
      name: r[mapping.name] || "",
      email: r[mapping.email] || "",
      phone: r[mapping.phone] || "",
      status: r[mapping.status] || "New",
      source: r[mapping.source] || "",
      notes: r[mapping.notes] || "",
    }));
    const res = await importLeadsFromCsv(mappedRows);
    setResult(res);
    setImporting(false);
    if (res.inserted > 0) onSuccess && onSuccess(res);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-2">Import Leads from CSV</h2>
        <input type="file" accept=".csv" onChange={handleFile} className="mb-2" />
        {preview.length > 0 && (
          <>
            <div className="mb-2">
              <strong>Preview (first 20 rows):</strong>
              <table className="w-full text-xs border mt-1">
                <thead><tr>{preview[0].map((h, i) => <th key={i} className="border px-1">Col {i+1}</th>)}</tr></thead>
                <tbody>{preview.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border px-1">{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <div className="mb-2">
              <strong>Map columns:</strong>
              {["name","email","phone","status","source","notes"].map(f => (
                <label key={f} className="block text-xs mb-1">{f}: <select value={mapping[f]} onChange={e => handleMapChange(f, e.target.value)}>{preview[0].map((_,i) => <option key={i} value={i}>Col {i+1}</option>)}</select></label>
              ))}
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleImport} disabled={importing}>{importing ? "Importing..." : "Import"}</button>
          </>
        )}
        {result && (
          <div className="mt-2 text-sm">
            <div>Inserted: {result.inserted}, Failed: {result.failed}</div>
            {result.errors && result.errors.length > 0 && (
              <ul className="text-red-600 mt-1">{result.errors.map(e => <li key={e.rowIndex}>Row {e.rowIndex+1}: {e.reason}</li>)}</ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
