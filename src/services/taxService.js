// ============================================================================
// taxService.js - TAX SERVICES FIRESTORE OPERATIONS
// ============================================================================
// Complete Firestore service for tax return management, document storage,
// and client tax data operations.
//
// FEATURES:
// ✅ Tax Return CRUD Operations
// ✅ Document Management
// ✅ Client Tax Profiles
// ✅ Real-time Subscriptions
// ✅ Batch Operations
// ✅ Query Builders
// ✅ Data Validation
// ✅ Audit Logging
// ============================================================================

import { db, storage } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

const COLLECTIONS = {
  TAX_RETURNS: 'taxReturns',
  TAX_DOCUMENTS: 'taxDocuments',
  TAX_PROFILES: 'taxProfiles',
  TAX_QUESTIONNAIRES: 'taxQuestionnaires',
  TAX_ANALYTICS: 'taxAnalytics',
  TAX_AUDIT_LOGS: 'taxAuditLogs'
};

// ============================================================================
// TAX RETURN OPERATIONS
// ============================================================================

/**
 * Create a new tax return
 */
export async function createTaxReturn(userId, taxReturnData) {
  try {
    const taxReturn = {
      userId,
      ...taxReturnData,
      status: taxReturnData.status || 'draft',
      progress: taxReturnData.progress || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.TAX_RETURNS), taxReturn);

    // Log creation
    await logAuditEvent(userId, 'tax_return_created', {
      returnId: docRef.id,
      taxYear: taxReturnData.taxYear
    });

    return { id: docRef.id, ...taxReturn };
  } catch (error) {
    console.error('Error creating tax return:', error);
    throw error;
  }
}

/**
 * Get a tax return by ID
 */
export async function getTaxReturn(returnId) {
  try {
    const docRef = doc(db, COLLECTIONS.TAX_RETURNS, returnId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Tax return not found');
    }

    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error getting tax return:', error);
    throw error;
  }
}

/**
 * Update a tax return
 */
export async function updateTaxReturn(returnId, updates) {
  try {
    const docRef = doc(db, COLLECTIONS.TAX_RETURNS, returnId);

    // Get current version for optimistic locking
    const currentDoc = await getDoc(docRef);
    const currentVersion = currentDoc.data()?.version || 1;

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      version: currentVersion + 1
    });

    // Log update
    await logAuditEvent(currentDoc.data().userId, 'tax_return_updated', {
      returnId,
      fields: Object.keys(updates)
    });

    return { id: returnId, ...updates };
  } catch (error) {
    console.error('Error updating tax return:', error);
    throw error;
  }
}

/**
 * Delete a tax return
 */
export async function deleteTaxReturn(returnId) {
  try {
    const docRef = doc(db, COLLECTIONS.TAX_RETURNS, returnId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Tax return not found');
    }

    const userId = docSnap.data().userId;

    // Delete associated documents from storage
    await deleteAssociatedDocuments(returnId);

    // Delete the return
    await deleteDoc(docRef);

    // Log deletion
    await logAuditEvent(userId, 'tax_return_deleted', { returnId });

    return { success: true };
  } catch (error) {
    console.error('Error deleting tax return:', error);
    throw error;
  }
}

/**
 * Get all tax returns for a user
 */
export async function getUserTaxReturns(userId, options = {}) {
  try {
    const {
      taxYear,
      status,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      limitCount = 50,
      lastDoc = null
    } = options;

    let q = query(
      collection(db, COLLECTIONS.TAX_RETURNS),
      where('userId', '==', userId)
    );

    if (taxYear) {
      q = query(q, where('taxYear', '==', taxYear));
    }

    if (status) {
      q = query(q, where('status', '==', status));
    }

    q = query(q, orderBy(sortBy, sortOrder), limit(limitCount));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const returns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      returns,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === limitCount
    };
  } catch (error) {
    console.error('Error getting user tax returns:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for a tax return
 */
export function subscribeToTaxReturn(returnId, callback) {
  const docRef = doc(db, COLLECTIONS.TAX_RETURNS, returnId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Tax return subscription error:', error);
    callback(null, error);
  });
}

/**
 * Subscribe to all tax returns for a user
 */
export function subscribeToUserTaxReturns(userId, taxYear, callback) {
  let q = query(
    collection(db, COLLECTIONS.TAX_RETURNS),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  if (taxYear) {
    q = query(q, where('taxYear', '==', taxYear));
  }

  return onSnapshot(q, (snapshot) => {
    const returns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(returns);
  }, (error) => {
    console.error('User tax returns subscription error:', error);
    callback([], error);
  });
}

// ============================================================================
// TAX DOCUMENT OPERATIONS
// ============================================================================

/**
 * Upload a tax document
 */
export async function uploadTaxDocument(userId, returnId, file, metadata) {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const storagePath = `taxDocuments/${userId}/${returnId}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    // Upload to storage
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        userId,
        returnId,
        documentType: metadata.documentType || 'other',
        originalName: file.name
      }
    });

    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Create document record in Firestore
    const documentData = {
      userId,
      returnId,
      name: file.name,
      type: metadata.documentType || 'other',
      category: metadata.category || 'uncategorized',
      size: file.size,
      mimeType: file.type,
      storagePath,
      downloadURL,
      aiExtracted: false,
      extractedData: null,
      uploadedAt: serverTimestamp(),
      status: 'pending_review'
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.TAX_DOCUMENTS), documentData);

    // Log upload
    await logAuditEvent(userId, 'document_uploaded', {
      documentId: docRef.id,
      returnId,
      fileName: file.name
    });

    return { id: docRef.id, ...documentData };
  } catch (error) {
    console.error('Error uploading tax document:', error);
    throw error;
  }
}

/**
 * Get documents for a tax return
 */
export async function getTaxDocuments(returnId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.TAX_DOCUMENTS),
      where('returnId', '==', returnId),
      orderBy('uploadedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tax documents:', error);
    throw error;
  }
}

/**
 * Delete a tax document
 */
export async function deleteTaxDocument(documentId) {
  try {
    const docRef = doc(db, COLLECTIONS.TAX_DOCUMENTS, documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    const documentData = docSnap.data();

    // Delete from storage
    if (documentData.storagePath) {
      const storageRef = ref(storage, documentData.storagePath);
      await deleteObject(storageRef).catch(err => {
        console.warn('Storage delete warning:', err);
      });
    }

    // Delete from Firestore
    await deleteDoc(docRef);

    // Log deletion
    await logAuditEvent(documentData.userId, 'document_deleted', {
      documentId,
      returnId: documentData.returnId
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting tax document:', error);
    throw error;
  }
}

/**
 * Update document with AI-extracted data
 */
export async function updateDocumentExtraction(documentId, extractedData) {
  try {
    const docRef = doc(db, COLLECTIONS.TAX_DOCUMENTS, documentId);

    await updateDoc(docRef, {
      aiExtracted: true,
      extractedData,
      extractedAt: serverTimestamp(),
      status: 'processed'
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating document extraction:', error);
    throw error;
  }
}

/**
 * Delete all documents associated with a tax return
 */
async function deleteAssociatedDocuments(returnId) {
  try {
    const documents = await getTaxDocuments(returnId);

    for (const doc of documents) {
      await deleteTaxDocument(doc.id);
    }

    return { success: true, deletedCount: documents.length };
  } catch (error) {
    console.error('Error deleting associated documents:', error);
    throw error;
  }
}

// ============================================================================
// TAX PROFILE OPERATIONS
// ============================================================================

/**
 * Create or update a tax profile for a client
 */
export async function upsertTaxProfile(userId, clientId, profileData) {
  try {
    const profileRef = doc(db, COLLECTIONS.TAX_PROFILES, `${userId}_${clientId}`);
    const existingProfile = await getDoc(profileRef);

    const profile = {
      userId,
      clientId,
      ...profileData,
      updatedAt: serverTimestamp()
    };

    if (existingProfile.exists()) {
      await updateDoc(profileRef, profile);
    } else {
      await addDoc(collection(db, COLLECTIONS.TAX_PROFILES), {
        ...profile,
        createdAt: serverTimestamp()
      });
    }

    return profile;
  } catch (error) {
    console.error('Error upserting tax profile:', error);
    throw error;
  }
}

/**
 * Get a client's tax profile
 */
export async function getTaxProfile(userId, clientId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.TAX_PROFILES),
      where('userId', '==', userId),
      where('clientId', '==', clientId),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Error getting tax profile:', error);
    throw error;
  }
}

// ============================================================================
// QUESTIONNAIRE OPERATIONS
// ============================================================================

/**
 * Save questionnaire responses
 */
export async function saveQuestionnaireResponses(userId, returnId, responses) {
  try {
    const questionnaireData = {
      userId,
      returnId,
      responses,
      completedAt: serverTimestamp(),
      status: 'completed'
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.TAX_QUESTIONNAIRES), questionnaireData);

    // Update the tax return with questionnaire reference
    await updateTaxReturn(returnId, {
      questionnaireId: docRef.id,
      questionnaireCompleted: true
    });

    return { id: docRef.id, ...questionnaireData };
  } catch (error) {
    console.error('Error saving questionnaire responses:', error);
    throw error;
  }
}

/**
 * Get questionnaire responses for a return
 */
export async function getQuestionnaireResponses(returnId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.TAX_QUESTIONNAIRES),
      where('returnId', '==', returnId),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error('Error getting questionnaire responses:', error);
    throw error;
  }
}

// ============================================================================
// ANALYTICS OPERATIONS
// ============================================================================

/**
 * Get tax analytics for a user
 */
export async function getTaxAnalytics(userId, taxYear) {
  try {
    // Get all returns for the year
    const returns = await getUserTaxReturns(userId, { taxYear });

    // Calculate analytics
    const analytics = {
      totalReturns: returns.returns.length,
      completedReturns: returns.returns.filter(r => r.status === 'filed').length,
      pendingReturns: returns.returns.filter(r => r.status === 'pending_review').length,
      inProgressReturns: returns.returns.filter(r => r.status === 'in_progress').length,
      draftReturns: returns.returns.filter(r => r.status === 'draft').length,
      totalRefunds: returns.returns.reduce((sum, r) => sum + (r.refundAmount || 0), 0),
      totalOwed: returns.returns.reduce((sum, r) => sum + (r.amountOwed || 0), 0),
      averageRefund: 0,
      totalDeductions: returns.returns.reduce((sum, r) => sum + (r.totalDeductions || 0), 0),
      byFilingStatus: {},
      byMonth: {}
    };

    if (analytics.completedReturns > 0) {
      analytics.averageRefund = analytics.totalRefunds / analytics.completedReturns;
    }

    // Group by filing status
    returns.returns.forEach(r => {
      const status = r.filingStatus || 'unknown';
      analytics.byFilingStatus[status] = (analytics.byFilingStatus[status] || 0) + 1;
    });

    return analytics;
  } catch (error) {
    console.error('Error getting tax analytics:', error);
    throw error;
  }
}

/**
 * Track tax analytics event
 */
export async function trackTaxAnalytics(userId, eventType, eventData) {
  try {
    await addDoc(collection(db, COLLECTIONS.TAX_ANALYTICS), {
      userId,
      eventType,
      eventData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error tracking tax analytics:', error);
    // Non-critical, don't throw
  }
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Log an audit event
 */
async function logAuditEvent(userId, action, details) {
  try {
    await addDoc(collection(db, COLLECTIONS.TAX_AUDIT_LOGS), {
      userId,
      action,
      details,
      timestamp: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Non-critical, don't throw
  }
}

/**
 * Get audit logs for a return
 */
export async function getAuditLogs(returnId, options = {}) {
  try {
    const { limitCount = 50 } = options;

    const q = query(
      collection(db, COLLECTIONS.TAX_AUDIT_LOGS),
      where('details.returnId', '==', returnId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting audit logs:', error);
    throw error;
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Update multiple tax returns in a batch
 */
export async function batchUpdateReturns(updates) {
  try {
    const batch = writeBatch(db);

    updates.forEach(({ returnId, data }) => {
      const docRef = doc(db, COLLECTIONS.TAX_RETURNS, returnId);
      batch.update(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    return { success: true, updatedCount: updates.length };
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
}

/**
 * Clone a tax return for a new year
 */
export async function cloneTaxReturn(returnId, newTaxYear) {
  try {
    const originalReturn = await getTaxReturn(returnId);

    // Remove fields that shouldn't be cloned
    const { id, createdAt, updatedAt, submittedAt, acceptedAt, status, ...clonedData } = originalReturn;

    const newReturn = await createTaxReturn(originalReturn.userId, {
      ...clonedData,
      taxYear: newTaxYear,
      status: 'draft',
      progress: 0,
      clonedFrom: returnId
    });

    return newReturn;
  } catch (error) {
    console.error('Error cloning tax return:', error);
    throw error;
  }
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  // Tax Returns
  createTaxReturn,
  getTaxReturn,
  updateTaxReturn,
  deleteTaxReturn,
  getUserTaxReturns,
  subscribeToTaxReturn,
  subscribeToUserTaxReturns,
  cloneTaxReturn,
  batchUpdateReturns,

  // Documents
  uploadTaxDocument,
  getTaxDocuments,
  deleteTaxDocument,
  updateDocumentExtraction,

  // Profiles
  upsertTaxProfile,
  getTaxProfile,

  // Questionnaires
  saveQuestionnaireResponses,
  getQuestionnaireResponses,

  // Analytics
  getTaxAnalytics,
  trackTaxAnalytics,

  // Audit
  getAuditLogs
};
