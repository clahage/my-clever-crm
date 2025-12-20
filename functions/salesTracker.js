/**
 * Sales Tracker Functions
 * Toyota/Tekion lead handoff, commission tracking, and referral management
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { defineSecret } = require('firebase-functions/params');

const openaiApiKey = defineSecret('OPENAI_API_KEY');

const ROLE_HIERARCHY = { admin: 4, manager: 3, user: 2, viewer: 1 };

// ============================================
// TOYOTA/TEKION LEAD HANDOFF SYSTEM
// ============================================

/**
 * Create auto lead from credit repair client
 */
exports.createAutoLead = onCall(async (request) => {
  const db = getFirestore();
  const {
    clientId,
    opportunityType,
    assignedTo,
    vehicleInterest,
    tradeInInfo,
    budget,
    notes,
    priority
  } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!clientId) throw new HttpsError('invalid-argument', 'Client ID required');

  // Get client information
  const clientDoc = await db.collection('clients').doc(clientId).get();
  if (!clientDoc.exists) {
    throw new HttpsError('not-found', 'Client not found');
  }
  const client = clientDoc.data();

  // Get latest credit info
  const reportsSnapshot = await db.collection('creditReports')
    .where('clientId', '==', clientId)
    .orderBy('uploadedAt', 'desc')
    .limit(1)
    .get();

  let creditInfo = {};
  if (!reportsSnapshot.empty) {
    const report = reportsSnapshot.docs[0].data();
    creditInfo = {
      currentScore: report.scores?.transunion || report.scores?.equifax || report.scores?.experian,
      scoreDate: report.uploadedAt,
      hasAutoLoan: report.autoLoans?.length > 0,
      currentAutoPayment: report.autoLoans?.[0]?.payment || null
    };
  }

  const lead = {
    // Client info
    clientId,
    clientName: client.name || `${client.firstName} ${client.lastName}`,
    clientEmail: client.email,
    clientPhone: client.phone,
    clientAddress: client.address || null,

    // Credit info
    creditScore: creditInfo.currentScore || null,
    creditScoreDate: creditInfo.scoreDate || null,
    hasExistingAuto: creditInfo.hasAutoLoan || false,
    currentAutoPayment: creditInfo.currentAutoPayment,

    // Opportunity details
    opportunityType, // 'no_auto', 'high_interest', 'maturity', 'prime'
    vehicleInterest: vehicleInterest || null, // 'new', 'used', 'lease', 'any'
    tradeInInfo: tradeInInfo || null,
    budget: budget || null,
    priority: priority || 'medium', // 'hot', 'warm', 'medium', 'low'

    // Assignment
    assignedTo: assignedTo || userId, // Default to creator (Christopher)
    assignedBy: userId,
    assignmentType: assignedTo === userId ? 'self' : 'delegated',

    // Status tracking
    status: 'new', // new, contacted, appointment_set, showed, working_deal, sold, lost
    stage: 'lead', // lead, prospect, opportunity, customer

    // Activity tracking
    activities: [{
      type: 'created',
      timestamp: new Date().toISOString(),
      userId,
      notes: notes || 'Lead created from credit repair client'
    }],

    // Commission tracking
    commissionInfo: {
      eligible: true,
      splitWith: assignedTo !== userId ? assignedTo : null,
      splitPercentage: assignedTo !== userId ? 50 : 100, // Default 50/50 split with assistant
      estimatedCommission: null,
      actualCommission: null
    },

    // Tekion export
    tekionExported: false,
    tekionExportedAt: null,
    tekionLeadId: null,

    // Timestamps
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastContactAt: null,
    appointmentAt: null,
    soldAt: null
  };

  const docRef = await db.collection('autoLeads').add(lead);

  // Update client record
  await db.collection('clients').doc(clientId).update({
    hasAutoLead: true,
    autoLeadId: docRef.id,
    autoLeadStatus: 'new',
    updatedAt: FieldValue.serverTimestamp()
  });

  return {
    success: true,
    leadId: docRef.id,
    lead: { id: docRef.id, ...lead }
  };
});

/**
 * Update auto lead status
 */
