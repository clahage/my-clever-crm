# SPEEDYCRM_ARCHITECTURE.md
## Living Architecture Document — Last Updated: 2026-02-12 (Session 6 — IDIQ Dispute Pipeline + Payment Architecture Fix)

> **PURPOSE:** This file lives in Claude Project Knowledge. Every new Claude session reads this FIRST.
> At session end, handoff includes updates to this file so the next session starts informed.

---

## ðŸ—ï¸ PROJECT OVERVIEW

- **Product:** SpeedyCRM â€” AI-First Credit Repair CRM
- **URL:** https://myclevercrm.com
- **Owner:** Christopher Lahage, Speedy Credit Repair Inc. (Est. 1995)
- **Stack:** React 18 + Vite + Material-UI + Tailwind + Firebase + OpenAI
- **Status:** ~90% complete, 400+ files, 11,511-line Cloud Functions backend
- **Team:** Christopher (Owner/Dev), Laurie (Ops), Jordan (IT)

---

## ðŸ“ TOP 50 FILES BY SIZE (Active src/ + functions/)

| Lines | Path | Purpose |
|-------|------|---------|
| 11,511 | functions/index.js | ALL Cloud Functions (12 Gen2 exports) â€” was 11,021, +490 from contract signing cases |
| 6,363 | src/components/idiq/CompleteEnrollmentFlow.jsx | 10-phase enrollment flow |
| 5,478 | src/pages/hubs/ContactsPipelineHub.jsx | Pipeline hub (largest hub) |
| 5,348 | src/pages/SmartDashboard.jsx | Main CRM dashboard + bell notifications âœ… |
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
| 1,700 | src/App.jsx | Main app routing â€” +13 lines (route + import for contract signing) |
| 1,667 | functions/emailWorkflowEngine.js | Email automation engine |
| 1,639 | src/services/taskAIService.js | Task AI service |
| 1,638 | src/components/WorkflowOrchestrator.jsx | Workflow orchestration |
| 1,781 | src/components/client-portal/ContractSigningPortal.jsx | Contract signing (6 tabs) â€” V3.0 marker system, processDocumentHtml, event delegation |
| 1,589 | src/pages/Pipeline.jsx | Pipeline page |

### Key New/Updated Files (2/11)
| Lines | Path | Purpose |
|-------|------|---------|
| 1,781 | src/components/client-portal/ContractSigningPortal.jsx | Contract signing portal V3.0 â€” marker-based rendering, processDocumentHtml, event delegation, public signing props |
| 1,262 | src/utils/contractTemplates.js | Contract templates V3.0 â€” marker system (__INITIAL_N__, __SIGNATURE__, __SCR_SIGNATURE__, __DATE__), positive cancellation clause, 5-Day Right |
| 1,057 | src/components/client-portal/PublicContractSigningRoute.jsx | Premium public signing page â€” luxury design, token validation, animations, confetti |
| 5,348 | src/pages/SmartDashboard.jsx | Main CRM dashboard â€” QuickAccessPanel bell notifications from staffNotifications âœ… COMPLETE |

### Key Support Files
| Lines | Path | Purpose |
|-------|------|---------|
| 1,496 | functions/aiAdvancedFeatures.js | AI advanced capabilities |
| 1,434 | src/services/faxService.js | Telnyx fax service |
| 1,379 | functions/creditAnalysisEngine.js | Credit analysis engine |
| 1,279 | functions/emailMonitor.js | Email monitoring |
| 1,212 | src/pages/hubs/FaxCenter.jsx | Telnyx fax + health monitoring |
| 1,262 | src/utils/contractTemplates.js | Contract templates V3.0 â€” marker system |
| 1,111 | functions/AILeadScoringEngine.js | Lead scoring AI |
| 1,096 | functions/emailBrandingConfig.js | Email branding constants |
| 1,073 | functions/workflow/processSignedContract.js | Contract processing |
| 1,066 | functions/workflow/generateContract.js | Contract generation |
| 874 | src/layout/navConfig.js | Navigation configuration |
| 775 | src/layout/ProtectedLayout.jsx | Accordion nav + role filtering |

---

## ðŸ”„ LIFECYCLE STATUS (Updated 2026-02-11)

### Phase A: Contact Entry & AI Assessment â€” 100% âœ…
| Stage | Status | Location |
|-------|--------|----------|
| Contact created in Firestore | âœ… BUILT | onContactCreated (index.js) |
| AI role assessment (auto-assign lead) | âœ… BUILT | onContactCreated |
| Welcome email with enrollment link | âœ… BUILT 2/10 | onContactCreated â†’ emailTemplates.js |
| Speed-to-lead alert to staff | âœ… BUILT 2/10 | staffNotifications collection + real-time bell/toast |
| CRM dashboard notification | âœ… BUILT 2/11 | SmartDashboard QuickAccessPanel bell (staffNotifications collection, color-coded, time-ago) |

### Phase B: Lead Nurture (Pre-Enrollment) â€” 90%
| Stage | Status | Location |
|-------|--------|----------|
| Welcome email with enrollment link | âœ… BUILT 2/10 | onContactCreated |
| SMS welcome (Telnyx) | âš ï¸ PARTIAL | 48h/7d SMS in Rule 13 nurture |
| 4h/12h follow-up nudge | âœ… BUILT 2/10 | Rule 13 (AI=4h, Web=12h) |
| 24h drip (all sources) | âœ… BUILT 2/10 | Rule 13 (AI+Web 24h templates) |
| 48h consultation/report | âœ… BUILT 2/10 | Rule 13 (AI+Web 48h templates) |
| 7-day final attempt | âœ… BUILT 2/10 | Rule 13 + SMS |
| 14-day educational re-engagement | âœ… BUILT 2/10 | Rule 13 (web leads only) |

### Phase C: Enrollment Flow (10-Phase) â€” 100% âœ…
All 10 phases built and tested in CompleteEnrollmentFlow.jsx.
NMI payment integration complete. Abandonment recovery email active.

### Phase D: Post-Enrollment Automation â€” 95%
| Stage | Status | Location |
|-------|--------|----------|
| Welcome client email (portal access) | âœ… BUILT | onContactUpdated |
| **Contract signing via email link** | âœ… BUILT 2/11 | generateContractSigningLink â†’ PublicContractSigningRoute â†’ ContractSigningPortal V3.0 (marker system, 7 UX fixes) |
| Contract confirmation email | âœ… BUILT | onContactUpdated Scenario 3 |
| ACH setup request email | âœ… BUILT | onContactUpdated + scheduledEmails |
| Document reminder (24h) | âœ… BUILT 2/10 | Rule 14 |
| IDIQ upgrade reminders (7/14/18 day) | âœ… BUILT | Rule 3 |
| Post-ACH 30-day drip | âœ… BUILT | Rule 4 |

### Phase E: Active Client Lifecycle — 80%
| Stage | Status | Location |
|-------|--------|----------|
| AI dispute strategy generation | ✅ BUILT 2/12 | AIDisputeGenerator.jsx → idiqService (5 case blocks) |
| Dispute letter generation | ✅ BUILT 2/12 | aiContentGenerator disputeLetter case + AIDisputeGenerator.jsx |
| Bureau fax sending | âœ… BUILT 2/10 | FaxCenter.jsx + sendFaxOutbound |
| Fax health monitoring + auto-rotation | âœ… BUILT 2/10 | bureauFaxHealth + Telnyx webhook |
| Dispute result notifications | âœ… BUILT | Rule 7 |
| Monthly credit report re-pull | ✅ BUILT 2/12 | idiqService refreshCreditReport case block |
| Monthly progress report email | âœ… BUILT | Rule 8 |
| Score milestone celebrations | âœ… BUILT | Rule 9 |
| Payment failure notifications | âœ… BUILT 2/10 | NMI webhook â†’ nmiWebhook case |
| Staff notifications (bell/toast/chime) | âœ… BUILT 2/10 | staffNotifications collection |

### Phase F: Client Completion & Alumni â€” 60%
| Stage | Status | Location |
|-------|--------|----------|
| Graduation detection | âœ… BUILT | Rule 10 |
| Post-graduation maintenance tips | âœ… BUILT | Rule 10 |
| Review request + referral invite | âœ… BUILT | Rule 11 |
| Anniversary check-ins | âœ… BUILT | Rule 11 |
| Cancellation/offboarding flow | âŒ MISSING | No NMI cancel handler |
| Win-back campaign | âŒ MISSING | No rule |

