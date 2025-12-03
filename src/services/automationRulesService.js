// src/services/automationRulesService.js
// ============================================================================
// AUTOMATION RULES SERVICE - Task Automation and Workflow Rules
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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTIONS = {
  AUTOMATION_RULES: 'automationRules'
};

class AutomationRulesService {
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

      if (filters.triggerType) {
        q = query(q, where('triggerType', '==', filters.triggerType));
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

  /**
   * Get a single automation rule by ID
   */
  async getAutomationRule(ruleId) {
    try {
      const ruleRef = doc(db, COLLECTIONS.AUTOMATION_RULES, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Automation rule not found' };
      }

      return { success: true, rule: { id: ruleSnap.id, ...ruleSnap.data() } };
    } catch (error) {
      console.error('Error getting automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an automation rule
   */
  async updateAutomationRule(ruleId, updates) {
    try {
      const ruleRef = doc(db, COLLECTIONS.AUTOMATION_RULES, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Automation rule not found' };
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(ruleRef, updateData);

      return { success: true, id: ruleId };
    } catch (error) {
      console.error('Error updating automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete an automation rule
   */
  async deleteAutomationRule(ruleId) {
    try {
      const ruleRef = doc(db, COLLECTIONS.AUTOMATION_RULES, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Automation rule not found' };
      }

      await deleteDoc(ruleRef);

      return { success: true };
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle automation rule active status
   */
  async toggleAutomationRule(ruleId, isActive) {
    try {
      const ruleRef = doc(db, COLLECTIONS.AUTOMATION_RULES, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Automation rule not found' };
      }

      await updateDoc(ruleRef, {
        isActive,
        updatedAt: serverTimestamp()
      });

      return { success: true, id: ruleId };
    } catch (error) {
      console.error('Error toggling automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Record rule execution
   */
  async recordExecution(ruleId, success = true, error = null) {
    try {
      const ruleRef = doc(db, COLLECTIONS.AUTOMATION_RULES, ruleId);
      const ruleSnap = await getDoc(ruleRef);

      if (!ruleSnap.exists()) {
        return { success: false, error: 'Automation rule not found' };
      }

      const rule = ruleSnap.data();

      const updates = {
        executionCount: (rule.executionCount || 0) + 1,
        lastExecution: serverTimestamp()
      };

      if (error) {
        updates.lastError = error;
      }

      await updateDoc(ruleRef, updates);

      return { success: true };
    } catch (err) {
      console.error('Error recording execution:', err);
      return { success: false, error: err.message };
    }
  }
}

export const automationRulesService = new AutomationRulesService();
export default automationRulesService;
