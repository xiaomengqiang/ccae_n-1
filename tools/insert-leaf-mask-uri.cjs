// 在 charts.jsx 的 REPORT_ICONS 之后插入 LEAF_MASK_URI（仅叶子 mask 用的 data URI，从既有 PNG 生成）
const fs = require("fs");
const png = fs.readFileSync("F:\\ccae_n-1\\preview\\assets\\uploads\\149-129790.png");
const uri = "url(data:image/png;base64," + png.toString("base64") + ")";
const p = "F:\\ccae_n-1\\preview\\src\\views\\energy-detail\\charts.jsx";
let src = fs.readFileSync(p, "utf8");
const anchor = '  "strategy-3": "./assets/uploads/149-129562.png",\n};';
if (!src.includes(anchor)) { console.error("anchor not found"); process.exit(1); }
if (src.includes("LEAF_MASK_URI")) { console.log("already inserted"); process.exit(0); }
const addition = anchor + `

// 叶子图标经 CSS mask 按状态染色（灰/绿/紫），本环境下 mask 加载外部文件不生效
// （原版源码的 reportIcons 也因此对 mask 图标内联 base64）。仅这一个 mask 图标
// 保留 data URI（由 assets/uploads/149-129790.png 生成）；其余图标均走文件引用。
export const LEAF_MASK_URI = "${uri}";`;
src = src.replace(anchor, addition);
fs.writeFileSync(p, src, "utf8");
console.log("inserted LEAF_MASK_URI (" + uri.length + " chars) into charts.jsx");
