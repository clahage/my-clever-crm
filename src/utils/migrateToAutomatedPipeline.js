// Migration utility to prepare existing data for automated pipeline
// Run this ONCE to migrate existing data to new structure
// Path: src/utils/migrateToAutomatedPipeline.js

import { collection, getDocs, updateDoc, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function migrateToAutomatedPipeline() {
  console.log('========== STARTING MIGRATION TO AUTOMATED PIPELINE ==========');
  
  const results = {
    callsUpdated: 0,
    contactsUpdated: 0,
    errors: [],
    needsManualReview: []
  };
  
  try {
    // Step 1: Update all AI Receptionist Calls
    console.log('Step 1: Updating AI Receptionist Calls...');
    const callsRef = collection(db, 'aiReceptionistCalls');
    const callsSnapshot = await getDocs(callsRef);
    
    const batch = writeBatch(db);
    let batchCount = 0;
    
    for (const callDoc of callsSnapshot.docs) {
      const data = callDoc.data();
      const updates = {};
      
      // Ensure convertedToContact field exists
      if (data.convertedToContact === undefined) {
        // If it has a contactId, it was converted
        if (data.contactId) {
          updates.convertedToContact = true;
        } else {
          // Mark as not converted so pipeline will process it
          updates.convertedToContact = false;
        }
      }
      
      // Ensure processed field exists
      if (data.processed === undefined) {
        // If it has a leadScore, it was processed
        updates.processed = !!data.leadScore;
      }
      
      // Add processedAt if missing but processed
      if (!data.processedAt && data.processed !== false) {
        updates.processedAt = data.created_at || serverTimestamp();
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        batch.update(doc(db, 'aiReceptionistCalls', callDoc.id), updates);
        batchCount++;
        results.callsUpdated++;
        
        // Commit batch every 500 documents (Firestore limit)
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }
    
    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(`Updated ${results.callsUpdated} AI Receptionist calls`);
    
    // Step 2: Update existing contacts with new required fields
    console.log('Step 2: Updating existing contacts...');
    const contactsRef = collection(db, 'contacts');
    const contactsSnapshot = await getDocs(contactsRef);
    
    const contactBatch = writeBatch(db);
    batchCount = 0;
    
    for (const contactDoc of contactsSnapshot.docs) {
      const data = contactDoc.data();
      const updates = {};
      
      // Ensure category field exists
      if (!data.category) {
        // Determine category based on existing data
        if (data.type === 'client' || data.isClient) {
          updates.category = 'client';
        } else if (data.type === 'vendor' || data.isVendor) {
          updates.category = 'vendor';
        } else if (data.type === 'employee' || data.isEmployee) {
          updates.category = 'employee';
        } else if (data.leadScore >= 1 || data.type === 'lead') {
          updates.category = 'lead';
        } else {
          updates.category = 'lead'; // Default to lead
        }
      }
      
      // Ensure status field exists
      if (!data.status) {
        if (data.category === 'lead' || updates.category === 'lead') {
          if ((data.leadScore || 0) >= 8) {
            updates.status = 'hot';
          } else if ((data.leadScore || 0) >= 5) {
            updates.status = 'warm';
          } else {
            updates.status = 'cold';
          }
        } else {
          updates.status = 'active';
        }
      }
      
      // Ensure interactions array exists
      if (!data.interactions) {
        updates.interactions = [];
        
        // If this came from an AI call, create initial interaction
        if (data.sourceDetails?.callId) {
          updates.interactions = [{
            date: data.createdAt || new Date(),
            type: 'ai-receptionist',
            summary: data.summary || '',
            sentiment: data.sourceDetails?.sentiment || {},
            duration: data.sourceDetails?.duration || 0
          }];
        }
      }
      
      // Ensure totalInteractions count
      if (data.totalInteractions === undefined) {
        updates.totalInteractions = data.interactions?.length || updates.interactions?.length || 0;
      }
      
      // Ensure lastInteraction timestamp
      if (!data.lastInteraction) {
        updates.lastInteraction = data.updatedAt || data.createdAt || serverTimestamp();
      }
      
      // Add automation flags
      if (data.autoCreated === undefined) {
        updates.autoCreated = !!data.sourceDetails?.callId; // True if from AI
      }
      
      if (data.requiresReview === undefined) {
        updates.requiresReview = (data.leadScore || 0) >= 8;
      }
      
      // Ensure tags array
      if (!data.tags) {
        const tags = [];
        if (data.category || updates.category) tags.push(data.category || updates.category);
        if (data.source) tags.push(`source-${data.source}`);
        if ((data.leadScore || 0) >= 8) tags.push('hot-lead');
        updates.tags = tags;
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        contactBatch.update(doc(db, 'contacts', contactDoc.id), {
          ...updates,
          migratedAt: serverTimestamp()
        });
        batchCount++;
        results.contactsUpdated++;
        
        // Log contacts that need manual review
        if (updates.requiresReview) {
          results.needsManualReview.push({
            id: contactDoc.id,
            name: data.name,
            reason: 'High lead score requires attention'
          });
        }
        
        // Commit batch every 500 documents
        if (batchCount >= 500) {
          await contactBatch.commit();
          batchCount = 0;
        }
      }
    }
    
    // Commit remaining updates
    if (batchCount > 0) {
      await contactBatch.commit();
    }
    
    console.log(`Updated ${results.contactsUpdated} contacts`);
    
    // Step 3: Mark unconverted calls for reprocessing
    console.log('Step 3: Marking calls for automated processing...');
    const unconvertedQuery = await getDocs(
      collection(db, 'aiReceptionistCalls')
    );
    
    let reprocessCount = 0;
    const reprocessBatch = writeBatch(db);
    
    for (const callDoc of unconvertedQuery.docs) {
      const data = callDoc.data();
      
      // If processed but not converted, mark for pipeline processing
      if (data.processed && !data.convertedToContact) {
        reprocessBatch.update(doc(db, 'aiReceptionistCalls', callDoc.id), {
          convertedToContact: false, // Explicitly false triggers pipeline
          queuedForPipeline: serverTimestamp()
        });
        reprocessCount++;
        
        if (reprocessCount >= 500) {
          await reprocessBatch.commit();
          reprocessCount = 0;
        }
      }
    }
    
    if (reprocessCount > 0) {
      await reprocessBatch.commit();
    }
    
    console.log(`Queued ${reprocessCount} calls for automated processing`);
    
  } catch (error) {
    console.error('Migration error:', error);
    results.errors.push(error.message);
  }
  
  console.log('========== MIGRATION COMPLETE ==========');
  console.log('Results:', results);
  
  return results;
}

// Function to run migration from console or button
export async function runMigration() {
  const confirmed = window.confirm(
    'This will migrate all existing data to the automated pipeline structure.\n\n' +
    'This should only be run ONCE.\n\n' +
    'Continue?'
  );
  
  if (confirmed) {
    const results = await migrateToAutomatedPipeline();
    
    if (results.errors.length > 0) {
      alert(`Migration completed with errors:\n${results.errors.join('\n')}`);
    } else {
      alert(
        `Migration successful!\n\n` +
        `Calls updated: ${results.callsUpdated}\n` +
        `Contacts updated: ${results.contactsUpdated}\n` +
        `Needs review: ${results.needsManualReview.length}\n\n` +
        `The automated pipeline will now process all unconverted calls.`
      );
    }
    
    // Reload to see changes
    setTimeout(() => window.location.reload(), 2000);
  }
}