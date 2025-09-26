// utils/dataCleanup.js
// Tool to clean up test data and organize your Firebase collections

import { collection, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const DataCleanupTool = {
  // Analyze data quality
  async analyzeData() {
    console.log('🔍 Analyzing your data quality...');
    
    const results = {
      aiCalls: { total: 0, incomplete: 0, test: 0, spam: 0, valid: 0 },
      contacts: { total: 0, incomplete: 0, test: 0, duplicates: 0, valid: 0 }
    };

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
      // Check if spam (basic check)
      else if (data.summary?.toLowerCase().match(/warranty|insurance|credit card|irs/)) {
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
      
      phoneNumbers.add(data.phone);
      emails.add(data.email);
    });

    return results;
  },

  // Clean test data
  async cleanTestData(dryRun = true) {
    console.log(dryRun ? '🔍 Simulating test data cleanup...' : '🗑️ Cleaning test data...');
    
    let deleteCount = 0;
    
    // Clean AI Calls
    const aiCallsSnap = await getDocs(collection(db, 'aiReceptionistCalls'));
    for (const docSnap of aiCallsSnap.docs) {
      const data = docSnap.data();
      
      if (data.callerName?.toLowerCase().includes('test') || 
          data.summary?.toLowerCase().includes('test') ||
          data.phone === '+1234567890') {
        
        if (dryRun) {
          console.log(`Would delete AI call: ${data.callerName || 'Unknown'}`);
        } else {
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
        
        if (dryRun) {
          console.log(`Would delete contact: ${data.name || 'Unknown'}`);
        } else {
          await deleteDoc(doc(db, 'contacts', docSnap.id));
        }
        deleteCount++;
      }
    }
    
    console.log(`${dryRun ? 'Would delete' : 'Deleted'} ${deleteCount} test records`);
    return deleteCount;
  },

  // Fix incomplete data
  async fixIncompleteData(dryRun = true) {
    console.log(dryRun ? '🔍 Checking for fixes...' : '🔧 Fixing incomplete data...');
    
    let fixCount = 0;
    
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
        if (dryRun) {
          console.log(`Would fix contact ${data.name}:`, updates);
        } else {
          await updateDoc(doc(db, 'contacts', docSnap.id), updates);
        }
        fixCount++;
      }
    }
    
    console.log(`${dryRun ? 'Would fix' : 'Fixed'} ${fixCount} records`);
    return fixCount;
  },

  // Mark spam for deletion
  async identifySpam(dryRun = true) {
    console.log('🔍 Identifying spam/junk calls...');
    
    const spamKeywords = [
      'warranty', 'insurance quote', 'credit card offer', 'irs', 
      'social security', 'microsoft support', 'amazon security',
      'refund', 'virus detected', 'prize', 'winner'
    ];
    
    let spamCount = 0;
    const spamNumbers = [];
    
    const aiCallsSnap = await getDocs(collection(db, 'aiReceptionistCalls'));
    for (const docSnap of aiCallsSnap.docs) {
      const data = docSnap.data();
      const textToCheck = (data.transcript + ' ' + data.summary).toLowerCase();
      
      const isSpam = spamKeywords.some(keyword => textToCheck.includes(keyword));
      
      if (isSpam) {
        spamCount++;
        if (data.phone) spamNumbers.push(data.phone);
        
        if (!dryRun) {
          await updateDoc(doc(db, 'aiReceptionistCalls', docSnap.id), {
            category: 'spam',
            shouldBlock: true
          });
        }
        
        console.log(`${dryRun ? 'Found' : 'Marked'} spam from: ${data.phone || 'Unknown'}`);
      }
    }
    
    console.log(`Found ${spamCount} spam calls`);
    if (spamNumbers.length > 0) {
      console.log('Numbers to block:', spamNumbers);
    }
    
    return { spamCount, spamNumbers };
  },

  // Merge duplicate contacts
  async findDuplicates() {
    console.log('🔍 Finding duplicate contacts...');
    
    const contacts = [];
    const contactsSnap = await getDocs(collection(db, 'contacts'));
    
    contactsSnap.forEach(doc => {
      contacts.push({ id: doc.id, ...doc.data() });
    });
    
    const duplicates = [];
    const seen = new Map();
    
    contacts.forEach(contact => {
      // Check by phone
      if (contact.phone) {
        const phone = contact.phone.replace(/\D/g, '');
        if (seen.has(phone)) {
          duplicates.push({
            type: 'phone',
            value: phone,
            contacts: [seen.get(phone), contact]
          });
        } else {
          seen.set(phone, contact);
        }
      }
      
      // Check by email
      if (contact.email) {
        const email = contact.email.toLowerCase();
        const key = 'email_' + email;
        if (seen.has(key)) {
          duplicates.push({
            type: 'email',
            value: email,
            contacts: [seen.get(key), contact]
          });
        } else {
          seen.set(key, contact);
        }
      }
    });
    
    console.log(`Found ${duplicates.length} duplicate sets`);
    return duplicates;
  }
};

