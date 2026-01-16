/**
 * Operations Functions
 * Team Task Manager, Document Vault, and Compliance Calendar
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

const ROLE_HIERARCHY = { admin: 4, manager: 3, user: 2, viewer: 1 };

// ============================================
// TEAM TASK MANAGER
// ============================================

/**
 * Create task for team member
 */
exports.createTask = onCall(async (request) => {
  const db = getFirestore();
  const {
    title,
    description,
    assignedTo,
    priority,
    dueDate,
    clientId,
    category,
    tags
  } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!title) throw new HttpsError('invalid-argument', 'Title required');

  const task = {
    title,
    description: description || '',
    assignedTo: assignedTo || userId,
    assignedBy: userId,
    priority: priority || 'medium', // low, medium, high, urgent
    status: 'pending', // pending, in_progress, completed, cancelled
    dueDate: dueDate ? new Date(dueDate) : null,
    clientId: clientId || null,
    category: category || 'general', // general, dispute, communication, follow_up, document, auto_lead
    tags: tags || [],
    comments: [],
    attachments: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    completedAt: null,
    completedBy: null
  };

  const docRef = await db.collection('tasks').add(task);

  // Create notification for assignee if different from creator
  if (assignedTo && assignedTo !== userId) {
    await db.collection('notifications').add({
      userId: assignedTo,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned: ${title}`,
      taskId: docRef.id,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });
  }

  return { success: true, taskId: docRef.id };
});

/**
 * Update task
 */
exports.updateTask = onCall(async (request) => {
  const db = getFirestore();
  const { taskId, updates } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!taskId) throw new HttpsError('invalid-argument', 'Task ID required');

  const taskRef = db.collection('tasks').doc(taskId);
  const taskDoc = await taskRef.get();

  if (!taskDoc.exists) {
    throw new HttpsError('not-found', 'Task not found');
  }

  const task = taskDoc.data();
  const updateData = {
    ...updates,
    updatedAt: FieldValue.serverTimestamp()
  };

  // Handle status changes
  if (updates.status === 'completed' && task.status !== 'completed') {
    updateData.completedAt = FieldValue.serverTimestamp();
    updateData.completedBy = userId;

    // Notify creator if different from completer
    if (task.assignedBy !== userId) {
      await db.collection('notifications').add({
        userId: task.assignedBy,
        type: 'task_completed',
        title: 'Task Completed',
        message: `Task "${task.title}" has been completed`,
        taskId,
        read: false,
        createdAt: FieldValue.serverTimestamp()
      });
    }
  }

  // Handle reassignment
  if (updates.assignedTo && updates.assignedTo !== task.assignedTo) {
    await db.collection('notifications').add({
      userId: updates.assignedTo,
      type: 'task_assigned',
      title: 'Task Reassigned to You',
      message: `You have been assigned: ${task.title}`,
      taskId,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });
  }

  await taskRef.update(updateData);

  return { success: true };
});

/**
 * Add comment to task
 */
exports.addTaskComment = onCall(async (request) => {
  const db = getFirestore();
  const { taskId, comment } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!taskId || !comment) throw new HttpsError('invalid-argument', 'Task ID and comment required');

  // Get user info
  const userDoc = await db.collection('users').doc(userId).get();
  const userName = userDoc.exists ? userDoc.data().name || userDoc.data().email : 'Unknown';

  await db.collection('tasks').doc(taskId).update({
    comments: FieldValue.arrayUnion({
      id: `${Date.now()}-${userId}`,
      userId,
      userName,
      text: comment,
      createdAt: new Date().toISOString()
    }),
    updatedAt: FieldValue.serverTimestamp()
  });

  return { success: true };
});

/**
 * Get tasks with filtering
 */
exports.getTasks = onCall(async (request) => {
  const db = getFirestore();
  const { assignedTo, status, priority, category, clientId, dueAfter, dueBefore } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query = db.collection('tasks');

  if (assignedTo) query = query.where('assignedTo', '==', assignedTo);
  if (status) query = query.where('status', '==', status);
  if (priority) query = query.where('priority', '==', priority);
  if (category) query = query.where('category', '==', category);
  if (clientId) query = query.where('clientId', '==', clientId);

  query = query.orderBy('createdAt', 'desc').limit(200);

  const snapshot = await query.get();
  let tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Filter by due date if provided (can't do multiple orderBy without composite index)
  if (dueAfter) {
    const after = new Date(dueAfter);
    tasks = tasks.filter(t => t.dueDate && t.dueDate.toDate?.() >= after);
  }
  if (dueBefore) {
    const before = new Date(dueBefore);
    tasks = tasks.filter(t => t.dueDate && t.dueDate.toDate?.() <= before);
  }

  return { tasks };
});

/**
 * Get task dashboard summary
 */
exports.getTaskDashboard = onCall(async (request) => {
  const db = getFirestore();
  const { userId: filterUserId } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  const targetUserId = filterUserId || userId;

  // Get all non-completed tasks for user
  const tasksSnapshot = await db.collection('tasks')
    .where('assignedTo', '==', targetUserId)
    .where('status', 'in', ['pending', 'in_progress'])
    .get();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const dashboard = {
    total: tasksSnapshot.size,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    dueToday: 0,
    dueThisWeek: 0,
    byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
    byCategory: {},
    urgentTasks: [],
    overdueTasks: []
  };

  tasksSnapshot.docs.forEach(doc => {
    const task = doc.data();
    const dueDate = task.dueDate?.toDate?.() || (task.dueDate ? new Date(task.dueDate) : null);

    // Status counts
    if (task.status === 'pending') dashboard.pending++;
    if (task.status === 'in_progress') dashboard.inProgress++;

    // Due date analysis
    if (dueDate) {
      if (dueDate < today) {
        dashboard.overdue++;
        dashboard.overdueTasks.push({ id: doc.id, ...task });
      } else if (dueDate >= today && dueDate < tomorrow) {
        dashboard.dueToday++;
      } else if (dueDate < weekEnd) {
        dashboard.dueThisWeek++;
      }
    }

    // Priority counts
    if (task.priority && dashboard.byPriority[task.priority] !== undefined) {
      dashboard.byPriority[task.priority]++;
    }

    // Category counts
    const cat = task.category || 'general';
    if (!dashboard.byCategory[cat]) dashboard.byCategory[cat] = 0;
    dashboard.byCategory[cat]++;

    // Urgent tasks
    if (task.priority === 'urgent' || task.priority === 'high') {
      dashboard.urgentTasks.push({ id: doc.id, ...task });
    }
  });

  // Sort urgent and overdue
  dashboard.urgentTasks.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  dashboard.urgentTasks = dashboard.urgentTasks.slice(0, 10);
  dashboard.overdueTasks = dashboard.overdueTasks.slice(0, 10);

  return dashboard;
});

/**
 * Check for overdue tasks (runs daily at 8 AM)
 */
exports.checkOverdueTasks = onSchedule('0 8 * * *', async (event) => {
  const db = getFirestore();
  const now = new Date();

  // Get all pending/in_progress tasks that are overdue
  const tasksSnapshot = await db.collection('tasks')
    .where('status', 'in', ['pending', 'in_progress'])
    .where('dueDate', '<', now)
    .get();

  for (const taskDoc of tasksSnapshot.docs) {
    const task = taskDoc.data();

    // Check if we already sent an overdue notification today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const existingNotif = await db.collection('notifications')
      .where('taskId', '==', taskDoc.id)
      .where('type', '==', 'task_overdue')
      .where('createdAt', '>=', todayStart)
      .limit(1)
      .get();

    if (existingNotif.empty) {
      // Send notification to assignee
      await db.collection('notifications').add({
        userId: task.assignedTo,
        type: 'task_overdue',
        title: 'Task Overdue',
        message: `"${task.title}" is past due`,
        taskId: taskDoc.id,
        read: false,
        createdAt: FieldValue.serverTimestamp()
      });

      // Also notify the assigner
      if (task.assignedBy !== task.assignedTo) {
        await db.collection('notifications').add({
          userId: task.assignedBy,
          type: 'task_overdue',
          title: 'Assigned Task Overdue',
          message: `Task "${task.title}" assigned to ${task.assignedTo} is past due`,
          taskId: taskDoc.id,
          read: false,
          createdAt: FieldValue.serverTimestamp()
        });
      }
    }
  }

  console.log(`Checked ${tasksSnapshot.size} overdue tasks`);
});

// ============================================
// DOCUMENT VAULT
// ============================================

/**
 * Register document in vault
 */
exports.registerDocument = onCall(async (request) => {
  const db = getFirestore();
  const {
    clientId,
    documentType,
    fileName,
    fileUrl,
    fileSize,
    mimeType,
    description,
    tags,
    expirationDate
  } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!fileName || !fileUrl) throw new HttpsError('invalid-argument', 'File name and URL required');

  const document = {
    clientId: clientId || null,
    documentType: documentType || 'general', // id, ssn_card, credit_report, agreement, correspondence, dispute_letter, other
    fileName,
    fileUrl,
    fileSize: fileSize || null,
    mimeType: mimeType || 'application/octet-stream',
    description: description || '',
    tags: tags || [],
    expirationDate: expirationDate ? new Date(expirationDate) : null,
    status: 'active', // active, archived, expired
    uploadedBy: userId,
    uploadedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    accessLog: [{
      userId,
      action: 'uploaded',
      timestamp: new Date().toISOString()
    }]
  };

  const docRef = await db.collection('documents').add(document);

  // Update client document count if applicable
  if (clientId) {
    await db.collection('clients').doc(clientId).update({
      documentCount: FieldValue.increment(1),
      lastDocumentUpload: FieldValue.serverTimestamp()
    });
  }

  return { success: true, documentId: docRef.id };
});

/**
 * Get documents with filtering
 */
exports.getDocuments = onCall(async (request) => {
  const db = getFirestore();
  const { clientId, documentType, status, tags } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query = db.collection('documents');

  if (clientId) query = query.where('clientId', '==', clientId);
  if (documentType) query = query.where('documentType', '==', documentType);
  if (status) query = query.where('status', '==', status);

  query = query.orderBy('uploadedAt', 'desc').limit(200);

  const snapshot = await query.get();
  let documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Filter by tags if provided
  if (tags && tags.length > 0) {
    documents = documents.filter(doc =>
      tags.some(tag => doc.tags?.includes(tag))
    );
  }

  return { documents };
});

/**
 * Log document access
 */
exports.logDocumentAccess = onCall(async (request) => {
  const db = getFirestore();
  const { documentId, action } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  await db.collection('documents').doc(documentId).update({
    accessLog: FieldValue.arrayUnion({
      userId,
      action: action || 'viewed',
      timestamp: new Date().toISOString()
    }),
    lastAccessedAt: FieldValue.serverTimestamp(),
    lastAccessedBy: userId
  });

  return { success: true };
});

/**
 * Archive document
 */
exports.archiveDocument = onCall(async (request) => {
  const db = getFirestore();
  const { documentId, reason } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  await db.collection('documents').doc(documentId).update({
    status: 'archived',
    archivedAt: FieldValue.serverTimestamp(),
    archivedBy: userId,
    archiveReason: reason || null,
    accessLog: FieldValue.arrayUnion({
      userId,
      action: 'archived',
      timestamp: new Date().toISOString(),
      reason
    })
  });

  return { success: true };
});

/**
 * Check for expiring documents (runs daily at 7 AM)
 */
exports.checkExpiringDocuments = onSchedule('0 7 * * *', async (event) => {
  const db = getFirestore();
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  // Get documents expiring in next 30 days
  const expiringSnapshot = await db.collection('documents')
    .where('status', '==', 'active')
    .where('expirationDate', '<=', thirtyDaysFromNow)
    .where('expirationDate', '>=', now)
    .get();

  for (const doc of expiringSnapshot.docs) {
    const document = doc.data();
    const daysUntilExpiry = Math.ceil(
      (document.expirationDate.toDate() - now) / (1000 * 60 * 60 * 24)
    );

    // Create alert
    await db.collection('documentAlerts').add({
      documentId: doc.id,
      clientId: document.clientId,
      documentType: document.documentType,
      fileName: document.fileName,
      expirationDate: document.expirationDate,
      daysUntilExpiry,
      alertType: daysUntilExpiry <= 7 ? 'urgent' : 'warning',
      createdAt: FieldValue.serverTimestamp(),
      acknowledged: false
    });
  }

  // Mark expired documents
  const expiredSnapshot = await db.collection('documents')
    .where('status', '==', 'active')
    .where('expirationDate', '<', now)
    .get();

  for (const doc of expiredSnapshot.docs) {
    await doc.ref.update({
      status: 'expired',
      expiredAt: FieldValue.serverTimestamp()
    });
  }

  console.log(`Found ${expiringSnapshot.size} expiring documents, marked ${expiredSnapshot.size} as expired`);
});

// ============================================
// COMPLIANCE CALENDAR
// ============================================

/**
 * Create compliance event
 */
exports.createComplianceEvent = onCall(async (request) => {
  const db = getFirestore();
  const {
    title,
    description,
    eventType,
    dueDate,
    recurring,
    recurrencePattern,
    clientId,
    regulation,
    priority
  } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');
  if (!title || !dueDate) throw new HttpsError('invalid-argument', 'Title and due date required');

  const event = {
    title,
    description: description || '',
    eventType: eventType || 'deadline', // deadline, review, training, filing, audit
    dueDate: new Date(dueDate),
    recurring: recurring || false,
    recurrencePattern: recurrencePattern || null, // daily, weekly, monthly, quarterly, annually
    clientId: clientId || null,
    regulation: regulation || null, // FCRA, CROA, FDCPA, state-specific
    priority: priority || 'medium',
    status: 'upcoming', // upcoming, due, overdue, completed
    assignedTo: [],
    reminders: [],
    completedAt: null,
    completedBy: null,
    createdBy: userId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('complianceEvents').add(event);

  return { success: true, eventId: docRef.id };
});

/**
 * Get compliance calendar
 */
exports.getComplianceCalendar = onCall(async (request) => {
  const db = getFirestore();
  const { startDate, endDate, eventType, regulation, status } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query = db.collection('complianceEvents');

  if (startDate) query = query.where('dueDate', '>=', new Date(startDate));
  if (endDate) query = query.where('dueDate', '<=', new Date(endDate));
  if (eventType) query = query.where('eventType', '==', eventType);
  if (regulation) query = query.where('regulation', '==', regulation);
  if (status) query = query.where('status', '==', status);

  query = query.orderBy('dueDate', 'asc');

  const snapshot = await query.get();
  const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return { events };
});

/**
 * Complete compliance event
 */
exports.completeComplianceEvent = onCall(async (request) => {
  const db = getFirestore();
  const { eventId, notes, attachments } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  const eventRef = db.collection('complianceEvents').doc(eventId);
  const eventDoc = await eventRef.get();

  if (!eventDoc.exists) {
    throw new HttpsError('not-found', 'Event not found');
  }

  const event = eventDoc.data();

  await eventRef.update({
    status: 'completed',
    completedAt: FieldValue.serverTimestamp(),
    completedBy: userId,
    completionNotes: notes || null,
    completionAttachments: attachments || [],
    updatedAt: FieldValue.serverTimestamp()
  });

  // If recurring, create next occurrence
  if (event.recurring && event.recurrencePattern) {
    const nextDate = calculateNextOccurrence(event.dueDate.toDate(), event.recurrencePattern);

    await db.collection('complianceEvents').add({
      ...event,
      dueDate: nextDate,
      status: 'upcoming',
      completedAt: null,
      completedBy: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      previousOccurrence: eventId
    });
  }

  return { success: true };
});

function calculateNextOccurrence(date, pattern) {
  const next = new Date(date);

  switch (pattern) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'annually':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

/**
 * Initialize standard compliance events
 */
exports.initializeComplianceCalendar = onCall(async (request) => {
  const db = getFirestore();
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  // Check admin role
  const userDoc = await db.collection('users').doc(userId).get();
  const userRole = userDoc.exists ? userDoc.data().role : 'viewer';
  if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY['admin']) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }

  const standardEvents = [
    {
      title: 'Monthly FCRA Compliance Review',
      description: 'Review all active disputes for FCRA compliance, ensure 30-day response tracking',
      eventType: 'review',
      regulation: 'FCRA',
      recurring: true,
      recurrencePattern: 'monthly',
      priority: 'high'
    },
    {
      title: 'Quarterly Staff Training Review',
      description: 'Verify all staff have completed required compliance training',
      eventType: 'training',
      regulation: 'CROA',
      recurring: true,
      recurrencePattern: 'quarterly',
      priority: 'medium'
    },
    {
      title: 'Annual Bond Renewal Review',
      description: 'Review and renew credit repair surety bond if required by state',
      eventType: 'filing',
      regulation: 'state-specific',
      recurring: true,
      recurrencePattern: 'annually',
      priority: 'high'
    },
    {
      title: 'Weekly Dispute Status Update',
      description: 'Review all pending disputes and update client statuses',
      eventType: 'review',
      regulation: 'FCRA',
      recurring: true,
      recurrencePattern: 'weekly',
      priority: 'medium'
    },
    {
      title: 'Monthly Client Agreement Audit',
      description: 'Audit client agreements for CROA compliance (cancellation rights, disclosures)',
      eventType: 'audit',
      regulation: 'CROA',
      recurring: true,
      recurrencePattern: 'monthly',
      priority: 'high'
    }
  ];

  const now = new Date();
  const created = [];

  for (const event of standardEvents) {
    // Calculate first due date based on recurrence
    let dueDate = new Date(now);
    switch (event.recurrencePattern) {
      case 'weekly':
        dueDate.setDate(dueDate.getDate() + (7 - dueDate.getDay())); // Next Sunday
        break;
      case 'monthly':
        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First of next month
        break;
      case 'quarterly':
        const nextQuarter = Math.ceil((now.getMonth() + 1) / 3) * 3;
        dueDate = new Date(now.getFullYear(), nextQuarter, 1);
        break;
      case 'annually':
        dueDate = new Date(now.getFullYear() + 1, 0, 1); // Jan 1 next year
        break;
    }

    const docRef = await db.collection('complianceEvents').add({
      ...event,
      dueDate,
      status: 'upcoming',
      assignedTo: [],
      reminders: [],
      completedAt: null,
      completedBy: null,
      createdBy: userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    created.push({ id: docRef.id, title: event.title });
  }

  return { success: true, created };
});

/**
 * Check compliance deadlines (runs daily at 6 AM)
 */
exports.checkComplianceDeadlines = onSchedule('0 6 * * *', async (event) => {
  const db = getFirestore();
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Get upcoming events in next 7 days
  const upcomingSnapshot = await db.collection('complianceEvents')
    .where('status', '==', 'upcoming')
    .where('dueDate', '<=', nextWeek)
    .get();

  for (const doc of upcomingSnapshot.docs) {
    const event = doc.data();
    const dueDate = event.dueDate.toDate();
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    // Update status if due
    if (daysUntilDue <= 0) {
      await doc.ref.update({ status: 'due' });
    }

    // Create reminder for events due soon
    if (daysUntilDue <= 3 && daysUntilDue > 0) {
      await db.collection('complianceAlerts').add({
        eventId: doc.id,
        title: event.title,
        regulation: event.regulation,
        dueDate: event.dueDate,
        daysUntilDue,
        alertType: daysUntilDue === 1 ? 'urgent' : 'warning',
        createdAt: FieldValue.serverTimestamp(),
        acknowledged: false
      });
    }
  }

  // Mark overdue events
  const overdueSnapshot = await db.collection('complianceEvents')
    .where('status', 'in', ['upcoming', 'due'])
    .where('dueDate', '<', now)
    .get();

  for (const doc of overdueSnapshot.docs) {
    await doc.ref.update({ status: 'overdue' });

    // Create urgent alert
    await db.collection('complianceAlerts').add({
      eventId: doc.id,
      title: doc.data().title,
      regulation: doc.data().regulation,
      dueDate: doc.data().dueDate,
      alertType: 'critical',
      message: 'Compliance deadline has passed!',
      createdAt: FieldValue.serverTimestamp(),
      acknowledged: false
    });
  }

  console.log(`Compliance check: ${upcomingSnapshot.size} upcoming, ${overdueSnapshot.size} overdue`);
});

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Get user notifications
 */
exports.getNotifications = onCall(async (request) => {
  const db = getFirestore();
  const { unreadOnly, limit: resultLimit } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  let query = db.collection('notifications').where('userId', '==', userId);

  if (unreadOnly) {
    query = query.where('read', '==', false);
  }

  query = query.orderBy('createdAt', 'desc').limit(resultLimit || 50);

  const snapshot = await query.get();
  const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return { notifications };
});

/**
 * Mark notification as read
 */
exports.markNotificationRead = onCall(async (request) => {
  const db = getFirestore();
  const { notificationId, markAllRead } = request.data;
  const userId = request.auth?.uid;

  if (!userId) throw new HttpsError('unauthenticated', 'Must be logged in');

  if (markAllRead) {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true, readAt: FieldValue.serverTimestamp() });
    });
    await batch.commit();

    return { success: true, marked: snapshot.size };
  } else if (notificationId) {
    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: FieldValue.serverTimestamp()
    });
    return { success: true };
  }

  throw new HttpsError('invalid-argument', 'Notification ID or markAllRead required');
});

// ============================================
// WEB LEAD CAPTURE
// Added: January 13, 2026
// ============================================

/**
 * Capture web lead from landing page
 * Creates contact immediately, triggers email workflow, enables drip campaigns
 */
exports.captureWebLead = onCall(async (request) => {
  const db = getFirestore();
  
  try {
    const { firstName, lastName, email, phone } = request.data;
    
    console.log('📋 Capturing web lead:', { firstName, lastName, email, phone });
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      throw new HttpsError('invalid-argument', 'Missing required fields: firstName, lastName, email, phone');
    }
    
    // Normalize data
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim().replace(/\D/g, ''); // Remove non-digits
    
    // Check for existing contact with same email
    const existingSnapshot = await db.collection('contacts')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();
    
    if (!existingSnapshot.empty) {
      const existingContact = existingSnapshot.docs[0];
      const contactId = existingContact.id;
      const contactData = existingContact.data();
      
      console.log('ℹ️  Contact already exists:', contactId);
      
      // Update enrollment status if not already enrolled
      if (contactData.enrollmentStatus !== 'completed') {
        await db.collection('contacts').doc(contactId).update({
          enrollmentStatus: 'started',
          enrollmentStartedAt: FieldValue.serverTimestamp(),
          lastActivityAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
        
        console.log('✅ Updated existing contact enrollment status');
      }
      
      return {
        success: true,
        contactId: contactId,
        existed: true,
        message: 'Existing contact updated'
      };
    }
    
    // Create new contact in Firestore
    const contactRef = await db.collection('contacts').add({
      // Basic info
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      
      // Role setup
      roles: ['contact', 'lead'],
      primaryRole: 'lead',
      
      // Lead tracking
      leadSource: 'website',
      leadStatus: 'new',
      leadScore: 5, // Initial score
      
      // Enrollment tracking
      enrollmentStatus: 'started',
      enrollmentStartedAt: FieldValue.serverTimestamp(),
      enrollmentCompletedAt: null,
      
      // Activity tracking
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastActivityAt: FieldValue.serverTimestamp(),
      
      // Communication preferences
      emailOptIn: true,
      smsOptIn: true,
      
      // Flags
      isActive: true,
      isTest: false,
      
      // Metadata
      createdBy: 'web-landing-page',
      createdVia: 'landing-page-form'
    });
    
    const contactId = contactRef.id;
    
    console.log('✅ Contact created:', contactId);
    
    // Trigger welcome email workflow
    try {
      await db.collection('emailQueue').add({
        to: normalizedEmail,
        template: 'welcome-lead',
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          contactId: contactId
        },
        status: 'pending',
        priority: 'high',
        createdAt: FieldValue.serverTimestamp(),
        attempts: 0
      });
      
      console.log('📧 Welcome email queued');
    } catch (emailErr) {
      console.error('⚠️  Email queue failed (non-blocking):', emailErr);
    }
    
    // Create initial task for follow-up
    try {
      await db.collection('tasks').add({
        title: `Follow up with new lead: ${firstName} ${lastName}`,
        description: `New lead captured from website. Email: ${normalizedEmail}, Phone: ${normalizedPhone}`,
        assignedTo: null,
        assignedBy: 'system',
        priority: 'high',
        status: 'pending',
        category: 'auto_lead',
        clientId: contactId,
        tags: ['web-lead', 'new-lead', 'follow-up'],
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        completedAt: null,
        completedBy: null,
        comments: [],
        attachments: []
      });
      
      console.log('✅ Follow-up task created');
    } catch (taskErr) {
      console.error('⚠️  Task creation failed (non-blocking):', taskErr);
    }
    
    return {
      success: true,
      contactId: contactId,
      existed: false,
      message: 'Lead captured successfully'
    };
    
  } catch (error) {
    console.error('❌ Error capturing web lead:', error);
    throw new HttpsError('internal', `Failed to capture lead: ${error.message}`);
  }
});