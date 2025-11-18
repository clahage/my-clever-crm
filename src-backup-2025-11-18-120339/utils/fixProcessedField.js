// Utility to fix processed field in aiReceptionistCalls
import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { processAICallData } from '../services/aiDataProcessor';

export async function fixProcessedField() {
  console.log('Starting processed field fix...');
  const callsRef = collection(db, 'aiReceptionistCalls');
  const snapshot = await getDocs(callsRef);
  let updatedCount = 0;
  for (const callDoc of snapshot.docs) {
    const data = callDoc.data();
    let updateObj = {};
    // If processedAt exists and processed is false or missing, set processed to true
    if (data.processedAt && (!data.processed || data.processed === false)) {
      updateObj.processed = true;
    }
    // If no processedAt and processed is false, run through aiDataProcessor and set both fields
    if (!data.processedAt && data.processed === false) {
      const enriched = processAICallData(data);
      updateObj.processedAt = enriched.processedAt;
      updateObj.processed = true;
    }
    // If processed field is missing, add it based on processedAt existence
    if (typeof data.processed === 'undefined') {
      updateObj.processed = !!data.processedAt;
    }
    if (Object.keys(updateObj).length > 0) {
      await updateDoc(doc(db, 'aiReceptionistCalls', callDoc.id), updateObj);
      updatedCount++;
      console.log(`Updated call ${callDoc.id}:`, updateObj);
    }
  }
  console.log(`Done. Updated: ${updatedCount}`);
  return { updated: updatedCount };
}
