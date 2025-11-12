// src/services/affiliateLinkService.js
// Affiliate Product Matching & Revenue Tracking Service
// This is your money maker! 💰

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

export const CATEGORIES = {
  CREDIT_CARDS: 'creditCards',
  PERSONAL_LOANS: 'personalLoans',
  CREDIT_MONITORING: 'creditMonitoring',
  CREDIT_BUILDER: 'creditBuilder',
  MORTGAGE: 'mortgage',
  AUTO: 'auto',
  BUSINESS: 'business',
  EDUCATION: 'education',
  IDENTITY: 'identity'
};

export const CATEGORY_LABELS = {
  [CATEGORIES.CREDIT_CARDS]: 'Credit Building Cards',
  [CATEGORIES.PERSONAL_LOANS]: 'Debt Consolidation',
  [CATEGORIES.CREDIT_MONITORING]: 'Credit Monitoring',
  [CATEGORIES.CREDIT_BUILDER]: 'Credit Builder Loans',
  [CATEGORIES.MORTGAGE]: 'Mortgage Pre-Qualification',
  [CATEGORIES.AUTO]: 'Auto Refinancing',
  [CATEGORIES.BUSINESS]: 'Business Credit',
  [CATEGORIES.EDUCATION]: 'Financial Education',
  [CATEGORIES.IDENTITY]: 'Identity Protection'
};

// ============================================================================
// AFFILIATE PRODUCT DATABASE
// ============================================================================

/**
 * Default affiliate products
 * Replace affiliateUrl with your actual affiliate links when you get them
 */
const AFFILIATE_PRODUCTS = [
  // Credit Cards
  {
    id: 'secured-card-1',
    category: CATEGORIES.CREDIT_CARDS,
    title: 'Secured Credit Card',
    description: 'Build credit with a low deposit. Perfect for rebuilding or establishing credit.',
    provider: 'Major Bank',
    affiliateUrl: null, // Add your affiliate link here
    placeholder: true,
    cta: 'Apply Now',
    minScore: 300,
    maxScore: 650,
    relevanceFactors: ['low_score', 'rebuilding', 'first_card'],
    commission: 50,
    commissionType: 'per_approval',
    tags: ['secured', 'beginner', 'credit-building']
  },
  {
    id: 'rewards-card-1',
    category: CATEGORIES.CREDIT_CARDS,
    title: 'Cash Back Credit Card',
    description: 'Earn rewards while building credit. For good to excellent credit.',
    provider: 'Major Bank',
    affiliateUrl: null,
    placeholder: true,
    cta: 'Check Offers',
    minScore: 670,
    maxScore: 850,
    relevanceFactors: ['good_score', 'rewards', 'established_credit'],
    commission: 75,
    commissionType: 'per_approval',
    tags: ['rewards', 'cash-back', 'good-credit']
  },

  // Personal Loans
  {
    id: 'debt-consolidation-1',
    category: CATEGORIES.PERSONAL_LOANS,
    title: 'Debt Consolidation Loan',
    description: 'Consolidate high-interest debt into one manageable payment. Save on interest.',
    provider: 'Lending Partner',
    affiliateUrl: null,
    placeholder: true,
    cta: 'Get Your Rate',
    minScore: 580,
    maxScore: 850,
    relevanceFactors: ['high_utilization', 'multiple_accounts', 'high_balances'],
    commission: 100,
    commissionType: 'per_funded_loan',
    tags: ['consolidation', 'debt-payoff', 'lower-rate']
  },

  // Credit Monitoring
  {
    id: 'monitoring-service-1',
    category: CATEGORIES.CREDIT_MONITORING,
    title: 'Credit Monitoring Service',
    description: 'Monitor all 3 bureaus daily. Get alerts on changes and identity theft protection.',
    provider: 'Monitoring Service',
    affiliateUrl: null,
    placeholder: true,
    cta: 'Start Free Trial',
    minScore: 300,
    maxScore: 850,
    relevanceFactors: ['all_clients', 'monitoring_needed'],
    commission: 25,
    commissionType: 'recurring_monthly',
    tags: ['monitoring', 'alerts', 'identity-protection']
  },

  // Credit Builder Loans
  {
    id: 'credit-builder-1',
    category: CATEGORIES.CREDIT_BUILDER,
    title: 'Credit Builder Loan',
    description: 'Small loan designed to build credit. Funds released after payments completed.',
    provider: 'Credit Union',
    affiliateUrl: null,
    placeholder: true,
    cta: 'Learn More',
    minScore: 300,
    maxScore: 650,
    relevanceFactors: ['thin_file', 'low_score', 'rebuilding'],
    commission: 35,
    commissionType: 'per_loan',
    tags: ['credit-building', 'small-loan', 'beginner']
  },

  // Mortgage
  {
    id: 'mortgage-prequalify-1',
    category: CATEGORIES.MORTGAGE,
    title: 'Mortgage Pre-Qualification',
    description: 'See if you qualify for a mortgage. Soft pull, no impact on credit score.',
    provider: 'Mortgage Lender',
    affiliateUrl: null,
    placeholder: true,
    cta: 'Get Pre-Qualified',
    minScore: 620,
    maxScore: 850,
    relevanceFactors: ['goal_house', 'good_score', 'stable_income'],
    commission: 200,
    commissionType: 'per_funded_loan',
    tags: ['mortgage', 'home-buying', 'prequalification']
  },

  // Auto Loans
  {
    id: 'auto-refi-1',
    category: CATEGORIES.AUTO,
    title: 'Auto Loan Refinancing',
    description: 'Lower your monthly car payment. Refinance to a better rate.',
    provider: 'Auto Lender',
    affiliateUrl: null,
    placeholder: true,
    cta: 'Check Your Rate',
    minScore: 600,
    maxScore: 850,
    relevanceFactors: ['goal_car', 'existing_auto_loan', 'good_payment_history'],
    commission: 150,
    commissionType: 'per_funded_loan',
    tags: ['auto', 'refinancing', 'lower-payment']
  },

  // Business Credit
  {
    id: 'business-credit-1',
    category: CATEGORIES.BUSINESS,
    title: 'Business Credit Card',
    description: 'Separate business expenses. Build business credit without personal guarantee.',
    provider: 'Business Bank',
    affiliateUrl: null,
    placeholder: true,
    cta: 'Apply Now',
    minScore: 650,
    maxScore: 850,
    relevanceFactors: ['business_owner', 'good_personal_credit'],
    commission: 100,
    commissionType: 'per_approval',
    tags: ['business', 'credit-card', 'no-personal-guarantee']
  },

  // Financial Education
  {
    id: 'credit-course-1',
    category: CATEGORIES.EDUCATION,
    title: 'Credit Mastery Course',
    description: 'Learn how to build and maintain excellent credit. Step-by-step video course.',
    provider: 'Education Platform',
    affiliateUrl: null,
    placeholder: true,
    cta: 'Enroll Now',
    minScore: 300,
    maxScore: 850,
    relevanceFactors: ['all_clients', 'education_needed'],
    commission: 30,
    commissionType: 'per_sale',
    tags: ['education', 'course', 'credit-knowledge']
  },

  // Identity Protection
  {
    id: 'identity-protection-1',
    category: CATEGORIES.IDENTITY,
    title: 'Identity Theft Protection',
    description: 'Protect yourself from identity theft. $1M insurance and recovery services.',
    provider: 'Security Company',
    affiliateUrl: null,
    placeholder: true,
    cta: 'Get Protected',
    minScore: 300,
    maxScore: 850,
    relevanceFactors: ['all_clients', 'recent_inquiries', 'security_concern'],
    commission: 40,
    commissionType: 'recurring_monthly',
    tags: ['identity', 'protection', 'insurance']
  }
];

// ============================================================================
// PRODUCT SUGGESTION ENGINE
// ============================================================================

/**
 * Suggest affiliate products based on client profile
 * This is smart matching - shows most relevant products first
 * 
 * @param {object} clientProfile - Client info and goals
 * @param {object} reportAnalysis - Credit report analysis
 * @returns {array} Suggested products with relevance scores
 */
export async function suggestProducts(clientProfile, reportAnalysis) {
  console.log('💡 Suggesting affiliate products for:', clientProfile.email);

  try {
    const score = clientProfile.score || 650;
    const goals = clientProfile.goals || {};
    const profile = reportAnalysis || {};

    // Score each product for relevance
    const scoredProducts = AFFILIATE_PRODUCTS.map(product => {
      const relevanceScore = calculateRelevance(product, score, goals, profile);
      
      return {
        ...product,
        relevanceScore,
        matchReasons: getMatchReasons(product, score, goals, profile)
      };
    });

    // Sort by relevance (highest first)
    const sorted = scoredProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Return top 5 most relevant
    const topSuggestions = sorted.slice(0, 5);

    console.log(`✅ Generated ${topSuggestions.length} product suggestions`);
    
    return topSuggestions.map(product => ({
      id: product.id,
      category: product.category,
      categoryLabel: CATEGORY_LABELS[product.category],
      title: product.title,
      description: product.description,
      provider: product.provider,
      affiliateUrl: product.affiliateUrl,
      placeholder: product.placeholder,
      placeholderText: product.placeholder 
        ? 'Coming Soon - We\'re partnering with top providers for this service'
        : null,
      cta: product.cta,
      relevanceScore: product.relevanceScore,
      matchReasons: product.matchReasons,
      commission: product.commission,
      commissionType: product.commissionType
    }));

  } catch (error) {
    console.error('❌ Error suggesting products:', error);
    return [];
  }
}

/**
 * Calculate relevance score for a product (0-100)
 */
function calculateRelevance(product, score, goals, profile) {
  let relevance = 50; // Base score

  // Score range match
  if (score >= product.minScore && score <= product.maxScore) {
    relevance += 20;
  } else if (score < product.minScore) {
    relevance -= 30; // Too low for this product
  } else {
    relevance -= 10; // Score too high, might not need this
  }

  // Goal matching
  if (goals?.primary === 'house' && product.category === CATEGORIES.MORTGAGE) {
    relevance += 30;
  }
  if (goals?.primary === 'car' && product.category === CATEGORIES.AUTO) {
    relevance += 30;
  }
  if (goals?.primary === 'business' && product.category === CATEGORIES.BUSINESS) {
    relevance += 30;
  }

  // Profile-based relevance
  if (profile.utilization > 70 && product.category === CATEGORIES.PERSONAL_LOANS) {
    relevance += 20; // High utilization = consolidation might help
  }

  if ((profile.negativeItems?.length || 0) > 5 && product.category === CATEGORIES.CREDIT_BUILDER) {
    relevance += 15; // Many negatives = needs credit building
  }

  if ((profile.positiveItems?.length || 0) < 3 && product.category === CATEGORIES.CREDIT_CARDS) {
    relevance += 15; // Few positive accounts = needs more tradelines
  }

  if (score < 600 && product.category === CATEGORIES.EDUCATION) {
    relevance += 10; // Low score = needs education
  }

  // Always relevant categories
  if (product.category === CATEGORIES.CREDIT_MONITORING || 
      product.category === CATEGORIES.IDENTITY) {
    relevance += 10; // Everyone should monitor
  }

  return Math.max(0, Math.min(100, relevance));
}

/**
 * Get human-readable match reasons
 */
