# SPEEDYCRM_ARCHITECTURE.md
## Living Architecture Document — Last Updated: 2026-02-10 (Evening Session 2)

> **PURPOSE:** This file lives in Claude Project Knowledge. Every new Claude session reads this FIRST.
> At session end, handoff includes updates to this file so the next session starts informed.

---

## 🏗️ PROJECT OVERVIEW

- **Product:** SpeedyCRM — AI-First Credit Repair CRM
- **URL:** https://myclevercrm.com
- **Owner:** Christopher Lahage, Speedy Credit Repair Inc. (Est. 1995)
- **Stack:** React 18 + Vite + Material-UI + Tailwind + Firebase + OpenAI
- **Status:** ~89% complete, 400+ files, 11,021-line Cloud Functions backend
- **Team:** Christopher (Owner/Dev), Laurie (Ops), Jordan (IT)

---

## 📁 TOP 50 FILES BY SIZE (Active src/ + functions/)

| Lines | Path | Purpose |
|-------|------|---------|
| 11,021 | functions/index.js | ALL Cloud Functions (12 Gen2 exports) |
| 6,363 | src/components/idiq/CompleteEnrollmentFlow.jsx | 10-phase enrollment flow |
| 5,478 | src/pages/hubs/ContactsPipelineHub.jsx | Pipeline hub (largest hub) |
| 5,344 | src/pages/SmartDashboard.jsx | Main CRM dashboard |
| 4,202 | src/pages/hubs/AffiliatesHub.jsx | Affiliate management |
| 3,973 | src/pages/ClientPortal.jsx | Client-facing portal |
| 3,819 | src/pages/Products.jsx | Products page |
| 3,682 | src/pages/Calendar.jsx | Calendar (in restore-temp backup) |
| 3,667 | src/pages/DisputeLetters.jsx | Dispute letter management |
| 3,581 | src/pages/FullAgreement.jsx | Full service agreement |
| 3,521 | src/components/UltimateContactForm.jsx | PRIMARY contact intake form |
| 3,476 | src/components/dispute/DisputeHubConfig.jsx | Dispute hub configuration |
| 3,429 | src/pages/hubs/ReviewsReputationHub.jsx | Reviews & reputation |
| 3,423 | src/pages/InformationSheet.jsx | Client information sheet |
| 3,401 | src/pages/hubs/MarketingHub.jsx | Marketing hub |
| 3,316 | src/pages/hubs/ReferralPartnerHub.jsx | Referral partner management |
| 2,972 | src/pages/WorkflowTestingDashboard.jsx | Workflow testing & debug |
| 2,858 | src/pages/Contacts.jsx | Contacts list page |
| 2,839 | src/pages/Affiliates.jsx | Affiliates page |
| 2,801 | src/components/credit/CreditMonitoringSystem.jsx | Credit monitoring |
| 2,735 | src/pages/hubs/TasksSchedulingHub.jsx | Tasks & scheduling |
| 2,641 | src/pages/hubs/CertificationAcademyHub.jsx | Training certifications |
| 2,618 | src/components/credit/IDIQControlCenter.jsx | IDIQ admin controls |
| 2,591 | src/components/admin/ServicePlanManager.jsx | Service plan admin |
| 2,537 | src/pages/hubs/ServicePlanAdmin.jsx | Service plan hub |
| 2,441 | src/pages/Leads.jsx | Leads page |
| 2,352 | src/pages/ClientProgressPortal.jsx | Client progress view |
| 2,337 | src/pages/Appointments.jsx | Appointments |
| 2,322 | src/components/credit/AIDisputeGenerator.jsx | AI dispute generation |
| 2,312 | src/pages/hubs/CommunicationsHub.jsx | Communications hub |
| 2,231 | src/components/credit/IDIQConfig.jsx | IDIQ configuration |
| 2,169 | functions/disputePopulationService.js | Dispute data population |
| 2,135 | src/pages/hubs/AutomationHub.jsx | Automation hub |
| 2,116 | src/pages/hubs/AIHub.jsx | AI features hub |
| 1,978 | Documentation/MasterWorkflowBlueprint.md | Workflow documentation |
| 1,921 | src/components/idiq/IDIQEnrollmentWizard.jsx | IDIQ enrollment wizard |
| 1,918 | functions/emailTemplates.js | 30+ email templates (AI-powered) |
| 1,866 | src/components/credit/CreditReportWorkflow.jsx | Credit report pipeline |
| 1,807 | src/components/AIReportGenerator.jsx | AI report generation |
| 1,762 | src/components/credit/CreditReportDisplay.jsx | Credit report viewer |
| 1,743 | src/components/tax/TaxPreparationWorkspace.jsx | Tax prep workspace |
| 1,742 | src/pages/hubs/DisputeHub.jsx | Dispute management hub |
| 1,725 | functions/aiCreditIntelligence.js | AI credit analysis |
| 1,714 | src/pages/DripCampaigns.jsx | Drip campaign UI |
| 1,687 | src/App.jsx | Main app routing |
| 1,667 | functions/emailWorkflowEngine.js | Email automation engine |
| 1,639 | src/services/taskAIService.js | Task AI service |
| 1,638 | src/components/WorkflowOrchestrator.jsx | Workflow orchestration |
| 1,589 | src/pages/Pipeline.jsx | Pipeline page |
| 1,578 | src/pages/ACHAuthorization.jsx | ACH authorization page |
| 1,212 | src/pages/hubs/FaxCenter.jsx | Telnyx fax + health monitoring (NEW 2/10) |

