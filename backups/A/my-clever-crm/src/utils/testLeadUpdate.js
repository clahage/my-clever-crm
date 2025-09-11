// Simple test script to update one lead with a single new field
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

async function testLeadUpdate() {
  try {
    const leadsRef = collection(db, 'contacts');
    const snapshot = await getDocs(leadsRef);
    if (snapshot.docs.length === 0) {
      console.log('No leads found.');
      return;
    }
    const leadDoc = snapshot.docs[0];
    const leadId = leadDoc.id;
    console.log('Updating lead:', leadId);
    await updateDoc(doc(db, 'contacts', leadId), { serviceType: 'basic' });
    console.log('Update successful!');
  } catch (error) {
    console.error('Update failed:', error);
  }
}

testLeadUpdate();
