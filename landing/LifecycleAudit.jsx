import { useState } from "react";

// ============================================================================
// SpeedyCRM COMPLETE LIFECYCLE AUDIT — Updated 2026-02-13 (Session 9)
// Maps every contact path from entry → outcome, showing built vs missing
// Reflects: 2/9 workflow, 2/10 email/fax, 2/11 contract V3.0, 2/12 IDIQ disputes + E2E testing + 80-hub audit + crasher fixes + 2/13 AI services TIER 5+ upgrade + CreditReportReParser + 6 Cloud Function cases
// ============================================================================

const COLORS = {
  built: "#10b981",      // Green — working in production
  partial: "#f59e0b",    // Amber — code exists but gaps remain
  missing: "#ef4444",    // Red — not built yet
  bg: "#0f172a",
  card: "#1e293b",
  cardHover: "#334155",
  text: "#e2e8f0",
  muted: "#94a3b8",
  accent: "#3b82f6",
  border: "#334155",
};

const StatusBadge = ({ status }) => {
  const map = {
    built: { bg: "#065f46", text: "#6ee7b7", label: "✅ BUILT" },
    partial: { bg: "#78350f", text: "#fcd34d", label: "⚠️ PARTIAL" },
    missing: { bg: "#7f1d1d", text: "#fca5a5", label: "❌ MISSING" },
  };
  const s = map[status];
  return (
    <span style={{ background: s.bg, color: s.text, padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
};

const ENTRY_POINTS = [
  { id: "ai_phone", label: "AI Receptionist Call", icon: "📞", status: "built", detail: "receiveAIReceptionistCall → processAICall → creates contact with roles=['contact','lead'], leadScore, sentiment. Welcome email fires automatically via onContactCreated." },
  { id: "landing", label: "Landing Page / Website Form", icon: "🌐", status: "built", detail: "captureWebLead / landingPageContact in operationsManager → creates contact → onContactCreated sends welcome email + Rule 13 nurture drip (12h, 24h, 48h, 7d, 14d)" },
  { id: "quiz", label: "Quiz Funnel", icon: "🧩", status: "built", detail: "Quiz creates contact → Rule 12 sends 24h + 72h nurture emails. Rule 13 also covers quiz leads with extended drip." },
  { id: "manual", label: "Manual CRM Entry (Staff)", icon: "👤", status: "built", detail: "UltimateContactForm.jsx → creates contact → onContactCreated triggers AI role assessment + welcome email + enrollment link" },
  { id: "email_sign", label: "Email Contract Signing Link", icon: "✉️", status: "built", detail: "BUILT 2/11, V3.0 2/11: Staff sends signing link via generateContractSigningLink → client clicks → signs at /sign/TOKEN → ContractSigningPortal V3.0 (marker system, 11 click-to-initial, 5-Day Right, positive cancellation, SCR auto-sig) → triggers Scenario 3 automation." },
  { id: "social", label: "Facebook / Instagram / Google", icon: "⭐", status: "built", detail: "BUILT 2/12: facebookWebhook case in operationsManager auto-creates contacts from FB/IG DMs ($0 cost). Google Reviews planned via Claude Code. Yelp skipped (paid API, not worth it)." },
  { id: "affiliate", label: "Affiliate / Referral Partner", icon: "🤝", status: "missing", detail: "No affiliate portal, tracking links, or commission system. ReferralEngineHub exists as placeholder only" },
  { id: "walkin", label: "Walk-in / Phone Call (Non-AI)", icon: "🚶", status: "built", detail: "Manual entry by staff via UltimateContactForm with source='walk_in' or 'phone_call'. Same automation triggers as all contacts." },
];

const LIFECYCLE_STAGES = [
  {
    phase: "A",
    title: "Contact Entry & AI Assessment",
    stages: [
      { label: "Contact Created in Firestore", status: "built", where: "onContactCreated (index.js)", notes: "Fires on any new contacts/{id} document. Triggers AI role assessment, welcome email, staff notification." },
      { label: "AI Role Assessment (auto-assign 'lead')", status: "built", where: "onContactCreated", notes: "Checks source, leadScore, email/phone presence, AI interactions → assigns 'lead' role to roles[] array" },
      { label: "Welcome Email with Enrollment Link", status: "built", where: "onContactCreated → emailTemplates.js", notes: "BUILT 2/10: Every new contact with email immediately gets branded welcome email with personalized enrollment link" },
      { label: "Speed-to-Lead Alert to SCR Staff", status: "built", where: "staffNotifications collection", notes: "BUILT 2/10: Creates staffNotification with priority, targetRoles, real-time onSnapshot listener for bell/toast/chime" },
      { label: "CRM Dashboard Notification", status: "built", where: "SmartDashboard.jsx QuickAccessPanel (lines 4038-4177)", notes: "BUILT 2/11: Bell icon in QuickAccessPanel sidebar reads from staffNotifications collection with color-coded types, time-ago formatting. Same collection as ProtectedLayout bell." },
    ]
  },
  {
    phase: "B",
    title: "Lead Nurture (Pre-Enrollment)",
    stages: [
      { label: "Welcome/Intro Email with Enrollment Link", status: "built", where: "onContactCreated", notes: "BUILT 2/10: Fires automatically for every new contact. Branded email with enrollment link, trust badges, plan preview." },
      { label: "SMS Welcome (Telnyx)", status: "built", where: "onContactCreated in index.js", notes: "BUILT 2/12: Instant Telnyx SMS on contact creation. Speed-to-lead (5 min = 21x conversion). Validates US phone, personalized text, logs to interactions subcollection." },
      { label: "4h/12h Follow-Up Nudge", status: "built", where: "Rule 13 in processAbandonmentEmails", notes: "BUILT 2/10: AI leads get 4h nudge, web leads get 12h nudge. Different templates per source." },
      { label: "24-Hour Drip (All Sources)", status: "built", where: "Rule 13 in processAbandonmentEmails", notes: "BUILT 2/10: Universal drip covers AI phone, landing page, quiz, and manual leads. 9 unique templates." },
      { label: "48h Consultation/Free Report Offer", status: "built", where: "Rule 13 in processAbandonmentEmails", notes: "BUILT 2/10: AI leads get consultation offer, web leads get free credit report offer at 48h mark." },
      { label: "7-Day Final Attempt + SMS", status: "built", where: "Rule 13 + Telnyx SMS", notes: "BUILT 2/10: Last-chance email + SMS combo. Creates urgency with deadline language." },
      { label: "14-Day Educational Re-engagement", status: "built", where: "Rule 13 (web leads only)", notes: "BUILT 2/10: Web leads who haven't engaged in 14 days get educational content email about credit repair benefits." },
    ]
  },
  {
    phase: "C",
    title: "Enrollment Flow (10-Phase)",
    stages: [
      { label: "Phase 1: Personal Info + Portal Account", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "Creates portal account, validates fields, stores to Firestore" },
      { label: "Phase 2: IDIQ Enrollment + Credit Report", status: "built", where: "CompleteEnrollmentFlow.jsx + idiqService", notes: "Enrolls with IDIQ Partner 11981, pulls credit report, handles verification questions" },
      { label: "Phase 3: AI Credit Analysis + Review", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "Shows credit report widget, projected improvement (dynamic), floating Continue timer" },
      { label: "Phase 4: Document Upload", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "Photo ID, utility bill, SSN card, bank statements" },
      { label: "Phase 5: Service Plan Selection", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "3 plans: Essentials $79/mo, Professional $149/mo (most popular), VIP Concierge $299/mo" },
      { label: "Phase 6: Contract Signing", status: "built", where: "ContractSigningPortal.jsx V3.0 (1,781 lines)", notes: "6 tabs: Info Statement, Privacy Notice, Service Contract (11 initials), ACH Auth, POA, 5-Day Right. V3.0 marker system (__INITIAL_N__, __SIGNATURE__, __SCR_SIGNATURE__, __DATE__). Also available via email link (2/11)." },
      { label: "Phase 7: Payment (NMI)", status: "built", where: "CompleteEnrollmentFlow.jsx + operationsManager", notes: "ACH + Credit Card via NMI, vault tokenization, recurring billing setup" },
      { label: "Phase 8-10: Celebration + Next Steps", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "Confetti, portal access link, what to expect timeline" },
      { label: "Enrollment Abandonment Recovery", status: "built", where: "processAbandonmentEmails", notes: "If enrollmentStatus='started' and 5+ minutes passed, sends recovery email with resume link" },
    ]
  },
  {
    phase: "D",
    title: "Post-Enrollment & Contract Signing",
    stages: [
      { label: "Welcome Email (Portal Access)", status: "built", where: "onContactUpdated Scenario 1", notes: "Fires when enrollmentStatus changes to 'enrolled'. Sends branded portal access email." },
      { label: "Email Contract Signing Link", status: "built", where: "generateContractSigningLink (operationsManager)", notes: "BUILT 2/11, V3.0: Staff sends branded email → client clicks → signs at /sign/TOKEN → premium PublicContractSigningRoute → ContractSigningPortal V3.0 with marker system. Zero cost (replaced DocuSign)." },
      { label: "Contract Signed → Confirmation Email", status: "built", where: "onContactUpdated Scenario 3", notes: "Auto-fires when contractSigned=true. Sends confirmation + triggers doc request + ACH setup." },
      { label: "ACH Setup Request (4h delay)", status: "built", where: "onContactUpdated Scenario 3 + scheduledEmails", notes: "Schedules ACH setup request email 4 hours after contract signing to avoid email overload." },
      { label: "Document Reminder (24h if docs missing)", status: "built", where: "Rule 14 in processAbandonmentEmails", notes: "BUILT 2/10: If docs not uploaded within 24h of enrollment, sends gentle reminder email." },
      { label: "IDIQ Upgrade Reminders (Day 7, 14, 18)", status: "built", where: "Rule 3 in processWorkflowStages", notes: "Reminds clients to upgrade IDIQ from trial if not done. 3-touch sequence." },
      { label: "Post-ACH 30-Day Drip Campaign", status: "built", where: "Rule 4 in processAbandonmentEmails", notes: "7 drip emails over 30 days: welcome, education, tips, check-in, anticipation, bureau window, next round" },
    ]
  },
  {
    phase: "E",
    title: "Active Client Lifecycle",
    stages: [
      { label: "AI Credit Analysis → Dispute Strategy", status: "built", where: "AIDisputeGenerator.jsx → idiqService Cloud Function", notes: "BUILT 2/12: 5-step wizard (analyze → select → strategy → generate → send). TransUnion via IDIQ API (pullDisputeReport → getDisputeReport → submitIDIQDispute). Experian/Equifax via FaxCenter. All AI routed through aiContentGenerator Cloud Function." },
      { label: "Dispute Letter Generation", status: "built", where: "aiContentGenerator disputeLetter case + AIDisputeGenerator.jsx", notes: "BUILT 2/12: Cloud Function generates FCRA-compliant letters. Claim code mapping: factual_error→INACCURATE, validation→NOT_MINE, outdated→OUTDATED, fraud→FRAUD. Handles per-bureau strategy." },
      { label: "Bureau Fax Sending (Disputes)", status: "built", where: "FaxCenter.jsx (1,212 lines) + sendFaxOutbound", notes: "BUILT 2/10: Telnyx fax integration with smart auto-rotation, 3 numbers per bureau, health monitoring." },
      { label: "Fax Health Monitoring + Auto-Rotation", status: "built", where: "bureauFaxHealth + Telnyx webhook", notes: "BUILT 2/10: Auto-disables numbers after 3 consecutive failures, switches to backup, sends staff notification." },
      { label: "Bureau Response Tracking", status: "built", where: "BureauCommunicationHub.jsx (1,329 lines)", notes: "BUILT 2/12 S7: Response Manager tab with outcome→dispute status mapping, Bulk Operations tab for batch actions, Bureau-specific Analytics (Experian/Equifax/TransUnion), Settings." },
      { label: "Dispute Result Notifications", status: "built", where: "Rule 7 in processAbandonmentEmails", notes: "Checks disputeResults collection, emails client when results arrive with details." },
      { label: "Monthly Credit Report Re-Pull", status: "built", where: "idiqService refreshCreditReport case block", notes: "BUILT 2/12: Pulls new report via IDIQ, compares scores vs previous, calculates deltas, logs to creditReportHistory collection." },
      { label: "Monthly Progress Report Email", status: "built", where: "Rule 8 in processAbandonmentEmails", notes: "Sends monthly progress email with score changes, items removed, timeline." },
      { label: "Score Milestone Celebrations", status: "built", where: "Rule 9 in processAbandonmentEmails", notes: "Celebrates 50+ and 100+ point score improvements with branded email + confetti." },
      { label: "Collections & Accounts Receivable", status: "built", where: "CollectionsARHub.jsx (1,404 lines)", notes: "BUILT 2/12 S7: 6 tabs — Collections, Payment Plans, Automation, Templates, Analytics, Settings. AI Collections Engine with prioritizeAccounts(), calculateRecoveryMetrics(), suggestPaymentPlan(). Firebase: collectionCases, paymentPlans, collectionRules, collectionTemplates." },
      { label: "Payment Failure Notifications", status: "built", where: "nmiWebhook case in operationsManager", notes: "BUILT 2/10: NMI webhook catches payment_failed → emails client + staff notification + logs to paymentLogs. 6-action flow." },
      { label: "Staff Real-Time Notifications", status: "built", where: "staffNotifications collection", notes: "BUILT 2/10: Triggers on new lead, payment failure, fax failure, contract sent. Real-time onSnapshot with bell/toast/chime." },
    ]
  },
  {
    phase: "F",
    title: "Client Completion & Alumni",
    stages: [
      { label: "Graduation Detection (Score Goal Met)", status: "built", where: "Rule 10 in processAbandonmentEmails", notes: "Detects when client reaches target score, sends graduation email" },
      { label: "Post-Graduation Maintenance Tips", status: "built", where: "Rule 10 continuation", notes: "Sends tips on maintaining good credit after graduation" },
      { label: "Review Request + Referral Invite", status: "built", where: "Rule 11 in processAbandonmentEmails", notes: "Asks for Google review, invites to refer friends" },
      { label: "Anniversary Check-ins", status: "built", where: "Rule 11 continuation", notes: "Annual check-in emails" },
      { label: "Cancellation / Offboarding Flow", status: "built", where: "cancelSubscription case in operationsManager", notes: "BUILT 2/12: NMI subscription cancel + IDIQ membership cancel + confirmation email + staff notification + exit survey task + activity log. Contact status→cancelled, roles updated. Triggers Rule 15 win-back." },
      { label: "Win-Back Campaign (30/60/90 Day)", status: "built", where: "Rule 15 in processAbandonmentEmails", notes: "BUILT 2/12: 3 re-engagement emails for cancelled clients. 30d=comeback offer (waive setup fee), 60d=free credit health check, 90d=priority restart with discount. Checks emailSuppressionList." },
    ]
  },
  {
    phase: "G",
    title: "Non-Signup Paths (Contact Never Enrolls)",
    stages: [
      { label: "Quiz Lead → 24h + 72h Nurture", status: "built", where: "Rule 12 in processAbandonmentEmails", notes: "Quiz leads get 2 follow-up emails" },
      { label: "Landing Page Lead → Nurture Sequence", status: "built", where: "Rule 13 in processAbandonmentEmails", notes: "BUILT 2/10: Web leads get 6-touch sequence over 14 days (12h, 24h, 48h, 7d sms, 7d email, 14d)" },
      { label: "AI Phone Lead → Call Summary + Follow-Up", status: "built", where: "processAICall + Rule 13", notes: "BUILT 2/10: AI call creates contact → onContactCreated welcome email → Rule 13 drip (4h, 24h, 48h, 7d)" },
      { label: "Do Not Contact / Opt-Out Handling", status: "built", where: "CAN-SPAM unsubscribe handler", notes: "BUILT 2/10: emailSuppressionList collection + GET ?unsubscribe=true handler + confirmation page. All emails check suppression before sending." },
      { label: "Lead Recycling (90-Day Cold → Re-Engage)", status: "built", where: "Rule 16 in processAbandonmentEmails", notes: "BUILT 2/12: Contacts with roles=['lead'] created 90+ days ago who never enrolled. Re-engagement email with free credit analysis offer. Checks suppressionList." },
    ]
  },
  {
    phase: "H",
    title: "CRM Hub Quality & Completeness",
    stages: [
      { label: "80-Hub Audit Completed", status: "built", where: "All 80 hubs in src/pages/hubs/", notes: "COMPLETED 2/12 S7: Full inventory of all 80 hubs. Identified 10 'coming soon' placeholders across 9 hubs, 3 suspected crashers, and orphan files." },
      { label: "Coming Soon Placeholders Eliminated (13 of 18)", status: "built", where: "CollectionsARHub, BureauCommunicationHub, ReportsHub, LearningHub", notes: "BUILT 2/12 S7: Eliminated 13 placeholders + 1 TODO with fake data across 4 rebuilt files. Remaining 5: CreditScoreOptimizer (1), SocialListening (1), ReferralPartnerHub (3)." },
      { label: "Crasher Files Fixed", status: "built", where: "LearningHub.jsx", notes: "FIXED 2/12 S7: LearningHub had 10 tabs declared but 0 rendered (white screen crasher). Rebuilt all 10 tabs (1,047→2,091 lines). TrainingLibrary.jsx and CampaignPlanner.jsx confirmed NOT crashers." },
      { label: "CalendarSchedulingHub Mega-Enhancement", status: "built", where: "CalendarSchedulingHub.jsx (2,548 lines)", notes: "BUILT 2/12 S7: 8-tab hub built by Christopher." },
      { label: "ReportsHub Real Data", status: "built", where: "ReportsHub.jsx (2,261 lines)", notes: "REBUILT 2/12 S7: Replaced fake setTimeout + hardcoded insights with real Firebase queries (contacts, bureauDisputes, invoices). Conditional AI recommendations." },
      { label: "TrainingLibrary.jsx Cleanup", status: "missing", where: "src/pages/TrainingLibrary.jsx + src/pages/hubs/TrainingLibrary.jsx", notes: "DELETE BOTH copies — orphan with no route in navConfig, contains SAMPLE_COURSES fake data. LearningHub.jsx covers all functionality. Also remove lazy import + Route from App.jsx." },
      { label: "Remaining Coming Soon Placeholders", status: "partial", where: "CreditScoreOptimizer, SocialListening, ReferralPartnerHub", notes: "5 cosmetic 'coming soon' placeholders remain across 3 files. Won't crash but look unprofessional." },
      { label: "Static-Only Hubs (No Firebase)", status: "partial", where: "AnalyticsHub, CertificationAcademyHub, others", notes: "Multiple hubs exist but have no real data connections. Need Firebase integration for production readiness." },
      { label: "Client Registration Security", status: "built", where: "AuthContext.jsx, App.jsx, ProtectedLayout.jsx", notes: "FIXED 2/12 (S1-S4): AuthContext defaults to 'viewer' not 'user'. SmartRedirect routes by role (client→portal, staff→dashboard). ProtectedRoute uses hierarchical ROLE_LEVELS permission system. Nav filtering defaults to 'viewer'. Commit 21b90d0." },
    ]
  },
];

const PRIORITY_ACTIONS = [
  {
    rank: 1,
    title: "✅ DONE: AI Services TIER 5+ Upgrade + CreditReportReParser Integration",
    impact: "COMPLETED 2/13 S9 — All 3 AI services upgraded, 6 Cloud Function cases added, DisputeHub Tools tab integrated",
    effort: "DONE",
    where: "aiCreditAnalyzer.js (1,086 lines), aiCreditReviewService.js (733 lines), aiCreditReportParser.js (823 lines), CreditReportReParser.jsx (694 lines), index.js (+1,024 lines)",
    why: "Fixed broken AI services (missing aiService dependency), upgraded to TIER 5+ Enterprise quality with server-side AI via Cloud Functions, comprehensive error handling, multiple fallback layers. Added CreditReportReParser for manual dispute re-trigger. System 100% ready for live testing.",
  },
  {
    rank: 2,
    title: "🧪 Live Enrollment Test (Son's Real Data)",
    impact: "HIGH — Final validation of complete enrollment flow before public launch",
    effort: "~30 min",
    where: "CompleteEnrollmentFlow.jsx (all 10 phases) + IDIQ credit pull + Auto-dispute creation + ClientProgressPortal",
    why: "Test with real data: name, email, phone, SSN, address. Verify $1 IDIQ charge, AI Credit Review displays, disputes auto-create, progress timeline generates. Document bugs/cosmetic improvements.",
  },
  {
    rank: 3,
    title: "✅ DONE: FIX SECURITY — Client Registration Gets Employee Access",
    impact: "COMPLETED 2/12 S8 — S1-S4 all fixed. Commit 21b90d0.",
    effort: "DONE",
    where: "AuthContext.jsx (default viewer), App.jsx (SmartRedirect by role + hierarchical ProtectedRoute), ProtectedLayout.jsx (nav filter default viewer)",
    why: "S1: Default role→viewer. S2: SmartRedirect routes client→portal, staff→dashboard. S3: Nav defaults to viewer. S4: ProtectedRoute uses ROLE_LEVELS hierarchy instead of string matching.",
  },
  {
    rank: 4,
    title: "Contract Signing UX Polish (20 items from testing)",
    impact: "HIGH — Contract signing works but has 20 UX issues that hurt conversion",
    effort: "~3 hours",
    where: "ContractSigningPortal.jsx, contractTemplates.js, email templates in index.js",
    why: "TESTED 2/12: Plumbing works perfectly. Issues: 3→5 day cancel language, signature persistence, modal popup, payment method selection, intimidating submit dialog, bank field auto-lookup. See SESSION_6_HANDOFF.md items C1-C20.",
  },
  {
    rank: 5,
    title: "Delete TrainingLibrary.jsx + NavConfig Cleanup",
    impact: "MEDIUM — Remove orphan files with fake data, clean up navigation",
    effort: "~15 min",
    where: "src/pages/TrainingLibrary.jsx, src/pages/hubs/TrainingLibrary.jsx, App.jsx, navConfig.js",
    why: "TrainingLibrary is orphan (no route), contains SAMPLE_COURSES hardcoded data. LearningHub (2,091 lines) covers all functionality. Also remove redundant navConfig entries.",
  },
  {
    rank: 6,
    title: "NMI Recurring Billing Wiring (NO STRIPE)",
    impact: "HIGH — Monthly billing must work for revenue",
    effort: "~2 hours",
    where: "operationsManager + paymentGateway.js + billing UI in client portal",
    why: "NMI gateway built (paymentGateway.js). Zelle + ACH live to Chase. Need recurring subscription automation. NO STRIPE — Stripe/PayPal/Square all ban credit repair. Future: 5 Star Processing.",
  },
  {
    rank: 7,
    title: "Remaining Coming Soon Placeholders (5 left)",
    impact: "LOW — Cosmetic but unprofessional",
    effort: "~1 hour",
    where: "CreditScoreOptimizer.jsx (1), SocialListening.jsx (1), ReferralPartnerHub.jsx (3)",
    why: "Won't crash but 'coming soon' text looks unfinished. Replace with empty states or real functionality.",
  },
  {
    rank: 8,
    title: "Cancellation / Offboarding Flow",
    impact: "MEDIUM — Clean client exits + win-back opportunity",
    effort: "~1 hour",
    where: "operationsManager cancelSubscription + offboarding email sequence",
    why: "Clients currently cannot self-cancel. No NMI subscription cancellation handler. No exit survey or win-back drip.",
  },
  {
    rank: 9,
    title: "90-Day Cold Lead Recycling",
    impact: "LOW — Re-engage dormant leads with fresh offer",
    effort: "~30 min",
    where: "New rule in processAbandonmentEmails",
    why: "Leads from 90+ days ago who never enrolled could be reactivated with a new offer or updated plan pricing.",
  },
  {
    rank: 10,
    title: "✅ DONE: 80-Hub Audit + Coming Soon Elimination + Crasher Fixes",
    impact: "COMPLETED 2/12 S7 — 13 placeholders eliminated, 1 crasher fixed, 5 files rebuilt (~7,085 lines)",
    effort: "DONE",
    where: "CollectionsARHub (1,404), BureauCommunicationHub (1,329), ReportsHub (2,261), LearningHub (2,091), CalendarSchedulingHub (2,548)",
    why: "Full audit of all 80 hubs. Rebuilt 5 files totaling ~7,085 lines. LearningHub crasher fixed (10 tabs). ReportsHub fake data replaced with real Firebase. CollectionsARHub 6 tabs from scratch. BureauCommunicationHub 4 new tabs.",
  },
  {
    rank: 11,
    title: "✅ DONE: IDIQ Dispute API Integration",
    impact: "COMPLETED 2/12 S6 — 5 case blocks in idiqService, AIDisputeGenerator.jsx fully wired",
    effort: "DONE",
    where: "index.js idiqService + AIDisputeGenerator.jsx",
    why: "pullDisputeReport, getDisputeReport, submitIDIQDispute, getDisputeStatus, refreshCreditReport. TransUnion via IDIQ API, Experian/Equifax via FaxCenter.",
  },
  {
    rank: 12,
    title: "✅ DONE: Monthly Credit Report Re-Pull",
    impact: "COMPLETED 2/12 S6 — idiqService refreshCreditReport case block",
    effort: "DONE",
    where: "index.js idiqService refreshCreditReport",
    why: "Pulls new report, compares scores, calculates deltas, logs to creditReportHistory.",
  },
  {
    rank: 13,
    title: "✅ DONE: E2E Test — Contract Signing Flow",
    impact: "COMPLETED 2/12 S6 — Works end-to-end, 20 UX items found",
    effort: "DONE",
    where: "generateContractSigningLink → email → /sign/:token → all 6 tabs → submit → Scenario 3",
    why: "Plumbing confirmed working. Bell notification fires. Automation triggers. 20 UX polish items documented.",
  },
  {
    rank: 14,
    title: "✅ DONE (FIXED): E2E Test — Client Login Flow",
    impact: "COMPLETED 2/12 S8 — S1-S4 security fixes deployed. Commit 21b90d0.",
    effort: "DONE",
    where: "AuthContext.jsx, App.jsx, ProtectedLayout.jsx",
    why: "All 4 security issues fixed: default role=viewer, SmartRedirect routes by role, nav filter defaults viewer, hierarchical ProtectedRoute permissions.",
  },
];

export default function SpeedyCRMLifecycleAudit() {
  const [activePhase, setActivePhase] = useState(null);
  const [showPriorities, setShowPriorities] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);

  const totalStages = LIFECYCLE_STAGES.reduce((sum, p) => sum + p.stages.length, 0);
  const builtCount = LIFECYCLE_STAGES.reduce((sum, p) => sum + p.stages.filter(s => s.status === "built").length, 0);
  const partialCount = LIFECYCLE_STAGES.reduce((sum, p) => sum + p.stages.filter(s => s.status === "partial").length, 0);
  const missingCount = LIFECYCLE_STAGES.reduce((sum, p) => sum + p.stages.filter(s => s.status === "missing").length, 0);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: COLORS.bg, color: COLORS.text, minHeight: "100vh", padding: "24px 16px" }}>
      
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          SpeedyCRM Lifecycle Audit
        </h1>
        <p style={{ color: COLORS.muted, margin: "8px 0 0", fontSize: 14 }}>
          Complete A-to-Z contact flow mapping • Updated {new Date().toLocaleDateString()} (Session 9)
        </p>

        {/* Summary Stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total Stages", value: totalStages, color: COLORS.accent },
            { label: "Built", value: builtCount, color: COLORS.built },
            { label: "Partial", value: partialCount, color: COLORS.partial },
            { label: "Missing", value: missingCount, color: COLORS.missing },
            { label: "Coverage", value: `${Math.round((builtCount / totalStages) * 100)}%`, color: builtCount / totalStages > 0.8 ? COLORS.built : COLORS.partial },
          ].map((stat, i) => (
            <div key={i} style={{ background: COLORS.card, borderRadius: 10, padding: "14px 20px", minWidth: 100, flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Entry Points */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🚪 Contact Entry Points</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {ENTRY_POINTS.map((ep) => (
            <div
              key={ep.id}
              onClick={() => setExpandedEntry(expandedEntry === ep.id ? null : ep.id)}
              style={{
                background: COLORS.card,
                borderRadius: 10,
                padding: "14px 16px",
                cursor: "pointer",
                border: `1px solid ${expandedEntry === ep.id ? COLORS.accent : COLORS.border}`,
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{ep.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{ep.label}</span>
                </div>
                <StatusBadge status={ep.status} />
              </div>
              {expandedEntry === ep.id && (
                <div style={{ marginTop: 10, fontSize: 12, color: COLORS.muted, lineHeight: 1.5, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
                  {ep.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lifecycle Phases */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📊 Lifecycle Phases</h2>
        {LIFECYCLE_STAGES.map((phase) => {
          const isOpen = activePhase === phase.phase;
          const pb = phase.stages.filter(s => s.status === "built").length;
          const pp = phase.stages.filter(s => s.status === "partial").length;
          const pm = phase.stages.filter(s => s.status === "missing").length;
          const pct = Math.round((pb / phase.stages.length) * 100);
          
          return (
            <div key={phase.phase} style={{ marginBottom: 6 }}>
              <div
                onClick={() => setActivePhase(isOpen ? null : phase.phase)}
                style={{
                  background: isOpen ? "linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)" : COLORS.card,
                  borderRadius: isOpen ? "10px 10px 0 0" : 10,
                  padding: "14px 18px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: `1px solid ${isOpen ? COLORS.accent : COLORS.border}`,
                  borderBottom: isOpen ? "none" : undefined,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.accent, marginRight: 10 }}>PHASE {phase.phase}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{phase.title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", gap: 4, fontSize: 11 }}>
                    {pb > 0 && <span style={{ color: COLORS.built }}>✅{pb}</span>}
                    {pp > 0 && <span style={{ color: COLORS.partial }}>⚠️{pp}</span>}
                    {pm > 0 && <span style={{ color: COLORS.missing }}>❌{pm}</span>}
                  </div>
                  <div style={{ width: 60, height: 6, background: "#374151", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? COLORS.built : pct >= 60 ? COLORS.partial : COLORS.missing, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? COLORS.built : COLORS.muted, minWidth: 32 }}>{pct}%</span>
                  <span style={{ fontSize: 16, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                </div>
              </div>
              
              {isOpen && (
                <div style={{ background: "#141c2b", border: `1px solid ${COLORS.accent}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "4px 0" }}>
                  {phase.stages.map((stage, i) => (
                    <div key={i} style={{ padding: "12px 18px", borderBottom: i < phase.stages.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{stage.label}</div>
                          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>
                            📍 <span style={{ color: "#818cf8" }}>{stage.where}</span>
                          </div>
                          <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.4 }}>{stage.notes}</div>
                        </div>
                        <StatusBadge status={stage.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Priority Actions */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 32 }}>
        <div
          onClick={() => setShowPriorities(!showPriorities)}
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)",
            borderRadius: showPriorities ? "10px 10px 0 0" : 10,
            padding: "18px 20px",
            cursor: "pointer",
            border: `2px solid ${COLORS.accent}`,
            borderBottom: showPriorities ? "none" : undefined,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            🎯 Recommended Next Steps (Priority Order)
            <span style={{ fontSize: 14, transform: showPriorities ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
          </h2>
          <p style={{ color: COLORS.muted, margin: "6px 0 0", fontSize: 13 }}>
            What to build next for maximum impact on your A-to-Z flow
          </p>
        </div>
        
        {showPriorities && (
          <div style={{ background: "#141c2b", border: `2px solid ${COLORS.accent}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: 0 }}>
            {PRIORITY_ACTIONS.map((action, i) => (
              <div key={i} style={{ padding: "16px 20px", borderBottom: i < PRIORITY_ACTIONS.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: i < 2 ? COLORS.missing : i < 5 ? COLORS.partial : i < 7 ? COLORS.accent : COLORS.built,
                    color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0
                  }}>
                    {action.rank}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{action.title}</div>
                    <div style={{ fontSize: 12, color: "#f97316", fontWeight: 600, marginBottom: 4 }}>{action.impact}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 2 }}>
                      ⏱️ Effort: {action.effort} &nbsp;|&nbsp; 📍 {action.where}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.4, fontStyle: "italic" }}>{action.why}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", padding: "20px 0 40px", color: COLORS.muted, fontSize: 12 }}>
        Audit based on index.js (14,011 lines, +1,024 from Session 9) + CompleteEnrollmentFlow.jsx (6,363 lines) + SmartDashboard.jsx (5,348 lines) + ContractSigningPortal V3.0 (1,781 lines) + contractTemplates V3.0 (1,262 lines) + PublicContractSigningRoute (1,057 lines) + aiCreditAnalyzer.js TIER 5+ (1,086 lines) + aiCreditReviewService.js TIER 5+ (733 lines) + aiCreditReportParser.js TIER 5+ (823 lines) + CreditReportReParser.jsx (694 lines) + 80-hub audit (Session 7-9) + project architecture • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}