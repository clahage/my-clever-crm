// ============================================================================
// idiqContactManager.js - Contact Creation & Duplicate Detection
// ============================================================================
// Path: src/services/idiqContactManager.js
//
// PURPOSE: Handle all contact data management for IDIQ enrollments
// - Parse enrollment form data with carrier selection
// - Detect duplicate contacts (email, phone, SSN)
// - Create new contacts with all fields including carrier info
// - Update existing contacts
// - Prevent duplicate entries
// - Schedule SMS recovery for abandoned enrollments
// - Handle iframe postMessage data from landing pages
//
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { scheduleRecoverySMS, cancelScheduledSMS, CARRIER_GATEWAYS } from './smsGatewayService';

// ============================================================================
// DATA PARSING & VALIDATION
// ============================================================================

/**
 * Parse enrollment form data into standardized contact format
 * Handles various field name variations (firstName vs first_name, etc.)
 */
export const parseEnrollmentData = (formData) => {
  console.log('📋 Parsing enrollment data:', formData);
  
  // Extract first name (handle multiple field name variations)
  const firstName = formData.firstName 
    || formData.first_name 
    || formData.fname 
    || formData.name?.split(' ')[0] 
    || '';
  
  // Extract last name
  const lastName = formData.lastName 
    || formData.last_name 
    || formData.lname 
    || formData.name?.split(' ').slice(1).join(' ') 
    || '';
  
  // Extract and normalize email
  const email = (formData.email || formData.emailAddress || '').toLowerCase().trim();
  
  // Extract and normalize phone
  const phone = formData.phone 
    || formData.phoneNumber 
    || formData.phone_number 
    || formData.mobile 
    || '';
  
  // Extract address components
  const street = formData.street 
    || formData.address 
    || formData.streetAddress 
    || formData.address1 
    || '';
  
  const street2 = formData.street2 
    || formData.address2 
    || formData.apt 
    || formData.unit 
    || '';
  
  const city = formData.city || '';
  
  const state = formData.state 
    || formData.stateCode 
    || formData.province 
    || '';
  
  const zip = formData.zip 
    || formData.zipCode 
    || formData.postalCode 
    || formData.postal_code 
    || '';
  
  // Extract identity information
  const ssn = formData.ssn 
    || formData.socialSecurity 
    || formData.social_security_number 
    || '';
  
  const dateOfBirth = formData.dateOfBirth 
    || formData.birthDate 
    || formData.dob 
    || formData.birth_date 
    || '';
  
  // Extract employment info (if provided)
  const employer = formData.employer
    || formData.employerName
    || formData.company
    || '';

  const income = formData.income
    || formData.annualIncome
    || formData.monthly_income
    || '';

  // Extract mobile carrier (for Email-to-SMS gateway)
  const carrier = formData.carrier
    || formData.mobileCarrier
    || formData.mobile_carrier
    || formData.phoneCarrier
    || null;

  // Validate carrier if provided
  const validatedCarrier = carrier && CARRIER_GATEWAYS[carrier] ? carrier : null;

  // Extract credit report data (if already retrieved)
  const creditReport = formData.creditReport || formData.credit_report || null;
  
  // Build standardized contact object
  const parsedData = {
    // === PERSONAL INFORMATION ===
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email,
    phone: cleanPhone(phone),
    
    // === ADDRESS ===
    street: street.trim(),
    street2: street2.trim(),
    city: city.trim(),
    state: state.trim().toUpperCase(),
    zip: zip.trim(),
    
    // === IDENTITY (SECURE) ===
    ssn: ssn, // Full SSN for processing, will store only last 4
    ssnLast4: ssn ? ssn.replace(/\D/g, '').slice(-4) : '',
    dateOfBirth: dateOfBirth,
    
    // === EMPLOYMENT (OPTIONAL) ===
    employer: employer.trim(),
    income: income,

    // === MOBILE CARRIER (FOR SMS GATEWAY) ===
    carrier: validatedCarrier,

    // === CREDIT REPORT (IF AVAILABLE) ===
    creditReport: creditReport,

    // === METADATA ===
    source: 'IDIQ Enrollment',
    enrollmentDate: new Date().toISOString(),
  };
  
  console.log('✅ Parsed data:', parsedData);
  return parsedData;
};

