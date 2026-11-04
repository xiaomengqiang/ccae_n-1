#!/usr/bin/env node
// build.mjs — ICT React 页面的零依赖 "mini bundler"。
//
// What it does:
//   1. 加载 app.jsx(页面入口),递归跟随相对 import(.js/.jsx 模块、.css 文件)
//   2. 外部库 import 映射为全局:
//        react / react-dom  → React / ReactDOM
//        antd               → antd (antd.min.js UMD)
//        dayjs              → dayjs (dayjs.min.js UMD)
//        @ant-design/icons  → FAIL(本 skill 一律使用 Lucide Icon 组件)
//   3. 剥离 import/export 语句(固定模式),模块包进 IIFE 共享一个 __export 池
//   4. 提取使用到的 Lucide 图标(扫描 name="x" / icon: "x" 等模式),
//      在 lucide-icon-nodes.json(1777 icons)中校验,非 Lucide 名 → WARN,
//      将图标 nodes 注入 shared/icon.jsx 模块(const LUCIDE = {...})
//   5. 内联全部产物 — base/light/theme/dark/ant 五层 CSS 进 <style>
//      (font url() 重写为 HTML 根相对路径),
//      React/ReactDOM/dayjs/antd/Babel 保持本地 assets/library 引用
//   6. CSS lint: 组件 CSS 禁止 :root/.dark 块、禁止未知 token、hex 硬编码 → WARN
//   7. 产出可直接双击打开(file://)的 index.page.html
//
// Usage:  node build.mjs --dir "<scaffold path>"

import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve, dirname } from "node:path";

// --- parse --dir argument (the scaffold path to build) ---
const args = process.argv.slice(2);
const dirIdx = args.findIndex((a) => a === "--dir" || a === "-d");
if (dirIdx === -1 || !args[dirIdx + 1]) {
  console.error('FAIL  Missing --dir <scaffold path>. Usage: node build.mjs --dir "<path>"');
  process.exit(1);
}
const ROOT = resolve(args[dirIdx + 1]);

const ENTRY = resolve(ROOT, "app.jsx");
const OUT = resolve(ROOT, "index.page.html");
const STYLE_DIR = resolve(ROOT, "assets/style");
// 五层样式加载序: base(基础色阶) → light(:root 语义) → theme(终极语义别名) → dark(.dark 覆盖)
// → ant(antd 组件换肤层,.dark 规则随暗色生效)
const STYLE_FILES = ["base.css", "light.css", "theme.css", "dark.css", "ant.css"].map((f) => resolve(STYLE_DIR, f));
const LUCIDE_JSON = resolve(ROOT, "assets/library/lucide-icon-nodes.json");
const ICONS_MODULE = "assets/shared/icon.jsx";

// Matches: import [Def,] [Def2] [{ named, names }] from "source";
const IMPORT_RE = /^[ \t]*import\s+(?:(\w+)\s*,\s*)?(?:(\w+)\s+)?(?:\{([^}]*)\})?\s*from\s*["']([^"']+)["'];?[ \t]*$/gm;
// Matches: import "source";  (side-effect, used for CSS)
const SIDE_EFFECT_RE = /^[ \t]*import\s*["']([^"']+)["'];?[ \t]*$/gm;

