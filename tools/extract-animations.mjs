import { readFileSync, writeFileSync } from "node:fs";
const j = readFileSync("preview/src/views/home-screen/enhancements.js", "utf8");

// 提取 HCOpticalFlow (行5-10) 和 HCFadeTip (行11-17)
const flowStart = j.indexOf("window.HCOpticalFlow");
const fadeTipEnd = j.indexOf("window.addEventListener('load'");

const animationCode = j.substring(flowStart, fadeTipEnd).trim();

const output = `// 动画引擎（命令式，不适合 React）—— HCOpticalFlow + HCFadeTip
// 被 optical-event / nic-event / story-renderer FaultTips 调用
import { HOME_LINKS_SVG } from "../mock/hc-assets.js";

${animationCode}
`;

writeFileSync("preview/src/shared/enhancement-animations.js", output, "utf8");
console.log("animation code:", animationCode.length, "chars");
