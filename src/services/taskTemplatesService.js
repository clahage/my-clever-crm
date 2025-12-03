// src/services/taskTemplatesService.js
// ============================================================================
// TASK TEMPLATES SERVICE - Template CRUD and Management
// ============================================================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTIONS = {
  TASK_TEMPLATES: 'taskTemplates',
  TASKS: 'tasks'
};

// Import task constants
export { TASK_CATEGORIES, TASK_PRIORITY } from './taskService';

class TaskTemplatesService {
  /**
   * Create a task template
   */
  async createTemplate(templateData) {
    try {
      const template = {
        name: templateData.name || '',
        description: templateData.description || '',
        category: templateData.category || 'other',

        // Template task defaults
        defaultTitle: templateData.defaultTitle || '',
        defaultDescription: templateData.defaultDescription || '',
        defaultPriority: templateData.defaultPriority || 'medium',
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
   * Get a single template by ID
   */
  async getTemplate(templateId) {
    try {
      const templateRef = doc(db, COLLECTIONS.TASK_TEMPLATES, templateId);
      const templateSnap = await getDoc(templateRef);

      if (!templateSnap.exists()) {
        return { success: false, error: 'Template not found' };
      }

      return { success: true, template: { id: templateSnap.id, ...templateSnap.data() } };
    } catch (error) {
      console.error('Error getting template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId, updates) {
    try {
      const templateRef = doc(db, COLLECTIONS.TASK_TEMPLATES, templateId);
      const templateSnap = await getDoc(templateRef);

      if (!templateSnap.exists()) {
        return { success: false, error: 'Template not found' };
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(templateRef, updateData);

      return { success: true, id: templateId };
    } catch (error) {
      console.error('Error updating template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete/deactivate a template
   */
  async deleteTemplate(templateId) {
    try {
      const templateRef = doc(db, COLLECTIONS.TASK_TEMPLATES, templateId);
      const templateSnap = await getDoc(templateRef);

      if (!templateSnap.exists()) {
        return { success: false, error: 'Template not found' };
      }

      // Soft delete by marking as inactive
      await updateDoc(templateRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Increment template usage
   */
  async incrementUsage(templateId) {
    try {
      const templateRef = doc(db, COLLECTIONS.TASK_TEMPLATES, templateId);
      const templateSnap = await getDoc(templateRef);

      if (!templateSnap.exists()) {
        return { success: false, error: 'Template not found' };
      }

      const template = templateSnap.data();

      await updateDoc(templateRef, {
        usageCount: (template.usageCount || 0) + 1,
        lastUsed: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error incrementing template usage:', error);
      return { success: false, error: error.message };
    }
  }
}

export const taskTemplatesService = new TaskTemplatesService();
export default taskTemplatesService;
