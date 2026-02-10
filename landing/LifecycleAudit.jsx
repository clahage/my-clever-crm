import { useState } from "react";

// ============================================================================
// SpeedyCRM COMPLETE LIFECYCLE AUDIT
// Maps every contact path from entry → outcome, showing built vs missing
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
  { id: "ai_phone", label: "AI Receptionist Call", icon: "📞", status: "built", detail: "receiveAIReceptionistCall → processAICall → creates contact with roles=['contact','lead'], leadScore, sentiment" },
  { id: "landing", label: "Landing Page / Website Form", icon: "🌐", status: "built", detail: "captureWebLead / landingPageContact in operationsManager → creates contact" },
  { id: "quiz", label: "Quiz Funnel", icon: "🧩", status: "built", detail: "Quiz creates contact → Rule 12 in processAbandonmentEmails sends 24h + 72h nurture emails" },
  { id: "manual", label: "Manual CRM Entry (Staff)", icon: "👤", status: "built", detail: "UltimateContactForm.jsx → creates contact in Firestore → onContactCreated triggers AI role assessment" },
  { id: "social", label: "Yelp / Google / Social Media", icon: "⭐", status: "missing", detail: "No webhook or integration to auto-capture leads from Yelp messages, Google Business, Facebook, or Instagram DMs" },
  { id: "affiliate", label: "Affiliate / Referral Partner", icon: "🤝", status: "missing", detail: "No affiliate portal, tracking links, or commission system. ReferralEngineHub exists as placeholder only" },
  { id: "walkin", label: "Walk-in / Phone Call (Non-AI)", icon: "🚶", status: "built", detail: "Manual entry by staff via UltimateContactForm with source='walk_in' or 'phone_call'" },
];