// Icon usage patterns scanned across all module sources:
// 只匹配 <Icon ...> 标签自身的 name 属性 — antd Form.Item/Input 等组件的 name="field"
// 是表单字段名,不能当图标名扫描。
const ICON_SCAN_PATTERNS = [
  /<Icon\b[^>]*?\bname=["']([a-z0-9-]+)["']/gs,   // <Icon name="chevron-down" (属性任意顺序)
  /\bicon[a-z]*\s*[:=]\s*["']([a-z0-9-]+)["']/g,  // icon: "grid" data fields / icon="x" attrs
];
// Dynamic name expressions — extract every string literal inside: <Icon name={a ? "x" : "y"}>
const NAME_EXPR_RE = /<Icon\b[^>]*?\bname=\{([^}]*)\}/gs;
const STRING_LIT_RE = /["']([a-z0-9-]+)["']/g;

function splitNames(named) {
  return (named || "").split(",").map((s) => s.trim()).filter(Boolean);
}
function camelToKebab(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

const modules = [];   // in topological order (dependencies first)
const moduleByPath = new Map(); // resolved path -> module record
const loaded = new Set();
const cssFiles = [];  // in dependency order
let entryDefault = null;
const iconRefs = new Map(); // kebab-name -> Set of "file (usage)" for error reporting

function recordIconRef(rawName, label) {
  const kebab = camelToKebab(rawName);
  if (!iconRefs.has(kebab)) iconRefs.set(kebab, new Set());
  iconRefs.get(kebab).add(`${label} ("${rawName}")`);
}

function scanIconUsage(code, label) {
  for (const re of ICON_SCAN_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) recordIconRef(m[1], label);
  }
  NAME_EXPR_RE.lastIndex = 0;
  let em;
  while ((em = NAME_EXPR_RE.exec(code)) !== null) {
    STRING_LIT_RE.lastIndex = 0;
    let lm;
    while ((lm = STRING_LIT_RE.exec(em[1])) !== null) recordIconRef(lm[1], label);
  }
}

async function loadModule(filePath) {
  filePath = resolve(filePath);
  if (loaded.has(filePath)) return;
  loaded.add(filePath);

  const raw = (await readFile(filePath, "utf8")).replace(/^\uFEFF/, ""); // 容错 UTF-8 BOM
  const label = filePath.slice(ROOT.length + 1).replace(/\\/g, "/");
  const deps = [];
  const reactNames = new Set();
  const antdNames = new Set();
  const intlNames = new Set();
  const bundleNames = [];
  const defImports = []; // { local, dep } — default import 的本地名与依赖路径
  let code = raw;

  code = code.replace(IMPORT_RE, (_match, def1, def2, named, source) => {
    const def = def1 || def2;
    if (source === "react") {
      splitNames(named).forEach((n) => reactNames.add(n));
      return "";
    }
    if (source === "react-dom" || source === "react-dom/client") {
      return "";
    }
    if (source === "antd") {
      splitNames(named).forEach((n) => antdNames.add(n));
      if (def) antdNames.add(def); // import antd from "antd" — 极少用,兼容
      return "";
    }
    if (source === "react-intl") {
      splitNames(named).forEach((n) => intlNames.add(n));
      return "";
    }
    if (source === "dayjs") {
      // import dayjs from "dayjs" → 全局 dayjs 直接可用
      return "";
    }
    if (source === "@ant-design/icons") {
      throw new Error(`${label}: 本 skill 不使用 @ant-design/icons — 页面图标一律使用 <Icon name="lucide-name" />(import { Icon } from "./assets/shared/icon.jsx")`);
    }
    deps.push(resolve(dirname(filePath), source));
    if (def) defImports.push({ local: def, dep: resolve(dirname(filePath), source) });
    splitNames(named).forEach((n) => bundleNames.push(n));
    return "";
  });

  code = code.replace(SIDE_EFFECT_RE, (_match, source) => {
    const dep = resolve(dirname(filePath), source);
    deps.push(dep);
    if (extname(dep) === ".css" && !cssFiles.includes(dep)) cssFiles.push(dep);
    return "";
  });

  // Load dependencies first so the concatenation order is valid.
  for (const dep of deps) {
    if (extname(dep) === ".css") continue;
    await loadModule(dep);
  }

  // resolve default imports against the loaded dependency modules
  for (const di of defImports) {
    const depMod = moduleByPath.get(di.dep);
    if (!depMod) throw new Error(`${label}: dependency not found: ${di.dep}`);
    if (!depMod.defaultPoolKey) throw new Error(`${label}: dependency has no default export: ${depMod.label}`);
    di.key = depMod.defaultPoolKey;
  }

  const exported = [];
  let defaultPoolKey = null;
  const defaultFn = code.match(/^[ \t]*export\s+default\s+function\s+(\w+)/m);
  if (defaultFn) {
    code = code.replace(/^[ \t]*export\s+default\s+function\s+\w+/m, (m) => m.replace(/^[ \t]*export\s+default\s+/, ""));
    exported.push(defaultFn[1]);
    defaultPoolKey = defaultFn[1];
    if (filePath === ENTRY) entryDefault = defaultFn[1];
  } else {
    // export default <identifier>; — 以标识符原名入导出池(如 const zhCN = {...}; export default zhCN;)
    const defaultIdent = code.match(/^[ \t]*export\s+default\s+([A-Za-z_$][\w$]*)\s*;?[ \t]*$/m);
    if (defaultIdent) {
      code = code.replace(/^[ \t]*export\s+default\s+[A-Za-z_$][\w$]*\s*;?[ \t]*$/m, "");
      exported.push(defaultIdent[1]);
      defaultPoolKey = defaultIdent[1];
    } else if (/^[ \t]*export\s+default\b/m.test(code)) {
      throw new Error(`${filePath}: "export default" must be a named function declaration or a plain identifier (export default function Name / export default constName)`);
    }
  }
  code = code.replace(/^[ \t]*export\s+function\s+(\w+)/gm, (_m, name) => {
    exported.push(name);
    return `function ${name}`;
  });
  code = code.replace(/^[ \t]*export\s+const\s+(\w+)/gm, (_m, name) => {
    exported.push(name);
    return `const ${name}`;
  });
  code = code.replace(/^[ \t]*export\s+let\s+(\w+)/gm, (_m, name) => {
    exported.push(name);
    return `let ${name}`;
  });

  scanIconUsage(raw, label);

  const mod = {
    label,
    reactNames: [...reactNames],
    antdNames: [...antdNames],
    intlNames: [...intlNames],
    bundleNames: [...new Set(bundleNames)],
    defImports,
    code: code.trim(),
    exported,
    defaultPoolKey,
    prelude: "",
  };
  modules.push(mod);
  moduleByPath.set(filePath, mod);
}

function wrapModule(mod) {
  const lines = [`/* ===== ${mod.label} ===== */`, "(function () {"];
  if (mod.prelude) lines.push(mod.prelude);
  if (mod.reactNames.length) lines.push(`  const { ${mod.reactNames.join(", ")} } = React;`);
  if (mod.antdNames.length) lines.push(`  const { ${mod.antdNames.join(", ")} } = antd;`);
  if (mod.intlNames.length) lines.push(`  const { ${mod.intlNames.join(", ")} } = ReactIntl;`);
  if (mod.bundleNames.length) lines.push(`  const { ${mod.bundleNames.join(", ")} } = __export;`);
  for (const di of mod.defImports) {
    lines.push(`  const ${di.local} = __export.${di.key};`);
  }
  lines.push(mod.code);
  if (mod.exported.length) lines.push(`  Object.assign(__export, { ${mod.exported.join(", ")} });`);
  lines.push("})();");
  return lines.join("\n");
}

await loadModule(ENTRY);

if (!entryDefault) {
  throw new Error("app.jsx must have: export default function App()");
}

// --- Banned antd components (布局/装饰类 — 须用 H5 + CSS 或组件组合实现) ---
const ANTD_BANNED = ["Layout", "Grid", "Row", "Col", "Flex", "Space", "Card", "Skeleton", "Masonry", "Popconfirm", "Watermark", "Typography", "List", "Listy", "QRCode", "Tour", "Statistic", "FloatButton", "Mentions", "Descriptions", "Affix", "Avatar", "Transfer", "Result", "Upload", "Alert", "AutoComplete", "Splitter", "Image", "Calendar", "Form"];
const bannedHits = [];
for (const mod of modules) {
  for (const n of mod.antdNames) {
    if (ANTD_BANNED.includes(n)) bannedHits.push(`${mod.label}: import { ${n} } from "antd"`);
  }
  const tagRe = new RegExp(`<(?:${ANTD_BANNED.join("|")})[\\s/>.]|antd\\.(?:${ANTD_BANNED.join("|")})\\b`, "g");
  let bm;
  while ((bm = tagRe.exec(mod.code)) !== null) {
    const name = bm[0].replace(/[<\s/>.]|\bantd\./g, "").replace(/^antd\./, "");
    bannedHits.push(`${mod.label}: ${bm[0].startsWith("<") ? `<${name}…` : `antd.${name}`}`);
  }
}
if (bannedHits.length) {
  console.error("FAIL  禁用的 antd 组件(布局/装饰类) — 用纯 H5 或已有组件组合实现:");
  for (const h of [...new Set(bannedHits)]) console.error(`  ${h}`);
  process.exit(1);
}

// --- Banned antd props ---
const PROPS_BANNED = ["addonAfter", "prefix", "optionType"];
const propBannedHits = [];
for (const mod of modules) {
  for (const p of PROPS_BANNED) {
    const propRe = new RegExp(`\\b${p}\\b`);
    if (propRe.test(mod.code)) propBannedHits.push(`${mod.label}: ${p}`);
  }
}
// --- Banned code patterns (子组件/形态) ---
const CODE_BANNED = [
  { re: /\bRadio\.Button\b/, msg: "Radio.Button 按钮形态" },
];
for (const mod of modules) {
  for (const { re, msg } of CODE_BANNED) {
    if (re.test(mod.code)) propBannedHits.push(`${mod.label}: ${msg}`);
  }
}
// --- Component-scoped banned props: InputNumber.suffix（Input 的 suffix 搜索场景不受影响） ---
for (const mod of modules) {
  const inumSuffixRe = /<InputNumber\b[^<]*?\bsuffix\s*=/gs;
  if (inumSuffixRe.test(mod.code)) propBannedHits.push(`${mod.label}: <InputNumber suffix>`);
}
if (propBannedHits.length) {
  console.error("FAIL  禁用的 antd 属性 — 附加内容放控件外（Input 搜索框 suffix 除外）:");
  for (const h of [...new Set(propBannedHits)]) console.error(`  ${h}`);
  process.exit(1);
}

// --- Icon size format check: must be rem string, not number ---
const iconSizeWarnings = [];
for (const mod of modules) {
  const sizeNumRe = /<Icon\b[^<]*?\bsize=\{(\d+(?:\.\d+)?)\}/gs;
  let ism;
  while ((ism = sizeNumRe.exec(mod.code)) !== null) {
    const px = parseFloat(ism[1]);
    const rem = `${parseFloat((px / 16).toFixed(4))}rem`;
    iconSizeWarnings.push(`  ${mod.label}: size={${px}} → use size="${rem}"`);
  }
}
if (iconSizeWarnings.length) {
  console.log("WARN  Icon size should be rem string, not number:");
  console.log(iconSizeWarnings.join("\n"));
}

// --- Icon color format check: 6-digit hex only (icon-plus matches by hex) ---
const iconColorWarnings = [];
for (const mod of modules) {
  const colorRe = /<Icon\b[^<]*?\bcolor=("(?<v>[^"]*)"|\{'(?<s>[^']*)'\})/gs;
  let icm;
  while ((icm = colorRe.exec(mod.code)) !== null) {
    const val = icm.groups.v ?? icm.groups.s;
    if (!/^#[0-9a-fA-F]{6}$/.test(val)) {
      iconColorWarnings.push(`  ${mod.label}: color="${val}" → use 6-digit hex like "#0067D1"`);
    }
  }
}
if (iconColorWarnings.length) {
  console.log("WARN  Icon color must be 6-digit hex (rgba/rgb/8-digit hex silently mismatch in icon-plus):");
  console.log(iconColorWarnings.join("\n"));
}

// --- Lucide icon extraction & validation ---
const lucideRaw = JSON.parse(await readFile(LUCIDE_JSON, "utf8"));
const iconTableEntries = [];
const nonLucideNames = [];
for (const [kebab, usages] of [...iconRefs.entries()].sort()) {
  const nodes = lucideRaw[kebab];
  if (!nodes) {
    nonLucideNames.push(`  ${kebab}  <- used in ${[...usages].join(", ")}`);
    continue;
  }
  iconTableEntries.push(`${JSON.stringify(kebab)}: ${JSON.stringify(nodes)}`);
}
if (nonLucideNames.length) {
  console.log("WARN  Icon names not found in Lucide:");
  console.log(nonLucideNames.join("\n"));
  console.log("Keep them only if the user explicitly requested these names; otherwise pick valid names from https://lucide.dev/icons");
}
const lucidePrelude = iconTableEntries.length
  ? `  const LUCIDE = {\n    ${iconTableEntries.join(",\n    ")},\n  };`
  : "  const LUCIDE = {};";
const iconsMod = modules.find((m) => m.label === ICONS_MODULE);
if (iconsMod) iconsMod.prelude = lucidePrelude;

// --- CSS collection: token vars (base/light/dark) + component css ---
function rewriteCssUrls(css) {
  // 样式文件位于 assets/style/,字体位于 assets/font/ — 内联后 url 相对于
  // 脚手架根部的 HTML 解析。剥掉 "../" 但保留引号。
  return css.replace(/url\((\s*)(["']?)\.\.\/(font|library|icons)\//g, "url($1$2assets/$3/");
}

const cssParts = [];
for (const f of STYLE_FILES) cssParts.push(rewriteCssUrls((await readFile(f, "utf8")).replace(/^\uFEFF/, "")));
for (const css of cssFiles) cssParts.push((await readFile(css, "utf8")).replace(/^\uFEFF/, ""));

// --- CSS lint: validate component css against the defined token set ---
function extractDefinedVars(css) {
  const names = new Set();
  const re = /(--[a-zA-Z0-9-]+)\s*:/g;
  let m;
  while ((m = re.exec(css)) !== null) names.add(m[1]);
  return names;
}

const definedVars = new Set();
for (const f of STYLE_FILES) extractDefinedVars(await readFile(f, "utf8")).forEach((n) => definedVars.add(n));
for (const css of cssFiles) extractDefinedVars(await readFile(css, "utf8")).forEach((n) => definedVars.add(n));

const cssLintErrors = [];
const cssLintWarnings = [];
for (const css of cssFiles) {
  const label = css.slice(ROOT.length + 1).replace(/\\/g, "/");
  const content = await readFile(css, "utf8");
  content.split("\n").forEach((line, idx) => {
    const at = `${label}:${idx + 1}`;
    const bare = line.replace(/\/\*.*?\*\//g, "");
    if (/^\s*(:root|\.dark)\s*\{/.test(bare)) {
      cssLintErrors.push(`${at}: component CSS must NOT define :root or .dark blocks`);
    }
    let vm;
    const varRe = /var\((--[a-zA-Z0-9-]+)/g;
    while ((vm = varRe.exec(bare)) !== null) {
      if (!definedVars.has(vm[1])) cssLintErrors.push(`${at}: unknown token var(${vm[1]})`);
    }
    if (/#[0-9a-fA-F]{3,8}\b/.test(bare)) {
      cssLintWarnings.push(`${at}: hardcoded hex color — prefer theme-layer tokens (intentional values are fine)`);
    }
  });
}
if (cssLintErrors.length) {
  console.error("FAIL  CSS lint errors:");
  for (const e of cssLintErrors) console.error(`  ${e}`);
  console.error("Fix :root/.dark blocks or unknown tokens — see references/design_system.md.");
  process.exit(1);
}
if (cssLintWarnings.length) {
  console.log("WARN  hardcoded hex colors (fine if intentional, prefer tokens otherwise):");
  for (const w of cssLintWarnings) console.log(`  ${w}`);
}

const jsBody = modules.map(wrapModule).join("\n\n");
const script = [
  "var __export = {};",
  jsBody,
  "/* ===== render ===== */",
  'const root = ReactDOM.createRoot(document.getElementById("root"));',
  `root.render(React.createElement(__export.${entryDefault}));`,
].join("\n");

if (script.includes("</script>")) {
  throw new Error("Module code contains </script>, cannot inline into HTML");
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ICT页面</title>
<!-- 1. Core Libraries (local UMD) -->
<script src="./assets/library/react.production.min.js"></script>
<script src="./assets/library/react-dom.production.min.js"></script>
<script src="./assets/library/dayjs.min.js"></script>
<!-- 2. UI Components (local UMD, antd 内置图标随包携带) -->
<script src="./assets/library/antd.min.js"></script>
<!-- 3. Charts (local UMD, echarts → hui-charts 全局 HUICharts) -->
<script src="./assets/library/echarts.min.js"></script>
<script src="./assets/library/hui-charts.umd.js"></script>
<!-- 4. react-intl (offline, exposes ReactIntl) -->
<script src="./assets/library/react-intl.umd.js"></script>
<!-- 5. Babel Transpiler (local) -->
<script src="./assets/library/babel.min.js"></script>
<!-- 6. 五层 CSS(base → light → theme → dark → ant 组件换肤层)内联 -->
<style>
${cssParts.join("\n\n")}
</style>
<!-- 7. Base styles -->
<style>
body, html { margin: 0; padding: 0; height: 100%; font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif); }
#root { height: 100%; }
</style>
</head>
<body>
<div id="root">Loading...</div>
<script>
// 注册 classic JSX 运行时 preset(新版 babel-standalone 默认 automatic,
// 产出的 import "react/jsx-runtime" 无法在经典脚本中执行)
Babel.registerPreset("react-classic", {
  presets: [[Babel.availablePresets["react"], { runtime: "classic" }]],
});
</script>
<script type="text/babel" data-presets="react-classic">
${script}
</script>
</body>
</html>
`;

await writeFile(OUT, html, "utf8");
console.log(`OK  ${OUT}`);
console.log(`    modules (${modules.length}): ${modules.map((m) => m.label).join(", ")}`);
console.log(`    css     (${cssFiles.length + STYLE_FILES.length}): style/(base,light,theme,dark,ant) + ${cssFiles.map((c) => c.slice(ROOT.length + 1).replace(/\\/g, "/")).join(", ")}`);
console.log(`    icons   (${iconTableEntries.length}): ${[...iconRefs.keys()].sort().join(", ") || "none"}`);
console.log(`    entry   : __export.${entryDefault}`);
