// src/services/creditComparisonService.js
// Credit Report Comparison Service
// Analyzes changes between credit reports for monthly updates

import OpenAI from 'openai';

// ============================================================================
// OPENAI CONFIGURATION
// ============================================================================

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// ============================================================================
// COMPARISON FUNCTIONS
// ============================================================================

/**
 * Compare two credit reports and identify all changes
 * This is the main function used by monthly updates
 * 
 * @param {object} currentReport - Latest credit report
 * @param {object} previousReport - Previous credit report
 * @returns {object} Comprehensive comparison data
 */
export async function compareReports(currentReport, previousReport) {
  console.log('📊 Comparing credit reports...');
  console.log('Current:', currentReport.pulledAt);
  console.log('Previous:', previousReport.pulledAt);

  try {
    // Compare all aspects of the reports
    const scoreChanges = compareScores(currentReport.scores, previousReport.scores);
    const accountChanges = compareAccounts(
      currentReport.parsedData?.tradelines || [],
      previousReport.parsedData?.tradelines || []
    );
    const utilizationChange = compareUtilization(
      currentReport.parsedData?.utilization,
      previousReport.parsedData?.utilization
    );
    const negativeItemChanges = compareNegativeItems(
      currentReport.parsedData?.negatives || [],
      previousReport.parsedData?.negatives || []
    );
    const inquiryChanges = compareInquiries(
      currentReport.parsedData?.hardInquiries || [],
      previousReport.parsedData?.hardInquiries || []
    );
    const publicRecordChanges = comparePublicRecords(
      currentReport.parsedData?.publicRecords || [],
      previousReport.parsedData?.publicRecords || []
    );

    // Get AI analysis of the changes
    const aiAnalysis = await analyzeChanges({
      scoreChanges,
      accountChanges,
      utilizationChange,
      negativeItemChanges
    });

    // Build comprehensive comparison object
    const comparison = {
      currentReportId: currentReport.id,
      previousReportId: previousReport.id,
      comparedAt: new Date().toISOString(),
      timePeriod: calculateTimePeriod(previousReport.pulledAt, currentReport.pulledAt),

      // Score changes
      scoreChanges,

      // Account changes
      accountChanges,

      // Utilization changes
      utilizationChange,

      // Negative item changes
      negativeItemChanges,

      // Inquiry changes
      inquiryChanges,

      // Public record changes
      publicRecordChanges,

      // AI analysis
      aiAnalysis,

      // Overall impact
      overallImpact: calculateOverallImpact(scoreChanges, accountChanges, utilizationChange)
    };

    console.log('✅ Report comparison complete');
    return comparison;

  } catch (error) {
    console.error('❌ Error comparing reports:', error);
    throw error;
  }
}

// ============================================================================
// SCORE COMPARISON
// ============================================================================

/**
 * Compare all score models
 */
function compareScores(currentScores, previousScores) {
  const compareModel = (current, previous, modelName) => {
    const currentScore = current || null;
    const previousScore = previous || null;

    if (!currentScore || !previousScore) {
      return {
        previous: previousScore,
        current: currentScore,
        change: null,
        changePercent: null,
        direction: 'unknown',
        available: false
      };
    }

    const change = currentScore - previousScore;
    const changePercent = ((change / previousScore) * 100).toFixed(1);

    return {
      previous: previousScore,
      current: currentScore,
      change: change,
      changePercent: parseFloat(changePercent),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      impact: change > 20 ? 'major' : change > 10 ? 'significant' : change > 5 ? 'moderate' : 'minor',
      available: true
    };
  };

  return {
    vantage: compareModel(
      currentScores?.vantage?.score,
      previousScores?.vantage?.score,
      'VantageScore'
    ),
    fico8: compareModel(
      currentScores?.fico?.fico8?.score,
      previousScores?.fico?.fico8?.score,
      'FICO 8'
    ),
    ficoAuto: compareModel(
      currentScores?.fico?.ficoAuto?.score,
      previousScores?.fico?.ficoAuto?.score,
      'FICO Auto'
    ),
    ficoMortgage: compareModel(
      currentScores?.fico?.ficoMortgage?.score,
      previousScores?.fico?.ficoMortgage?.score,
      'FICO Mortgage'
    ),
    bureaus: {
      experian: compareModel(
        currentScores?.bureaus?.experian,
        previousScores?.bureaus?.experian,
        'Experian'
      ),
      equifax: compareModel(
        currentScores?.bureaus?.equifax,
        previousScores?.bureaus?.equifax,
        'Equifax'
      ),
      transunion: compareModel(
        currentScores?.bureaus?.transunion,
        previousScores?.bureaus?.transunion,
        'TransUnion'
      )
    }
  };
}

