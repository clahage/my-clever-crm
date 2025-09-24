import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, Phone, Mail, Calendar, TrendingUp, CheckCircle, AlertCircle, X } from 'lucide-react';

const QuickContactConverter = () => {
  const [unprocessedCalls, setUnprocessedCalls] = useState([]);
  const [converting, setConverting] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Query for unprocessed AI calls
    const q = query(
      collection(db, 'aiReceptionistCalls'),
      where('convertedToContact', '!=', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by timestamp, newest first
      calls.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
        return timeB - timeA;
      });
      
      setUnprocessedCalls(calls);
    }, (err) => {
      console.error('Error fetching unprocessed calls:', err);
      setError('Failed to load unprocessed calls');
    });

    return () => unsubscribe();
  }, []);

  // Extract caller name from various possible fields
  const extractCallerName = (call) => {
    // Try different field patterns for name
    const nameFields = [
      'callerName',
      'caller_name',
      'name',
      'customerName',
      'customer_name',
      'clientName',
      'client_name'
    ];

    for (const field of nameFields) {
      if (call[field] && call[field] !== 'Unknown' && call[field] !== 'Clahage') {
        return call[field];
      }
    }

    // Try to extract from intake form fields
    const intakeNameField = Object.keys(call).find(key => 
      key.includes('Intake Form') && key.includes('full name')
    );
    
    if (intakeNameField && call[intakeNameField]) {
      return call[intakeNameField];
    }

    // Try to extract from transcript if available
    if (call.transcript) {
      // Pattern 1: "My name is [Name]"
      const nameMatch1 = call.transcript.match(/my name is ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i);
      if (nameMatch1) return nameMatch1[1];

      // Pattern 2: "This is [Name]"
      const nameMatch2 = call.transcript.match(/this is ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i);
      if (nameMatch2) return nameMatch2[1];

      // Pattern 3: "I'm [Name]"
      const nameMatch3 = call.transcript.match(/I'm ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i);
      if (nameMatch3) return nameMatch3[1];
    }

    // Try summary as last resort
    if (call.summary) {
      const summaryMatch = call.summary.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*) (?:called|inquired|asked|wanted|needs)/);
      if (summaryMatch) return summaryMatch[1];
    }

    return 'Unknown Caller';
  };

  // Extract phone number
  const extractPhoneNumber = (call) => {
    const phoneFields = ['phone', 'phoneNumber', 'phone_number', 'caller_phone', 'from'];
    
    for (const field of phoneFields) {
      if (call[field]) {
        // Clean phone number
        const cleaned = call[field].toString().replace(/\D/g, '');
        if (cleaned.length >= 10) {
          return cleaned;
        }
      }
    }
    
    return '';
  };

  // Determine lead status based on score
  const determineStatus = (leadScore) => {
    if (leadScore >= 8) return 'hot';
    if (leadScore >= 5) return 'warm';
    return 'cold';
  };

  // Convert call to contact
  const convertToContact = async (call) => {
    setConverting(prev => ({ ...prev, [call.id]: true }));
    setMessage('');
    setError('');
    
    try {
      const callerName = extractCallerName(call);
      const phoneNumber = extractPhoneNumber(call);
      
      // Parse lead score - handle various formats
      let leadScore = 0;
      if (call.leadScore) {
        leadScore = typeof call.leadScore === 'string' 
          ? parseInt(call.leadScore.replace(/[^\d]/g, '')) || 0
          : call.leadScore;
      } else if (call.lead_score) {
        leadScore = typeof call.lead_score === 'string'
          ? parseInt(call.lead_score.replace(/[^\d]/g, '')) || 0
          : call.lead_score;
      }

      // Create contact data
      const contactData = {
        // Name fields
        name: callerName,
        firstName: callerName.split(' ')[0] || '',
        lastName: callerName.split(' ').slice(1).join(' ') || '',
        
        // Contact info
        phone: phoneNumber,
        email: call.email || '',
        
        // Categorization
        category: 'lead', // All AI calls start as leads
        status: determineStatus(leadScore),
        source: 'AI Receptionist',
        
        // AI-specific data
        leadScore: leadScore,
        urgencyLevel: call.urgencyLevel || call.urgency || 'medium',
        painPoints: call.painPoints || [],
        sentiment: call.sentiment || {},
        conversionProbability: call.conversionProbability || 0,
        
        // Call data
        callDuration: call.duration || 0,
        transcript: call.transcript || '',
        summary: call.summary || '',
        
        // Metadata
        autoCreated: true,
        aiReceptionistCallId: call.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Additional fields from AI analysis
        notes: `AI Call Summary: ${call.summary || 'No summary available'}\n\nPain Points: ${(call.painPoints || []).join(', ') || 'None identified'}\n\nUrgency: ${call.urgencyLevel || 'Not assessed'}`,
        
        // Business-specific fields
        interestedIn: call.interestedIn || call.interested_in || '',
        budget: call.budget || '',
        timeline: call.timeline || '',
        
        // Engagement data
        lastContactDate: call.timestamp || serverTimestamp(),
        totalInteractions: 1,
        
        // Tags for filtering
        tags: [
          'ai-generated',
          `score-${leadScore}`,
          call.urgencyLevel || 'medium-urgency',
          phoneNumber ? 'has-phone' : 'no-phone'
        ].filter(Boolean)
      };

      // Check if contact already exists with this phone number
      if (phoneNumber) {
        const existingContactQuery = query(
          collection(db, 'contacts'),
          where('phone', '==', phoneNumber)
        );
        
        // This is just for checking, we'll still create a new one if none exists
        // You might want to update existing instead of creating new
      }

      // Add to contacts collection
      const docRef = await addDoc(collection(db, 'contacts'), contactData);
      
      // Mark original call as converted
      await updateDoc(doc(db, 'aiReceptionistCalls', call.id), {
        convertedToContact: true,
        convertedAt: serverTimestamp(),
        contactId: docRef.id,
        processedAt: serverTimestamp()
      });
      
      setMessage(`Successfully converted ${callerName} to contact!`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      
    } catch (err) {
      console.error('Error converting call to contact:', err);
      setError(`Failed to convert: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setConverting(prev => ({ ...prev, [call.id]: false }));
    }
  };

  // Dismiss a call without converting
  const dismissCall = async (call) => {
    setConverting(prev => ({ ...prev, [call.id]: true }));
    
    try {
      await updateDoc(doc(db, 'aiReceptionistCalls', call.id), {
        convertedToContact: true,
        dismissed: true,
        dismissedAt: serverTimestamp()
      });
      
      setMessage('Call dismissed');
      setTimeout(() => setMessage(''), 2000);
      
    } catch (err) {
      console.error('Error dismissing call:', err);
      setError(`Failed to dismiss: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setConverting(prev => ({ ...prev, [call.id]: false }));
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return 'Unknown';
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch(urgency?.toLowerCase()) {
      case 'high':
      case 'hot':
        return 'text-red-600 bg-red-50';
      case 'medium':
      case 'warm':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  // Get lead score color
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-red-600 font-bold';
    if (score >= 5) return 'text-yellow-600 font-semibold';
    return 'text-gray-600';
  };

  if (unprocessedCalls.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p>All AI receptionist calls have been processed!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Convert AI Calls to Contacts
          <span className="ml-2 text-sm text-gray-500">
            ({unprocessedCalls.length} unprocessed)
          </span>
        </h3>
      </div>

      {/* Messages */}
      {message && (
        <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          <span className="text-green-800">{message}</span>
        </div>
      )}

      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Calls List */}
      <div className="divide-y">
        {unprocessedCalls.map((call) => {
          const callerName = extractCallerName(call);
          const phoneNumber = extractPhoneNumber(call);
          const leadScore = call.leadScore || call.lead_score || 0;
          
          return (
            <div key={call.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Caller Info */}
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {callerName}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      {phoneNumber && (
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {phoneNumber}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(call.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Call Details */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <span className="text-xs text-gray-500">Lead Score:</span>
                      <p className={`text-sm ${getScoreColor(leadScore)}`}>
                        {leadScore}/10
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Urgency:</span>
                      <p className={`text-sm px-2 py-0.5 rounded-full inline-block ${getUrgencyColor(call.urgencyLevel)}`}>
                        {call.urgencyLevel || 'Medium'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Duration:</span>
                      <p className="text-sm text-gray-700">
                        {call.duration ? `${call.duration}s` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  {call.summary && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {call.summary}
                    </p>
                  )}

                  {/* Pain Points */}
                  {call.painPoints && call.painPoints.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {call.painPoints.slice(0, 3).map((point, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {point}
                        </span>
                      ))}
                      {call.painPoints.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{call.painPoints.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => convertToContact(call)}
                    disabled={converting[call.id]}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
                  >
                    {converting[call.id] ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Converting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Convert
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => dismissCall(call)}
                    disabled={converting[call.id]}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickContactConverter;