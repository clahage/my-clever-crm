# 📧 SpeedyCRM Communications System - Complete Setup Guide

**Last Updated:** October 19, 2025  
**Author:** Claude (SpeedyCRM Team)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Environment Variables](#environment-variables)
4. [Google Workspace Setup](#google-workspace-setup)
5. [SendGrid Configuration](#sendgrid-configuration)
6. [Gmail API Setup](#gmail-api-setup)
7. [Telnyx Fax Setup](#telnyx-fax-setup)
8. [Firebase Functions Deployment](#firebase-functions-deployment)
9. [Frontend Integration](#frontend-integration)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The SpeedyCRM Communications System provides a unified platform for:
- ✅ Email communication (SendGrid + Gmail API)
- ✅ Fax transmission (Telnyx)
- ✅ AI-powered auto-responses (OpenAI GPT-4)
- ✅ Ticket management
- ✅ Real-time monitoring

---

## 📁 File Structure

```
/src/
├── services/
│   ├── emailService.js (493 lines) ✅
│   ├── faxService.js (433 lines) ✅
│   └── communicationService.js (650 lines) ✅
│
├── components/
│   └── client/
│       └── CommunicationButtons.jsx (450 lines) ✅
│
└── pages/
    └── CommunicationsCenter.jsx (580 lines) ✅

/functions/
└── emailMonitor.js (450 lines) ✅
```

---

## 🔐 Environment Variables

### `.env` File (Root Directory)

```bash
# OpenAI (AI Features)
VITE_OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# SendGrid (Email Sending)
VITE_SENDGRID_API_KEY=SG.YOUR_KEY_HERE
VITE_SENDGRID_FROM_EMAIL=noreply@speedycreditrepair.com

# Gmail API (Email Receiving)
VITE_GMAIL_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
VITE_GMAIL_CLIENT_SECRET=YOUR_CLIENT_SECRET
VITE_GMAIL_REFRESH_TOKEN=YOUR_REFRESH_TOKEN

# Telnyx (Fax)
VITE_TELNYX_API_KEY=YOUR_TELNYX_KEY
VITE_TELNYX_PHONE_NUMBER=+1234567890
```

### Firebase Functions Config

```bash
# Set Firebase Functions environment variables
firebase functions:config:set openai.key="sk-proj-YOUR_KEY"
firebase functions:config:set sendgrid.key="SG.YOUR_KEY"
firebase functions:config:set gmail.client_id="YOUR_CLIENT_ID"
firebase functions:config:set gmail.client_secret="YOUR_SECRET"
firebase functions:config:set gmail.refresh_token="YOUR_TOKEN"
```

---

## 🏢 Google Workspace Setup

### 1. Create Email Aliases (FREE)

**Login to:** [admin.google.com](https://admin.google.com)

**Navigate to:** Users → chris@speedycreditrepair.com → User information → Email aliases

**Add these aliases:**
- urgent@speedycreditrepair.com
- support@speedycreditrepair.com
- billing@speedycreditrepair.com
- disputes@speedycreditrepair.com
- feedback@speedycreditrepair.com
- noreply@speedycreditrepair.com

**Cost:** $0 (unlimited aliases included in Google Workspace)

---

## 📧 SendGrid Configuration

### 1. Sign Up / Login
- Go to: [sendgrid.com](https://sendgrid.com)
- Free tier: 100 emails/day (perfect for testing)

### 2. Create API Key
1. Settings → API Keys
2. Create API Key → "SpeedyCRM Mail"
3. Full Access permissions
4. Copy key to `.env` as `VITE_SENDGRID_API_KEY`

### 3. Verify Domain
1. Settings → Sender Authentication
2. Authenticate Your Domain → speedycreditrepair.com
3. Add DNS records to your domain:
   ```
   TXT: v=spf1 include:sendgrid.net ~all
   CNAME: em1234.speedycreditrepair.com → u1234.wl.sendgrid.net
   CNAME: s1._domainkey.speedycreditrepair.com → s1.domainkey.u1234.wl.sendgrid.net
   CNAME: s2._domainkey.speedycreditrepair.com → s2.domainkey.u1234.wl.sendgrid.net
   ```
4. Verify (takes 24-48 hours)

### 4. Set From Address
- Use: `noreply@speedycreditrepair.com`
- Set Reply-To: `support@speedycreditrepair.com`

---

## 🔧 Gmail API Setup

### 1. Enable Gmail API
1. Go to: [console.cloud.google.com](https://console.cloud.google.com)
2. Select project: `my-clever-crm`
3. APIs & Services → Enable APIs → Search "Gmail API" → Enable

### 2. Create OAuth 2.0 Credentials
1. APIs & Services → Credentials
2. Create Credentials → OAuth client ID
3. Application type: Web application
4. Name: "SpeedyCRM Gmail Monitor"
5. Authorized redirect URIs:
   - `https://developers.google.com/oauthplayground`
   - `http://localhost:5173/auth/callback`
6. Save Client ID and Client Secret

### 3. Get Refresh Token
1. Go to: [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click gear icon → Check "Use your own OAuth credentials"
3. Enter your Client ID and Secret
4. Step 1: Select Gmail API v1 → `https://www.googleapis.com/auth/gmail.modify`
5. Authorize APIs
6. Step 2: Exchange authorization code for tokens
7. Copy Refresh Token → Save to `.env`

### 4. Test Connection
```bash
# Test Gmail API
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://gmail.googleapis.com/gmail/v1/users/me/messages
```

---

## 📠 Telnyx Fax Setup

### 1. Sign Up
- Go to: [telnyx.com](https://telnyx.com)
- Create account

### 2. Get Phone Number
1. Numbers → Buy a Number
2. Search for fax-capable number
3. Purchase ($1-5/month)

### 3. Create API Key
1. API Keys → Create API Key
2. Name: "SpeedyCRM Fax"
3. Copy key to `.env`

### 4. Configure Webhooks
1. Messaging → Fax Applications → Create
2. Name: "SpeedyCRM"
3. Webhook URL: `https://us-central1-my-clever-crm.cloudfunctions.net/faxWebhook`
4. Events: All fax events
5. Assign phone number to application

### 5. Test Fax
```javascript
// Test in browser console
await faxService.sendFax({
  to: '+18883973742', // Experian test number
  documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
});
```

---

## 🚀 Firebase Functions Deployment

### 1. Install Dependencies
```bash
cd functions
npm install googleapis @sendgrid/mail openai
```

### 2. Deploy Email Monitor
```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:monitorInbox
```

### 3. Verify Deployment
```bash
# Check function logs
firebase functions:log --only monitorInbox

# Manual trigger (for testing)
curl https://us-central1-my-clever-crm.cloudfunctions.net/triggerEmailMonitor
```

### 4. Schedule Configuration
The email monitor runs every 2 minutes automatically via Cloud Scheduler.

**To change frequency:**
```javascript
// In emailMonitor.js, change:
.schedule('every 2 minutes') // to 'every 5 minutes', '*/10 * * * *', etc.
```

---

## 🎨 Frontend Integration

### 1. Add Communication Buttons to Client Portal

```javascript
// src/pages/ClientPortal.jsx

import CommunicationButtons from '@/components/client/CommunicationButtons';

// Inside your component:
<Box sx={{ mt: 4 }}>
  <Typography variant="h6" gutterBottom>
    Need Help?
  </Typography>
  <CommunicationButtons
    clientId={user.uid}
    clientEmail={user.email}
    clientName={user.displayName}
    layout="grid" // or 'list', 'compact'
    showDescriptions={true}
  />
</Box>
```

### 2. Add Communications Center to Navigation

```javascript
// src/layout/navConfig.js

{
  id: 'communications',
  label: 'Communications',
  icon: 'MessageSquare',
  path: '/communications',
  roles: ['admin', 'user']
}
```

### 3. Add Route to App.jsx

```javascript
// src/App.jsx

import CommunicationsCenter from '@/pages/CommunicationsCenter';

// In your routes:
<Route path="/communications" element={<CommunicationsCenter />} />
```

---

## 🧪 Testing

### 1. Test Email Sending
```javascript
// In browser console or test file
import emailService from '@/services/emailService';

await emailService.sendEmail({
  to: 'your-email@gmail.com',
  subject: 'Test Email',
  html: '<h1>Hello!</h1><p>This is a test.</p>'
});
```

### 2. Test AI Auto-Response
1. Send email to: support@speedycreditrepair.com
2. Subject: "What is my credit score?"
3. Wait 2 minutes for monitor to run
4. Check inbox for AI response

### 3. Test Urgent Alert
1. Send email to: urgent@speedycreditrepair.com
2. Wait 2 minutes
3. Check chris@speedycreditrepair.com for alert email

### 4. Test Fax
```javascript
await faxService.sendFaxToBureau('experian', documentUrl, {
  clientId: 'test123',
  clientName: 'Test Client'
});
```

### 5. Test Communication Buttons
1. Login as client
2. Go to Client Portal
3. Click "Ask a Question" button
4. Send test message
5. Check Firestore for communication record

---

## 🔧 Troubleshooting

### Gmail API Errors

**Error:** "Invalid credentials"
```bash
# Regenerate refresh token at OAuth Playground
# Update Firebase config
firebase functions:config:set gmail.refresh_token="NEW_TOKEN"
firebase deploy --only functions
```

**Error:** "Insufficient Permission"
```bash
# Add Gmail API scopes in OAuth consent screen
# Re-authorize at OAuth Playground
```

### SendGrid Errors

**Error:** "Domain not verified"
```bash
# Check DNS records
dig TXT speedycreditrepair.com
dig CNAME em1234.speedycreditrepair.com

# Wait 24-48 hours for propagation
```

**Error:** "Daily send quota exceeded"
```bash
# Upgrade SendGrid plan or wait until next day
# Free tier: 100 emails/day
```

### Telnyx Errors

**Error:** "Invalid phone number format"
```bash
# Use E.164 format: +1234567890
# NOT: (123) 456-7890 or 123-456-7890
```

**Error:** "Fax failed - busy signal"
```bash
# Telnyx will auto-retry 3 times
# Check status with: faxService.getFaxStatus(faxId)
```

### Firebase Functions Errors

**Error:** "Function execution timed out"
```bash
# Increase timeout in firebase.json
{
  "functions": {
    "timeout": 540 // 9 minutes (max)
  }
}
```

**Error:** "Module not found"
```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 📊 Monitoring & Analytics

### View Communication Stats
```javascript
const stats = await communicationService.getCommunicationStats();
console.log('Total communications:', stats.total);
console.log('Auto-responded:', stats.autoResponded);
console.log('AI success rate:', (stats.autoResponded / stats.total * 100).toFixed(1) + '%');
```

### View Real-Time Communications
- Admin Dashboard → Communications Center
- Filter by department, priority, status
- View AI analysis for each message

### Monitor Function Logs
```bash
# View all logs
firebase functions:log

# View specific function
firebase functions:log --only monitorInbox

# Follow logs in real-time
firebase functions:log --only monitorInbox --follow
```

---

## 🎯 Next Steps

1. ✅ Complete all setups above
2. ✅ Test each component individually
3. ✅ Test end-to-end workflow
4. ✅ Train AI with more examples
5. ✅ Add custom email templates
6. ✅ Configure auto-response rules
7. ✅ Set up analytics dashboards
8. ✅ Train staff on system

---

## 📞 Support

**Questions?** Contact:
- Email: chris@speedycreditrepair.com
- System Owner: Chris Lahage

**Documentation:**
- This guide: `/docs/COMMUNICATIONS_SETUP_GUIDE.md`
- Master Blueprint: See project checklist

---

## ✅ Checklist

- [ ] Google Workspace aliases created
- [ ] SendGrid API key obtained
- [ ] SendGrid domain verified
- [ ] Gmail API enabled
- [ ] Gmail OAuth credentials created
- [ ] Gmail refresh token obtained
- [ ] Telnyx account created
- [ ] Telnyx phone number purchased
- [ ] Telnyx API key obtained
- [ ] Firebase functions deployed
- [ ] Email monitor tested
- [ ] AI auto-response tested
- [ ] Fax service tested
- [ ] Communication buttons added to portal
- [ ] Communications center added to navigation
- [ ] All tests passing

---

**🎉 Once all items checked, your communication system is fully operational!**