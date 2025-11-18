// src/components/CreditComparisonView.jsx
// Credit Report Comparison Viewer
// Visual side-by-side comparison showing changes over time

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  DollarSign,
  Calendar,
  Percent,
  Activity
} from 'lucide-react';

export default function CreditComparisonView({ currentReport, previousReport, comparison }) {
  const [activeSection, setActiveSection] = useState('scores'); // 'scores', 'accounts', 'utilization', 'negatives'

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getScoreColor = (score) => {
    if (score >= 750) return 'text-green-600 dark:text-green-400';
    if (score >= 700) return 'text-blue-600 dark:text-blue-400';
    if (score >= 650) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 600) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />;
    if (change < 0) return <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getChangeColor = (change, inverse = false) => {
    if (change === 0) return 'text-gray-600 dark:text-gray-400';
    if (inverse) {
      return change < 0 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400';
    }
    return change > 0 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
      <h2 className="text-2xl font-bold mb-2">Credit Report Comparison</h2>
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Previous: {formatDate(previousReport?.pulledAt)}</span>
        </div>
        <ArrowRight className="w-4 h-4" />
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Current: {formatDate(currentReport?.pulledAt)}</span>
        </div>
        <div className="ml-auto bg-white/20 px-3 py-1 rounded-full">
          {comparison?.timePeriod?.readable || 'N/A'} apart
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-1 px-6">
        <button
          onClick={() => setActiveSection('scores')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeSection === 'scores'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 inline mr-2" />
          Scores
        </button>
        <button
          onClick={() => setActiveSection('accounts')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeSection === 'accounts'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Accounts
        </button>
        <button
          onClick={() => setActiveSection('utilization')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeSection === 'utilization'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4 inline mr-2" />
          Utilization
        </button>
        <button
          onClick={() => setActiveSection('negatives')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeSection === 'negatives'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <AlertCircle className="w-4 h-4 inline mr-2" />
          Negative Items
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // SCORES COMPARISON
  // ============================================================================

  const renderScoresSection = () => {
    const scores = comparison?.scoreChanges || {};

    const renderScoreCard = (label, scoreData) => {
      if (!scoreData || !scoreData.available) {
        return (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 opacity-50">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{label}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Not available</p>
          </div>
        );
      }

      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">{label}</h4>
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Previous</p>
              <p className={`text-2xl font-bold ${getScoreColor(scoreData.previous)}`}>
                {scoreData.previous}
              </p>
            </div>

            <div className="flex flex-col items-center px-4">
              {getChangeIcon(scoreData.change)}
              <span className={`text-lg font-bold ${getChangeColor(scoreData.change)}`}>
                {scoreData.change > 0 ? '+' : ''}{scoreData.change}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</p>
              <p className={`text-2xl font-bold ${getScoreColor(scoreData.current)}`}>
                {scoreData.current}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {scoreData.changePercent > 0 ? '+' : ''}{scoreData.changePercent}%
            </span>
            <span className={`px-2 py-1 rounded-full font-medium ${
              scoreData.impact === 'major' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
              scoreData.impact === 'significant' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
              scoreData.impact === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
              'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {scoreData.impact} impact
            </span>
          </div>
        </div>
      );
    };

    return (
      <div className="p-6 space-y-6">
        {/* Overall Impact Banner */}
        <div className={`rounded-lg p-4 ${
          comparison?.overallImpact === 'very positive' ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' :
          comparison?.overallImpact === 'positive' ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' :
          comparison?.overallImpact === 'very negative' ? 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800' :
          comparison?.overallImpact === 'negative' ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800' :
          'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
        }`}>
          <div className="flex items-center gap-3">
            {comparison?.overallImpact?.includes('positive') ? (
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            ) : comparison?.overallImpact?.includes('negative') ? (
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            ) : (
              <Minus className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            )}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Overall Impact: {comparison?.overallImpact || 'Neutral'}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {comparison?.aiAnalysis?.summary || 'Your credit profile has changed this month.'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Score */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Primary Score</h3>
          <div className="grid grid-cols-1 gap-4">
            {renderScoreCard('VantageScore', scores.vantage)}
          </div>
        </div>

        {/* FICO Scores */}
        {(scores.fico8?.available || scores.ficoAuto?.available || scores.ficoMortgage?.available) && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">FICO Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderScoreCard('FICO 8', scores.fico8)}
              {renderScoreCard('FICO Auto', scores.ficoAuto)}
              {renderScoreCard('FICO Mortgage', scores.ficoMortgage)}
            </div>
          </div>
        )}

        {/* Bureau Scores */}
        {(scores.bureaus?.experian?.available || scores.bureaus?.equifax?.available || scores.bureaus?.transunion?.available) && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Bureau Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderScoreCard('Experian', scores.bureaus?.experian)}
              {renderScoreCard('Equifax', scores.bureaus?.equifax)}
              {renderScoreCard('TransUnion', scores.bureaus?.transunion)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // ACCOUNTS COMPARISON
  // ============================================================================

  const renderAccountsSection = () => {
    const changes = comparison?.accountChanges || {};

    return (
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">New Accounts</span>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{changes.summary?.totalNew || 0}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Closed Accounts</span>
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              -{changes.summary?.totalClosed || 0}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Balance Changes</span>
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {changes.summary?.balanceChangesCount || 0}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status Changes</span>
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {changes.summary?.statusChangesCount || 0}
            </p>
          </div>
        </div>

        {/* New Accounts */}
        {changes.newAccounts && changes.newAccounts.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              New Accounts ({changes.newAccounts.length})
            </h3>
            <div className="space-y-2">
              {changes.newAccounts.map((account, index) => (
                <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {account.name || 'Unknown Account'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {account.type} • Opened {formatDate(account.opened)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${account.balance?.toLocaleString() || 0}
                      </p>
                      {account.limit && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Limit: ${account.limit.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closed Accounts */}
        {changes.closedAccounts && changes.closedAccounts.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              Closed Accounts ({changes.closedAccounts.length})
            </h3>
            <div className="space-y-2">
              {changes.closedAccounts.map((account, index) => (
                <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {account.name || 'Unknown Account'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {account.type} • Closed {formatDate(account.closedDate)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                      {account.wasStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Balance Changes */}
        {changes.balanceChanges && changes.balanceChanges.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Balance Changes ({changes.balanceChanges.length})
            </h3>
            <div className="space-y-2">
              {changes.balanceChanges.map((change, index) => (
                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {change.account}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {change.accountType}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          ${change.previousBalance.toLocaleString()}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${change.currentBalance.toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${getChangeColor(change.change, true)}`}>
                        {change.change > 0 ? '+' : ''}${Math.abs(change.change).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!changes.newAccounts || changes.newAccounts.length === 0) &&
         (!changes.closedAccounts || changes.closedAccounts.length === 0) &&
         (!changes.balanceChanges || changes.balanceChanges.length === 0) && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Account Changes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your accounts remained stable this period
            </p>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // UTILIZATION COMPARISON
  // ============================================================================

  const renderUtilizationSection = () => {
    const utilChange = comparison?.utilizationChange || {};

    if (!utilChange.available) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <Percent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Utilization data not available
            </p>
          </div>
        </div>
      );
    }

    const getUtilizationColor = (util) => {
      if (util <= 10) return 'text-green-600 dark:text-green-400';
      if (util <= 30) return 'text-blue-600 dark:text-blue-400';
      if (util <= 50) return 'text-yellow-600 dark:text-yellow-400';
      if (util <= 70) return 'text-orange-600 dark:text-orange-400';
      return 'text-red-600 dark:text-red-400';
    };

    const getUtilizationBg = (util) => {
      if (util <= 10) return 'bg-green-100 dark:bg-green-900/30';
      if (util <= 30) return 'bg-blue-100 dark:bg-blue-900/30';
      if (util <= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
      if (util <= 70) return 'bg-orange-100 dark:bg-orange-900/30';
      return 'bg-red-100 dark:bg-red-900/30';
    };

    return (
      <div className="p-6 space-y-6">
        {/* Main Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Credit Utilization Change
          </h3>

          <div className="flex items-center justify-around mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Previous</p>
              <div className={`w-32 h-32 rounded-full ${getUtilizationBg(utilChange.previous)} flex items-center justify-center`}>
                <span className={`text-3xl font-bold ${getUtilizationColor(utilChange.previous)}`}>
                  {utilChange.previous}%
                </span>
              </div>
            </div>

            <div className="text-center px-6">
              {getChangeIcon(utilChange.change)}
              <span className={`text-2xl font-bold block mt-2 ${getChangeColor(utilChange.change, true)}`}>
                {utilChange.change > 0 ? '+' : ''}{utilChange.change}%
              </span>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current</p>
              <div className={`w-32 h-32 rounded-full ${getUtilizationBg(utilChange.current)} flex items-center justify-center`}>
                <span className={`text-3xl font-bold ${getUtilizationColor(utilChange.current)}`}>
                  {utilChange.current}%
                </span>
              </div>
            </div>
          </div>

          {/* Impact Badge */}
          <div className={`text-center p-4 rounded-lg ${
            utilChange.impact?.includes('positive') ? 'bg-green-100 dark:bg-green-900/30' :
            utilChange.impact?.includes('negative') ? 'bg-red-100 dark:bg-red-900/30' :
            'bg-gray-100 dark:bg-gray-700'
          }`}>
            <p className="font-medium text-gray-900 dark:text-white">
              Impact: {utilChange.impact || 'Neutral'}
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Recommendation
          </h4>
          <p className="text-blue-800 dark:text-blue-200">
            {utilChange.recommendation || 'Maintain current utilization levels'}
          </p>
        </div>

        {/* Utilization Scale */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Utilization Impact Scale
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">0-10%</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Excellent - Maximum score impact</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">11-30%</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Good - Recommended range</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">31-50%</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Fair - Room for improvement</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">51-70%</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">High - Negatively impacting score</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-8 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                <span className="text-xs font-medium text-red-700 dark:text-red-300">71-100%</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Critical - Urgent action needed</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // NEGATIVE ITEMS COMPARISON
  // ============================================================================

  const renderNegativesSection = () => {
    const negChanges = comparison?.negativeItemChanges || {};

    return (
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Items Removed</span>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {negChanges.summary?.totalRemoved || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Great progress!</p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Items Added</span>
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {negChanges.summary?.totalAdded || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Needs attention</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Net Change</span>
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className={`text-3xl font-bold ${getChangeColor(negChanges.summary?.netChange || 0)}`}>
              {negChanges.summary?.netChange > 0 ? '+' : ''}{negChanges.summary?.netChange || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall impact</p>
          </div>
        </div>

        {/* Removed Items (Good!) */}
        {negChanges.removed && negChanges.removed.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              Removed from Report ({negChanges.removed.length})
            </h3>
            <div className="space-y-2">
              {negChanges.removed.map((item, index) => (
                <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded mb-2">
                        {item.type}
                      </span>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.account}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${item.amount?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ Removed
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Added Items (Bad) */}
        {negChanges.added && negChanges.added.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              Added to Report ({negChanges.added.length})
            </h3>
            <div className="space-y-2">
              {negChanges.added.map((item, index) => (
                <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs rounded mb-2">
                        {item.type}
                      </span>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.account}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${item.amount?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        ! New
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!negChanges.removed || negChanges.removed.length === 0) &&
         (!negChanges.added || negChanges.added.length === 0) && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Changes in Negative Items
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your negative items remained the same this period
            </p>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!comparison || !currentReport || !previousReport) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Comparison Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Need at least two reports to show comparison
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {renderHeader()}
      {renderTabs()}
      
      {activeSection === 'scores' && renderScoresSection()}
      {activeSection === 'accounts' && renderAccountsSection()}
      {activeSection === 'utilization' && renderUtilizationSection()}
      {activeSection === 'negatives' && renderNegativesSection()}
    </div>
  );
}