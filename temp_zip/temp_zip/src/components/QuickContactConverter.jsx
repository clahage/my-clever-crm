import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, Phone, Mail, Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const QuickContactConverter = () => {
  const [unprocessedCalls, setUnprocessedCalls] = useState([]);
  const [converting, setConverting] = useState({});
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ converted: 0, pending: 0 });

  useEffect(() => {
    // Monitor unprocessed calls
    const q = query(
      collection(db, 'aiReceptionistCalls'),
      where('convertedToContact', '!=', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUnprocessedCalls(calls);
      setStats(prev => ({ ...prev, pending: calls.length }));
    });

    // Get conversion stats
    const getStats = async () => {
      const convertedQuery = query(
        collection(db, 'aiReceptionistCalls'),
        where('convertedToContact', '==', true)
      );
      const convertedSnapshot = await getDocs(convertedQuery);
      setStats(prev => ({ ...prev, converted: convertedSnapshot.size }));
    };

    getStats();
    return () => unsubscribe();
  }, []);

  const extractCallerName = (call) => {
    // Smart name extraction from various fields
    if (call.callerName && call.callerName !== 'Unknown') {
      return call.callerName;
    }
    
    // Try to extract from summary or transcript
    if (call.summary) {
      const nameMatch = call.summary.match(/(?:caller|customer|client)(?:\s+name)?(?:\s+is)?:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      if (nameMatch) return nameMatch[1];
    }
    
    if (call.transcript) {
      const introMatch = call.transcript.match(/(?:my name is|this is|I'm|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      if (introMatch) return introMatch[1];
    }
    
    // Fallback to phone number or Unknown
    return call.caller || 'Unknown Caller';
  };

  const determineLeadStatus = (score) => {
    if (score >= 8) return 'hot';
    if (score >= 5) return 'warm';
    return 'cold';
  };

  const convertToContact = async (call) => {
    setConverting(prev => ({ ...prev, [call.id]: true }));
    setMessage('');
    
    try {
      // Extract and process caller information
      const callerName = extractCallerName(call);
      const leadStatus = determineLeadStatus(call.leadScore || 0);
      
      // Create contact data with proper categorization
      const contactData = {
        // Basic info
        name: callerName,
        phone: call.caller || '',
        email: call.email || '',
        
        // Lead categorization
        category: 'lead', // All AI calls start as leads
        status: leadStatus,
        leadScore: call.leadScore || 0,
        
        // Source tracking
        source: 'AI Receptionist',
        originalCallId: call.id,
        
        // Call details
        firstCallDate: call.timestamp || call.processedAt || serverTimestamp(),
        lastContactDate: serverTimestamp(),
        callDuration: call.duration || 0,
        
        // AI insights
        summary: call.summary || '',
        painPoints: call.painPoints || [],
        urgencyLevel: call.urgencyLevel || 'low',
        conversionProbability: call.conversionProbability || 0,
        sentiment: call.sentiment || 'neutral',
        
        // Business info
        company: call.company || '',
        position: call.position || '',
        
        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        convertedFromAICall: true,
        
        // Tags for easy filtering
        tags: [
          'ai-receptionist',
          `lead-${leadStatus}`,
          call.urgencyLevel ? `urgency-${call.urgencyLevel}` : 'urgency-low'
        ]
      };

      // Add to contacts collection
      const contactRef = await addDoc(collection(db, 'contacts'), contactData);
      
      // Update the original AI call as converted
      await updateDoc(doc(db, 'aiReceptionistCalls', call.id), {
        convertedToContact: true,
        convertedContactId: contactRef.id,
        convertedAt: serverTimestamp(),
        convertedBy: 'QuickContactConverter'
      });
      
      setMessage(`✅ Successfully converted ${callerName} to ${leadStatus} lead`);
      setStats(prev => ({ 
        converted: prev.converted + 1, 
        pending: prev.pending - 1 
      }));
      
    } catch (error) {
      console.error('Conversion error:', error);
      setMessage(`❌ Error converting call: ${error.message}`);
    } finally {
      setConverting(prev => ({ ...prev, [call.id]: false }));
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const convertAll = async () => {
    for (const call of unprocessedCalls) {
      await convertToContact(call);
      // Small delay between conversions to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Quick Contact Converter
        </h2>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Converted: {stats.converted}
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            Pending: {stats.pending}
          </span>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {unprocessedCalls.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p>All AI calls have been converted!</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={convertAll}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              disabled={Object.values(converting).some(v => v)}
            >
              Convert All ({unprocessedCalls.length} calls)
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {unprocessedCalls.map((call) => (
              <div key={call.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {extractCallerName(call)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="mr-4">{call.caller || 'No phone'}</span>
                      {call.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {call.email}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        call.leadScore >= 8 ? 'bg-red-100 text-red-700' :
                        call.leadScore >= 5 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        Score: {call.leadScore || 0}/10
                      </span>
                      <span className={`px-2 py-1 rounded-full ${
                        call.urgencyLevel === 'high' ? 'bg-red-100 text-red-700' :
                        call.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {call.urgencyLevel || 'low'} urgency
                      </span>
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(call.timestamp || call.processedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {call.summary && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{call.summary}</p>
                    )}
                  </div>
                  <button
                    onClick={() => convertToContact(call)}
                    disabled={converting[call.id]}
                    className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      converting[call.id]
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {converting[call.id] ? 'Converting...' : 'Convert'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default QuickContactConverter;