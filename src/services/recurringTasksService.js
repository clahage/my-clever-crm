// src/services/recurringTasksService.js
// ============================================================================
// RECURRING TASKS SERVICE - Recurring Task Rules and Scheduling
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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTIONS = {
  RECURRING_TASKS: 'recurringTasks'
};

class RecurringTasksService {
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
      if (filters.isPaused !== undefined) {
        constraints.push(where('isPaused', '==', filters.isPaused));
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

  /**
   * Get a single recurring rule by ID
   */
  async getRecurringRule(ruleId) {
    try {
      const ruleRef = doc(db, COLLECTIONS.RECURRING_TASKS, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Recurring rule not found' };
      }

      return { success: true, rule: { id: ruleSnap.id, ...ruleSnap.data() } };
    } catch (error) {
      console.error('Error getting recurring rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a recurring rule
   */
  async updateRecurringRule(ruleId, updates) {
    try {
      const ruleRef = doc(db, COLLECTIONS.RECURRING_TASKS, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Recurring rule not found' };
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Handle date conversions
      if (updates.startDate && !(updates.startDate instanceof Timestamp)) {
        updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
      }
      if (updates.endDate && !(updates.endDate instanceof Timestamp)) {
        updateData.endDate = Timestamp.fromDate(new Date(updates.endDate));
      }

      await updateDoc(ruleRef, updateData);

      return { success: true, id: ruleId };
    } catch (error) {
      console.error('Error updating recurring rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a recurring rule
   */
  async deleteRecurringRule(ruleId) {
    try {
      const ruleRef = doc(db, COLLECTIONS.RECURRING_TASKS, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Recurring rule not found' };
      }

      await deleteDoc(ruleRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting recurring rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle recurring rule active status
   */
  async toggleRecurringRule(ruleId, isActive) {
    try {
      const ruleRef = doc(db, COLLECTIONS.RECURRING_TASKS, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Recurring rule not found' };
      }

      await updateDoc(ruleRef, {
        isActive,
        updatedAt: serverTimestamp()
      });

      return { success: true, id: ruleId };
    } catch (error) {
      console.error('Error toggling recurring rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pause/unpause a recurring rule
   */
  async pauseRecurringRule(ruleId, isPaused) {
    try {
      const ruleRef = doc(db, COLLECTIONS.RECURRING_TASKS, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Recurring rule not found' };
      }

      await updateDoc(ruleRef, {
        isPaused,
        updatedAt: serverTimestamp()
      });

      return { success: true, id: ruleId };
    } catch (error) {
      console.error('Error pausing recurring rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Record rule execution
   */
  async recordExecution(ruleId, nextRunDate = null) {
    try {
      const ruleRef = doc(db, COLLECTIONS.RECURRING_TASKS, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Recurring rule not found' };
      }

      const rule = ruleSnap.data();

      const updates = {
        lastRun: serverTimestamp(),
        runCount: (rule.runCount || 0) + 1
      };

      if (nextRunDate) {
        updates.nextRun = Timestamp.fromDate(new Date(nextRunDate));
      }

      await updateDoc(ruleRef, updates);

      return { success: true };
    } catch (error) {
      console.error('Error recording execution:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate next run date based on rule pattern
   */
  calculateNextRun(rule, fromDate = new Date()) {
    const { frequency, interval, daysOfWeek, dayOfMonth } = rule;
    const next = new Date(fromDate);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;

      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          // Find next matching day of week
          const currentDay = next.getDay();
          const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

          let nextDay = sortedDays.find(day => day > currentDay);
          if (!nextDay) {
            nextDay = sortedDays[0];
            next.setDate(next.getDate() + (7 - currentDay + nextDay));
          } else {
            next.setDate(next.getDate() + (nextDay - currentDay));
          }
        } else {
          next.setDate(next.getDate() + (7 * interval));
        }
        break;

      case 'monthly':
        if (dayOfMonth) {
          next.setMonth(next.getMonth() + interval);
          next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
        } else {
          next.setMonth(next.getMonth() + interval);
        }
        break;

      default:
        next.setDate(next.getDate() + 1);
    }

    return next;
  }
}

export const recurringTasksService = new RecurringTasksService();
export default recurringTasksService;
