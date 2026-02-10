# SPEEDYCRM_ARCHITECTURE.md
## Living Architecture Document — Last Updated: 2026-02-10

> **PURPOSE:** This file lives in Claude Project Knowledge. Every new Claude session reads this FIRST.
> At session end, handoff includes updates to this file so the next session starts informed.

---

## 🏗️ PROJECT OVERVIEW

- **Product:** SpeedyCRM — AI-First Credit Repair CRM
- **URL:** https://myclevercrm.com
- **Owner:** Christopher Lahage, Speedy Credit Repair Inc. (Est. 1995)
- **Stack:** React 18 + Vite + Material-UI + Tailwind + Firebase + OpenAI
- **Status:** ~87% complete, 400+ files, 9,237-line Cloud Functions backend
- **Team:** Christopher (Owner/Dev), Laurie (Ops), Jordan (IT)

---

## 📁 TOP 50 FILES BY SIZE (Active src/ + functions/)

| Lines | Path | Purpose |
|-------|------|---------|
| 9,237 | functions/index.js | ALL Cloud Functions (12 Gen2 exports) |
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
| 1,918 | functions/emailTemplates.js | 25+ email templates (AI-powered) |
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

## 🔄 LIFECYCLE STATUS (Updated 2026-02-10)

### Phase A: Contact Entry & AI Assessment — 75%
| Stage | Status | Location |
|-------|--------|----------|
| Contact created in Firestore | ✅ BUILT | onContactCreated (index.js) |
| AI role assessment (auto-assign lead) | ✅ BUILT | onContactCreated |
| **Welcome email with enrollment link** | ✅ BUILT 2/10 | onContactCreated → emailTemplates.js |
| Speed-to-lead alert to staff | ⚠️ PARTIAL | onContactUpdated (enrollment only) |
| CRM dashboard notification | ❌ MISSING | SmartDashboard |

### Phase B: Lead Nurture (Pre-Enrollment) — 80%
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

### Phase E: Active Client Lifecycle — 40%
| Stage | Status | Location |
|-------|--------|----------|
| AI dispute strategy generation | ❌ MISSING | Needs IDIQ dispute API wiring |
| Dispute letter generation | ❌ MISSING | DisputeHub planned |
| Dispute result notifications | ✅ BUILT | Rule 7 |
| Monthly credit report re-pull | ❌ MISSING | Needs scheduled function |
| Monthly progress report email | ✅ BUILT | Rule 8 |
| Score milestone celebrations | ✅ BUILT | Rule 9 |
| Payment failure notifications | ❌ MISSING | Needs NMI webhook |
| Client portal notifications | ❌ MISSING | No real-time bell/toast |

### Phase F: Client Completion & Alumni — 60%
| Stage | Status | Location |
|-------|--------|----------|
| Graduation detection | ✅ BUILT | Rule 10 |
| Post-graduation maintenance tips | ✅ BUILT | Rule 10 |
| Review request + referral invite | ✅ BUILT | Rule 11 |
| Anniversary check-ins | ✅ BUILT | Rule 11 |
| Cancellation/offboarding flow | ❌ MISSING | No NMI cancel handler |
| Win-back campaign | ❌ MISSING | No rule |

### Phase G: Non-Signup Paths — 20%
| Stage | Status | Location |
|-------|--------|----------|
| Quiz lead nurture (24h+72h) | ✅ BUILT | Rule 12 |
| Landing page lead nurture | ❌ MISSING | Critical gap |
| AI phone lead follow-up | ⚠️ PARTIAL | Creates contact, no drip |
| Opt-out / unsubscribe handling | ❌ MISSING | CAN-SPAM compliance needed |
| 90-day cold lead recycling | ❌ MISSING | No rule |

---

## 🎯 CURRENT PRIORITIES (Updated 2026-02-10)

| # | Task | Status | Impact |
|---|------|--------|--------|
| 1 | Lead welcome email + enrollment link | ✅ DONE 2/10 | Every new lead gets email |
| 2 | Universal lead nurture drip (all sources) | ✅ DONE 2/10 | 9 templates, 13 rules, SMS |
| 3 | Document reminder email (24h) | ✅ DONE 2/10 | Nudges enrolled clients to upload docs |
| 4 | Staff notification system | 🔜 NEXT | Speed-to-lead alerts |
| 5 | Payment failure webhook (NMI) | PLANNED | Prevents silent revenue loss |
| 6 | CAN-SPAM opt-out/unsubscribe | PLANNED | Legal compliance |

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
| servicePlans | Plan definitions | name, price, features |

---

## ⚙️ CLOUD FUNCTIONS (12 Gen2 Exports)

| Export | Type | Purpose |
|--------|------|---------|
| emailService | onCall | Send emails via Gmail SMTP |
| receiveAIReceptionistCall | onRequest | Webhook for AI phone calls |
| processAICall | onCall | Process AI call transcripts |
| onContactUpdated | onDocumentUpdated | Enrollment completion + email automation |
| onContactCreated | onDocumentCreated | AI role assessment + welcome email |
| idiqService | onCall | IDIQ enrollment + credit reports |
| processWorkflowStages | onSchedule (hourly) | Workflow advancement + IDIQ reminders |
| processAbandonmentEmails | onSchedule (5 min) | 12 lifecycle rules, 24 email types |
| aiContentGenerator | onCall | AI content generation |
| operationsManager | onRequest | Multi-action REST endpoint |
| sendFaxOutbound | onRequest | Telnyx fax sending |
| enrollmentSupportService | onCall | Enrollment support actions |

**⚠️ CRITICAL:** Never create new functions. Add actions as case blocks inside existing functions.

---

## 📝 SESSION LOG

| Date | Session Focus | Key Changes |
|------|--------------|-------------|
| 2026-02-10 | Lifecycle audit + Priorities 1-3 | Welcome email on contact creation (Rule 0), universal lead nurture drip (Rule 13, 9 templates), document reminder 24h (Rule 14). index.js now 9,771 lines, 14 rules, 34 email types. |
| 2026-02-09 | A-to-Z workflow connection | Workflow chain connected, 3-plan system updated |
| 2026-02-09 | Bug fixes (10 bugs) | NMI payment, IDIQ retry, email fixes, localStorage isolation |

---

*© 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved*