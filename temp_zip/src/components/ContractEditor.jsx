import React, { useState } from "react";
import { SIGNATURE_PROVIDERS, getProviderHandler } from "../utils/eSignatureProviders";

// For MVP, use a textarea for template, and a simple signature pad
const defaultTemplate = `Contract Title: {{title}}
Client Name: {{clientName}}
Date: {{date}}

Terms:
{{terms}}

Signature: ___________________________`;

const ContractEditor = ({ contract, onClose }) => {
  const [template, setTemplate] = useState(contract?.template || defaultTemplate);
  const [fields, setFields] = useState({
    title: contract?.title || "",
    clientName: contract?.clientName || "",
    date: contract?.date || new Date().toLocaleDateString(),
    terms: contract?.terms || "",
    signature: contract?.signature || ""
  });
  const [signed, setSigned] = useState(!!contract?.signature);
  const [provider, setProvider] = useState('docusign');

  const handleChange = e => setFields({ ...fields, [e.target.name]: e.target.value });

  const handleSign = () => setSigned(true);

  const handleSendForSignature = () => {
    const handler = getProviderHandler(provider);
    handler({ ...fields, template });
  };

  const handleSave = () => {
    // TODO: Save to Firestore
    alert("Contract saved (Firestore integration needed)");
    onClose();
  };

  const filledTemplate = template
    .replace("{{title}}", fields.title)
    .replace("{{clientName}}", fields.clientName)
    .replace("{{date}}", fields.date)
    .replace("{{terms}}", fields.terms)
    .replace("___________________________", signed ? fields.clientName : "___________________________");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">{contract ? "Edit Contract" : "New Contract"}</h2>
        <input className="mb-2 w-full border p-2 rounded" name="title" placeholder="Title" value={fields.title} onChange={handleChange} />
        <input className="mb-2 w-full border p-2 rounded" name="clientName" placeholder="Client Name" value={fields.clientName} onChange={handleChange} />
        <input className="mb-2 w-full border p-2 rounded" name="date" placeholder="Date" value={fields.date} onChange={handleChange} />
        <textarea className="mb-2 w-full border p-2 rounded" name="terms" placeholder="Terms" value={fields.terms} onChange={handleChange} rows={4} />
        <div className="mb-4 border p-2 rounded bg-gray-50 whitespace-pre-wrap min-h-[120px]">{filledTemplate}</div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">E-Signature Provider</label>
          <select className="w-full border p-2 rounded" value={provider} onChange={e => setProvider(e.target.value)}>
            {SIGNATURE_PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded mb-2 w-full" onClick={handleSendForSignature}>
          Send for Signature
        </button>
        {!signed && <button className="px-4 py-2 bg-green-600 text-white rounded w-full" onClick={handleSign}>Sign as Client (Built-in)</button>}
        {signed && <div className="mb-2 text-green-700 font-semibold">Signed by {fields.clientName}</div>}
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded w-full" onClick={handleSave}>Save Contract</button>
      </div>
    </div>
  );
};

export default ContractEditor;
