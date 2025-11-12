/**
 * Firebase Admin Initialization
 * 
 * Centralized Firebase Admin SDK initialization for SpeedyCRM.
 * This module ensures Firebase Admin is initialized only once across all functions.
 * 
 * @module firebaseAdmin
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
  console.log('✅ Firebase Admin initialized successfully');
} else {
  console.log('ℹ️ Firebase Admin already initialized');
}

// Export admin instance and commonly used services
module.exports = {
  admin,
  db: admin.firestore(),
  auth: admin.auth(),
  storage: admin.storage(),
  messaging: admin.messaging()
};