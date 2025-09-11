import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';

const TEMPLATES = [
  {
    type: 'initial',
    label: 'Initial Dispute Letter',
    body: `To Whom It May Concern,\n\nI am writing to dispute the following information on my credit report. Please investigate the items listed below and remove any inaccurate information.\n\nAccount Name: {{accountName}}\nAccount Number: {{accountNumber}}\nReason: {{reason}}\n\nSincerely,\n{{clientName}}\n{{clientAddress}}`
  },
  {
    type: 'followup',
    label: 'Follow-Up Letter',
    body: `To Whom It May Concern,\n\nThis is a follow-up to my previous dispute regarding the account below. Please provide an update on the investigation.\n\nAccount Name: {{accountName}}\nAccount Number: {{accountNumber}}\nDate of First Dispute: {{dateSent}}\n\nSincerely,\n{{clientName}}\n{{clientAddress}}`
  },
  {
    type: 'goodwill',
    label: 'Goodwill Letter',
    body: `To Whom It May Concern,\n\nI am requesting a goodwill adjustment for the following account, which has been paid in full. Please consider removing the negative mark as a gesture of goodwill.\n\nAccount Name: {{accountName}}\nAccount Number: {{accountNumber}}\n\nSincerely,\n{{clientName}}\n{{clientAddress}}`
  },
  {
    type: 'identity',
    label: 'Identity Theft Letter',
    body: `To Whom It May Concern,\n\nI am a victim of identity theft and am disputing the following fraudulent account. Please investigate and remove this item from my credit report.\n\nAccount Name: {{accountName}}\nAccount Number: {{accountNumber}}\n\nSincerely,\n{{clientName}}\n{{clientAddress}}`
  },
  {
    type: 'verification',
    label: 'Verification Request Letter',
    body: `To Whom It May Concern,\n\nI am requesting verification of the following account. Please provide documentation supporting its accuracy.\n\nAccount Name: {{accountName}}\nAccount Number: {{accountNumber}}\n\nSincerely,\n{{clientName}}\n{{clientAddress}}`
  },
];

function mailMerge(template, data) {
  let result = template;
  Object.keys(data).forEach(key => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key] || '');
  });
  return result;
}

export default function DisputeLetterGenerator({ client = {} }) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].type);
  const [fields, setFields] = useState({
    clientName: client.name || '',
    clientAddress: client.address || '',
    accountName: '',
    accountNumber: '',
    reason: '',
    dateSent: '',
  });
  const [status, setStatus] = useState('draft');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [letters, setLetters] = useState([]);

  // Load existing letters for this client
  useEffect(() => {
    async function fetchLetters() {
      if (!client.id) return;
      const q = query(collection(db, 'disputeLetters'), where('clientId', '==', client.id));
      const snapshot = await getDocs(q);
      setLetters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchLetters();
  }, [client.id]);

  const templateObj = TEMPLATES.find(t => t.type === selectedTemplate);
  const letterPreview = mailMerge(templateObj.body, fields);

  const handleFieldChange = e => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = e => {
    setSelectedTemplate(e.target.value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'disputeLetters'), {
        clientId: client.id || '',
        templateType: selectedTemplate,
        dateSent: fields.dateSent ? Timestamp.fromDate(new Date(fields.dateSent)) : null,
        status,
        clientInfo: {
          name: fields.clientName,
          address: fields.clientAddress,
          ssn: client.ssn || '',
        },
        accountDetails: {
          creditor: fields.accountName,
          accountNumber: fields.accountNumber,
          disputeReason: fields.reason,
          amount: client.amount || 0,
        },
        responseDeadline: fields.dateSent ? Timestamp.fromDate(new Date(new Date(fields.dateSent).getTime() + 30*24*60*60*1000)) : null,
        notes,
      });
      setSaving(false);
      alert('Letter saved to database!');
    } catch (err) {
      setSaving(false);
      alert('Error saving letter: ' + err.message);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.text('Speedy Credit Repair', 10, 10);
    doc.text(letterPreview, 10, 30);
    doc.save('dispute_letter.pdf');
  };

  return (
    <section className="bg-white rounded-2xl shadow-2xl p-8 mb-8 w-full max-w-2xl mx-auto border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Dispute Letter Generator</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Template</label>
        <select value={selectedTemplate} onChange={handleTemplateChange} className="w-full border rounded px-2 py-1">
          {TEMPLATES.map(t => (
            <option key={t.type} value={t.type}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-semibold mb-1">Client Name</label>
          <input type="text" name="clientName" value={fields.clientName} onChange={handleFieldChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Client Address</label>
          <input type="text" name="clientAddress" value={fields.clientAddress} onChange={handleFieldChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Account Name</label>
          <input type="text" name="accountName" value={fields.accountName} onChange={handleFieldChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Account Number</label>
          <input type="text" name="accountNumber" value={fields.accountNumber} onChange={handleFieldChange} className="w-full border rounded px-2 py-1" />
        </div>
        {selectedTemplate === 'initial' && (
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1">Reason for Dispute</label>
            <input type="text" name="reason" value={fields.reason} onChange={handleFieldChange} className="w-full border rounded px-2 py-1" />
          </div>
        )}
        {selectedTemplate === 'followup' && (
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1">Date of First Dispute</label>
            <input type="date" name="dateSent" value={fields.dateSent} onChange={handleFieldChange} className="w-full border rounded px-2 py-1" />
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Letter Preview</label>
        <textarea value={letterPreview} readOnly className="w-full border rounded px-2 py-1" rows={10} />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border rounded px-2 py-1" rows={2} />
      </div>
      <div className="flex gap-4">
        <button onClick={exportPDF} className="px-4 py-2 bg-green-600 text-white rounded font-bold shadow">Export as PDF</button>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded font-bold shadow">{saving ? 'Saving...' : 'Save to Database'}</button>
      </div>
      {letters.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-2">Saved Letters</h3>
          <ul className="list-disc ml-6">
            {letters.map(l => (
              <li key={l.id} className="mb-2">
                <span className="font-semibold">{l.templateType}</span> - Status: <span className="font-bold">{l.status}</span> - Sent: {l.dateSent?.toDate ? l.dateSent.toDate().toLocaleDateString() : ''}
                <br />Account: {l.accountDetails?.creditor} #{l.accountDetails?.accountNumber}
                <br />Deadline: {l.responseDeadline?.toDate ? l.responseDeadline.toDate().toLocaleDateString() : ''}
                <br />Notes: {l.notes}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