const LIFECYCLE_STAGES = [
  {
    phase: "A",
    title: "Contact Entry & AI Assessment",
    stages: [
      { label: "Contact Created in Firestore", status: "built", where: "onContactCreated (index.js line 2642)", notes: "Fires on any new contacts/{id} document" },
      { label: "AI Role Assessment (auto-assign 'lead')", status: "built", where: "onContactCreated", notes: "Checks source, leadScore, email/phone presence, AI interactions → assigns 'lead' role" },
      { label: "Speed-to-Lead Alert to SCR Staff", status: "partial", where: "onContactUpdated (line ~2380)", notes: "Code exists for speed-to-lead but only fires on enrollmentStatus changes, not on new high-priority leads arriving" },
      { label: "CRM Dashboard Notification", status: "missing", where: "SmartDashboard / NotificationsHub", notes: "No real-time toast or bell notification when a hot lead enters the system" },
    ]
  },
  {
    phase: "B",
    title: "Lead Nurture (Pre-Enrollment)",
    stages: [
      { label: "Welcome/Intro Email with Enrollment Link", status: "missing", where: "Should be in onContactCreated", notes: "CRITICAL GAP: New leads get no email with enrollment link. They must find it themselves or wait for staff to call them" },
      { label: "SMS Welcome (Telnyx)", status: "missing", where: "Telnyx configured in secrets but not wired for welcome SMS", notes: "Telnyx secrets exist. SMS sending code exists in Rule 4 drip. Not wired to new lead entry" },
      { label: "1-Hour Follow-Up (if no enrollment started)", status: "missing", where: "Needs new rule in processAbandonmentEmails", notes: "If lead hasn't started enrollment within 1 hour, send a nudge" },
      { label: "24-Hour Drip Start (if no enrollment)", status: "partial", where: "Rule 12 covers quiz leads only", notes: "Quiz leads get 24h+72h emails. Landing page, AI phone, and manual leads do NOT get any follow-up drip" },
      { label: "7-Day / 14-Day Re-engagement", status: "missing", where: "No rule exists", notes: "Cold leads who never enrolled get nothing after initial contact" },
    ]
  },
  {
    phase: "C",
    title: "Enrollment Flow (10-Phase)",
    stages: [
      { label: "Phase 1: Personal Info + Portal Account", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "Creates portal account, validates fields, stores to Firestore" },
      { label: "Phase 2: IDIQ Enrollment + Credit Report", status: "built", where: "CompleteEnrollmentFlow.jsx + idiqService", notes: "Enrolls with IDIQ, pulls credit report, handles verification questions" },
      { label: "Phase 3: AI Credit Analysis + Review", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "Shows credit report widget, projected improvement (now dynamic), floating Continue timer" },
      { label: "Phase 4: Document Upload", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "Photo ID, utility bill, SSN card, bank statements" },
      { label: "Phase 5: Service Plan Selection", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "3 plans: Essentials $79, Professional $149, VIP $299" },
      { label: "Phase 6: Contract Signing", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "Digital signature pad, generates PDF contract" },
      { label: "Phase 7: Payment (NMI)", status: "built", where: "CompleteEnrollmentFlow.jsx + operationsManager", notes: "ACH + Credit Card via NMI, vault tokenization, recurring billing setup" },
      { label: "Phase 8-10: Celebration + Next Steps", status: "built", where: "CompleteEnrollmentFlow.jsx", notes: "Confetti, portal access link, what to expect timeline" },
      { label: "Enrollment Abandonment Recovery", status: "built", where: "processAbandonmentEmails Rule (5-min check)", notes: "If enrollmentStatus='started' and 5+ minutes passed, sends recovery email" },
    ]
  },
  {
    phase: "D",
    title: "Post-Enrollment Automation",
    stages: [
      { label: "Welcome Email (Portal Access)", status: "built", where: "onContactUpdated (line ~2018)", notes: "Fires when enrollmentStatus changes to 'enrolled'" },
      { label: "Contract Signed → Confirmation Email", status: "built", where: "onContactUpdated (line ~2142)", notes: "Sends contract confirmation when contractSigned=true" },
      { label: "ACH Authorization → Setup Request Email", status: "built", where: "onContactUpdated (line ~2266) + scheduledEmails", notes: "Schedules ACH setup request email 2 hours after contract signing" },
      { label: "Document Reminder (24h if docs missing)", status: "missing", where: "Bug #14 — not built", notes: "If docs not uploaded within 24h of enrollment, should send reminder email" },
      { label: "IDIQ Upgrade Reminders (Day 7, 14, 18)", status: "built", where: "Rule 3 in processWorkflowStages", notes: "Reminds clients to upgrade IDIQ from trial if not done" },
      { label: "Post-ACH 30-Day Drip Campaign", status: "built", where: "Rule 4 in processAbandonmentEmails", notes: "7 drip emails over 30 days: welcome, education, tips, check-in, anticipation, bureau window, next round" },
    ]
  },
  {
    phase: "E",
    title: "Active Client Lifecycle",
    stages: [
      { label: "AI Credit Analysis → Dispute Strategy", status: "missing", where: "Needs AIDisputeGenerator.jsx + IDIQ dispute API", notes: "IDIQ has dispute submission API (v1/disputes/submit). Not integrated yet." },
      { label: "Dispute Letter Generation", status: "missing", where: "Planned for DisputeHub", notes: "IDIQ dispute API supports claim codes, credit report items. No frontend or backend built" },
      { label: "Dispute Result Notifications", status: "built", where: "Rule 7 in processAbandonmentEmails", notes: "Checks disputeResults collection, emails client when results arrive" },
      { label: "Monthly Credit Report Re-Pull", status: "missing", where: "Needs scheduled function", notes: "Active clients should get credit reports re-pulled monthly to track progress" },
      { label: "Monthly Progress Report Email", status: "built", where: "Rule 8 in processAbandonmentEmails", notes: "Sends monthly progress email with score changes" },
      { label: "Score Milestone Celebrations", status: "built", where: "Rule 9 in processAbandonmentEmails", notes: "Celebrates 50+ and 100+ point improvements" },
      { label: "Payment Failure / Retry Notifications", status: "missing", where: "Needs NMI webhook handler", notes: "If recurring NMI payment fails, no notification is sent. Client subscription could lapse silently" },
      { label: "Client Portal Notifications", status: "missing", where: "ClientPortal.jsx has structure but no real-time notifications", notes: "No bell icon, no unread count, no push notifications" },
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
      { label: "Cancellation / Offboarding Flow", status: "missing", where: "No cancelSubscription handler in NMI", notes: "operationsManager has 'cancelSubscription' case listed but implementation not confirmed" },
      { label: "Win-Back Campaign (After Cancellation)", status: "missing", where: "No rule exists", notes: "Cancelled clients get no re-engagement emails" },
    ]
  },
  {
    phase: "G",
    title: "Non-Signup Paths (Contact Never Enrolls)",
    stages: [
      { label: "Quiz Lead → 24h + 72h Nurture", status: "built", where: "Rule 12 in processAbandonmentEmails", notes: "Quiz leads get 2 follow-up emails" },
      { label: "Landing Page Lead → Nurture Sequence", status: "missing", where: "No rule for non-quiz, non-enrolled leads", notes: "CRITICAL GAP: 8,486 daily visitors → most leave without enrolling → zero follow-up" },
      { label: "AI Phone Lead → Call Summary + Follow-Up", status: "partial", where: "processAICall sends transcript. No follow-up sequence", notes: "AI call creates contact but no drip if they don't enroll" },
      { label: "Do Not Contact / Opt-Out Handling", status: "missing", where: "No opt-out mechanism", notes: "CAN-SPAM compliance requires unsubscribe link and opt-out tracking" },
      { label: "Lead Recycling (90-Day Cold → Re-Engage)", status: "missing", where: "No rule exists", notes: "Leads that went cold should be re-engaged after 90 days with fresh offer" },
    ]
  },
];

const PRIORITY_ACTIONS = [
  {
    rank: 1,
    title: "Lead Welcome Email + Enrollment Link",
    impact: "HIGHEST — Every new lead should immediately get an email with their personalized enrollment link",
    effort: "~30 min",
    where: "Add to onContactCreated in index.js",
    why: "Currently 0% of new leads get an enrollment link automatically. This is your #1 conversion blocker.",
  },
  {
    rank: 2,
    title: "Universal Lead Nurture Drip (All Sources)",
    impact: "HIGH — Converts cold leads over 14 days",
    effort: "~45 min",
    where: "New rule in processAbandonmentEmails",
    why: "Rule 12 only covers quiz leads. Landing page, AI phone, Yelp, and manual leads get zero follow-up.",
  },
  {
    rank: 3,
    title: "Document Reminder Email (24h Post-Enrollment)",
    impact: "MEDIUM — Prevents enrolled clients from stalling",
    effort: "~20 min",
    where: "New rule in processAbandonmentEmails",
    why: "Bug #14 — clients who enrolled but didn't upload docs get no reminder.",
  },
  {
    rank: 4,
    title: "Staff Notification System (Real-Time Alerts)",
    impact: "HIGH — Speed-to-lead directly correlates with conversion",
    effort: "~1 hour",
    where: "onContactCreated + NotificationsHub",
    why: "Staff don't know when hot leads arrive. Browser push + email alert when leadScore ≥ 7.",
  },
  {
    rank: 5,
    title: "Payment Failure Webhook + Notification",
    impact: "MEDIUM — Prevents silent revenue loss",
    effort: "~45 min",
    where: "New onRequest function for NMI webhooks",
    why: "If a recurring payment fails, nobody knows. Client thinks they're active, you lose revenue.",
  },
  {
    rank: 6,
    title: "CAN-SPAM Opt-Out / Unsubscribe Link",
    impact: "COMPLIANCE — Legally required for all marketing emails",
    effort: "~30 min",
    where: "emailTemplates.js footer + contacts.emailOptOut field",
    why: "Every marketing email must have an unsubscribe link. Currently none do.",
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
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
          🔍 SpeedyCRM Lifecycle Audit
        </h1>
        <p style={{ color: COLORS.muted, margin: "8px 0 0", fontSize: 14 }}>
          Every path from contact entry → final outcome. What's built, what's partial, what's missing.
        </p>
        
        {/* Stats Bar */}
        <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total Stages", value: totalStages, color: COLORS.accent },
            { label: "Built", value: builtCount, color: COLORS.built },
            { label: "Partial", value: partialCount, color: COLORS.partial },
            { label: "Missing", value: missingCount, color: COLORS.missing },
            { label: "Completion", value: `${Math.round(((builtCount + partialCount * 0.5) / totalStages) * 100)}%`, color: COLORS.accent },
          ].map((stat, i) => (
            <div key={i} style={{ background: COLORS.card, borderRadius: 10, padding: "12px 20px", flex: "1 1 auto", minWidth: 100, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Entry Points */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          📥 Entry Points
          <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 400 }}>How contacts enter the system</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
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
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{ep.icon} {ep.label}</span>
                <StatusBadge status={ep.status} />
              </div>
              {expandedEntry === ep.id && (
                <p style={{ fontSize: 12, color: COLORS.muted, margin: "10px 0 0", lineHeight: 1.5, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
                  {ep.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lifecycle Phases */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          🔄 Lifecycle Stages
          <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 400 }}>Click any phase to expand</span>
        </h2>
        
        {LIFECYCLE_STAGES.map((phase) => {
          const isOpen = activePhase === phase.phase;
          const pb = phase.stages.filter(s => s.status === "built").length;
          const pp = phase.stages.filter(s => s.status === "partial").length;
          const pm = phase.stages.filter(s => s.status === "missing").length;
          const pct = Math.round(((pb + pp * 0.5) / phase.stages.length) * 100);
          
          return (
            <div key={phase.phase} style={{ marginBottom: 8 }}>
              <div
                onClick={() => setActivePhase(isOpen ? null : phase.phase)}
                style={{
                  background: COLORS.card,
                  borderRadius: isOpen ? "10px 10px 0 0" : 10,
                  padding: "14px 18px",
                  cursor: "pointer",
                  border: `1px solid ${isOpen ? COLORS.accent : COLORS.border}`,
                  borderBottom: isOpen ? "none" : undefined,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                }}
              >
                <div>
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
                    background: i === 0 ? COLORS.missing : i < 3 ? COLORS.partial : COLORS.accent,
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
        Audit based on index.js (9,081 lines) + CompleteEnrollmentFlow.jsx (6,363 lines) + project architecture • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}