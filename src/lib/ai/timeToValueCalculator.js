/**
 * AI TIME-TO-VALUE CALCULATOR SYSTEM
 *
 * Purpose:
 * Calculate and track the financial value clients receive from credit repair
 * services, including ROI, break-even analysis, and lifetime financial impact.
 *
 * What It Calculates:
 * - Time to Break-Even: When investment is recouped
 * - Total ROI: Return on investment (%)
 * - Monthly Value: Ongoing benefit each month
 * - Lifetime Value to Client: Total financial impact
 * - Interest Savings: Lower rates from higher score
 * - Insurance Savings: Better rates with good credit
 * - Job/Housing Opportunities: Unlocked by better credit
 * - Loan Approval Probability: Increased access to credit
 *
 * Value Sources:
 * 1. **Lower Interest Rates**: Mortgages, auto loans, credit cards
 * 2. **Insurance Discounts**: Auto, home, life insurance
 * 3. **Loan Approvals**: Access to financing previously denied
 * 4. **Better Terms**: Higher credit limits, lower fees
 * 5. **Employment**: Jobs requiring credit checks
 * 6. **Housing**: Rental approvals, security deposits
 * 7. **Utility Deposits**: Reduced or eliminated
 * 8. **Peace of Mind**: Reduced financial stress (qualitative)
 *
 * Why It's Important:
 * - Prove value to clients (justify price)
 * - Marketing material (show real ROI)
 * - Increase retention (clients see value)
 * - Upselling (show ROI of higher tiers)
 * - Testimonials (concrete numbers)
 * - Competitive advantage (most don't track this)
 *
 * Example Calculations:
 * - "Sarah invested $594 (6mo × $99). Credit score: 620 → 710 (+90 points)."
 * - "Refinanced auto loan: 12% → 6% APR. Saves $127/month × 48 months = $6,096 lifetime."
 * - "ROI: 926% ($6,096 value ÷ $594 cost). Break-even: Month 5. Net benefit: $5,502."
 * - "Additional: Approved for $15K credit card (previously denied). Lower insurance: $35/mo savings."
 *
 * Time Horizons:
 * - Immediate (0-3 months): Quick wins, small savings
 * - Short-term (3-12 months): Major loans, significant savings
 * - Long-term (1-10 years): Compounding interest savings
 * - Lifetime (10+ years): Total financial impact
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System - Tier 3
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// ROI CALCULATION - MAIN FUNCTION
// ============================================================================

/**
 * Calculate comprehensive time-to-value and ROI for a client
 * @param {string} contactId - Contact ID
 * @param {Object} options - Calculation options
 * @returns {Object} Complete ROI analysis
 */
export async function calculateTimeToValue(contactId, options = {}) {
  try {
    const contact = await getContact(contactId);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const monthsActive = getDaysSince(contact.createdAt) / 30;
    const scoreImprovement = (contact.creditScore || contact.initialCreditScore || 600) - (contact.initialCreditScore || 600);

    // Calculate costs
    const totalInvestment = calculateTotalInvestment(contact, monthsActive);

    // Calculate value received
    const value = {
      interestSavings: await calculateInterestSavings(contact, scoreImprovement),
      insuranceSavings: calculateInsuranceSavings(scoreImprovement),
      approvalValue: calculateApprovalValue(contact, scoreImprovement),
      opportunityCost: calculateOpportunityCost(contact, scoreImprovement),
      totalValue: 0
    };

    value.totalValue = value.interestSavings.lifetime +
                       value.insuranceSavings.lifetime +
                       value.approvalValue.total +
                       value.opportunityCost.total;

    // Calculate ROI metrics
    const roi = {
      totalInvestment,
      totalValue: value.totalValue,
      netBenefit: value.totalValue - totalInvestment,
      roiPercentage: totalInvestment > 0 ? Math.round(((value.totalValue - totalInvestment) / totalInvestment) * 100) : 0,
      breakEvenMonth: calculateBreakEvenMonth(totalInvestment, value),
      paybackPeriod: null
    };

    // Calculate when they recoup their investment
    if (roi.breakEvenMonth !== null) {
      roi.paybackPeriod = `${roi.breakEvenMonth} months`;
    }

    // Generate insights
    const insights = generateROIInsights(contact, scoreImprovement, roi, value);

    return {
      contactId,
      contact: {
        name: `${contact.firstName} ${contact.lastName}`,
        serviceTier: contact.serviceTier,
        monthsActive: Math.round(monthsActive * 10) / 10,
        scoreImprovement
      },
      investment: {
        monthlyRate: getTierPricing(contact.serviceTier),
        totalPaid: totalInvestment,
        monthsInProgram: Math.round(monthsActive)
      },
      value,
      roi,
      insights,
      calculatedAt: new Date()
    };

  } catch (error) {
    console.error('[calculateTimeToValue] Error:', error);
    return { error: error.message };
  }
}

// ============================================================================
// INVESTMENT CALCULATION
// ============================================================================

function calculateTotalInvestment(contact, monthsActive) {
  const monthlyRate = getTierPricing(contact.serviceTier);

  // DIY tier: Prepaid, so full months count
  if (contact.serviceTier === 'diy') {
    return Math.ceil(monthsActive) * monthlyRate;
  }

  // Other tiers: First month free (CROA compliance), then monthly
  const paidMonths = Math.max(0, Math.ceil(monthsActive) - 1);
  return paidMonths * monthlyRate;
}

function getTierPricing(tier) {
  const pricing = {
    diy: 49,
    standard: 99,
    acceleration: 149,
    premium: 199,
    vip: 299
  };

  return pricing[tier] || 99;
}

// ============================================================================
// INTEREST SAVINGS CALCULATION
// ============================================================================

async function calculateInterestSavings(contact, scoreImprovement) {
  const savings = {
    monthly: 0,
    annual: 0,
    fiveYear: 0,
    lifetime: 0,
    breakdown: []
  };

  // Mortgage savings (if applicable)
  if (contact.hasMortgage || contact.planningMortgage) {
    const mortgageSavings = calculateMortgageSavings(contact, scoreImprovement);
    savings.breakdown.push(mortgageSavings);
    savings.monthly += mortgageSavings.monthlySavings;
  }

  // Auto loan savings
  if (contact.hasAutoLoan || contact.planningAutoLoan) {
    const autoSavings = calculateAutoLoanSavings(contact, scoreImprovement);
    savings.breakdown.push(autoSavings);
    savings.monthly += autoSavings.monthlySavings;
  }

  // Credit card savings
  const ccSavings = calculateCreditCardSavings(contact, scoreImprovement);
  if (ccSavings.monthlySavings > 0) {
    savings.breakdown.push(ccSavings);
    savings.monthly += ccSavings.monthlySavings;
  }

  // Personal loan savings
  if (contact.hasPersonalLoan) {
    const personalSavings = calculatePersonalLoanSavings(contact, scoreImprovement);
    savings.breakdown.push(personalSavings);
    savings.monthly += personalSavings.monthlySavings;
  }

  // Calculate totals
  savings.annual = savings.monthly * 12;
  savings.fiveYear = savings.annual * 5;
  savings.lifetime = savings.annual * 20; // Assume 20-year benefit

  return savings;
}

function calculateMortgageSavings(contact, scoreImprovement) {
  const loanAmount = contact.mortgageAmount || 300000; // Default $300K
  const loanTerm = 30; // 30-year mortgage

  // Interest rate improvement based on credit score
  const rateImprovement = estimateRateImprovement(scoreImprovement);

  const oldRate = contact.currentMortgageRate || 0.07; // 7% before
  const newRate = Math.max(0.03, oldRate - rateImprovement);

  // Calculate monthly payment difference
  const oldPayment = calculateMonthlyPayment(loanAmount, oldRate, loanTerm * 12);
  const newPayment = calculateMonthlyPayment(loanAmount, newRate, loanTerm * 12);

  const monthlySavings = oldPayment - newPayment;
  const lifetimeSavings = monthlySavings * loanTerm * 12;

  return {
    type: 'Mortgage',
    loanAmount,
    oldRate: Math.round(oldRate * 10000) / 100, // Convert to %
    newRate: Math.round(newRate * 10000) / 100,
    monthlySavings: Math.max(0, Math.round(monthlySavings)),
    lifetimeSavings: Math.max(0, Math.round(lifetimeSavings)),
    term: `${loanTerm} years`
  };
}

function calculateAutoLoanSavings(contact, scoreImprovement) {
  const loanAmount = contact.autoLoanAmount || 35000; // Default $35K
  const loanTerm = 5; // 5-year auto loan

  const rateImprovement = estimateRateImprovement(scoreImprovement);
  const oldRate = contact.currentAutoRate || 0.12; // 12% before
  const newRate = Math.max(0.03, oldRate - rateImprovement);

  const oldPayment = calculateMonthlyPayment(loanAmount, oldRate, loanTerm * 12);
  const newPayment = calculateMonthlyPayment(loanAmount, newRate, loanTerm * 12);

  const monthlySavings = oldPayment - newPayment;
  const lifetimeSavings = monthlySavings * loanTerm * 12;

  return {
    type: 'Auto Loan',
    loanAmount,
    oldRate: Math.round(oldRate * 10000) / 100,
    newRate: Math.round(newRate * 10000) / 100,
    monthlySavings: Math.max(0, Math.round(monthlySavings)),
    lifetimeSavings: Math.max(0, Math.round(lifetimeSavings)),
    term: `${loanTerm} years`
  };
}

function calculateCreditCardSavings(contact, scoreImprovement) {
  const balance = contact.creditCardBalance || 5000; // Default $5K balance
  const oldAPR = contact.currentCreditCardAPR || 0.24; // 24% APR
  const rateImprovement = estimateRateImprovement(scoreImprovement) * 0.8; // Cards less flexible
  const newAPR = Math.max(0.12, oldAPR - rateImprovement);

  const oldMonthlyInterest = (balance * oldAPR) / 12;
  const newMonthlyInterest = (balance * newAPR) / 12;

  const monthlySavings = oldMonthlyInterest - newMonthlyInterest;

  return {
    type: 'Credit Cards',
    balance,
    oldRate: Math.round(oldAPR * 10000) / 100,
    newRate: Math.round(newAPR * 10000) / 100,
    monthlySavings: Math.max(0, Math.round(monthlySavings)),
    lifetimeSavings: Math.max(0, Math.round(monthlySavings * 12 * 10)), // 10 years
    term: 'ongoing'
  };
}

function calculatePersonalLoanSavings(contact, scoreImprovement) {
  const loanAmount = contact.personalLoanAmount || 10000;
  const loanTerm = 3; // 3-year personal loan

  const rateImprovement = estimateRateImprovement(scoreImprovement);
  const oldRate = 0.18; // 18% typical for bad credit
  const newRate = Math.max(0.06, oldRate - rateImprovement);

  const oldPayment = calculateMonthlyPayment(loanAmount, oldRate, loanTerm * 12);
  const newPayment = calculateMonthlyPayment(loanAmount, newRate, loanTerm * 12);

  const monthlySavings = oldPayment - newPayment;

  return {
    type: 'Personal Loan',
    loanAmount,
    oldRate: Math.round(oldRate * 10000) / 100,
    newRate: Math.round(newRate * 10000) / 100,
    monthlySavings: Math.max(0, Math.round(monthlySavings)),
    lifetimeSavings: Math.max(0, Math.round(monthlySavings * loanTerm * 12)),
    term: `${loanTerm} years`
  };
}

function calculateMonthlyPayment(principal, annualRate, months) {
  if (annualRate === 0) return principal / months;

  const monthlyRate = annualRate / 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
         (Math.pow(1 + monthlyRate, months) - 1);
}

function estimateRateImprovement(scoreImprovement) {
  // Rough estimate: each 50 points = ~1% rate improvement
  // Actual varies by lender and loan type
  if (scoreImprovement >= 100) return 0.02; // 2% improvement
  if (scoreImprovement >= 75) return 0.015; // 1.5%
  if (scoreImprovement >= 50) return 0.01; // 1%
  if (scoreImprovement >= 30) return 0.005; // 0.5%
  return 0.002; // 0.2%
}

// ============================================================================
// INSURANCE SAVINGS CALCULATION
// ============================================================================

function calculateInsuranceSavings(scoreImprovement) {
  const savings = {
    monthly: 0,
    annual: 0,
    lifetime: 0,
    breakdown: []
  };

  if (scoreImprovement < 30) {
    return savings; // Minimal insurance impact below 30 points
  }

  // Auto insurance (credit-based pricing in most states)
  const autoSavings = Math.round(scoreImprovement * 0.8); // $0.80/point/month
  savings.breakdown.push({
    type: 'Auto Insurance',
    monthlySavings: autoSavings,
    annualSavings: autoSavings * 12
  });
  savings.monthly += autoSavings;

  // Homeowners/Renters insurance
  if (scoreImprovement > 50) {
    const homeSavings = 25; // ~$25/month for significant improvement
    savings.breakdown.push({
      type: 'Home/Renters Insurance',
      monthlySavings: homeSavings,
      annualSavings: homeSavings * 12
    });
    savings.monthly += homeSavings;
  }

  savings.annual = savings.monthly * 12;
  savings.lifetime = savings.annual * 20; // 20-year savings

  return savings;
}

// ============================================================================
// APPROVAL VALUE CALCULATION
// ============================================================================

function calculateApprovalValue(contact, scoreImprovement) {
  const value = {
    total: 0,
    opportunities: []
  };

  const initialScore = contact.initialCreditScore || 600;
  const currentScore = initialScore + scoreImprovement;

  // Credit card approvals (640+ score)
  if (currentScore >= 640 && initialScore < 640) {
    value.opportunities.push({
      type: 'Credit Card Approval',
      value: 500, // One-time value of having credit access
      description: 'Access to credit cards previously denied'
    });
    value.total += 500;
  }

  // Rental approval / reduced deposit
  if (currentScore >= 650 && initialScore < 650) {
    value.opportunities.push({
      type: 'Rental Approval',
      value: 1000, // Typical security deposit saved
      description: 'Avoid denied rental applications, reduced deposits'
    });
    value.total += 1000;
  }

  // Mortgage approval (620+ score)
  if (currentScore >= 620 && initialScore < 620) {
    value.opportunities.push({
      type: 'Mortgage Access',
      value: 5000, // FHA mortgage access
      description: 'Qualify for FHA mortgage (620+ required)'
    });
    value.total += 5000;
  }

  // Employment opportunities (some jobs check credit)
  if (currentScore >= 680 && initialScore < 680) {
    value.opportunities.push({
      type: 'Employment Opportunities',
      value: 2000, // Value of passing employment credit check
      description: 'Pass credit checks for jobs in financial sector'
    });
    value.total += 2000;
  }

  // Utility deposits waived
  if (currentScore >= 670 && initialScore < 670) {
    value.opportunities.push({
      type: 'Utility Deposits Waived',
      value: 300,
      description: 'Avoid utility deposits for electric, gas, water'
    });
    value.total += 300;
  }

  return value;
}

// ============================================================================
// OPPORTUNITY COST CALCULATION
// ============================================================================

function calculateOpportunityCost(contact, scoreImprovement) {
  // What they lost by having bad credit (now recovered)
  const monthsWithBadCredit = Math.max(0, getDaysSince(contact.createdAt) / 30);

  const total = monthsWithBadCredit * 50; // $50/month opportunity cost

  return {
    total: Math.round(total),
    description: 'Financial stress and lost opportunities from bad credit',
    monthlyImpact: 50
  };
}

// ============================================================================
// BREAK-EVEN CALCULATION
// ============================================================================

function calculateBreakEvenMonth(totalInvestment, value) {
  const monthlySavings = value.interestSavings.monthly + value.insuranceSavings.monthly;

  if (monthlySavings <= 0) {
    return null; // No break-even if no monthly savings
  }

  // Calculate how many months to recoup investment
  const months = Math.ceil(totalInvestment / monthlySavings);

  return months;
}

// ============================================================================
// INSIGHTS GENERATION
// ============================================================================

