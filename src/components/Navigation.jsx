// Navigation.jsx - 12-Hub Consolidated Navigation Structure
// Updated: Phase 3 Navigation Consolidation

import React, { useState } from "react";
import {
  FaBars,
  FaHome,
  FaUsers,
  FaFileAlt,
  FaChartBar,
  FaEnvelope,
  FaRocket,
  FaMoneyBill,
  FaGraduationCap,
  FaRobot,
  FaFolder,
  FaCogs,
  FaQuestionCircle
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

// ============================================================================
// 12 CORE HUBS - Consolidated Navigation Structure
// ============================================================================
const coreHubs = [
  {
    label: "Dashboard",
    icon: <FaHome />,
    to: "/smart-dashboard",
    description: "Main command center"
  },
  {
    label: "Clients Hub",
    icon: <FaUsers />,
    to: "/clients-hub",
    description: "Client management"
  },
  {
    label: "Disputes Hub",
    icon: <FaFileAlt />,
    to: "/dispute-hub",
    description: "Dispute management"
  },
  {
    label: "Analytics Hub",
    icon: <FaChartBar />,
    to: "/analytics-hub",
    description: "Reports & insights"
  },
  {
    label: "Communications",
    icon: <FaEnvelope />,
    to: "/comms-hub",
    description: "Email, SMS, calls"
  },
  {
    label: "Marketing Hub",
    icon: <FaRocket />,
    to: "/marketing-hub",
    description: "Campaigns & outreach"
  },
  {
    label: "Billing Hub",
    icon: <FaMoneyBill />,
    to: "/billing-hub",
    description: "Invoices & payments"
  },
  {
    label: "Learning Hub",
    icon: <FaGraduationCap />,
    to: "/learning-hub",
    description: "Training & resources"
  },
  {
    label: "AI Hub",
    icon: <FaRobot />,
    to: "/ai-hub",
    description: "AI-powered tools"
  },
  {
    label: "Documents Hub",
    icon: <FaFolder />,
    to: "/documents-hub",
    description: "Files & templates"
  },
  {
    label: "Settings Hub",
    icon: <FaCogs />,
    to: "/settings-hub",
    description: "Configuration"
  },
  {
    label: "Support Hub",
    icon: <FaQuestionCircle />,
    to: "/support-hub",
    description: "Help & resources"
  },
];

import { useNotification } from '../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';

export default function Navigation() {
  const location = useLocation();
  const [showPanel, setShowPanel] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { urgentCount } = useNotification();
  const { user, loading, claims } = useAuth();
  if (loading) return null; // don't render menu until ready

  // Responsive: show hamburger on mobile
  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          aria-label="Open menu"
          className="p-2 rounded-full bg-blue-700 text-white shadow-lg"
          onClick={() => setMobileOpen(true)}
        >
          <FaBars size={24} />
        </button>
      </div>
      <nav
        className={`h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col py-6 px-4 shadow-2xl overflow-y-auto fixed top-0 left-0 z-40 transition-transform duration-300 md:relative md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:block`}
        style={{ minHeight: '100vh' }}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end mb-2">
          <button
            aria-label="Close menu"
            className="p-2 rounded-full bg-blue-700 text-white shadow-lg"
            onClick={() => setMobileOpen(false)}
          >
            ✕
          </button>
        </div>
        {/* Branding/Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo-brand-128.png" alt="Speedy Credit Repair" className="w-14 h-14 mb-2 rounded-full shadow-lg bg-white" />
          <div className="text-xl font-extrabold tracking-wide mb-1">Speedy Credit Repair</div>
          <div className="text-xs text-blue-200 font-semibold">CRM Platform</div>
        </div>

        {/* Notification Bell */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <span className="text-2xl cursor-pointer" title="Urgent Notifications" onClick={() => setShowPanel(v => !v)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-yellow-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {urgentCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs font-bold">{urgentCount}</span>
              )}
            </span>
            {showPanel && <NotificationPanel isOpen={showPanel} onClose={() => setShowPanel(false)} />}
          </div>
        </div>

        {/* 12 Core Hubs - Flat Navigation */}
        <div className="flex-1 space-y-1">
          {coreHubs.map((hub) => {
            const isActive = location.pathname === hub.to ||
              (hub.to !== '/smart-dashboard' && location.pathname.startsWith(hub.to.replace('-hub', '')));

            return (
              <Link
                key={hub.label}
                to={hub.to}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className={`text-lg mr-3 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`}>
                  {hub.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{hub.label}</div>
                  <div className={`text-xs truncate ${isActive ? 'text-blue-200' : 'text-blue-400 group-hover:text-blue-200'}`}>
                    {hub.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full ml-2"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Links Footer */}
        <div className="mt-4 pt-4 border-t border-blue-700">
          <Link
            to="/home"
            className="flex items-center px-3 py-2 text-xs text-blue-300 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <FaHome className="mr-2" />
            Welcome Hub
          </Link>
        </div>
      </nav>
    </>
  );
}