exports.updateAutoLeadStatus = onCall(async (request) => {
  const db = getFirestore();
  const { leadId, status, stage, notes, appointmentDate, soldInfo } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!leadId) throw new HttpsError('invalid-argument', 'Lead ID required');

  const leadRef = db.collection('autoLeads').doc(leadId);
  const leadDoc = await leadRef.get();

  if (!leadDoc.exists) {
    throw new HttpsError('not-found', 'Lead not found');
  }

  const lead = leadDoc.data();
  const updates = {
    updatedAt: FieldValue.serverTimestamp()
  };

  if (status) {
    updates.status = status;
    updates.activities = FieldValue.arrayUnion({
      type: 'status_change',
      from: lead.status,
      to: status,
      timestamp: new Date().toISOString(),
      userId,
      notes: notes || null
    });
  }

  if (stage) updates.stage = stage;

  if (appointmentDate) {
    updates.appointmentAt = new Date(appointmentDate);
    updates.activities = FieldValue.arrayUnion({
      type: 'appointment_set',
      timestamp: new Date().toISOString(),
      userId,
      appointmentDate
    });
  }

  if (status === 'contacted' || status === 'appointment_set') {
    updates.lastContactAt = FieldValue.serverTimestamp();
  }

  // Handle sold status
  if (status === 'sold' && soldInfo) {
    updates.soldAt = FieldValue.serverTimestamp();
    updates.stage = 'customer';
    updates.soldInfo = {
      vehicleSold: soldInfo.vehicle,
      saleType: soldInfo.saleType, // 'new', 'used', 'lease'
      salePrice: soldInfo.salePrice || null,
      grossProfit: soldInfo.grossProfit || null,
      financeProfit: soldInfo.financeProfit || null,
      totalProfit: soldInfo.totalProfit || null
    };

    // Calculate commission
    const totalCommission = calculateCommission(soldInfo);
    const split = lead.commissionInfo.splitPercentage / 100;
    updates['commissionInfo.actualCommission'] = totalCommission * split;
    updates['commissionInfo.totalDealCommission'] = totalCommission;

    // Create commission record
    await db.collection('commissions').add({
      leadId,
      clientId: lead.clientId,
      clientName: lead.clientName,
      assignedTo: lead.assignedTo,
      assignedBy: lead.assignedBy,
      soldInfo: updates.soldInfo,
      totalCommission,
      myCommission: totalCommission * split,
      splitWith: lead.commissionInfo.splitWith,
      theirCommission: lead.commissionInfo.splitWith ? totalCommission * (1 - split) : 0,
      status: 'pending', // pending, paid
      soldAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    });

    // Update client record
    await db.collection('clients').doc(lead.clientId).update({
      autoLeadStatus: 'sold',
      becameCustomer: true,
      vehiclePurchased: soldInfo.vehicle,
      vehiclePurchaseDate: FieldValue.serverTimestamp()
    });
  }

  await leadRef.update(updates);

  return { success: true };
});

function calculateCommission(soldInfo) {
  // Base commission calculation - customize based on dealership structure
  let commission = 0;

  // Front-end commission (typically $100-500 flat or percentage)
  if (soldInfo.grossProfit) {
    commission += soldInfo.grossProfit * 0.25; // 25% of front gross
  } else {
    commission += 200; // Flat minimum
  }

  // Back-end/Finance commission
  if (soldInfo.financeProfit) {
    commission += soldInfo.financeProfit * 0.10; // 10% of finance profit
  }

  return commission;
}

/**
 * Export lead to Tekion CRM format
 */