// ============================================================================
// ACCOUNT COMPARISON
// ============================================================================

/**
 * Compare tradeline accounts
 */
function compareAccounts(currentAccounts, previousAccounts) {
  // Find new accounts
  const newAccounts = currentAccounts.filter(current => 
    !previousAccounts.some(prev => prev.accountId === current.accountId)
  );

  // Find closed accounts
  const closedAccounts = previousAccounts.filter(prev => 
    !currentAccounts.some(current => current.accountId === prev.accountId)
  );

  // Find accounts with balance changes
  const balanceChanges = [];
  currentAccounts.forEach(current => {
    const previous = previousAccounts.find(p => p.accountId === current.accountId);
    if (previous && current.balance !== previous.balance) {
      balanceChanges.push({
        account: current.accountName || current.accountId,
        accountType: current.accountType,
        previousBalance: previous.balance,
        currentBalance: current.balance,
        change: current.balance - previous.balance,
        impact: current.balance < previous.balance ? 'positive' : 'negative'
      });
    }
  });

  // Find accounts with limit changes
  const limitChanges = [];
  currentAccounts.forEach(current => {
    const previous = previousAccounts.find(p => p.accountId === current.accountId);
    if (previous && current.creditLimit && previous.creditLimit && 
        current.creditLimit !== previous.creditLimit) {
      limitChanges.push({
        account: current.accountName || current.accountId,
        previousLimit: previous.creditLimit,
        currentLimit: current.creditLimit,
        change: current.creditLimit - previous.creditLimit,
        impact: current.creditLimit > previous.creditLimit ? 'positive' : 'negative'
      });
    }
  });

  // Find status changes
  const statusChanges = [];
  currentAccounts.forEach(current => {
    const previous = previousAccounts.find(p => p.accountId === current.accountId);
    if (previous && current.status !== previous.status) {
      statusChanges.push({
        account: current.accountName || current.accountId,
        previousStatus: previous.status,
        currentStatus: current.status,
        impact: determineStatusImpact(previous.status, current.status)
      });
    }
  });

  return {
    newAccounts: newAccounts.map(a => ({
      name: a.accountName,
      type: a.accountType,
      opened: a.openedDate,
      status: a.status,
      balance: a.balance,
      limit: a.creditLimit
    })),
    closedAccounts: closedAccounts.map(a => ({
      name: a.accountName,
      type: a.accountType,
      closedDate: a.closedDate || 'Unknown',
      wasStatus: a.status
    })),
    balanceChanges,
    limitChanges,
    statusChanges,
    summary: {
      totalNew: newAccounts.length,
      totalClosed: closedAccounts.length,
      balanceChangesCount: balanceChanges.length,
      limitChangesCount: limitChanges.length,
      statusChangesCount: statusChanges.length
    }
  };
}

/**
 * Determine impact of status change
 */
function determineStatusImpact(previousStatus, currentStatus) {
  const positiveChanges = [
    { from: 'late', to: 'current' },
    { from: 'delinquent', to: 'current' },
    { from: 'collections', to: 'paid' }
  ];

  const negativeChanges = [
    { from: 'current', to: 'late' },
    { from: 'current', to: 'delinquent' },
    { from: 'current', to: 'collections' }
  ];

  const isPositive = positiveChanges.some(
    change => previousStatus?.toLowerCase().includes(change.from) && 
              currentStatus?.toLowerCase().includes(change.to)
  );

  const isNegative = negativeChanges.some(
    change => previousStatus?.toLowerCase().includes(change.from) && 
              currentStatus?.toLowerCase().includes(change.to)
  );

  if (isPositive) return 'positive';
  if (isNegative) return 'negative';
  return 'neutral';
}

// ============================================================================
// UTILIZATION COMPARISON
// ============================================================================

/**
 * Compare credit utilization
 */
function compareUtilization(currentUtil, previousUtil) {
  if (currentUtil === undefined || previousUtil === undefined) {
    return {
      previous: previousUtil || null,
      current: currentUtil || null,
      change: null,
      impact: 'unknown',
      available: false
    };
  }

  const change = currentUtil - previousUtil;

  return {
    previous: previousUtil,
    current: currentUtil,
    change: change,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    impact: determineUtilizationImpact(change, currentUtil),
    recommendation: getUtilizationRecommendation(currentUtil),
    available: true
  };
}

/**
 * Determine impact of utilization change
 */
