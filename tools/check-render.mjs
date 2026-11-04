import { readFileSync } from "node:fs";
const lines = readFileSync("preview/src/views/story/render.js", "utf8").split("\n");
console.log("total lines:", lines.length);
for (let i = 70; i < Math.min(160, lines.length); i++) {
  const t = lines[i].trim();
  if (t.length > 0) {
    console.log(`${i + 1}: ${t.substring(0, 60)}`);
  }
}
