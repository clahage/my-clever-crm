import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { navigation } from "./navConfig";
import BrandLogo from "../components/BrandLogo";
import HotLeadsAlert from '../components/HotLeadsAlert';
import { Moon, Sun, Menu, X } from 'lucide-react';

export default function ProtectedLayout() {
  console.log('[ProtectedLayout] Rendering layout, current path:', window.location.pathname);
  const { user } = useAuth();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme state
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
    <div className="flex h-screen bg-white dark:bg-gray-900 relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile by default, slides in when open */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r dark:border-gray-700
        p-4 space-y-4 overflow-y-auto flex flex-col z-40
        transition-transform duration-300 ease-in-out
        w-64 md:w-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo - Add padding on mobile to avoid menu button */}
        <div className="mt-12 md:mt-0">
          <BrandLogo variant="admin" theme={isDarkMode ? 'dark' : 'light'} style={{height:40}} />
        </div>

        <nav className="space-y-1 flex-1">
          {navigation
            .filter(item => !item.requiresIdiq || (user && user.claims && user.claims.idiq))
            .map(({ name, href, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                className={linkClass}
                end={href === "/dashboard"}
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on mobile after clicking
              >
                {Icon ? <Icon className="h-5 w-5" /> : null}
                <span>{name}</span>
              </NavLink>
            ))}
          <NavLink
            to="/logout"
            className={linkClass}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Logout
          </NavLink>
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

      {/* Main content - Full width on mobile, margin-left on desktop */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 w-full">
        {/* Add padding-top on mobile for menu button */}
        <div className="p-6 pt-16 md:pt-6">
          <HotLeadsAlert />
          <Outlet />
        </div>
      </main>
    </div>
  );
}