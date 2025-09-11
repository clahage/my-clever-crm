// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { initTheme } from "./theme/initTheme";
import App from "./App";

import Dashboard from "./components/Dashboard";
import ClientList from "../src/pages/ClientList";
import AddClient from "../src/pages/AddClient";
import EditClient from "../src/pages/EditClient";
import ClientProfile from "../src/pages/ClientProfile";
import Leads from "./components/Leads";
import Settings from "./components/Settings";
import ProgressPortal from "./components/ProgressPortal";
import DisputeCenter from "./components/DisputeCenter";
import "./index.css";
import "./theme/theme.css";

// Apply saved theme before first paint
initTheme();

// If you already have auth-protected routes, replace this with your existing ProtectedRoute.
function ProtectedRoute({ children }) {
  // Minimal placeholder: always allow (so you can test immediately).
  // Wire your real auth here later if needed.
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
