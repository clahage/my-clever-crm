// Path: /src/services/bureauVarianceDetector.js
// ═══════════════════════════════════════════════════════════════════════════════
// BUREAU VARIANCE DETECTOR - Identifies Dispute Opportunities from Discrepancies
// ═══════════════════════════════════════════════════════════════════════════════
// 
// STRATEGY: If the same account shows different information across bureaus,
// at least one bureau has inaccurate data = valid FCRA dispute grounds.
//
// Example: Account #12345 shows:
//   - TransUnion: Balance $500, Status "Current"
//   - Experian: Balance $750, Status "30 Days Late"  ← VARIANCE DETECTED
//   - Equifax: Balance $500, Status "Current"
//   → Experian has wrong data = DISPUTE OPPORTUNITY
//
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION: Fields to compare and their dispute priority
// ═══════════════════════════════════════════════════════════════════════════════

const VARIANCE_FIELDS = {
  // High Priority - Major impact on credit score and disputes
  paymentStatus: {
    priority: 'high',
    displayName: 'Payment Status',
    disputeReason: 'Payment status is reported inconsistently across bureaus. At least one bureau has incorrect payment history.',
    scoreImpact: 'HIGH - Payment history is 35% of credit score',
  },
  accountStatus: {
    priority: 'high',
    displayName: 'Account Status',
    disputeReason: 'Account status differs between bureaus. Request verification of accurate current status.',
    scoreImpact: 'HIGH - Affects account standing calculations',
  },
  balance: {
    priority: 'medium',
    displayName: 'Balance',
    disputeReason: 'Balance reported differs across bureaus. Request validation of accurate current balance.',
    scoreImpact: 'MEDIUM - Affects utilization calculations',
    tolerancePercent: 5, // Allow 5% variance for timing differences
  },
  creditLimit: {
    priority: 'medium',
    displayName: 'Credit Limit',
    disputeReason: 'Credit limit differs across bureaus. Incorrect limit affects utilization ratio.',
    scoreImpact: 'MEDIUM - Directly impacts utilization percentage',
    tolerancePercent: 0, // Limit should be exact
  },
  highCredit: {
    priority: 'medium',
    displayName: 'High Credit/Original Amount',
    disputeReason: 'High credit amount varies between bureaus.',
    scoreImpact: 'MEDIUM - Used in debt calculations',
    tolerancePercent: 0,
  },
  // Lower Priority - Still valid disputes but less score impact
  dateOpened: {
    priority: 'low',
    displayName: 'Date Opened',
    disputeReason: 'Account open date is inconsistent across bureaus.',
    scoreImpact: 'LOW - Affects account age calculations',
    toleranceDays: 30, // Allow 30 day variance
  },
  accountType: {
    priority: 'low',
    displayName: 'Account Type',
    disputeReason: 'Account type classification differs between bureaus.',
    scoreImpact: 'LOW - May affect credit mix category',
  },
  pastDueAmount: {
    priority: 'high',
    displayName: 'Past Due Amount',
    disputeReason: 'Past due amount reported inconsistently. At least one bureau has incorrect delinquency data.',
    scoreImpact: 'HIGH - Past due accounts severely impact score',
  },
};

const BUREAU_CODES = {
  // Standard codes
  transunion: 'TUC',
  experian: 'EXP',
  equifax: 'EQF',
  // Alternate codes that might appear
  tu: 'TUC',
  exp: 'EXP',
  eqf: 'EQF',
  TUC: 'TUC',
  EXP: 'EXP',
  EQF: 'EQF',
  TransUnion: 'TUC',
  Experian: 'EXP',
  Equifax: 'EQF',
};

