# Payment Integration Guide - ACH & Zelle
**Bank**: Chase Business Banking
**Methods**: ACH Direct Debit, Zelle, QR Code Payments

---

## Overview

This guide covers setting up automated payment processing for your My Clever CRM using:
1. **ACH** (primary method) - Automated bank transfers
2. **Zelle** (secondary method) - Instant transfers
3. **QR Code** (convenience method) - Venmo, Cash App, payment links

**Goal**: Automate payment collection and verification without using Stripe or credit cards.

---

## 🏦 ACH Payment Integration

### Recommended Solution: Plaid + Dwolla

This is the industry-standard combination for ACH processing with automated verification.

### Why Plaid + Dwolla?

**Plaid** handles:
- Bank account verification
- Secure bank connection
- Account ownership validation
- Micro-deposit verification (if needed)

**Dwolla** handles:
- ACH transaction processing
- Payment clearing verification
- Webhook notifications
- Compliance (NACHA, FinCEN)
- Works with your Chase Business account

### Cost Structure

| Service | Cost | When Charged |
|---------|------|-------------|
| **Plaid** | $0.30 | One-time per customer (bank verification) |
| **Dwolla** | $0.25 | Per ACH transaction |
| **Total** | $0.55 | Per customer + per transaction |

**Example**:
- 100 customers enrolled = $30 (Plaid)
- 100 monthly payments = $25 (Dwolla)
- **Monthly cost: $55 for 100 payments**

---

## 📋 Step-by-Step Setup

### Phase 1: Plaid Setup (Bank Verification)

#### 1. Create Plaid Account

1. **Sign up**: https://dashboard.plaid.com/signup
2. **Company**: Speedy Credit Repair
3. **Use case**: ACH/payments
4. **Expected volume**: [Your estimate]

#### 2. Get API Keys

1. Go to Dashboard → Team Settings → Keys
2. Copy:
   - **Client ID** (looks like: `5f7b8c9d0e1f2a3b4c5d6e7f`)
   - **Secret** (sandbox): `sandbox-abc123...`
   - **Secret** (production): `production-xyz789...`

3. Add to `.env.production`:
   ```env
   VITE_PLAID_CLIENT_ID=your_client_id
   VITE_PLAID_SECRET_SANDBOX=your_sandbox_secret
   VITE_PLAID_SECRET_PRODUCTION=your_production_secret
   VITE_PLAID_ENV=sandbox  # Change to 'production' when live
   ```

#### 3. Enable ACH Product

1. Dashboard → Products
2. Enable "Auth" (for bank authentication)
3. Enable "Balance" (optional, for checking account balances)
4. Submit for production approval (takes 1-2 business days)

#### 4. Implement Plaid Link (Frontend)

Install Plaid:
```bash
npm install react-plaid-link
```

Create Plaid component:
```javascript
// src/components/payments/PlaidLink.jsx
import { usePlaidLink } from 'react-plaid-link';

function PlaidLinkButton({ clientId, onSuccess }) {
  const { open, ready } = usePlaidLink({
    token: linkToken, // Get from your backend
    onSuccess: (public_token, metadata) => {
      // Send public_token to backend to exchange for access_token
      onSuccess(public_token, metadata);
    },
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect Bank Account
    </button>
  );
}
```

#### 5. Backend Integration

Create backend endpoint to generate link token:
```javascript
// Backend: POST /api/plaid/create-link-token
const plaid = require('plaid');

const client = new plaid.PlaidApi(
  new plaid.Configuration({
    basePath: plaid.PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
);

app.post('/api/plaid/create-link-token', async (req, res) => {
  const { clientId, clientName } = req.body;

  const request = {
    user: {
      client_user_id: clientId,
    },
    client_name: 'Speedy Credit Repair',
    products: ['auth'],
    country_codes: ['US'],
    language: 'en',
  };

  const response = await client.linkTokenCreate(request);
  res.json({ link_token: response.data.link_token });
});
```

