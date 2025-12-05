/**
 * AI EMAIL WRITER & OPTIMIZER
 *
 * Purpose:
 * Writes and optimizes email templates using AI to maximize open rates,
 * click rates, and conversions while maintaining compliance.
 *
 * What It Does:
 * - Generates complete email templates from brief descriptions
 * - Optimizes subject lines for higher open rates
 * - Improves email body content for engagement
 * - Enhances calls-to-action (CTAs) for more clicks
 * - A/B tests different versions
 * - Ensures CAN-SPAM and compliance
 * - Personalizes content based on contact data
 * - Analyzes tone and readability
 * - Suggests improvements with data-backed reasoning
 *
 * Why It's Important:
 * - Email is the #1 conversion channel for credit repair
 * - Subject line determines if email gets opened (25% vs 5% = 5x difference)
 * - CTA placement/wording impacts clicks (15% vs 2% = 7.5x difference)
 * - Poor emails hurt deliverability (spam folder = 0% conversion)
 * - Professional copy builds trust and credibility
 * - Christopher doesn't need to be a copywriter
 *
 * Key Metrics Optimized:
 * - Open Rate (industry average: 25%, excellent: 35%+)
 * - Click Rate (industry average: 5%, excellent: 15%+)
 * - Reply Rate (industry average: 2%, excellent: 8%+)
 * - Conversion Rate (email → client)
 * - Deliverability (inbox vs spam)
 *
 * Example Use Cases:
 * - "Write a welcome email for new Standard tier clients"
 * - "Optimize this subject line to increase open rate"
 * - "Make the CTA more compelling"
 * - "This email sounds too salesy, make it more helpful"
 * - "Create 3 variants for A/B testing"
 *
 * Created: 2025-12-05
 * Part of: Speedy Credit Repair AI Workflow System
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// EMAIL OPTIMIZATION CRITERIA
// ============================================================================

/**
 * Best practices for credit repair emails
 */
const EMAIL_BEST_PRACTICES = {
  subjectLine: {
    maxLength: 50,              // Optimal: 41-50 characters
    minLength: 20,              // Too short looks spammy
    avoidWords: [               // Spam trigger words
      'free', 'guarantee', 'act now', 'limited time',
      'click here', 'urgent', '!!!', '$$$'
    ],
    personalizeWith: [
      '{{firstName}}',
      '{{creditScore}}',
      '{{negativeItemCount}}'
    ],
    urgencyWords: [             // Good urgency (not spammy)
      'today', 'now', 'ready', 'waiting'
    ],
    curiosityWords: [
      'discover', 'revealed', 'insider', 'secret'
    ]
  },

  body: {
    maxParagraphLength: 3,      // Max 3 sentences per paragraph
    readingLevel: 8,            // 8th grade reading level (accessible)
    minPersonalization: 2,      // At least 2 personalized fields
    maxLinks: 3,                // Too many links = spam
    requireUnsubscribe: true,   // CAN-SPAM compliance
    requirePhysicalAddress: true
  },

  cta: {
    maxPerEmail: 2,             // One primary, one secondary
    minTextLength: 15,          // "Click here" is weak
    maxTextLength: 40,
    actionWords: [              // Strong action verbs
      'Get', 'Start', 'Claim', 'Discover', 'Unlock',
      'Access', 'Download', 'Schedule', 'Reserve'
    ],
    avoidWords: [
      'Click here', 'Learn more', 'Read more'
    ]
  },

  tone: {
    professional: true,
    helpful: true,
    notSalesy: true,
    empathetic: true,
    trustworthy: true
  }
};

/**
 * Scoring rubric for email quality
 */
const EMAIL_SCORING_RUBRIC = {
  subjectLine: {
    weight: 35,                 // 35% of total score
    factors: {
      length: 8,
      personalization: 10,
      curiosity: 7,
      noSpamWords: 10
    }
  },
  body: {
    weight: 40,                 // 40% of total score
    factors: {
      readability: 10,
      personalization: 10,
      valueProposition: 10,
      structure: 10
    }
  },
  cta: {
    weight: 20,                 // 20% of total score
    factors: {
      clarity: 7,
      actionOriented: 7,
      placement: 6
    }
  },
  compliance: {
    weight: 5,                  // 5% of total score (critical but binary)
    factors: {
      unsubscribeLink: 2.5,
      physicalAddress: 2.5
    }
  }
};

