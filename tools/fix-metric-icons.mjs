import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const compSrc = readFileSync("preview/src/shared/hc-components.js", "utf8");
const assetsSrc = readFileSync("preview/src/mock/hc-assets.js", "utf8");

const metricsMatch = compSrc.match(/const metrics\s*=\s*(\{[\s\S]*?\})\s*;/);
if (!metricsMatch) throw new Error("metrics object not found in hc-components.js");
const metrics = new Function("return " + metricsMatch[1])();

const assetsMatch = assetsSrc.match(/export const HC_ASSETS\s*=\s*(\{[\s\S]*?\})\s*;\n/);
if (!assetsMatch) throw new Error("HC_ASSETS not found in hc-assets.js");
const HC_ASSETS = new Function("return " + assetsMatch[1])();

const names = new Set(["叶子-圆底托"]);
for (const cat of Object.values(metrics)) {
  for (const entry of cat) names.add(entry[2]);
}

const stripRe = /(<svg\b[^>]*?)\sclip-path="[^"]*"/;
let changed = 0;
const report = [];
for (const name of names) {
  const path = HC_ASSETS.icons[name];
  if (!path || !path.startsWith("./assets/icons/")) {
    report.push(`SKIP  ${name}: not a file icon (${path ? path : "not in HC_ASSETS"})`);
    continue;
  }
  const file = join("preview", path.slice(2));
  const svg = readFileSync(file, "utf8");
  if (!stripRe.test(svg)) {
    report.push(`OK    ${name} -> ${path}: no root clip-path`);
    continue;
  }
  writeFileSync(file, svg.replace(stripRe, "$1"), "utf8");
  changed++;
  report.push(`FIX   ${name} -> ${path}: root clip-path stripped`);
}
console.log(report.sort().join("\n"));
console.log(`\nstripped: ${changed} of ${names.size} metric tile icons`);