Exchange public token for access token:
```javascript
// Backend: POST /api/plaid/exchange-token
app.post('/api/plaid/exchange-token', async (req, res) => {
  const { public_token, clientId } = req.body;

  // Exchange public token for access token
  const response = await client.itemPublicTokenExchange({
    public_token,
  });

  const { access_token, item_id } = response.data;

  // Get account details
  const authResponse = await client.authGet({
    access_token,
  });

  const account = authResponse.data.accounts[0];
  const numbers = authResponse.data.numbers.ach[0];

  // Store in Firestore
  await db.collection('clients').doc(clientId).update({
    plaidAccessToken: access_token,
    plaidItemId: item_id,
    bankAccount: {
      accountId: account.account_id,
      name: account.name,
      mask: account.mask,
      type: account.type,
      subtype: account.subtype,
      routing: numbers.routing,
      account: numbers.account,
      wireRouting: numbers.wire_routing,
    },
    bankVerified: true,
    bankVerifiedAt: new Date(),
  });

  res.json({ success: true });
});
```

---

### Phase 2: Dwolla Setup (ACH Processing)

#### 1. Create Dwolla Account

1. **Sign up**: https://www.dwolla.com/get-started
2. **Account type**: Business
3. **Business name**: Speedy Credit Repair
4. **Use case**: Credit repair payments
5. **Expected volume**: [Your estimate]

#### 2. Verification Process

Dwolla requires business verification:
- EIN (Employer Identification Number)
- Business address
- Beneficial owners (if applicable)
- Bank account info

**Timeline**: 1-3 business days for approval

#### 3. Get API Keys

1. Dashboard → Applications → Create new application
2. Name: "My Clever CRM"
3. Copy:
   - **Key** (sandbox): `sandbox-abc123...`
   - **Secret** (sandbox): `sandbox-secret-xyz...`
   - **Key** (production): `production-abc123...`
   - **Secret** (production): `production-secret-xyz...`

4. Add to `.env.production`:
   ```env
   VITE_DWOLLA_KEY_SANDBOX=your_sandbox_key
   VITE_DWOLLA_SECRET_SANDBOX=your_sandbox_secret
   VITE_DWOLLA_KEY_PRODUCTION=your_production_key
   VITE_DWOLLA_SECRET_PRODUCTION=your_production_secret
   VITE_DWOLLA_ENV=sandbox  # Change to 'production' when live
   ```

#### 4. Connect Your Chase Business Account

1. Dwolla Dashboard → Funding Sources
2. Add Funding Source
3. Verify via micro-deposits (Dwolla sends 2 small deposits to your Chase account)
4. Enter deposit amounts to verify (1-2 business days)

**Your Chase Account becomes the "master" funding source**

#### 5. Implement Dwolla Integration

Install Dwolla SDK:
```bash
npm install dwolla-v2
```

Backend integration:
```javascript
// Backend setup
const dwolla = require('dwolla-v2');

const client = new dwolla.Client({
  key: process.env.DWOLLA_KEY,
  secret: process.env.DWOLLA_SECRET,
  environment: 'sandbox', // or 'production'
});

// Create Dwolla customer for your client
app.post('/api/dwolla/create-customer', async (req, res) => {
  const { clientId, firstName, lastName, email } = req.body;

  const customer = await client.post('customers', {
    firstName,
    lastName,
    email,
    type: 'receive-only', // They can only receive refunds
    // OR type: 'unverified' for lower limits
  });

  // Store Dwolla customer URL in Firestore
  await db.collection('clients').doc(clientId).update({
    dwollaCustomerUrl: customer.headers.get('location'),
  });

  res.json({ success: true, dwollaCustomerUrl: customer.headers.get('location') });
});

// Add client's bank account to Dwolla
app.post('/api/dwolla/add-funding-source', async (req, res) => {
  const { clientId, routingNumber, accountNumber, accountType, name } = req.body;

  // Get client's Dwolla customer URL
  const clientDoc = await db.collection('clients').doc(clientId).get();
  const { dwollaCustomerUrl } = clientDoc.data();

  // Add funding source
  const fundingSource = await client.post(`${dwollaCustomerUrl}/funding-sources`, {
    routingNumber,
    accountNumber,
    bankAccountType: accountType, // 'checking' or 'savings'
    name,
  });

  const fundingSourceUrl = fundingSource.headers.get('location');

  // Initiate micro-deposit verification (optional, depends on Dwolla config)
  await client.post(`${fundingSourceUrl}/micro-deposits`);

  res.json({
    success: true,
    fundingSourceUrl,
    verificationNeeded: true
  });
});

// Process ACH payment
app.post('/api/dwolla/create-transfer', async (req, res) => {
  const { clientId, amount, description } = req.body;

  // Get client's funding source and your master funding source
  const clientDoc = await db.collection('clients').doc(clientId).get();
  const clientData = clientDoc.data();

  const transfer = await client.post('transfers', {
    _links: {
      source: {
        href: clientData.dwollaFundingSourceUrl, // Client's bank
      },
      destination: {
        href: process.env.DWOLLA_MASTER_FUNDING_SOURCE_URL, // Your Chase account
      },
    },
    amount: {
      currency: 'USD',
      value: amount.toFixed(2),
    },
    metadata: {
      clientId,
      invoiceId: req.body.invoiceId,
    },
    clearing: {
      destination: 'next-available',
    },
  });

  const transferUrl = transfer.headers.get('location');

  // Store transfer in Firestore
  await db.collection('payments').add({
    clientId,
    amount,
    description,
    method: 'ACH',
    status: 'pending',
    dwollaTransferUrl: transferUrl,
    createdAt: new Date(),
  });

  res.json({
    success: true,
    transferUrl,
    status: 'pending'
  });
});
```