// ============================================================================
// MAIN EMAIL OPTIMIZER CLASS
// ============================================================================

export class EmailOptimizer {
  constructor() {
    this.templates = new Map();
  }

  // --------------------------------------------------------------------------
  // EMAIL GENERATION
  // --------------------------------------------------------------------------

  /**
   * Generates a complete email template from a description
   *
   * @param {Object} options - Generation options
   * @param {string} options.purpose - What the email should accomplish
   * @param {string} options.audience - Who receives it (e.g., "new Standard tier clients")
   * @param {string} options.tone - Desired tone (professional, friendly, urgent)
   * @param {Array} options.keyPoints - Main points to include
   * @param {string} options.cta - Desired call-to-action
   *
   * @returns {Object} Generated email template
   */
  async generateEmail(options) {
    const {
      purpose,
      audience,
      tone = 'professional and helpful',
      keyPoints = [],
      cta = 'Schedule a consultation'
    } = options;

    console.log(`[EmailOptimizer] Generating email for: ${purpose}`);

    try {
      const generateEmailAI = httpsCallable(functions, 'aiGenerateEmail');

      const result = await generateEmailAI({
        purpose,
        audience,
        tone,
        keyPoints,
        cta,
        companyInfo: {
          name: 'Speedy Credit Repair',
          owner: 'Christopher',
          staff: ['Laurie']
        },
        bestPractices: EMAIL_BEST_PRACTICES
      });

      const emailTemplate = result.data;

      // Score the generated email
      const score = await this.scoreEmail(emailTemplate);

      return {
        ...emailTemplate,
        score,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('[EmailOptimizer] Error generating email:', error);

      // Fallback: Generate basic template
      return this.generateBasicTemplate(options);
    }
  }

  /**
   * Fallback basic template generator
   */
  generateBasicTemplate(options) {
    const { purpose, audience, cta } = options;

    return {
      subject: `Important Update from Speedy Credit Repair`,
      body: `Hi {{firstName}},\n\nThank you for choosing Speedy Credit Repair.\n\n${purpose}\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nChristopher\nSpeedy Credit Repair`,
      cta: {
        text: cta,
        url: '{{ctaUrl}}'
      },
      personalizationFields: ['firstName', 'ctaUrl'],
      footer: this.getStandardFooter()
    };
  }

  // --------------------------------------------------------------------------
  // EMAIL OPTIMIZATION
  // --------------------------------------------------------------------------

  /**
   * Optimizes an existing email template
   *
   * @param {Object} email - Email template to optimize
   * @param {Object} options - Optimization options
   * @param {Array} options.focusAreas - What to optimize (subject, body, cta, all)
   * @param {Object} options.performanceData - Historical performance data
   *
   * @returns {Object} Optimized email with suggestions
   */
  async optimizeEmail(email, options = {}) {
    const {
      focusAreas = ['all'],
      performanceData = null
    } = options;

    console.log(`[EmailOptimizer] Optimizing email: ${email.subject}`);

    // Score current email
    const currentScore = await this.scoreEmail(email);

    // Identify improvement opportunities
    const opportunities = this.identifyImprovements(email, currentScore);

    // Generate optimized version
    const optimized = await this.applyOptimizations(email, opportunities, focusAreas);

    // Score optimized version
    const optimizedScore = await this.scoreEmail(optimized);

    return {
      original: {
        email,
        score: currentScore
      },
      optimized: {
        email: optimized,
        score: optimizedScore
      },
      improvements: opportunities,
      estimatedImpact: this.estimateImpact(currentScore, optimizedScore, performanceData)
    };
  }

  /**
   * Scores an email template (0-100)
   */
  async scoreEmail(email) {
    const scores = {
      total: 0,
      breakdown: {},
      issues: [],
      strengths: []
    };

    // Score subject line (35 points)
    const subjectScore = this.scoreSubjectLine(email.subject);
    scores.breakdown.subject = subjectScore;
    scores.total += (subjectScore.score / 100) * EMAIL_SCORING_RUBRIC.subjectLine.weight;

    // Score body (40 points)
    const bodyScore = this.scoreBody(email.body);
    scores.breakdown.body = bodyScore;
    scores.total += (bodyScore.score / 100) * EMAIL_SCORING_RUBRIC.body.weight;

    // Score CTA (20 points)
    const ctaScore = this.scoreCTA(email.cta);
    scores.breakdown.cta = ctaScore;
    scores.total += (ctaScore.score / 100) * EMAIL_SCORING_RUBRIC.cta.weight;

    // Score compliance (5 points)
    const complianceScore = this.scoreCompliance(email);
    scores.breakdown.compliance = complianceScore;
    scores.total += (complianceScore.score / 100) * EMAIL_SCORING_RUBRIC.compliance.weight;

    // Compile issues and strengths
    scores.issues = [
      ...subjectScore.issues,
      ...bodyScore.issues,
      ...ctaScore.issues,
      ...complianceScore.issues
    ];

    scores.strengths = [
      ...subjectScore.strengths,
      ...bodyScore.strengths,
      ...ctaScore.strengths,
      ...complianceScore.strengths
    ];

    // Overall rating
    if (scores.total >= 85) scores.rating = 'Excellent';
    else if (scores.total >= 70) scores.rating = 'Good';
    else if (scores.total >= 55) scores.rating = 'Average';
    else scores.rating = 'Needs Improvement';

    return scores;
  }

  /**
   * Scores subject line
   */
  scoreSubjectLine(subject) {
    const score = { score: 0, issues: [], strengths: [] };

    if (!subject) {
      score.issues.push('Missing subject line');
      return score;
    }

    const length = subject.length;
    const lowerSubject = subject.toLowerCase();

    // Length check (8 points)
    if (length >= 41 && length <= 50) {
      score.score += 8;
      score.strengths.push('Subject length is optimal (41-50 characters)');
    } else if (length >= 30 && length <= 60) {
      score.score += 5;
    } else if (length < 20) {
      score.issues.push(`Subject too short (${length} chars) - aim for 41-50`);
      score.score += 1;
    } else {
      score.issues.push(`Subject too long (${length} chars) - aim for 41-50`);
      score.score += 3;
    }

    // Personalization check (10 points)
    const hasPersonalization = /\{\{[a-zA-Z]+\}\}/.test(subject);
    if (hasPersonalization) {
      score.score += 10;
      score.strengths.push('Subject line is personalized');
    } else {
      score.issues.push('Add personalization ({{firstName}}) to subject line');
    }

    // Spam words check (10 points)
    const spamWords = EMAIL_BEST_PRACTICES.subjectLine.avoidWords;
    const hasSpamWords = spamWords.some(word => lowerSubject.includes(word));

    if (!hasSpamWords) {
      score.score += 10;
      score.strengths.push('No spam trigger words detected');
    } else {
      const foundSpam = spamWords.filter(word => lowerSubject.includes(word));
      score.issues.push(`Contains spam words: ${foundSpam.join(', ')}`);
      score.score += 3;
    }

    // Curiosity/urgency check (7 points)
    const curiosityWords = EMAIL_BEST_PRACTICES.subjectLine.curiosityWords;
    const urgencyWords = EMAIL_BEST_PRACTICES.subjectLine.urgencyWords;

    const hasCuriosity = curiosityWords.some(word => lowerSubject.includes(word));
    const hasUrgency = urgencyWords.some(word => lowerSubject.includes(word));

    if (hasCuriosity || hasUrgency) {
      score.score += 7;
      score.strengths.push('Subject creates curiosity or urgency');
    } else {
      score.issues.push('Subject lacks curiosity or urgency hooks');
      score.score += 2;
    }

    return score;
  }

  /**
   * Scores email body
   */
  scoreBody(body) {
    const score = { score: 0, issues: [], strengths: [] };

    if (!body) {
      score.issues.push('Missing email body');
      return score;
    }

    // Readability check (10 points)
    const readingLevel = this.calculateReadingLevel(body);
    if (readingLevel >= 6 && readingLevel <= 10) {
      score.score += 10;
      score.strengths.push(`Reading level appropriate (grade ${readingLevel})`);
    } else if (readingLevel > 12) {
      score.issues.push(`Reading level too high (grade ${readingLevel}) - simplify language`);
      score.score += 4;
    } else {
      score.score += 7;
    }

    // Personalization check (10 points)
    const personalizations = body.match(/\{\{[a-zA-Z]+\}\}/g) || [];
    if (personalizations.length >= 2) {
      score.score += 10;
      score.strengths.push(`${personalizations.length} personalization fields used`);
    } else if (personalizations.length === 1) {
      score.score += 5;
      score.issues.push('Add more personalization (credit score, negative items, etc.)');
    } else {
      score.issues.push('No personalization - email feels generic');
      score.score += 0;
    }

    // Value proposition check (10 points)
    const hasValueWords = /\b(help|improve|fix|repair|increase|boost|remove|delete)\b/i.test(body);
    const hasBenefits = /\b(you'll|you can|you will|benefits|results|success)\b/i.test(body);

    if (hasValueWords && hasBenefits) {
      score.score += 10;
      score.strengths.push('Clear value proposition and benefits');
    } else if (hasValueWords || hasBenefits) {
      score.score += 5;
      score.issues.push('Value proposition could be stronger');
    } else {
      score.issues.push('Missing clear value proposition - explain benefits');
      score.score += 0;
    }

    // Structure check (10 points)
    const paragraphs = body.split('\n\n').filter(p => p.trim().length > 0);
    const avgParagraphLength = body.length / paragraphs.length;

    if (paragraphs.length >= 3 && avgParagraphLength < 400) {
      score.score += 10;
      score.strengths.push('Good structure with short paragraphs');
    } else if (paragraphs.length < 2) {
      score.issues.push('Add paragraph breaks for better readability');
      score.score += 4;
    } else if (avgParagraphLength > 600) {
      score.issues.push('Paragraphs too long - break into smaller chunks');
      score.score += 6;
    } else {
      score.score += 8;
    }

    return score;
  }

  /**
   * Scores call-to-action
   */
  scoreCTA(cta) {
    const score = { score: 0, issues: [], strengths: [] };

    if (!cta || !cta.text) {
      score.issues.push('Missing call-to-action');
      return score;
    }

    const ctaText = cta.text;
    const ctaLower = ctaText.toLowerCase();

    // Clarity check (7 points)
    if (ctaText.length >= 15 && ctaText.length <= 40) {
      score.score += 7;
      score.strengths.push('CTA length is optimal');
    } else if (ctaText.length < 15) {
      score.issues.push(`CTA too short ("${ctaText}") - be more descriptive`);
      score.score += 2;
    } else {
      score.issues.push('CTA too long - keep it concise');
      score.score += 4;
    }

    // Action-oriented check (7 points)
    const actionWords = EMAIL_BEST_PRACTICES.cta.actionWords;
    const hasActionWord = actionWords.some(word => ctaText.includes(word));

    if (hasActionWord) {
      score.score += 7;
      score.strengths.push('CTA uses strong action verb');
    } else {
      score.issues.push(`CTA should start with action verb (${actionWords.slice(0, 5).join(', ')}, etc.)`);
      score.score += 2;
    }

    // Avoid weak phrases (6 points)
    const weakPhrases = EMAIL_BEST_PRACTICES.cta.avoidWords;
    const hasWeakPhrase = weakPhrases.some(phrase => ctaLower.includes(phrase.toLowerCase()));

    if (!hasWeakPhrase) {
      score.score += 6;
      score.strengths.push('CTA avoids weak phrases');
    } else {
      score.issues.push('CTA uses weak phrase - make it more specific and compelling');
      score.score += 1;
    }

    return score;
  }

  /**
   * Scores compliance
   */
  scoreCompliance(email) {
    const score = { score: 0, issues: [], strengths: [] };

    const bodyLower = email.body?.toLowerCase() || '';
    const footer = email.footer?.toLowerCase() || '';

    // Unsubscribe link check (2.5 points)
    const hasUnsubscribe = bodyLower.includes('unsubscribe') || footer.includes('unsubscribe') ||
                          bodyLower.includes('{{unsubscribelink}}') || footer.includes('{{unsubscribelink}}');

    if (hasUnsubscribe) {
      score.score += 2.5;
      score.strengths.push('Contains unsubscribe link (CAN-SPAM compliant)');
    } else {
      score.issues.push('CRITICAL: Missing unsubscribe link (CAN-SPAM violation)');
    }

    // Physical address check (2.5 points)
    const hasAddress = footer.includes('address') || footer.includes('{{companyaddress}}') ||
                      /\d+\s+[a-z\s]+,\s+[a-z\s]+,\s+[a-z]{2}\s+\d{5}/i.test(footer);

    if (hasAddress) {
      score.score += 2.5;
      score.strengths.push('Contains physical address (CAN-SPAM compliant)');
    } else {
      score.issues.push('CRITICAL: Missing physical address (CAN-SPAM violation)');
    }

    return score;
  }

  // --------------------------------------------------------------------------
  // IMPROVEMENT IDENTIFICATION
  // --------------------------------------------------------------------------

  /**
   * Identifies specific improvements to make
   */
  identifyImprovements(email, scoreData) {
    const improvements = [];

    // Subject line improvements
    if (scoreData.breakdown.subject.score < 70) {
      scoreData.breakdown.subject.issues.forEach(issue => {
        improvements.push({
          area: 'subject',
          issue,
          priority: 'high',
          type: 'subject_optimization'
        });
      });
    }

    // Body improvements
    if (scoreData.breakdown.body.score < 70) {
      scoreData.breakdown.body.issues.forEach(issue => {
        improvements.push({
          area: 'body',
          issue,
          priority: 'medium',
          type: 'body_optimization'
        });
      });
    }

    // CTA improvements
    if (scoreData.breakdown.cta.score < 70) {
      scoreData.breakdown.cta.issues.forEach(issue => {
        improvements.push({
          area: 'cta',
          issue,
          priority: 'high',
          type: 'cta_optimization'
        });
      });
    }

    // Compliance improvements (always high priority)
    if (scoreData.breakdown.compliance.score < 5) {
      scoreData.breakdown.compliance.issues.forEach(issue => {
        improvements.push({
          area: 'compliance',
          issue,
          priority: 'critical',
          type: 'compliance_fix'
        });
      });
    }

    return improvements;
  }

  /**
   * Applies optimizations to email
   */
  async applyOptimizations(email, improvements, focusAreas) {
    const optimized = { ...email };

    try {
      const optimizeEmailAI = httpsCallable(functions, 'aiOptimizeEmail');

      const result = await optimizeEmailAI({
        email,
        improvements,
        focusAreas
      });

      return result.data.optimizedEmail;

    } catch (error) {
      console.error('[EmailOptimizer] AI optimization failed, applying rule-based fixes:', error);

      // Fallback: Apply basic rule-based fixes
      improvements.forEach(improvement => {
        if (improvement.area === 'compliance' && focusAreas.includes('all')) {
          if (!optimized.footer) {
            optimized.footer = this.getStandardFooter();
          }
        }
      });

      return optimized;
    }
  }

  // --------------------------------------------------------------------------
  // A/B TESTING
  // --------------------------------------------------------------------------

  /**
   * Generates multiple variants for A/B testing
   *
   * @param {Object} email - Base email template
   * @param {number} variantCount - Number of variants to generate (2-5)
   * @param {string} testType - What to test ('subject', 'cta', 'body', 'all')
   *
   * @returns {Array} Array of email variants
   */
  async generateABVariants(email, variantCount = 3, testType = 'subject') {
    console.log(`[EmailOptimizer] Generating ${variantCount} ${testType} variants`);

    const variants = [
      { ...email, variant: 'control', variantName: 'Original (Control)' }
    ];

    try {
      const generateVariantsAI = httpsCallable(functions, 'aiGenerateEmailVariants');

      const result = await generateVariantsAI({
        baseEmail: email,
        variantCount: variantCount - 1, // Minus the control
        testType
      });

      result.data.variants.forEach((variant, index) => {
        variants.push({
          ...variant,
          variant: `variant_${index + 1}`,
          variantName: variant.name || `Variant ${index + 1}`
        });
      });

    } catch (error) {
      console.error('[EmailOptimizer] AI variant generation failed:', error);

      // Fallback: Generate simple variants
      if (testType === 'subject') {
        variants.push({
          ...email,
          subject: `${email.subject} - Limited Time`,
          variant: 'variant_1',
          variantName: 'Urgency Test'
        });

        variants.push({
          ...email,
          subject: `{{firstName}}, ${email.subject}`,
          variant: 'variant_2',
          variantName: 'Personalization Test'
        });
      }
    }

    return variants;
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------

  /**
   * Calculates reading level (Flesch-Kincaid Grade Level)
   */
  calculateReadingLevel(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 12;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    const grade = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;

    return Math.max(0, Math.round(grade));
  }

  /**
   * Counts syllables in a word (approximate)
   */
  countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;

    // Adjust for silent 'e'
    if (word.endsWith('e')) count--;

    return Math.max(1, count);
  }

  /**
   * Estimates performance impact
   */
  estimateImpact(originalScore, optimizedScore, performanceData) {
    const scoreDiff = optimizedScore.total - originalScore.total;
    const improvementPercent = (scoreDiff / originalScore.total) * 100;

    let estimatedOpenRateIncrease = 0;
    let estimatedClickRateIncrease = 0;

    // Rough correlation: 10 point score increase ≈ 5% metric improvement
    if (scoreDiff > 0) {
      estimatedOpenRateIncrease = (scoreDiff / 10) * 5;
      estimatedClickRateIncrease = (scoreDiff / 10) * 3;
    }

    return {
      scoreImprovement: scoreDiff,
      improvementPercent,
      estimatedOpenRateIncrease: `+${estimatedOpenRateIncrease.toFixed(1)}%`,
      estimatedClickRateIncrease: `+${estimatedClickRateIncrease.toFixed(1)}%`,
      confidence: scoreDiff > 15 ? 'high' : scoreDiff > 5 ? 'medium' : 'low'
    };
  }

  /**
   * Gets standard compliant footer
   */
  getStandardFooter() {
    return `\n\n---\n\nSpeedy Credit Repair\n{{companyAddress}}\n\n[Unsubscribe]({{unsubscribeLink}})`;
  }
}

// ============================================================================
// EXPORTS & HELPERS
// ============================================================================

/**
 * Quick function to optimize an email
 */
export async function quickOptimizeEmail(email) {
  const optimizer = new EmailOptimizer();
  return await optimizer.optimizeEmail(email, { focusAreas: ['all'] });
}

/**
 * Quick function to score an email
 */
export async function quickScoreEmail(email) {
  const optimizer = new EmailOptimizer();
  return await optimizer.scoreEmail(email);
}

export default EmailOptimizer;

/**
 * Example Usage:
 *
 * const optimizer = new EmailOptimizer();
 *
 * // Generate a new email
 * const email = await optimizer.generateEmail({
 *   purpose: 'Welcome new Standard tier clients',
 *   audience: 'New Standard tier clients',
 *   tone: 'Professional and encouraging',
 *   keyPoints: [
 *     'Thank them for joining',
 *     'Explain what happens next',
 *     'Offer IDIQ credit report'
 *   ],
 *   cta: 'Get Your Free Credit Report'
 * });
 *
 * console.log(email.subject);
 * console.log(email.score.total); // 87
 * console.log(email.score.rating); // "Excellent"
 *
 * // Optimize existing email
 * const result = await optimizer.optimizeEmail(existingEmail, {
 *   focusAreas: ['subject', 'cta']
 * });
 *
 * console.log('Original score:', result.original.score.total);
 * console.log('Optimized score:', result.optimized.score.total);
 * console.log('Estimated impact:', result.estimatedImpact);
 *
 * // Generate A/B test variants
 * const variants = await optimizer.generateABVariants(email, 3, 'subject');
 * // Returns 3 variants with different subject lines
 *
 * // Score any email
 * const score = await optimizer.scoreEmail(myEmail);
 * console.log(score.issues); // What needs improvement
 * console.log(score.strengths); // What's working well
 */
