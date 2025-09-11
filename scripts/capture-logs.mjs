// scripts/capture-logs.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { redact } from '../src/utils/redact.js';

const auditDir = path.resolve('audit/logs');
if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });

function timestamp() {
  const d = new Date();
  return d.toISOString().replace(/[-:T]/g, '').slice(0, 13) + d.toISOString().slice(14, 19).replace(/:/g, '');
}

const logPath = path.join(auditDir, `leads-delta-${timestamp()}.txt`);

let output = '';
try {
  output += execSync('npm run guard', { encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  output += e.stdout || '';
  output += e.stderr || '';
}
try {
  output += execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  output += e.stdout || '';
  output += e.stderr || '';
}

const redacted = redact(output);
fs.writeFileSync(logPath, redacted, 'utf8');
console.log('LOG_FILE:', path.resolve(logPath));