function determineUtilizationImpact(change, currentUtil) {
  // Utilization went down (good)
  if (change < -10) return 'major positive';
  if (change < -5) return 'positive';
  
  // Utilization went up (bad)
  if (change > 10) return 'major negative';
  if (change > 5) return 'negative';
  
  // Minimal change
  if (currentUtil < 30) return 'neutral (good level)';
  if (currentUtil < 50) return 'neutral (moderate level)';
  return 'neutral (high level)';
}

/**
 * Get utilization recommendation
 */
function getUtilizationRecommendation(currentUtil) {
  if (currentUtil >= 70) {
    return 'Critical: Pay down balances immediately to below 30%';
  } else if (currentUtil >= 50) {
    return 'High: Reduce utilization to below 30% for score improvement';
  } else if (currentUtil >= 30) {
    return 'Moderate: Keep trending down toward 10% for optimal score';
  } else if (currentUtil >= 10) {
    return 'Good: Maintain current level or reduce further';
  } else {
    return 'Excellent: Continue maintaining low utilization';
  }
}

// ============================================================================
// NEGATIVE ITEMS COMPARISON
// ============================================================================

/**
 * Compare negative items
 */
function compareNegativeItems(currentNegatives, previousNegatives) {
  // Items removed (good!)
  const removed = previousNegatives.filter(prev => 
    !currentNegatives.some(curr => areItemsSame(prev, curr))
  );

  // Items added (bad)
  const added = currentNegatives.filter(curr => 
    !previousNegatives.some(prev => areItemsSame(prev, curr))
  );

  // Items that aged (older = better)
  const aged = currentNegatives.filter(curr => {
    const prev = previousNegatives.find(p => areItemsSame(p, curr));
    if (prev && curr.age && prev.age) {
      return curr.age > prev.age;
    }
    return false;
  });

  return {
    removed: removed.map(item => ({
      type: item.type,
      account: item.account,
      amount: item.amount,
      impact: 'positive'
    })),
    added: added.map(item => ({
      type: item.type,
      account: item.account,
      amount: item.amount,
      impact: 'negative'
    })),
    aged: aged.map(item => ({
      type: item.type,
      account: item.account,
      previousAge: previousNegatives.find(p => areItemsSame(p, item))?.age,
      currentAge: item.age,
      impact: 'minor positive'
    })),
    summary: {
      totalRemoved: removed.length,
      totalAdded: added.length,
      totalAged: aged.length,
      netChange: removed.length - added.length
    }
  };
}

/**
 * Check if two negative items are the same
 */
function areItemsSame(item1, item2) {
  return (
    item1.type === item2.type &&
    item1.account === item2.account &&
    item1.amount === item2.amount
  );
}

// ============================================================================
// INQUIRY COMPARISON
// ============================================================================

/**
 * Compare hard inquiries
 */
function compareInquiries(currentInquiries, previousInquiries) {
  const newInquiries = currentInquiries.filter(curr => 
    !previousInquiries.some(prev => 
      prev.creditor === curr.creditor && prev.date === curr.date
    )
  );

  const agedOff = previousInquiries.filter(prev => 
    !currentInquiries.some(curr => 
      curr.creditor === prev.creditor && curr.date === prev.date
    )
  );

  return {
    new: newInquiries,
    agedOff: agedOff,
    summary: {
      totalNew: newInquiries.length,
      totalAgedOff: agedOff.length,
      currentTotal: currentInquiries.length,
      previousTotal: previousInquiries.length,
      impact: newInquiries.length > 0 ? 'negative' : agedOff.length > 0 ? 'positive' : 'neutral'
    }
  };
}

// ============================================================================
// PUBLIC RECORDS COMPARISON
// ============================================================================

/**
 * Compare public records
 */
function comparePublicRecords(currentRecords, previousRecords) {
  const newRecords = currentRecords.filter(curr => 
    !previousRecords.some(prev => prev.caseNumber === curr.caseNumber)
  );

  const removedRecords = previousRecords.filter(prev => 
    !currentRecords.some(curr => curr.caseNumber === prev.caseNumber)
  );

  return {
    new: newRecords,
    removed: removedRecords,
    summary: {
      totalNew: newRecords.length,
      totalRemoved: removedRecords.length,
      currentTotal: currentRecords.length,
      previousTotal: previousRecords.length,
      impact: newRecords.length > 0 ? 'major negative' : removedRecords.length > 0 ? 'major positive' : 'neutral'
    }
  };
}

// ============================================================================
// AI ANALYSIS
// ============================================================================

/**
 * Get AI analysis of what caused the changes
 */
