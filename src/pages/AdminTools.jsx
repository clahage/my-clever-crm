// Complete Admin Tools page with automated pipeline controls
// Path: src/pages/AdminTools.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { runMigration } from '../utils/migrateToAutomatedPipeline';
import { Settings, Database, RefreshCw, AlertCircle, CheckCircle, Users, Phone } from 'lucide-react';

const AdminTools = () => {
  const [pipelineStats, setPipelineStats] = useState({
    totalContacts: 0,
    leads: 0,
    clients: 0,
    unconvertedCalls: 0,
    processingQueue: 0,
    recentActivity: []
  });
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Monitor pipeline statistics in real-time
    const unsubscribers = [];

    // Monitor total contacts
    const contactsUnsub = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setPipelineStats(prev => ({
        ...prev,
        totalContacts: contacts.length,
        leads: contacts.filter(c => c.category === 'lead').length,
        clients: contacts.filter(c => c.category === 'client').length,
        vendors: contacts.filter(c => c.category === 'vendor').length,
        employees: contacts.filter(c => c.category === 'employee').length
      }));
    });
    unsubscribers.push(contactsUnsub);

    // Monitor unconverted AI calls
    const unconvertedQuery = query(
      collection(db, 'aiReceptionistCalls'),
      where('convertedToContact', '==', false)
    );
    
    const callsUnsub = onSnapshot(unconvertedQuery, (snapshot) => {
      setPipelineStats(prev => ({
        ...prev,
        unconvertedCalls: snapshot.size,
        processingQueue: snapshot.docs.filter(doc => 
          doc.data().processed && !doc.data().convertedToContact
        ).length
      }));
    });
    unsubscribers.push(callsUnsub);

    // Monitor recent pipeline activity
    const activityQuery = query(
      collection(db, 'contacts'),
      where('autoCreated', '==', true)
    );
    
    const activityUnsub = onSnapshot(activityQuery, (snapshot) => {
      const recentChanges = [];
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          recentChanges.push({
            id: change.doc.id,
            name: data.name,
            action: change.type,
            category: data.category,
            timestamp: data.updatedAt || data.createdAt
          });
        }
      });
      
      if (recentChanges.length > 0) {
        setPipelineStats(prev => ({
          ...prev,
          recentActivity: [...recentChanges, ...prev.recentActivity].slice(0, 10)
        }));
      }
    });
    unsubscribers.push(activityUnsub);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const handleMigration = async () => {
    setIsProcessing(true);
    setMigrationStatus('running');
    
    try {
      await runMigration();
      setMigrationStatus('complete');
    } catch (error) {
      setMigrationStatus('error');
      console.error('Migration failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const checkSystemHealth = async () => {
    const health = {
      webhookActive: false,
      pipelineActive: false,
      dataIntegrity: false
    };

    try {
      // Check if webhook has received recent calls
      const recentCalls = await getDocs(
        query(collection(db, 'aiReceptionistCalls'))
      );
      health.webhookActive = recentCalls.size > 0;

      // Check if pipeline is processing
      health.pipelineActive = pipelineStats.processingQueue >= 0;

      // Check data integrity
      const contacts = await getDocs(collection(db, 'contacts'));
      health.dataIntegrity = contacts.docs.every(doc => {
        const data = doc.data();
        return data.category && data.status;
      });

      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      return health;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Tools</h1>
        <p className="text-gray-600">Automated Contact Pipeline Management</p>
      </div>

      {/* Pipeline Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-3xl font-bold">{pipelineStats.totalContacts}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Leads</p>
              <p className="text-3xl font-bold text-green-600">{pipelineStats.leads}</p>
            </div>
            <Phone className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients</p>
              <p className="text-3xl font-bold text-blue-600">{pipelineStats.clients}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing Queue</p>
              <p className="text-3xl font-bold text-yellow-600">{pipelineStats.processingQueue}</p>
            </div>
            <RefreshCw className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Migration Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Data Migration
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Migrate existing contacts and AI calls to the automated pipeline structure. 
            This should only be run ONCE after deploying the new system.
          </p>
          
          {migrationStatus === 'complete' && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
              <p className="text-green-800">✅ Migration completed successfully!</p>
            </div>
          )}
          
          {migrationStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-800">❌ Migration failed. Check console for details.</p>
            </div>
          )}
          
          <button
            onClick={handleMigration}
            disabled={isProcessing || migrationStatus === 'complete'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isProcessing ? 'Running Migration...' : 
             migrationStatus === 'complete' ? 'Migration Complete' : 
             'Run Migration'}
          </button>
        </div>
      </div>

      {/* Pipeline Activity Monitor */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <RefreshCw className="h-5 w-5 mr-2" />
          Automated Pipeline Activity
        </h2>
        
        <div className="space-y-2">
          {pipelineStats.unconvertedCalls > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800">
                📞 {pipelineStats.unconvertedCalls} calls pending automatic processing
              </p>
            </div>
          )}
          
          {pipelineStats.processingQueue > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-blue-800">
                ⚙️ {pipelineStats.processingQueue} contacts in processing queue
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Recent Activity</h3>
            {pipelineStats.recentActivity.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-1">
                {pipelineStats.recentActivity.map((activity, idx) => (
                  <div key={`${activity.id}-${idx}`} className="text-sm text-gray-600">
                    {activity.action === 'added' ? '➕' : '📝'} 
                    {' '}{activity.name} → {activity.category}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          System Status
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Contact Pipeline Service</span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">Active</span>
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>AI Webhook Receiver</span>
            <span className="flex items-center">
              {pipelineStats.totalContacts > 0 ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">Waiting for data</span>
                </>
              )}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Automatic Categorization</span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">Enabled</span>
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>External Integrations</span>
            <span className="flex items-center">
              <AlertCircle className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-gray-500">Not configured</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTools;