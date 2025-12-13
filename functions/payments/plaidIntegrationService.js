// ============================================================================
// PLAID INTEGRATION SERVICE - Direct ACH Payment Processing
// ============================================================================
// Alternative to manual Chase processing - enables direct ACH debits
// Provides bank account verification, balance checks, and automated ACH transfers
// ============================================================================
// SETUP REQUIRED:
// 1. Sign up for Plaid account: https://plaid.com
// 2. Get API credentials (client_id, secret, public_key)
// 3. Set up Firebase config: firebase functions:config:set plaid.client_id="xxx" plaid.secret="xxx"
// 4. Install Plaid SDK: npm install plaid
// 5. Configure webhook URL in Plaid dashboard
// ============================================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * NOTE: Plaid SDK not installed by default
 * To enable Plaid integration, run: npm install plaid
 * Then uncomment the line below:
 */
// const { PlaidApi, PlaidEnvironments, Configuration } = require('plaid');

/**
 * Plaid Configuration
 * Get these from Firebase config or environment variables
 */
const PLAID_CONFIG = {
  clientId: functions.config().plaid?.client_id || process.env.PLAID_CLIENT_ID,
  secret: functions.config().plaid?.secret || process.env.PLAID_SECRET,
  env: functions.config().plaid?.env || process.env.PLAID_ENV || 'sandbox', // sandbox, development, or production
  webhookUrl: functions.config().plaid?.webhook_url || 'https://us-central1-your-project.cloudfunctions.net/plaidWebhook'
};

/**
 * Initialize Plaid client
 * Uncomment after installing Plaid SDK
 */
function getPlaidClient() {
  // Check if Plaid is configured
  if (!PLAID_CONFIG.clientId || !PLAID_CONFIG.secret) {
    throw new Error('Plaid credentials not configured. Set up Firebase config for plaid.client_id and plaid.secret');
  }

  /* Uncomment after installing Plaid SDK:
  const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_CONFIG.env],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CONFIG.clientId,
        'PLAID-SECRET': PLAID_CONFIG.secret,
      },
    },
  });

  return new PlaidApi(configuration);
  */

  // Placeholder for when Plaid is not installed
  console.warn('⚠️ Plaid SDK not installed. Install with: npm install plaid');
  return null;
}

/**
 * Cloud Function: Create Link Token for Plaid Link
 * Used by frontend to initiate bank account linking
 */
