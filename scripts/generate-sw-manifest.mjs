import fs from "node:fs";
import path from "node:path";

function getFiles(dir, base = "") {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(base, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, relPath));
    } else {
      results.push("/_next/static/" + relPath.replace(/\\/g, "/"));
    }
  }
  return results;
}

const staticDir = path.join(process.cwd(), ".next", "static");
const files = getFiles(staticDir);

const manifestPath = path.join(process.cwd(), "public", "sw-manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2), "utf-8");

console.log(`Generated ${manifestPath} with ${files.length} static chunks.`);
