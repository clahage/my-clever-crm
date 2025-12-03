// src/services/taskHistoryService.js
// ============================================================================
// TASK HISTORY SERVICE - Task History and Audit Trail
// ============================================================================

import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTIONS = {
  TASK_HISTORY: 'taskHistory'
};

class TaskHistoryService {
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
  async getTaskHistory(taskId, limitCount = null) {
    try {
      let q = query(
        collection(db, COLLECTIONS.TASK_HISTORY),
        where('taskId', '==', taskId),
        orderBy('timestamp', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, history };
    } catch (error) {
      console.error('Error getting task history:', error);
      return { success: false, error: error.message, history: [] };
    }
  }

  /**
   * Get history entries for a specific action
   */
  async getHistoryByAction(taskId, action) {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASK_HISTORY),
        where('taskId', '==', taskId),
        where('action', '==', action),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, history };
    } catch (error) {
      console.error('Error getting history by action:', error);
      return { success: false, error: error.message, history: [] };
    }
  }

  /**
   * Get user activity history
   */
  async getUserHistory(userId, filters = {}) {
    try {
      let q = query(
        collection(db, COLLECTIONS.TASK_HISTORY),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      if (filters.startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(new Date(filters.startDate))));
      }
      if (filters.endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(new Date(filters.endDate))));
      }
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, history };
    } catch (error) {
      console.error('Error getting user history:', error);
      return { success: false, error: error.message, history: [] };
    }
  }

  /**
   * Get recent changes across all tasks
   */
  async getRecentHistory(limitCount = 50, filters = {}) {
    try {
      let q = query(
        collection(db, COLLECTIONS.TASK_HISTORY),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      if (filters.action) {
        q = query(
          collection(db, COLLECTIONS.TASK_HISTORY),
          where('action', '==', filters.action),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, history };
    } catch (error) {
      console.error('Error getting recent history:', error);
      return { success: false, error: error.message, history: [] };
    }
  }

  /**
   * Get change summary for a task
   */
  async getTaskChangeSummary(taskId) {
    try {
      const result = await this.getTaskHistory(taskId);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const history = result.history;

      const summary = {
        totalChanges: history.length,
        createdAt: null,
        lastUpdated: null,
        updatedBy: [],
        actions: {}
      };

      history.forEach(entry => {
        // Track creation
        if (entry.action === 'created' && entry.timestamp) {
          summary.createdAt = entry.timestamp;
        }

        // Track last update
        if (!summary.lastUpdated || (entry.timestamp && entry.timestamp > summary.lastUpdated)) {
          summary.lastUpdated = entry.timestamp;
        }

        // Track unique users
        if (entry.userId && !summary.updatedBy.includes(entry.userId)) {
          summary.updatedBy.push(entry.userId);
        }

        // Count actions
        summary.actions[entry.action] = (summary.actions[entry.action] || 0) + 1;
      });

      return { success: true, summary };
    } catch (error) {
      console.error('Error getting change summary:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Compare task versions
   */
  compareVersions(previousData, newData) {
    const changes = {};

    if (!previousData || !newData) {
      return changes;
    }

    const allKeys = new Set([...Object.keys(previousData), ...Object.keys(newData)]);

    allKeys.forEach(key => {
      const oldValue = previousData[key];
      const newValue = newData[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          from: oldValue,
          to: newValue
        };
      }
    });

    return changes;
  }

  /**
   * Format history entry for display
   */
  formatHistoryEntry(entry) {
    const changes = this.compareVersions(entry.previousData, entry.newData);
    const changeCount = Object.keys(changes).length;

    return {
      id: entry.id,
      action: entry.action,
      userId: entry.userId,
      timestamp: entry.timestamp,
      changes,
      changeCount,
      summary: this.generateChangeSummary(entry.action, changes)
    };
  }

  /**
   * Generate human-readable change summary
   */
  generateChangeSummary(action, changes) {
    if (action === 'created') {
      return 'Task created';
    }

    if (action === 'deleted') {
      return 'Task deleted';
    }

    if (action === 'updated' && changes) {
      const fieldNames = Object.keys(changes);
      if (fieldNames.length === 0) {
        return 'No changes';
      }
      if (fieldNames.length === 1) {
        return `Updated ${fieldNames[0]}`;
      }
      if (fieldNames.length === 2) {
        return `Updated ${fieldNames[0]} and ${fieldNames[1]}`;
      }
      return `Updated ${fieldNames.length} fields`;
    }

    return action;
  }
}

export const taskHistoryService = new TaskHistoryService();
export default taskHistoryService;
