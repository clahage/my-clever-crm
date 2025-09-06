import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { navItems } from "@/layout/navConfig";

export default function ProtectedLayout() {
  const { user } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition
     ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="grid grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="h-screen sticky top-0 bg-white border-r p-4 space-y-4 overflow-y-auto">
          <div className="font-bold text-lg">Speedy CRM</div>
          <nav className="space-y-1">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass} end={to === "/dashboard"}>
                {Icon ? <Icon className="h-5 w-5" /> : null}
                <span>{label}</span>
              </NavLink>
            ))}
            {/* keep logout visible */}
            <NavLink to="/logout" className={linkClass}>Logout</NavLink>
          </nav>
        </aside>

        {/* Main area */}
        <main className="min-h-screen">
          {/* Top bar */}
          <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
            <div className="font-semibold">Speedy Credit Repair CRM</div>
            <div className="text-sm opacity-80">
              {user?.email ?? "Signed in"}
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
