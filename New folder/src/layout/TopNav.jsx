import React from "react";
import { Link, useLocation } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/clients", label: "Clients" },
  { to: "/leads", label: "Leads" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
];

export default function TopNav() {
  const location = useLocation();
  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <Link to="/dashboard" className="flex items-center gap-2">
          <BrandLogo style={{ height: 40 }} />
          <span className="font-bold text-lg text-brandBlue dark:text-brandGreen">SpeedyCRM</span>
        </Link>
        <ul className="flex gap-6">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`px-2 py-1 rounded transition font-medium text-gray-700 dark:text-gray-200 hover:bg-brandGreen/10 dark:hover:bg-brandGreen/20 ${location.pathname === link.to ? "bg-brandGreen/20 dark:bg-brandGreen/40" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
