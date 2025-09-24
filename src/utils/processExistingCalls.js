// Utility to process existing raw calls in aiReceptionistCalls
import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { processAICallData } from '../services/aiDataProcessor';

export async function processExistingCalls() {
  console.log('Starting historical call processing...');
  const callsRef = collection(db, 'aiReceptionistCalls');
  const snapshot = await getDocs(callsRef);
  let processedCount = 0;
  let skippedCount = 0;
  for (const callDoc of snapshot.docs) {
    const data = callDoc.data();
    if (data.leadScore && Array.isArray(data.painPoints) && data.painPoints.length > 0) {
      skippedCount++;
      continue;
    }
    const enriched = processAICallData(data);
    await updateDoc(doc(db, 'aiReceptionistCalls', callDoc.id), {
      leadScore: enriched.leadScore,
      urgencyLevel: enriched.urgencyLevel,
      painPoints: enriched.painPoints,
      conversionProbability: enriched.conversionProbability,
      callerName: enriched.callerName,
      processedAt: enriched.processedAt,
      processed: true
    });
    processedCount++;
    console.log(`Processed call ${callDoc.id}:`, enriched);
  }
  console.log(`Done. Processed: ${processedCount}, Skipped: ${skippedCount}`);
  return { processed: processedCount, skipped: skippedCount };
}
