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

// -----------------------------------------------------------------------------
// Configuration: exclusions and thresholds
// -----------------------------------------------------------------------------
const EXCLUDE_PATTERNS = ['node_modules', 'backups', '/dist/', '\\dist\\', '/build/', '\\build\\', '/.git/', '\\.git\\'];
const MAX_FILE_BYTES = 1 * 1024 * 1024; // 1MB
const SMALL_FILE_LINES = 50;

function isExcluded(p) {
  if (!p) return false;
  const lp = p.replace(/\\\\/g, '/').toLowerCase();
  return EXCLUDE_PATTERNS.some(ex => lp.includes(ex.replace(/\\\\/g,'/')));
}

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

function findBySlugInSources(slug){
  if (!slug) return null;
  const low = slug.toLowerCase();
  // prefer files under src/pages then src/components
  const pagesMatch = invRows.find(r => {
    const norm = r.RelPath.replace(/\\\\/g,'/').toLowerCase();
    if (isExcluded(norm)) return false;
    if (!norm.includes('/src/pages/')) return false;
    if ((norm.endsWith('/' + low) || norm.includes('/' + low + '.')) || r.FileName.toLowerCase().startsWith(low)) {
      // skip very large files
      if ((r.SizeKB || 0) * 1024 > MAX_FILE_BYTES) return false;
      return true;
    }
    return false;
  });
  if (pagesMatch) return pagesMatch;

  const compMatch = invRows.find(r => {
    const norm = r.RelPath.replace(/\\\\/g,'/').toLowerCase();
    if (isExcluded(norm)) return false;
    if (!norm.includes('/src/components/')) return false;
    if ((norm.endsWith('/' + low) || norm.includes('/' + low + '.')) || r.FileName.toLowerCase().startsWith(low)) {
      if ((r.SizeKB || 0) * 1024 > MAX_FILE_BYTES) return false;
      return true;
    }
    return false;
  });
  if (compMatch) return compMatch;

  return null;
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
  const match = findBySlugInSources(slug);
  unique.push(Object.assign({}, it, {slug, match}));
});

// Write Audit 1
fs.mkdirSync(OUT_DIR, {recursive:true});
let md1 = '# AUDIT 1 — Navigation Configuration Analysis\n\n';
md1 += '| Label | Path | File Location | Exists? | Line Count | SizeKB | Issues |\n';
md1 += '|---|---|---|---:|---:|---|\n';
unique.forEach(it => {
  const fileLoc = it.match ? it.match.RelPath : '';
  const exists = !!it.match;
  const linesCount = it.match ? it.match.LineCount : '';
  const sizeKB = it.match ? it.match.SizeKB : '';
  const issues = [];
  if (!it.path) issues.push('No path');
  if (!exists) issues.push('Missing (not in src/pages or src/components)');
  if (linesCount && linesCount < SMALL_FILE_LINES) issues.push('Small/Stub - Review');
  md1 += `| ${it.title} | ${it.path} | ${fileLoc} | ${exists ? 'Yes' : 'No'} | ${linesCount} | ${sizeKB} | ${issues.join('; ')} |\n`;
});
fs.writeFileSync(path.resolve(OUT_DIR, 'audit_navConfig_filtered.md'), md1, 'utf8');

// -----------------------------------------------------------------------------
// AUDIT 2: OpenAI integration search
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// AUDIT 2: OpenAI integration search (filtered)
// Search only under src/ but exclude noisy paths. Skip files >1MB.
// -----------------------------------------------------------------------------
const audit2Files = [];
const walkForOpenAI = (dir) => {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, {withFileTypes:true});
  items.forEach(d => {
    const p = path.join(dir, d.name);
    if (isExcluded(p)) return;
    try {
      if (d.isDirectory()) return walkForOpenAI(p);
      if (d.isFile()) {
        const st = fs.statSync(p);
        if (st.size > MAX_FILE_BYTES) return; // skip large
        const txt = fs.readFileSync(p, 'utf8');
        if (/openai/i.test(txt) || /VITE_OPENAI_API_KEY/.test(txt) || /\bai\b/i.test(p)) {
          const lines = txt.split(/\r?\n/).length;
          const feature = /openai/i.test(txt) ? 'OpenAI usage' : (/\bai\b/i.test(p) ? 'AI feature' : 'env key');
          const status = /TODO|PLACEHOLDER|stub/i.test(txt) ? 'placeholder' : 'working';
          audit2Files.push({path: p, lines, sizeKB: (st.size/1024).toFixed(2), feature, status});
        }
      }
    } catch (e) {
      // ignore unreadable files
    }
  });
};
walkForOpenAI(path.resolve(ROOT, 'src'));

let md2 = '# AUDIT 2 — OpenAI Integration Points (filtered)\n\n';
md2 += '| File Path | Line Count | SizeKB | Feature | Status |\n';
md2 += '|---|---:|---:|---|---|\n';
audit2Files.forEach(f => md2 += `| ${f.path} | ${f.lines} | ${f.sizeKB} | ${f.feature} | ${f.status} |\n`);
fs.writeFileSync(path.resolve(OUT_DIR, 'audit_openai_filtered.md'), md2, 'utf8');

