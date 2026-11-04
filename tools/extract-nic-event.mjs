import { readFileSync, writeFileSync } from "node:fs";

const legacy = readFileSync("preview/src/views/nic-event/legacy.js", "utf8");

// Extract the complete IIFE: (()=>{ ... })();
const iifeStart = legacy.indexOf("(()=>{");
const iifeClose = legacy.lastIndexOf("})();") + 4; // include "})();"
if (iifeStart === -1 || iifeClose === -1) throw new Error("IIFE not found");

// Get the full IIFE including the wrapper
const iife = legacy.slice(iifeStart, iifeClose);
// Remove the "(()=>" prefix and ")" suffix, keep the "{...}" body
// The IIFE is: ( () => { BODY } ) ()
// We want just: BODY (without the function wrapper)
let body = legacy.slice(iifeStart + 5, iifeClose - 4);
// Remove leading "{" and trailing "}"
body = body.replace(/^\{/, "").replace(/\}$/, "");

const output = `// nic-event 命令式事件逻辑（从 legacy.js 提取，绘制/拓扑/连线保持原样）
// 硬编码坐标和连线数据后续讨论是否抽公共拓扑框架

let cleanup = null;

export function mountNicEvent() {
${body}
  cleanup = () => {
    window.closeNicEvent?.();
  };
}

export function unmountNicEvent() {
  if (cleanup) { cleanup(); cleanup = null; }
}
`;

writeFileSync("preview/src/views/nic-event/event.js", output, "utf8");
console.log("event.js written:", output.length, "chars");
console.log("body starts with:", JSON.stringify(body.slice(0, 40)));
console.log("body ends with:", JSON.stringify(body.slice(-60)));
