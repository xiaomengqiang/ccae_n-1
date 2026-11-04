import { readFileSync, writeFileSync } from "node:fs";

const legacy = readFileSync("preview/src/views/optical-event/legacy.js", "utf8");

// The file structure is:
//   import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
//   \n
//   export function initOpticalEvent() {
//     ...entire body (multiple IIFEs, window assignments)...
//   }

// Find the function body: from after "export function initOpticalEvent() {" to the last "}"
const fnStart = legacy.indexOf("export function initOpticalEvent() {");
if (fnStart === -1) throw new Error("initOpticalEvent not found");
const bodyStart = fnStart + "export function initOpticalEvent() {".length;

// The last "}" of the file closes initOpticalEvent
// Remove trailing whitespace and find the last "}"
let body = legacy.slice(bodyStart);
body = body.replace(/\s*$/, "");
if (body.endsWith("}")) body = body.slice(0, -1);
body = body.replace(/^\s*\n/, "");

const output = `// optical-event 命令式事件逻辑（从 legacy.js 提取，绘制/拓扑/连线保持原样）
// 包含 6 个顶级模块：HCEventUI / HCEntrance / quickQuery / HCOpticalEventUI / HCEventModule / optical host
// 硬编码坐标和连线数据后续讨论是否抽公共拓扑框架

let cleanup = null;

export function mountOpticalEvent() {
${body}
  cleanup = () => {
    window.closeOpticalEvent?.();
    window.resetOpticalEvent?.();
  };
}

export function unmountOpticalEvent() {
  if (cleanup) { cleanup(); cleanup = null; }
}
`;

writeFileSync("preview/src/views/optical-event/event.js", output, "utf8");
console.log("event.js written:", output.length, "chars");
console.log("body starts:", JSON.stringify(body.slice(0, 60)));
console.log("body ends:", JSON.stringify(body.slice(-60)));
