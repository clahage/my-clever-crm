// src/services/taskCommentsService.js
// ============================================================================
// TASK COMMENTS SERVICE - Comment CRUD and Management
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
  TASK_COMMENTS: 'taskComments',
  TASKS: 'tasks'
};

class TaskCommentsService {
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

  /**
   * Update a comment
   */
  async updateComment(commentId, updates) {
    try {
      const commentRef = doc(db, COLLECTIONS.TASK_COMMENTS, commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        return { success: false, error: 'Comment not found' };
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(commentRef, updateData);

      return { success: true, id: commentId };
    } catch (error) {
      console.error('Error updating comment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId, taskId) {
    try {
      const commentRef = doc(db, COLLECTIONS.TASK_COMMENTS, commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        return { success: false, error: 'Comment not found' };
      }

      await deleteDoc(commentRef);

      // Update task comment count
      if (taskId) {
        const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          const currentCount = taskSnap.data().commentCount || 0;
          await updateDoc(taskRef, {
            commentCount: Math.max(0, currentCount - 1),
            updatedAt: serverTimestamp()
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a single comment by ID
   */
  async getComment(commentId) {
    try {
      const commentRef = doc(db, COLLECTIONS.TASK_COMMENTS, commentId);
      const commentSnap = await getDoc(commentRef);

      if (!commentSnap.exists()) {
        return { success: false, error: 'Comment not found' };
      }

      return { success: true, comment: { id: commentSnap.id, ...commentSnap.data() } };
    } catch (error) {
      console.error('Error getting comment:', error);
      return { success: false, error: error.message };
    }
  }
}

export const taskCommentsService = new TaskCommentsService();
export default taskCommentsService;
