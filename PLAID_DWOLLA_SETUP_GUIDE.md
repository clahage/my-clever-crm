# Plaid & Dwolla Integration Setup Guide

**Project:** SpeedyCRM - Speedy Credit Repair
**Date:** November 12, 2025
**Purpose:** Complete setup instructions for Plaid bank verification and Dwolla ACH payments

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Plaid Setup](#plaid-setup)
4. [Dwolla Setup](#dwolla-setup)
5. [Firebase Functions Configuration](#firebase-functions-configuration)
6. [Testing](#testing)
7. [Going to Production](#going-to-production)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### System Architecture

```
┌─────────────┐      ┌──────────┐      ┌─────────────┐      ┌──────────┐
│   Client    │─────▶│  Plaid   │─────▶│  Firebase   │─────▶│  Dwolla  │
│  (React)    │◀─────│   Link   │◀─────│  Functions  │◀─────│   API    │
└─────────────┘      └──────────┘      └─────────────┘      └──────────┘
                          │                    │                   │
                          │                    │                   │
                     Bank Account         Access Token         ACH Payment
                     Verification         Management           Processing
```

### Integration Flow

1. **Client** initiates bank account linking
2. **Plaid Link** opens to select bank
3. **Firebase Function** exchanges public token for access token
4. **Dwolla** creates funding source using Plaid processor token
5. **ACH Payments** processed through Dwolla
6. **Webhooks** update CRM with status changes

---

## Prerequisites

### Required Accounts

- ✅ **Google Workspace**: chris@speedycreditrepair.com (Primary)
- ✅ **Firebase**: Project `my-clever-crm` configured
- 🔲 **Plaid Account**: Apply at https://dashboard.plaid.com/signup
- 🔲 **Dwolla Account**: Apply at https://accounts-sandbox.dwolla.com/sign-up

### Required Information

**For Plaid Application:**
- Business name: Speedy Credit Repair
- Business type: Credit Repair Services
- Website: speedycreditrepair.com
- Email: chris@speedycreditrepair.com
- Use case: Bank account verification for ACH payments
- Expected volume: 50-100 connections/month
- Products needed: Auth, Identity, Balance, Transactions

**For Dwolla Application:**
- Business name: Speedy Credit Repair
- Business EIN/Tax ID
- Business address
- Controller information (owner/director)
- Bank account for settlements
- Use case: ACH payment processing for credit repair services
- Expected monthly volume: $10,000 - $50,000

---

## Plaid Setup

### Step 1: Create Plaid Account

1. Go to https://dashboard.plaid.com/signup
2. Complete business verification
3. Request access to **Sandbox** environment (instant)
4. Request access to **Development** environment (may require review)
5. Request access to **Production** environment (requires compliance review)

### Step 2: Get API Credentials

1. Log into Plaid Dashboard
2. Navigate to **Team Settings** → **Keys**
3. Copy your credentials:

```
SANDBOX:
- Client ID: [your_client_id]
- Sandbox Secret: [your_sandbox_secret]

DEVELOPMENT (after approval):
- Development Secret: [your_development_secret]

PRODUCTION (after approval):
- Production Secret: [your_production_secret]
```

### Step 3: Configure Environment Variables

**Client-side (.env):**
```bash
# Plaid Configuration
VITE_PLAID_ENV=sandbox  # or: development, production
VITE_PLAID_WEBHOOK_URL=https://us-central1-my-clever-crm.cloudfunctions.net/plaid_webhook
```

**Firebase Functions (functions/.env):**
```bash
# Plaid API Credentials
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET_SANDBOX=your_sandbox_secret_here
PLAID_SECRET_DEVELOPMENT=your_development_secret_here  # When approved
PLAID_SECRET_PRODUCTION=your_production_secret_here    # When approved
PLAID_ENVIRONMENT=sandbox  # or: development, production
```

### Step 4: Add Plaid Script to HTML

In `index.html`, add before closing `</body>` tag:

```html
<!-- Plaid Link Script -->
<script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
```

### Step 5: Configure Webhook URL in Plaid Dashboard

1. Go to Plaid Dashboard → **Webhooks**
2. Add webhook URL: `https://us-central1-my-clever-crm.cloudfunctions.net/plaid_webhook`
3. Enable events:
   - `ITEM_LOGIN_REQUIRED`
   - `ERROR`
   - `PENDING_EXPIRATION`
   - `USER_PERMISSION_REVOKED`

---

## Dwolla Setup

### Step 1: Create Dwolla Account

**Sandbox (For Testing):**
1. Go to https://accounts-sandbox.dwolla.com/sign-up
2. Create account (instant approval)
3. Access sandbox dashboard

**Production:**
1. Go to https://www.dwolla.com/get-started
2. Complete business application
3. Submit required documents:
   - Business formation documents
   - EIN letter from IRS
   - Bank account verification letter
   - Personal identification (drivers license, SSN)
4. Wait for approval (typically 3-5 business days)

### Step 2: Get API Credentials

**Sandbox:**
1. Log into Sandbox Dashboard: https://dashboard-sandbox.dwolla.com/
2. Navigate to **Applications** → **Create Application**
3. Application name: "Speedy CRM - Sandbox"
4. Copy credentials:
   - Key: [your_sandbox_key]
   - Secret: [your_sandbox_secret]

**Production (after approval):**
1. Log into Production Dashboard: https://dashboard.dwolla.com/
2. Navigate to **Applications** → **Create Application**
3. Application name: "Speedy CRM - Production"
4. Copy credentials:
   - Key: [your_production_key]
   - Secret: [your_production_secret]

### Step 3: Configure Environment Variables

**Client-side (.env):**
```bash
# Dwolla Configuration
VITE_DWOLLA_ENV=sandbox  # or: production
VITE_DWOLLA_WEBHOOK_URL=https://us-central1-my-clever-crm.cloudfunctions.net/dwolla_webhook
```

**Firebase Functions (functions/.env):**
```bash
# Dwolla API Credentials
DWOLLA_KEY_SANDBOX=your_sandbox_key_here
DWOLLA_SECRET_SANDBOX=your_sandbox_secret_here
DWOLLA_KEY_PRODUCTION=your_production_key_here      # When approved
DWOLLA_SECRET_PRODUCTION=your_production_secret_here  # When approved
DWOLLA_ENVIRONMENT=sandbox  # or: production
```

### Step 4: Configure Master Account

In Dwolla Dashboard:
1. Navigate to **Account** → **Master Account**
2. Add business details:
   - Legal business name
   - Business type (Corporation/LLC)
   - EIN
   - Business address
3. Verify business email
4. Add bank account for settlements

### Step 5: Set Up Webhooks

1. In Dwolla Dashboard → **Webhooks**
2. Add webhook URL: `https://us-central1-my-clever-crm.cloudfunctions.net/dwolla_webhook`
3. Generate webhook secret for signature verification
4. Enable events:
   - `customer_created`
   - `customer_verified`
   - `funding_source_added`
   - `funding_source_verified`
   - `transfer_created`
   - `transfer_completed`
   - `transfer_failed`
   - `transfer_cancelled`

---

## Firebase Functions Configuration

### Step 1: Install Dependencies

```bash
cd functions
npm install plaid dwolla-v2 --save
```

### Step 2: Create Plaid Cloud Functions

Create `functions/plaid.js`:

```javascript
const functions = require('firebase-functions');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const admin = require('firebase-admin');

// Initialize Plaid
const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENVIRONMENT || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env[`PLAID_SECRET_${(process.env.PLAID_ENVIRONMENT || 'sandbox').toUpperCase()}`],
    },
  },
});

const plaidClient = new PlaidApi(config);

// Create Link Token
exports.plaid_createLinkToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: context.auth.uid,
      },
      client_name: 'Speedy Credit Repair',
      products: data.products || ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
    });

    return { linkToken: response.data.link_token };
  } catch (error) {
    console.error('Plaid Link Token Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Exchange Public Token
exports.plaid_exchangePublicToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: data.publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get account info
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // Get processor token for Dwolla
    const processorResponse = await plaidClient.processorTokenCreate({
      access_token: accessToken,
      account_id: accountsResponse.data.accounts[0].account_id,
      processor: 'dwolla',
    });

    // Store in Firestore
    await admin.firestore().collection('plaidAccounts').add({
      userId: context.auth.uid,
      accessToken: accessToken,  // Encrypt in production
      itemId: itemId,
      processorToken: processorResponse.data.processor_token,
      accounts: accountsResponse.data.accounts,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      accounts: accountsResponse.data.accounts,
      processorToken: processorResponse.data.processor_token,
    };
  } catch (error) {
    console.error('Plaid Token Exchange Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get Balance
exports.plaid_getBalance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const response = await plaidClient.accountsBalanceGet({
      access_token: data.accessToken,
    });

    return { accounts: response.data.accounts };
  } catch (error) {
    console.error('Plaid Balance Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Webhook Handler
exports.plaid_webhook = functions.https.onRequest(async (req, res) => {
  const webhookType = req.body.webhook_type;
  const webhookCode = req.body.webhook_code;

  console.log(`Plaid Webhook: ${webhookType} - ${webhookCode}`);

  // Handle different webhook types
  switch (webhookCode) {
    case 'ITEM_LOGIN_REQUIRED':
      // User needs to re-authenticate
      // TODO: Notify user to re-link account
      break;
    case 'ERROR':
      // Handle error
      console.error('Plaid Error:', req.body);
      break;
  }

  res.status(200).send('OK');
});
```

### Step 3: Create Dwolla Cloud Functions

Create `functions/dwolla.js`:

```javascript
const functions = require('firebase-functions');
const dwolla = require('dwolla-v2');
const admin = require('firebase-admin');

// Initialize Dwolla
const dwollaEnv = process.env.DWOLLA_ENVIRONMENT || 'sandbox';
const dwollaClient = new dwolla.Client({
  key: process.env[`DWOLLA_KEY_${dwollaEnv.toUpperCase()}`],
  secret: process.env[`DWOLLA_SECRET_${dwollaEnv.toUpperCase()}`],
  environment: dwollaEnv,
});

// Create Customer
exports.dwolla_createCustomer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const requestBody = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      type: data.type || 'personal',
    };

    // Add additional fields for verified customers
    if (data.type === 'personal' || data.type === 'business') {
      requestBody.dateOfBirth = data.dateOfBirth;
      requestBody.ssn = data.ssn;
      requestBody.address = data.address;
    }

    const response = await dwollaClient.post('customers', requestBody);
    const customerUrl = response.headers.get('location');

    // Store in Firestore
    await admin.firestore().collection('dwollaCustomers').add({
      userId: context.auth.uid,
      customerUrl: customerUrl,
      type: data.type,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { customerUrl };
  } catch (error) {
    console.error('Dwolla Create Customer Error:', error);
    throw new functions.https.HttpsError('internal', error.body?.message || error.message);
  }
});

// Create Funding Source with Plaid
exports.dwolla_createFundingSourceWithPlaid = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const response = await dwollaClient.post(`${data.customerUrl}/funding-sources`, {
      plaidToken: data.plaidToken,
      name: data.name,
    });

    const fundingSourceUrl = response.headers.get('location');

    return { fundingSourceUrl };
  } catch (error) {
    console.error('Dwolla Create Funding Source Error:', error);
    throw new functions.https.HttpsError('internal', error.body?.message || error.message);
  }
});

// Initiate Payment
exports.dwolla_initiatePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const requestBody = {
      _links: {
        source: {
          href: data.sourceFundingSourceId,
        },
        destination: {
          href: data.destinationFundingSourceId,
        },
      },
      amount: {
        currency: 'USD',
        value: data.amount.toString(),
      },
    };

    if (data.memo) {
      requestBody.metadata = { memo: data.memo };
    }

    const response = await dwollaClient.post('transfers', requestBody);
    const transferUrl = response.headers.get('location');

    // Store in Firestore
    await admin.firestore().collection('payments').add({
      userId: context.auth.uid,
      transferUrl: transferUrl,
      amount: data.amount,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { transferUrl, status: 'pending' };
  } catch (error) {
    console.error('Dwolla Initiate Payment Error:', error);
    throw new functions.https.HttpsError('internal', error.body?.message || error.message);
  }
});

// Webhook Handler
exports.dwolla_webhook = functions.https.onRequest(async (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-request-signature-sha-256'];
  // TODO: Implement signature verification

  const eventTopic = req.body.topic;
  console.log(`Dwolla Webhook: ${eventTopic}`);

  // Update Firestore based on event
  switch (eventTopic) {
    case 'transfer_completed':
      // Update payment status
      await admin.firestore()
        .collection('payments')
        .where('transferUrl', '==', req.body._links.resource.href)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            doc.ref.update({ status: 'completed' });
          });
        });
      break;

    case 'transfer_failed':
      // Update payment status and notify user
      await admin.firestore()
        .collection('payments')
        .where('transferUrl', '==', req.body._links.resource.href)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            doc.ref.update({ status: 'failed' });
          });
        });
      break;
  }

  res.status(200).send('OK');
});
```

### Step 4: Deploy Functions

```bash
cd functions
firebase deploy --only functions
```

---

## Testing

### Sandbox Testing Credentials

**Plaid Sandbox:**
- Username: `user_good`
- Password: `pass_good`
- MFA: `1234`

**Dwolla Sandbox:**
- Test bank account:
  - Routing: `222222226`
  - Account: `123456789`
- Test customer SSN: `1234`

### Test Flow

1. **Link Bank Account (Plaid):**
   ```javascript
   import plaidService, { loadPlaidScript, initializePlaidLink } from '@/services/plaidService';

   // Load Plaid script
   await loadPlaidScript();

   // Create link token
   const { linkToken } = await plaidService.createLinkToken({
     userId: currentUser.uid,
     clientUserId: currentUser.email
   });

   // Initialize Plaid Link
   const handler = initializePlaidLink({
     linkToken,
     onSuccess: async (publicToken, metadata) => {
       // Exchange token
       const result = await plaidService.exchangePublicToken(publicToken, currentUser.uid);
       console.log('Plaid connected:', result);
     }
   });

   handler.open();
   ```

2. **Create Dwolla Customer:**
   ```javascript
   import dwollaService from '@/services/dwollaService';

   const customer = await dwollaService.createCustomer({
     firstName: 'John',
     lastName: 'Doe',
     email: 'john@example.com',
     type: 'personal',
     dateOfBirth: '1990-01-01',
     ssn: '1234',  // Last 4 for sandbox
     address: {
       address1: '123 Main St',
       city: 'Austin',
       stateProvinceRegion: 'TX',
       postalCode: '78701',
       country: 'US'
     },
     userId: currentUser.uid
   });
   ```

3. **Link Bank to Dwolla:**
   ```javascript
   const fundingSource = await dwollaService.createFundingSourceWithPlaid({
     customerId: customer.customerUrl,
     plaidToken: processorToken,  // From Plaid exchange
     name: 'Checking Account'
   });
   ```

4. **Process Payment:**
   ```javascript
   const payment = await dwollaService.initiatePayment({
     sourceFundingSourceId: customerFundingSource,
     destinationFundingSourceId: businessFundingSource,
     amount: 99.00,
     memo: 'Credit repair services - Month 1'
   });
   ```

---

## Going to Production

### Checklist

**Plaid:**
- [ ] Complete Plaid compliance questionnaire
- [ ] Submit production access request
- [ ] Wait for approval (typically 1-2 weeks)
- [ ] Update environment variables to use production keys
- [ ] Test with real bank accounts (internal testing)
- [ ] Monitor error rates and user feedback

**Dwolla:**
- [ ] Complete business verification
- [ ] Submit required documents
- [ ] Pass underwriting review
- [ ] Add business bank account
- [ ] Update environment variables to use production keys
- [ ] Process test transactions (small amounts)
- [ ] Monitor for chargebacks and returns

### Environment Variable Updates

```bash
# Update .env
VITE_PLAID_ENV=production
VITE_DWOLLA_ENV=production

# Update functions/.env
PLAID_ENVIRONMENT=production
DWOLLA_ENVIRONMENT=production
```

### Monitoring

1. Set up error tracking (Sentry, Rollbar)
2. Monitor webhook delivery rates
3. Track payment success/failure rates
4. Set up alerts for critical errors
5. Review transaction logs daily

---

## Troubleshooting

### Common Issues

**Plaid Link Not Opening:**
- Verify Plaid script is loaded: Check browser console
- Check link token is valid: Tokens expire after 4 hours
- Verify CORS settings: Ensure domain is allowed

**Token Exchange Failing:**
- Check Firebase Function logs: `firebase functions:log`
- Verify API credentials are correct
- Ensure user is authenticated

**Dwolla Customer Creation Failing:**
- Verify all required fields are provided
- Check address format matches Dwolla requirements
- Ensure SSN format is correct (full 9 digits for production)

**Payment Failing:**
- Verify sufficient funds in source account
- Check funding source is verified
- Ensure amount is within daily/monthly limits

### Support Resources

**Plaid:**
- Documentation: https://plaid.com/docs/
- Support: support@plaid.com
- Status: https://status.plaid.com/

**Dwolla:**
- Documentation: https://docs.dwolla.com/
- Support: https://discuss.dwolla.com/
- Status: https://status.dwolla.com/

---

## Next Steps

1. ✅ Apply for Plaid account
2. ✅ Apply for Dwolla account
3. ⏳ Wait for sandbox access (instant for Plaid, instant for Dwolla sandbox)
4. ⏳ Complete Firebase Functions setup
5. ⏳ Test integration in sandbox
6. ⏳ Apply for production access (both platforms)
7. ⏳ Complete compliance reviews
8. ⏳ Launch to production

---

**Questions?** Contact chris@speedycreditrepair.com
