// src/layout/navConfig.js
// Centralized menu: tweak labels/paths/icons here; ProtectedLayout will render from this list.

import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  IdentificationIcon,
  DocumentTextIcon,
  FolderIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  CpuChipIcon,    // for OpenAI
  LockClosedIcon, // for Permissions
} from "@heroicons/react/24/outline";
import { Target, Bot } from 'lucide-react';

const item = (label, to, icon, opts = {}) => ({ label, to, icon, ...opts });

export const navItems = [
  item("Social Admin", "/social-admin", DocumentTextIcon),
  // Dashboard
  item("Dashboard", "/dashboard", HomeIcon),

  // Client Management
  item("Contacts", "/contacts", IdentificationIcon),
  item("Clients", "/client-management", UsersIcon),

  // Leads
  item("Leads", "/leads", Target),

  // Credit Repair/Services
  item("IDIQ Integration", "/idiq", ShieldCheckIcon, { requiresIdiq: true }),
  item("Dispute Center", "/dispute-center", DocumentTextIcon),
  item("Progress Portal", "/progress-portal", ChartBarIcon),
  item("Analytics", "/analytics", ChartBarIcon),
  item("Contact Reports", "/contact-reports", ChartBarIcon),
  item("Letters", "/letters", DocumentTextIcon),
  item("Credit Scores", "/credit-scores", ChartBarIcon),
  item("Dispute Letters", "/dispute-letters", DocumentTextIcon),

  // Business Tools (Tools & Utilities)
  item("Billing", "/billing", CreditCardIcon),
  item("Calendar", "/calendar", ChartBarIcon),
  item("Communications", "/communications", FolderIcon),
  item("Export", "/export", DocumentTextIcon),
  item("Bulk Actions", "/bulk", FolderIcon),

  // Automation & AI
  item("Automation Rules", "/automation", Cog6ToothIcon),
  item("Drip Campaigns", "/drip-campaigns", CpuChipIcon),
  item("OpenAI Integration", "/openai", CpuChipIcon),
  item("AI Command Center", "/ai-command-center", ChartBarIcon),

  // Administration
  item("Permissions", "/permissions", LockClosedIcon),
  item("Setup", "/setup", Cog6ToothIcon),
  item("User Management", "/user-management", UsersIcon),
  item("Roles & Permissions", "/roles", ShieldCheckIcon),
  item("Location", "/location", IdentificationIcon),

  // Support
  item("Help", "/help", ChartBarIcon),
  item("Add Contact", "/add-client", UserPlusIcon)
];
