// src/services/timeEntriesService.js
// ============================================================================
// TIME ENTRIES SERVICE - Time Tracking and Management
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
  TIME_ENTRIES: 'timeEntries',
  TASKS: 'tasks'
};

class TimeEntriesService {
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
      if (filters.isRunning !== undefined) {
        constraints.push(where('isRunning', '==', filters.isRunning));
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

  /**
   * Get a single time entry by ID
   */
  async getTimeEntry(entryId) {
    try {
      const entryRef = doc(db, COLLECTIONS.TIME_ENTRIES, entryId);
      const entrySnap = await getDoc(entryRef);

      if (!entrySnap.exists()) {
        return { success: false, error: 'Time entry not found' };
      }

      return { success: true, entry: { id: entrySnap.id, ...entrySnap.data() } };
    } catch (error) {
      console.error('Error getting time entry:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a time entry
   */
  async updateTimeEntry(entryId, updates) {
    try {
      const entryRef = doc(db, COLLECTIONS.TIME_ENTRIES, entryId);
      const entrySnap = await getDoc(entryRef);

      if (!entrySnap.exists()) {
        return { success: false, error: 'Time entry not found' };
      }

      await updateDoc(entryRef, updates);

      return { success: true, id: entryId };
    } catch (error) {
      console.error('Error updating time entry:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a time entry
   */
  async deleteTimeEntry(entryId) {
    try {
      const entryRef = doc(db, COLLECTIONS.TIME_ENTRIES, entryId);
      const entrySnap = await getDoc(entryRef);

      if (!entrySnap.exists()) {
        return { success: false, error: 'Time entry not found' };
      }

      const entry = entrySnap.data();

      // Update task actual minutes if the entry was completed
      if (entry.taskId && entry.duration > 0) {
        const taskRef = doc(db, COLLECTIONS.TASKS, entry.taskId);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          const task = taskSnap.data();
          await updateDoc(taskRef, {
            actualMinutes: Math.max(0, (task.actualMinutes || 0) - entry.duration),
            updatedAt: serverTimestamp()
          });
        }
      }

      await deleteDoc(entryRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting time entry:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get total time for a task
   */
  async getTaskTotalTime(taskId) {
    try {
      const result = await this.getTimeEntries({ taskId });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const totalMinutes = result.entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

      return {
        success: true,
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
        entryCount: result.entries.length
      };
    } catch (error) {
      console.error('Error getting task total time:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user time report
   */
  async getUserTimeReport(userId, startDate, endDate) {
    try {
      const result = await this.getTimeEntries({ userId, startDate, endDate });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const totalMinutes = result.entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      const billableMinutes = result.entries
        .filter(entry => entry.isBillable)
        .reduce((sum, entry) => sum + (entry.duration || 0), 0);

      return {
        success: true,
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
        billableMinutes,
        billableHours: Math.round((billableMinutes / 60) * 100) / 100,
        entryCount: result.entries.length,
        entries: result.entries
      };
    } catch (error) {
      console.error('Error getting user time report:', error);
      return { success: false, error: error.message };
    }
  }
}

export const timeEntriesService = new TimeEntriesService();
export default timeEntriesService;
