
import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUser,
  FaRocket,
  FaLayerGroup,
  FaFileAlt,
  FaChartBar,
  FaTools,
  FaMoneyBill,
  FaCalendarAlt,
  FaEnvelope,
  FaCogs,
  FaShieldAlt,
  FaQuestionCircle
} from "react-icons/fa";

const navSections = [
  {
    label: "Dashboard",
    icon: <FaHome className="mr-2" />,
    links: [
      { label: "Dashboard", to: "/dashboard", icon: <FaHome /> },
    ],
  },
  {
    label: "Client Management",
    icon: <FaUsers className="mr-2" />,
    links: [
      { label: "Contacts", to: "/contacts", icon: <FaUser /> },
    ],
  },
  {
    label: "Credit Repair",
    icon: <FaLayerGroup className="mr-2" />,
    links: [
      { label: "Dispute Center", to: "/dispute-center", icon: <FaFileAlt /> },
      { label: "Progress Portal", to: "/progress-portal", icon: <FaChartBar /> },
      { label: "Analytics", to: "/analytics", icon: <FaChartBar /> },
      { label: "Contact Reports", to: "/contact-reports", icon: <FaChartBar /> },
      { label: "Letters", to: "/letters", icon: <FaFileAlt /> },
    ],
  },
  {
    label: "Business Tools",
    icon: <FaTools className="mr-2" />,
    links: [
      { label: "Billing", to: "/billing", icon: <FaMoneyBill /> },
      { label: "Calendar", to: "/calendar", icon: <FaCalendarAlt /> },
      { label: "Communications", to: "/communications", icon: <FaEnvelope /> },
      { label: "Export", to: "/export", icon: <FaFileAlt /> },
      { label: "Bulk", to: "/bulk", icon: <FaLayerGroup /> },
    ],
  },
  {
    label: "Support",
    icon: <FaQuestionCircle className="mr-2" />,
    links: [
      { label: "Help", to: "/help", icon: <FaQuestionCircle /> },
    ],
  },
  {
    label: "Automation",
    icon: <FaCogs className="mr-2" />,
    links: [
      { label: "Automation", to: "/automation", icon: <FaCogs /> },
      { label: "Drip Campaigns", to: "/drip-campaigns", icon: <FaRocket /> },
    ],
  },
  {
    label: "Administration",
    icon: <FaShieldAlt className="mr-2" />,
    links: [
      { label: "Administration", to: "/administration", icon: <FaShieldAlt /> },
      { label: "Permissions", to: "/permissions", icon: <FaShieldAlt /> },
      { label: "OpenAI Integration", to: "/openai", icon: <FaRocket /> },
      { label: "AI Command Center", to: "/ai-command-center", icon: <FaChartBar /> },
      { label: "Setup", to: "/setup", icon: <FaCogs /> },
      { label: "Location", to: "/location", icon: <FaUser /> },
    ],
  },
];

import { useNotification } from '../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';

export default function Navigation() {
  const location = useLocation();
  const [openSection, setOpenSection] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { urgentCount } = useNotification();

  const handleAccordion = idx => {
    setOpenSection(openSection === idx ? null : idx);
  };

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

        {/* Accordion Sidebar */}
        <div className="flex-1">
          {navSections.map((section, idx) => (
            <div key={section.label} className="mb-2">
              <button
                className={`w-full flex items-center justify-between px-3 py-2 font-semibold text-left rounded transition-colors duration-350 focus:outline-none ${openSection === idx ? 'bg-blue-800' : 'bg-blue-900 hover:bg-blue-800'}`}
                onClick={() => handleAccordion(idx)}
                aria-expanded={openSection === idx}
              >
                <span className="flex items-center">{section.icon}{section.label}</span>
                <span className={`ml-2 transition-transform duration-350 ${openSection === idx ? 'rotate-90' : ''}`}>▶</span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-350 ${openSection === idx ? 'max-h-96 py-2' : 'max-h-0 py-0'}`}
              >
                <ul className="pl-6">
                  {section.links.map(link => (
                    <li key={link.label} className="mb-1">
                      <Link
                        to={link.to}
                        className={`flex items-center px-2 py-2 rounded text-sm font-medium transition-colors duration-350 ${location.pathname === link.to ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="mr-2">{link.icon}</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
