
import React, { useState } from "react";
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
      { label: "Clients", to: "/clients", icon: <FaUser /> },
      { label: "Add Client", to: "/add-client", icon: <FaUser /> },
      { label: "Contacts", to: "/contacts", icon: <FaUser /> },
      { label: "Leads", to: "/leads", icon: <FaRocket /> },
      { label: "Prospects", to: "/prospects", icon: <FaRocket /> },
    ],
  },
  {
    label: "Credit Repair",
    icon: <FaLayerGroup className="mr-2" />,
    links: [
      { label: "Dispute Center", to: "/dispute-center", icon: <FaFileAlt /> },
      { label: "Progress Portal", to: "/progress-portal", icon: <FaChartBar /> },
      { label: "Analytics", to: "/analytics", icon: <FaChartBar /> },
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
      { label: "Setup", to: "/setup", icon: <FaCogs /> },
      { label: "Location", to: "/location", icon: <FaUser /> },
    ],
  },
];

export default function Navigation() {
  const location = useLocation();
  const [openSection, setOpenSection] = useState(null);

  const handleAccordion = idx => {
    setOpenSection(openSection === idx ? null : idx);
  };

  return (
    <nav className="h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col py-6 px-4 shadow-2xl overflow-y-auto">
      {/* Branding/Logo Section */}
      <div className="flex flex-col items-center mb-6">
        <img src="/logo-brand-128.png" alt="Speedy Credit Repair" className="w-14 h-14 mb-2 rounded-full shadow-lg bg-white" />
        <div className="text-xl font-extrabold tracking-wide mb-1">Speedy Credit Repair</div>
        <div className="text-xs text-blue-200 font-semibold">CRM Platform</div>
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
  );
}
