const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const NAV_SRC = path.resolve(ROOT, 'src/layout/navConfig.js');
const INVENTORY_CSV = path.resolve(ROOT, 'repo_inventory_final.csv');
const OUT_DIR = path.resolve(ROOT, 'audits');

if (!fs.existsSync(NAV_SRC)) { console.error('Missing', NAV_SRC); process.exit(1); }
if (!fs.existsSync(INVENTORY_CSV)) { console.error('Missing', INVENTORY_CSV); process.exit(1); }

const navText = fs.readFileSync(NAV_SRC, 'utf8');
const invText = fs.readFileSync(INVENTORY_CSV, 'utf8');

// Parse inventory into a simple map by filename and by path end
const invLines = invText.split(/\r?\n/).filter(Boolean);
invLines.shift();
const invRows = invLines.map(l => {
  const parts = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  return {
    FileName: parts[0].replace(/^"|"$/g,'') || '',
    RelPath: parts[1].replace(/^"|"$/g,'') || '',
    LineCount: parseInt(parts[2],10) || 0,
    SizeKB: parseFloat(parts[3]) || 0,
    LastModified: parts[4].replace(/^"|"$/g,'') || '',
    Category: parts[5].replace(/^"|"$/g,'') || '',
    Purpose: parts[6].replace(/^"|"$/g,'') || '',
    Flags: parts[7].replace(/^"|"$/g,'') || ''
  };
});

function findBySlug(slug){
  if (!slug) return null;
  const low = slug.toLowerCase();
  // prefer direct path contains
  let found = invRows.find(r => r.RelPath.toLowerCase().includes('/' + low));
  if (found) return found;
  // fallback: filename match
  found = invRows.find(r => r.FileName.toLowerCase().startsWith(low));
  return found || null;
}

// Extract navigation item objects from navConfig.js by leveraging JS eval inside a fake module
// Safer approach: find the `export const navigationItems = [ ... ];` slice and evaluate just the array
const navMatch = navText.match(/export const navigationItems\s*=\s*(\[([\s\S]*?)\]);/m);
if (!navMatch) { console.error('Could not extract navigationItems'); process.exit(1); }
const navArrayText = navMatch[1];

// Create a sandboxed eval by wrapping icons/variables with placeholders
// (not used) placeholder for potential sanitization
// const sanitized = navArrayText;

// Fallback: crude parser for items by scanning navText for title/path/icon/permission occurrences
const itemRegex = /\{[^}]*?title\s*:\s*['\"]([^'\"]+)['\"][\s\S]*?path\s*:\s*['\"]([^'\"]+)['\"][\s\S]*?icon\s*:\s*([A-Za-z0-9_]+)/g;
const items = [];
let m;
while ((m = itemRegex.exec(navText)) !== null) {
  const title = m[1];
  const pathVal = m[2];
  const icon = m[3];
  // permission is optional, try to capture nearby
  const sliceStart = Math.max(0, m.index - 200);
  const slice = navText.slice(sliceStart, m.index + 400);
  const permMatch = slice.match(/permission\s*:\s*['\"]?([A-Za-z0-9_]+)['\"]?/);
  const permission = permMatch ? permMatch[1] : '';
  // determine parent by searching backward for last `title: 'Group Title'` before this match
  const before = navText.slice(0, m.index);
  const groupMatch = before.match(/title\s*:\s*['\"]([^'\"]+)['\"][^\{]*isGroup\s*:\s*true[\s\S]*$/m);
  const parent = groupMatch ? groupMatch[1] : null;
  items.push({title, path: pathVal, icon, permission, parent});
}

// Deduplicate by path
const unique = [];
const seen = new Set();
items.forEach(it => {
  if (!it.path) return; // skip group-only entries
  if (seen.has(it.path)) return;
  seen.add(it.path);
  const slug = it.path.replace(/^\//,'').split('/').filter(Boolean).slice(-1)[0] || '';
  const match = findBySlug(slug);
  unique.push(Object.assign({}, it, {slug, match}));
});

// Write Audit 1
fs.mkdirSync(OUT_DIR, {recursive:true});
let md1 = '# AUDIT 1 — Navigation Configuration Analysis\n\n';
md1 += '| Label | Path | File Location | Exists? | Line Count | Issues |\n';
md1 += '|---|---|---|---:|---:|---|\n';
unique.forEach(it => {
  const fileLoc = it.match ? it.match.RelPath : '';
  const exists = !!it.match;
  const linesCount = it.match ? it.match.LineCount : '';
  const issues = [];
  if (!it.path) issues.push('No path');
  if (!exists) issues.push('File missing');
  if (linesCount && linesCount < 20) issues.push('Small file (<20 lines)');
  md1 += `| ${it.title} | ${it.path} | ${fileLoc} | ${exists ? 'Yes' : 'No'} | ${linesCount} | ${issues.join('; ')} |\n`;
});
fs.writeFileSync(path.resolve(OUT_DIR, 'audit_navConfig.md'), md1, 'utf8');

// -----------------------------------------------------------------------------
// AUDIT 2: OpenAI integration search
// -----------------------------------------------------------------------------
const audit2Files = [];
const walk = (dir) => {
  const items = fs.readdirSync(dir, {withFileTypes:true});
  items.forEach(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return walk(p);
    if (d.isFile()) {
      const txt = fs.readFileSync(p, 'utf8');
      if (/openai/i.test(txt) || /VITE_OPENAI_API_KEY/.test(txt) || /ai/i.test(p)) {
        const lines = txt.split(/\r?\n/).length;
        // guess feature
        const feature = /openai/i.test(txt) ? 'OpenAI usage' : (/ai/i.test(p) ? 'AI feature' : 'env key');
        const status = /TODO|PLACEHOLDER|stub/i.test(txt) ? 'placeholder' : 'working';
        audit2Files.push({path: p, lines, feature, status});
      }
    }
  });
};
walk(path.resolve(ROOT, 'src'));
// Also check root .env
const envText = fs.readFileSync(path.resolve(ROOT, '.env'), 'utf8');
if (/VITE_OPENAI_API_KEY/.test(envText)) {
  audit2Files.push({path: path.resolve(ROOT, '.env'), lines: envText.split(/\r?\n/).length, feature: 'OpenAI API key', status: 'configured'});
}

let md2 = '# AUDIT 2 — OpenAI Integration Points\n\n';
md2 += '| File Path | Line Count | Feature | Status |\n';
md2 += '|---|---:|---|---|\n';
audit2Files.forEach(f => md2 += `| ${f.path} | ${f.lines} | ${f.feature} | ${f.status} |\n`);
fs.writeFileSync(path.resolve(OUT_DIR, 'audit_openai.md'), md2, 'utf8');

// -----------------------------------------------------------------------------
// AUDIT 3: Email & Communication systems
// -----------------------------------------------------------------------------
const commFiles = [];
const commRegex = /email|sendgrid|gmail|smtp|communication|message|notification|EmailCenter|EmailDashboard|sendEmail/ig;
walkFiles = (dir) => {
  const items = fs.readdirSync(dir, {withFileTypes:true});
  items.forEach(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return walkFiles(p);
    if (d.isFile()) {
      const txt = fs.readFileSync(p, 'utf8');
      if (commRegex.test(txt) || commRegex.test(p)) {
        commFiles.push({path: p, lines: txt.split(/\r?\n/).length, excerpt: (txt.match(commRegex)||[]).slice(0,3).join(', ')});
      }
    }
  });
};
walkFiles(path.resolve(ROOT));

let md3 = '# AUDIT 3 — Email & Communication Systems\n\n';
md3 += '| File Path | Line Count | Purpose / Excerpt | Integration Status |\n';
md3 += '|---|---:|---|---|\n';
commFiles.forEach(f => {
  const status = /sendgrid|smtp|gmail|nodemailer/i.test(fs.readFileSync(f.path,'utf8')) ? 'integrated' : 'unknown';
  md3 += `| ${f.path} | ${f.lines} | ${f.excerpt} | ${status} |\n`;
});
fs.writeFileSync(path.resolve(OUT_DIR, 'audit_email.md'), md3, 'utf8');

// -----------------------------------------------------------------------------
// AUDIT 4: IDIQ Integration
// -----------------------------------------------------------------------------
const idiqFiles = [];
const idiqRegex = /IDIQ|idiq|VITE_IDIQ|IDIQService|getidiq|idiq/i;
walkFiles2 = (dir) => {
  const items = fs.readdirSync(dir, {withFileTypes:true});
  items.forEach(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return walkFiles2(p);
    if (d.isFile()) {
      const txt = fs.readFileSync(p, 'utf8');
      if (idiqRegex.test(txt) || idiqRegex.test(p)) {
        const status = /try\s*\{|catch\s*\(/.test(txt) ? 'has error handling' : 'no obvious error handling';
        idiqFiles.push({path: p, lines: txt.split(/\r?\n/).length, status});
      }
    }
  });
};
walkFiles2(path.resolve(ROOT));

let md4 = '# AUDIT 4 — IDIQ Integration\n\n';
md4 += '| File Path | Line Count | Implementation Status | Error Handling |\n';
md4 += '|---|---:|---|---|\n';
idiqFiles.forEach(f => md4 += `| ${f.path} | ${f.lines} | ${f.status} | ${/try\s*\{|catch\s*\(/.test(fs.readFileSync(f.path,'utf8')) ? 'Yes' : 'No' } |\n`);
fs.writeFileSync(path.resolve(OUT_DIR, 'audit_idiq.md'), md4, 'utf8');

console.log('Wrote audits to', OUT_DIR);
