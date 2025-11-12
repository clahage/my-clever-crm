// scripts/test-idiq.mjs
import { setTimeout as delay } from "timers/promises";

const URL = process.env.IDIQ_FUNCTION_URL || "https://getidiqpartnertoken-tvkxcewmxq-uc.a.run.app";
const body = {};
const ctrl = new AbortController();
const timeoutMs = 15000;
const t = setTimeout(() => ctrl.abort(), timeoutMs);

console.log(`[IDIQ test] POST ${URL}`);
try {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body),
    signal: ctrl.signal,
  });
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    console.log("[IDIQ test] Status:", res.status);
    console.log(JSON.stringify(json, null, 2));
    if (!res.ok || json.error) process.exitCode = 1;
  } catch {
    console.log("[IDIQ test] Non-JSON response, status", res.status);
    console.log(text.slice(0, 500) || "(empty)");
    if (!res.ok) process.exitCode = 1;
  }
} catch (err) {
  console.error("[IDIQ test] Request failed:", err.message || err);
  process.exitCode = 1;
} finally {
  clearTimeout(t);
}
