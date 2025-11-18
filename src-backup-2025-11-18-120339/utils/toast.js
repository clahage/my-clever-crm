// src/utils/toast.js
// Toast notification utility wrapper for react-hot-toast
// Provides consistent toast notifications throughout the application

import toast from 'react-hot-toast';

/**
 * Show a success toast notification
 * @param {string} message - The message to display
 * @param {object} options - Additional toast options
 */
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });
};

/**
 * Show an error toast notification
 * @param {string} message - The message to display
 * @param {object} options - Additional toast options
 */
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 5000,
    position: 'top-right',
    ...options,
  });
};

/**
 * Show an info/loading toast notification
 * @param {string} message - The message to display
 * @param {object} options - Additional toast options
 */
export const showInfo = (message, options = {}) => {
  return toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
    ...options,
  });
};

/**
 * Show a loading toast notification
 * @param {string} message - The message to display
 * @returns {string} Toast ID for dismissing later
 */
export const showLoading = (message = 'Loading...') => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

/**
 * Dismiss a specific toast by ID
 * @param {string} toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Show a promise-based toast (automatically shows loading, success, or error)
 * @param {Promise} promise - The promise to track
 * @param {object} messages - Success and error messages
 */
export const showPromise = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'An error occurred',
    },
    {
      position: 'top-right',
    }
  );
};

/**
 * Show a custom toast with JSX content
 * @param {React.Component} component - The JSX component to render
 * @param {object} options - Additional toast options
 */
export const showCustom = (component, options = {}) => {
  return toast.custom(component, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });
};

// Export the raw toast object for advanced usage
export { toast };

// Default export for convenience
export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  loading: showLoading,
  dismiss: dismissToast,
  promise: showPromise,
  custom: showCustom,
};
