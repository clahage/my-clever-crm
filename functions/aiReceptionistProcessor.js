// functions/aiReceptionistProcessor.js
// IMPROVED VERSION - Smart Name Handling
// Handles missing names by extracting from email and flagging for review

const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Extract potential name from email address
 * Examples:
 *   john.smith@email.com → { firstName: "John", lastName: "Smith" }
 *   jsmith@email.com → { firstName: "Jsmith", lastName: "" }
 *   kuva.caid@yahoo.com → { firstName: "Kuva", lastName: "Caid" }
 */
function extractNameFromEmail(email) {
  if (!email || typeof email !== 'string') {
    return { firstName: '', lastName: '' };
  }

  try {
    // Get the part before @
    const localPart = email.split('@')[0];
    
    // Remove numbers and special chars except dots, hyphens, underscores
    const cleaned = localPart.replace(/[0-9]/g, '').replace(/[^a-zA-Z.\-_]/g, '');
    
    // Split by common separators
    const parts = cleaned.split(/[.\-_]+/).filter(p => p.length > 0);
    
    if (parts.length === 0) {
      return { firstName: '', lastName: '' };
    }
    
    // Capitalize first letter of each part
    const capitalized = parts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    );
    
    if (capitalized.length === 1) {
      // Single part - use as first name only
      return { 
        firstName: capitalized[0], 
        lastName: '' 
      };
    } else if (capitalized.length === 2) {
      // Two parts - first and last name
      return { 
        firstName: capitalized[0], 
        lastName: capitalized[1] 
      };
    } else {
      // Multiple parts - use first as firstName, rest as lastName
      return { 
        firstName: capitalized[0], 
        lastName: capitalized.slice(1).join(' ') 
      };
    }
  } catch (error) {
    console.error('Error extracting name from email:', error);
    return { firstName: '', lastName: '' };
  }
}

/**
 * Determine contact quality and flags based on available data
 */
function analyzeContactQuality(contactData) {
  const hasFirstName = contactData.firstName && contactData.firstName !== 'Unknown' && contactData.firstName !== '';
  const hasLastName = contactData.lastName && contactData.lastName !== '';
  const hasEmail = contactData.email && contactData.email !== '';
  const hasPhone = contactData.phone && contactData.phone !== '';
  const nameFromEmail = contactData.nameSource === 'email';
  
  const flags = [];
  const tags = [];
  let quality = 'good';
  let needsManualReview = false;
  
  // Check name quality
  if (!hasFirstName && !hasLastName) {
    quality = 'poor';
    flags.push('MISSING_NAME');
    tags.push('name-needed');
    needsManualReview = true;
  } else if (nameFromEmail) {
    quality = 'fair';
    flags.push('NAME_FROM_EMAIL');
    tags.push('verify-name');
    needsManualReview = true;
  } else if (!hasLastName) {
    quality = 'fair';
    flags.push('MISSING_LAST_NAME');
    tags.push('verify-name');
  }
  
  // Check contact info
  if (!hasEmail) {
    quality = quality === 'good' ? 'fair' : 'poor';
    flags.push('MISSING_EMAIL');
  }
  
  if (!hasPhone) {
    quality = 'poor';
    flags.push('MISSING_PHONE');
  }
  
  // High priority flags
  if (contactData.urgencyLevel === 'critical' || contactData.urgencyLevel === 'high') {
    flags.push('HIGH_PRIORITY');
    needsManualReview = true;
  }
  
  if (contactData.leadScore >= 8) {
    flags.push('HOT_LEAD');
    needsManualReview = true;
  }
  
  return {
    quality,
    flags,
    tags,
    needsManualReview,
    dataCompleteness: {
      firstName: hasFirstName,
      lastName: hasLastName,
      email: hasEmail,
      phone: hasPhone,
      nameVerified: !nameFromEmail
    }
  };
}

/**
 * Process AI Receptionist call data and create/update contact
 */
