import { readFileSync, writeFileSync } from "node:fs";

const legacy = readFileSync("preview/src/views/story/legacy.js", "utf8");

// 主 IIFE 范围：
// 开始: "(()=>{" 之前有注释 "/* Shared homepage story state... */"
// 结束: 第一个 "})();" 出现在 render 函数的 dispatch 之后
const iifeOpen = legacy.indexOf("/* Shared homepage story state");
const renderDispatch = legacy.indexOf("window.dispatchEvent(new CustomEvent(", legacy.indexOf("function render("));
const iifeClose = legacy.indexOf("})();", renderDispatch) + 5; // include "})();"

if (iifeOpen === -1 || renderDispatch === -1 || iifeClose === -1) {
  throw new Error(`markers not found: open=${iifeOpen} dispatch=${renderDispatch} close=${iifeClose}`);
}

// 提取从 IIFE 开始到结束的完整文本（含注释和包装）
const fullBlock = legacy.slice(iifeOpen, iifeClose);

// 从中提取内部代码（去掉 IIFE 包装和注释）
// 结构: /* comment */ (()=>{ BODY })();
const iifeBodyStart = fullBlock.indexOf("(()=>{") + 6;
const iifeBodyEnd = fullBlock.lastIndexOf("})();");
let body = fullBlock.slice(iifeBodyStart, iifeBodyEnd);
body = body.replace(/\s*$/, "");

// 生成 render.js —— 不加额外的变量声明（body 已经包含了所有变量）
const output = `// story render 命令式渲染逻辑（从 legacy.js 提取）
// 包含：renderStoryGuard / render / bindPopover / 指标更新 / 时间轴标记 / 故障提示
// 保留原版命令式 DOM 操作（声明式重写后续讨论）
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { HOME_WORKLOADS } from "../../mock/workloads.js";

export function mountStoryRender() {
${body}
}

export function unmountStoryRender() {
}
`;

writeFileSync("preview/src/views/story/render.js", output, "utf8");
console.log("render.js written:", output.length, "chars");
console.log("body starts:", JSON.stringify(body.slice(0, 60)));
console.log("body ends:", JSON.stringify(body.slice(-60)));
