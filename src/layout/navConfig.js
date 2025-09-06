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
} from "@heroicons/react/24/outline";

const item = (label, to, icon, opts = {}) => ({ label, to, icon, ...opts });

export const navItems = [
  item("Dashboard", "/dashboard", HomeIcon),
  item("Contacts", "/contacts", IdentificationIcon),
  item("Add Client", "/add-client", UserPlusIcon),
  item("Disputes", "/disputes", DocumentTextIcon),
  item("Documents", "/documents", FolderIcon),
  item("Billing", "/billing", CreditCardIcon),
  item("Reports", "/reports", ChartBarIcon),
  item("IDIQ", "/idiq", ShieldCheckIcon),
  item("Admin Tools", "/admin-tools", WrenchScrewdriverIcon),
  item("Settings", "/settings", Cog6ToothIcon),
];
