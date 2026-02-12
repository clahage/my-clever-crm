# SPEEDYCRM_ARCHITECTURE.md
## Living Architecture Document — Last Updated: 2026-02-12 (Session 7 — 80-Hub Audit + Coming Soon Elimination + Crasher Fixes)

> **PURPOSE:** This file lives in Claude Project Knowledge. Every new Claude session reads this FIRST.
> At session end, handoff includes updates to this file so the next session starts informed.

---

## ⚙️ PROJECT OVERVIEW

- **Product:** SpeedyCRM — AI-First Credit Repair CRM
- **URL:** https://myclevercrm.com
- **Owner:** Christopher Lahage, Speedy Credit Repair Inc. (Est. 1995)
- **Stack:** React 18 + Vite + Material-UI + Tailwind + Firebase + OpenAI
- **Status:** ~90% complete, 400+ files, 12,987-line Cloud Functions backend
- **Team:** Christopher (Owner/Dev), Laurie (Ops), Jordan (IT)

---

## 📊 TOP 50 FILES BY SIZE (Active src/ + functions/)

| Lines | Path | Purpose |
|-------|------|---------|
| 12,987 | functions/index.js | ALL Cloud Functions (12 Gen2 exports) — +937 from IDIQ dispute pipeline (2/12) |
| 6,363 | src/components/idiq/CompleteEnrollmentFlow.jsx | 10-phase enrollment flow |
| 5,478 | src/pages/hubs/ContactsPipelineHub.jsx | Pipeline hub (largest hub) |
| 5,348 | src/pages/SmartDashboard.jsx | Main CRM dashboard + bell notifications ✅ |
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
| 2,553 | src/components/credit/AIDisputeGenerator.jsx | AI dispute generation — REWIRED 2/12, security fix, IDIQ pipeline |
| 2,548 | src/pages/hubs/CalendarSchedulingHub.jsx | Calendar hub — REBUILT 2/12 (8 tabs) |
| 2,537 | src/pages/hubs/ServicePlanAdmin.jsx | Service plan hub |
| 2,441 | src/pages/Leads.jsx | Leads page |
| 2,352 | src/pages/ClientProgressPortal.jsx | Client progress view |
| 2,337 | src/pages/Appointments.jsx | Appointments |
| 2,312 | src/pages/hubs/CommunicationsHub.jsx | Communications hub |
| 2,261 | src/pages/hubs/ReportsHub.jsx | Reports hub — REBUILT 2/12, real Firebase data (removed fake setTimeout) |
| 2,231 | src/components/credit/IDIQConfig.jsx | IDIQ configuration |
| 2,169 | functions/disputePopulationService.js | Dispute data population |
| 2,135 | src/pages/hubs/AutomationHub.jsx | Automation hub |
| 2,116 | src/pages/hubs/AIHub.jsx | AI features hub |
| 2,091 | src/pages/hubs/LearningHub.jsx | Learning hub — REBUILT 2/12 (10 tabs, was crasher) |
| 1,978 | Documentation/MasterWorkflowBlueprint.md | Workflow documentation |
| 1,921 | src/components/idiq/IDIQEnrollmentWizard.jsx | IDIQ enrollment wizard |
| 1,918 | functions/emailTemplates.js | 30+ email templates (AI-powered) |
| 1,866 | src/components/credit/CreditReportWorkflow.jsx | Credit report pipeline |
| 1,807 | src/components/AIReportGenerator.jsx | AI report generation |
| 1,781 | src/components/client-portal/ContractSigningPortal.jsx | Contract signing (6 tabs) — V3.0 marker system |
| 1,762 | src/components/credit/CreditReportDisplay.jsx | Credit report viewer |
| 1,743 | src/components/tax/TaxPreparationWorkspace.jsx | Tax prep workspace |
| 1,742 | src/pages/hubs/DisputeHub.jsx | Dispute management hub |
| 1,725 | functions/aiCreditIntelligence.js | AI credit analysis |
| 1,714 | src/pages/DripCampaigns.jsx | Drip campaign UI |
| 1,700 | src/App.jsx | Main app routing |
| 1,667 | functions/emailWorkflowEngine.js | Email automation engine |
| 1,404 | src/pages/hubs/CollectionsARHub.jsx | Collections & AR — REBUILT 2/12 (6 tabs, was 579 lines) |
| 1,329 | src/pages/hubs/BureauCommunicationHub.jsx | Bureau comms — REBUILT 2/12 (4 new tabs) |

### Key New/Updated Files (2/12 Session 7)
| Lines | Path | Purpose |
|-------|------|---------|
| 2,548 | src/pages/hubs/CalendarSchedulingHub.jsx | Calendar hub mega-enhancement (8 tabs) — Christopher built |
| 2,091 | src/pages/hubs/LearningHub.jsx | Learning hub rebuilt: 10 tabs from scratch, was crasher (rendered 0 tab content). Courses, video training, knowledge base, AI tutor, quizzes, certs, analytics, team training, mobile, content manager. All Firebase-connected. |
| 2,261 | src/pages/hubs/ReportsHub.jsx | Replaced fake setTimeout + hardcoded insights with real Firebase data analysis (contacts, bureauDisputes, invoices). Conditional AI recommendations. |
| 1,404 | src/pages/hubs/CollectionsARHub.jsx | Rebuilt from 579 lines: 6 tabs (Collections, Payment Plans, Automation, Templates, Analytics, Settings). AI Collections Engine. Firebase CRUD. |
| 1,329 | src/pages/hubs/BureauCommunicationHub.jsx | Added 4 tabs: Response Manager, Bulk Operations, Analytics, Settings. Bureau response tracking, batch dispute operations. |

### Key New/Updated Files (2/12 Session 6)
| Lines | Path | Purpose |
|-------|------|---------|
| 2,553 | src/components/credit/AIDisputeGenerator.jsx | Security fix (removed client-side OpenAI key), IDIQ pipeline wired, fake data removed |
| 12,987 | functions/index.js | +937 lines: 5 IDIQ dispute case blocks (pullDisputeReport, getDisputeReport, submitIDIQDispute, getDisputeStatus, refreshCreditReport) |

### Key New/Updated Files (2/11)
| Lines | Path | Purpose |
|-------|------|---------|
| 1,781 | src/components/client-portal/ContractSigningPortal.jsx | Contract signing portal V3.0 — marker-based rendering, processDocumentHtml, event delegation, public signing props |
| 1,262 | src/utils/contractTemplates.js | Contract templates V3.0 — marker system (__INITIAL_N__, __SIGNATURE__, __SCR_SIGNATURE__, __DATE__), positive cancellation clause, 5-Day Right |
| 1,057 | src/components/client-portal/PublicContractSigningRoute.jsx | Premium public signing page — luxury design, token validation, animations, confetti |
| 5,348 | src/pages/SmartDashboard.jsx | Main CRM dashboard — QuickAccessPanel bell notifications from staffNotifications collection ✅ COMPLETE |

### Key Support Files
| Lines | Path | Purpose |
|-------|------|---------|
| 1,496 | functions/aiAdvancedFeatures.js | AI advanced capabilities |
| 1,434 | src/services/faxService.js | Telnyx fax service |
| 1,379 | functions/creditAnalysisEngine.js | Credit analysis engine |
| 1,279 | functions/emailMonitor.js | Email monitoring |
| 1,212 | src/pages/hubs/FaxCenter.jsx | Telnyx fax + health monitoring |
| 1,262 | src/utils/contractTemplates.js | Contract templates V3.0 — marker system |
| 1,111 | functions/AILeadScoringEngine.js | Lead scoring AI |
| 1,096 | functions/emailBrandingConfig.js | Email branding constants |
| 1,073 | functions/workflow/processSignedContract.js | Contract processing |
| 1,066 | functions/workflow/generateContract.js | Contract generation |
| 874 | src/layout/navConfig.js | Navigation configuration |
| 775 | src/layout/ProtectedLayout.jsx | Accordion nav + role filtering |

---

## 🏛️ LIFECYCLE STATUS (Updated 2026-02-12)

### Phase A: Contact Entry & AI Assessment — 100% ✅
| Stage | Status | Location |
|-------|--------|----------|
| Contact created in Firestore | ✅ BUILT | onContactCreated (index.js) |
| AI role assessment (auto-assign lead) | ✅ BUILT | onContactCreated |
| Welcome email with enrollment link | ✅ BUILT 2/10 | onContactCreated → emailTemplates.js |
| Speed-to-lead alert to staff | ✅ BUILT 2/10 | staffNotifications collection + real-time bell/toast |
| CRM dashboard notification | ✅ BUILT 2/11 | SmartDashboard QuickAccessPanel bell (staffNotifications collection, color-coded, time-ago) |

### Phase B: Lead Nurture (Pre-Enrollment) — 90%
| Stage | Status | Location |
|-------|--------|----------|
| Welcome email with enrollment link | ✅ BUILT 2/10 | onContactCreated |
| SMS welcome (Telnyx) | ⚠ PARTIAL | 48h/7d SMS in Rule 13 nurture |
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
| **Contract signing via email link** | ✅ BUILT 2/11 | generateContractSigningLink → PublicContractSigningRoute → ContractSigningPortal V3.0 (marker system, 7 UX fixes) |
| Contract confirmation email | ✅ BUILT | onContactUpdated Scenario 3 |
| ACH setup request email | ✅ BUILT | onContactUpdated + scheduledEmails |
| Document reminder (24h) | ✅ BUILT 2/10 | Rule 14 |
| IDIQ upgrade reminders (7/14/18 day) | ✅ BUILT | Rule 3 |
| Post-ACH 30-day drip | ✅ BUILT | Rule 4 |

### Phase E: Active Client Lifecycle — 80%
| Stage | Status | Location |
|-------|--------|----------|
| AI dispute strategy generation | ✅ BUILT 2/12 | AIDisputeGenerator.jsx → idiqService (5 case blocks) |
| Dispute letter generation | ✅ BUILT 2/12 | aiContentGenerator disputeLetter case + AIDisputeGenerator.jsx |
| Bureau fax sending | ✅ BUILT 2/10 | FaxCenter.jsx + sendFaxOutbound |
| Fax health monitoring + auto-rotation | ✅ BUILT 2/10 | bureauFaxHealth + Telnyx webhook |
| Dispute result notifications | ✅ BUILT | Rule 7 |
| Monthly credit report re-pull | ✅ BUILT 2/12 | idiqService refreshCreditReport case block |
| Monthly progress report email | ✅ BUILT | Rule 8 |
| Score milestone celebrations | ✅ BUILT | Rule 9 |
| Payment failure notifications | ✅ BUILT 2/10 | NMI webhook → nmiWebhook case |
| Staff notifications (bell/toast/chime) | ✅ BUILT 2/10 | staffNotifications collection |

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

## 🏗️ 80-HUB AUDIT RESULTS (Completed 2/12 Session 7)

### Summary
- **80 total hubs** audited across the codebase
- **13 "coming soon" placeholders eliminated** + 1 TODO with fake data removed
- **1 confirmed crasher fixed** (LearningHub — rendered 0 tab content)
- **2 suspected crashers cleared** (TrainingLibrary.jsx + CampaignPlanner.jsx — both work fine)
- **~7,085 new lines** across 4 rebuilt files

### Files Rebuilt (Session 7)
| File | Before → After | What Changed |
|------|----------------|-------------|
| CalendarSchedulingHub.jsx | — → 2,548 | 8-tab mega-enhancement (Christopher built) |
| CollectionsARHub.jsx | 579 → 1,404 | 6 tabs from scratch: Collections, Payment Plans, Automation, Templates, Analytics, Settings. AI Collections Engine. |
| BureauCommunicationHub.jsx | 1,158 → 1,329 | 4 new tabs: Response Manager, Bulk Operations, Analytics, Settings. Bureau response tracking. |
| ReportsHub.jsx | 2,232 → 2,261 | Replaced fake setTimeout + hardcoded data with real Firebase analysis (contacts, bureauDisputes, invoices). |
| LearningHub.jsx | 1,047 → 2,091 | All 10 tabs built from scratch (was crasher). Courses, video, knowledge base, AI tutor, quizzes, certs, analytics, team, mobile, content manager. |

### Remaining "Coming Soon" Placeholders (Cosmetic)
| File | Count | Details |
|------|-------|---------|
| CreditScoreOptimizer.jsx | 1 | Section placeholder |
| SocialListening.jsx | 1 | Section placeholder |
| ReferralPartnerHub.jsx | 3 | Feature area placeholders |

### TrainingLibrary.jsx — DELETE BOTH COPIES
- `src/pages/TrainingLibrary.jsx` (likely original)
- `src/pages/hubs/TrainingLibrary.jsx` (likely copy)
- **Why:** Orphan with no route in navConfig. Contains SAMPLE_COURSES hardcoded data (violates no-fake-data rule). LearningHub.jsx (2,091 lines) covers all functionality. Also remove any lazy import + Route in App.jsx.