### Key Support Files
| Lines | Path | Purpose |
|-------|------|---------|
| 1,496 | functions/aiAdvancedFeatures.js | AI advanced capabilities |
| 1,434 | src/services/faxService.js | Telnyx fax service |
| 1,379 | functions/creditAnalysisEngine.js | Credit analysis engine |
| 1,279 | functions/emailMonitor.js | Email monitoring |
| 1,201 | src/utils/contractTemplates.js | Contract PDF templates |
| 1,111 | functions/AILeadScoringEngine.js | Lead scoring AI |
| 1,096 | functions/emailBrandingConfig.js | Email branding constants |
| 1,073 | functions/workflow/processSignedContract.js | Contract processing |
| 1,066 | functions/workflow/generateContract.js | Contract generation |
| 874 | src/layout/navConfig.js | Navigation configuration |
| 775 | src/layout/ProtectedLayout.jsx | Accordion nav + role filtering |

---

## 🔄 LIFECYCLE STATUS (Updated 2026-02-10 Evening)

### Phase A: Contact Entry & AI Assessment — 90%
| Stage | Status | Location |
|-------|--------|----------|
| Contact created in Firestore | ✅ BUILT | onContactCreated (index.js) |
| AI role assessment (auto-assign lead) | ✅ BUILT | onContactCreated |
| Welcome email with enrollment link | ✅ BUILT 2/10 | onContactCreated → emailTemplates.js |
| Speed-to-lead alert to staff | ✅ BUILT 2/10 | staffNotifications collection + real-time bell/toast |
| CRM dashboard notification | ⚠️ PARTIAL | staffNotifications exist, SmartDashboard needs bell widget |

### Phase B: Lead Nurture (Pre-Enrollment) — 90%
| Stage | Status | Location |
|-------|--------|----------|
| Welcome email with enrollment link | ✅ BUILT 2/10 | onContactCreated |
| SMS welcome (Telnyx) | ⚠️ PARTIAL | 48h/7d SMS in Rule 13 nurture |
| 4h/12h follow-up nudge | ✅ BUILT 2/10 | Rule 13 (AI=4h, Web=12h) |
| 24h drip (all sources) | ✅ BUILT 2/10 | Rule 13 (AI+Web 24h templates) |
| 48h consultation/report | ✅ BUILT 2/10 | Rule 13 (AI+Web 48h templates) |
| 7-day final attempt | ✅ BUILT 2/10 | Rule 13 + SMS |
| 14-day educational re-engagement | ✅ BUILT 2/10 | Rule 13 (web leads only) |

