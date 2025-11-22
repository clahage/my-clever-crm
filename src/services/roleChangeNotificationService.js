// src/services/roleChangeNotificationService.js
// Service for tracking and notifying role changes

import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getNotificationEmail } from '@/config/roleConfig';

/**
 * Log a role change event
 */
export const logRoleChange = async ({
  targetUserId,
  targetUserEmail,
  targetUserName,
  previousRole,
  newRole,
  changedBy,
  changedByEmail,
  changedByName,
  changedByRole,
  reason = ''
}) => {
  try {
    // Create audit log entry
    const auditEntry = {
      action: 'role_changed',
      targetUserId,
      targetUserEmail,
      targetUserName,
      previousRole,
      newRole,
      changedBy,
      changedByEmail,
      changedByName,
      changedByRole,
      reason,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'auditLog'), auditEntry);

    // Get notification email for the changer's role
    const notificationEmail = getNotificationEmail(changedByRole);

    // Create notification for owner if there's a notification email configured
    if (notificationEmail) {
      await addDoc(collection(db, 'notifications'), {
        type: 'role_change',
        targetUserId: 'OWNER_USER_ID', // Replace with actual owner UID from your config
        title: 'User Role Changed',
        message: `${changedByName} changed ${targetUserName}'s role from ${previousRole} to ${newRole}`,
        data: auditEntry,
        read: false,
        priority: 'medium',
        createdAt: serverTimestamp(),
        notificationEmail,
      });
    }

    // Also create notification for the user whose role was changed
    await addDoc(collection(db, 'notifications'), {
      type: 'role_change_personal',
      targetUserId,
      title: 'Your Role Has Been Updated',
      message: `Your role has been changed from ${previousRole} to ${newRole} by ${changedByName}`,
      data: {
        previousRole,
        newRole,
        changedBy: changedByName,
        timestamp: new Date().toISOString(),
      },
      read: false,
      priority: 'high',
      createdAt: serverTimestamp(),
    });

    console.log('Role change logged successfully');
    return { success: true };
  } catch (error) {
    console.error('Error logging role change:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get role change history for a user
 */
export const getRoleChangeHistory = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'auditLog'),
      where('action', '==', 'role_changed'),
      where('targetUserId', '==', userId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limitCount)
    );

    const snapshot = await getDocs(q);
    const history = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: history };
  } catch (error) {
    console.error('Error fetching role change history:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all recent role changes (for admin dashboard)
 */
export const getRecentRoleChanges = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'auditLog'),
      where('action', '==', 'role_changed'),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limitCount)
    );

    const snapshot = await getDocs(q);
    const changes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: changes };
  } catch (error) {
    console.error('Error fetching recent role changes:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification about role change (to be implemented with Cloud Functions)
 * This is a placeholder that creates a pending email notification
 */
export const sendRoleChangeEmail = async ({
  recipientEmail,
  targetUserName,
  previousRole,
  newRole,
  changedByName,
}) => {
  try {
    // Create pending email in queue
    await addDoc(collection(db, 'emailQueue'), {
      to: recipientEmail,
      template: 'role_change_notification',
      data: {
        targetUserName,
        previousRole,
        newRole,
        changedByName,
        timestamp: new Date().toISOString(),
      },
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error queuing role change email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate if role change is allowed
 */
export const validateRoleChange = (managerRole, targetCurrentRole, targetNewRole, canManageRoleFunc) => {
  // Check if manager can modify the current role
  if (!canManageRoleFunc(managerRole, targetCurrentRole)) {
    return {
      allowed: false,
      reason: `You cannot modify users with ${targetCurrentRole} role`,
    };
  }

  // Check if manager can assign the new role
  if (!canManageRoleFunc(managerRole, targetNewRole)) {
    return {
      allowed: false,
      reason: `You cannot assign ${targetNewRole} role`,
    };
  }

  return { allowed: true };
};

export default {
  logRoleChange,
  getRoleChangeHistory,
  getRecentRoleChanges,
  sendRoleChangeEmail,
  validateRoleChange,
};
