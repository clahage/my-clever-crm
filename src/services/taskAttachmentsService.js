// src/services/taskAttachmentsService.js
// ============================================================================
// TASK ATTACHMENTS SERVICE - File Attachments and Document Management
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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

const COLLECTIONS = {
  TASK_ATTACHMENTS: 'taskAttachments',
  TASKS: 'tasks'
};

class TaskAttachmentsService {
  /**
   * Upload and attach a file to a task
   */
  async attachFile(taskId, file, metadata = {}) {
    try {
      // Upload file to Firebase Storage
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `tasks/${taskId}/${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, storagePath);

      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Create attachment record
      const attachment = {
        taskId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath,
        downloadURL,
        uploadedBy: metadata.uploadedBy || null,
        uploadedByName: metadata.uploadedByName || 'Unknown',
        description: metadata.description || '',
        tags: metadata.tags || [],
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.TASK_ATTACHMENTS), attachment);

      // Update task attachment count
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const taskSnap = await getDoc(taskRef);
      if (taskSnap.exists()) {
        await updateDoc(taskRef, {
          attachmentCount: (taskSnap.data().attachmentCount || 0) + 1,
          updatedAt: serverTimestamp()
        });
      }

      return {
        success: true,
        id: docRef.id,
        attachment: { id: docRef.id, ...attachment },
        downloadURL
      };
    } catch (error) {
      console.error('Error attaching file:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get attachments for a task
   */
  async getAttachments(taskId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASK_ATTACHMENTS),
        where('taskId', '==', taskId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const attachments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, attachments };
    } catch (error) {
      console.error('Error getting attachments:', error);
      return { success: false, error: error.message, attachments: [] };
    }
  }

  /**
   * Get a single attachment by ID
   */
  async getAttachment(attachmentId) {
    try {
      const attachmentRef = doc(db, COLLECTIONS.TASK_ATTACHMENTS, attachmentId);
      const attachmentSnap = await getDoc(attachmentRef);

      if (!attachmentSnap.exists()) {
        return { success: false, error: 'Attachment not found' };
      }

      return { success: true, attachment: { id: attachmentSnap.id, ...attachmentSnap.data() } };
    } catch (error) {
      console.error('Error getting attachment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update attachment metadata
   */
  async updateAttachment(attachmentId, updates) {
    try {
      const attachmentRef = doc(db, COLLECTIONS.TASK_ATTACHMENTS, attachmentId);
      const attachmentSnap = await getDoc(attachmentRef);

      if (!attachmentSnap.exists()) {
        return { success: false, error: 'Attachment not found' };
      }

      await updateDoc(attachmentRef, updates);

      return { success: true, id: attachmentId };
    } catch (error) {
      console.error('Error updating attachment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(attachmentId, taskId = null) {
    try {
      const attachmentRef = doc(db, COLLECTIONS.TASK_ATTACHMENTS, attachmentId);
      const attachmentSnap = await getDoc(attachmentRef);

      if (!attachmentSnap.exists()) {
        return { success: false, error: 'Attachment not found' };
      }

      const attachment = attachmentSnap.data();

      // Delete file from storage
      if (attachment.storagePath) {
        try {
          const storageRef = ref(storage, attachment.storagePath);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn('Error deleting file from storage:', storageError);
          // Continue with Firestore deletion even if storage deletion fails
        }
      }

      // Delete Firestore document
      await deleteDoc(attachmentRef);

      // Update task attachment count
      const actualTaskId = taskId || attachment.taskId;
      if (actualTaskId) {
        const taskRef = doc(db, COLLECTIONS.TASKS, actualTaskId);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          const currentCount = taskSnap.data().attachmentCount || 0;
          await updateDoc(taskRef, {
            attachmentCount: Math.max(0, currentCount - 1),
            updatedAt: serverTimestamp()
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get attachments by file type
   */
  async getAttachmentsByType(taskId, fileType) {
    try {
      const q = query(
        collection(db, COLLECTIONS.TASK_ATTACHMENTS),
        where('taskId', '==', taskId),
        where('fileType', '==', fileType),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const attachments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, attachments };
    } catch (error) {
      console.error('Error getting attachments by type:', error);
      return { success: false, error: error.message, attachments: [] };
    }
  }

  /**
   * Get total size of attachments for a task
   */
  async getTaskAttachmentSize(taskId) {
    try {
      const result = await this.getAttachments(taskId);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const totalSize = result.attachments.reduce((sum, att) => sum + (att.fileSize || 0), 0);

      return {
        success: true,
        totalSize,
        totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
        count: result.attachments.length
      };
    } catch (error) {
      console.error('Error getting task attachment size:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (!bytes) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${Math.round(size * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Validate file before upload
   */
  validateFile(file, options = {}) {
    const {
      maxSizeMB = 10,
      allowedTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.*', 'text/*']
    } = options;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Check file size
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      };
    }

    // Check file type
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('*')) {
        const baseType = type.slice(0, -1);
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: 'File type not allowed'
      };
    }

    return { valid: true };
  }

  /**
   * Bulk delete attachments
   */
  async bulkDeleteAttachments(attachmentIds) {
    try {
      const results = await Promise.allSettled(
        attachmentIds.map(id => this.deleteAttachment(id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      return {
        success: true,
        total: results.length,
        successful,
        failed
      };
    } catch (error) {
      console.error('Error bulk deleting attachments:', error);
      return { success: false, error: error.message };
    }
  }
}

export const taskAttachmentsService = new TaskAttachmentsService();
export default taskAttachmentsService;
