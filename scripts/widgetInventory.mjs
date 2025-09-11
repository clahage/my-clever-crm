// scripts/widgetInventory.mjs
// Outputs audit/widgets-inventory.md with all widget components and missing
import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src');
const auditDir = 'audit';
if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir);

const widgetSignals = [
  'AI Receptionist', 'OpenAI', 'Firestore', 'Social', 'LeadScoring', 'Webhooks', 'Widgets'
];
const files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/widget/i.test(f)) files.push(full.replace(process.cwd()+path.sep, ''));
  }
}
walk(srcDir);
let md = `# Widget Inventory\n\n## Widget Components\n`;
files.forEach(f => { md += `- ${f}\n`; });
md += `\n## Missing Signals\n`;
widgetSignals.forEach(sig => {
  if (!files.some(f => f.toLowerCase().includes(sig.replace(/\s+/g, '').toLowerCase())))
    md += `- ${sig}\n`;
});
fs.writeFileSync(path.join(auditDir, `widgets-inventory.md`), md);
console.log('Widget inventory complete.');
