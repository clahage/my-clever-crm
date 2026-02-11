# SPEEDYCRM_ARCHITECTURE.md
## Living Architecture Document — Last Updated: 2026-02-11 (Session 3 — DocuSign Removal + Email Signing)

> **PURPOSE:** This file lives in Claude Project Knowledge. Every new Claude session reads this FIRST.
> At session end, handoff includes updates to this file so the next session starts informed.

---

## 🏗️ PROJECT OVERVIEW

- **Product:** SpeedyCRM — AI-First Credit Repair CRM
- **URL:** https://myclevercrm.com
- **Owner:** Christopher Lahage, Speedy Credit Repair Inc. (Est. 1995)
- **Stack:** React 18 + Vite + Material-UI + Tailwind + Firebase + OpenAI
- **Status:** ~90% complete, 400+ files, 11,511-line Cloud Functions backend
- **Team:** Christopher (Owner/Dev), Laurie (Ops), Jordan (IT)

---

## 📐 TOP 50 FILES BY SIZE (Active src/ + functions/)

| Lines | Path | Purpose |
|-------|------|---------|
| 11,511 | functions/index.js | ALL Cloud Functions (12 Gen2 exports) — was 11,021, +490 from contract signing cases |
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
| 1,700 | src/App.jsx | Main app routing — +13 lines (route + import for contract signing) |
| 1,667 | functions/emailWorkflowEngine.js | Email automation engine |
| 1,639 | src/services/taskAIService.js | Task AI service |
| 1,638 | src/components/WorkflowOrchestrator.jsx | Workflow orchestration |
| 1,613 | src/components/client-portal/ContractSigningPortal.jsx | Contract signing (6 tabs) — UPDATED 2/11 with public signing props |
| 1,589 | src/pages/Pipeline.jsx | Pipeline page |

### Key New/Updated Files (2/11)
| Lines | Path | Purpose |
|-------|------|---------|
| 1,613 | src/components/client-portal/ContractSigningPortal.jsx | Contract signing portal — UPDATED with isPublicSigning, contactData, planData, onSigningComplete props |
| 1,057 | src/pages/PublicContractSigningRoute.jsx | NEW: Premium public signing page — luxury design, animations, confetti success screen |

### Key Support Files
| Lines | Path | Purpose |
|-------|------|---------|
| 1,496 | functions/aiAdvancedFeatures.js | AI advanced capabilities |
| 1,434 | src/services/faxService.js | Telnyx fax service |
| 1,379 | functions/creditAnalysisEngine.js | Credit analysis engine |
| 1,279 | functions/emailMonitor.js | Email monitoring |
| 1,212 | src/pages/hubs/FaxCenter.jsx | Telnyx fax + health monitoring |
| 1,201 | src/utils/contractTemplates.js | Contract PDF templates |
| 1,111 | functions/AILeadScoringEngine.js | Lead scoring AI |
| 1,096 | functions/emailBrandingConfig.js | Email branding constants |
| 1,073 | functions/workflow/processSignedContract.js | Contract processing |
| 1,066 | functions/workflow/generateContract.js | Contract generation |
| 874 | src/layout/navConfig.js | Navigation configuration |
| 775 | src/layout/ProtectedLayout.jsx | Accordion nav + role filtering |

---

## 🔄 LIFECYCLE STATUS (Updated 2026-02-11)

### Phase A: Contact Entry & AI Assessment — 95%
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
| **Contract signing via email link** | ✅ BUILT 2/11 | generateContractSigningLink → PublicContractSigningRoute → ContractSigningPortal |
| Contract confirmation email | ✅ BUILT | onContactUpdated Scenario 3 |
| ACH setup request email | ✅ BUILT | onContactUpdated + scheduledEmails |
| Document reminder (24h) | ✅ BUILT 2/10 | Rule 14 |
| IDIQ upgrade reminders (7/14/18 day) | ✅ BUILT | Rule 3 |
| Post-ACH 30-day drip | ✅ BUILT | Rule 4 |

### Phase E: Active Client Lifecycle — 55%
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

## 📝 EMAIL-BASED CONTRACT SIGNING SYSTEM (Built 2/11)

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
- `ContractSigningPortal.jsx` (1,613 lines) — Updated with `isPublicSigning`, `contactData`, `planData`, `onSigningComplete` props. Uses prop data instead of Firestore when in public mode.
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

## ⚙️ CLOUD FUNCTIONS (12 Gen2 — NEVER ADD MORE)