exports.exportToTekion = onCall(async (request) => {
  const db = getFirestore();
  const { leadId, leadIds } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  const idsToExport = leadIds || (leadId ? [leadId] : []);
  if (idsToExport.length === 0) {
    throw new HttpsError('invalid-argument', 'At least one lead ID required');
  }

  const exports = [];

  for (const id of idsToExport) {
    const leadDoc = await db.collection('autoLeads').doc(id).get();
    if (!leadDoc.exists) continue;

    const lead = leadDoc.data();

    // Format for Tekion CRM import
    const tekionLead = {
      // Standard Tekion fields
      firstName: lead.clientName.split(' ')[0],
      lastName: lead.clientName.split(' ').slice(1).join(' '),
      email: lead.clientEmail,
      phone: formatPhoneForTekion(lead.clientPhone),
      address: lead.clientAddress || '',

      // Lead source
      source: 'Speedy Credit Repair',
      sourceDetail: `Credit Repair Client - ${lead.opportunityType}`,
      campaign: 'Credit Repair Auto Program',

      // Vehicle interest
      vehicleInterest: lead.vehicleInterest || 'Any',
      budget: lead.budget || '',
      tradeIn: lead.tradeInInfo ? 'Yes' : 'No',
      tradeInDetails: lead.tradeInInfo || '',

      // Credit info for finance
      creditScore: lead.creditScore || '',
      creditTier: getCreditTier(lead.creditScore),

      // Notes
      notes: `Credit repair client converted to auto lead.
Opportunity Type: ${lead.opportunityType}
Current Auto Payment: ${lead.currentAutoPayment || 'N/A'}
Priority: ${lead.priority}
Assigned to: Finance Director`,

      // Internal reference
      speedyCrmLeadId: id,
      speedyCrmClientId: lead.clientId
    };

    exports.push(tekionLead);

    // Update lead record
    await db.collection('autoLeads').doc(id).update({
      tekionExported: true,
      tekionExportedAt: FieldValue.serverTimestamp(),
      activities: FieldValue.arrayUnion({
        type: 'tekion_export',
        timestamp: new Date().toISOString(),
        userId
      })
    });
  }

  // Create export record
  const exportRecord = await db.collection('tekionExports').add({
    leads: exports,
    leadIds: idsToExport,
    exportedBy: userId,
    exportedAt: FieldValue.serverTimestamp(),
    format: 'tekion_v1'
  });

  return {
    success: true,
    exportId: exportRecord.id,
    exportedCount: exports.length,
    tekionLeads: exports
  };
});

function formatPhoneForTekion(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return phone;
}

function getCreditTier(score) {
  if (!score) return 'Unknown';
  if (score >= 750) return 'Tier 1+ (Super Prime)';
  if (score >= 700) return 'Tier 1 (Prime)';
  if (score >= 650) return 'Tier 2 (Near Prime)';
  if (score >= 600) return 'Tier 3 (Subprime)';
  return 'Tier 4 (Deep Subprime)';
}

/**
 * Get auto leads with filtering
 */
exports.getAutoLeads = onCall(async (request) => {
  const db = getFirestore();
  const { status, assignedTo, opportunityType, priority, limit: resultLimit } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query = db.collection('autoLeads');

  if (status) query = query.where('status', '==', status);
  if (assignedTo) query = query.where('assignedTo', '==', assignedTo);
  if (opportunityType) query = query.where('opportunityType', '==', opportunityType);
  if (priority) query = query.where('priority', '==', priority);

  query = query.orderBy('createdAt', 'desc').limit(resultLimit || 100);

  const snapshot = await query.get();
  const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return { leads };
});

/**
 * Reassign auto lead
 */
exports.reassignAutoLead = onCall(async (request) => {
  const db = getFirestore();
  const { leadId, newAssignee, splitPercentage, notes } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!leadId || !newAssignee) throw new HttpsError('invalid-argument', 'Lead ID and new assignee required');

  const leadRef = db.collection('autoLeads').doc(leadId);
  const leadDoc = await leadRef.get();

  if (!leadDoc.exists) {
    throw new HttpsError('not-found', 'Lead not found');
  }

  const lead = leadDoc.data();

  await leadRef.update({
    assignedTo: newAssignee,
    assignmentType: newAssignee === userId ? 'self' : 'delegated',
    'commissionInfo.splitWith': newAssignee !== userId ? newAssignee : null,
    'commissionInfo.splitPercentage': splitPercentage || (newAssignee !== userId ? 50 : 100),
    updatedAt: FieldValue.serverTimestamp(),
    activities: FieldValue.arrayUnion({
      type: 'reassigned',
      from: lead.assignedTo,
      to: newAssignee,
      timestamp: new Date().toISOString(),
      userId,
      notes: notes || null
    })
  });

  return { success: true };
});

// ============================================
// COMMISSION TRACKING
// ============================================

/**
 * Get commission summary
 */
