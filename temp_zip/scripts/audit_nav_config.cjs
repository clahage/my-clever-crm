const fs = require('fs');
const path = require('path');

const NAV_SRC = path.resolve(process.cwd(), 'src/layout/navConfig.js');
const INVENTORY_CSV = path.resolve(process.cwd(), 'repo_inventory_final.csv');
const OUT_MD = path.resolve(process.cwd(), 'audits/navConfig_audit.md');

if (!fs.existsSync(NAV_SRC)) {
  console.error('navConfig.js not found at', NAV_SRC);
  process.exit(1);
}
if (!fs.existsSync(INVENTORY_CSV)) {
  console.error('repo_inventory_final.csv not found at', INVENTORY_CSV);
  process.exit(1);
}

const navText = fs.readFileSync(NAV_SRC, 'utf8');
const invText = fs.readFileSync(INVENTORY_CSV, 'utf8');

// Build a simple inventory map: lowercase relpath -> row object
const invLines = invText.split(/\r?\n/).filter(Boolean);
const invHeader = invLines.shift().split(',');
const invRows = invLines.map(l => {
  const parts = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  return {
    FileName: parts[0].replace(/^"|"$/g,'') || '',
    RelPath: parts[1].replace(/^"|"$/g,''),
    LineCount: parseInt(parts[2],10) || 0,
    SizeKB: parseFloat(parts[3]) || 0,
    LastModified: parts[4].replace(/^"|"$/g,'') || '',
    Category: parts[5].replace(/^"|"$/g,'') || '',
    Purpose: parts[6].replace(/^"|"$/g,'') || '',
    Flags: parts[7].replace(/^"|"$/g,'') || ''
  };
});
const invMap = Object.create(null);
invRows.forEach(r => invMap[r.RelPath.toLowerCase()] = r);

// crude parser: walk lines and extract objects with title/path/icon/permission
const lines = navText.split(/\r?\n/);
const items = [];
let parentStack = [];
let inItemsArray = false;
let braceDepth = 0;
let current = null;

for (let i=0;i<lines.length;i++){
  const ln = lines[i].trim();
  if (/items:\s*\[/.test(ln)) {
    // push current parent
    if (current) parentStack.push(current);
    inItemsArray = true;
    continue;
  }
  if (inItemsArray && ln === '],') {
    parentStack.pop();
    inItemsArray = false;
    continue;
  }
  // detect object start
  if (ln.startsWith('{')) {
    braceDepth = 1;
    current = {rawLines: [], parent: (parentStack[parentStack.length-1] && parentStack[parentStack.length-1].title) || null};
    current.rawLines.push(ln);
    continue;
  }
  if (current) {
    current.rawLines.push(ln);
    if (ln.includes('{')) braceDepth += (ln.match(/{/g)||[]).length;
    if (ln.includes('}')) braceDepth -= (ln.match(/}/g)||[]).length;
    if (braceDepth === 0) {
      // finished object - parse fields
      const text = current.rawLines.join('\n');
      const getField = (key) => {
        const m = text.match(new RegExp(key + '\\s*:\\s*(?:"([^"]+)"|([A-Za-z0-9_\/\\-]+))'));
        if (!m) return null;
        return m[1] || m[2] || null;
      };
      const title = getField('title');
      const pathField = getField('path');
      const icon = getField('icon');
      const permission = getField('permission');
      const id = getField('id');
      // only consider items that have title
      if (title) items.push({id, title, path: pathField, icon, permission, parent: current.parent, raw: text});
      current = null;
    }
  }
}

// Deduplicate and normalize items
const normalized = items.map(it => {
  const pathStr = it.path ? it.path.replace(/['" ]/g,'') : '';
  const slug = pathStr.replace(/^\//,'').split('/').filter(Boolean).slice(-1)[0] || '';
  // Lookup inventory rows that contain the slug
  const matches = invRows.filter(r => r.RelPath.toLowerCase().includes('/' + slug.toLowerCase()) || r.FileName.toLowerCase().includes(slug.toLowerCase()));
  const match = matches[0] || null;
  return Object.assign({}, it, {path: pathStr, slug, match});
});

// Build markdown
let md = '# Navigation Configuration Audit\n\n';
md += '| Label | Path | File Location | Exists? | Line Count | Issues |\n';
md += '|---|---|---|---:|---:|---|\n';

normalized.forEach(it => {
  const fileLoc = it.match ? it.match.RelPath : '';
  const exists = !!it.match;
  const linesCount = it.match ? it.match.LineCount : '';
  const issues = [];
  if (!it.path) issues.push('No path');
  if (!exists) issues.push('File missing');
  if (it.match && it.slug && !it.match.RelPath.toLowerCase().includes('/' + it.slug.toLowerCase())) issues.push('Path mismatch');
  if (linesCount && linesCount < 20) issues.push('Small file (<20 lines)');
  md += `| ${it.title} | ${it.path || ''} | ${fileLoc} | ${exists ? 'Yes' : 'No'} | ${linesCount} | ${issues.join('; ')} |\n`;
});

fs.mkdirSync(path.dirname(OUT_MD), {recursive:true});
fs.writeFileSync(OUT_MD, md, 'utf8');
console.log('Wrote', OUT_MD);
