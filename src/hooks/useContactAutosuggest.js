// ============================================================================
// useContactAutosuggest.js - React Hook for Contact Autosuggest
// ============================================================================
// Provides easy access to contact search and autofill functionality
// Use this hook in any form component that needs contact autocomplete
//
// Features:
// - Debounced search
// - Real-time contact updates
// - Autofill data retrieval
// - Loading state management
// - Error handling
// ============================================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  searchContacts,
  getAutofillData,
  subscribeToContacts,
  logAutofillUsage,
  getFieldTypeFromName,
  shouldShowAutosuggest,
} from '../services/ContactAutosuggestService';

// ============================================================================
// HOOK OPTIONS
// ============================================================================

const DEFAULT_OPTIONS = {
  minChars: 2,
  maxSuggestions: 5,
  debounceMs: 150,
  enableCache: true,
  logUsage: true,
  formName: 'unknown',
};

// ============================================================================
// MAIN HOOK
// ============================================================================

const useContactAutosuggest = (options = {}) => {
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  // ===== STATE =====
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);

  // ===== REFS =====
  const debounceTimerRef = useRef(null);
  const lastQueryRef = useRef('');
  const cacheRef = useRef(new Map());

  // ===== SUBSCRIBE TO CONTACT UPDATES =====
  useEffect(() => {
    const unsubscribe = subscribeToContacts((contacts) => {
      setContactsCount(contacts.length);
      // Clear cache when contacts are updated
      if (config.enableCache) {
        cacheRef.current.clear();
      }
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [config.enableCache]);

  // ===== SEARCH FUNCTION =====
  const search = useCallback(async (query, fieldType = 'any') => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Check minimum characters
    if (!query || query.length < config.minChars) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Debounce
    return new Promise((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          setError(null);
          lastQueryRef.current = query;

          // Check cache
          const cacheKey = `${query}-${fieldType}`;
          if (config.enableCache && cacheRef.current.has(cacheKey)) {
            const cachedResults = cacheRef.current.get(cacheKey);
            setSuggestions(cachedResults);
            setIsOpen(cachedResults.length > 0);
            setIsLoading(false);
            resolve(cachedResults);
            return;
          }

          // Search contacts
          const results = await searchContacts(query, fieldType, {
            maxResults: config.maxSuggestions,
          });

          // Cache results
          if (config.enableCache) {
            cacheRef.current.set(cacheKey, results);
          }

          setSuggestions(results);
          setIsOpen(results.length > 0);
          setIsLoading(false);
          resolve(results);

        } catch (err) {
          console.error('Error searching contacts:', err);
          setError(err.message);
          setSuggestions([]);
          setIsLoading(false);
          resolve([]);
        }
      }, config.debounceMs);
    });
  }, [config.minChars, config.maxSuggestions, config.debounceMs, config.enableCache]);

  // ===== GET AUTOFILL DATA =====
  const getAutofill = useCallback(async (contactId, customFieldMap = {}) => {
    try {
      setIsLoading(true);
      const data = await getAutofillData(contactId, customFieldMap);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Error getting autofill data:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, []);

  // ===== SELECT CONTACT =====
  const selectContact = useCallback(async (contact, userId = null) => {
    setSelectedContact(contact);
    setIsOpen(false);
    setSuggestions([]);

    // Get autofill data
    const autofillData = await getAutofill(contact.id);

    // Log usage if enabled
    if (config.logUsage && autofillData) {
      const fieldsAutofilled = Object.keys(autofillData).filter(
        key => autofillData[key] && autofillData[key] !== ''
      );
      await logAutofillUsage(contact.id, config.formName, userId, fieldsAutofilled);
    }

    return autofillData;
  }, [getAutofill, config.logUsage, config.formName]);

  // ===== CLEAR =====
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsOpen(false);
    lastQueryRef.current = '';
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedContact(null);
    clearSuggestions();
  }, [clearSuggestions]);

  // ===== CLEAR CACHE =====
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // ===== RETURN =====
  return {
    // State
    suggestions,
    isLoading,
    error,
    selectedContact,
    isOpen,
    contactsCount,

    // Actions
    search,
    getAutofill,
    selectContact,
    clearSuggestions,
    clearSelection,
    clearCache,

    // Utilities
    setIsOpen,
    getFieldTypeFromName,
    shouldShowAutosuggest,
  };
};

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for a specific field type
 */
export const useContactSearchByField = (fieldType, options = {}) => {
  const hook = useContactAutosuggest(options);

  const searchField = useCallback((query) => {
    return hook.search(query, fieldType);
  }, [hook, fieldType]);

  return {
    ...hook,
    search: searchField,
  };
};

/**
 * Hook with automatic field type detection from field name
 */
export const useContactSearchAuto = (fieldName, options = {}) => {
  const fieldType = useMemo(() => getFieldTypeFromName(fieldName), [fieldName]);
  return useContactSearchByField(fieldType, options);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default useContactAutosuggest;
