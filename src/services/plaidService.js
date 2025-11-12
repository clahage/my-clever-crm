// ===================================================================
// plaidService.js - Plaid Integration for Bank Account Verification
// ===================================================================
// Purpose: Secure bank account linking and verification using Plaid
// Features:
// - Plaid Link integration for account connection
// - Bank account verification
// - Balance checking
// - Transaction history retrieval
// - ACH payment authorization
// - Sandbox and production environment support
// ===================================================================

import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// ===================================================================
// PLAID CONFIGURATION
// ===================================================================

const PLAID_CONFIG = {
  environment: import.meta.env.VITE_PLAID_ENV || 'sandbox', // sandbox, development, production
  clientName: 'Speedy Credit Repair',
  products: ['auth', 'transactions', 'balance', 'identity'],
  countryCodes: ['US'],
  language: 'en',
  webhook: import.meta.env.VITE_PLAID_WEBHOOK_URL
};

class PlaidServiceError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'PlaidServiceError';
    this.code = code;
    this.details = details;
  }
}

function handleError(error) {
  console.error('Plaid Service Error:', error);

  if (error.code === 'unauthenticated') {
    throw new PlaidServiceError(
      'You must be logged in to use Plaid services.',
      'AUTH_REQUIRED',
      error
    );
  }

  if (error.code === 'resource-exhausted') {
    throw new PlaidServiceError(
      'Rate limit exceeded. Please try again later.',
      'RATE_LIMIT',
      error
    );
  }

  if (error.message?.includes('INVALID_CREDENTIALS')) {
    throw new PlaidServiceError(
      'Invalid bank credentials. Please try again.',
      'INVALID_CREDENTIALS',
      error
    );
  }

  throw new PlaidServiceError(
    error.message || 'An error occurred with Plaid service.',
    'UNKNOWN',
    error
  );
}

// ===================================================================
// PLAID SERVICE CLASS
// ===================================================================

