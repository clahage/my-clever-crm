// src/hooks/useContactAutofill.js
// Universal contact autofill system - use in ANY form across the CRM

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Universal Contact Autofill Hook
 * 
 * Usage in any form:
 * 
 * const { 
 *   suggestions, 
 *   selectedContact, 
 *   searchContacts, 
 *   selectContact, 
 *   clearSelection,
 *   isSearching 
 * } = useContactAutofill();
 * 
 * Then:
 * - Call searchContacts(searchTerm) when user types
 * - Display suggestions in dropdown
 * - Call selectContact(contact) when user picks one
 * - Form fields auto-populate from selectedContact
 */

export const useContactAutofill = (options = {}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    minSearchLength = 2, // Start searching after 2 characters
    maxSuggestions = 10,  // Show max 10 suggestions
    searchDelay = 300,    // Debounce delay in ms
    searchFields = ['firstName', 'lastName', 'email', 'phone'] // Fields to search
  } = options;

  /**
   * Search contacts by any field
   */
  const searchContacts = useCallback(async (term) => {
    if (!term || term.length < minSearchLength) {
      setSuggestions([]);
      return;
    }

    setSearchTerm(term);
    setIsSearching(true);

    try {
      const results = [];
      const searchLower = term.toLowerCase();

      // Search by name (firstName or lastName)
      if (searchFields.includes('firstName') || searchFields.includes('lastName')) {
        const nameQuery = query(
          collection(db, 'contacts'),
          limit(maxSuggestions)
        );
        
        const nameSnapshot = await getDocs(nameQuery);
        nameSnapshot.forEach((doc) => {
          const data = doc.data();
          const fullName = `${data.firstName || ''} ${data.lastName || ''}`.toLowerCase();
          
          if (fullName.includes(searchLower) && 
              !results.find(r => r.id === doc.id)) {
            results.push({ id: doc.id, ...data });
          }
        });
      }

      // Search by email
      if (searchFields.includes('email')) {
        const emailQuery = query(
          collection(db, 'contacts'),
          limit(maxSuggestions)
        );
        
        const emailSnapshot = await getDocs(emailQuery);
        emailSnapshot.forEach((doc) => {
          const data = doc.data();
          
          if (data.email && 
              data.email.toLowerCase().includes(searchLower) &&
              !results.find(r => r.id === doc.id)) {
            results.push({ id: doc.id, ...data });
          }
        });
      }

      // Search by phone (normalize digits)
      if (searchFields.includes('phone')) {
        const digits = term.replace(/\D/g, '');
        
        if (digits.length >= 3) { // At least 3 digits
          const phoneQuery = query(
            collection(db, 'contacts'),
            limit(maxSuggestions)
          );
          
          const phoneSnapshot = await getDocs(phoneQuery);
          phoneSnapshot.forEach((doc) => {
            const data = doc.data();
            
            if (data.phone) {
              const phoneDigits = data.phone.replace(/\D/g, '');
              if (phoneDigits.includes(digits) &&
                  !results.find(r => r.id === doc.id)) {
                results.push({ id: doc.id, ...data });
              }
            }
          });
        }
      }

      // Sort by relevance (exact matches first, then partial)
      results.sort((a, b) => {
        const aFullName = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        const bFullName = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
        
        const aExact = aFullName.startsWith(searchLower);
        const bExact = bFullName.startsWith(searchLower);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });

      setSuggestions(results.slice(0, maxSuggestions));

    } catch (error) {
      console.error('Error searching contacts:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [minSearchLength, maxSuggestions, searchFields]);

  /**
   * Debounced search
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchContacts(searchTerm);
      }
    }, searchDelay);

    return () => clearTimeout(timer);
  }, [searchTerm, searchDelay, searchContacts]);

  /**
   * Select a contact and populate form
   */
  const selectContact = useCallback((contact) => {
    setSelectedContact(contact);
    setSuggestions([]); // Clear suggestions after selection
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedContact(null);
    setSuggestions([]);
    setSearchTerm('');
  }, []);

  /**
   * Get normalized phone number
   */
  const getNormalizedPhone = useCallback((phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 10) {
      return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    
    return phone;
  }, []);

  /**
   * Format contact for display in suggestion dropdown
   */
  const formatSuggestionDisplay = useCallback((contact) => {
    const parts = [];
    
    // Name
    if (contact.firstName || contact.lastName) {
      parts.push(`${contact.firstName || ''} ${contact.lastName || ''}`.trim());
    }
    
    // Email
    if (contact.email) {
      parts.push(contact.email);
    }
    
    // Phone
    if (contact.phone) {
      parts.push(getNormalizedPhone(contact.phone));
    }
    
    // Roles (show if lead, client, etc.)
    if (contact.roles && contact.roles.length > 1) {
      const displayRoles = contact.roles
        .filter(r => r !== 'contact')
        .map(r => r.charAt(0).toUpperCase() + r.slice(1))
        .join(', ');
      if (displayRoles) {
        parts.push(`[${displayRoles}]`);
      }
    }
    
    return parts.filter(Boolean).join(' • ');
  }, [getNormalizedPhone]);

  return {
    suggestions,
    selectedContact,
    searchContacts,
    selectContact,
    clearSelection,
    isSearching,
    formatSuggestionDisplay,
    getNormalizedPhone
  };
};

export default useContactAutofill;