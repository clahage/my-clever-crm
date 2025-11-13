import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * PRODUCTION DATA CREATION UTILITIES
 *
 * These functions are for creating REAL production data.
 * DO NOT use fake/demo data in production.
 *
 * Replace all placeholder values with actual client information.
 */

/**
 * Create a new IDIQ enrollment
 *
 * @param {Object} enrollmentData - Real client enrollment data
 */
export const createIDIQEnrollment = async (enrollmentData) => {
  const enrollmentsRef = collection(db, 'idiqEnrollments');

  // Validate required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  for (const field of requiredFields) {
    if (!enrollmentData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const enrollment = {
    firstName: enrollmentData.firstName,
    lastName: enrollmentData.lastName,
    email: enrollmentData.email,
    phone: enrollmentData.phone,
    status: enrollmentData.status || 'pending',
    leadScore: enrollmentData.leadScore || 0,
    creditScore: enrollmentData.creditScore || null,
    verified: enrollmentData.verified || false,
    contacted: enrollmentData.contacted || false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  try {
    const docRef = await addDoc(enrollmentsRef, enrollment);
    console.log('IDIQ enrollment created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating IDIQ enrollment:', error);
    throw error;
  }
};

/**
 * Create a new credit report entry
 *
 * @param {Object} reportData - Real credit report data
 */
export const createCreditReport = async (reportData) => {
  const reportsRef = collection(db, 'creditReports');

  // Validate required fields
  if (!reportData.clientId || !reportData.clientName || !reportData.clientEmail) {
    throw new Error('Missing required fields: clientId, clientName, clientEmail');
  }

  const report = {
    clientId: reportData.clientId,
    clientName: reportData.clientName,
    clientEmail: reportData.clientEmail,
    clientPhone: reportData.clientPhone || '',
    status: reportData.status || 'new',
    priority: reportData.priority || 'medium',
    currentScore: reportData.currentScore || null,
    initialScore: reportData.initialScore || null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    archivedAt: null
  };

  try {
    const docRef = await addDoc(reportsRef, report);
    console.log('Credit report created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating credit report:', error);
    throw error;
  }
};

// Example usage:
// const enrollmentData = {
//   firstName: "Real",
//   lastName: "Client",
//   email: "realclient@example.com",
//   phone: "123-456-7890",
//   status: "active"
// };
// await createIDIQEnrollment(enrollmentData);
