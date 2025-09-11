import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { navItems } from "@/layout/navConfig";
import BrandLogo from "@/components/BrandLogo";
import { useTheme } from '@/theme/ThemeProvider';

// --- ON-SCREEN BEACON ---
const Beacon = () => (
  <div style={{background:'#fee2e2',color:'#b91c1c',padding:'4px 0',textAlign:'center',fontWeight:'bold',letterSpacing:1,marginBottom:12,zIndex:9999}}>
    [BEACON: ProtectedLayout.jsx]
  </div>
);

export default function ProtectedLayout() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition
     ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {import.meta.env.DEV && <Beacon />}
      <div className="grid grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="h-screen sticky top-0 bg-white border-r p-4 space-y-4 overflow-y-auto">
          <BrandLogo variant="admin" theme={theme === 'dark' ? 'dark' : 'light'} style={{height:40}} />
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
            <div className="flex items-center text-sm opacity-80">
              {user?.email ?? "Signed in"}
              <button
                className="ml-4 px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
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
