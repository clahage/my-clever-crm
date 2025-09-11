// scripts/precommit-pii.mjs
import fs from 'fs';
import path from 'path';

const patterns = [
  /\b\d{3}-?\d{2}-?\d{4}\b/g, // SSN
  /(pwd|password|pass|secret)\s*[:=]\s*[^\s,]+/gi, // password keys
  /sk-[A-Za-z0-9]{20,}/g, // OpenAI key
  /(AUTH_TOKEN|ACCOUNT_SID|TWILIO_[A-Z_]+)\s*=\s*[^\s,]+/g, // Twilio
  /TWILIO_/g, // Twilio
  /IDIQ/gi, // IDIQ
  /usn to idiq/gi, // usn to idiq
  /pwd to idiq/gi // pwd to idiq
];

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pat of patterns) {
    if (pat.test(content)) {
      console.error(`PII pattern found in ${file}: ${pat}`);
      process.exit(1);
    }
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.match(/\.(js|jsx|ts|tsx|json|env|md)$/i)) scanFile(full);
  }
}

walk(process.cwd());
console.log('PII pre-commit scan passed.');
