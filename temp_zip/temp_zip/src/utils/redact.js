// src/utils/redact.js
export function redact(s="") {
  return String(s)
    .replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, "***-**-****")
    .replace(/(pwd|password|pass|secret)\s*[:=]\s*[^\s,]+/gi, "$1: ********")
    .replace(/sk-[A-Za-z0-9]{20,}/g, "sk-************************")
    .replace(/(AUTH_TOKEN|ACCOUNT_SID|TWILIO_[A-Z_]+)\s*=\s*[^\s,]+/g, "$1=********");
}