/**
 * Clean and format phone number
 */
const cleanPhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Return in standard format
  if (cleaned.length === 10) {
    return `+1${cleaned}`; // US number
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return phone; // Return as-is if non-standard
};

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

/**
 * Check for existing contacts that match the enrollment data
 * Returns: { isDuplicate: boolean, matches: [], matchType: string }
 */
export const checkForDuplicates = async (parsedData) => {
  console.log('🔍 Checking for duplicate contacts...');
  
  const matches = [];
  const contactsRef = collection(db, 'contacts');
  
  try {
    // ========================================================================
    // CHECK #1: Email Match (Highest Priority)
    // ========================================================================
    if (parsedData.email) {
      console.log('  → Checking email:', parsedData.email);
      
      const emailQuery = query(
        contactsRef,
        where('email', '==', parsedData.email)
      );
      
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        emailSnapshot.forEach(doc => {
          matches.push({
            id: doc.id,
            ...doc.data(),
            matchType: 'email',
            matchConfidence: 'high'
          });
        });
        
        console.log('  ⚠️ Email match found:', matches.length);
        
        return {
          isDuplicate: true,
          matches: matches,
          matchType: 'email',
          confidence: 'high'
        };
      }
    }
    
    // ========================================================================
    // CHECK #2: Phone Match (Medium Priority)
    // ========================================================================
    if (parsedData.phone) {
      console.log('  → Checking phone:', parsedData.phone);
      
      const phoneQuery = query(
        contactsRef,
        where('phone', '==', parsedData.phone)
      );
      
      const phoneSnapshot = await getDocs(phoneQuery);
      
      if (!phoneSnapshot.empty) {
        phoneSnapshot.forEach(doc => {
          matches.push({
            id: doc.id,
            ...doc.data(),
            matchType: 'phone',
            matchConfidence: 'medium'
          });
        });
        
        console.log('  ⚠️ Phone match found:', matches.length);
        
        return {
          isDuplicate: true,
          matches: matches,
          matchType: 'phone',
          confidence: 'medium'
        };
      }
    }
    
    // ========================================================================
    // CHECK #3: SSN + Name Match (Medium-Low Priority)
    // ========================================================================
    if (parsedData.ssnLast4 && parsedData.firstName && parsedData.lastName) {
      console.log('  → Checking SSN + Name combination');
      
      const ssnQuery = query(
        contactsRef,
        where('ssnLast4', '==', parsedData.ssnLast4),
        where('firstName', '==', parsedData.firstName),
        where('lastName', '==', parsedData.lastName)
      );
      
      const ssnSnapshot = await getDocs(ssnQuery);
      
      if (!ssnSnapshot.empty) {
        ssnSnapshot.forEach(doc => {
          matches.push({
            id: doc.id,
            ...doc.data(),
            matchType: 'ssn_name',
            matchConfidence: 'medium-low'
          });
        });
        
        console.log('  ⚠️ SSN + Name match found:', matches.length);
        
        return {
          isDuplicate: true,
          matches: matches,
          matchType: 'ssn_name',
          confidence: 'medium-low'
        };
      }
    }
    
    // ========================================================================
    // CHECK #4: Address + Name Match (Low Priority - Fuzzy)
    // ========================================================================
    if (parsedData.street && parsedData.zip && parsedData.lastName) {
      console.log('  → Checking Address + Name combination');
      
      const addressQuery = query(
        contactsRef,
        where('zip', '==', parsedData.zip),
        where('lastName', '==', parsedData.lastName)
      );
      
      const addressSnapshot = await getDocs(addressQuery);
      
      if (!addressSnapshot.empty) {
        // Further filter by street match (fuzzy)
        addressSnapshot.forEach(doc => {
          const data = doc.data();
          
          // Check if streets are similar
          if (data.street && isSimilarStreet(data.street, parsedData.street)) {
            matches.push({
              id: doc.id,
              ...data,
              matchType: 'address_name',
              matchConfidence: 'low'
            });
          }
        });
        
        if (matches.length > 0) {
          console.log('  ⚠️ Address + Name match found:', matches.length);
          
          return {
            isDuplicate: true,
            matches: matches,
            matchType: 'address_name',
            confidence: 'low'
          };
        }
      }
    }
    
    // ========================================================================
    // NO DUPLICATES FOUND
    // ========================================================================
    console.log('  ✅ No duplicates found');
    
    return {
      isDuplicate: false,
      matches: [],
      matchType: null,
      confidence: null
    };
    
  } catch (error) {
    console.error('❌ Duplicate check error:', error);
    throw new Error('Failed to check for duplicates: ' + error.message);
  }
};

/**
 * Fuzzy string matching for street addresses
 */
const isSimilarStreet = (street1, street2) => {
  const normalize = (str) => {
    return str
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/street/gi, 'st')
      .replace(/avenue/gi, 'ave')
      .replace(/boulevard/gi, 'blvd')
      .replace(/road/gi, 'rd')
      .replace(/drive/gi, 'dr')
      .replace(/lane/gi, 'ln')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const norm1 = normalize(street1);
  const norm2 = normalize(street2);
  
  // Exact match after normalization
  if (norm1 === norm2) return true;
  
  // One contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  return false;
};

// ============================================================================
// CONTACT CREATION
// ============================================================================

/**
 * Create a new contact in Firestore with all enrollment data
 */
export const createContact = async (parsedData) => {
  console.log('📝 Creating new contact...');
  
  try {
    // Build contact document
    const contactData = {
      // === PERSONAL INFORMATION ===
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
      email: parsedData.email,
      phone: parsedData.phone,
      
      // === ADDRESS ===
      street: parsedData.street,
      street2: parsedData.street2,
      city: parsedData.city,
      state: parsedData.state,
      zip: parsedData.zip,
      
      // === IDENTITY (SECURE - ONLY LAST 4 OF SSN) ===
      ssnLast4: parsedData.ssnLast4,
      dateOfBirth: parsedData.dateOfBirth,
      
      // === EMPLOYMENT (OPTIONAL) ===
      employer: parsedData.employer,
      income: parsedData.income,
      
      // === CONTACT METADATA ===
      source: parsedData.source,
      status: 'prospect', // Initial status
      roles: ['contact', 'lead'], // Default roles
      leadScore: 7, // Default score for IDIQ enrollments
      
      // === MOBILE CARRIER (FOR SMS RECOVERY) ===
      carrier: parsedData.carrier,

      // === IDIQ SPECIFIC ===
      idiq: {
        enrolled: true,
        enrolledAt: serverTimestamp(),
        enrollmentSource: 'website',
        memberToken: null, // Will be updated when IDIQ returns token
        reportRequested: !!parsedData.creditReport,
      },

      // === CREDIT REPORT (IF AVAILABLE) ===
      hasCreditReport: !!parsedData.creditReport,

      // === TIMESTAMPS ===
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Create contact
    const contactRef = await addDoc(collection(db, 'contacts'), contactData);
    
    console.log('✅ Contact created successfully:', contactRef.id);
    
    return {
      success: true,
      contactId: contactRef.id,
      isNew: true,
      message: 'New contact created successfully'
    };
    
  } catch (error) {
    console.error('❌ Contact creation error:', error);
    throw new Error('Failed to create contact: ' + error.message);
  }
};

// ============================================================================
// CONTACT UPDATE
// ============================================================================

/**
 * Update an existing contact with new enrollment data
 * Merges new data with existing, preserving important fields
 */
export const updateContact = async (contactId, parsedData) => {
  console.log('📝 Updating existing contact:', contactId);
  
  try {
    const contactRef = doc(db, 'contacts', contactId);
    
    // Build update data - only update fields that have values
    const updateData = {
      // Update all provided fields
      ...(parsedData.firstName && { firstName: parsedData.firstName }),
      ...(parsedData.lastName && { lastName: parsedData.lastName }),
      ...(parsedData.email && { email: parsedData.email }),
      ...(parsedData.phone && { phone: parsedData.phone }),
      
      // Address
      ...(parsedData.street && { street: parsedData.street }),
      ...(parsedData.street2 && { street2: parsedData.street2 }),
      ...(parsedData.city && { city: parsedData.city }),
      ...(parsedData.state && { state: parsedData.state }),
      ...(parsedData.zip && { zip: parsedData.zip }),
      
      // Identity
      ...(parsedData.ssnLast4 && { ssnLast4: parsedData.ssnLast4 }),
      ...(parsedData.dateOfBirth && { dateOfBirth: parsedData.dateOfBirth }),
      
      // Employment
      ...(parsedData.employer && { employer: parsedData.employer }),
      ...(parsedData.income && { income: parsedData.income }),
      
      // IDIQ enrollment data
      'idiq.enrolled': true,
      'idiq.lastEnrollmentAt': serverTimestamp(),
      'idiq.reportRequested': !!parsedData.creditReport,
      
      // Credit report flag
      ...(parsedData.creditReport && { hasCreditReport: true }),
      
      // Update timestamp
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(contactRef, updateData);
    
    console.log('✅ Contact updated successfully:', contactId);
    
    return {
      success: true,
      contactId: contactId,
      isNew: false,
      message: 'Existing contact updated successfully'
    };
    
  } catch (error) {
    console.error('❌ Contact update error:', error);
    throw new Error('Failed to update contact: ' + error.message);
  }
};

// ============================================================================
// MAIN WORKFLOW FUNCTION
// ============================================================================

/**
 * Main function: Process enrollment data and create/update contact
 * This is the primary entry point for the IDIQ workflow
 */
export const processEnrollment = async (enrollmentFormData, options = {}) => {
  console.log('🚀 Processing IDIQ enrollment...');
  console.log('Options:', options);
  
  try {
    // ========================================================================
    // STEP 1: Parse the enrollment data
    // ========================================================================
    const parsedData = parseEnrollmentData(enrollmentFormData);
    
    // Validate required fields
    if (!parsedData.email) {
      throw new Error('Email is required');
    }
    if (!parsedData.firstName || !parsedData.lastName) {
      throw new Error('First and last name are required');
    }
    
    // ========================================================================
    // STEP 2: Check for duplicates
    // ========================================================================
    const duplicateCheck = await checkForDuplicates(parsedData);
    
    // If duplicate found and user didn't specify to force create OR update existing
    if (duplicateCheck.isDuplicate && !options.forceCreate && !options.updateExisting) {
    console.log('⚠️ Duplicate found, returning for user decision');
  
    return {
    success: false,
    isDuplicate: true,
    duplicateCheck: duplicateCheck,
    parsedData: parsedData,
    message: 'Duplicate contact found - user decision required'
  };
    }
    
    // ========================================================================
    // STEP 3: Create new contact OR update existing
    // ========================================================================
    let result;
    
    if (options.updateExisting && duplicateCheck.matches.length > 0) {
      // Update the first matching contact
      const existingContactId = duplicateCheck.matches[0].id;
      result = await updateContact(existingContactId, parsedData);
    } else {
      // Create new contact
      result = await createContact(parsedData);
    }
    
    console.log('✅ Enrollment processed successfully');
    
    return {
      success: true,
      isDuplicate: false,
      ...result,
      parsedData: parsedData
    };
    
  } catch (error) {
    console.error('❌ Enrollment processing error:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to process enrollment'
    };
  }
};

// ============================================================================
// IFRAME POSTMESSAGE HANDLING
// ============================================================================

/**
 * Parse data received from parent landing page via postMessage
 * This handles the iframe handshake with speedycreditrepair.com
 */
export const parseIframeData = (messageData) => {
  console.log('📨 Parsing iframe postMessage data:', messageData);

  // Handle various data formats from landing page
  const data = messageData.data || messageData;

  return {
    firstName: data.firstName || data.first_name || data.fname || '',
    lastName: data.lastName || data.last_name || data.lname || '',
    email: data.email || data.emailAddress || '',
    phone: data.phone || data.phoneNumber || data.mobile || '',
    carrier: data.carrier || data.mobileCarrier || null,
    street: data.street || data.address || '',
    city: data.city || '',
    state: data.state || '',
    zip: data.zip || data.zipCode || '',
    source: data.source || 'landing_page_iframe',
    landingPageUrl: data.url || data.landingPageUrl || '',
    utmSource: data.utm_source || data.utmSource || '',
    utmMedium: data.utm_medium || data.utmMedium || '',
    utmCampaign: data.utm_campaign || data.utmCampaign || '',
  };
};

/**
 * Create listener for iframe postMessage events
 * Call this in your enrollment component's useEffect
 */
export const createIframeListener = (onDataReceived) => {
  const handleMessage = (event) => {
    // Validate origin (add your landing page domain)
    const allowedOrigins = [
      'https://speedycreditrepair.com',
      'https://www.speedycreditrepair.com',
      'http://localhost:3000', // For development
      'http://localhost:5173', // Vite dev server
    ];

    if (!allowedOrigins.includes(event.origin)) {
      console.warn('⚠️ Received postMessage from untrusted origin:', event.origin);
      return;
    }

    // Check if this is enrollment data
    if (event.data && (event.data.type === 'ENROLLMENT_DATA' || event.data.firstName || event.data.email)) {
      console.log('✅ Received valid enrollment data from landing page');
      const parsedData = parseIframeData(event.data);
      onDataReceived(parsedData);
    }
  };

  // Add event listener
  window.addEventListener('message', handleMessage);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};

// ============================================================================
// ENROLLMENT ABANDONMENT & RECOVERY
// ============================================================================

/**
 * Mark enrollment as abandoned and schedule recovery SMS
 * Called when user leaves after Phase 1 but before completion
 */
export const markEnrollmentAbandoned = async (contactId, enrollmentData) => {
  console.log('⚠️ Marking enrollment as abandoned:', contactId);

  try {
    // Update contact status
    const contactRef = doc(db, 'contacts', contactId);
    await updateDoc(contactRef, {
      status: 'abandoned',
      abandonedAt: serverTimestamp(),
      abandonedPhase: enrollmentData.currentPhase || 1,
      updatedAt: serverTimestamp(),
    });

    // Schedule recovery SMS if carrier is available
    if (enrollmentData.phone && enrollmentData.carrier) {
      const resumeLink = `https://speedycreditrepair.com/enroll?resume=${contactId}`;

      await scheduleRecoverySMS({
        phone: enrollmentData.phone,
        carrier: enrollmentData.carrier,
        firstName: enrollmentData.firstName || 'Friend',
        contactId: contactId,
        resumeLink: resumeLink,
        delayMinutes: 15, // 15 minute delay as per requirements
      });

      console.log('📱 Recovery SMS scheduled for 15 minutes');
    }

    // Log abandonment event
    await addDoc(collection(db, 'enrollmentEvents'), {
      type: 'abandonment',
      contactId: contactId,
      phase: enrollmentData.currentPhase || 1,
      hasCarrier: !!enrollmentData.carrier,
      recoverySmsScheduled: !!(enrollmentData.phone && enrollmentData.carrier),
      timestamp: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Enrollment marked as abandoned',
      recoverySmsScheduled: !!(enrollmentData.phone && enrollmentData.carrier),
    };

  } catch (error) {
    console.error('❌ Failed to mark enrollment as abandoned:', error);
    throw error;
  }
};

/**
 * Mark enrollment as completed and cancel any scheduled recovery SMS
 */
export const markEnrollmentCompleted = async (contactId) => {
  console.log('✅ Marking enrollment as completed:', contactId);

  try {
    // Cancel any scheduled recovery SMS
    await cancelScheduledSMS(contactId);

    // Update contact status
    const contactRef = doc(db, 'contacts', contactId);
    await updateDoc(contactRef, {
      status: 'client',
      roles: ['contact', 'client'],
      enrollmentCompleted: true,
      enrollmentCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Log completion event
    await addDoc(collection(db, 'enrollmentEvents'), {
      type: 'completion',
      contactId: contactId,
      timestamp: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Enrollment marked as completed',
    };

  } catch (error) {
    console.error('❌ Failed to mark enrollment as completed:', error);
    throw error;
  }
};

/**
 * Resume abandoned enrollment
 * Called when user returns via recovery link
 */
export const resumeEnrollment = async (contactId) => {
  console.log('🔄 Resuming enrollment for contact:', contactId);

  try {
    // Get contact data
    const contactRef = doc(db, 'contacts', contactId);
    const contactSnap = await getDoc(contactRef);

    if (!contactSnap.exists()) {
      throw new Error('Contact not found');
    }

    const contactData = contactSnap.data();

    // Update status to indicate resumed
    await updateDoc(contactRef, {
      status: 'prospect',
      resumedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Cancel any remaining scheduled SMS
    await cancelScheduledSMS(contactId);

    // Log resume event
    await addDoc(collection(db, 'enrollmentEvents'), {
      type: 'resume',
      contactId: contactId,
      previousPhase: contactData.abandonedPhase || 1,
      timestamp: serverTimestamp(),
    });

    return {
      success: true,
      contactData: {
        id: contactId,
        ...contactData,
      },
      resumePhase: contactData.abandonedPhase || 1,
    };

  } catch (error) {
    console.error('❌ Failed to resume enrollment:', error);
    throw error;
  }
};

// ============================================================================
// LOCAL STORAGE STATE MANAGEMENT
// ============================================================================

const STORAGE_KEY = 'speedy_enrollment_state';

/**
 * Save enrollment state to localStorage for recovery
 */
export const saveEnrollmentState = (state) => {
  try {
    const stateToSave = {
      ...state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    console.log('💾 Enrollment state saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save enrollment state:', error);
  }
};

/**
 * Load enrollment state from localStorage
 */
export const loadEnrollmentState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const state = JSON.parse(saved);

    // Check if state is expired (older than 24 hours)
    const savedAt = new Date(state.savedAt);
    const now = new Date();
    const hoursDiff = (now - savedAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      console.log('⏰ Saved enrollment state expired, clearing...');
      clearEnrollmentState();
      return null;
    }

    console.log('📂 Loaded enrollment state from localStorage');
    return state;

  } catch (error) {
    console.error('❌ Failed to load enrollment state:', error);
    return null;
  }
};

/**
 * Clear enrollment state from localStorage
 */
export const clearEnrollmentState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Enrollment state cleared from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear enrollment state:', error);
  }
};

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  parseEnrollmentData,
  checkForDuplicates,
  createContact,
  updateContact,
  processEnrollment,
  // Iframe handling
  parseIframeData,
  createIframeListener,
  // Abandonment & recovery
  markEnrollmentAbandoned,
  markEnrollmentCompleted,
  resumeEnrollment,
  // Local storage
  saveEnrollmentState,
  loadEnrollmentState,
  clearEnrollmentState,
};