// -----------------------------------------------------------------------------
// AUDIT 3: Email & Communication systems
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// AUDIT 3: Email & Communication systems (filtered)
// Only search canonical service/component/page folders and functions/api/server roots
// Skip .env files (we already know they're configured)
// -----------------------------------------------------------------------------
const commFiles = [];
const commRegex = /email|sendgrid|gmail|smtp|communication|message|notification|EmailCenter|EmailDashboard|sendEmail/ig;
const EMAIL_SEARCH_DIRS = [
  path.resolve(ROOT, 'src/services'),
  path.resolve(ROOT, 'src/components'),
  path.resolve(ROOT, 'src/pages'),
  path.resolve(ROOT, 'functions'),
  path.resolve(ROOT, 'api'),
  path.resolve(ROOT, 'server')
];

const walkEmailDirs = (baseDirs) => {
  baseDirs.forEach(base => {
    if (!fs.existsSync(base)) return;
    const items = fs.readdirSync(base, {withFileTypes:true});
    items.forEach(d => {
      const p = path.join(base, d.name);
      if (isExcluded(p)) return;
      try {
        if (d.isDirectory()) return walkEmailDirs([p]);
        if (d.isFile()) {
          if (p.endsWith('.env') || p.endsWith('.env.example')) return; // skip .env
          const st = fs.statSync(p);
          if (st.size > MAX_FILE_BYTES) return; // skip large files
          const txt = fs.readFileSync(p, 'utf8');
          if (commRegex.test(txt) || commRegex.test(p)) {
            const lines = txt.split(/\r?\n/).length;
            const excerpt = (txt.match(commRegex)||[]).slice(0,3).join(', ');
            const status = /sendgrid|smtp|gmail|nodemailer/i.test(txt) ? 'integrated' : 'unknown';
            const small = lines < SMALL_FILE_LINES ? 'Small/Stub - Review' : '';
            commFiles.push({path: p, lines, sizeKB: (st.size/1024).toFixed(2), excerpt, status, small});
          }
        }
      } catch (e) {}
    });
  });
};
walkEmailDirs(EMAIL_SEARCH_DIRS);

let md3 = '# AUDIT 3 — Email & Communication Systems (filtered)\n\n';
md3 += '| File Path | Line Count | SizeKB | Purpose / Excerpt | Integration Status | Flags |\n';
md3 += '|---|---:|---:|---|---|---|\n';
commFiles.forEach(f => {
  md3 += `| ${f.path} | ${f.lines} | ${f.sizeKB} | ${f.excerpt} | ${f.status} | ${f.small} |\n`;
});
fs.writeFileSync(path.resolve(OUT_DIR, 'audit_email_filtered.md'), md3, 'utf8');

// -----------------------------------------------------------------------------
// AUDIT 4: IDIQ Integration
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// AUDIT 4: IDIQ Integration (filtered)
// Search src and functions/api/server, skip excluded paths and large files
// -----------------------------------------------------------------------------
const idiqFiles = [];
const idiqRegex = /IDIQ|idiq|VITE_IDIQ|IDIQService|getidiq|\bidiq\b/i;
const IDIQ_SEARCH_DIRS = [path.resolve(ROOT, 'src'), path.resolve(ROOT, 'functions'), path.resolve(ROOT, 'api'), path.resolve(ROOT, 'server')];

const walkIdiq = (dirs) => {
  dirs.forEach(base => {
    if (!fs.existsSync(base)) return;
    const items = fs.readdirSync(base, {withFileTypes:true});
    items.forEach(d => {
      const p = path.join(base, d.name);
      if (isExcluded(p)) return;
      try {
        if (d.isDirectory()) return walkIdiq([p]);
        if (d.isFile()) {
          const st = fs.statSync(p);
          if (st.size > MAX_FILE_BYTES) return;
          const txt = fs.readFileSync(p, 'utf8');
          if (idiqRegex.test(txt) || idiqRegex.test(p)) {
            const status = /try\s*\{|catch\s*\(/.test(txt) ? 'has error handling' : 'no obvious error handling';
            idiqFiles.push({path: p, lines: txt.split(/\r?\n/).length, sizeKB: (st.size/1024).toFixed(2), status, hasErrorHandling: /try\s*\{|catch\s*\(/.test(txt)});
          }
        }
      } catch (e) {}
    });
  });
};
walkIdiq(IDIQ_SEARCH_DIRS);

let md4 = '# AUDIT 4 — IDIQ Integration (filtered)\n\n';
md4 += '| File Path | Line Count | SizeKB | Implementation Status | Error Handling |\n';
md4 += '|---|---:|---:|---|---:|\n';
idiqFiles.forEach(f => md4 += `| ${f.path} | ${f.lines} | ${f.sizeKB} | ${f.status} | ${f.hasErrorHandling ? 'Yes' : 'No'} |\n`);
fs.writeFileSync(path.resolve(OUT_DIR, 'audit_idiq_filtered.md'), md4, 'utf8');

console.log('Wrote audits to', OUT_DIR);
