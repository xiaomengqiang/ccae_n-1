import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const REF = "preview/src/legacy/app-legacy.js";
const SRC = "源码";

const ref = readFileSync(REF, "utf8");
const wrapOpen = "export function bootLegacyScreen() {\n";
const wrapClose = "\n}\n";
if (!ref.startsWith(wrapOpen) || !ref.endsWith(wrapClose)) throw new Error("unexpected app-legacy.js wrapper");
const body = ref.slice(wrapOpen.length, ref.length - wrapClose.length);

const seg = (src, optional = false) => ({ src, optional });
const markers = [
  { id: "evidence-ai", head: null, ...seg(null) },
  { id: "evidence-orig", ...seg("home/evidence.js", true) },
  { id: "HOME_WORKLOADS", literal: "const HOME_WORKLOADS=" },
  { id: "HC_ASSETS", literal: "const HC_ASSETS=" },
  { id: "motion-runtime", ...seg("components/motion-runtime.js") },
  { id: "components", ...seg("components/components.js") },
  { id: "demo-clock", ...seg("home/demo-clock.js") },
  { id: "main", ...seg("home/main.js") },
  { id: "events", ...seg("home/events.js") },
  { id: "HOME_LINKS_SVG", literal: "const HOME_LINKS_SVG=" },
  { id: "enhancements", ...seg("home/reference-0909/enhancements.js") },
  { id: "OPTICAL_ASSETS", literal: "const OPTICAL_ASSETS=" },
  { id: "optical-detail", ...seg("home/optical-event/detail-components.js") },
  { id: "optical-entrance", ...seg("home/optical-event/entrance.js") },
  { id: "optical-import", ...seg("home/optical-event/import-support.js") },
  { id: "optical-event", ...seg("home/optical-event/event.js") },
  { id: "optical-host", ...seg("home/optical-host.js") },
  { id: "nic-event", ...seg("home/nic-event/event.js") },
  { id: "story-state", ...seg("home/story-state.js") },
  { id: "story", ...seg("home/story.js") },
  { id: "guardian", ...seg("home/guardian-metrics.js") },
  { id: "mascot", ...seg("home/mascot-motion.js") },
  { id: "panel-entrance", ...seg("home/panel-entrance.js") },
  { id: "ENERGY_CABINET", literal: "const ENERGY_CABINET=" },
  { id: "energy-state", ...seg("home/energy/state.js") },
  { id: "energy", ...seg("home/energy/energy.js") },
  { id: "multi-cabinet", ...seg("home/multi-cabinet.js") },
];

for (const m of markers) {
  if (m.src) m.sig = readFileSync(join(SRC, m.src), "utf8").replace(/^\uFEFF/, "").trimStart().slice(0, 100);
}
markers[0].sig = '/* Evidence entries use only facts already revealed in the demonstration. */\nwindow.HCEvidence = (() => {\n const rules';

const anchors = markers.filter((m) => m.literal).map((m) => ({ ...m, pos: body.indexOf(m.literal) }));
for (const a of anchors) {
  if (a.pos === -1) throw new Error(`anchor not found: ${a.id}`);
}
for (let i = 1; i < anchors.length; i++) {
  if (anchors[i].pos <= anchors[i - 1].pos) throw new Error(`anchor order broken at ${anchors[i].id}`);
}

let cursor = 0;
const found = [];
for (let i = 0; i < markers.length; i++) {
  const m = markers[i];
  const nextAnchor = anchors.find((a) => a.pos > cursor);
  const bound = nextAnchor ? nextAnchor.pos : body.length;
  if (m.literal) {
    found.push({ id: m.id, start: m.pos ?? body.indexOf(m.literal, cursor) });
    cursor = found[found.length - 1].start;
    continue;
  }
  let pos = body.indexOf(m.sig, cursor);
  if (pos === -1 || pos >= bound) {
    if (m.optional) { found.push({ id: m.id, start: -1 }); continue; }
    throw new Error(`signature not found in window: ${m.id} (src=${m.src}, cursor=${cursor}, bound=${bound})`);
  }
  found.push({ id: m.id, start: pos });
  cursor = pos;
}

