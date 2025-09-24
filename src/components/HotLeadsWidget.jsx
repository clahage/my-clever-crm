import React, { useState } from 'react';
import { Phone, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import useRealtimeLeads from '../hooks/useRealtimeLeads';

const HotLeadsWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Pass the required parameters object to useRealtimeLeads
  const { hotLeads, loading, error } = useRealtimeLeads({
    search: '',
    filter: null,
    hotLeadsOnly: true
  });

  const handleCallLead = (phone) => {
    window.location.href = `tel:${phone}`;
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
        <p className="text-red-500 text-sm">Error loading hot leads: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Hot Leads (Score ≥ 8)
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronRight className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {hotLeads.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No hot leads at the moment.</p>
      ) : (
        <div className="space-y-3">
          {hotLeads.slice(0, isExpanded ? hotLeads.length : 3).map((lead) => (
            <div key={lead.id} className="border dark:border-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {lead.username || lead.name || 'Unknown Caller'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Score: {lead.leadScore || lead.score || 0}/10
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {lead.summary || lead.urgency || 'No summary available'}
                  </p>
                  {lead.timestamp && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(lead.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
                {lead.caller && (
                  <button
                    onClick={() => handleCallLead(lead.caller)}
                    className="ml-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                    title="Call lead"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {!isExpanded && hotLeads.length > 3 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all {hotLeads.length} hot leads
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HotLeadsWidget;