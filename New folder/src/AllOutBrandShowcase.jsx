import React from "react";

export default function AllOutBrandShowcase() {
  return (
    <div className="container fade-in" style={{ minHeight: "100vh" }}>
      {/* Hero Banner */}
      <section className="hero mb-4" style={{ marginTop: "2rem" }}>
        <div className="hero-content">
          <div className="ribbon">PREMIUM</div>
          <h1 className="hero-title animated-gradient-text" style={{ fontSize: "3.5rem" }}>
            Speedy Credit Repair CRM
          </h1>
          <p className="hero-subtitle" style={{ fontSize: "1.7rem" }}>
            <span className="neon">Unleash the Power of Modern Finance</span>
          </p>
          <a href="#get-started" className="hero-cta" style={{ fontSize: "1.35rem" }}>
            Get Started Now
          </a>
        </div>
      </section>

      {/* Animated Cards Row */}
      <div className="center mb-4" style={{ gap: "2.5rem" }}>
        <div className="fancy-card animated-border glass" style={{ width: 340 }}>
          <div className="fancy-card-content">
            <h2 className="fancy-card-title">AI Insights</h2>
            <p className="fancy-card-desc">Real-time analytics, lead scoring, and smart notifications.</p>
            <button className="btn bg-brand-gradient">See Insights</button>
          </div>
        </div>
        <div className="fancy-card animated-border" style={{ width: 340 }}>
          <div className="fancy-card-content">
            <h2 className="fancy-card-title">Client Magic</h2>
            <p className="fancy-card-desc">Effortless onboarding, document upload, and e-signatures.</p>
            <button className="btn bg-brand-gradient">Manage Clients</button>
          </div>
        </div>
        <div className="fancy-card animated-border glass" style={{ width: 340 }}>
          <div className="fancy-card-content">
            <h2 className="fancy-card-title">Secure Vault</h2>
            <p className="fancy-card-desc">Bank-level security for your data and client files.</p>
            <button className="btn bg-brand-gradient">Go Secure</button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="divider center"></div>

      {/* Features Section */}
      <section className="section glass fade-in">
        <h2 className="section-header">Why Choose Speedy?</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li className="animated-gradient-text mb-4" style={{ fontSize: "1.25rem" }}>
            <b>⚡ Lightning Fast:</b> Instant imports, blazing dashboards, zero lag.
          </li>
          <li className="animated-gradient-text mb-4" style={{ fontSize: "1.25rem" }}>
            <b>🤖 AI-Powered:</b> Automated reports, smart reminders, and more.
          </li>
          <li className="animated-gradient-text mb-4" style={{ fontSize: "1.25rem" }}>
            <b>🔒 Ultra Secure:</b> End-to-end encryption, role-based access, audit logs.
          </li>
          <li className="animated-gradient-text mb-4" style={{ fontSize: "1.25rem" }}>
            <b>🎨 Beautiful UI:</b> Modern, mobile-friendly, and fully customizable.
          </li>
        </ul>
      </section>

      {/* Animated Gradient Text Banner */}
      <div className="center mt-4 mb-4">
        <span className="animated-gradient-text" style={{ fontSize: "2.2rem", fontWeight: 700 }}>
          Your Success, Accelerated.
        </span>
      </div>

      {/* Floating Action Button */}
      <div className="fab" title="Chat with Support">
        <span style={{ fontSize: "2.2rem" }}>💬</span>
      </div>
    </div>
  );
}
