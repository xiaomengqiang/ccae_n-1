import { readFileSync } from "node:fs";
const lines = readFileSync("preview/src/views/home-screen/legacy.js", "utf8").split("\n");
console.log("total lines:", lines.length);
for (let i = 15; i < Math.min(125, lines.length); i++) {
  const t = lines[i].trim();
  if (t.length > 0 && !t.startsWith("//")) {
    console.log(`${i + 1}: ${t.substring(0, 70)}`);
  }
}
