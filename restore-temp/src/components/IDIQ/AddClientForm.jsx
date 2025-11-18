import React, { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  ssnLast4: '',
  score: '',
  enrolled: false,
  initialScore: '',
  activeDisputes: 0,
  resolvedDisputes: 0
};

const AddClientForm = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const validate = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.ssnLast4 || !form.score || !form.initialScore) {
      setError('All fields except disputes are required.');
      return false;
    }
    if (!/^\d{4}$/.test(form.ssnLast4)) {
      setError('SSN must be last 4 digits.');
      return false;
    }
    if (!/^\d{1,3}$/.test(form.score) || !/^\d{1,3}$/.test(form.initialScore)) {
      setError('Scores must be numbers.');
      return false;
    }
    if (isNaN(form.activeDisputes) || isNaN(form.resolvedDisputes)) {
      setError('Dispute counts must be numbers.');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'clients'), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        ssnLast4: form.ssnLast4,
        score: parseInt(form.score),
        enrolled: !!form.enrolled,
        initialScore: parseInt(form.initialScore),
        activeDisputes: parseInt(form.activeDisputes),
        resolvedDisputes: parseInt(form.resolvedDisputes),
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setForm(initialState);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to save client.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{background: '#fff', padding: 32, borderRadius: 10, minWidth: 340, boxShadow: '0 2px 16px #aaa', position: 'relative'}}>
        <h2 style={{fontSize: 22, fontWeight: 'bold', marginBottom: 18}}>Add New Client</h2>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: 12}}>
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="ssnLast4" value={form.ssnLast4} onChange={handleChange} placeholder="SSN (last 4)" maxLength={4} style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="score" value={form.score} onChange={handleChange} placeholder="Current Score" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="initialScore" value={form.initialScore} onChange={handleChange} placeholder="Initial Score" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <label style={{marginRight: 8}}>
              <input type="checkbox" name="enrolled" checked={form.enrolled} onChange={handleChange} /> Enrolled
            </label>
          </div>
          <div style={{marginBottom: 12}}>
            <input name="activeDisputes" value={form.activeDisputes} onChange={handleChange} placeholder="Active Disputes" type="number" min={0} style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="resolvedDisputes" value={form.resolvedDisputes} onChange={handleChange} placeholder="Resolved Disputes" type="number" min={0} style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          {error && <div style={{color: '#d32f2f', marginBottom: 10}}>{error}</div>}
          {success && <div style={{color: '#388e3c', marginBottom: 10}}>Client added successfully!</div>}
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

export default AddClientForm;
