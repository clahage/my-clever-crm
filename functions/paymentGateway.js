// ============================================================
// Path: functions/paymentGateway.js
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
//
// GATEWAY-AGNOSTIC PAYMENT PROCESSING SERVICE
// ============================================================
// This file handles ALL payment processing for SpeedyCRM.
// Currently configured for NMI (Network Merchants Inc.) but
// designed to be swapped to ANY gateway by changing GATEWAY_CONFIG.
//
// WHAT THIS DOES:
//   - Processes one-time ACH and credit card payments
//   - Stores payment methods securely in NMI's Customer Vault
//     (tokenized — no real card/bank numbers stored in our system)
//   - Sets up recurring billing (monthly subscriptions)
//   - Processes refunds
//   - Queries payment/transaction status
//   - Logs everything to Firestore for audit trail
//
// HOW IT WORKS:
//   1. Client fills out ACHAuthorization.jsx (collects bank info)
//   2. Client-side calls our Cloud Function (processPayment)
//   3. Cloud Function calls THIS file's methods
//   4. This file talks to NMI's API (server-side, secure)
//   5. NMI processes the payment and returns result
//   6. We log the result to Firestore and return to client
//
// SECURITY:
//   - ALL payment processing happens server-side (this file)
//   - API keys stored in Firebase secrets (not env vars)
//   - Card/bank numbers NEVER stored in Firestore
//   - Only NMI vault tokens are stored
//   - PCI compliance handled by NMI's Customer Vault
//
// TO SWITCH GATEWAYS:
//   Change GATEWAY_CONFIG and the corresponding adapter methods.
//   The rest of the codebase only calls the public methods below.
//
// DEPENDENCIES:
//   npm install node-fetch (or use built-in fetch in Node 18+)
// ============================================================

const { defineSecret } = require('firebase-functions/params');

// ============================================================
// FIREBASE SECRETS — Stored securely, NOT in code
// ============================================================
// To set these up, run:
//   firebase functions:secrets:set NMI_SECURITY_KEY
//   firebase functions:secrets:set NMI_PUBLIC_KEY (optional, for Collect.js)
//
// In index.js, add to your function's secrets array:
//   secrets: [nmiSecurityKey]
// ============================================================
const nmiSecurityKey = defineSecret('NMI_SECURITY_KEY');

// ============================================================
// GATEWAY CONFIGURATION
// ============================================================
// Change this ONE object to switch payment gateways.
// Everything else in this file uses these values.
// ============================================================
const GATEWAY_CONFIG = {
  // ===== Gateway Identity =====
  name: 'NMI',
  provider: 'Network Merchants Inc.',

  // ===== API Endpoints =====
  // SANDBOX (for testing — use until you go live):
  apiUrl: 'https://sandbox.nmi.com/api/transact.php',
  queryUrl: 'https://sandbox.nmi.com/api/query.php',

  // PRODUCTION (uncomment when you have real NMI credentials):
  // apiUrl: 'https://secure.nmi.com/api/transact.php',
  // queryUrl: 'https://secure.nmi.com/api/query.php',

  // ===== Test Mode =====
  // Set to false when going live with real merchant account
  testMode: true,

  // ===== Supported Features =====
  supportsACH: true,
  supportsCC: true,
  supportsVault: true,         // Customer Vault (tokenized storage)
  supportsRecurring: true,     // Recurring/subscription billing
  supportsRefund: true,
};


// ============================================================
// SPEEDY CREDIT REPAIR PLAN CONFIG
// ============================================================
// Maps our plan IDs to billing amounts. This is the SERVER-SIDE
// source of truth so clients can't manipulate prices.
// ============================================================
const PLAN_BILLING = {
  essentials: {
    planName: 'Essentials',
    monthlyAmount: 79.00,
    setupFee: 49.00,
    perDeletionFee: 0,
    billingCycleDay: 1,          // Bill on 1st of each month
    description: 'Speedy Credit Repair - Essentials Plan',
  },
  professional: {
    planName: 'Professional',
    monthlyAmount: 149.00,
    setupFee: 0,
    perDeletionFee: 25.00,
    billingCycleDay: 1,
    description: 'Speedy Credit Repair - Professional Plan',
  },
  vip: {
    planName: 'VIP Concierge',
    monthlyAmount: 299.00,
    setupFee: 0,
    perDeletionFee: 0,
    billingCycleDay: 1,
    description: 'Speedy Credit Repair - VIP Concierge Plan',
  },
};


