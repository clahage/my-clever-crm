// scripts/backupSpotcheck.mjs
import fs from 'fs';
import path from 'path';

const config = JSON.parse(fs.readFileSync('backup.config.json', 'utf-8'));
const now = new Date();
const pad = n => n.toString().padStart(2, '0');
const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const auditDir = 'audit';
if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir);
const logPath = path.join(auditDir, `logs/spotcheck-${ts}.txt`);
if (!fs.existsSync(path.join(auditDir, 'logs'))) fs.mkdirSync(path.join(auditDir, 'logs'));

const results = [];
for (const b of config.backups) {
  const root = b.path;
  // OpenAI.jsx LOC
  let openaiLoc = 0;
  const openaiPath = path.join(root, 'src/pages/OpenAI.jsx');
  if (fs.existsSync(openaiPath)) openaiLoc = fs.readFileSync(openaiPath, 'utf-8').split('\n').length;
  // navConfig LOC
  let navLoc = 0;
  let navPath = path.join(root, 'src/layout/navConfig.js');
  if (!fs.existsSync(navPath)) {
    // fallback: first nav*.js(x) in src/**
    const walk = d => fs.readdirSync(d).flatMap(f => {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) return walk(p);
      if (/nav.*\.(js|jsx)$/i.test(f)) return [p];
      return [];
    });
    const navs = walk(path.join(root, 'src'));
    navPath = navs[0] || '';
  }
  if (navPath && fs.existsSync(navPath)) navLoc = fs.readFileSync(navPath, 'utf-8').split('\n').length;
  // filename hits
  const walkFiles = d => fs.readdirSync(d).flatMap(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) return walkFiles(p);
    return [p];
  });
  const allFiles = walkFiles(path.join(root, 'src'));
  const nameHits = allFiles.filter(f => /openai|receptionist|webhook/i.test(path.basename(f))).length;
  // content hits
  let contentHits = 0;
  for (const f of allFiles) {
    if (fs.statSync(f).isFile() && /\.(js|jsx|ts|tsx|mjs|cjs|json|html|css)$/i.test(f)) {
      const txt = fs.readFileSync(f, 'utf-8');
      if (/openai|receptionist|webhook/i.test(txt)) contentHits++;
    }
  }
  // pkgAiHits
  let pkgAiHits = 0;
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkgTxt = fs.readFileSync(pkgPath, 'utf-8');
    pkgAiHits = (pkgTxt.match(/openai|webhook|ai/gi) || []).length;
  }
  // widgetFiles
  const widgetFiles = allFiles.filter(f => /Widget.*\.jsx$|Panel.*\.jsx$|Card.*\.jsx$/i.test(path.basename(f))).length;
  // Dashboard.jsx LOC
  let dashboardLoc = 0;
  const dashPath = path.join(root, 'src/components/Dashboard.jsx');
  if (fs.existsSync(dashPath)) dashboardLoc = fs.readFileSync(dashPath, 'utf-8').split('\n').length;
  // Score
  const score = (openaiLoc>19?10:0) + nameHits*2 + contentHits + pkgAiHits*2 + widgetFiles + Math.min(10, Math.floor(navLoc/200)) + Math.min(10, Math.floor(dashboardLoc/200));
  results.push({ label: b.label, openaiLoc, navLoc, nameHits, contentHits, pkgAiHits, widgetFiles, dashboardLoc, score, openaiPath, navPath, dashPath });
}
results.sort((a,b)=>b.score-a.score);
fs.writeFileSync(path.join(auditDir, 'backup-spotcheck.json'), JSON.stringify(results, null, 2));
// Markdown table
let md = '| Label | OpenAI.jsx LOC | navConfig LOC | filename hits | content hits | pkg AI hits | widget files | Dashboard.jsx LOC | Score |\n|-------|---------------|--------------|---------------|--------------|-------------|--------------|-------------------|-------|\n';
for (const r of results) {
  md += `| ${r.label} | ${r.openaiLoc} | ${r.navLoc} | ${r.nameHits} | ${r.contentHits} | ${r.pkgAiHits} | ${r.widgetFiles} | ${r.dashboardLoc} | ${r.score} |\n`;
}
const winner = results[0];
md += `\n**Winner:** ${winner.label} (score: ${winner.score})\n`;
md += `Key files: OpenAI.jsx: ${winner.openaiPath}, navConfig: ${winner.navPath}, Dashboard.jsx: ${winner.dashPath}\n`;
md += `\nRationale: Highest score based on OpenAI code, widget/UI surface, and explicit integrations.\n`;
fs.writeFileSync(path.join(auditDir, 'backup-spotcheck.md'), md);
console.log('Spotcheck complete.');