#### 6. Set Up Webhooks

Dwolla sends real-time updates via webhooks when ACH payments clear or fail.

1. **Dwolla Dashboard** → Webhooks
2. **Add webhook URL**: `https://yourdomain.com/api/webhooks/dwolla`
3. **Select events**:
   - `transfer_created`
   - `transfer_completed`
   - `transfer_failed`
   - `transfer_cancelled`
   - `customer_funding_source_added`
   - `customer_funding_source_verified`

4. **Implement webhook handler**:
```javascript
// Backend: POST /api/webhooks/dwolla
app.post('/api/webhooks/dwolla', async (req, res) => {
  const event = req.body;

  console.log('Dwolla webhook received:', event);

  switch (event.topic) {
    case 'transfer_completed':
      // ACH payment cleared!
      await handlePaymentCompleted(event);
      break;

    case 'transfer_failed':
      // ACH payment failed
      await handlePaymentFailed(event);
      break;

    case 'customer_funding_source_verified':
      // Customer's bank account verified
      await handleBankVerified(event);
      break;
  }

  res.status(200).send('OK');
});

async function handlePaymentCompleted(event) {
  const transferUrl = event._links.resource.href;

  // Find payment in database
  const paymentsRef = db.collection('payments');
  const snapshot = await paymentsRef.where('dwollaTransferUrl', '==', transferUrl).get();

  if (snapshot.empty) return;

  const paymentDoc = snapshot.docs[0];
  const paymentData = paymentDoc.data();

  // Update payment status
  await paymentDoc.ref.update({
    status: 'completed',
    completedAt: new Date(),
  });

  // Update client invoice
  await db.collection('invoices').doc(paymentData.invoiceId).update({
    status: 'paid',
    paidAt: new Date(),
  });

  // Send success notification
  await sendPaymentSuccess(
    paymentData.clientName,
    paymentData.amount,
    'ACH',
    {
      clientId: paymentData.clientId,
      invoiceId: paymentData.invoiceId,
    }
  );

  // Log activity
  await db.collection('activityLog').add({
    type: 'payment_completed',
    clientId: paymentData.clientId,
    amount: paymentData.amount,
    method: 'ACH',
    timestamp: new Date(),
  });
}

async function handlePaymentFailed(event) {
  const transferUrl = event._links.resource.href;
  const failure = event._embedded?.['fail-reason'];

  // Find payment in database
  const paymentsRef = db.collection('payments');
  const snapshot = await paymentsRef.where('dwollaTransferUrl', '==', transferUrl).get();

  if (snapshot.empty) return;

  const paymentDoc = snapshot.docs[0];
  const paymentData = paymentDoc.data();

  // Update payment status
  await paymentDoc.ref.update({
    status: 'failed',
    failureReason: failure?.description || 'Unknown error',
    failedAt: new Date(),
  });

  // Send failure notification
  await sendPaymentFailed(
    paymentData.clientName,
    paymentData.amount,
    failure?.description || 'Payment processing failed',
    {
      clientId: paymentData.clientId,
      invoiceId: paymentData.invoiceId,
    }
  );

  // Create follow-up task
  await db.collection('tasks').add({
    title: `Payment Failed: ${paymentData.clientName}`,
    description: `ACH payment of $${paymentData.amount} failed. Reason: ${failure?.description}`,
    assignedTo: 'admin',
    dueDate: new Date(),
    priority: 'high',
    clientId: paymentData.clientId,
  });
}
```

---

## 💸 Zelle Integration

### Chase QuickPay with Zelle

**Note**: Zelle doesn't have a public API for businesses. Integration options:

### Option A: Manual Tracking (Recommended for Now)

1. **Receive Zelle payments** to your Chase Business account
2. **Manual verification** in Chase online banking
3. **Record in CRM** via admin interface

**Workflow**:
```
1. Client sends Zelle → your-email@speedycreditrepair.com or (phone)
2. Payment appears in Chase Business account
3. You verify in Chase online banking
4. You mark invoice as paid in CRM
5. CRM sends confirmation to client
```

**Implementation in BillingHub**:
```javascript
// Add manual Zelle verification button
<Button onClick={() => setShowZelleVerification(true)}>
  Verify Zelle Payment
</Button>

// Verification modal
<Dialog open={showZelleVerification}>
  <DialogTitle>Verify Zelle Payment</DialogTitle>
  <DialogContent>
    <TextField
      label="Zelle Reference Number"
      value={zelleRef}
      onChange={(e) => setZelleRef(e.target.value)}
    />
    <TextField
      label="Amount Received"
      type="number"
      value={zelleAmount}
      onChange={(e) => setZelleAmount(e.target.value)}
    />
    <TextField
      label="Sender Name"
      value={zelleSender}
      onChange={(e) => setZelleSender(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleZelleVerification}>
      Confirm Payment Received
    </Button>
  </DialogActions>
</Dialog>
```

### Option B: Chase Commercial Banking API (For Future)

1. Contact Chase Business Banking
2. Ask about "Chase for Business API"
3. May require:
   - Minimum balance requirements
   - Business account tier upgrade
   - Developer certification

**Cost**: Varies, typically requires Premium Business account ($95/month+)

### Option C: Early Warning Services (Zelle's Parent)

Contact for business API access:
- Website: https://www.earlywarning.com
- Typically for high-volume businesses ($10k+ monthly)

---

## 📱 QR Code Payment Integration

### Option 1: Venmo QR Code

**Setup**:
1. Create Venmo Business account
2. Generate QR code in app
3. Upload to CRM: `public/payment-qr/venmo.png`

**Display in Client Portal**:
```javascript
// src/components/payments/VenmoQR.jsx
import venmoQR from '@/public/payment-qr/venmo.png';

function VenmoPayment({ amount, invoiceId }) {
  return (
    <div className="payment-method">
      <h3>Pay with Venmo</h3>
      <img src={venmoQR} alt="Venmo QR Code" />
      <p>Scan to pay ${amount}</p>
      <p className="text-xs">Reference: INV-{invoiceId}</p>
    </div>
  );
}
```

**Cost**:
- Personal: Free
- Business: 1.9% + $0.10 per transaction

---

### Option 2: Cash App QR Code

**Setup**:
1. Create Cash App Business account
2. Generate $cashtag QR
3. Upload to CRM: `public/payment-qr/cashapp.png`

**Cost**:
- Personal: Free
- Business: 2.75% per transaction

---

### Option 3: Custom Payment Link QR

Generate QR that links to your custom payment page:

```javascript
// Generate QR code using qrcode library
import QRCode from 'qrcode';

async function generatePaymentQR(invoiceId, amount) {
  const paymentUrl = `https://speedycreditrepair.com/pay/${invoiceId}?amount=${amount}`;

  const qrCode = await QRCode.toDataURL(paymentUrl);

  return qrCode; // Data URL for <img src={qrCode} />
}
```

**Payment page shows**:
- Invoice details
- Amount due
- Payment options: Zelle, Venmo, Cash App instructions
- Unique reference code

---

## 🔄 Complete Payment Workflow

### For ACH Payments:

```
1. Client clicks "Pay with Bank Account" in client portal
2. Plaid Link opens → client selects bank → logs in
3. Plaid verifies bank account
4. Backend stores bank details (encrypted)
5. Client authorizes ACH debit
6. Dwolla initiates transfer
7. Status: "Payment Processing" (1-3 business days)
8. Dwolla webhook: payment cleared
9. CRM updates invoice to "Paid"
10. Client gets notification: "Payment received!"
```

### For Zelle Payments:

```
1. Client clicks "Pay with Zelle"
2. Shows your Zelle email/phone
3. Shows invoice reference number
4. Client sends via their bank's Zelle
5. You check Chase online banking
6. You verify payment in CRM
7. CRM marks invoice as paid
8. Client gets notification: "Payment verified!"
```

### For QR Code Payments:

```
1. Client clicks "Pay with QR Code"
2. Shows QR code + invoice reference
3. Client scans with Venmo/Cash App
4. Client sends payment
5. You verify in Venmo/Cash App
6. You mark paid in CRM
7. Client gets notification
```

---

## 💻 Implementation Checklist

### Phase 1: Setup (Week 1)
- [ ] Create Plaid account
- [ ] Create Dwolla account
- [ ] Connect Chase Business account to Dwolla
- [ ] Get all API keys
- [ ] Add to environment variables

### Phase 2: Development (Week 2-3)
- [ ] Install Plaid SDK
- [ ] Implement Plaid Link component
- [ ] Create backend Plaid endpoints
- [ ] Install Dwolla SDK
- [ ] Create backend Dwolla endpoints
- [ ] Implement webhook handler
- [ ] Add payment methods to BillingHub

### Phase 3: Testing (Week 4)
- [ ] Test in Plaid sandbox
- [ ] Test in Dwolla sandbox
- [ ] Test ACH payment flow end-to-end
- [ ] Test webhook notifications
- [ ] Test Zelle manual verification
- [ ] Test QR code display

### Phase 4: Go Live (Week 5)
- [ ] Submit Plaid for production approval
- [ ] Submit Dwolla for production approval
- [ ] Switch to production API keys
- [ ] Process first real ACH payment
- [ ] Monitor for issues
- [ ] Document any problems

---

## 📊 Reporting & Reconciliation

### Daily Reconciliation

Create automated report:
- ACH payments pending (awaiting clearing)
- ACH payments completed (last 24 hours)
- Zelle payments to verify
- QR code payments to verify

### Monthly Reconciliation

Compare:
- CRM payment records
- Chase Business account statement
- Dwolla transaction history
- Invoice statuses

Create reconciliation report showing any discrepancies.

---

## 🔒 Security & Compliance

### PCI Compliance
✅ **Not needed** - You're not processing credit cards

### NACHA Compliance
✅ **Handled by Dwolla** - They ensure ACH compliance

### Data Security
- Encrypt bank account numbers in database
- Use Plaid/Dwolla encrypted storage when possible
- Never log full account numbers
- Use SSL/TLS for all API calls
- Store API keys in Firebase secrets

### Customer Authorization
- Get explicit authorization for ACH debits
- Provide clear payment terms
- Allow customers to revoke ACH authorization
- Keep authorization records for 7 years

---

## 💰 Cost Summary

| Service | Setup Cost | Per Transaction | Monthly Base |
|---------|-----------|-----------------|--------------|
| **Plaid** | Free | $0.30 (one-time) | $0 |
| **Dwolla** | Free | $0.25 | $0 |
| **Venmo Business** | Free | 1.9% + $0.10 | $0 |
| **Cash App Business** | Free | 2.75% | $0 |
| **Zelle** | Free | Free | Free |

**Example Monthly Cost** (100 payments):
- 80 ACH payments: $20 (Dwolla)
- 10 Zelle payments: $0
- 10 QR payments: ~$5-10 (Venmo/Cash App fees)
- **Total: ~$25-30/month**

**Compare to Stripe**:
- 100 x $299 = $29,900 volume
- Stripe fees: ~$897 (2.9% + $0.30)
- **Savings: ~$870/month** 🎉

---

## 📞 Support Contacts

### Plaid Support
- Dashboard: https://dashboard.plaid.com
- Docs: https://plaid.com/docs
- Support: support@plaid.com

### Dwolla Support
- Dashboard: https://dashboard.dwolla.com
- Docs: https://developers.dwolla.com
- Support: support@dwolla.com

### Chase Business Banking
- Phone: 1-800-CHASE-BIZ (1-800-242-7324)
- Online: https://www.chase.com/business

---

**Last Updated**: November 11, 2025
**Version**: 1.0
