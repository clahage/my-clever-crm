import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, limit, doc, updateDoc } from 'firebase/firestore';
import { Phone, Clock, TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';
import QuickContactConverter from '../components/QuickContactConverter';
import { processExistingCalls } from '../utils/processExistingCalls';
import { fixProcessedField } from '../utils/fixProcessedField';
import { fixAllCallerNames } from '../utils/fixAllCallerNames';

const AIReceptionist = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalCalls: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
  });
  const [selectedCall, setSelectedCall] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [testFixResult, setTestFixResult] = useState(null);
  const [fixTestMessage, setFixTestMessage] = useState("");
  const [fixAllMessage, setFixAllMessage] = useState("");
  const [recentCalls, setRecentCalls] = useState([]);
  const [unprocessedCalls, setUnprocessedCalls] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [fixingFields, setFixingFields] = useState(false);
  const [fixingMessage, setFixingMessage] = useState('');

  // Handle processing existing calls
  const handleProcessExistingCalls = async () => {
    setProcessing(true);
    setProcessingMessage('Processing historical calls...');
    
    try {
      const result = await processExistingCalls();
      setProcessingMessage(`Successfully processed ${result.processed} calls. ${result.failed} failed, ${result.skipped} already had scores.`);
    } catch (error) {
      setProcessingMessage(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Handle fixing processed fields
  const handleFixProcessedFields = async () => {
    setFixingFields(true);
    setFixingMessage('Fixing processed fields...');
    
    try {
      const result = await fixProcessedField();
      setFixingMessage(`Successfully fixed ${result.updated} documents. ${result.failed} failed.`);
    } catch (error) {
      setFixingMessage(`Error: ${error.message}`);
    } finally {
      setFixingFields(false);
    }
  };

  useEffect(() => {
    // Listen to stats
    const unsubscribeStats = onSnapshot(
      collection(db, 'aiReceptionistCalls'),
      (snapshot) => {
        const calls = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const hot = calls.filter(c => c.leadScore >= 8).length;
        const warm = calls.filter(c => c.leadScore >= 5 && c.leadScore < 8).length;
        const cold = calls.filter(c => c.leadScore < 5).length;
        
        setStats({
          totalCalls: calls.length,
          hotLeads: hot,
          warmLeads: warm,
          coldLeads: cold
        });
      }
    );

    // Listen to processed calls
    const processedQ = query(
      collection(db, 'aiReceptionistCalls'),
      where('processed', '==', true),
      orderBy('processedAt', 'desc'),
      limit(10)
    );
    
    const unsubscribeProcessed = onSnapshot(processedQ, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentCalls(calls);
    });

    // Listen to unprocessed calls
    const unprocessedQ = query(
      collection(db, 'aiReceptionistCalls'),
      where('processed', '==', false),
      orderBy('created_at', 'desc'),
      limit(10)
    );
    
    const unsubscribeUnprocessed = onSnapshot(unprocessedQ, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUnprocessedCalls(calls);
    });

    return () => {
      unsubscribeStats();
      unsubscribeProcessed();
      unsubscribeUnprocessed();
    };
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Receptionist</h1>
      <p className="text-gray-600 mb-8">Automated call handling and lead qualification</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Calls</p>
              <p className="text-3xl font-bold">{stats.totalCalls}</p>
            </div>
            <Phone className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hot Leads</p>
              <p className="text-3xl font-bold text-red-600">{stats.hotLeads}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-red-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Score ≥ 8/10</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warm Leads</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.warmLeads}</p>
            </div>
            <Users className="h-10 w-10 text-yellow-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Score 5-7/10</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cold Leads</p>
              <p className="text-3xl font-bold text-blue-600">{stats.coldLeads}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Score &lt; 5/10</p>
        </div>
      </div>

      {/* Processing Buttons */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleFixProcessedFields}
            disabled={fixingFields}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
          >
            {fixingFields ? 'Fixing...' : 'Fix Processed Fields'}
          </button>
          
          <button
            onClick={handleProcessExistingCalls}
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {processing ? 'Processing...' : 'Process Historical Calls'}
          </button>
          
          <button
            onClick={async () => {
              setFixTestMessage("");
              try {
                // Import the test function dynamically
                const { testFixSingleName } = await import('../utils/testFixSingleName');
                const result = await testFixSingleName();
                setFixTestMessage(
                  `Document ${result.documentId} tested:\n` +
                  `Old Name: ${result.oldName}\n` +
                  `New Name: ${result.newName}\n\n` +
                  `TRANSCRIPT PREVIEW:\n${result.transcript}\n\n` +
                  `Potential Names Found: ${result.potentialNames ? result.potentialNames.join(', ') : 'None'}`
                );
              } catch (error) {
                setFixTestMessage(`Error: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Fix One Name
          </button>
          
          <button
            onClick={async () => {
              setFixAllMessage('Processing... Please wait...');
              try {
                // Actually call the real function
                const result = await fixAllCallerNames();
                
                if (result.success) {
                  setFixAllMessage(
                    `✅ Fixed ${result.namesFixed} names out of ${result.totalDocuments} documents.\n` +
                    `Unchanged: ${result.unchanged}, Errors: ${result.errors}\n` +
                    (result.examples && result.examples.length > 0 ? 
                      `\nExamples:\n${result.examples.map(e => 
                        `• ${e.oldName} → ${e.newName}`
                      ).join('\n')}` : '')
                  );
                  
                  // Reload the page after 3 seconds to show updated names
                  if (result.namesFixed > 0) {
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  }
                } else {
                  setFixAllMessage(`❌ Error: ${result.error}`);
                }
              } catch (error) {
                setFixAllMessage(`❌ Failed: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Fix All Names
          </button>
          
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
        
        {/* Status Messages */}
        {fixingMessage && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            {fixingMessage}
          </div>
        )}
        
        {processingMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            {processingMessage}
          </div>
        )}
        
        {fixTestMessage && (
          <div className="p-3 bg-purple-50 border border-purple-300 rounded text-purple-800 whitespace-pre-line">
            <b>Test Fix One Name Result:</b><br />
            {fixTestMessage}
          </div>
        )}
        
        {fixAllMessage && (
          <div className="p-3 bg-blue-50 border border-blue-300 rounded text-blue-800 whitespace-pre-line">
            <b>Fix All Names Result:</b><br />
            {fixAllMessage}
          </div>
        )}
      </div>

      {/* Unprocessed AI Calls */}
      {unprocessedCalls.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Unprocessed AI Calls - Convert to Contacts</h2>
          <QuickContactConverter />
        </div>
      )}

      {/* Recent AI-Processed Calls */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Recent AI-Processed Calls</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Caller</th>
                <th className="text-left p-3">Score</th>
                <th className="text-left p-3">Urgency</th>
                <th className="text-left p-3">Pain Points</th>
                <th className="text-left p-3">Conversion %</th>
                <th className="text-left p-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No processed calls yet. Click "Process Historical Calls" to analyze existing calls.
                  </td>
                </tr>
              ) : (
                recentCalls.map((call) => (
                  <tr key={call.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {call.timestamp ? 
                        new Date(call.timestamp).toLocaleString() : 
                        (call.processedAt ? new Date(call.processedAt).toLocaleString() : 
                        (call.created_at ? new Date(call.created_at).toLocaleString() : 'N/A'))
                      }
                    </td>
                    <td className="p-3">{call.callerName || call.caller || 'Unknown'}</td>
                    <td className="p-3">
                      <span
                        onClick={() => {
                          setSelectedCall(call);
                          setShowDetailsModal(true);
                        }}
                        className={`px-2 py-1 rounded text-xs font-bold cursor-pointer hover:opacity-80 ${
                          call.leadScore >= 8 ? 'bg-red-100 text-red-800' :
                          call.leadScore >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                        title="View lead score breakdown"
                      >
                        {call.leadScore || 0}/10
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        call.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                        call.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {call.urgencyLevel || 'medium'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {call.painPoints && call.painPoints.length > 0 
                        ? call.painPoints.join(', ') 
                        : 'Analyzing...'}
                    </td>
                    <td className="p-3">
                      {call.conversionProbability || 0}%
                    </td>
                    <td className="p-3">{call.duration}s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Score Details Modal */}
      {showDetailsModal && selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setShowDetailsModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">Lead Score Breakdown</h2>
            <div className="mb-4">
              <div className="mb-2"><span className="font-semibold">Score:</span> {selectedCall.leadScore || 0}/10</div>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                <li><b>Duration:</b> {selectedCall.duration}s</li>
                <li><b>Sentiment:</b> {selectedCall.sentiment ? JSON.stringify(selectedCall.sentiment) : 'N/A'}</li>
                <li><b>Pain Points:</b> {selectedCall.painPoints && selectedCall.painPoints.length > 0 ? selectedCall.painPoints.join(', ') : 'None detected'}</li>
                <li><b>Urgency:</b> {selectedCall.urgencyLevel || 'medium'}</li>
                <li><b>Engagement:</b> {selectedCall.texts_sent && selectedCall.texts_sent.length > 0 ? `${selectedCall.texts_sent.length} texts sent` : 'None'}</li>
              </ul>
            </div>
            <h3 className="font-semibold mb-1">Urgency Analysis</h3>
            <div className="mb-4 text-sm text-gray-700">
              {selectedCall.urgencyLevel === 'high' ? 'Caller expressed urgency or used urgent keywords.' : 
               selectedCall.urgencyLevel === 'medium' ? 'Some urgency detected.' : 
               'No urgency detected.'}
            </div>
            <h3 className="font-semibold mb-1">Pain Points Details</h3>
            <div className="mb-4 text-sm text-gray-700">
              {selectedCall.painPoints && selectedCall.painPoints.length > 0 ? 
                selectedCall.painPoints.map((p, i) => (<div key={i}>• {p}</div>)) : 
                'No pain points detected.'}
            </div>
            <h3 className="font-semibold mb-1">Conversion Probability Factors</h3>
            <div className="mb-4 text-sm text-gray-700">
              Probability: {selectedCall.conversionProbability || 0}%<br />
              Factors: Lead score, sentiment positivity, urgency.
            </div>
            <h3 className="font-semibold mb-1">Full Transcript</h3>
            <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-800 max-h-40 overflow-y-auto whitespace-pre-line">
              {selectedCall.transcript || 'No transcript available.'}
            </div>
            <h3 className="font-semibold mb-1">Recommendations for Follow-up</h3>
            <div className="text-sm text-gray-700 mb-2">
              {selectedCall.leadScore >= 8 ? 'High priority lead. Immediate follow-up recommended.' : 
               selectedCall.leadScore >= 5 ? 'Warm lead. Timely follow-up suggested.' : 
               'Low priority. Consider automated follow-up.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIReceptionist;