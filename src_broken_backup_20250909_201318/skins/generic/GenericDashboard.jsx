import React from "react";
import BrandLogo from "../BrandLogo";

export default function GenericDashboard() {
  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", color: "#222" }}>
      <header style={{ background: "#3f51b5", color: "#fff", padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* BrandLogo wired for generic skin, mode dark for header */}
        <BrandLogo mode="dark" className="h-10 w-auto" />
        <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>Generic CRM Dashboard</h1>
      </header>
      <main style={{ padding: "2rem" }}>
        <section style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "2rem", marginBottom: "2rem" }}>
          <h2 style={{ color: "#3f51b5", fontWeight: 500 }}>Welcome</h2>
          <p style={{ color: "#555" }}>This is the generic, white-label dashboard. All branding is neutral and suitable for resellers or partners.</p>
        </section>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: "1.5rem" }}>
            <div style={{ color: "#3f51b5", fontWeight: 600 }}>Active Clients</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 8 }}>98</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: "1.5rem" }}>
            <div style={{ color: "#3f51b5", fontWeight: 600 }}>Revenue (This Month)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 8 }}>$8,200</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: "1.5rem" }}>
            <div style={{ color: "#3f51b5", fontWeight: 600 }}>Leads Generated</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 8 }}>34</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.03)", padding: "1.5rem" }}>
            <div style={{ color: "#3f51b5", fontWeight: 600 }}>Tasks Pending</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 8 }}>7</div>
          </div>
        </section>
        <section style={{ marginTop: "2rem", background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "2rem" }}>
          <h2 style={{ color: "#ff9800", fontWeight: 500 }}>Recent Activity</h2>
          <ul style={{ color: "#555", marginTop: 12 }}>
            <li>New lead added (1h ago)</li>
            <li>Client file updated (3h ago)</li>
            <li>Monthly report generated (1d ago)</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