async function processAIReceptionistCall(callData, callId) {
  const db = admin.firestore();
  
  console.log(`📞 Processing AI Receptionist call: ${callId}`);
  
  try {
    // Extract data
    const extractedData = callData.extractedData || {};
    let firstName = extractedData.firstName || callData.customerName || '';
    let lastName = extractedData.lastName || '';
    const email = extractedData.email || callData.email || '';
    const phone = extractedData.phone || callData.customerPhone || callData.phone || '';
    
    let nameSource = 'transcript'; // or 'email' or 'unknown'
    
    // Handle missing names
    if (!firstName || firstName === 'Unknown' || firstName === '') {
      console.log('⚠️ Name missing or Unknown, attempting extraction from email...');
      
      if (email) {
        const extractedName = extractNameFromEmail(email);
        if (extractedName.firstName) {
          firstName = extractedName.firstName;
          lastName = extractedName.lastName;
          nameSource = 'email';
          console.log(`✅ Extracted name from email: ${firstName} ${lastName}`);
        } else {
          firstName = 'Unknown';
          lastName = '';
          nameSource = 'unknown';
          console.log('❌ Could not extract name from email');
        }
      } else {
        firstName = 'Unknown';
        lastName = '';
        nameSource = 'unknown';
        console.log('❌ No email available for name extraction');
      }
    }
    
    // Build contact data
    const contactData = {
      // Basic Info
      firstName: firstName,
      lastName: lastName || '',
      fullName: lastName ? `${firstName} ${lastName}` : firstName,
      nameSource: nameSource, // NEW: Track where name came from
      
      // Contact Info
      email: email,
      phone: phone,
      
      // AI Receptionist Data
      source: 'ai-receptionist',
      aiReceptionistCallId: callId,
      
      // Lead Info
      category: callData.category || 'lead',
      leadScore: callData.leadScore || extractedData.leadScore || 5,
      urgencyLevel: callData.urgencyLevel || extractedData.urgencyLevel || 'medium',
      lifecycleStatus: 'new',
      
      // Roles
      primaryRole: 'lead',
      roles: ['contact', 'lead'],
      
      // Intent & Interests
      intent: callData.intent || 'credit repair inquiry',
      interestLevel: extractedData.interestLevel || 'medium',
      
      // Credit Info
      creditInfo: {
        estimatedScore: extractedData.creditScore || null,
        goals: extractedData.creditGoals || callData.intent || 'Credit repair',
        issues: extractedData.issues || [],
        source: 'ai-receptionist-call'
      },
      
      // Communication Preferences
      preferredContact: 'phone',
      bestTimeToCall: extractedData.bestTimeToCall || '',
      
      // Location
      address: extractedData.address || null,
      city: extractedData.address?.city || '',
      state: extractedData.address?.state || '',
      
      // Sentiment & Analysis
      sentiment: callData.sentiment || {
        positive: 0,
        neutral: 100,
        negative: 0,
        description: 'No sentiment data available'
      },
      
      // Call Details
      callDate: callData.timestamp || admin.firestore.FieldValue.serverTimestamp(),
      
      // Metadata
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivityDate: admin.firestore.FieldValue.serverTimestamp(),
      
      // Extraction Method
      extractionMethod: callData.extractionMethod || 'transcript-parse+ai-extraction'
    };
    
    // Analyze contact quality
    const qualityAnalysis = analyzeContactQuality(contactData);
    
    // Add quality data to contact
    contactData.dataQuality = qualityAnalysis.quality;
    contactData.dataFlags = qualityAnalysis.flags;
    contactData.dataCompleteness = qualityAnalysis.dataCompleteness;
    contactData.needsManualReview = qualityAnalysis.needsManualReview;
    contactData.tags = [...new Set([...(contactData.tags || []), ...qualityAnalysis.tags])];
    
    // Build notes with quality warnings
    let notes = `📞 Call Date: ${new Date().toLocaleString()} `;
    notes += `\n⏱️ Duration: ${Math.floor(callData.callDuration / 60)}m ${callData.callDuration % 60}s `;
    notes += `\n📊 Lead Score: ${contactData.leadScore}/10 `;
    notes += `\n💡 Interest Level: ${contactData.interestLevel} `;
    
    if (qualityAnalysis.flags.length > 0) {
      notes += `\n\n⚠️ DATA QUALITY FLAGS:`;
      qualityAnalysis.flags.forEach(flag => {
        notes += `\n  • ${flag.replace(/_/g, ' ')}`;
      });
    }
    
    if (nameSource === 'email') {
      notes += `\n\n📧 Name extracted from email address - please verify with caller`;
    }
    
    if (extractedData.issues && extractedData.issues.length > 0) {
      notes += `\n⚠️ Issues: ${extractedData.issues.join(', ')} `;
    }
    
    if (extractedData.bestTimeToCall) {
      notes += `\n⏰ Best Time: ${extractedData.bestTimeToCall} `;
    }
    
    notes += `\n🔗 Call Recording: ${callData.rawPayload?.call_info_link || 'N/A'} `;
    notes += `\n🤖 Extraction: ${contactData.extractionMethod}`;
    
    contactData.notes = notes;
    
    // Check for existing contact
    let existingContact = null;
    
    // Try to find by phone first (most reliable)
    if (phone) {
      const phoneQuery = await db.collection('contacts')
        .where('phone', '==', phone)
        .limit(1)
        .get();
      
      if (!phoneQuery.empty) {
        existingContact = phoneQuery.docs[0];
        console.log(`✅ Found existing contact by phone: ${existingContact.id}`);
      }
    }
    
    // Try email if no phone match
    if (!existingContact && email) {
      const emailQuery = await db.collection('contacts')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (!emailQuery.empty) {
        existingContact = emailQuery.docs[0];
        console.log(`✅ Found existing contact by email: ${existingContact.id}`);
      }
    }
    
    let contactId;
    let action;
    
    if (existingContact) {
      // Update existing contact
      contactId = existingContact.id;
      action = 'updated';
      
      const existingData = existingContact.data();
      
      // Merge roles
      const mergedRoles = [...new Set([...(existingData.roles || []), ...contactData.roles])];
      
      // Update with new data, but preserve existing good data
      const updateData = {
        ...contactData,
        roles: mergedRoles,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivityDate: admin.firestore.FieldValue.serverTimestamp(),
        
        // Only update name if current name is better quality
        firstName: (existingData.firstName && existingData.firstName !== 'Unknown') 
          ? existingData.firstName 
          : contactData.firstName,
        lastName: existingData.lastName || contactData.lastName,
        fullName: (existingData.firstName && existingData.firstName !== 'Unknown')
          ? `${existingData.firstName} ${existingData.lastName || ''}`
          : contactData.fullName,
        
        // Merge notes
        notes: `${existingData.notes || ''}\n\n--- New Call ${new Date().toLocaleString()} ---\n${notes}`,
        
        // Keep higher lead score
        leadScore: Math.max(existingData.leadScore || 0, contactData.leadScore),
        
        // Merge tags
        tags: [...new Set([...(existingData.tags || []), ...(contactData.tags || [])])],
        
        // Merge flags
        dataFlags: [...new Set([...(existingData.dataFlags || []), ...(contactData.dataFlags || [])])],
        
        // Update quality if worse
        dataQuality: existingData.dataQuality === 'poor' || contactData.dataQuality === 'poor' 
          ? 'poor' 
          : contactData.dataQuality,
        
        needsManualReview: existingData.needsManualReview || contactData.needsManualReview
      };
      
      await db.collection('contacts').doc(contactId).update(updateData);
      console.log(`✅ Updated existing contact: ${contactId}`);
      
    } else {
      // Create new contact
      action = 'created';
      const docRef = await db.collection('contacts').add(contactData);
      contactId = docRef.id;
      console.log(`✅ Created new contact: ${contactId}`);
    }
    
    // Update call record with contact ID
    await db.collection('aiReceptionistCalls').doc(callId).update({
      contactId: contactId,
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      processingResult: {
        action: action,
        contactId: contactId,
        nameSource: nameSource,
        quality: qualityAnalysis.quality,
        flags: qualityAnalysis.flags,
        needsReview: qualityAnalysis.needsManualReview
      }
    });
    
    // Log quality issues for monitoring
    if (qualityAnalysis.needsManualReview) {
      console.log(`⚠️ Contact ${contactId} needs manual review:`, qualityAnalysis.flags);
    }
    
    return {
      success: true,
      contactId: contactId,
      action: action,
      quality: qualityAnalysis.quality,
      needsReview: qualityAnalysis.needsManualReview,
      flags: qualityAnalysis.flags
    };
    
  } catch (error) {
    console.error('❌ Error processing AI Receptionist call:', error);
    
    // Mark call as failed
    await db.collection('aiReceptionistCalls').doc(callId).update({
      processed: false,
      processingError: error.message,
      processingErrorAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    throw error;
  }
}

module.exports = {
  processAIReceptionistCall,
  extractNameFromEmail,
  analyzeContactQuality
};