// ============================================================
// HELPER: Build NMI POST Body
// ============================================================
// NMI uses form-encoded key=value pairs (NOT JSON).
// This helper converts an object to URL-encoded string.
// ============================================================
function buildNMIBody(params) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.join('&');
}


// ============================================================
// HELPER: Parse NMI Response
// ============================================================
// NMI returns responses as: response=1&responsetext=SUCCESS&...
// This parses that into a clean JavaScript object.
// ============================================================
function parseNMIResponse(responseText) {
  const result = {};
  const pairs = responseText.split('&');
  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split('=');
    result[decodeURIComponent(key)] = decodeURIComponent(valueParts.join('='));
  }

  // ===== Add our own friendly status =====
  result._success = result.response === '1';
  result._responseCode = parseInt(result.response_code || '0', 10);
  result._message = result.responsetext || 'Unknown response';

  return result;
}


// ============================================================
// HELPER: Call NMI API
// ============================================================
// Makes the actual HTTP POST to NMI's API.
// ALL other methods use this under the hood.
// ============================================================
async function callNMI(params) {
  try {
    // ===== Add security key to every request =====
    const securityKey = nmiSecurityKey.value();
    if (!securityKey) {
      throw new Error('NMI_SECURITY_KEY not configured. Run: firebase functions:secrets:set NMI_SECURITY_KEY');
    }

    const fullParams = {
      security_key: securityKey,
      ...params,
    };

    console.log(`💳 NMI API Call: type=${params.type || 'sale'}, amount=${params.amount || 'N/A'}`);

    const response = await fetch(GATEWAY_CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildNMIBody(fullParams),
    });

    const text = await response.text();
    const parsed = parseNMIResponse(text);

    console.log(`💳 NMI Response: success=${parsed._success}, code=${parsed._responseCode}, msg=${parsed._message}`);

    return parsed;

  } catch (error) {
    console.error('❌ NMI API Error:', error.message);
    return {
      _success: false,
      _responseCode: 0,
      _message: `Gateway error: ${error.message}`,
      response: '3',
      responsetext: error.message,
    };
  }
}


// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║              PUBLIC METHODS — USE THESE                       ║
// ║                                                              ║
// ║  These are the methods your Cloud Functions call.             ║
// ║  They handle the business logic and call NMI under the hood. ║
// ║                                                              ║
// ╚══════════════════════════════════════════════════════════════╝


// ============================================================
// 1. ADD CUSTOMER TO VAULT (Store payment method securely)
// ============================================================
// Stores the customer's bank account or card in NMI's
// encrypted vault. Returns a vault_id (token) that we
// save to Firestore instead of real payment details.
//
// USAGE:
//   const result = await addToVault({
//     contactId: 'abc123',
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john@example.com',
//     // For ACH:
//     checkAccount: '123456789',
//     checkAba: '021000021',
//     checkName: 'John Doe',
//     accountType: 'checking',  // 'checking' or 'savings'
//     // OR for Credit Card:
//     ccNumber: '4111111111111111',
//     ccExp: '1225',
//     cvv: '999',
//   });
// ============================================================
async function addToVault(data) {
  try {
    console.log('🔐 Adding customer to NMI Vault...');

    const params = {
      customer_vault: 'add_customer',
      // ===== Customer Info =====
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email || '',
      phone: data.phone || '',
      address1: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      country: 'US',
    };

    // ===== ACH / Bank Account =====
    if (data.checkAccount && data.checkAba) {
      params.payment = 'check';
      params.checkname = data.checkName || `${data.firstName} ${data.lastName}`;
      params.checkaba = data.checkAba;          // Routing number
      params.checkaccount = data.checkAccount;  // Account number
      params.account_type = data.accountType || 'checking';
      params.account_holder_type = data.accountHolderType || 'personal';
      params.sec_code = 'WEB';  // Web-initiated ACH (standard for online)
      console.log('🏦 Payment method: ACH (bank account)');
    }
    // ===== Credit Card =====
    else if (data.ccNumber && data.ccExp) {
      params.payment = 'creditcard';
      params.ccnumber = data.ccNumber;
      params.ccexp = data.ccExp;               // MMYY format
      if (data.cvv) params.cvv = data.cvv;
      console.log('💳 Payment method: Credit Card');
    }
    else {
      throw new Error('Must provide either bank account (checkAccount + checkAba) or credit card (ccNumber + ccExp)');
    }

    const result = await callNMI(params);

    if (result._success && result.customer_vault_id) {
      console.log(`✅ Vault customer created: ${result.customer_vault_id}`);
      return {
        success: true,
        vaultId: result.customer_vault_id,
        message: 'Payment method stored securely',
        paymentType: data.checkAccount ? 'ach' : 'cc',
        // ===== SAFE to store in Firestore (no sensitive data) =====
        firestoreData: {
          nmiVaultId: result.customer_vault_id,
          paymentType: data.checkAccount ? 'ach' : 'cc',
          lastFour: data.checkAccount
            ? data.checkAccount.slice(-4)
            : data.ccNumber.slice(-4),
          bankName: data.bankName || null,
          accountType: data.accountType || null,
          vaultCreatedAt: new Date().toISOString(),
        },
      };
    } else {
      console.error('❌ Vault add failed:', result._message);
      return {
        success: false,
        message: result._message,
        responseCode: result._responseCode,
      };
    }

  } catch (error) {
    console.error('❌ addToVault error:', error.message);
    return { success: false, message: error.message };
  }
}


