// scripts/snapshot.mjs
// Hardened snapshot script: Windows Compress-Archive only includes existing files, uses -Force, and logs output path
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const now = new Date();
const pad = n => n.toString().padStart(2, '0');
const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const snapshotsDir = path.resolve('snapshots');
if (!fs.existsSync(snapshotsDir)) fs.mkdirSync(snapshotsDir);
const archiveBase = `snapshot-${ts}`;
const isWin = os.platform().startsWith('win');
let archivePath = '';

try {
  if (isWin) {
    archivePath = path.join(snapshotsDir, `${archiveBase}.zip`);
    // Build array of existing paths
    const candidates = ['src', 'vite.config.js', 'vite.config.ts'];
    const items = candidates.filter(f => fs.existsSync(f));
    if (items.length === 0) {
      console.log('No files to snapshot.');
      process.exit(0);
    }
    // If only src exists, zip only src
    const psItems = items.map(f => `\"${f}\"`).join(', ');
    execSync(`powershell Compress-Archive -Path ${psItems} -DestinationPath \"${archivePath}\" -Force`, { stdio: 'inherit' });
  } else {
    archivePath = path.join(snapshotsDir, `${archiveBase}.zip`);
    // Only include existing files in zip/tar
    const candidates = ['src', 'vite.config.js', 'vite.config.ts'];
    const items = candidates.filter(f => fs.existsSync(f));
    if (items.length === 0) {
      console.log('No files to snapshot.');
      process.exit(0);
    }
    try {
      execSync(`zip -r \"${archivePath}\" ${items.map(f => `\"${f}\"`).join(' ')}`, { stdio: 'inherit' });
    } catch {
      archivePath = path.join(snapshotsDir, `${archiveBase}.tar.gz`);
      execSync(`tar -czf \"${archivePath}\" ${items.map(f => `\"${f}\"`).join(' ')}`, { stdio: 'inherit' });
    }
  }
  console.log('Snapshot written:', archivePath);
} catch (e) {
  console.log('Snapshot failed, but continuing.');
}
process.exit(0);
