// src/services/taskService.js
// ============================================================================
// TIER 3 TASK SERVICE - Complete Firebase CRUD + Real-time Operations
// ============================================================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Collection names
const COLLECTIONS = {
  TASKS: 'tasks',
  TASK_TEMPLATES: 'taskTemplates',
  TASK_COMMENTS: 'taskComments',
  TIME_ENTRIES: 'timeEntries',
  AUTOMATION_RULES: 'automationRules',
  RECURRING_TASKS: 'recurringTasks',
  TASK_HISTORY: 'taskHistory',
  TASK_ATTACHMENTS: 'taskAttachments'
};

// Task status constants
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DEFERRED: 'deferred'
};

// Task priority levels
export const TASK_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NONE: 'none'
};

// Eisenhower Matrix quadrants
export const EISENHOWER_QUADRANT = {
  DO_FIRST: 'do_first',      // Urgent & Important
  SCHEDULE: 'schedule',       // Important, Not Urgent
  DELEGATE: 'delegate',       // Urgent, Not Important
  ELIMINATE: 'eliminate'      // Neither
};

// Task categories for credit repair
export const TASK_CATEGORIES = {
  DISPUTE: 'dispute',
  FOLLOW_UP: 'follow_up',
  CLIENT_ONBOARDING: 'client_onboarding',
  DOCUMENT_REVIEW: 'document_review',
  CREDIT_ANALYSIS: 'credit_analysis',
  BUREAU_COMMUNICATION: 'bureau_communication',
  CLIENT_MEETING: 'client_meeting',
  ADMINISTRATIVE: 'administrative',
  MARKETING: 'marketing',
  SALES: 'sales',
  SUPPORT: 'support',
  TRAINING: 'training',
  OTHER: 'other'
};

class TaskService {
  constructor() {
    this.listeners = new Map();
  }

  // ============================================================================
  // TASK CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new task
   */
  async createTask(taskData) {
    try {
      const task = {
        // Core fields
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || TASK_STATUS.TODO,
        priority: taskData.priority || TASK_PRIORITY.MEDIUM,
        category: taskData.category || TASK_CATEGORIES.OTHER,

        // Eisenhower Matrix
        eisenhowerQuadrant: taskData.eisenhowerQuadrant || null,
        isUrgent: taskData.isUrgent || false,
        isImportant: taskData.isImportant || false,

        // Assignment
        assignedTo: taskData.assignedTo || null,
        assignedBy: taskData.assignedBy || null,
        teamId: taskData.teamId || null,

        // Timing
        dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null,
        startDate: taskData.startDate ? Timestamp.fromDate(new Date(taskData.startDate)) : null,
        estimatedMinutes: taskData.estimatedMinutes || 0,
        actualMinutes: taskData.actualMinutes || 0,

        // Relationships
        clientId: taskData.clientId || null,
        contactId: taskData.contactId || null,
        disputeId: taskData.disputeId || null,
        projectId: taskData.projectId || null,
        parentTaskId: taskData.parentTaskId || null,
        dependencies: taskData.dependencies || [],

        // Recurrence
        isRecurring: taskData.isRecurring || false,
        recurringRuleId: taskData.recurringRuleId || null,

        // AI metadata
        aiPriorityScore: taskData.aiPriorityScore || 0,
        aiComplexityScore: taskData.aiComplexityScore || 0,
        aiRiskScore: taskData.aiRiskScore || 0,
        aiSuggestions: taskData.aiSuggestions || [],
        aiTags: taskData.aiTags || [],

        // Calendar integration
        calendarEventId: taskData.calendarEventId || null,
        googleCalendarId: taskData.googleCalendarId || null,

        // Additional metadata
        tags: taskData.tags || [],
        labels: taskData.labels || [],
        color: taskData.color || null,
        attachmentCount: taskData.attachmentCount || 0,
        commentCount: taskData.commentCount || 0,
        subtaskCount: taskData.subtaskCount || 0,
        completedSubtasks: taskData.completedSubtasks || 0,

        // Progress tracking
        progress: taskData.progress || 0,
        checklist: taskData.checklist || [],

        // Notifications
        reminders: taskData.reminders || [],
        notifyOnComplete: taskData.notifyOnComplete || false,

        // Audit
        createdBy: taskData.createdBy || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completedAt: null,
        completedBy: null
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), task);

      // Log history
      await this.logTaskHistory(docRef.id, 'created', null, task, taskData.createdBy);

      return { success: true, id: docRef.id, task: { id: docRef.id, ...task } };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId, updates, userId = null) {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);

