// scripts/snapshot.mjs
import fs from "fs";
import path from "path";
import archiver from "archiver";

const snapshotDir = path.resolve("snapshots");
if (!fs.existsSync(snapshotDir)) {
  fs.mkdirSync(snapshotDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputPath = path.join(snapshotDir, `snapshot-${timestamp}.zip`);

const output = fs.createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`📦 Snapshot created: ${outputPath} (${archive.pointer()} total bytes)`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

// Include what you want backed up
archive.directory("src/", "src");
archive.file("vite.config.js", { name: "vite.config.js" });
archive.finalize();
