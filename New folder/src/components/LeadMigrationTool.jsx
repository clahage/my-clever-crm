import React, { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';

const ADMIN_EMAILS = [
  'chris@speedycreditrepair.com',
  'clahage@gmail.com'
];


export default function LeadMigrationTool() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [running, setRunning] = useState(false);

  // Show debug info visibly on the page for troubleshooting
  let emailToCheck = '';
  let debugInfo = '';
  if (user) {
    emailToCheck = user.email || '';
    if (!emailToCheck && user.providerData && user.providerData.length > 0) {
      emailToCheck = user.providerData[0].email || '';
    }
    debugInfo = `User: ${JSON.stringify(user, null, 2)}\nEmail to check: ${emailToCheck}\nIs admin: ${ADMIN_EMAILS.includes(emailToCheck)}`;
    if (!ADMIN_EMAILS.includes(emailToCheck)) {
      return (
        <div style={{ padding: 16, background: '#fff', border: '1px solid #ccc', margin: 16 }}>
          <h3>Lead Migration Tool (Admin Only)</h3>
          <pre style={{ color: 'red', fontSize: 12 }}>{debugInfo}</pre>
          <div style={{ color: 'red' }}>Not rendering: email not in admin list</div>
        </div>
      );
    }
  } else {
    debugInfo = 'User is null or undefined';
    return (
      <div style={{ padding: 16, background: '#fff', border: '1px solid #ccc', margin: 16 }}>
        <h3>Lead Migration Tool (Admin Only)</h3>
        <pre style={{ color: 'red', fontSize: 12 }}>{debugInfo}</pre>
      </div>
    );
  }

  const runMigration = async () => {
    setRunning(true);
    setStatus('Starting migration...');
    try {
      const leadsRef = collection(db, 'contacts');
      const snapshot = await getDocs(leadsRef);
      let updatedCount = 0;
      for (const leadDoc of snapshot.docs) {
        const lead = leadDoc.data();
        const updates = {};
        if (!lead.conversionTracking) {
          updates.conversionTracking = {
            status: 'active',
            conversionDate: null,
            revenuePotential: 1200,
            actualRevenue: 0,
            followUpCount: 0,
            lastContactDate: null,
            nextFollowUpDue: null,
            lostReason: null,
            confidenceScore: 0.75
          };
        }
        if (!lead.serviceType) updates.serviceType = 'basic';
        if (!lead.estimatedTimeframe) updates.estimatedTimeframe = 90;
        if (!lead.predictionData) {
          updates.predictionData = {
            weeklyDecayFactor: 0.95,
            followUpResponseRate: 0.8,
            seasonalMultiplier: 1.0,
            lastPredictionUpdate: null
          };
        }
        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, 'contacts', leadDoc.id), updates);
          updatedCount++;
        }
      }
      setStatus(`Migration complete! Updated ${updatedCount} leads.`);
    } catch (error) {
      setStatus('Migration failed: ' + error.message);
    }
    setRunning(false);
  };

  return (
    <div style={{ padding: 16, background: '#fff', border: '1px solid #ccc', margin: 16 }}>
      <h3>Lead Migration Tool (Admin Only)</h3>
      <button onClick={runMigration} disabled={running}>
        {running ? 'Migrating...' : 'Run Lead Migration'}
      </button>
      <div style={{ marginTop: 8 }}>{status}</div>
    </div>
  );
}
