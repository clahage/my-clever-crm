import React, { useState, useEffect } from "react";
import { getApiKey, setApiKey } from "../openaiConfig";
import { Link } from "react-router-dom";

// Simple encryption/decryption for demo (replace with robust solution in production)
function encrypt(text) {
  return btoa(text);
}
function decrypt(text) {
  try { return atob(text); } catch { return ""; }
}

function saveKeyToStorage(key) {
  localStorage.setItem("openai_api_key", encrypt(key));
}
function loadKeyFromStorage() {
  const enc = localStorage.getItem("openai_api_key");
  return enc ? decrypt(enc) : "";
}
function removeKeyFromStorage() {
  localStorage.removeItem("openai_api_key");
}

async function validateApiKey(key) {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { "Authorization": `Bearer ${key}` }
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default function Settings() {
  const [apiKey, setApiKeyState] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState("not_configured");
  const [usage, setUsage] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState("");
  const [activeTab, setActiveTab] = useState("openai");

  useEffect(() => {
    const stored = loadKeyFromStorage();
    if (stored) {
      setApiKeyState(stored);
      setApiKey(stored);
      setStatus("connected");
    }
  }, []);

  const handleKeyChange = e => {
    setApiKeyState(e.target.value);
    setStatus("not_configured");
  };

  const handleSaveKey = () => {
    saveKeyToStorage(apiKey);
    setApiKey(apiKey);
    setStatus("not_configured");
  };

  const handleRemoveKey = () => {
    removeKeyFromStorage();
    setApiKeyState("");
    setApiKey("");
    setStatus("not_configured");
  };

  const handleTestKey = async () => {
    setTestLoading(true);
    setTestError("");
    const valid = await validateApiKey(apiKey);
    setTestLoading(false);
    if (valid) {
      setStatus("connected");
    } else {
      setStatus("invalid");
      setTestError("API key is invalid or connection failed.");
    }
  };

  // Usage tracking (demo: fetch usage from OpenAI API)
  useEffect(() => {
    async function fetchUsage() {
      if (!apiKey) return;
      try {
        const resp = await fetch("https://api.openai.com/v1/dashboard/billing/usage", {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          setUsage(data);
        }
      } catch {}
    }
    fetchUsage();
  }, [apiKey, status]);

  // Backup/Recovery
  const handleBackup = () => {
    const backup = encrypt(apiKey);
    navigator.clipboard.writeText(backup);
    alert("API key backup copied to clipboard.");
  };
  const handleRestore = () => {
    const backup = prompt("Paste your encrypted API key backup:");
    if (backup) {
      const key = decrypt(backup);
      setApiKeyState(key);
      saveKeyToStorage(key);
      setApiKey(key);
      setStatus("not_configured");
    }
  };

  // Security warning
  const securityWarning = (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <strong>Security Warning:</strong> Never share your API key. Store it securely. For production, use environment variables and server-side storage.
    </div>
  );

  // Status indicator
  const statusIndicator = (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${status === "connected" ? "bg-green-100 text-green-700" : status === "invalid" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
      {status === "connected" ? "Connected" : status === "invalid" ? "Invalid" : "Not Configured"}
    </span>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="mb-8 text-lg text-gray-700">Manage your CRM settings here.</p>
        <div className="bg-white rounded-lg border shadow p-6">
          {securityWarning}
          <div className="mb-4 flex items-center gap-2">
            <label className="font-semibold">OpenAI API Key:</label>
            {statusIndicator}
          </div>
          <div className="mb-4 flex gap-2 items-center">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={handleKeyChange}
              className="border rounded px-3 py-2 w-full max-w-md"
              placeholder="Enter your OpenAI API key"
            />
            <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => setShowKey(s => !s)}>
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <div className="mb-4 flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveKey}>Save Key</button>
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={handleRemoveKey}>Remove Key</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleTestKey} disabled={testLoading}>{testLoading ? "Testing..." : "Test Connection"}</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" onClick={handleBackup}>Backup Key</button>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700" onClick={handleRestore}>Restore Key</button>
          </div>
          {testError && <div className="text-red-600 mb-2">{testError}</div>}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Usage & Rate Limits</h3>
            {usage ? (
              <div className="bg-gray-100 p-4 rounded text-sm">
                <div><strong>Usage:</strong> ${usage.total_usage || "N/A"}</div>
                <div><strong>Rate Limit:</strong> {usage.rate_limit || "N/A"}</div>
              </div>
            ) : (
              <div className="text-gray-500">No usage data available.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
