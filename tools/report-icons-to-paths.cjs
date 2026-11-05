// 将 charts.jsx 的 REPORT_ICONS base64 大块替换为相对路径表（8 个文件均已在 assets/uploads，MD5 已核对）
const fs = require("fs");
const p = "F:\\ccae_n-1\\preview\\src\\views\\energy-detail\\charts.jsx";
let src = fs.readFileSync(p, "utf8");
const block = `// 月报/策略卡片用到的图标（与源码 energy.js reportIcons 同源；全部为 assets/uploads 下既有文件，
// 与源码 base64 逐字节一致（MD5 已核对），按相对路径引用，避免 base64 撑大源码；
// “下载月报”导出的 HTML 会注入 <base> 指向本页目录，保证导出文件内图标可解析）
export const REPORT_ICONS = {
  "energy-total": "./assets/uploads/149-129774.png",
  "energy-gain": "./assets/uploads/149-129806.png",
  "energy-leaf": "./assets/uploads/149-129790.png",
  "energy-report": "./assets/uploads/149-129722.png",
  "good-arrow": "./assets/uploads/149-129458.png",
  "strategy-1": "./assets/uploads/149-129557.png",
  "strategy-2": "./assets/uploads/149-129560.png",
  "strategy-3": "./assets/uploads/149-129562.png",
};`;
const re = /\/\/ 月报\/策略卡片用到的图标[\s\S]*?\n\};/;
if (!re.test(src)) { console.error("REPORT_ICONS block not found"); process.exit(1); }
src = src.replace(re, block);
fs.writeFileSync(p, src, "utf8");
console.log("charts.jsx REPORT_ICONS replaced with path map, new size:", src.length);
