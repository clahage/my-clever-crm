// Enhanced name extraction for AI Receptionist calls
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

function extractCallerName(transcript = "", phoneNumber = "") {
  if (!transcript) return phoneNumber || "Not Provided";

  // Clean up the transcript for better pattern matching
  const cleanTranscript = transcript.replace(/\s+/g, ' ').trim();
  
  // Track all potential names found
  let potentialNames = [];
  
  // Pattern 1: Direct user@ responses that look like names
  const userResponses = cleanTranscript.match(/user@\s*([^.?!]+?)(?=\s*(?:assistant@|system@|user@|$))/gi) || [];
  
  for (const response of userResponses) {
    let text = response.replace(/user@\s*/i, '').trim();
    
    // Skip common non-name responses
    if (/^(yes|no|yeah|nope|ok|okay|hello|hi|bye|thanks|thank you|information|help|please)$/i.test(text)) {
      continue;
    }
    
    // Check if it contains "my name is" or similar
    const namePatterns = [
      /my name is (.+)/i,
      /i'm (.+)/i,
      /i am (.+)/i,
      /this is (.+)/i,
      /call me (.+)/i
    ];
    
    let extractedName = null;
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        extractedName = match[1].trim();
        break;
      }
    }
    
    // If we found a name pattern, use it
    if (extractedName) {
      // Remove trailing punctuation
      extractedName = extractedName.replace(/[.,!?;:]$/, '').trim();
      
      // Check if it looks like a real name (2-4 words, reasonable length)
      const wordCount = extractedName.split(' ').length;
      if (wordCount >= 1 && wordCount <= 4 && extractedName.length <= 40) {
        potentialNames.push(extractedName);
      }
    } else if (text.length > 1 && text.length <= 40) {
      // Check if the whole response might be a name
      // Look for capital letters (names usually have them)
      const hasCapital = /[A-Z]/.test(text);
      const wordCount = text.split(' ').length;
      
      // If it's 1-4 words and has capitals, might be a name
      if (hasCapital && wordCount >= 1 && wordCount <= 4) {
        // Remove trailing punctuation
        text = text.replace(/[.,!?;:]$/, '').trim();
        
        // Additional check: does it look like a sentence? Names usually don't have verbs
        const hasCommonVerbs = /\b(is|are|was|were|have|has|had|do|does|did|can|could|will|would|want|need)\b/i.test(text);
        
        if (!hasCommonVerbs) {
          potentialNames.push(text);
        }
      }
    }
  }
  
  // Pattern 2: Look for intake form responses
  if (cleanTranscript.includes('May I ask for your full name') || 
      cleanTranscript.includes('Could you please spell out your full name')) {
    // Find the next user@ response after this question
    const intakeMatch = cleanTranscript.match(/(?:May I ask for your full name|Could you please spell out your full name)[^]*?user@\s*([^.?!]+?)(?=\s*(?:assistant@|system@|$))/i);
    if (intakeMatch) {
      let name = intakeMatch[1].trim();
      // Remove common non-name responses
      if (!/^(yes|no|yeah|nope|ok|okay)$/i.test(name) && name.length <= 40) {
        name = name.replace(/[.,!?;:]$/, '').trim();
        potentialNames.push(name);
      }
    }
  }
  
  // Pattern 3: Look for names in intake form fields
  const intakeNameMatch = cleanTranscript.match(/Intake Form:[^]*?name[^]*?"([^"]+)"/i);
  if (intakeNameMatch) {
    const name = intakeNameMatch[1].trim();
    if (name && name.length <= 40 && !name.toLowerCase().includes('not provided')) {
      potentialNames.push(name);
    }
  }
  
  // Choose the best name from potential names
  if (potentialNames.length > 0) {
    // Prefer longer names (likely full names over partial)
    // But not too long (avoid sentences)
    potentialNames.sort((a, b) => {
      const aWords = a.split(' ').length;
      const bWords = b.split(' ').length;
      
      // Prefer 2-3 word names (First Last or First Middle Last)
      if (aWords >= 2 && aWords <= 3 && (bWords < 2 || bWords > 3)) return -1;
      if (bWords >= 2 && bWords <= 3 && (aWords < 2 || aWords > 3)) return 1;
      
      // Otherwise prefer longer (more complete) names
      return b.length - a.length;
    });
    
    return potentialNames[0];
  }
  
  // Fallback to phone number
  return phoneNumber || "Not Provided";
}

export async function fixAllCallerNames() {
  try {
    console.log('========== ENHANCED NAME EXTRACTION STARTING ==========');
    
    const callsRef = collection(db, 'aiReceptionistCalls');
    const snapshot = await getDocs(callsRef);
    const allDocs = snapshot.docs;
    
    let fixedCount = 0;
    let unchangedCount = 0;
    let errorCount = 0;
    let examples = [];
    
    console.log(`Processing ${allDocs.length} documents with enhanced extraction...`);
    
    for (const docSnap of allDocs) {
      try {
        const data = docSnap.data();
        const transcript = data.transcript || '';
        const phoneNumber = data.caller || '';
        const oldName = data.callerName || '';
        
        // Extract with enhanced logic
        const newName = extractCallerName(transcript, phoneNumber);
        
        // Check if this is a meaningful improvement
        const isImprovement = (
          oldName !== newName && 
          !newName.includes('+1') && // Not just a phone number
          !newName.includes('connecting') && // Not transcript snippet
          !newName.includes('Not Provided') && // Not default
          newName !== phoneNumber // Actually found a name
        );
        
        if (isImprovement) {
          console.log(`✅ Improving: "${oldName}" → "${newName}"`);
          
          await updateDoc(doc(db, 'aiReceptionistCalls', docSnap.id), { 
            callerName: newName 
          });
          
          fixedCount++;
          if (examples.length < 5) {
            examples.push({ 
              id: docSnap.id, 
              oldName: oldName || '(empty)', 
              newName 
            });
          }
        } else {
          unchangedCount++;
          if (oldName === newName) {
            console.log(`⏭️ Already correct: ${oldName}`);
          } else {
            console.log(`⏭️ No improvement found for: ${oldName}`);
          }
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