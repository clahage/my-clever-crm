const fs = require('fs');
const path = require('path');

console.log('generate_inventory.cjs starting', { cwd: process.cwd(), node: process.version });

const csvPath = path.resolve(process.cwd(), 'repo_inventory_raw.csv');
if (!fs.existsSync(csvPath)) {
  console.error('repo_inventory_raw.csv not found');
  process.exit(1);
}

const text = fs.readFileSync(csvPath, 'utf8');
// Simple CSV parser for known format (no newlines in fields)
const lines = text.split(/\r?\n/).filter(Boolean);
const header = lines.shift().split(',').map(h => h.replace(/"/g, ''));

function parseLine(line) {
  const cols = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i+1] === '"') { cur += '"'; i++; continue; }
      inQuote = !inQuote;
      continue;
    }
    if (ch === ',' && !inQuote) {
      cols.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  cols.push(cur);
  return cols;
}

const rows = lines.map(l => {
  const cols = parseLine(l);
  const obj = {};
  for (let i = 0; i < header.length; i++) {
    obj[header[i]] = cols[i] || '';
  }
  // Normalize RelPath to use forward slashes and relative
  obj.RelPath = obj.RelPath.replace(/\\/g, '/');
  // Extract file name
  obj.FileName = path.basename(obj.RelPath);
  obj.Extension = path.extname(obj.FileName).toLowerCase();
  obj.LineCount = parseInt(obj.LineCount || '0', 10);
  obj.SizeKB = parseFloat(obj.SizeKB || '0');
  return obj;
});

// Categorize
function categoryFor(rel) {
  if (rel.startsWith('src/pages/') || rel.includes('/pages/')) return 'Page';
  if (rel.startsWith('src/components/') || rel.includes('/components/')) return 'Component';
  if (rel.startsWith('src/services/') || rel.includes('/services/')) return 'Service';
  if (rel.startsWith('src/utils/') || rel.includes('/utils/')) return 'Utility';
  if (rel.startsWith('src/layout/') || rel.includes('/layout/')) return 'Layout';
  if (rel.startsWith('src/contexts/') || rel.includes('/contexts/')) return 'Context';
  if (rel.startsWith('src/pages/ClientPortal/')) return 'Page';
  if (rel.startsWith('backups/') || rel.startsWith('archive/') || rel.startsWith('__CLEANUP__') || rel.startsWith('backups\\')) return 'Backup';
  // config files at root or under config folder
  if (rel.toLowerCase().endsWith('navconfig.js') || rel.includes('/config/') || ['package.json','vite.config.js','postcss.config.js','tailwind.config.js','firebase.json','tsconfig.json'].includes(path.basename(rel))) return 'Config';
  // root level files
  if (rel.split('/').length === 1) return 'Root';
  // default
  return 'Other';
}

rows.forEach(r => r.Category = categoryFor(r.RelPath));

// Flags
rows.forEach(r => {
  const name = r.FileName.toLowerCase();
  const flags = [];
  if (/duplicate|backup|old|test/.test(name)) flags.push('special-name');
  if (r.LineCount < 10) flags.push('small-file');
  r.Flags = flags.join(';') || '';
});

// Similar names: group by file base name (without extension)
// Use a null-prototype object to avoid prototype key collisions (like 'constructor')
const nameMap = Object.create(null);
rows.forEach(r => {
  const base = r.FileName.replace(/\.[^.]+$/, '').toLowerCase();
  if (!nameMap[base]) nameMap[base] = [];
  nameMap[base].push(r.RelPath);
});
const similar = Object.create(null);
Object.keys(nameMap).forEach(base => {
  if (nameMap[base].length > 1) similar[base] = nameMap[base];
});

// Add similar flag
rows.forEach(r => {
  const base = r.FileName.replace(/\.[^.]+$/, '').toLowerCase();
  if (similar[base]) r.Flags = (r.Flags ? r.Flags + ';' : '') + 'similar-name';
});

// Add purpose heuristic
rows.forEach(r => {
  let purpose = '';
  if (r.Category === 'Page') purpose = 'Page (UI route)';
  else if (r.Category === 'Component') purpose = 'Reusable UI component';
  else if (r.Category === 'Service') purpose = 'Backend/service helper';
  else if (r.Category === 'Utility') purpose = 'Utility/helper';
  else if (r.Category === 'Layout') purpose = 'Layout/structure';
  else if (r.Category === 'Context') purpose = 'React context/provider';
  else if (r.Category === 'Config') purpose = 'Configuration file';
  else if (r.Category === 'Backup') purpose = 'Backup/archive';
  else if (r.Category === 'Root') purpose = 'Project root file';
  else purpose = 'Other/unknown';
  r.Purpose = purpose;
});

// Write final CSV
const outCsv = ['FileName,RelPath,LineCount,SizeKB,LastModified,Category,Purpose,Flags'];
rows.forEach(r => {
  const line = [
    '"' + r.FileName.replace(/"/g,'""') + '"',
    '"' + r.RelPath.replace(/"/g,'""') + '"',
    r.LineCount,
    r.SizeKB,
    '"' + r.LastModified + '"',
    '"' + r.Category + '"',
    '"' + r.Purpose.replace(/"/g,'""') + '"',
    '"' + r.Flags.replace(/"/g,'""') + '"'
  ].join(',');
  outCsv.push(line);
});
fs.writeFileSync(path.resolve(process.cwd(), 'repo_inventory_final.csv'), outCsv.join('\n'));

// Write grouped markdown by category
const groups = Object.create(null);
rows.forEach(r => {
  if (!groups[r.Category]) groups[r.Category] = [];
  groups[r.Category].push(r);
});

let md = '# Repository Inventory\n\n';
Object.keys(groups).sort().forEach(cat => {
  md += `## ${cat} (${groups[cat].length})\n\n`;
  md += '| File Name | Path | Lines | Size KB | Last Modified (UTC) | Purpose | Flags |\n';
  md += '|---|---|---:|---:|---|---|---|\n';
  groups[cat].forEach(r => {
    md += `| ${r.FileName} | ${r.RelPath} | ${r.LineCount} | ${r.SizeKB} | ${r.LastModified} | ${r.Purpose} | ${r.Flags} |\n`;
  });
  md += '\n';
});

// Add similar names section
md += '## Similar / duplicate file names\n\n';
Object.keys(similar).forEach(base => {
  md += `- ${base}:\n`;
  similar[base].forEach(p => md += `  - ${p}\n`);
});

fs.writeFileSync(path.resolve(process.cwd(), 'repo_inventory_grouped.md'), md);
console.log('Wrote repo_inventory_final.csv and repo_inventory_grouped.md');
