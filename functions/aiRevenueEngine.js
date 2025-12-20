// ============================================================================
// AI REVENUE ENGINE - AFFILIATE LINKS & AUTO LOAN OPPORTUNITIES
// ============================================================================
// Intelligent revenue generation through affiliate integration and auto financing
// ============================================================================

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const OpenAI = require('openai');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

// ============================================================================
// 1. AFFILIATE LINK MANAGEMENT
// ============================================================================

// Affiliate link categories for credit improvement
const AFFILIATE_CATEGORIES = {
  secured_credit_card: {
    description: 'Secured credit cards for building/rebuilding credit',
    scoreImpact: 'Helps establish positive payment history and reduce utilization',
    idealFor: ['no_credit', 'rebuilding', 'low_score'],
  },
  credit_builder_loan: {
    description: 'Credit builder loans to establish payment history',
    scoreImpact: 'Adds installment account diversity and payment history',
    idealFor: ['thin_file', 'no_installment'],
  },
  authorized_user: {
    description: 'Authorized user tradeline services',
    scoreImpact: 'Instantly adds age and positive history',
    idealFor: ['thin_file', 'low_age'],
  },
  credit_monitoring: {
    description: 'Credit monitoring and identity protection services',
    scoreImpact: 'Helps track progress and protect identity',
    idealFor: ['all'],
  },
  debt_consolidation: {
    description: 'Personal loans for debt consolidation',
    scoreImpact: 'Can lower utilization and simplify payments',
    idealFor: ['high_utilization', 'multiple_cards'],
  },
  balance_transfer: {
    description: 'Balance transfer credit cards',
    scoreImpact: 'Can reduce interest and help pay down faster',
    idealFor: ['high_utilization', 'high_interest'],
  },
  auto_refinance: {
    description: 'Auto loan refinancing services',
    scoreImpact: 'Can lower payments and interest rate',
    idealFor: ['high_rate_auto', 'prime_ready'],
  },
  financial_education: {
    description: 'Financial literacy courses and tools',
    scoreImpact: 'Builds long-term financial habits',
    idealFor: ['all'],
  },
};

