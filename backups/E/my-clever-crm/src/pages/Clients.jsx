// src/pages/Clients.jsx
import React from "react";
import TopNav from "../layout/TopNav";
import SkinSwitcher from "../skins/SkinSwitcher";

const Clients = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Placeholder page. Add client table and filters here.
        </p>
      </main>
      <SkinSwitcher />
    </div>
  );
};

export default Clients;
