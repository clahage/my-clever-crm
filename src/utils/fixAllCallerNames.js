// Enhanced name extraction with specific fixes for multi-word names split across user@ tags
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

function extractCallerName(transcript = "", phoneNumber = "") {
  if (!transcript) return phoneNumber || "Not Provided";

  // Special handling for "My name is X" followed by another user@ with likely last name
  // This handles: "user@ My name is Robert user@ Hopeless"
  const namePattern1 = /user@\s*My name is\s+([A-Za-z]+)\s*user@\s*([A-Za-z]+)/i;
  const match1 = transcript.match(namePattern1);
  if (match1) {
    // Check if the second part looks like a last name (capitalized, not a common word)
    const firstName = match1[1].trim();
    const potentialLastName = match1[2].trim();
    
    // List of words that are definitely NOT last names
    const notLastNames = ['yes', 'no', 'okay', 'thanks', 'hello', 'hi', 'and', 'is', 'the'];
    
    if (!notLastNames.includes(potentialLastName.toLowerCase()) && 
        /^[A-Z]/.test(potentialLastName)) {
      return `${firstName} ${potentialLastName}`;
    }
  }
  
  // Try combining consecutive user@ lines more aggressively
  let processedTranscript = transcript;
  
  // First pass: combine user@ statements that appear to be continuing a thought
  processedTranscript = processedTranscript.replace(
    /user@\s*([^@\n]*?)\s*user@\s*([^@\n]*?)(?=\s*(?:assistant@|system@|$))/gi, 
    'user@ $1 $2'
  );
  
  // Clean up the transcript
  const cleanTranscript = processedTranscript.replace(/\s+/g, ' ').trim();
  
  // Track all potential names found
  let potentialNames = [];
  
  // Pattern for "My name is [name]" including multi-part names
  const namePatterns = [
    /user@.*?my name is\s+([A-Za-z][A-Za-z\s'-]+?)(?:\.|assistant@|system@|user@|$)/gi,
    /user@.*?i'm\s+([A-Za-z][A-Za-z\s'-]+?)(?:\.|assistant@|system@|user@|$)/gi,
    /user@.*?i am\s+([A-Za-z][A-Za-z\s'-]+?)(?:\.|assistant@|system@|user@|$)/gi,
    /user@.*?this is\s+([A-Za-z][A-Za-z\s'-]+?)(?:\.|assistant@|system@|user@|$)/gi,
  ];
  
  for (const pattern of namePatterns) {
    const matches = [...cleanTranscript.matchAll(pattern)];
    for (const match of matches) {
      if (match[1]) {
        let name = match[1].trim();
        // Remove trailing punctuation and clean up
        name = name.replace(/[.,!?;:]$/, '').trim();
        name = name.replace(/\s+/g, ' '); // normalize spaces
        
        // Check if it looks like a real name
        const wordCount = name.split(' ').length;
        if (wordCount >= 1 && wordCount <= 4 && name.length <= 40 && name.length > 1) {
          // Don't include if it's just a common word
          const commonWords = ['yes', 'no', 'hello', 'hi', 'help', 'please'];
          if (!commonWords.includes(name.toLowerCase())) {
            potentialNames.push(name);
          }
        }
      }
    }
  }
  
  // Look for intake form name field
  const intakeNameMatch = cleanTranscript.match(/Intake Form:[^]*?name[^]*?"([^"]+)"/i);
  if (intakeNameMatch) {
    const name = intakeNameMatch[1].trim();
    if (name && name.length <= 40 && 
        !name.toLowerCase().includes('not provided') &&
        name !== 'Robert') { // Don't use if it's just first name from intake
      potentialNames.push(name);
    }
  }
  
  // Choose the best name from potential names
  if (potentialNames.length > 0) {
    // Prefer longer names (full names over partials)
    potentialNames.sort((a, b) => {
      const aWords = a.split(' ').length;
      const bWords = b.split(' ').length;
      
      // Strongly prefer 2-word names (First Last)
      if (aWords === 2 && bWords !== 2) return -1;
      if (bWords === 2 && aWords !== 2) return 1;
      
      // Then prefer 3-word names
      if (aWords === 3 && bWords !== 3) return -1;
      if (bWords === 3 && aWords !== 3) return 1;
      
      // Otherwise prefer longer
      return b.length - a.length;
    });
    
    return potentialNames[0];
  }
  
  // Last resort: look for any user@ response that's just a name
  const userResponses = cleanTranscript.match(/user@\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(?:assistant@|system@|$)/g);
  if (userResponses) {
    for (const response of userResponses) {
      const name = response.replace(/user@\s*/, '').replace(/\s*(?:assistant@|system@|$)/, '').trim();
      if (name && name.length > 1 && name.length <= 40 && !name.includes('@')) {
        return name;
      }
    }
  }
  
  // Fallback to phone number
  return phoneNumber || "Not Provided";
}

function extractPainPoints(transcript = "") {
  const creditPainPoints = [];
  const lowerTranscript = transcript.toLowerCase();
  
  // More specific credit terms with exact matching to avoid false positives
  const creditTerms = [
    { patterns: ['late payment', 'late pay'], display: 'late payments' },
    { patterns: ['collection'], display: 'collections' },
    { patterns: ['charge off', 'chargeoff'], display: 'charge-offs' },
    { patterns: ['student loan'], display: 'student loans' },
    { patterns: ['bankruptcy'], display: 'bankruptcy' },
    { patterns: ['foreclosure'], display: 'foreclosure' },
    { patterns: ['judgment'], display: 'judgments' },
    { patterns: ['lien'], display: 'liens' },
    { patterns: ['credit card debt'], display: 'credit card debt' },
    { patterns: ['medical debt', 'medical bill'], display: 'medical debt' },
    { patterns: ['identity theft'], display: 'identity theft' },
    { patterns: ['don\'t recognize', 'don\'t even recognize', 'unfamiliar'], display: 'unrecognized accounts' },
    { patterns: ['low score', 'bad score', 'poor score'], display: 'low credit score' },
    { patterns: ['bad credit'], display: 'bad credit' },
    { patterns: ['poor credit'], display: 'poor credit' }
  ];
  
  // Check for each term
  for (const { patterns, display } of creditTerms) {
    for (const pattern of patterns) {
      if (lowerTranscript.includes(pattern)) {
        if (!creditPainPoints.includes(display)) {
          creditPainPoints.push(display);
          break; // Found this issue, move to next
        }
      }
    }
  }
  
  // Special check for "late" near "collections" (common phrase)
  if (lowerTranscript.includes('late') && lowerTranscript.includes('collection')) {
    if (!creditPainPoints.includes('late payments')) {
      creditPainPoints.push('late payments');
    }
  }
  
  // Return specific issues if found
  if (creditPainPoints.length > 0) {
    return creditPainPoints;
  }
  
  // Generic fallback only if no specific issues found
  if (lowerTranscript.includes('help') || lowerTranscript.includes('problem') || lowerTranscript.includes('issue')) {
    return ['credit concerns'];
  }
  
  return [];
}

function calculateBetterLeadScore(data) {
  let score = 0;
  
  // Duration scoring (up to 2 points)
  const duration = parseInt(data.duration) || 0;
  if (duration >= 120) score += 2;      // 2+ minutes
  else if (duration >= 60) score += 1.5; // 1+ minute
  else if (duration >= 30) score += 1;   // 30+ seconds
  
  // Pain points scoring (up to 5 points - heavily weighted for credit issues)
  const painPoints = data.painPoints || [];
  const criticalIssues = ['collections', 'late payments', 'charge-offs', 'bankruptcy', 'foreclosure', 'student loans', 'unrecognized accounts'];
  
  let criticalCount = 0;
  for (const point of painPoints) {
    if (criticalIssues.some(c => point.toLowerCase().includes(c))) {
      criticalCount++;
    }
  }
  
  if (criticalCount >= 3) score += 5;      // Multiple critical issues
  else if (criticalCount === 2) score += 4; // Two critical issues  
  else if (criticalCount === 1) score += 3; // One critical issue
  else if (painPoints.length > 0) score += 1; // Any other issues
  
  // Engagement (up to 2 points)
  if (data.texts_sent && data.texts_sent.length > 0) score += 1;
  if (data.callerName && data.callerName !== 'Not Provided' && !data.callerName.includes('+1')) score += 1;
  
  // Sentiment bonus (up to 1 point)
  if (data.sentiment && data.sentiment.neutral >= 80) score += 0.5; // Stayed engaged
  if (data.sentiment && data.sentiment.positive >= 20) score += 0.5; // Some positivity
  
  return Math.min(Math.round(score), 10);
}

export async function fixAllCallerNames() {
  try {
    console.log('========== REFINED EXTRACTION STARTING ==========');
    
    const callsRef = collection(db, 'aiReceptionistCalls');
    const snapshot = await getDocs(callsRef);
    const allDocs = snapshot.docs;
    
    let fixedCount = 0;
    let unchangedCount = 0;
    let errorCount = 0;
    let examples = [];
    
    console.log(`Processing ${allDocs.length} documents with refined extraction...`);
    
    for (const docSnap of allDocs) {
      try {
        const data = docSnap.data();
        const transcript = data.transcript || '';
        const phoneNumber = data.caller || '';
        const oldName = data.callerName || '';
        const oldScore = data.leadScore || 0;
        const oldPainPoints = data.painPoints || [];
        
        // Extract name with better multi-line handling
        const newName = extractCallerName(transcript, phoneNumber);
        
        // Extract better pain points (without false positives)
        const newPainPoints = extractPainPoints(transcript);
        
        // Calculate better lead score
        const updatedData = { ...data, painPoints: newPainPoints };
        const newScore = calculateBetterLeadScore(updatedData);
        
        // Check if improvements were made
        const nameImproved = (
          oldName !== newName && 
          !newName.includes('+1') &&
          !newName.includes('connecting') &&
          !newName.includes('Not Provided') &&
          newName !== phoneNumber &&
          newName.split(' ').length >= oldName.split(' ').length // Prefer fuller names
        );
        
        const painPointsImproved = (
          newPainPoints.length > 0 && 
          JSON.stringify(newPainPoints.sort()) !== JSON.stringify(oldPainPoints.sort())
        );
        
        const scoreImproved = newScore > oldScore;
        
        if (nameImproved || painPointsImproved || scoreImproved) {
          console.log(`✅ Improving doc ${docSnap.id}:`);
          if (nameImproved) console.log(`   Name: "${oldName}" → "${newName}"`);
          if (painPointsImproved) console.log(`   Pain Points: [${oldPainPoints}] → [${newPainPoints.join(', ')}]`);
          if (scoreImproved) console.log(`   Score: ${oldScore} → ${newScore}`);
          
          const updates = {};
          if (nameImproved) updates.callerName = newName;
          if (painPointsImproved) updates.painPoints = newPainPoints;
          if (scoreImproved) updates.leadScore = newScore;
          
          await updateDoc(doc(db, 'aiReceptionistCalls', docSnap.id), updates);
          
          fixedCount++;
          if (examples.length < 5) {
            examples.push({ 
              id: docSnap.id, 
              oldName: oldName || '(empty)', 
              newName: nameImproved ? newName : oldName,
              oldScore,
              newScore: scoreImproved ? newScore : oldScore,
              painPoints: newPainPoints
            });
          }
        } else {
          unchangedCount++;
        }
      } catch (err) {
        errorCount++;
        console.error(`❌ Error processing doc ${docSnap.id}:`, err);
      }
    }
    
    console.log('========== EXTRACTION COMPLETE ==========');
    console.log(`Improved: ${fixedCount}, Already good: ${unchangedCount}, Errors: ${errorCount}`);
    
    return {
      success: true,
      totalDocuments: allDocs.length,
      namesFixed: fixedCount,
      unchanged: unchangedCount,
      errors: errorCount,
      examples
    };
    
  } catch (error) {
    console.error('Failed to process names:', error);
    return {
      success: false,
      error: error.message
    };
  }
}