exports.getCommissionSummary = onCall(async (request) => {
  const db = getFirestore();
  const { startDate, endDate, userId: filterUserId } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query = db.collection('commissions');

  if (filterUserId) {
    query = query.where('assignedTo', '==', filterUserId);
  }

  if (startDate) {
    query = query.where('soldAt', '>=', new Date(startDate));
  }
  if (endDate) {
    query = query.where('soldAt', '<=', new Date(endDate));
  }

  const snapshot = await query.get();
  const commissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const summary = {
    totalDeals: commissions.length,
    totalCommission: 0,
    myCommission: 0,
    sharedCommission: 0,
    pendingCommission: 0,
    paidCommission: 0,
    byMonth: {},
    byAssignee: {}
  };

  commissions.forEach(comm => {
    summary.totalCommission += comm.totalCommission || 0;
    summary.myCommission += comm.myCommission || 0;
    summary.sharedCommission += comm.theirCommission || 0;

    if (comm.status === 'pending') {
      summary.pendingCommission += comm.myCommission || 0;
    } else {
      summary.paidCommission += comm.myCommission || 0;
    }

    // Group by month
    if (comm.soldAt) {
      const month = comm.soldAt.toDate?.().toISOString().slice(0, 7) ||
                    new Date(comm.soldAt).toISOString().slice(0, 7);
      if (!summary.byMonth[month]) {
        summary.byMonth[month] = { deals: 0, commission: 0 };
      }
      summary.byMonth[month].deals++;
      summary.byMonth[month].commission += comm.myCommission || 0;
    }

    // Group by assignee
    if (!summary.byAssignee[comm.assignedTo]) {
      summary.byAssignee[comm.assignedTo] = { deals: 0, commission: 0 };
    }
    summary.byAssignee[comm.assignedTo].deals++;
    summary.byAssignee[comm.assignedTo].commission += comm.myCommission || 0;
  });

  return { summary, commissions };
});

/**
 * Mark commission as paid
 */
exports.markCommissionPaid = onCall(async (request) => {
  const db = getFirestore();
  const { commissionId, paymentDate, paymentAmount, paymentMethod } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  // Verify admin/manager role
  const userDoc = await db.collection('users').doc(userId).get();
  const userRole = userDoc.exists ? userDoc.data().role : 'viewer';
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY['manager']) {
    throw new HttpsError('permission-denied', 'Manager access required');
  }

  await db.collection('commissions').doc(commissionId).update({
    status: 'paid',
    paidAt: FieldValue.serverTimestamp(),
    paymentDate: paymentDate ? new Date(paymentDate) : FieldValue.serverTimestamp(),
    paymentAmount: paymentAmount || null,
    paymentMethod: paymentMethod || null,
    paidBy: userId
  });

  return { success: true };
});

// ============================================
// REVIEW & REFERRAL ENGINE
// ============================================

/**
 * Create review request
 */
exports.createReviewRequest = onCall(async (request) => {
  const db = getFirestore();
  const { clientId, platform, triggerEvent } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!clientId) throw new HttpsError('invalid-argument', 'Client ID required');

  // Get client info
  const clientDoc = await db.collection('clients').doc(clientId).get();
  if (!clientDoc.exists) {
    throw new HttpsError('not-found', 'Client not found');
  }
  const client = clientDoc.data();

  const reviewRequest = {
    clientId,
    clientName: client.name || `${client.firstName} ${client.lastName}`,
    clientEmail: client.email,
    platform: platform || 'google', // google, yelp, facebook, bbb
    triggerEvent: triggerEvent || 'manual', // manual, score_milestone, goal_reached, nps_promoter
    status: 'pending', // pending, sent, completed, declined
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp(),
    sentAt: null,
    completedAt: null,
    reviewLink: null,
    reviewRating: null
  };

  const docRef = await db.collection('reviewRequests').add(reviewRequest);

  return { success: true, requestId: docRef.id };
});

/**
 * Track review completion
 */
