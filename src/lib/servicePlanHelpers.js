// ============================================================================
// SERVICE PLAN HELPER FUNCTIONS
// ============================================================================
// Pure utility functions for working with service plans
// No side effects, no Firebase calls (those are in hooks)
// Used throughout the application for plan manipulation and formatting
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import { defaultServicePlans, targetAudiences } from '../config/servicePlansConfig';

// ===== GET ENABLED PLANS =====
// Returns only plans that are currently enabled
// @param {Array} plans - Array of service plan objects
// @returns {Array} - Filtered array of enabled plans
export const getEnabledPlans = (plans = defaultServicePlans) => {
  try {
    return plans
      .filter(plan => plan.enabled === true)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  } catch (error) {
    console.error('Error filtering enabled plans:', error);
    return [];
  }
};

// ===== GET PLAN BY ID =====
// Retrieves a single plan by its ID
// @param {string} id - Plan ID (e.g., 'standard', 'premium')
// @param {Array} plans - Array of service plan objects
// @returns {Object|null} - Plan object or null if not found
export const getPlanById = (id, plans = defaultServicePlans) => {
  try {
    return plans.find(plan => plan.id === id) || null;
  } catch (error) {
    console.error(`Error finding plan ${id}:`, error);
    return null;
  }
};

// ===== SORT PLANS BY PRICE =====
// Sorts plans by monthly price (low to high or high to low)
// @param {Array} plans - Array of service plan objects
// @param {string} direction - 'asc' or 'desc'
// @returns {Array} - Sorted array of plans
export const sortPlansByPrice = (plans = defaultServicePlans, direction = 'asc') => {
  try {
    return [...plans].sort((a, b) => {
      if (direction === 'asc') {
        return a.pricing.monthly - b.pricing.monthly;
      } else {
        return b.pricing.monthly - a.pricing.monthly;
      }
    });
  } catch (error) {
    console.error('Error sorting plans by price:', error);
    return plans;
  }
};

// ===== FORMAT PLAN FEATURES =====
// Returns formatted feature list for a plan in specified language
// @param {Object} plan - Service plan object
// @param {string} language - 'en' or 'es'
// @returns {Array} - Array of feature strings
export const formatPlanFeatures = (plan, language = 'en') => {
  try {
    if (!plan) return [];
    return language === 'es' ? plan.featuresEs || plan.features : plan.features;
  } catch (error) {
    console.error('Error formatting plan features:', error);
    return [];
  }
};

// ===== GET PLAN NAME =====
// Returns plan name in specified language
// @param {Object} plan - Service plan object
// @param {string} language - 'en' or 'es'
// @returns {string} - Plan name
export const getPlanName = (plan, language = 'en') => {
  try {
    if (!plan) return '';
    return language === 'es' ? plan.nameEs || plan.name : plan.name;
  } catch (error) {
    console.error('Error getting plan name:', error);
    return '';
  }
};

// ===== GET PLAN DESCRIPTION =====
// Returns plan description in specified language
// @param {Object} plan - Service plan object
// @param {string} language - 'en' or 'es'
// @returns {string} - Plan description
export const getPlanDescription = (plan, language = 'en') => {
  try {
    if (!plan) return '';
    return language === 'es' ? plan.descriptionEs || plan.description : plan.description;
  } catch (error) {
    console.error('Error getting plan description:', error);
    return '';
  }
};

