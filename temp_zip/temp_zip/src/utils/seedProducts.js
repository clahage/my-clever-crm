// src/utils/seedProducts.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SAMPLE_PRODUCTS = [
  {
    name: 'Credit Repair - Bronze',
    description: 'Entry-level credit repair service with essential dispute tools and monthly credit monitoring.',
    shortDescription: 'Essential credit repair with 3 disputes/month',
    category: 'credit-repair',
    tier: 'bronze',
    tags: ['credit', 'repair', 'bronze', 'basic', 'disputes'],
    pricing: {
      type: 'recurring',
      basePrice: 79,
      billingInterval: 'monthly',
      currency: 'USD'
    },
    features: [
      'Up to 3 dispute letters per month',
      'Single bureau monitoring',
      'Email support (48hr response)',
      'Basic credit education',
      'Monthly progress reports'
    ],
    availability: { status: 'active', featured: false, bestseller: false },
    analytics: { views: 150, purchases: 23, revenue: 1817, conversionRate: 15.3 }
  },
  {
    name: 'Credit Repair - Silver',
    description: 'Most popular plan with enhanced features, faster support, and dual bureau monitoring for optimal results.',
    shortDescription: 'Enhanced credit repair with 7 disputes/month',
    category: 'credit-repair',
    tier: 'silver',
    tags: ['credit', 'repair', 'silver', 'popular', 'dual-bureau'],
    pricing: {
      type: 'recurring',
      basePrice: 129,
      billingInterval: 'monthly',
      currency: 'USD'
    },
    features: [
      'Up to 7 dispute letters per month',
      'Dual bureau monitoring',
      'Priority email support (24hr response)',
      'Credit score simulator',
      'Weekly progress updates',
      'Goodwill letter assistance'
    ],
    availability: { status: 'active', featured: true, bestseller: true },
    analytics: { views: 420, purchases: 87, revenue: 11223, conversionRate: 20.7 }
  },
  {
    name: 'Credit Repair - Gold',
    description: 'Premium credit repair with unlimited disputes, all 3 bureaus, and phone support for serious credit improvement.',
    shortDescription: 'Premium with unlimited disputes & 3 bureaus',
    category: 'credit-repair',
    tier: 'gold',
    tags: ['credit', 'repair', 'gold', 'premium', 'unlimited'],
    pricing: {
      type: 'recurring',
      basePrice: 199,
      billingInterval: 'monthly',
      currency: 'USD'
    },
    features: [
      'Unlimited dispute letters',
      'All 3 bureaus monitoring',
      'Phone + email support (12hr response)',
      'Advanced score simulator',
      'Daily progress tracking',
      'Goodwill & validation letters',
      'Credit building recommendations',
      'Identity theft protection'
    ],
    availability: { status: 'active', featured: true, bestseller: false },
    analytics: { views: 310, purchases: 54, revenue: 10746, conversionRate: 17.4 }
  },
  {
    name: 'Credit Repair - Platinum',
    description: 'Elite VIP service with dedicated account manager, priority processing, and comprehensive financial coaching.',
    shortDescription: 'VIP service with dedicated account manager',
    category: 'credit-repair',
    tier: 'platinum',
    tags: ['credit', 'repair', 'platinum', 'vip', 'dedicated'],
    pricing: {
      type: 'recurring',
      basePrice: 299,
      billingInterval: 'monthly',
      currency: 'USD'
    },
    features: [
      'Everything in Gold, plus:',
      'Dedicated account manager',
      'VIP support (4hr response)',
      'Quarterly strategy sessions',
      'Business credit building',
      'Credit card recommendations',
      'Personalized financial coaching',
      'Priority dispute processing',
      'Legal consultation access'
    ],
    availability: { status: 'active', featured: true, bestseller: false },
    analytics: { views: 180, purchases: 31, revenue: 9269, conversionRate: 17.2 }
  },
  {
    name: '30-Minute Credit Consultation',
    description: 'Quick expert consultation to review your credit report and get actionable recommendations.',
    shortDescription: 'Expert credit review & recommendations',
    category: 'consultation',
    tags: ['consultation', 'expert', 'quick', 'review'],
    pricing: {
      type: 'one-time',
      basePrice: 49,
      currency: 'USD'
    },
    features: [
      'Basic credit report review',
      'General recommendations',
      'Q&A session',
      'Written summary'
    ],
    availability: { status: 'active', featured: false, bestseller: false },
    analytics: { views: 230, purchases: 45, revenue: 2205, conversionRate: 19.6 }
  },
  {
    name: '60-Minute Deep Dive Consultation',
    description: 'Comprehensive analysis with detailed action plan and follow-up support for serious credit improvement.',
    shortDescription: 'Comprehensive analysis with action plan',
    category: 'consultation',
    tags: ['consultation', 'deep-dive', 'comprehensive', 'action-plan'],
    pricing: {
      type: 'one-time',
      basePrice: 99,
      currency: 'USD'
    },
    features: [
      'Comprehensive report analysis',
      'Detailed action plan',
      'Priority recommendations',
      'Follow-up email support (7 days)',
      'Custom strategy document'
    ],
    availability: { status: 'active', featured: true, bestseller: true },
    analytics: { views: 290, purchases: 68, revenue: 6732, conversionRate: 23.4 }
  },
  {
    name: 'Quick Credit Analysis',
    description: 'Automated credit report scan with issue identification and priority ranking delivered in 24-48 hours.',
    shortDescription: 'Fast automated credit report scan',
    category: 'analysis',
    tags: ['analysis', 'quick', 'automated', 'report'],
    pricing: {
      type: 'one-time',
      basePrice: 39,
      currency: 'USD'
    },
    features: [
      'Automated report scan',
      'Basic issue identification',
      'Priority ranking',
      '24-48hr delivery'
    ],
    availability: { status: 'active', featured: false, bestseller: false },
    analytics: { views: 340, purchases: 89, revenue: 3471, conversionRate: 26.2 }
  },
  {
    name: 'Comprehensive Credit Analysis',
    description: 'Manual expert review with detailed breakdown, custom strategies, and one revision included.',
    shortDescription: 'Expert manual review with custom strategies',
    category: 'analysis',
    tags: ['analysis', 'comprehensive', 'expert', 'manual'],
    pricing: {
      type: 'one-time',
      basePrice: 79,
      currency: 'USD'
    },
    features: [
      'Manual expert review',
      'Detailed issue breakdown',
      'Step-by-step action plan',
      'Custom dispute strategies',
      '3-5 day delivery',
      'One revision included'
    ],
    availability: { status: 'active', featured: true, bestseller: true },
    analytics: { views: 270, purchases: 61, revenue: 4819, conversionRate: 22.6 }
  },
  {
    name: 'Credit Building Starter Kit',
    description: 'Complete package with credit builder account, secured card guidance, and monitoring tools.',
    shortDescription: 'Everything you need to start building credit',
    category: 'add-on',
    tags: ['credit-building', 'starter', 'secured-card', 'monitoring'],
    pricing: {
      type: 'one-time',
      basePrice: 29,
      currency: 'USD'
    },
    features: [
      'Credit builder account setup',
      'Secured card recommendations',
      '3-month monitoring',
      'Credit building guide'
    ],
    availability: { status: 'active', featured: false, bestseller: false },
    analytics: { views: 190, purchases: 52, revenue: 1508, conversionRate: 27.4 }
  },
  {
    name: 'Complete Credit Repair Package',
    description: 'Ultimate bundle: Gold tier service + consultation + analysis. Save $127 with this comprehensive package.',
    shortDescription: 'Gold service + consultation + analysis',
    category: 'bundle',
    tags: ['bundle', 'package', 'complete', 'savings'],
    pricing: {
      type: 'one-time',
      basePrice: 250,
      originalPrice: 377,
      savings: 127,
      savingsPercent: '34',
      currency: 'USD'
    },
    features: [
      'Credit Repair - Gold (1 month)',
      '60-Minute Deep Dive Consultation',
      'Comprehensive Credit Analysis',
      'Priority support',
      'Save $127 vs. buying separately'
    ],
    availability: { status: 'active', featured: true, bestseller: false },
    analytics: { views: 160, purchases: 28, revenue: 7000, conversionRate: 17.5 }
  },
  {
    name: 'Dispute Letter Templates - Pro Pack',
    description: 'Professional dispute letter templates covering all major credit issues with customization guide.',
    shortDescription: 'Professional templates for all dispute types',
    category: 'add-on',
    tags: ['templates', 'disputes', 'letters', 'diy'],
    pricing: {
      type: 'one-time',
      basePrice: 19,
      currency: 'USD'
    },
    features: [
      '15+ professional templates',
      'All major dispute types',
      'Customization guide',
      'Instant download',
      'Lifetime access'
    ],
    availability: { status: 'active', featured: false, bestseller: true },
    analytics: { views: 510, purchases: 143, revenue: 2717, conversionRate: 28.0 }
  },
  {
    name: 'Credit Monitoring - Annual Plan',
    description: 'Full year of comprehensive credit monitoring across all 3 bureaus with instant alerts and score tracking.',
    shortDescription: 'Year-long monitoring for all 3 bureaus',
    category: 'add-on',
    tags: ['monitoring', 'annual', 'alerts', 'tracking'],
    pricing: {
      type: 'one-time',
      basePrice: 89,
      currency: 'USD'
    },
    features: [
      'All 3 bureaus monitoring',
      'Instant alerts',
      'Score tracking & trends',
      'Identity theft protection',
      'Monthly reports',
      '12-month access'
    ],
    availability: { status: 'active', featured: true, bestseller: false },
    analytics: { views: 220, purchases: 47, revenue: 4183, conversionRate: 21.4 }
  }
];

export async function seedCreditRepairProducts(userId) {
  const results = { success: [], errors: [] };

  for (const product of SAMPLE_PRODUCTS) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      results.success.push({ id: docRef.id, name: product.name });
    } catch (error) {
      console.error(`Error adding ${product.name}:`, error);
      results.errors.push({ name: product.name, error: error.message });
    }
  }

  return results;
}