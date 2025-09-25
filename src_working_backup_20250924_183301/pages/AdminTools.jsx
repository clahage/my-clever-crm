// Complete Admin Tools page with automated pipeline controls AND data cleanup
// Path: src/pages/AdminTools.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { runMigration } from '../utils/migrateToAutomatedPipeline';
import { Settings, Database, RefreshCw, AlertCircle, CheckCircle, Users, Phone, Trash2, Shield } from 'lucide-react';

const AdminTools = () => {
  const [activeTab, setActiveTab] = useState('pipeline');
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
  const [cleanupResults, setCleanupResults] = useState(null);
  const [cleanupMessage, setCleanupMessage] = useState('');

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

  // Data Cleanup Functions
  const analyzeDataQuality = async () => {
    setIsProcessing(true);
    setCleanupMessage('Analyzing data quality...');
    
    const results = {
      aiCalls: { total: 0, incomplete: 0, test: 0, spam: 0, valid: 0 },
      contacts: { total: 0, incomplete: 0, test: 0, duplicates: 0, valid: 0 }
    };

    try {
      // Analyze AI Calls
      const aiCallsSnap = await getDocs(collection(db, 'aiReceptionistCalls'));
      results.aiCalls.total = aiCallsSnap.size;
      
      aiCallsSnap.forEach(doc => {
        const data = doc.data();
        
        // Check if test data
        if (data.callerName?.toLowerCase().includes('test') || 
            data.summary?.toLowerCase().includes('test')) {
          results.aiCalls.test++;
        }
        // Check if incomplete
        else if (!data.callerName || data.callerName === 'Unknown' || 
                 !data.phone || data.duration < 30) {
          results.aiCalls.incomplete++;
        }
        // Check if spam
        else if (data.summary?.toLowerCase().match(/warranty|insurance quote|credit card|irs/)) {
          results.aiCalls.spam++;
        }
        else {
          results.aiCalls.valid++;
        }
      });

      // Analyze Contacts
      const contactsSnap = await getDocs(collection(db, 'contacts'));
      results.contacts.total = contactsSnap.size;
      
      const phoneNumbers = new Set();
      const emails = new Set();
      
      contactsSnap.forEach(doc => {
        const data = doc.data();
        
        // Check if test data
        if (data.name?.toLowerCase().includes('test') || 
            data.email?.includes('test')) {
          results.contacts.test++;
        }
        // Check if incomplete
        else if (!data.name || data.name === 'Unknown' || 
                 (!data.phone && !data.email)) {
          results.contacts.incomplete++;
        }
        else {
          results.contacts.valid++;
        }
        
        // Check for duplicates
        if (data.phone && phoneNumbers.has(data.phone)) {
          results.contacts.duplicates++;
        }
        if (data.email && emails.has(data.email)) {
          results.contacts.duplicates++;
        }
        
        if (data.phone) phoneNumbers.add(data.phone);
        if (data.email) emails.add(data.email);
      });

      setCleanupResults(results);
      setCleanupMessage('Analysis complete');
    } catch (error) {
      console.error('Analysis failed:', error);
      setCleanupMessage('Analysis failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanTestData = async (dryRun = true) => {
    setIsProcessing(true);
    setCleanupMessage(dryRun ? 'Simulating test data cleanup...' : 'Cleaning test data...');
    
    let deleteCount = 0;
    
    try {
      // Clean AI Calls
      const aiCallsSnap = await getDocs(collection(db, 'aiReceptionistCalls'));
      for (const docSnap of aiCallsSnap.docs) {
        const data = docSnap.data();
        
        if (data.callerName?.toLowerCase().includes('test') || 
            data.summary?.toLowerCase().includes('test') ||
            data.phone === '+1234567890') {
          
          if (!dryRun) {
            await deleteDoc(doc(db, 'aiReceptionistCalls', docSnap.id));
          }
          deleteCount++;
        }
      }
      
      // Clean Contacts
      const contactsSnap = await getDocs(collection(db, 'contacts'));
      for (const docSnap of contactsSnap.docs) {
        const data = docSnap.data();
        
        if (data.name?.toLowerCase().includes('test') || 
            data.email?.includes('test@') ||
            data.phone === '1234567890') {
          
          if (!dryRun) {
            await deleteDoc(doc(db, 'contacts', docSnap.id));
          }
          deleteCount++;
        }
      }
      
      setCleanupMessage(`${dryRun ? 'Would delete' : 'Deleted'} ${deleteCount} test records`);
    } catch (error) {
      console.error('Cleanup failed:', error);
      setCleanupMessage('Cleanup failed: ' + error.message);
    } finally {
      setIsProcessing(false);
      if (!dryRun) analyzeDataQuality(); // Refresh analysis
    }
  };

  const fixIncompleteData = async (dryRun = true) => {
    setIsProcessing(true);
    setCleanupMessage(dryRun ? 'Checking for fixes...' : 'Fixing incomplete data...');
    
    let fixCount = 0;
    
    try {
      // Fix contacts without categories
      const contactsSnap = await getDocs(collection(db, 'contacts'));
      for (const docSnap of contactsSnap.docs) {
        const data = docSnap.data();
        const updates = {};
        
        // Add missing category
        if (!data.category) {
          updates.category = data.type === 'Client' ? 'client' : 'lead';
        }
        
        // Add missing status
        if (!data.status && data.category === 'lead') {
          updates.status = 'lukewarm';
        }
        
        // Add missing source
        if (!data.source) {
          updates.source = data.autoCreated ? 'AI Receptionist' : 'Direct';
        }
        
        // Fix phone format
        if (data.phone && !data.phone.startsWith('+')) {
          updates.phone = '+1' + data.phone.replace(/\D/g, '');
        }
        
        if (Object.keys(updates).length > 0) {
          if (!dryRun) {
            await updateDoc(doc(db, 'contacts', docSnap.id), updates);
          }
          fixCount++;
        }
      }
      
      setCleanupMessage(`${dryRun ? 'Would fix' : 'Fixed'} ${fixCount} records`);
    } catch (error) {
      console.error('Fix failed:', error);
      setCleanupMessage('Fix failed: ' + error.message);
    } finally {
      setIsProcessing(false);
      if (!dryRun) analyzeDataQuality(); // Refresh analysis
    }
  };

  const identifySpam = async () => {
    setIsProcessing(true);
    setCleanupMessage('Identifying spam/junk calls...');
    
    const spamKeywords = [
      'warranty', 'insurance quote', 'credit card offer', 'irs', 
      'social security', 'microsoft support', 'amazon security',
      'refund', 'virus detected', 'prize', 'winner'
    ];
    
    let spamCount = 0;
    const spamNumbers = [];
    
    try {
      const aiCallsSnap = await getDocs(collection(db, 'aiReceptionistCalls'));
      for (const docSnap of aiCallsSnap.docs) {
        const data = docSnap.data();
        const textToCheck = ((data.transcript || '') + ' ' + (data.summary || '')).toLowerCase();
        
        const isSpam = spamKeywords.some(keyword => textToCheck.includes(keyword));
        
        if (isSpam) {
          spamCount++;
          if (data.phone) spamNumbers.push(data.phone);
        }
      }
      
      setCleanupMessage(`Found ${spamCount} spam calls. Numbers to block: ${spamNumbers.slice(0, 5).join(', ')}${spamNumbers.length > 5 ? '...' : ''}`);
    } catch (error) {
      console.error('Spam check failed:', error);
      setCleanupMessage('Spam check failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Tools</h1>
        <p className="text-gray-600">System Management & Data Maintenance</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pipeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Pipeline Management
            </button>
            <button
              onClick={() => setActiveTab('cleanup')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cleanup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Data Cleanup
            </button>
          </nav>
        </div>
      </div>

      {/* Pipeline Tab Content */}
      {activeTab === 'pipeline' && (
        <>
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
                        {activity.action === 'added' ? '➕' : '🔄'} 
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
            </div>
          </div>
        </>
      )}

      {/* Data Cleanup Tab Content */}
      {activeTab === 'cleanup' && (
        <div className="space-y-6">
          {/* Data Quality Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Data Quality Analysis
            </h2>

            {/* Analysis Results */}
            {cleanupResults && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">AI Calls Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-sm font-semibold">{cleanupResults.aiCalls.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valid:</span>
                      <span className="text-sm font-semibold text-green-600">{cleanupResults.aiCalls.valid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Incomplete:</span>
                      <span className="text-sm font-semibold text-yellow-600">{cleanupResults.aiCalls.incomplete}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Test Data:</span>
                      <span className="text-sm font-semibold text-blue-600">{cleanupResults.aiCalls.test}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Spam:</span>
                      <span className="text-sm font-semibold text-red-600">{cleanupResults.aiCalls.spam}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Contacts Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-sm font-semibold">{cleanupResults.contacts.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valid:</span>
                      <span className="text-sm font-semibold text-green-600">{cleanupResults.contacts.valid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Incomplete:</span>
                      <span className="text-sm font-semibold text-yellow-600">{cleanupResults.contacts.incomplete}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Test Data:</span>
                      <span className="text-sm font-semibold text-blue-600">{cleanupResults.contacts.test}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duplicates:</span>
                      <span className="text-sm font-semibold text-orange-600">{cleanupResults.contacts.duplicates}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={analyzeDataQuality}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Analyzing...' : 'Analyze Data Quality'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => cleanTestData(true)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  Preview Test Cleanup
                </button>
                <button
                  onClick={() => cleanTestData(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete Test Data
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fixIncompleteData(true)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  Preview Fixes
                </button>
                <button
                  onClick={() => fixIncompleteData(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Apply Fixes
                </button>
              </div>

              <button
                onClick={identifySpam}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              >
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Identify Spam Calls
              </button>
            </div>

            {/* Message Display */}
            {cleanupMessage && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">{cleanupMessage}</p>
              </div>
            )}
          </div>

          {/* Cleanup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Important Notes
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Always preview changes before applying them</li>
              <li>• Test data cleanup removes entries with "test" in name/email</li>
              <li>• Spam identification looks for common spam keywords</li>
              <li>• Data fixes add missing categories and standardize formats</li>
              <li>• Make sure to backup important data before major cleanups</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTools;