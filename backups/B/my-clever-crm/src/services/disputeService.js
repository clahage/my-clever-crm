import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';

const DISPUTE_STATUSES = [
  'New',
  'In Progress',
  'Letter Sent',
  'Response Received',
  'Investigating',
  'Resolved',
  'Escalated',
];

const disputesRef = collection(db, 'disputes');

export async function createDispute(data) {
  try {
    const docRef = await addDoc(disputesRef, data);
    return docRef.id;
  } catch (error) {
    throw new Error(error.message || 'Failed to create dispute');
  }
}

export async function getDisputes() {
  try {
    const snapshot = await getDocs(disputesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch disputes');
  }
}

export async function getDispute(disputeId) {
  try {
    const docSnap = await getDoc(doc(disputesRef, disputeId));
    if (!docSnap.exists()) throw new Error('Dispute not found');
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch dispute');
  }
}

export async function updateDispute(disputeId, data) {
  try {
    await updateDoc(doc(disputesRef, disputeId), data);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to update dispute');
  }
}

export async function deleteDispute(disputeId) {
  try {
    await deleteDoc(doc(disputesRef, disputeId));
    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete dispute');
  }
}

export async function getDisputesByClient(clientId) {
  try {
    const q = query(disputesRef, where('clientId', '==', clientId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch client disputes');
  }
}

export function subscribeToDisputes(onUpdate, onError) {
  try {
    return onSnapshot(disputesRef, snapshot => {
      const disputes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onUpdate(disputes);
    }, onError);
  } catch (error) {
    if (onError) onError(error);
  }
}

export function getStatusOptions() {
  return DISPUTE_STATUSES;
}

export async function exportDisputeReports(disputes) {
  // Stub: implement actual export logic (CSV, PDF, etc.)
  try {
    // ...export logic...
    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to export dispute reports');
  }
}
