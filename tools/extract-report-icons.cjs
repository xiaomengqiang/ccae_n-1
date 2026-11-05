// extract-report-icons.cjs —— 从源码 energy.js 提取 8 个内联 base64 图标,重写 charts.jsx 的 REPORT_ICONS
const fs = require("fs");
const src = fs.readFileSync("F:/ccae_n-1/源码/home/energy/energy.js", "utf8");
const icons = {};
const obj = src.match(/const reportIcons = \{([^}]*)\};/)[1];
for (const m of obj.matchAll(/"(energy-[a-z-]+)":\s*"(data:image\/png;base64,[A-Za-z0-9+/=]+)"/g)) icons[m[1]] = m[2];
for (const m of src.matchAll(/reportIcons\['(good-arrow|strategy-[123])'\]='(data:image\/png;base64,[A-Za-z0-9+/=]+)';/g)) icons[m[1]] = m[2];
const keys = ["energy-total", "energy-gain", "energy-leaf", "energy-report", "good-arrow", "strategy-1", "strategy-2", "strategy-3"];
const missing = keys.filter(k => !icons[k]);
if (missing.length) { console.error("missing keys: " + missing.join(",")); process.exit(1); }
let jsx = fs.readFileSync("F:/ccae_n-1/preview/src/views/energy-detail/charts.jsx", "utf8");
const block = /export const REPORT_ICONS = \{[\s\S]*?\n\};/;
if (!block.test(jsx)) { console.error("REPORT_ICONS block not found"); process.exit(1); }
const entries = keys.map(k => "  " + JSON.stringify(k) + ": " + JSON.stringify(icons[k]) + ",").join("\n");
jsx = jsx.replace(block, "export const REPORT_ICONS = {\n" + entries + "\n};");
jsx = jsx.replace(
  "// 月报/策略卡片用到的上传图标（legacy.js reportIcons 同源）",
  "// 月报/策略卡片用到的图标（与源码 energy.js reportIcons 同源,内联 base64,避免 mask 引用相对路径图片在部分环境下不加载）"
);
fs.writeFileSync("F:/ccae_n-1/preview/src/views/energy-detail/charts.jsx", jsx, "utf8");
console.log("OK, total base64 chars: " + keys.reduce((a, k) => a + icons[k].length, 0));
