import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring";
  const linkActive =
    "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900";
  const linkIdle =
    "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <button
          onClick={() => navigate("/dashboard")}
          className="group flex items-center gap-2"
          aria-label="Go to Dashboard"
        >
          <img
            src="/logo.png"
            alt="SpeedyCRM"
            className="h-8 w-8 rounded-md shadow-sm"
            onError={(e) => {
              // Fallback if logo not present
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="text-lg font-semibold tracking-tight text-gray-900 group-hover:opacity-90 dark:text-gray-100">
            SpeedyCRM
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>Dashboard</NavLink>
          <NavLink to="/clients" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>Clients</NavLink>
          <NavLink to="/leads" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>Leads</NavLink>
          <NavLink to="/reports" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>Reports</NavLink>
          <NavLink to="/settings" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>Settings</NavLink>
          <NavLink to="/progress" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>Progress Portal</NavLink>
          <NavLink to="/disputes" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>Dispute Center</NavLink>
          <NavLink to="/activity" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>Activity Log</NavLink>
          <NavLink to="/features" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>Features & Tutorials</NavLink>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile links */}
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="space-y-1 px-4 py-3">
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/clients", label: "Clients" },
              { to: "/leads", label: "Leads" },
              { to: "/reports", label: "Reports" },
              { to: "/settings", label: "Settings" },
              { to: "/progress", label: "Progress Portal" },
              { to: "/disputes", label: "Dispute Center" },
              { to: "/activity", label: "Activity Log" },
              { to: "/features", label: "Features & Tutorials" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${linkBase} block ${isActive ? linkActive : linkIdle}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
