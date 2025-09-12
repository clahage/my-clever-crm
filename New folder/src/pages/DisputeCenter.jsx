import React, { useEffect, useState } from 'react';
import { db } from "../lib/firebase";
import { collectionGroup, query, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';

const statusOptions = ['pending', 'active', 'resolved'];

const DisputeCenter = () => {
  const [disputes, setDisputes] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientNames, setClientNames] = useState({});
  const [modal, setModal] = useState({ open: false, dispute: null });

  // Real-time disputes and client name lookup
  useEffect(() => {
    setLoading(true);
    const q = query(collectionGroup(db, 'disputes'));
    const unsub = onSnapshot(q, async (snap) => {
      const allDisputes = [];
      const clientIds = new Set();
      snap.forEach(docSnap => {
        const pathParts = docSnap.ref.path.split('/');
        const clientId = pathParts[pathParts.indexOf('clients') + 1];
        allDisputes.push({ id: docSnap.id, clientId, ...docSnap.data() });
        clientIds.add(clientId);
      });
      setDisputes(allDisputes);
      // Fetch client names
      const names = {};
      await Promise.all([...clientIds].map(async id => {
        const clientDoc = await getDoc(doc(db, 'clients', id));
        names[id] = clientDoc.exists() ? clientDoc.data().name || id : id;
      }));
      setClientNames(names);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = disputes.filter(d =>
    (!filter || d.status === filter) &&
    (!search || (d.creditor?.toLowerCase().includes(search.toLowerCase()) || (clientNames[d.clientId] || d.clientId).toLowerCase().includes(search.toLowerCase())))
  );

  const handleStatusChange = async (dispute, newStatus) => {
    await updateDoc(doc(db, 'clients', dispute.clientId, 'disputes', dispute.id), { status: newStatus });
  };

  const handleSelect = id => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };
  const selectAll = () => setSelected(filtered.map(d => d.id));
  const clearSelect = () => setSelected([]);

  const handleExportCSV = () => {
    const rows = [
      ['Client Name', 'Creditor', 'Status', 'Date Submitted', 'Reason', 'Type'],
      ...filtered.map(d => [clientNames[d.clientId] || d.clientId, d.creditor, d.status, d.dateSubmitted, d.reason, d.type])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'disputes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bulk actions
  const bulkUpdateStatus = async (newStatus) => {
    await Promise.all(selected.map(async id => {
      const dispute = disputes.find(d => d.id === id);
      if (dispute) {
        await updateDoc(doc(db, 'clients', dispute.clientId, 'disputes', id), { status: newStatus });
      }
    }));
    clearSelect();
  };
  const bulkDelete = async () => {
    await Promise.all(selected.map(async id => {
      const dispute = disputes.find(d => d.id === id);
      if (dispute) {
        await updateDoc(doc(db, 'clients', dispute.clientId, 'disputes', id), { deleted: true }); // Soft delete
      }
    }));
    clearSelect();
  };

  return (
    <div style={{padding: 32}}>
      <h1 style={{fontSize: 28, fontWeight: 'bold', marginBottom: 18}}>Dispute Center</h1>
      <div style={{display: 'flex', gap: 18, marginBottom: 18}}>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{padding: 8, fontSize: 15, borderRadius: 6}}>
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client or creditor" style={{padding: 8, fontSize: 15, borderRadius: 6, minWidth: 220}} />
        <button onClick={selectAll} style={{padding: '8px 14px', background: '#eee', border: 'none', borderRadius: 6}}>Select All</button>
        <button onClick={clearSelect} style={{padding: '8px 14px', background: '#eee', border: 'none', borderRadius: 6}}>Clear</button>
        <button onClick={() => bulkUpdateStatus('resolved')} disabled={!selected.length} style={{padding: '8px 14px', background: '#43a047', color: '#fff', border: 'none', borderRadius: 6}}>Bulk Resolve</button>
        <button onClick={bulkDelete} disabled={!selected.length} style={{padding: '8px 14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6}}>Bulk Delete</button>
        <button onClick={handleExportCSV} style={{padding: '8px 18px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold'}}>Export to CSV</button>
      </div>
      {loading ? (
        <div>Loading disputes...</div>
      ) : (
        <table style={{width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee'}}>
          <thead>
            <tr style={{background: '#f5f7fa'}}>
              <th style={{padding: 10}}></th>
              <th style={{padding: 10}}>Client Name</th>
              <th style={{padding: 10}}>Creditor</th>
              <th style={{padding: 10}}>Status</th>
              <th style={{padding: 10}}>Date Submitted</th>
              <th style={{padding: 10}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: 10}}>
                  <input type="checkbox" checked={selected.includes(d.id)} onChange={() => handleSelect(d.id)} />
                </td>
                <td style={{padding: 10}}>{clientNames[d.clientId] || d.clientId}</td>
                <td style={{padding: 10}}>{d.creditor}</td>
                <td style={{padding: 10}}>
                  <select value={d.status} onChange={e => handleStatusChange(d, e.target.value)} style={{padding: 6, borderRadius: 4}}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{padding: 10}}>{d.dateSubmitted ? new Date(d.dateSubmitted).toLocaleDateString() : ''}</td>
                <td style={{padding: 10}}>
                  <button onClick={() => setModal({ open: true, dispute: d })} style={{padding: '6px 14px', background: '#ffa726', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold'}}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal for dispute details */}
      {modal.open && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999}}>
          <div style={{background: '#fff', padding: 32, borderRadius: 12, minWidth: 400, maxWidth: 600}}>
            <h2>Dispute Details</h2>
            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{JSON.stringify(modal.dispute, null, 2)}</pre>
            <button onClick={() => setModal({ open: false, dispute: null })} style={{marginTop: 18, padding: '8px 18px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeCenter;