### Phase G: Non-Signup Paths â€” 55%
| Stage | Status | Location |
|-------|--------|----------|
| Quiz lead nurture (24h+72h) | âœ… BUILT | Rule 12 |
| Landing page lead nurture | âœ… BUILT 2/10 | Rule 13 web leads |
| AI phone lead follow-up | âœ… BUILT 2/10 | Rule 13 AI leads |
| Opt-out / unsubscribe handling | âœ… BUILT 2/10 | CAN-SPAM: emailSuppressionList + GET unsubscribe |
| 90-day cold lead recycling | âŒ MISSING | No rule |

---

## ðŸ“ EMAIL-BASED CONTRACT SIGNING SYSTEM (Built 2/11)

### Architecture
Replaced DocuSign integration ($600-3,600/yr) with custom email signing links. $0/month, unlimited signatures.

### How It Works
1. **Staff** calls `generateContractSigningLink` with contactId + planId
2. **Backend** creates 64-char hex token in `contractSigningTokens`, sends branded email
3. **Client** clicks link â†’ `myclevercrm.com/sign/TOKEN` â†’ `PublicContractSigningRoute.jsx`
4. **Validates** token (not expired, not used) via `validateContractSigningToken`
5. **Signs** all 6 documents in `ContractSigningPortal` (signature, initials, ACH)
6. **Completes** â†’ `markContractSigningTokenUsed` + contact updated with `contractSigned: true`
7. **Triggers** existing `onContactUpdated` Scenario 3 automation (confirmation email, doc request, ACH setup)

### Backend Cases (in operationsManager)
- `generateContractSigningLink` â€” Creates token, sends email, logs activity, staff notification
- `validateContractSigningToken` â€” Validates token (expiry, used, contact lookup), records click
- `markContractSigningTokenUsed` â€” Marks token after signing complete

### Frontend Components
- `PublicContractSigningRoute.jsx` (1,057 lines) â€” Premium luxury design, Playfair Display + DM Sans fonts, gold+navy palette, staggered animations, confetti success screen, mobile-first
- `ContractSigningPortal.jsx` (1,613 lines) â€” Updated with `isPublicSigning`, `contactData`, `planData`, `onSigningComplete` props. Uses prop data instead of Firestore when in public mode.
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
- `contractSignedVia` ('email_link' | 'in_app') â€” tracks signing method

### DocuSign Status
**FULLY REMOVED** on 2/11. All code, secrets, and API access deleted. DocuSign developer account integration key cancelled. Zero DocuSign references remain in production code.

---

## âš™ï¸ CLOUD FUNCTIONS (12 Gen2 â€” NEVER ADD MORE)

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
- `sendStaffNotification` â€” Creates staffNotifications docs with priority/roles/chime
- `nmiWebhook` â€” Handles payment_failed, payment_success from NMI callbacks
- `adminSeedPlans` â€” One-time seeder for servicePlans collection (3 plans)
- `telnyx_fax` webhook â€” Fax delivery status â†’ faxLog + bureauFaxHealth
- `generateContractSigningLink` â€” Creates token + sends branded email (NEW 2/11)
- `validateContractSigningToken` â€” Validates public signing token (NEW 2/11)
- `markContractSigningTokenUsed` â€” Marks token after signing (NEW 2/11)

### CAN-SPAM Unsubscribe Handler
- GET `?unsubscribe=true&email=...&contactId=...` â†’ Shows confirmation page â†’ Adds to emailSuppressionList
- All email-sending functions check suppressionList before sending

**âš ï¸ CRITICAL:** Never create new Cloud Functions. Add actions as case blocks inside existing functions. Previous Claude instance deployed 173 functions = $2K+/mo bill.

---

## ðŸ’³ SERVICE PLANS (servicePlans Firestore Collection)

| Doc ID | Plan | Monthly | Setup | Per-Deletion | Popular |
|--------|------|---------|-------|-------------|---------|
| essentials | Essentials | $79 | $49 | $0 | â€” |
| professional | Professional | $149 | $0 | $25 | â­ Most Popular |
| vip | VIP Concierge | $299 | $0 | $0 | ðŸ‘‘ VIP |

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
| **CC/Debit (simulated)** | ⚠️ ADMIN ONLY | Admin can mark payment as received manually until real processor connected |

### 🔜 Future Payment Processing
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

## ðŸ“  FAX SYSTEM (Built 2/10)

### Architecture
1. **FaxCenter.jsx** (1,212 lines) â€” UI at `/fax-center`
2. **sendFaxOutbound** Cloud Function â€” Sends via Telnyx API
3. **Telnyx Webhook** â€” `operationsManager?webhook=telnyx_fax`
4. **bureauFaxHealth** â€” Per-number success tracking, auto-disables after 3 failures

### Bureau Fax Numbers (3 per bureau)
| Bureau | Primary | Backup 1 | Backup 2 |
|--------|---------|----------|----------|
| Experian | (972) 390-3837 | (714) 830-7505 | (972) 390-4970 |
| TransUnion | (610) 546-4606 | (610) 546-4605 | (602) 794-6189 |
| Equifax | (888) 826-0549 | (770) 375-2821 | (888) 388-2784 |

---

## ðŸ”” STAFF NOTIFICATION SYSTEM (Built 2/10, Bell Completed 2/11)

- staffNotifications collection with type, priority, title, message, targetRoles[], readBy{}
- Triggers: new lead, payment failure, fax failure, contract signing link sent
- **SmartDashboard bell: âœ… COMPLETE** â€” QuickAccessPanel sidebar (lines 4038-4177 in SmartDashboard.jsx) reads from staffNotifications with color-coded Bell icon, time-ago formatting, real-time display
- **ProtectedLayout bell: âœ… COMPLETE** â€” Accordion nav header has separate bell implementation

---

## âœï¸ CONTRACT SIGNING V3.0 MARKER SYSTEM (Built 2/11)

Templates generate HTML with explicit markers. The portal's `processDocumentHtml(docObj)` replaces them at render time:

| Marker | Replaced With | Used In |
|--------|--------------|---------|
| `__INITIAL_0__` through `__INITIAL_10__` | Clickable yellow/green buttons | Service Contract (Tab 2) |
| `__SIGNATURE__` | "â¬‡ Sign below â¬‡" or "âœ“ Signed" | Tabs 0-4 |
| `__SCR_SIGNATURE__` | Cursive "Christopher Lahage âœ“" | Service Contract (Tab 2) |
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

## ðŸ›¡ï¸ CAN-SPAM COMPLIANCE (Built 2/10)

- emailSuppressionList collection tracks opt-outs
- All email templates include unsubscribe footer
- Centralized guard in processAbandonmentEmails

---

## ðŸ› KNOWN ISSUES

### Functions Deploy: Secret Manager Auth
**Fix:** `firebase login --reauth` then `firebase deploy --only functions`. Auth token expiration issue.

### Vite Build Warnings (Non-blocking)
- `eval` warning in IDIQCreditReportViewer.jsx â€” cosmetic
- Large chunk warning (3MB) â€” consider code splitting in future

---

## ðŸ“ SESSION LOG

| Date | Session Focus | Key Changes |
|------|--------------|-------------|
| 2026-02-11 eve | Contract V3.0 Merge + Architecture | Merged V2 base + V3 fixes: contractTemplates.js 1,201â†’1,262 (marker system: __INITIAL_N__, __SIGNATURE__, __SCR_SIGNATURE__, __DATE__). ContractSigningPortal.jsx 1,776â†’1,781 (processDocumentHtml replaces DOM walker). 7 UX fixes: 5-Day Right rename, positive cancellation clause, click-to-initial, per-doc signature config, SCR auto-sig, submit logic, ACH form. SmartDashboard bell confirmed COMPLETE (5,348 lines, staffNotifications, QuickAccessPanel). |
| 2026-02-12 | IDIQ Dispute Pipeline + Payment Fix | 5 IDIQ case blocks (pullDisputeReport, getDisputeReport, submitIDIQDispute, getDisputeStatus, refreshCreditReport) added to idiqService. AIDisputeGenerator.jsx rewired: removed client-side OpenAI key, all AI via Cloud Functions, TransUnion→IDIQ API, Experian/Equifax→FaxCenter. Removed fake data. Payment: Stripe references purged, documented NMI+Zelle+ACH system. index.js 12,050→12,987 (+937 lines). |
| 2026-02-11 aft | Contract V3.0 Rebuild + Assessment | Rebuilt ContractSigningPortal from Christopher's 7-issue test report. Discovered V3.0 rebuild lost 1,173 lines vs V2.0. Decided on merge strategy: V2 base + V3 surgical fixes. |
| 2026-02-11 | DocuSign removal + Email signing + Premium design | Removed DocuSign (1,045 lines, 4 secrets). Built email contract signing (3 cases, 490 lines). PublicContractSigningRoute (1,057 lines premium design). ContractSigningPortal updated (1,559â†’1,613). App.jsx route added. index.js 11,021â†’11,511 (+490). |
| 2026-02-10 eve | Priorities 5-8 + Fax Health | NMI webhook, CAN-SPAM, servicePlans seed, FaxCenter 1,212 lines, Telnyx webhook, bureauFaxHealth, index.js 10,555â†’11,021 (+466) |
| 2026-02-10 aft | Priorities 1-4 | Welcome email, lead nurture drip (Rule 13, 9 templates), document reminder (Rule 14), staff notifications. index.js 9,237â†’10,555 (+1,318) |
| 2026-02-09 | A-to-Z workflow + bug fixes | Workflow chain connected, 3-plan system, 10 bug fixes |

---

## ðŸ”´ REMAINING CRITICAL FOR PUBLIC LAUNCH

| # | Task | Complexity | Why It Matters |
|---|------|-----------|----------------|
| 1 | **NMI Recurring Billing Wiring** | MEDIUM | NMI gateway built (paymentGateway.js). Zelle + ACH live to Chase. Need recurring subscription automation. **NO STRIPE** — Stripe/PayPal/Square all ban credit repair. Future: 5 Star Processing for CC/debit. |
| 2 | **Client Login Flow Test** | MEDIUM | Verify: client registers â†’ logs in â†’ sees ClientPortal â†’ correct data. |
| 3 | **Test Email Signing Flow End-to-End** | SMALL | Create test contact, fire generateContractSigningLink, click email, sign all 6 tabs with V3.0 markers, verify automation triggers. |

### ðŸŸ¡ IMPORTANT BUT NOT BLOCKING LAUNCH
| # | Task | Complexity |
|---|------|-----------|
| 4 | ~~IDIQ Dispute API wiring~~ | ✅ DONE 2/12 | pullDisputeReport, getDisputeReport, submitIDIQDispute, getDisputeStatus, refreshCreditReport |
| 5 | ~~Monthly credit report re-pull~~ | ✅ DONE 2/12 | idiqService refreshCreditReport case block |
| 6 | Cancellation/offboarding flow | MEDIUM |
| 7 | Win-back campaign for cancelled clients | SMALL |
| 8 | 90-day cold lead recycling | SMALL |
| 9 | Hub consolidation (BillingHub+BillingPaymentsHub, etc.) | MEDIUM |
| 10 | Pipeline Tab upgrade to T3 (120+ AI features) | LARGE |
| 11 | SignatureAdoptionModal UX upgrade (adopt once, click to place) | SMALL |

---

## ðŸ“‹ NEXT SESSION CHECKLIST

1. **Read this file first** â€” single source of truth
2. **Check transcripts** at `/mnt/transcripts/` for detailed implementation history
3. **index.js is now 12,987 lines** — verify line numbers before editing
4. **Never create new Cloud Functions** â€” add case blocks to existing ones
5. **Import AuthContext** as `'../../contexts/AuthContext'` (capital A, capital C)
6. **Use `lib/firebase.js`** for Firestore imports
7. **ContractSigningPortal V3.0** uses marker system â€” don't revert to DOM walker or old `____ (initial)` patterns
8. **PublicContractSigningRoute** at `/sign/:token` is public (no auth) â€” don't wrap in ProtectedRoute
9. **contractTemplates.js V3.0** generates markers: `__INITIAL_N__`, `__SIGNATURE__`, `__SCR_SIGNATURE__`, `__DATE__`
10. **SmartDashboard bell** is COMPLETE â€” reads from `staffNotifications` collection, same as ProtectedLayout
11. **Auto-save every 30 min** to memory (task, files, code, next steps)
12. **Update this file + LifecycleAudit.jsx** at end of every session

---

*Â© 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved*