import { readFileSync } from "node:fs";
const j = readFileSync("preview/src/views/optical-event/legacy.js", "utf8");

// Find all top-level IIFEs (not nested inside other functions)
// The file structure is:
//   import { ... };
//   export function initOpticalEvent() {
//     ...multiple IIFEs and direct assignments...
//   }

// Let's find the boundaries of each major section
const sections = [];

// HCEventUI = (() => { ... })()
let start = j.indexOf("window.HCEventUI = (() => {");
if (start !== -1) {
  let depth = 0, i = start + 23;
  while (i < j.length) {
    if (j[i] === "{") depth++;
    if (j[i] === "}") { depth--; if (depth === 0) { sections.push({ name: "HCEventUI", start, end: i + 5 }); break; } }
    i++;
  }
}

// Find other top-level patterns
const patterns = [
  "window.HCEntrance = function",
  "window.HCEventModule = (() =>",
  "(() => { const screen=document.getElementById('screen'),root=document.createElement",
];
for (const p of patterns) {
  const idx = j.indexOf(p);
  if (idx !== -1) sections.push({ name: p.substring(0, 40), start: idx });
}

sections.sort((a, b) => a.start - b.start);
for (const s of sections) {
  console.log(`${s.name}: starts at ${s.start}${s.end ? ", ends at " + s.end : ""}`);
}

// Show the last 100 chars to see the overall closing
console.log("\nLast 100 chars:", JSON.stringify(j.slice(-100)));
console.log("\nTotal length:", j.length);

// Find all top-level "})();" closers
const closers = [...j.matchAll(/\}\)\(\);/g)].map((m) => m.index);
console.log("\nAll })() positions:", closers.join(", "));
