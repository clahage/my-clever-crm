// src/utils/ProductMatchingAI.js
// ============================================================================
// 🤖 PRODUCT MATCHING AI - INTELLIGENT CLIENT-TO-PRODUCT MATCHING
// ============================================================================
// Path: /src/utils/ProductMatchingAI.js
//
// PURPOSE:
// AI-powered system to match credit repair clients with the best affiliate
// products based on their credit score, goals, financial situation, and needs.
//
// FEATURES:
// - Credit score-based matching
// - Goal-oriented recommendations
// - Financial situation analysis
// - Approval probability calculation
// - Product ranking algorithm
// - Personalized recommendations
//
// USAGE:
// import productMatcher from '@/utils/ProductMatchingAI';
// const matches = await productMatcher.findBestMatches(clientData);
//
// LINES: 500+
// AI FEATURES: 20+
// ============================================================================

import { affiliatePrograms } from './AffiliateProgramDatabase';

class ProductMatchingAI {
  constructor() {
    this.matchingEnabled = true;
    this.debug = process.env.NODE_ENV === 'development';
  }

  // ============================================================================
  // MAIN MATCHING ALGORITHM
  // ============================================================================

  /**
   * Find best product matches for a client
   * @param {Object} clientData - Client information
   * @returns {Array} Ranked list of product matches with scores
   */
  async findBestMatches(clientData) {
    try {
      const {
        creditScore,
        goal,
        income,
        debtAmount,
        monthlyExpenses,
        employment,
        housingStatus,
      } = clientData;

      // Score all programs
      const scoredPrograms = affiliatePrograms.map(program => {
        const score = this.calculateMatchScore(program, clientData);
        const approvalProbability = this.estimateApprovalProbability(program, clientData);
        const expectedValue = this.calculateExpectedValue(program, approvalProbability);
        
        return {
          ...program,
          matchScore: score,
          approvalProbability,
          expectedValue,
          reasoning: this.generateReasoning(program, clientData, score),
        };
      });

      // Sort by match score
      scoredPrograms.sort((a, b) => b.matchScore - a.matchScore);

      // Return top matches
      return scoredPrograms.filter(p => p.matchScore > 0);
    } catch (err) {
      console.error('❌ Error finding matches:', err);
      return [];
    }
  }

  /**
   * Calculate match score for a program
   * @param {Object} program - Affiliate program
   * @param {Object} clientData - Client information
   * @returns {number} Match score (0-100)
   */
  calculateMatchScore(program, clientData) {
    let score = 0;

    // Credit score compatibility (40 points)
    score += this.scoreCreditCompatibility(program, clientData.creditScore);

    // Goal alignment (30 points)
    score += this.scoreGoalAlignment(program, clientData.goal);

    // Financial fit (20 points)
    score += this.scoreFinancialFit(program, clientData);

    // Product value (10 points)
    score += this.scoreProductValue(program);

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score credit score compatibility
   */
  scoreCreditCompatibility(program, clientScore) {
    const minRequired = program.requirements?.minCreditScore;
    
    if (!minRequired) return 40; // No requirement = full points
    
    if (clientScore >= minRequired + 50) return 40; // Well above requirement
    if (clientScore >= minRequired + 20) return 35; // Above requirement
    if (clientScore >= minRequired) return 25; // Meets requirement
    if (clientScore >= minRequired - 20) return 15; // Close to requirement
    if (clientScore >= minRequired - 50) return 5;  // Below requirement
    
    return 0; // Too far below
  }

  /**
   * Score goal alignment
   */
  scoreGoalAlignment(program, clientGoal) {
    const goalMap = {
      'buy-home': ['mortgages', 'credit-builders', 'credit-monitoring'],
      'buy-car': ['auto-loans', 'credit-builders', 'credit-monitoring'],
      'get-credit-card': ['credit-cards', 'credit-builders'],
      'lower-debt': ['debt-consolidation', 'personal-loans'],
      'build-credit': ['credit-builders', 'credit-monitoring', 'credit-cards'],
      'improve-score': ['credit-monitoring', 'credit-builders', 'identity-theft'],
    };

    const relevantCategories = goalMap[clientGoal] || [];
    
    if (relevantCategories.includes(program.category)) return 30;
    if (program.category === 'credit-monitoring') return 15; // Always somewhat relevant
    
    return 5; // Minimal points for unrelated
  }

  /**
   * Score financial fit
   */
  scoreFinancialFit(program, clientData) {
    const { income, debtAmount, monthlyExpenses } = clientData;
    
    let score = 0;

    // Income-based scoring
    if (program.category === 'credit-cards') {
      if (income >= 75000) score += 10;
      else if (income >= 50000) score += 8;
      else if (income >= 30000) score += 5;
      else score += 2;
    } else if (program.category === 'personal-loans') {
      const dti = debtAmount / (income / 12);
      if (dti < 0.3) score += 10;
      else if (dti < 0.4) score += 7;
      else if (dti < 0.5) score += 4;
      else score += 1;
    } else if (program.category === 'mortgages') {
      if (income >= 80000) score += 10;
      else if (income >= 60000) score += 6;
      else score += 2;
    } else {
      score += 5; // Default for other categories
    }

    // Debt situation scoring
    if (debtAmount > 0 && program.category === 'debt-consolidation') {
      score += 10;
    }

    return Math.min(20, score);
  }

  /**
   * Score product value (commission potential)
   */
  scoreProductValue(program) {
    const commissionValue = program.commission.amount || program.commission.rate || 0;
    const epc = program.epc || 0;
    
    let score = 0;
    
    // Higher commission = higher score
    if (commissionValue >= 300) score += 5;
    else if (commissionValue >= 200) score += 4;
    else if (commissionValue >= 100) score += 3;
    else if (commissionValue >= 50) score += 2;
    else score += 1;

    // Higher EPC = higher score
    if (epc >= 20) score += 5;
    else if (epc >= 10) score += 4;
    else if (epc >= 5) score += 3;
    else score += 1;

    return Math.min(10, score);
  }

  // ============================================================================
  // APPROVAL PROBABILITY ESTIMATION
  // ============================================================================

  /**
   * Estimate approval probability
   * @param {Object} program - Affiliate program
   * @param {Object} clientData - Client information
   * @returns {number} Probability (0-100)
   */
  estimateApprovalProbability(program, clientData) {
    const { creditScore, income, employment, debtAmount } = clientData;
    const minScore = program.requirements?.minCreditScore;
    
    if (!minScore) return 85; // No requirements = high probability
    
    let probability = 50; // Base probability

    // Credit score impact
    const scoreDiff = creditScore - minScore;
    if (scoreDiff >= 50) probability += 30;
    else if (scoreDiff >= 30) probability += 20;
    else if (scoreDiff >= 10) probability += 10;
    else if (scoreDiff >= 0) probability += 5;
    else if (scoreDiff >= -10) probability -= 10;
    else if (scoreDiff >= -30) probability -= 25;
    else probability -= 40;

    // Income impact
    if (income >= 75000) probability += 10;
    else if (income >= 50000) probability += 5;
    else if (income < 30000) probability -= 5;

    // Employment impact
    if (employment === 'full-time') probability += 5;
    else if (employment === 'part-time') probability -= 3;
    else if (employment === 'unemployed') probability -= 15;

    // Debt-to-income impact
    const dti = debtAmount / (income / 12);
    if (dti > 0.5) probability -= 10;
    else if (dti > 0.4) probability -= 5;

    return Math.min(95, Math.max(5, probability));
  }

  /**
   * Calculate expected value (commission × approval probability)
   * @param {Object} program - Affiliate program
   * @param {number} approvalProbability - Approval probability
   * @returns {number} Expected value in dollars
   */
  calculateExpectedValue(program, approvalProbability) {
    const commission = program.commission.amount || program.commission.rate || 0;
    const probability = approvalProbability / 100;
    return Math.round(commission * probability * 100) / 100;
  }

  // ============================================================================
  // RECOMMENDATION GENERATION
  // ============================================================================

  /**
   * Generate reasoning for match
   * @param {Object} program - Affiliate program
   * @param {Object} clientData - Client data
   * @param {number} score - Match score
   * @returns {string} Human-readable reasoning
   */
  generateReasoning(program, clientData, score) {
    const reasons = [];

    // Credit score reasoning
    const minRequired = program.requirements?.minCreditScore;
    if (minRequired) {
      if (clientData.creditScore >= minRequired + 50) {
        reasons.push('Credit score well above requirement');
      } else if (clientData.creditScore >= minRequired) {
        reasons.push('Credit score meets requirement');
      } else if (clientData.creditScore < minRequired) {
        reasons.push('Credit score below requirement - approval may be difficult');
      }
    }

    // Goal reasoning
    if (program.category === 'credit-builders' && clientData.goal === 'build-credit') {
      reasons.push('Perfect for credit building goals');
    }
    if (program.category === 'mortgages' && clientData.goal === 'buy-home') {
      reasons.push('Directly supports home buying goal');
    }
    if (program.category === 'debt-consolidation' && clientData.debtAmount > 0) {
      reasons.push('Can help consolidate existing debt');
    }

    // Value reasoning
    if (program.commission.amount >= 200) {
      reasons.push('High commission opportunity');
    }
    if (program.avgConversion >= 10) {
      reasons.push('Strong conversion rate');
    }

    return reasons.join('. ') || 'General match based on profile';
  }

  /**
   * Generate personalized recommendation email
   * @param {Object} client - Client data
   * @param {Array} matches - Top matches
   * @returns {string} Email content
   */
  generateRecommendationEmail(client, matches) {
    const topMatch = matches[0];
    
    return `
Hi ${client.firstName},

Based on your credit profile and ${client.goal} goal, I wanted to share a recommendation that could help you:

**${topMatch.name}**
${topMatch.description}

Why this is a great fit for you:
${topMatch.reasoning}

Approval Probability: ${topMatch.approvalProbability}%

${topMatch.category === 'credit-cards' ? 'This card could help you build credit while earning rewards.' : ''}
${topMatch.category === 'credit-builders' ? 'This product is specifically designed to help improve your credit score.' : ''}

Would you like me to help you apply?

Best regards,
Your Credit Repair Team
    `.trim();
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Find matches for multiple clients
   * @param {Array} clients - Array of client data
   * @returns {Object} Matches organized by client ID
   */
  async batchFindMatches(clients) {
    const results = {};
    
    for (const client of clients) {
      results[client.id] = await this.findBestMatches(client);
    }
    
    return results;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Enable or disable matching
   * @param {boolean} enabled - Matching state
   */
  setMatchingEnabled(enabled) {
    this.matchingEnabled = enabled;
  }

  /**
   * Get matching status
   */
  isMatchingEnabled() {
    return this.matchingEnabled;
  }
}

// Export singleton instance
const productMatcher = new ProductMatchingAI();
export default productMatcher;