function getMatchReasons(product, score, goals, profile) {
  const reasons = [];

  if (score >= product.minScore && score <= product.maxScore) {
    reasons.push('Matches your credit score range');
  }

  if (goals?.primary === 'house' && product.category === CATEGORIES.MORTGAGE) {
    reasons.push('Aligned with your home buying goal');
  }

  if (goals?.primary === 'car' && product.category === CATEGORIES.AUTO) {
    reasons.push('Aligned with your car buying goal');
  }

  if (profile.utilization > 70 && product.category === CATEGORIES.PERSONAL_LOANS) {
    reasons.push('Could help lower high credit utilization');
  }

  if ((profile.negativeItems?.length || 0) > 5 && product.category === CATEGORIES.CREDIT_BUILDER) {
    reasons.push('Helps rebuild credit with negative history');
  }

  if (product.category === CATEGORIES.CREDIT_MONITORING) {
    reasons.push('Essential for tracking progress');
  }

  if (reasons.length === 0) {
    reasons.push('Recommended for credit improvement');
  }

  return reasons;
}

// ============================================================================
// CLICK TRACKING
// ============================================================================

/**
 * Track when a client clicks an affiliate link
 * This is how you calculate your revenue!
 */
export async function trackClick(linkId, clientEmail, clientId = null) {
  console.log('🔗 Tracking affiliate click:', linkId, 'for', clientEmail);

  try {
    const product = AFFILIATE_PRODUCTS.find(p => p.id === linkId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Save click to Firestore
    const clickData = {
      linkId,
      productTitle: product.title,
      category: product.category,
      clientEmail,
      clientId,
      clickedAt: new Date().toISOString(),
      affiliateUrl: product.affiliateUrl,
      placeholder: product.placeholder,
      converted: false,
      conversionDate: null,
      commission: product.commission,
      commissionType: product.commissionType,
      revenue: 0
    };

    const docRef = await addDoc(collection(db, 'affiliateClicks'), clickData);

    console.log('✅ Click tracked:', docRef.id);

    return {
      success: true,
      clickId: docRef.id
    };

  } catch (error) {
    console.error('❌ Error tracking click:', error);
    throw error;
  }
}

/**
 * Mark a click as converted (they signed up/purchased)
 * Call this when you get confirmation from affiliate network
 */
export async function markConversion(clickId, revenue = 0) {
  try {
    const docRef = doc(db, 'affiliateClicks', clickId);

    await updateDoc(docRef, {
      converted: true,
      conversionDate: new Date().toISOString(),
      revenue: revenue,
      updatedAt: new Date().toISOString()
    });

    console.log('💰 Conversion tracked:', clickId, 'Revenue:', revenue);

    return {
      success: true,
      revenue
    };

  } catch (error) {
    console.error('❌ Error marking conversion:', error);
    throw error;
  }
}

// ============================================================================
// REVENUE REPORTING
// ============================================================================

/**
 * Get revenue statistics
 * See how much money you're making!
 */
export async function getRevenueStats(startDate = null, endDate = null) {
  try {
    let q = collection(db, 'affiliateClicks');

    // Add date filters if provided
    if (startDate) {
      q = query(q, where('clickedAt', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('clickedAt', '<=', endDate));
    }

    const snapshot = await getDocs(q);
    const clicks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate stats
    const totalClicks = clicks.length;
    const conversions = clicks.filter(c => c.converted);
    const totalConversions = conversions.length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(1) : 0;
    const totalRevenue = conversions.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const averageRevenue = totalConversions > 0 ? (totalRevenue / totalConversions).toFixed(2) : 0;

    // Revenue by category
    const revenueByCategory = {};
    conversions.forEach(c => {
      if (!revenueByCategory[c.category]) {
        revenueByCategory[c.category] = 0;
      }
      revenueByCategory[c.category] += c.revenue || 0;
    });

    // Top performing products
    const productPerformance = {};
    clicks.forEach(c => {
      if (!productPerformance[c.linkId]) {
        productPerformance[c.linkId] = {
          title: c.productTitle,
          clicks: 0,
          conversions: 0,
          revenue: 0
        };
      }
      productPerformance[c.linkId].clicks++;
      if (c.converted) {
        productPerformance[c.linkId].conversions++;
        productPerformance[c.linkId].revenue += c.revenue || 0;
      }
    });

    const topProducts = Object.entries(productPerformance)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      summary: {
        totalClicks,
        totalConversions,
        conversionRate: parseFloat(conversionRate),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageRevenue: parseFloat(averageRevenue)
      },
      revenueByCategory,
      topProducts,
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Now'
      }
    };

  } catch (error) {
    console.error('❌ Error getting revenue stats:', error);
    throw error;
  }
}

/**
 * Get clicks for a specific client
 */
export async function getClientClicks(clientEmail) {
  try {
    const q = query(
      collection(db, 'affiliateClicks'),
      where('clientEmail', '==', clientEmail)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('❌ Error getting client clicks:', error);
    throw error;
  }
}

// ============================================================================
// PRODUCT MANAGEMENT
// ============================================================================

/**
 * Add a new affiliate product
 * Call this when you get a new affiliate partnership
 */
export async function addAffiliateProduct(productData) {
  try {
    // Validate required fields
    if (!productData.title || !productData.category) {
      throw new Error('Missing required fields');
    }

    const newProduct = {
      id: productData.id || `product-${Date.now()}`,
      category: productData.category,
      title: productData.title,
      description: productData.description,
      provider: productData.provider,
      affiliateUrl: productData.affiliateUrl || null,
      placeholder: !productData.affiliateUrl,
      cta: productData.cta || 'Learn More',
      minScore: productData.minScore || 300,
      maxScore: productData.maxScore || 850,
      relevanceFactors: productData.relevanceFactors || [],
      commission: productData.commission || 0,
      commissionType: productData.commissionType || 'per_sale',
      tags: productData.tags || [],
      active: true,
      createdAt: new Date().toISOString()
    };

    // In production, you'd store this in Firestore
    // For now, it's in the AFFILIATE_PRODUCTS array
    AFFILIATE_PRODUCTS.push(newProduct);

    console.log('✅ Affiliate product added:', newProduct.id);

    return {
      success: true,
      productId: newProduct.id
    };

  } catch (error) {
    console.error('❌ Error adding affiliate product:', error);
    throw error;
  }
}

/**
 * Update affiliate product (e.g., add real affiliate link)
 */
export async function updateAffiliateProduct(productId, updates) {
  try {
    const productIndex = AFFILIATE_PRODUCTS.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    // Update the product
    AFFILIATE_PRODUCTS[productIndex] = {
      ...AFFILIATE_PRODUCTS[productIndex],
      ...updates,
      placeholder: !updates.affiliateUrl, // Auto-update placeholder status
      updatedAt: new Date().toISOString()
    };

    console.log('✅ Affiliate product updated:', productId);

    return {
      success: true,
      product: AFFILIATE_PRODUCTS[productIndex]
    };

  } catch (error) {
    console.error('❌ Error updating affiliate product:', error);
    throw error;
  }
}

/**
 * Get all affiliate products
 */
export function getAllProducts() {
  return AFFILIATE_PRODUCTS.map(product => ({
    ...product,
    categoryLabel: CATEGORY_LABELS[product.category]
  }));
}

/**
 * Get products by category
 */
export function getProductsByCategory(category) {
  return AFFILIATE_PRODUCTS
    .filter(p => p.category === category)
    .map(product => ({
      ...product,
      categoryLabel: CATEGORY_LABELS[product.category]
    }));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  suggestProducts,
  trackClick,
  markConversion,
  getRevenueStats,
  getClientClicks,
  addAffiliateProduct,
  updateAffiliateProduct,
  getAllProducts,
  getProductsByCategory,
  CATEGORIES,
  CATEGORY_LABELS
};