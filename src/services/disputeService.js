import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  serverTimestamp,
  limit,
  startAfter
} from 'firebase/firestore';

const COLLECTION_NAME = 'disputeLetters';

// Create a new dispute letter with client information
export const createDisputeLetter = async (letterData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...letterData,
      clientId: letterData.clientId || null,
      clientName: letterData.clientName || '',
      clientEmail: letterData.clientEmail || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: letterData.status || 'draft'
    });
    return { id: docRef.id, ...letterData };
  } catch (error) {
    console.error('Error creating dispute letter:', error);
    throw error;
  }
};

// Get all dispute letters with optional filtering
export const getDisputeLetters = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION_NAME);
    
    // Build query based on filters
    const constraints = [];
    
    if (filters.clientId) {
      constraints.push(where('clientId', '==', filters.clientId));
    }
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    if (filters.bureauType) {
      constraints.push(where('bureauType', '==', filters.bureauType));
    }
    
    // Always order by creation date (newest first)
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (filters.limitCount) {
      constraints.push(limit(filters.limitCount));
    }
    
    q = query(q, ...constraints);
    
    const querySnapshot = await getDocs(q);
    const letters = [];
    querySnapshot.forEach((doc) => {
      letters.push({ id: doc.id, ...doc.data() });
    });
    return letters;
  } catch (error) {
    console.error('Error getting dispute letters:', error);
    throw error;
  }
};

// Get dispute letters for a specific client
export const getClientDisputeLetters = async (clientId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const letters = [];
    querySnapshot.forEach((doc) => {
      letters.push({ id: doc.id, ...doc.data() });
    });
    return letters;
  } catch (error) {
    console.error('Error getting client dispute letters:', error);
    throw error;
  }
};

// Get a single dispute letter
export const getDisputeLetter = async (letterId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, letterId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Dispute letter not found');
    }
  } catch (error) {
    console.error('Error getting dispute letter:', error);
    throw error;
  }
};

// Update a dispute letter
export const updateDisputeLetter = async (letterId, updates) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, letterId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: letterId, ...updates };
  } catch (error) {
    console.error('Error updating dispute letter:', error);
    throw error;
  }
};

// Update dispute letter status
export const updateDisputeStatus = async (letterId, newStatus) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, letterId);
    const statusUpdate = {
      status: newStatus,
      updatedAt: serverTimestamp()
    };
    
    // Add status-specific fields
    if (newStatus === 'sent') {
      statusUpdate.sentDate = serverTimestamp();
    } else if (newStatus === 'resolved') {
      statusUpdate.resolvedDate = serverTimestamp();
    }
    
    await updateDoc(docRef, statusUpdate);
    return { id: letterId, ...statusUpdate };
  } catch (error) {
    console.error('Error updating dispute status:', error);
    throw error;
  }
};

// Delete a dispute letter
export const deleteDisputeLetter = async (letterId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, letterId));
    return letterId;
  } catch (error) {
    console.error('Error deleting dispute letter:', error);
    throw error;
  }
};

// Get dispute statistics
export const getDisputeStats = async (clientId = null) => {
  try {
    let q = collection(db, COLLECTION_NAME);
    
    if (clientId) {
      q = query(q, where('clientId', '==', clientId));
    }
    
    const querySnapshot = await getDocs(q);
    const stats = {
      total: 0,
      byStatus: { draft: 0, sent: 0, pending: 0, resolved: 0 },
      byBureau: { equifax: 0, experian: 0, transunion: 0 },
      byClient: {},
      recentActivity: []
    };
    
    querySnapshot.forEach((doc) => {
      const letter = doc.data();
      stats.total++;
      
      // Count by status
      if (letter.status && stats.byStatus[letter.status] !== undefined) {
        stats.byStatus[letter.status]++;
      }
      
      // Count by bureau
      if (letter.bureauType && stats.byBureau[letter.bureauType] !== undefined) {
        stats.byBureau[letter.bureauType]++;
      }
      
      // Count by client
      if (letter.clientId) {
        if (!stats.byClient[letter.clientId]) {
          stats.byClient[letter.clientId] = {
            clientName: letter.clientName,
            count: 0,
            statuses: { draft: 0, sent: 0, pending: 0, resolved: 0 }
          };
        }
        stats.byClient[letter.clientId].count++;
        if (letter.status) {
          stats.byClient[letter.clientId].statuses[letter.status]++;
        }
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting dispute statistics:', error);
    throw error;
  }
};

// Batch update multiple dispute letters
export const batchUpdateDisputeLetters = async (letterIds, updates) => {
  try {
    const updatePromises = letterIds.map(letterId => 
      updateDoc(doc(db, COLLECTION_NAME, letterId), {
        ...updates,
        updatedAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
    return { success: true, count: letterIds.length };
  } catch (error) {
    console.error('Error batch updating dispute letters:', error);
    throw error;
  }
};

// Get recent dispute activity
export const getRecentDisputeActivity = async (limit = 10, clientId = null) => {
  try {
    let q = collection(db, COLLECTION_NAME);
    const constraints = [];
    
    if (clientId) {
      constraints.push(where('clientId', '==', clientId));
    }
    
    constraints.push(orderBy('updatedAt', 'desc'));
    constraints.push(limit(limit));
    
    q = query(q, ...constraints);
    
    const querySnapshot = await getDocs(q);
    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });
    return activities;
  } catch (error) {
    console.error('Error getting recent dispute activity:', error);
    throw error;
  }
};