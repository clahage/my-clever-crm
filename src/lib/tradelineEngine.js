// Path: /src/lib/tradelineEngine.js
// ═══════════════════════════════════════════════════════════════════════════
// TRADELINE MATCHING ENGINE - AI-Powered Client Matching System
// ═══════════════════════════════════════════════════════════════════════════
// Sophisticated algorithm for matching clients with optimal tradelines
// Predicts score impact, recommends bundles, and optimizes cost-benefit
//
// CORE ALGORITHMS:
// 1. Credit Profile Analysis
// 2. Tradeline Suitability Scoring
// 3. Expected Score Impact Prediction
// 4. Cost-Benefit Optimization
// 5. Multiple Tradeline Bundling
// 6. Timing Optimization
// 7. Risk Assessment
// ═══════════════════════════════════════════════════════════════════════════

import { differenceInMonths, differenceInYears, parseISO } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// TRADELINE MATCHING ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class TradelineMatchingEngine {
  /**
   * Analyze client credit profile for tradeline recommendations
   * @param {Object} client - Client data with credit info
   * @returns {Object} Credit profile analysis
   */
  static analyzeClientProfile(client) {
    console.log('🔍 Analyzing client profile:', client.firstName);

    const analysis = {
      currentScore: client.creditScore || 650,
      scoreRange: this._determineScoreRange(client.creditScore || 650),
      negativeItems: client.negativeItems || 0,
      creditAge: this._calculateCreditAge(client.oldestAccount),
      utilization: this._calculateUtilization(client),
      paymentHistory: client.paymentHistory || 'unknown',
      inquiries: client.hardInquiries || 0,
      accountMix: this._analyzeAccountMix(client),
      goals: this._identifyGoals(client),
      eligibility: this._assessEligibility(client)
    };

    // Calculate improvement potential
    analysis.improvementPotential = this._calculateImprovementPotential(analysis);

    console.log('📊 Profile analysis complete:', analysis);
    return analysis;
  }

  /**
   * Find optimal tradeline matches for client
   * @param {Object} clientProfile - Analyzed client profile
   * @param {Array} availableTradelines - Available tradelines from inventory
   * @param {Number} maxBudget - Client's maximum budget
   * @returns {Array} Ranked tradeline recommendations
   */
  static findOptimalMatches(clientProfile, availableTradelines, maxBudget = 1000) {
    console.log('🎯 Finding optimal tradeline matches...');
    console.log('Available tradelines:', availableTradelines.length);
    console.log('Client budget:', maxBudget);

    const recommendations = [];

    // Score each tradeline for this client
    for (const tradeline of availableTradelines) {
      if (!tradeline.available || tradeline.price > maxBudget) continue;

      const matchScore = this._calculateMatchScore(clientProfile, tradeline);
      const expectedImpact = this._predictScoreImpact(clientProfile, tradeline);
      const costBenefit = this._calculateCostBenefit(tradeline, expectedImpact);

      recommendations.push({
        tradeline,
        matchScore,
        expectedImpact,
        costBenefit,
        reasons: this._generateReasons(clientProfile, tradeline, expectedImpact),
        warnings: this._identifyWarnings(clientProfile, tradeline)
      });
    }

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Also find optimal bundles
    const bundles = this._findOptimalBundles(
      clientProfile,
      availableTradelines,
      maxBudget
    );

    console.log('✅ Found recommendations:', recommendations.length);
    console.log('✅ Found bundles:', bundles.length);

    return {
      singleRecommendations: recommendations.slice(0, 10),
      bundles: bundles.slice(0, 5),
      summary: {
        totalOptions: recommendations.length,
        avgExpectedImpact: recommendations.length > 0
          ? Math.round(recommendations.reduce((sum, r) => sum + r.expectedImpact.totalPoints, 0) / recommendations.length)
          : 0,
        priceRange: {
          min: Math.min(...recommendations.map(r => r.tradeline.price)),
          max: Math.max(...recommendations.map(r => r.tradeline.price))
        }
      }
    };
  }

  /**
   * Calculate match score between client and tradeline
   * @private
   */
  static _calculateMatchScore(clientProfile, tradeline) {
    let score = 0;

    // Age factor (40 points)
    // Older tradelines have bigger impact
    const tradelineAge = differenceInYears(new Date(), parseISO(tradeline.openedDate));
    if (tradelineAge >= 10) score += 40;
    else if (tradelineAge >= 7) score += 35;
    else if (tradelineAge >= 5) score += 30;
    else if (tradelineAge >= 3) score += 20;
    else if (tradelineAge >= 2) score += 10;

    // Limit factor (25 points)
    // Higher limits = better impact
    if (tradeline.creditLimit >= 25000) score += 25;
    else if (tradeline.creditLimit >= 15000) score += 20;
    else if (tradeline.creditLimit >= 10000) score += 15;
    else if (tradeline.creditLimit >= 5000) score += 10;

    // Utilization factor (20 points)
    // Lower utilization on tradeline = better
    const tlUtilization = (tradeline.balance / tradeline.creditLimit) * 100;
    if (tlUtilization <= 5) score += 20;
    else if (tlUtilization <= 10) score += 15;
    else if (tlUtilization <= 20) score += 10;
    else if (tlUtilization <= 30) score += 5;

    // Payment history factor (10 points)
    if (tradeline.paymentHistory === 'perfect') score += 10;
    else if (tradeline.paymentHistory === 'excellent') score += 8;
    else if (tradeline.paymentHistory === 'good') score += 5;

    // Relevance to client needs (5 points)
    if (clientProfile.scoreRange === 'POOR' && tradelineAge >= 5) {
      score += 5; // Older accounts help poor credit more
    }
    if (clientProfile.utilization > 50 && tradeline.creditLimit >= 10000) {
      score += 5; // High limit helps high utilization
    }

    return Math.min(100, score);
  }

  /**
   * Predict credit score impact of adding tradeline
   * @private
   */
  static _predictScoreImpact(clientProfile, tradeline) {
    let totalPoints = 0;
    const breakdown = {
      utilizationImpact: 0,
      ageImpact: 0,
      paymentHistoryImpact: 0,
      accountMixImpact: 0
    };

    // Utilization impact (30% of FICO)
    if (clientProfile.utilization > 30) {
      // Adding high-limit tradeline with low utilization helps
      const limitIncrease = tradeline.creditLimit;
      const utilizationReduction = this._calculateUtilizationReduction(
        clientProfile,
        limitIncrease,
        tradeline.balance
      );
      
      if (utilizationReduction > 20) breakdown.utilizationImpact = 30;
      else if (utilizationReduction > 10) breakdown.utilizationImpact = 20;
      else if (utilizationReduction > 5) breakdown.utilizationImpact = 10;
      
      totalPoints += breakdown.utilizationImpact;
    }

    // Age of credit history impact (15% of FICO)
    const tradelineAge = differenceInYears(new Date(), parseISO(tradeline.openedDate));
    if (clientProfile.creditAge < 3) {
      // Young credit benefits most from aged tradelines
      if (tradelineAge >= 10) breakdown.ageImpact = 25;
      else if (tradelineAge >= 7) breakdown.ageImpact = 20;
      else if (tradelineAge >= 5) breakdown.ageImpact = 15;
      
      totalPoints += breakdown.ageImpact;
    } else if (clientProfile.creditAge < 7) {
      if (tradelineAge >= 10) breakdown.ageImpact = 15;
      else if (tradelineAge >= 7) breakdown.ageImpact = 10;
      
      totalPoints += breakdown.ageImpact;
    }

    // Payment history impact (35% of FICO)
    // Perfect tradeline payment history helps
    if (tradeline.paymentHistory === 'perfect') {
      if (clientProfile.negativeItems > 5) breakdown.paymentHistoryImpact = 20;
      else if (clientProfile.negativeItems > 2) breakdown.paymentHistoryImpact = 15;
      else breakdown.paymentHistoryImpact = 10;
      
      totalPoints += breakdown.paymentHistoryImpact;
    }

    // Account mix impact (10% of FICO)
    if (!clientProfile.accountMix.includes(tradeline.type)) {
      breakdown.accountMixImpact = 10;
      totalPoints += breakdown.accountMixImpact;
    }

    // Apply score range multiplier
    // Lower scores benefit more from tradelines
    let multiplier = 1.0;
    if (clientProfile.scoreRange === 'POOR') multiplier = 1.5;
    else if (clientProfile.scoreRange === 'FAIR') multiplier = 1.3;
    else if (clientProfile.scoreRange === 'GOOD') multiplier = 1.1;

    totalPoints = Math.round(totalPoints * multiplier);

    return {
      totalPoints: Math.min(100, totalPoints), // Cap at 100 point increase
      breakdown,
      confidence: this._calculateConfidence(clientProfile, tradeline),
      expectedNewScore: Math.min(850, clientProfile.currentScore + totalPoints),
      timeframe: '1-2 billing cycles'
    };
  }

  /**
   * Calculate cost-benefit ratio
   * @private
   */
  static _calculateCostBenefit(tradeline, expectedImpact) {
    const pointsPerDollar = expectedImpact.totalPoints / tradeline.price;
    
    let rating = 'poor';
    if (pointsPerDollar > 0.20) rating = 'excellent';
    else if (pointsPerDollar > 0.15) rating = 'good';
    else if (pointsPerDollar > 0.10) rating = 'fair';

    return {
      pointsPerDollar: pointsPerDollar.toFixed(3),
      rating,
      value: rating === 'excellent' ? 'High' : rating === 'good' ? 'Good' : rating === 'fair' ? 'Fair' : 'Low'
    };
  }

  /**
   * Find optimal bundles of multiple tradelines
   * @private
   */
  static _findOptimalBundles(clientProfile, availableTradelines, maxBudget) {
    const bundles = [];

    // Try combinations of 2-3 tradelines
    for (let i = 0; i < availableTradelines.length; i++) {
      const tl1 = availableTradelines[i];
      if (!tl1.available || tl1.price > maxBudget * 0.6) continue;

      for (let j = i + 1; j < availableTradelines.length; j++) {
        const tl2 = availableTradelines[j];
        if (!tl2.available) continue;

        const bundlePrice = tl1.price + tl2.price;
        if (bundlePrice > maxBudget) continue;

        // Calculate combined impact
        const combinedImpact = this._calculateCombinedImpact(
          clientProfile,
          [tl1, tl2]
        );

        bundles.push({
          tradelines: [tl1, tl2],
          totalPrice: bundlePrice,
          expectedImpact: combinedImpact,
          costBenefit: combinedImpact.totalPoints / bundlePrice,
          savings: (tl1.price * 0.1) + (tl2.price * 0.1) // 10% bundle discount
        });

        // Try adding a third if budget allows
        for (let k = j + 1; k < availableTradelines.length; k++) {
          const tl3 = availableTradelines[k];
          if (!tl3.available) continue;

          const bundlePrice3 = bundlePrice + tl3.price;
          if (bundlePrice3 > maxBudget) continue;

          const combinedImpact3 = this._calculateCombinedImpact(
            clientProfile,
            [tl1, tl2, tl3]
          );

          bundles.push({
            tradelines: [tl1, tl2, tl3],
            totalPrice: bundlePrice3,
            expectedImpact: combinedImpact3,
            costBenefit: combinedImpact3.totalPoints / bundlePrice3,
            savings: bundlePrice3 * 0.15 // 15% bundle discount for 3
          });
        }
      }
    }

    // Sort by cost-benefit ratio
    return bundles.sort((a, b) => b.costBenefit - a.costBenefit);
  }

  /**
   * Calculate combined impact of multiple tradelines
   * @private
   */
  static _calculateCombinedImpact(clientProfile, tradelines) {
    // Multiple tradelines have diminishing returns
    let baseImpact = 0;
    const diminishingFactors = [1.0, 0.7, 0.5]; // Each additional TL has less impact

    for (let i = 0; i < tradelines.length; i++) {
      const impact = this._predictScoreImpact(clientProfile, tradelines[i]);
      baseImpact += impact.totalPoints * diminishingFactors[i];
    }

    return {
      totalPoints: Math.round(baseImpact),
      confidence: 'medium-high',
      timeframe: '2-3 billing cycles'
    };
  }

  /**
   * Generate human-readable reasons for recommendation
   * @private
   */
  static _generateReasons(clientProfile, tradeline, expectedImpact) {
    const reasons = [];

    const tradelineAge = differenceInYears(new Date(), parseISO(tradeline.openedDate));
    
    if (tradelineAge >= 10) {
      reasons.push(`Excellent age: ${tradelineAge} years old increases average account age`);
    }

    if (tradeline.creditLimit >= 15000) {
      reasons.push(`High credit limit: $${tradeline.creditLimit.toLocaleString()} significantly reduces utilization`);
    }

    const tlUtilization = (tradeline.balance / tradeline.creditLimit) * 100;
    if (tlUtilization <= 10) {
      reasons.push(`Low utilization: ${tlUtilization.toFixed(1)}% demonstrates responsible use`);
    }

    if (expectedImpact.breakdown.utilizationImpact > 20) {
      reasons.push('Strong utilization impact: Could increase score 20-30 points');
    }

    if (expectedImpact.breakdown.ageImpact > 15) {
      reasons.push('Substantial age benefit: Adds years to credit history');
    }

    if (tradeline.paymentHistory === 'perfect') {
      reasons.push('Perfect payment history: Never missed a payment');
    }

    return reasons.slice(0, 4); // Top 4 reasons
  }

  /**
   * Identify potential warnings or concerns
   * @private
   */
  static _identifyWarnings(clientProfile, tradeline) {
    const warnings = [];

    const tradelineAge = differenceInYears(new Date(), parseISO(tradeline.openedDate));
    
    if (tradelineAge < 2) {
      warnings.push('Low age: This tradeline is relatively new');
    }

    if (tradeline.creditLimit < 5000) {
      warnings.push('Low limit: Limited impact on utilization');
    }

    const tlUtilization = (tradeline.balance / tradeline.creditLimit) * 100;
    if (tlUtilization > 30) {
      warnings.push('High utilization: Above recommended 30%');
    }

    if (clientProfile.scoreRange === 'EXCELLENT' && tradeline.creditLimit < 10000) {
      warnings.push('Limited benefit: Your excellent credit may not see significant improvement');
    }

    return warnings;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  static _determineScoreRange(score) {
    if (score >= 740) return 'EXCELLENT';
    if (score >= 670) return 'GOOD';
    if (score >= 580) return 'FAIR';
    return 'POOR';
  }

  static _calculateCreditAge(oldestAccountDate) {
    if (!oldestAccountDate) return 0;
    return differenceInYears(new Date(), parseISO(oldestAccountDate));
  }

  static _calculateUtilization(client) {
    if (!client.totalCreditLimit || !client.totalBalance) return 0;
    return (client.totalBalance / client.totalCreditLimit) * 100;
  }

  static _analyzeAccountMix(client) {
    return client.accountTypes || ['CREDIT_CARD'];
  }

  static _identifyGoals(client) {
    const goals = [];
    
    if (client.homePurchaseIntent) goals.push('mortgage');
    if (client.autoPurchaseIntent) goals.push('auto_loan');
    if (client.creditScore < 670) goals.push('credit_improvement');
    
    return goals;
  }

  static _assessEligibility(client) {
    const issues = [];
    
    if (!client.ssn) issues.push('SSN required');
    if (!client.dob) issues.push('Date of birth required');
    if (client.bankruptcy && differenceInYears(new Date(), parseISO(client.bankruptcyDate)) < 2) {
      issues.push('Recent bankruptcy (must be 2+ years)');
    }
    
    return {
      eligible: issues.length === 0,
      issues
    };
  }

  static _calculateImprovementPotential(analysis) {
    let potential = 0;

    if (analysis.scoreRange === 'POOR') potential = 100;
    else if (analysis.scoreRange === 'FAIR') potential = 80;
    else if (analysis.scoreRange === 'GOOD') potential = 50;
    else potential = 30;

    if (analysis.utilization > 50) potential += 30;
    else if (analysis.utilization > 30) potential += 20;

    if (analysis.creditAge < 3) potential += 25;
    else if (analysis.creditAge < 5) potential += 15;

    return Math.min(150, potential);
  }

  static _calculateUtilizationReduction(clientProfile, newLimit, newBalance) {
    const currentUtil = clientProfile.utilization || 0;
    
    const newTotalLimit = (clientProfile.totalCreditLimit || 0) + newLimit;
    const newTotalBalance = (clientProfile.totalBalance || 0) + newBalance;
    
    const newUtil = (newTotalBalance / newTotalLimit) * 100;
    
    return currentUtil - newUtil;
  }

  static _calculateConfidence(clientProfile, tradeline) {
    let confidence = 80; // Base confidence

    const tradelineAge = differenceInYears(new Date(), parseISO(tradeline.openedDate));
    if (tradelineAge >= 10) confidence += 10;
    if (tradeline.creditLimit >= 15000) confidence += 5;
    if (tradeline.paymentHistory === 'perfect') confidence += 5;

    return Math.min(100, confidence);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRADELINE PRICING OPTIMIZER
// ═══════════════════════════════════════════════════════════════════════════

export class TradelinePricingOptimizer {
  /**
   * Calculate optimal price for a tradeline based on attributes
   */
  static calculateOptimalPrice(tradeline, marketData = null) {
    let basePrice = 300; // Base price

    // Age multiplier
    const age = differenceInYears(new Date(), parseISO(tradeline.openedDate));
    if (age >= 15) basePrice *= 2.5;
    else if (age >= 10) basePrice *= 2.0;
    else if (age >= 7) basePrice *= 1.7;
    else if (age >= 5) basePrice *= 1.4;
    else if (age >= 3) basePrice *= 1.2;

    // Limit multiplier
    if (tradeline.creditLimit >= 50000) basePrice *= 1.5;
    else if (tradeline.creditLimit >= 25000) basePrice *= 1.3;
    else if (tradeline.creditLimit >= 15000) basePrice *= 1.2;
    else if (tradeline.creditLimit >= 10000) basePrice *= 1.1;

    // Utilization adjustment
    const util = (tradeline.balance / tradeline.creditLimit) * 100;
    if (util <= 5) basePrice *= 1.2;
    else if (util <= 10) basePrice *= 1.1;
    else if (util > 30) basePrice *= 0.9;

    // Payment history
    if (tradeline.paymentHistory === 'perfect') basePrice *= 1.15;
    else if (tradeline.paymentHistory === 'excellent') basePrice *= 1.1;

    // Round to nearest $25
    return Math.round(basePrice / 25) * 25;
  }

  /**
   * Suggest pricing tiers for different client types
   */
  static suggestPricingTiers(tradeline) {
    const optimalPrice = this.calculateOptimalPrice(tradeline);

    return {
      standard: optimalPrice,
      premium: Math.round(optimalPrice * 1.3),
      bulk: Math.round(optimalPrice * 0.85), // 15% discount for 3+
      expedited: Math.round(optimalPrice * 1.5), // Rush posting
      recommended: optimalPrice
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  TradelineMatchingEngine,
  TradelinePricingOptimizer
};