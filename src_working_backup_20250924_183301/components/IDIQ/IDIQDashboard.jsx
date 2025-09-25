import React, { useState, useEffect } from 'react';
import CreditAnalytics from '../IDIQIntegration/CreditAnalytics';
import ClientCreditCard from '../IDIQIntegration/ClientCreditCard';
import AddClientForm from './AddClientForm';
import ClientDetailView from './ClientDetailView';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from "../lib/firebase";

// --- Real Metrics ---
// These must be inside the component, after clients is defined

const IDIQDashboard = () => {
  const [mode, setMode] = useState(() => localStorage.getItem('idiqMode') || 'mock');
  const [clients, setClients] = useState([]); // <-- Initialize clients state
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [disputePipeline, setDisputePipeline] = useState(initialDisputePipeline);
  const [scoreDistribution, setScoreDistribution] = useState(initialScoreDistribution);
  const [showAddClient, setShowAddClient] = useState(false);

  useEffect(() => {
    localStorage.setItem('idiqMode', mode);
  }, [mode]);

  // Fetch clients from Firestore
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const clientList = [];
        snap.forEach(docSnap => {
          clientList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setClients(clientList);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, [showAddClient]);

  const isLive = mode === 'live';

  // --- Interactivity Handlers ---
  const handleClientClick = (client) => {
    setSelectedClient(client);
  };
  const handleCloseDetail = () => {
    setSelectedClient(null);
  };
  const handleEditClient = () => {
    alert('Edit feature coming soon');
  };
  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    try {
      await deleteDoc(doc(db, 'clients', selectedClient.id));
      setSelectedClient(null);
      // Refresh client list
      const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const clientList = [];
      snap.forEach(docSnap => {
        clientList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setClients(clientList);
    } catch (err) {
      alert('Failed to delete client');
      console.error(err);
    }
  };
  const handleRefresh = () => {
    // Slightly change mock numbers for demo
    setClients(clients.map(c => ({ ...c, score: c.score + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10) })));
    setDisputePipeline(disputePipeline.map(d => ({ ...d, count: d.count + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2) })));
    setScoreDistribution(scoreDistribution.map(s => ({ ...s, count: Math.max(0, s.count + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)) })));
  };
  const handleViewDetails = (status) => {
    console.log('View Details for status:', status);
  };
  const handleScoreBarClick = (range, count) => {
    alert(`${count} clients in ${range} range`);
  };
  const handleAddClient = () => {
    setShowAddClient(true);
  };
  const handleCloseAddClient = () => {
    setShowAddClient(false);
  };
  const handleClientAdded = async () => {
    // Simulate refresh: In real app, fetch from Firestore
    setShowAddClient(false);
    // Optionally, you could fetch updated clients from Firestore here
    // For demo, just refresh mock data
    setClients([...clients]);
  };

  // --- Styles ---
  const clientStyle = {
    cursor: 'pointer',
    color: '#176c2f',
    textDecoration: 'underline',
    fontWeight: 'bold',
    transition: 'color 0.2s',
  };

  return (
    <div style={{padding: 32}}>
      <h1 style={{fontSize: 28, fontWeight: 'bold'}}>IDIQ Integration Dashboard</h1>
      <button onClick={handleAddClient} style={{marginBottom: 16, padding: '8px 18px', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>
        Add New Client
      </button>
      {showAddClient && (
        <AddClientForm onClose={handleCloseAddClient} onSuccess={handleClientAdded} />
      )}
      {selectedClient && (
        <ClientDetailView
          client={selectedClient}
          onClose={handleCloseDetail}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          onRefresh={async () => {
            // Refresh client list and detail view after edit
            const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const clientList = [];
            snap.forEach(docSnap => {
              clientList.push({ id: docSnap.id, ...docSnap.data() });
            });
            setClients(clientList);
            // Update selectedClient with latest data
            const updated = clientList.find(c => c.id === selectedClient.id);
            if (updated) setSelectedClient(updated);
          }}
        />
      )}
      <div style={{marginBottom: 16}}>
        <label style={{fontWeight: 'bold', marginRight: 12}}>Mode:</label>
        <select
          value={mode}
          onChange={e => setMode(e.target.value)}
          style={{padding: '4px 12px', fontSize: 16}}
        >
          <option value="mock">Mock Mode</option>
          <option value="live" disabled>Live Mode (IAM not configured)</option>
        </select>
      </div>
      {isLive ? (
        <div style={{background: '#d4f7d4', color: '#176c2f', padding: 12, borderRadius: 6, marginBottom: 16, fontWeight: 'bold'}}>
          Connected to IDIQ API (Live Mode)
        </div>
      ) : (
        <div style={{background: '#fff7d4', color: '#a67c00', padding: 12, borderRadius: 6, marginBottom: 16, fontWeight: 'bold'}}>
          Using Mock Data (Mock Mode)
        </div>
      )}

      {/* --- Analytics Section --- */}
      <div style={{marginBottom: 24, background: '#e3f2fd', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px #eee'}}>
        <h2 style={{fontSize: 20, fontWeight: 'bold', marginBottom: 12}}>Analytics</h2>
        <div style={{display: 'flex', gap: 32}}>
          <div><strong>Total Clients:</strong> {totalClients}</div>
          <div><strong>Enrolled:</strong> {enrolledClients}</div>
          <div><strong>Active Disputes:</strong> {activeDisputes}</div>
          <div><strong>Resolved:</strong> {resolvedDisputes}</div>
          <div><strong>Avg Score Gain:</strong> {avgScoreGain}</div>
        </div>
      </div>

      {/* --- Recent Activity Section --- */}
      <div style={{marginBottom: 24, background: '#f9f9f9', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px #eee'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{fontSize: 22, fontWeight: 'bold'}}>Recent Activity</h2>
          <button onClick={handleRefresh} style={{padding: '6px 16px', fontSize: 15, background: '#ffa726', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>Refresh Data</button>
        </div>
        {loadingClients ? (
          <div style={{marginTop: 16, color: '#888'}}>Loading clients...</div>
        ) : (
          <ul style={{marginTop: 12}}>
            {recentActivity.map((act, idx) => (
              <li key={idx} style={{marginBottom: 8}}>
                <span
                  style={clientStyle}
                  onClick={() => handleClientClick(act.client)}
                  onMouseOver={e => (e.target.style.color = '#1976d2')}
                  onMouseOut={e => (e.target.style.color = '#176c2f')}
                >
                  {act.name}
                </span>
                {` - ${act.action} (${act.ago})`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{marginBottom: 24, background: '#f6f6ff', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px #eee'}}>
        <h2 style={{fontSize: 20, fontWeight: 'bold'}}>Dispute Pipeline</h2>
        <div style={{display: 'flex', gap: 24, marginTop: 12}}>
          {disputePipeline.map(dp => (
            <div key={dp.status} style={{background: '#fff', borderRadius: 6, padding: 16, boxShadow: '0 1px 4px #ddd', minWidth: 120, textAlign: 'center'}}>
              <div style={{fontSize: 18, fontWeight: 'bold'}}>{dp.count}</div>
              <div style={{fontSize: 15, color: '#555'}}>{dp.status}</div>
              <button onClick={() => handleViewDetails(dp.status)} style={{marginTop: 8, padding: '4px 10px', fontSize: 13, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>View Details</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginBottom: 24, background: '#e8f5e9', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px #eee'}}>
        <h2 style={{fontSize: 20, fontWeight: 'bold'}}>Score Distribution</h2>
        <div style={{display: 'flex', gap: 18, marginTop: 12}}>
          {scoreDistribution.map(sd => (
            <div
              key={sd.range}
              style={{background: '#fff', borderRadius: 6, padding: 16, boxShadow: '0 1px 4px #ddd', minWidth: 100, textAlign: 'center', cursor: 'pointer'}}
              onClick={() => handleScoreBarClick(sd.range, sd.count)}
            >
              <div style={{fontSize: 17, fontWeight: 'bold'}}>{sd.count} ({sd.percent}%)</div>
              <div style={{fontSize: 14, color: '#388e3c'}}>{sd.range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conditional data fetching based on mode */}
      <CreditAnalytics mode={mode} />
      <ClientCreditCard mode={mode} />
    </div>
  );
};

// Add safe fallbacks for initialDisputePipeline and initialScoreDistribution
const initialDisputePipeline = { new: 0, investigating: 0, resolved: 0 };
const initialScoreDistribution = [0, 0, 0];

export default IDIQDashboard;