| Function | Type | Purpose |
|----------|------|---------|
| receiveAIReceptionistCall | onRequest | Webhook for AI phone calls |
| processAICall | onCall | Process AI call transcripts |
| onContactUpdated | onDocumentUpdated | Enrollment completion + email automation |
| onContactCreated | onDocumentCreated | AI role assessment + welcome email |
| idiqService | onCall | IDIQ enrollment + credit reports |
| processWorkflowStages | onSchedule (hourly) | Workflow advancement + IDIQ reminders |
| processAbandonmentEmails | onSchedule (5 min) | 14 lifecycle rules, 34+ email types |
| aiContentGenerator | onCall | AI content generation + recommendServicePlan |
| operationsManager | onRequest | Multi-action REST endpoint (43+ cases) |
| sendFaxOutbound | onRequest | Telnyx fax + webhookUrl + bureauFaxHealth |
| enrollmentSupportService | onCall | Enrollment support actions |

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

## 🔔 STAFF NOTIFICATION SYSTEM (Built 2/10)

- staffNotifications collection with type, priority, title, message, targetRoles[], readBy{}
- Triggers: new lead, payment failure, fax failure, contract signing link sent
- Frontend needs: bell icon widget in SmartDashboard/ProtectedLayout header

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

## 📝 SESSION LOG

| Date | Session Focus | Key Changes |
|------|--------------|-------------|
| 2026-02-11 | DocuSign removal + Email signing + Premium design | Removed DocuSign (1,045 lines, 4 secrets). Built email contract signing (3 cases, 490 lines). PublicContractSigningRoute (1,057 lines premium design). ContractSigningPortal updated (1,559→1,613). App.jsx route added. index.js 11,021→11,511 (+490). |
| 2026-02-10 eve | Priorities 5-8 + Fax Health | NMI webhook, CAN-SPAM, servicePlans seed, FaxCenter 1,212 lines, Telnyx webhook, bureauFaxHealth, index.js 10,555→11,021 (+466) |
| 2026-02-10 aft | Priorities 1-4 | Welcome email, lead nurture drip (Rule 13, 9 templates), document reminder (Rule 14), staff notifications. index.js 9,237→10,555 (+1,318) |
| 2026-02-09 | A-to-Z workflow + bug fixes | Workflow chain connected, 3-plan system, 10 bug fixes |

---

## 🔴 REMAINING CRITICAL FOR PUBLIC LAUNCH

| # | Task | Complexity | Why It Matters |
|---|------|-----------|----------------|
| 1 | **Stripe/NMI Recurring Billing** | LARGE | Need recurring subscription management. NMI handles enrollment payment, but ongoing monthly billing needs wiring. |
| 2 | **Client Login Flow Test** | MEDIUM | Verify: client registers → logs in → sees ClientPortal → correct data. |
| 3 | **SmartDashboard Bell Widget** | SMALL | staffNotifications exists, just needs bell icon reading from it. |
| 4 | **Test Email Signing Flow End-to-End** | SMALL | Create test contact, fire generateContractSigningLink, click email, sign, verify automation triggers. |

### 🟡 IMPORTANT BUT NOT BLOCKING LAUNCH
| # | Task | Complexity |
|---|------|-----------|
| 5 | IDIQ Dispute API wiring (auto-generate dispute letters) | LARGE |
| 6 | Monthly credit report re-pull (scheduled function) | MEDIUM |
| 7 | Cancellation/offboarding flow | MEDIUM |
| 8 | Win-back campaign for cancelled clients | SMALL |
| 9 | 90-day cold lead recycling | SMALL |
| 10 | Hub consolidation (BillingHub+BillingPaymentsHub, etc.) | MEDIUM |
| 11 | Pipeline Tab upgrade to T3 (120+ AI features) | LARGE |

---

## 📋 NEXT SESSION CHECKLIST

1. **Read this file first** — single source of truth
2. **Check transcripts** at `/mnt/transcripts/` for detailed implementation history
3. **index.js is now 11,511 lines** — verify line numbers before editing
4. **Never create new Cloud Functions** — add case blocks to existing ones
5. **Import AuthContext** as `'../../contexts/AuthContext'` (capital A, capital C)
6. **Use `lib/firebase.js`** for Firestore imports
7. **ContractSigningPortal** now accepts public signing props — don't break these
8. **PublicContractSigningRoute** at `/sign/:token` is public (no auth) — don't wrap in ProtectedRoute
9. **Auto-save every 30 min** to memory (task, files, code, next steps)

---

*© 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved*