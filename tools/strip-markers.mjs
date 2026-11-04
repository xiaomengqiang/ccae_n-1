import { readFileSync, writeFileSync } from "node:fs";

const j = readFileSync("preview/src/views/story/render.js", "utf8");
const lines = j.split("\n");
console.log("total lines before:", lines.length);

// 精确边界：
// 1. 标记渲染: 从 "['optical','qwen'].forEach" 到 "});" (第77行闭合)
// 2. SuperpodD: 从 "[-300,-180].forEach" 到 "});"

let start = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith("['optical','qwen'].forEach")) { start = i; break; }
}

// 找到闭合的 "});" —— 标记渲染的最后
// 标记渲染包含嵌套 forEach，所以要找到外层的 "});"
let end = -1;
let depth = 0;
for (let i = start; i < lines.length; i++) {
  const line = lines[i];
  for (const ch of line) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
  }
  if (depth === 0 && i > start && line.trim().startsWith("});")) {
    end = i;
    break;
  }
}
console.log("markers: line", start + 1, "to", end + 1);

// SuperpodD 部分
let d08Start = -1, d08End = -1;
for (let i = end + 1; i < lines.length; i++) {
  if (lines[i].trim().startsWith("[-300,-180].forEach")) { d08Start = i; break; }
}
depth = 0;
for (let i = d08Start; i < lines.length; i++) {
  const line = lines[i];
  for (const ch of line) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
  }
  if (depth === 0 && i > d08Start && line.trim().startsWith("});")) {
    d08End = i;
    break;
  }
}
console.log("d08: line", d08Start + 1, "to", d08End + 1);

// 构建新内容
const keep = [];
for (let i = 0; i < lines.length; i++) {
  if (i >= start && i <= end) continue;
  if (i >= d08Start && i <= d08End) continue;
  keep.push(lines[i]);
}
// 在移除位置插入注释
keep.splice(start, 0, " // Timeline markers + d08 markers now handled by React TimelineMarkers component");

writeFileSync("preview/src/views/story/render.js", keep.join("\n"), "utf8");
console.log("total lines after:", keep.length);
