// Utility to reprocess caller names in aiReceptionistCalls
// Usage: node src/utils/reprocessCallerNames.js

const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');
const { extractCallerName } = require('../services/aiDataProcessor');
const firebaseConfig = require('../config/firebaseConfig');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function cleanName(name, phoneNumber) {
  if (!name) return phoneNumber || 'Not Provided';
  let cleaned = name.replace(/^(system@|assistant@|user@)\s*/i, '').trim();
  if (cleaned.length > 50) return phoneNumber || 'Not Provided';
  return cleaned;
}

async function reprocessCallerNames() {
  const callsRef = collection(db, 'aiReceptionistCalls');
  const snapshot = await getDocs(callsRef);
  let updated = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const transcript = data.transcript || '';
    const phoneNumber = data.caller || '';
    // Extraction logic
    let name = '';
    // 1. Look for user@ [NAME]
    const userMatch = transcript.match(/user@\s*([A-Za-z .'-]+)/i);
    if (userMatch) {
      name = cleanName(userMatch[1], phoneNumber);
    } else {
      // 2. Look for patterns after "your name" questions
      const askMatch = transcript.match(/assistant@[^\n]*name[^\n]*\n?user@ ([A-Za-z .'-]+)/i);
      if (askMatch) {
        name = cleanName(askMatch[1], phoneNumber);
      } else {
        // 3. Use extractCallerName fallback
        name = cleanName(extractCallerName(transcript, phoneNumber), phoneNumber);
      }
    }
    // Never use transcript snippets as names
    if (!name || name === transcript || name.length > 50) {
      name = phoneNumber || 'Not Provided';
    }
    // Update Firestore
    await updateDoc(doc(callsRef, docSnap.id), { callerName: name });
    console.log(`Call ${docSnap.id}: Extracted caller name: ${name}`);
    updated++;
  }
  console.log(`Finished. Updated ${updated} calls.`);
}

if (require.main === module) {
  reprocessCallerNames();
}
