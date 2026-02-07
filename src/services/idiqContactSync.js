// ============================================================================
// Path: src/services/idiqContactSync.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// Trademark registered USPTO, violations prosecuted.
//
// IDIQ CONTACT SYNC SERVICE
// ============================================================================
// Syncs IDIQ enrollment data back to contact records
// Fixes Bug #3: IDIQ data not syncing to contacts
//
// CHRISTOPHER'S ISSUE:
// "Michele completed IDIQ enrollment, but data didn't populate to her contact 
// record. Expected: Address, SSN (last 4), DOB should sync from IDIQ form to 
// contact."
//
// WHAT THIS SERVICE DOES:
// - Syncs address from IDIQ to contact
// - Syncs personal info (DOB, SSN last 4)
// - Updates IDIQ enrollment status
// - Tracks enrollment completion
// - Updates pipeline stage
//
// CALLED FROM:
// - CompleteEnrollmentFlow.jsx (after IDIQ submission)
// - Any component that completes IDIQ enrollment
// ============================================================================

import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ===== SYNC IDIQ DATA TO CONTACT =====

/**
 * Sync IDIQ enrollment data to contact record
 * 
 * @param {string} contactId - Contact document ID
 * @param {Object} idiqData - IDIQ enrollment form data
 * @returns {Promise<Object>} Update result
 */
export async function syncIDIQToContact(contactId, idiqData) {
  console.log('===== SYNCING IDIQ DATA TO CONTACT =====');
  console.log('Contact ID:', contactId);
  console.log('IDIQ Data:', idiqData);

  try {
    // ===== VALIDATION =====
    if (!contactId) {
      throw new Error('Contact ID is required');
    }

    if (!idiqData || typeof idiqData !== 'object') {
      throw new Error('Invalid IDIQ data');
    }

    // ===== PREPARE UPDATE DATA =====
    const updateData = {
      updatedAt: serverTimestamp()
    };

    // ===== SYNC ADDRESS INFORMATION =====
    if (idiqData.address1 || idiqData.street) {
      updateData.street = idiqData.address1 || idiqData.street;
      console.log('✅ Syncing street address:', updateData.street);
    }

    if (idiqData.address2) {
      updateData.address2 = idiqData.address2;
      console.log('✅ Syncing address line 2:', updateData.address2);
    }

    if (idiqData.city) {
      updateData.city = idiqData.city;
      console.log('✅ Syncing city:', updateData.city);
    }

    if (idiqData.state) {
      updateData.state = idiqData.state;
      console.log('✅ Syncing state:', updateData.state);
    }

    if (idiqData.zip || idiqData.zipCode) {
      updateData.zip = idiqData.zip || idiqData.zipCode;
      console.log('✅ Syncing zip code:', updateData.zip);
    }

    // ===== SYNC PERSONAL INFORMATION =====
    if (idiqData.dob || idiqData.dateOfBirth) {
      updateData.dateOfBirth = idiqData.dob || idiqData.dateOfBirth;
      console.log('✅ Syncing date of birth');
    }

    // SSN - Store only last 4 digits for security
    if (idiqData.ssn) {
      const ssnLast4 = idiqData.ssn.toString().replace(/\D/g, '').slice(-4);
      updateData.ssnLast4 = ssnLast4;
      console.log('✅ Syncing SSN (last 4):', ssnLast4);
    }

    // ===== SYNC IDIQ ENROLLMENT STATUS =====
    updateData.idiqEnrollment = {
      status: 'active',
      enrolledAt: serverTimestamp(),
      membershipNumber: idiqData.membershipNumber || idiqData.idiqMembershipNumber || null,
      secretWord: idiqData.secretWord || null,
      enrollmentComplete: true
    };

    console.log('✅ Setting IDIQ enrollment status: active');

    // ===== SYNC IDIQ SECTION FOR CONTACT FORM =====
    // UltimateContactForm reads from idiq.* fields for the
    // "IDIQ Membership & Credentials" section.
    // We update these so the contact form displays the data.
    const memberNumber = idiqData.membershipNumber || idiqData.idiqMembershipNumber || '';
    const secretWord = idiqData.secretWord || (idiqData.ssn ? idiqData.ssn.replace(/\D/g, '').slice(-4) : '');

    updateData['idiq.membershipStatus'] = 'active';
    updateData['idiq.memberId'] = memberNumber;
    updateData['idiq.username'] = idiqData.email ? idiqData.email.toLowerCase().trim() : '';
    // Password stored ONLY in idiq section (not top-level contact)
    updateData['idiq.password'] = idiqData.password || '';
    updateData['idiq.secretWord'] = secretWord;
    updateData['idiq.enrollmentDate'] = new Date().toISOString().split('T')[0];
    updateData['idiq.monitoringActive'] = true;
    updateData['idiq.enrolledAt'] = serverTimestamp();
    updateData['idiq.dashboardAccess'] = true;

    console.log('✅ Syncing IDIQ credentials to contact form');
    console.log('   Username:', updateData['idiq.username']);
    console.log('   Member ID:', memberNumber || '(pending)');
    console.log('   Secret Word:', secretWord ? '****' : '(none)');

    // ===== UPDATE PIPELINE STAGE =====
    // Contact has completed IDIQ enrollment, move to next stage
    updateData.pipelineStage = 'idiq-enrolled';
    updateData.enrollmentStatus = 'idiq-complete';
    updateData.idiqEnrolledAt = serverTimestamp();

    console.log('✅ Updating pipeline stage: idiq-enrolled');

    // ===== ADDITIONAL FIELDS (IF PROVIDED) =====
    if (idiqData.phone && !idiqData.phone.includes('*')) {
      // Only update phone if it's not masked
      updateData.phone = idiqData.phone.replace(/\D/g, '');
    }

    if (idiqData.email && !idiqData.email.includes('*')) {
      // Only update email if it's not masked
      updateData.email = idiqData.email.toLowerCase().trim();
    }

    // ===== PERFORM UPDATE =====
    const contactRef = doc(db, 'contacts', contactId);
    await updateDoc(contactRef, updateData);

    console.log('✅ Contact updated successfully!');
    console.log('   Fields updated:', Object.keys(updateData).length);
    console.log('   Updated fields:', Object.keys(updateData).join(', '));

    return {
      success: true,
      contactId,
      updatedFields: Object.keys(updateData),
      message: 'IDIQ data synced to contact successfully'
    };

  } catch (error) {
    console.error('❌ Error syncing IDIQ to contact:', error);
    throw error;
  }
}

// ===== GET CONTACT WITH IDIQ DATA =====

/**
 * Fetch contact record with IDIQ enrollment data
 * 
 * @param {string} contactId - Contact document ID
 * @returns {Promise<Object>} Contact data with IDIQ info
 */
export async function getContactWithIDIQ(contactId) {
  console.log('📥 Fetching contact with IDIQ data:', contactId);

  try {
    const contactRef = doc(db, 'contacts', contactId);
    const contactSnap = await getDoc(contactRef);

    if (!contactSnap.exists()) {
      throw new Error('Contact not found');
    }

    const contactData = {
      id: contactSnap.id,
      ...contactSnap.data()
    };

    console.log('✅ Contact fetched successfully');
    console.log('   IDIQ Enrollment:', contactData.idiqEnrollment?.status || 'Not enrolled');

    return contactData;

  } catch (error) {
    console.error('❌ Error fetching contact:', error);
    throw error;
  }
}

// ===== UPDATE CONTACT ENROLLMENT STAGE =====

/**
 * Update contact's enrollment stage in pipeline
 * 
 * @param {string} contactId - Contact document ID
 * @param {string} stage - New pipeline stage
 * @returns {Promise<void>}
 */
export async function updateContactEnrollmentStage(contactId, stage) {
  console.log('📊 Updating contact enrollment stage:', stage);

  try {
    const contactRef = doc(db, 'contacts', contactId);
    await updateDoc(contactRef, {
      pipelineStage: stage,
      [`${stage}At`]: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Enrollment stage updated:', stage);

  } catch (error) {
    console.error('❌ Error updating enrollment stage:', error);
    throw error;
  }
}

// ===== UPDATE CONTACT ROLES =====

/**
 * Add role to contact's roles array
 * 
 * @param {string} contactId - Contact document ID
 * @param {string} role - Role to add (e.g., 'lead', 'prospect', 'client')
 * @returns {Promise<void>}
 */
export async function addContactRole(contactId, role) {
  console.log('👤 Adding role to contact:', role);

  try {
    const contactRef = doc(db, 'contacts', contactId);
    const contactSnap = await getDoc(contactRef);

    if (!contactSnap.exists()) {
      throw new Error('Contact not found');
    }

    const currentRoles = contactSnap.data().roles || ['contact'];

    // Don't add if already exists
    if (currentRoles.includes(role)) {
      console.log('ℹ️ Role already exists, skipping:', role);
      return;
    }

    const updatedRoles = [...currentRoles, role];

    await updateDoc(contactRef, {
      roles: updatedRoles,
      [`${role}AddedAt`]: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Role added:', role);
    console.log('   Current roles:', updatedRoles.join(', '));

  } catch (error) {
    console.error('❌ Error adding role:', error);
    throw error;
  }
}

// ===== HELPER: FORMAT PHONE NUMBER =====

/**
 * Format phone number to consistent 10-digit format
 * 
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone (10 digits)
 */
export function formatPhone(phone) {
  if (!phone) return '';
  
  const digits = phone.replace(/\D/g, '');
  
  // Remove leading 1 if present (US country code)
  return digits.length === 11 && digits[0] === '1' 
    ? digits.slice(1) 
    : digits;
}

// ===== HELPER: MASK SSN =====

/**
 * Mask SSN to show only last 4 digits
 * 
 * @param {string} ssn - Full SSN
 * @returns {string} Masked SSN (***-**-1234)
 */
export function maskSSN(ssn) {
  if (!ssn) return '';
  
  const digits = ssn.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  
  return `***-**-${last4}`;
}

// ===== EXPORT ALL FUNCTIONS =====

export default {
  syncIDIQToContact,
  getContactWithIDIQ,
  updateContactEnrollmentStage,
  addContactRole,
  formatPhone,
  maskSSN
};

// ===== USAGE EXAMPLE =====
/**
 * In CompleteEnrollmentFlow.jsx:
 * 
 * import { syncIDIQToContact, addContactRole } from '@/services/idiqContactSync';
 * 
 * // After IDIQ form submission
 * const handleIDIQSubmit = async (formData) => {
 *   try {
 *     // Save IDIQ enrollment to database
 *     const idiqId = await saveIDIQEnrollment(formData);
 *     
 *     // Sync data back to contact record
 *     await syncIDIQToContact(contactId, formData);
 *     
 *     console.log('✅ IDIQ data synced to contact!');
 *     
 *     // Move to next step (plan selection)
 *     onNext();
 *     
 *   } catch (error) {
 *     console.error('Failed to submit IDIQ:', error);
 *     setError(error.message);
 *   }
 * };
 */