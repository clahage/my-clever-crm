// Utility to test fixing callerName for one document
// Usage: node src/utils/testFixSingleName.js

const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');
const firebaseConfig = require('../config/firebaseConfig');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function extractNameFromTranscript(transcript, phoneNumber) {
  if (!transcript) return phoneNumber || 'Not Provided';
  // Find all user@ lines
  const userLines = transcript.split(/assistant@|system@/i)
    .map(chunk => chunk.split(/\n/))
    .flat()
    .filter(line => /user@/i.test(line));
  for (const line of userLines) {
    const match = line.match(/user@\s*([A-Za-z .'-]+)/i);
    if (match) {
      let name = match[1].trim();
      if (name.length > 1 && name.length < 50) return name;
    }
  }
  return phoneNumber || 'Not Provided';
}

async function testFixSingleName() {
  console.log('========== STARTING NAME FIX TEST ==========');
  console.log('Step 1: Looking for document with bad callerName...');
  const callsRef = collection(db, 'aiReceptionistCalls');
  const snapshot = await getDocs(callsRef);
  let docToFix = null;
  for (const docSnap of snapshot.docs) {
    if (docSnap.data().callerName && docSnap.data().callerName.toLowerCase().includes('connecting you now')) {
      docToFix = docSnap;
      break;
    }
  }
  if (!docToFix) {
    console.log('No document found with callerName containing "connecting you now"');
    console.log('========== NAME FIX TEST COMPLETE ==========');
    return;
  }
  console.log('Step 2: Found document ID:', docToFix.id);
  console.log('Step 3: Current bad callerName:', docToFix.data().callerName);
  const transcript = docToFix.data().transcript || '';
  console.log('Step 4: Full transcript:', transcript);
  console.log('Step 5: Searching for user@ patterns...');
  const extractedName = extractNameFromTranscript(transcript, docToFix.data().caller);
  console.log('Step 6: Extracted name:', extractedName);
  // Search transcript for potential names
  const potentialNames = [];
  const nameRegex = /\b([A-Z][a-z]+)\b/g;
  let match;
  while ((match = nameRegex.exec(transcript)) !== null) {
    if (["John", "Murphy", "Sarah"].includes(match[1]) || match[1].length > 2) {
      potentialNames.push(match[1]);
    }
  }
  console.log('Step 7: Potential names found:', potentialNames);
  console.log('Step 8: Updating database...');
  await updateDoc(doc(callsRef, docToFix.id), { callerName: extractedName });
  console.log(`Updated callerName for doc ${docToFix.id} to: ${extractedName}`);
  console.log('========== NAME FIX TEST COMPLETE ==========');
  // Return result object for UI
  return {
    success: true,
    documentId: docToFix.id,
    oldName: docToFix.data().callerName,
    newName: extractedName,
    transcript: transcript.substring(0, 500) + '...',
    potentialNames
  };
}

if (require.main === module) {
  testFixSingleName();
}
