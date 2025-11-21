# 🔍 SPEEDYCRM WORKFLOW - FILE AUDIT & CREATION PLAN
**Date:** November 20, 2024  
**Purpose:** Identify existing files and create missing workflow components  
**For:** Christopher @ Speedy Credit Repair

---

## 📊 PART 1: EXISTING FILES IN PROJECT

### ✅ Files Already Uploaded (No Action Needed)

These files are already in your project and ready for integration:

| File Name | Size | Location | Purpose |
|-----------|------|----------|---------|
| AICreditAnalyzer.jsx | 44K | /mnt/project | AI credit analysis component |
| AILeadScoringEngine.js | 42K | /mnt/project | Lead scoring logic |
| ClientPortal.jsx | 122K | /mnt/project | Client portal (comprehensive) |
| creditAnalysisEngine.js | 58K | /mnt/project | Credit analysis engine |
| DisputeLetters.jsx | 136K | /mnt/project | Dispute letter system |
| DripCampaigns.jsx | 62K | /mnt/project | Drip campaign management |
| EContracts.jsx | 46K | /mnt/project | E-contract system |
| Emails.jsx | 46K | /mnt/project | Email management |
| IDIQAutoEnrollment.js | 39K | /mnt/project | IDIQ enrollment logic |
| IDIQAutoEnrollment.jsx | 46K | /mnt/project | IDIQ enrollment component |
| idiqEnrollmentProcessor.js | 28K | /mnt/project | IDIQ processor |
| leadScoringEngine.js | 37K | /mnt/project | Lead scoring engine |
| LeadScoringDashboard.jsx | 40K | /mnt/project | Lead scoring dashboard |
| Letters.jsx | 33K | /mnt/project | Letter templates |
| ServicePlanRecommender.jsx | 39K | /mnt/project | Service plan recommender |
| Templates.jsx | 25K | /mnt/project | Template manager |
| WorkflowBuilder.jsx | 0K | /mnt/project | Workflow builder (empty) |

**NOTE:** WorkflowBuilder.jsx exists but is EMPTY (0K) - needs to be built

---

## 🚨 PART 2: MISSING FILES - NEED TO CREATE

### Category A: Email Workflow System (4 Files)

According to your memory, these files are production-ready but NOT in project:

1. **emailWorkflowEngine.js** (1668 lines)
   - Purpose: Gmail SMTP, OpenAI, IDIQTracker, AI workflows, sentiment, A/B testing
   - Status: ❌ NOT FOUND - NEED TO CREATE

2. **emailTemplates.js** (1980 lines)
   - Purpose: 15+ email templates (ai-welcome, report-reminder, help-offer, etc.)
   - Status: ❌ NOT FOUND - NEED TO CREATE

3. **emailBrandingConfig.js**
   - Purpose: Email branding configuration
   - Status: ❌ NOT FOUND - NEED TO CREATE

4. **emailMonitor.js**
   - Purpose: Email monitoring system
   - Status: ❌ NOT FOUND - NEED TO CREATE

### Category B: React Components (5 Files)

Core workflow UI components from MasterWorkflowBlueprint.md:

5. **EmailReviewQueue.jsx**
   - Path: `/src/components/communications/EmailReviewQueue.jsx`
   - Purpose: Human review of AI-generated emails before sending
   - Status: ❌ NOT FOUND - NEED TO CREATE

6. **ClientPlanSelection.jsx**
   - Path: `/src/components/client-portal/ClientPlanSelection.jsx`
   - Purpose: Client-facing service plan selection interface
   - Status: ❌ NOT FOUND - NEED TO CREATE

7. **ContractSigningPortal.jsx**
   - Path: `/src/components/client-portal/ContractSigningPortal.jsx`
   - Purpose: E-signature interface for contracts
   - Status: ❌ NOT FOUND - NEED TO CREATE

8. **AutomatedWorkflowDashboard.jsx**
   - Path: `/src/components/automation/AutomatedWorkflowDashboard.jsx`
   - Purpose: Monitor all automated workflows in one place
   - Status: ❌ NOT FOUND - NEED TO CREATE

9. **ServicePlanManager.jsx**
   - Path: `/src/components/admin/ServicePlanManager.jsx`
   - Purpose: Admin interface to configure service plans
   - Status: ❌ NOT FOUND - NEED TO CREATE

### Category C: Firebase Cloud Functions (11+ Files)

Server-side functions for workflow automation:

10. **functions/index.js** - Main exports file
11. **functions/enrollIDIQ.js** - IDIQ enrollment
12. **functions/processCreditReport.js** - Fetch & normalize credit reports
13. **functions/analyzeCreditReport.js** - AI credit analysis
14. **functions/generateDisputeLetters.js** - AI dispute generation
15. **functions/generateProspectReview.js** - AI initial email draft
16. **functions/recommendServicePlan.js** - AI plan recommendation + action plan
17. **functions/sendProposalEmail.js** - Send approved proposals (Firestore trigger)
18. **functions/generateContract.js** - Create e-contract and documents
19. **functions/processSignedContract.js** - Handle contract signatures (Firestore trigger)
20. **functions/checkNonResponders.js** - Daily scheduled check for follow-ups
21. **functions/sendCampaignEmails.js** - Send drip campaign emails (scheduled)

---

## 📝 PART 3: CLAUDE CODE CREATION PROMPTS

### 🎯 PROMPT 1: Email Workflow System (Priority 1)

```
TASK: Create 4 Email Workflow System Files for SpeedyCRM

PROJECT CONTEXT:
- Building automated lead-to-client workflow for credit repair CRM
- Must integrate with existing Firebase, OpenAI, SendGrid, Gmail SMTP
- Human-in-the-loop approval before emails sent
- Production-ready code only - no placeholders

SPECIFICATIONS:
- React 18, Material-UI, Tailwind CSS, Firebase Firestore
- All API keys must be server-side (Firebase Cloud Functions)
- Complete error handling, loading states, console.log debugging
- ===== section headers for organization
- Beginner-friendly comments

FILES TO CREATE:

1. /src/lib/emailWorkflowEngine.js (Target: 1668 lines)
   Features Required:
   - Gmail SMTP integration (Google Workspace: noreply@speedycreditrepair.com)
   - SendGrid integration (API-based sending)
   - OpenAI integration for email personalization
   - IDIQ credit report tracker integration
   - AI sentiment analysis
   - A/B testing framework
   - Email queue management (pending_review → approved → sent)
   - Bounce handling & retry logic
   - Delivery tracking
   - Template variable replacement
   - Campaign automation triggers

2. /src/lib/emailTemplates.js (Target: 1980 lines)
   Templates Required (15+ templates):
   - ai-welcome: Welcome email after AI Receptionist call
   - report-reminder: Reminder to check credit report
   - help-offer: Proactive help offer
   - web-welcome: Welcome after web signup
   - consultation: Consultation booking email
   - dispute: Dispute status update
   - progress: Monthly progress report
   - reengagement: Re-engagement for inactive leads
   - vip: VIP client communication
   - educational: Educational content series
   - nudge_email_1: "Quick follow-up" (3 days after proposal)
   - nudge_email_2: "Questions about your plan?" (7 days)
   - nudge_email_3: "Last chance" (14 days)
   - contract_reminder: Gentle reminder to sign contract
   - welcome_signed: Welcome email after contract signed
   
   Each template must include:
   - Subject line
   - HTML body with inline CSS
   - Plain text fallback
   - Variable placeholders {{FIRST_NAME}}, {{PLAN_NAME}}, etc.
   - CTA buttons with tracking links
   - Unsubscribe footer
   - CROA compliance disclaimers where applicable

3. /src/lib/emailBrandingConfig.js
   Features Required:
   - Speedy Credit Repair brand colors (#1976d2 primary, #f57c00 accent)
   - Email header/footer templates
   - Logo embedding (base64 or CDN link)
   - Social media links
   - Contact information
   - Email signature templates by role (admin, manager, user)
   - Responsive email layouts
   - Dark mode compatibility

4. /src/lib/emailMonitor.js
   Features Required:
   - Real-time email queue monitoring
   - Delivery status tracking
   - Bounce rate analytics
   - Open rate tracking (pixel-based)
   - Click-through rate tracking
   - Failed delivery alerts
   - Retry queue management
   - Email health dashboard metrics
   - Integration with Firebase Analytics

INTEGRATION REQUIREMENTS:
- Must work with existing Emails.jsx (46K, 1246 lines)
- Must work with existing DripCampaigns.jsx (62K, 1714 lines)
- Must integrate with EmailReviewQueue.jsx (to be created)
- Firebase collections: emailQueue, emailCampaigns, emailTemplates
- OpenAI for email personalization (server-side only)

FIREBASE INTEGRATION:
- Use Firebase Firestore for email queue
- Use Firebase Cloud Functions for sending (no client-side API keys)
- Use serverTimestamp() for all dates
- Real-time listeners with onSnapshot()
- Error handling with try/catch everywhere

DELIVERABLES:
1. 4 complete, production-ready .js files
2. Each file with header comment including file path
3. Extensive inline comments explaining logic
4. Example usage code at bottom of each file
5. All 4 files ready to drop into /src/lib/ directory

CRITICAL REMINDERS:
- NO placeholders or TODO comments
- NO fake or sample data
- Complete error handling throughout
- Console.log debugging statements
- Ready for immediate deployment to myclevercrm.com
```

---

### 🎯 PROMPT 2: React Workflow Components (Priority 2)

```
TASK: Create 5 React Workflow Components for SpeedyCRM

PROJECT CONTEXT:
- Building automated lead-to-client workflow for credit repair CRM
- Must integrate with existing ClientPortal.jsx (122K), Emails.jsx (46K), ServicePlanRecommender.jsx (39K)
- Material-UI + Tailwind CSS design system
- Firebase Firestore real-time integration
- Role-based permissions (8-level hierarchy)

SPECIFICATIONS:
- React 18 functional components with hooks
- Material-UI components with Tailwind utility classes
- Dark mode support (dark: prefix)
- Mobile-responsive design
- Firebase real-time listeners
- Error handling, loading states
- Lucide-react icons
- ===== section headers

FILES TO CREATE:

1. /src/components/communications/EmailReviewQueue.jsx
   Purpose: CRM users review and approve/edit AI-generated emails
   Features Required:
   - Display pending emails from emailQueue collection (status: 'pending_review')
   - Show email subject, body, recipient, AI confidence score
   - Inline editor for body text (ReactQuill or TextField multiline)
   - Approve button → updates status to 'approved', triggers sendProposalEmail function
   - Reject button → updates status to 'rejected'
   - Edit & Approve workflow
   - Filter by email type (initial_review, proposal, nudge, etc.)
   - Tabs: Pending Review | Approved | Sent | Rejected
   - Real-time updates with onSnapshot
   - Role-based permissions (manager+ can approve)

2. /src/components/client-portal/ClientPlanSelection.jsx
   Purpose: Client-facing interface to select service plan
   Features Required:
   - Display all available service plans from servicePlans collection
   - Show plan details: name, price, features, eligibility
   - Highlight AI-recommended plan (from servicePlanRecommendations)
   - Plan comparison table
   - "Select This Plan" button triggers generateContract cloud function
   - Show personalized action plan for each plan option
   - Responsive card layout
   - Smooth animations on plan selection
   - Price breakdown (monthly, setup fees, total)
   - FAQ accordion for each plan
   - Testimonials section
   - Trust badges (A+ BBB, 4.9★ rating)

3. /src/components/client-portal/ContractSigningPortal.jsx
   Purpose: E-signature interface for service agreements
   Features Required:
   - Display contract HTML (from contracts collection)
   - Signature pad (react-signature-canvas)
   - "I agree to terms" checkbox
   - CROA 3-day cancellation notice (prominent)
   - Download contract PDF button
   - Sign & Submit button → updates contract status to 'signed'
   - Supporting documents display (POA, ACH Authorization)
   - Signature preview before submit
   - Audit trail (IP address, timestamp, device info)
   - Progress stepper: Review → Sign → Confirm
   - Email confirmation after signing
   - Integration with processSignedContract cloud function

4. /src/components/automation/AutomatedWorkflowDashboard.jsx
   Purpose: Monitor all automated workflows in one place
   Features Required:
   - Lead Pipeline Overview (funnel chart)
     - New Leads → IDIQ Enrolled → Credit Analyzed → Proposal Sent → Contract Signed
   - Email Queue Status
     - Pending human review count
     - Approved awaiting send count
     - Sent today count
     - Bounce/error rate
   - Contract Status
     - Proposals sent (awaiting plan selection)
     - Contracts sent (awaiting signature)
     - Contracts signed today/week/month
   - Campaign Performance
     - Active drip campaigns count
     - Email open rates by campaign
     - Response rates
     - Conversion rates
   - Workflow Alerts
     - Leads stuck in pipeline > 7 days
     - Failed email deliveries
     - IDIQ enrollment errors
   - AI Performance Metrics
     - Lead score accuracy
     - Plan recommendation acceptance rate
     - Dispute letter approval rate
   - Real-time dashboard with auto-refresh every 30 seconds
   - Date range filters
   - Export to CSV/PDF
   - Role-based visibility (admin/manager only)

5. /src/components/admin/ServicePlanManager.jsx
   Purpose: Admin interface to configure service plans
   Features Required:
   - CRUD operations for servicePlans collection
   - Plan fields:
     - id, name, description, monthlyPrice, setupFee
     - features array
     - eligibilityCriteria object
     - contractDuration, active boolean
   - Drag-and-drop to reorder plans
   - Enable/disable plans without deleting
   - Pricing history tracking
   - Plan performance analytics (conversion rate by plan)
   - Eligibility rule builder (visual interface)
     - "If disputeableItems > 9, recommend Acceleration Plan"
   - Preview mode (see what clients see)
   - A/B testing setup for plan descriptions
   - Integration with recommendServicePlan cloud function
   - Bulk edit capabilities
   - Plan templates (quickly create similar plans)

INTEGRATION REQUIREMENTS:
- Must integrate with existing ClientPortal.jsx (122K)
- Must integrate with Emails.jsx, DripCampaigns.jsx
- Firebase collections: emailQueue, servicePlans, contracts, contacts
- OpenAI operations must be server-side (Cloud Functions)
- Use existing role-based permission system (userProfile.role)

DESIGN REQUIREMENTS:
- Consistent with existing SpeedyCRM design system
- Material-UI primary color: #1976d2
- Dark mode support throughout
- Mobile-responsive (breakpoints: sm, md, lg, xl)
- Loading skeletons while data fetches
- Empty states with helpful CTAs
- Error boundaries with user-friendly messages
- Keyboard navigation support
- WCAG 2.1 AA accessibility compliance

DELIVERABLES:
1. 5 complete, production-ready React components
2. Each file with header comment including file path
3. Prop types or TypeScript interfaces documented
4. Example usage in comments
5. All files ready to integrate into existing CRM

CRITICAL REMINDERS:
- NO placeholders or TODO comments
- NO fake or sample data
- Real Firebase integration with live data
- Complete error handling throughout
- Console.log debugging statements
- Ready for immediate deployment to myclevercrm.com
```

---

### 🎯 PROMPT 3: Firebase Cloud Functions (Priority 3)

```
TASK: Create 11 Firebase Cloud Functions for SpeedyCRM Workflow Automation

PROJECT CONTEXT:
- Building automated lead-to-client workflow for credit repair CRM
- Server-side AI operations (OpenAI), IDIQ Partner 11981 integration
- SendGrid + Gmail SMTP for email delivery
- Human-in-the-loop approval before emails sent
- Must integrate with existing React components

SPECIFICATIONS:
- Node.js 18+ / Firebase Cloud Functions v2
- firebase-admin SDK
- OpenAI API for AI operations
- IDIQ Partner API for credit reports
- SendGrid API for email delivery
- Comprehensive error handling
- Logging with console.log and console.error
- Environment variables from Firebase config

ENVIRONMENT VARIABLES (Already Set):
```bash
firebase functions:config:set \
  openai.api_key="sk-..." \
  idiq.partner_id="11981" \
  idiq.api_key="..." \
  sendgrid.api_key="SG...." \
  gmail.user="noreply@speedycreditrepair.com" \
  gmail.password="..."
```

FILES TO CREATE:

1. /functions/index.js
   Purpose: Main exports file for all Cloud Functions
   Contents:
   - Import all function modules
   - Export all functions for Firebase deployment
   - Shared initialization (admin.initializeApp())
   - Common utilities (timestamp helpers, etc.)

2. /functions/enrollIDIQ.js
   Purpose: Enroll contact in IDIQ free trial
   Trigger: HTTPS Callable function
   Process:
   - Validate contact data (SSN, DOB, address)
   - Call IDIQ Partner API enrollment endpoint
   - Store enrollment in idiqEnrollments collection
   - Update contact workflow stage to 'idiq_enrolled'
   - Handle errors gracefully
   Input: { contactId, planType: 'free_trial' }
   Output: { success: true, enrollmentId: '...' }

3. /functions/processCreditReport.js
   Purpose: Fetch and normalize credit report from IDIQ
   Trigger: IDIQ webhook OR HTTPS Callable
   Process:
   - Fetch raw credit report from IDIQ API
   - Parse XML/JSON into normalized structure
   - Calculate average credit score (TU + EQ + EX) / 3
   - Extract tradelines, collections, inquiries
   - Store in creditReports collection
   - Trigger analyzeCreditReport function
   - Update contact workflow stage to 'credit_report_received'

4. /functions/analyzeCreditReport.js
   Purpose: AI analysis of credit report
   Trigger: HTTPS Callable (after processCreditReport)
   Process:
   - Fetch credit report from Firestore
   - Call OpenAI GPT-4 with credit data
   - AI identifies disputable items
   - AI categorizes by severity (high/medium/low impact)
   - AI estimates score improvement if items removed
   - Store analysis in creditAnalyses collection
   - Trigger generateDisputeLetters function
   - Trigger generateProspectReview function
   OpenAI Prompt: "You are a senior credit repair analyst..."

5. /functions/generateDisputeLetters.js
   Purpose: AI-generated dispute letters for negative items
   Trigger: HTTPS Callable (after analyzeCreditReport)
   Process:
   - Fetch credit analysis
   - For each disputable item, call OpenAI to generate letter
   - AI uses factual, compliant language (FCRA)
   - Store disputes in disputes collection (status: 'draft')
   - Create 3 bureau letters (TransUnion, Equifax, Experian)
   - Format as PDF-ready HTML
   OpenAI Prompt: "Generate a professional credit dispute letter..."

6. /functions/generateProspectReview.js
   Purpose: AI-generated initial email to prospect
   Trigger: HTTPS Callable (after analyzeCreditReport)
   Process:
   - Fetch credit analysis
   - Call OpenAI to generate personalized email
   - Compassionate tone, highlight positive aspects
   - Mention top 3 negative items
   - Tease potential score improvement
   - Store in emailQueue (status: 'pending_review', requiresApproval: true)
   - Await human approval in EmailReviewQueue.jsx

7. /functions/recommendServicePlan.js
   Purpose: AI recommendation of best service plan
   Trigger: HTTPS Callable (after analyzeCreditReport)
   Process:
   - Fetch credit analysis
   - Call OpenAI to recommend plan based on complexity
   - Generate personalized 3-step action plan
   - Calculate estimated timeline and cost
   - Store in servicePlanRecommendations collection
   - Return recommendation for email inclusion
   OpenAI Prompt: "Based on this credit profile, recommend..."

8. /functions/sendProposalEmail.js
   Purpose: Send approved proposal email to prospect
   Trigger: Firestore onUpdate (emailQueue status: 'approved')
   Process:
   - Fetch approved email from emailQueue
   - Fetch service plan recommendation
   - Build HTML email with plan details + action plan
   - Add CTA button linking to ClientPlanSelection
   - Send via SendGrid
   - Update emailQueue (status: 'sent', sentAt: timestamp)
   - Update contact (status: 'proposal_sent')
   - Create emailCampaign entry (for nudge sequence)

9. /functions/generateContract.js
   Purpose: Generate e-contract and supporting docs
   Trigger: HTTPS Callable (when client selects plan)
   Process:
   - Fetch contact, selected plan
   - Fetch contract template from contractTemplates collection
   - Replace placeholders {{CLIENT_NAME}}, {{MONTHLY_PRICE}}, etc.
   - Generate supporting documents (POA, ACH Authorization)
   - Store in contracts collection (status: 'pending_signature')
   - Send contract email with link to ContractSigningPortal
   Input: { contactId, selectedPlan }
   Output: { success: true, contractId: '...' }

10. /functions/processSignedContract.js
    Purpose: Handle contract signature completion
    Trigger: Firestore onUpdate (contracts status: 'signed')
    Process:
    - Update contact roles array: add 'client', remove 'lead'
    - Update contact status to 'active_client'
    - Cancel all active drip campaigns (emailCampaigns)
    - Activate all pending disputes (status: 'active')
    - Create onboarding tasks (welcome packet, first dispute mailing, kickoff call)
    - Send welcome email (from emailTemplates)
    - Create first invoice
    - Schedule first credit monitoring pull (30 days)

11. /functions/checkNonResponders.js
    Purpose: Daily check for non-responding prospects
    Trigger: Scheduled (pubsub.schedule('every 24 hours'))
    Process:
    - Query contacts where status='proposal_sent' AND proposalSentAt < 3 days ago
    - For each non-responder:
      - Check if nudge campaign exists
      - If not, create emailCampaign (type: 'nudge', 3 emails)
      - If campaign exists, check next email schedule
    - Query contacts where status='contract_sent' AND contractSentAt < 7 days ago
      - Send contract reminder email

12. /functions/sendCampaignEmails.js
    Purpose: Send scheduled drip campaign emails
    Trigger: Scheduled (pubsub.schedule('every 6 hours'))
    Process:
    - Query emailCampaigns where status='active' AND nextEmailAt <= now
    - For each campaign:
      - Fetch appropriate email template
      - Replace variables
      - Send email via SendGrid
      - Update emailsSent count
      - Calculate nextEmailAt based on sequence
      - If all emails sent, update status to 'completed'

SHARED UTILITIES TO INCLUDE:
- Email template variable replacement function
- IDIQ API wrapper with retry logic
- OpenAI API wrapper with error handling
- Credit score calculation helpers
- Date/time utilities

DELIVERABLES:
1. 12 complete, production-ready Cloud Function files
2. /functions/index.js with all exports
3. /functions/package.json with all dependencies
4. README.md with deployment instructions
5. All functions tested and ready for deployment

CRITICAL REMINDERS:
- ALL API keys server-side (NO client exposure)
- Comprehensive error handling with try/catch
- Logging with console.log and console.error
- Real Firebase integration (no mocks)
- CROA/FCRA compliance in all email and letter content
- Ready for immediate deployment
```

---

## 🎯 EXECUTION PLAN

### Step 1: Create Email System Files
Use **PROMPT 1** in Claude Code to create:
- emailWorkflowEngine.js
- emailTemplates.js
- emailBrandingConfig.js
- emailMonitor.js

### Step 2: Create React Components
Use **PROMPT 2** in Claude Code to create:
- EmailReviewQueue.jsx
- ClientPlanSelection.jsx
- ContractSigningPortal.jsx
- AutomatedWorkflowDashboard.jsx
- ServicePlanManager.jsx

### Step 3: Create Firebase Cloud Functions
Use **PROMPT 3** in Claude Code to create all 12 function files

### Step 4: Integration Testing
- Test end-to-end workflow
- Verify Firebase deployments
- Test with real IDIQ data
- Verify email delivery

---

## 📋 FILE CHECKLIST

- [ ] emailWorkflowEngine.js (1668 lines target)
- [ ] emailTemplates.js (1980 lines target)
- [ ] emailBrandingConfig.js
- [ ] emailMonitor.js
- [ ] EmailReviewQueue.jsx
- [ ] ClientPlanSelection.jsx
- [ ] ContractSigningPortal.jsx
- [ ] AutomatedWorkflowDashboard.jsx
- [ ] ServicePlanManager.jsx
- [ ] functions/index.js
- [ ] functions/enrollIDIQ.js
- [ ] functions/processCreditReport.js
- [ ] functions/analyzeCreditReport.js
- [ ] functions/generateDisputeLetters.js
- [ ] functions/generateProspectReview.js
- [ ] functions/recommendServicePlan.js
- [ ] functions/sendProposalEmail.js
- [ ] functions/generateContract.js
- [ ] functions/processSignedContract.js
- [ ] functions/checkNonResponders.js
- [ ] functions/sendCampaignEmails.js
- [ ] functions/package.json
- [ ] functions/README.md

**Total Files to Create: 24**

---

## 🚀 DEPLOYMENT READINESS

After all files are created:

### React Components:
```bash
# Copy to appropriate directories
cp EmailReviewQueue.jsx /src/components/communications/
cp ClientPlanSelection.jsx /src/components/client-portal/
cp ContractSigningPortal.jsx /src/components/client-portal/
cp AutomatedWorkflowDashboard.jsx /src/components/automation/
cp ServicePlanManager.jsx /src/components/admin/

# Copy email system files
cp emailWorkflowEngine.js /src/lib/
cp emailTemplates.js /src/lib/
cp emailBrandingConfig.js /src/lib/
cp emailMonitor.js /src/lib/
```

### Firebase Cloud Functions:
```bash
# Deploy all functions
cd functions
npm install
firebase deploy --only functions
```

### Verify Deployment:
```bash
# Check function logs
firebase functions:log

# Test IDIQ enrollment
firebase functions:shell
> enrollIDIQ({contactId: 'test_id'})

# Monitor real-time
firebase functions:log --only sendProposalEmail
```

---

**END OF FILE AUDIT & CREATION PLAN**

Ready for Claude Code implementation! 🚀