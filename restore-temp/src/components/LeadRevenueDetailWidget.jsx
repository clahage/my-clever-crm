import React from 'react';
import RevenuePredictionEngine from '../utils/RevenuePredictionEngine';

export default function LeadRevenueDetailWidget({ lead, month = new Date().getMonth() + 1, year = new Date().getFullYear() }) {
  // Calculate prediction data for this lead
  const engine = new RevenuePredictionEngine({ leads: [lead], month, year });
  const probability = engine.calculateConversionProbability(lead);
  const revenueConservative = engine.estimateLeadRevenue(lead, 'conservative');
  const revenueRealistic = engine.estimateLeadRevenue(lead, 'realistic');
  const revenueOptimistic = engine.estimateLeadRevenue(lead, 'optimistic');

  // Factors (user-friendly)
  const aiScore = Number(lead.leadScore) || 5;
  const weeksSinceIntro = engine._weeksSince(lead.createdAt);
  const followUpCount = lead?.conversionTracking?.followUpCount || 0;
  const seasonal = lead?.predictionData?.seasonalMultiplier || 1.0;
  const decayFactor = lead?.predictionData?.weeklyDecayFactor || 0.95;

  // Lead Quality
  let qualityLabel = 'Average';
  let qualityIcon = '⚡';
  if (aiScore >= 8) { qualityLabel = 'Excellent'; qualityIcon = '🌟'; }
  else if (aiScore >= 6) { qualityLabel = 'Good'; qualityIcon = '👍'; }
  else if (aiScore <= 4) { qualityLabel = 'Poor'; qualityIcon = '⚠️'; }

  // Lead Age
  let ageLabel = 'Fresh';
  let ageIcon = '🟢';
  if (weeksSinceIntro >= 8) { ageLabel = 'Stale'; ageIcon = '🔴'; }
  else if (weeksSinceIntro >= 4) { ageLabel = 'Aging'; ageIcon = '🟡'; }

  // Seasonal
  let seasonalLabel = 'Neutral';
  let seasonalIcon = '📅';
  let seasonalBoost = Math.round((seasonal - 1) * 100);
  if (seasonalBoost > 0) { seasonalLabel = `Good (${seasonalBoost}% boost)`; seasonalIcon = '☀️'; }
  else if (seasonalBoost < 0) { seasonalLabel = `Challenging (${seasonalBoost}% drop)`; seasonalIcon = '❄️'; }

  // Follow-up
  let followUpLabel = `${followUpCount} contact${followUpCount === 1 ? '' : 's'} made`;
  let followUpIcon = '📞';

  // Confidence calculation
  const spread = revenueOptimistic - revenueConservative;
  const confidence = spread < 0.2 * revenueRealistic ? 'High' : spread < 0.4 * revenueRealistic ? 'Medium' : 'Low';

  // Actionable insights (business-focused)
  let priority = 'Medium';
  let priorityIcon = '⚡';
  if (probability >= 0.8) { priority = 'High'; priorityIcon = '🔥'; }
  else if (probability <= 0.4) { priority = 'Low'; priorityIcon = '⏳'; }

  let followUpAdvice = '';
  let strategyAdvice = '';
  let timingAdvice = '';
  if (probability >= 0.8) {
    followUpAdvice = `${priorityIcon} Priority Action: Call within 24 hours - highest conversion window.`;
    strategyAdvice = '💡 Strategy: Lead is hot - act fast to close.';
    timingAdvice = '⏰ Optimal timing: Contact before 2 PM for best response rates.';
  } else if (weeksSinceIntro > 4) {
    followUpAdvice = '📞 Recommended: Schedule follow-up call Tuesday morning.';
    strategyAdvice = '💡 Strategy: Lead is warm but aging - act fast to maintain interest.';
    timingAdvice = '⏰ Optimal timing: Contact this week to revive interest.';
  } else if (probability < 0.6) {
    followUpAdvice = `📞 Increase follow-ups (currently ${followUpCount}) to boost conversion.`;
    strategyAdvice = '💡 Strategy: Nurture with value-driven communication.';
    timingAdvice = '⏰ Try contacting late morning for best results.';
  } else {
    followUpAdvice = '📞 Maintain regular contact for best results.';
    strategyAdvice = '💡 Strategy: Keep engagement high.';
    timingAdvice = '⏰ Contact every 3-5 days to stay top-of-mind.';
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-blue-700">Lead Revenue Prediction</h2>
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-800">{lead.firstName} {lead.lastName}</div>
        <div className="text-sm text-gray-500">{lead.email}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded p-3 flex flex-col items-center">
          <div className="text-xl font-bold text-blue-700">{(probability * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-600">Conversion Probability</div>
        </div>
        <div className="bg-green-50 rounded p-3 flex flex-col items-center">
          <div className="text-lg text-green-700">${revenueRealistic.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Realistic Revenue</div>
        </div>
        <div className="bg-purple-50 rounded p-3 flex flex-col items-center">
          <div className="text-sm text-purple-700">Confidence: {confidence}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-yellow-50 rounded p-3 flex flex-col items-center">
          <div className="text-sm text-yellow-700">Conservative: ${revenueConservative.toLocaleString()}</div>
        </div>
        <div className="bg-green-100 rounded p-3 flex flex-col items-center">
          <div className="text-sm text-green-700">Optimistic: ${revenueOptimistic.toLocaleString()}</div>
        </div>
        <div className="bg-gray-100 rounded p-3 flex flex-col items-center">
          <div className="text-sm text-gray-700">{priorityIcon} Priority: {priority}</div>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">Prediction Factors</h3>
        <ul className="ml-2 text-sm text-gray-700">
          <li className="mb-1">{qualityIcon} Lead Quality: <span className="font-semibold">{qualityLabel}</span> ({aiScore}/10)</li>
          <li className="mb-1">{ageIcon} Lead Age: <span className="font-semibold">{ageLabel}</span> ({weeksSinceIntro} week{weeksSinceIntro === 1 ? '' : 's'} old)</li>
          <li className="mb-1">{followUpIcon} Follow-up History: <span className="font-semibold">{followUpLabel}</span></li>
          <li className="mb-1">{seasonalIcon} Seasonal Timing: <span className="font-semibold">{seasonalLabel}</span></li>
        </ul>
      </div>
      <div className="mb-2">
        <h3 className="font-semibold text-gray-800 mb-2">Actionable Insights</h3>
        <div className="text-sm text-blue-700 mb-1">{followUpAdvice}</div>
        <div className="text-sm text-green-700 mb-1">{strategyAdvice}</div>
        <div className="text-sm text-purple-700 mb-1">{timingAdvice}</div>
      </div>
    </div>
  );
}