const segments = [];
for (let i = 0; i < found.length; i++) {
  if (found[i].start === -1) { segments.push({ id: found[i].id, text: "" }); continue; }
  const end = i + 1 < found.length ? (found[i + 1].start === -1 ? (found[i + 2] ? found[i + 2].start : body.length) : found[i + 1].start) : body.length;
  segments.push({ id: found[i].id, text: body.slice(found[i].start, end) });
}
const covered = segments.reduce((a, s) => a + s.text.length, 0);
const skippedStart = found[0].start === -1 ? body.indexOf("const HOME_WORKLOADS=") : found[0].start;
if (covered !== body.length - skippedStart) {
  console.log(`NOTE leading gap: ${skippedStart} chars before first marker`);
}

const get = (id) => segments.find((s) => s.id === id).text.trim();

const modules = [
  { file: "src/mock/workloads.js", body: "export " + get("HOME_WORKLOADS") + "\n" },
  { file: "src/mock/hc-assets.js", body: "export " + get("HC_ASSETS") + "\nexport " + get("HOME_LINKS_SVG") + "\nexport " + get("OPTICAL_ASSETS") + "\n" },
  { file: "src/shared/motion-runtime.js", fn: "initMotionRuntime", segs: ["motion-runtime"] },
  { file: "src/shared/hc-components.js", fn: "initHCComponents", segs: ["components"] },
  { file: "src/utils/clock.js", fn: "initClock", segs: ["demo-clock"] },
  { file: "src/views/evidence/legacy.js", segs: ["evidence-ai", "evidence-orig"] },
  { file: "src/views/home-screen/legacy.js", fn: "initHomeScreen", segs: ["main"] },
  { file: "src/views/home-screen/enhancements.js", fn: "initEnhancements", segs: ["enhancements"] },
  { file: "src/views/guard-events-table/legacy.js", fn: "initGuardEventsTable", segs: ["events"] },
  { file: "src/views/optical-event/legacy.js", fn: "initOpticalEvent", segs: ["optical-detail", "optical-entrance", "optical-import", "optical-event", "optical-host"] },
  { file: "src/views/nic-event/legacy.js", fn: "initNicEvent", segs: ["nic-event"] },
  { file: "src/views/story/legacy.js", fn: "initStory", segs: ["story-state", "story", "guardian"] },
  { file: "src/views/agent-panel/legacy.js", fn: "initAgentPanel", segs: ["mascot", "panel-entrance"] },
  { file: "src/views/energy-detail/legacy.js", fn: "initEnergyDetail", segs: ["ENERGY_CABINET", "energy-state", "energy"] },
  { file: "src/views/room-overview/legacy.js", fn: "initRoomOverview", segs: ["multi-cabinet"] },
];

const DATA_NAMES = { HOME_WORKLOADS: "workloads.js", HC_ASSETS: "hc-assets.js", OPTICAL_ASSETS: "hc-assets.js", HOME_LINKS_SVG: "hc-assets.js" };
const definedBy = new Map();
for (const m of modules) {
  const names = new Set();
  const joined = (m.segs || []).map((id) => get(id)).join("\n");
  for (const mm of joined.matchAll(/^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm)) names.add(mm[1]);
  definedBy.set(m.file, names);
}
const crossRefs = [];
for (const from of modules) {
  const joined = (from.segs || []).map((id) => get(id)).join("\n");
  for (const [to, names] of definedBy) {
    if (to === from.file) continue;
    for (const n of names) {
      const re = new RegExp(`\\b${n}\\b`);
      const idxs = [];
      let m;
      const lineRe = new RegExp(`^.*\\b${n}\\b.*$`, "gm");
      while ((m = lineRe.exec(joined)) !== null) {
        if (!/^(?:function|const|let|var)\s/ .test(m[0])) idxs.push(m[0].trim().slice(0, 90));
      }
      if (idxs.length) crossRefs.push(`${from.file} uses ${n} (defined in ${to}): ${idxs.length}x, e.g. "${idxs[0]}"`);
    }
  }
}

const fixups = {
  "src/views/story/legacy.js": "\nconst C = window.HCComponents;\nconst mount = function (id, node) { document.getElementById(id).replaceChildren(node); };\n",
  "src/views/nic-event/legacy.js": "\nconst C = window.HCComponents;\n",
  "src/views/energy-detail/legacy.js": "\nconst C = window.HCComponents;\nconst energyGradeTag = window.energyGradeTag;\n",
  "src/views/home-screen/legacy.js": "\nwindow.energyGradeTag = energyGradeTag;\n",
};

for (const m of modules) {
  const path = join("preview", m.file);
  mkdirSync(join(path, ".."), { recursive: true });
  let code = "";
  const joined = (m.segs || []).map((id) => get(id)).join("\n");
  const imports = [];
  if (m.file !== "src/mock/workloads.js" && joined.includes("HOME_WORKLOADS")) imports.push(`HOME_WORKLOADS`);
  for (const n of ["HC_ASSETS", "OPTICAL_ASSETS", "HOME_LINKS_SVG"]) {
    if (m.file !== "src/mock/hc-assets.js" && joined.includes(n)) imports.push(n);
  }
  const depth = m.file.split("/").length - 2;
  const rel = "../".repeat(depth);
  if (imports.filter((i) => i === "HOME_WORKLOADS").length) code += `import { HOME_WORKLOADS } from "${rel}mock/workloads.js";\n`;
  const assetImports = imports.filter((i) => i !== "HOME_WORKLOADS");
  if (assetImports.length) code += `import { ${assetImports.join(", ")} } from "${rel}mock/hc-assets.js";\n`;
  if (m.segs) {
    if (m.fn) {
      code += `\nexport function ${m.fn}() {\n${joined}${fixups[m.file] || ""}}\n`;
    } else {
      let idx = 0;
      for (const id of m.segs) {
        const t = get(id);
        if (!t) continue;
        idx++;
        const fnName = "init" + id.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
        code += `\nexport function ${fnName}() {\n${t}\n}\n`;
      }
    }
  } else {
    code = m.body;
  }
  writeFileSync(path, code, "utf8");
}

const segOrder = [
  ["evidence-ai", "src/views/evidence/legacy.js", "initEvidenceAi"],
  ["evidence-orig", "src/views/evidence/legacy.js", "initEvidenceOrig"],
  ["motion-runtime", "src/shared/motion-runtime.js", "initMotionRuntime"],
  ["components", "src/shared/hc-components.js", "initHCComponents"],
  ["demo-clock", "src/utils/clock.js", "initClock"],
  ["main", "src/views/home-screen/legacy.js", "initHomeScreen"],
  ["events", "src/views/guard-events-table/legacy.js", "initGuardEventsTable"],
  ["enhancements", "src/views/home-screen/enhancements.js", "initEnhancements"],
  ["optical-detail", "src/views/optical-event/legacy.js", "initOpticalEvent"],
  ["optical-entrance", "src/views/optical-event/legacy.js", "initOpticalEvent"],
  ["optical-import", "src/views/optical-event/legacy.js", "initOpticalEvent"],
  ["optical-event", "src/views/optical-event/legacy.js", "initOpticalEvent"],
  ["optical-host", "src/views/optical-event/legacy.js", "initOpticalEvent"],
  ["nic-event", "src/views/nic-event/legacy.js", "initNicEvent"],
  ["story-state", "src/views/story/legacy.js", "initStory"],
  ["story", "src/views/story/legacy.js", "initStory"],
  ["guardian", "src/views/story/legacy.js", "initStory"],
  ["ENERGY_CABINET", "src/views/energy-detail/legacy.js", "initEnergyDetail"],
  ["energy-state", "src/views/energy-detail/legacy.js", "initEnergyDetail"],
  ["energy", "src/views/energy-detail/legacy.js", "initEnergyDetail"],
];
const bootImports = [];
const bootCalls = [];
const seen = new Set();
for (const [segId, file, fn] of segOrder) {
  if (!get(segId)) continue;
  const key = file + fn;
  if (!seen.has(key)) {
    seen.add(key);
    bootImports.push(`import { ${fn} } from "./${file.replace(/^src\//, "")}";`);
  }
  if (!bootCalls.some((c) => c.includes(fn + "()"))) bootCalls.push(`  ${fn}();`);
}
writeFileSync("preview/src/boot.js", bootImports.join("\n") + '\n\nexport function runBoot() {\n' + bootCalls.join("\n") + "\n}\n", "utf8");

const report = [
  `body chars: ${body.length}, covered: ${covered} (${(covered / body.length * 100).toFixed(2)}%)`,
  ...segments.map((s) => `  ${s.id}: ${s.text.length} chars${s.text.length === 0 ? " (ABSENT)" : ""}`),
  ``,
  `cross-module bare refs (review): ${crossRefs.length}`,
  ...crossRefs.slice(0, 40).map((c) => `  ${c}`),
];
writeFileSync("tools/split-report.txt", report.join("\n"), "utf8");
console.log(report.join("\n"));