### No-Firebase Static Hubs (Future Priority)
- AnalyticsHub.jsx, CertificationAcademyHub.jsx, and various others need Firebase connections

---

## ✉️ EMAIL-BASED CONTRACT SIGNING SYSTEM (Built 2/11)

### Architecture
Replaced DocuSign integration ($600-3,600/yr) with custom email signing links. $0/month, unlimited signatures.

### How It Works
1. **Staff** calls `generateContractSigningLink` with contactId + planId
2. **Backend** creates 64-char hex token in `contractSigningTokens`, sends branded email
3. **Client** clicks link → `myclevercrm.com/sign/TOKEN` → `PublicContractSigningRoute.jsx`
4. **Validates** token (not expired, not used) via `validateContractSigningToken`
5. **Signs** all 6 documents in `ContractSigningPortal` (signature, initials, ACH)
6. **Completes** → `markContractSigningTokenUsed` + contact updated with `contractSigned: true`
7. **Triggers** existing `onContactUpdated` Scenario 3 automation (confirmation email, doc request, ACH setup)

### Backend Cases (in operationsManager)
- `generateContractSigningLink` — Creates token, sends email, logs activity, staff notification
- `validateContractSigningToken` — Validates token (expiry, used, contact lookup), records click
- `markContractSigningTokenUsed` — Marks token after signing complete

### Frontend Components
- `PublicContractSigningRoute.jsx` (1,057 lines) — Premium luxury design, Playfair Display + DM Sans fonts, gold+navy palette, staggered animations, confetti success screen, mobile-first
- `ContractSigningPortal.jsx` (1,781 lines) — Updated with `isPublicSigning`, `contactData`, `planData`, `onSigningComplete` props. Uses prop data instead of Firestore when in public mode.
- Route: `/sign/:token` in App.jsx (public, outside ProtectedLayout)

### Firestore Collection: contractSigningTokens
| Field | Type | Description |
|-------|------|-------------|
| token | string | 64-char hex (32 bytes randomness) |
| contactId | string | Contact reference |
| contactEmail, contactName | string | Recipient info |
| planId, planName, monthlyPrice | string/number | Plan details |
| used, usedAt | boolean/timestamp | One-time use tracking |
| expiresAt | timestamp | 72 hours from creation |
| emailSent, emailSentAt | boolean/timestamp | Email delivery tracking |
| linkClickedAt | timestamp | When client first opened link |
| signingCompletedAt | timestamp | When signing finished |
| createdBy | string | Staff member who sent |

### Contact Fields Added
- `contractSigningLinkSent` (boolean)
- `contractSigningLinkSentAt` (timestamp)
- `contractSigningToken` (string)
- `contractSignedVia` ('email_link' | 'in_app') — tracks signing method

### DocuSign Status
**FULLY REMOVED** on 2/11. All code, secrets, and API access deleted. DocuSign developer account integration key cancelled. Zero DocuSign references remain in production code.

---

## ⚛️ CLOUD FUNCTIONS (12 Gen2 — NEVER ADD MORE)

| Function | Type | Purpose |
|----------|------|---------|
| receiveAIReceptionistCall | onRequest | Webhook for AI phone calls |
| processAICall | onCall | Process AI call transcripts |
| onContactUpdated | onDocumentUpdated | Enrollment completion + email automation |
| onContactCreated | onDocumentCreated | AI role assessment + welcome email |
| idiqService | onCall | IDIQ enrollment + credit reports + dispute pipeline (5 cases added 2/12) |
| processWorkflowStages | onSchedule (hourly) | Workflow advancement + IDIQ reminders |
| processAbandonmentEmails | onSchedule (5 min) | 14 lifecycle rules, 34+ email types |
| aiContentGenerator | onCall | AI content generation + recommendServicePlan + disputeLetter |
| operationsManager | onRequest | Multi-action REST endpoint (43+ cases) |
| sendFaxOutbound | onRequest | Telnyx fax + webhookUrl + bureauFaxHealth |
| enrollmentSupportService | onCall | Enrollment support actions |

### Key idiqService Cases Added 2/12
- `pullDisputeReport` — POST v1/dispute/credit-report
- `getDisputeReport` — GET v1/dispute/credit-report (recursive handle extraction)
- `submitIDIQDispute` — POST v1/dispute/submit (validation + notifications)
- `getDisputeStatus` — GET v1/dispute/{id}/status (outcome parsing)
- `refreshCreditReport` — POST v1/credit-report/refresh (score comparison)

### Key operationsManager Cases Added 2/10-2/11
- `sendStaffNotification` — Creates staffNotifications docs with priority/roles/chime
- `nmiWebhook` — Handles payment_failed, payment_success from NMI callbacks
- `adminSeedPlans` — One-time seeder for servicePlans collection (3 plans)
- `telnyx_fax` webhook — Fax delivery status → faxLog + bureauFaxHealth
- `generateContractSigningLink` — Creates token + sends branded email (NEW 2/11)
- `validateContractSigningToken` — Validates public signing token (NEW 2/11)
- `markContractSigningTokenUsed` — Marks token after signing (NEW 2/11)

### CAN-SPAM Unsubscribe Handler
- GET `?unsubscribe=true&email=...&contactId=...` → Shows confirmation page → Adds to emailSuppressionList
- All email-sending functions check suppressionList before sending

**⚠️ CRITICAL:** Never create new Cloud Functions. Add actions as case blocks inside existing functions. Previous Claude instance deployed 173 functions = $2K+/mo bill.

---

## 💳 SERVICE PLANS (servicePlans Firestore Collection)

| Doc ID | Plan | Monthly | Setup | Per-Deletion | Popular |
|--------|------|---------|-------|-------------|---------|
| essentials | Essentials | $79 | $49 | $0 | — |
| professional | Professional | $149 | $0 | $25 | ⭐ Most Popular |
| vip | VIP Concierge | $299 | $0 | $0 | 👑 VIP |

---

## 💰 PAYMENT SYSTEM (NO STRIPE — Credit Repair Banned)

### ⛔ PROHIBITED PROCESSORS (All Ban Credit Repair in TOS)
- **Stripe** — Banned
- **PayPal** — Banned
- **Square** — Banned
- **PaySimple** — Previously used, cancelled Christopher's account

### ✅ Current Payment Methods (LIVE)
| Method | Status | Details |
|--------|--------|----------|
| **Zelle** | ✅ LIVE | billing@speedycreditrepair.com → Chase Bank |
| **ACH** | ✅ LIVE | Direct to Chase Bank account |
| **CC/Debit (simulated)** | ⚠ ADMIN ONLY | Admin can mark payment as received manually until real processor connected |

### 📜 Future Payment Processing
| Component | Status | Details |
|-----------|--------|----------|
| **NMI Gateway** | ✅ BUILT | paymentGateway.js — gateway-agnostic, Customer Vault, recurring billing API |
| **5 Star Processing** | ⏳ PENDING APPLICATION | Credit-repair-friendly merchant account. Works with NMI. |
| **Plaid** | 🟡 OPTIONAL FUTURE | Instant bank verification (not a processor — supplements NMI for ACH) |

### Architecture
1. **ACHAuthorization.jsx** — Collects bank info from client
2. **paymentGateway.js** (Cloud Function) — Calls NMI API server-side
3. **NMI Customer Vault** — Tokenized storage (PCI compliant)
4. **NMI Recurring Billing** — Handles monthly plan charges
5. **Zelle** — Manual: client sends → Laurie confirms in CRM → invoice marked paid
6. **nmiWebhook** case in operationsManager — Handles payment_success/payment_failed callbacks

### Zelle Workflow
1. Client selects Zelle during enrollment
2. System emails Zelle instructions (billing@speedycreditrepair.com)
3. Client sends payment via banking app
4. Laurie receives staffNotification to check Chase
5. Laurie clicks "Confirm Received" in CRM
6. Invoice marked paid → workflow advances

---

## 📠 FAX SYSTEM (Built 2/10)

### Architecture
1. **FaxCenter.jsx** (1,212 lines) — UI at `/fax-center`
2. **sendFaxOutbound** Cloud Function — Sends via Telnyx API
3. **Telnyx Webhook** — `operationsManager?webhook=telnyx_fax`
4. **bureauFaxHealth** — Per-number success tracking, auto-disables after 3 failures

### Bureau Fax Numbers (3 per bureau)
| Bureau | Primary | Backup 1 | Backup 2 |
|--------|---------|----------|----------|
| Experian | (972) 390-3837 | (714) 830-7505 | (972) 390-4970 |
| TransUnion | (610) 546-4606 | (610) 546-4605 | (602) 794-6189 |
| Equifax | (888) 826-0549 | (770) 375-2821 | (888) 388-2784 |

