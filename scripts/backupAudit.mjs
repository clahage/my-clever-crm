// scripts/backupAudit.mjs
// Audits backup files and outputs audit/backup-audit-report.json and .md
import fs from 'fs';
import path from 'path';

const configPath = path.resolve('backup.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const signals = [
  'OpenAI', 'Receptionist', 'Webhooks', 'LeadScoring', 'Firestore', 'Social', 'Widgets', 'Nav'
];
const backupDir = config.backupDir || 'backups';
const auditDir = 'audit';
if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir);

const report = { signals: {}, summary: {} };
signals.forEach(signal => {
  const files = fs.readdirSync(backupDir).filter(f => f.toLowerCase().includes(signal.toLowerCase()));
  report.signals[signal] = files;
});
report.summary.totalBackups = Object.values(report.signals).reduce((a, b) => a + b.length, 0);
fs.writeFileSync(path.join(auditDir, 'backup-audit-report.json'), JSON.stringify(report, null, 2));

// Markdown summary
let md = `# Backup Audit Report\n\n`;
Object.entries(report.signals).forEach(([signal, files]) => {
  md += `## ${signal}\n`;
  if (files.length) md += files.map(f => `- ${f}`).join('\n') + '\n';
  else md += '_No backups found_\n';
});
md += `\n**Total backups:** ${report.summary.totalBackups}\n`;
fs.writeFileSync(path.join(auditDir, 'backup-audit-report.md'), md);
console.log('Backup audit complete.');