// Component to use in your admin panel
import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

export const DataCleanupPanel = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    const analysis = await DataCleanupTool.analyzeData();
    setResults(analysis);
    setLoading(false);
  };

  const handleCleanTest = async (dryRun = true) => {
    setLoading(true);
    const count = await DataCleanupTool.cleanTestData(dryRun);
    setMessage(`${dryRun ? 'Would delete' : 'Deleted'} ${count} test records`);
    setLoading(false);
    if (!dryRun) handleAnalyze(); // Refresh analysis
  };

  const handleFixIncomplete = async (dryRun = true) => {
    setLoading(true);
    const count = await DataCleanupTool.fixIncompleteData(dryRun);
    setMessage(`${dryRun ? 'Would fix' : 'Fixed'} ${count} incomplete records`);
    setLoading(false);
    if (!dryRun) handleAnalyze(); // Refresh analysis
  };

  const handleIdentifySpam = async () => {
    setLoading(true);
    const { spamCount, spamNumbers } = await DataCleanupTool.identifySpam(true);
    setMessage(`Found ${spamCount} spam calls. Numbers to block: ${spamNumbers.join(', ')}`);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Shield className="w-6 h-6 mr-2 text-blue-600" />
        Data Cleanup Tool
      </h2>

      {/* Analysis Results */}
      {results && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">AI Calls Analysis</h3>
            <div className="text-sm space-y-1">
              <p>Total: {results.aiCalls.total}</p>
              <p className="text-green-600">Valid: {results.aiCalls.valid}</p>
              <p className="text-yellow-600">Incomplete: {results.aiCalls.incomplete}</p>
              <p className="text-blue-600">Test Data: {results.aiCalls.test}</p>
              <p className="text-red-600">Spam: {results.aiCalls.spam}</p>
            </div>
          </div>
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Contacts Analysis</h3>
            <div className="text-sm space-y-1">
              <p>Total: {results.contacts.total}</p>
              <p className="text-green-600">Valid: {results.contacts.valid}</p>
              <p className="text-yellow-600">Incomplete: {results.contacts.incomplete}</p>
              <p className="text-blue-600">Test Data: {results.contacts.test}</p>
              <p className="text-orange-600">Duplicates: {results.contacts.duplicates}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Data Quality'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleCleanTest(true)}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            Preview Test Cleanup
          </button>
          <button
            onClick={() => handleCleanTest(false)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete Test Data
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleFixIncomplete(true)}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            Preview Fixes
          </button>
          <button
            onClick={() => handleFixIncomplete(false)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Apply Fixes
          </button>
        </div>

        <button
          onClick={handleIdentifySpam}
          disabled={loading}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          Identify Spam Calls
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      )}
    </div>
  );
};

export default DataCleanupTool;