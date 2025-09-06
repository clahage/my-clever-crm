import React, { useState } from 'react';
import EditClientForm from './EditClientForm';
import CreateDisputeForm from '../Disputes/CreateDisputeForm';
import AddScoreUpdate from '../Scores/AddScoreUpdate';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from "@/lib/firebase";

const ClientDetailView = ({ client, onClose, onEdit, onDelete, onRefresh }) => {
  if (!client) return null;
  const [showConfirm, setShowConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [loadingDisputes, setLoadingDisputes] = useState(true);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);
  // Fetch score history for client
  React.useEffect(() => {
    if (!client?.id) return;
    const fetchScores = async () => {
      setLoadingScores(true);
      try {
        const q = query(collection(db, 'clients', client.id, 'scoreHistory'), orderBy('date', 'asc'));
        const snap = await getDocs(q);
        const scoreList = [];
        snap.forEach(docSnap => {
          scoreList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setScoreHistory(scoreList);
      } catch (err) {
        setScoreHistory([]);
      } finally {
        setLoadingScores(false);
      }
    };
    fetchScores();
  }, [client, showScoreForm]);
  const handleAddScore = () => {
    setShowScoreForm(true);
  };
  const handleCloseScoreForm = () => {
    setShowScoreForm(false);
  };
  const handleScoreAdded = () => {
    setShowScoreForm(false);
    // Will auto-refresh score history via useEffect
  };
  // Fetch disputes for client
  React.useEffect(() => {
    if (!client?.id) return;
    const fetchDisputes = async () => {
      setLoadingDisputes(true);
      try {
        const q = query(collection(db, 'clients', client.id, 'disputes'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const disputeList = [];
        snap.forEach(docSnap => {
          disputeList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setDisputes(disputeList);
      } catch (err) {
        setDisputes([]);
      } finally {
        setLoadingDisputes(false);
      }
    };
    fetchDisputes();
  }, [client, showDisputeForm]);
  const handleCreateDispute = () => {
    setShowDisputeForm(true);
  };
  const handleCloseDisputeForm = () => {
    setShowDisputeForm(false);
  };
  const handleDisputeCreated = () => {
    setShowDisputeForm(false);
    // Will auto-refresh disputes via useEffect
  };

  const handleEditClick = () => {
    setEditing(true);
  };
  const handleEditClose = () => {
    setEditing(false);
  };
  const handleEditSuccess = () => {
    setEditing(false);
    if (onRefresh) onRefresh();
  };

  return (
    <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{background: '#fff', padding: 32, borderRadius: 10, minWidth: 340, boxShadow: '0 2px 16px #aaa', position: 'relative'}}>
        <h2 style={{fontSize: 22, fontWeight: 'bold', marginBottom: 18}}>Client Details</h2>
        {editing ? (
          <EditClientForm client={client} onClose={handleEditClose} onSuccess={handleEditSuccess} />
        ) : (
          <>
            <div style={{marginBottom: 16}}>
              <div><strong>Name:</strong> {client.firstName} {client.lastName}</div>
              <div><strong>Email:</strong> {client.email}</div>
              <div><strong>Phone:</strong> {client.phone}</div>
              <div><strong>SSN (last 4):</strong> {client.ssnLast4}</div>
              <div><strong>Score:</strong> {client.score}</div>
              <div style={{marginTop: 10, display: 'flex', gap: 12}}>
                <button onClick={handleCreateDispute} style={{padding: '8px 18px', fontSize: 16, background: '#ffa726', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>Create Dispute</button>
                <button onClick={handleAddScore} style={{padding: '8px 18px', fontSize: 16, background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>Update Scores</button>
              </div>
            </div>
            {showScoreForm && (
              <AddScoreUpdate clientId={client.id} onClose={handleCloseScoreForm} onSuccess={handleScoreAdded} />
            )}
            <div style={{marginTop: 18}}>
              <h3 style={{fontWeight: 'bold', fontSize: 17}}>Score History ({scoreHistory.length})</h3>
              {loadingScores ? (
                <div style={{color: '#888'}}>Loading score history...</div>
              ) : scoreHistory.length === 0 ? (
                <div style={{color: '#888'}}>No score history found.</div>
              ) : (
                <ul style={{marginTop: 8}}>
                  {scoreHistory.map(s => (
                    <li key={s.id} style={{marginBottom: 8, background: '#e8f5e9', padding: 10, borderRadius: 6}}>
                      <div><strong>Date:</strong> {s.date}</div>
                      <div><strong>Experian:</strong> {s.experian}</div>
                      <div><strong>Equifax:</strong> {s.equifax}</div>
                      <div><strong>TransUnion:</strong> {s.transunion}</div>
                      <div><strong>Avg Score:</strong> {s.avgScore}</div>
                      <div><strong>Notes:</strong> {s.notes}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {showDisputeForm && (
              <CreateDisputeForm clientId={client.id} onClose={handleCloseDisputeForm} onSuccess={handleDisputeCreated} />
            )}
            <div style={{marginTop: 18}}>
              <h3 style={{fontWeight: 'bold', fontSize: 17}}>Disputes ({disputes.length})</h3>
              {loadingDisputes ? (
                <div style={{color: '#888'}}>Loading disputes...</div>
              ) : disputes.length === 0 ? (
                <div style={{color: '#888'}}>No disputes found.</div>
              ) : (
                <ul style={{marginTop: 8}}>
                  {disputes.map(d => (
                    <li key={d.id} style={{marginBottom: 8, background: '#f6f6ff', padding: 10, borderRadius: 6}}>
                      <div><strong>Creditor:</strong> {d.creditor}</div>
                      <div><strong>Account #:</strong> {d.accountNumber}</div>
                      <div><strong>Type:</strong> {d.type}</div>
                      <div><strong>Status:</strong> {d.status}</div>
                      <div><strong>Date:</strong> {d.dateSubmitted ? new Date(d.dateSubmitted).toLocaleDateString() : ''}</div>
                      <div><strong>Reason:</strong> {d.reason}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 10}}>
              <button onClick={handleEditClick} style={{padding: '8px 18px', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>Edit</button>
              <button onClick={() => setShowConfirm(true)} style={{padding: '8px 18px', fontSize: 16, background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>Delete</button>
              <button onClick={onClose} style={{padding: '8px 18px', fontSize: 16, background: '#aaa', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>Close</button>
            </div>
            {showConfirm && (
              <div style={{marginTop: 18, background: '#fff7f7', padding: 12, borderRadius: 6, boxShadow: '0 1px 4px #eee'}}>
                <div style={{marginBottom: 10}}>Are you sure you want to delete this client?</div>
                <button onClick={() => { setShowConfirm(false); onDelete(); }} style={{padding: '6px 16px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', marginRight: 8}}>Yes, Delete</button>
                <button onClick={() => setShowConfirm(false)} style={{padding: '6px 16px', background: '#aaa', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold'}}>Cancel</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientDetailView;