### Phase C: Enrollment Flow (10-Phase) — 100% ✅
All 10 phases built and tested in CompleteEnrollmentFlow.jsx.
NMI payment integration complete. Abandonment recovery email active.

### Phase D: Post-Enrollment Automation — 95%
| Stage | Status | Location |
|-------|--------|----------|
| Welcome client email (portal access) | ✅ BUILT | onContactUpdated |
| Contract confirmation email | ✅ BUILT | onContactUpdated |
| ACH setup request email | ✅ BUILT | onContactUpdated + scheduledEmails |
| Document reminder (24h) | ✅ BUILT 2/10 | Rule 14 |
| IDIQ upgrade reminders (7/14/18 day) | ✅ BUILT | Rule 3 |
| Post-ACH 30-day drip | ✅ BUILT | Rule 4 |

### Phase E: Active Client Lifecycle — 50%
| Stage | Status | Location |
|-------|--------|----------|
| AI dispute strategy generation | ❌ MISSING | Needs IDIQ dispute API wiring |
| Dispute letter generation | ❌ MISSING | DisputeHub planned |
| Bureau fax sending | ✅ BUILT 2/10 | FaxCenter.jsx + sendFaxOutbound |
| Fax health monitoring + auto-rotation | ✅ BUILT 2/10 | bureauFaxHealth + Telnyx webhook |
| Dispute result notifications | ✅ BUILT | Rule 7 |
| Monthly credit report re-pull | ❌ MISSING | Needs scheduled function |
| Monthly progress report email | ✅ BUILT | Rule 8 |
| Score milestone celebrations | ✅ BUILT | Rule 9 |
| Payment failure notifications | ✅ BUILT 2/10 | NMI webhook → nmiWebhook case in operationsManager |
| Staff notifications (bell/toast/chime) | ✅ BUILT 2/10 | staffNotifications collection, real-time listener |

### Phase F: Client Completion & Alumni — 60%
| Stage | Status | Location |
|-------|--------|----------|
| Graduation detection | ✅ BUILT | Rule 10 |
| Post-graduation maintenance tips | ✅ BUILT | Rule 10 |
| Review request + referral invite | ✅ BUILT | Rule 11 |
| Anniversary check-ins | ✅ BUILT | Rule 11 |
| Cancellation/offboarding flow | ❌ MISSING | No NMI cancel handler |
| Win-back campaign | ❌ MISSING | No rule |

### Phase G: Non-Signup Paths — 55%
| Stage | Status | Location |
|-------|--------|----------|
| Quiz lead nurture (24h+72h) | ✅ BUILT | Rule 12 |
| Landing page lead nurture | ✅ BUILT 2/10 | Rule 13 web leads |
| AI phone lead follow-up | ✅ BUILT 2/10 | Rule 13 AI leads |
| Opt-out / unsubscribe handling | ✅ BUILT 2/10 | CAN-SPAM: emailSuppressionList + GET unsubscribe |
| 90-day cold lead recycling | ❌ MISSING | No rule |

---

## 🎯 CURRENT PRIORITIES (Updated 2026-02-10 Evening)

### ✅ COMPLETED TODAY (2/10, Sessions 1 & 2)
| # | Task | Details |
|---|------|---------|
| 1 | Lead welcome email + enrollment link | onContactCreated → Rule 0 welcome email |
| 2 | Universal lead nurture drip | Rule 13, 9 templates, AI+Web sources, SMS at 48h/7d |
| 3 | Document upload reminder 24h | Rule 14, checks for missing docs |
| 4 | Staff Notification System | staffNotifications Firestore collection, sendStaffNotification case, real-time bell/toast/chime |
| 5 | NMI Payment Failure Webhook | nmiWebhook case (6-action flow: log, update, notify, schedule retry, email, activity) |
| 6 | CAN-SPAM Compliance | emailSuppressionList collection, GET unsubscribe handler, centralized opt-out guard |
| 7 | Seed servicePlans collection | adminSeedPlans case, 3 plans with full metadata (merged into existing docs) |
| 8 | FaxCenter UI + Health Monitoring | 1,212-line component, 4-step wizard, bureau directory, Telnyx webhook, auto-rotation |

