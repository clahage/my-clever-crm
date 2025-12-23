// ============================================================================
// src/hooks/useSearch.js
// ============================================================================
// Shared search and filter hook to eliminate redundancy across 54+ hub components
// Previously duplicated in: AffiliatesHub, DocumentsHub, MarketingHub,
// MobileUserManager, ReferralPartnerHub, and many more
// ============================================================================

import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for search and filter state management
 * Replaces repeated filtering logic across all hubs
 *
 * @param {Array} data - Data array to search/filter
 * @param {Object} options - Configuration options
 * @param {string[]} options.searchableFields - Fields to search (default: ['name', 'email'])
 * @param {string} options.initialSearchTerm - Initial search term
 * @param {Object} options.initialFilters - Initial filter values
 * @returns {Object} Search/filter state and handlers
 */
export const useSearch = (data = [], {
  searchableFields = ['name', 'email'],
  initialSearchTerm = '',
  initialFilters = {}
} = {}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Get nested property value
   */
  const getNestedValue = useCallback((obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }, []);

  /**
   * Check if item matches search term
   */
  const matchesSearch = useCallback((item) => {
    if (!searchTerm.trim()) return true;

    const lowerSearch = searchTerm.toLowerCase();

    return searchableFields.some(field => {
      const value = getNestedValue(item, field);
      if (value === null || value === undefined) return false;

      // Handle arrays (e.g., tags)
      if (Array.isArray(value)) {
        return value.some(v =>
          String(v).toLowerCase().includes(lowerSearch)
        );
      }

      // Handle objects (convert to string)
      if (typeof value === 'object') {
        return JSON.stringify(value).toLowerCase().includes(lowerSearch);
      }

      return String(value).toLowerCase().includes(lowerSearch);
    });
  }, [searchTerm, searchableFields, getNestedValue]);

  /**
   * Check if item matches all filters
   */
  const matchesFilters = useCallback((item) => {
    return Object.entries(filters).every(([key, filterValue]) => {
      // Skip 'all' or empty filters
      if (filterValue === 'all' || filterValue === '' || filterValue === null) {
        return true;
      }

      const itemValue = getNestedValue(item, key);

      // Handle array filters (e.g., filter by multiple statuses)
      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) return true;
        return filterValue.includes(itemValue);
      }

      // Handle date range filters
      if (filterValue.start || filterValue.end) {
        const itemDate = itemValue?.toDate ? itemValue.toDate() : new Date(itemValue);
        if (filterValue.start && itemDate < new Date(filterValue.start)) return false;
        if (filterValue.end && itemDate > new Date(filterValue.end)) return false;
        return true;
      }

      // Handle number range filters
      if (filterValue.min !== undefined || filterValue.max !== undefined) {
        const numValue = Number(itemValue);
        if (filterValue.min !== undefined && numValue < filterValue.min) return false;
        if (filterValue.max !== undefined && numValue > filterValue.max) return false;
        return true;
      }

      // Handle boolean filters
      if (typeof filterValue === 'boolean') {
        return itemValue === filterValue;
      }

      // Default string comparison
      return String(itemValue).toLowerCase() === String(filterValue).toLowerCase();
    });
  }, [filters, getNestedValue]);

  /**
   * Filtered data
   */
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(item => matchesSearch(item) && matchesFilters(item));
  }, [data, matchesSearch, matchesFilters]);

  /**
   * Update a single filter
   */
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Clear a single filter
   */
  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /**
   * Clear all filters and search
   */
  const clearAll = useCallback(() => {
    setSearchTerm('');
    setFilters({});
  }, []);

  /**
   * Reset to initial values
   */
  const reset = useCallback(() => {
    setSearchTerm(initialSearchTerm);
    setFilters(initialFilters);
  }, [initialSearchTerm, initialFilters]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    if (searchTerm.trim()) return true;
    return Object.values(filters).some(v =>
      v !== 'all' && v !== '' && v !== null && v !== undefined
    );
  }, [searchTerm, filters]);

  /**
   * Get count of active filters
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    Object.values(filters).forEach(v => {
      if (v !== 'all' && v !== '' && v !== null && v !== undefined) {
        count++;
      }
    });
    return count;
  }, [searchTerm, filters]);

  return {
    // State
    searchTerm,
    filters,
    filteredData,

    // State setters
    setSearchTerm,
    setFilters,
    setFilter,

    // Clear/reset
    clearFilter,
    clearAll,
    reset,

    // Computed values
    hasActiveFilters,
    activeFilterCount,
    resultCount: filteredData.length,
    totalCount: data.length
  };
};

/**
 * Hook for sorting data
 */
export const useSort = (data = [], {
  initialSortBy = '',
  initialSortOrder = 'asc'
} = {}) => {
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  const toggleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const sortedData = useMemo(() => {
    if (!Array.isArray(data) || !sortBy) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Handle Firestore timestamps
      if (aVal?.toDate) aVal = aVal.toDate();
      if (bVal?.toDate) bVal = bVal.toDate();

      // Handle null/undefined
      if (aVal === null || aVal === undefined) return sortOrder === 'asc' ? 1 : -1;
      if (bVal === null || bVal === undefined) return sortOrder === 'asc' ? -1 : 1;

      // Compare
      if (typeof aVal === 'string') {
        const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortOrder]);

  return {
    sortBy,
    sortOrder,
    sortedData,
    setSortBy,
    setSortOrder,
    toggleSort,
    getSortIndicator: (field) => sortBy === field ? sortOrder : null
  };
};

/**
 * Combined search, filter, sort, and pagination hook
 */
export const useDataTable = (data = [], {
  searchableFields = ['name', 'email'],
  initialFilters = {},
  initialSortBy = '',
  initialSortOrder = 'asc',
  initialRowsPerPage = 10
} = {}) => {
  const search = useSearch(data, { searchableFields, initialFilters });
  const sort = useSort(search.filteredData, { initialSortBy, initialSortOrder });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Reset page when data changes
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return sort.sortedData.slice(start, start + rowsPerPage);
  }, [sort.sortedData, page, rowsPerPage]);

  // Reset to first page when filters change
  useMemo(() => {
    setPage(0);
  }, [search.filteredData.length]);

  return {
    // Search/Filter
    ...search,

    // Sort
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    toggleSort: sort.toggleSort,
    getSortIndicator: sort.getSortIndicator,

    // Pagination
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    paginatedData,

    // Combined data
    processedData: paginatedData,
    allProcessedData: sort.sortedData
  };
};

export default useSearch;
