// ============================================================================
// idiqContactManager.js - Contact Creation & Duplicate Detection
// ============================================================================
// Path: src/services/idiqContactManager.js
//
// PURPOSE: Handle all contact data management for IDIQ enrollments
// - Parse enrollment form data
// - Detect duplicate contacts (email, phone, SSN)
// - Create new contacts with all fields
// - Update existing contacts
// - Prevent duplicate entries
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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  parseEnrollmentData,
  checkForDuplicates,
  createContact,
  updateContact,
  processEnrollment,
};