async function analyzeChanges(changes) {
  console.log('🤖 Getting AI analysis of changes...');

  try {
    const scoreChange = changes.scoreChanges?.vantage?.change || 0;
    const utilizationChange = changes.utilizationChange?.change || 0;
    const balanceChanges = changes.accountChanges?.balanceChanges?.length || 0;
    const negativeRemoved = changes.negativeItemChanges?.removed?.length || 0;
    const negativeAdded = changes.negativeItemChanges?.added?.length || 0;

    const prompt = `Analyze these credit report changes and explain what caused them:

SCORE CHANGE: ${scoreChange > 0 ? '+' : ''}${scoreChange} points
UTILIZATION CHANGE: ${utilizationChange > 0 ? '+' : ''}${utilizationChange}%
BALANCE CHANGES: ${balanceChanges} accounts
NEGATIVE ITEMS REMOVED: ${negativeRemoved}
NEGATIVE ITEMS ADDED: ${negativeAdded}

Provide a brief analysis in JSON format:
{
  "summary": "1 sentence overall summary",
  "causes": ["Primary cause 1", "Primary cause 2", "Primary cause 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a credit analyst. Provide concise, accurate analysis. Always output valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 400
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error('❌ AI analysis error:', error);
    
    // Fallback analysis
    return generateFallbackAnalysis(changes);
  }
}

/**
 * Fallback analysis if OpenAI fails
 */
function generateFallbackAnalysis(changes) {
  const scoreChange = changes.scoreChanges?.vantage?.change || 0;
  const causes = [];
  const recommendations = [];

  if (changes.utilizationChange?.change < -10) {
    causes.push('Paid down credit card balances');
  } else if (changes.utilizationChange?.change > 10) {
    causes.push('Credit card balances increased');
  }

  if (changes.negativeItemChanges?.removed?.length > 0) {
    causes.push('Negative items removed from report');
  }

  if (changes.negativeItemChanges?.added?.length > 0) {
    causes.push('New negative items added');
  }

  if (changes.accountChanges?.newAccounts?.length > 0) {
    causes.push('New accounts opened');
  }

  if (causes.length === 0) {
    causes.push('Natural credit activity and aging');
  }

  // Generate recommendations
  if (changes.utilizationChange?.current > 50) {
    recommendations.push('Pay down credit card balances to below 30%');
  }

  if (changes.negativeItemChanges?.added?.length > 0) {
    recommendations.push('Dispute inaccurate negative items immediately');
  }

  if (scoreChange > 0) {
    recommendations.push('Maintain current positive habits');
  } else {
    recommendations.push('Focus on payment history and utilization');
  }

  return {
    summary: scoreChange > 0 
      ? `Score increased by ${scoreChange} points due to positive changes`
      : scoreChange < 0 
      ? `Score decreased by ${Math.abs(scoreChange)} points, needs attention`
      : 'Score remained stable this month',
    causes,
    recommendations
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate time period between reports
 */
function calculateTimePeriod(previousDate, currentDate) {
  const prev = new Date(previousDate);
  const curr = new Date(currentDate);
  const diffTime = Math.abs(curr - prev);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    days: diffDays,
    months: Math.round(diffDays / 30),
    readable: diffDays < 35 ? '1 month' : `${Math.round(diffDays / 30)} months`
  };
}

/**
 * Calculate overall impact
 */
function calculateOverallImpact(scoreChanges, accountChanges, utilizationChange) {
  let score = 0;

  // Score change impact
  const scoreChange = scoreChanges?.vantage?.change || 0;
  if (scoreChange > 30) score += 10;
  else if (scoreChange > 15) score += 7;
  else if (scoreChange > 5) score += 5;
  else if (scoreChange < -30) score -= 10;
  else if (scoreChange < -15) score -= 7;
  else if (scoreChange < -5) score -= 5;

  // Utilization impact
  const utilChange = utilizationChange?.change || 0;
  if (utilChange < -10) score += 5;
  else if (utilChange < -5) score += 3;
  else if (utilChange > 10) score -= 5;
  else if (utilChange > 5) score -= 3;

  // Account changes impact
  const newAccounts = accountChanges?.newAccounts?.length || 0;
  const closedAccounts = accountChanges?.closedAccounts?.length || 0;
  
  if (newAccounts > 2) score -= 3;
  if (closedAccounts > 2) score -= 2;

  // Determine overall impact
  if (score >= 8) return 'very positive';
  if (score >= 5) return 'positive';
  if (score >= 2) return 'slightly positive';
  if (score <= -8) return 'very negative';
  if (score <= -5) return 'negative';
  if (score <= -2) return 'slightly negative';
  return 'neutral';
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  compareReports,
  compareScores,
  compareAccounts,
  compareUtilization,
  compareNegativeItems
};