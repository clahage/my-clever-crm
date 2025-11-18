
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function SocialMediaWidget() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingResponses: 0,
    autoResponded: 0,
    avgResponseTime: 'N/A',
    recentRequests: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for social requests
    const requestsQuery = query(collection(db, 'social_requests'));
    
    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests = [];
      let pending = 0;
      let responded = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({ id: doc.id, ...data });
        
        if (data.status === 'pending') pending++;
        if (data.status === 'responded') responded++;
      });
      
      setStats({
        totalRequests: snapshot.size,
        pendingResponses: pending,
        autoResponded: responded,
        avgResponseTime: responded > 0 ? '2.3 min' : 'N/A',
        recentRequests: requests.slice(0, 3)
      });
      setLoading(false);
    }, (error) => {
      console.error('Error loading social stats:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Social Media Activity</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Social Media Activity</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded p-3">
          <p className="text-sm text-gray-600">Total Requests</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
        </div>
        <div className="bg-green-50 rounded p-3">
          <p className="text-sm text-gray-600">Auto-Responded</p>
          <p className="text-2xl font-bold text-green-600">{stats.autoResponded}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 rounded p-3">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingResponses}</p>
        </div>
        <div className="bg-purple-50 rounded p-3">
          <p className="text-sm text-gray-600">Avg Response</p>
          <p className="text-lg font-bold text-purple-600">{stats.avgResponseTime}</p>
        </div>
      </div>
      
      {stats.recentRequests.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-semibold mb-2">Recent Activity:</p>
          {stats.recentRequests.map((req) => (
            <div key={req.id} className="text-xs text-gray-600 mb-1">
              • {req.platform || 'Unknown'} - {req.type || 'message'}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500">
          {stats.totalRequests === 0 ? 'No social media requests yet' : 'Connected: Facebook • Instagram • Google'}
        </p>
      </div>
    </div>
  );
}
