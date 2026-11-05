// 一致性比对:git HEAD 的 optical-event/event.js(原命令式实现)vs React 化后的新文件组。
// 1) DOM 类名 token 差集(原版有、新版缺 —— 逐个人工判定是否死代码/遗漏)
// 2) 用户可见中文文案差集
const fs = require("fs");
const path = require("path");

const HEAD_DUMP = path.join(__dirname, ".optical-event-head.js");
const NEW_FILES = [
  "preview/src/views/optical-event/index.jsx",
  "preview/src/views/optical-event/panel-parts.jsx",
  "preview/src/views/optical-event/parts.js",
  "preview/src/views/optical-event/evidence.js",
  "preview/src/views/optical-event/canvas-reference.js",
  "preview/src/shared/entrance.js",
  "preview/src/components/diagnostic-step/index.jsx",
  "preview/src/components/cause-chain/index.jsx",
  "preview/src/components/evt-badge/index.jsx",
  "preview/src/components/composer/index.jsx",
  "preview/src/views/optical-event/isolation-animation.jsx",
  "preview/src/views/optical-event/topology-2d.jsx",
  "preview/src/views/optical-event/rack-3d.jsx",
].map((f) => path.join(__dirname, "..", f));

const read = (f) => fs.readFileSync(f, "utf8");
const orig = read(HEAD_DUMP);
// 逐文件提取再并集:join 成单文件会让字符串/模板串的引号配对跨文件错乱
const next = NEW_FILES.map(read);

// 类名 token:字符串字面量里的 evt-/nic-/hc-/optical- 开头 token
const classTokens = (src) => {
  const out = new Set();
  const re = /'([^']*)'|"([^"]*)"|`([^`]*)`/g;
  let m;
  while ((m = re.exec(src))) {
    const s = m[1] ?? m[2] ?? m[3] ?? "";
    for (const t of s.split(/\s+/)) {
      if (/^(evt-|nic-|hc-|optical-)[a-z0-9-]+$/.test(t)) out.add(t);
    }
  }
  // 模板串与运行时拼接:`evt-badge evt-badge-${...}` 之类
  const reT = /`([^`]*?)\$\{/g;
  while ((reT.exec(src))) out.add("(模板串见人工核对)");
  return out;
};

// 可见中文文案:含 CJK 的字符串字面量(整串)
const cnStrings = (src) => {
  const out = new Set();
  const re = /'([^']*)'|"([^"]*)"/g;
  let m;
  while ((m = re.exec(src))) {
    const s = (m[1] ?? m[2] ?? "").trim();
    if (/[\u3400-\u9fff]/.test(s) && s.length <= 120) out.add(s);
  }
  return out;
};

const diff = (a, b) => [...a].filter((x) => !b.has(x));

const origClasses = classTokens(orig);
const nextClasses = new Set();
for (const src of next) for (const t of classTokens(src)) nextClasses.add(t);
const missingClasses = diff(origClasses, nextClasses).filter((x) => x !== "(模板串见人工核对)");

const origTexts = cnStrings(orig);
const nextTexts = new Set();
for (const src of next) for (const t of cnStrings(src)) nextTexts.add(t);
const missingTexts = diff(origTexts, nextTexts);

console.log("=== 原版有、新版缺的类名 token ===");
console.log(missingClasses.length ? missingClasses.join("\n") : "(无)");
console.log("\n=== 原版有、新版缺的中文文案(整串,注意原版里可能被拆分拼接)===");
console.log(missingTexts.length ? missingTexts.join("\n---\n") : "(无)");