exports.trackReviewCompletion = onCall(async (request) => {
  const db = getFirestore();
  const { requestId, reviewLink, rating, reviewText } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  await db.collection('reviewRequests').doc(requestId).update({
    status: 'completed',
    completedAt: FieldValue.serverTimestamp(),
    reviewLink: reviewLink || null,
    reviewRating: rating || null,
    reviewText: reviewText || null
  });

  // Award referral credit to client
  const requestDoc = await db.collection('reviewRequests').doc(requestId).get();
  if (requestDoc.exists) {
    const request = requestDoc.data();
    await db.collection('clients').doc(request.clientId).update({
      leftReview: true,
      reviewPlatform: request.platform,
      reviewRating: rating,
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  return { success: true };
});

/**
 * Create referral tracking
 */
exports.createReferral = onCall(async (request) => {
  const db = getFirestore();
  const { referrerId, referredName, referredEmail, referredPhone, notes } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!referrerId) throw new HttpsError('invalid-argument', 'Referrer ID required');

  // Get referrer info
  const referrerDoc = await db.collection('clients').doc(referrerId).get();
  if (!referrerDoc.exists) {
    throw new HttpsError('not-found', 'Referrer not found');
  }
  const referrer = referrerDoc.data();

  const referral = {
    referrerId,
    referrerName: referrer.name || `${referrer.firstName} ${referrer.lastName}`,
    referrerEmail: referrer.email,
    referredName,
    referredEmail,
    referredPhone,
    notes: notes || null,
    status: 'pending', // pending, contacted, converted, lost
    convertedClientId: null,
    rewardType: null, // credit, cash, gift
    rewardAmount: null,
    rewardStatus: 'pending', // pending, awarded, paid
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp(),
    convertedAt: null
  };

  const docRef = await db.collection('referrals').add(referral);

  // Update referrer's referral count
  await db.collection('clients').doc(referrerId).update({
    referralCount: FieldValue.increment(1),
    lastReferralDate: FieldValue.serverTimestamp()
  });

  return { success: true, referralId: docRef.id };
});

/**
 * Convert referral to client
 */
exports.convertReferral = onCall(async (request) => {
  const db = getFirestore();
  const { referralId, clientId, rewardType, rewardAmount } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!referralId) throw new HttpsError('invalid-argument', 'Referral ID required');

  await db.collection('referrals').doc(referralId).update({
    status: 'converted',
    convertedClientId: clientId || null,
    convertedAt: FieldValue.serverTimestamp(),
    rewardType: rewardType || 'credit',
    rewardAmount: rewardAmount || 50, // Default $50 credit
    updatedAt: FieldValue.serverTimestamp()
  });

  // Update referrer's successful referral count
  const referralDoc = await db.collection('referrals').doc(referralId).get();
  if (referralDoc.exists) {
    const referral = referralDoc.data();
    await db.collection('clients').doc(referral.referrerId).update({
      successfulReferrals: FieldValue.increment(1),
      totalReferralRewards: FieldValue.increment(rewardAmount || 50)
    });
  }

  return { success: true };
});

/**
 * Get referral analytics
 */
exports.getReferralAnalytics = onCall(async (request) => {
  const db = getFirestore();
  const { startDate, endDate } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query = db.collection('referrals');

  if (startDate) {
    query = query.where('createdAt', '>=', new Date(startDate));
  }
  if (endDate) {
    query = query.where('createdAt', '<=', new Date(endDate));
  }

  const snapshot = await query.get();
  const referrals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const analytics = {
    totalReferrals: referrals.length,
    pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    convertedReferrals: referrals.filter(r => r.status === 'converted').length,
    conversionRate: 0,
    totalRewardsAwarded: 0,
    topReferrers: []
  };

  if (referrals.length > 0) {
    analytics.conversionRate = Math.round((analytics.convertedReferrals / referrals.length) * 100);
  }

  // Calculate total rewards
  analytics.totalRewardsAwarded = referrals
    .filter(r => r.status === 'converted')
    .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

  // Get top referrers
  const referrerCounts = {};
  referrals.forEach(r => {
    if (!referrerCounts[r.referrerId]) {
      referrerCounts[r.referrerId] = {
        referrerId: r.referrerId,
        referrerName: r.referrerName,
        total: 0,
        converted: 0
      };
    }
    referrerCounts[r.referrerId].total++;
    if (r.status === 'converted') {
      referrerCounts[r.referrerId].converted++;
    }
  });

  analytics.topReferrers = Object.values(referrerCounts)
    .sort((a, b) => b.converted - a.converted)
    .slice(0, 10);

  return { analytics, referrals };
});

// ============================================
// TEAM MEMBER MANAGEMENT
// ============================================

/**
 * Get team members (assistants/sales associates)
 */
exports.getTeamMembers = onCall(async (request) => {
  const db = getFirestore();
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  const snapshot = await db.collection('teamMembers')
    .where('active', '==', true)
    .orderBy('name')
    .get();

  const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return { members };
});

/**
 * Add team member
 */
exports.addTeamMember = onCall(async (request) => {
  const db = getFirestore();
  const { name, email, phone, role, defaultSplit } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  const member = {
    name,
    email,
    phone,
    role: role || 'assistant', // assistant, sales_associate
    defaultSplit: defaultSplit || 50,
    active: true,
    leadsAssigned: 0,
    leadsClosed: 0,
    totalCommission: 0,
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('teamMembers').add(member);

  return { success: true, memberId: docRef.id };
});
