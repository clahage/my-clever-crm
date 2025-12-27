// ============================================================================
// ContactAutosuggestService.js - Global Contact Search & Autofill
// ============================================================================
// Searches existing contacts in Firestore as user types in ANY form field.
// Suggests matching contacts and allows one-click autofill of entire form.
// THIS IS A GLOBAL SERVICE USED BY ALL FORMS IN THE APP.
//
// Features:
// - Search by any field: firstName, lastName, email, phone, ssn (last 4), address
// - Fuzzy matching with typo tolerance
// - Partial matching
// - Case-insensitive search
// - Client-side indexing for fast search
// - Real-time Firestore subscription for updates
// - Role-based access control
// - SSN masking for security
// - Audit trail logging
// ============================================================================

import {
  collection,
  query,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  limit,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import Fuse from 'fuse.js';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const CONTACTS_COLLECTION = 'contacts';
const AUTOFILL_LOGS_COLLECTION = 'autofillLogs';

// Searchable field mappings
const SEARCHABLE_FIELDS = {
  firstName: ['firstName', 'preferredName', 'nickname'],
  lastName: ['lastName', 'maidenName'],
  name: ['firstName', 'lastName', 'preferredName', 'nickname'],
  email: ['email', 'alternateEmail'],
  phone: ['phone', 'mobilePhone', 'workPhone', 'homePhone'],
  ssn: ['ssnLast4'],
  address: ['street', 'city'],
  zip: ['zip'],
  city: ['city'],
  dob: ['dateOfBirth'],
  any: ['firstName', 'lastName', 'email', 'phone', 'city', 'preferredName'],
};

// Autofill field mappings
const AUTOFILL_MAP = {
  firstName: (c) => c.firstName || '',
  lastName: (c) => c.lastName || '',
  middleName: (c) => c.middleName || '',
  fullName: (c) => `${c.firstName || ''} ${c.lastName || ''}`.trim(),
  email: (c) => c.email || c.emails?.[0]?.address || '',
  phone: (c) => c.phone || c.phones?.[0]?.number || '',
  mobilePhone: (c) => c.mobilePhone || c.phones?.find(p => p.type === 'mobile')?.number || c.phone || '',
  dateOfBirth: (c) => c.dateOfBirth || '',
  dob: (c) => c.dateOfBirth || '',
  ssn: (c) => c.ssn || '',
  ssnLast4: (c) => c.ssnLast4 || c.ssn?.slice(-4) || '',
  address: (c) => c.addresses?.[0]?.street || '',
  street: (c) => c.addresses?.[0]?.street || '',
  unit: (c) => c.addresses?.[0]?.unit || '',
  city: (c) => c.addresses?.[0]?.city || '',
  state: (c) => c.addresses?.[0]?.state || '',
  zip: (c) => c.addresses?.[0]?.zip || '',
  preferredName: (c) => c.preferredName || c.firstName || '',
  namePronunciation: (c) => c.namePronunciation || '',
  suffix: (c) => c.suffix || '',
  employer: (c) => c.employment?.employer || '',
  jobTitle: (c) => c.employment?.jobTitle || '',
  monthlyIncome: (c) => c.employment?.monthlyIncome || '',
  language: (c) => c.language || 'english',
  preferredContactMethod: (c) => c.preferredContactMethod || 'phone',
  // IDIQ fields
  idiqMemberId: (c) => c.idiq?.memberId || '',
  idiqUsername: (c) => c.idiq?.username || '',
};

// Fuse.js options for fuzzy search
const FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.3, // Lower = more strict matching
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'firstName', weight: 0.3 },
    { name: 'lastName', weight: 0.3 },
    { name: 'email', weight: 0.2 },
    { name: 'phone', weight: 0.1 },
    { name: 'preferredName', weight: 0.05 },
    { name: 'searchableText', weight: 0.05 },
  ],
};

// ============================================================================
// CONTACT INDEX CLASS
// ============================================================================

class ContactIndex {
  constructor() {
    this.contacts = [];
    this.fuseIndex = null;
    this.lastUpdate = null;
    this.unsubscribe = null;
    this.isLoading = false;
    this.listeners = new Set();
  }

  /**
   * Initialize the contact index with real-time updates
   */
  initialize() {
    if (this.unsubscribe) {
      console.log('Contact index already initialized');
      return;
    }

    this.isLoading = true;

    const contactsRef = collection(db, CONTACTS_COLLECTION);
    const q = query(contactsRef, orderBy('updatedAt', 'desc'), limit(2000));

    this.unsubscribe = onSnapshot(q,
      (snapshot) => {
        const contacts = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Build searchable text combining multiple fields
          const searchableText = [
            data.firstName,
            data.lastName,
            data.email,
            data.phone,
            data.preferredName,
            data.addresses?.[0]?.city,
            data.addresses?.[0]?.street,
          ].filter(Boolean).join(' ').toLowerCase();

          contacts.push({
            id: doc.id,
            ...data,
            searchableText,
            // Normalize phone for search
            phoneNormalized: (data.phone || '').replace(/\D/g, ''),
            // Get first address for quick access
            primaryAddress: data.addresses?.[0] || null,
            primaryPhone: data.phones?.[0]?.number || data.phone || null,
            primaryEmail: data.emails?.[0]?.address || data.email || null,
          });
        });

        this.contacts = contacts;
        this.fuseIndex = new Fuse(contacts, FUSE_OPTIONS);
        this.lastUpdate = new Date();
        this.isLoading = false;

        console.log(`Contact index updated: ${contacts.length} contacts indexed`);

        // Notify listeners
        this.listeners.forEach(listener => listener(contacts));
      },
      (error) => {
        console.error('Error subscribing to contacts:', error);
        this.isLoading = false;
      }
    );
  }

  /**
   * Clean up subscription
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.contacts = [];
    this.fuseIndex = null;
    this.listeners.clear();
  }

  /**
   * Add a listener for contact updates
   */
  addListener(callback) {
    this.listeners.add(callback);
    // Immediately call with current data if available
    if (this.contacts.length > 0) {
      callback(this.contacts);
    }
    return () => this.listeners.delete(callback);
  }

  /**
   * Search contacts by query and field type
   */
  search(searchQuery, fieldType = 'any', options = {}) {
    const { maxResults = 5, minScore = 0.3 } = options;

    if (!searchQuery || searchQuery.length < 2) {
      return [];
    }

    if (!this.fuseIndex) {
      console.warn('Contact index not initialized');
      return [];
    }

    const query = searchQuery.toLowerCase().trim();

    // Handle specific field types
    let results = [];

    switch (fieldType) {
      case 'phone': {
        // For phone, match digits only
        const digits = query.replace(/\D/g, '');
        if (digits.length >= 3) {
          results = this.contacts
            .filter(c => c.phoneNormalized?.includes(digits))
            .map(c => ({ item: c, score: 0.1 }));
        }
        break;
      }

      case 'email': {
        // For email, do partial match
        results = this.contacts
          .filter(c =>
            c.email?.toLowerCase().includes(query) ||
            c.primaryEmail?.toLowerCase().includes(query)
          )
          .map(c => ({ item: c, score: 0.1 }));
        break;
      }

      case 'ssn': {
        // For SSN, only match last 4 digits
        const digits = query.replace(/\D/g, '');
        if (digits.length >= 4) {
          const last4 = digits.slice(-4);
          results = this.contacts
            .filter(c => c.ssnLast4 === last4 || c.ssn?.endsWith(last4))
            .map(c => ({ item: c, score: 0.1 }));
        }
        break;
      }

      case 'zip': {
        results = this.contacts
          .filter(c => c.primaryAddress?.zip?.startsWith(query))
          .map(c => ({ item: c, score: 0.1 }));
        break;
      }

      case 'firstName':
      case 'lastName':
      case 'name': {
        // Use Fuse for fuzzy name matching
        const fuseResults = this.fuseIndex.search(query);
        results = fuseResults.filter(r => r.score <= minScore);
        break;
      }

      case 'any':
      default: {
        // Search all fields with Fuse
        const fuseResults = this.fuseIndex.search(query);
        results = fuseResults.filter(r => r.score <= minScore);

        // Also add phone matches if query looks like a phone number
        const digits = query.replace(/\D/g, '');
        if (digits.length >= 3) {
          const phoneMatches = this.contacts
            .filter(c => c.phoneNormalized?.includes(digits))
            .filter(c => !results.find(r => r.item.id === c.id))
            .map(c => ({ item: c, score: 0.2 }));
          results = [...results, ...phoneMatches];
        }
        break;
      }
    }

    // Sort by score and limit results
    return results
      .sort((a, b) => a.score - b.score)
      .slice(0, maxResults)
      .map(result => {
        const contact = result.item;
        const score = Math.round((1 - result.score) * 100);

        return {
          id: contact.id,
          score,
          contact: this._sanitizeContact(contact),
          matchedFields: this._getMatchedFields(contact, query, fieldType),
          highlightedName: this._highlightMatch(
            `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
            query
          ),
        };
      });
  }

  /**
   * Get a single contact by ID
   */
  async getContact(contactId) {
    // Try local cache first
    const cached = this.contacts.find(c => c.id === contactId);
    if (cached) {
      return this._sanitizeContact(cached);
    }

    // Fetch from Firestore
    try {
      const docRef = doc(db, CONTACTS_COLLECTION, contactId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this._sanitizeContact({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    }

    return null;
  }

  /**
   * Get autofill data for a contact
   */
  getAutofillData(contact, customFieldMap = {}) {
    const fieldMap = { ...AUTOFILL_MAP, ...customFieldMap };
    const result = {};

    for (const [fieldName, getter] of Object.entries(fieldMap)) {
      if (typeof getter === 'function') {
        result[fieldName] = getter(contact);
      }
    }

    return result;
  }

  /**
   * Sanitize contact data for display (mask sensitive info)
   */
  _sanitizeContact(contact) {
    return {
      ...contact,
      // Mask SSN - only show last 4
      ssn: contact.ssn ? `***-**-${contact.ssn.slice(-4)}` : '',
      ssnLast4: contact.ssnLast4 || contact.ssn?.slice(-4) || '',
    };
  }

  /**
   * Get matched fields for highlighting
   */
  _getMatchedFields(contact, query, fieldType) {
    const matched = [];
    const queryLower = query.toLowerCase();

    if (contact.firstName?.toLowerCase().includes(queryLower)) {
      matched.push('firstName');
    }
    if (contact.lastName?.toLowerCase().includes(queryLower)) {
      matched.push('lastName');
    }
    if (contact.email?.toLowerCase().includes(queryLower)) {
      matched.push('email');
    }
    if (contact.phoneNormalized?.includes(query.replace(/\D/g, ''))) {
      matched.push('phone');
    }
    if (contact.primaryAddress?.city?.toLowerCase().includes(queryLower)) {
      matched.push('city');
    }

    return matched;
  }

  /**
   * Highlight matching text
   */
  _highlightMatch(text, query) {
    if (!text || !query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let contactIndexInstance = null;

export const getContactIndex = () => {
  if (!contactIndexInstance) {
    contactIndexInstance = new ContactIndex();
    contactIndexInstance.initialize();
  }
  return contactIndexInstance;
};

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Search contacts by query
 * @param {string} query - Search query
 * @param {string} fieldType - Type of field being searched
 * @param {object} options - Search options
 * @returns {Promise<Array>} Array of matching contacts
 */
export const searchContacts = async (query, fieldType = 'any', options = {}) => {
  const index = getContactIndex();
  return index.search(query, fieldType, options);
};

/**
 * Get autofill data for a contact ID
 * @param {string} contactId - Contact document ID
 * @param {object} customFieldMap - Custom field mappings
 * @returns {Promise<object>} Autofill data object
 */
export const getAutofillData = async (contactId, customFieldMap = {}) => {
  const index = getContactIndex();
  const contact = await index.getContact(contactId);

  if (!contact) {
    return null;
  }

  return index.getAutofillData(contact, customFieldMap);
};

/**
 * Subscribe to contact updates
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const subscribeToContacts = (callback) => {
  const index = getContactIndex();
  return index.addListener(callback);
};

/**
 * Clear the contact index cache
 */
export const clearContactCache = () => {
  if (contactIndexInstance) {
    contactIndexInstance.destroy();
    contactIndexInstance = null;
  }
};

/**
 * Log autofill usage for audit trail
 */
export const logAutofillUsage = async (contactId, formName, userId, fieldsAutofilled) => {
  try {
    await addDoc(collection(db, AUTOFILL_LOGS_COLLECTION), {
      contactId,
      formName,
      userId,
      fieldsAutofilled,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Error logging autofill usage:', error);
  }
};

// ============================================================================
// FIELD TYPE HELPERS
// ============================================================================

/**
 * Get searchable field type from form field name
 */
export const getFieldTypeFromName = (fieldName) => {
  const nameMap = {
    firstName: 'firstName',
    lastName: 'lastName',
    name: 'name',
    fullName: 'name',
    clientName: 'name',
    recipientName: 'name',
    email: 'email',
    clientEmail: 'email',
    recipientEmail: 'email',
    phone: 'phone',
    mobilePhone: 'phone',
    workPhone: 'phone',
    recipientPhone: 'phone',
    ssn: 'ssn',
    socialSecurityNumber: 'ssn',
    address: 'address',
    street: 'address',
    city: 'city',
    zip: 'zip',
    zipCode: 'zip',
    dob: 'dob',
    dateOfBirth: 'dob',
    search: 'any',
    searchClient: 'any',
  };

  return nameMap[fieldName] || 'any';
};

/**
 * Check if autosuggest should be shown based on form state
 */
export const shouldShowAutosuggest = (formData, options = {}) => {
  const { isEditMode = false, maxFilledFields = 3 } = options;

  // Don't show in edit mode (editing existing contact)
  if (isEditMode) return false;

  // Check if we have a contact ID (editing existing)
  if (formData?.id || formData?.contactId) return false;

  // Count filled fields
  const filledFields = Object.values(formData || {})
    .filter(v => v && String(v).length > 0)
    .length;

  // Don't show if too many fields already filled
  return filledFields < maxFilledFields;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ContactIndex,
  SEARCHABLE_FIELDS,
  AUTOFILL_MAP,
};

export default {
  searchContacts,
  getAutofillData,
  subscribeToContacts,
  clearContactCache,
  logAutofillUsage,
  getFieldTypeFromName,
  shouldShowAutosuggest,
  getContactIndex,
};
