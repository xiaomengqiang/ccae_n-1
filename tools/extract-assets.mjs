import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, basename } from "node:path";
import { gunzipSync } from "node:zlib";

const ROOT = process.cwd();
const DEMO = join(ROOT, "演示导出", "AgentDemo-当前演示.html");
const SRC = join(ROOT, "源码");
const OUT = join(ROOT, "tools", "extracted-assets");

const html = readFileSync(DEMO, "utf8");
console.log(`demo html chars: ${html.length}`);

const known = new Map();
function walk(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else {
      let st;
      try { st = statSync(p); } catch { continue; }
      if (st.size === 0 || st.size > 60 * 1024 * 1024) continue;
      let buf;
      try { buf = readFileSync(p); } catch { continue; }
      const h = createHash("sha256").update(buf).digest("hex");
      if (!known.has(h)) known.set(h, relative(SRC, p).replace(/\\/g, "/"));
    }
  }
}
walk(SRC);
console.log(`known source files hashed: ${known.size}`);

const found = new Map();
let b64Chars = 0;
let occurrences = 0;
function record(buf, mime, ctx) {
  const h = createHash("sha256").update(buf).digest("hex");
  let e = found.get(h);
  if (!e) { e = { buf, mime, contexts: [], count: 0 }; found.set(h, e); }
  e.count++;
  const c = ctx.replace(/\s+/g, " ").trim().slice(-150);
  if (e.contexts.length < 4 && !e.contexts.includes(c)) e.contexts.push(c);
}

let m;
const B64 = /data:([a-z0-9/+.\-]+);base64,([A-Za-z0-9+/=]+)/g;
while ((m = B64.exec(html)) !== null) {
  b64Chars += m[2].length;
  occurrences++;
  record(Buffer.from(m[2], "base64"), m[1], html.slice(Math.max(0, m.index - 170), m.index));
}
let pos = 0;
while ((pos = html.indexOf("atob(", pos)) !== -1) {
  const q = pos + 5;
  const qc = html[q];
  if (qc === '"' || qc === "'") {
    const end = html.indexOf(qc, q + 1);
    if (end !== -1 && end - q > 64 && end - q < 50000000) {
      occurrences++;
      record(Buffer.from(html.slice(q + 1, end), "base64"), "application/octet-stream", html.slice(Math.max(0, pos - 170), pos));
    }
  }
  pos += 5;
}

