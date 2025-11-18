// src/lib/api/askClient.js
const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "/api";

export async function askChat({ messages, model = "gpt-4.1-mini", temperature = 0.4, max_tokens = 500, signal } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("askChat: messages[] is required");
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort("Request timeout"), 20000);
  const mergedSignal = signal
    ? new AbortController() // merge external + internal signals
    : ctrl;

  try {
    const res = await fetch(`${BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model, temperature, max_tokens }),
      signal: ctrl.signal
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`askChat: ${res.status} ${res.statusText} ${text}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
