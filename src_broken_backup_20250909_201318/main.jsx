// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { initTheme } from "./theme/initTheme";
import App from "./App";
import "./index.css";
import "./theme/theme.css";
import ThemeProvider from "./theme/ThemeProvider";

// Apply saved theme before first paint
initTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