pos = 0;
const SVGMARK = "data:image/svg+xml";
while ((pos = html.indexOf(SVGMARK, pos)) !== -1) {
  const comma = html.indexOf(",", pos);
  if (comma !== -1 && comma - pos < 100) {
    let end = comma + 1;
    while (end < html.length && !/[\s)"']/.test(html[end])) end++;
    if (end - comma > 16 && end - comma < 2000000) {
      try {
        const txt = decodeURIComponent(html.slice(comma + 1, end));
        if (txt.startsWith("<svg") || txt.startsWith("<?xml")) {
          occurrences++;
          record(Buffer.from(txt, "utf8"), "image/svg+xml", html.slice(Math.max(0, pos - 170), pos));
        }
      } catch { }
    }
  }
  pos += SVGMARK.length;
}

function extFor(mime) {
  if (mime.includes("svg")) return ".svg";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("png")) return ".png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
  if (mime.includes("woff2")) return ".woff2";
  if (mime.includes("ttf") || mime.includes("truetype")) return ".ttf";
  if (mime.includes("gif")) return ".gif";
  if (mime.includes("ico")) return ".ico";
  return ".bin";
}
function sanitize(s) {
  return s.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
function nameFromContext(ctx) {
  let mm;
  if ((mm = ctx.match(/--([a-z0-9][a-z0-9-]{2,60})\s*:\s*(?:url\(\s*)?["']?\s*$/i))) return mm[1];
  if ((mm = ctx.match(/["']?([a-z][\w.-]{2,60})["']?\s*:\s*["']?\s*$/i))) return mm[1];
  if ((mm = ctx.match(/([a-z][a-z0-9-]{2,60})\s*=\s*["']?\s*$/i))) return mm[1];
  if ((mm = ctx.match(/class=["']([^"']{2,60})["']/i))) return mm[1].split(/\s+/).pop();
  if ((mm = ctx.match(/\.([a-z][a-z0-9-]{2,60})\s*\{/i))) return mm[1];
  return null;
}
function folderFor(name, mime, ctx, ext) {
  if (ext === ".woff2" || ext === ".ttf") return "font";
  if (name.includes("mascot") || (/(mascot|ip-|bg-|burst)/.test(name) && ext === ".webp")) return "mascot";
  if (ext === ".svg") return "icons";
  return "uploads";
}

for (const dir of ["icons", "mascot", "font", "scenes", "uploads"]) mkdirSync(join(OUT, dir), { recursive: true });
const usedNames = new Set();
const manifest = [];
let i = 0;
for (const [sha, e] of found) {
  i++;
  const ext = extFor(e.mime);
  let dir;
  let finalName;
  let writeBuf = e.buf;
  let note = "";
  const knownPath = known.get(sha);
  if (e.buf.length >= 2 && e.buf[0] === 0x1f && e.buf[1] === 0x8b) {
    try {
      const raw = gunzipSync(e.buf);
      const head = raw.subarray(0, 200).toString("utf8").trim().toLowerCase();
      if (head.startsWith("<!doctype") || head.startsWith("<html")) {
        writeBuf = raw;
        dir = "scenes";
        const rawKnown = known.get(createHash("sha256").update(raw).digest("hex"));
        finalName = (rawKnown ? basename(rawKnown).replace(/\.[^.]+$/, "") : "embedded-scene") + ".html";
        note = `gunzip ${e.buf.length} -> ${raw.length} bytes`;
      }
    } catch { }
  }
  if (!finalName) {
    const base = knownPath ? basename(knownPath).replace(/\.[^.]+$/, "") : (nameFromContext(e.contexts[e.contexts.length - 1] || "") || `asset-${String(i).padStart(3, "0")}-${sha.slice(0, 8)}`);
    dir = folderFor(base, e.mime, e.contexts[0] || "", ext);
    finalName = sanitize(base) + ext;
  } else {
    finalName = sanitize(finalName);
  }
  let candidate = finalName;
  let n = 2;
  while (usedNames.has(dir + "/" + candidate)) { candidate = finalName.replace(/(\.[^.]+)$/, `-${n++}$1`); }
  finalName = candidate;
  usedNames.add(dir + "/" + finalName);
  const rel = `${dir}/${finalName}`;
  writeFileSync(join(OUT, ...rel.split("/")), writeBuf);
  manifest.push({
    path: rel,
    sha256: sha,
    bytes: writeBuf.length,
    origBytes: e.buf.length,
    mime: e.mime,
    occurrences: e.count,
    knownFrom: knownPath || null,
    note,
    contexts: e.contexts,
  });
}

manifest.sort((a, b) => a.path.localeCompare(b.path));
writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

let uniqueBytes = 0;
const perDir = {};
for (const e of manifest) {
  uniqueBytes += e.origBytes;
  perDir[e.path.split("/")[0]] = (perDir[e.path.split("/")[0]] || 0) + 1;
}
console.log(`unique assets: ${manifest.length} (${uniqueBytes} bytes decoded)`);
console.log(`data-uri occurrences: ${occurrences} (base64 chars: ${b64Chars})`);
console.log(`named-from-source: ${manifest.filter((e) => e.knownFrom).length}`);
console.log(`per-dir counts: ${JSON.stringify(perDir)}`);
console.log(`scenes: ${manifest.filter((e) => e.note.startsWith("gunzip")).map((e) => e.path).join(", ") || "none"}`);
console.log(`manifest: tools/extracted-assets/manifest.json`);
