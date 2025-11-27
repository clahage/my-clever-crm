# SpeedyCRM Workflow Setup Guide
## Complete Guide to End-to-End Workflow Automation

**Version:** 1.0.0
**Last Updated:** November 27, 2025
**Author:** SpeedyCRM Development Team

---

## Overview

The SpeedyCRM Workflow system automates the entire client journey from initial contact to active credit repair services. This guide covers setup, configuration, and usage of the workflow automation features.

---

## Quick Start

### Accessing the Workflow Tools

1. **Workflow Orchestrator** - Main workflow engine
   - URL: `/workflow-orchestrator`
   - Required Role: Admin (level 7+)
   - Purpose: Run complete end-to-end workflows

2. **Workflow Tester** - Testing dashboard
   - URL: `/workflow-testing`
   - Required Role: Admin (level 7+)
   - Purpose: Test individual workflow stages

### Running Your First Workflow

1. Navigate to `/workflow-orchestrator`
2. Fill in contact information:
   - First Name (required)
   - Last Name (required)
   - Email (required)
   - Phone, SSN, DOB, Address (optional but improve lead scoring)
3. Click "Start Workflow"
4. Watch the progress through all 12 stages

---

## Workflow Stages

### Stage 1: Contact Entry
Creates a new contact record in Firestore with initial status "new".

**Fields Created:**
- firstName, lastName, email, phone
- status: "new"
- roles: ["contact"]
- createdAt timestamp

### Stage 2: Welcome Email
Sends welcome email from `welcome@speedycreditrepair.com`.

**Email Contents:**
- Personal greeting
- Introduction to services
- Link to client portal
- Support contact information

### Stage 3: Lead Qualification
AI-powered lead scoring from 1-10.

**Scoring Factors:**
- Valid email format (+1)
- Phone number provided (+1)
- SSN provided (+2)
- Complete address (+1)

**Classifications:**
- 7-10: Hot lead (high priority)
- 5-6: Warm lead (follow up soon)
- 1-4: Cold lead (nurture sequence)

### Stage 4: IDIQ Credit Report
Retrieves credit report from IDIQ (Partner ID: 11981).

**Data Retrieved:**
- Credit scores (Experian, Equifax, TransUnion)
- Negative accounts (collections, late payments, charge-offs)
- Inquiries
- Public records

### Stage 5: AI Credit Analysis
OpenAI GPT-4 analyzes the credit report.

**Analysis Includes:**
- Summary of credit status
- Key issues identified
- Risk level assessment
- Projected score improvement timeline

### Stage 6: Service Plan Recommendation
AI recommends optimal service plan.

**Available Plans:**
| Plan | Monthly | Setup | Best For |
|------|---------|-------|----------|
| DIY | $99 | $0 | Minor issues |
| Standard | $149 | $99 | Moderate issues |
| Acceleration | $199 | $149 | Multiple issues |
| Pay-for-Delete | $149/item | $0 | Few high-impact items |
| Hybrid | $129 | $79 | Mixed approach |
| Premium | $299 | $199 | Complex situations |

### Stage 7: Contract Generation
Generates three contract documents.

**Documents:**
1. Service Agreement - Terms and pricing
2. Power of Attorney - Authorization to dispute
3. ACH Authorization - Payment setup

### Stage 8: E-Signature
Client signs contracts (DocuSign integration).

**Note:** This is a manual stage. Enable "Skip Manual Stages" in settings to auto-advance during testing.

### Stage 9: Client Activation
Activates the client account.

**Changes:**
- Status: "active"
- Roles: adds "client"
- Client number assigned (SCR-xxxxxxxx)

### Stage 10: Dispute Generation
Generates dispute letters for all negative items.

**Output:**
- Dispute batch record
- Individual dispute items
- Letter templates populated

### Stage 11: Fax Dispatch
Sends dispute letters via Telnyx to credit bureaus.

**Bureau Fax Numbers:**
- Experian: +1-800-493-1058
- Equifax: +1-888-640-9580
- TransUnion: +1-800-916-7800

### Stage 12: Workflow Complete
Finalizes the workflow and schedules monthly updates.

**Actions:**
- Calculate workflow duration
- Schedule next monthly update (30 days)
- Send completion email

---

## Configuration

### Workflow Settings

Access settings via the gear icon in Workflow Orchestrator.

| Setting | Default | Description |
|---------|---------|-------------|
| Auto-Advance | ON | Automatically proceed between stages |
| Send Real Emails | OFF | Use Gmail SMTP for actual emails |
| Send Real Faxes | OFF | Use Telnyx for actual faxes |
| Use Real IDIQ | OFF | Connect to live IDIQ API |
| Skip Manual Stages | OFF | Auto-complete e-signature |

### Environment Variables

Ensure these are set in your `.env` file:

```env
# Gmail SMTP
VITE_GMAIL_USER=chris@speedycreditrepair.com
VITE_GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# OpenAI
VITE_OPENAI_API_KEY=sk-proj-xxxxx

# IDIQ
VITE_IDIQ_PARTNER_ID=11981
VITE_IDIQ_PARTNER_SECRET=xxxxx
VITE_IDIQ_TOKEN_ENDPOINT=https://getidiqpartnertoken-tvkxcewmxq-uc.a.run.app

# Telnyx
VITE_TELNYX_API_KEY=KEYxxxxx
VITE_TELNYX_CONNECTION_ID=xxxxx
VITE_TELNYX_FAX_NUMBER=+16572362242
```

---

## Email Configuration

### Available Email Prefixes

All emails are sent via Gmail SMTP using Christopher's Google Workspace domain.

| Prefix | Purpose | Example Usage |
|--------|---------|---------------|
| chris@ | Personal communication | Service recommendations |
| welcome@ | Welcome emails | New contact greeting |
| updates@ | Monthly updates | Progress reports |
| contracts@ | Contract delivery | Agreement notifications |
| disputes@ | Dispute notifications | Dispute status updates |
| billing@ | Payment notifications | Invoice, payment confirmation |
| support@ | Support tickets | Help desk responses |
| alerts@ | System alerts | Important notifications |
| success@ | Success stories | Completion celebrations |
| noreply@ | System emails | Automated notifications |

### Template Customization

Email templates are located in `/functions/emailTemplates.js`.

Each template includes:
- Subject line (dynamic with contact data)
- HTML body (responsive design)
- Plain text fallback
- Personalization tokens

---

## Testing Guide

### Using the Workflow Tester

1. Navigate to `/workflow-testing`
2. Configure test settings in left panel
3. Run individual tests or test groups

### Test Categories

**Infrastructure Tests:**
- Firestore Connection
- Authentication

**Workflow Tests:**
- Contact Creation
- Welcome Email
- Lead Scoring
- Contract Generation
- Dispute Generation

**Integration Tests:**
- IDIQ API
- OpenAI API
- Telnyx API
- Email Sending

### Interpreting Results

- **Passed** (green): Test completed successfully
- **Failed** (red): Test encountered an error
- **Duration**: Time in milliseconds

### Exporting Results

Click "Export" to download test results as JSON for debugging.

---

## Troubleshooting

### Workflow Won't Start

**Symptoms:** Nothing happens when clicking "Start Workflow"

**Solutions:**
1. Check required fields (First Name, Last Name, Email)
2. Verify Firebase connection (check console)
3. Ensure user has admin role

### Stage Fails with Error

**Symptoms:** Red error message, workflow stops

**Solutions:**
1. Check execution logs tab
2. Verify API credentials
3. Check Firestore rules
4. Try running in test mode first

### Emails Not Sending

**Symptoms:** Email stage completes but no email received

**Solutions:**
1. Verify Gmail App Password
2. Check spam folder
3. Ensure "Send Real Emails" is enabled
4. Check Cloud Functions logs

### IDIQ API Errors

**Symptoms:** Credit report stage fails

**Solutions:**
1. Use simulated mode for testing
2. Verify partner credentials with Jordan
3. Check token endpoint availability
4. Review IDIQ API documentation

### Fax Not Sending

**Symptoms:** Fax stage reports failure

**Solutions:**
1. Verify Telnyx API key
2. Check connection ID
3. Ensure fax number is valid
4. Review Telnyx dashboard for errors

---

## Best Practices

### For Testing

1. Always start with test mode (simulated emails/faxes)
2. Use test email addresses (test@speedycreditrepair.com)
3. Enable "Skip Manual Stages" for faster testing
4. Check logs after each stage
5. Clean up test data after testing

### For Production

1. Disable "Skip Manual Stages"
2. Enable real email sending only when ready
3. Monitor Cloud Functions logs
4. Set up error alerting
5. Regular backup of workflow data

### Performance Optimization

1. Keep workflows under 90 seconds total
2. Monitor API response times
3. Use batch operations where possible
4. Enable auto-advance for efficiency

---

## API Reference

### Workflow Orchestrator Component

**Location:** `/src/components/workflow/WorkflowOrchestrator.jsx`

**Props:** None (standalone component)

**State:**
- `activeWorkflow`: Current workflow ID
- `currentStage`: Active stage index (0-11)
- `workflowStatus`: idle | running | paused | completed | failed
- `stageResults`: Results from each stage
- `settings`: Configuration options

### Workflow Tester Component

**Location:** `/src/components/testing/WorkflowEndToEndTester.jsx`

**Props:** None (standalone component)

**Features:**
- Individual test execution
- Group test execution
- Full E2E test
- Results export

### Cloud Functions

**Key Functions:**
- `sendEmail`: Send emails via SMTP
- `sendFax`: Send faxes via Telnyx
- `analyzeCreditReport`: OpenAI analysis
- `enrollIDIQ`: IDIQ enrollment
- `generateDisputeLetter`: Create disputes

---

## Support

**Technical Issues:**
- Contact: Jordan (IT Support)
- Email: jordan@speedycreditrepair.com

**Business Questions:**
- Contact: Christopher (Owner)
- Email: chris@speedycreditrepair.com

**System Status:**
- Firebase Console: console.firebase.google.com
- Cloud Functions Logs: Check in Firebase Console

---

## Changelog

### Version 1.0.0 (November 27, 2025)
- Initial release
- 12-stage workflow automation
- Workflow Orchestrator component
- Workflow Tester component
- Complete documentation

---

*This guide is part of the SpeedyCRM documentation suite.*
