import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

function getSentimentColor(score) {
  if (score >= 0.7) return "bg-green-100 text-green-800";
  if (score >= 0.4) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function getUrgencyBorder(urgency) {
  if (urgency === "hot" || urgency === "high") return "border-2 border-red-500";
  if (urgency === "warm" || urgency === "medium") return "border-2 border-yellow-500";
  return "border border-gray-300";
}

// Extract caller name from Intake Form field or transcript
function extractCallerName(call) {
  // Try to get name from "Intake Form: May I ask for your full name..." field
  const intakeNameField = Object.keys(call).find(key => 
    key.includes('Intake Form') && key.includes('full name')
  );
  
  if (intakeNameField && call[intakeNameField]) {
    return call[intakeNameField];
  }
  
  // Fallback: try to extract from transcript
  if (call.transcript) {
    const nameMatch = call.transcript.match(/user@\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\./);
    if (nameMatch) {
      return nameMatch[1];
    }
  }
  
  // Last resort: check summary for name
  if (call.summary) {
    const summaryMatch = call.summary.match(/The user,?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+/);
    if (summaryMatch) {
      return summaryMatch[1];
    }
  }
  
  return null;
}

export default function QuickContactConverter() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const q = query(collection(db, "aiReceptionistCalls"), where("processed", "==", false));
    const unsub = onSnapshot(
      q, 
      (snap) => {
        setCalls(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Error loading AI calls:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  async function handleConvert(call) {
    try {
      // Extract the actual caller's name
      const callerName = extractCallerName(call);
      const nameParts = callerName ? callerName.split(' ') : ['Unknown', 'Caller'];
      
      // Create new contact with proper fields
      await addDoc(collection(db, "contacts"), {
        // Name fields
        firstName: nameParts[0] || 'Unknown',
        lastName: nameParts.slice(1).join(' ') || 'Caller',
        
        // Contact info - use 'caller' field for phone
        phone: call.caller || call.phone || '',
        email: call.email || '',
        
        // Categorization
        type: 'Lead',
        source: "AI Receptionist",
        category: 'Lead',
        
        // AI-specific data
        aiCategory: call.aiCategory || '',
        urgencyLevel: call.urgencyLevel || 'medium',
        leadScore: call.leadScore || (call.urgencyLevel === 'high' ? 5 : call.urgencyLevel === 'medium' ? 4 : 3),
        
        // Call data
        summary: call.summary || '',
        conversationNotes: call.transcript || '',
        sentiment: call.sentiment ? `Positive: ${call.sentiment.positive}%, Negative: ${call.sentiment.negative}%, Neutral: ${call.sentiment.neutral}%` : '',
        
        // Platform-specific
        callDuration: call.duration || '',
        callRecordingUrl: call.call_info_link || '',
        
        // Metadata
        createdAt: new Date(),
        processedAt: new Date(),
        originalCallId: call.id,
        
        // Additional useful fields
        notes: `AI Receptionist call from ${call.timestamp || 'unknown time'}. ${call.summary || ''}`,
        timeline: call.urgencyLevel === 'high' ? 'Immediate' : '1-2 weeks'
      });
      
      // Mark call as processed
      await updateDoc(doc(db, "aiReceptionistCalls", call.id), { 
        processed: true,
        processedAt: new Date(),
        convertedToContact: true
      });
      
      setToast(`✓ Contact created for ${callerName || 'Unknown Caller'}`);
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Error converting to contact:", error);
      setToast("❌ Error creating contact. Please try again.");
      setTimeout(() => setToast(""), 3000);
    }
  }

  async function handleDismiss(call) {
    try {
      await updateDoc(doc(db, "aiReceptionistCalls", call.id), { 
        processed: true,
        processedAt: new Date(),
        dismissed: true
      });
      setToast("Call dismissed.");
      setTimeout(() => setToast(""), 2000);
    } catch (error) {
      console.error("Error dismissing call:", error);
      setToast("❌ Error dismissing call.");
      setTimeout(() => setToast(""), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No unprocessed AI receptionist calls at this time.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          New calls will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm font-medium">{toast}</p>
        </div>
      )}
      
      <div className="grid gap-4">
        {calls.map((call) => {
          const callerName = extractCallerName(call);
          const phoneNumber = call.caller || call.phone || 'No phone';
          
          return (
            <div
              key={call.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${getUrgencyBorder(call.urgencyLevel)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {callerName || 'Unknown Caller'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {phoneNumber}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Received by: {call.forwardedFrom || 'Speedy Credit Repair'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {call.urgencyLevel && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      call.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                      call.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {call.urgencyLevel.toUpperCase()}
                    </span>
                  )}
                  {call.sentiment && call.sentiment.positive !== undefined && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      call.sentiment.positive > 50 ? 'bg-green-100 text-green-800' :
                      call.sentiment.negative > 30 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Sentiment: {call.sentiment.positive > 50 ? 'Positive' : 
                                 call.sentiment.negative > 30 ? 'Negative' : 'Neutral'}
                    </span>
                  )}
                  {call.leadScore && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      Score: {call.leadScore}/10
                    </span>
                  )}
                </div>
              </div>
              
              {call.summary && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Summary:</span> {call.summary}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {call.timestamp || 
                   (call.processedAt ? new Date(call.processedAt).toLocaleString() : 'No timestamp')}
                  {call.duration && ` • Duration: ${call.duration}s`}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDismiss(call)}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleConvert(call)}
                    className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Convert to Contact
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}