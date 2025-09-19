import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SocialMediaAdmin() {
  const generateQuickResponse = (message) => {
    const responses = {
      'credit report': 'Thank you for reaching out! I can help you review and dispute errors on your credit report. Let me gather some information to assist you better.',
      'how long': 'The credit repair process typically takes 3-6 months, depending on your specific situation. Most clients see initial improvements within 30-45 days.',
      'documents': 'To start the credit repair process, you\'ll need your credit reports, valid ID, proof of address, and any supporting documents for disputes.'
    };
    const content = message.toLowerCase();
    for (const [keyword, response] of Object.entries(responses)) {
      if (content.includes(keyword)) return response;
    }
    return 'Thank you for contacting Speedy Credit Repair! Our team will review your message and provide a detailed response soon.';
  };
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ email: 'admin' }); // Replace with real user context if available

  const fetchRequests = async () => {
    const requestsQuery = query(
      collection(db, 'social_requests'),
      where('status', 'in', ['pending', 'processing'])
    );
    const requestsSnapshot = await getDocs(requestsQuery);
    const requests = [];
    requestsSnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return requests;
  };

  const fetchResponses = async () => {
    try {
      const responsesQuery = query(
        collection(db, 'social_responses'),
        where('status', '==', 'pending_approval'),
        orderBy('createdAt', 'desc')
      );
      const responsesSnapshot = await getDocs(responsesQuery);
      const responsesData = {};
      responsesSnapshot.forEach((doc) => {
        const data = doc.data();
        responsesData[data.requestId] = {
          id: doc.id,
          ...data
        };
      });
      return responsesData;
    } catch (error) {
      console.error('Error fetching responses:', error);
      return {};
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const requests = await fetchRequests();
      const responses = await fetchResponses();
      const combinedData = requests.map(request => ({
        ...request,
        aiResponse: responses[request.id] || null
      }));
      setItems(combinedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (responseId) => {
    try {
      await updateDoc(doc(db, 'social_responses', responseId), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user?.email
      });
      console.log('Response approved:', responseId);
      alert('Response approved and sent!');
      await fetchData();
    } catch (error) {
      console.error('Error approving:', error);
      alert('Error approving response');
    }
  };

  const handleReject = async (responseId) => {
    try {
      await updateDoc(doc(db, 'social_responses', responseId), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user?.email
      });
      console.log('Response rejected:', responseId);
      alert('Response rejected');
      await fetchData();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Error rejecting response');
    }
  };

  const handleSaveEdit = async (responseId, newText) => {
    try {
      await updateDoc(doc(db, 'social_responses', responseId), {
        suggestedResponse: newText,
        editedAt: serverTimestamp(),
        editedBy: user?.email
      });
      console.log('Response edited:', responseId);
      alert('Response updated successfully!');
      await fetchData();
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Error saving edit');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Response Admin</h1>
          <p className="text-gray-600">Review and approve AI-generated responses before sending</p>
          {/* Stats Cards - Add this after the title */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Queries</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Pending Review</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Approved</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Rejected</div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No pending responses to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                      {item.platform}
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 ml-2">
                        TEST MODE - No actual posts
                      </div>
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {item.customer?.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {item.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                  </span>
                </div>

                <div className="mb-4">
                  {item.aiResponse ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">AI Generated Response:</p>
                      <textarea
                        id={`response-${item.id}`}
                        className="w-full p-2 border rounded"
                        defaultValue={item.aiResponse.suggestedResponse}
                        rows="4"
                        onChange={(e) => {
                          // Track changes locally if needed
                          console.log('Text changed for:', item.id);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Confidence: {(item.aiResponse.confidence * 100).toFixed(0)}%
                        {item.aiResponse.editedAt && (
                          <span className="ml-2">• Edited by {item.aiResponse.editedBy}</span>
                        )}
                      </p>
                      <button
                        onClick={() => {
                          const textarea = document.getElementById(`response-${item.id}`);
                          const newText = textarea.value;
                          handleSaveEdit(item.aiResponse.id, newText);
                        }}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded mr-2"
                      >
                        Save Edit
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 mb-2">No AI response generated</p>
                      <button
                        onClick={async () => {
                          try {
                            // Generate AI response for this request
                            const aiResponse = generateQuickResponse(item.content);
                            // Save to Firestore
                            await addDoc(collection(db, 'social_responses'), {
                              requestId: item.id,
                              platform: item.platform,
                              customerId: item.customer?.id,
                              customerName: item.customer?.name,
                              originalMessage: item.content,
                              suggestedResponse: aiResponse,
                              status: 'pending_approval',
                              confidence: 0.85,
                              createdAt: serverTimestamp(),
                              metadata: { aiModel: 'gpt-4', generated: 'manual' }
                            });
                            alert('AI response generated!');
                            await fetchData();
                          } catch (error) {
                            console.error('Error generating response:', error);
                            alert('Failed to generate response');
                          }
                        }}
                        className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded"
                      >
                        Generate AI Response
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(item.aiResponse?.id || item.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve & Send
                  </button>
                  {/* Save Edit button now inside AI response block above */}
                  <button
                    onClick={() => handleReject(item.aiResponse?.id || item.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