class PlaidService {
  /**
   * Create a Plaid Link token for connecting a bank account
   * @param {object} options - Configuration options
   * @param {string} options.userId - User ID
   * @param {string} options.clientUserId - Client user identifier
   * @param {array} options.products - Plaid products to use (default: ['auth', 'transactions'])
   * @returns {Promise<object>} - Link token data
   */
  async createLinkToken(options = {}) {
    try {
      const createLinkToken = httpsCallable(functions, 'plaid_createLinkToken');
      const result = await createLinkToken({
        userId: options.userId,
        clientUserId: options.clientUserId,
        products: options.products || PLAID_CONFIG.products,
        ...PLAID_CONFIG
      });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Exchange public token for access token after successful Link
   * @param {string} publicToken - Public token from Plaid Link
   * @param {string} userId - User ID
   * @returns {Promise<object>} - Access token and account info
   */
  async exchangePublicToken(publicToken, userId) {
    try {
      const exchangeToken = httpsCallable(functions, 'plaid_exchangePublicToken');
      const result = await exchangeToken({
        publicToken,
        userId
      });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get account balances
   * @param {string} accessToken - Plaid access token
   * @returns {Promise<object>} - Account balances
   */
  async getBalance(accessToken) {
    try {
      const getBalance = httpsCallable(functions, 'plaid_getBalance');
      const result = await getBalance({ accessToken });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get account transactions
   * @param {object} options - Query options
   * @param {string} options.accessToken - Plaid access token
   * @param {string} options.startDate - Start date (YYYY-MM-DD)
   * @param {string} options.endDate - End date (YYYY-MM-DD)
   * @returns {Promise<object>} - Transaction data
   */
  async getTransactions(options) {
    try {
      const getTransactions = httpsCallable(functions, 'plaid_getTransactions');
      const result = await getTransactions({
        accessToken: options.accessToken,
        startDate: options.startDate,
        endDate: options.endDate
      });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get account and routing numbers for ACH
   * @param {string} accessToken - Plaid access token
   * @returns {Promise<object>} - Account and routing numbers
   */
  async getAuthData(accessToken) {
    try {
      const getAuth = httpsCallable(functions, 'plaid_getAuth');
      const result = await getAuth({ accessToken });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get account identity information
   * @param {string} accessToken - Plaid access token
   * @returns {Promise<object>} - Identity information
   */
  async getIdentity(accessToken) {
    try {
      const getIdentity = httpsCallable(functions, 'plaid_getIdentity');
      const result = await getIdentity({ accessToken });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Remove/disconnect a bank account
   * @param {string} accessToken - Plaid access token
   * @param {string} userId - User ID
   * @returns {Promise<object>} - Removal confirmation
   */
  async removeAccount(accessToken, userId) {
    try {
      const removeAccount = httpsCallable(functions, 'plaid_removeAccount');
      const result = await removeAccount({ accessToken, userId });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Verify account ownership (micro-deposits method)
   * @param {string} accessToken - Plaid access token
   * @param {string} accountId - Account ID to verify
   * @returns {Promise<object>} - Verification status
   */
  async verifyAccount(accessToken, accountId) {
    try {
      const verifyAccount = httpsCallable(functions, 'plaid_verifyAccount');
      const result = await verifyAccount({ accessToken, accountId });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Check if account supports instant verification
   * @param {string} accessToken - Plaid access token
   * @returns {Promise<boolean>} - Whether instant verification is available
   */
  async supportsInstantVerification(accessToken) {
    try {
      const checkSupport = httpsCallable(functions, 'plaid_checkInstantVerification');
      const result = await checkSupport({ accessToken });
      return result.data.supported;
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get linked bank accounts for a user
   * @param {string} userId - User ID
   * @returns {Promise<array>} - Array of linked accounts
   */
  async getLinkedAccounts(userId) {
    try {
      const getAccounts = httpsCallable(functions, 'plaid_getLinkedAccounts');
      const result = await getAccounts({ userId });
      return result.data.accounts || [];
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Update webhook URL for an access token
   * @param {string} accessToken - Plaid access token
   * @param {string} webhook - New webhook URL
   * @returns {Promise<object>} - Update confirmation
   */
  async updateWebhook(accessToken, webhook) {
    try {
      const updateWebhook = httpsCallable(functions, 'plaid_updateWebhook');
      const result = await updateWebhook({ accessToken, webhook });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  }
}

// ===================================================================
// PLAID LINK HELPERS (Client-side)
// ===================================================================

/**
 * Initialize Plaid Link on the client side
 * @param {object} config - Link configuration
 * @param {string} config.linkToken - Link token from createLinkToken
 * @param {function} config.onSuccess - Success callback
 * @param {function} config.onExit - Exit callback
 * @returns {object} - Plaid Link handler
 */
export function initializePlaidLink(config) {
  if (!window.Plaid) {
    console.error('Plaid script not loaded. Add <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script> to your HTML.');
    return null;
  }

  return window.Plaid.create({
    token: config.linkToken,
    onSuccess: (publicToken, metadata) => {
      console.log('Plaid Link success:', metadata);
      if (config.onSuccess) {
        config.onSuccess(publicToken, metadata);
      }
    },
    onExit: (err, metadata) => {
      console.log('Plaid Link exit:', err, metadata);
      if (config.onExit) {
        config.onExit(err, metadata);
      }
    },
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link event:', eventName, metadata);
      if (config.onEvent) {
        config.onEvent(eventName, metadata);
      }
    }
  });
}

/**
 * Load Plaid Link script dynamically
 * @returns {Promise<void>}
 */
export function loadPlaidScript() {
  return new Promise((resolve, reject) => {
    if (window.Plaid) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// ===================================================================
// EXPORT
// ===================================================================

const plaidService = new PlaidService();
export default plaidService;

export {
  PlaidService,
  PlaidServiceError,
  initializePlaidLink,
  loadPlaidScript,
  PLAID_CONFIG
};
