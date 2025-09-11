
// Migration script to add new fields to all existing leads
// Standalone migration script for Node.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateLeads() {
  const leadsRef = collection(db, 'contacts');
  const snapshot = await getDocs(leadsRef);
  let sampleLead = null;
  for (const leadDoc of snapshot.docs) {
    const lead = leadDoc.data();
    const updates = {};
    if (!lead.conversionTracking) {
      updates.conversionTracking = {
        status: 'active',
        conversionDate: null,
        revenuePotential: 1200,
        actualRevenue: 0,
        followUpCount: 0,
        lastContactDate: null,
        nextFollowUpDue: null,
        lostReason: null,
        confidenceScore: 0.75
      };
    }
    if (!lead.serviceType) updates.serviceType = 'basic';
    if (!lead.estimatedTimeframe) updates.estimatedTimeframe = 90;
    if (!lead.predictionData) {
      updates.predictionData = {
        weeklyDecayFactor: 0.95,
        followUpResponseRate: 0.8,
        seasonalMultiplier: 1.0,
        lastPredictionUpdate: null
      };
    }
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, 'contacts', leadDoc.id), updates);
      console.log(`Updated lead ${leadDoc.id}`);
    }
    if (!sampleLead) sampleLead = { id: leadDoc.id, ...lead, ...updates };
  }
  console.log('Lead migration complete.');
  if (sampleLead) {
    console.log('Sample migrated lead:', JSON.stringify(sampleLead, null, 2));
  }
}

migrateLeads();
