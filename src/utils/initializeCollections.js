import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Initialize Firestore collections with sample data
 * Run this once to set up your collections
 * WARNING: Only runs in development mode to prevent fake data in production
 */
export const initializeFirestoreCollections = async () => {
  // Safety check: Only allow in development environment
  const isDevelopment = import.meta.env.MODE === 'development' || 
                        import.meta.env.DEV === true ||
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1';

  if (!isDevelopment) {
    console.warn('⚠️ Seed data initialization is disabled in production');
    console.warn('This function only runs in development mode to prevent fake data in production database');
    return;
  }

  try {
    console.log('🚀 Initializing Firestore collections (DEVELOPMENT MODE)...');

    // Create idiqEnrollments collection with one sample document
    const idiqEnrollmentsRef = collection(db, 'idiqEnrollments');
    await addDoc(idiqEnrollmentsRef, {
      firstName: "Sample",
      lastName: "Enrollment",
      email: "sample@example.com",
      phone: "555-0000",
      status: "active",
      leadScore: 7,
      creditScore: 650,
      verified: true,
      contacted: false,
      aiInteraction: false,
      aiQuality: 0,
      aiSatisfaction: 0,
      escalated: false,
      resolved: false,
      responseTime: 0,
      sentimentScore: 0,
      fraudScore: 0,
      blocked: false,
      revenue: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('✅ idiqEnrollments collection created');

    // Create creditReports collection with one sample document
    const creditReportsRef = collection(db, 'creditReports');
    await addDoc(creditReportsRef, {
      clientId: "sample-client-001",
      clientName: "Sample Client",
      clientEmail: "sample@example.com",
      clientPhone: "555-0000",
      status: "new",
      priority: "medium",
      currentScore: 650,
      initialScore: 650,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      archivedAt: null
    });
    console.log('✅ creditReports collection created');

    // Create communications collection
    const communicationsRef = collection(db, 'communications');
    await addDoc(communicationsRef, {
      reportId: "sample-report-001",
      clientId: "sample-client-001",
      type: "email",
      subject: "Welcome to SpeedyCRM",
      message: "Sample communication message",
      sentAt: Timestamp.now(),
      sentBy: "system"
    });
    console.log('✅ communications collection created');

    // Create disputes collection
    const disputesRef = collection(db, 'disputes');
    await addDoc(disputesRef, {
      reportId: "sample-report-001",
      clientId: "sample-client-001",
      items: ["Sample dispute item"],
      reason: "Sample dispute reason",
      status: "pending",
      submittedAt: Timestamp.now(),
      submittedBy: "system"
    });
    console.log('✅ disputes collection created');

    console.log('🎉 All collections initialized successfully!');
    return { success: true, message: 'Collections created successfully' };

  } catch (error) {
    console.error('❌ Error initializing collections:', error);
    return { success: false, error: error.message };
  }
};