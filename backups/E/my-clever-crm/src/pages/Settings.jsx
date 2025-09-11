// src/pages/Settings.jsx
import React from "react";
import TopNav from "../layout/TopNav";
import SkinSwitcher from "../skins/SkinSwitcher";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="mt-4 space-y-2">
          <button
            onClick={() => {
              localStorage.setItem("scr.role", "admin");
              alert("Role set to admin for testing. Refresh to see FAB.");
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            Set Role: Admin (Test)
          </button>
          <button
            onClick={() => {
              localStorage.setItem("scr.role", "user");
              alert("Role set to user for testing. Refresh to hide FAB.");
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            Set Role: User (Test)
          </button>
        </div>
      </main>
      <SkinSwitcher />
    </div>
  );
}
