// ===================================================================
// dwollaService.js - Dwolla Integration for ACH Payments
// ===================================================================
// Purpose: Secure ACH payment processing using Dwolla API
// Features:
// - Customer creation and management
// - Bank account attachment via Plaid
// - ACH payment initiation and tracking
// - Payment status monitoring
// - Webhook event handling
// - Sandbox and production environment support
// - Compliance with NACHA rules
// ===================================================================

import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// ===================================================================
// DWOLLA CONFIGURATION
// ===================================================================

const DWOLLA_CONFIG = {
  environment: import.meta.env.VITE_DWOLLA_ENV || 'sandbox', // sandbox or production
  webhook: import.meta.env.VITE_DWOLLA_WEBHOOK_URL,
  businessName: 'Speedy Credit Repair',
  businessType: 'corporation',
  businessClassification: 'financial-services',
  achDebitEnabled: true,
  achCreditEnabled: true
};

// ===================================================================
// PAYMENT TYPES
// ===================================================================

export const PAYMENT_TYPES = {
  STANDARD: 'standard',     // 1-3 business days
  NEXT_DAY: 'next-day',    // Next business day (fee applies)
  SAME_DAY: 'same-day'     // Same business day (fee applies)
};

// ===================================================================
// PAYMENT STATUS
// ===================================================================

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
};

// ===================================================================
// CUSTOMER TYPES
// ===================================================================

export const CUSTOMER_TYPES = {
  UNVERIFIED: 'unverified',     // Limited functionality
  PERSONAL: 'personal',         // Verified personal customer
  BUSINESS: 'business'          // Verified business customer
};

class DwollaServiceError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'DwollaServiceError';
    this.code = code;
    this.details = details;
  }
}

function handleError(error) {
  console.error('Dwolla Service Error:', error);

  if (error.code === 'unauthenticated') {
    throw new DwollaServiceError(
      'You must be logged in to use payment services.',
      'AUTH_REQUIRED',
      error
    );
  }

  if (error.code === 'resource-exhausted') {
    throw new DwollaServiceError(
      'Rate limit exceeded. Please try again later.',
      'RATE_LIMIT',
      error
    );
  }

  if (error.message?.includes('INSUFFICIENT_FUNDS')) {
    throw new DwollaServiceError(
      'Insufficient funds in the source account.',
      'INSUFFICIENT_FUNDS',
      error
    );
  }

  if (error.message?.includes('INVALID_ACCOUNT')) {
    throw new DwollaServiceError(
      'Invalid bank account. Please verify account details.',
      'INVALID_ACCOUNT',
      error
    );
  }

  throw new DwollaServiceError(
    error.message || 'An error occurred with payment processing.',
    'UNKNOWN',
    error
  );
}

// ===================================================================
// DWOLLA SERVICE CLASS
// ===================================================================

class DwollaService {
  /**
   * Create a new Dwolla customer
   * @param {object} customerData - Customer information
   * @param {string} customerData.firstName - First name
   * @param {string} customerData.lastName - Last name
   * @param {string} customerData.email - Email address
   * @param {string} customerData.type - Customer type (unverified, personal, business)
   * @param {string} customerData.dateOfBirth - Date of birth (YYYY-MM-DD) - required for personal
   * @param {string} customerData.ssn - Last 4 of SSN - required for personal
   * @param {object} customerData.address - Address object (required for personal/business)
   * @param {string} customerData.userId - Internal user ID
   * @returns {Promise<object>} - Customer data with Dwolla customer URL
   */
  async createCustomer(customerData) {
    try {
      const createCustomer = httpsCallable(functions, 'dwolla_createCustomer');
      const result = await createCustomer(customerData);
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get customer information
   * @param {string} customerId - Dwolla customer ID or URL
   * @returns {Promise<object>} - Customer information
   */
  async getCustomer(customerId) {
    try {
      const getCustomer = httpsCallable(functions, 'dwolla_getCustomer');
      const result = await getCustomer({ customerId });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Update customer information
   * @param {string} customerId - Dwolla customer ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} - Updated customer data
   */
  async updateCustomer(customerId, updates) {
    try {
      const updateCustomer = httpsCallable(functions, 'dwolla_updateCustomer');
      const result = await updateCustomer({ customerId, updates });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Create a funding source (bank account) using Plaid
   * @param {object} options - Funding source options
   * @param {string} options.customerId - Dwolla customer ID
   * @param {string} options.plaidToken - Plaid processor token
   * @param {string} options.name - Account nickname
   * @returns {Promise<object>} - Funding source data
   */
  async createFundingSourceWithPlaid(options) {
    try {
      const createFundingSource = httpsCallable(functions, 'dwolla_createFundingSourceWithPlaid');
      const result = await createFundingSource(options);
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Create a funding source manually (for testing/sandbox)
   * @param {object} options - Funding source options
   * @param {string} options.customerId - Dwolla customer ID
   * @param {string} options.routingNumber - Bank routing number
   * @param {string} options.accountNumber - Bank account number
   * @param {string} options.bankAccountType - checking or savings
   * @param {string} options.name - Account nickname
   * @returns {Promise<object>} - Funding source data
   */
  async createFundingSourceManual(options) {
    try {
      const createFundingSource = httpsCallable(functions, 'dwolla_createFundingSourceManual');
      const result = await createFundingSource(options);
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get all funding sources for a customer
   * @param {string} customerId - Dwolla customer ID
   * @returns {Promise<array>} - Array of funding sources
   */
  async getFundingSources(customerId) {
    try {
      const getFundingSources = httpsCallable(functions, 'dwolla_getFundingSources');
      const result = await getFundingSources({ customerId });
      return result.data.fundingSources || [];
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Remove a funding source
   * @param {string} fundingSourceId - Funding source ID
   * @returns {Promise<object>} - Removal confirmation
   */
  async removeFundingSource(fundingSourceId) {
    try {
      const removeFundingSource = httpsCallable(functions, 'dwolla_removeFundingSource');
      const result = await removeFundingSource({ fundingSourceId });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Initiate an ACH payment
   * @param {object} paymentData - Payment information
   * @param {string} paymentData.sourceFundingSourceId - Source funding source (bank account)
   * @param {string} paymentData.destinationFundingSourceId - Destination funding source
   * @param {number} paymentData.amount - Payment amount (in dollars)
   * @param {string} paymentData.currency - Currency code (default: USD)
   * @param {string} paymentData.memo - Payment description
   * @param {string} paymentData.clientId - Internal client/invoice ID
   * @param {string} paymentData.speed - Payment speed (standard, next-day, same-day)
   * @returns {Promise<object>} - Transfer data with transfer URL
   */
  async initiatePayment(paymentData) {
    try {
      const initiatePayment = httpsCallable(functions, 'dwolla_initiatePayment');
      const result = await initiatePayment({
        ...paymentData,
        currency: paymentData.currency || 'USD',
        speed: paymentData.speed || PAYMENT_TYPES.STANDARD
      });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get payment (transfer) status
   * @param {string} transferId - Transfer ID
   * @returns {Promise<object>} - Transfer status and details
   */
  async getPaymentStatus(transferId) {
    try {
      const getPaymentStatus = httpsCallable(functions, 'dwolla_getPaymentStatus');
      const result = await getPaymentStatus({ transferId });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Cancel a pending payment
   * @param {string} transferId - Transfer ID
   * @returns {Promise<object>} - Cancellation confirmation
   */
  async cancelPayment(transferId) {
    try {
      const cancelPayment = httpsCallable(functions, 'dwolla_cancelPayment');
      const result = await cancelPayment({ transferId });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get payment history for a customer
   * @param {string} customerId - Dwolla customer ID
   * @param {object} options - Query options
   * @param {number} options.limit - Results limit
   * @param {number} options.offset - Results offset
   * @returns {Promise<array>} - Array of transfers
   */
  async getPaymentHistory(customerId, options = {}) {
    try {
      const getPaymentHistory = httpsCallable(functions, 'dwolla_getPaymentHistory');
      const result = await getPaymentHistory({
        customerId,
        limit: options.limit || 25,
        offset: options.offset || 0
      });
      return result.data.transfers || [];
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Verify micro-deposits for bank account verification
   * @param {string} fundingSourceId - Funding source ID
   * @param {number} amount1 - First micro-deposit amount (in cents)
   * @param {number} amount2 - Second micro-deposit amount (in cents)
   * @returns {Promise<object>} - Verification result
   */
  async verifyMicroDeposits(fundingSourceId, amount1, amount2) {
    try {
      const verifyMicroDeposits = httpsCallable(functions, 'dwolla_verifyMicroDeposits');
      const result = await verifyMicroDeposits({
        fundingSourceId,
        amount1,
        amount2
      });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get balance for a funding source
   * @param {string} fundingSourceId - Funding source ID
   * @returns {Promise<object>} - Balance information
   */
  async getBalance(fundingSourceId) {
    try {
      const getBalance = httpsCallable(functions, 'dwolla_getBalance');
      const result = await getBalance({ fundingSourceId });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Create a webhook subscription
   * @param {string} url - Webhook URL
   * @param {string} secret - Webhook secret for signature verification
   * @returns {Promise<object>} - Webhook subscription data
   */
  async createWebhookSubscription(url, secret) {
    try {
      const createWebhook = httpsCallable(functions, 'dwolla_createWebhookSubscription');
      const result = await createWebhook({ url, secret });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get webhook subscriptions
   * @returns {Promise<array>} - Array of webhook subscriptions
   */
  async getWebhookSubscriptions() {
    try {
      const getWebhooks = httpsCallable(functions, 'dwolla_getWebhookSubscriptions');
      const result = await getWebhooks({});
      return result.data.subscriptions || [];
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Process a recurring payment
   * @param {object} recurringData - Recurring payment data
   * @param {string} recurringData.customerId - Customer ID
   * @param {string} recurringData.fundingSourceId - Funding source ID
   * @param {number} recurringData.amount - Payment amount
   * @param {string} recurringData.frequency - daily, weekly, monthly
   * @param {string} recurringData.startDate - Start date (YYYY-MM-DD)
   * @param {string} recurringData.endDate - End date (YYYY-MM-DD) - optional
   * @returns {Promise<object>} - Recurring payment schedule
   */
  async createRecurringPayment(recurringData) {
    try {
      const createRecurring = httpsCallable(functions, 'dwolla_createRecurringPayment');
      const result = await createRecurring(recurringData);
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Format currency for display
 * @param {number} amount - Amount in dollars
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Calculate payment fees for expedited processing
 * @param {number} amount - Payment amount
 * @param {string} speed - Payment speed
 * @returns {number} - Fee amount
 */
export function calculatePaymentFee(amount, speed) {
  const fees = {
    [PAYMENT_TYPES.STANDARD]: 0,
    [PAYMENT_TYPES.NEXT_DAY]: 0.50,
    [PAYMENT_TYPES.SAME_DAY]: 0.75
  };

  return fees[speed] || 0;
}

/**
 * Validate bank routing number (basic check)
 * @param {string} routingNumber - 9-digit routing number
 * @returns {boolean}
 */
export function validateRoutingNumber(routingNumber) {
  if (!routingNumber || routingNumber.length !== 9) return false;

  // ABA routing number checksum algorithm
  const digits = routingNumber.split('').map(Number);
  const checksum = (
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    (digits[2] + digits[5] + digits[8])
  ) % 10;

  return checksum === 0;
}

/**
 * Get estimated processing time
 * @param {string} speed - Payment speed
 * @returns {string} - Human-readable processing time
 */
export function getProcessingTime(speed) {
  const times = {
    [PAYMENT_TYPES.STANDARD]: '1-3 business days',
    [PAYMENT_TYPES.NEXT_DAY]: 'Next business day',
    [PAYMENT_TYPES.SAME_DAY]: 'Same business day'
  };

  return times[speed] || 'Unknown';
}

// ===================================================================
// EXPORT
// ===================================================================

const dwollaService = new DwollaService();
export default dwollaService;

export {
  DwollaService,
  DwollaServiceError,
  DWOLLA_CONFIG,
  PAYMENT_TYPES,
  PAYMENT_STATUS,
  CUSTOMER_TYPES,
  formatCurrency,
  calculatePaymentFee,
  validateRoutingNumber,
  getProcessingTime
};
