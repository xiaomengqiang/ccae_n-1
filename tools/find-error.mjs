import { readFileSync } from "node:fs";

const h = readFileSync("preview/index.page.html", "utf8");
const m = h.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
if (!m) { console.log("no babel script found"); process.exit(1); }
const script = m[1];
const lines = script.split("\n");
console.log("script total lines:", lines.length);
const line = lines[60];
if (line) {
  console.log("line 61 len:", line.length);
  console.log("col 5380-5430:", line.substring(5380, 5430));
} else {
  console.log("line 61 not found");
}
