// src/pages/SystemMap.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Save, RefreshCw, Download, Upload, ExternalLink, ShieldCheck, Database, Link as LinkIcon, CheckCircle2, AlertTriangle, CircleX } from "lucide-react";

// OPTIONAL Firestore sync (safe by default)
// Uncomment these when you're ready to sync to Firestore
// import { db } from "../lib/firebase";
// import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// ---------- Types & Helpers ----------
const STATUS = {
  OK: { key: "ok", label: "OK", color: "bg-emerald-500" },
  WARN: { key: "warn", label: "Needs Work", color: "bg-amber-500" },
  TODO: { key: "todo", label: "Todo", color: "bg-rose-500" },
};

const defaultRows = [
  // ===== Core & Infrastructure =====
  { id: "core-routing", area: "Core", title: "Routing / App Shell", file: "src/App.jsx", path: "/", owner: "Core", status: "ok", notes: "App boots; routes registered." },
  { id: "core-protected-layout", area: "Core", title: "ProtectedLayout", file: "src/layout/ProtectedLayout.jsx", path: "-", owner: "Core", status: "ok", notes: "Auth guard & layout wrapper." },
  { id: "core-sidebar", area: "Core", title: "Sidebar / Navigation", file: "src/layout/Sidebar.jsx + src/layout/navConfig.js", path: "-", owner: "Core", status: "warn", notes: "Sub-menus & groupings to finalize; keep a single source of truth in navConfig.js." },
  { id: "core-theme", area: "Core", title: "Theme / Dark Mode", file: "src/contexts/ThemeContext.jsx", path: "-", owner: "Core", status: "ok", notes: "Available across pages." },
  { id: "core-auth", area: "Core", title: "Auth Context", file: "src/contexts/AuthContext.jsx", path: "/login", owner: "Auth", status: "ok", notes: "Using Firebase Auth + context." },
  { id: "core-firebase", area: "Core", title: "Firebase Config", file: "src/lib/firebase.js", path: "-", owner: "Core", status: "ok", notes: "Standardized imports from ../lib/firebase." },

  // ===== Communications =====
  { id: "comm-center", area: "Communications", title: "Communications Hub", file: "src/pages/Communications.jsx", path: "/communications", owner: "Comms", status: "warn", notes: "Connect menu + unify Emails / SMS / Messages widgets." },
  { id: "comm-emails", area: "Communications", title: "Emails", file: "src/pages/Emails.jsx", path: "/communications/emails", owner: "Comms", status: "ok", notes: "Composer + tracking pixels deployed." },
  { id: "comm-sms", area: "Communications", title: "SMS", file: "src/pages/SMS.jsx", path: "/communications/sms", owner: "Comms", status: "warn", notes: "Wire Telnyx provider + templates." },
  { id: "comm-messages", area: "Communications", title: "Messages", file: "src/pages/Messages.jsx", path: "/communications/messages", owner: "Comms", status: "ok", notes: "Threads UI in place; connect to contacts." },
  { id: "comm-drip", area: "Communications", title: "Drip Campaigns", file: "src/pages/DripCampaigns.jsx", path: "/communications/drip", owner: "Comms", status: "warn", notes: "Activate scheduler + pause/resume per lead." },

  // ===== Disputes & Docs =====
  { id: "dispute-center", area: "Credit & Disputes", title: "Dispute Center", file: "src/pages/DisputeCenter.jsx", path: "/dispute-center", owner: "Credit", status: "ok", notes: "Templates + jsPDF export working." },
  { id: "e-contracts", area: "Credit & Disputes", title: "E-Contracts", file: "src/pages/EContracts.jsx", path: "/contracts", owner: "Credit", status: "warn", notes: "Stabilized; review analytics & expiry widgets." },

  // ===== Roles, Permissions, Admin =====
  { id: "roles", area: "Admin", title: "Roles", file: "src/pages/Roles.jsx", path: "/admin/roles", owner: "Admin", status: "ok", notes: "Matrix UI present; verify guards." },
  { id: "permissions", area: "Admin", title: "Permissions", file: "src/pages/Permissions.jsx", path: "/admin/permissions", owner: "Admin", status: "warn", notes: "Enforce RBAC across routes & components." },
  { id: "notifications", area: "Admin", title: "Admin Notification Center", file: "src/components/AdminNotificationCenter.jsx", path: "-", owner: "Admin", status: "ok", notes: "Admin queue live; connect actions." },

  // ===== Client & Sales =====
  { id: "contacts", area: "Client & Sales", title: "Contacts", file: "src/pages/Contacts.jsx", path: "/contacts", owner: "Sales", status: "ok", notes: "Import modal + CSV parsing functional." },
  { id: "pipeline", area: "Client & Sales", title: "Pipeline", file: "src/pages/Pipeline.jsx", path: "/pipeline", owner: "Sales", status: "warn", notes: "Kanban drag/drop polish." },
  { id: "progress-portal", area: "Client & Sales", title: "Progress Portal", file: "src/pages/ProgressPortal.jsx", path: "/progress-portal", owner: "CS", status: "ok", notes: "Live updates; add client-facing widgets." },

  // ===== Social & Reviews =====
  { id: "social-admin", area: "Social & Reviews", title: "Social Media Admin", file: "src/pages/SocialMediaAdmin.jsx", path: "/social-admin", owner: "Marketing", status: "ok", notes: "AI suggested replies; approval workflow." },

  // ===== Integrations =====
  { id: "idiq", area: "Integrations", title: "IDIQ Credit Data", file: "src/services/idiqService.js", path: "-", owner: "Integrations", status: "warn", notes: "Hook into score simulator & reports." },
  { id: "telnyx-fax", area: "Integrations", title: "Telnyx Fax", file: "src/services/telnyxFaxService.js", path: "-", owner: "Integrations", status: "todo", notes: "Connect keys + add send/receive UI." },

  // ===== Analytics & Goals =====
  { id: "reports", area: "Analytics", title: "Reports", file: "src/pages/Reports.jsx", path: "/reports", owner: "Ops", status: "ok", notes: "Tables & charts render; add filters." },
  { id: "goals", area: "Analytics", title: "Goals / OKRs", file: "src/pages/Goals.jsx", path: "/goals", owner: "Ops", status: "ok", notes: "MUI imports fixed; timeline replaced." },

  // ===== Business Credit & Funding =====
  { id: "business-credit", area: "Biz Credit & Funding", title: "Business Credit", file: "src/pages/BusinessCredit.jsx", path: "/business-credit", owner: "Biz", status: "warn", notes: "Lessons + vendor tiers; paywall hooks." },
  { id: "funding-center", area: "Biz Credit & Funding", title: "Loan & Funding Center", file: "src/pages/FundingCenter.jsx", path: "/funding", owner: "Biz", status: "todo", notes: "Prequal form, offers, affiliate hooks." },
];

const STORAGE_KEY = "systemMap.v1";

// Group by area for sections
function groupByArea(rows) {
  const buckets = {};
  for (const r of rows) {
    if (!buckets[r.area]) buckets[r.area] = [];
    buckets[r.area].push(r);
  }
  return buckets;
}

function Badge({ status }) {
  const s = STATUS[String(status).toUpperCase()] || STATUS.WARN;
  const Icon =
    s.key === "ok" ? CheckCircle2 :
    s.key === "warn" ? AlertTriangle : CircleX;
  return (
    <span className={`inline-flex items-center gap-1 text-white text-xs px-2 py-1 rounded ${s.color}`}>
      <Icon size={14} /> {s.label}
    </span>
  );
}

// ---------- Main Component ----------
export default function SystemMap() {
  const [rows, setRows] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultRows;
  });

  const [filter, setFilter] = useState("all");
  const grouped = useMemo(() => groupByArea(rows), [rows]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {}
  }, [rows]);

  const setStatus = (id, next) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: next } : r));
  };

  const setNotes = (id, text) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, notes: text } : r));
  };

  const setOwner = (id, text) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, owner: text } : r));
  };

  const resetToDefault = () => setRows(defaultRows);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "system-map.json" });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const importJson = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) setRows(data);
      } catch {}
    };
    reader.readAsText(file);
  };

  // OPTIONAL Firestore sync (uncomment when ready)
  // const pullFromFirestore = async () => {
  //   try {
  //     const ref = doc(db, "systemMap", "master");
  //      const snap = await getDoc(ref);
  //      if (snap.exists()) setRows(snap.data().rows || defaultRows);
  //   } catch (e) { console.error(e); }
  // };
  // const pushToFirestore = async () => {
  //   try {
  //     const ref = doc(db, "systemMap", "master");
  //     await setDoc(ref, { rows, updatedAt: serverTimestamp() }, { merge: true });
  //     alert("Synced to Firestore");
  //   } catch (e) { console.error(e); }
  // };

  const areas = Object.keys(grouped).sort();

  const filteredRows = (list) => {
    if (filter === "all") return list;
    return list.filter(r => r.status === filter);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">System Map & Status</h1>
          <p className="text-sm text-gray-500">Single source of truth for SpeedyCRM modules, pages, and routes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetToDefault} className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50">
            <RefreshCw size={16}/> Reset
          </button>
          <button onClick={exportJson} className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50">
            <Download size={16}/> Export JSON
          </button>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50 cursor-pointer">
            <Upload size={16}/> Import
            <input type="file" accept="application/json" className="hidden" onChange={e => importJson(e.target.files?.[0])}/>
          </label>
          {/* Uncomment when enabling Firestore */}
          {/* <button onClick={pullFromFirestore} className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50">
            <Database size={16}/> Pull
          </button>
          <button onClick={pushToFirestore} className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50">
            <ShieldCheck size={16}/> Push
          </button> */}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">Filter:</span>
        <button onClick={() => setFilter("all")} className={`px-2 py-1 rounded text-sm border ${filter==="all"?"bg-gray-900 text-white":"hover:bg-gray-50"}`}>All</button>
        <button onClick={() => setFilter("ok")} className={`px-2 py-1 rounded text-sm border ${filter==="ok"?"bg-gray-900 text-white":"hover:bg-gray-50"}`}>OK</button>
        <button onClick={() => setFilter("warn")} className={`px-2 py-1 rounded text-sm border ${filter==="warn"?"bg-gray-900 text-white":"hover:bg-gray-50"}`}>Needs Work</button>
        <button onClick={() => setFilter("todo")} className={`px-2 py-1 rounded text-sm border ${filter==="todo"?"bg-gray-900 text-white":"hover:bg-gray-50"}`}>Todo</button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> OK</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Needs Work</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Todo</div>
      </div>

      {/* Sections */}
      {areas.map(area => (
        <section key={area} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{area}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredRows(grouped[area]).map(row => (
              <div key={row.id} className="border rounded-lg p-4 bg-white dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{row.title}</span>
                      <Badge status={row.status}/>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{row.file}</div>
                    {row.path && row.path !== "-" &&
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <LinkIcon size={14}/> Route: <code>{row.path}</code>
                      </div>}
                  </div>
                  {row.path && row.path.startsWith("/") && (
                    <a href={row.path} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-gray-50" target="_self" rel="noreferrer">
                      <ExternalLink size={14}/> Open
                    </a>
                  )}
                </div>

                {/* Controls */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={row.status}
                    onChange={(e) => setStatus(row.id, e.target.value)}
                  >
                    <option value="ok">OK</option>
                    <option value="warn">Needs Work</option>
                    <option value="todo">Todo</option>
                  </select>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={row.owner || ""}
                    placeholder="Owner (e.g. Comms, Admin)"
                    onChange={(e) => setOwner(row.id, e.target.value)}
                  />
                </div>

                <textarea
                  className="w-full border rounded px-2 py-2 text-sm mt-2 min-h-[70px]"
                  placeholder="Notes, blockers, next actions…"
                  value={row.notes || ""}
                  onChange={(e) => setNotes(row.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
