import { readFileSync, writeFileSync } from "node:fs";
const lines = readFileSync("preview/src/views/home-screen/legacy.js", "utf8").split("\n");
console.log("total before:", lines.length);

// 移除行 17（workloadView 创建）到行 125（energyServiceCard 之前）的 workload 浏览器代码
// 保留：行 1-16（import + initHomeScreen 开头 + fit + composer + header/sidebar 挂载）
// 保留：行 126+（energyServiceCard + updateCompactStatusIcons + energyGradeTag）

let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith("const workloadView=document.createElement")) { start = i; break; }
}
for (let i = start; i < lines.length; i++) {
  if (lines[i].trim().startsWith("function energyServiceCard")) { end = i; break; }
}
console.log("workload section:", start + 1, "to", end);

const keep = [];
for (let i = 0; i < lines.length; i++) {
  if (i >= start && i < end) continue;
  keep.push(lines[i]);
}
keep.splice(start, 0, " // workload browser now managed by workload-browser.js (initWorkloadBrowser in React HomeScreen)");

writeFileSync("preview/src/views/home-screen/legacy.js", keep.join("\n"), "utf8");
console.log("total after:", keep.length);