---

## 🔔 STAFF NOTIFICATION SYSTEM (Built 2/10, Bell Completed 2/11)

- staffNotifications collection with type, priority, title, message, targetRoles[], readBy{}
- Triggers: new lead, payment failure, fax failure, contract signing link sent
- **SmartDashboard bell: ✅ COMPLETE** — QuickAccessPanel sidebar (lines 4038-4177 in SmartDashboard.jsx) reads from staffNotifications with color-coded Bell icon, time-ago formatting, real-time display
- **ProtectedLayout bell: ✅ COMPLETE** — Accordion nav header has separate bell implementation

---

## ✏️ CONTRACT SIGNING V3.0 MARKER SYSTEM (Built 2/11)

Templates generate HTML with explicit markers. The portal's `processDocumentHtml(docObj)` replaces them at render time:

| Marker | Replaced With | Used In |
|--------|--------------|---------|
| `__INITIAL_0__` through `__INITIAL_10__` | Clickable yellow/green buttons | Service Contract (Tab 2) |
| `__SIGNATURE__` | "⬇ Sign below ⬇" or "✓ Signed" | Tabs 0-4 |
| `__SCR_SIGNATURE__` | Cursive "Christopher Lahage ✓" | Service Contract (Tab 2) |
| `__DATE__` | Formatted current date | All tabs |

Initial count varies by plan (some clauses are conditional on plan config).
`handleDocumentClick()` uses event delegation on `[data-initial-field]` attributes.

### Contract Document Tabs (6 tabs from real DocuSign PDF)
| Tab | Document | Signature Type | Initials |
|-----|----------|---------------|----------|
| 0 | Information Statement (CROA) | acknowledgment | 0 |
| 1 | Privacy Notice | acknowledgment | 0 |
| 2 | Service Contract (6 pages) | agreement | 8-11 (varies by plan) |
| 3 | ACH Authorization (unified) | authorization | 0 |
| 4 | Power of Attorney | agreement | 0 |
| 5 | Notice of Cancellation (5-Day Right) | acknowledgment_only | 0 |

---

## 🛡️ CAN-SPAM COMPLIANCE (Built 2/10)

- emailSuppressionList collection tracks opt-outs
- All email templates include unsubscribe footer
- Centralized guard in processAbandonmentEmails

---

## 🐛 KNOWN ISSUES

### Functions Deploy: Secret Manager Auth
**Fix:** `firebase login --reauth` then `firebase deploy --only functions`. Auth token expiration issue.

### Vite Build Warnings (Non-blocking)
- `eval` warning in IDIQCreditReportViewer.jsx — cosmetic
- Large chunk warning (3MB) — consider code splitting in future

---

## 📅 SESSION LOG

| Date | Session Focus | Key Changes |
|------|--------------|-------------|
| 2026-02-12 S7 | 80-Hub Audit + Coming Soon Elimination + Crasher Fixes | Full audit of 80 hubs. Eliminated 13 "coming soon" placeholders + 1 TODO with fake data. Fixed 1 crasher (LearningHub). Cleared 2 suspected crashers (TrainingLibrary, CampaignPlanner — both fine). Rebuilt 5 files: CalendarSchedulingHub (2,548), LearningHub (1,047→2,091, 10 tabs), CollectionsARHub (579→1,404, 6 tabs), BureauCommunicationHub (1,158→1,329, 4 new tabs), ReportsHub (2,232→2,261, real Firebase data). Identified TrainingLibrary.jsx as orphan to delete. ~7,085 new lines. |
| 2026-02-12 S6 | IDIQ Dispute Pipeline + Payment Fix | 5 IDIQ case blocks (pullDisputeReport, getDisputeReport, submitIDIQDispute, getDisputeStatus, refreshCreditReport) added to idiqService. AIDisputeGenerator.jsx rewired: removed client-side OpenAI key, all AI via Cloud Functions, TransUnion→IDIQ API, Experian/Equifax→FaxCenter. Removed fake data. Payment: Stripe references purged, documented NMI+Zelle+ACH system. index.js 12,050→12,987 (+937 lines). E2E Testing: Contract signing flow WORKS (20 UX items). Client login CRITICAL: role=user not viewer, sees admin dashboard+data. 31 total issues documented. |
| 2026-02-11 eve | Contract V3.0 Merge + Architecture | Merged V2 base + V3 fixes: contractTemplates.js 1,201→1,262 (marker system). ContractSigningPortal.jsx 1,776→1,781 (processDocumentHtml). SmartDashboard bell confirmed COMPLETE. |
| 2026-02-11 aft | Contract V3.0 Rebuild + Assessment | Rebuilt ContractSigningPortal from Christopher's 7-issue test report. Discovered V3.0 rebuild lost 1,173 lines vs V2.0. Decided on merge strategy. |
| 2026-02-11 | DocuSign removal + Email signing + Premium design | Removed DocuSign (1,045 lines, 4 secrets). Built email contract signing (3 cases, 490 lines). PublicContractSigningRoute (1,057 lines premium design). index.js 11,021→11,511 (+490). |
| 2026-02-10 eve | Priorities 5-8 + Fax Health | NMI webhook, CAN-SPAM, servicePlans seed, FaxCenter 1,212 lines, Telnyx webhook, bureauFaxHealth, index.js 10,555→11,021 (+466) |
| 2026-02-10 aft | Priorities 1-4 | Welcome email, lead nurture drip (Rule 13, 9 templates), document reminder (Rule 14), staff notifications. index.js 9,237→10,555 (+1,318) |
| 2026-02-09 | A-to-Z workflow + bug fixes | Workflow chain connected, 3-plan system, 10 bug fixes |

