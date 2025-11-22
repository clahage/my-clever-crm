// Path: /src/lib/financialPlanningEngine.js
// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL PLANNING ENGINE - Calculation & Logic System
// ═══════════════════════════════════════════════════════════════════════════
// Backend calculation engine for debt payoff strategies, budget optimization,
// credit score simulation, and AI-powered financial recommendations
//
// This is the BRAIN of the Financial Planning Hub - all complex calculations
// happen here with zero client-side AI (all AI calls happen server-side)
// ═══════════════════════════════════════════════════════════════════════════

import { addMonths, differenceInMonths, parseISO, format } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// DEBT PAYOFF CALCULATION ALGORITHMS
// ═══════════════════════════════════════════════════════════════════════════

export class DebtPayoffCalculator {
  /**
   * Calculate debt snowball strategy (smallest balance first)
   * @param {Array} debts - Array of debt objects
   * @param {Number} monthlyExtra - Extra money available for debt payoff
   * @returns {Object} Payoff plan with timeline and total interest
   */
  static calculateSnowball(debts, monthlyExtra) {
    console.log('❄️ Calculating Snowball Strategy...');
    
    // Sort by balance (smallest first)
    const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
    
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'SNOWBALL');
  }

  /**
   * Calculate debt avalanche strategy (highest interest first)
   * @param {Array} debts - Array of debt objects
   * @param {Number} monthlyExtra - Extra money available for debt payoff
   * @returns {Object} Payoff plan with timeline and total interest
   */
  static calculateAvalanche(debts, monthlyExtra) {
    console.log('⛰️ Calculating Avalanche Strategy...');
    
    // Sort by APR (highest first)
    const sortedDebts = [...debts].sort((a, b) => b.apr - a.apr);
    
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'AVALANCHE');
  }

  /**
   * Calculate AI hybrid strategy (optimized balance)
   * @param {Array} debts - Array of debt objects
   * @param {Number} monthlyExtra - Extra money available for debt payoff
   * @returns {Object} Payoff plan with timeline and total interest
   */
  static calculateHybrid(debts, monthlyExtra) {
    console.log('🤖 Calculating AI Hybrid Strategy...');
    
    // Hybrid algorithm: Balance psychological wins with interest savings
    // 1. Collections first (credit score impact)
    // 2. Small balances under $500 (quick wins)
    // 3. High interest over 20% (cost savings)
    // 4. Remaining by avalanche
    
    const sortedDebts = [...debts].sort((a, b) => {
      // Collections first
      if (a.type === 'COLLECTION' && b.type !== 'COLLECTION') return -1;
      if (b.type === 'COLLECTION' && a.type !== 'COLLECTION') return 1;
      
      // Small balances second
      if (a.balance < 500 && b.balance >= 500) return -1;
      if (b.balance < 500 && a.balance >= 500) return 1;
      
      // High interest third
      if (a.apr > 20 && b.apr <= 20) return -1;
      if (b.apr > 20 && a.apr <= 20) return 1;
      
      // Then by interest rate
      return b.apr - a.apr;
    });
    
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'HYBRID');
  }

  /**
   * Calculate credit-focused strategy (maximize score improvement)
   * @param {Array} debts - Array of debt objects
   * @param {Number} monthlyExtra - Extra money available for debt payoff
   * @returns {Object} Payoff plan with timeline and total interest
   */
  static calculateCreditFocused(debts, monthlyExtra) {
    console.log('📈 Calculating Credit-Focused Strategy...');
    
    // Prioritize debts that hurt credit score most:
    // 1. Collections and charge-offs
    // 2. Credit cards over 50% utilization
    // 3. Credit cards over 30% utilization
    // 4. Recent late payments
    // 5. Remaining by balance
    
    const sortedDebts = [...debts].sort((a, b) => {
      // Collections first
      if ((a.type === 'COLLECTION' || a.type === 'CHARGE_OFF') && 
          (b.type !== 'COLLECTION' && b.type !== 'CHARGE_OFF')) return -1;
      if ((b.type === 'COLLECTION' || b.type === 'CHARGE_OFF') && 
          (a.type !== 'COLLECTION' && a.type !== 'CHARGE_OFF')) return 1;
      
      // High utilization credit cards
      const aUtil = a.type === 'CREDIT_CARD' && a.creditLimit ? 
        (a.balance / a.creditLimit) * 100 : 0;
      const bUtil = b.type === 'CREDIT_CARD' && b.creditLimit ? 
        (b.balance / b.creditLimit) * 100 : 0;
      
      if (aUtil > 50 && bUtil <= 50) return -1;
      if (bUtil > 50 && aUtil <= 50) return 1;
      if (aUtil > 30 && bUtil <= 30) return -1;
      if (bUtil > 30 && aUtil <= 30) return 1;
      
      // Then by balance
      return a.balance - b.balance;
    });
    
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'CREDIT_FOCUSED');
  }

  /**
   * Core payoff calculation logic
   * @private
   */
  static _calculatePayoffPlan(sortedDebts, monthlyExtra, strategy) {
    const workingDebts = sortedDebts.map(d => ({
      ...d,
      remainingBalance: d.balance,
      totalInterestPaid: 0,
      monthsPaid: 0,
      payoffDate: null
    }));

    let currentMonth = 0;
    let totalInterestPaid = 0;
    const timeline = [];
    const milestones = [];

    // Continue until all debts paid
    while (workingDebts.some(d => d.remainingBalance > 0)) {
      currentMonth++;
      let extraAvailable = monthlyExtra;
      
      // Calculate interest and make minimum payments
      for (const debt of workingDebts) {
        if (debt.remainingBalance <= 0) continue;
        
        // Calculate monthly interest
        const monthlyInterest = debt.remainingBalance * (debt.apr / 100 / 12);
        debt.totalInterestPaid += monthlyInterest;
        totalInterestPaid += monthlyInterest;
        
        // Apply minimum payment
        const minPayment = debt.minimumPayment || (debt.remainingBalance * 0.02);
        const payment = Math.min(minPayment, debt.remainingBalance + monthlyInterest);
        debt.remainingBalance = debt.remainingBalance + monthlyInterest - payment;
        debt.monthsPaid++;
        
        // Track for timeline
        if (!timeline[currentMonth - 1]) {
          timeline[currentMonth - 1] = {
            month: currentMonth,
            totalPaid: 0,
            totalInterest: 0,
            debtsRemaining: 0,
            totalRemaining: 0
          };
        }
      }
      
      // Apply extra payment to highest priority debt with balance
      for (const debt of workingDebts) {
        if (debt.remainingBalance > 0 && extraAvailable > 0) {
          const extraPayment = Math.min(extraAvailable, debt.remainingBalance);
          debt.remainingBalance -= extraPayment;
          extraAvailable -= extraPayment;
          
          // Check if debt is paid off
          if (debt.remainingBalance <= 0) {
            debt.payoffDate = format(addMonths(new Date(), currentMonth), 'MMM yyyy');
            milestones.push({
              month: currentMonth,
              type: 'payoff',
              debtName: debt.name,
              originalBalance: debt.balance,
              interestPaid: debt.totalInterestPaid
            });
            console.log(`✅ ${debt.name} paid off in month ${currentMonth}`);
          }
          
          break; // Only apply to one debt at a time
        }
      }
      
      // Update timeline
      timeline[currentMonth - 1].totalPaid = monthlyExtra + workingDebts.reduce((sum, d) => 
        sum + (d.minimumPayment || d.balance * 0.02), 0
      );
      timeline[currentMonth - 1].totalInterest = totalInterestPaid;
      timeline[currentMonth - 1].debtsRemaining = workingDebts.filter(d => d.remainingBalance > 0).length;
      timeline[currentMonth - 1].totalRemaining = workingDebts.reduce((sum, d) => 
        sum + Math.max(0, d.remainingBalance), 0
      );
      
      // Safety check
      if (currentMonth > 600) {
        console.warn('⚠️ Payoff exceeds 50 years, stopping calculation');
        break;
      }
    }

    // Calculate comparison metrics
    const totalOriginalDebt = sortedDebts.reduce((sum, d) => sum + d.balance, 0);
    const avgAPR = sortedDebts.reduce((sum, d) => sum + d.apr, 0) / sortedDebts.length;
    
    return {
      strategy,
      debts: workingDebts,
      timeline,
      milestones,
      summary: {
        totalMonths: currentMonth,
        totalYears: (currentMonth / 12).toFixed(1),
        totalInterestPaid: Math.round(totalInterestPaid),
        totalPaid: Math.round(totalOriginalDebt + totalInterestPaid),
        monthlyPayment: monthlyExtra + sortedDebts.reduce((sum, d) => 
          sum + (d.minimumPayment || d.balance * 0.02), 0
        ),
        debtFreeDate: format(addMonths(new Date(), currentMonth), 'MMMM yyyy'),
        avgAPR: avgAPR.toFixed(2)
      }
    };
  }

  /**
   * Compare all strategies side-by-side
   */
  static compareAllStrategies(debts, monthlyExtra) {
    const snowball = this.calculateSnowball(debts, monthlyExtra);
    const avalanche = this.calculateAvalanche(debts, monthlyExtra);
    const hybrid = this.calculateHybrid(debts, monthlyExtra);
    const creditFocused = this.calculateCreditFocused(debts, monthlyExtra);

    // Determine recommended strategy
    let recommended = 'AVALANCHE'; // Default
    
    // If avalanche saves > $500 vs snowball, recommend it
    const avalancheSavings = snowball.summary.totalInterestPaid - avalanche.summary.totalInterestPaid;
    
    // If hybrid is within $200 of avalanche but faster by 3+ months, recommend it
    const hybridVsAvalanche = avalanche.summary.totalInterestPaid - hybrid.summary.totalInterestPaid;
    const hybridMonthsFaster = avalanche.summary.totalMonths - hybrid.summary.totalMonths;
    
    if (avalancheSavings > 500) {
      recommended = 'AVALANCHE';
    } else if (hybridVsAvalanche > -200 && hybridMonthsFaster >= 3) {
      recommended = 'HYBRID';
    } else if (snowball.summary.totalMonths < avalanche.summary.totalMonths * 0.9) {
      // If snowball is 10%+ faster with minimal extra cost
      recommended = 'SNOWBALL';
    }

    return {
      snowball,
      avalanche,
      hybrid,
      creditFocused,
      recommended,
      comparison: {
        fastestPayoff: [snowball, avalanche, hybrid, creditFocused]
          .sort((a, b) => a.summary.totalMonths - b.summary.totalMonths)[0].strategy,
        lowestInterest: [snowball, avalanche, hybrid, creditFocused]
          .sort((a, b) => a.summary.totalInterestPaid - b.summary.totalInterestPaid)[0].strategy,
        bestBalance: hybrid.strategy
      }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BUDGET CALCULATION & OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════

export class BudgetOptimizer {
  /**
   * Analyze budget and provide optimization recommendations
   */
  static analyzeBudget(income, expenses) {
    console.log('📊 Analyzing budget...');
    
    const totalIncome = income.monthly || 0;
    const categorizedExpenses = this._categorizeExpenses(expenses);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const disposableIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (disposableIncome / totalIncome) * 100 : 0;

    // Calculate recommended allocations (50/30/20 rule)
    const recommended = {
      needs: totalIncome * 0.50,      // Housing, utilities, groceries, etc.
      wants: totalIncome * 0.30,      // Entertainment, dining, etc.
      savings: totalIncome * 0.20     // Savings, debt payoff, investments
    };

    // Calculate actual allocations
    const actual = {
      needs: categorizedExpenses.essentials,
      wants: categorizedExpenses.discretionary,
      savings: categorizedExpenses.savings
    };

    // Variance analysis
    const variance = {
      needs: actual.needs - recommended.needs,
      wants: actual.wants - recommended.wants,
      savings: actual.savings - recommended.savings
    };

    // Generate recommendations
    const recommendations = this._generateBudgetRecommendations(
      totalIncome,
      categorizedExpenses,
      variance
    );

    return {
      summary: {
        totalIncome,
        totalExpenses,
        disposableIncome,
        savingsRate: savingsRate.toFixed(1)
      },
      categorizedExpenses,
      recommended,
      actual,
      variance,
      recommendations,
      healthScore: this._calculateBudgetHealthScore(totalIncome, totalExpenses, savingsRate)
    };
  }

  /**
   * Categorize expenses into needs, wants, and savings
   * @private
   */
  static _categorizeExpenses(expenses) {
    const essentials = expenses
      .filter(e => ['housing', 'utilities', 'food', 'insurance', 'healthcare', 'transportation', 'childcare'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const discretionary = expenses
      .filter(e => ['entertainment', 'dining', 'subscriptions', 'fitness', 'travel', 'gifts', 'personal'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const savings = expenses
      .filter(e => e.category === 'savings')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      essentials,
      discretionary,
      savings,
      byCategory: expenses.reduce((acc, e) => {
        if (!acc[e.category]) acc[e.category] = 0;
        acc[e.category] += e.amount;
        return acc;
      }, {})
    };
  }

  /**
   * Generate budget optimization recommendations
   * @private
   */
  static _generateBudgetRecommendations(income, categorized, variance) {
    const recs = [];

    // High essential spending
    if (variance.needs > income * 0.10) {
      recs.push({
        category: 'essentials',
        priority: 'high',
        title: 'Reduce Essential Expenses',
        description: `Your essential expenses are ${((variance.needs / income) * 100).toFixed(0)}% over recommended. Look for ways to reduce housing, utilities, or insurance costs.`,
        potentialSavings: variance.needs * 0.15,
        actions: [
          'Negotiate lower insurance premiums',
          'Consider refinancing high-interest loans',
          'Audit utility usage and switch providers',
          'Review subscription services for essentials'
        ]
      });
    }

    // High discretionary spending
    if (variance.wants > income * 0.05) {
      recs.push({
        category: 'discretionary',
        priority: 'medium',
        title: 'Cut Discretionary Spending',
        description: `You're spending ${((variance.wants / income) * 100).toFixed(0)}% more than recommended on wants. Small cuts can free up significant money for debt payoff.`,
        potentialSavings: variance.wants * 0.25,
        actions: [
          'Reduce dining out frequency',
          'Cancel unused subscriptions',
          'Find free entertainment alternatives',
          'Implement a 30-day rule for non-essential purchases'
        ]
      });
    }

    // Low savings rate
    if (categorized.savings < income * 0.10) {
      recs.push({
        category: 'savings',
        priority: 'high',
        title: 'Increase Savings & Debt Payoff',
        description: 'You\'re saving less than 10% of income. Aim for at least 20% for financial security.',
        targetAmount: income * 0.20 - categorized.savings,
        actions: [
          'Set up automatic transfers to savings',
          'Apply pay raises to savings before lifestyle inflation',
          'Use the debt avalanche to free up money faster',
          'Consider a side income stream'
        ]
      });
    }

    // Specific category overspending
    const categorySpending = categorized.byCategory;
    
    // Housing over 30%
    if (categorySpending.housing > income * 0.30) {
      recs.push({
        category: 'housing',
        priority: 'high',
        title: 'Housing Costs Too High',
        description: `Housing is ${((categorySpending.housing / income) * 100).toFixed(0)}% of income (recommended: 30% or less). Consider long-term solutions.`,
        potentialSavings: categorySpending.housing - (income * 0.30),
        actions: [
          'Consider refinancing mortgage',
          'Get a roommate if possible',
          'Explore more affordable housing options',
          'Negotiate rent reduction'
        ]
      });
    }

    // Subscriptions analysis
    if (categorySpending.subscriptions > 100) {
      recs.push({
        category: 'subscriptions',
        priority: 'low',
        title: 'Subscription Audit Needed',
        description: `You're spending $${categorySpending.subscriptions}/month on subscriptions. Many people have forgotten subscriptions.`,
        potentialSavings: categorySpending.subscriptions * 0.40,
        actions: [
          'List all active subscriptions',
          'Cancel services you don\'t use monthly',
          'Share family plans when possible',
          'Rotate streaming services seasonally'
        ]
      });
    }

    return recs;
  }

  /**
   * Calculate overall budget health score
   * @private
   */
  static _calculateBudgetHealthScore(income, expenses, savingsRate) {
    let score = 100;

    // Savings rate (40 points)
    if (savingsRate < 5) score -= 40;
    else if (savingsRate < 10) score -= 30;
    else if (savingsRate < 15) score -= 20;
    else if (savingsRate < 20) score -= 10;

    // Expense to income ratio (30 points)
    const expenseRatio = (expenses / income) * 100;
    if (expenseRatio > 90) score -= 30;
    else if (expenseRatio > 80) score -= 20;
    else if (expenseRatio > 70) score -= 10;

    // Disposable income (30 points)
    const disposable = income - expenses;
    if (disposable < 0) score -= 30;
    else if (disposable < income * 0.10) score -= 20;
    else if (disposable < income * 0.20) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Find potential savings opportunities
   */
  static findSavingsOpportunities(expenses, income) {
    const opportunities = [];

    // Subscription consolidation
    const subscriptions = expenses.filter(e => e.category === 'subscriptions');
    if (subscriptions.length > 3) {
      const totalSub = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      opportunities.push({
        type: 'subscription_audit',
        title: 'Consolidate Subscriptions',
        currentCost: totalSub,
        potentialSavings: totalSub * 0.3,
        difficulty: 'easy',
        impact: 'medium'
      });
    }

    // Dining out reduction
    const dining = expenses.filter(e => e.category === 'dining');
    if (dining.length > 0) {
      const totalDining = dining.reduce((sum, d) => sum + d.amount, 0);
      if (totalDining > income * 0.05) {
        opportunities.push({
          type: 'dining_reduction',
          title: 'Reduce Dining Out',
          currentCost: totalDining,
          potentialSavings: totalDining * 0.50,
          difficulty: 'medium',
          impact: 'high'
        });
      }
    }

    // Insurance shopping
    const insurance = expenses.filter(e => e.category === 'insurance');
    if (insurance.length > 0) {
      const totalInsurance = insurance.reduce((sum, i) => sum + i.amount, 0);
      opportunities.push({
        type: 'insurance_shop',
        title: 'Shop Insurance Rates',
        currentCost: totalInsurance,
        potentialSavings: totalInsurance * 0.15,
        difficulty: 'medium',
        impact: 'medium'
      });
    }

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT SCORE IMPACT SIMULATION
// ═══════════════════════════════════════════════════════════════════════════

export class CreditScoreSimulator {
  /**
   * Simulate credit score impact of debt payoff strategy
   */
  static simulateScoreImpact(currentScore, debts, payoffPlan) {
    console.log('📊 Simulating credit score impact...');
    
    const timeline = [];
    let simulatedScore = currentScore || 650;
    
    // FICO scoring factors:
    // - Payment history: 35%
    // - Amounts owed: 30%
    // - Length of credit history: 15%
    // - Credit mix: 10%
    // - New credit: 10%

    for (let month = 0; month < payoffPlan.summary.totalMonths; month++) {
      let monthScore = simulatedScore;
      
      // Calculate utilization impact (30% of score)
      const creditCards = debts.filter(d => d.type === 'CREDIT_CARD');
      if (creditCards.length > 0) {
        const monthData = payoffPlan.timeline[month];
        
        // Estimate utilization reduction
        const originalUtil = creditCards.reduce((sum, cc) => 
          sum + (cc.creditLimit > 0 ? (cc.balance / cc.creditLimit) * 100 : 0), 0
        ) / creditCards.length;
        
        const paidDown = payoffPlan.summary.totalPaid * (month / payoffPlan.summary.totalMonths);
        const newUtil = Math.max(0, originalUtil - (paidDown / 1000)); // Rough estimate
        
        // Score impact from utilization
        if (originalUtil > 30 && newUtil < 30) monthScore += 20;
        else if (originalUtil > 50 && newUtil < 50) monthScore += 15;
        else if (originalUtil > 70 && newUtil < 70) monthScore += 10;
        else if (newUtil < originalUtil - 5) monthScore += 5;
      }
      
      // Payment history impact (35% of score)
      // Assume on-time payments throughout
      if (month > 0) {
        monthScore += 1; // Gradual improvement from consistent payments
      }
      
      // Accounts paid off impact
      const paidOffThisMonth = payoffPlan.milestones.filter(m => 
        m.month === month && m.type === 'payoff'
      );
      
      for (const payoff of paidOffThisMonth) {
        // Collections have biggest impact
        const originalDebt = debts.find(d => d.name === payoff.debtName);
        if (originalDebt?.type === 'COLLECTION') {
          monthScore += 30;
        } else if (originalDebt?.type === 'CREDIT_CARD') {
          monthScore += 10;
        } else {
          monthScore += 5;
        }
      }
      
      // Cap score at 850
      simulatedScore = Math.min(850, monthScore);
      
      timeline.push({
        month: month + 1,
        score: Math.round(simulatedScore),
        change: month === 0 ? 0 : Math.round(simulatedScore - timeline[month - 1].score),
        utilization: this._calculateUtilization(debts, paidDown),
        debtsRemaining: payoffPlan.timeline[month]?.debtsRemaining || 0
      });
    }

    return {
      timeline,
      summary: {
        startingScore: currentScore || 650,
        endingScore: Math.round(simulatedScore),
        totalIncrease: Math.round(simulatedScore - (currentScore || 650)),
        averageMonthlyIncrease: ((simulatedScore - (currentScore || 650)) / payoffPlan.summary.totalMonths).toFixed(1),
        monthsToExcellent: timeline.findIndex(t => t.score >= 740) + 1 || null,
        monthsToGood: timeline.findIndex(t => t.score >= 670) + 1 || null
      }
    };
  }

  /**
   * Calculate current credit utilization
   * @private
   */
  static _calculateUtilization(debts, paidDown = 0) {
    const creditCards = debts.filter(d => d.type === 'CREDIT_CARD');
    if (creditCards.length === 0) return 0;
    
    const totalBalance = creditCards.reduce((sum, cc) => sum + Math.max(0, cc.balance - paidDown), 0);
    const totalLimit = creditCards.reduce((sum, cc) => sum + (cc.creditLimit || 0), 0);
    
    return totalLimit > 0 ? ((totalBalance / totalLimit) * 100).toFixed(1) : 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL GOAL TRACKING
// ═══════════════════════════════════════════════════════════════════════════

export class GoalTracker {
  /**
   * Calculate progress toward financial goal
   */
  static calculateGoalProgress(goal, currentSavings, monthlyContribution) {
    const target = goal.targetAmount || 0;
    const current = currentSavings || 0;
    const monthly = monthlyContribution || 0;
    
    const remaining = Math.max(0, target - current);
    const percentComplete = target > 0 ? (current / target) * 100 : 0;
    
    let monthsToGoal = 0;
    if (monthly > 0 && remaining > 0) {
      monthsToGoal = Math.ceil(remaining / monthly);
    }
    
    const estimatedDate = monthsToGoal > 0 ? 
      format(addMonths(new Date(), monthsToGoal), 'MMMM yyyy') : 
      'Goal Met';

    return {
      current,
      target,
      remaining,
      percentComplete: percentComplete.toFixed(1),
      monthsToGoal,
      estimatedDate,
      onTrack: current >= (target * (goal.timelineMonths ? 
        ((new Date() - new Date(goal.startDate)) / (1000 * 60 * 60 * 24 * 30) / goal.timelineMonths) : 0.5))
    };
  }

  /**
   * Generate milestone achievements
   */
  static generateMilestones(goal, progress) {
    const milestones = [
      { percent: 25, title: 'First Quarter', achieved: progress.percentComplete >= 25 },
      { percent: 50, title: 'Halfway There!', achieved: progress.percentComplete >= 50 },
      { percent: 75, title: 'Three Quarters', achieved: progress.percentComplete >= 75 },
      { percent: 100, title: 'Goal Complete!', achieved: progress.percentComplete >= 100 }
    ];

    return milestones;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMERGENCY FUND CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

export class EmergencyFundCalculator {
  /**
   * Calculate recommended emergency fund size
   */
  static calculateRecommended(monthlyExpenses, employmentStability = 'stable', dependents = 0) {
    let monthsNeeded = 3; // Base recommendation
    
    // Adjust for employment stability
    if (employmentStability === 'unstable' || employmentStability === 'self-employed') {
      monthsNeeded = 6;
    } else if (employmentStability === 'very-stable') {
      monthsNeeded = 3;
    }
    
    // Adjust for dependents
    monthsNeeded += dependents * 0.5;
    
    // Cap at 12 months
    monthsNeeded = Math.min(12, monthsNeeded);
    
    const recommended = monthlyExpenses * monthsNeeded;
    
    return {
      monthsNeeded,
      recommendedAmount: Math.round(recommended),
      minimumAmount: Math.round(monthlyExpenses * 3),
      idealAmount: Math.round(monthlyExpenses * 6)
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL CALCULATORS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  DebtPayoffCalculator,
  BudgetOptimizer,
  CreditScoreSimulator,
  GoalTracker,
  EmergencyFundCalculator
};