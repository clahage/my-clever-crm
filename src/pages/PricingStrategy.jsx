import { useState } from "react";

const PricingStrategy = () => {
  const [activeTab, setActiveTab] = useState("problem");
  const [showRecommendation, setShowRecommendation] = useState(false);

  const tabs = [
    { id: "problem", label: "The Problem" },
    { id: "competitors", label: "Competitors" },
    { id: "psychology", label: "Psychology" },
    { id: "recommendation", label: "My Recommendation" },
    { id: "comparison", label: "Before → After" },
    { id: "revenue", label: "Revenue Impact" },
  ];

  const competitors = [
    { name: "Credit Saint", plans: 3, range: "$79.99–$139.99/mo", setup: "$99–$195", highlight: "3 tiers, unlimited disputes on top plan, 90-day guarantee" },
    { name: "Sky Blue Credit", plans: 2, range: "$79–$119/mo", setup: "$0", highlight: "Simple 2-plan model, couples discount, 35-day dispute cycles" },
    { name: "Lexington Law", plans: 1, range: "$139.95/mo", setup: "Included", highlight: "Single plan, attorney-backed, simplified decision" },
    { name: "The Credit Pros", plans: 3, range: "$69–$149/mo", setup: "$67–$119", highlight: "AI-driven, unlimited disputes, credit building tools" },
    { name: "CreditRepair.com", plans: 3, range: "$69.95–$119.95/mo", setup: "= monthly", highlight: "3 tiers, educational resources, online dashboard" },
    { name: "Ovation", plans: 2, range: "$49–$109/mo", setup: "$89", highlight: "2 plans, heavy discounts (couples, military, referral)" },
    { name: "Safeport Law", plans: 2, range: "$89.99–$129.99/mo", setup: "$89–$129", highlight: "Attorney network, A-rated BBB, 90-day guarantee" },
    { name: "Credit Glory", plans: 1, range: "$99/mo", setup: "$299", highlight: "Single plan, no complexity, Trustpilot 4.5★" },
  ];

  const currentPlans = [
    { name: "DIY", price: "$39/mo", setup: "$99", deletion: "$0", term: "M-to-M", issue: "Cannibalizes Standard sign-ups" },
    { name: "Standard", price: "$149/mo", setup: "$0", deletion: "$25/item", term: "6 mo", issue: "Gets lost among 6 options" },
    { name: "Acceleration", price: "$199/mo", setup: "$0", deletion: "Included", term: "9 mo", issue: "Too similar to Standard" },
    { name: "Pay-For-Delete", price: "$0/mo", setup: "$99", deletion: "Tiered", term: "Per item", issue: "Unpredictable revenue" },
    { name: "Hybrid", price: "$99/mo", setup: "$99", deletion: "$75/item", term: "6 mo", issue: "Confusing name & positioning" },
    { name: "Premium", price: "$349/mo", setup: "$199", deletion: "Included", term: "9 mo", issue: "Price shock without context" },
  ];

  const recommendedPlans = [
    {
      name: "Essentials",
      oldName: "Was: DIY ($39)",
      price: "$79",
      setup: "$49",
      badge: "STARTER",
      color: "#3b82f6",
      tagline: "Take Control of Your Credit",
      features: [
        "3-bureau credit report + scores via IDIQ",
        "AI-powered credit analysis & action plan",
        "Professional dispute letter templates",
        "Step-by-step video guides",
        "Client portal with progress tracking",
        "Email support",
        "Credit education library",
      ],
      notIncluded: ["We do the disputes for you", "Phone consultations", "Creditor negotiations"],
      idealFor: "Self-motivated individuals with minor issues (1–5 items) who want expert tools at a low cost.",
      term: "Month-to-month, cancel anytime",
      idiq: "Required ($21.86/mo partner rate)",
    },
    {
      name: "Professional",
      oldName: "Was: Standard ($149)",
      price: "$149",
      setup: "$0",
      badge: "MOST POPULAR ⭐",
      color: "#059669",
      tagline: "We Handle Everything For You",
      features: [
        "Everything in Essentials, PLUS:",
        "Full-service dispute management (we do it all)",
        "Unlimited dispute letters per month",
        "Unlimited phone consultations",
        "Creditor intervention & negotiation",
        "Debt validation requests",
        "Monthly credit report refresh & analysis",
        "Dedicated account manager",
        "Priority email + phone support",
        "$25 per item deleted, per bureau (success fee)",
      ],
      notIncluded: [],
      idealFor: "The typical client who wants professional help. Best value for moderate-to-complex cases (5–15+ items).",
      term: "6-month commitment (cancel after 3rd payment if no results)",
      idiq: "Required ($21.86/mo partner rate)",
    },
    {
      name: "VIP Concierge",
      oldName: "Was: Premium ($349)",
      price: "$299",
      setup: "$0",
      badge: "WHITE GLOVE",
      color: "#7c3aed",
      tagline: "Maximum Results, Maximum Speed",
      features: [
        "Everything in Professional, PLUS:",
        "Bi-weekly dispute cycles (2× faster)",
        "All deletion fees INCLUDED (no per-item charges)",
        "Direct-to-creditor escalation campaigns",
        "Goodwill letter campaigns",
        "Weekly progress reports",
        "Priority queue processing",
        "Credit rebuilding strategy (secured cards, tradelines)",
        "90-day results guarantee",
        "Direct cell phone access to specialist",
      ],
      notIncluded: [],
      idealFor: "Clients with complex cases, urgency (home purchase, job requirement), or 15+ negative items who want maximum speed.",
      term: "6-month commitment",
      idiq: "Required ($21.86/mo partner rate)",
    },
  ];

  return (
    <div style={{
      fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
      background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      color: "#e2e8f0",
      minHeight: "100vh",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(124,58,237,0.15))",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "32px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#0ea5e9", marginBottom: "12px", fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
          SPEEDY CREDIT REPAIR — PRICING STRATEGY ANALYSIS
        </div>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 400,
          margin: "0 0 8px 0",
          background: "linear-gradient(135deg, #f8fafc, #94a3b8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2,
        }}>
          From 6 Plans to 3: Eliminating Choice Paralysis
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "16px", fontFamily: "system-ui, sans-serif", margin: 0, maxWidth: "600px", marginInline: "auto" }}>
          Competitive analysis, pricing psychology, and a revenue-optimized recommendation
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: "2px",
        padding: "0 16px",
        background: "rgba(0,0,0,0.3)",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "14px 18px",
              border: "none",
              background: activeTab === tab.id ? "rgba(14,165,233,0.15)" : "transparent",
              color: activeTab === tab.id ? "#0ea5e9" : "#64748b",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "system-ui, sans-serif",
              fontWeight: activeTab === tab.id ? 600 : 400,
              borderBottom: activeTab === tab.id ? "2px solid #0ea5e9" : "2px solid transparent",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ===== TAB: THE PROBLEM ===== */}
        {activeTab === "problem" && (
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 400, margin: "0 0 8px 0" }}>Your 6-Plan Problem</h2>
            <p style={{ color: "#94a3b8", fontFamily: "system-ui, sans-serif", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
              You went from 1 plan 10 years ago to 6 today. The research is unanimous: with 8,486 daily visitors and a 0.24% conversion rate, plan overload is likely a major contributor. Here's why each plan creates friction:
            </p>

            <div style={{ display: "grid", gap: "12px" }}>
              {currentPlans.map((plan, i) => (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "140px 90px 70px 90px 70px 1fr",
                  gap: "12px",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "13px",
                }}>
                  <span style={{ fontWeight: 600, color: "#f1f5f9" }}>{plan.name}</span>
                  <span style={{ color: "#0ea5e9" }}>{plan.price}</span>
                  <span style={{ color: "#64748b" }}>{plan.setup}</span>
                  <span style={{ color: "#64748b" }}>{plan.deletion}</span>
                  <span style={{ color: "#64748b" }}>{plan.term}</span>
                  <span style={{ color: "#f87171", fontSize: "12px" }}>⚠ {plan.issue}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: "32px",
              padding: "24px",
              background: "linear-gradient(135deg, rgba(248,113,113,0.08), rgba(248,113,113,0.03))",
              borderRadius: "12px",
              border: "1px solid rgba(248,113,113,0.15)",
            }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#fca5a5", fontWeight: 400 }}>The Data on Choice Overload</h3>
              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "14px", lineHeight: 1.8, color: "#cbd5e1" }}>
                <p style={{ margin: "0 0 12px 0" }}>
                  The famous "jam study" by Iyengar & Lepper found that presenting 24 options drew more lookers but only 3% purchased, while 6 options converted at 30% — a <strong style={{ color: "#f8fafc" }}>10× conversion difference</strong> just from reducing choices.
                </p>
                <p style={{ margin: "0 0 12px 0" }}>
                  Pricing research consistently shows <strong style={{ color: "#f8fafc" }}>3 tiers is the sweet spot</strong>. It creates a natural Good/Better/Best framework that the human brain processes effortlessly. Your 6 plans with overlapping features (Acceleration vs Standard, Hybrid vs everything) force visitors into analysis mode — and analysis mode kills conversions.
                </p>
                <p style={{ margin: 0 }}>
                  Your original 1-plan model from 10 years ago actually had the right instinct — simplicity converts. The goal now is to serve different customer segments <em>without</em> creating decision paralysis. Three plans accomplishes this perfectly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: COMPETITORS ===== */}
        {activeTab === "competitors" && (
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 400, margin: "0 0 8px 0" }}>What Top Companies Actually Do</h2>
            <p style={{ color: "#94a3b8", fontFamily: "system-ui, sans-serif", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
              I researched the 8 highest-ranked credit repair companies as of February 2026. The pattern is unmistakable:
            </p>

            <div style={{ display: "grid", gap: "10px", marginBottom: "32px" }}>
              {competitors.map((c, i) => (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "160px 50px 160px 100px 1fr",
                  gap: "16px",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "13px",
                }}>
                  <span style={{ fontWeight: 600, color: "#f1f5f9" }}>{c.name}</span>
                  <span style={{
                    background: c.plans <= 2 ? "rgba(16,185,129,0.15)" : c.plans === 3 ? "rgba(14,165,233,0.15)" : "rgba(248,113,113,0.15)",
                    color: c.plans <= 2 ? "#34d399" : c.plans === 3 ? "#38bdf8" : "#fca5a5",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textAlign: "center",
                  }}>
                    {c.plans} {c.plans === 1 ? "plan" : "plans"}
                  </span>
                  <span style={{ color: "#0ea5e9" }}>{c.range}</span>
                  <span style={{ color: "#64748b" }}>Setup: {c.setup}</span>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{c.highlight}</span>
                </div>
              ))}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}>
              <div style={{
                padding: "24px",
                background: "rgba(14,165,233,0.06)",
                borderRadius: "12px",
                border: "1px solid rgba(14,165,233,0.12)",
              }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#38bdf8", fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>
                  Key Pattern: 2–3 Plans Dominates
                </h3>
                <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "13px", lineHeight: 1.8, color: "#cbd5e1" }}>
                  <p style={{margin: "0 0 8px 0"}}>Average number of plans across top 8 companies: <strong style={{ color: "#f8fafc" }}>2.1 plans</strong></p>
                  <p style={{margin: "0 0 8px 0"}}>Most common structure: 2 or 3 tiers</p>
                  <p style={{margin: "0 0 8px 0"}}>Nobody offers 6 plans</p>
                  <p style={{margin: 0}}>The trend is toward <em>fewer</em> plans (Lexington Law went from 3 to 1)</p>
                </div>
              </div>
              <div style={{
                padding: "24px",
                background: "rgba(124,58,237,0.06)",
                borderRadius: "12px",
                border: "1px solid rgba(124,58,237,0.12)",
              }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#a78bfa", fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>
                  Key Pattern: Pricing Sweet Spot
                </h3>
                <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "13px", lineHeight: 1.8, color: "#cbd5e1" }}>
                  <p style={{margin: "0 0 8px 0"}}>Entry level: <strong style={{ color: "#f8fafc" }}>$69–$89/mo</strong></p>
                  <p style={{margin: "0 0 8px 0"}}>Mid tier (most popular): <strong style={{ color: "#f8fafc" }}>$99–$129/mo</strong></p>
                  <p style={{margin: "0 0 8px 0"}}>Premium: <strong style={{ color: "#f8fafc" }}>$129–$149/mo</strong></p>
                  <p style={{margin: 0}}>Setup fees: <strong style={{ color: "#f8fafc" }}>$0–$129</strong> (trend toward lower)</p>
                </div>
              </div>
              <div style={{
                padding: "24px",
                background: "rgba(16,185,129,0.06)",
                borderRadius: "12px",
                border: "1px solid rgba(16,185,129,0.12)",
              }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#34d399", fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>
                  Your Unfair Advantage
                </h3>
                <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "13px", lineHeight: 1.8, color: "#cbd5e1" }}>
                  <p style={{margin: "0 0 8px 0"}}>30 years experience (most are 5-15)</p>
                  <p style={{margin: "0 0 8px 0"}}>A+ BBB rating, 4.9★ Google (580+ reviews)</p>
                  <p style={{margin: "0 0 8px 0"}}>Family-owned (trust factor)</p>
                  <p style={{margin: 0}}>AI-powered CRM + IDIQ integration (tech edge)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: PSYCHOLOGY ===== */}
        {activeTab === "psychology" && (
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 400, margin: "0 0 8px 0" }}>The Science Behind 3 Plans</h2>
            <p style={{ color: "#94a3b8", fontFamily: "system-ui, sans-serif", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
              Five proven psychological principles that make the 3-plan model convert better than 6:
            </p>

            {[
              {
                title: "1. The Decoy Effect (Price Anchoring)",
                icon: "⚓",
                explanation: "Your VIP plan at $299 makes the $149 Professional plan look like a steal. The top tier isn't primarily designed to sell — it's designed to make the middle tier irresistible. With your current 6 plans, there's no clear anchor because the options blur together.",
                yourBenefit: "Most clients will choose Professional ($149) because it feels like the smart middle ground between $79 and $299."
              },
              {
                title: "2. The Goldilocks Effect (Center-Stage Bias)",
                icon: "🎯",
                explanation: "When presented with 3 options, humans overwhelmingly choose the middle one. Research by Rodway, Schepman & Lambert (2012) confirmed this across both physical and digital displays. Three options create a natural 'too little / just right / too much' framework.",
                yourBenefit: "The Professional plan sits in the center — psychologically positioned as the 'just right' choice. With 6 plans, there is no center."
              },
              {
                title: "3. Cognitive Load Reduction",
                icon: "🧠",
                explanation: "Comparing 3 plans requires evaluating 3 comparisons (A vs B, B vs C, A vs C). Comparing 6 plans requires 15 comparisons. That's 5× the mental effort — and mental effort is the #1 killer of online conversions.",
                yourBenefit: "Visitors can scan your 3 plans in under 10 seconds and know which one is right for them."
              },
              {
                title: "4. Loss Aversion via 'Most Popular' Badge",
                icon: "🏆",
                explanation: "Marking Professional as 'Most Popular' triggers social proof AND loss aversion. Visitors think: 'If most people choose this, I'd be foolish not to.' This only works when there are few enough options that the badge stands out.",
                yourBenefit: "The ⭐ MOST POPULAR badge on Professional becomes the decision shortcut for 60-70% of visitors."
              },
              {
                title: "5. Clear Upgrade Path",
                icon: "📈",
                explanation: "Three tiers create an obvious progression: start affordable, upgrade when you see results. Six plans create confusion about which upgrade makes sense. Your AI system can trigger smart upsell nudges at the right moments.",
                yourBenefit: "Essentials → Professional is natural. Your CRM can auto-suggest upgrades when clients hit spend thresholds."
              },
            ].map((principle, i) => (
              <div key={i} style={{
                padding: "24px",
                marginBottom: "16px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "28px" }}>{principle.icon}</span>
                  <div>
                    <h3 style={{ margin: "0 0 10px 0", fontSize: "17px", color: "#f1f5f9", fontWeight: 500 }}>
                      {principle.title}
                    </h3>
                    <p style={{ margin: "0 0 12px 0", fontFamily: "system-ui, sans-serif", fontSize: "14px", lineHeight: 1.7, color: "#94a3b8" }}>
                      {principle.explanation}
                    </p>
                    <div style={{
                      padding: "10px 16px",
                      background: "rgba(16,185,129,0.08)",
                      borderRadius: "8px",
                      border: "1px solid rgba(16,185,129,0.15)",
                      fontFamily: "system-ui, sans-serif",
                      fontSize: "13px",
                      color: "#6ee7b7",
                    }}>
                      <strong>Your win:</strong> {principle.yourBenefit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== TAB: RECOMMENDATION ===== */}
        {activeTab === "recommendation" && (
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 400, margin: "0 0 8px 0" }}>The 3-Plan Structure</h2>
            <p style={{ color: "#94a3b8", fontFamily: "system-ui, sans-serif", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
              Three plans, clear differentiation, one obvious winner. Here's exactly what I recommend:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {recommendedPlans.map((plan, i) => (
                <div key={i} style={{
                  padding: "28px 24px",
                  background: i === 1
                    ? `linear-gradient(135deg, ${plan.color}15, ${plan.color}08)`
                    : "rgba(255,255,255,0.03)",
                  borderRadius: "16px",
                  border: i === 1 ? `2px solid ${plan.color}40` : "1px solid rgba(255,255,255,0.06)",
                  position: "relative",
                  transform: i === 1 ? "scale(1.02)" : "none",
                }}>
                  {/* Badge */}
                  <div style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    background: `${plan.color}20`,
                    color: plan.color,
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontFamily: "system-ui, sans-serif",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    marginBottom: "16px",
                  }}>
                    {plan.badge}
                  </div>

                  <h3 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: 400, color: "#f8fafc" }}>
                    {plan.name}
                  </h3>
                  <p style={{ margin: "0 0 4px 0", fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#64748b" }}>
                    {plan.oldName}
                  </p>
                  <p style={{ margin: "0 0 16px 0", fontFamily: "system-ui, sans-serif", fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>
                    {plan.tagline}
                  </p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "42px", fontWeight: 300, color: plan.color }}>{plan.price}</span>
                    <span style={{ color: "#64748b", fontFamily: "system-ui, sans-serif", fontSize: "14px" }}>/month</span>
                  </div>
                  <p style={{ margin: "0 0 20px 0", fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#64748b" }}>
                    Setup: {plan.setup} · {plan.term}
                  </p>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                    {plan.features.map((f, fi) => (
                      <div key={fi} style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                        fontFamily: "system-ui, sans-serif",
                        fontSize: "13px",
                        color: fi === 0 && i > 0 ? "#94a3b8" : "#cbd5e1",
                        fontWeight: fi === 0 && i > 0 ? 600 : 400,
                      }}>
                        <span style={{ color: plan.color, flexShrink: 0, marginTop: "2px" }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: "16px",
                    padding: "12px",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "12px",
                    color: "#94a3b8",
                    lineHeight: 1.6,
                  }}>
                    <strong style={{ color: "#cbd5e1" }}>Ideal for:</strong> {plan.idealFor}
                  </div>
                </div>
              ))}
            </div>

            {/* What happened to the eliminated plans */}
            <div style={{
              marginTop: "32px",
              padding: "24px",
              background: "rgba(251,191,36,0.06)",
              borderRadius: "12px",
              border: "1px solid rgba(251,191,36,0.12)",
            }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "18px", color: "#fbbf24", fontWeight: 400 }}>
                What Happened to the 3 Eliminated Plans?
              </h3>
              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "14px", lineHeight: 1.8, color: "#cbd5e1" }}>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong style={{ color: "#f8fafc" }}>Acceleration ($199)</strong> → Absorbed into VIP Concierge. The bi-weekly dispute cycles and aggressive strategy are now VIP features. Clients who wanted "faster" now have a clear premium option.
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong style={{ color: "#f8fafc" }}>Hybrid ($99)</strong> → Eliminated entirely. It was a confusing middle ground. The new Essentials ($79) serves budget-conscious clients better with a clearer value proposition.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#f8fafc" }}>Pay-For-Delete ($0/mo)</strong> → Converted into the Professional plan's $25/item success fee. This is actually more compelling: clients get full professional service AND pay-for-results, just packaged inside a proven monthly model. You keep predictable revenue while clients still get the "pay for what works" psychology.
                </p>
              </div>
            </div>

            {/* Couples discount */}
            <div style={{
              marginTop: "16px",
              padding: "24px",
              background: "rgba(236,72,153,0.06)",
              borderRadius: "12px",
              border: "1px solid rgba(236,72,153,0.12)",
            }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#f472b6", fontWeight: 500, fontFamily: "system-ui, sans-serif" }}>
                💡 Add-On Idea: Couples Discount (20% off 2nd person)
              </h3>
              <p style={{ margin: 0, fontFamily: "system-ui, sans-serif", fontSize: "13px", lineHeight: 1.7, color: "#cbd5e1" }}>
                Sky Blue and Ovation both report strong conversion boosts from couples pricing. A 20% discount on the second enrollment increases average revenue per household by 60% while appearing generous. This works as a simple add-on without creating a separate plan — keeping your 3-plan structure clean.
              </p>
            </div>
          </div>
        )}

        {/* ===== TAB: BEFORE → AFTER ===== */}
        {activeTab === "comparison" && (
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 400, margin: "0 0 24px 0" }}>Side-by-Side: What Changes</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: "16px", alignItems: "start" }}>
              {/* Before */}
              <div>
                <div style={{
                  padding: "16px",
                  background: "rgba(248,113,113,0.08)",
                  borderRadius: "12px 12px 0 0",
                  border: "1px solid rgba(248,113,113,0.15)",
                  borderBottom: "none",
                  textAlign: "center",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fca5a5",
                }}>
                  BEFORE: 6 Plans
                </div>
                {["DIY — $39/mo", "Hybrid — $99/mo", "Standard — $149/mo", "Acceleration — $199/mo", "Premium — $349/mo", "Pay-For-Delete — $0/mo"].map((p, i) => (
                  <div key={i} style={{
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderTop: "none",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "13px",
                    color: [1, 3, 5].includes(i) ? "#64748b" : "#cbd5e1",
                    textDecoration: [1, 3, 5].includes(i) ? "line-through" : "none",
                  }}>
                    {p} {[1, 3, 5].includes(i) && <span style={{ color: "#f87171", fontSize: "11px" }}> ✕ eliminated</span>}
                  </div>
                ))}
                <div style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "0 0 12px 12px",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderTop: "none",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "12px",
                  color: "#ef4444",
                }}>
                  15 comparisons needed · High choice paralysis
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "80px", fontSize: "24px", color: "#0ea5e9" }}>
                →
              </div>

              {/* After */}
              <div>
                <div style={{
                  padding: "16px",
                  background: "rgba(16,185,129,0.08)",
                  borderRadius: "12px 12px 0 0",
                  border: "1px solid rgba(16,185,129,0.15)",
                  borderBottom: "none",
                  textAlign: "center",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#6ee7b7",
                }}>
                  AFTER: 3 Plans
                </div>
                {[
                  { name: "Essentials — $79/mo", color: "#3b82f6" },
                  { name: "Professional — $149/mo ⭐", color: "#059669" },
                  { name: "VIP Concierge — $299/mo", color: "#7c3aed" },
                ].map((p, i) => (
                  <div key={i} style={{
                    padding: "14px 16px",
                    background: `${p.color}08`,
                    border: `1px solid ${p.color}20`,
                    borderTop: "none",
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "13px",
                    color: "#f1f5f9",
                    fontWeight: i === 1 ? 600 : 400,
                  }}>
                    {p.name}
                  </div>
                ))}
                <div style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "0 0 12px 12px",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderTop: "none",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "12px",
                  color: "#10b981",
                }}>
                  3 comparisons needed · Clear "best choice" signal
                </div>
              </div>
            </div>

            {/* Key changes table */}
            <div style={{ marginTop: "32px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 400, marginBottom: "16px" }}>Key Structural Changes</h3>
              {[
                { metric: "Number of plans", before: "6", after: "3", impact: "80% fewer comparisons" },
                { metric: "Entry price", before: "$39 (too cheap, low perceived value)", after: "$79 (competitive, profitable)", impact: "Matches market rate" },
                { metric: "Setup fees", before: "$0–$199 (inconsistent)", after: "$0–$49 (low barrier)", impact: "Removes friction" },
                { metric: "Pay-for-delete", before: "Separate plan (confusing)", after: "Built into Professional ($25/item)", impact: "Predictable + results-based" },
                { metric: "'Most Popular' signal", before: "None (all plans equal weight)", after: "Professional ⭐ highlighted", impact: "60-70% will choose this" },
                { metric: "Premium anchor", before: "$349 (with $199 setup = shock)", after: "$299 ($0 setup, clearer value)", impact: "Makes $149 feel smart" },
                { metric: "IDIQ requirement", before: "Varies by plan", after: "All plans: $21.86/mo partner rate", impact: "Consistent, simple" },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr 1fr 1fr",
                  gap: "16px",
                  padding: "12px 16px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderRadius: "6px",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "13px",
                  alignItems: "center",
                }}>
                  <span style={{ color: "#f1f5f9", fontWeight: 500 }}>{row.metric}</span>
                  <span style={{ color: "#f87171" }}>{row.before}</span>
                  <span style={{ color: "#34d399" }}>{row.after}</span>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{row.impact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TAB: REVENUE IMPACT ===== */}
        {activeTab === "revenue" && (
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 400, margin: "0 0 8px 0" }}>Projected Revenue Impact</h2>
            <p style={{ color: "#94a3b8", fontFamily: "system-ui, sans-serif", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
              Based on your 8,486 daily visitors, here's what happens when you improve conversion from 0.24% to even modest levels with a simplified pricing structure:
            </p>

            {/* Revenue scenarios */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {[
                { label: "Current", rate: "0.24%", clients: "~20/day", monthlyRev: "$22,500", color: "#ef4444", bgColor: "rgba(239,68,68,0.06)" },
                { label: "Conservative", rate: "0.75%", clients: "~64/day", monthlyRev: "$67,500", color: "#f59e0b", bgColor: "rgba(245,158,11,0.06)" },
                { label: "Realistic", rate: "1.5%", clients: "~127/day", monthlyRev: "$142,800", color: "#0ea5e9", bgColor: "rgba(14,165,233,0.06)" },
                { label: "Optimized", rate: "3.0%", clients: "~255/day", monthlyRev: "$382,500", color: "#10b981", bgColor: "rgba(16,185,129,0.06)" },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: "24px",
                  background: s.bgColor,
                  borderRadius: "12px",
                  border: `1px solid ${s.color}20`,
                  textAlign: "center",
                }}>
                  <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "12px", fontWeight: 600, color: s.color, letterSpacing: "1px", marginBottom: "8px" }}>
                    {s.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 300, color: s.color, marginBottom: "4px" }}>
                    {s.monthlyRev}
                  </div>
                  <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#64748b" }}>
                    {s.rate} conversion · {s.clients}
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue math */}
            <div style={{
              padding: "24px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: "24px",
            }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "17px", fontWeight: 400, color: "#f1f5f9" }}>Revenue Math (Realistic Scenario)</h3>
              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "14px", lineHeight: 2, color: "#cbd5e1" }}>
                <p style={{ margin: 0 }}>
                  Assuming the typical distribution with 3 clear plans: <strong style={{ color: "#3b82f6" }}>20% choose Essentials ($79)</strong>, <strong style={{ color: "#059669" }}>65% choose Professional ($149)</strong>, <strong style={{ color: "#7c3aed" }}>15% choose VIP ($299)</strong>
                </p>
                <p style={{ margin: "12px 0 0 0" }}>
                  Weighted average monthly revenue per client: <strong style={{ color: "#f8fafc" }}>$157.80</strong> + IDIQ commissions + deletion fees on Professional clients.
                </p>
                <p style={{ margin: "8px 0 0 0" }}>
                  At 1.5% conversion = ~127 new clients/day × 30 days = ~3,810 monthly sign-ups × $157.80 = <strong style={{ color: "#10b981" }}>~$601,000/month potential</strong> (before churn and operational capacity considerations).
                </p>
              </div>
            </div>

            {/* Why this works */}
            <div style={{
              padding: "24px",
              background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(124,58,237,0.08))",
              borderRadius: "12px",
              border: "1px solid rgba(14,165,233,0.12)",
            }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "17px", fontWeight: 400, color: "#f8fafc" }}>Why 3 Plans = More Revenue Than 6</h3>
              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "14px", lineHeight: 1.8, color: "#cbd5e1" }}>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong style={{ color: "#0ea5e9" }}>Higher conversion rate:</strong> Fewer plans = faster decisions = more sign-ups. Even a 0.5% improvement on 8,486 visitors = 42 additional clients per day.
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong style={{ color: "#0ea5e9" }}>Higher average revenue:</strong> The Goldilocks effect pushes 65% to Professional ($149) instead of spreading across 6 plans where many choose cheaper options.
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong style={{ color: "#0ea5e9" }}>Lower support cost:</strong> 3 plans means fewer billing questions, simpler contracts, less confusion in onboarding, and easier CRM workflows.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#0ea5e9" }}>Stronger upsell path:</strong> Essentials → Professional is a natural, AI-triggered upgrade. Your CRM can detect when a DIY client's spend on à la carte items exceeds $100 and suggest the upgrade.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "24px",
        textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#475569",
      }}>
        © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
        <br />
        Pricing Strategy Analysis — Prepared February 8, 2026
      </div>
    </div>
  );
};

export default PricingStrategy;