---

## 🧪 END-TO-END TESTING RESULTS (2/12)

### Test 1: Contract Signing Flow — ✅ PLUMBING WORKS, UX NEEDS POLISH
- ✅ generateContractSigningLink fires from console
- ✅ Email arrives with signing link
- ✅ /sign/:token loads publicly (no login)
- ✅ All 6 tabs signable
- ✅ Submit triggers Scenario 3 automation
- ✅ Bell notification fires
- ✅ Contact updated in Firestore

### Test 2: Client Login Flow — ❌ CRITICAL SECURITY ISSUES
- ❌ New registrant gets role "user" (level 5) — should be "viewer" (1) or "prospect" (2)
- ❌ Client sees full admin SmartDashboard with revenue, leads, disputes
- ❌ Client sees all sidebar hubs (AI Command Centre, Core Operations, etc.)
- ❌ Client sees staff notifications
- ❌ Dashboard says "Good evening, Chris!" instead of registered user's name

---

## 🔴 REMAINING CRITICAL FOR PUBLIC LAUNCH

### 🚨 SECURITY FIXES (Must fix before ANY public access)
| # | Task | Complexity | Details |
|---|------|-----------|---------|
| S1 | **Register.jsx: Default role → "viewer" not "user"** | SMALL | New registrants get employee-level access |
| S2 | **ProtectedLayout: Redirect low roles to /client-portal** | SMALL | Roles below user (5) should never see SmartDashboard |
| S3 | **SmartDashboard: Show logged-in user's name** | SMALL | Currently shows "Chris" for ALL users |
| S4 | **Firestore rules: Restrict client data access** | MEDIUM | Clients can see all contacts/revenue/disputes |

### ⚡ CONTRACT SIGNING UX (Grouped by priority)
| # | Task | Complexity | Details |
|---|------|-----------|---------|
| C1 | 3-day → 5-day cancellation language | SMALL | contractTemplates.js + email |
| C2 | Initials/signature persist across tabs | MEDIUM | Save once, auto-apply |
| C3 | Signature modal popup (not inline scroll) | MEDIUM | Pop up when clicking init/sign spots |
| C4 | Type/draw/upload signature options | MEDIUM | Currently freehand only |
| C5 | Email: "ACH Payment" → "Payment Information" | SMALL | Don't assume payment method |
| C6 | Email: Simplify document list | SMALL | "Service Agreement Documents" |
| C7 | "I agree" checkbox next to final signature | SMALL | Currently hidden |
| C8 | Cancellation section: Remove title box + highlight | SMALL | Don't draw attention |
| C9 | Fee section: Add reassuring language | SMALL | Soften per-deletion impact |
| C10 | Submit dialog: Soften "legally binding" | SMALL | Too intimidating |
| C11 | Last doc: Submit button replaces "Next" | SMALL | No extra scrolling |
| C12 | autocomplete="off" on bank fields | SMALL | Stops "Save Password" popup |
| C13 | Routing number auto-lookup (ABA database) | MEDIUM | Auto-populate bank name |
| C14 | ACH authorization survives beyond 6-month term | SMALL | For NSF/deletion charges |
| C15 | Payment method selection before ACH form | MEDIUM | ACH vs Zelle choice |
| C16 | Bell notification click → show detail | MEDIUM | Currently blank contact page |
| C17 | "Email Us" button broken on confirmation | SMALL | Missing mailto: link |
| C18 | All email templates need Christopher review | MEDIUM | Edit copy before launch |
| C19 | Register: Company Name should be blank | SMALL | Prepopulated incorrectly |
| C20 | Real logos throughout CRM | LOW | Future item |