### 🔴 REMAINING CRITICAL FOR PUBLIC LAUNCH
| # | Task | Complexity | Why It Matters |
|---|------|-----------|----------------|
| 1 | **Stripe Integration** | LARGE (full session) | Recurring billing, subscription management. NMI handles enrollment, but Stripe needed for ongoing subscriptions. OR wire NMI recurring fully. |
| 2 | **Client Login Flow Test** | MEDIUM | Verify: client registers → logs in → sees ClientPortal → correct data. May need fixes. |
| 3 | **DocuSign API Integration** | MEDIUM | Account exists, needs API access. Currently contracts are manual. Wire to ContractSigningPortal.jsx. |
| 4 | **Deploy Functions (GMAIL_APP_PASSWORD)** | SMALL | Functions deploy fails with Secret Manager error. Need `gcloud auth application-default login` or re-add secret. Functions code is fine. |
| 5 | **SmartDashboard Bell Widget** | SMALL | StaffNotifications collection exists, just needs a bell icon in the dashboard header that reads from it. |

### 🟡 IMPORTANT BUT NOT BLOCKING LAUNCH
| # | Task | Complexity |
|---|------|-----------|
| 6 | IDIQ Dispute API wiring (auto-generate dispute letters) | LARGE |
| 7 | Monthly credit report re-pull (scheduled function) | MEDIUM |
| 8 | Cancellation/offboarding flow | MEDIUM |
| 9 | Win-back campaign for cancelled clients | SMALL |
| 10 | 90-day cold lead recycling | SMALL |
| 11 | Hub consolidation (BillingHub+BillingPaymentsHub, etc.) | MEDIUM |
| 12 | Pipeline Tab upgrade to T3 (120+ AI features) | LARGE |

---

## 🗃️ FIRESTORE COLLECTIONS

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| contacts | All people in system | roles[], source, leadScore, enrollmentStatus, leadWelcomeEmailSent, welcomeEmailSent |
| userProfiles | Auth + permissions | role (string), userId |
| emailLog | Email tracking | contactId, templateId, type, sentAt, opened, clicked, converted |
| scheduledEmails | Delayed email queue | contactId, type, scheduledFor, sent |
| creditReports | Stored credit data | contactId, reportData, vantageScore |
| disputes | Dispute tracking | contactId, status, items |
| invoices | Billing/revenue | contactId, amount, status |
| tasks | Task management | assignedTo, status, dueDate |
| servicePlans | Plan definitions (3 plans) | name, monthlyPrice, setupFee, perDeletion, features, idealFor, color, icon, active |
| staffNotifications | Real-time staff alerts | type, priority, title, message, targetRoles[], readBy{}, source |
| emailSuppressionList | CAN-SPAM opt-out | email, contactId, unsubscribedAt, source |
| faxLog | Sent fax records | contactId, to, bureau, faxId, status, sentAt, deliveredAt, failedAt |
| bureauFaxHealth | Per-number health tracking | faxNumber, bureauName, isActive, totalAttempts, totalSuccess, totalFailed, consecutiveFailures, successRate, recentAttempts[] |
| activityLogs | All system activity | type, contactId, action, details, createdAt |

---

## ⚙️ CLOUD FUNCTIONS (12 Gen2 Exports — 11,021 lines)

