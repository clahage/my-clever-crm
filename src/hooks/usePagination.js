// ============================================================================
// src/hooks/usePagination.js
// ============================================================================
// Shared pagination hook to eliminate redundancy across 26+ hub components
// Previously duplicated in: ActionLibrary, AffiliatesHub, BillingHub,
// BillingPaymentsHub, ContactsPipelineHub, and many more
// ============================================================================

import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for pagination state management
 * Replaces repeated pagination logic across all hubs
 *
 * @param {Object} options - Configuration options
 * @param {number} options.initialPage - Initial page (default: 0)
 * @param {number} options.initialRowsPerPage - Initial rows per page (default: 10)
 * @param {number[]} options.rowsPerPageOptions - Available rows per page options
 * @returns {Object} Pagination state and handlers
 */
export const usePagination = ({
  initialPage = 0,
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50, 100]
} = {}) => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  /**
   * Handle rows per page change
   */
  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  }, []);

  /**
   * Go to first page
   */
  const goToFirstPage = useCallback(() => {
    setPage(0);
  }, []);

  /**
   * Go to last page
   */
  const goToLastPage = useCallback((totalItems) => {
    const lastPage = Math.max(0, Math.ceil(totalItems / rowsPerPage) - 1);
    setPage(lastPage);
  }, [rowsPerPage]);

  /**
   * Go to next page
   */
  const goToNextPage = useCallback((totalItems) => {
    const maxPage = Math.ceil(totalItems / rowsPerPage) - 1;
    setPage(prev => Math.min(prev + 1, maxPage));
  }, [rowsPerPage]);

  /**
   * Go to previous page
   */
  const goToPreviousPage = useCallback(() => {
    setPage(prev => Math.max(prev - 1, 0));
  }, []);

  /**
   * Reset pagination
   */
  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setRowsPerPage(initialRowsPerPage);
  }, [initialPage, initialRowsPerPage]);

  /**
   * Paginate data array
   * @param {Array} data - Data to paginate
   * @returns {Array} Paginated data slice
   */
  const paginateData = useCallback((data) => {
    if (!Array.isArray(data)) return [];
    const startIndex = page * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  }, [page, rowsPerPage]);

  /**
   * Calculate pagination info
   * @param {number} totalItems - Total number of items
   * @returns {Object} Pagination info
   */
  const getPaginationInfo = useCallback((totalItems) => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startItem = totalItems > 0 ? page * rowsPerPage + 1 : 0;
    const endItem = Math.min((page + 1) * rowsPerPage, totalItems);

    return {
      currentPage: page + 1, // 1-indexed for display
      totalPages,
      startItem,
      endItem,
      totalItems,
      hasNextPage: page < totalPages - 1,
      hasPreviousPage: page > 0,
      isFirstPage: page === 0,
      isLastPage: page >= totalPages - 1
    };
  }, [page, rowsPerPage]);

  return {
    // State
    page,
    rowsPerPage,
    rowsPerPageOptions,

    // State setters
    setPage,
    setRowsPerPage,

    // Event handlers (for MUI TablePagination)
    handlePageChange,
    handleRowsPerPageChange,

    // Navigation helpers
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,

    // Data helpers
    paginateData,
    getPaginationInfo,

    // MUI TablePagination props (spread this directly)
    tablePaginationProps: {
      page,
      rowsPerPage,
      rowsPerPageOptions,
      onPageChange: handlePageChange,
      onRowsPerPageChange: handleRowsPerPageChange
    }
  };
};

/**
 * Hook specifically for MUI DataGrid pagination
 */
export const useDataGridPagination = ({
  initialPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100]
} = {}) => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: initialPageSize
  });

  const handlePaginationModelChange = useCallback((newModel) => {
    setPaginationModel(newModel);
  }, []);

  return {
    paginationModel,
    setPaginationModel,
    handlePaginationModelChange,
    pageSizeOptions,

    // DataGrid props (spread this directly)
    dataGridPaginationProps: {
      paginationModel,
      onPaginationModelChange: handlePaginationModelChange,
      pageSizeOptions
    }
  };
};

export default usePagination;