// ============================================================
// 2. CHARGE CUSTOMER (One-time payment using vault token)
// ============================================================
// Charges a customer using their stored vault token.
// NO sensitive payment data needed — just the vault ID.
//
// USAGE:
//   const result = await chargeCustomer({
//     vaultId: 'abc123-vault-token',
//     amount: 149.00,
//     description: 'Speedy Credit Repair - Professional Plan',
//     orderId: 'INV-2026-001',
//   });
// ============================================================
async function chargeCustomer(data) {
  try {
    console.log(`💰 Charging customer: $${data.amount} via vault ${data.vaultId}`);

    if (!data.vaultId) throw new Error('vaultId is required');
    if (!data.amount || data.amount <= 0) throw new Error('Valid amount is required');

    const params = {
      type: 'sale',
      customer_vault_id: data.vaultId,
      amount: data.amount.toFixed(2),
      order_description: data.description || 'Speedy Credit Repair Service',
      orderid: data.orderId || `SCR-${Date.now()}`,
      currency: 'USD',
    };

    // ===== For ACH, include SEC code =====
    if (data.paymentType === 'ach') {
      params.sec_code = 'WEB';
    }

    const result = await callNMI(params);

    return {
      success: result._success,
      transactionId: result.transactionid || null,
      authCode: result.authcode || null,
      message: result._message,
      responseCode: result._responseCode,
      amount: data.amount,
      // ===== SAFE to store in Firestore =====
      firestoreData: {
        nmiTransactionId: result.transactionid || null,
        amount: data.amount,
        status: result._success ? 'approved' : 'declined',
        responseMessage: result._message,
        responseCode: result._responseCode,
        processedAt: new Date().toISOString(),
        orderId: params.orderid,
      },
    };

  } catch (error) {
    console.error('❌ chargeCustomer error:', error.message);
    return { success: false, message: error.message };
  }
}


// ============================================================
// 3. SET UP RECURRING BILLING (Monthly subscription)
// ============================================================
// Creates a recurring payment plan in NMI using the
// customer's vault token. NMI will automatically charge
// the customer each month — no cron jobs needed.
//
// USAGE:
//   const result = await setupRecurring({
//     vaultId: 'abc123-vault-token',
//     planId: 'professional',    // essentials, professional, vip
//     contactId: 'firestore-contact-id',
//     startDate: '20260301',     // YYYYMMDD — when to start billing
//   });
// ============================================================
async function setupRecurring(data) {
  try {
    const plan = PLAN_BILLING[data.planId];
    if (!plan) throw new Error(`Invalid planId: ${data.planId}. Must be essentials, professional, or vip`);
    if (!data.vaultId) throw new Error('vaultId is required');

    console.log(`🔄 Setting up recurring: ${plan.planName} ($${plan.monthlyAmount}/mo) for vault ${data.vaultId}`);

    // ===== Calculate start date =====
    // Default: first of next month
    let startDate = data.startDate;
    if (!startDate) {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      startDate = nextMonth.toISOString().slice(0, 10).replace(/-/g, '');
    }

    const params = {
      recurring: 'add_subscription',
      customer_vault_id: data.vaultId,
      plan_amount: plan.monthlyAmount.toFixed(2),
      plan_payments: '0',              // 0 = unlimited (bill until cancelled)
      day_frequency: '30',             // Every 30 days
      start_date: startDate,           // YYYYMMDD
      order_description: plan.description,
      orderid: `SUB-${data.contactId || 'unknown'}-${data.planId}`,
    };

    const result = await callNMI(params);

    if (result._success) {
      console.log(`✅ Recurring billing created: subscription_id=${result.subscription_id}`);
      return {
        success: true,
        subscriptionId: result.subscription_id || null,
        message: 'Recurring billing activated',
        planId: data.planId,
        planName: plan.planName,
        monthlyAmount: plan.monthlyAmount,
        startDate: startDate,
        // ===== SAFE to store in Firestore =====
        firestoreData: {
          nmiSubscriptionId: result.subscription_id || null,
          planId: data.planId,
          planName: plan.planName,
          monthlyAmount: plan.monthlyAmount,
          startDate: startDate,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      };
    } else {
      console.error('❌ Recurring setup failed:', result._message);
      return {
        success: false,
        message: result._message,
        responseCode: result._responseCode,
      };
    }

  } catch (error) {
    console.error('❌ setupRecurring error:', error.message);
    return { success: false, message: error.message };
  }
}


// ============================================================
// 4. CANCEL RECURRING BILLING
// ============================================================
// Stops a subscription. The customer won't be charged again.
//
// USAGE:
//   const result = await cancelRecurring({
//     subscriptionId: 'nmi-subscription-id',
//   });
// ============================================================
async function cancelRecurring(data) {
  try {
    if (!data.subscriptionId) throw new Error('subscriptionId is required');

    console.log(`🛑 Cancelling subscription: ${data.subscriptionId}`);

    const params = {
      recurring: 'delete_subscription',
      subscription_id: data.subscriptionId,
    };

    const result = await callNMI(params);

    return {
      success: result._success,
      message: result._success ? 'Subscription cancelled' : result._message,
      subscriptionId: data.subscriptionId,
      firestoreData: {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('❌ cancelRecurring error:', error.message);
    return { success: false, message: error.message };
  }
}


// ============================================================
// 5. PROCESS REFUND
// ============================================================
// Refunds a previous transaction (full or partial).
//
// USAGE:
//   const result = await processRefund({
//     transactionId: 'original-nmi-transaction-id',
//     amount: 149.00,  // Optional: omit for full refund
//   });
// ============================================================
async function processRefund(data) {
  try {
    if (!data.transactionId) throw new Error('transactionId is required');

    console.log(`💸 Processing refund for transaction: ${data.transactionId}, amount: ${data.amount || 'FULL'}`);

    const params = {
      type: 'refund',
      transactionid: data.transactionId,
    };

    // ===== Partial refund =====
    if (data.amount && data.amount > 0) {
      params.amount = data.amount.toFixed(2);
    }

    const result = await callNMI(params);

    return {
      success: result._success,
      refundTransactionId: result.transactionid || null,
      message: result._success ? 'Refund processed' : result._message,
      amount: data.amount || 'full',
      firestoreData: {
        refundTransactionId: result.transactionid || null,
        refundAmount: data.amount || 'full',
        refundStatus: result._success ? 'approved' : 'declined',
        refundedAt: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('❌ processRefund error:', error.message);
    return { success: false, message: error.message };
  }
}


// ============================================================
// 6. VOID TRANSACTION (Cancel before settlement)
// ============================================================
// Voids a transaction BEFORE it settles (same day).
// After settlement, use processRefund instead.
//
// USAGE:
//   const result = await voidTransaction({
//     transactionId: 'nmi-transaction-id',
//   });
// ============================================================
async function voidTransaction(data) {
  try {
    if (!data.transactionId) throw new Error('transactionId is required');

    console.log(`🚫 Voiding transaction: ${data.transactionId}`);

    const params = {
      type: 'void',
      transactionid: data.transactionId,
    };

    const result = await callNMI(params);

    return {
      success: result._success,
      message: result._success ? 'Transaction voided' : result._message,
      firestoreData: {
        status: 'voided',
        voidedAt: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('❌ voidTransaction error:', error.message);
    return { success: false, message: error.message };
  }
}


// ============================================================
// 7. UPDATE VAULT CUSTOMER (Change payment method)
// ============================================================
// Updates a customer's payment method in the vault.
// Use when a client switches cards or bank accounts.
//
// USAGE:
//   const result = await updateVault({
//     vaultId: 'existing-vault-id',
//     checkAccount: '987654321',
//     checkAba: '021000021',
//     checkName: 'John Doe',
//     accountType: 'checking',
//   });
// ============================================================
async function updateVault(data) {
  try {
    if (!data.vaultId) throw new Error('vaultId is required');

    console.log(`📝 Updating vault customer: ${data.vaultId}`);

    const params = {
      customer_vault: 'update_customer',
      customer_vault_id: data.vaultId,
    };

    // ===== ACH update =====
    if (data.checkAccount && data.checkAba) {
      params.payment = 'check';
      params.checkname = data.checkName || '';
      params.checkaba = data.checkAba;
      params.checkaccount = data.checkAccount;
      params.account_type = data.accountType || 'checking';
      params.account_holder_type = data.accountHolderType || 'personal';
      params.sec_code = 'WEB';
    }
    // ===== CC update =====
    else if (data.ccNumber && data.ccExp) {
      params.payment = 'creditcard';
      params.ccnumber = data.ccNumber;
      params.ccexp = data.ccExp;
      if (data.cvv) params.cvv = data.cvv;
    }

    // ===== Update contact info if provided =====
    if (data.firstName) params.first_name = data.firstName;
    if (data.lastName) params.last_name = data.lastName;
    if (data.email) params.email = data.email;
    if (data.phone) params.phone = data.phone;
    if (data.address) params.address1 = data.address;
    if (data.city) params.city = data.city;
    if (data.state) params.state = data.state;
    if (data.zip) params.zip = data.zip;

    const result = await callNMI(params);

    return {
      success: result._success,
      vaultId: data.vaultId,
      message: result._success ? 'Payment method updated' : result._message,
      firestoreData: {
        paymentType: data.checkAccount ? 'ach' : 'cc',
        lastFour: data.checkAccount
          ? data.checkAccount.slice(-4)
          : (data.ccNumber ? data.ccNumber.slice(-4) : null),
        vaultUpdatedAt: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('❌ updateVault error:', error.message);
    return { success: false, message: error.message };
  }
}


// ============================================================
// 8. DELETE VAULT CUSTOMER (Remove stored payment)
// ============================================================
// Permanently removes a customer's payment data from the vault.
// Use when a client cancels and wants their data deleted.
//
// USAGE:
//   const result = await deleteFromVault({
//     vaultId: 'vault-id-to-delete',
//   });
// ============================================================
async function deleteFromVault(data) {
  try {
    if (!data.vaultId) throw new Error('vaultId is required');

    console.log(`🗑️ Deleting vault customer: ${data.vaultId}`);

    const params = {
      customer_vault: 'delete_customer',
      customer_vault_id: data.vaultId,
    };

    const result = await callNMI(params);

    return {
      success: result._success,
      message: result._success ? 'Payment method deleted from vault' : result._message,
      firestoreData: {
        nmiVaultId: null,
        paymentType: null,
        lastFour: null,
        vaultDeletedAt: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error('❌ deleteFromVault error:', error.message);
    return { success: false, message: error.message };
  }
}


// ============================================================
// 9. FULL ENROLLMENT PAYMENT FLOW
// ============================================================
// This is the "one call does it all" method for new clients.
// It handles the complete payment onboarding:
//   1. Store payment method in vault
//   2. Charge setup fee (if applicable)
//   3. Set up monthly recurring billing
//   4. Return everything needed for Firestore
//
// This is what ACHAuthorization.jsx should call after
// collecting the client's bank/card info.
//
// USAGE:
//   const result = await processNewEnrollment({
//     contactId: 'firestore-contact-id',
//     planId: 'professional',
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john@example.com',
//     phone: '7145551234',
//     address: '123 Main St',
//     city: 'Huntington Beach',
//     state: 'CA',
//     zip: '92648',
//     // ACH:
//     checkAccount: '123456789',
//     checkAba: '021000021',
//     checkName: 'John Doe',
//     accountType: 'checking',
//     bankName: 'Chase',
//     // OR Credit Card:
//     // ccNumber: '4111111111111111',
//     // ccExp: '1228',
//     // cvv: '999',
//   });
// ============================================================
async function processNewEnrollment(data) {
  try {
    const plan = PLAN_BILLING[data.planId];
    if (!plan) throw new Error(`Invalid planId: ${data.planId}`);
    if (!data.contactId) throw new Error('contactId is required');

    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log(`║  NEW ENROLLMENT: ${plan.planName} Plan`);
    console.log(`║  Contact: ${data.contactId}`);
    console.log(`║  Monthly: $${plan.monthlyAmount} | Setup: $${plan.setupFee}`);
    console.log('╚══════════════════════════════════════════════════╝');

    const enrollmentResult = {
      contactId: data.contactId,
      planId: data.planId,
      planName: plan.planName,
      steps: [],
    };

    // ─────────────────────────────────────────────
    // STEP 1: Add payment method to vault
    // ─────────────────────────────────────────────
    console.log('📌 Step 1: Adding to Customer Vault...');
    const vaultResult = await addToVault(data);

    if (!vaultResult.success) {
      enrollmentResult.success = false;
      enrollmentResult.failedAt = 'vault';
      enrollmentResult.error = vaultResult.message;
      enrollmentResult.steps.push({ step: 'vault', success: false, error: vaultResult.message });
      console.error('❌ Enrollment failed at vault step');
      return enrollmentResult;
    }

    enrollmentResult.vaultId = vaultResult.vaultId;
    enrollmentResult.steps.push({ step: 'vault', success: true, vaultId: vaultResult.vaultId });

    // ─────────────────────────────────────────────
    // STEP 2: Charge setup fee (if applicable)
    // ─────────────────────────────────────────────
    if (plan.setupFee > 0) {
      console.log(`📌 Step 2: Charging setup fee: $${plan.setupFee}...`);
      const setupResult = await chargeCustomer({
        vaultId: vaultResult.vaultId,
        amount: plan.setupFee,
        description: `${plan.planName} Plan - Setup Fee`,
        orderId: `SETUP-${data.contactId}`,
        paymentType: data.checkAccount ? 'ach' : 'cc',
      });

      enrollmentResult.steps.push({
        step: 'setupFee',
        success: setupResult.success,
        amount: plan.setupFee,
        transactionId: setupResult.transactionId,
        error: setupResult.success ? null : setupResult.message,
      });

      if (!setupResult.success) {
        console.error('❌ Setup fee charge failed — continuing to set up recurring anyway');
        // NOTE: We continue even if setup fee fails (ACH might take time to settle)
        // The team can follow up manually if the setup fee doesn't clear
      }

      enrollmentResult.setupFeeTransactionId = setupResult.transactionId;
    } else {
      console.log('📌 Step 2: No setup fee for this plan — skipping');
      enrollmentResult.steps.push({ step: 'setupFee', success: true, amount: 0, skipped: true });
    }

    // ─────────────────────────────────────────────
    // STEP 3: Set up recurring monthly billing
    // ─────────────────────────────────────────────
    console.log(`📌 Step 3: Setting up recurring: $${plan.monthlyAmount}/month...`);
    const recurringResult = await setupRecurring({
      vaultId: vaultResult.vaultId,
      planId: data.planId,
      contactId: data.contactId,
    });

    enrollmentResult.steps.push({
      step: 'recurring',
      success: recurringResult.success,
      subscriptionId: recurringResult.subscriptionId,
      monthlyAmount: plan.monthlyAmount,
      error: recurringResult.success ? null : recurringResult.message,
    });

    if (!recurringResult.success) {
      enrollmentResult.success = false;
      enrollmentResult.failedAt = 'recurring';
      enrollmentResult.error = recurringResult.message;
      console.error('❌ Enrollment failed at recurring billing step');
      return enrollmentResult;
    }

    enrollmentResult.subscriptionId = recurringResult.subscriptionId;

    // ─────────────────────────────────────────────
    // SUCCESS — Return everything
    // ─────────────────────────────────────────────
    enrollmentResult.success = true;

    // ===== This is what goes into the Firestore contact document =====
    enrollmentResult.firestoreData = {
      // Payment vault info
      nmiVaultId: vaultResult.vaultId,
      paymentType: data.checkAccount ? 'ach' : 'cc',
      lastFour: data.checkAccount
        ? data.checkAccount.slice(-4)
        : data.ccNumber.slice(-4),
      bankName: data.bankName || null,
      accountType: data.accountType || null,

      // Billing info
      nmiSubscriptionId: recurringResult.subscriptionId,
      billingPlanId: data.planId,
      billingPlanName: plan.planName,
      billingMonthlyAmount: plan.monthlyAmount,
      billingSetupFee: plan.setupFee,
      billingStatus: 'active',
      billingStartDate: recurringResult.startDate,
      billingEnrolledAt: new Date().toISOString(),

      // Setup fee transaction (if charged)
      setupFeeTransactionId: enrollmentResult.setupFeeTransactionId || null,
      setupFeeStatus: plan.setupFee > 0 ? 'charged' : 'waived',
    };

    console.log('');
    console.log('✅ ═══════════════════════════════════════════════');
    console.log(`✅ ENROLLMENT COMPLETE: ${plan.planName} Plan`);
    console.log(`✅ Vault: ${vaultResult.vaultId}`);
    console.log(`✅ Subscription: ${recurringResult.subscriptionId}`);
    console.log(`✅ Monthly: $${plan.monthlyAmount} | Setup: $${plan.setupFee}`);
    console.log('✅ ═══════════════════════════════════════════════');

    return enrollmentResult;

  } catch (error) {
    console.error('❌ processNewEnrollment error:', error.message);
    return {
      success: false,
      contactId: data.contactId,
      planId: data.planId,
      error: error.message,
      failedAt: 'unexpected',
    };
  }
}


// ============================================================
// 10. CHARGE DELETION FEE (Per-item success fee)
// ============================================================
// Professional plan charges $25 per item deleted per bureau.
// Call this when a deletion is confirmed.
//
// USAGE:
//   const result = await chargeDeletionFee({
//     vaultId: 'vault-id',
//     contactId: 'contact-id',
//     itemName: 'Capital One Late Payment',
//     bureau: 'Experian',
//     planId: 'professional',
//   });
// ============================================================
async function chargeDeletionFee(data) {
  try {
    const plan = PLAN_BILLING[data.planId];
    if (!plan) throw new Error(`Invalid planId: ${data.planId}`);

    // ===== VIP has $0 deletion fees =====
    if (plan.perDeletionFee === 0) {
      console.log(`ℹ️ ${plan.planName} plan: $0 deletion fee — skipping charge`);
      return {
        success: true,
        amount: 0,
        message: `${plan.planName} plan includes all deletion fees`,
        skipped: true,
      };
    }

    const amount = plan.perDeletionFee;
    const description = `Deletion Fee: ${data.itemName || 'Item'} - ${data.bureau || 'Bureau'}`;

    console.log(`🎯 Charging deletion fee: $${amount} for ${description}`);

    const result = await chargeCustomer({
      vaultId: data.vaultId,
      amount: amount,
      description: description,
      orderId: `DEL-${data.contactId}-${Date.now()}`,
      paymentType: data.paymentType || 'ach',
    });

    return {
      ...result,
      itemName: data.itemName,
      bureau: data.bureau,
      firestoreData: {
        ...result.firestoreData,
        type: 'deletion_fee',
        itemName: data.itemName,
        bureau: data.bureau,
      },
    };

  } catch (error) {
    console.error('❌ chargeDeletionFee error:', error.message);
    return { success: false, message: error.message };
  }
}


// ============================================================
// EXPORTS
// ============================================================
// These are what your Cloud Functions import and call.
// Example in index.js:
//   const payment = require('./paymentGateway');
//   const result = await payment.processNewEnrollment({...});
// ============================================================
module.exports = {
  // ===== Core Methods =====
  addToVault,
  chargeCustomer,
  setupRecurring,
  cancelRecurring,
  processRefund,
  voidTransaction,
  updateVault,
  deleteFromVault,

  // ===== Business Logic Methods =====
  processNewEnrollment,   // Full enrollment flow (vault + setup fee + recurring)
  chargeDeletionFee,      // Per-item deletion fee (Professional plan)

  // ===== Config (for reference/testing) =====
  GATEWAY_CONFIG,
  PLAN_BILLING,
};