| Export | Type | Purpose |
|--------|------|---------|
| emailService | onCall | Send emails via Gmail SMTP |
| receiveAIReceptionistCall | onRequest | Webhook for AI phone calls |
| processAICall | onCall | Process AI call transcripts |
| onContactUpdated | onDocumentUpdated | Enrollment completion + email automation |
| onContactCreated | onDocumentCreated | AI role assessment + welcome email |
| idiqService | onCall | IDIQ enrollment + credit reports |
| processWorkflowStages | onSchedule (hourly) | Workflow advancement + IDIQ reminders |
| processAbandonmentEmails | onSchedule (5 min) | 14 lifecycle rules, 34+ email types |
| aiContentGenerator | onCall | AI content generation + recommendServicePlan |
| operationsManager | onRequest | Multi-action REST endpoint (40+ cases) |
| sendFaxOutbound | onRequest | Telnyx fax + webhookUrl + bureauFaxHealth seeding |
| enrollmentSupportService | onCall | Enrollment support actions |

### Key operationsManager Cases Added 2/10
- `sendStaffNotification` — Creates staffNotifications docs with priority/roles/chime
- `nmiWebhook` — Handles payment_failed, payment_success from NMI callbacks (6-action flow)
- `adminSeedPlans` — One-time seeder for servicePlans collection (3 plans, merge:true)
- `telnyx_fax` webhook — GET param handler: Telnyx fax delivery status → faxLog + bureauFaxHealth updates, auto-disable at 3 failures, staff notification

### CAN-SPAM Unsubscribe Handler
- GET `?unsubscribe=true&email=...&contactId=...` → Shows confirmation page → GET `?confirm_unsubscribe=true` → Adds to emailSuppressionList
- All email-sending functions check suppressionList before sending (centralized guard in processAbandonmentEmails)

**⚠️ CRITICAL:** Never create new Cloud Functions. Add actions as case blocks inside existing functions. Previous Claude instance deployed 173 functions = $2K+/mo bill.

---

## 💳 SERVICE PLANS (servicePlans Firestore Collection)

| Doc ID | Plan | Monthly | Setup | Per-Deletion | Popular |
|--------|------|---------|-------|-------------|---------|
| essentials | Essentials | $79 | $49 | $0 | — |
| professional | Professional | $149 | $0 | $25 | ⭐ Most Popular |
| vip | VIP Concierge | $299 | $0 | $0 | 👑 VIP |

Each document has 25+ fields: tagline, description, timeline, successRate, avgPointIncrease, idealFor[], keyFeatures[], color, icon, ctaText, nmiPlanId (null), stripePriceId (null), etc.

---

## 📠 FAX SYSTEM (Built 2/10)

### Architecture
1. **FaxCenter.jsx** (1,212 lines) — UI at `/fax-center`
2. **sendFaxOutbound** Cloud Function — Sends via Telnyx API, logs to faxLog, seeds bureauFaxHealth
3. **Telnyx Webhook** — `operationsManager?webhook=telnyx_fax` receives delivery status callbacks
4. **bureauFaxHealth** — Per-number success tracking, auto-disables after 3 consecutive failures

### Bureau Fax Numbers (3 per bureau)
| Bureau | Primary | Backup 1 | Backup 2 |
|--------|---------|----------|----------|
| Experian | (972) 390-3837 | (714) 830-7505 | (972) 390-4970 |
| TransUnion | (610) 546-4606 | (610) 546-4605 | (602) 794-6189 |
| Equifax | (888) 826-0549 | (770) 375-2821 | (888) 388-2784 |

### Smart Auto-Rotation
- FaxCenter reads bureauFaxHealth in real-time
- Picks number with highest success rate per bureau
- If primary fails 3x, auto-switches to backup + sends staff notification
- Staff can re-enable disabled numbers from Bureau Directory tab

### Telnyx Configuration
- Webhook URL set in Telnyx portal: `https://operationsmanager-tvkxcewmxq-uc.a.run.app?webhook=telnyx_fax`
- Fax Application: "FAX APP DEVELOPMENT2" (existing, webhook updated 2/10)
- Secrets: TELNYX_API_KEY + TELNYX_PHONE stored in Firebase Secret Manager

---

## 🔔 STAFF NOTIFICATION SYSTEM (Built 2/10)