### 🔧 REMAINING BUILD ITEMS
| # | Task | Complexity |
|---|------|-----------|
| B1 | NMI Recurring Billing Wiring | MEDIUM |
| B2 | Cancellation/offboarding flow | MEDIUM |
| B3 | Win-back campaign | SMALL |
| B4 | 90-day cold lead recycling | SMALL |
| B5 | Hub consolidation (merge duplicates) | MEDIUM |
| B6 | Pipeline Tab T3 upgrade | LARGE |
| B7 | Delete TrainingLibrary.jsx (both copies) + remove from App.jsx | SMALL |
| B8 | Remaining "coming soon" placeholders (CreditScoreOptimizer, SocialListening, ReferralPartnerHub) | MEDIUM |
| B9 | NavConfig cleanup — remove redundant hub entries | SMALL |
| B10 | Static-only hubs — add Firebase connections (AnalyticsHub, CertificationAcademyHub, etc.) | LARGE |

### ✅ COMPLETED SESSION 7 (2/12)
- 80-hub audit: All hubs inventoried, 13 coming-soon placeholders eliminated, 1 crasher fixed
- CalendarSchedulingHub.jsx mega-enhancement (2,548 lines, 8 tabs)
- CollectionsARHub.jsx rebuilt (579→1,404 lines, 6 tabs)
- BureauCommunicationHub.jsx rebuilt (1,158→1,329 lines, 4 new tabs)
- ReportsHub.jsx rebuilt (2,232→2,261 lines, real Firebase data)
- LearningHub.jsx rebuilt (1,047→2,091 lines, 10 tabs from scratch — was crasher)
- TrainingLibrary.jsx identified as orphan to delete

### ✅ COMPLETED SESSION 6 (2/12)
- IDIQ Dispute API: 5 case blocks (+937 lines to index.js, now 12,987)
- AIDisputeGenerator.jsx: Security fix + IDIQ pipeline + fake data removed
- Payment architecture: NO STRIPE documented, Zelle+ACH+NMI stack
- End-to-end testing: Contract signing (works) + Client login (critical bugs found)

---

## 📋 NEXT SESSION CHECKLIST

1. **Read this file first** — single source of truth
2. **PRIORITY: Fix S1-S4 security issues** before any public access
3. **Check transcripts** at `/mnt/transcripts/` for detailed history
4. **index.js is now 12,987 lines** — verify line numbers before editing
5. **Never create new Cloud Functions** — add case blocks to existing ones
6. **Import AuthContext** as `'../../contexts/AuthContext'` (capital A, capital C)
7. **Use `lib/firebase.js`** for Firestore imports
8. **ContractSigningPortal V3.0** uses marker system — don't revert to DOM walker
9. **PublicContractSigningRoute** at `/sign/:token` is public (no auth)
10. **contractTemplates.js V3.0** generates markers: `__INITIAL_N__`, `__SIGNATURE__`, `__SCR_SIGNATURE__`, `__DATE__`
11. **SmartDashboard bell** is COMPLETE — reads from `staffNotifications` collection
12. **NO STRIPE** — Stripe/PayPal/Square all ban credit repair. Use NMI+Zelle+ACH.
13. **Auto-save every 30 min** to memory
14. **Update this file + LifecycleAudit.jsx** at end of every session
15. **Delete TrainingLibrary.jsx** (both copies) — orphan with fake data, LearningHub covers it
16. **LearningHub.jsx** is now 2,091 lines with all 10 tabs — don't rebuild
17. **CollectionsARHub.jsx** is now 1,404 lines with 6 tabs — don't rebuild
18. **BureauCommunicationHub.jsx** is now 1,329 lines with 4 new tabs — don't rebuild
19. **ReportsHub.jsx** uses real Firebase data — don't revert to fake setTimeout

---

*© 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved*