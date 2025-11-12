# Email Prefix Notification System - Setup Guide
**Domain**: @speedycreditrepair.com (Google Workspace)

---

## Overview

Since Twilio doesn't allow credit repair companies to use SMS services, we've implemented a clever workaround using **email prefixes** to trigger mobile app notifications.

**How It Works**:
1. System sends emails to specific prefix addresses (e.g., `urgent@speedycreditrepair.com`)
2. Mobile app monitors these email addresses
3. When email arrives, mobile app triggers appropriate notification
4. Different prefixes = different notification types, priorities, sounds

---

## 📧 Email Prefixes Configured

### CRITICAL ALERTS

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `urgent` | urgent@speedycreditrepair.com | Critical | System errors, payment failures, security alerts |

### DISPUTE MANAGEMENT

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `disputes` | disputes@speedycreditrepair.com | High | Bureau responses, dispute updates, items deleted |
| `dispute-fax` | dispute-fax@speedycreditrepair.com | High | TELNYX fax confirmations |

### CREDIT REPORTS

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `reports` | reports@speedycreditrepair.com | High | New credit reports, score changes |
| `monitoring` | monitoring@speedycreditrepair.com | Medium | New inquiries, account changes |

### PAYMENTS & BILLING

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `payments` | payments@speedycreditrepair.com | High | ACH cleared, Zelle received, successful payments |
| `payment-pending` | payment-pending@speedycreditrepair.com | Medium | ACH processing, payment verification |
| `payment-failed` | payment-failed@speedycreditrepair.com | Critical | Failed payments, insufficient funds |
| `billing` | billing@speedycreditrepair.com | Medium | Invoice reminders, payment due |

### CLIENT COMMUNICATIONS

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `messages` | messages@speedycreditrepair.com | Medium | New client messages, chat messages |
| `documents` | documents@speedycreditrepair.com | Medium | Document uploads, signature requests |

### TASKS & REMINDERS

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `tasks` | tasks@speedycreditrepair.com | Medium | Task due, overdue tasks |
| `appointments` | appointments@speedycreditrepair.com | High | Appointment reminders |

### AFFILIATE PROGRAM

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `affiliates` | affiliates@speedycreditrepair.com | Medium | New referrals, commissions |
| `referrals` | referrals@speedycreditrepair.com | Medium | Referral bonuses, rewards |

### SYSTEM & ADMIN

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `system` | system@speedycreditrepair.com | Low | System updates, maintenance |
| `admin` | admin@speedycreditrepair.com | High | Admin alerts, security events |
| `team` | team@speedycreditrepair.com | Low | Team collaboration |

### MARKETING

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `campaigns` | campaigns@speedycreditrepair.com | Low | Campaign performance |

### GENERAL & SUPPORT

| Prefix | Email Address | Priority | Use Case |
|--------|--------------|----------|----------|
| `notifications` | notifications@speedycreditrepair.com | Low | General notifications |
| `support` | support@speedycreditrepair.com | Medium | Support tickets |

---

## 🔧 Google Workspace Setup Instructions

### Step 1: Create Email Aliases

1. **Log into Google Admin Console**
   - Go to: https://admin.google.com
   - Sign in with your admin account

2. **Navigate to Users**
   - Click "Users" in the left sidebar

3. **Select Your User Account**
   - Click on your account (or create a dedicated notifications account)

4. **Add Email Aliases**
   - Click "User information" → "Email aliases"
   - Click "ADD AN ALIAS"
   - Add each prefix from the list above:
     ```
     urgent
     disputes
     dispute-fax
     reports
     monitoring
     payments
     payment-pending
     payment-failed
     billing
     messages
     documents
     tasks
     appointments
     affiliates
     referrals
     system
     admin
     team
     campaigns
     notifications
     support
     ```

5. **Save Changes**

**Alternative Method** (if you want separate inboxes):
- Create separate user accounts for each category
- More organized but costs more (each user = additional license)

### Step 2: Set Up Email Forwarding (Optional)

If you want all notifications in one place:

1. **Create Filters**
   - Gmail → Settings → See all settings → Filters and Blocked Addresses

2. **Create Filter for Each Prefix**
   Example for `urgent@speedycreditrepair.com`:
   - To: urgent@speedycreditrepair.com
   - → Apply label: "Urgent Notifications"
   - → Star it
   - → Mark as important

3. **Repeat for All Prefixes**

### Step 3: Enable Gmail API (For Mobile App)

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com

2. **Select Your Project**
   - Or create new project for "Speedy Credit Repair CRM"

3. **Enable Gmail API**
   - APIs & Services → Library
   - Search "Gmail API"
   - Click "Enable"

4. **Create Service Account**
   - APIs & Services → Credentials
   - Create Credentials → Service Account
   - Name: "CRM Mobile App Notifications"
   - Role: "Gmail API User"

5. **Download JSON Key**
   - Click on service account
   - Keys → Add Key → Create new key → JSON
   - Save this file securely

6. **Domain-Wide Delegation**
   - Enable domain-wide delegation for the service account
   - Add to Google Workspace (Admin Console → Security → API Controls)

---

## 📱 Mobile App Integration

### How the Mobile App Uses This System

```javascript
// In your React Native mobile app

import { startNotificationMonitoring } from '@/services/emailNotificationService';

// Start monitoring when app launches
const notificationController = startNotificationMonitoring(
  (notification) => {
    // Handle incoming notification
    console.log('New notification:', notification);

    // Show in-app notification
    showInAppNotification({
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      color: notification.color,
      sound: notification.sound,
      vibration: notification.vibrationPattern,
      onPress: () => {
        // Navigate to relevant screen
        navigation.navigate(notification.route);
      }
    });

    // Track analytics
    trackNotificationDelivered(notification.id);
  },
  30000 // Poll every 30 seconds
);

// Stop monitoring when app closes
// notificationController.stop();
```

### Configuration Files Created

1. **`/src/config/emailPrefixConfig.js`**
   - All email prefix definitions
   - Priority levels
   - Colors, sounds, vibration patterns
   - Helper functions

2. **`/src/services/emailNotificationService.js`**
   - Email monitoring service
   - Notification sending functions
   - Mobile app integration
   - Analytics tracking

---

## 🎨 Notification Types & Behaviors

### Critical Priority
- **Color**: Red (#EF4444)
- **Sound**: Urgent alert (loud)
- **Vibration**: Strong (3 pulses)
- **Timeout**: Never auto-dismisses
- **Requires**: User action
- **Examples**: Payment failures, security alerts

### High Priority
- **Color**: Amber (#F59E0B)
- **Sound**: Standard notification
- **Vibration**: Medium (2 pulses)
- **Timeout**: 30 seconds
- **Examples**: Dispute updates, credit reports, payments

### Medium Priority
- **Color**: Blue (#3B82F6)
- **Sound**: Standard notification
- **Vibration**: Light (1 pulse)
- **Timeout**: 10 seconds
- **Examples**: Messages, documents, tasks

### Low Priority
- **Color**: Gray (#6B7280)
- **Sound**: Soft notification
- **Vibration**: None
- **Timeout**: 5 seconds
- **Examples**: System updates, general notifications

---

## 💻 Backend API Requirements

You'll need to create these backend API endpoints:

### 1. Poll Email Endpoint
**Route**: `POST /api/email/poll`

**Request**:
```json
{
  "lastCheck": "2025-11-11T10:30:00Z",
  "monitoredEmails": ["urgent@speedycreditrepair.com", ...]
}
```

**Response**:
```json
{
  "emails": [
    {
      "id": "msg_123",
      "to": "urgent@speedycreditrepair.com",
      "from": "system@speedycreditrepair.com",
      "subject": "Payment Failed",
      "body": "ACH payment of $299 failed for John Doe",
      "timestamp": "2025-11-11T10:35:00Z"
    }
  ]
}
```

**Implementation** (Node.js example):
```javascript
const { google } = require('googleapis');

app.post('/api/email/poll', async (req, res) => {
  const { lastCheck, monitoredEmails } = req.body;

  // Initialize Gmail API
  const gmail = google.gmail({ version: 'v1', auth });

  const emails = [];

  for (const email of monitoredEmails) {
    // Query for new emails to this address since lastCheck
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `to:${email} after:${new Date(lastCheck).getTime() / 1000}`
    });

    if (response.data.messages) {
      for (const message of response.data.messages) {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });

        emails.push({
          id: message.id,
          to: email,
          from: getHeader(fullMessage, 'From'),
          subject: getHeader(fullMessage, 'Subject'),
          body: getBody(fullMessage),
          timestamp: new Date(parseInt(fullMessage.data.internalDate)).toISOString()
        });
      }
    }
  }

  res.json({ emails });
});
```

### 2. Send Notification Endpoint
**Route**: `POST /api/email/send-notification`

**Request**:
```json
{
  "to": "urgent@speedycreditrepair.com",
  "from": "system@speedycreditrepair.com",
  "subject": "Payment Failed",
  "body": "ACH payment failed",
  "priority": "critical",
  "metadata": { "clientId": "123" }
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_456"
}
```

---

## 🔔 Usage Examples

### Send Payment Success Notification
```javascript
import { sendPaymentSuccess } from '@/services/emailNotificationService';

// When ACH payment clears
await sendPaymentSuccess(
  'John Doe',
  299.00,
  'ACH',
  {
    clientId: 'client_123',
    transactionId: 'txn_456',
    accountLast4: '1234'
  }
);
```

### Send Dispute Update
```javascript
import { sendDisputeUpdate } from '@/services/emailNotificationService';

// When bureau responds
await sendDisputeUpdate(
  'Jane Smith',
  '3 items deleted by Experian',
  {
    clientId: 'client_789',
    disputeId: 'dispute_012',
    bureau: 'Experian',
    itemsDeleted: 3
  }
);
```

### Send Fax Confirmation
```javascript
import { sendFaxConfirmation } from '@/services/emailNotificationService';

// When TELNYX fax succeeds
await sendFaxConfirmation(
  'TransUnion',
  'Sent Successfully',
  {
    faxId: 'fax_345',
    pages: 4,
    phoneNumber: '+18005551234'
  }
);
```

---

## 📊 Analytics & Tracking

Track notification performance:

```javascript
import { trackNotificationAnalytics } from '@/services/emailNotificationService';

// When notification is delivered
trackNotificationAnalytics(notificationId, 'delivered');

// When user opens notification
trackNotificationAnalytics(notificationId, 'opened', {
  openedAt: new Date().toISOString(),
  screen: currentScreen
});

// When user clicks notification
trackNotificationAnalytics(notificationId, 'clicked', {
  destinationRoute: notification.route
});

// When user dismisses notification
trackNotificationAnalytics(notificationId, 'dismissed');
```

---

## 🔒 Security Considerations

1. **Email Authentication**
   - Use DKIM, SPF, DMARC on @speedycreditrepair.com
   - Prevent email spoofing

2. **API Security**
   - Require authentication for all API endpoints
   - Rate limit email polling
   - Validate email addresses before sending

3. **Data Privacy**
   - Don't send sensitive client data in notification body
   - Use generic messages with deep links to app
   - Encrypt email content if possible

4. **Access Control**
   - Only authorized apps can poll emails
   - Use OAuth 2.0 for Gmail API access
   - Rotate service account keys regularly

---

## 🧪 Testing

### Test Each Notification Type

1. **Manual Testing**:
   ```bash
   # Send test email
   curl -X POST http://localhost:3000/api/email/send-notification \
     -H "Content-Type: application/json" \
     -d '{
       "to": "urgent@speedycreditrepair.com",
       "subject": "TEST: Urgent Alert",
       "body": "This is a test of the urgent notification system",
       "priority": "critical"
     }'
   ```

2. **Mobile App Testing**:
   - Open mobile app
   - Trigger notification from CRM
   - Verify notification appears in app
   - Check sound, vibration, color
   - Test navigation to correct screen

3. **Load Testing**:
   - Send 100 notifications at once
   - Verify mobile app handles burst
   - Check for missed notifications

---

## 📈 Monitoring & Maintenance

### Weekly Tasks
- Check email delivery rates
- Review notification analytics
- Test random notification types

### Monthly Tasks
- Audit email alias usage
- Review notification priority assignments
- Update prefixes if needed
- Check Gmail API quotas

### Quarterly Tasks
- Review and optimize poll interval
- Update notification sounds/vibrations based on feedback
- Analyze which notifications users dismiss vs. act on

---

## ❓ Troubleshooting

### Notifications Not Appearing

**Check**:
1. Gmail API enabled?
2. Service account has correct permissions?
3. Email aliases created in Google Workspace?
4. Mobile app polling interval not too long?
5. Check mobile app logs for errors

### Emails Not Sending

**Check**:
1. Google Workspace account active?
2. Sending limits not exceeded?
3. Email address typos?
4. Backend API working?

### Wrong Notification Type

**Check**:
1. Email prefix matches configuration?
2. `emailPrefixConfig.js` up to date in mobile app?
3. Casing correct (should be lowercase)?

---

## 📞 Support

For issues with this system:
- Check configuration files: `emailPrefixConfig.js`, `emailNotificationService.js`
- Review Google Workspace admin console
- Check Gmail API quotas
- Test with Postman/curl first

---

**Last Updated**: November 11, 2025
**Version**: 1.0
**Contact**: admin@speedycreditrepair.com
