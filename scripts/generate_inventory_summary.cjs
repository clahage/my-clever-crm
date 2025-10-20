const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(process.cwd(), 'repo_inventory_final.csv');
if (!fs.existsSync(csvPath)) {
  console.error('repo_inventory_final.csv not found');
  process.exit(1);
}

const text = fs.readFileSync(csvPath, 'utf8');
const lines = text.split(/\r?\n/).filter(Boolean);
const header = lines.shift().split(',');

const rows = lines.map(l => {
  // quick split that handles quoted fields roughly for this controlled file
  const parts = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  return {
    FileName: parts[0].replace(/^"|"$/g,'') || '',
    RelPath: parts[1].replace(/^"|"$/g,'') || '',
    LineCount: parseInt(parts[2], 10) || 0,
    SizeKB: parseFloat(parts[3]) || 0,
    LastModified: parts[4].replace(/^"|"$/g,'') || '',
    Category: parts[5].replace(/^"|"$/g,'') || '',
    Purpose: parts[6].replace(/^"|"$/g,'') || '',
    Flags: parts[7].replace(/^"|"$/g,'') || '',
  };
});

const groups = {};
rows.forEach(r => {
  if (!groups[r.Category]) groups[r.Category] = [];
  if (groups[r.Category].length < 10) groups[r.Category].push(r);
});

let md = '# Inventory Summary\n\n';
Object.keys(groups).sort().forEach(cat => {
  md += `## ${cat}: ${groups[cat].length} sample files\n\n`;
  groups[cat].forEach(r => md += `- ${r.FileName} — ${r.RelPath} — ${r.LineCount} lines\n`);
  md += '\n';
});

fs.writeFileSync(path.resolve(process.cwd(), 'repo_inventory_grouped_summary.md'), md);
console.log('Wrote repo_inventory_grouped_summary.md');