### How It Works
1. Any Cloud Function calls `sendStaffNotification` case in operationsManager
2. Creates document in `staffNotifications` collection with: type, priority, title, message, targetRoles[], readBy{}, source
3. Frontend uses `onSnapshot` listener on staffNotifications for real-time bell/toast/chime
4. Priority levels: info, warning, critical (critical plays chime sound)

### Active Triggers
- New lead created (speed-to-lead)
- NMI payment failure
- Fax number auto-disabled (3+ consecutive failures)
- (More can be added by calling sendStaffNotification from any case block)

### Frontend Integration Needed
- SmartDashboard needs bell icon widget reading from staffNotifications
- ProtectedLayout could add global notification bell in header
- Real-time listener pattern: `onSnapshot(query(collection(db, 'staffNotifications'), where('readBy.{userId}', '==', null), orderBy('createdAt', 'desc')))`

---

## 🛡️ CAN-SPAM COMPLIANCE (Built 2/10)

- **emailSuppressionList** Firestore collection tracks opt-outs
- **Unsubscribe URL:** `https://operationsmanager-tvkxcewmxq-uc.a.run.app?unsubscribe=true&email={email}&contactId={contactId}`
- **Flow:** Click link → See confirmation page → Click confirm → Added to suppressionList + contact.emailOptOut=true
- **Guard:** processAbandonmentEmails checks suppressionList before every email send
- **All email templates** include unsubscribe footer (added to emailTemplates.js)

---

## 🔐 KNOWN ISSUES

### Functions Deploy: Secret Manager Error
```
Error: Failed to make request to https://secretmanager.googleapis.com/v1/projects/my-clever-crm/secrets/GMAIL_APP_PASSWORD
```
**Fix:** Run `gcloud auth application-default login` then retry `firebase deploy --only functions`. This is an auth token expiration issue, not a code problem. All 12 functions load correctly.

### Vite Build Warnings (Non-blocking)
- `eval` warning in IDIQCreditReportViewer.jsx — cosmetic, not functional
- Dynamic vs static import warnings for firebase/firestore — cosmetic chunking advisory
- Large chunk warning (index-CMLcJvA-.js 3MB) — consider code splitting in future

---

## 📝 SESSION LOG

| Date | Session Focus | Key Changes |
|------|--------------|-------------|
| 2026-02-10 eve | Priorities 5-8 + Fax Health | NMI webhook, CAN-SPAM, servicePlans seed, FaxCenter 1,212 lines, Telnyx webhook, bureauFaxHealth, index.js 10,555→11,021 (+466). Commits: 9dcd537, 6763ecd, 3ca2078, 80e4a38 |
| 2026-02-10 aft | Priorities 1-3 | Welcome email on contact creation (Rule 0), universal lead nurture drip (Rule 13, 9 templates), document reminder 24h (Rule 14). index.js 9,237→9,852 (+615). |
| 2026-02-10 aft | Priorities 4 (staff notifs) | staffNotifications collection, sendStaffNotification case, real-time bell/toast/chime. index.js 9,852→10,555 (+703). |
| 2026-02-09 | A-to-Z workflow connection | Workflow chain connected, 3-plan system updated |
| 2026-02-09 | Bug fixes (10 bugs) | NMI payment, IDIQ retry, email fixes, localStorage isolation |

---

## 📋 NEXT SESSION CHECKLIST

When starting a new session, the assistant should:

1. **Read this file first** — it's the single source of truth
2. **Check transcripts** at `/mnt/transcripts/` for detailed implementation history
3. **Ask Christopher** what the priority is — but suggest from the "REMAINING CRITICAL" list above
4. **Never create new Cloud Functions** — add case blocks to existing ones
5. **Import AuthContext** as `'../../contexts/AuthContext'` (capital A, capital C)
6. **Use `lib/firebase.js`** for Firestore imports, not direct firebase SDK paths
7. **index.js is 11,021 lines** — always verify line numbers before editing
8. **emailTemplates.js is 1,918+ lines** — production-ready, has 30+ templates
9. **Test with `wc -l`** before assuming files are empty
10. **Auto-save every 30 min** to memory (task, files, code, next steps)

---

*© 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved*