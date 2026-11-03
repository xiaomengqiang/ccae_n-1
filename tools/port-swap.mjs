import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";

const html = readFileSync("演示导出/AgentDemo-当前演示.html", "utf8");
const manifest = JSON.parse(readFileSync("tools/extracted-assets/manifest.json", "utf8"));
const shaToPath = new Map(manifest.map((e) => [e.sha256, "./assets/" + e.path]));
const referenced = new Set(["./assets/scenes/multi-cabinet-scene.html"]);

function scanSpans(tag, exclude) {
  const spans = [];
  const open = "<" + tag;
  let pos = 0;
  while ((pos = html.indexOf(open, pos)) !== -1) {
    const gt = html.indexOf(">", pos);
    if (gt === -1) break;
    const attrs = html.slice(pos, gt + 1);
    if (/(\s(src|href)=|\/>$)/.test(attrs)) { pos = gt; continue; }
    const close = "</" + tag + ">";
    const end = html.indexOf(close, gt);
    if (end === -1) break;
    const span = { start: pos, contentStart: gt + 1, contentEnd: end, end: end + close.length, attrs };
    if (exclude && exclude.some((e) => span.start >= e.start && span.end <= e.end)) { pos = span.end; continue; }
    spans.push(span);
    pos = span.end;
  }
  return spans;
}

const scripts = scanSpans("script");
const styles = scanSpans("style", scripts);
const bodyOpen = html.search(/<body[^>]*>/);
const bodyInnerStart = html.indexOf(">", bodyOpen) + 1;
const bodyInnerEnd = html.lastIndexOf("</body>");

let cssText = styles.map((s) => html.slice(s.contentStart, s.contentEnd)).join("\n");
let jsText = scripts.map((s) => html.slice(s.contentStart, s.contentEnd)).join("\n");
let skeleton = html.slice(bodyInnerStart, bodyInnerEnd);
for (const s of [...scripts, ...styles]) {
  if (s.contentStart >= bodyInnerStart && s.end <= bodyInnerEnd) {
    skeleton = skeleton.replace(html.slice(s.contentStart - 0, s.end), "");
  }
}
skeleton = skeleton.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");

const skipShas = new Set(manifest.filter((e) => e.path.includes("agent-panel-opaque")).map((e) => e.sha256));

const stats = { css: { swaps: 0, unswapped: [] }, js: { swaps: 0, unswapped: [] }, skeleton: { swaps: 0, unswapped: [] } };

function swapAll(text, which) {
  const found = [];
  let pos = 0;
  while ((pos = text.indexOf("data:", pos)) !== -1) {
    const m = /^data:([a-z0-9/+.\-]+\/[a-z0-9/+.\-]+;base64,)/i.exec(text.slice(pos, pos + 120));
    if (m) {
      let end = pos + m[0].length;
      while (end < text.length && /[A-Za-z0-9+/=]/.test(text[end])) end++;
      const payload = text.slice(pos + m[0].length, end);
      if (payload.length > 16) {
        const buf = Buffer.from(payload, "base64");
        const sha = createHash("sha256").update(buf).digest("hex");
        const path = shaToPath.get(sha);
        if (path && !skipShas.has(sha)) { found.push({ start: pos, end, path }); referenced.add(path); }
        else if (!path) stats[which].unswapped.push({ at: pos, len: payload.length });
      }
      pos = end;
      continue;
    }
    const su = /^data:image\/svg\+xml[,;]/i.exec(text.slice(pos, pos + 40));
    if (su) {
      let end = pos;
      while (end < text.length && !/[\s)"']/.test(text[end])) end++;
      try {
        const comma = text.indexOf(",", pos);
        const txt = decodeURIComponent(text.slice(comma + 1, end));
        if (txt.startsWith("<svg") || txt.startsWith("<?xml")) {
          const sha = createHash("sha256").update(Buffer.from(txt, "utf8")).digest("hex");
          const path = shaToPath.get(sha);
          if (path) { found.push({ start: pos, end, path }); referenced.add(path); }
          else stats[which].unswapped.push({ at: pos, len: end - pos });
        }
      } catch { }
      pos = end;
      continue;
    }
    pos += 5;
  }
  for (let i = found.length - 1; i >= 0; i--) {
    const f = found[i];
    text = text.slice(0, f.start) + f.path + text.slice(f.end);
  }
  stats[which].swaps += found.length;
  return text;
}

const SCENE_B = "const packed=Uint8Array.from(atob(";
const si = jsText.indexOf(SCENE_B);
if (si === -1) throw new Error("scene loader snippet not found");
const te = jsText.indexOf(".text();", si);
const sceneCut = jsText.slice(si, te + 8);
if (!sceneCut.includes("DecompressionStream") || sceneCut.length > 7000000) throw new Error("scene snippet sanity failed: len=" + sceneCut.length);
jsText = jsText.slice(0, si) + 'frame.src="./assets/scenes/multi-cabinet-scene.html";' + jsText.slice(te + 8);

cssText = swapAll(cssText, "css");
jsText = swapAll(jsText, "js");
skeleton = swapAll(skeleton, "skeleton");

const mascotPatches = [
  ["const sources={},urls=new Set(),timers=new Set();", "const timers=new Set();"],
  ["function replay(key){\n    const el=layers[key],old=el.dataset.objectUrl,url=URL.createObjectURL(sources[key]);\n    urls.add(url);el.src=url;el.dataset.objectUrl=url;\n    if(old){URL.revokeObjectURL(old);urls.delete(old);}\n  }",
   "function replay(key){\n    const el=layers[key],base=el.dataset.base||(el.dataset.base=el.src.split('?')[0]);\n    el.src=base+'?r='+Math.random();\n  }"],
  ["Promise.all(Object.entries(layers).map(async([key,el])=>{sources[key]=await(await fetch(el.src)).blob();})).then(()=>{ready=true;start();}).catch(()=>{stage.classList.add('motion-static');});",
   "ready=true;start();"],
  ["window.addEventListener('pagehide',()=>{disposed=true;clear();urls.forEach(URL.revokeObjectURL);reduced.removeEventListener('change',start);},{once:true});",
   "window.addEventListener('pagehide',()=>{disposed=true;clear();reduced.removeEventListener('change',start);},{once:true});"],
];
for (const [from, to] of mascotPatches) {
  if (!jsText.includes(from)) throw new Error("mascot patch source not found: " + from.slice(0, 60));
  jsText = jsText.replace(from, to);
}

const rootBlocks = [];
{
  const re = /:root\s*\{/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    const braceIdx = cssText.indexOf("{", m.index);
    let depth = 1, i = braceIdx + 1;
    while (i < cssText.length && depth > 0) {
      if (cssText[i] === "{") depth++;
      else if (cssText[i] === "}") depth--;
      i++;
    }
    rootBlocks.push(cssText.slice(m.index, i));
    cssText = cssText.slice(0, m.index) + cssText.slice(i);
    re.lastIndex = m.index;
  }
}

const bodySelContexts = [];
{
  const re = /(^|[^-\w#.])body\s*>\s*/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    if (!/^[^-\w#.]/.test(m[1]) && m[1] !== "") continue;
    bodySelContexts.push(cssText.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\s+/g, " "));
    const cut = m[0].length - m[1].length;
    cssText = cssText.slice(0, m.index + m[1].length) + "body>#root>" + cssText.slice(m.index + m[0].length);
    re.lastIndex = m.index + m[1].length + 11;
  }
}

let leftoverB64 = (cssText.match(/;base64,/g) || []).length + (jsText.match(/;base64,/g) || []).length + (skeleton.match(/;base64,/g) || []).length;
let leftoverAtob = (jsText.match(/\batob\(/g) || []).length;

const emptyDecls = (cssText.match(/[a-zA-Z-]+:\s*;/g) || []).length;
cssText = cssText.replace(/[a-zA-Z-]+:\s*;/g, "");

const motionBlock = skeleton.match(/<div class="agent-motion"[^>]*>([\s\S]*?)<\/div>/);
if (!motionBlock) throw new Error("agent-motion block not found in skeleton");
const layerRe = /<img data-motion="([^"]+)" src="([^"]+)"[^>]*>/g;
const mascotLayers = [];
let lm;
while ((lm = layerRe.exec(motionBlock[1])) !== null) mascotLayers.push({ motion: lm[1], src: lm[2] });
if (mascotLayers.length !== 7) throw new Error("expected 7 mascot layers, got " + mascotLayers.length);
skeleton = skeleton.replace(motionBlock[0], motionBlock[0].replace(motionBlock[1], ""));
mkdirSync("preview/src/views/agent-panel", { recursive: true });
writeFileSync("preview/src/views/agent-panel/mascot-layers.js", "export const MASCOT_LAYERS = " + JSON.stringify(mascotLayers) + ";\n", "utf8");

const mainIdx = skeleton.indexOf("<main");
const mainOpen = mainIdx === -1 ? null : skeleton.slice(mainIdx).match(/^<main([^>]*)>/);
if (!mainOpen) throw new Error("skeleton has no <main>");
const SCREEN_ATTRS = {};
for (const a of mainOpen[1].matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) SCREEN_ATTRS[a[1]] = a[2];
const skeletonInner = skeleton.slice(mainIdx + mainOpen[0].length, skeleton.lastIndexOf("</main>"));

writeFileSync("preview/src/styles/legacy.css", cssText, "utf8");
writeFileSync("preview/src/legacy/app-legacy.js", "export function bootLegacyScreen() {\n" + jsText + "\n}\n", "utf8");
writeFileSync("preview/src/legacy/screen-skeleton.js", "export const SCREEN_ATTRS = " + JSON.stringify(SCREEN_ATTRS) + ";\nexport const SKELETON_INNER = " + JSON.stringify(skeletonInner) + ";\n", "utf8");
let runtimeVarBlock = "";
const runtimeVars = new Map();
{
  const re = /var\((--[a-zA-Z0-9-]+)(\s*,\s*([^)]+))?\)/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    if (!runtimeVars.has(m[1])) runtimeVars.set(m[1], m[3] !== undefined ? m[3].trim() : null);
  }
  const definedElsewhere = new Set(rootBlocks.join("\n").match(/--[a-zA-Z0-9-]+\s*:/g)?.map((s) => s.slice(0, -1).trim()) || []);
  const decls = [];
  for (const [name, fb] of runtimeVars) {
    if (definedElsewhere.has(name)) continue;
    decls.push(`${name}:${fb === null ? "initial" : fb};`);
  }
  if (decls.length) runtimeVarBlock = ":root{\n" + decls.join("\n") + "\n}";
}

