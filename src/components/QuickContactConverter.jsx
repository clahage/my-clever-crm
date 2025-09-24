import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';

const QuickContactConverter = () => {
  const [unprocessedCalls, setUnprocessedCalls] = useState([]);
  const [converting, setConverting] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
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
    });

    return () => unsubscribe();
  }, []);

  const convertToContact = async (call) => {
    setConverting(prev => ({ ...prev, [call.id]: true }));
    setMessage('');
    
    try {
      // Create contact data with proper categorization
      const contactData = {
        // Basic info
        name: call.callerName || call.caller || 'Unknown Caller',
        phone: call.caller || '',
        email: call.email || '',
        
        // Lead categorization
        category: 'lead', // All AI calls start as leads
        status: call.leadScore >= 8 ? 'hot' : call.leadScore >= 5 ? 'warm' : 'cold',
        leadScore: call.leadScore || 0,
        urgency: call.urgencyLevel || 'medium',
        
        // Details from AI analysis
        painPoints: call.painPoints || [],
        conversionProbability: call.conversionProbability || 0,
        summary: call.summary || '',
        
        // Source tracking
        source: 'AI Receptionist',
        sourceDetails: {
          callId: call.id,
          duration: call.duration,
          timestamp: call.timestamp,
          sentiment: call.sentiment
        },
        
        // Metadata
        createdAt: serverTimestamp(),
        lastContact: call.timestamp || new Date().toISOString(),
        tags: ['ai-receptionist', `score-${call.leadScore || 0}`],
        notes: `AI Call Summary: ${call.summary || 'No summary available'}\nTranscript available in source call record.`
      };

      // Add to contacts collection
      const contactRef = await addDoc(collection(db, 'contacts'), contactData);
      
      // Update the original call to mark as converted
      await updateDoc(doc(db, 'aiReceptionistCalls', call.id), {
        convertedToContact: true,
        contactId: contactRef.id,
        convertedAt: new Date().toISOString()
      });
      
      // Create a notification for hot leads
      if (call.leadScore >= 8) {
        await addDoc(collection(db, 'notifications'), {
          type: 'hot_lead',
          title: `🔥 New Hot Lead: ${contactData.name}`,
          message: `Score: ${call.leadScore}/10 - Immediate follow-up recommended`,
          contactId: contactRef.id,
          read: false,
          createdAt: serverTimestamp()
        });
      }
      
      setMessage(`✅ Successfully converted ${contactData.name} to contact (${contactData.status} lead)`);
      
    } catch (error) {
      console.error('Error converting to contact:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setConverting(prev => ({ ...prev, [call.id]: false }));
    }
  };

  const convertAll = async () => {
    setMessage('Converting all calls...');
    for (const call of unprocessedCalls) {
      await convertToContact(call);
    }
    setMessage(`✅ Converted ${unprocessedCalls.length} calls to contacts`);
  };

  if (unprocessedCalls.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded text-gray-500 text-center">
        No unprocessed calls to convert
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Unprocessed AI Calls</h3>
        <button
          onClick={convertAll}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Convert All to Contacts
        </button>
      </div>
      
      {message && (
        <div className={`mb-4 p-2 rounded text-sm ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 
          message.includes('❌') ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}
      
      <div className="space-y-2">
        {unprocessedCalls.map(call => (
          <div key={call.id} className="border rounded p-3 flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium">
                {call.callerName || call.caller || 'Unknown'}
              </div>
              <div className="text-sm text-gray-500">
                Score: {call.leadScore || 0}/10 | Duration: {call.duration}s
              </div>
            </div>
            <button
              onClick={() => convertToContact(call)}
              disabled={converting[call.id]}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
            >
              {converting[call.id] ? 'Converting...' : 'Convert to Contact'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickContactConverter;