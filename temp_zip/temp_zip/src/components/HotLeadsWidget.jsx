import React, { useState, useEffect } from 'react';
import { Phone, TrendingUp, AlertCircle, ChevronRight, Clock, DollarSign } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';

const HotLeadsWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hotLeads, setHotLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Query for hot leads directly
    const q = query(
      collection(db, 'contacts'),
      where('category', '==', 'lead'),
      where('leadScore', '>=', 8),
      orderBy('leadScore', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const leads = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHotLeads(leads);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching hot leads:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCallLead = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-red-600 dark:text-red-400';
    if (score >= 8) return 'text-orange-600 dark:text-orange-400';
    if (score >= 7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyColors = {
      'high': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'low': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    };
    
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${urgencyColors[urgency] || urgencyColors.low}`}>
        {urgency || 'Low'} urgency
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hot Leads</h3>
          </div>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hot Leads</h3>
          </div>
        </div>
        <p className="text-red-500 text-sm">Error loading hot leads</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please check Firebase configuration</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Hot Leads
          </h3>
          <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
            {hotLeads.length}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronRight className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {hotLeads.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No hot leads at the moment</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Leads with score ≥ 8 will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hotLeads.slice(0, isExpanded ? hotLeads.length : 3).map((lead) => (
            <div 
              key={lead.id} 
              className="border dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {lead.name || lead.callerName || 'Unknown Contact'}
                      </p>
                      {lead.company && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {lead.company}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(lead.leadScore || 0)}`}>
                        {lead.leadScore || 0}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(lead.createdAt || lead.timestamp)}
                    </span>
                    {getUrgencyBadge(lead.urgencyLevel)}
                    {lead.conversionProbability && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <DollarSign className="w-3 h-3" />
                        {lead.conversionProbability}% likely
                      </span>
                    )}
                  </div>
                  
                  {lead.summary && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {lead.summary}
                    </p>
                  )}
                  
                  {lead.painPoints && lead.painPoints.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {lead.painPoints.slice(0, 3).map((point, idx) => (
                        <span 
                          key={idx} 
                          className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1 ml-2">
                  {lead.phone && (
                    <button
                      onClick={() => handleCallLead(lead.phone)}
                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                      title={`Call ${lead.phone}`}
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {!isExpanded && hotLeads.length > 3 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all {hotLeads.length} hot leads →
            </button>
          )}
          
          <Link
            to="/leads"
            className="block text-center py-2 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            View All Leads
          </Link>
        </div>
      )}
    </div>
  );
};

export default HotLeadsWidget;