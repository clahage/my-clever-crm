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

const item = (label, to, icon, opts = {}) => ({ label, to, icon, ...opts });

export const navItems = [
  item("Dashboard", "/dashboard", HomeIcon),
  item("Contacts", "/contacts", IdentificationIcon),
  item("Leads", "/leads", UsersIcon),
  item("Add Client", "/add-client", UserPlusIcon),
  item("OpenAI", "/openai", CpuChipIcon),        // Added OpenAI
  item("Permissions", "/permissions", LockClosedIcon), // Added Permissions
  item("Documents", "/documents", FolderIcon),
  item("Billing", "/billing", CreditCardIcon),
  item("Reports", "/reports", ChartBarIcon),
  item("IDIQ", "/idiq", ShieldCheckIcon),
  item("Admin Tools", "/admin-tools", WrenchScrewdriverIcon),
  item("Settings", "/settings", Cog6ToothIcon),
  item("Progress Portal", "/progress", UsersIcon),
  item("Dispute Center", "/disputes", DocumentTextIcon),
  item("Activity Log", "/activity", ChartBarIcon),
  item("Features & Tutorials", "/features", ChartBarIcon),
];