if (rootBlocks.length || runtimeVarBlock) {
  const fs = await import("node:fs/promises");
  const themeBase = await fs.readFile(".opencode/skills/ict-coder/scripts/preview/assets/style/theme.css", "utf8");
  await fs.writeFile("preview/assets/style/theme.css", themeBase + "\n/* === ported :root tokens (from demo html) === */\n" + rootBlocks.join("\n") + "\n" + runtimeVarBlock + "\n", "utf8");
}

const unswappedCtx = [];
for (const key of ["css", "js", "skeleton"]) {
  for (const u of stats[key].unswapped) {
    const src = key === "css" ? cssText : key === "js" ? jsText : skeleton;
    unswappedCtx.push(key + " @" + u.at + " len=" + u.len);
  }
}
let atobCtx = "";
{
  const i = jsText.indexOf("atob(");
  if (i !== -1) atobCtx = jsText.slice(Math.max(0, i - 120), i + 120).replace(/\s+/g, " ");
}
let unswappedSamples = "";
{
  const raw = readFileSync("演示导出/AgentDemo-当前演示.html", "utf8");
  const cssRaw = styles.map((s) => raw.slice(s.contentStart, s.contentEnd)).join("\n");
  for (const u of stats.css.unswapped) {
    unswappedSamples += "  css@" + u.at + ": " + cssRaw.slice(Math.max(0, u.at - 60), u.at + 80).replace(/\s+/g, " ") + "\n";
  }
}

const skipPaths = manifest.filter((e) => skipShas.has(e.sha256)).map((e) => e.path);
const unreferenced = manifest.filter((e) => !referenced.has("./assets/" + e.path) && !skipPaths.includes(e.path)).map((e) => e.path);
const topLevel = [];
{
  let depth = 0, i = 0, tagStart = -1;
  while (i < skeleton.length) {
    if (skeleton[i] === "<" && skeleton[i + 1] !== "/" && skeleton[i + 1] !== "!") {
      if (depth === 0) tagStart = i;
      const gt = skeleton.indexOf(">", i);
      const selfClose = skeleton[gt - 1] === "/";
      const tagName = skeleton.slice(i + 1, gt).split(/[\s>]/)[0];
      depth += selfClose ? 0 : 1;
      if (depth === 1 && !selfClose) topLevel.push(tagName + "@" + i);
      i = gt + 1;
      if (selfClose && tagStart === i) depth += 0;
    } else if (skeleton[i] === "<" && skeleton[i + 1] === "/") {
      depth--;
      i = skeleton.indexOf(">", i) + 1;
    } else i++;
  }
}

const report = [
  `css swaps: ${stats.css.swaps}, js swaps: ${stats.js.swaps}, skeleton swaps: ${stats.skeleton.swaps}`,
  `unswapped: css=${stats.css.unswapped.length} js=${stats.js.unswapped.length} skel=${stats.skeleton.unswapped.length}`,
  `leftover ;base64,: ${leftoverB64}, leftover atob: ${leftoverAtob}`,
  `leftover atob ctx: ${atobCtx}`,
  `unswapped samples:\n${unswappedSamples}`,
  `:root blocks relocated: ${rootBlocks.length} (total ${rootBlocks.reduce((a, b) => a + b.length, 0)} chars)`,
  `runtime vars declared: ${[...runtimeVars.keys()].length}`,
  `body> selectors patched: ${bodySelContexts.length}`,
  ...bodySelContexts.map((c) => `  ctx: ...${c}...`),
  `unreferenced manifest paths: ${unreferenced.length}${unreferenced.length ? " -> " + unreferenced.join(", ") : ""}`,
  `intentionally inline (data URI kept): ${skipPaths.join(", ") || "none"}`,
  `skeleton top-level tags: ${JSON.stringify(topLevel)}`,
  `empty css declarations stripped: ${emptyDecls}`,
  `sizes: css=${cssText.length} js=${jsText.length} skeleton=${skeleton.length}`,
];
writeFileSync("tools/port-report.txt", report.join("\n"), "utf8");
console.log(report.join("\n"));
