import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { navigation } from "./navConfig";
import BrandLogo from "../components/BrandLogo";
import HotLeadsAlert from '../components/HotLeadsAlert';
import { Moon, Sun } from 'lucide-react';

export default function ProtectedLayout() {
  console.log('[ProtectedLayout] Rendering layout, current path:', window.location.pathname);
  const { user } = useAuth();

  // Simple local state for theme - no context needed for now
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition
     ${isActive ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="h-screen sticky top-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 space-y-4 overflow-y-auto flex flex-col">
        <BrandLogo variant="admin" theme={isDarkMode ? 'dark' : 'light'} style={{height:40}} />
        <nav className="space-y-1 flex-1">
          {navigation
            .filter(item => !item.requiresIdiq || (user && user.claims && user.claims.idiq))
            .map((item) => (
              <NavLink key={item.href} to={item.href} className={linkClass} end={item.href === "/dashboard"}>
                {item.icon ? <item.icon className="h-5 w-5" /> : null}
                <span>{item.name}</span>
              </NavLink>
            ))}
          <NavLink to="/logout" className={linkClass}>Logout</NavLink>
        </nav>
        {/* Theme Toggle */}
        <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="flex items-center gap-3">
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </span>
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="p-6">
          <HotLeadsAlert />
          <Outlet />
        </div>
      </main>
    </div>
  );
}