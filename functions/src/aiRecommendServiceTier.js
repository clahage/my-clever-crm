/**
 * AI RECOMMEND SERVICE TIER
 * Recommends optimal service tier based on credit profile
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.aiRecommendServiceTier = functions.https.onCall(async (data, context) => {
  const { contactId } = data;

  try {
    const contactDoc = await admin.firestore().collection('contacts').doc(contactId).get();
    if (!contactDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Contact not found');
    }

    const contact = contactDoc.data();
    const { creditScore = 0, negativeItemCount = 0, annualIncome = 0, hasBankruptcy = false } = contact;

    // Decision tree for tier recommendation
    let tier = 'standard';
    let reasoning = [];

    if (negativeItemCount >= 15 && annualIncome >= 80000) {
      tier = 'vip_elite';
      reasoning.push('15+ items with high income qualifies for VIP Elite');
    } else if ((negativeItemCount >= 10 || hasBankruptcy) && annualIncome >= 60000) {
      tier = 'premium';
      reasoning.push('Complex case with good income - Premium tier recommended');
    } else if (negativeItemCount >= 6 && annualIncome >= 40000) {
      tier = 'acceleration';
      reasoning.push('Moderate complexity - Acceleration tier fits well');
    } else if (negativeItemCount >= 3) {
      tier = 'standard';
      reasoning.push('Typical credit repair needs - Standard tier is perfect');
    } else {
      tier = 'diy';
      reasoning.push('Few items - DIY tier is cost-effective');
    }

    // Get tier details
    const tierConfig = await getTierConfig(tier);

    return {
      success: true,
      recommendedTier: tier,
      tierName: tierConfig.name,
      pricing: tierConfig.pricing,
      reasoning: reasoning.join('. '),
      features: tierConfig.features
    };

  } catch (error) {
    console.error('[aiRecommendServiceTier] Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

async function getTierConfig(tier) {
  const configs = {
    'diy': {name: 'DIY Credit Builder', pricing: {monthly: 49}, features: ['Self-service tools', 'Templates', 'Videos']},
    'standard': {name: 'Standard', pricing: {fixed: 179, performance: {base: 129, perItem: 25}}, features: ['Full service', 'Unlimited disputes', 'Monthly monitoring']},
    'acceleration': {name: 'Acceleration', pricing: {fixed: 249, performance: {base: 169, perItem: 20}}, features: ['Priority service', 'Faster results', 'Direct support']},
    'premium': {name: 'Premium', pricing: {fixed: 349, performance: {base: 249, perItem: 15}}, features: ['White-glove service', 'Monthly calls', 'Advanced techniques']},
    'vip_elite': {name: 'VIP Elite', pricing: {monthly: 599}, features: ['Concierge service', 'Bi-weekly calls', 'Attorney consultation']}
  };

  return configs[tier] || configs.standard;
}
