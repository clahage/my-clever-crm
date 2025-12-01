import React, { useEffect, useState } from 'react';
import realPipelineAI from '../services/RealPipelineAIService.js';
import { RefreshCw, AlertTriangle, CheckCircle, TrendingUp, Activity, Shield } from 'lucide-react';

const LeadScoreCard = ({ lead, onScoreUpdate }) => {
  const [scoring, setScoring] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateScore = async (forceRefresh = false) => {
    if (!lead) return;
    
    setLoading(true);
    setError(null);
    try {
      // In a real app, you might check if a score already exists in Firestore 
      // before calling the AI API to save costs.
      const result = await realPipelineAI.scoreLeadIntelligently(lead);
      setScoring(result);
      if (onScoreUpdate) onScoreUpdate(result);
    } catch (err) {
      console.error("Scoring failed:", err);
      setError("AI Service unavailable. Using fallback data.");
      // Fallback is handled internally by the service, but if that fails:
      setScoring(realPipelineAI.fallbackLeadScore(lead));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateScore();
  }, [lead?.id]); // Recalculate if lead ID changes

  if (!lead) return <div className="p-4 text-gray-500">No lead selected</div>;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 border-green-500';
    if (score >= 50) return 'text-yellow-500 border-yellow-500';
    return 'text-red-500 border-red-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">AI Lead Intelligence</h3>
        </div>
        <button 
          onClick={() => calculateScore(true)}
          disabled={loading}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Recalculate Score"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Score Circle */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className={`relative w-32 h-32 rounded-full border-8 flex items-center justify-center ${scoring ? getScoreColor(scoring.leadScore) : 'border-gray-200'}`}>
              {loading ? (
                <span className="text-gray-400 text-sm">Analyzing...</span>
              ) : (
                <div className="text-center">
                  <span className={`text-4xl font-bold ${scoring ? getScoreColor(scoring.leadScore).split(' ')[0] : 'text-gray-300'}`}>
                    {scoring ? scoring.leadScore : '--'}
                  </span>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Score</p>
                </div>
              )}
            </div>
            {scoring && (
              <span className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${getScoreBg(scoring.leadScore)}`}>
                {scoring.leadScore >= 80 ? 'Highly Qualified' : scoring.leadScore >= 50 ? 'Moderate Potential' : 'Low Potential'}
              </span>
            )}
          </div>

          {/* Details & Breakdown */}
          <div className="flex-grow space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-100 rounded w-full mt-4"></div>
              </div>
            ) : scoring ? (
              <>
                {/* Reasoning */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase mb-2 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> AI Analysis
                  </h4>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    {scoring.reasoning}
                  </p>
                </div>

                {/* Score Breakdown Grid */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <BreakdownItem label="Qualification" value={scoring.scoreBreakdown?.qualification} max={25} />
                  <BreakdownItem label="Engagement" value={scoring.scoreBreakdown?.engagement} max={25} />
                  <BreakdownItem label="Urgency" value={scoring.scoreBreakdown?.urgency} max={25} />
                  <BreakdownItem label="Fit" value={scoring.scoreBreakdown?.fit} max={25} />
                </div>

                {/* Signals */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Strong Signals</h5>
                    <ul className="space-y-1">
                      {scoring.strongSignals?.map((signal, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Key Concerns</h5>
                     <ul className="space-y-1">
                      {scoring.concerns?.map((concern, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="text-xs font-semibold text-gray-500 mb-2 uppercase flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Recommended Actions
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {scoring.recommendedActions?.map((action, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Click refresh to analyze this lead
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for small progress bars
const BreakdownItem = ({ label, value, max }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-medium text-gray-900">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LeadScoreCard;