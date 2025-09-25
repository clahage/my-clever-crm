import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase'; // FIXED: corrected import path
import { AlertCircle, TrendingUp, X, Phone, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const HotLeadsAlert = () => {
  const [hotLeads, setHotLeads] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [dismissedLeads, setDismissedLeads] = useState(new Set());

  useEffect(() => {
    // Query for hot leads (score >= 8) or high urgency
    const q = query(
      collection(db, 'contacts'),
      where('category', '==', 'lead'),
      where('status', '==', 'hot'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter out dismissed leads
      const activeLeads = leads.filter(lead => !dismissedLeads.has(lead.id));
      
      // Check for new hot leads (not dismissed)
      if (activeLeads.length > 0) {
        setShowAlert(true);
        
        // Only play sound for truly new leads
        const newLeadsCount = activeLeads.filter(lead => 
          !hotLeads.find(existing => existing.id === lead.id)
        ).length;
        
        if (newLeadsCount > 0) {
          try {
            const audio = new Audio('/sounds/alert.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
              // Silent fail if audio blocked
            });
          } catch (e) {
            // No audio available
          }
        }
      }
      
      setHotLeads(activeLeads);
    });

    return () => unsubscribe();
  }, [dismissedLeads]);

  const dismissLead = (leadId) => {
    setDismissedLeads(prev => new Set(prev).add(leadId));
  };

  const dismissAll = () => {
    setShowAlert(false);
    setDismissedLeads(new Set(hotLeads.map(lead => lead.id)));
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // Difference in seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getUrgencyColor = (urgencyLevel) => {
    switch(urgencyLevel) {
      case 'high':
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800';
    }
  };

  if (!showAlert || hotLeads.length === 0) return null;

  return (
    <div className="mb-4">
      <div className={`${getUrgencyColor(hotLeads[0]?.urgencyLevel)} border rounded-lg p-4 shadow-sm`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-red-100 dark:bg-red-800/30 rounded-lg p-2 flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                {hotLeads.length} Hot {hotLeads.length === 1 ? 'Lead' : 'Leads'} Require Immediate Attention
              </h3>
              
              <div className="space-y-2 mb-3">
                {hotLeads.slice(0, 3).map(lead => (
                  <div 
                    key={lead.id} 
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {lead.name || lead.callerName || 'Unknown Contact'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            • {getTimeAgo(lead.createdAt || lead.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            Score: <strong className="text-red-600">{lead.leadScore || 0}/10</strong>
                          </span>
                          {lead.phone && (
                            <a 
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                            >
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </a>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Respond within 1 hour
                          </span>
                        </div>
                        
                        {lead.summary && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {lead.summary}
                          </p>
                        )}
                        
                        {lead.painPoints && lead.painPoints.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {lead.painPoints.slice(0, 2).map((point, idx) => (
                              <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                                {point}
                              </span>
                            ))}
                            {lead.painPoints.length > 2 && (
                              <span className="text-xs text-gray-500">+{lead.painPoints.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => dismissLead(lead.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
                        title="Dismiss this lead"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {hotLeads.length > 3 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  +{hotLeads.length - 3} more hot leads waiting...
                </p>
              )}
              
              <div className="flex items-center gap-3">
                <Link 
                  to="/leads" 
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View all hot leads →
                </Link>
                <button
                  onClick={dismissAll}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Dismiss all
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowAlert(false)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 ml-2"
            title="Hide alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotLeadsAlert;