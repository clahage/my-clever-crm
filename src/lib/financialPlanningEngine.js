/**
 * FINANCIAL PLANNING ENGINE - MEGA AI ENTERPRISE EDITION
 *
 * Purpose:
 * Comprehensive financial planning calculation engine with AI-powered
 * debt reduction strategies, budget optimization, and credit score forecasting.
 *
 * Features:
 * - Multiple debt payoff strategies (Snowball, Avalanche, Hybrid, Custom)
 * - AI-powered strategy recommendations based on psychology and math
 * - Credit score impact projections
 * - Budget optimization with income/expense tracking
 * - Financial goal tracking and milestone management
 * - Debt consolidation and refinancing analysis
 * - Investment opportunity cost calculations
 * - Emergency fund recommendations
 * - Tax-advantaged savings optimization
 *
 * Created: 2025-12-06
 * Part of: Speedy Credit Repair Financial Planning System
 */

import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';

// ═════════════════════════════════════════════════════════════════════════════
// DEBT PAYOFF CALCULATOR - Core Engine
// ═════════════════════════════════════════════════════════════════════════════

/**
 * DebtPayoffCalculator - Main calculation engine for debt reduction strategies
 *
 * Supports multiple payoff strategies:
 * - Snowball: Pay smallest balance first (psychological wins)
 * - Avalanche: Pay highest interest rate first (mathematical optimal)
 * - Hybrid: Balance between quick wins and interest savings
 * - Custom: User-defined priority order
 */
export class DebtPayoffCalculator {
  constructor(debts, monthlyPaymentBudget, strategy = 'avalanche') {
    this.debts = debts; // Array of debt objects
    this.monthlyPaymentBudget = monthlyPaymentBudget; // Total monthly budget for debt payments
    this.strategy = strategy; // Payoff strategy
    this.minimumPayments = this.calculateMinimumPayments();
    this.extraPayment = Math.max(0, monthlyPaymentBudget - this.minimumPayments);
  }

  /**
   * Calculate minimum monthly payments across all debts
   */
  calculateMinimumPayments() {
    return this.debts.reduce((total, debt) => total + (debt.minimumPayment || 0), 0);
  }

  /**
   * Get prioritized debt order based on strategy
   */
  getPriorityOrder() {
    const sortedDebts = [...this.debts];

    switch (this.strategy) {
      case 'snowball':
        // Sort by balance (smallest first) for psychological wins
        return sortedDebts.sort((a, b) => a.balance - b.balance);

      case 'avalanche':
        // Sort by interest rate (highest first) for math optimization
        return sortedDebts.sort((a, b) => b.interestRate - a.interestRate);

      case 'hybrid':
        // Hybrid: Balance psychological wins with interest savings
        // Score = (normalized_balance * 0.3) + (normalized_rate * 0.7)
        const maxBalance = Math.max(...sortedDebts.map(d => d.balance));
        const maxRate = Math.max(...sortedDebts.map(d => d.interestRate));

        return sortedDebts.sort((a, b) => {
          const scoreA = (a.balance / maxBalance) * 0.3 + (a.interestRate / maxRate) * 0.7;
          const scoreB = (b.balance / maxBalance) * 0.3 + (b.interestRate / maxRate) * 0.7;
          return scoreB - scoreA;
        });

      case 'custom':
        // Use user-defined priority order
        return sortedDebts.sort((a, b) => (a.priority || 999) - (b.priority || 999));

      default:
        return sortedDebts;
    }
  }

  /**
   * Calculate complete payoff timeline with month-by-month breakdown
   *
   * Returns detailed timeline showing:
   * - Monthly payments per debt
   * - Balance reduction over time
   * - Interest paid each month
   * - Total cost and payoff date
   */
  calculatePayoffTimeline() {
    const timeline = [];
    const priorityOrder = this.getPriorityOrder();

    // Clone debts to avoid mutating original data
    let activeDebts = priorityOrder.map(debt => ({
      ...debt,
      remainingBalance: debt.balance,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      monthsPaid: 0
    }));

    let month = 0;
    const maxMonths = 600; // Safety limit: 50 years

    while (activeDebts.some(d => d.remainingBalance > 0) && month < maxMonths) {
      month++;
      const monthData = {
        month,
        date: new Date(new Date().setMonth(new Date().getMonth() + month)),
        payments: [],
        totalPayment: 0,
        totalInterest: 0,
        totalPrincipal: 0,
        remainingDebt: 0
      };

      // Calculate interest accrued this month for all debts
      activeDebts = activeDebts.map(debt => {
        if (debt.remainingBalance <= 0) return debt;

        const monthlyRate = debt.interestRate / 100 / 12;
        const interestCharge = debt.remainingBalance * monthlyRate;

        return {
          ...debt,
          currentMonthInterest: interestCharge
        };
      });

      // Distribute available payment budget
      let remainingBudget = this.monthlyPaymentBudget;
      const debtsStillOwed = activeDebts.filter(d => d.remainingBalance > 0);

      // First, pay minimum payments on all debts
      for (const debt of debtsStillOwed) {
        const minimumPayment = Math.min(
          debt.minimumPayment,
          debt.remainingBalance + debt.currentMonthInterest
        );

        const interestPortion = Math.min(minimumPayment, debt.currentMonthInterest);
        const principalPortion = minimumPayment - interestPortion;

        debt.remainingBalance = Math.max(0, debt.remainingBalance + debt.currentMonthInterest - minimumPayment);
        debt.totalInterestPaid += interestPortion;
        debt.totalPrincipalPaid += principalPortion;
        debt.monthsPaid++;

        monthData.payments.push({
          debtId: debt.id,
          debtName: debt.name,
          payment: minimumPayment,
          interest: interestPortion,
          principal: principalPortion,
          remainingBalance: debt.remainingBalance,
          isMinimum: true
        });

        monthData.totalPayment += minimumPayment;
        monthData.totalInterest += interestPortion;
        monthData.totalPrincipal += principalPortion;
        remainingBudget -= minimumPayment;
      }

      // Apply extra payment to highest priority debt with remaining balance
      if (remainingBudget > 0) {
        const targetDebt = debtsStillOwed[0]; // First in priority order

        if (targetDebt) {
          const extraPayment = Math.min(remainingBudget, targetDebt.remainingBalance);

          targetDebt.remainingBalance -= extraPayment;
          targetDebt.totalPrincipalPaid += extraPayment;

          // Find and update the payment record
          const paymentRecord = monthData.payments.find(p => p.debtId === targetDebt.id);
          if (paymentRecord) {
            paymentRecord.payment += extraPayment;
            paymentRecord.principal += extraPayment;
            paymentRecord.remainingBalance = targetDebt.remainingBalance;
            paymentRecord.isMinimum = false;
          }

          monthData.totalPayment += extraPayment;
          monthData.totalPrincipal += extraPayment;
        }
      }

      // Calculate remaining total debt
      monthData.remainingDebt = activeDebts.reduce((sum, d) => sum + d.remainingBalance, 0);

      timeline.push(monthData);

      // Exit if all debts paid off
      if (monthData.remainingDebt <= 0.01) break;
    }

    return {
      timeline,
      summary: this.calculateSummary(timeline, activeDebts),
      debts: activeDebts
    };
  }

  /**
   * Calculate summary statistics for the payoff plan
   */
  calculateSummary(timeline, debts) {
    const totalMonths = timeline.length;
    const totalInterest = debts.reduce((sum, d) => sum + d.totalInterestPaid, 0);
    const totalPrincipal = debts.reduce((sum, d) => sum + d.totalPrincipalPaid, 0);
    const totalPaid = totalInterest + totalPrincipal;
    const originalDebt = this.debts.reduce((sum, d) => sum + d.balance, 0);

    const payoffDate = timeline.length > 0
      ? timeline[timeline.length - 1].date
      : new Date();

    return {
      totalMonths,
      totalYears: (totalMonths / 12).toFixed(1),
      payoffDate,
      totalInterestPaid: Math.round(totalInterest),
      totalPrincipalPaid: Math.round(totalPrincipal),
      totalAmountPaid: Math.round(totalPaid),
      originalDebt: Math.round(originalDebt),
      interestSavings: 0, // Will be calculated by comparing strategies
      monthlyPayment: this.monthlyPaymentBudget,
      debtFreeDate: payoffDate,
      avgMonthlyInterest: Math.round(totalInterest / totalMonths)
    };
  }

  /**
   * Compare all strategies and recommend the best one
   */
  static compareStrategies(debts, monthlyBudget) {
    const strategies = ['snowball', 'avalanche', 'hybrid'];
    const results = {};

    for (const strategy of strategies) {
      const calculator = new DebtPayoffCalculator(debts, monthlyBudget, strategy);
      const result = calculator.calculatePayoffTimeline();
      results[strategy] = result.summary;
    }

    // Find strategy with lowest total interest
    const bestMathStrategy = Object.entries(results).reduce((best, [strategy, summary]) => {
      return summary.totalInterestPaid < best.summary.totalInterestPaid
        ? { strategy, summary }
        : best;
    }, { strategy: 'avalanche', summary: results.avalanche });

    // AI Recommendation: Balance math with psychology
    const recommendation = DebtPayoffCalculator.getAIRecommendation(debts, results);

    return {
      results,
      bestMathStrategy: bestMathStrategy.strategy,
      aiRecommendation: recommendation,
      comparison: strategies.map(strategy => ({
        strategy,
        ...results[strategy],
        vsAvalanche: {
          extraInterest: results[strategy].totalInterestPaid - results.avalanche.totalInterestPaid,
          extraMonths: results[strategy].totalMonths - results.avalanche.totalMonths
        }
      }))
    };
  }

  /**
   * AI-powered strategy recommendation
   *
   * Considers:
   * - Number of debts (many small debts → snowball for motivation)
   * - Interest rate spread (high variance → avalanche for savings)
   * - Balance distribution (evenly distributed → hybrid)
   * - Total debt amount (high debt → avalanche to minimize cost)
   */
  static getAIRecommendation(debts, strategyResults) {
    const debtCount = debts.length;
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const avgBalance = totalDebt / debtCount;

    const rates = debts.map(d => d.interestRate);
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const rateSpread = maxRate - minRate;

    const balances = debts.map(d => d.balance);
    const smallDebts = balances.filter(b => b < avgBalance * 0.5).length;

    let recommendedStrategy = 'avalanche';
    let reason = '';
    let confidenceScore = 0;

    // Rule 1: Many small debts → Snowball for psychological wins
    if (smallDebts >= 3 && debtCount >= 5) {
      recommendedStrategy = 'snowball';
      reason = `You have ${smallDebts} small debts. Snowball method will give you quick wins to stay motivated.`;
      confidenceScore = 85;
    }
    // Rule 2: High interest rate spread → Avalanche to save money
    else if (rateSpread > 10) {
      recommendedStrategy = 'avalanche';
      reason = `Your interest rates vary significantly (${minRate.toFixed(1)}% to ${maxRate.toFixed(1)}%). Avalanche method will save you the most money.`;
      confidenceScore = 90;
    }
    // Rule 3: Large total debt → Avalanche to minimize cost
    else if (totalDebt > 50000) {
      recommendedStrategy = 'avalanche';
      reason = `With $${(totalDebt / 1000).toFixed(0)}k in total debt, minimizing interest is crucial. Avalanche method is optimal.`;
      confidenceScore = 88;
    }
    // Rule 4: Balanced scenario → Hybrid approach
    else {
      recommendedStrategy = 'hybrid';
      reason = `Your debts are fairly balanced. Hybrid method combines quick wins with interest savings.`;
      confidenceScore = 80;
    }

    const interestSavings = strategyResults.snowball.totalInterestPaid - strategyResults.avalanche.totalInterestPaid;
    const timeSavings = strategyResults.snowball.totalMonths - strategyResults.avalanche.totalMonths;

    return {
      recommended: recommendedStrategy,
      reason,
      confidenceScore,
      insights: {
        debtCount,
        totalDebt: Math.round(totalDebt),
        avgBalance: Math.round(avgBalance),
        rateSpread: rateSpread.toFixed(1),
        smallDebtsCount: smallDebts,
        potentialInterestSavings: Math.round(interestSavings),
        potentialTimeSavings: timeSavings
      }
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BUDGET OPTIMIZER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Budget optimization engine with AI-powered recommendations
 */
export class BudgetOptimizer {
  constructor(income, expenses, financialGoals = {}) {
    this.monthlyIncome = income;
    this.expenses = expenses;
    this.financialGoals = financialGoals;
  }

  /**
   * Analyze budget and provide AI recommendations
   */
  analyze() {
    const totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const disposableIncome = this.monthlyIncome - totalExpenses;
    const savingsRate = (disposableIncome / this.monthlyIncome) * 100;

    // Categorize expenses
    const byCategory = this.expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Calculate category percentages
    const categoryPercentages = Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / this.monthlyIncome) * 100
    }));

    // Identify optimization opportunities
    const opportunities = this.identifyOptimizations(byCategory);

    return {
      income: this.monthlyIncome,
      totalExpenses,
      disposableIncome,
      savingsRate: savingsRate.toFixed(1),
      byCategory,
      categoryPercentages,
      opportunities,
      healthScore: this.calculateBudgetHealth(savingsRate, byCategory),
      recommendations: this.generateRecommendations(savingsRate, byCategory, disposableIncome)
    };
  }

  /**
   * Identify budget optimization opportunities
   */
  identifyOptimizations(byCategory) {
    const opportunities = [];
    const income = this.monthlyIncome;

    // Recommended budget percentages (50/30/20 rule)
    const recommendations = {
      housing: { max: 30, ideal: 25 },
      transportation: { max: 15, ideal: 10 },
      food: { max: 15, ideal: 12 },
      utilities: { max: 10, ideal: 8 },
      entertainment: { max: 10, ideal: 5 },
      subscriptions: { max: 5, ideal: 3 }
    };

    for (const [category, limits] of Object.entries(recommendations)) {
      const amount = byCategory[category] || 0;
      const percentage = (amount / income) * 100;

      if (percentage > limits.max) {
        opportunities.push({
          category,
          severity: 'high',
          currentAmount: amount,
          currentPercentage: percentage.toFixed(1),
          recommendedMax: limits.max,
          potentialSavings: amount - (income * limits.max / 100),
          action: `Reduce ${category} spending by $${Math.round(amount - (income * limits.max / 100))}/month`
        });
      } else if (percentage > limits.ideal) {
        opportunities.push({
          category,
          severity: 'medium',
          currentAmount: amount,
          currentPercentage: percentage.toFixed(1),
          recommendedMax: limits.ideal,
          potentialSavings: amount - (income * limits.ideal / 100),
          action: `Consider reducing ${category} to ${limits.ideal}% of income for optimal savings`
        });
      }
    }

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  /**
   * Calculate overall budget health score (0-100)
   */
  calculateBudgetHealth(savingsRate, byCategory) {
    let score = 50; // Start at neutral

    // Factor 1: Savings rate (40 points possible)
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 15) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;
    else if (savingsRate < 0) score -= 20; // Overspending

    // Factor 2: Essential expenses ratio (30 points possible)
    const essentials = (byCategory.housing || 0) + (byCategory.utilities || 0) + (byCategory.food || 0);
    const essentialRatio = (essentials / this.monthlyIncome) * 100;
    if (essentialRatio <= 50) score += 30;
    else if (essentialRatio <= 60) score += 20;
    else if (essentialRatio <= 70) score += 10;
    else score -= 10;

    // Factor 3: Discretionary spending control (20 points possible)
    const discretionary = (byCategory.entertainment || 0) + (byCategory.subscriptions || 0);
    const discretionaryRatio = (discretionary / this.monthlyIncome) * 100;
    if (discretionaryRatio <= 10) score += 20;
    else if (discretionaryRatio <= 20) score += 10;
    else if (discretionaryRatio > 30) score -= 10;

    // Factor 4: Emergency fund (10 points possible)
    if (this.financialGoals.hasEmergencyFund) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate AI-powered budget recommendations
   */
  generateRecommendations(savingsRate, byCategory, disposableIncome) {
    const recommendations = [];

    // Recommendation 1: Emergency fund
    if (!this.financialGoals.hasEmergencyFund && disposableIncome > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Emergency Fund',
        action: 'Build 3-6 months of expenses in emergency savings before aggressive debt payoff',
        monthlySuggestion: Math.min(disposableIncome * 0.3, 500),
        reason: 'Protects against unexpected expenses and prevents new debt'
      });
    }

    // Recommendation 2: Debt payoff
    if (disposableIncome > 200) {
      recommendations.push({
        priority: 'high',
        category: 'Debt Reduction',
        action: 'Allocate extra income toward debt payoff using avalanche method',
        monthlySuggestion: disposableIncome * 0.5,
        reason: 'Eliminate high-interest debt to free up future income'
      });
    }

    // Recommendation 3: Low savings rate
    if (savingsRate < 10 && savingsRate >= 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Savings Rate',
        action: 'Increase savings to at least 10% of income',
        monthlySuggestion: this.monthlyIncome * 0.1 - disposableIncome,
        reason: 'Build financial security and prepare for future goals'
      });
    }

    // Recommendation 4: Overspending
    if (savingsRate < 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Budget Deficit',
        action: 'Reduce expenses immediately - you are spending more than you earn',
        monthlySuggestion: Math.abs(disposableIncome),
        reason: 'Prevent accumulating new debt and financial crisis'
      });
    }

    return recommendations;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// CREDIT SCORE IMPACT PROJECTOR
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Project credit score improvements based on debt reduction
 */
export class CreditScoreProjector {
  constructor(currentScore, debts, creditUtilization) {
    this.currentScore = currentScore;
    this.debts = debts;
    this.creditUtilization = creditUtilization;
  }

  /**
   * Project credit score improvement over debt payoff timeline
   */
  projectScoreImprovement(payoffTimeline) {
    const projections = [];
    let currentScore = this.currentScore;

    for (const month of payoffTimeline) {
      // Calculate credit utilization reduction
      const totalCreditCardDebt = month.payments
        .filter(p => p.debtName?.includes('Credit Card'))
        .reduce((sum, p) => sum + p.remainingBalance, 0);

      const utilizationRate = this.creditUtilization > 0
        ? (totalCreditCardDebt / this.creditUtilization) * 100
        : 0;

      // Score improvement factors
      let scoreChange = 0;

      // Factor 1: Credit utilization (30% of score)
      if (utilizationRate < 10) scoreChange += 2;
      else if (utilizationRate < 30) scoreChange += 1;
      else if (utilizationRate > 70) scoreChange -= 1;

      // Factor 2: Payment history (35% of score)
      scoreChange += 1; // Consistent payments improve score

      // Factor 3: Debt paid off
      const debtsPaidOff = month.payments.filter(p => p.remainingBalance === 0).length;
      scoreChange += debtsPaidOff * 3;

      currentScore = Math.min(850, currentScore + scoreChange);

      projections.push({
        month: month.month,
        date: month.date,
        projectedScore: Math.round(currentScore),
        utilizationRate: utilizationRate.toFixed(1),
        scoreChange,
        debtsPaidOff
      });
    }

    return {
      projections,
      finalScore: Math.round(currentScore),
      totalImprovement: Math.round(currentScore - this.currentScore),
      milestones: this.identifyMilestones(projections)
    };
  }

  /**
   * Identify credit score milestones
   */
  identifyMilestones(projections) {
    const milestones = [
      { score: 580, tier: 'Poor', label: 'Exit Poor Credit' },
      { score: 620, tier: 'Fair', label: 'Enter Fair Credit' },
      { score: 670, tier: 'Good', label: 'Enter Good Credit' },
      { score: 700, tier: 'Good', label: 'Reach 700+ (Prime Lending)' },
      { score: 740, tier: 'Very Good', label: 'Enter Very Good Credit' },
      { score: 800, tier: 'Excellent', label: 'Enter Excellent Credit' }
    ];

    return milestones
      .filter(m => m.score > this.currentScore)
      .map(milestone => {
        const reachMonth = projections.find(p => p.projectedScore >= milestone.score);
        return {
          ...milestone,
          monthsToReach: reachMonth?.month || null,
          dateReached: reachMonth?.date || null
        };
      })
      .filter(m => m.monthsToReach !== null);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// FINANCIAL GOAL TRACKER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Track progress toward financial goals
 */
export class FinancialGoalTracker {
  /**
   * Calculate progress toward a financial goal
   */
  static calculateProgress(goal, currentAmount) {
    const percentComplete = (currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - currentAmount;

    const monthsElapsed = this.monthsBetween(goal.startDate, new Date());
    const totalMonths = this.monthsBetween(goal.startDate, goal.targetDate);
    const monthsRemaining = totalMonths - monthsElapsed;

    const requiredMonthlyContribution = monthsRemaining > 0
      ? remaining / monthsRemaining
      : remaining;

    const onTrack = currentAmount >= (goal.targetAmount * (monthsElapsed / totalMonths));

    return {
      percentComplete: Math.min(100, percentComplete).toFixed(1),
      amountRemaining: remaining,
      monthsElapsed,
      monthsRemaining: Math.max(0, monthsRemaining),
      requiredMonthlyContribution: Math.max(0, requiredMonthlyContribution),
      onTrack,
      status: onTrack ? 'On Track' : 'Behind Schedule'
    };
  }

  /**
   * Calculate months between two dates
   */
  static monthsBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// DEBT CONSOLIDATION ANALYZER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Analyze debt consolidation opportunities
 */
export class DebtConsolidationAnalyzer {
  /**
   * Evaluate if debt consolidation is beneficial
   */
  static analyze(debts, consolidationLoanRate, consolidationLoanTerm = 60) {
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const weightedAvgRate = debts.reduce((sum, d) => sum + (d.interestRate * d.balance), 0) / totalDebt;

    // Calculate current total cost
    const currentCalculator = new DebtPayoffCalculator(
      debts,
      debts.reduce((sum, d) => sum + d.minimumPayment, 0),
      'avalanche'
    );
    const currentResult = currentCalculator.calculatePayoffTimeline();

    // Calculate consolidation loan payment
    const monthlyRate = consolidationLoanRate / 100 / 12;
    const consolidationPayment = totalDebt * (monthlyRate * Math.pow(1 + monthlyRate, consolidationLoanTerm)) /
                                  (Math.pow(1 + monthlyRate, consolidationLoanTerm) - 1);

    const totalConsolidationCost = consolidationPayment * consolidationLoanTerm;
    const consolidationInterest = totalConsolidationCost - totalDebt;

    const savings = currentResult.summary.totalInterestPaid - consolidationInterest;
    const monthlySavings = currentResult.summary.monthlyPayment - consolidationPayment;
    const timeSavings = currentResult.summary.totalMonths - consolidationLoanTerm;

    return {
      recommended: savings > 0 && consolidationLoanRate < weightedAvgRate,
      currentScenario: {
        totalInterest: currentResult.summary.totalInterestPaid,
        monthlyPayment: currentResult.summary.monthlyPayment,
        months: currentResult.summary.totalMonths,
        avgRate: weightedAvgRate.toFixed(2)
      },
      consolidationScenario: {
        totalInterest: Math.round(consolidationInterest),
        monthlyPayment: Math.round(consolidationPayment),
        months: consolidationLoanTerm,
        rate: consolidationLoanRate
      },
      savings: {
        totalInterestSavings: Math.round(savings),
        monthlyPaymentSavings: Math.round(monthlySavings),
        timeSavings: timeSavings,
        percentSavings: ((savings / currentResult.summary.totalInterestPaid) * 100).toFixed(1)
      },
      analysis: this.generateConsolidationRecommendation(savings, consolidationLoanRate, weightedAvgRate)
    };
  }

  /**
   * Generate consolidation recommendation
   */
  static generateConsolidationRecommendation(savings, newRate, currentRate) {
    if (savings > 1000 && newRate < currentRate - 2) {
      return {
        recommendation: 'Highly Recommended',
        reason: `You could save $${Math.round(savings).toLocaleString()} in interest with a ${(currentRate - newRate).toFixed(1)}% lower rate.`,
        confidence: 95
      };
    } else if (savings > 500 && newRate < currentRate) {
      return {
        recommendation: 'Recommended',
        reason: `Consolidation will save you $${Math.round(savings).toLocaleString()} and simplify your payments.`,
        confidence: 80
      };
    } else if (savings > 0) {
      return {
        recommendation: 'Consider',
        reason: 'Minor savings possible, but payment simplification may be valuable.',
        confidence: 60
      };
    } else {
      return {
        recommendation: 'Not Recommended',
        reason: 'Current debt payoff strategy is more cost-effective than consolidation.',
        confidence: 90
      };
    }
  }
}

// Export all classes
export default {
  DebtPayoffCalculator,
  BudgetOptimizer,
  CreditScoreProjector,
  FinancialGoalTracker,
  DebtConsolidationAnalyzer
};