// ===== GET PLAN COMPARISON DATA =====
// Builds comparison data structure for multiple plans
// @param {Array} plans - Array of service plan objects
// @param {string} language - 'en' or 'es'
// @returns {Object} - Comparison data structure
export const getPlanComparisonData = (plans = defaultServicePlans, language = 'en') => {
  try {
    const enabledPlans = getEnabledPlans(plans);

    return {
      plans: enabledPlans.map(plan => ({
        id: plan.id,
        name: getPlanName(plan, language),
        pricing: plan.pricing,
        features: formatPlanFeatures(plan, language),
        popular: plan.popular,
        bestValue: plan.bestValue,
        color: plan.color,
        icon: plan.icon
      })),
      categories: [
        {
          name: language === 'es' ? 'Precios' : 'Pricing',
          rows: [
            {
              label: language === 'es' ? 'Tarifa Mensual' : 'Monthly Fee',
              key: 'monthly',
              formatter: (value) => value === 0 ? (language === 'es' ? 'Gratis' : 'Free') : `$${value}/mo`
            },
            {
              label: language === 'es' ? 'Tarifa de Configuración' : 'Setup Fee',
              key: 'setupFee',
              formatter: (value) => value === 0 ? (language === 'es' ? 'Ninguno' : 'None') : `$${value}`
            },
            {
              label: language === 'es' ? 'Por Eliminación' : 'Per Deletion',
              key: 'perDeletion',
              formatter: (value) => value === 0 ? (language === 'es' ? 'Incluido' : 'Included') : `$${value}`
            },
            {
              label: language === 'es' ? 'Duración del Contrato' : 'Contract Length',
              key: 'contractMonths',
              formatter: (value) => value === 0 ? (language === 'es' ? 'Mes a mes' : 'Month-to-month') : `${value} ${language === 'es' ? 'meses' : 'months'}`
            }
          ]
        },
        {
          name: language === 'es' ? 'Características' : 'Features',
          rows: [
            {
              label: language === 'es' ? 'Monitoreo de 3 Agencias' : '3-Bureau Monitoring',
              key: 'includes3BureauMonitoring',
              formatter: (value) => value ? '✓' : '✗'
            },
            {
              label: language === 'es' ? 'Soporte Telefónico' : 'Phone Support',
              key: 'includesPhoneSupport',
              formatter: (value) => value ? '✓' : '✗'
            },
            {
              label: language === 'es' ? 'Consulta de Abogado' : 'Attorney Consultation',
              key: 'includesAttorneyConsult',
              formatter: (value) => value ? '✓' : '✗'
            }
          ]
        },
        {
          name: language === 'es' ? 'Rendimiento' : 'Performance',
          rows: [
            {
              label: language === 'es' ? 'Tasa de Éxito' : 'Success Rate',
              key: 'successRate',
              formatter: (value) => `${value}%`
            },
            {
              label: language === 'es' ? 'Meses Estimados' : 'Estimated Months',
              key: 'estimatedMonths',
              formatter: (value) => `${value} ${language === 'es' ? 'meses' : 'months'}`
            }
          ]
        }
      ]
    };
  } catch (error) {
    console.error('Error building plan comparison data:', error);
    return { plans: [], categories: [] };
  }
};

// ===== CALCULATE PLAN SCORE FOR CREDIT PROFILE =====
// Internal scoring function used by recommendation algorithm
// Higher score = better match for the credit profile
// @param {Object} plan - Service plan object
// @param {Object} creditProfile - Client's credit profile
// @returns {number} - Match score (0-100)
export const calculatePlanScore = (plan, creditProfile) => {
  try {
    let score = plan.aiRecommendationScore * 10; // Base score from config

    const {
      avgScore = 0,
      negativeItemCount = 0,
      hasPublicRecords = false,
      hasBankruptcy = false,
      hasForeclosure = false,
      hasTaxLien = false,
      hasJudgment = false,
      urgency = 'medium'
    } = creditProfile;

    // Adjust score based on negative item count
    if (negativeItemCount <= 3 && (plan.id === 'diy' || plan.id === 'pfd')) {
      score += 20;
    } else if (negativeItemCount >= 4 && negativeItemCount <= 10 && (plan.id === 'standard' || plan.id === 'hybrid')) {
      score += 20;
    } else if (negativeItemCount >= 5 && negativeItemCount <= 15 && plan.id === 'acceleration') {
      score += 15;
    } else if (negativeItemCount > 10 && plan.id === 'premium') {
      score += 25;
    }

    // Boost premium plan for complex legal issues
    if ((hasBankruptcy || hasForeclosure || hasTaxLien) && plan.id === 'premium') {
      score += 30;
    }

    // Boost acceleration plan for urgency
    if (urgency === 'high' && plan.id === 'acceleration') {
      score += 15;
    }

    // Boost pay-for-delete for risk-averse clients (low item count)
    if (negativeItemCount <= 5 && plan.id === 'pfd') {
      score += 15;
    }

    // Penalize overqualified plans (e.g., premium for simple cases)
    if (negativeItemCount <= 5 && !hasPublicRecords && plan.id === 'premium') {
      score -= 30;
    }

    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('Error calculating plan score:', error);
    return 0;
  }
};

// ===== GET RECOMMENDED PLAN =====
// Simple recommendation based on credit profile
// For advanced AI recommendations, use ServicePlanRecommender component
// @param {Object} creditProfile - Client's credit profile
// @param {Array} plans - Array of service plan objects
// @returns {Object} - { recommendedPlan, alternativePlans, scores }
export const getRecommendedPlan = (creditProfile, plans = defaultServicePlans) => {
  try {
    const enabledPlans = getEnabledPlans(plans);

    // Calculate scores for all plans
    const planScores = enabledPlans.map(plan => ({
      plan,
      score: calculatePlanScore(plan, creditProfile)
    }));

    // Sort by score (highest first)
    planScores.sort((a, b) => b.score - a.score);

    // Get top recommendation and alternatives
    const recommended = planScores[0]?.plan || null;
    const alternatives = planScores.slice(1, 4).map(ps => ps.plan);

    return {
      recommendedPlan: recommended,
      alternativePlans: alternatives,
      scores: planScores.reduce((acc, ps) => {
        acc[ps.plan.id] = ps.score;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Error getting recommended plan:', error);
    return {
      recommendedPlan: null,
      alternativePlans: [],
      scores: {}
    };
  }
};

// ===== FILTER PLANS BY CRITERIA =====
// Filter plans based on various criteria
// @param {Object} criteria - Filter criteria
// @param {Array} plans - Array of service plan objects
// @returns {Array} - Filtered plans
export const filterPlansByCriteria = (criteria = {}, plans = defaultServicePlans) => {
  try {
    let filteredPlans = [...plans];

    // Filter by price range
    if (criteria.maxMonthly) {
      filteredPlans = filteredPlans.filter(p => p.pricing.monthly <= criteria.maxMonthly);
    }
    if (criteria.minMonthly !== undefined) {
      filteredPlans = filteredPlans.filter(p => p.pricing.monthly >= criteria.minMonthly);
    }

    // Filter by features
    if (criteria.requiresPhoneSupport) {
      filteredPlans = filteredPlans.filter(p => p.includesPhoneSupport);
    }
    if (criteria.requiresAttorneyConsult) {
      filteredPlans = filteredPlans.filter(p => p.includesAttorneyConsult);
    }
    if (criteria.requires3BureauMonitoring) {
      filteredPlans = filteredPlans.filter(p => p.includes3BureauMonitoring);
    }

    // Filter by target audience
    if (criteria.targetAudience) {
      filteredPlans = filteredPlans.filter(p => p.targetAudience === criteria.targetAudience);
    }

    // Filter by contract length
    if (criteria.noContract) {
      filteredPlans = filteredPlans.filter(p => p.pricing.contractMonths === 0);
    }

    // Filter by enabled status
    if (criteria.enabledOnly !== false) {
      filteredPlans = getEnabledPlans(filteredPlans);
    }

    return filteredPlans;
  } catch (error) {
    console.error('Error filtering plans by criteria:', error);
    return [];
  }
};

// ===== GET TARGET AUDIENCE INFO =====
// Returns information about a target audience
// @param {string} audienceKey - Target audience key
// @param {string} language - 'en' or 'es'
// @returns {Object} - Audience information
export const getTargetAudienceInfo = (audienceKey, language = 'en') => {
  try {
    const audience = targetAudiences[audienceKey];
    if (!audience) return null;

    return {
      key: audienceKey,
      label: language === 'es' ? audience.labelEs : audience.label,
      description: language === 'es' ? audience.descriptionEs : audience.description
    };
  } catch (error) {
    console.error('Error getting target audience info:', error);
    return null;
  }
};

// ===== VALIDATE PLAN DATA =====
// Validates that a plan object has all required fields
// Used when creating/editing plans in admin interface
// @param {Object} planData - Plan object to validate
// @returns {Object} - { valid: boolean, errors: Array }
export const validatePlanData = (planData) => {
  const errors = [];

  try {
    // Required string fields
    if (!planData.id || typeof planData.id !== 'string') {
      errors.push('Plan ID is required and must be a string');
    }
    if (!planData.name || typeof planData.name !== 'string') {
      errors.push('Plan name is required and must be a string');
    }

    // Required pricing fields
    if (!planData.pricing || typeof planData.pricing !== 'object') {
      errors.push('Pricing object is required');
    } else {
      if (typeof planData.pricing.monthly !== 'number' || planData.pricing.monthly < 0) {
        errors.push('Monthly price must be a non-negative number');
      }
      if (typeof planData.pricing.setupFee !== 'number' || planData.pricing.setupFee < 0) {
        errors.push('Setup fee must be a non-negative number');
      }
      if (typeof planData.pricing.perDeletion !== 'number' || planData.pricing.perDeletion < 0) {
        errors.push('Per-deletion fee must be a non-negative number');
      }
      if (typeof planData.pricing.contractMonths !== 'number' || planData.pricing.contractMonths < 0) {
        errors.push('Contract months must be a non-negative number');
      }
    }

    // Required array fields
    if (!Array.isArray(planData.features) || planData.features.length === 0) {
      errors.push('Features array is required and must not be empty');
    }

    // Required boolean field
    if (typeof planData.enabled !== 'boolean') {
      errors.push('Enabled flag must be a boolean');
    }

    // Display order
    if (typeof planData.displayOrder !== 'number' || planData.displayOrder < 1) {
      errors.push('Display order must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Error validating plan data:', error);
    return {
      valid: false,
      errors: ['Validation error: ' + error.message]
    };
  }
};

// ===== EXPORT ALL HELPER FUNCTIONS =====
export default {
  getEnabledPlans,
  getPlanById,
  sortPlansByPrice,
  formatPlanFeatures,
  getPlanName,
  getPlanDescription,
  getPlanComparisonData,
  calculatePlanScore,
  getRecommendedPlan,
  filterPlansByCriteria,
  getTargetAudienceInfo,
  validatePlanData
};