exports.createPlaidLinkToken = functions.runWith({
  memory: '512MB',
  timeoutSeconds: 60
}).https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { clientId, clientName } = data;
  const userId = clientId || context.auth.uid;

  try {
    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Plaid SDK not installed. Please install with: npm install plaid'
      );
    }

    /* Uncomment after installing Plaid SDK:
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Speedy Credit Repair',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
      webhook: PLAID_CONFIG.webhookUrl,
      account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings'],
        },
      },
    };

    const response = await plaidClient.linkTokenCreate(request);
    const linkToken = response.data.link_token;

    // Store link token in Firestore
    await db.collection('plaidLinkTokens').add({
      userId,
      linkToken,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      used: false
    });

    return {
      success: true,
      linkToken
    };
    */

    // Placeholder response
    console.log('📝 Plaid link token creation requested for user:', userId);
    return {
      success: false,
      message: 'Plaid SDK not installed. Install with: npm install plaid',
      instructions: 'Follow setup instructions in plaidIntegrationService.js'
    };
  } catch (error) {
    console.error('Error creating Plaid link token:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: Exchange public token for access token
 * Called after user successfully links bank account via Plaid Link
 */
exports.exchangePlaidPublicToken = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { publicToken, metadata } = data;
  const userId = context.auth.uid;

  try {
    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Plaid SDK not installed'
      );
    }

    /* Uncomment after installing Plaid SDK:
    // Exchange public token for access token
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account details
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;

    // Store access token securely in Firestore
    const plaidItemRef = await db.collection('plaidItems').add({
      userId,
      accessToken, // In production, encrypt this!
      itemId,
      institutionId: metadata?.institution?.institution_id,
      institutionName: metadata?.institution?.name,
      accounts: accounts.map(acc => ({
        accountId: acc.account_id,
        name: acc.name,
        mask: acc.mask,
        type: acc.type,
        subtype: acc.subtype,
        verificationStatus: acc.verification_status
      })),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    });

    // Create payment methods for each account
    for (const account of accounts) {
      await db.collection('paymentMethods').add({
        clientId: userId,
        type: 'Plaid_ACH',
        plaidItemId: plaidItemRef.id,
        plaidAccountId: account.account_id,
        bankName: metadata?.institution?.name,
        accountLast4: account.mask,
        accountType: account.subtype,
        status: 'active',
        isDefault: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      success: true,
      itemId,
      accountsLinked: accounts.length
    };
    */

    console.log('📝 Public token exchange requested for user:', userId);
    return {
      success: false,
      message: 'Plaid SDK not installed'
    };
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: Get account balances
 */
exports.getPlaidAccountBalance = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { plaidItemId } = data;

  try {
    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      throw new functions.https.HttpsError('failed-precondition', 'Plaid SDK not installed');
    }

    /* Uncomment after installing Plaid SDK:
    // Get Plaid item
    const plaidItemDoc = await db.collection('plaidItems').doc(plaidItemId).get();
    if (!plaidItemDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Plaid item not found');
    }

    const plaidItem = plaidItemDoc.data();

    // Verify ownership
    if (plaidItem.userId !== context.auth.uid) {
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      if (!['admin', 'masterAdmin'].includes(userDoc.data()?.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Access denied');
      }
    }

    // Get balances
    const response = await plaidClient.accountsBalanceGet({
      access_token: plaidItem.accessToken,
    });

    return {
      success: true,
      accounts: response.data.accounts.map(acc => ({
        accountId: acc.account_id,
        name: acc.name,
        mask: acc.mask,
        available: acc.balances.available,
        current: acc.balances.current,
        currency: acc.balances.iso_currency_code
      }))
    };
    */

    return {
      success: false,
      message: 'Plaid SDK not installed'
    };
  } catch (error) {
    console.error('Error getting account balance:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: Initiate ACH payment
 * Creates a payment using Plaid's Auth and Transfer products
 */
exports.initiatePlaidPayment = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verify admin role
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!['admin', 'masterAdmin'].includes(userDoc.data()?.role)) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can initiate payments');
  }

  const { plaidItemId, accountId, amount, description } = data;

  try {
    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      throw new functions.https.HttpsError('failed-precondition', 'Plaid SDK not installed');
    }

    /* Uncomment after installing Plaid SDK and enabling Transfer product:
    // Get Plaid item
    const plaidItemDoc = await db.collection('plaidItems').doc(plaidItemId).get();
    if (!plaidItemDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Plaid item not found');
    }

    const plaidItem = plaidItemDoc.data();

    // Create authorization for transfer
    const authResponse = await plaidClient.transferAuthorizationCreate({
      access_token: plaidItem.accessToken,
      account_id: accountId,
      type: 'debit',
      network: 'ach',
      amount: amount.toString(),
      ach_class: 'ppd',
      user: {
        legal_name: 'Speedy Credit Repair Inc',
      },
    });

    const authorizationId = authResponse.data.authorization.id;

    // Create transfer
    const transferResponse = await plaidClient.transferCreate({
      access_token: plaidItem.accessToken,
      account_id: accountId,
      authorization_id: authorizationId,
      type: 'debit',
      network: 'ach',
      amount: amount.toString(),
      description: description || 'Credit Repair Services',
      ach_class: 'ppd',
      user: {
        legal_name: 'Speedy Credit Repair Inc',
      },
    });

    const transfer = transferResponse.data.transfer;

    // Create payment record
    const paymentRef = await db.collection('payments').add({
      clientId: plaidItem.userId,
      amount: parseFloat(amount),
      paymentMethod: 'Plaid_ACH',
      plaidTransferId: transfer.id,
      plaidItemId,
      status: 'pending',
      description,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid
    });

    return {
      success: true,
      paymentId: paymentRef.id,
      transferId: transfer.id,
      status: transfer.status
    };
    */

    return {
      success: false,
      message: 'Plaid SDK not installed'
    };
  } catch (error) {
    console.error('Error initiating Plaid payment:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Cloud Function: Plaid Webhook Handler
 * Receives updates from Plaid about transactions, auth changes, etc.
 */
exports.plaidWebhook = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60
}).https.onRequest(async (req, res) => {
  const webhookType = req.body.webhook_type;
  const webhookCode = req.body.webhook_code;

  console.log(`📬 Plaid webhook received: ${webhookType}.${webhookCode}`);

  try {
    switch (webhookType) {
      case 'TRANSACTIONS':
        await handleTransactionsWebhook(req.body);
        break;

      case 'ITEM':
        await handleItemWebhook(req.body);
        break;

      case 'AUTH':
        await handleAuthWebhook(req.body);
        break;

      case 'TRANSFER':
        await handleTransferWebhook(req.body);
        break;

      default:
        console.log(`Unhandled webhook type: ${webhookType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Handle transfer webhooks (payment status updates)
 */
async function handleTransferWebhook(webhookData) {
  const { webhook_code, transfer_id } = webhookData;

  console.log(`💸 Transfer webhook: ${webhook_code} for transfer ${transfer_id}`);

  // Find payment by transfer ID
  const paymentsSnapshot = await db.collection('payments')
    .where('plaidTransferId', '==', transfer_id)
    .limit(1)
    .get();

  if (paymentsSnapshot.empty) {
    console.warn(`No payment found for transfer ${transfer_id}`);
    return;
  }

  const paymentDoc = paymentsSnapshot.docs[0];

  // Update payment status based on webhook code
  let status;
  switch (webhook_code) {
    case 'TRANSFER_EVENTS_UPDATE':
      // Check specific transfer event
      if (webhookData.transfer_event?.event_type === 'posted') {
        status = 'completed';
      } else if (webhookData.transfer_event?.event_type === 'failed') {
        status = 'failed';
      }
      break;
  }

  if (status) {
    await paymentDoc.ref.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      plaidWebhookData: webhookData
    });

    console.log(`✅ Updated payment ${paymentDoc.id} to status: ${status}`);
  }
}

/**
 * Handle transactions webhooks
 */
async function handleTransactionsWebhook(webhookData) {
  console.log('📊 Transactions webhook received');
  // Implement transaction sync logic here
}

/**
 * Handle item webhooks (bank connection issues)
 */
async function handleItemWebhook(webhookData) {
  const { webhook_code, item_id } = webhookData;

  console.log(`🔗 Item webhook: ${webhook_code} for item ${item_id}`);

  // Handle item errors (e.g., re-authentication required)
  if (webhook_code === 'ERROR') {
    // Find Plaid item and mark as requiring update
    const itemsSnapshot = await db.collection('plaidItems')
      .where('itemId', '==', item_id)
      .get();

    for (const doc of itemsSnapshot.docs) {
      await doc.ref.update({
        requiresUpdate: true,
        error: webhookData.error,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.warn(`⚠️ Plaid item ${item_id} requires user attention`);
    }
  }
}

/**
 * Handle auth webhooks
 */
async function handleAuthWebhook(webhookData) {
  console.log('🔐 Auth webhook received');
  // Implement auth update logic here
}

/**
 * Setup Instructions for Plaid Integration
 */
const SETUP_INSTRUCTIONS = `
╔════════════════════════════════════════════════════════════════╗
║                 PLAID INTEGRATION SETUP GUIDE                  ║
╚════════════════════════════════════════════════════════════════╝

1. SIGN UP FOR PLAID
   • Visit: https://plaid.com
   • Create account and verify email
   • Complete application for API access

2. GET API CREDENTIALS
   • Navigate to: Dashboard > Team Settings > Keys
   • Copy: client_id, secret, public_key
   • Start with Sandbox environment for testing

3. INSTALL PLAID SDK
   Run in functions directory:
   $ cd functions
   $ npm install plaid

4. CONFIGURE FIREBASE
   Set Plaid credentials:
   $ firebase functions:config:set plaid.client_id="YOUR_CLIENT_ID"
   $ firebase functions:config:set plaid.secret="YOUR_SECRET"
   $ firebase functions:config:set plaid.env="sandbox"

5. ENABLE PLAID PRODUCTS
   In Plaid Dashboard, enable:
   • Auth (bank account verification)
   • Transactions (optional - transaction sync)
   • Transfer (required for direct ACH debits)

6. CONFIGURE WEBHOOK
   • Get your Cloud Function URL after deployment
   • Add webhook URL in Plaid Dashboard
   • Format: https://us-central1-[project-id].cloudfunctions.net/plaidWebhook

7. UPDATE CODE
   In plaidIntegrationService.js:
   • Uncomment all Plaid SDK imports
   • Uncomment all Plaid API calls
   • Update webhook URL in PLAID_CONFIG

8. DEPLOY FUNCTIONS
   $ firebase deploy --only functions

9. FRONTEND INTEGRATION
   Install Plaid Link in your React app:
   $ npm install react-plaid-link

   Use PlaidLink component in ClientPaymentSetup.jsx

10. TESTING
    • Use Plaid's sandbox credentials for testing
    • Test bank accounts available in sandbox
    • Monitor webhook events in Plaid Dashboard

COST STRUCTURE:
• Free tier: Sandbox + limited production usage
• Auth: $0.20 per user/month
• Transfer: $0.25 per ACH transfer
• See: https://plaid.com/pricing/

PRODUCTION CHECKLIST:
☐ Complete Plaid application & verification
☐ Encrypt access tokens in Firestore
☐ Implement token rotation
☐ Add comprehensive error handling
☐ Set up monitoring & alerts
☐ Configure production webhook URL
☐ Update environment to 'production'
☐ Test with real bank accounts
☐ Implement PCI DSS compliance measures
☐ Add customer support documentation

SUPPORT:
• Plaid Docs: https://plaid.com/docs/
• Plaid Support: support@plaid.com
• Node.js Quickstart: https://plaid.com/docs/quickstart/
`;

/**
 * Cloud Function: Get Plaid setup instructions
 */
exports.getPlaidSetupInstructions = functions.runWith({
  memory: '256MB',
  timeoutSeconds: 60
}).https.onRequest((req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(SETUP_INSTRUCTIONS);
});

module.exports = {
  createPlaidLinkToken: exports.createPlaidLinkToken,
  exchangePlaidPublicToken: exports.exchangePlaidPublicToken,
  getPlaidAccountBalance: exports.getPlaidAccountBalance,
  initiatePlaidPayment: exports.initiatePlaidPayment,
  plaidWebhook: exports.plaidWebhook,
  getPlaidSetupInstructions: exports.getPlaidSetupInstructions
};