function generateROIInsights(contact, scoreImprovement, roi, value) {
  const insights = [];

  // ROI insights
  if (roi.roiPercentage > 500) {
    insights.push({
      type: 'excellent_roi',
      icon: '🎯',
      message: `Exceptional ${roi.roiPercentage}% ROI - investment paid off ${Math.round(roi.roiPercentage / 100)}x`,
      importance: 'high'
    });
  } else if (roi.roiPercentage > 200) {
    insights.push({
      type: 'good_roi',
      icon: '✅',
      message: `Strong ${roi.roiPercentage}% ROI - great return on investment`,
      importance: 'medium'
    });
  } else if (roi.roiPercentage < 0) {
    insights.push({
      type: 'negative_roi',
      icon: '⚠️',
      message: 'Investment not yet recouped - early in program',
      importance: 'medium'
    });
  }

  // Break-even insights
  if (roi.breakEvenMonth !== null) {
    if (roi.breakEvenMonth <= 6) {
      insights.push({
        type: 'fast_breakeven',
        icon: '⚡',
        message: `Fast break-even! Investment recouped in just ${roi.breakEvenMonth} months`,
        importance: 'high'
      });
    } else if (roi.breakEvenMonth <= 12) {
      insights.push({
        type: 'good_breakeven',
        icon: '📈',
        message: `Break-even in ${roi.breakEvenMonth} months - on track`,
        importance: 'medium'
      });
    }
  }

  // Value source insights
  const topValueSource = value.interestSavings.breakdown
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  if (topValueSource && topValueSource.monthlySavings > 50) {
    insights.push({
      type: 'primary_value',
      icon: '💰',
      message: `Primary value: ${topValueSource.type} saving $${topValueSource.monthlySavings}/month`,
      importance: 'high'
    });
  }

  // Score improvement insights
  if (scoreImprovement > 75) {
    insights.push({
      type: 'major_improvement',
      icon: '🚀',
      message: `Major ${scoreImprovement}-point improvement unlocks significant savings`,
      importance: 'high'
    });
  }

  // Approval value insights
  if (value.approvalValue.total > 1000) {
    insights.push({
      type: 'new_opportunities',
      icon: '🔓',
      message: `Unlocked ${value.approvalValue.opportunities.length} new financial opportunities`,
      importance: 'medium'
    });
  }

  return insights;
}

// ============================================================================
// REPORTING
// ============================================================================

/**
 * Generate ROI report for client communication
 * @param {string} contactId - Contact ID
 * @returns {Object} Formatted ROI report
 */
export async function generateROIReport(contactId) {
  const analysis = await calculateTimeToValue(contactId);

  if (analysis.error) {
    return analysis;
  }

  return {
    summary: {
      headline: `${analysis.roi.roiPercentage}% Return on Investment`,
      subheadline: `$${analysis.roi.netBenefit.toLocaleString()} net benefit`,
      scoreImprovement: `+${analysis.contact.scoreImprovement} points`
    },
    investment: {
      total: `$${analysis.investment.totalPaid}`,
      period: `${analysis.investment.monthsInProgram} months`,
      tier: analysis.contact.serviceTier
    },
    value: {
      total: `$${Math.round(analysis.value.totalValue).toLocaleString()}`,
      monthly: `$${Math.round(analysis.value.interestSavings.monthly + analysis.value.insuranceSavings.monthly)}/month`,
      breakdown: [
        ...analysis.value.interestSavings.breakdown,
        ...analysis.value.insuranceSavings.breakdown,
        ...analysis.value.approvalValue.opportunities
      ]
    },
    timeline: {
      breakEven: analysis.roi.paybackPeriod || 'Not yet reached',
      lifetimeValue: `$${Math.round(analysis.value.totalValue).toLocaleString()} over 20 years`
    },
    insights: analysis.insights
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getContact(contactId) {
  const contactDoc = await getDoc(doc(db, 'contacts', contactId));
  return contactDoc.exists() ? { id: contactDoc.id, ...contactDoc.data() } : null;
}

function getDaysSince(timestamp) {
  if (!timestamp) return 0;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export default {
  calculateTimeToValue,
  generateROIReport
};