const BUREAU_NAMES = {
  TUC: 'TransUnion',
  EXP: 'Experian',
  EQF: 'Equifax',
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION: Detect variances in a tradeline
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyzes a single tradeline for bureau variances
 * @param {Object} tradeline - The tradeline object with bureauDetails
 * @returns {Array} Array of variance objects
 */
export function detectTradelineVariances(tradeline) {
  const variances = [];
  const bureauDetails = tradeline.bureauDetails || {};
  
  // Normalize bureau keys
  const normalizedDetails = {};
  Object.keys(bureauDetails).forEach(key => {
    const normalizedKey = BUREAU_CODES[key] || key.toUpperCase().substring(0, 3);
    if (bureauDetails[key]) {
      normalizedDetails[normalizedKey] = bureauDetails[key];
    }
  });
  
  const bureaus = Object.keys(normalizedDetails);
  
  // Need at least 2 bureaus to compare
  if (bureaus.length < 2) {
    return variances;
  }
  
  // Check each field for variances
  Object.keys(VARIANCE_FIELDS).forEach(field => {
    const config = VARIANCE_FIELDS[field];
    const values = {};
    
    // Collect values from each bureau
    bureaus.forEach(bureau => {
      let value = normalizedDetails[bureau]?.[field];
      
      // Also check tradeline root for the field
      if (value === undefined || value === null) {
        value = tradeline[field];
      }
      
      if (value !== undefined && value !== null && value !== '') {
        values[bureau] = value;
      }
    });
    
    // Need at least 2 values to compare
    if (Object.keys(values).length < 2) {
      return;
    }
    
    // Check for variance based on field type
    const hasVariance = checkForVariance(values, config);
    
    if (hasVariance) {
      variances.push({
        field,
        fieldDisplayName: config.displayName,
        bureauValues: values,
        priority: config.priority,
        disputeReason: config.disputeReason,
        scoreImpact: config.scoreImpact,
        accountNumber: tradeline.accountNumber,
        creditorName: tradeline.creditorName || tradeline.accountName || 'Unknown',
        accountType: tradeline.accountType || 'Unknown',
        // Determine which bureau(s) likely have the error
        likelyIncorrect: identifyLikelyIncorrect(values),
        // Generate suggested dispute text
        suggestedDisputeText: generateDisputeText(field, values, tradeline, config),
      });
    }
  });
  
  return variances;
}

/**
 * Check if values have a meaningful variance
 */
function checkForVariance(values, config) {
  const valueList = Object.values(values);
  
  // For numeric fields with tolerance
  if (config.tolerancePercent !== undefined) {
    const numericValues = valueList.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (numericValues.length >= 2) {
      const max = Math.max(...numericValues);
      const min = Math.min(...numericValues);
      const avgValue = (max + min) / 2;
      const percentDiff = avgValue > 0 ? ((max - min) / avgValue) * 100 : 0;
      return percentDiff > config.tolerancePercent;
    }
  }
  
  // For date fields with tolerance
  if (config.toleranceDays !== undefined) {
    const dates = valueList.map(v => new Date(v)).filter(d => !isNaN(d.getTime()));
    if (dates.length >= 2) {
      const maxDate = Math.max(...dates);
      const minDate = Math.min(...dates);
      const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
      return daysDiff > config.toleranceDays;
    }
  }
  
  // For string fields - direct comparison (case-insensitive)
  const normalizedValues = valueList.map(v => String(v).toLowerCase().trim());
  const uniqueValues = [...new Set(normalizedValues)];
  
  return uniqueValues.length > 1;
}

/**
 * Identify which bureau likely has incorrect data
 * Uses "majority rules" - if 2 bureaus agree, the 3rd is likely wrong
 */
function identifyLikelyIncorrect(values) {
  const bureaus = Object.keys(values);
  const valueMap = {};
  
  // Group bureaus by value
  bureaus.forEach(bureau => {
    const normalizedValue = String(values[bureau]).toLowerCase().trim();
    if (!valueMap[normalizedValue]) {
      valueMap[normalizedValue] = [];
    }
    valueMap[normalizedValue].push(bureau);
  });
  
  // Find the minority value(s)
  const groups = Object.entries(valueMap).sort((a, b) => a[1].length - b[1].length);
  
  if (groups.length >= 2 && groups[0][1].length < groups[1][1].length) {
    // Minority bureau(s) are likely incorrect
    return groups[0][1].map(b => ({
      bureau: b,
      bureauName: BUREAU_NAMES[b] || b,
      reportedValue: values[b],
      majorityValue: groups[1][0],
    }));
  }
  
  // All different or split - can't determine
  return bureaus.map(b => ({
    bureau: b,
    bureauName: BUREAU_NAMES[b] || b,
    reportedValue: values[b],
    majorityValue: null,
  }));
}

/**
 * Generate suggested dispute text for the variance
 */
function generateDisputeText(field, values, tradeline, config) {
  const bureauList = Object.entries(values)
    .map(([bureau, value]) => `${BUREAU_NAMES[bureau] || bureau}: ${value}`)
    .join(', ');
  
  return `The ${config.displayName.toLowerCase()} for account ${tradeline.accountNumber || 'ending in ****'} ` +
    `with ${tradeline.creditorName || 'this creditor'} is being reported inconsistently across credit bureaus. ` +
    `Specifically: ${bureauList}. ` +
    `Under the Fair Credit Reporting Act (FCRA), credit bureaus must report accurate information. ` +
    `I am disputing this inaccuracy and request that you investigate and correct the ${config.displayName.toLowerCase()} ` +
    `to reflect accurate information, or remove this tradeline if accuracy cannot be verified.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYZE FULL CREDIT REPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze all tradelines in a credit report for variances
 * @param {Array} tradelines - Array of tradeline objects
 * @returns {Object} Analysis results with variances grouped by priority
 */
export function analyzeReportVariances(tradelines) {
  const allVariances = [];
  
  for (const tradeline of tradelines) {
    const tradelineVariances = detectTradelineVariances(tradeline);
    allVariances.push(...tradelineVariances);
  }
  
  // Group by priority
  const byPriority = {
    high: allVariances.filter(v => v.priority === 'high'),
    medium: allVariances.filter(v => v.priority === 'medium'),
    low: allVariances.filter(v => v.priority === 'low'),
  };
  
  // Group by account
  const byAccount = {};
  allVariances.forEach(v => {
    const key = v.accountNumber || v.creditorName;
    if (!byAccount[key]) {
      byAccount[key] = {
        creditorName: v.creditorName,
        accountNumber: v.accountNumber,
        variances: [],
      };
    }
    byAccount[key].variances.push(v);
  });
  
  return {
    total: allVariances.length,
    byPriority,
    byAccount,
    allVariances,
    summary: {
      highPriority: byPriority.high.length,
      mediumPriority: byPriority.medium.length,
      lowPriority: byPriority.low.length,
      accountsAffected: Object.keys(byAccount).length,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIZATION CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate revolving utilization from tradelines
 * Uses Speedy Credit Repair's accurate utilization tiers
 */
export function calculateRevolvingUtilization(tradelines) {
  // Filter to revolving accounts only
  const revolvingAccounts = tradelines.filter(t => {
    const type = (t.accountType || t.type || '').toLowerCase();
    return type.includes('revolving') || 
           type.includes('credit card') || 
           type.includes('line of credit') ||
           type.includes('charge');
  });
  
  // Calculate per-account utilization
  const accounts = revolvingAccounts.map(account => {
    const balance = parseFloat(account.balance || account.currentBalance || 0);
    const limit = parseFloat(account.creditLimit || account.highCredit || 0);
    const utilization = limit > 0 ? (balance / limit) * 100 : 0;
    
    return {
      creditorName: account.creditorName || account.accountName || 'Unknown',
      accountNumber: account.accountNumber || '****',
      balance,
      limit,
      utilization,
      tier: getUtilizationTier(utilization),
      bureaus: account.bureaus || [],
      status: account.accountStatus || account.status || 'Unknown',
    };
  });
  
  // Calculate totals
  const totalLimit = accounts.reduce((sum, a) => sum + (a.limit || 0), 0);
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const overallUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
  
  return {
    accounts,
    totalLimit,
    totalBalance,
    availableCredit: totalLimit - totalBalance,
    overallUtilization,
    overallTier: getUtilizationTier(overallUtilization),
    accountCount: accounts.length,
    // Recommendations
    recommendations: generateUtilizationRecommendations(accounts, overallUtilization),
  };
}

/**
 * Get utilization tier based on SCR's accurate research
 * The "30% myth" debunked - optimal is <1%, practical max is 19%
 */
export function getUtilizationTier(percentage) {
  if (percentage === 0) {
    return {
      level: 'zero',
      label: 'Zero/Inactive',
      color: '#ff9800',
      status: 'warning',
      recommendation: 'Make a small purchase and pay it off to show activity. 0% can appear as inactive.',
    };
  }
  if (percentage > 0 && percentage <= 1) {
    return {
      level: 'optimal',
      label: 'OPTIMAL',
      color: '#2e7d32',
      status: 'success',
      recommendation: 'Perfect! Maximum score benefit. Ideal for major purchases like mortgages.',
    };
  }
  if (percentage <= 9) {
    return {
      level: 'excellent',
      label: 'Excellent',
      color: '#4caf50',
      status: 'success',
      recommendation: 'Excellent! Practical sweet spot for daily credit health.',
    };
  }
  if (percentage <= 19) {
    return {
      level: 'good',
      label: 'Very Good',
      color: '#8bc34a',
      status: 'success',
      recommendation: 'Good utilization. Still strong with minimal score impact.',
    };
  }
  if (percentage <= 29) {
    return {
      level: 'fair',
      label: 'Fair',
      color: '#ff9800',
      status: 'warning',
      recommendation: 'Utilization affecting score. Pay down below 19% for improvement.',
    };
  }
  if (percentage <= 49) {
    return {
      level: 'high',
      label: 'High',
      color: '#f44336',
      status: 'error',
      recommendation: 'HIGH: Despite the 30% myth, this level hurts your score. Prioritize paydown.',
    };
  }
  return {
    level: 'critical',
    label: 'Critical',
    color: '#d32f2f',
    status: 'error',
    recommendation: 'CRITICAL: Near-maxed cards severely damage score. Top priority for paydown.',
  };
}

/**
 * Generate personalized utilization recommendations
 */
function generateUtilizationRecommendations(accounts, overallUtilization) {
  const recommendations = [];
  
  // Overall recommendation
  if (overallUtilization > 19) {
    const targetBalance = accounts.reduce((sum, a) => sum + (a.limit * 0.19), 0);
    const paydownNeeded = accounts.reduce((sum, a) => sum + a.balance, 0) - targetBalance;
    
    recommendations.push({
      type: 'paydown',
      priority: 'high',
      title: 'Reduce Overall Utilization',
      description: `Pay down $${paydownNeeded.toFixed(0)} total to reach 19% utilization.`,
      estimatedScoreImpact: '+20-50 points',
    });
  }
  
  // Per-account recommendations
  const highUtilAccounts = accounts.filter(a => a.utilization > 50);
  highUtilAccounts.forEach(account => {
    const target19 = account.limit * 0.19;
    const paydown = account.balance - target19;
    
    recommendations.push({
      type: 'account_paydown',
      priority: 'high',
      title: `Pay Down ${account.creditorName}`,
      description: `Reduce balance by $${paydown.toFixed(0)} to reach 19%.`,
      accountNumber: account.accountNumber,
      currentUtilization: account.utilization,
      targetUtilization: 19,
    });
  });
  
  // Zero balance accounts
  const zeroAccounts = accounts.filter(a => a.balance === 0 && a.limit > 0);
  if (zeroAccounts.length > 0) {
    recommendations.push({
      type: 'activity',
      priority: 'medium',
      title: 'Add Activity to Dormant Cards',
      description: `${zeroAccounts.length} card(s) show 0% utilization. Make small purchases to show activity.`,
      accounts: zeroAccounts.map(a => a.creditorName),
    });
  }
  
  // Credit limit increase suggestion
  if (overallUtilization > 30) {
    recommendations.push({
      type: 'limit_increase',
      priority: 'medium',
      title: 'Request Credit Limit Increases',
      description: 'Higher limits reduce utilization percentage without paying down balances.',
    });
  }
  
  return recommendations;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  detectTradelineVariances,
  analyzeReportVariances,
  calculateRevolvingUtilization,
  getUtilizationTier,
  VARIANCE_FIELDS,
  BUREAU_NAMES,
  BUREAU_CODES,
};