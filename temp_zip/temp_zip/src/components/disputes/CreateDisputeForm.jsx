import React, { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const disputeTypes = [
  'Collections',
  'Late Payment',
  'Identity Theft',
  'Other'
];
const disputeStatuses = [
  'pending',
  'active',
  'resolved'
];

const CreateDisputeForm = ({ clientId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    creditor: '',
    accountNumber: '',
    reason: '',
    type: disputeTypes[0],
    status: disputeStatuses[0],
    dateSubmitted: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.creditor || !form.accountNumber || !form.reason || !form.type || !form.status) {
      setError('All fields except date are required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'clients', clientId, 'disputes'), {
        creditor: form.creditor,
        accountNumber: form.accountNumber,
        reason: form.reason,
        type: form.type,
        status: form.status,
        dateSubmitted: form.dateSubmitted || new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to create dispute.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{background: '#fff', padding: 32, borderRadius: 10, minWidth: 340, boxShadow: '0 2px 16px #aaa', position: 'relative'}}>
        <h2 style={{fontSize: 22, fontWeight: 'bold', marginBottom: 18}}>Create Dispute</h2>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: 12}}>
            <input name="creditor" value={form.creditor} onChange={handleChange} placeholder="Creditor" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account Number" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <select name="type" value={form.type} onChange={handleChange} style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}}>
              {disputeTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{marginBottom: 12}}>
            <select name="status" value={form.status} onChange={handleChange} style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}}>
              {disputeStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{marginBottom: 12}}>
            <input name="dateSubmitted" value={form.dateSubmitted} onChange={handleChange} placeholder="Date Submitted (optional)" type="date" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          {error && <div style={{color: '#d32f2f', marginBottom: 10}}>{error}</div>}
          {success && <div style={{color: '#388e3c', marginBottom: 10}}>Dispute created successfully!</div>}
          <div style={{display: 'flex', gap: 12, marginTop: 10}}>
            <button type="submit" disabled={loading} style={{padding: '8px 18px', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} style={{padding: '8px 18px', fontSize: 16, background: '#aaa', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDisputeForm;