// Save/Update affiliate link
exports.saveAffiliateLink = onCall(
  { memory: '256MiB', timeoutSeconds: 30 },
  async (request) => {
    const { linkId, name, category, url, description, commission, active } = request.data;

    if (!name || !category || !url) {
      throw new HttpsError('invalid-argument', 'Name, category, and URL required');
    }

    try {
      const linkData = {
        name,
        category,
        url,
        description: description || AFFILIATE_CATEGORIES[category]?.description || '',
        commission: commission || null,
        active: active !== false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: request.auth?.uid || 'system',
      };

      if (linkId) {
        await db.collection('affiliateLinks').doc(linkId).update(linkData);
        return { success: true, linkId, action: 'updated' };
      } else {
        linkData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        linkData.clicks = 0;
        linkData.conversions = 0;
        const ref = await db.collection('affiliateLinks').add(linkData);
        return { success: true, linkId: ref.id, action: 'created' };
      }
    } catch (error) {
      console.error('Save affiliate link error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// Get all affiliate links
exports.getAffiliateLinks = onCall(
  { memory: '256MiB', timeoutSeconds: 30 },
  async (request) => {
    try {
      const linksSnap = await db.collection('affiliateLinks')
        .where('active', '==', true)
        .get();

      const links = linksSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Group by category
      const byCategory = {};
      links.forEach(link => {
        if (!byCategory[link.category]) {
          byCategory[link.category] = [];
        }
        byCategory[link.category].push(link);
      });

      return {
        success: true,
        links,
        byCategory,
        categories: AFFILIATE_CATEGORIES,
      };
    } catch (error) {
      console.error('Get affiliate links error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// Track affiliate link click
exports.trackAffiliateLinkClick = onCall(
  { memory: '256MiB', timeoutSeconds: 30 },
  async (request) => {
    const { linkId, clientId, source } = request.data;

    if (!linkId) {
      throw new HttpsError('invalid-argument', 'Link ID required');
    }

    try {
      // Increment click count
      await db.collection('affiliateLinks').doc(linkId).update({
        clicks: admin.firestore.FieldValue.increment(1),
      });

      // Log the click
      await db.collection('affiliateLinkClicks').add({
        linkId,
        clientId: clientId || null,
        source: source || 'unknown', // 'credit_review', 'monthly_update', 'email', etc.
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId: request.auth?.uid || null,
      });

      return { success: true };
    } catch (error) {
      console.error('Track click error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 2. AI CREDIT REVIEW GENERATOR WITH AFFILIATE INTEGRATION
// ============================================================================
exports.generateCreditReview = onCall(
  { secrets: [OPENAI_API_KEY], memory: '1GiB', timeoutSeconds: 180 },
  async (request) => {
    const { clientId, reportType = 'initial', previousReportId } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID required');
    }

    try {
      // Get client data
      const clientDoc = await db.collection('contacts').doc(clientId).get();
      if (!clientDoc.exists) {
        throw new HttpsError('not-found', 'Client not found');
      }
      const client = clientDoc.data();

      // Get current credit report
      const reportQuery = await db.collection('creditReports')
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (reportQuery.empty) {
        throw new HttpsError('not-found', 'No credit report found');
      }

      const currentReport = reportQuery.docs[0].data();
      const parsedData = currentReport.parsedData || {};

      // Get previous report for comparison (if monthly update)
      let previousReport = null;
      if (reportType === 'monthly_update' && previousReportId) {
        const prevDoc = await db.collection('creditReports').doc(previousReportId).get();
        if (prevDoc.exists) {
          previousReport = prevDoc.data();
        }
      } else if (reportType === 'monthly_update') {
        // Get the second most recent report
        const prevQuery = await db.collection('creditReports')
          .where('clientId', '==', clientId)
          .orderBy('createdAt', 'desc')
          .limit(2)
          .get();
        if (prevQuery.docs.length > 1) {
          previousReport = prevQuery.docs[1].data();
        }
      }

      // Get active affiliate links
      const affiliateSnap = await db.collection('affiliateLinks')
        .where('active', '==', true)
        .get();
      const affiliateLinks = affiliateSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Analyze the credit report
      const analysis = analyzeCredit(parsedData, previousReport?.parsedData);

      // Build affiliate recommendations based on analysis
      const affiliateRecommendations = matchAffiliates(analysis, affiliateLinks);

      // Generate AI narrative
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const prompt = buildReviewPrompt(
        client,
        parsedData,
        analysis,
        affiliateRecommendations,
        reportType,
        previousReport?.parsedData
      );

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a professional credit analyst writing personalized credit reviews for clients of Speedy Credit Repair Inc. Your reviews should be:
- Professional yet warm and encouraging
- Educational, helping clients understand their credit
- Action-oriented with specific recommendations
- Naturally integrate product/service suggestions where they genuinely help

When mentioning recommended products or services, use this format for affiliate links:
[AFFILIATE:linkId:Display Text]

This will be replaced with actual clickable links in the final document.

Always explain WHY a recommendation would help their specific situation.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      let narrative = completion.choices[0].message.content;

      // Replace affiliate placeholders with actual links
      affiliateRecommendations.forEach(aff => {
        const placeholder = new RegExp(`\\[AFFILIATE:${aff.id}:([^\\]]+)\\]`, 'g');
        narrative = narrative.replace(placeholder, (match, displayText) => {
          return `<a href="${aff.url}" class="affiliate-link" data-link-id="${aff.id}" target="_blank">${displayText}</a>`;
        });
      });

      // Save the review
      const reviewRef = await db.collection('creditReviews').add({
        clientId,
        reportType,
        currentReportId: reportQuery.docs[0].id,
        previousReportId: previousReport ? previousReportId : null,
        analysis,
        affiliateRecommendations: affiliateRecommendations.map(a => a.id),
        narrative,
        scores: parsedData.scores,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: request.auth?.uid || 'system',
      });

      return {
        success: true,
        reviewId: reviewRef.id,
        narrative,
        analysis,
        affiliateRecommendations,
        scores: parsedData.scores,
      };

    } catch (error) {
      console.error('Generate credit review error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// Helper: Analyze credit report
function analyzeCredit(current, previous) {
  const accounts = current.accounts || [];
  const prevAccounts = previous?.accounts || [];

  // Separate by type
  const revolving = accounts.filter(a =>
    a.accountType?.toLowerCase().includes('revolving') ||
    a.accountType?.toLowerCase().includes('credit card') ||
    a.accountType?.toLowerCase().includes('credit')
  );

  const installment = accounts.filter(a =>
    a.accountType?.toLowerCase().includes('installment') ||
    a.accountType?.toLowerCase().includes('loan') ||
    a.accountType?.toLowerCase().includes('mortgage')
  );

  const autoLoans = accounts.filter(a =>
    a.accountType?.toLowerCase().includes('auto') ||
    a.accountType?.toLowerCase().includes('vehicle') ||
    a.creditor?.toLowerCase().includes('auto') ||
    a.creditor?.toLowerCase().includes('motor') ||
    a.creditor?.toLowerCase().includes('car')
  );

  const collections = accounts.filter(a =>
    a.accountType?.toLowerCase().includes('collection')
  );

  // Calculate utilization
  const totalLimit = revolving.reduce((sum, a) => sum + (a.creditLimit || 0), 0);
  const totalBalance = revolving.reduce((sum, a) => sum + (a.balance || 0), 0);
  const utilization = totalLimit > 0 ? (totalBalance / totalLimit * 100) : 0;

  // Analyze revolving changes if previous report exists
  let revolvingChanges = null;
  if (previous) {
    const prevRevolving = (previous.accounts || []).filter(a =>
      a.accountType?.toLowerCase().includes('revolving') ||
      a.accountType?.toLowerCase().includes('credit')
    );

    revolvingChanges = analyzeRevolvingChanges(revolving, prevRevolving);
  }

  // Analyze auto loan opportunities
  const autoOpportunities = analyzeAutoOpportunities(autoLoans, accounts);

  // Score analysis
  const scores = current.scores || {};
  const avgScore = scores.experian && scores.equifax && scores.transunion
    ? Math.round((scores.experian + scores.equifax + scores.transunion) / 3)
    : null;

  // Credit needs assessment
  const needs = [];
  if (utilization > 30) needs.push('high_utilization');
  if (revolving.length === 0) needs.push('no_revolving');
  if (revolving.length < 3) needs.push('thin_revolving');
  if (installment.length === 0) needs.push('no_installment');
  if (collections.length > 0) needs.push('has_collections');
  if (avgScore && avgScore < 580) needs.push('low_score');
  if (avgScore && avgScore < 670) needs.push('rebuilding');
  if (avgScore && avgScore >= 700) needs.push('prime_ready');

  // Calculate average account age
  const ages = accounts
    .map(a => a.dateOpened ? calculateMonthsOld(a.dateOpened) : null)
    .filter(Boolean);
  const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
  if (avgAge < 24) needs.push('low_age');
  if (accounts.length < 5) needs.push('thin_file');

  return {
    scores,
    avgScore,
    utilization: utilization.toFixed(1),
    totalLimit,
    totalBalance,
    accountCounts: {
      total: accounts.length,
      revolving: revolving.length,
      installment: installment.length,
      auto: autoLoans.length,
      collections: collections.length,
    },
    revolvingAccounts: revolving,
    autoLoans,
    collections,
    revolvingChanges,
    autoOpportunities,
    needs,
    avgAccountAge: avgAge.toFixed(0),
    hasAutoLoan: autoLoans.length > 0,
  };
}

// Helper: Analyze revolving credit changes
function analyzeRevolvingChanges(current, previous) {
  const changes = {
    newAccounts: [],
    closedAccounts: [],
    limitChanges: [],
    utilizationChanges: [],
    overallImpact: [],
  };

  const prevMap = new Map(previous.map(a => [
    `${a.creditor}-${a.accountNumber?.slice(-4) || ''}`,
    a
  ]));

  const currMap = new Map(current.map(a => [
    `${a.creditor}-${a.accountNumber?.slice(-4) || ''}`,
    a
  ]));

  // Find new accounts
  current.forEach(acc => {
    const key = `${acc.creditor}-${acc.accountNumber?.slice(-4) || ''}`;
    if (!prevMap.has(key)) {
      changes.newAccounts.push({
        creditor: acc.creditor,
        limit: acc.creditLimit,
        impact: 'POSITIVE: New account adds to available credit and credit mix',
      });
      changes.overallImpact.push({
        type: 'positive',
        description: `New ${acc.creditor} account opened with $${(acc.creditLimit || 0).toLocaleString()} limit`,
      });
    }
  });

  // Find closed accounts
  previous.forEach(acc => {
    const key = `${acc.creditor}-${acc.accountNumber?.slice(-4) || ''}`;
    if (!currMap.has(key)) {
      changes.closedAccounts.push({
        creditor: acc.creditor,
        limit: acc.creditLimit,
        impact: 'NEGATIVE: Closed account reduces available credit and may increase utilization',
      });
      changes.overallImpact.push({
        type: 'negative',
        description: `${acc.creditor} account closed - lost $${(acc.creditLimit || 0).toLocaleString()} in available credit`,
      });
    }
  });

  // Find limit and balance changes
  current.forEach(acc => {
    const key = `${acc.creditor}-${acc.accountNumber?.slice(-4) || ''}`;
    const prev = prevMap.get(key);
    if (prev) {
      // Limit changes
      if (acc.creditLimit !== prev.creditLimit) {
        const diff = (acc.creditLimit || 0) - (prev.creditLimit || 0);
        const isIncrease = diff > 0;
        changes.limitChanges.push({
          creditor: acc.creditor,
          previousLimit: prev.creditLimit,
          newLimit: acc.creditLimit,
          change: diff,
          impact: isIncrease
            ? 'POSITIVE: Credit limit increase lowers utilization ratio'
            : 'NEGATIVE: Credit limit decrease raises utilization ratio',
        });
        changes.overallImpact.push({
          type: isIncrease ? 'positive' : 'negative',
          description: `${acc.creditor} limit ${isIncrease ? 'increased' : 'decreased'} by $${Math.abs(diff).toLocaleString()}`,
        });
      }

      // Balance/utilization changes
      if (acc.balance !== prev.balance) {
        const prevUtil = prev.creditLimit > 0 ? (prev.balance / prev.creditLimit * 100) : 0;
        const currUtil = acc.creditLimit > 0 ? (acc.balance / acc.creditLimit * 100) : 0;
        const utilChange = currUtil - prevUtil;

        changes.utilizationChanges.push({
          creditor: acc.creditor,
          previousBalance: prev.balance,
          newBalance: acc.balance,
          previousUtilization: prevUtil.toFixed(1),
          newUtilization: currUtil.toFixed(1),
          impact: utilChange < 0
            ? 'POSITIVE: Lower balance improves utilization ratio'
            : utilChange > 0
              ? 'NEGATIVE: Higher balance increases utilization ratio'
              : 'NEUTRAL: No change in utilization',
        });

        if (Math.abs(utilChange) >= 5) {
          changes.overallImpact.push({
            type: utilChange < 0 ? 'positive' : 'negative',
            description: `${acc.creditor} utilization ${utilChange < 0 ? 'decreased' : 'increased'} from ${prevUtil.toFixed(0)}% to ${currUtil.toFixed(0)}%`,
          });
        }
      }
    }
  });

  return changes;
}

// Helper: Analyze auto loan opportunities
function analyzeAutoOpportunities(autoLoans, allAccounts) {
  const opportunities = {
    noAutoLoan: false,
    highInterestAuto: [],
    nearingMaturity: [],
    refinanceCandidates: [],
    primeReady: false,
  };

  // Check if they have no auto loan
  if (autoLoans.length === 0) {
    opportunities.noAutoLoan = true;
  }

  // Analyze each auto loan
  autoLoans.forEach(loan => {
    const monthsRemaining = calculateMonthsRemaining(loan);
    const estimatedRate = estimateInterestRate(loan);

    // High interest rate detection
    if (estimatedRate > 10) {
      opportunities.highInterestAuto.push({
        creditor: loan.creditor,
        balance: loan.balance,
        payment: loan.monthlyPayment,
        estimatedRate: estimatedRate.toFixed(1),
        monthsRemaining,
        reason: `Interest rate appears to be ${estimatedRate.toFixed(1)}% - refinancing could save significant money`,
      });
      opportunities.refinanceCandidates.push(loan);
    }

    // Nearing maturity (within 12 months)
    if (monthsRemaining !== null && monthsRemaining <= 12 && monthsRemaining > 0) {
      opportunities.nearingMaturity.push({
        creditor: loan.creditor,
        balance: loan.balance,
        monthsRemaining,
        reason: `Loan matures in approximately ${monthsRemaining} months - good time to explore new vehicle options`,
      });
    }

    // Very short term remaining with high balance (upside down potential)
    if (monthsRemaining !== null && monthsRemaining <= 6 && loan.balance > 5000) {
      opportunities.nearingMaturity.push({
        creditor: loan.creditor,
        balance: loan.balance,
        monthsRemaining,
        reason: `Loan ending soon with $${loan.balance.toLocaleString()} remaining - explore trade-in and upgrade options`,
      });
    }
  });

  return opportunities;
}

// Helper: Calculate months remaining on loan
function calculateMonthsRemaining(loan) {
  if (loan.termMonths && loan.dateOpened) {
    const opened = new Date(loan.dateOpened);
    const monthsOld = calculateMonthsOld(loan.dateOpened);
    return Math.max(0, loan.termMonths - monthsOld);
  }

  // Estimate from balance and payment
  if (loan.balance && loan.monthlyPayment && loan.monthlyPayment > 0) {
    return Math.ceil(loan.balance / loan.monthlyPayment);
  }

  return null;
}

// Helper: Estimate interest rate from loan details
function estimateInterestRate(loan) {
  if (!loan.balance || !loan.monthlyPayment || !loan.originalAmount) {
    // Rough estimate based on payment to balance ratio
    if (loan.balance && loan.monthlyPayment) {
      const monthsRemaining = loan.balance / loan.monthlyPayment;
      if (monthsRemaining > 0) {
        // Simple approximation
        const totalPayments = loan.monthlyPayment * monthsRemaining;
        const interestPaid = totalPayments - loan.balance;
        const avgBalance = loan.balance / 2;
        const years = monthsRemaining / 12;
        if (years > 0 && avgBalance > 0) {
          return (interestPaid / avgBalance / years) * 100;
        }
      }
    }
    return 8; // Default assumption
  }

  // More accurate calculation if we have original amount
  const totalPayments = loan.monthlyPayment * (loan.termMonths || 60);
  const totalInterest = totalPayments - loan.originalAmount;
  const avgBalance = loan.originalAmount / 2;
  const years = (loan.termMonths || 60) / 12;

  return (totalInterest / avgBalance / years) * 100;
}

// Helper: Calculate months old
function calculateMonthsOld(dateOpened) {
  const opened = new Date(dateOpened);
  const now = new Date();
  return (now.getFullYear() - opened.getFullYear()) * 12 +
         (now.getMonth() - opened.getMonth());
}

// Helper: Match affiliate links to needs
function matchAffiliates(analysis, affiliateLinks) {
  const matched = [];
  const needs = analysis.needs || [];

  affiliateLinks.forEach(link => {
    const categoryInfo = AFFILIATE_CATEGORIES[link.category];
    if (!categoryInfo) return;

    const idealFor = categoryInfo.idealFor || [];

    // Check if this affiliate matches any of the client's needs
    const matchesNeed = idealFor.some(need => needs.includes(need)) || idealFor.includes('all');

    if (matchesNeed) {
      matched.push({
        id: link.id,
        name: link.name,
        category: link.category,
        url: link.url,
        description: link.description,
        scoreImpact: categoryInfo.scoreImpact,
        reason: getMatchReason(link.category, needs, analysis),
      });
    }
  });

  // Add auto financing opportunity if applicable
  if (analysis.autoOpportunities?.noAutoLoan ||
      analysis.autoOpportunities?.highInterestAuto.length > 0 ||
      analysis.autoOpportunities?.nearingMaturity.length > 0) {
    matched.push({
      id: 'toyota-financing',
      name: 'Toyota Auto Financing',
      category: 'auto_financing',
      url: 'CONTACT_US', // Special flag to contact
      description: 'Speak with our Finance Director for competitive auto financing',
      scoreImpact: 'Adding a well-managed auto loan can diversify your credit mix',
      reason: getAutoFinancingReason(analysis.autoOpportunities),
      isInternal: true,
    });
  }

  return matched;
}

// Helper: Get match reason for affiliate
function getMatchReason(category, needs, analysis) {
  const reasons = {
    secured_credit_card: needs.includes('low_score')
      ? 'A secured card is ideal for rebuilding credit with your current score'
      : needs.includes('thin_revolving')
        ? 'Adding a secured card will help establish more revolving credit history'
        : 'A secured card can help build positive payment history',

    credit_builder_loan: needs.includes('no_installment')
      ? 'You have no installment loans - a credit builder loan adds valuable diversity'
      : 'A credit builder loan helps establish payment history while saving money',

    authorized_user: needs.includes('thin_file')
      ? 'With a thin credit file, an authorized user tradeline can quickly add history'
      : needs.includes('low_age')
        ? 'Your average account age is low - an aged tradeline can help significantly'
        : 'An authorized user account can boost your credit profile',

    debt_consolidation: needs.includes('high_utilization')
      ? `Your utilization is ${analysis.utilization}% - consolidating can bring this down significantly`
      : 'A personal loan for consolidation can simplify payments and lower utilization',

    balance_transfer: needs.includes('high_utilization')
      ? 'A 0% balance transfer card can help you pay down balances faster'
      : 'Balance transfer offers can save on interest and help pay down debt',

    auto_refinance: needs.includes('high_rate_auto')
      ? 'Your current auto loan rate appears high - refinancing could save hundreds per month'
      : 'Auto refinancing may lower your payment and save on interest',

    credit_monitoring: 'Monitoring helps you track progress and catch issues early',

    financial_education: 'Building financial knowledge helps maintain good credit long-term',
  };

  return reasons[category] || 'This product may help improve your credit profile';
}

// Helper: Get auto financing reason
function getAutoFinancingReason(opportunities) {
  if (opportunities.noAutoLoan) {
    return 'You currently have no auto loan. Adding a well-managed installment loan like an auto loan can help diversify your credit mix and build payment history.';
  }

  if (opportunities.highInterestAuto.length > 0) {
    const highest = opportunities.highInterestAuto[0];
    return `Your current auto loan with ${highest.creditor} appears to have a ${highest.estimatedRate}% interest rate. Our Finance Director may be able to get you approved at a significantly lower rate, potentially saving you hundreds per month.`;
  }

  if (opportunities.nearingMaturity.length > 0) {
    const nearest = opportunities.nearingMaturity[0];
    return `Your ${nearest.creditor} loan is nearing maturity with approximately ${nearest.monthsRemaining} months remaining. This is a great time to explore your options for a new or upgraded vehicle.`;
  }

  return 'We offer competitive auto financing options through our Toyota franchise partnership.';
}

// Helper: Build review prompt
function buildReviewPrompt(client, reportData, analysis, affiliates, reportType, previousData) {
  const isInitial = reportType === 'initial';

  let prompt = `Generate a ${isInitial ? 'comprehensive initial credit review' : 'monthly update report'} for:

CLIENT: ${client.firstName} ${client.lastName}

CREDIT SCORES:
- Experian: ${analysis.scores.experian || 'N/A'}
- Equifax: ${analysis.scores.equifax || 'N/A'}
- TransUnion: ${analysis.scores.transunion || 'N/A'}
- Average: ${analysis.avgScore || 'N/A'}

ACCOUNT SUMMARY:
- Total Accounts: ${analysis.accountCounts.total}
- Revolving Accounts: ${analysis.accountCounts.revolving}
- Installment Accounts: ${analysis.accountCounts.installment}
- Auto Loans: ${analysis.accountCounts.auto}
- Collections: ${analysis.accountCounts.collections}

UTILIZATION:
- Current: ${analysis.utilization}%
- Total Credit Limit: $${analysis.totalLimit.toLocaleString()}
- Total Balances: $${analysis.totalBalance.toLocaleString()}

AVERAGE ACCOUNT AGE: ${analysis.avgAccountAge} months
`;

  // Add revolving changes for monthly updates
  if (!isInitial && analysis.revolvingChanges) {
    prompt += `
REVOLVING CREDIT CHANGES SINCE LAST REPORT:
`;
    if (analysis.revolvingChanges.newAccounts.length > 0) {
      prompt += `\nNEW ACCOUNTS OPENED:\n`;
      analysis.revolvingChanges.newAccounts.forEach(acc => {
        prompt += `- ${acc.creditor}: $${(acc.limit || 0).toLocaleString()} limit (${acc.impact})\n`;
      });
    }

    if (analysis.revolvingChanges.closedAccounts.length > 0) {
      prompt += `\nACCOUNTS CLOSED:\n`;
      analysis.revolvingChanges.closedAccounts.forEach(acc => {
        prompt += `- ${acc.creditor}: Lost $${(acc.limit || 0).toLocaleString()} limit (${acc.impact})\n`;
      });
    }

    if (analysis.revolvingChanges.limitChanges.length > 0) {
      prompt += `\nCREDIT LIMIT CHANGES:\n`;
      analysis.revolvingChanges.limitChanges.forEach(change => {
        prompt += `- ${change.creditor}: $${(change.previousLimit || 0).toLocaleString()} → $${(change.newLimit || 0).toLocaleString()} (${change.impact})\n`;
      });
    }

    if (analysis.revolvingChanges.utilizationChanges.length > 0) {
      prompt += `\nBALANCE/UTILIZATION CHANGES:\n`;
      analysis.revolvingChanges.utilizationChanges.forEach(change => {
        prompt += `- ${change.creditor}: ${change.previousUtilization}% → ${change.newUtilization}% (${change.impact})\n`;
      });
    }
  }

  // Add auto loan opportunities
  prompt += `
AUTO LOAN ANALYSIS:
- Has Auto Loan: ${analysis.hasAutoLoan ? 'Yes' : 'No'}
`;

  if (analysis.autoOpportunities.noAutoLoan) {
    prompt += `- OPPORTUNITY: Client has no auto loan - could benefit from adding installment credit\n`;
  }

  if (analysis.autoOpportunities.highInterestAuto.length > 0) {
    prompt += `- HIGH RATE AUTOS:\n`;
    analysis.autoOpportunities.highInterestAuto.forEach(auto => {
      prompt += `  • ${auto.creditor}: ~${auto.estimatedRate}% rate, $${auto.balance?.toLocaleString()} balance, ${auto.monthsRemaining} months remaining\n`;
    });
  }

  if (analysis.autoOpportunities.nearingMaturity.length > 0) {
    prompt += `- LOANS NEARING MATURITY:\n`;
    analysis.autoOpportunities.nearingMaturity.forEach(auto => {
      prompt += `  • ${auto.creditor}: ${auto.monthsRemaining} months remaining, $${auto.balance?.toLocaleString()} balance\n`;
    });
  }

  // Add affiliate recommendations
  prompt += `
RECOMMENDED PRODUCTS/SERVICES TO SUGGEST:
`;
  affiliates.forEach(aff => {
    prompt += `- [AFFILIATE:${aff.id}:${aff.name}] - Category: ${aff.category}
  Reason: ${aff.reason}
  Impact: ${aff.scoreImpact}
`;
  });

  prompt += `
WRITING INSTRUCTIONS:
1. Start with a warm, personalized greeting
2. ${isInitial ? 'Provide a comprehensive overview of their credit profile' : 'Summarize what changed since the last report'}
3. Explain each score factor and what it means
4. ${!isInitial && analysis.revolvingChanges ? 'Detail ALL revolving credit changes and explain their positive or negative impact on credit' : ''}
5. Discuss utilization and provide specific recommendations
6. ${analysis.hasAutoLoan ? 'Analyze their auto loan situation - especially if high rate or nearing maturity' : 'Note that they have no auto loan and how adding one could help'}
7. Naturally incorporate affiliate recommendations using [AFFILIATE:id:Display Text] format
8. For auto financing opportunities, encourage them to contact us directly
9. End with encouragement and next steps

The tone should be professional but friendly, educational, and action-oriented. Make the client feel supported and empowered.`;

  return prompt;
}

// ============================================================================
// 3. AUTO OPPORTUNITY EMAIL CAMPAIGN TRIGGER
// ============================================================================
exports.checkAutoOpportunities = onSchedule(
  { schedule: 'every monday 09:00', timeZone: 'America/Los_Angeles', memory: '512MiB' },
  async (event) => {
    try {
      // Get all clients with credit reports
      const clientsQuery = await db.collection('contacts')
        .where('type', '==', 'client')
        .where('status', '==', 'active')
        .get();

      const opportunities = [];

      for (const clientDoc of clientsQuery.docs) {
        const client = { id: clientDoc.id, ...clientDoc.data() };

        // Get latest credit report
        const reportQuery = await db.collection('creditReports')
          .where('clientId', '==', client.id)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (reportQuery.empty) continue;

        const report = reportQuery.docs[0].data();
        const analysis = analyzeCredit(report.parsedData || {}, null);

        // Check for auto opportunities
        if (analysis.autoOpportunities.noAutoLoan ||
            analysis.autoOpportunities.highInterestAuto.length > 0 ||
            analysis.autoOpportunities.nearingMaturity.length > 0) {

          const opp = {
            clientId: client.id,
            clientName: `${client.firstName} ${client.lastName}`,
            email: client.email,
            phone: client.phone,
            avgScore: analysis.avgScore,
            opportunities: analysis.autoOpportunities,
            reason: getAutoFinancingReason(analysis.autoOpportunities),
          };

          opportunities.push(opp);

          // Queue subtle email campaign
          await db.collection('emailCampaigns').add({
            type: 'auto_opportunity',
            clientId: client.id,
            clientEmail: client.email,
            clientName: `${client.firstName} ${client.lastName}`,
            opportunityType: analysis.autoOpportunities.noAutoLoan ? 'no_auto'
              : analysis.autoOpportunities.highInterestAuto.length > 0 ? 'high_rate'
              : 'nearing_maturity',
            reason: opp.reason,
            creditScore: analysis.avgScore,
            status: 'pending',
            scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      console.log(`Found ${opportunities.length} auto financing opportunities`);

      // Save summary report
      await db.collection('autoOpportunityReports').add({
        date: admin.firestore.FieldValue.serverTimestamp(),
        totalOpportunities: opportunities.length,
        opportunities,
      });

      return { success: true, count: opportunities.length };

    } catch (error) {
      console.error('Auto opportunity check error:', error);
      throw error;
    }
  }
);

// Manual trigger for auto opportunity scan
exports.scanAutoOpportunities = onCall(
  { memory: '512MiB', timeoutSeconds: 120 },
  async (request) => {
    const { clientIds } = request.data;

    try {
      let clientsQuery;

      if (clientIds && clientIds.length > 0) {
        // Scan specific clients
        const clients = await Promise.all(
          clientIds.map(id => db.collection('contacts').doc(id).get())
        );
        clientsQuery = { docs: clients.filter(d => d.exists) };
      } else {
        // Scan all active clients
        clientsQuery = await db.collection('contacts')
          .where('type', '==', 'client')
          .where('status', '==', 'active')
          .limit(100)
          .get();
      }

      const results = {
        noAutoLoan: [],
        highInterestAuto: [],
        nearingMaturity: [],
        primeClients: [],
      };

      for (const clientDoc of clientsQuery.docs) {
        const client = { id: clientDoc.id, ...clientDoc.data() };

        const reportQuery = await db.collection('creditReports')
          .where('clientId', '==', client.id)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (reportQuery.empty) continue;

        const report = reportQuery.docs[0].data();
        const analysis = analyzeCredit(report.parsedData || {}, null);

        const baseInfo = {
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phone,
          avgScore: analysis.avgScore,
        };

        if (analysis.autoOpportunities.noAutoLoan) {
          results.noAutoLoan.push({
            ...baseInfo,
            reason: 'No auto loan on file - opportunity to add installment credit',
          });
        }

        if (analysis.autoOpportunities.highInterestAuto.length > 0) {
          results.highInterestAuto.push({
            ...baseInfo,
            loans: analysis.autoOpportunities.highInterestAuto,
            reason: 'High interest auto loan - refinance opportunity',
          });
        }

        if (analysis.autoOpportunities.nearingMaturity.length > 0) {
          results.nearingMaturity.push({
            ...baseInfo,
            loans: analysis.autoOpportunities.nearingMaturity,
            reason: 'Auto loan nearing maturity - new vehicle opportunity',
          });
        }

        // Prime clients (700+ score) for new auto opportunities
        if (analysis.avgScore >= 700) {
          results.primeClients.push({
            ...baseInfo,
            reason: 'Prime credit - qualifies for best rates',
          });
        }
      }

      return {
        success: true,
        summary: {
          noAutoLoan: results.noAutoLoan.length,
          highInterestAuto: results.highInterestAuto.length,
          nearingMaturity: results.nearingMaturity.length,
          primeClients: results.primeClients.length,
          totalOpportunities: results.noAutoLoan.length + results.highInterestAuto.length + results.nearingMaturity.length,
        },
        results,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Scan auto opportunities error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

// ============================================================================
// 4. REVOLVING CREDIT COMPARISON REPORT
// ============================================================================
exports.compareRevolvingCredit = onCall(
  { memory: '512MiB', timeoutSeconds: 60 },
  async (request) => {
    const { clientId, reportId1, reportId2 } = request.data;

    if (!clientId) {
      throw new HttpsError('invalid-argument', 'Client ID required');
    }

    try {
      let report1Data, report2Data;

      if (reportId1 && reportId2) {
        // Compare specific reports
        const [doc1, doc2] = await Promise.all([
          db.collection('creditReports').doc(reportId1).get(),
          db.collection('creditReports').doc(reportId2).get(),
        ]);
        report1Data = doc1.data();
        report2Data = doc2.data();
      } else {
        // Compare two most recent reports
        const reportsQuery = await db.collection('creditReports')
          .where('clientId', '==', clientId)
          .orderBy('createdAt', 'desc')
          .limit(2)
          .get();

        if (reportsQuery.docs.length < 2) {
          return {
            success: false,
            error: 'Need at least 2 reports for comparison',
          };
        }

        report1Data = reportsQuery.docs[0].data(); // Newer
        report2Data = reportsQuery.docs[1].data(); // Older
      }

      const current = report1Data.parsedData || {};
      const previous = report2Data.parsedData || {};

      // Get revolving accounts
      const currentRevolving = (current.accounts || []).filter(a =>
        a.accountType?.toLowerCase().includes('revolving') ||
        a.accountType?.toLowerCase().includes('credit')
      );

      const previousRevolving = (previous.accounts || []).filter(a =>
        a.accountType?.toLowerCase().includes('revolving') ||
        a.accountType?.toLowerCase().includes('credit')
      );

      const changes = analyzeRevolvingChanges(currentRevolving, previousRevolving);

      // Calculate overall impact
      const currentUtil = currentRevolving.reduce((sum, a) => sum + (a.balance || 0), 0) /
                          Math.max(1, currentRevolving.reduce((sum, a) => sum + (a.creditLimit || 0), 0)) * 100;

      const previousUtil = previousRevolving.reduce((sum, a) => sum + (a.balance || 0), 0) /
                           Math.max(1, previousRevolving.reduce((sum, a) => sum + (a.creditLimit || 0), 0)) * 100;

      const currentLimit = currentRevolving.reduce((sum, a) => sum + (a.creditLimit || 0), 0);
      const previousLimit = previousRevolving.reduce((sum, a) => sum + (a.creditLimit || 0), 0);

      return {
        success: true,
        comparison: {
          period: {
            from: report2Data.createdAt,
            to: report1Data.createdAt,
          },
          accountChanges: {
            previous: previousRevolving.length,
            current: currentRevolving.length,
            newAccounts: changes.newAccounts.length,
            closedAccounts: changes.closedAccounts.length,
          },
          utilizationChange: {
            previous: previousUtil.toFixed(1),
            current: currentUtil.toFixed(1),
            change: (currentUtil - previousUtil).toFixed(1),
            impact: currentUtil < previousUtil ? 'POSITIVE' : currentUtil > previousUtil ? 'NEGATIVE' : 'NEUTRAL',
          },
          creditLimitChange: {
            previous: previousLimit,
            current: currentLimit,
            change: currentLimit - previousLimit,
            impact: currentLimit > previousLimit ? 'POSITIVE' : currentLimit < previousLimit ? 'NEGATIVE' : 'NEUTRAL',
          },
          details: changes,
          scoreImpactSummary: generateScoreImpactSummary(changes),
        },
      };

    } catch (error) {
      console.error('Compare revolving credit error:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);

function generateScoreImpactSummary(changes) {
  const positives = changes.overallImpact.filter(i => i.type === 'positive');
  const negatives = changes.overallImpact.filter(i => i.type === 'negative');

  let summary = '';

  if (positives.length > 0) {
    summary += 'POSITIVE CHANGES:\n';
    positives.forEach(p => {
      summary += `✓ ${p.description}\n`;
    });
  }

  if (negatives.length > 0) {
    summary += '\nNEGATIVE CHANGES:\n';
    negatives.forEach(n => {
      summary += `✗ ${n.description}\n`;
    });
  }

  if (positives.length === 0 && negatives.length === 0) {
    summary = 'No significant revolving credit changes detected.';
  }

  return summary;
}

console.log('💰 AI Revenue Engine loaded successfully!');
