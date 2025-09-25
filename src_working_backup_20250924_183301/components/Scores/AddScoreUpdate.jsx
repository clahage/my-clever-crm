import React, { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddScoreUpdate = ({ clientId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    date: '',
    experian: '',
    equifax: '',
    transunion: '',
    notes: ''
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
    if (!form.date || !form.experian || !form.equifax || !form.transunion) {
      setError('All score fields and date are required.');
      return false;
    }
    if (isNaN(form.experian) || isNaN(form.equifax) || isNaN(form.transunion)) {
      setError('Scores must be numbers.');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'clients', clientId, 'scoreHistory'), {
        date: form.date,
        experian: parseInt(form.experian),
        equifax: parseInt(form.equifax),
        transunion: parseInt(form.transunion),
        notes: form.notes,
        avgScore: Math.round((parseInt(form.experian) + parseInt(form.equifax) + parseInt(form.transunion)) / 3),
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to add score update.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{background: '#fff', padding: 32, borderRadius: 10, minWidth: 340, boxShadow: '0 2px 16px #aaa', position: 'relative'}}>
        <h2 style={{fontSize: 22, fontWeight: 'bold', marginBottom: 18}}>Add Score Update</h2>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: 12}}>
            <input name="date" value={form.date} onChange={handleChange} placeholder="Date" type="date" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="experian" value={form.experian} onChange={handleChange} placeholder="Experian Score" type="number" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="equifax" value={form.equifax} onChange={handleChange} placeholder="Equifax Score" type="number" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <input name="transunion" value={form.transunion} onChange={handleChange} placeholder="TransUnion Score" type="number" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc'}} />
          </div>
          <div style={{marginBottom: 12}}>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes (what changed)" style={{width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', minHeight: 60}} />
          </div>
          {error && <div style={{color: '#d32f2f', marginBottom: 10}}>{error}</div>}
          {success && <div style={{color: '#388e3c', marginBottom: 10}}>Score update added!</div>}
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

export default AddScoreUpdate;
