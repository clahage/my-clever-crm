#!/usr/bin/env node
/* scripts/check-duplicates.mjs */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = process.cwd();
const IGNORES = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vite",
  "archive",
  "__backup__",
  "__bak__",
  ".cache",
];

const isIgnored = (p) => IGNORES.some(seg => p.split(path.sep).includes(seg));

/** Recursively list files under dir */
function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (isIgnored(full)) continue;
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

/** Find duplicates by basename (case-insensitive on Windows) */
function findDuplicates(files) {
  const map = new Map();
  for (const f of files) {
    const base = path.basename(f);
    const key = process.platform === "win32" ? base.toLowerCase() : base;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(f);
  }
  const dups = [];
  for (const [name, pathsArr] of map.entries()) {
    const uniq = [...new Set(pathsArr.map(p => path.normalize(p)))];
    if (uniq.length > 1) {
      dups.push({ type: "DUPLICATE", name, paths: uniq });
    }
  }
  return dups;
}

/** Simple heuristics for route shadowing (string scan) */
function findRouteShadows(files) {
  const out = [];
  const appFiles = files.filter(f => /App\.(jsx?|tsx?)$/i.test(f));
  const clientRoutes = files.filter(f => /clientRoutes\.(jsx?|tsx?)$/i.test(f));
  const buckets = [];

  for (const f of [...appFiles, ...clientRoutes]) {
    const txt = fs.readFileSync(f, "utf8");
    // crude match—does not split on spaces
    const matches = [...txt.matchAll(/["'`](\/client\/\*|\*|disputes|documents|messages)["'`]/g)];
    for (const m of matches) {
      buckets.push({ type: "ROUTE", name: m[1], paths: [f] });
    }
  }
  // group by route name
  const grouped = new Map();
  for (const r of buckets) {
    const key = r.name;
    if (!grouped.has(key)) grouped.set(key, new Set());
    grouped.get(key).add(r.paths[0]);
  }
  for (const [name, set] of grouped.entries()) {
    if (set.size > 1) out.push({ type: "ROUTE", name, paths: [...set] });
  }
  return out;
}

/** Export collisions (very light heuristic: named exports seen in multiple files) */
function findExportCollisions(files) {
  const out = [];
  const exportMap = new Map();
  const jsLike = files.filter(f => /\.(jsx?|tsx?)$/i.test(f));

  const EXPORT_RE = /\bexport\s+(?:const|let|var|function|class|interface|type)\s+([A-Za-z0-9_\$]+)/g;

  for (const f of jsLike) {
    let txt;
    try {
      txt = fs.readFileSync(f, "utf8");
    } catch { continue; }
    let m;
    while ((m = EXPORT_RE.exec(txt))) {
      const sym = m[1];
      if (!exportMap.has(sym)) exportMap.set(sym, new Set());
      exportMap.get(sym).add(f);
    }
  }
  for (const [sym, set] of exportMap.entries()) {
    if (set.size > 1) out.push({ type: "EXPORT", name: sym, paths: [...set] });
  }
  return out;
}

function formatRow(type, name, paths) {
  // Quote paths to avoid space-wrapping confusion
  const joined = paths.map(p => `"${p}"`).join(", ");
  return `${type.padEnd(9)} ${name.padEnd(20)} ${joined}`;
}

function printTable(results) {
  if (results.length === 0) {
    console.log("No duplicate/shadow/invalid export issues found.");
    return;
  }
  console.log("Type      Name                 Paths");
  console.log("---------------------------------------------------------------------");
  for (const r of results) console.log(formatRow(r.type, r.name, r.paths));
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const files = listFiles(path.join(ROOT, "src"));
  const dup = findDuplicates(files);
  const routes = findRouteShadows(files);
  const exportsCollide = findExportCollisions(files);

  // (Optional) add your “invalid /public imports” check here if needed

  const results = [...dup, ...routes, ...exportsCollide];

  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    printTable(results);
  }
  // non-zero exit if any issues
  process.exit(results.length ? 1 : 0);
}

main();
