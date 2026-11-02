import { readFileSync } from "node:fs";

const js = readFileSync("preview/src/legacy/app-legacy.js", "utf8");

const readNames = new Set();
for (const m of js.matchAll(/window\.([A-Za-z_$][\w$]*)/g)) readNames.add(m[1]);

const broken = [];
for (const name of readNames) {
  const assigned = new RegExp(`window\\.${name}\\s*=`).test(js);
  if (assigned) continue;
  const fnDecl = new RegExp(`^\\s*function\\s+${name}\\s*\\(`, "m").test(js);
  const varDecl = new RegExp(`^\\s*(var|let|const)\\s+${name}\\b`, "m").test(js);
  if (fnDecl || varDecl) broken.push({ name, kind: fnDecl ? "function" : "var/let/const" });
}

console.log(`window.X reads: ${readNames.size}`);
console.log(`implicit globals read via window.* but never assigned to window: ${broken.length}`);
for (const b of broken) console.log(`  ${b.name} (${b.kind})`);
