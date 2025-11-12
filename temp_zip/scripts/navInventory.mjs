// scripts/navInventory.mjs
// Outputs audit/nav-inventory.md with all nav items and missing items
import fs from 'fs';
import path from 'path';

const navConfigPath = path.resolve('src/layout/navConfig.js');
const auditDir = 'audit';
if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir);

const navConfig = fs.readFileSync(navConfigPath, 'utf-8');
const navItems = Array.from(navConfig.matchAll(/item\(("|')(.*?)\1,\s*("|')(.*?)\3/g)).map(m => ({ label: m[2], path: m[4] }));
const expected = [
  'Dashboard', 'Contacts', 'Leads', 'Add Client', 'OpenAI', 'Permissions', 'Disputes', 'Documents', 'Billing', 'Reports', 'IDIQ', 'Admin Tools', 'Settings'
];
const missing = expected.filter(label => !navItems.some(n => n.label === label));
let md = `# Navigation Inventory\n\n## Current Items\n`;
navItems.forEach(n => { md += `- ${n.label} (${n.path})\n`; });
md += `\n## Missing\n`;
if (missing.length) md += missing.map(m => `- ${m}`).join('\n') + '\n';
else md += '_None_\n';
fs.writeFileSync(path.join(auditDir, `nav-inventory.md`), md);
console.log('Navigation inventory complete.');
