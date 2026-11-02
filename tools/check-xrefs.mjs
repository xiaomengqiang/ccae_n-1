import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const files = [];
function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".js") && !e.name.includes("app-legacy")) files.push(p);
  }
}
walk("preview/src");

const mods = files.map((f) => ({ f: relative("preview/src", f).replace(/\\/g, "/"), code: readFileSync(f, "utf8") }));
const decls = new Map();
for (const m of mods) {
  const names = new Set();
  for (const mm of m.code.matchAll(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) names.add(mm[1]);
  decls.set(m.f, names);
}
const allTop = new Map();
for (const [f, names] of decls) {
  for (const n of names) {
    if (!allTop.has(n)) allTop.set(n, []);
    allTop.get(n).push(f);
  }
}
const KEYWORDS = new Set(["if", "for", "while", "switch", "catch", "function", "return", "const", "let", "var", "export", "import", "true", "false", "null", "window", "document", "runBoot", "initMotionRuntime", "initHCComponents", "initClock", "initEvidenceOrig", "initHomeScreen", "initGuardEventsTable", "initEnhancements", "initOpticalEvent", "initNicEvent", "initStory", "initAgentPanel", "initEnergyDetail", "initRoomOverview", "SKELETON_INNER", "SCREEN_ATTRS"]);
const hits = [];
for (const m of mods) {
  for (const [name, defs] of allTop) {
    if (KEYWORDS.has(name) || defs.includes(m.f)) continue;
    const re = new RegExp(`(?<![\\w$])${name}(?![\\w$])`);
    const lines = m.code.split("\n").filter((l) => re.test(l) && !/^\s*(?:import|\/\/|\/\*|\*)/.test(l));
    if (lines.length) hits.push({ name, from: m.f, defs, sample: lines[0].trim().slice(0, 90), count: lines.length });
  }
}
console.log(`modules: ${mods.length}, top-level names: ${allTop.size}`);
console.log(`cross-file bare usages: ${hits.length}`);
for (const h of hits) console.log(`${h.name}  (top-level in: ${h.defs.join(",")}) used in ${h.from} x${h.count}: ${h.sample}`);