      if (!taskSnap.exists()) {
        return { success: false, error: 'Task not found' };
      }

      const previousData = taskSnap.data();

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Handle status changes
      if (updates.status === TASK_STATUS.COMPLETED && previousData.status !== TASK_STATUS.COMPLETED) {
        updateData.completedAt = serverTimestamp();
        updateData.completedBy = userId;
        updateData.progress = 100;
      }

      // Handle date conversions
      if (updates.dueDate && !(updates.dueDate instanceof Timestamp)) {
        updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
      }
      if (updates.startDate && !(updates.startDate instanceof Timestamp)) {
        updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
      }

      await updateDoc(taskRef, updateData);

      // Log history
      await this.logTaskHistory(taskId, 'updated', previousData, updateData, userId);

      return { success: true, id: taskId };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId, userId = null) {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);

      if (!taskSnap.exists()) {
        return { success: false, error: 'Task not found' };
      }

      // Log history before deletion
      await this.logTaskHistory(taskId, 'deleted', taskSnap.data(), null, userId);

      await deleteDoc(taskRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId) {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);

      if (!taskSnap.exists()) {
        return { success: false, error: 'Task not found' };
      }

      return { success: true, task: { id: taskSnap.id, ...taskSnap.data() } };
    } catch (error) {
      console.error('Error getting task:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get tasks with filters
   */
  async getTasks(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.TASKS);
      const constraints = [];

      if (filters.assignedTo) {
        constraints.push(where('assignedTo', '==', filters.assignedTo));
      }
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.statuses && filters.statuses.length > 0) {
        constraints.push(where('status', 'in', filters.statuses));
      }
      if (filters.priority) {
        constraints.push(where('priority', '==', filters.priority));
      }
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }
      if (filters.clientId) {
        constraints.push(where('clientId', '==', filters.clientId));
      }
      if (filters.projectId) {
        constraints.push(where('projectId', '==', filters.projectId));
      }
      if (filters.teamId) {
        constraints.push(where('teamId', '==', filters.teamId));
      }
      if (filters.dueBefore) {
        constraints.push(where('dueDate', '<=', Timestamp.fromDate(new Date(filters.dueBefore))));
      }
      if (filters.dueAfter) {
        constraints.push(where('dueDate', '>=', Timestamp.fromDate(new Date(filters.dueAfter))));
      }

      // Apply constraints
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      // Apply ordering
      const orderField = filters.orderBy || 'createdAt';
      const orderDir = filters.orderDirection || 'desc';
      q = query(q, orderBy(orderField, orderDir));

      // Apply limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, tasks };
    } catch (error) {
      console.error('Error getting tasks:', error);
      return { success: false, error: error.message, tasks: [] };
    }
  }

  /**
   * Subscribe to real-time task updates
   */
  subscribeToTasks(filters = {}, callback) {
    try {
      let q = collection(db, COLLECTIONS.TASKS);
      const constraints = [];

      if (filters.assignedTo) {
        constraints.push(where('assignedTo', '==', filters.assignedTo));
      }
      if (filters.teamId) {
        constraints.push(where('teamId', '==', filters.teamId));
      }
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints, orderBy('createdAt', 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(tasks);
      }, (error) => {
        console.error('Error subscribing to tasks:', error);
        callback([], error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up task subscription:', error);
      return () => {};
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk update tasks
   */
  async bulkUpdateTasks(taskIds, updates, userId = null) {
    try {
      const batch = writeBatch(db);
      const updateData = { ...updates, updatedAt: serverTimestamp() };

      taskIds.forEach(taskId => {
        const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
        batch.update(taskRef, updateData);
      });

      await batch.commit();

      return { success: true, count: taskIds.length };
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Bulk delete tasks
   */
  async bulkDeleteTasks(taskIds, userId = null) {
    try {
      const batch = writeBatch(db);

      taskIds.forEach(taskId => {
        const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
        batch.delete(taskRef);
      });

      await batch.commit();

      return { success: true, count: taskIds.length };
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // TASK TEMPLATES
  // ============================================================================

  /**
   * Create a task template
   */
  async createTemplate(templateData) {
    try {
      const template = {
        name: templateData.name || '',
        description: templateData.description || '',
        category: templateData.category || TASK_CATEGORIES.OTHER,

        // Template task defaults
        defaultTitle: templateData.defaultTitle || '',
        defaultDescription: templateData.defaultDescription || '',
        defaultPriority: templateData.defaultPriority || TASK_PRIORITY.MEDIUM,
        defaultEstimatedMinutes: templateData.defaultEstimatedMinutes || 0,
        defaultChecklist: templateData.defaultChecklist || [],
        defaultTags: templateData.defaultTags || [],

        // Workflow steps
        steps: templateData.steps || [],

        // Credit repair specific
        disputeType: templateData.disputeType || null,
        bureaus: templateData.bureaus || [],

        // Usage tracking
        usageCount: 0,
        lastUsed: null,

        // Audit
        createdBy: templateData.createdBy || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.TASK_TEMPLATES), template);

      return { success: true, id: docRef.id, template: { id: docRef.id, ...template } };
    } catch (error) {
      console.error('Error creating template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all templates
   */
  async getTemplates(category = null) {
    try {
      let q = query(
        collection(db, COLLECTIONS.TASK_TEMPLATES),
        where('isActive', '==', true)
      );

      if (category) {
        q = query(q, where('category', '==', category));
      }

      q = query(q, orderBy('name', 'asc'));

      const snapshot = await getDocs(q);
      const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, templates };
    } catch (error) {
      console.error('Error getting templates:', error);
      return { success: false, error: error.message, templates: [] };
    }
  }

  /**
   * Create task from template
   */
  async createTaskFromTemplate(templateId, overrides = {}, userId = null) {
    try {
      const templateRef = doc(db, COLLECTIONS.TASK_TEMPLATES, templateId);
      const templateSnap = await getDoc(templateRef);

      if (!templateSnap.exists()) {
        return { success: false, error: 'Template not found' };
      }

      const template = templateSnap.data();

      const taskData = {
        title: overrides.title || template.defaultTitle,
        description: overrides.description || template.defaultDescription,
        priority: overrides.priority || template.defaultPriority,
        category: template.category,
        estimatedMinutes: template.defaultEstimatedMinutes,
        checklist: template.defaultChecklist.map(item => ({ ...item, completed: false })),
        tags: [...template.defaultTags, ...(overrides.tags || [])],
        templateId: templateId,
        createdBy: userId,
        ...overrides
      };

      const result = await this.createTask(taskData);

      // Update template usage
      await updateDoc(templateRef, {
        usageCount: (template.usageCount || 0) + 1,
        lastUsed: serverTimestamp()
      });

      return result;
    } catch (error) {
      console.error('Error creating task from template:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // RECURRING TASKS
  // ============================================================================

  /**
   * Create a recurring task rule
   */
  async createRecurringRule(ruleData) {
    try {
      const rule = {
        name: ruleData.name || '',
        templateId: ruleData.templateId || null,

        // Recurrence pattern
        frequency: ruleData.frequency || 'daily', // daily, weekly, monthly, custom
        interval: ruleData.interval || 1,
        daysOfWeek: ruleData.daysOfWeek || [], // [0-6] for weekly
        dayOfMonth: ruleData.dayOfMonth || null,

        // Time settings
        createTime: ruleData.createTime || '09:00',
        timezone: ruleData.timezone || 'America/New_York',

        // Assignment
        assignTo: ruleData.assignTo || null,
        teamId: ruleData.teamId || null,

        // Task defaults
        taskDefaults: ruleData.taskDefaults || {},

        // Schedule bounds
        startDate: ruleData.startDate ? Timestamp.fromDate(new Date(ruleData.startDate)) : serverTimestamp(),
        endDate: ruleData.endDate ? Timestamp.fromDate(new Date(ruleData.endDate)) : null,

        // Tracking
        lastRun: null,
        nextRun: null,
        runCount: 0,

        // Status
        isActive: true,
        isPaused: false,

        // Audit
        createdBy: ruleData.createdBy || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.RECURRING_TASKS), rule);

      return { success: true, id: docRef.id, rule: { id: docRef.id, ...rule } };
    } catch (error) {
      console.error('Error creating recurring rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all recurring rules
   */
  async getRecurringRules(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.RECURRING_TASKS);
      const constraints = [];

      if (filters.isActive !== undefined) {
        constraints.push(where('isActive', '==', filters.isActive));
      }
      if (filters.teamId) {
        constraints.push(where('teamId', '==', filters.teamId));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      const rules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, rules };
    } catch (error) {
      console.error('Error getting recurring rules:', error);
      return { success: false, error: error.message, rules: [] };
    }
  }

  // ============================================================================
  // AUTOMATION RULES
  // ============================================================================

  /**
   * Create an automation rule
   */
  async createAutomationRule(ruleData) {
    try {
      const rule = {
        name: ruleData.name || '',
        description: ruleData.description || '',

        // Trigger configuration
        triggerType: ruleData.triggerType || 'event', // event, schedule, condition
        triggerEvent: ruleData.triggerEvent || null, // task_created, task_completed, etc.
        triggerConditions: ruleData.triggerConditions || [],

        // Action configuration
        actionType: ruleData.actionType || 'create_task', // create_task, update_task, notify, etc.
        actionConfig: ruleData.actionConfig || {},

        // Filters
        filters: ruleData.filters || {},

        // Status
        isActive: true,

        // Stats
        executionCount: 0,
        lastExecution: null,
        lastError: null,

        // Audit
        createdBy: ruleData.createdBy || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.AUTOMATION_RULES), rule);

      return { success: true, id: docRef.id, rule: { id: docRef.id, ...rule } };
    } catch (error) {
      console.error('Error creating automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get automation rules
   */
  async getAutomationRules(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.AUTOMATION_RULES);

      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      const rules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, rules };
    } catch (error) {
      console.error('Error getting automation rules:', error);
      return { success: false, error: error.message, rules: [] };
    }
  }

  // ============================================================================
  // TIME TRACKING
  // ============================================================================

  /**
   * Start time tracking for a task
   */
  async startTimeTracking(taskId, userId) {
    try {
      const entry = {
        taskId,
        userId,
        startTime: serverTimestamp(),
        endTime: null,
        duration: 0,
        notes: '',
        isBillable: true,
        isRunning: true,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.TIME_ENTRIES), entry);

      return { success: true, id: docRef.id, entry: { id: docRef.id, ...entry } };
    } catch (error) {
      console.error('Error starting time tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop time tracking
   */
  async stopTimeTracking(entryId, notes = '') {
    try {
      const entryRef = doc(db, COLLECTIONS.TIME_ENTRIES, entryId);
      const entrySnap = await getDoc(entryRef);

      if (!entrySnap.exists()) {
        return { success: false, error: 'Time entry not found' };
      }

      const entry = entrySnap.data();
      const startTime = entry.startTime.toDate();
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 60000); // minutes

      await updateDoc(entryRef, {
        endTime: serverTimestamp(),
        duration,
        notes,
        isRunning: false
      });

      // Update task actual minutes
      if (entry.taskId) {
        const taskRef = doc(db, COLLECTIONS.TASKS, entry.taskId);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          const task = taskSnap.data();
          await updateDoc(taskRef, {
            actualMinutes: (task.actualMinutes || 0) + duration,
            updatedAt: serverTimestamp()
          });
        }
      }

      return { success: true, duration };
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get time entries for a task or user
   */
  async getTimeEntries(filters = {}) {
    try {
      let q = collection(db, COLLECTIONS.TIME_ENTRIES);
      const constraints = [];

      if (filters.taskId) {
        constraints.push(where('taskId', '==', filters.taskId));
      }
      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }
      if (filters.startDate) {
        constraints.push(where('startTime', '>=', Timestamp.fromDate(new Date(filters.startDate))));
      }
      if (filters.endDate) {
        constraints.push(where('startTime', '<=', Timestamp.fromDate(new Date(filters.endDate))));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      q = query(q, orderBy('startTime', 'desc'));

      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, entries };
    } catch (error) {
      console.error('Error getting time entries:', error);
      return { success: false, error: error.message, entries: [] };
    }
  }

  // ============================================================================
  // TASK COMMENTS
  // ============================================================================

  /**
   * Add a comment to a task
   */
  async addComment(taskId, commentData) {
    try {
      const comment = {
        taskId,
        content: commentData.content || '',
        authorId: commentData.authorId || null,
        authorName: commentData.authorName || 'Unknown',
        mentions: commentData.mentions || [],
        attachments: commentData.attachments || [],
        isInternal: commentData.isInternal || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.TASK_COMMENTS), comment);

      // Update task comment count
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);
      if (taskSnap.exists()) {
        await updateDoc(taskRef, {
          commentCount: (taskSnap.data().commentCount || 0) + 1,
          updatedAt: serverTimestamp()
        });
      }

      return { success: true, id: docRef.id, comment: { id: docRef.id, ...comment } };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get comments for a task
   */
  async getComments(taskId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASK_COMMENTS),
        where('taskId', '==', taskId),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, comments };
    } catch (error) {
      console.error('Error getting comments:', error);
      return { success: false, error: error.message, comments: [] };
    }
  }

  // ============================================================================
  // TASK HISTORY
  // ============================================================================

  /**
   * Log task history
   */
  async logTaskHistory(taskId, action, previousData, newData, userId) {
    try {
      const history = {
        taskId,
        action,
        previousData: previousData || null,
        newData: newData || null,
        userId,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, COLLECTIONS.TASK_HISTORY), history);

      return { success: true };
    } catch (error) {
      console.error('Error logging task history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get task history
   */
  async getTaskHistory(taskId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASK_HISTORY),
        where('taskId', '==', taskId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, history };
    } catch (error) {
      console.error('Error getting task history:', error);
      return { success: false, error: error.message, history: [] };
    }
  }

  // ============================================================================
  // STATISTICS & ANALYTICS
  // ============================================================================

  /**
   * Get task statistics
   */
  async getTaskStats(filters = {}) {
    try {
      const result = await this.getTasks(filters);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const tasks = result.tasks;

      const stats = {
        total: tasks.length,
        byStatus: {},
        byPriority: {},
        byCategory: {},
        overdue: 0,
        dueToday: 0,
        dueThisWeek: 0,
        completedThisWeek: 0,
        averageCompletionTime: 0,
        onTimeCompletionRate: 0
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      let totalCompletionTime = 0;
      let completedCount = 0;
      let onTimeCount = 0;

      tasks.forEach(task => {
        // By status
        stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;

        // By priority
        stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;

        // By category
        stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;

        // Due date analysis
        if (task.dueDate) {
          const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);

          if (task.status !== TASK_STATUS.COMPLETED && dueDate < today) {
            stats.overdue++;
          }
          if (dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
            stats.dueToday++;
          }
          if (dueDate >= today && dueDate < weekFromNow) {
            stats.dueThisWeek++;
          }
        }

        // Completion analysis
        if (task.status === TASK_STATUS.COMPLETED) {
          if (task.completedAt) {
            const completedDate = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
            if (completedDate >= weekAgo) {
              stats.completedThisWeek++;
            }

            if (task.createdAt) {
              const createdDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
              totalCompletionTime += (completedDate - createdDate) / (1000 * 60 * 60); // hours
              completedCount++;
            }

            if (task.dueDate) {
              const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
              if (completedDate <= dueDate) {
                onTimeCount++;
              }
            }
          }
        }
      });

      stats.averageCompletionTime = completedCount > 0 ? Math.round(totalCompletionTime / completedCount) : 0;
      stats.onTimeCompletionRate = completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : 0;

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting task stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get team workload
   */
  async getTeamWorkload(teamId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASKS),
        where('teamId', '==', teamId),
        where('status', 'in', [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS])
      );

      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Group by assignee
      const workload = {};

      tasks.forEach(task => {
        const assignee = task.assignedTo || 'unassigned';
        if (!workload[assignee]) {
          workload[assignee] = {
            taskCount: 0,
            totalEstimatedMinutes: 0,
            highPriorityCount: 0,
            overdueCount: 0,
            tasks: []
          };
        }

        workload[assignee].taskCount++;
        workload[assignee].totalEstimatedMinutes += task.estimatedMinutes || 0;
        if (task.priority === TASK_PRIORITY.HIGH || task.priority === TASK_PRIORITY.CRITICAL) {
          workload[assignee].highPriorityCount++;
        }
        if (task.dueDate) {
          const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
          if (dueDate < new Date()) {
            workload[assignee].overdueCount++;
          }
        }
        workload[assignee].tasks.push(task);
      });

      return { success: true, workload };
    } catch (error) {
      console.error('Error getting team workload:', error);
      return { success: false, error: error.message };
    }
  }
}

export const taskService = new TaskService();
export default taskService;
